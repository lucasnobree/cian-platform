/**
 * Validates required and optional environment variables at startup.
 * Required vars throw if missing; optional vars log warnings.
 */
export function validateEnv(): void {
  const required = ["DATABASE_URL", "NEXTAUTH_URL", "NEXTAUTH_SECRET"] as const;
  const optional = ["TRELLO_API_KEY", "RESEND_API_KEY", "SENTRY_DSN"] as const;

  const missing: string[] = [];

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  for (const key of optional) {
    if (!process.env[key]) {
      console.warn(`[env] Optional environment variable ${key} is not set`);
    }
  }
}
