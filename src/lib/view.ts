/**
 * Turns a VenueMenu into plain, already-translated view models for the guest
 * menu. All the drink maths runs here on the server, so the ingredient
 * catalogue never ships to the guest's phone.
 */
import { GARNISHES } from "@/data/cocktails";
import { ingredientById } from "@/data/ingredients";
import type { MenuItem, VenueMenu } from "@/domain/types";
import { allergenById } from "./allergens";
import { factsOf, zeroRecipe, type Facts } from "./facts";
import { money, nameLang, percent, pick } from "./i18n";
import type { Lang } from "./types";

export interface ItemView {
  id: string;
  slug: string;
  name: string;
  nameLang?: "en";
  description: string;
  price: string;
  zeroPrice?: string;
  featured: boolean;
  zero: boolean; // the drink itself is alcohol-free
  abv: string; // formatted for the language
  kcal: number;
  allergens: { id: string; name: string; mark: string }[];
}

export interface SectionView {
  id: string;
  title: string;
  note?: string;
  items: ItemView[];
}

const allergenViews = (f: Facts, lang: Lang) =>
  f.allergens.map((id) => {
    const a = allergenById(id)!;
    return { id, name: pick(a.name, lang), mark: a.mark };
  });

export function itemView(it: MenuItem, currency: string, lang: Lang): ItemView {
  const f = factsOf(it.recipe, it.extraAllergens);
  return {
    id: it.id,
    slug: it.slug,
    name: pick(it.name, lang),
    nameLang: nameLang(it.name),
    description: pick(it.description, lang),
    price: money(it.price, currency, lang),
    zeroPrice: it.zeroPrice !== undefined && !f.zero ? money(it.zeroPrice, currency, lang) : undefined,
    featured: Boolean(it.featured),
    zero: f.zero,
    abv: percent(f.abv, lang, 0),
    kcal: f.kcal,
    allergens: allergenViews(f, lang),
  };
}

export function menuView(m: VenueMenu, lang: Lang): SectionView[] {
  return [...m.sections]
    .sort((a, b) => a.position - b.position)
    .map((s) => ({
      id: s.id,
      title: pick(s.title, lang),
      note: s.note ? pick(s.note, lang) : undefined,
      items: m.items
        .filter((i) => i.sectionId === s.id && i.available)
        .sort((a, b) => a.position - b.position)
        .map((i) => itemView(i, m.venue.currency, lang)),
    }))
    .filter((s) => s.items.length > 0);
}

/** the item page: both versions (original and, if offered, alcohol-free) */
export function itemDetail(it: MenuItem, currency: string, lang: Lang) {
  const original = factsOf(it.recipe, it.extraAllergens);
  const zr = it.zeroPrice !== undefined && !original.zero ? zeroRecipe(it.recipe) : undefined;
  const zero = zr ? factsOf(zr, it.extraAllergens) : undefined;
  const names = (parts: { id: string; ml: number }[]) =>
    parts.filter((p) => p.ml > 0).map((p) => pick(ingredientById(p.id)?.name, lang) || p.id);
  return {
    original: { facts: original, allergens: allergenViews(original, lang), inside: names(it.recipe.parts), price: money(it.price, currency, lang) },
    zero: zero && zr && it.zeroPrice !== undefined
      ? { facts: zero, allergens: allergenViews(zero, lang), inside: names(zr.parts), price: money(it.zeroPrice, currency, lang) }
      : undefined,
    garnish: GARNISHES[it.recipe.garnish] && it.recipe.garnish !== "none" ? pick(GARNISHES[it.recipe.garnish], lang) : undefined,
  };
}
