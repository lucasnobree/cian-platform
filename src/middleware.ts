import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Main app hostnames (not custom domains)
const APP_HOSTNAMES = new Set([
  "localhost",
  "localhost:3000",
  "localhost:3099",
  process.env.NEXT_PUBLIC_APP_DOMAIN || "cian-platform.vercel.app",
  "cianstudio.com.br",
  "www.cianstudio.com.br",
]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  // Custom domain routing: if hostname is NOT the main app, treat as wedding site
  const isCustomDomain = !APP_HOSTNAMES.has(hostname) && !hostname.includes("vercel.app");

  if (isCustomDomain) {
    // For custom domains, resolve the slug via a lightweight API call
    // and rewrite transparently to the slug-based wedding page
    try {
      const resolveUrl = new URL(`/api/public/domain/${hostname}/resolve`, request.url);
      const res = await fetch(resolveUrl);
      if (res.ok) {
        const { slug } = await res.json();
        if (slug) {
          const url = request.nextUrl.clone();
          url.pathname = `/${slug}`;
          return NextResponse.rewrite(url);
        }
      }
    } catch { /* fall through to 404 */ }
    // If domain not found, continue to show the default 404
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  // Redirect authenticated users away from login
  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Protect /admin routes
  if (pathname.startsWith("/admin") && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Protect API routes (but not /api/auth, /api/public, /api/webhooks)
  if (
    pathname.startsWith("/api/") &&
    !pathname.startsWith("/api/auth") &&
    !pathname.startsWith("/api/public") &&
    !pathname.startsWith("/api/webhooks") &&
    !token
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/login",
    "/api/clients/:path*",
    "/api/dashboard/:path*",
    "/api/users/:path*",
    "/api/profile/:path*",
    "/api/websites/:path*",
    "/api/config/:path*",
    // Match all paths for custom domain detection
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
