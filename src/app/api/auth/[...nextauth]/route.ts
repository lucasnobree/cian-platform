import { NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { applyRateLimit } from "@/lib/rate-limit";

const handler = NextAuth(authOptions);

// Wrap POST to apply rate limiting on login attempts (10 req/min per IP)
async function rateLimitedPost(req: NextRequest, ctx: unknown) {
  const limited = applyRateLimit(req, { maxRequests: 10, windowMs: 60_000 }, "auth");
  if (limited) return limited;
  return (handler as unknown as (req: NextRequest, ctx: unknown) => Promise<Response>)(req, ctx);
}

export { handler as GET, rateLimitedPost as POST };
