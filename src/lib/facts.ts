/**
 * What the law and the guest want to know about a drink, computed from its
 * recipe with the Garnish balance engine: final volume, strength, alcohol in
 * grams, energy and allergens. Calories are an estimate (alcohol 7 kcal/g,
 * sugar 4 kcal/g, plus cream and the like), and are always shown as "≈".
 */
import type { MenuItem, Recipe } from "@/domain/types";
import { kindOf, styleOf } from "./itemLook";
import { allergensOf, type AllergenId } from "./allergens";
import { analyse } from "./balance";
import { isAlcoholic, toZero } from "./zero";

export interface Facts {
  volume: number; // ml in the glass, after dilution
  abv: number; // fraction
  alcoholG: number;
  kcal: number;
  allergens: AllergenId[];
  zero: boolean; // no alcoholic ingredient
  color: string;
  opaque: boolean;
  profile: ReturnType<typeof analyse>["profile"];
}

export function factsOf(r: Recipe, extra: string[] = []): Facts {
  const a = analyse(r.parts, r.method);
  return {
    volume: Math.round(a.finalVolume),
    abv: a.abv,
    alcoholG: a.abv * a.finalVolume * 0.789,
    kcal: Math.round(a.kcal / 5) * 5,
    allergens: allergensOf(r.parts, r.garnish, extra),
    zero: r.parts.every((p) => !isAlcoholic(p.id)),
    color: a.color,
    opaque: a.opaque,
    profile: a.profile,
  };
}

/** the alcohol-free version of a recipe (Garnish zero-proof stand-ins) */
export function zeroRecipe(r: Recipe): Recipe {
  return { ...r, parts: toZero(r.parts).map(({ id, ml, top }) => ({ id, ml, ...(top ? { top } : {}) })) };
}

const NO_PROFILE = { sweet: 0, sour: 0, bitter: 0, strong: 0, fresh: 0, aromatic: 0 };

/**
 * Facts for any menu line. Cocktails: from the recipe. Everything else: from
 * what the bar entered, with the style's defaults; calories, if the bar has
 * none, are estimated (alcohol 7 kcal/g plus typical carbohydrate for wine and
 * beer). Food has no strength; its calories are shown only when the bar gives them.
 */
export function itemFacts(it: Pick<MenuItem, "kind" | "recipe" | "details" | "extraAllergens">): Facts & { simple: boolean; kcalKnown: boolean } {
  const k = kindOf(it);
  if (k === "cocktail" && it.recipe) return { ...factsOf(it.recipe, it.extraAllergens), simple: false, kcalKnown: true };
  const s = styleOf(it);
  const d = it.details ?? {};
  const volume = d.volume ?? s?.volume ?? 0;
  const abvPct = k === "food" ? 0 : d.abv ?? s?.abv ?? 0;
  const alcoholG = (volume * abvPct * 0.789) / 100;
  const carbs = k === "wine" ? volume * 0.025 : k === "beer" ? volume * 0.038 : 0; // g per serving
  const estimate = k === "food" ? 0 : Math.round((alcoholG * 7 + carbs * 4) / 5) * 5;
  return {
    volume,
    abv: abvPct / 100,
    alcoholG,
    kcal: d.kcal ?? estimate,
    kcalKnown: d.kcal !== undefined || k !== "food",
    allergens: allergensOf([], undefined, it.extraAllergens ?? []),
    zero: abvPct <= 0.5, // "alkolsüz" by Turkish rules: at most 0.5%
    color: d.color ?? s?.color ?? "#e8dcc0",
    opaque: Boolean(s?.opaque),
    profile: NO_PROFILE,
    simple: true,
  };
}
