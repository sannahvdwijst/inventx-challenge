-- InventX Challenge — per-challenge proof type (photo / text / both)
-- Run this in Supabase SQL Editor after 001-005.

alter table challenges
  add column if not exists proof_type text not null default 'photo'
  check (proof_type in ('photo', 'text', 'both'));

alter table completions add column if not exists proof_text text;

-- ---------------------------------------------------------------------------
-- Networking — mostly text proof
-- ---------------------------------------------------------------------------
update challenges set proof_type = 'text',
  description = 'Enter their name and age below.'
  where title = 'Find someone of the same age';

update challenges set proof_type = 'text',
  description = 'Enter their name and academic background below.'
  where title = 'Find someone with the same academic background';

update challenges set proof_type = 'text',
  description = 'Enter their name and hometown below.'
  where title = 'Find someone from the same hometown';

update challenges set proof_type = 'text',
  description = 'Enter the names of someone from every team below.'
  where title = 'Find someone from every team';

update challenges set proof_type = 'text',
  description = 'Enter their name and where they travelled from below.'
  where title = 'Find the furthest traveller';

update challenges set proof_type = 'text',
  description = 'Enter the names of the 5 colleagues below.'
  where title = 'Meet 5 new colleagues';

update challenges set proof_type = 'text',
  description = 'Enter their name and the client below.'
  where title = 'Find someone who worked on the same client';

update challenges set proof_type = 'text',
  description = 'List all the domains below.'
  where title = 'Learn all domains';

-- ---------------------------------------------------------------------------
-- Fun & Social — mostly text proof
-- ---------------------------------------------------------------------------
update challenges set proof_type = 'text',
  description = 'Enter their name below.'
  where title = 'Creative Parents Bonus';

update challenges set proof_type = 'text',
  description = 'Enter their name and the countries they''ve visited below.'
  where title = 'Visited 20+ countries';

update challenges set proof_type = 'text',
  description = 'Enter their name below.'
  where title = '10+ years at the company';

update challenges set proof_type = 'text',
  description = 'Enter their name and their pets'' names below.'
  where title = '3 or more pets';

update challenges set proof_type = 'text',
  description = 'Enter their name and write one sentence in each language they speak below.'
  where title = 'Speaks 3 or more languages';

-- ---------------------------------------------------------------------------
-- Party — rename, description tweaks, one dual-proof challenge
-- ---------------------------------------------------------------------------
update challenges set
  title = 'Funny dance duo',
  description = 'Do a funny dance with someone.'
  where title = 'Floss dance duo';

update challenges set proof_type = 'both',
  description = 'Write your cheer below and attach a photo of the squad.'
  where title = 'Start a group cheer';

update challenges set
  description = 'Sing along with 3 colleagues from different teams in the Karaoke Space Wagon.'
  where title = 'Sing with 3 colleagues';

-- ---------------------------------------------------------------------------
-- Bonus — text proof (name lists)
-- ---------------------------------------------------------------------------
update challenges set proof_type = 'text',
  description = 'List the names of the 15 people below.'
  where title = 'Appear in 15 photos';

update challenges set proof_type = 'text',
  description = 'List the names of the 10 people below.'
  where title = '10 challenges with strangers';

update challenges set proof_type = 'text',
  description = 'List the names of everyone you met below.'
  where title = 'Meet every domain and team';

update challenges set proof_type = 'text',
  description = 'List each person''s name and a fun fact about them below.'
  where title = 'Learn about 20 participants';

-- ---------------------------------------------------------------------------
-- New challenges
-- ---------------------------------------------------------------------------
insert into challenges (title, description, category, points, proof_type) values
('Play lasertag', 'Take a photo as proof.', 'party', 15, 'photo'),
('Play archery tag', 'Take a photo as proof.', 'party', 15, 'photo'),
('Puzzle painting', 'Participate in puzzle painting and take a photo as proof.', 'party', 15, 'photo');
