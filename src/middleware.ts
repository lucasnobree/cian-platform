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

function isAppHostname(hostname: string): boolean {
  return APP_HOSTNAMES.has(hostname) || hostname.includes("vercel.app");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  // Custom domain routing: if hostname is NOT the main app, treat as wedding site
  if (!isAppHostname(hostname) && pathname === "/") {
    // For custom domains hitting the root, rewrite to the domain resolve API
    // The client-side will handle the rendering
    const url = request.nextUrl.clone();
    url.pathname = `/api/public/domain/${hostname}/resolve`;
    // We can't rewrite to a page here due to potential loops
    // Instead, return a redirect to the resolved slug (handled client-side)
    try {
      const res = await fetch(url);
      if (res.ok) {
        const { slug } = await res.json();
        if (slug) {
          const rewriteUrl = request.nextUrl.clone();
          rewriteUrl.pathname = `/${slug}`;
          return NextResponse.rewrite(rewriteUrl);
        }
      }
    } catch { /* fall through */ }
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
    "/",
    "/admin/:path*",
    "/login",
    "/api/clients/:path*",
    "/api/dashboard/:path*",
    "/api/users/:path*",
    "/api/profile/:path*",
    "/api/websites/:path*",
    "/api/config/:path*",
  ],
};
