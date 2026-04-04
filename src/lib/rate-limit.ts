// In-memory rate limiter. For production, consider Upstash Redis (@upstash/ratelimit).

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const tokenCache = new Map<string, RateLimitEntry>();

// Cleanup expired entries every 60 seconds
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of tokenCache) {
      if (now > entry.resetTime) tokenCache.delete(key);
    }
  }, 60_000);
}

export function rateLimit({ interval = 60_000, uniqueTokenPerInterval = 500 } = {}) {
  return {
    check(limit: number, token: string): Promise<void> {
      return new Promise((resolve, reject) => {
        const now = Date.now();
        const entry = tokenCache.get(token);

        if (tokenCache.size > uniqueTokenPerInterval) {
          // Evict oldest entries
          const firstKey = tokenCache.keys().next().value;
          if (firstKey) tokenCache.delete(firstKey);
        }

        if (!entry || now > entry.resetTime) {
          tokenCache.set(token, { count: 1, resetTime: now + interval });
          return resolve();
        }

        if (entry.count >= limit) {
          return reject(new Error("Rate limit exceeded"));
        }

        entry.count++;
        resolve();
      });
    },
  };
}
