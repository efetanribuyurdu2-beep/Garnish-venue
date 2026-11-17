# GARNISH VENUE: project notes

Read this first. It is the hand-off for any new session.

## What this is
The business side of Garnish (the consumer site is the separate repo `TheGarnish`, kept as it is, as the showcase and demo).
A **luxury, interactive QR menu and bar back-office for cocktail bars**, first market Turkey. Each bar's menu is dressed in one of the nine Garnish worlds (later: a world made for that bar).
Proprietary, private repo, no licence.

Why bars pay (research, Nov 2026):
- Law: a printed price list must exist next to any QR menu (Ticaret Bakanlığı, Jul 2026); no charge outside the list. Ingredients/allergens and calories on menus (Tarım ve Orman Bakanlığı: chains from 1 Jul 2026; others: ingredients by 31 Dec 2026, calories by 31 Dec 2027; confirm in the Resmî Gazete).
- Inflation (~32%/yr): prices change often; reprinting menus costs money.
- Guests dislike bad QR menus (PDFs, tiny type, dead links); 60+ guests most of all.
- Competitors (FineDine, Menulux, doXmenu) are generic templates, none bar-first.

## Owner & working style
- The owner writes in **Turkish**. Reply in Turkish. Guest menus are bilingual (TR/EN; more languages later).
- Taste: **luxury**, crafted, never a template look. Every world must feel like a real place.
- Workflow: develop on a branch, push, open a PR; the owner merges on GitHub.
- Verify visually: `npm run build`, `npx next start -p 3200`, Playwright screenshots at 390px and 1280px, every world (`/v/demo?world=<id>`), no console errors, no horizontal overflow.

## Stack
Next.js 16 (App Router) + React 19 + TypeScript, Supabase (Postgres, Auth, RLS) via `@supabase/supabase-js` and `@supabase/ssr`. No UI library, no image files: visuals are hand-written SVG, as in Garnish.

