import NextAuth, { type NextAuthOptions, type Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { cookies } from "next/headers";
import { decodeJwt } from "jose";
import { withRefreshLock } from "./lib/auth/refresh-lock";

const TOKEN_REFRESH_BUFFER_SECONDS = 60 * 5; // 5 minutes

const DAY_IN_SECONDS = 24 * 60 * 60;
const EXTENDED_LIFETIME_SECONDS = 7 * DAY_IN_SECONDS;
const PAYLOAD_TOKEN_COOKIE = "payload-token";
const isProduction =
  process.env.NODE_ENV === "production" || process.env.VERCEL === "1";

// Validate critical environment variables
if (!process.env.NEXTAUTH_SECRET) {
  console.error("❌ NEXTAUTH_SECRET is not set!");
}
if (!process.env.NEXTAUTH_URL) {
  console.warn("⚠️  NEXTAUTH_URL is not set - may cause issues in production");
}
console.log("[Auth Config] Environment check:", {
  isProduction,
  hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
  hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
  nextAuthUrl: process.env.NEXTAUTH_URL,
  hasApiUrl: !!(process.env.API_URL || process.env.NEXT_PUBLIC_API_URL),
  apiUrl: process.env.API_URL || process.env.NEXT_PUBLIC_API_URL,
  hasCookieDomain: !!process.env.COOKIE_DOMAIN,
  cookieDomain: process.env.COOKIE_DOMAIN,
});

// --- add near other consts ---
const SHARED_PARENT_COOKIE_DOMAIN = process.env.COOKIE_DOMAIN?.trim(); // e.g. ".unevent.app" in prod only
const CAN_SHARE_COOKIE = Boolean(
  SHARED_PARENT_COOKIE_DOMAIN && SHARED_PARENT_COOKIE_DOMAIN.length > 0,
);

// tighten cookie attrs for when you actually use them in prod
function cookieAttrs(rememberMe?: boolean) {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: CAN_SHARE_COOKIE ? ("none" as const) : ("lax" as const),
    path: "/",
    maxAge: getCookieMaxAge(rememberMe),
    ...(CAN_SHARE_COOKIE && SHARED_PARENT_COOKIE_DOMAIN
      ? { domain: SHARED_PARENT_COOKIE_DOMAIN }
      : {}),
  };
}

const getCookieMaxAge = (rememberMe?: boolean) =>
  rememberMe ? EXTENDED_LIFETIME_SECONDS : DAY_IN_SECONDS;

const decodeTokenExpiration = (tokenValue?: string) => {
  if (!tokenValue) return undefined;
  try {
    const decoded = decodeJwt(tokenValue);
    return typeof decoded.exp === "number" ? decoded.exp : undefined;
  } catch (error) {
    console.error("Failed to decode Payload token:", error);
    return undefined;
  }
};

const computeEffectiveExpiration = (
  tokenValue?: string,
  rememberMe?: boolean,
) => {
  const fallback = Math.floor(Date.now() / 1000) + getCookieMaxAge(rememberMe);
  return decodeTokenExpiration(tokenValue) ?? fallback;
};

async function setPayloadCookie(tokenValue: string, rememberMe?: boolean) {
  if (!CAN_SHARE_COOKIE) return; // testing: skip cross-site cookie
  const cookieStore = await cookies();
  cookieStore.set(PAYLOAD_TOKEN_COOKIE, tokenValue, cookieAttrs(rememberMe));
}

async function deletePayloadCookie() {
  try {
    if (!CAN_SHARE_COOKIE) return;
    const cookieStore = await cookies();
    cookieStore.delete(PAYLOAD_TOKEN_COOKIE);
  } catch (error) {
    console.error("Failed to delete payload-token cookie:", error);
  }
}

