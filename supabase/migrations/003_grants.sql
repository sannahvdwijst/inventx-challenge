-- InventX Challenge — grant table privileges to the anon role
-- RLS policies only take effect once the role also has the underlying
-- SQL privilege; run this after 001_init.sql and 002_seed_challenges.sql.

grant usage on schema public to anon;

grant select, insert on participants to anon;
grant select on challenges to anon;
grant select, insert, delete on completions to anon;
grant select on participant_scores to anon;
