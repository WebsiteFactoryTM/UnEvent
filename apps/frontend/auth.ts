import NextAuth, { type NextAuthOptions, type Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { cookies } from "next/headers";

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
            const cookieStore = await cookies();
            const isProduction =
              process.env.NODE_ENV === "production" ||
              process.env.VERCEL === "1";
            cookieStore.set("payload-token", user.token, {
              httpOnly: true,
              secure: isProduction,
              sameSite: "lax",
              path: "/",
              maxAge: user.rememberMe
                ? TOKEN_LIFETIME_DAYS * 24 * 60 * 60
                : 24 * 60 * 60,
            });
          } catch (err) {
            // Cookie setting might fail in some edge cases, log but don't fail auth
            console.error("Failed to set payload-token cookie:", err);
          }
        }
      }

      // Refresh if token about to expire (< 2 min left)
      const now = Math.floor(Date.now() / 1000);
      const isNearExpiry = token.exp && now > token.exp - 120; // 2-minute buffer

      if (isNearExpiry && token.accessToken) {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/users/refresh-token`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `JWT ${token.accessToken}`,
              },
            },
          );

          if (res.ok) {
            const data = await res.json();
            token.accessToken = data.token;
            // refresh exp estimate (Payload sets same maxAge as before)
            token.iat = Math.floor(Date.now() / 1000);
            token.exp =
              token.iat +
              (token.rememberMe
                ? TOKEN_LIFETIME_DAYS * 24 * 60 * 60
                : 24 * 60 * 60);
          } else {
            console.warn("Failed to refresh Payload token:", res.status);
          }
        } catch (err) {
          console.error("Error refreshing Payload token:", err);
        }
      }
      return token;
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

      // optional: expose remaining lifetime (for debugging / renewal)
      session.expires = new Date(token.exp! * 1000).toISOString();

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
    async signOut() {
      // Delete Payload token cookie on sign out
      try {
        const cookieStore = await cookies();
        cookieStore.delete("payload-token");
      } catch (err) {
        // Cookie deletion might fail in some edge cases, log but don't fail
        console.error("Failed to delete payload-token cookie:", err);
      }
    },
  },
};

export default NextAuth(authOptions);
