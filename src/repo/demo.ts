/**
 * The nine world bars of Garnish, as demo venues: each with its own name,
 * collection of signatures, the classics that suit it, its alcohol-free list,
 * prices in its own register and (where the Garnish Cocktail Book has one) a
 * credited photograph. They are the sales demo and the starting menu a new bar
 * can take (worldStarter). `/v/demo?world=<id>` opens the world's bar.
 */
import { COCKTAILS, cocktailById } from "@/data/cocktails";
import { ingredientById } from "@/data/ingredients";
import { STOCK_PHOTOS } from "@/data/stockPhotos";
import { WORLDS, worldById } from "@/data/worlds";
import type { MenuItem, MenuSection, Photo, Venue, VenueMenu } from "@/domain/types";
import { analyse } from "@/lib/balance";
import type { Cocktail, L, WorldId } from "@/lib/types";
import { HEAD } from "@/lib/worldMenu";
import { isZeroCocktail } from "@/lib/zero";

const l = (tr: string, en: string): L => ({ tr, en });

/** the demo bar's address per world */
export const DEMO_SLUG: Record<WorldId, string> = {
  maison: "le-grand-bar",
  anatolia: "garnish-meyhanesi",
  cosmos: "orbital-lounge",
  jazz: "the-blind-tiger",
  sakura: "bar-hanami",
  alchemist: "the-apothecary",
  tiki: "the-lagoon-hut",
  boreal: "aurora-hall",
  riviera: "la-cave-riviera",
};

/** the classics each world would pour, in its order */
const CLASSICS: Record<WorldId, string[]> = {
  maison: ["martini", "manhattan", "sidecar", "french-75", "negroni", "espresso-martini"],
  anatolia: ["negroni", "whiskey-sour", "margarita", "moscow-mule", "americano", "paloma"],
  cosmos: ["espresso-martini", "margarita", "gimlet", "french-75", "paloma"],
  jazz: ["sidecar", "manhattan", "old-fashioned", "tom-collins", "martini", "whiskey-sour"],
  sakura: ["martini", "gimlet", "daiquiri", "old-fashioned", "paloma"],
  alchemist: ["negroni", "boulevardier", "martini", "americano", "old-fashioned"],
  tiki: ["daiquiri", "mojito", "margarita", "moscow-mule", "paloma"],
  boreal: ["moscow-mule", "martini", "old-fashioned", "whiskey-sour", "gimlet"],
  riviera: ["aperol-spritz", "americano", "negroni", "french-75", "tom-collins"],
};
const ZERO_CLASSICS: Record<WorldId, string[]> = {
  maison: ["shirley-temple"], anatolia: ["pussyfoot"], cosmos: ["lime-rickey"], jazz: ["pussyfoot"], sakura: ["lime-rickey"],
  alchemist: ["shirley-temple"], tiki: ["pussyfoot"], boreal: ["lime-rickey"], riviera: ["shirley-temple"],
};

/** price register per world (₺, signature cocktail) */
const BASE: Record<WorldId, number> = { maison: 820, anatolia: 620, cosmos: 720, jazz: 700, sakura: 760, alchemist: 740, tiki: 680, boreal: 660, riviera: 640 };
const r10 = (n: number) => Math.round(n / 10) * 10;
export function suggestedPrice(world: WorldId, c: Cocktail, signature: boolean) {
  if (isZeroCocktail(c)) return r10(BASE[world] * 0.55);
  const abv = analyse(c.parts, c.method).abv;
  return r10(BASE[world] + (signature ? 40 : 0) + (abv > 0.24 ? 40 : abv < 0.1 ? -40 : 0));
}

export function describe(parts: { id: string; ml: number }[]): L {
  const names = parts.filter((p) => p.ml >= 5).slice(0, 4).map((p) => ingredientById(p.id)?.name ?? l(p.id, p.id));
  return { tr: names.map((n) => n.tr).join(" · "), en: names.map((n) => n.en).join(" · ") };
}

