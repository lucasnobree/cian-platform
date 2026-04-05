import { NextRequest, NextResponse } from "next/server";

// In-memory sliding window rate limiter for serverless environments.
// For production at scale, consider Upstash Redis (@upstash/ratelimit).

interface RateLimitEntry {
  timestamps: number[];
}

interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

// Global store shared across invocations within the same serverless instance
const store = new Map<string, RateLimitEntry>();

// Periodic cleanup to prevent memory leaks (every 60 seconds)
let cleanupInterval: ReturnType<typeof setInterval> | null = null;

function ensureCleanup(windowMs: number) {
  if (cleanupInterval) return;
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);
      if (entry.timestamps.length === 0) {
        store.delete(key);
      }
    }
  }, 60_000);
  // Allow the Node.js process to exit even if the interval is active
  if (
    cleanupInterval &&
    typeof cleanupInterval === "object" &&
    "unref" in cleanupInterval
  ) {
    (cleanupInterval as NodeJS.Timeout).unref();
  }
}

/**
 * In-memory sliding window rate limiter.
 * Tracks requests per key (typically IP address) using a sliding window.
 */
export function rateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const { maxRequests, windowMs } = config;
  const now = Date.now();

  ensureCleanup(windowMs);

  const entry = store.get(key);

  if (!entry) {
    store.set(key, { timestamps: [now] });
    return { success: true, remaining: maxRequests - 1, reset: now + windowMs };
  }

  // Remove timestamps outside the sliding window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= maxRequests) {
    const oldestInWindow = entry.timestamps[0];
    const reset = oldestInWindow + windowMs;
    return { success: false, remaining: 0, reset };
  }

  entry.timestamps.push(now);
  return {
    success: true,
    remaining: maxRequests - entry.timestamps.length,
    reset: entry.timestamps[0] + windowMs,
  };
}

/**
 * Extract client IP from a NextRequest.
 * Checks x-forwarded-for (set by proxies/Vercel), falls back to x-real-ip.
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs; the first is the client
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "unknown";
}

/**
 * Helper to apply rate limiting to an API route handler.
 * Returns a NextResponse with 429 status if rate limit exceeded, or null if allowed.
 *
 * Usage:
 *   const limited = applyRateLimit(request, { maxRequests: 10, windowMs: 60_000 });
 *   if (limited) return limited;
 */
export function applyRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  /** Optional prefix to namespace different endpoints */
  prefix?: string
): NextResponse | null {
  const ip = getClientIp(request);
  const key = prefix ? `${prefix}:${ip}` : ip;
  const result = rateLimit(key, config);

  if (!result.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.ceil((result.reset - Date.now()) / 1000)
          ),
          "X-RateLimit-Limit": String(config.maxRequests),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(result.reset / 1000)),
        },
      }
    );
  }

  return null;
}
