/**
 * The guest Atelier's rules ("Kendi kokteylini tasarla"), shared by the server,
 * which builds the bar's shelf, and the phone, which mixes on it: six family
 * frames and what each slot takes, glasses and ice, names, the one-tap balance
 * correction and "Şansına". Pure, with no runtime imports except the maths
 * (tests/atelier.test.mjs runs it in plain Node).
 */
import { analyseWith, type Analysis, type MixIngredient } from "./mix";
import type { Glass, Ice, L, Lang, Method, Part, WorldId } from "./types";

/** what a bottle can do in a drink */
export type Role = "base" | "sour" | "juice" | "sweet" | "liqueur" | "wine" | "bubbles" | "top" | "bitters" | "foam";

/** one bottle on the bar's shelf, as the phone receives it: only what the maths and the card need */
export interface ShelfBottle extends MixIngredient {
  id: string;
  name: L;
  roles: Role[];
  allergens: string[];
  zero: boolean; // alcohol-free
  zeroOnly?: boolean; // a stand-in the bar pours only for alcohol-free drinks
}
export interface ShelfGarnish {
  id: string;
  name: L;
  allergens: string[];
}

export type FrameId = "sour" | "daisy" | "martini" | "oldfashioned" | "highball" | "spritz";
export type SlotKey = "base" | "sour" | "sweet" | "liqueur" | "wine" | "bubbles" | "top" | "bitters";
type Serve = "up" | "low" | "tall" | "wine";

export interface SlotDef {
  key: SlotKey;
  roles: Role[];
  ml: number; // the frame's usual measure
  min: number;
  max: number;
  step: number;
  optional?: boolean;
  top?: boolean; // poured last, to fill
  dash?: boolean; // bitters: counted in dashes (1 dash ≈ 1 ml)
}

export interface FrameDef {
  id: FrameId;
  name: L;
  hint: L;
  slots: SlotDef[];
  method: Method;
  serves: Serve[]; // up (no ice), low (on the rocks), tall, wine: the first is the classic
  glass: Glass; // the classic glass
  foam?: boolean; // an egg-white (or aquafaba) foam can be added
  garnish: string[]; // in order of preference
}

const l = (tr: string, en: string): L => ({ tr, en });
const S = (key: SlotKey, roles: Role[], ml: number, min: number, max: number, step: number, extra: Partial<SlotDef> = {}): SlotDef => ({ key, roles, ml, min, max, step, ...extra });

export const FRAMES: FrameDef[] = [
  {
    id: "sour",
    name: l("Sour", "Sour"),
    hint: l("Temel, ekşi, tatlı: dengenin en sade hâli", "Spirit, citrus, sugar: balance at its simplest"),
    slots: [S("base", ["base"], 50, 30, 60, 5), S("sour", ["sour"], 22.5, 10, 30, 2.5), S("sweet", ["sweet"], 20, 5, 30, 2.5)],
    method: "shake",
    serves: ["up", "low"],
    glass: "coupe",
    foam: true,
    garnish: ["lemon-twist", "lime-wheel", "lemon-wheel", "orange-twist"],
  },
  {
    id: "daisy",
    name: l("Daisy", "Daisy"),
    hint: l("Tatlıyı bir likör verir", "A liqueur brings the sweetness"),
    slots: [S("base", ["base"], 45, 30, 60, 5), S("liqueur", ["liqueur"], 20, 10, 30, 2.5), S("sour", ["sour"], 20, 10, 30, 2.5)],
    method: "shake",
    serves: ["up", "low"],
    glass: "coupe",
    garnish: ["orange-twist", "lemon-twist", "lime-wheel", "salt-rim"],
  },
  {
    id: "martini",
    name: l("Martini", "Martini"),
    hint: l("Karıştırılmış, berrak, sert", "Stirred, clear and strong"),
    slots: [S("base", ["base"], 50, 30, 60, 5), S("wine", ["wine"], 20, 5, 40, 5), S("bitters", ["bitters"], 1, 1, 3, 1, { optional: true, dash: true })],
    method: "stir",
    serves: ["up"],
    glass: "martini",
    garnish: ["lemon-twist", "olive", "orange-twist", "cherry"],
  },
  {
    id: "oldfashioned",
    name: l("Old Fashioned", "Old Fashioned"),
    hint: l("Bir parça şeker, birkaç dash bitter", "A little sugar, a few dashes of bitters"),
    slots: [S("base", ["base"], 60, 45, 60, 5), S("sweet", ["sweet"], 7.5, 5, 15, 2.5), S("bitters", ["bitters"], 2, 1, 4, 1, { dash: true })],
    method: "stir",
    serves: ["low"],
    glass: "rocks",
    garnish: ["orange-twist", "lemon-twist", "cherry"],
  },
  {
    id: "highball",
    name: l("Highball", "Highball"),
    hint: l("Uzun, ferah, köpüklü", "Long, fresh and bubbly"),
    slots: [
      S("base", ["base"], 45, 30, 60, 5),
      S("sour", ["sour"], 10, 5, 20, 2.5, { optional: true }),
      S("sweet", ["sweet", "liqueur"], 10, 5, 20, 2.5, { optional: true }),
      S("top", ["top", "juice"], 120, 80, 160, 10, { top: true }),
    ],
    method: "build",
    serves: ["tall"],
    glass: "highball",
    garnish: ["lemon-wheel", "lime-wheel", "orange-slice", "mint", "lemon-twist"],
  },
  {
    id: "spritz",
    name: l("Spritz", "Spritz"),
    hint: l("Aperitif, köpüklü şarap, bir parmak soda", "Aperitivo, sparkling wine, a splash of soda"),
    slots: [S("liqueur", ["liqueur"], 60, 30, 75, 7.5), S("bubbles", ["bubbles"], 90, 60, 120, 10), S("top", ["top"], 30, 10, 60, 10, { optional: true, top: true })],
    method: "build",
    serves: ["wine", "tall"],
    glass: "wine",
    garnish: ["orange-slice", "lemon-wheel", "olive", "rosemary"],
  },
];

