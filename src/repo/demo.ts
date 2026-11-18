/**
 * The nine world bars of Garnish, as demo venues: each with its own name,
 * collection of signatures, the classics that suit it, its alcohol-free list,
 * prices in its own register and a credited photograph (the Garnish Cocktail
 * Book's, or an illustrative look-alike from signaturePhotos.ts). They are the
 * sales demo and the starting menu a new bar can take (worldStarter). `/v/demo?world=<id>` opens the world's bar.
 */
import { COCKTAILS, cocktailById } from "@/data/cocktails";
import { ingredientById } from "@/data/ingredients";
import { SIGNATURE_PHOTOS } from "@/data/signaturePhotos";
import { STOCK_PHOTOS } from "@/data/stockPhotos";
import { REGISTER, libItemFields, libraryById, type LibItem } from "@/data/kitchen";
import { WORLDS, worldById } from "@/data/worlds";
import type { MenuItem, MenuSection, Photo, Venue, VenueMenu } from "@/domain/types";
import { analyse } from "@/lib/balance";
import type { Cocktail, L, WorldId } from "@/lib/types";
import { illustrativePhoto } from "@/lib/photos";
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

type Extra = string | [id: string, over: { name?: L; desc?: L }] | LibItem;
const own = (x: Omit<LibItem, "serving"> & { serving?: L }): LibItem => ({ serving: l("Porsiyon", "Portion"), ...x });

/** beside the cocktails, what each world's bar also pours and serves: library ids, renamed lines and a few of its own */
const EXTRAS: Record<WorldId, { key: string; title: L; items: Extra[] }[]> = {
  maison: [
    { key: "cellar", title: l("Şampanya & Mahzen", "Champagne & Cellar"), items: ["champagne-brut", "chablis", "pinot-noir", "konyak"] },
    { key: "kitchen", title: l("Küçük Tabaklar", "Small Plates"), items: ["istiridye", "truf-patates", "peynir-tabagi", "creme-brulee", "espresso"] },
  ],
  anatolia: [
    { key: "cellar", title: l("Rakı & Şarap", "Rakı & Wine"), items: ["raki", "narince", "okuzgozu", "bogazkere"] },
    { key: "meze", title: l("Soğuk Mezeler", "Cold Meze"), items: ["haydari", "acili-ezme", "fava", "muhammara", "girit-ezmesi", "deniz-borulcesi", "peynir-kavun", "lakerda"] },
    { key: "hot", title: l("Ara Sıcaklar & Tatlı", "Hot Meze & Sweets"), items: ["sigara-boregi", "kalamar-tava", "arnavut-cigeri", "karides-guvec", "baklava", "turk-kahvesi"] },
  ],
  cosmos: [
    { key: "cellar", title: l("Yakıt İstasyonu", "Fuel Station"), items: [["ipa", { name: l("Nebula IPA", "Nebula IPA") }], "japon-viskisi", "tekila"] },
    {
      key: "kitchen",
      title: l("Yörünge Tabakları", "Orbit Plates"),
      items: ["edamame", "karaage", "gyoza", own({ id: "kuyruklu-cips", kind: "food", style: "snack", dish: "fries", name: l("Kuyruklu Yıldız Cipsi", "Comet Crisps"), desc: l("Mor patates, karabiber", "Purple potato, black pepper"), price: 240, kcal: 430, allergens: [] }), "matcha-cheesecake"],
    },
  ],
  jazz: [
    { key: "cellar", title: l("Viski Rafı", "The Whisky Shelf"), items: ["bourbon", "rye", "single-malt", "islay"] },
    { key: "kitchen", title: l("Bar Atıştırmalıkları", "Bar Bites"), items: ["tuzlu-fistik", "sliders", "patates", "fondan", "espresso"] },
  ],
  sakura: [
    { key: "cellar", title: l("Sake & Viski", "Sake & Whisky"), items: ["sake", "japon-viskisi"] },
    { key: "kitchen", title: l("Izakaya", "Izakaya"), items: ["edamame", "karaage", "gyoza", "matcha-cheesecake", "sencha"] },
  ],
  alchemist: [
    {
      key: "cellar",
      title: l("Kabine", "The Cabinet"),
      items: ["absinthe", own({ id: "chartreuse-v", kind: "spirit", style: "liqueur", name: l("Yeşil Chartreuse", "Green Chartreuse"), desc: l("130 bitki, keşiş tarifi", "130 herbs, the monks' recipe"), origin: l("Fransa", "France"), serving: l("4 cl", "4 cl"), price: 620, abv: 55, allergens: [] }), "amaro", "konyak"],
    },
    { key: "kitchen", title: l("Simyacının Masası", "The Alchemist's Table"), items: [["peynir-tabagi", { name: l("Simyacının Peyniri", "The Alchemist's Cheese") }], "sarkuteri", "creme-brulee", "bitki-cayi"] },
  ],
  tiki: [
    { key: "cellar", title: l("Rom Mahzeni", "The Rum Cellar"), items: ["yillanmis-rom", "hindistan-cevizi-suyu"] },
    {
      key: "kitchen",
      title: l("Ada Tabakları", "Island Plates"),
      items: [own({ id: "muz-cips", kind: "food", style: "snack", dish: "fries", name: l("Muz Cipsi", "Plantain Chips"), desc: l("Lime, tuz", "Lime, salt"), price: 200, kcal: 380, allergens: [] }), "tavuk-sis", "nachos", "sorbe"],
    },
  ],
  boreal: [
    { key: "cellar", title: l("Votka & Bira", "Vodka & Beer"), items: ["votka", "stout", "pilsner"] },
    { key: "kitchen", title: l("Zakuski", "Zakuski"), items: ["ringa", "somon", "kuruyemis", "tarcinli-corek"] },
  ],
  riviera: [
    { key: "cellar", title: l("Mahzen", "The Cellar"), items: ["prosecco", "provence-rose", "chianti", "limoncello"] },
    { key: "kitchen", title: l("Bahçe Masası", "Garden Table"), items: ["burrata", "bruschetta", "focaccia", "zeytin", "tiramisu"] },
  ],
};

