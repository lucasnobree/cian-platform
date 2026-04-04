# CIAN Platform

## Project
Wedding visual identity management platform for CIAN Art Studio.
Stack: Next.js 14 App Router, TypeScript, Tailwind CSS, Prisma, PostgreSQL (Supabase), NextAuth.

## Commands
- `npm run dev` — Start dev server
- `npx prisma db push` — Push schema to database
- `npx prisma generate` — Generate Prisma client
- `npx prisma studio` — Open database GUI

## Structure
- `src/app/admin/` — Admin panel pages
- `src/app/(public)/[slug]/` — Public wedding websites
- `src/app/api/` — API routes
- `src/components/ui/` — Reusable UI components (CIAN design system)
- `src/components/layout/` — Layout components (Sidebar, Topbar)
- `src/components/admin/` — Admin-specific components
- `src/lib/` — Utilities, Prisma client, services
- `src/lib/validators/` — Zod schemas
- `src/lib/services/` — Business logic (Trello, AbacatePay, etc)

## Guidelines
- Use Server Components by default, Client Components only when needed
- Validate all inputs with Zod in API routes
- Follow OWASP security practices
- Use CIAN design system colors (teal/ocean theme)
- Primary color: #0D9488, Background: #FEFDFB, Sidebar: #042F2E

@AGENTS.md