export const frameById = (id: string) => FRAMES.find((f) => f.id === id);

export const SLOT_NAME: Record<SlotKey, L> = {
  base: l("Temel", "Base spirit"),
  sour: l("Ekşi", "Citrus"),
  sweet: l("Tatlı", "Sweetener"),
  liqueur: l("Likör", "Liqueur"),
  wine: l("Aromalı şarap", "Aromatised wine"),
  bubbles: l("Köpüklü", "Sparkling"),
  top: l("Üstüne", "Top up with"),
  bitters: l("Bitter", "Bitters"),
};

/** which glasses suit a way of serving, house classics first, then the world's own vessels */
const SUIT: Record<Serve, Glass[]> = {
  up: ["coupe", "nicknora", "martini", "teacup", "orb", "kylix", "flask", "beaker"],
  low: ["rocks", "masu", "kuksa", "istikan", "iceglass", "terracotta"],
  tall: ["highball", "mug", "tiki", "coconut", "pineapple", "raki"],
  wine: ["wine", "flute", "kylix"],
};

/** the glasses this bar can serve a frame in (from the glasses its own drinks use); the classic one first, always */
export function glassesFor(f: FrameDef, bar: Glass[]): Glass[] {
  const per = f.serves.map((sv) => SUIT[sv].filter((g) => bar.includes(g)));
  // the classic, then the first of each other way of serving (a sour on the rocks), then the rest
  return [...new Set([f.glass, ...per.map((l) => l[0]).filter(Boolean), ...per.flat()])].slice(0, 5);
}

/** ice follows the glass: none in a stemmed glass, a cube or the sphere on the rocks, a spear or crushed ice in a tall one */
export function iceFor(f: FrameDef, g: Glass): Ice {
  const sv = f.serves.find((x) => SUIT[x].includes(g)) ?? f.serves[0];
  if (sv === "up") return "none";
  if (sv === "low") return f.id === "oldfashioned" ? "sphere" : "cube";
  if (sv === "wine") return g === "flute" ? "none" : "cube";
  return g === "coconut" || g === "pineapple" || g === "tiki" ? "crushed" : "collins";
}

