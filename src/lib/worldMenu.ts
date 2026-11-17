/**
 * Each world sets its menu in its own way, as on the Garnish site (WorldMenu):
 * how drinks are numbered or marked, the line above the bar's name, the line
 * under the menu, and Japanese names for Sakura's oshinagaki. Prices are always
 * real prices; the world's mark sits beside them.
 */
import type { L, Root, WorldId } from "./types";

export interface MarkInput {
  index: number; // 0-based, across the whole menu
  id: string; // stable id (hash source)
  abv: number; // fraction
  year?: string; // from the Garnish catalogue
  root?: Root; // cocktail family
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI", "XXII", "XXIII", "XXIV", "XXV", "XXVI", "XXVII", "XXVIII", "XXIX", "XXX"];
const KANJI = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
const kanji = (n: number) => (n <= 10 ? KANJI[n - 1] : n < 20 ? `十${KANJI[n - 11]}` : `${KANJI[Math.floor(n / 10) - 1]}十${n % 10 ? KANJI[(n % 10) - 1] : ""}`);
const arabic = (n: number) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[+d]);
const hash = (s: string) => [...s].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);
/** classical planet signs for the six families (in ordinary fonts, unlike the alchemical block) */
const PLANET: Record<Root, string> = { oldfashioned: "♄", martini: "☿", daiquiri: "☽", sidecar: "☉", highball: "♃", flip: "♀" };
const PLANETS = Object.values(PLANET);

export const MARK: Record<WorldId, (m: MarkInput) => string> = {
  maison: (m) => `No. ${ROMAN[m.index] ?? m.index + 1}`,
  anatolia: (m) => arabic(m.index + 1),
  cosmos: (m) => {
    const h = hash(m.id);
    return `${String(h % 24).padStart(2, "0")}h ${String((h >>> 5) % 60).padStart(2, "0")}m · ${(h >>> 11) % 2 ? "+" : "−"}${(h >>> 12) % 89}°`;
  },
  // a speakeasy marks strength in proof (twice the ABV)
  jazz: (m) => (m.abv > 0.005 ? `${Math.round(m.abv * 200)} proof` : "dry"),
  sakura: (m) => kanji(m.index + 1),
  alchemist: (m) => (m.root ? PLANET[m.root] : PLANETS[hash(m.id) % PLANETS.length]),
  tiki: (m) => "●".repeat(m.abv > 0.24 ? 3 : m.abv > 0.13 ? 2 : m.abv > 0.01 ? 1 : 0).padEnd(3, "○"),
  boreal: (m) => `❄ ${Math.round(m.abv * 100)}°`,
  riviera: (m) => m.year ?? `N° ${m.index + 1}`,
};