async function notifyPayloadLogout(accessToken?: string) {
  console.log("logging out");

  const apiBase = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!apiBase || !accessToken) return;
  try {
    await fetch(`${apiBase}/api/users/logout?allSessions=false`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });
  } catch (error) {
    console.error("Failed to notify Payload logout:", error);
  }
}
async function refreshPayloadToken(
  token: JWT & { accessToken?: string; rememberMe?: boolean },
): Promise<JWT> {
  const currentToken = token.accessToken;
  if (!currentToken) throw new Error("No access token available to refresh");

  const apiBase = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!apiBase) throw new Error("NEXT_PUBLIC_API_URL is not configured");

  const res = await fetch(`${apiBase}/api/users/refresh-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // per your contract: requires *non-expired* bearer to return a new one
      Authorization: `Bearer ${currentToken}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || `Failed to refresh Payload token (${res.status})`);
  }

  const data: { refreshedToken?: string; exp?: number } = await res.json();

  const nextAccessToken = data.refreshedToken; // 👈 correct field
  if (!nextAccessToken)
    throw new Error("Refresh response missing refreshedToken");

  // Prefer server exp; fall back to decoding if missing
  const nextExp =
    typeof data.exp === "number"
      ? data.exp
      : computeEffectiveExpiration(nextAccessToken, token.rememberMe);

  // Only try to set the browser cookie if we can actually share it (live on one parent domain)
  if (CAN_SHARE_COOKIE) {
    try {
      const cookieStore = await cookies();
      cookieStore.set(
        PAYLOAD_TOKEN_COOKIE,
        nextAccessToken,
        cookieAttrs(token.rememberMe),
      );
    } catch (err) {
      console.error(
        "Failed to update payload-token cookie during refresh:",
        err,
      );
    }
  }

  return {
    ...token,
    accessToken: nextAccessToken,
    iat: Math.floor(Date.now() / 1000),
    exp: nextExp, // 👈 align NextAuth token expiry with server exp
    error: undefined,
  };
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Enable debug logging in production temporarily
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Ține-mă minte", type: "boolean" }, // 👈 add this
      },

      async authorize(credentials) {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/users/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: credentials?.email,
                password: credentials?.password,
              }),
              cache: "no-store",
            },
          );

          if (!res.ok) {
            const error = await res.json();
            const errMsgs = error.errors
              .map((err: any) => err.message)
              .join(", ");

            throw new Error(errMsgs);
          }

          const data = await res.json();

          return {
            ...data.user,
            token: data.token,
            rememberMe:
              credentials?.rememberMe === "on" ||
              credentials?.rememberMe === "true",
          };
        } catch (err) {
          console.error("Authorize error:", err);
          throw new Error(
            err instanceof Error ? err.message : "An unknown error occurred",
          );
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    // default maxAge, but will override dynamically
    maxAge: 30 * 24 * 60 * 60, // 30 days (global upper bound)
  },

  callbacks: {
    async signIn({ user }: { user?: any }) {
      if (user.error) {
        throw new Error(user.error);
        // return user.error;
      }
      return true;
    },
    async jwt({
      token,
      user,
      trigger,
    }: {
      token: JWT;
      user?: any;
      trigger?: string;
    }) {
      const TOKEN_LIFETIME_DAYS = 7;
      const DAY = 24 * 60 * 60;

      if (user) {
        console.log("[JWT Callback] New user login:", {
          userId: user.id,
          email: user.email,
          hasToken: !!user.token,
          rememberMe: user.rememberMe,
        });

        const absCap = user.rememberMe ? TOKEN_LIFETIME_DAYS * DAY : 1 * DAY;
        token.absExp = Math.floor(Date.now() / 1000) + absCap;
        token.accessToken = user.token;
        token.email = user.email;
        token.id = user.id;
        token.roles = user.roles;
        token.name = user.displayName;
        token.avatar = user.avatarURL;
        token.rememberMe = user.rememberMe;

        // If your login returns exp, use it; else decode
        const firstExp =
          typeof user.exp === "number"
            ? user.exp
            : computeEffectiveExpiration(user.token, user.rememberMe);

        token.iat = Math.floor(Date.now() / 1000);
        token.exp = firstExp;

        token.profileId =
          typeof user.profile === "number" ? user.profile : user.profile?.id;

        if (user.token) {
          // in prod this will set a real cookie; in testing it's a no-op
          try {
            await setPayloadCookie(user.token, user.rememberMe);
          } catch (e) {
            console.error("Failed to set payload-token cookie:", e);
          }
        }
      }

      // If session.update() was called (trigger === 'update'), fetch fresh user data
      if (trigger === "update" && token.accessToken && token.id) {
        try {
          const apiBase =
            process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
          if (apiBase) {
            const res = await fetch(`${apiBase}/api/users/${token.id}`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token.accessToken}`,
              },
              cache: "no-store",
            });

            if (res.ok) {
              const responseData = await res.json();
              // PayloadCMS might return user directly or wrapped in 'doc'
              const freshUser = responseData.doc || responseData;

              // Update token with fresh user data
              if (freshUser.roles) {
                token.roles = freshUser.roles;
              }
              if (freshUser.displayName) {
                token.name = freshUser.displayName;
              }
              if (freshUser.avatarURL) {
                token.avatar = freshUser.avatarURL;
              }
              if (freshUser.profile) {
                token.profileId =
                  typeof freshUser.profile === "number"
                    ? freshUser.profile
                    : freshUser.profile?.id;
              }
            }
          }
        } catch (error) {
          console.error(
            "Failed to fetch fresh user data on session update:",
            error,
          );
          // Don't fail the session update if fetch fails, just log error
        }
      }

      const now = Math.floor(Date.now() / 1000);
      if (token.absExp && now >= token.absExp) {
        console.log("[JWT Callback] Session max age exceeded");
        // Notify Payload to logout before clearing session
        if (token.accessToken) {
          await notifyPayloadLogout(token.accessToken);
        }
        await deletePayloadCookie();
        return {
          ...token,
          accessToken: undefined,
          error: "SessionMaxAgeExceeded",
          exp: 0,
        };
      }

      const currentExp =
        token.exp ||
        (token.accessToken
          ? computeEffectiveExpiration(token.accessToken, token.rememberMe)
          : undefined);
      if (currentExp) {
        token.exp = currentExp;
      }

      if (!token.accessToken) {
        // If the user was never logged in, don't emit an error.
        if (!token.iat && !token.email) {
          console.log(
            "[JWT Callback] No accessToken but user never logged in, allowing",
          );
          return token;
        }
        // User was logged in but lost accessToken - logout from Payload if we had one
        // Note: We don't have accessToken here, so we can't notify Payload
        // but we should still clear the session
        console.log("[JWT Callback] Lost accessToken, clearing session");
        await deletePayloadCookie();
        return { ...token, error: "RefreshAccessTokenError", exp: 0 };
      }

      const needsRefresh =
        !token.exp || token.exp - TOKEN_REFRESH_BUFFER_SECONDS <= now;

      if (needsRefresh && token.accessToken) {
        const lockKey = String(token.id ?? token.email ?? "anon");
        try {
          return await withRefreshLock(lockKey, () =>
            refreshPayloadToken(token),
          );
        } catch (e) {
          // after the inner catch where refresh failed:
          if (token.exp && token.exp <= now) {
            // Token expired - notify Payload to logout before clearing session
            if (token.accessToken) {
              await notifyPayloadLogout(token.accessToken);
            }
            await deletePayloadCookie();
            return {
              ...token,
              accessToken: undefined,
              error: "TokenExpired",
              exp: 0,
            };
          }
        }
      }
      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      const now = Math.floor(Date.now() / 1000);
      const isExpired = token.exp && token.exp <= now;

      // If there's an error, no accessToken, or token is expired, invalidate the session
      if (token.error || !token.accessToken || isExpired) {
        // Return an invalid session structure - NextAuth will treat this as unauthenticated
        // Setting expires to past date ensures NextAuth recognizes it as expired
        return {
          ...session,
          user: {
            id: "",
            email: null as any,
            name: null as any,
          },
          accessToken: undefined,
          expires: new Date(0).toISOString(), // Past date to force expiration
          error: token.error || "SessionExpired",
        };
      }

      session.user = {
        id: token.id!,
        name: token.name || undefined,
        email: token.email || undefined,
        roles: token.roles,
        avatar: token.avatar,
        profile: token.profileId as number | string | undefined,
      };
      session.accessToken = token.accessToken;

      if (token.exp) {
        // optional: expose remaining lifetime (for debugging / renewal)
        session.expires = new Date(token.exp * 1000).toISOString();
      }

      return session;
    },
  },

  // Use cookies configuration for better Vercel compatibility
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: CAN_SHARE_COOKIE ? ("none" as const) : ("lax" as const),
        path: "/",
        secure:
          process.env.NODE_ENV === "production" || process.env.VERCEL === "1",
        ...(CAN_SHARE_COOKIE && SHARED_PARENT_COOKIE_DOMAIN
          ? { domain: SHARED_PARENT_COOKIE_DOMAIN }
          : {}),
      },
    },
  },

  pages: {
    signIn: "/auth/autentificare",
  },

  jwt: {
    // next-auth will refresh automatically when expired if you add refresh logic later
  },
  events: {
    async signOut({ token }: { token?: JWT }) {
      // Delete Payload token cookie on sign out
      if (token?.accessToken) {
        await notifyPayloadLogout(token.accessToken);
      }
      await deletePayloadCookie();
    },
  },
};

export default NextAuth(authOptions);
