/**
 * Turns a VenueMenu into plain, already-translated view models for the guest
 * menu. All the drink maths runs here on the server, so the ingredient
 * catalogue never ships to the guest's phone.
 */
import { GARNISHES, cocktailById } from "@/data/cocktails";
import { ingredientById } from "@/data/ingredients";
import type { MenuItem, VenueMenu } from "@/domain/types";
import { allergenById } from "./allergens";
import { factsOf, itemFacts, zeroRecipe, type Facts } from "./facts";
import { kindOf, styleOf } from "./itemLook";
import type { ItemKind } from "@/domain/types";
import { money, nameLang, percent, pick } from "./i18n";
import type { Lang, WorldId } from "./types";
import { JA, MARK } from "./worldMenu";

export interface ItemView {
  id: string;
  slug: string;
  name: string;
  nameLang?: "tr" | "en";
  description: string;
  price: string;
  zeroPrice?: string;
  featured: boolean;
  zero: boolean; // the drink itself is alcohol-free
  abv: string; // formatted for the language
  kcal: number;
  allergens: { id: string; name: string; mark: string }[];
  kind: ItemKind;
  food: boolean;
  kcalKnown: boolean;
  serving?: string; // "Kadeh · 150 ml"
  alt?: string; // second size and price: "Şişe ₺1.900"
  profile?: number[]; // cocktails: taste, AXES order (sweet sour bitter strong fresh aromatic), 0–5
  mark: string; // the world's mark: No. I, ٣, 一, ☿, ❄ 14°, 86 proof…
  ja?: string; // Japanese name, for Sakura's oshinagaki
  /** the alcohol-free version, when the bar offers one: its own recipe, so its own allergens, taste and energy */
  zeroVersion?: VersionFacts;
}

/** what the guest is shown of one version of a line */
export interface VersionFacts {
  price: string;
  description: string;
  allergens: { id: string; name: string; mark: string }[];
  profile?: number[];
  kcal: number;
}

export interface SectionView {
  id: string;
  title: string;
  titleLang?: "tr" | "en"; // "Zensai", "Antipasti": the same in both languages, so no Turkish dotted İ when uppercased
  note?: string;
  items: ItemView[];
}

const allergenViews = (f: Facts, lang: Lang) =>
  f.allergens.map((id) => {
    const a = allergenById(id)!;
    return { id, name: pick(a.name, lang), mark: a.mark };
  });

const AXES6 = ["sweet", "sour", "bitter", "strong", "fresh", "aromatic"] as const;
const profileOf = (f: Facts) => AXES6.map((k) => Math.round(f.profile[k] * 10) / 10);
/** "Alkolsüz cin · Nar suyu · …": the version's own ingredients, as the menu describes a drink */
const partNames = (parts: { id: string; ml: number }[], lang: Lang) =>
  parts.filter((p) => p.ml >= 5).slice(0, 4).map((p) => pick(ingredientById(p.id)?.name, lang) || p.id).join(" · ");

export function itemView(it: MenuItem, currency: string, lang: Lang, world: WorldId = "maison", index = 0): ItemView {
  const f = itemFacts(it);
  const hasZero = !f.simple && it.recipe && it.zeroPrice !== undefined && !f.zero;
  const zr = hasZero ? zeroRecipe(it.recipe!) : undefined;
  const zf = zr ? factsOf(zr, it.extraAllergens) : undefined;
  const lib = it.libraryId ? cocktailById(it.libraryId) : undefined;
  const kind = kindOf(it);
  const d = it.details;
  return {
    kind,
    food: kind === "food",
    kcalKnown: f.kcalKnown,
    serving: d?.serving ? pick(d.serving, lang) : undefined,
    alt: d?.alt ? `${pick(d.alt.label, lang)} ${money(d.alt.price, currency, lang)}` : undefined,
    mark: MARK[world]({ index, id: it.id, abv: f.abv, year: lib?.year, root: lib?.root, food: kind === "food" }),
    profile: f.simple ? undefined : profileOf(f),
    ja: world === "sakura" && it.libraryId ? JA[it.libraryId] : undefined,
    id: it.id,
    slug: it.slug,
    name: pick(it.name, lang),
    nameLang: nameLang(it.name),
    description: pick(it.description, lang),
    price: money(it.price, currency, lang),
    zeroPrice: !f.simple && it.zeroPrice !== undefined && !f.zero ? money(it.zeroPrice, currency, lang) : undefined,
    featured: Boolean(it.featured),
    zero: f.zero,
    abv: percent(f.abv, lang, 0),
    kcal: f.kcal,
    allergens: allergenViews(f, lang),
    zeroVersion:
      zr && zf && it.zeroPrice !== undefined
        ? { price: money(it.zeroPrice, currency, lang), description: partNames(zr.parts, lang), allergens: allergenViews(zf, lang), profile: profileOf(zf), kcal: zf.kcal }
        : undefined,
  };
}

export function menuView(m: VenueMenu, lang: Lang, world: WorldId = m.venue.world): SectionView[] {
  let index = 0;
  return [...m.sections]
    .sort((a, b) => a.position - b.position)
    .map((s) => ({
      id: s.id,
      title: pick(s.title, lang),
      titleLang: nameLang(s.title),
      note: s.note ? pick(s.note, lang) : undefined,
      items: m.items
        .filter((i) => i.sectionId === s.id && i.available)
        .sort((a, b) => a.position - b.position)
        .map((i) => itemView(i, m.venue.currency, lang, world, index++)),
    }))
    .filter((s) => s.items.length > 0);
}

/** the item page: both versions (original and, if offered, alcohol-free); for non-cocktails, what the bar described */
export function itemDetail(it: MenuItem, currency: string, lang: Lang) {
  if (!it.recipe || kindOf(it) !== "cocktail") {
    const f = itemFacts(it);
    const s = styleOf(it);
    return {
      simple: true as const,
      original: { facts: f, allergens: allergenViews(f, lang), inside: [] as string[], price: money(it.price, currency, lang) },
      zero: undefined,
      garnish: undefined,
      style: s ? pick(s.label, lang) : undefined,
      origin: it.details?.origin ? pick(it.details.origin, lang) : undefined,
      serving: it.details?.serving ? pick(it.details.serving, lang) : undefined,
      alt: it.details?.alt ? { label: pick(it.details.alt.label, lang), price: money(it.details.alt.price, currency, lang) } : undefined,
    };
  }
  const original = factsOf(it.recipe, it.extraAllergens);
  const zr = it.zeroPrice !== undefined && !original.zero ? zeroRecipe(it.recipe) : undefined;
  const zero = zr ? factsOf(zr, it.extraAllergens) : undefined;
  const names = (parts: { id: string; ml: number }[]) =>
    parts.filter((p) => p.ml > 0).map((p) => pick(ingredientById(p.id)?.name, lang) || p.id);
  return {
    simple: false as const,
    style: undefined,
    origin: undefined,
    serving: undefined,
    alt: undefined,
    original: { facts: original, allergens: allergenViews(original, lang), inside: names(it.recipe.parts), price: money(it.price, currency, lang) },
    zero: zero && zr && it.zeroPrice !== undefined
      ? { facts: zero, allergens: allergenViews(zero, lang), inside: names(zr.parts), price: money(it.zeroPrice, currency, lang) }
      : undefined,
    garnish: GARNISHES[it.recipe.garnish] && it.recipe.garnish !== "none" ? pick(GARNISHES[it.recipe.garnish], lang) : undefined,
  };
}