/** the world's kitchen & cellar sections, each line as menu fields priced for the world */
export function worldExtras(world: WorldId) {
  return EXTRAS[world].map((sec) => ({
    key: sec.key,
    title: sec.title,
    items: sec.items.map((e) => {
      const [x, over] = typeof e === "string" ? [libraryById(e), {}] : Array.isArray(e) ? [libraryById(e[0]), e[1]] : [e, {}];
      if (!x) throw new Error(`unknown library line ${String(e)}`);
      return { slug: x.id, ...libItemFields(x, world, over) };
    }),
  }));
}

/** price register per world (₺, signature cocktail) */
const BASE = REGISTER;
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
  if (p) return { url: p.url, alt: p.alt, color: p.color, credit: { author: p.author, authorUrl: p.authorUrl, sourceUrl: p.photoUrl, source: "unsplash" } };
  // a look-alike for a drink no one has photographed: shown, and labelled, as illustrative
  const s = SIGNATURE_PHOTOS[id];
  const name = cocktailById(id)?.name;
  return s && name ? illustrativePhoto(s, name) : undefined;
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
  const extras = worldExtras(world);
  const sections: MenuSection[] = [...starter, ...extras].map((t, position) => ({
    id: `${id}-${t.key}`,
    venueId: id,
    title: t.title,
    ...("note" in t && t.note ? { note: t.note } : {}),
    position,
  }));
  let position = 0;
  const moreItems: MenuItem[] = extras.flatMap((sec) =>
    sec.items.map((x) => ({
      ...x,
      id: `${id}-${x.slug}`,
      venueId: id,
      sectionId: `${id}-${sec.key}`,
      available: true,
      position: 100 + position++,
    })),
  );
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
  return { venue, sections, items: [...items, ...moreItems] };
}

export const DEMO_MENUS: VenueMenu[] = WORLDS.map((w) => demoVenue(w.id));
const BY_SLUG = new Map(DEMO_MENUS.map((m) => [m.venue.slug, m]));
/** older demo addresses keep working */
const ALIASES: Record<string, string> = { demo: DEMO_SLUG.maison, sirkeci: DEMO_SLUG.anatolia };

export const demoBySlug = (slug: string) => BY_SLUG.get(ALIASES[slug] ?? slug);
export const demoForWorld = (world: WorldId) => BY_SLUG.get(DEMO_SLUG[world])!;
export const isDemoSlug = (slug: string) => BY_SLUG.has(slug) || slug in ALIASES;

/** the demo bars before and after this one, for moving between worlds */
export function demoNeighbours(slug: string) {
  const list = DEMO_MENUS.map((m) => ({ slug: m.venue.slug, name: m.venue.name, world: m.venue.world }));
  const real = ALIASES[slug] ?? slug;
  const i = list.findIndex((x) => x.slug === real);
  if (i < 0) return undefined;
  return { prev: list[(i + list.length - 1) % list.length], next: list[(i + 1) % list.length] };
}
