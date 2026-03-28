# Computational Science — fest platform

Next.js app for a multi-round event: **MCQ + short answers** (rounds 1–2) and **Python coding** (round 3) with optional **Judge0** (RapidAPI) auto-grading. Deploys cleanly on [Render](https://render.com).

## Features

- Team registration / login (session cookie + JWT)
- Per-team timer per round (starts on first visit)
- Admin panel: unlock rounds `0–3`, edit durations and event title (`ADMIN_PASSWORD`)
- Leaderboard (quiz + coding totals)
- Coding without `RAPIDAPI_KEY`: submissions stored as `PENDING_REVIEW` for manual scoring

## Local setup

1. Create a PostgreSQL database and set `DATABASE_URL` in `.env` (see `.env.example`).
2. `npm ci`
3. `npx prisma migrate deploy`
4. `npm run db:seed` (demo content + `Demo Team` / `demo123`)
5. `npm run dev`

## Render (Blueprint)

1. Push this repo to GitHub/GitLab.
2. In Render: **New → Blueprint**, select `render.yaml`.
3. Set environment variables in the dashboard:
   - `ADMIN_PASSWORD` — required for the admin UI.
   - `RAPIDAPI_KEY` — optional; subscribe to [Judge0 CE on RapidAPI](https://rapidapi.com/judge0-official/api/judge0-ce) for auto-judging.
4. After the first successful deploy, open **Shell** on the web service and run:

   ```bash
   npm run db:seed
   ```

   (Run once to load questions; re-run only if you want to reset demo data — it clears submissions.)

5. Optional: change `JWT_SECRET` to a long random string if you did not rely on Render’s generated value.

## Customizing content

- Edit `prisma/seed.ts` and re-seed, or insert rows via Prisma Studio (`npx prisma studio`).
- Adjust round timers and unlock state from the **Admin** page at `/admin`.

## Security notes

- Change default demo credentials before a public event.
- Judge0 calls use your RapidAPI quota; keep the key server-side only.
- `ADMIN_PASSWORD` and `JWT_SECRET` must stay private.
