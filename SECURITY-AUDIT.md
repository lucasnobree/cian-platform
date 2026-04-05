# Security Audit Report - CIAN Platform

**Date:** 2026-04-04
**Auditor:** Security Agent (automated)
**Scope:** OWASP Top 10 review of API routes, auth, middleware, and configuration

---

## Issues Found & Fixed

### CRITICAL

#### 1. Missing Authorization on Client API Routes
- **OWASP:** A01 Broken Access Control
- **Files:** `src/app/api/clients/route.ts`, `src/app/api/clients/[id]/route.ts`, `src/app/api/clients/[id]/stage/route.ts`
- **Description:** These routes had NO server-side session verification. They relied solely on middleware for auth. If middleware was bypassed (misconfigured matcher, direct serverless invocation), all client data would be exposed to unauthenticated users. CRUD operations on client data (including DELETE) were completely unprotected at the handler level.
- **Fix:** Added `getServerSession(authOptions)` checks to all handlers in these files.

#### 2. Missing Authorization on Dashboard Stats
- **OWASP:** A01 Broken Access Control
- **File:** `src/app/api/dashboard/stats/route.ts`
- **Description:** Dashboard stats endpoint had no session check, leaking business metrics (revenue, client counts, upcoming weddings) to anyone who could reach the endpoint.
- **Fix:** Added `getServerSession(authOptions)` check.

### HIGH

#### 3. No Rate Limiting on Authentication Endpoint
- **OWASP:** A07 Identification and Authentication Failures
- **File:** `src/app/api/auth/[...nextauth]/route.ts`
- **Description:** Login endpoint had no rate limiting, allowing unlimited brute-force password attempts.
- **Fix:** Applied rate limiting of 10 requests per minute per IP on the POST handler. Created sliding window rate limiter in `src/lib/rate-limit.ts`.

#### 4. No Rate Limiting on Client Creation
- **OWASP:** A04 Insecure Design
- **File:** `src/app/api/clients/route.ts`
- **Description:** POST endpoint for creating clients had no rate limiting, allowing potential abuse/spam.
- **Fix:** Applied rate limiting of 20 requests per minute per IP.

### MEDIUM

#### 5. Audit Logs Missing User Identity
- **OWASP:** A09 Security Logging and Monitoring Failures
- **Files:** `src/app/api/clients/route.ts`, `src/app/api/clients/[id]/route.ts`, `src/app/api/clients/[id]/stage/route.ts`
- **Description:** `logAudit()` calls did not include `userId`, making it impossible to trace who performed an action.
- **Fix:** Added `userId` from session to all `logAudit()` calls in client routes.

#### 6. Existing Rate Limiter Used Fixed Window
- **OWASP:** A07 Identification and Authentication Failures
- **File:** `src/lib/rate-limit.ts`
- **Description:** The previous rate limiter used a fixed window algorithm, which can allow burst attacks at window boundaries (up to 2x the limit).
- **Fix:** Rewrote to use sliding window algorithm with proper cleanup and helper function `applyRateLimit()` for easy integration.

---

## Items Reviewed - No Issues Found

### Authentication Configuration (`src/lib/auth.ts`)
- bcrypt with 12 salt rounds (meets OWASP recommendation)
- JWT session strategy properly configured
- Checks `user.isActive` before authorizing (good: disabled accounts are blocked)
- Does not leak information on failed login (returns null, not error messages)

### User Management Routes (`src/app/api/users/route.ts`, `src/app/api/users/[id]/route.ts`)
- Both have proper `getServerSession` checks
- Owner-only role enforcement on user CRUD
- Self-edit permissions properly scoped
- Owner cannot delete themselves (prevents lockout)
- Password hashing uses bcrypt with 12 rounds
- Input validated with Zod schemas

### Profile Route (`src/app/api/profile/route.ts`)
- Has `getServerSession` check
- Users can only read/edit their own profile (uses `session.user.id`)
- Input validated with Zod

### Middleware (`src/middleware.ts`)
- Protects `/admin` routes and API routes
- Uses `getToken` from next-auth/jwt
- Correctly excludes public routes (`/api/auth`, `/api/public`, `/api/webhooks`)
- Matcher config covers all protected paths

### Input Validation (`src/lib/validators/client.ts`)
- Comprehensive Zod validation on all client fields
- HTML sanitization via `sanitizeText` transform
- CPF validation with algorithm check
- Slug validation with reserved words blocklist
- Field length limits prevent abuse

### Security Headers (`next.config.ts`)
- HSTS with 2-year max-age, includeSubDomains, preload
- X-Frame-Options: SAMEORIGIN (clickjacking protection)
- X-Content-Type-Options: nosniff
- Referrer-Policy configured
- Permissions-Policy restricts camera/mic/geo

### Database (`src/lib/prisma.ts`)
- Uses Prisma ORM (parameterized queries, no SQL injection risk)
- SSL enabled for Supabase connection
- Connection pool limited to 5 (appropriate for serverless)
- Global singleton pattern prevents connection exhaustion in dev

---

## Recommendations for Future

### High Priority
1. **Content-Security-Policy header**: Add a CSP header to `next.config.ts` to prevent XSS. Start with a report-only policy and tighten iteratively.
2. **Redis-based rate limiting**: The in-memory rate limiter resets on each serverless cold start. For production, use Upstash Redis (`@upstash/ratelimit`) for distributed rate limiting across instances.
3. **Account lockout**: After N failed login attempts, temporarily lock the account (not just rate limit by IP). Attackers can use distributed IPs.

### Medium Priority
4. **CSRF protection**: NextAuth handles CSRF for its own routes, but custom API routes using cookies should verify the Origin header.
5. **SSL certificate validation**: `src/lib/prisma.ts` uses `rejectUnauthorized: false` for SSL. In production, provide the Supabase CA certificate and set `rejectUnauthorized: true`.
6. **Audit log for auth events**: Log failed login attempts with IP address for intrusion detection.
7. **API response filtering**: Some endpoints return full Prisma objects. Consider using `select` to return only necessary fields to minimize data exposure.

### Low Priority
8. **Subresource Integrity (SRI)**: Add SRI hashes to external scripts/stylesheets if any are used.
9. **Cookie security**: Verify NextAuth cookies have `Secure`, `HttpOnly`, and `SameSite=Lax` attributes in production (NextAuth defaults should handle this).
10. **Dependency audit**: Run `npm audit` regularly and keep dependencies up to date.