export const GLASS_NAME: Record<Glass, L> = {
  coupe: l("Coupe", "Coupe"),
  martini: l("Martini kadehi", "Martini glass"),
  rocks: l("Rocks", "Rocks glass"),
  highball: l("Highball", "Highball"),
  flute: l("Flüt", "Flute"),
  nicknora: l("Nick & Nora", "Nick & Nora"),
  mug: l("Bakır kupa", "Copper mug"),
  tiki: l("Tiki kupası", "Tiki mug"),
  wine: l("Şarap kadehi", "Wine glass"),
  fincan: l("Zarflı fincan", "Zarf cup"),
  istikan: l("İnce belli bardak", "Tulip tea glass"),
  raki: l("Rakı kadehi", "Rakı glass"),
  ochoko: l("Ochoko", "Ochoko"),
  masu: l("Hinoki masu", "Hinoki masu"),
  teacup: l("Porselen fincan", "Teacup"),
  orb: l("Küre kadeh", "Orb glass"),
  beaker: l("Beher", "Beaker"),
  flask: l("Balon joje", "Flask"),
  coconut: l("Hindistan cevizi", "Coconut"),
  pineapple: l("Ananas", "Pineapple"),
  ryumka: l("Ryumka", "Ryumka"),
  kuksa: l("Huş kuksa", "Birch kuksa"),
  iceglass: l("Buzdan bardak", "Glass of ice"),
  kylix: l("Kylix", "Kylix"),
  terracotta: l("Terakota kupa", "Terracotta cup"),
};

export const METHOD_NAME: Record<Method, L> = {
  shake: l("Buzla çalkalanır", "Shaken on ice"),
  dryshake: l("Önce buzsuz, sonra buzla çalkalanır", "Dry-shaken, then shaken on ice"),
  stir: l("Buzla karıştırılır", "Stirred on ice"),
  build: l("Bardakta hazırlanır", "Built in the glass"),
  blend: l("Blenderda", "Blended"),
  swizzle: l("Swizzle", "Swizzled"),
};

export const ICE_NAME: Record<Ice, L> = {
  none: l("buzsuz, soğuk bardak", "no ice, chilled glass"),
  cube: l("küp buz", "ice cubes"),
  sphere: l("buz küresi", "ice sphere"),
  crushed: l("kırık buz", "crushed ice"),
  collins: l("uzun buz", "collins spear"),
};

// ───────────────────────────── the guest's drink

export interface Design {
  frame: FrameId;
  picks: Partial<Record<SlotKey, { id: string; ml: number }>>;
  glass: Glass;
  garnish: string; // "none" for none
  foam: boolean;
  name: string; // as the guest typed it; empty = the suggested name
}

/** the bottles the guest may use: alcohol-free only when asked, and never one with an allergen they left out */
export function usable(shelf: ShelfBottle[], prefs: { zero: boolean; avoid: string[] }) {
  const fits = (b: ShelfBottle) => !b.allergens.some((a) => prefs.avoid.includes(a));
  const pool = shelf.filter((b) => (prefs.zero ? b.zero : !b.zeroOnly));
  const ok = pool.filter(fits);
  return { bottles: ok, hidden: pool.length - ok.length };
}

export const forSlot = (s: SlotDef, bottles: ShelfBottle[]) => bottles.filter((b) => s.roles.some((r) => b.roles.includes(r)));

/** a frame is possible when every slot it needs has a bottle */
export const possible = (f: FrameDef, bottles: ShelfBottle[]) => f.slots.every((s) => s.optional || forSlot(s, bottles).length > 0);

/** the foam the guest can add, if any: egg white, or aquafaba (vegan) when egg is left out or there is no egg */
export const foamOf = (bottles: ShelfBottle[]) => bottles.find((b) => b.id === "egg-white") ?? bottles.find((b) => b.id === "aquafaba");

export function methodOf(d: Design): Method {
  const f = frameById(d.frame)!;
  return d.foam && f.foam ? "dryshake" : f.method;
}

/** the recipe, in pouring order */
export function partsOf(d: Design, bottles: ShelfBottle[]): Part[] {
  const f = frameById(d.frame)!;
  const parts: Part[] = [];
  for (const s of f.slots) {
    const p = d.picks[s.key];
    if (p && p.ml > 0) parts.push(s.top ? { id: p.id, ml: p.ml, top: true } : { id: p.id, ml: p.ml });
  }
  const foam = d.foam && f.foam ? foamOf(bottles) : undefined;
  if (foam) parts.splice(Math.min(3, parts.length), 0, { id: foam.id, ml: 20 });
  return parts;
}

