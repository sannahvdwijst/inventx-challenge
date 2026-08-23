-- InventX Challenge — photo evidence for completions
-- Run this in Supabase SQL Editor after 001-003.

alter table completions add column if not exists photo_url text;

-- Public bucket: anyone with the URL can view a photo (needed to show
-- evidence thumbnails in the app and organiser dashboard).
insert into storage.buckets (id, name, public)
values ('challenge-photos', 'challenge-photos', true)
on conflict (id) do nothing;

-- Same trust model as completions (see 001_init.sql note): no real auth
-- layer, so anon can upload/delete freely within this bucket.
create policy "challenge_photos_insert_public"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'challenge-photos');

create policy "challenge_photos_select_public"
  on storage.objects for select
  to anon
  using (bucket_id = 'challenge-photos');

create policy "challenge_photos_delete_public"
  on storage.objects for delete
  to anon
  using (bucket_id = 'challenge-photos');
