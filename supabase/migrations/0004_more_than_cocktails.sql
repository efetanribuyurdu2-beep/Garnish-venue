-- Garnish Venue · menus hold more than cocktails
-- Wine, beer, spirits, food and other drinks sit beside the cocktails:
--   kind    what the line is (cocktail by default, so existing rows are unchanged)
--   details for non-cocktails: style, abv, volume, serving, kcal, origin, a second size and price
--   recipe  only cocktails have one now
-- Safe to run more than once.

alter table public.menu_items add column if not exists kind text not null default 'cocktail';
alter table public.menu_items drop constraint if exists menu_items_kind_check;
alter table public.menu_items add constraint menu_items_kind_check
  check (kind in ('cocktail', 'wine', 'beer', 'spirit', 'food', 'other'));
alter table public.menu_items add column if not exists details jsonb;
alter table public.menu_items alter column recipe drop not null;
alter table public.menu_items drop constraint if exists menu_items_recipe_for_cocktails;
alter table public.menu_items add constraint menu_items_recipe_for_cocktails
  check (kind <> 'cocktail' or recipe is not null);
