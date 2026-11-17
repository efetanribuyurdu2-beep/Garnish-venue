-- Garnish Venue · functions the bar panel calls
-- create_venue: makes a venue and its owner in one step (returns the new row)
-- slug_available: is /v/<slug> still free?
-- reprice: bulk price change by a percentage, rounded to a step (e.g. 10 TL);
--          every change still lands in price_history through the trigger

create function public.create_venue(p_slug text, p_name text, p_city text, p_world text)
returns public.venues
language plpgsql security definer set search_path = public as $$
declare v public.venues;
begin
  if auth.uid() is null then raise exception 'sign in first'; end if;
  insert into public.venues (slug, name, city, world, tagline)
    values (lower(p_slug), p_name, coalesce(p_city, ''), coalesce(p_world, 'maison'),
            jsonb_build_object('tr', '', 'en', ''))
    returning * into v;
  -- the insert trigger already added the owner; make sure even if it is disabled
  insert into public.venue_members (venue_id, user_id, role) values (v.id, auth.uid(), 'owner')
    on conflict do nothing;
  return v;
end $$;
revoke execute on function public.create_venue(text, text, text, text) from public, anon;
grant execute on function public.create_venue(text, text, text, text) to authenticated;

create function public.slug_available(p_slug text) returns boolean
language sql stable security definer set search_path = public as $$
  select not exists (select 1 from public.venues where slug = lower(p_slug));
$$;
grant execute on function public.slug_available(text) to anon, authenticated;

create function public.reprice(p_venue uuid, p_percent numeric, p_step int default 1000,
                               p_section uuid default null, p_include_zero boolean default true)
returns int
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if not public.is_member(p_venue, '{owner,manager}') then raise exception 'not allowed'; end if;
  if p_percent < -90 or p_percent > 300 then raise exception 'percent out of range'; end if;
  if p_step < 1 then p_step := 1; end if;
  update public.menu_items set
    price = greatest(0, round(price * (1 + p_percent / 100) / p_step) * p_step),
    zero_price = case when p_include_zero and zero_price is not null
                      then greatest(0, round(zero_price * (1 + p_percent / 100) / p_step) * p_step)
                      else zero_price end
  where venue_id = p_venue and (p_section is null or section_id = p_section);
  get diagnostics n = row_count;
  return n;
end $$;
revoke execute on function public.reprice(uuid, numeric, int, uuid, boolean) from public, anon;
grant execute on function public.reprice(uuid, numeric, int, uuid, boolean) to authenticated;
