import { NextResponse, NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/",
  "/login", 
  "/register",
  "/about",
  "/public",
  "/terms",
  "/static",
  "/assets", 
  "/privacy",
  "/contact",
  "/_next",
  "/api",
  "/favicon.ico",
  "/images",
  "/manifest.json",
  "/robots.txt",
  "/sitemap.xml",
];

const AUTH_PATHS = [
  "/auth/login",
  "/auth/register",
];

const PROTECTED_PATHS = [
  "/teacher",
  "/course",
  "/profile",
  "/dashboard",
];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

function isAuthPath(pathname: string) {
  return AUTH_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

function isProtectedPath(pathname: string) {
  return PROTECTED_PATHS.some(
    (p) => pathname.startsWith(p + "/") || pathname === p
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Get authentication cookies
  const accessToken = req.cookies.get("questify_access_token")?.value;
  const refreshToken = req.cookies.get("questify_refresh_token")?.value;
  const userData = req.cookies.get("questify_user_data")?.value;
  const isAuthenticated = !!(accessToken && refreshToken && userData);

  // Handle auth pages when user is already authenticated
  if (isAuthPath(pathname) && isAuthenticated) {
    const url = req.nextUrl.clone();
    const next = req.nextUrl.searchParams.get("next");

    if (next && next.startsWith("/") && !next.startsWith("//")) {
      url.pathname = next;
      url.searchParams.delete("next");
    } else {
      url.pathname = "/";
    }

    return NextResponse.redirect(url);
  }

  // Handle protected paths when user is not authenticated
  if (isProtectedPath(pathname) && !isAuthenticated) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Allow public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Default behavior for other paths
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};