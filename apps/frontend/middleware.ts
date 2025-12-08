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
       *
       * Note: We're lenient here to avoid race conditions during token refresh.
       * The JWT callback runs before this, but if refresh fails temporarily
       * (network issues), we don't want to redirect. We only block if the token
       * is definitively expired with no accessToken. Otherwise, we allow through
       * and let page components handle validation.
       */
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        const isProtected = pathname.startsWith("/cont");

        if (!isProtected) {
          return true; // Public routes are always allowed
        }

        // No token = not authorized
        if (!token) {
          return false;
        }

        // Check for definitive errors
        if (
          token.error === "SessionMaxAgeExceeded" ||
          token.error === "TokenExpired" ||
          token.error === "RefreshAccessTokenError"
        ) {
          return false;
        }

        // Check if token is expired
        const now = Math.floor(Date.now() / 1000);
        if (
          token.accessTokenExpires &&
          (token.accessTokenExpires as number) <= now
        ) {
          return false;
        }

        // Check absolute expiration
        if (token.absExp && now >= (token.absExp as number)) {
          return false;
        }

        // Must have valid accessToken
        if (!token.accessToken) {
          return false;
        }

        // All checks passed
        return true;
      },
    },
  },
);

// Run middleware only on the routes we care about
export const config = {
  matcher: ["/cont/:path*", "/auth/:path*"],
};
