import type { NextConfig } from "next";

// Content-Security-Policy for public wedding pages and admin panel.
// TODO: Replace 'unsafe-inline' for script-src with nonce-based CSP
// once Next.js middleware supports per-request nonce injection.
const cspDirectives = [
  // Only allow scripts from same origin. 'unsafe-inline' is needed for Next.js
  // hydration scripts. 'unsafe-eval' is NOT included (blocks eval-based XSS).
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  // Allow inline styles (needed for dynamic CSS variables on wedding pages)
  // and Google Fonts stylesheets.
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // Allow Google Fonts files
  "font-src 'self' https://fonts.gstatic.com data:",
  // Allow images from self, data URIs, blob URIs, and common image hosting
  "img-src 'self' data: blob: https://*.supabase.co https://utfs.io https://uploadthing.com https://*.uploadthing.com",
  // Allow API calls to self and Supabase
  "connect-src 'self' https://*.supabase.co",
  // Allow iframes from same origin and Supabase (used to render custom sites)
  "frame-src 'self' https://*.supabase.co",
  // Block object/embed/applet
  "object-src 'none'",
  // Restrict base URI to prevent base tag hijacking
  "base-uri 'self'",
  // Restrict form targets to same origin
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Content-Security-Policy", value: cspDirectives },
        ],
      },
    ];
  },
};

export default nextConfig;
