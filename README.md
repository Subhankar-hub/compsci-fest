# Computational Science — fest platform

Next.js app for a multi-round event: **MCQ + short answers** (rounds 1–2) and **coding** (round 3). Round 3 uses **automatic grading** via the public [Judge0 CE](https://ce.judge0.com) instance (no API key or credit card). For high traffic, point `JUDGE0_CE_URL` at a self-hosted Judge0. Deploys cleanly on [Render](https://render.com).

## Features

- Participant registration / login (session cookie + JWT)
- Per-participant timer per round (starts on first visit)
- Admin panel: unlock rounds `0–3`, edit durations and event title (`ADMIN_PASSWORD`)
- Leaderboard (quiz + coding totals)
- Coding round: harnessed solutions run on Judge0 CE (or your `JUDGE0_CE_URL`); scores from passed hidden tests

## Local setup

1. Create a PostgreSQL database and set `DATABASE_URL` in `.env` (see `.env.example`).
2. `npm ci`
3. `npx prisma migrate deploy`
4. `npm run db:seed` (demo content + demo login — see seed output)
5. `npm run dev`

## Render (Blueprint)

1. Push this repo to GitHub/GitLab.
2. In Render: **New → Blueprint**, select `render.yaml`.
3. Set environment variables in the dashboard:
   - `ADMIN_PASSWORD` — required for the admin UI.
4. After the first successful deploy, open **Shell** on the web service and run:

   ```bash
   npm run db:seed
   ```

   (Run once to load questions; re-run only if you want to reset demo data — it clears submissions.)

5. Optional: change `JWT_SECRET` to a long random string if you did not rely on Render’s generated value.

## Customizing content

- Edit `src/data/quiz-round-seed.ts`, `src/data/coding-round-seed.ts`, and `prisma/seed.ts`, or use **Admin → sync question bank**.
- Adjust round timers and unlock state from the **Admin** page at `/admin`.

## Security notes

- Change default demo credentials before a public event.
- `ADMIN_PASSWORD` and `JWT_SECRET` must stay private.
