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

type Simple = [slug: string, tr: string, en: string, kind: "wine" | "beer" | "spirit" | "food" | "other", style: string, price: number, desc: [string, string], origin: [string, string] | null, serving: [string, string], alt: [string, string, number] | null, allergens: string[]];

/** beside the cocktails, what each world's bar also pours and serves */
const SIMPLE: Record<WorldId, { title: L; items: Simple[] }> = {
  maison: {
    title: l("Şampanya & Mahzen", "Champagne & Cellar"),
    items: [
      ["champagne-brut", "Champagne Brut", "Champagne Brut", "wine", "sparkling", 950, ["Pinot Noir · Chardonnay · Pinot Meunier", "Pinot Noir · Chardonnay · Pinot Meunier"], ["Reims, Fransa", "Reims, France"], ["Kadeh · 125 ml", "Glass · 125 ml"], ["Şişe", "Bottle", 6400], ["sulphites"]],
      ["chablis", "Chablis", "Chablis", "wine", "white", 720, ["Chardonnay", "Chardonnay"], ["Burgonya, Fransa", "Burgundy, France"], ["Kadeh · 150 ml", "Glass · 150 ml"], ["Şişe", "Bottle", 3800], ["sulphites"]],
      ["istiridye", "İstiridye", "Oysters", "food", "meze", 1100, ["Altı adet, mignonette sos ve limon", "Six, with mignonette and lemon"], null, ["6 adet", "6 pieces"], null, ["molluscs", "sulphites"]],
      ["truf-cips", "Trüflü Patates Cipsi", "Truffle Crisps", "food", "snack", 380, ["Trüf yağı, parmesan", "Truffle oil, parmesan"], null, ["Porsiyon", "Portion"], null, ["milk"]],
    ],
  },
  anatolia: {
    title: l("Rakı & Meze", "Rakı & Meze"),
    items: [
      ["yeni-raki", "Yeni Rakı", "Yeni Rakı", "spirit", "anise", 380, ["Buz, su ve beyaz peynirle", "With ice, water and white cheese"], ["Türkiye", "Türkiye"], ["Tek · 7 cl", "Single · 7 cl"], ["Duble", "Double", 620], []],
      ["okuzgozu", "Öküzgözü · Boğazkere", "Öküzgözü · Boğazkere", "wine", "red", 560, ["Kırmızı meyve, baharat", "Red fruit, spice"], ["Elazığ · Diyarbakır", "Elazığ · Diyarbakır"], ["Kadeh · 150 ml", "Glass · 150 ml"], ["Şişe", "Bottle", 2600], ["sulphites"]],
      ["haydari", "Haydari", "Haydari", "food", "meze", 240, ["Süzme yoğurt, sarımsak, dereotu, nane", "Strained yoghurt, garlic, dill, mint"], null, ["Porsiyon", "Portion"], null, ["milk"]],
      ["acili-ezme", "Acılı Ezme", "Spicy Ezme", "food", "meze", 220, ["Domates, biber, soğan, nar ekşisi", "Tomato, pepper, onion, pomegranate molasses"], null, ["Porsiyon", "Portion"], null, []],
      ["peynir-kavun", "Beyaz Peynir & Kavun", "White Cheese & Melon", "food", "meze", 320, ["Ezine peyniri, mevsim kavunu", "Ezine cheese, melon in season"], null, ["Porsiyon", "Portion"], null, ["milk"]],
    ],
  },
  cosmos: {
    title: l("Yakıt İstasyonu", "Fuel Station"),
    items: [
      ["nebula-ipa", "Nebula IPA", "Nebula IPA", "beer", "ale", 340, ["Turunçgil, çam, keskin acılık", "Citrus, pine, a sharp bitterness"], ["Craft · İstanbul", "Craft · İstanbul"], ["Şişe · 330 ml", "Bottle · 330 ml"], null, ["gluten"]],
      ["edamame", "Edamame", "Edamame", "food", "snack", 260, ["Deniz tuzu, shichimi", "Sea salt, shichimi"], null, ["Porsiyon", "Portion"], null, ["soy"]],
      ["kuyruklu-cips", "Kuyruklu Yıldız Cipsi", "Comet Crisps", "food", "snack", 240, ["Mor patates, karabiber", "Purple potato, black pepper"], null, ["Porsiyon", "Portion"], null, []],
    ],
  },
  jazz: {
    title: l("Viski Rafı", "The Whisky Shelf"),
    items: [
      ["bourbon", "Kentucky Bourbon", "Kentucky Bourbon", "spirit", "whisky", 520, ["Vanilya, karamel, meşe", "Vanilla, caramel, oak"], ["Kentucky, ABD", "Kentucky, USA"], ["4 cl", "4 cl"], ["Duble", "Double", 940], []],
      ["rye", "Straight Rye", "Straight Rye", "spirit", "whisky", 560, ["Çavdar baharatı, kuru meyve", "Rye spice, dried fruit"], ["ABD", "USA"], ["4 cl", "4 cl"], ["Duble", "Double", 1020], []],
      ["fistik", "Tuzlu Fıstık", "Salted Peanuts", "food", "snack", 160, ["Kavrulmuş, deniz tuzu", "Roasted, sea salt"], null, ["Kâse", "Bowl"], null, ["peanuts"]],
    ],
  },
  sakura: {
    title: l("Sake & Izakaya", "Sake & Izakaya"),
    items: [
      ["junmai-ginjo", "Junmai Ginjo", "Junmai Ginjo", "spirit", "sake", 640, ["Armut, pirinç, yumuşak bitiş", "Pear, rice, a soft finish"], ["Niigata, Japonya", "Niigata, Japan"], ["Ochoko · 90 ml", "Ochoko · 90 ml"], ["Tokkuri · 300 ml", "Tokkuri · 300 ml", 1900], []],
      ["edamame-sakura", "Edamame", "Edamame", "food", "snack", 260, ["Deniz tuzu", "Sea salt"], null, ["Porsiyon", "Portion"], null, ["soy"]],
      ["karaage", "Tavuk Karaage", "Chicken Karaage", "food", "meze", 420, ["Soya, zencefil, nişasta, yuzu mayonez", "Soy, ginger, potato starch, yuzu mayo"], null, ["Porsiyon", "Portion"], null, ["soy", "gluten", "egg"]],
    ],
  },
  alchemist: {
    title: l("Kabine", "The Cabinet"),
    items: [
      ["absinthe", "Absinthe Ritüeli", "Absinthe Ritual", "spirit", "anise", 640, ["Şeker küpü, damla damla buzlu su", "A sugar cube, iced water drop by drop"], ["Val-de-Travers, İsviçre", "Val-de-Travers, Switzerland"], ["3 cl", "3 cl"], null, []],
      ["chartreuse-v", "Yeşil Chartreuse", "Green Chartreuse", "spirit", "liqueur", 620, ["130 bitki, keşiş tarifi", "130 herbs, the monks' recipe"], ["Fransa", "France"], ["4 cl", "4 cl"], null, []],
      ["peynir-tabagi", "Simyacının Peyniri", "The Alchemist's Cheese", "food", "meze", 560, ["Üç olgun peynir, ceviz, bal", "Three aged cheeses, walnuts, honey"], null, ["Tabak", "Plate"], null, ["milk", "nuts"]],
    ],
  },
  tiki: {
    title: l("Rom Mahzeni", "The Rum Cellar"),
    items: [
      ["aged-rum", "Yıllanmış Rom", "Aged Rum", "spirit", "rum", 480, ["Melas, muz, tropik baharat", "Molasses, banana, tropical spice"], ["Jamaika", "Jamaica"], ["4 cl", "4 cl"], ["Duble", "Double", 880], []],
      ["coconut-water", "Hindistan Cevizi Suyu", "Coconut Water", "other", "juice", 220, ["Taze, buz gibi", "Fresh, ice-cold"], null, ["250 ml", "250 ml"], null, []],
      ["muz-cips", "Muz Cipsi", "Plantain Chips", "food", "snack", 200, ["Lime, tuz", "Lime, salt"], null, ["Kâse", "Bowl"], null, []],
    ],
  },
  boreal: {
    title: l("Votka & Zakuski", "Vodka & Zakuski"),
    items: [
      ["vodka", "Buzlu Votka", "Ice-cold Vodka", "spirit", "clear", 360, ["Dondurucudan, kadeh buzlu", "From the freezer, frosted glass"], ["Rusya · Polonya", "Russia · Poland"], ["4 cl", "4 cl"], ["Duble", "Double", 640], []],
      ["kvass-beer", "Koyu Bira", "Dark Beer", "beer", "dark", 320, ["Kavrulmuş malt, kahve, çavdar", "Roasted malt, coffee, rye"], null, ["Şişe · 330 ml", "Bottle · 330 ml"], null, ["gluten"]],
      ["ringa", "Ringa & Çavdar Ekmeği", "Herring & Rye Bread", "food", "meze", 420, ["Marine ringa, kırmızı soğan, dereotu", "Pickled herring, red onion, dill"], null, ["Tabak", "Plate"], null, ["fish", "gluten", "mustard"]],
    ],
  },
  riviera: {
    title: l("Mahzen", "The Cellar"),
    items: [
      ["prosecco", "Prosecco", "Prosecco", "wine", "sparkling", 520, ["Glera", "Glera"], ["Veneto, İtalya", "Veneto, Italy"], ["Kadeh · 125 ml", "Glass · 125 ml"], ["Şişe", "Bottle", 2600], ["sulphites"]],
      ["provence-rose", "Provence Rosé", "Provence Rosé", "wine", "rose", 580, ["Grenache · Cinsault", "Grenache · Cinsault"], ["Provence, Fransa", "Provence, France"], ["Kadeh · 150 ml", "Glass · 150 ml"], ["Şişe", "Bottle", 2900], ["sulphites"]],
      ["chianti", "Chianti Classico", "Chianti Classico", "wine", "red", 620, ["Sangiovese", "Sangiovese"], ["Toskana, İtalya", "Tuscany, Italy"], ["Kadeh · 150 ml", "Glass · 150 ml"], ["Şişe", "Bottle", 3100], ["sulphites"]],
      ["burrata", "Burrata", "Burrata", "food", "meze", 540, ["Domates, fesleğen, zeytinyağı", "Tomato, basil, olive oil"], null, ["Tabak", "Plate"], null, ["milk"]],
      ["focaccia", "Zeytin & Focaccia", "Olives & Focaccia", "food", "snack", 280, ["Biberiye, deniz tuzu", "Rosemary, sea salt"], null, ["Porsiyon", "Portion"], null, ["gluten"]],
    ],
  },
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
  const simple = SIMPLE[world];
  const order = [...starter.map((s) => s.key)];
  order.splice(order.indexOf("zero") >= 0 ? order.indexOf("zero") : order.length, 0, "more");
  const titled = [...starter.map((s) => ({ key: s.key, title: s.title, note: s.note })), { key: "more", title: simple.title, note: undefined }];
  const sections: MenuSection[] = order.map((key, position) => {
    const t = titled.find((x) => x.key === key)!;
    return { id: `${id}-${key}`, venueId: id, title: t.title, ...(t.note ? { note: t.note } : {}), position };
  });
  let position = 0;
  const moreItems: MenuItem[] = simple.items.map(([slug, tr, en, kind, style, price, desc, origin, serving, alt, allergens]) => ({
    id: `${id}-${slug}`,
    venueId: id,
    sectionId: `${id}-more`,
    slug,
    name: l(tr, en),
    description: l(desc[0], desc[1]),
    price: price * 100,
    kind,
    details: {
      style,
      serving: l(serving[0], serving[1]),
      ...(origin ? { origin: l(origin[0], origin[1]) } : {}),
      ...(alt ? { alt: { label: l(alt[0], alt[1]), price: alt[2] * 100 } } : {}),
    },
    extraAllergens: allergens,
    available: true,
    position: 100 + position++,
  }));
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
