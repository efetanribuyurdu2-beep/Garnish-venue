/**
 * The guest's preferences (alcohol-free only, allergens to leave out) and what
 * they mean for one menu line: which version the guest is shown, or none.
 * The menu, "Suggest a drink" and the links to a drink's page all go through
 * here, so they always agree. Pure, with no runtime imports (tests run it in
 * plain Node: tests/guest-choice.test.mjs).
 */

export interface GuestPrefs {
  zero: boolean; // alcohol-free only
  avoid: string[]; // allergen ids to leave out
}

export const NO_PREFS: GuestPrefs = { zero: false, avoid: [] };

export type VersionKey = "original" | "zero";

/** the parts of a menu line this needs (ItemView in view.ts has them all) */
export interface Choosable {
  zero: boolean; // the line itself is alcohol-free
  price: string;
  description: string;
  kcal: number;
  allergens: { id: string; name: string }[];
  profile?: number[];
  zeroVersion?: { price: string; description: string; kcal: number; allergens: { id: string; name: string }[]; profile?: number[] };
}

export interface Shown {
  key: VersionKey;
  zero: boolean; // this version is alcohol-free
  price: string;
  description: string;
  kcal: number;
  allergens: { id: string; name: string }[];
  profile?: number[];
}

/**
 * The version of a line the guest is shown under these preferences, or null when
 * the line does not fit them. With "alcohol-free only" that is the line itself if
 * it is alcohol-free, else its alcohol-free version; allergens are checked on that
 * same version, because its recipe (and so its allergens) can differ.
 */
export function shownVersion(i: Choosable, prefs: GuestPrefs): Shown | null {
  let v: Shown;
  if (prefs.zero && !i.zero) {
    if (!i.zeroVersion) return null;
    v = { key: "zero", zero: true, ...i.zeroVersion };
  } else {
    v = { key: "original", zero: i.zero, price: i.price, description: i.description, kcal: i.kcal, allergens: i.allergens, profile: i.profile };
  }
  return v.allergens.some((a) => prefs.avoid.includes(a.id)) ? null : v;
}

/**
 * Up to `n` suggestions for a mood. Every candidate is judged on the version
 * that would be suggested (its taste, its allergens); preferences are never
 * loosened: when nothing fits, the list is empty and the guest decides.
 */
export function recommend<T extends Choosable>(items: T[], prefs: GuestPrefs, score: (profile: number[]) => number, n = 3) {
  const fits = items
    .map((item) => ({ item, v: shownVersion(item, prefs) }))
    .filter((x): x is { item: T; v: Shown & { profile: number[] } } => Boolean(x.v?.profile));
  // without a preference for 0%, alcohol-free drinks come in only when the menu has too few others
  const boozy = fits.filter((x) => !x.v.zero);
  const pool = prefs.zero || boozy.length < n ? fits : boozy;
  return pool
    .map((x) => ({ ...x, score: score(x.v.profile) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}

/** a drink's address, keeping the menu's query (language, world) and naming the version when it is not the default */
export function itemHref(base: string, slug: string, query: string, key: VersionKey = "original") {
  const q = new URLSearchParams(query.startsWith("?") ? query.slice(1) : query);
  q.delete("v");
  if (key === "zero") q.set("v", "zero");
  const s = q.toString();
  return `${base}/${encodeURIComponent(slug)}${s ? `?${s}` : ""}`;
}

/** reads `?v=` from a page's search params: only "zero" means anything, anything else is the default */
export const versionParam = (v: string | string[] | undefined): VersionKey | undefined => (v === "zero" ? "zero" : undefined);
