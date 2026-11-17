/**
 * The 14 allergens that must be declared on food and drink in Turkey
 * (Türk Gıda Kodeksi, Gıda Etiketleme ve Tüketicileri Bilgilendirme
 * Yönetmeliği, Ek-1) and the EU (Reg. 1169/2011, Annex II): the same list.
 *
 * MAP says which core ingredients carry which allergen. It is deliberately
 * cautious (amaretto is marked for nuts, cocktail cherries for sulphites).
 * The bar confirms or adds to it per item (MenuItem.extraAllergens): the
 * computed list is a starting point, the bar remains responsible for it.
 *
 * Cereal-based distilled spirits (whisky, vodka, gin) are exempt from the
 * gluten declaration under the same rules, so they are not marked.
 */
import type { L, Part } from "./types";

export type AllergenId =
  | "gluten"
  | "crustaceans"
  | "egg"
  | "fish"
  | "peanuts"
  | "soy"
  | "milk"
  | "nuts"
  | "celery"
  | "mustard"
  | "sesame"
  | "sulphites"
  | "lupin"
  | "molluscs";

export const ALLERGENS: { id: AllergenId; name: L; mark: string }[] = [
  { id: "gluten", name: { tr: "Gluten", en: "Gluten" }, mark: "G" },
  { id: "crustaceans", name: { tr: "Kabuklular", en: "Crustaceans" }, mark: "Kb" },
  { id: "egg", name: { tr: "Yumurta", en: "Egg" }, mark: "Y" },
  { id: "fish", name: { tr: "Balık", en: "Fish" }, mark: "B" },
  { id: "peanuts", name: { tr: "Yer fıstığı", en: "Peanuts" }, mark: "Yf" },
  { id: "soy", name: { tr: "Soya", en: "Soy" }, mark: "So" },
  { id: "milk", name: { tr: "Süt", en: "Milk" }, mark: "S" },
  { id: "nuts", name: { tr: "Sert kabuklu meyveler", en: "Tree nuts" }, mark: "F" },
  { id: "celery", name: { tr: "Kereviz", en: "Celery" }, mark: "Ke" },
  { id: "mustard", name: { tr: "Hardal", en: "Mustard" }, mark: "H" },
  { id: "sesame", name: { tr: "Susam", en: "Sesame" }, mark: "Su" },
  { id: "sulphites", name: { tr: "Sülfitler", en: "Sulphites" }, mark: "SO₂" },
  { id: "lupin", name: { tr: "Acı bakla", en: "Lupin" }, mark: "A" },
  { id: "molluscs", name: { tr: "Yumuşakçalar", en: "Molluscs" }, mark: "Yu" },
];
export const allergenById = (id: string) => ALLERGENS.find((a) => a.id === id);

const WINE = [
  "champagne", "prosecco", "sparkling-rose", "rose-wine", "red-wine", "white-wine",
  "sweet-vermouth", "dry-vermouth", "lillet", "lillet-rose", "fino", "px-sherry", "port",
  "zero-sparkling", "zero-white", "zero-red", "zero-rosso", "zero-dry",
];

const MAP: Record<string, AllergenId[]> = {
  "egg-white": ["egg"],
  cream: ["milk"],
  baileys: ["milk"],
  ayran: ["milk"],
  orgeat: ["nuts"],
  amaretto: ["nuts"],
  "zero-amaretto": ["nuts"],
  frangelico: ["nuts"],
  "hazelnut-syrup": ["nuts"],
  "pistachio-syrup": ["nuts"],
  "pistachio-liqueur": ["nuts"],
  kvass: ["gluten"],
  ...Object.fromEntries(WINE.map((id) => [id, ["sulphites"] as AllergenId[]])),
};

/** garnishes that carry an allergen of their own */
const GARNISH: Record<string, AllergenId[]> = {
  cherry: ["sulphites"],
  pistachio: ["nuts"],
};

export function allergensOf(parts: Part[], garnish?: string, extra: string[] = []): AllergenId[] {
  const set = new Set<AllergenId>();
  for (const p of parts) for (const a of MAP[p.id] ?? []) set.add(a);
  for (const a of GARNISH[garnish ?? ""] ?? []) set.add(a);
  for (const a of extra) if (allergenById(a)) set.add(a as AllergenId);
  return ALLERGENS.map((a) => a.id).filter((id) => set.has(id));
}
