# InventX Challenge

A bingo-card style scavenger hunt for the InventX event — participants register, complete
challenges throughout the day, and climb a live leaderboard.

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS + Supabase + Vercel.

## Local development

```bash
npm install
npm run dev
```

Requires a `.env.local` with:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ORGANISER_PASSWORD=
```

## Database

Schema and seed data live in `supabase/migrations/`. Run each file, in order, in the
Supabase SQL Editor.

## Routes

- `/` — registration
- `/challenges` — the challenge list (bingo card)
- `/leaderboard` — public live leaderboard
- `/organiser` — password-protected organiser dashboard
