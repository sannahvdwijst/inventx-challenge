-- InventX Challenge — grant table privileges to the anon role
-- RLS policies only take effect once the role also has the underlying
-- SQL privilege; run this after 001_init.sql and 002_seed_challenges.sql.

grant usage on schema public to anon;

grant select, insert on participants to anon;
grant select on challenges to anon;
grant select, insert, delete on completions to anon;
grant select on participant_scores to anon;

-- service_role bypasses RLS but still needs the underlying grant, for
-- the organiser dashboard and any server-side admin tooling.
grant usage on schema public to service_role;
grant all on participants, challenges, completions to service_role;
grant select on participant_scores to service_role;