## Map of the code
| Path | What |
| --- | --- |
| `src/lib/types.ts`, `balance.ts`, `themeKit.ts`, `zero.ts`, `src/data/*`, `src/components/glassSvg.tsx`, `Logo.tsx` | **Garnish core**, copied unchanged from `TheGarnish` (211 ingredients, 87 cocktails, 9 worlds, the drink maths, world SVG motifs, glass drawings). Change them in step with the site |
| `src/app/garnish.css` | Ported from the site's `globals.css`: world tokens, base, controls, world UI kit, world menu skins (`.wmenu-<world> .wm-card`) |
| `src/app/globals.css` | This product's own styles: `.venue*` frame, `.gm-*` guest menu, `.gi-*` item page, `.lp-*` product page. Read the world tokens and `--wm-paper/--wm-ink/--wm-soft/--wm-rule` (the menu paper), never hard-code a world's colour |
| `src/domain/types.ts` | Product model: `Venue`, `MenuSection`, `MenuItem` (price in kuruş, `recipe` of core ingredient ids, `zeroPrice`, `extraAllergens`), `PriceChange`, `VenueMenu` |
| `src/lib/allergens.ts` | The 14 declarable allergens (TR Gıda Etiketleme Yön. Ek-1 = EU 1169/2011 Annex II) and which core ingredients/garnishes carry them. Cautious by design; the bar confirms per item |
| `src/lib/facts.ts` | `factsOf(recipe)`: final volume, ABV, grams of alcohol, kcal (estimate), allergens, colour, taste profile; `zeroRecipe()` |
| `src/lib/view.ts` | Server-side view models: all maths runs on the server, the ingredient catalogue never ships to the phone |
| `src/lib/i18n.ts` | `pick`, `t`, `money` (Intl, kuruş), `percent` (%14,8 in TR), `nameLang` |
| `src/lib/venuePage.ts` | Loads a venue for a guest page: language (`?lang=`), world preview (`?world=`, demo venues only) |
| `src/repo/` | Where menus come from: `demo.ts` (Maison Noire `/v/demo`, Sirkeci Meyhanesi `/v/sirkeci`, built from the catalogue), `supabase.ts` (published venues, anon key), `index.ts` chooses |
| `src/components/glassReal.tsx` | **Photographic glassware** (`GlassReal`): each glass is a turned profile (y, radius) → wall thickness, the drink lit as a cylinder, surface ellipse, meniscus, coloured caustic on the counter, real ice (cube/sphere/collins/crushed), bubbles, foam, condensation, Fresnel edges and reflections; world craft etched on top (`Craft`). Covers martini, coupe, Nick&Nora, flute, wine, rocks, highball, copper mug, tiki mug; other vessels fall back to the core `GlassSvg`. No filters, hook-free, server-rendered. Use it everywhere a drink is shown |
| `src/components/GuestMenu.tsx` | Client: sticky bar (section tabs with scroll-spy + "Tercihler"), drinks with server-drawn glass thumbnails (`thumbs` prop), bartender's choice card (`featured`), preferences `<dialog>` sheet (0% only, leave out allergens, large text in localStorage), active-filter pills |
| `src/components/AllergenIcon.tsx` | 14 hand-drawn allergen marks (line icons, currentColor) used in the list, sheet, legend and item page |
| `src/components/ItemDetail.tsx`, `VersionSwitch.tsx`, `ItemSheet.tsx` | A drink: shared body (glass, taste radar, story, label strip), Original/0% switch (client), and the sheet it opens in over the menu |
| `src/components/VenueFrame.tsx`, `Radar.tsx` | World wrapper (`data-world` on a div, wall, language switch, legal notes, "Made with Garnish"); server taste radar |
| `src/app/v/[venue]/page.tsx`, `[item]/page.tsx`, `layout.tsx`, `@modal/(.)[item]` | Guest menu; a drink opened from the menu is intercepted into the `@modal` slot (sheet, back = close, scroll kept); opened directly it is the full `[item]` page |
| `src/components/DrinkPhoto.tsx`, `src/lib/photos.ts`, `src/lib/photoUpload.ts` | Drink photographs: `MenuItem.photo` is shown instead of the glass (list thumb + drink page, credit for stock). `uploadDrinkPhoto()` shrinks in the browser (WebP ≤ 1600 px, average colour) and uploads to `menu-photos/<venue_id>/` |
| `src/data/stockPhotos.ts` | Credited Unsplash photos copied from the site's Cocktail Book; only the demo venue Maison Noire uses them (Sirkeci shows the drawings) |
| `src/lib/supabase/browser.ts` | Browser Supabase client for the panel |
| `supabase/migrations/0001_init.sql`, `0002_photos.sql` | Schema + RLS (see below); photo column + public `menu-photos` bucket (owners/managers write only their venue's folder) |

## Database (supabase/migrations/0001_init.sql)
- `venues` (slug, world, palette, currency, languages, `published`), `venue_members` (owner/manager/staff), `menu_sections`, `menu_items` (`price`/`zero_price` int kuruş, `recipe` jsonb, `extra_allergens`), `price_history`, `venue_tables` (QR token per table).
- RLS: guests (anon) read published venues and their available items only. Owners/managers write. Staff can only mark items sold out, through `set_item_available()`. `price_history` is append-only, written by a trigger on every price change (proof for inspections). Creating a venue makes you its owner (trigger).
- Tested locally against Postgres 16 with stand-ins for `auth.uid()` and the anon/authenticated roles (start one with `initdb` under `/var/tmp` as user postgres).

## Decisions & gotchas
- Calories and alcohol are **estimates** from the recipe and are always shown with "≈" and the footer note; allergens are a starting point the bar confirms. Never present them as lab values.
- The legal footer ("printed menu available from staff", VAT note) is on every guest page.
- Sakura's printed oshinagaki is vertical; the guest menu keeps the paper and hanko but reads across (prices and allergens must be scannable).
- Glass realism: keep it filter-free (no feGaussianBlur/drop-shadow); light comes from gradients so dozens of glasses per page stay cheap. New glass shape → add a profile to `P` in `glassReal.tsx`.
- Caps-only display faces (Syncopate, Ruslan Display, Aboreto): numbers with units use the prose face.
- Turkish uppercase turns i into İ: set `lang="en"` on names that read the same in both languages (`nameLang`).
- `?world=` previews only work on demo venues; a real bar's world comes from the database.

## Roadmap
- **Faz 0 (now)**: foundation, schema, demo guest menu. ✔ first pass
- **Next**: connect Supabase (env + run the migration), seed the demo into it, sign-in, bar panel (menu editor with recipe → automatic allergens/kcal, bulk price change, sold out, price history), printed PDF menu (port `menuPdf`/`/api/menu` from the site), table QR codes.
- **Pilot**: 3 cocktail bars in İstanbul, free.
- **Faz 2**: analytics, more languages, "what's your mood" recommendations, bespoke worlds, subscriptions (iyzico). **Faz 3**: ordering / POS integration, Garnish Passport across bars, venue discovery.
