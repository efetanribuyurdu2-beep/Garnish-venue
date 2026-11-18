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

/** beside the cocktails, what each world's bar also pours and serves: library ids, renamed lines and a few of its own.
 *  Every world has the same frame: cellar, beer, cold plates, hot plates, desserts, soft drinks. */
const H = (tr: string, en: string) => l(tr, en);
const NOTE = { cold: H("Soğuk tabaklar", "Cold plates"), hot: H("Sıcak tabaklar", "Hot plates"), sweet: H("Tatlılar", "Desserts"), soft: H("Alkolsüz içecekler", "Soft drinks") };
const EXTRAS: Record<WorldId, { key: string; title: L; note?: L; items: Extra[] }[]> = {
  maison: [
    { key: "cellar", title: H("Şampanya & Mahzen", "Champagne & Cellar"), items: ["champagne-brut", "chablis", "pinot-noir", "konyak"] },
    { key: "beer", title: H("Biralar", "Beers"), items: ["belcika-tripel", "pilsner", "alkolsuz-bira"] },
    { key: "cold", title: H("Soğuk Tabaklar", "Cold Plates"), items: ["istiridye", "havyar", "dana-tartar", "carpaccio", "peynir-tabagi"] },
    { key: "hot", title: H("Sıcak Tabaklar", "Hot Plates"), items: ["gougeres", "escargot", "croque-monsieur", "truf-patates"] },
    { key: "sweet", title: H("Tatlılar", "Desserts"), items: ["creme-brulee", "cikolatali-mus", "macaron"] },
    { key: "soft", title: H("Kahve, Çay & Soft", "Coffee, Tea & Soft Drinks"), items: ["espresso", "murver-gazozu", "limonata", "maden-suyu"] },
  ],
  anatolia: [
    { key: "cellar", title: H("Rakı & Şarap", "Rakı & Wine"), items: ["raki", "narince", "okuzgozu", "bogazkere", "kalecik-karasi"] },
    { key: "beer", title: H("Biralar", "Beers"), items: ["fici-lager", "bugday", "alkolsuz-bira"] },
    { key: "cold", title: H("Soğuk Mezeler", "Cold Meze"), items: ["haydari", "acili-ezme", "fava", "muhammara", "girit-ezmesi", "deniz-borulcesi", "peynir-kavun", "lakerda"] },
    { key: "hot", title: H("Ara Sıcaklar", "Hot Meze"), items: ["sigara-boregi", "pacanga", "kalamar-tava", "arnavut-cigeri", "karides-guvec", "ahtapot-izgara"] },
    { key: "sweet", title: H("Tatlılar", "Desserts"), items: ["baklava", "kunefe", "sutlac"] },
    { key: "soft", title: H("Ayran, Kahve & Çay", "Ayran, Coffee & Tea"), items: ["ayran", "salgam", "turk-kahvesi", "cay", "maden-suyu"] },
  ],
  cosmos: [
    { key: "cellar", title: H("Yakıt İstasyonu", "Fuel Station"), items: ["japon-viskisi", "tekila", "meskal", "london-dry"] },
    { key: "beer", title: H("Biralar", "Beers"), items: [["ipa", { name: H("Nebula IPA", "Nebula IPA") }], ["bugday", { name: H("Samanyolu Buğday", "Milky Way Wheat") }], "alkolsuz-bira"] },
    { key: "cold", title: H("Yörünge Tabakları", "Orbit Plates"), note: NOTE.cold, items: ["ton-tartar", "ceviche", "edamame", ["mor-cips", { name: H("Kuyruklu Yıldız Cipsi", "Comet Crisps") }], "padron"] },
    { key: "hot", title: H("Ateşleme", "Ignition"), note: NOTE.hot, items: ["karaage", "gyoza", "bao", "tempura"] },
    { key: "sweet", title: H("Ay Tozu", "Moondust"), note: NOTE.sweet, items: [["fondan", { name: H("Kara Delik Fondan", "Black Hole Fondant") }], "nitro-dondurma", "matcha-cheesecake"] },
    { key: "soft", title: H("Sıfır Yerçekimi", "Zero Gravity"), note: NOTE.soft, items: [["mor-limonata", { name: H("Nebula Limonata", "Nebula Lemonade") }], "cold-brew", "kombucha", "tonik"] },
  ],
  jazz: [
    { key: "cellar", title: H("Viski Rafı", "The Whisky Shelf"), items: ["bourbon", "rye", "single-malt", "islay"] },
    {
      key: "beer",
      title: H("Biralar", "Beers"),
      items: ["amber-ale", "pilsner", ["alkolsuz-bira", { name: H("Near Beer", "Near Beer"), desc: H("Yasak yıllarının alkolsüz birası, %0,5'in altında", "The Prohibition-era brew, under 0.5%") }]],
    },
    { key: "cold", title: H("Bar Atıştırmalıkları", "Bar Bites"), items: ["tuzlu-fistik", "deviled-eggs", "karides-kokteyli", "hurma-pastirma"] },
    { key: "hot", title: H("Gece Yarısı Mutfağı", "Midnight Kitchen"), note: NOTE.hot, items: ["sliders", "tavuk-kanat", "mac-cheese", "patates"] },
    { key: "sweet", title: H("Tatlılar", "Desserts"), items: ["pekan-tart", "ny-cheesecake", "fondan"] },
    { key: "soft", title: H("Soda Çeşmesi", "Soda Fountain"), note: H("Kahve ve alkolsüz içecekler", "Coffee and soft drinks"), items: ["espresso", "kola", "zencefilli-gazoz", "limonata"] },
  ],
  sakura: [
    { key: "cellar", title: H("Sake & Viski", "Sake & Whisky"), items: ["sake", "umeshu", "japon-viskisi"] },
    { key: "beer", title: H("Biralar", "Beers"), items: ["pirinc-lager", "koyu-lager", "alkolsuz-bira"] },
    { key: "cold", title: H("Zensai", "Zensai"), note: NOTE.cold, items: ["edamame", "sashimi", "ton-tataki", "hiyayakko", "sunomono"] },
    { key: "hot", title: H("Izakaya", "Izakaya"), note: NOTE.hot, items: ["karaage", "yakitori", "gyoza", "agedashi", "takoyaki", "tempura"] },
    { key: "sweet", title: H("Tatlılar", "Sweets"), items: ["mochi", "dorayaki", "matcha-cheesecake"] },
    { key: "soft", title: H("Çay & Soda", "Tea & Soda"), items: ["sencha", "matcha-latte", "yuzu-soda", "japon-gazozu"] },
  ],
  alchemist: [
    {
      key: "cellar",
      title: H("Kabine", "The Cabinet"),
      items: ["absinthe", own({ id: "chartreuse-v", kind: "spirit", style: "liqueur", name: H("Yeşil Chartreuse", "Green Chartreuse"), desc: H("130 bitki, keşiş tarifi", "130 herbs, the monks' recipe"), origin: H("Fransa", "France"), serving: H("4 cl", "4 cl"), price: 620, abv: 55, allergens: [] }), "amaro", "konyak"],
    },
    { key: "beer", title: H("Manastır Biraları", "Abbey Beers"), items: ["trappist-dubbel", "sour-ale", "alkolsuz-bira"] },
    { key: "cold", title: H("Kiler", "The Larder"), note: NOTE.cold, items: [["peynir-tabagi", { name: H("Simyacının Peyniri", "The Alchemist's Cheese") }], "pate", "fume-alabalik", "tursu", "sarkuteri"] },
    { key: "hot", title: H("Fırın", "The Furnace"), note: NOTE.hot, items: ["firin-camembert", "mantar-tart", "kroket", "kemik-ilik"] },
    { key: "sweet", title: H("Tatlılar", "Desserts"), items: ["sticky-toffee", "sarapta-armut", "creme-brulee"] },
    { key: "soft", title: H("Şifalı İçecekler", "Tonics & Teas"), note: NOTE.soft, items: ["bitki-cayi", "kombucha", "zencefilli-gazoz", "tonik"] },
  ],
  tiki: [
    { key: "cellar", title: H("Rom Mahzeni", "The Rum Cellar"), items: ["yillanmis-rom", "baharatli-rom"] },
    { key: "beer", title: H("Biralar", "Beers"), items: ["tropik-lager", "pale-ale", "alkolsuz-bira"] },
    { key: "cold", title: H("Ada Tabakları", "Island Plates"), note: NOTE.cold, items: ["poke", "ceviche", "muz-cips", "tropik-meyve"] },
    { key: "hot", title: H("Meşale Mutfağı", "Torch Kitchen"), note: NOTE.hot, items: ["hindistan-karides", "tavuk-sis", "nachos", "tatli-patates"] },
    { key: "sweet", title: H("Tatlılar", "Desserts"), items: ["ananasli-kek", "haupia", "sorbe"] },
    { key: "soft", title: H("Meyve & Soda", "Fruit & Soda"), items: ["hindistan-cevizi-suyu", "ananas-suyu", "carkifelek-gazozu", "zencefilli-gazoz"] },
  ],
  boreal: [
    { key: "cellar", title: H("Votka & Akvavit", "Vodka & Aquavit"), items: ["votka", "akvavit"] },
    { key: "beer", title: H("Biralar", "Beers"), items: ["pilsner", "stout", "alkolsuz-bira"] },
    { key: "cold", title: H("Zakuski", "Zakuski"), note: NOTE.cold, items: ["ringa", "somon", "blini", "olivier", "tursu"] },
    { key: "hot", title: H("Sıcaklar", "Hot Plates"), items: ["pelmeni", "isvec-koftesi", "pirojki"] },
    { key: "sweet", title: H("Tatlılar", "Desserts"), items: ["tarcinli-corek", "bulut-meyvesi", "syrniki"] },
    { key: "soft", title: H("Semaver & Kvas", "Samovar & Kvass"), note: H("Çay, sıcak çikolata ve Kuzey'in içecekleri", "Tea, hot chocolate and the drinks of the North"), items: [["cay", { name: H("Semaver Çayı", "Samovar Tea") }], "kvas", "mors", "sicak-cikolata"] },
  ],
  riviera: [
    { key: "cellar", title: H("Mahzen", "The Cellar"), items: ["prosecco", "provence-rose", "chianti", "limoncello"] },
    { key: "beer", title: H("Biralar", "Beers"), items: ["italyan-lager", "bugday", "alkolsuz-bira"] },
    { key: "cold", title: H("Antipasti", "Antipasti"), note: NOTE.cold, items: ["burrata", "vitello-tonnato", "bresaola", "bruschetta", "zeytin"] },
    { key: "hot", title: H("Fırından & Tavadan", "From the Oven & Pan"), note: NOTE.hot, items: ["arancini", "fritto-misto", "midye-mariniere", "focaccia"] },
    { key: "sweet", title: H("Dolci", "Dolci"), note: NOTE.sweet, items: ["tiramisu", "panna-cotta", "affogato"] },
    { key: "soft", title: H("Limonata & Kahve", "Lemonade & Coffee"), items: ["limonata", "kan-portakali-soda", "chinotto", "espresso"] },
  ],
};

/** the world's kitchen & cellar sections, each line as menu fields priced for the world */
export function worldExtras(world: WorldId) {
  return EXTRAS[world].map((sec) => ({
    key: sec.key,
    title: sec.title,
    note: sec.note,
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