export function stockPhoto(id: string): Photo | undefined {
  const p = STOCK_PHOTOS[id];
  return p && { url: p.url, alt: p.alt, color: p.color, credit: { author: p.author, authorUrl: p.authorUrl, sourceUrl: p.photoUrl, source: "unsplash" } };
}

/** The world's own menu: sections and drinks, ready to price and pour. */
export function worldStarter(world: WorldId) {
  const w = worldById(world);
  const signatures = COCKTAILS.filter((c) => c.world === world);
  const sigBooze = signatures.filter((c) => !isZeroCocktail(c));
  const zero = [...signatures.filter(isZeroCocktail), ...ZERO_CLASSICS[world].map((id) => cocktailById(id)!).filter(Boolean)];
  const classics = CLASSICS[world].map((id) => cocktailById(id)!).filter(Boolean);
  const sections: { key: string; title: L; note?: L; drinks: { c: Cocktail; signature: boolean }[] }[] = [
    { key: "sig", title: w.collection, note: l("Barmenimizin imzaları", "Our bartenders' signatures"), drinks: sigBooze.map((c) => ({ c, signature: true })) },
    { key: "classic", title: l("Klasikler", "The Classics"), drinks: classics.map((c) => ({ c, signature: false })) },
    { key: "zero", title: l("Alkolsüz", "Zero Proof"), note: l("İmza kokteyllerimiz alkolsüz de hazırlanabilir", "Our signatures can also be made alcohol-free"), drinks: zero.map((c) => ({ c, signature: true })) },
  ];
  return sections.filter((s) => s.drinks.length);
}

function demoVenue(world: WorldId): VenueMenu {
  const w = worldById(world);
  const id = `demo-${world}`;
  const venue: Venue = {
    id,
    slug: DEMO_SLUG[world],
    name: w.bar.tr,
    tagline: HEAD[world].kicker,
    city: "İstanbul",
    world,
    palette: "noir",
    currency: "TRY",
    languages: ["tr", "en"],
    footer: HEAD[world].foot,
    serviceNote: l("Fiyatlara KDV dahildir. Servis ücreti alınmaz.", "Prices include VAT. No service charge."),
  };
  const starter = worldStarter(world);
  const sections: MenuSection[] = starter.map((s, position) => ({ id: `${id}-${s.key}`, venueId: id, title: s.title, ...(s.note ? { note: s.note } : {}), position }));
  let position = 0;
  const items: MenuItem[] = starter.flatMap((s) =>
    s.drinks.map(({ c, signature }, i) => {
      const price = suggestedPrice(world, c, signature);
      const photo = stockPhoto(c.id);
      return {
        id: `${id}-${c.id}`,
        venueId: id,
        sectionId: `${id}-${s.key}`,
        slug: c.id,
        name: c.name,
        description: describe(c.parts),
        story: c.story,
        price: price * 100,
        ...(s.key === "sig" && !isZeroCocktail(c) && i < 3 ? { zeroPrice: r10(price * 0.62) * 100 } : {}),
        recipe: { parts: c.parts, method: c.method, glass: c.glass, ice: c.ice, garnish: c.garnish },
        available: true,
        featured: s.key === "sig" && i === 0,
        libraryId: c.id,
        ...(photo ? { photo } : {}),
        position: position++,
      };
    }),
  );
  return { venue, sections, items };
}

export const DEMO_MENUS: VenueMenu[] = WORLDS.map((w) => demoVenue(w.id));
const BY_SLUG = new Map(DEMO_MENUS.map((m) => [m.venue.slug, m]));
/** older demo addresses keep working */
const ALIASES: Record<string, string> = { demo: DEMO_SLUG.maison, sirkeci: DEMO_SLUG.anatolia };

export const demoBySlug = (slug: string) => BY_SLUG.get(ALIASES[slug] ?? slug);
export const demoForWorld = (world: WorldId) => BY_SLUG.get(DEMO_SLUG[world])!;
export const isDemoSlug = (slug: string) => BY_SLUG.has(slug) || slug in ALIASES;
