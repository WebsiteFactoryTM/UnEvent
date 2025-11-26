// apps/frontend/middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  // This runs only if `callbacks.authorized` returned true
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // If already authenticated, prevent visiting auth pages
    if (pathname.startsWith("/auth") && token && !token.error) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    // fall through
  },
  {
    pages: {
      // Where to send unauthenticated users
      signIn: "/auth/autentificare",
    },
    callbacks: {
      /**
       * Decide if the current request is allowed.
       * We only protect `/cont/*` — everything else is public.
       * We also require our API access token (not just any NextAuth session).
       */
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        const isProtected = pathname.startsWith("/cont");
        const isAuthed = Boolean(token?.accessToken) && !token?.error;
        return isProtected ? isAuthed : true;
      },
    },
  },
);

// Run middleware only on the routes we care about
export const config = {
  matcher: ["/cont/:path*", "/auth/:path*"],
};