/** the line over the bar's name and the line under the menu, in the world's voice */
export const HEAD: Record<WorldId, { kicker: L; foot: L; markNote?: L }> = {
  maison: { kicker: { tr: "Carte des Cocktails", en: "Carte des Cocktails" }, foot: { tr: "Her kokteyl siparişle, kristal kadehte hazırlanır.", en: "Every cocktail is mixed to order and served in crystal." } },
  anatolia: { kicker: { tr: "Fasıl · Kadeh · Meze", en: "Fasıl · Glass · Meze" }, foot: { tr: "Şerefe! Masanıza bir tabak leblebi ikramımızdır.", en: "Şerefe! A plate of roasted chickpeas comes with every table." } },
  cosmos: { kicker: { tr: "Uçuş Manifestosu · Sektör 9", en: "Flight Manifest · Sector 9" }, foot: { tr: "Koordinatlar yaklaşıktır. Yer çekimi bu katta isteğe bağlıdır.", en: "Coordinates approximate. Gravity on this deck is optional." } },
  jazz: {
    kicker: { tr: "Yalnızca üyeler · Est. 1923", en: "Members only · Est. 1923" },
    foot: { tr: "Kapıdaki adama parolayı fısılda. Kimseye söyleme.", en: "Whisper the password to the man at the door. Tell no one." },
    markNote: { tr: "Proof: alkol oranının iki katı, eski usul.", en: "Proof: twice the strength, the old way." },
  },
  sakura: { kicker: { tr: "お品書き · Oshinagaki", en: "お品書き · Oshinagaki" }, foot: { tr: "Buz elde yontulur. Bir yudum, bir mevsim.", en: "Ice is carved by hand. One sip, one season." } },
  alchemist: {
    kicker: { tr: "Liber Potionum · Formüller ve İksirler", en: "Liber Potionum · Formulae & Elixirs" },
    foot: { tr: "Laboratuvarımızda her formül siparişle hazırlanır.", en: "Every formula in our laboratory is prepared to order." },
    markNote: { tr: "Her işaret bir aileyi gösterir: ♄ ağır, ☿ berrak, ☽ ekşi, ☉ altın, ♃ ferah, ♀ kadifemsi.", en: "Each sign marks a family: ♄ weighty, ☿ clear, ☽ sour, ☉ golden, ♃ airy, ♀ velvety." },
  },
  tiki: {
    kicker: { tr: "Grog Defteri · Lagün Barı", en: "Grog Log · Lagoon Bar" },
    foot: { tr: "Mahalo! Meşaleler gece yarısına kadar yanar.", en: "Mahalo! The torches burn until midnight." },
    markNote: { tr: "● Mana gücü: ne kadar dolu, o kadar sert.", en: "● Mana strength: the fuller, the stronger." },
  },
  boreal: {
    kicker: { tr: "Меню · Meny · Menü", en: "Меню · Meny · Menu" },
    foot: { tr: "Skål! На здоровье! Soba sabaha kadar yanar.", en: "Skål! На здоровье! The stove burns till morning." },
    markNote: { tr: "❄ Derece, alkol oranıdır.", en: "❄ Degrees mean strength." },
  },
  riviera: {
    kicker: { tr: "La Carte · Il Menù · Το Μενού", en: "La Carte · Il Menù · Το Μενού" },
    foot: { tr: "Santé · Salute · Γειά μας!", en: "Santé · Salute · Γειά μας!" },
    markNote: { tr: "Yıllar, kokteylin doğduğu bağ bozumudur.", en: "Years are each cocktail's vintage." },
  },
};

/** Sakura's oshinagaki writes each drink in Japanese, top to bottom (Garnish catalogue ids). */
export const JA: Record<string, string> = {
  martini: "ドライ・マティーニ", negroni: "ネグローニ", "old-fashioned": "オールド・ファッションド", manhattan: "マンハッタン", daiquiri: "ダイキリ",
  margarita: "マルガリータ", "whiskey-sour": "ウイスキー・サワー", gimlet: "ギムレット", mojito: "モヒート", "moscow-mule": "モスコー・ミュール",
  "aperol-spritz": "アペロール・スプリッツ", "french-75": "フレンチ75", boulevardier: "ブールヴァルディエ", sidecar: "サイドカー",
  paloma: "パロマ", "espresso-martini": "エスプレッソ・マティーニ", americano: "アメリカーノ", "tom-collins": "トム・コリンズ",
  "shirley-temple": "シャーリー・テンプル", pussyfoot: "プッシーフット", "lime-rickey": "ライム・リッキー",
  "japanese-highball": "ハイボール", "hanami-sour": "花見サワー", "yuzu-whisky-sour": "柚子ウイスキーサワー", "matcha-fizz": "抹茶フィズ",
  "umeshu-spritz": "梅酒スプリッツ", saketini: "サケティーニ", "matcha-tonic": "抹茶トニック", "haru-soda": "春ソーダ",
};
/** section headings for the oshinagaki, by position */
export const JA_SECTIONS = ["花見の品", "定番", "酒なし", "季節の品", "おすすめ"];
