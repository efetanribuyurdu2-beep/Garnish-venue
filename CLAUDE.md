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
| `src/repo/` | Where menus come from: `demo.ts` (the **nine world bars** from Garnish: Le Grand Bar `/v/le-grand-bar`, Garnish Meyhanesi, Orbital Lounge, The Blind Tiger, Bar Hanami, The Apothecary, The Lagoon Hut, Aurora Hall, La Cave Riviera; each = world collection + `CLASSICS[world]` + alcohol-free + `SIMPLE[world]` (wine, spirits, beer, food); `/v/demo?world=<id>` opens one, `demo`/`sirkeci` are aliases; `worldStarter()` and `suggestedPrice()` also seed new bars), `supabase.ts` (published venues, anon key), `index.ts` chooses |
| `src/lib/worldMenu.ts` | The world's menu language (from the site's WorldMenu): `MARK` (No. I · Arabic-Indic · star coordinates · proof · kanji · planet signs · mana dots · ❄ degrees · vintage), `HEAD` kicker/foot/markNote, `JA` names and `JA_SECTIONS` for Sakura's oshinagaki |
| `src/components/WorldBackdrop.tsx`, `src/app/backdrops.css` | Ported from Garnish (backdrop CSS extracted by script). Venue overrides in globals.css: no live blur (aurora, Cosmos glass) so every world scrolls at 60 fps |
| `src/lib/moods.ts`, `src/components/Recommender.tsx` | "Bana bir içki öner": six moods as targets in the 6-axis taste space, weighted distance → the three best cocktails on this bar's menu (0% only when asked) |
| `src/lib/itemLook.ts`, `src/components/ItemVisual.tsx`, `FoodPlate.tsx` | **More than cocktails**: `MenuItem.kind` (cocktail · wine · beer · spirit · food · other), `details` (style, abv, volume, serving, kcal, origin, `alt` second size + price). `STYLES` gives each style its glass, colour and defaults; `itemFacts()` (facts.ts) estimates kcal for drinks; food is drawn on a plate. Recipes are for cocktails only |
| `src/components/glassReal.tsx` | **Photographic glassware** (`GlassReal`): each glass is a turned profile (y, radius) → wall thickness, the drink lit as a cylinder, surface ellipse, meniscus, coloured caustic on the counter, real ice (cube/sphere/collins/crushed), bubbles, foam, condensation, Fresnel edges and reflections; world craft etched on top (`Craft`). Covers martini, coupe, Nick&Nora, flute, wine, rocks, highball, copper mug, tiki mug; other vessels fall back to the core `GlassSvg`. No filters, hook-free, server-rendered. Use it everywhere a drink is shown |
| `src/components/GuestMenu.tsx` | Client: sticky bar (section tabs with scroll-spy + "Tercihler"), drinks with server-drawn glass thumbnails (`thumbs` prop), bartender's choice card (`featured`), preferences `<dialog>` sheet (0% only, leave out allergens, large text in localStorage), active-filter pills |
| `src/components/AllergenIcon.tsx` | 14 hand-drawn allergen marks (line icons, currentColor) used in the list, sheet, legend and item page |
| `src/components/ItemDetail.tsx`, `VersionSwitch.tsx`, `ItemSheet.tsx` | A drink: shared body (glass, taste radar, story, label strip), Original/0% switch (client), and the sheet it opens in over the menu |
| `src/components/VenueFrame.tsx`, `Radar.tsx` | World wrapper (`data-world` on a div, wall, language switch, legal notes, "Made with Garnish"); server taste radar |
| `src/app/v/[venue]/page.tsx`, `[item]/page.tsx`, `layout.tsx`, `@modal/(.)[item]` | Guest menu; a drink opened from the menu is intercepted into the `@modal` slot (sheet, back = close, scroll kept); opened directly it is the full `[item]` page |
| `src/components/DrinkPhoto.tsx`, `src/lib/photos.ts`, `src/lib/photoUpload.ts` | Drink photographs: `MenuItem.photo` is shown instead of the glass (list thumb + drink page, credit for stock). `uploadDrinkPhoto()` shrinks in the browser (WebP ≤ 1600 px, average colour) and uploads to `menu-photos/<venue_id>/` |
| `src/data/stockPhotos.ts` | Credited Unsplash photos copied from the site's Cocktail Book; only the demo venue Maison Noire uses them (Sirkeci shows the drawings) |
| `src/app/page.tsx`, `src/components/LandingPhone.tsx` | Product page: live demo menu in a drawn phone (iframe of `/v/demo`, nine world buttons re-dress it), why now (legal timeline), three steps, features, world portals, pilot (`NEXT_PUBLIC_CONTACT_URL`, else "Başvurular yakında") |
| `src/lib/supabase/browser.ts`, `rows.ts` | Browser Supabase client; database rows ↔ product model (`venueFrom/To`, `itemFrom/To`, `sectionFrom`), shared by guest reads and the panel |
| `src/app/panel/*`, `src/components/panel/*`, `src/lib/panel/*` | **Bar panel** (Turkish, Maison noir, client-side with the member's session; RLS decides). `/panel/giris` email+password; `/panel` my venues + create (slug check, world); `/panel/[venue]` tabs Menü (sections, starters, order, sold-out toggle) · Fiyatlar (bulk % with rounding + preview via `reprice()`, every price inline) · Ayarlar (identity, world, palette, languages, notes, publish) · Fiyat geçmişi; `/panel/[venue]/icki/[item]` editor (`yeni` = new): start from the Garnish library, recipe rows → live preview (glass, ABV, kcal, allergens, 0% version), extra allergens, photo upload. Staff see only the menu tab and the sold-out toggle |
| `src/app/yazdir/[venue]/page.tsx`, `qr/page.tsx`, `print.css`, `src/components/PrintBar.tsx`, `src/components/panel/PrintTab.tsx`, `src/lib/qr.ts`, `siteUrl.ts` | **Printed price list** (A4 print page, vector, "Yazdır · PDF kaydet" = `window.print()`): every drink with price and 0% price, full ingredients, ABV, kcal, volume, allergen icons, allergen key, legal notes, "prices valid from <date>", QR to the live menu; world colours or `?kagit=acik` (light paper), `?lang=en`; more than 12 drinks → two tighter columns so a usual menu fits one page. **Table cards** (`/qr?masa=N`, `?numara=yok` for one card without a number): four A6 cards per A4 with cut lines, QR → `/v/<slug>?masa=N`. Both read the published menu; the panel tab "Basılı menü & QR" links to them. Checked by rendering Chromium PDFs and decoding the QR codes (jsQR) |
| `supabase/migrations/0001_init.sql`, `0002_photos.sql`, `0003_panel.sql`, `0004_more_than_cocktails.sql` | Schema + RLS (see below); photo column + public `menu-photos` bucket; panel RPCs `create_venue`, `slug_available`, `reprice`; 0004 `kind`, `details`, recipe nullable (cocktails must keep one) |
| `supabase/setup.sql` | 0001 + 0002 in one file, as the owner pasted it into the production SQL Editor (Nov 2026). Later migrations are pasted one by one |

## Database (supabase/migrations/0001_init.sql)
- `venues` (slug, world, palette, currency, languages, `published`), `venue_members` (owner/manager/staff), `menu_sections`, `menu_items` (`price`/`zero_price` int kuruş, `recipe` jsonb, `extra_allergens`), `price_history`, `venue_tables` (QR token per table).
- RLS: guests (anon) read published venues and their available items only. Owners/managers write. Staff can only mark items sold out, through `set_item_available()`. `price_history` is append-only, written by a trigger on every price change (proof for inspections). Creating a venue makes you its owner (trigger).
- Production: Supabase project `baqwlixdkgsvanhzrowi` (West EU, Ireland). There is no management token in the session: the owner applies migrations by pasting the file into **SQL Editor → Run**. Applied: `setup.sql` (0001+0002), 0003. **0004 must be pasted before the panel saves wine/food.** Keep new migrations self-contained and idempotent-safe to paste.
- **Local Supabase for development** (`supabase/config.toml`, CLI in `/var/tmp/sbcli`, `npm i supabase`): start Docker with `dockerd &`; public.ecr.aws and Docker Hub are blocked or rate-limited here, so pull the images the CLI wants from `mirror.gcr.io/<image>` and `docker tag` them as `docker.io/<image>`; the kernel has no IPv6, so Realtime cannot start: build a stub `docker.io/supabase/realtime:<tag>` whose `/app/bin/*` scripts exit 0. Then `SUPABASE_INTERNAL_IMAGE_REGISTRY=docker.io supabase start -x studio,imgproxy,vector,logflare,edge-runtime,supavisor,postgres-meta,realtime`, put the printed URL and anon key in `.env.local`, build, and drive the panel with Playwright (sign-up needs no email locally).

## Decisions & gotchas
- Calories and alcohol are **estimates** from the recipe and are always shown with "≈" and the footer note; allergens are a starting point the bar confirms. Never present them as lab values.
- The legal footer ("printed menu available from staff", VAT note) is on every guest page.
- Sakura's printed oshinagaki is vertical; the guest menu keeps the paper and hanko but reads across (prices and allergens must be scannable).
- Glass realism: keep it filter-free (no feGaussianBlur/drop-shadow); light comes from gradients so dozens of glasses per page stay cheap. New glass shape → add a profile to `P` in `glassReal.tsx`.
- Caps-only display faces (Syncopate, Ruslan Display, Aboreto): numbers with units use the prose face.
- Turkish uppercase turns i into İ: names that read the same in both languages get `nameLang()` = `brandLang()`: Turkish letters → `tr` (KALECİK), otherwise `en` (NEGRONI, MAISON). Kickers too.
- Prices use `currencyDisplay: "narrowSymbol"`: en-GB would print "TRY 760" (and overflowed Sakura's EN menu).
- Print: Chrome does not repeat a fixed frame cleanly across printed pages, so the frame is screen-only; the A4 width (794 px) would trip phone media queries, so those are `screen and (…)`.
- `?world=` previews only work on demo venues; a real bar's world comes from the database.

## Roadmap
- **Faz 0**: foundation, schema, demo guest menu, realistic glasses, photos, product page, bar panel. ✔
- Production wired (Nov 2026): https://garnish-venue.vercel.app, Vercel ↔ Supabase integration, 0003 applied, email sign-in on with confirmation off (pilot).
- Nov 2026 overhaul ("no world has a menu"): world bars and menu language, start a bar with its world's menu, backdrops, suggest-a-drink, wine/beer/spirits/food. Smoke: 80 page×size checks, panel flows end to end.
- **Next**: staff invitations, a draft preview for unpublished menus, custom SMTP (Resend) before real customers, analytics from `?masa=`.
- **Pilot**: 3 cocktail bars in İstanbul, free.
- **Faz 2**: analytics, more languages, "what's your mood" recommendations, bespoke worlds, subscriptions (iyzico). **Faz 3**: ordering / POS integration, Garnish Passport across bars, venue discovery.
