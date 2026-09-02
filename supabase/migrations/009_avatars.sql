-- InventX Challenge — optional profile photo (avatar) at registration
-- Run this in Supabase SQL Editor after 001-008.

alter table participants add column if not exists avatar_url text;

-- Recreate the leaderboard view to surface avatar_url.
-- (CREATE OR REPLACE VIEW can't reorder/add columns cleanly here, so drop first.)
drop view if exists participant_scores;

create view participant_scores as
select
  p.id,
  p.name,
  p.team,
  p.department,
  p.avatar_url,
  p.registered_at,
  coalesce(sum(c.points), 0)::int as total_score,
  count(comp.id)::int as challenges_completed
from participants p
left join completions comp on comp.participant_id = p.id
left join challenges c on c.id = comp.challenge_id
group by p.id, p.name, p.team, p.department, p.avatar_url, p.registered_at;

grant select on participant_scores to anon;
grant select on participant_scores to service_role;
