import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static assets and API routes
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".") // Skip files with extensions (images, css, js, etc.)
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request });
  const isProtectedRoute = pathname.startsWith("/cont");
  const isAuthPage = pathname.startsWith("/auth");

  // If user is not authenticated and trying to access protected routes
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/auth/autentificare", request.url));
  }

  // If user is authenticated and trying to access auth pages, redirect to home
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except static assets
     */
    "/cont/:path*",
  ],
};
