-- Garnish Venue · drink photographs
-- A menu item can carry a photo: { url, alt?, color?, credit? }.
-- Files live in the public bucket "menu-photos" under <venue_id>/<file>;
-- anyone may view them (they are on the public menu), only the venue's
-- owners and managers may add, replace or remove them.

alter table public.menu_items add column photo jsonb;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('menu-photos', 'menu-photos', true, 2097152, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

-- the first folder of the object's path is the venue id
create function public.photo_venue(object_name text) returns uuid
language sql immutable as $$
  select case when split_part(object_name, '/', 1) ~ '^[0-9a-f-]{36}$'
              then split_part(object_name, '/', 1)::uuid end;
$$;

create policy menu_photos_read on storage.objects for select
  using (bucket_id = 'menu-photos');
create policy menu_photos_add on storage.objects for insert to authenticated
  with check (bucket_id = 'menu-photos' and public.is_member(public.photo_venue(name), '{owner,manager}'));
create policy menu_photos_change on storage.objects for update to authenticated
  using (bucket_id = 'menu-photos' and public.is_member(public.photo_venue(name), '{owner,manager}'));
create policy menu_photos_remove on storage.objects for delete to authenticated
  using (bucket_id = 'menu-photos' and public.is_member(public.photo_venue(name), '{owner,manager}'));
