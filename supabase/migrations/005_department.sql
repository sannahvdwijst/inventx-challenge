-- InventX Challenge — track department (Domains / Invent are merging)
-- Run this in Supabase SQL Editor after 001-004.
-- Assumes no real participants have registered yet (adds a NOT NULL column).

alter table participants
  add column if not exists department text
  not null
  check (department in ('Domains', 'Invent'));

-- Recreate the leaderboard view to surface department alongside team.
-- (CREATE OR REPLACE VIEW can't reorder columns, so drop first.)
drop view if exists participant_scores;

create view participant_scores as
select
  p.id,
  p.name,
  p.team,
  p.department,
  p.registered_at,
  coalesce(sum(c.points), 0)::int as total_score,
  count(comp.id)::int as challenges_completed
from participants p
left join completions comp on comp.participant_id = p.id
left join challenges c on c.id = comp.challenge_id
group by p.id, p.name, p.team, p.department, p.registered_at;

grant select on participant_scores to anon;
grant select on participant_scores to service_role;
