-- InventX Challenge — core schema
-- Run this in Supabase SQL Editor (Project → SQL Editor → New query)

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- participants
-- ---------------------------------------------------------------------------
create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  team text,
  registered_at timestamptz not null default now()
);

alter table participants enable row level security;

-- Anyone can register (insert their own row)
create policy "participants_insert_public"
  on participants for insert
  to anon
  with check (true);

-- Anyone can read participants (needed for public leaderboard)
create policy "participants_select_public"
  on participants for select
  to anon
  using (true);

-- ---------------------------------------------------------------------------
-- challenges
-- ---------------------------------------------------------------------------
create table if not exists challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null check (
    category in ('networking', 'fun_social', 'ai', 'photo', 'party', 'bonus')
  ),
  points integer not null check (points > 0),
  created_at timestamptz not null default now()
);

alter table challenges enable row level security;

-- Anyone can read the challenge list
create policy "challenges_select_public"
  on challenges for select
  to anon
  using (true);

-- Only the service role (organiser tooling / SQL editor) can write challenges.
-- No insert/update/delete policy is created for `anon`, so participants
-- cannot modify challenges from the client.

-- ---------------------------------------------------------------------------
-- completions
-- ---------------------------------------------------------------------------
create table if not exists completions (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants(id) on delete cascade,
  challenge_id uuid not null references challenges(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (participant_id, challenge_id)
);

create index if not exists completions_participant_idx on completions(participant_id);
create index if not exists completions_challenge_idx on completions(challenge_id);

alter table completions enable row level security;

-- Participants mark their own challenges complete.
-- NOTE: this app has no login/auth layer (by design — name-only entry, per
-- the "play fair" honour system). RLS therefore can't verify *which*
-- participant is acting; any anon caller can insert/select/delete any row.
-- This is an accepted trade-off for a trusted internal event. If stronger
-- guarantees are needed later, add Supabase Auth (e.g. magic link) and
-- scope these policies to auth.uid() = participant_id.
create policy "completions_insert_public"
  on completions for insert
  to anon
  with check (true);

create policy "completions_select_public"
  on completions for select
  to anon
  using (true);

create policy "completions_delete_public"
  on completions for delete
  to anon
  using (true);

-- ---------------------------------------------------------------------------
-- leaderboard view — efficient score calculation
-- ---------------------------------------------------------------------------
create or replace view participant_scores as
select
  p.id,
  p.name,
  p.team,
  p.registered_at,
  coalesce(sum(c.points), 0)::int as total_score,
  count(comp.id)::int as challenges_completed
from participants p
left join completions comp on comp.participant_id = p.id
left join challenges c on c.id = comp.challenge_id
group by p.id, p.name, p.team, p.registered_at;

-- Views inherit RLS from underlying tables when queried by anon via
-- PostgREST, but to be explicit and allow direct selects:
grant select on participant_scores to anon;