export function analyseDesign(d: Design, shelf: ShelfBottle[]): Analysis {
  const by = new Map(shelf.map((b) => [b.id, b]));
  return analyseWith(partsOf(d, shelf), methodOf(d), (id) => by.get(id));
}

/** the garnish a bartender would reach for, among the bar's own */
export function garnishFor(f: FrameDef, picks: Design["picks"], have: string[]): string {
  const sour = picks.sour?.id;
  // a lemon sour gets lemon, a lime one lime
  const clash = sour === "lemon" ? /^lime/ : sour === "lime" ? /^lemon/ : undefined;
  const first = sour === "lime" ? ["lime-wheel"] : sour === "lemon" ? ["lemon-twist", "lemon-wheel"] : [];
  return [...first, ...f.garnish].find((g) => have.includes(g) && !clash?.test(g)) ?? "none";
}

const snap = (v: number, s: SlotDef) => Math.min(s.max, Math.max(s.min, Math.round(v / s.step) * s.step));

/** a frame filled with the first good bottles, at its usual measures */
export function startFrame(f: FrameDef, bottles: ShelfBottle[], garnishes: string[], barGlasses: Glass[], keep?: Design): Design {
  const picks: Design["picks"] = {};
  for (const s of f.slots) {
    const list = forSlot(s, bottles);
    // the same bottle carries over when the guest changes frame (their gin stays their gin)
    const kept = keep?.picks[s.key];
    const prev = kept && list.some((b) => b.id === kept.id) ? kept.id : undefined;
    if (s.optional && !prev) continue;
    const id = prev ?? list[0]?.id;
    if (id) picks[s.key] = { id, ml: s.ml };
  }
  const glass = glassesFor(f, barGlasses)[0];
  return { frame: f.id, picks, glass, garnish: garnishFor(f, picks, garnishes), foam: false, name: keep?.name ?? "" };
}

/** one bartender's correction: more citrus when it is too sweet, more sugar when too sharp */
export function correction(d: Design, a: Analysis): { key: SlotKey; ml: number } | undefined {
  const f = frameById(d.frame)!;
  if (!a.tip?.ml || (a.tip.kind !== "add-acid" && a.tip.kind !== "add-sugar")) return undefined;
  const want: SlotKey[] = a.tip.kind === "add-acid" ? ["sour"] : ["sweet", "liqueur"];
  const s = f.slots.find((x) => want.includes(x.key) && d.picks[x.key]);
  if (!s) return undefined;
  const now = d.picks[s.key]!.ml;
  const ml = snap(now + Math.min(a.tip.ml, 15), s);
  return ml > now ? { key: s.key, ml } : undefined;
}

export function applyCorrection(d: Design, c: { key: SlotKey; ml: number }): Design {
  const p = d.picks[c.key];
  return p ? { ...d, picks: { ...d.picks, [c.key]: { ...p, ml: c.ml } } } : d;
}

// ───────────────────────────── names

const WORDS: Record<WorldId, L[]> = {
  maison: [l("Altın Saat", "Golden Hour"), l("Kristal", "Crystal"), l("Gece Yarısı", "Midnight"), l("Le Salon", "Le Salon"), l("Mermer", "Marble")],
  anatolia: [l("Lale", "Tulip"), l("Nazar", "Nazar"), l("Kilim", "Kilim"), l("Mehtap", "Moonlight"), l("Çini", "Çini")],
  cosmos: [l("Nebula", "Nebula"), l("Yörünge", "Orbit"), l("Kuyrukluyıldız", "Comet"), l("Kara Delik", "Black Hole"), l("Pulsar", "Pulsar")],
  jazz: [l("Gece Seti", "Late Set"), l("Kornet", "Cornet"), l("Kadife", "Velvet"), l("Parola", "Password"), l("Plak", "Vinyl")],
  sakura: [l("Hanami", "Hanami"), l("Yozakura", "Yozakura"), l("Kintsugi", "Kintsugi"), l("Fener", "Lantern"), l("Çiy", "Dew")],
  alchemist: [l("İksir", "Elixir"), l("Simya", "Alchemy"), l("Merkür", "Mercury"), l("Damıtık", "Distillate"), l("Altın Taş", "Philosopher's")],
  tiki: [l("Lagün", "Lagoon"), l("Meşale", "Torch"), l("Mercan", "Coral"), l("Volkan", "Volcano"), l("Aloha", "Aloha")],
  boreal: [l("Aurora", "Aurora"), l("Kar Tanesi", "Snowflake"), l("Huş", "Birch"), l("Kutup", "Polar"), l("Taiga", "Taiga")],
  riviera: [l("Bağ", "Vineyard"), l("Limon Bahçesi", "Lemon Grove"), l("Mahzen", "Cellar"), l("Gün Batımı", "Sunset"), l("Zeytin", "Olive")],
};

