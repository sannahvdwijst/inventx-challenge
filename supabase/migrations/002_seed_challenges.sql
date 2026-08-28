-- InventX Challenge — seed data (40 challenges)
-- Run this AFTER 001_init.sql, in Supabase SQL Editor.
-- Safe to re-run: clears existing challenges first (completions cascade-delete
-- with them, so only run this before real data is collected).

truncate table completions, challenges restart identity cascade;

insert into challenges (title, description, category, points) values
-- Networking
('Learn all domains', 'Learn and correctly name every domain represented at InventX.', 'networking', 20),
('Meet 5 new colleagues', 'Introduce yourself to 5 people you have not met before.', 'networking', 10),
('Have lunch with someone you don''t know', 'Sit down for lunch with someone new.', 'networking', 15),
('Challenge someone during a dinner activity', 'Take part in a dinner activity challenge with another participant.', 'networking', 10),
('Find someone of the same age', 'Find a participant who is the same age as you.', 'networking', 10),
('Find someone who worked on the same client', 'Find a participant who has worked on the same client as you.', 'networking', 10),
('Find someone with the same academic background', 'Find a participant who studied the same field as you.', 'networking', 10),
('Find someone from the same hometown', 'Find a participant who grew up in the same town or city as you.', 'networking', 10),
('Find someone from every team', 'Meet at least one participant from every team represented today.', 'networking', 10),
('Find the furthest traveller', 'Find the participant who travelled the furthest to attend InventX.', 'networking', 10),

-- Fun & Social
('3 or more pets', 'Find someone who owns 3 or more pets.', 'fun_social', 10),
('Speaks 3 or more languages', 'Find someone who speaks 3 or more languages fluently.', 'fun_social', 10),
('Visited 20+ countries', 'Find someone who has visited more than 20 countries.', 'fun_social', 10),
('Same first name', 'Find someone who shares your first name.', 'fun_social', 15),
('Creative Parents Bonus', 'If nobody shares your first name, claim this bonus instead.', 'fun_social', 10),
('Joined Capgemini this year', 'Find someone who joined the company this year.', 'fun_social', 5),
('10+ years at the company', 'Find someone who has worked here for 10 years or more.', 'fun_social', 10),

-- Photo Challenges
('Photobooth with 2 new people', 'Take a photobooth picture with at least 2 people you didn''t know.', 'photo', 15),
('Photo with every domain', 'Take a photo with someone from every Domain.', 'photo', 20),
('Recreate a movie scene', 'Recreate a famous movie scene in a photo.', 'photo', 15),
('Most creative team selfie', 'Take the most creative selfie with your team.', 'photo', 15),
('Human pyramid photo', 'Take part in and photograph a human pyramid.', 'photo', 20),
('Before and after photo', 'Take a photo with someone who joined before you and someone who joined after you.', 'photo', 15),
('Future AI Consultants group photo', 'Take a group photo with the Future AI Consultants.', 'photo', 15),
('5-team group photo', 'Take a group photo with 5 people from different teams.', 'photo', 15),
('Same pose photo', 'Get everyone in a photo to strike the same pose.', 'photo', 10),

-- Party Challenges
('Polonaise with 5+', 'Create a polonaise with 5 or more people.', 'party', 20),
('Polonaise with 15+', 'Create a polonaise with 15 or more people.', 'party', 25),
('Limbo competition', 'Organise a limbo competition with 5 or more participants.', 'party', 20),
('Teach a dance move', 'Teach someone a dance move.', 'party', 10),
('Join something new', 'Participate in a group activity you normally wouldn''t join.', 'party', 10),
('Start a group cheer', 'Start a group cheer with 5 strangers.', 'party', 15),
('Create a dance circle', 'Get a dance circle going.', 'party', 20),
('Sing with 3 colleagues', 'Sing along with 3 colleagues from different teams.', 'party', 15),
('Floss dance duo', 'Do the floss dance with someone.', 'party', 10),

-- Bonus Challenges
('Meet every domain and team', 'Meet someone from every Domain and every Invent team.', 'bonus', 30),
('10 challenges with strangers', 'Complete 10 challenges with people you didn''t know before InventX.', 'bonus', 25),
('Appear in 15 photos', 'Appear in 15 different participant photos.', 'bonus', 20),
('Selfie with an organiser', 'Take a selfie with an organiser.', 'bonus', 10),
('Learn about 20 participants', 'Learn something memorable about 20 participants.', 'bonus', 30);
