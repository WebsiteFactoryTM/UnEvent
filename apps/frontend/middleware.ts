// apps/frontend/middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  // This runs only if `callbacks.authorized` returned true
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Debug: Log all cookies
    const cookies = req.cookies.getAll();
    console.log("[Middleware] All cookies:", {
      pathname,
      cookieCount: cookies.length,
      cookieNames: cookies.map((c) => c.name),
      hasSessionToken: cookies.some(
        (c) =>
          c.name === "next-auth.session-token" ||
          c.name === "__Secure-next-auth.session-token",
      ),
    });

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

        // Debug logging in production
        console.log("[Middleware] Protected route access attempt:", {
          pathname,
          hasToken: !!token,
          hasAccessToken: !!token?.accessToken,
          tokenError: token?.error,
          tokenKeys: token ? Object.keys(token) : [],
        });

        // If no token at all, definitely not authorized
        if (!token) {
          console.log("[Middleware] BLOCKED: No token found");
          return false;
        }

        // If token has accessToken, allow through (even if there's an error)
        // The error might be from a failed refresh attempt, but we still have
        // a valid token to use
        if (token.accessToken) {
          console.log("[Middleware] ALLOWED: Has accessToken");
          return true;
        }

        // No accessToken - check if it's a definitive expiration
        // Only block if it's truly expired (SessionMaxAgeExceeded or TokenExpired)
        if (token.error) {
          const isDefinitiveError =
            token.error === "SessionMaxAgeExceeded" ||
            token.error === "TokenExpired";

          // Block only if definitively expired
          if (isDefinitiveError) {
            console.log(
              "[Middleware] BLOCKED: Definitive error -",
              token.error,
            );
            return false;
          }

          // Other errors (like RefreshAccessTokenError) might be temporary
          // Allow through and let page component handle it
          console.log(
            "[Middleware] ALLOWED: Temporary error, allowing through -",
            token.error,
          );
          return true;
        }

        // Token exists but no accessToken and no error
        // This shouldn't happen normally, but allow through to be safe
        // Page component will handle validation
        console.log(
          "[Middleware] ALLOWED: Token exists without accessToken, allowing through",
        );
        return true;
      },
    },
  },
);

// Run middleware only on the routes we care about
export const config = {
  matcher: ["/cont/:path*", "/auth/:path*"],
};
