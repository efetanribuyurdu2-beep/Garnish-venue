-- Local test fixture (never paste into production): a bar whose drinks have 0% versions with different allergens
-- (falernum → orgeat brings tree nuts; sake → 0% white wine brings sulphites). Used by tests/e2e/guest-versions.cjs.
-- docker exec -i supabase_db_garnish-venue psql -U postgres -d postgres < supabase/fixtures/surum-testi.sql
delete from public.venues where slug = 'surum-testi';
with v as (
  insert into public.venues (slug, name, world, languages, published, city)
  values ('surum-testi', 'Sürüm Testi', 'maison', '{tr,en}', true, 'İstanbul') returning id
), s as (
  insert into public.menu_sections (venue_id, title, position)
  select id, '{"tr":"İmzalar","en":"Signatures"}', 0 from v returning id, venue_id
)
insert into public.menu_items (venue_id, section_id, slug, name, description, price, zero_price, kind, recipe, position)
select s.venue_id, s.id, x.slug, x.name::jsonb, x.description::jsonb, x.price, x.zero_price, 'cocktail', x.recipe::jsonb, x.position
from s, (values
  ('chartreuse-swizzle', '{"tr":"Chartreuse Swizzle","en":"Chartreuse Swizzle"}', '{"tr":"Chartreuse · Ananas · Lime · Falernum","en":"Chartreuse · Pineapple · Lime · Falernum"}', 74000, 46000,
   '{"parts":[{"id":"chartreuse","ml":45},{"id":"pineapple","ml":30},{"id":"lime","ml":22},{"id":"falernum","ml":15}],"method":"swizzle","glass":"highball","ice":"crushed","garnish":"mint"}', 0),
  ('sake-highball', '{"tr":"Sake Highball","en":"Sake Highball"}', '{"tr":"Sake · Limon · Soda","en":"Sake · Lemon · Soda"}', 68000, 42000,
   '{"parts":[{"id":"sake","ml":60},{"id":"lemon","ml":15},{"id":"simple","ml":10},{"id":"soda","ml":100}],"method":"build","glass":"highball","ice":"cube","garnish":"lemon-wheel"}', 1),
  ('whiskey-sour', '{"tr":"Whiskey Sour","en":"Whiskey Sour"}', '{"tr":"Bourbon · Limon · Yumurta akı","en":"Bourbon · Lemon · Egg white"}', 70000, 43000,
   '{"parts":[{"id":"bourbon","ml":50},{"id":"lemon","ml":25},{"id":"simple","ml":20},{"id":"egg-white","ml":20}],"method":"dryshake","glass":"rocks","ice":"cube","garnish":"none"}', 2),
  ('daiquiri', '{"tr":"Daiquiri","en":"Daiquiri"}', '{"tr":"Rom · Lime","en":"Rum · Lime"}', 66000, null,
   '{"parts":[{"id":"white-rum","ml":60},{"id":"lime","ml":25},{"id":"simple","ml":15}],"method":"shake","glass":"coupe","ice":"none","garnish":"lime-wheel"}', 3),
  ('martini', '{"tr":"Dry Martini","en":"Dry Martini"}', '{"tr":"Cin · Kuru vermut","en":"Gin · Dry vermouth"}', 82000, null,
   '{"parts":[{"id":"gin","ml":60},{"id":"dry-vermouth","ml":10}],"method":"stir","glass":"martini","ice":"none","garnish":"olive"}', 4)
) as x(slug, name, description, price, zero_price, recipe, position);
select slug, price, zero_price from public.menu_items where venue_id = (select id from public.venues where slug = 'surum-testi') order by position;
