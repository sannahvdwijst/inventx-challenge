-- InventX Challenge — team/cluster meet-and-greet challenges
-- Run this in Supabase SQL Editor after 001-006.

-- Replace the single "meet someone from every team" challenge with one
-- photo-proof challenge per specific team/cluster.
delete from challenges where title = 'Find someone from every team';

insert into challenges (title, description, category, points, proof_type) values
('Meet someone from W&O', 'Take a photo with someone new from the W&O team.', 'networking', 10, 'photo'),
('Meet someone from frog', 'Take a photo with someone new from frog.', 'networking', 10, 'photo'),
('Meet someone from Enterprise Data & Analytics', 'Take a photo with someone new from the Enterprise Data & Analytics team.', 'networking', 10, 'photo'),
('Meet someone from Corporate Experience', 'Take a photo with someone new from the Corporate Experience team.', 'networking', 10, 'photo'),
('Meet someone from Business Technology', 'Take a photo with someone new from Business Technology.', 'networking', 10, 'photo'),
('Meet someone from an Industry team', 'Take a photo with someone new from one of the Industry teams.', 'networking', 10, 'photo'),
('Meet someone from Intelligent Industries', 'Take a photo with someone new from the Intelligent Industries team.', 'networking', 10, 'photo'),
('Meet someone from cluster ADC', 'Take a photo with someone new from cluster ADC.', 'networking', 10, 'photo'),
('Meet someone from cluster Public', 'Take a photo with someone new from cluster Public (Domains).', 'networking', 10, 'photo'),
('Meet someone from cluster Private', 'Take a photo with someone new from cluster Private.', 'networking', 10, 'photo'),
('Welcome someone from the Institute', 'Meet someone from the Institute and welcome them to the company. Take a photo together.', 'networking', 10, 'photo'),
('Meet someone in the LEAP program', 'Take a photo with someone who does the LEAP program.', 'networking', 10, 'photo');

-- Update "Find the furthest traveller" to require a minimum travel time and
-- both a photo and the distance in km.
update challenges set
  title = 'Find the furthest traveller',
  description = 'Find the colleague who you think has travelled the furthest to attend InventX (minimum of 1.5 hours travel). Take a photo together and enter the distance in km below.',
  proof_type = 'both',
  points = 15
  where title = 'Find the furthest traveller';

-- Clarify "Photo with every domain" covers all 3 Domain clusters.
update challenges set
  description = 'Take a photo with someone from every Domain cluster (3 in total).'
  where title = 'Photo with every domain';

-- New management team selfie challenges.
insert into challenges (title, description, category, points, proof_type) values
('Selfie with Invent Management', 'Take a selfie with someone from the Invent Management Team.', 'networking', 15, 'photo'),
('Selfie with Domains Management', 'Take a selfie with someone from the Domains Management team.', 'networking', 15, 'photo');
