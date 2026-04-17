import { NextRequest, NextResponse } from "next/server";

const ALWAYS_PROTECTED_PREFIXES = ["/dashboard", "/onboarding", "/settings"];
const PROTECTED_ANALYZER_PATHS = [/^\/analyzer\/history(?:\/|$)/, /^\/analyzer\/[^/]+\/analytics(?:\/|$)/];
const SESSION_COOKIE_CANDIDATES = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
  "__Host-better-auth.session_token",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = SESSION_COOKIE_CANDIDATES.some((cookieName) =>
    request.cookies.has(cookieName),
  );

  const isProtected =
    ALWAYS_PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    PROTECTED_ANALYZER_PATHS.some((pattern) => pattern.test(pathname));

  if (isProtected && !isAuthenticated) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*", "/analyzer/:path*", "/settings/:path*"],
};
