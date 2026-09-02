-- InventX Challenge — make every Networking challenge photo-proof
-- Run this in Supabase SQL Editor after 001-007.

update challenges set
  proof_type = 'photo',
  description = 'Take a photo with someone who is the same age as you.'
  where title = 'Find someone of the same age';

update challenges set
  proof_type = 'photo',
  description = 'Take a photo with someone who studied the same field as you.'
  where title = 'Find someone with the same academic background';

update challenges set
  proof_type = 'photo',
  description = 'Take a photo with someone from the same hometown as you.'
  where title = 'Find someone from the same hometown';

update challenges set
  proof_type = 'photo',
  description = 'Take a group photo with 5 colleagues you have just met.'
  where title = 'Meet 5 new colleagues';

update challenges set
  proof_type = 'photo',
  description = 'Take a photo with someone who worked on the same client as you.'
  where title = 'Find someone who worked on the same client';

update challenges set
  proof_type = 'photo',
  description = 'Ask a colleague to quiz you on all the domains, then take a photo together.'
  where title = 'Learn all domains';

update challenges set
  proof_type = 'photo',
  description = 'Find the colleague who you think has travelled the furthest to attend InventX (minimum of 1.5 hours travel). Take a photo together.'
  where title = 'Find the furthest traveller';
