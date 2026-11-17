/**
 * What the law and the guest want to know about a drink, computed from its
 * recipe with the Garnish balance engine: final volume, strength, alcohol in
 * grams, energy and allergens. Calories are an estimate (alcohol 7 kcal/g,
 * sugar 4 kcal/g, plus cream and the like), and are always shown as "≈".
 */
import type { Recipe } from "@/domain/types";
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
    profile: a.profile,
  };
}

/** the alcohol-free version of a recipe (Garnish zero-proof stand-ins) */
export function zeroRecipe(r: Recipe): Recipe {
  return { ...r, parts: toZero(r.parts).map(({ id, ml, top }) => ({ id, ml, ...(top ? { top } : {}) })) };
}
