/**
 * How a menu line is drawn and what it is, for every kind: a cocktail from its
 * recipe; wine, beer, spirits and the rest from the style the bar picks (the
 * right glass, the right colour); food on a plate.
 */
import type { ItemKind, MenuItem } from "@/domain/types";
import type { Glass, Ice, L, Method } from "./types";

export type Look =
  | { kind: "glass"; glass: Glass; color: string; opaque: boolean; ice: Ice; method: Method; garnish: string }
  | { kind: "plate"; style: string };

export const KIND_LABEL: Record<ItemKind, L> = {
  cocktail: { tr: "Kokteyl", en: "Cocktail" },
  wine: { tr: "Şarap", en: "Wine" },
  beer: { tr: "Bira", en: "Beer" },
  spirit: { tr: "Distile içki", en: "Spirit" },
  food: { tr: "Yiyecek", en: "Food" },
  other: { tr: "Diğer içecek", en: "Other drink" },
};

/** styles per kind: label, glass, colour, ice, foam; defaults for strength and serving */
export const STYLES: Record<Exclude<ItemKind, "cocktail">, Record<string, { label: L; glass: Glass; color: string; opaque?: boolean; ice?: Ice; foam?: boolean; abv: number; volume: number }>> = {
  wine: {
    red: { label: { tr: "Kırmızı", en: "Red" }, glass: "wine", color: "#5a0c1a", opaque: true, abv: 13.5, volume: 150 },
    white: { label: { tr: "Beyaz", en: "White" }, glass: "wine", color: "#e6d58f", abv: 12.5, volume: 150 },
    rose: { label: { tr: "Roze", en: "Rosé" }, glass: "wine", color: "#f0a3a3", abv: 12.5, volume: 150 },
    sparkling: { label: { tr: "Köpüklü", en: "Sparkling" }, glass: "flute", color: "#ecdc9e", abv: 12, volume: 125 },
    orange: { label: { tr: "Turuncu", en: "Orange" }, glass: "wine", color: "#d98b3a", abv: 12.5, volume: 150 },
    sweet: { label: { tr: "Tatlı / tatlı şarap", en: "Dessert wine" }, glass: "nicknora", color: "#b5651d", abv: 15, volume: 75 },
  },
  beer: {
    lager: { label: { tr: "Lager", en: "Lager" }, glass: "highball", color: "#e6a92d", foam: true, abv: 5, volume: 330 },
    wheat: { label: { tr: "Buğday", en: "Wheat" }, glass: "highball", color: "#f0c35a", opaque: true, foam: true, abv: 5.2, volume: 500 },
    ale: { label: { tr: "Ale / IPA", en: "Ale / IPA" }, glass: "highball", color: "#c46a1c", foam: true, abv: 6, volume: 330 },
    dark: { label: { tr: "Koyu / stout", en: "Dark / stout" }, glass: "highball", color: "#2b140a", opaque: true, foam: true, abv: 5.5, volume: 330 },
  },
  spirit: {
    whisky: { label: { tr: "Viski", en: "Whisky" }, glass: "rocks", color: "#b5701f", ice: "sphere", abv: 43, volume: 40 },
    rum: { label: { tr: "Rom", en: "Rum" }, glass: "rocks", color: "#8a4314", abv: 40, volume: 40 },
    brandy: { label: { tr: "Konyak / brendi", en: "Cognac / brandy" }, glass: "nicknora", color: "#9a4e18", abv: 40, volume: 40 },
    agave: { label: { tr: "Tekila / meskal", en: "Tequila / mezcal" }, glass: "rocks", color: "#efe3b8", abv: 40, volume: 40 },
    clear: { label: { tr: "Cin / votka", en: "Gin / vodka" }, glass: "rocks", color: "#f2f3ec", ice: "cube", abv: 40, volume: 40 },
    anise: { label: { tr: "Rakı / anason", en: "Rakı / anise" }, glass: "raki", color: "#eeece2", opaque: true, abv: 45, volume: 70 },
    sake: { label: { tr: "Sake / shochu", en: "Sake / shochu" }, glass: "ochoko", color: "#f5f1de", abv: 15, volume: 90 },
    liqueur: { label: { tr: "Likör / digestif", en: "Liqueur / digestif" }, glass: "nicknora", color: "#6f8f2a", abv: 40, volume: 40 },
  },
  other: {
    coffee: { label: { tr: "Kahve", en: "Coffee" }, glass: "fincan", color: "#3a1d0e", opaque: true, abv: 0, volume: 70 },
    tea: { label: { tr: "Çay", en: "Tea" }, glass: "istikan", color: "#9e2d14", abv: 0, volume: 100 },
    soft: { label: { tr: "Meşrubat / limonata", en: "Soft drink / lemonade" }, glass: "highball", color: "#ecc86a", ice: "cube", abv: 0, volume: 250 },
    water: { label: { tr: "Su / maden suyu", en: "Water / sparkling water" }, glass: "highball", color: "#e6f2f8", abv: 0, volume: 250 },
    juice: { label: { tr: "Taze meyve suyu", en: "Fresh juice" }, glass: "highball", color: "#f29a2e", opaque: true, abv: 0, volume: 250 },
  },
  food: {
    meze: { label: { tr: "Meze / tabak", en: "Small plate" }, glass: "coupe", color: "#000", abv: 0, volume: 0 },
    snack: { label: { tr: "Atıştırmalık", en: "Bar snack" }, glass: "coupe", color: "#000", abv: 0, volume: 0 },
    sweet: { label: { tr: "Tatlı", en: "Dessert" }, glass: "coupe", color: "#000", abv: 0, volume: 0 },
  },
};

export const kindOf = (it: Pick<MenuItem, "kind">): ItemKind => it.kind ?? "cocktail";
export const styleOf = (it: Pick<MenuItem, "kind" | "details">) => {
  const k = kindOf(it);
  if (k === "cocktail") return undefined;
  const table = STYLES[k];
  return table[it.details?.style ?? ""] ?? Object.values(table)[0];
};

export function lookOf(it: Pick<MenuItem, "kind" | "details" | "recipe">, cocktailColor?: { color: string; opaque: boolean }): Look {
  const k = kindOf(it);
  if (k === "food") return { kind: "plate", style: it.details?.style ?? "meze" };
  if (k === "cocktail" && it.recipe) {
    const r = it.recipe;
    return { kind: "glass", glass: r.glass, color: cocktailColor?.color ?? "#e8dcc0", opaque: cocktailColor?.opaque ?? false, ice: r.ice, method: r.method, garnish: r.garnish };
  }
  const s = styleOf(it)!;
  return { kind: "glass", glass: s.glass, color: s.color, opaque: Boolean(s.opaque), ice: s.ice ?? "none", method: s.foam ? "dryshake" : "build", garnish: "none" };
}
