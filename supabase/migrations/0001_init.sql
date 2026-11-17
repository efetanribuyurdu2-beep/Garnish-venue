-- Garnish Venue · initial schema
-- Venues (bars), their members, menus, items, price history and tables.
-- Guests read published menus with the anon key; everything else needs a
-- signed-in member of the venue. Prices are integers in the smallest unit (kuruş).

create extension if not exists pgcrypto;

-- ───────────────────────────────────────────── venues
create table public.venues (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,40}$'),
  name         text not null,
  tagline      jsonb not null default '{"tr":"","en":""}',
  city         text not null default '',
  world        text not null default 'maison'
               check (world in ('maison','anatolia','cosmos','jazz','sakura','alchemist','tiki','boreal','riviera')),
  palette      text check (palette in ('noir','midnight','bordeaux')),
  currency     text not null default 'TRY' check (currency in ('TRY','EUR','USD')),
  languages    text[] not null default '{tr,en}',
  footer       jsonb,
  service_note jsonb,
  instagram    text,
  published    boolean not null default false,
  created_at   timestamptz not null default now()
);

-- ───────────────────────────────────────────── who runs a venue
create type public.venue_role as enum ('owner', 'manager', 'staff');

create table public.venue_members (
  venue_id   uuid not null references public.venues on delete cascade,
  user_id    uuid not null references auth.users on delete cascade,
  role       public.venue_role not null default 'staff',
  created_at timestamptz not null default now(),
  primary key (venue_id, user_id)
);

-- membership checks used by every policy (security definer: no recursion through RLS)
create function public.is_member(v uuid, roles public.venue_role[] default '{owner,manager,staff}')
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.venue_members m
    where m.venue_id = v and m.user_id = auth.uid() and m.role = any(roles)
  );
$$;

-- whoever creates a venue becomes its owner
create function public.venue_add_owner() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null then
    insert into public.venue_members (venue_id, user_id, role) values (new.id, auth.uid(), 'owner');
  end if;
  return new;
end $$;
create trigger venues_owner after insert on public.venues
  for each row execute function public.venue_add_owner();

-- ───────────────────────────────────────────── menu
create table public.menu_sections (
  id         uuid primary key default gen_random_uuid(),
  venue_id   uuid not null references public.venues on delete cascade,
  title      jsonb not null,
  note       jsonb,
  position   int not null default 0
);
create index on public.menu_sections (venue_id, position);

create table public.menu_items (
  id              uuid primary key default gen_random_uuid(),
  venue_id        uuid not null references public.venues on delete cascade,
  section_id      uuid not null references public.menu_sections on delete cascade,
  slug            text not null check (slug ~ '^[a-z0-9][a-z0-9-]{0,60}$'),
  name            jsonb not null,
  description     jsonb not null default '{"tr":"","en":""}',
  story           jsonb,
  price           int not null check (price >= 0),
  zero_price      int check (zero_price >= 0),
  -- { parts: [{id, ml, top?}], method, glass, ice, garnish } — ids from the Garnish ingredient catalogue
  recipe          jsonb not null,
  extra_allergens text[] not null default '{}',
  available       boolean not null default true,
  featured        boolean not null default false,
  library_id      text,
  position        int not null default 0,
  updated_at      timestamptz not null default now(),
  unique (venue_id, slug)
);
create index on public.menu_items (venue_id, position);

-- ───────────────────────────────────────────── price history (proof for inspections)
create table public.price_history (
  id         bigint generated always as identity primary key,
  item_id    uuid not null references public.menu_items on delete cascade,
  venue_id   uuid not null references public.venues on delete cascade,
  field      text not null check (field in ('price','zero_price')),
  old_price  int,
  new_price  int,
  changed_at timestamptz not null default now(),
  changed_by uuid default auth.uid()
);
create index on public.price_history (venue_id, changed_at desc);

create function public.menu_items_price_log() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into public.price_history (item_id, venue_id, field, old_price, new_price)
      values (new.id, new.venue_id, 'price', null, new.price);
  else
    if new.price is distinct from old.price then
      insert into public.price_history (item_id, venue_id, field, old_price, new_price)
        values (new.id, new.venue_id, 'price', old.price, new.price);
    end if;
    if new.zero_price is distinct from old.zero_price then
      insert into public.price_history (item_id, venue_id, field, old_price, new_price)
        values (new.id, new.venue_id, 'zero_price', old.zero_price, new.zero_price);
    end if;
    new.updated_at = now();
  end if;
  return new;
end $$;
create trigger menu_items_price_ins after insert on public.menu_items
  for each row execute function public.menu_items_price_log();
create trigger menu_items_price_upd before update on public.menu_items
  for each row execute function public.menu_items_price_log();

-- ───────────────────────────────────────────── tables (one QR each)
create table public.venue_tables (
  id       uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues on delete cascade,
  label    text not null,
  token    text not null unique default encode(gen_random_bytes(6), 'hex'),
  unique (venue_id, label)
);

-- ───────────────────────────────────────────── row-level security
alter table public.venues         enable row level security;
alter table public.venue_members  enable row level security;
alter table public.menu_sections  enable row level security;
alter table public.menu_items     enable row level security;
alter table public.price_history  enable row level security;
alter table public.venue_tables   enable row level security;

-- venues: guests see published ones, members see their own
create policy venues_read on public.venues for select
  using (published or public.is_member(id));
create policy venues_create on public.venues for insert to authenticated
  with check (true);
create policy venues_edit on public.venues for update
  using (public.is_member(id, '{owner,manager}')) with check (public.is_member(id, '{owner,manager}'));
create policy venues_delete on public.venues for delete
  using (public.is_member(id, '{owner}'));

-- members: you see the team of venues you belong to; owners manage it
create policy members_read on public.venue_members for select
  using (public.is_member(venue_id));
create policy members_manage on public.venue_members for all
  using (public.is_member(venue_id, '{owner}')) with check (public.is_member(venue_id, '{owner}'));

-- sections: public when the venue is published
create policy sections_read on public.menu_sections for select
  using (exists (select 1 from public.venues v where v.id = venue_id and v.published) or public.is_member(venue_id));
create policy sections_write on public.menu_sections for all
  using (public.is_member(venue_id, '{owner,manager}')) with check (public.is_member(venue_id, '{owner,manager}'));

-- items: guests see available items of published venues; staff can mark sold out
create policy items_read on public.menu_items for select
  using ((available and exists (select 1 from public.venues v where v.id = venue_id and v.published)) or public.is_member(venue_id));
create policy items_write on public.menu_items for all
  using (public.is_member(venue_id, '{owner,manager}')) with check (public.is_member(venue_id, '{owner,manager}'));

-- staff may only mark an item sold out / back on: through this function, not a table policy
create function public.set_item_available(item uuid, is_available boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  update public.menu_items set available = is_available
  where id = item and public.is_member(venue_id);
  if not found then raise exception 'not allowed'; end if;
end $$;
revoke execute on function public.set_item_available(uuid, boolean) from public, anon;
grant execute on function public.set_item_available(uuid, boolean) to authenticated;

-- price history: members read; only the trigger writes
create policy prices_read on public.price_history for select
  using (public.is_member(venue_id));

-- tables: members only (guests reach the menu through the venue slug)
create policy tables_read on public.venue_tables for select using (public.is_member(venue_id));
create policy tables_write on public.venue_tables for all
  using (public.is_member(venue_id, '{owner,manager}')) with check (public.is_member(venue_id, '{owner,manager}'));

-- price history is append-only, even for owners
revoke insert, update, delete on public.price_history from anon, authenticated;
