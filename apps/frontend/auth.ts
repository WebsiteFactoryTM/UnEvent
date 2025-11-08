import NextAuth, { type NextAuthOptions, type Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
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

          if (!res.ok) throw new Error("Invalid credentials");

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
          return null;
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

  pages: {
    signIn: "/auth/autentificare",
  },

  jwt: {
    // next-auth will refresh automatically when expired if you add refresh logic later
  },
};

export default NextAuth(authOptions);