/** a name in the world's voice, the same for the same drink (it changes only when the guest asks for another) */
export function suggestName(world: WorldId, frame: FrameId, lang: Lang, n = 0) {
  const words = WORDS[world];
  const w = words[((n % words.length) + words.length) % words.length];
  return `${w[lang]} ${frameById(frame)!.name[lang]}`;
}

// ───────────────────────────── "Şansına"

/** a random drink that still balances: a frame, bottles from the guest's usable shelf, one correction */
export function draw(bottles: ShelfBottle[], garnishes: string[], barGlasses: Glass[], rand: () => number = Math.random): Design | undefined {
  const frames = FRAMES.filter((f) => possible(f, bottles));
  if (!frames.length) return undefined;
  const weighted = frames.flatMap((f) => (f.id === "sour" || f.id === "daisy" || f.id === "highball" ? [f, f] : [f]));
  const one = <T,>(a: T[]) => a[Math.floor(rand() * a.length)];
  const f = one(weighted);
  const picks: Design["picks"] = {};
  const used = new Set<string>();
  for (const s of f.slots) {
    if (s.optional && rand() < 0.5) continue;
    const list = forSlot(s, bottles).filter((b) => !used.has(b.id));
    if (!list.length) continue;
    const b = one(list);
    used.add(b.id);
    picks[s.key] = { id: b.id, ml: s.dash ? s.ml : snap(s.ml + (Math.floor(rand() * 5) - 2) * s.step, s) };
  }
  const glasses = glassesFor(f, barGlasses);
  const foam = Boolean(f.foam && foamOf(bottles) && rand() < 0.3);
  const garnishPool = f.garnish.filter((g) => garnishes.includes(g));
  let d: Design = { frame: f.id, picks, glass: one(glasses), garnish: garnishPool.length ? one(garnishPool) : garnishFor(f, picks, garnishes), foam, name: "" };
  const fix = correction(d, analyseDesign(d, bottles));
  if (fix) d = applyCorrection(d, fix);
  return d;
}

/** amounts as a bartender reads them: "22,5 ml", "2 dash" */
export function amount(ml: number, dash: boolean | undefined, lang: Lang) {
  if (dash) return `${ml} dash`;
  return `${String(ml).replace(".", lang === "tr" ? "," : ".")} ml`;
}

/**
 * The guest's drink, kept to what they may have now: when a preference changes
 * (alcohol-free on, an allergen left out) a bottle they can no longer have is
 * swapped for the first one that fits, never kept.
 */
export function sanitize(d: Design | null, bottles: ShelfBottle[], garnishes: string[], barGlasses: Glass[]): Design | null {
  const frames = FRAMES.filter((f) => possible(f, bottles));
  if (!frames.length) return null;
  const f = d ? frames.find((x) => x.id === d.frame) : undefined;
  if (!d || !f) return startFrame(frames[0], bottles, garnishes, barGlasses, d ?? undefined);
  const picks: Design["picks"] = {};
  for (const s of f.slots) {
    const p = d.picks[s.key];
    const list = forSlot(s, bottles);
    if (p && list.some((b) => b.id === p.id)) picks[s.key] = p;
    else if (!s.optional && list[0]) picks[s.key] = { id: list[0].id, ml: p?.ml ?? s.ml };
  }
  const glasses = glassesFor(f, barGlasses);
  return {
    ...d,
    picks,
    glass: glasses.includes(d.glass) ? d.glass : glasses[0],
    garnish: d.garnish === "none" || garnishes.includes(d.garnish) ? d.garnish : garnishFor(f, picks, garnishes),
    foam: d.foam && Boolean(foamOf(bottles)),
  };
}
