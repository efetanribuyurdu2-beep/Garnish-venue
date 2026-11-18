import type { WorldId } from "./types";

/**
 * Google Fonts, per world. One stylesheet with all nine worlds' families was
 * 177 KB (the Japanese families alone bring hundreds of unicode-range blocks)
 * and held the first paint of every page. A guest page loads only its world's
 * families (plus the brand and body faces every page uses); the site, the panel
 * and the print pages, which show all worlds, load them all.
 * Every display font carries latin-ext (ğ ş ı İ).
 */
const FAMILIES: Record<string, string> = {
  "Cormorant Garamond": "ital,wght@0,400;0,500;0,600;1,400",
  Jost: "wght@300;400;500",
  "Bodoni Moda": "ital,wght@0,400;0,500;0,600;1,400",
  "Aref Ruqaa": "wght@400;700",
  Syncopate: "wght@400;700",
  "Exo 2": "wght@300;400;600",
  Limelight: "",
  "Poiret One": "",
  Forum: "",
  "Josefin Sans": "wght@300;400;600",
  "Zen Antique": "",
  "Shippori Mincho": "wght@400;600",
  "Zen Kaku Gothic New": "wght@300;400;500",
  "Grenze Gotisch": "wght@400;500;600",
  Kavoon: "",
  Karla: "wght@300;400;600",
  "Ruslan Display": "",
  Aboreto: "",
  Lora: "ital,wght@0,400;0,500;1,400",
};

/** the brand wordmark and the default body face: on every page */
const BASE = ["Cormorant Garamond", "Jost"];

/** the families each world names: garnish.css `[data-world]` tokens and `.wmenu-<world>` rules, backdrops.css (Sakura's tategaki) */
const WORLD: Record<WorldId, string[]> = {
  maison: ["Bodoni Moda"],
  anatolia: ["Aref Ruqaa"],
  cosmos: ["Syncopate", "Exo 2", "Karla", "Poiret One"],
  jazz: ["Limelight", "Poiret One", "Josefin Sans", "Karla"],
  sakura: ["Zen Antique", "Zen Kaku Gothic New", "Shippori Mincho"],
  alchemist: ["Grenze Gotisch"],
  tiki: ["Kavoon", "Karla"],
  boreal: ["Ruslan Display", "Forum", "Exo 2", "Karla", "Lora", "Poiret One"],
  riviera: ["Aboreto", "Lora", "Exo 2", "Karla", "Poiret One"],
};

/** the stylesheet address for these worlds' families, or for every family when none are given */
export function fontsHref(worlds?: WorldId[]) {
  const names = worlds ? [...new Set([...BASE, ...worlds.flatMap((w) => WORLD[w])])] : Object.keys(FAMILIES);
  const q = names.map((n) => `family=${n.replace(/ /g, "+")}${FAMILIES[n] ? `:${FAMILIES[n]}` : ""}`).join("&");
  return `https://fonts.googleapis.com/css2?${q}&display=swap`;
}
