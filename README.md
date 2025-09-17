
# MADSPACE — UW–Madison Course Reviews

Next.js 14 + TailwindCSS app for UW–Madison course reviews. Inspired by HKUST Space, but with original content, UW styling, and UW-specific grading (A, AB, B, BC, C, D, F).

> Respect trademarks & content: don’t copy HKUST assets/text. Use UW-themed styling only.

## Quickstart

```bash
# Requires Node 18+
cp .env.example .env.local   # set DATABASE_URL, NEXTAUTH_SECRET, providers
npm install
npm run prisma:generate
npm run db:push
npm run dev
```

Visit http://localhost:3000

## Features
- Auth with NextAuth (restricted to @wisc.edu), roles (ADMIN)
- Prisma schema: Courses, Instructors, Offerings, Reviews, Votes, Reports, ImportedCourse
- Reviews API with Zod validation, gating (write ≥1 review to unlock comments), voting, reporting
- Reviews index with filters (dept/level/credits/instructor), sorting, pagination
- Course detail with UW letter tiles (A/AB/B/BC/C/D/F) and Write Review form
- Degree Planner import (PDF → course code + term only; no grades stored)
- Admin moderation (/admin): resolve/reject, hide/restore reviews
- Unit tests (Vitest); CI on PRs

## Data import (optional)
- Guide catalog scrape (HTML):
  - `npm run scrape:uw -- catalog --url https://guide.wisc.edu/courses/`
- Enroll schedule via HAR JSON:
  - `npm run har:enroll -- --har reference/public.enroll.wisc.edu.har --term 2025-Fall --apply`
- Seed via JSON/CSV:
  - `npm run ingest:courses -- --json ./courses.json` (or `--csv`)

## Scripts
- `npm run lint` • `npm run typecheck` • `npm run build`
- `npm run test` (Vitest) • `npm run dev`

## Notes
- UW-only auth enforced (email domain check).
- UI: utility classes `.input`, `.app-btn`, `.skeleton`; toasts via global provider.

## Contributing
- Read the repository-wide guide in `AGENTS.md` for structure, commands, coding style, APIs, and security notes.
- Use small, focused PRs with clear descriptions and screenshots for UI changes.
- Run `npm run lint`, `npm run typecheck`, and `npm run test` before opening a PR.

## Deployment
- Target: Vercel.
- Required env vars (set in Vercel project settings):
  - `DATABASE_URL` — Postgres connection string
  - `NEXTAUTH_URL` — e.g., `https://your-app.vercel.app`
  - `NEXTAUTH_SECRET` — strong random string
  - One provider configured (Email or Google), while sign-in is still restricted to `@wisc.edu`.
- Build command: `npm run build`. Output: Next.js (App Router).
