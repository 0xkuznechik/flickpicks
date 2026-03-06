# Flickpicks Project Memory

## Project Overview
Oscar pool betting app (Remix + React + Prisma/PostgreSQL + Tailwind).
Stack: Remix 2.14, React 18, Prisma 5, Vitest 4, Tailwind 3.

## Key Files
- `app/routes/ballot.tsx` — Core app (1700+ lines), all pick/bet logic
- `app/lib/ballot-data.ts` — 24 categories with nominees and American odds
- `app/lib/ballot-stats.ts` — Movie nomination stats derived from ballot-data
- `app/lib/betting-utils.ts` — American odds calculations (profit, return, probability)
- `app/utils/auth.server.ts` — Session auth; getUser returns {id, email, lockedAt, isAdmin}
- `app/utils/admin.server.ts` — requireAdminUser (no extra DB query, uses isAdmin from session)
- `scripts/seed.mjs` — Seeds real users; passwordMustBeChanged: true so first login forces password change

## Test Suite (105 tests, all passing)
- `app/lib/betting-utils.test.ts` — All 5 betting functions, edge cases, real-world scenarios
- `app/lib/ballot-data.test.ts` — Data integrity (24 categories, 5 nominees each, valid odds), formatNominee
- `app/lib/ballot-stats.test.ts` — All 6 stats functions; Sinners leads with 16 nominations
- Run: `npm run test:run`

## Known Data Facts
- Sinners: 16 nominations (most nominated) — leads Best Actor, Supporting Actor/Actress, Directing, Picture, many technicals
- One Battle after Another: 12 unique categories (13 individual entries; Del Toro + Penn both in Supporting Actor)
- BALLOT_CATEGORIES has exactly 24 categories; Best Picture has 10 nominees, all others have 5

## Production Notes
- Session cookie: httpOnly, sameSite=lax, secure=true in production only
- Login: redirectTo param validated (must start with `/`, not `//`) to prevent open redirect
- Leaderboard shows username (fallback: email prefix) — never full email
- Admin routes: single DB query via isAdmin field on getUser
- MAX_BUDGET = $1000 per user (defined in ballot.tsx)
- Signup is invitation-only (join.tsx shows closed message)
