import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      name?: string;
      email?: string;
      roles?: string[];
      avatar?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    displayName?: string;
    avatarURL?: string;
    roles?: string[];
    token?: string;
    rememberMe?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    id?: string;
    roles?: string[];
    avatar?: string;
    rememberMe?: boolean;
    maxAge?: number;
    iat?: number;
    exp?: number;
    expires?: string;
  }
}
