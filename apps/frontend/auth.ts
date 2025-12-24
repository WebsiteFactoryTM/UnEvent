import NextAuth, { type NextAuthOptions, type Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { cookies } from "next/headers";
import { decodeJwt } from "jose";
import { withRefreshLock } from "./lib/auth/refresh-lock";
import * as Sentry from "@sentry/nextjs";

// This user is locked due to having too many failed login attempts.
//The email or password provided is incorrect.

const TOKEN_REFRESH_BUFFER_SECONDS = 60 * 5; // 5 minutes
const REFRESH_COOLDOWN = 60; // seconds

const ERROR_MESSAGES: Record<string, string> = {
  SessionMaxAgeExceeded:
    "Sesiunea a expirat. Te rugăm să te autentifici din nou.",
  TokenExpired: "Tokenul a expirat. Te rugăm să te autentifici din nou.",
  RefreshAccessTokenError:
    "Nu s-a putut reîmprospăta sesiunea. Te rugăm să te autentifici din nou.",
  SessionExpired: "Sesiunea a expirat.",
  "This user is locked due to having too many failed login attempts.":
    "Acest cont este blocat temporar din cauza prea multor încercări eșuate. Te rugăm să încerci mai târziu.",
  "The email or password provided is incorrect.":
    "Email-ul sau parola sunt incorecte.",
};

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
      Sentry.captureException(err, {
        tags: { type: "payload_cookie_update_failure" },
        extra: {
          rememberMe: token.rememberMe,
          canShareCookie: CAN_SHARE_COOKIE,
        },
      });
    }
  }

  return {
    ...token,
    accessToken: nextAccessToken,
    iat: Math.floor(Date.now() / 1000),
    // 👈 align internal expiry with server exp
    accessTokenExpires: nextExp,
    // 👈 also sync standard exp
    exp: nextExp,
    error: undefined,
  };
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  debug: false, // Enable debug logging in production temporarily
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

            const translatedError =
              ERROR_MESSAGES[errMsgs] ||
              errMsgs ||
              "A apărut o eroare necunoscută.";
            throw new Error(translatedError);
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
        // Calculate max session duration based on remember me
        const tokenLifetime = user.rememberMe
          ? TOKEN_LIFETIME_DAYS * DAY
          : 1 * DAY;
        const now = Math.floor(Date.now() / 1000);

        token.accessToken = user.token;
        token.email = user.email;
        token.id = user.id;
        token.roles = user.roles;
        token.name = user.displayName;
        token.avatar = user.avatarURL;
        token.rememberMe = user.rememberMe;
        token.profileId =
          typeof user.profile === "number" ? user.profile : user.profile?.id;

        // Decode token to get actual expiration from Payload
        // We use the earlier of: Payload token exp OR our max session time
        const payloadExp =
          typeof user.exp === "number"
            ? user.exp
            : decodeTokenExpiration(user.token);

        token.iat = Math.floor(Date.now() / 1000);
        // Consolidate expiration: min(payload_exp, max_session_lifetime)
        token.accessTokenExpires = payloadExp
          ? Math.min(payloadExp, now + tokenLifetime)
          : now + tokenLifetime;

        // Sync standard exp claim for good measure, but rely on accessTokenExpires
        token.exp = token.accessTokenExpires as number;

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

      // Handle definitive logout (no accessToken)
      if (!token.accessToken) {
        // If the user was never logged in, don't emit an error.
        if (!token.iat && !token.email) {
          return token;
        }
        // User was logged in but lost accessToken - logout from Payload if we had one
        await deletePayloadCookie();
        return { ...token, error: "RefreshAccessTokenError", exp: 0 };
      }

      // Check for expiration
      if (
        token.accessTokenExpires &&
        (token.accessTokenExpires as number) <= now
      ) {
        // Token expired - notify Payload to logout before clearing session
        await notifyPayloadLogout(token.accessToken);
        await deletePayloadCookie();
        return {
          ...token,
          accessToken: undefined,
          error: "TokenExpired",
          exp: 0,
        };
      }

      // Check if token needs refresh
      const needsRefresh =
        !token.accessTokenExpires ||
        (token.accessTokenExpires as number) - TOKEN_REFRESH_BUFFER_SECONDS <=
          now;

      // Check refresh cooldown
      const lastRefresh = (token.lastRefresh as number) || 0;
      const canRefresh = now - lastRefresh >= REFRESH_COOLDOWN;

      if (needsRefresh && token.accessToken && canRefresh) {
        const lockKey = String(token.id ?? token.email ?? "anon");
        try {
          const refreshed = await withRefreshLock(lockKey, () =>
            refreshPayloadToken(token),
          );
          return { ...refreshed, lastRefresh: now };
        } catch (e) {
          console.error("Token refresh failed:", e);

          Sentry.captureException(e, {
            tags: { type: "token_refresh_failure" },
            user: { id: token.id, email: token.email || undefined },
          });

          // If token IS expired and refresh failed, we must return error
          if (
            token.accessTokenExpires &&
            (token.accessTokenExpires as number) <= now
          ) {
            await notifyPayloadLogout(token.accessToken);
            await deletePayloadCookie();
            return {
              ...token,
              accessToken: undefined,
              error: "TokenExpired",
              exp: 0,
            };
          }
          // Return token with error flag but keep accessToken if valid
          // This allows transient errors to be retried
          return {
            ...token,
            error: "RefreshAccessTokenError",
          };
        }
      }
      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      const now = Math.floor(Date.now() / 1000);
      const isExpired =
        token.accessTokenExpires && (token.accessTokenExpires as number) <= now;

      // If there's an error, no accessToken, or token is expired, throw error
      // This forces NextAuth to invalidate the session
      if (token.error || !token.accessToken || isExpired) {
        const errorCode = (token.error as string) || "SessionExpired";
        const errorMessage = ERROR_MESSAGES[errorCode] || errorCode;
        throw new Error(errorMessage);
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

      if (token.accessTokenExpires) {
        // optional: expose remaining lifetime (for debugging / renewal)
        session.expires = new Date(
          (token.accessTokenExpires as number) * 1000,
        ).toISOString();
      }

      return session;
    },
  },

  // Only override cookies if we need cross-domain sharing
  // Otherwise, let NextAuth use its defaults which handle __Secure- prefix automatically
  ...(CAN_SHARE_COOKIE && SHARED_PARENT_COOKIE_DOMAIN
    ? {
        cookies: {
          sessionToken: {
            name: `${isProduction ? "__Secure-" : ""}next-auth.session-token`,
            options: {
              httpOnly: true,
              sameSite: "none" as const,
              path: "/",
              secure: true,
              domain: SHARED_PARENT_COOKIE_DOMAIN,
            },
          },
        },
      }
    : {}), // Let NextAuth use defaults - it will automatically use __Secure- prefix in production

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
