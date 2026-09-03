-- InventX Challenge — 4 new Photo Challenges
-- Run this in Supabase SQL Editor after 001-009.

insert into challenges (title, description, category, points, proof_type) values
('Crew photo', 'Take a picture with someone from the crew (black t-shirt).', 'photo', 10, 'photo'),
('Twin Challenge', 'Find two colleagues dressed in surprisingly similar colours or styles and take a picture together.', 'photo', 15, 'photo'),
('Generation Connection', 'Take a photo with colleagues from at least three different career stages (e.g. graduate, consultant, manager).', 'photo', 20, 'photo'),
('Frozen in Time', 'Create an action shot with 3 people where everyone jumps, runs, or pretends to be frozen mid-motion.', 'photo', 15, 'photo');
