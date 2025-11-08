import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      profile?: number | string;
      name?: string;
      email?: string;
      roles?: string[];
      avatar?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    profile?: number | string;
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
    profile?: number | string;
    avatar?: string;
    rememberMe?: boolean;
    maxAge?: number;
    iat?: number;
    exp?: number;
    expires?: string;
  }
}
