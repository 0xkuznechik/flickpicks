# Oscars Pool (Remix + Prisma + Postgres)

## Local dev

Prereqs:
- Node 20+
- Docker (for local Postgres)

Run:

```bash
npm install
npm run dev
```

This will:
1. Start Postgres via `docker compose up -d`
2. Run `prisma generate`
3. Run `prisma migrate deploy`
4. Start Remix dev server at http://localhost:5173

## Notes
- Auth is a skeleton: email + password stored as bcrypt hash.
- First login with a new email auto-creates an account.
- Ballot categories are placeholder data in `app/lib/ballot-data.ts`.
- Example web-fetch API: `GET /api/academy-awards-summary` caches Wikipedia JSON in the DB.

## Database tools

```bash
npm run prisma:studio
```
