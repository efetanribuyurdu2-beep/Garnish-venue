/** Turkish labels for the bar panel (the panel is Turkish-first; the guest menu is bilingual). */

export const GLASS_LABEL: Record<string, string> = {
  coupe: "Coupe", martini: "Martini bardağı", nicknora: "Nick & Nora", flute: "Flüt", wine: "Şarap kadehi",
  rocks: "Rocks (Old Fashioned)", highball: "Highball", mug: "Bakır kupa", tiki: "Tiki kupası",
  raki: "Rakı kadehi", istikan: "İnce belli bardak", fincan: "Zarflı fincan", teacup: "Porselen fincan",
  ochoko: "Ochoko", masu: "Hinoki masu", orb: "Küre kadeh", beaker: "Beher", flask: "Balon joje",
  coconut: "Hindistan cevizi", pineapple: "Ananas", ryumka: "Ryumka", kuksa: "Huş kuksa",
  iceglass: "Buzdan bardak", kylix: "Kylix", terracotta: "Terakota kupa",
};

export const ICE_LABEL: Record<string, string> = {
  none: "Buzsuz (soğutulmuş bardak)", cube: "Küp buz", sphere: "Buz küresi", crushed: "Kırık buz", collins: "Uzun buz sütunu",
};

export const METHOD_LABEL: Record<string, string> = {
  shake: "Çalkalama (shake)", dryshake: "Kuru + buzlu çalkalama (köpüklü)", stir: "Karıştırma (stir)",
  build: "Bardakta hazırlama (build)", blend: "Blender", swizzle: "Swizzle",
};

export const WORLD_LINE: Record<string, string> = {
  maison: "Art Deco, siyah mermer, altın", anatolia: "Kilim, çini, nazar", cosmos: "Yıldızlar, nebula",
  jazz: "1920'ler speakeasy", sakura: "Kumiko, kintsugi, washi", alchemist: "Parşömen ve pirinç",
  tiki: "Bambu, tapa, meşaleler", boreal: "Kuzey ışıkları, huş", riviera: "Bağlar, limonlar, mahzen",
};

/** a URL-safe slug from a Turkish name: "Kına Gecesi" → "kina-gecesi" */
export function slugify(s: string) {
  const map: Record<string, string> = { ç: "c", ğ: "g", ı: "i", İ: "i", ö: "o", ş: "s", ü: "u", â: "a", î: "i", û: "u" };
  return s
    .trim()
    .replace(/[çğıİöşüâîûÇĞÖŞÜÂÎÛ]/g, (c) => map[c.toLowerCase()] ?? map[c] ?? c)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

/** "720" or "720,50" ↔ kuruş */
export const tlToKurus = (s: string) => {
  const n = Number(String(s).replace(/\s/g, "").replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? Math.round(n * 100) : NaN;
};
export const kurusToTl = (k?: number) => (k === undefined || k === null ? "" : (k / 100).toLocaleString("tr-TR", { maximumFractionDigits: 2 }).replace(/\./g, ""));
export const tl = (k: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: k % 100 ? 2 : 0 }).format(k / 100);
