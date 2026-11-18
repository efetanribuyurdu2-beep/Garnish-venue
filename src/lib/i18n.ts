import type { L, Lang } from "./types";

export const pick = (l: L | undefined, lang: Lang) => (l ? l[lang] || l.tr : "");

/**
 * lang for a bar's own name, so capitals come out right in caps-only worlds:
 * a name with Turkish letters is Turkish ("Kına Gecesi" → "KINA GECESİ"),
 * anything else is treated as a foreign proper name ("Maison Noire" → "MAISON NOIRE").
 */
export const brandLang = (name: string): "tr" | "en" => (/[çğıİöşüÇĞÖŞÜ]/.test(name) ? "tr" : "en");

/**
 * lang for a name, so capitals come out right in caps-only worlds. A name that
 * reads the same in both languages is a proper name: Turkish if it has Turkish
 * letters ("Kalecik Karası" → KALECİK), foreign otherwise ("Negroni" → NEGRONI).
 */
export const nameLang = (l: L): "tr" | "en" | undefined => (l.tr === l.en ? brandLang(l.tr) : undefined);


export function money(kurus: number, currency: string, lang: Lang) {
  return new Intl.NumberFormat(lang === "tr" ? "tr-TR" : "en-GB", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: kurus % 100 ? 2 : 0,
  }).format(kurus / 100);
}

/** strength as written in each language: "%14,8" in Turkish, "14.8%" in English */
export const percent = (fraction: number, lang: Lang, digits = 1) =>
  new Intl.NumberFormat(lang === "tr" ? "tr-TR" : "en-GB", { style: "percent", maximumFractionDigits: digits, minimumFractionDigits: digits }).format(fraction);

const DICT = {
  menu: { tr: "Menü", en: "Menu" },
  zeroOnly: { tr: "Yalnızca alkolsüz", en: "Alcohol-free only" },
  avoid: { tr: "İçermesin", en: "Leave out" },
  bigText: { tr: "Büyük yazı", en: "Large text" },
  none: { tr: "Bu seçimle eşleşen içki yok.", en: "No drink matches this choice." },
  zeroAlso: { tr: "Alkolsüz de var", en: "Also alcohol-free" },
  zero: { tr: "Alkolsüz", en: "Alcohol-free" },
  original: { tr: "Orijinal", en: "Original" },
  volume: { tr: "Hacim", en: "Volume" },
  strength: { tr: "Alkol", en: "Strength" },
  alcohol: { tr: "Saf alkol", en: "Pure alcohol" },
  energy: { tr: "Enerji", en: "Energy" },
  allergens: { tr: "Alerjenler", en: "Allergens" },
  noAllergens: { tr: "Bildirilmesi gereken alerjen yok", en: "No declarable allergens" },
  inside: { tr: "İçinde", en: "What's inside" },
  garnish: { tr: "Süsleme", en: "Garnish" },
  taste: { tr: "Tat profili", en: "Taste" },
  facts: { tr: "Bilgiler", en: "Facts" },
  back: { tr: "Menüye dön", en: "Back to the menu" },
  estimate: {
    tr: "Enerji ve alkol değerleri tarifinden hesaplanmış tahminlerdir. Alerjen bilgisi için lütfen personelimize danışın.",
    en: "Energy and alcohol values are estimates calculated from the recipe. Please ask our staff about allergens.",
  },
  printed: { tr: "Basılı menümüzü personelimizden isteyebilirsiniz.", en: "A printed menu is available from our staff." },
  prefs: { tr: "Tercihler", en: "Preferences" },
  clear: { tr: "Temizle", en: "Clear" },
  done: { tr: "Menüye dön", en: "Show the menu" },
  chosen: { tr: "Barmenin seçimi", en: "Bartender's choice" },
  avoidHint: { tr: "Seçtiğiniz alerjeni içeren içkiler gizlenir.", en: "Drinks containing the allergens you pick are hidden." },
  close: { tr: "Kapat", en: "Close" },
  without: { tr: "yok", en: "free" },
  strengthNote: { tr: "alkol", en: "abv" },
  showing: { tr: "Gösterilen", en: "Showing" },
  poweredBy: { tr: "Garnish ile hazırlandı", en: "Made with Garnish" },
  f_sweet: { tr: "Tatlı", en: "Sweet" },
  f_sour: { tr: "Ekşi", en: "Sour" },
  f_bitter: { tr: "Acı", en: "Bitter" },
  f_strong: { tr: "Sert", en: "Strong" },
  f_fresh: { tr: "Ferah", en: "Fresh" },
  f_aromatic: { tr: "Aromatik", en: "Aromatic" },
} satisfies Record<string, L>;

export type Key = keyof typeof DICT;
export const t = (key: Key, lang: Lang) => DICT[key][lang];

export const readLang = (v: string | string[] | undefined, allowed: Lang[]): Lang =>
  (allowed as string[]).includes(String(v)) ? (v as Lang) : allowed[0];
