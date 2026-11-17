/**
 * Demo venues, built from the Garnish catalogue. They are what the site
 * shows until Supabase is connected, and stay as the sales demo afterwards
 * (/v/demo?world=sakura previews the same menu in any world).
 */
import { cocktailById } from "@/data/cocktails";
import { ingredientById } from "@/data/ingredients";
import { STOCK_PHOTOS } from "@/data/stockPhotos";
import type { MenuItem, MenuSection, Photo, Venue, VenueMenu } from "@/domain/types";
import type { L } from "@/lib/types";

const l = (tr: string, en: string): L => ({ tr, en });
const TL = (n: number) => n * 100;

/** one-line description from the recipe: the first four ingredients that matter */
function describe(parts: { id: string; ml: number }[]): L {
  const names = parts.filter((p) => p.ml >= 5).slice(0, 4).map((p) => ingredientById(p.id)?.name ?? l(p.id, p.id));
  return { tr: names.map((n) => n.tr).join(" · "), en: names.map((n) => n.en).join(" · ") };
}

/** a credited stock photograph, standing in for the bar's own */
function stock(id: string): Photo | undefined {
  const p = STOCK_PHOTOS[id];
  return p && { url: p.url, alt: p.alt, color: p.color, credit: { author: p.author, authorUrl: p.authorUrl, sourceUrl: p.photoUrl, source: "unsplash" } };
}

function build(venueId: string, spec: [section: string, id: string, price: number, extra?: Partial<MenuItem>][], photos = false): MenuItem[] {
  return spec.map(([sectionId, id, price, extra], i) => {
    const c = cocktailById(id);
    if (!c) throw new Error(`demo: unknown cocktail ${id}`);
    return {
      id: `${venueId}-${id}`,
      venueId,
      sectionId: `${venueId}-${sectionId}`,
      slug: id,
      name: c.name,
      description: describe(c.parts),
      story: c.story,
      price: TL(price),
      recipe: { parts: c.parts, method: c.method, glass: c.glass, ice: c.ice, garnish: c.garnish },
      available: true,
      libraryId: id,
      ...(photos && stock(id) ? { photo: stock(id) } : {}),
      position: i,
      ...extra,
    };
  });
}

const sections = (venueId: string, list: [string, L, L?][]): MenuSection[] =>
  list.map(([id, title, note], position) => ({ id: `${venueId}-${id}`, venueId, title, ...(note ? { note } : {}), position }));

// ───────────────────────────── Maison Noire (Maison world)
const noire: Venue = {
  id: "demo",
  slug: "demo",
  name: "Maison Noire",
  tagline: l("Kokteyl Salonu · Karaköy", "Cocktail Salon · Karaköy"),
  city: "İstanbul",
  world: "maison",
  palette: "noir",
  currency: "TRY",
  languages: ["tr", "en"],
  footer: l("Her kokteyl siparişle, kristal kadehte hazırlanır.", "Every cocktail is mixed to order and served in crystal."),
  serviceNote: l("Fiyatlara KDV dahildir. Servis ücreti alınmaz.", "Prices include VAT. No service charge."),
  instagram: "garnish",
};

const noireMenu: VenueMenu = {
  venue: noire,
  sections: sections("demo", [
    ["sig", l("İmza Kokteyller", "Signatures"), l("Barmenimizin bu mevsim için tasarladıkları", "Created by our bartenders for this season")],
    ["classic", l("Klasikler", "The Classics")],
    ["zero", l("Alkolsüz", "Zero Proof"), l("Her imza kokteylimiz alkolsüz de hazırlanabilir", "Every signature can also be made alcohol-free")],
  ]),
  items: build("demo", [
    ["sig", "diamant", 850, { featured: true, zeroPrice: TL(520) }],
    ["sig", "vesper", 820, { zeroPrice: TL(480) }],
    ["sig", "hanky-panky", 780],
    ["sig", "white-lady", 760, { zeroPrice: TL(460) }],
    ["sig", "bijou", 790],
    ["classic", "martini", 720],
    ["classic", "negroni", 720],
    ["classic", "old-fashioned", 760],
    ["classic", "manhattan", 760],
    ["classic", "french-75", 740],
    ["classic", "whiskey-sour", 700],
    ["classic", "espresso-martini", 700],
    ["zero", "faux-martini", 450],
    ["zero", "shirley-temple", 380],
    ["zero", "pussyfoot", 420],
  ], true),
};

// ───────────────────────────── Meyhane Sirkeci (Anatolia world)
const sirkeci: Venue = {
  id: "sirkeci",
  slug: "sirkeci",
  name: "Sirkeci Meyhanesi",
  tagline: l("Fasıl · Kadeh · Meze", "Fasıl · Glass · Meze"),
  city: "İstanbul",
  world: "anatolia",
  currency: "TRY",
  languages: ["tr", "en"],
  footer: l("Şerefe! Masanıza bir tabak leblebi ikramımızdır.", "Şerefe! A plate of roasted chickpeas comes with every table."),
  serviceNote: l("Fiyatlara KDV dahildir.", "Prices include VAT."),
};

const sirkeciMenu: VenueMenu = {
  venue: sirkeci,
  sections: sections("sirkeci", [
    ["sig", l("Meyhane Kokteylleri", "Meyhane Cocktails")],
    ["classic", l("Klasikler", "The Classics")],
    ["zero", l("Şerbetler", "Sherbets"), l("Alkolsüz", "Alcohol-free")],
  ]),
  items: build("sirkeci", [
    ["sig", "gul-raki-highball", 620, { featured: true }],
    ["sig", "nar-sumak-sour", 650],
    ["sig", "sakiz-martini", 690],
    ["sig", "antep-old-fashioned", 720],
    ["sig", "kizilcik-sour", 640],
    ["sig", "visne-smash", 620],
    ["sig", "kahve-fali", 680],
    ["sig", "adana-mary", 640],
    ["classic", "negroni", 650],
    ["classic", "margarita", 650],
    ["classic", "moscow-mule", 600],
    ["zero", "nar-serbeti", 320],
  ]),
};

export const DEMO_MENUS: VenueMenu[] = [noireMenu, sirkeciMenu];
