import NextAuth, { type NextAuthOptions, type Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { cookies } from "next/headers";
import { decodeJwt } from "jose";

const TOKEN_REFRESH_BUFFER_SECONDS = 60 * 5; // 5 minutes

const DAY_IN_SECONDS = 24 * 60 * 60;
const EXTENDED_LIFETIME_SECONDS = 7 * DAY_IN_SECONDS;
const PAYLOAD_TOKEN_COOKIE = "payload-token";
const isProduction =
  process.env.NODE_ENV === "production" || process.env.VERCEL === "1";

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
  const cookieStore = await cookies();
  cookieStore.set(PAYLOAD_TOKEN_COOKIE, tokenValue, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: getCookieMaxAge(rememberMe),
  });
}

async function deletePayloadCookie() {
  try {
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
    });
  } catch (error) {
    console.error("Failed to notify Payload logout:", error);
  }
}

async function refreshPayloadToken(
  token: JWT & { accessToken?: string; rememberMe?: boolean },
): Promise<JWT> {
  const currentToken = token.accessToken;
  if (!currentToken) {
    throw new Error("No access token available to refresh");
  }
  const apiBase = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!apiBase) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  const response = await fetch(`${apiBase}/api/users/refresh-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${currentToken}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(
      errorBody || `Failed to refresh Payload token (${response.status})`,
    );
  }

  const data = await response.json();
  const nextAccessToken = data.token ?? data?.doc?.token;
  if (!nextAccessToken) {
    throw new Error("Refresh response did not include a token");
  }

  try {
    await setPayloadCookie(nextAccessToken, token.rememberMe);
  } catch (error) {
    console.error(
      "Failed to update payload-token cookie during refresh:",
      error,
    );
  }

  const newExp = computeEffectiveExpiration(nextAccessToken, token.rememberMe);

  return {
    ...token,
    accessToken: nextAccessToken,
    iat: Math.floor(Date.now() / 1000),
    exp: newExp,
    error: undefined,
  };
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
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
    maxAge: 24 * 60 * 60, // 1 day
  },

  callbacks: {
    async signIn({ user }: { user?: any }) {
      if (user.error) {
        throw new Error(user.error);
        // return user.error;
      }
      return true;
    },
    async jwt({ token, user }: { token: JWT; user?: any }) {
      const TOKEN_LIFETIME_DAYS = 7;
      if (user) {
        token.accessToken = user.token;
        token.email = user.email;
        token.id = user.id;
        token.roles = user.roles;
        token.name = user.displayName;
        token.avatar = user.avatarURL;
        token.rememberMe = user.rememberMe; // 👈 save flag
        // set expiry based on rememberMe
        token.maxAge = user.rememberMe
          ? TOKEN_LIFETIME_DAYS * 24 * 60 * 60
          : 24 * 60 * 60;
        token.iat = Math.floor(Date.now() / 1000);
        token.exp = token.iat + token.maxAge;
        token.profileId =
          typeof user.profile === "number" ? user.profile : user.profile?.id;

        // Set Payload token cookie when user signs in
        // This is safer than using events in serverless environments
        if (user.token) {
          try {
            await setPayloadCookie(user.token, user.rememberMe);
          } catch (error) {
            console.error("Failed to set payload-token cookie:", error);
          }
          token.exp = computeEffectiveExpiration(user.token, user.rememberMe);
        }
      }

      const now = Math.floor(Date.now() / 1000);
      const currentExp =
        token.exp ||
        (token.accessToken
          ? computeEffectiveExpiration(token.accessToken, token.rememberMe)
          : undefined);
      if (currentExp) {
        token.exp = currentExp;
      }

      if (!token.accessToken) {
        await deletePayloadCookie();
        return {
          ...token,
          error: "RefreshAccessTokenError",
          exp: 0,
        };
      }

      const needsRefresh =
        !token.exp || token.exp - TOKEN_REFRESH_BUFFER_SECONDS <= now;

      if (!needsRefresh) {
        return token;
      }

      try {
        return await refreshPayloadToken(token);
      } catch (error) {
        console.error("Error refreshing Payload token:", error);
        await deletePayloadCookie();
        return {
          ...token,
          accessToken: undefined,
          error: "RefreshAccessTokenError",
          exp: 0,
        };
      }
    },

    async session({ session, token }: { session: Session; token: JWT }) {
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

      if (token.error) {
        (session as Session & { error?: string }).error = token.error as string;
        session.accessToken = undefined;
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
        sameSite: "lax",
        path: "/",
        secure:
          process.env.NODE_ENV === "production" || process.env.VERCEL === "1",
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
