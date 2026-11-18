/**
 * "Suggest a drink": six moods as points in Garnish's taste space
 * (sweet, sour, bitter, strong, fresh, aromatic; 0–5), and a match score
 * between a mood and a drink's computed profile. Pure, runs in the browser.
 */
import type { L } from "./types";

export const AXES = ["sweet", "sour", "bitter", "strong", "fresh", "aromatic"] as const;

export interface Mood {
  id: string;
  name: L;
  hint: L;
  target: number[]; // AXES order
  weight: number[]; // what matters most for this mood
}

export const MOODS: Mood[] = [
  { id: "fresh", name: { tr: "Ferah ve hafif", en: "Fresh and light" }, hint: { tr: "Uzun, serin, yaz akşamı", en: "Long, cool, a summer evening" }, target: [2, 2.5, 0.5, 1, 4.5, 2], weight: [1, 1, 1, 1.6, 2, 0.8] },
  { id: "sour", name: { tr: "Ekşi ve canlı", en: "Sour and bright" }, hint: { tr: "Narenciye, köpük, enerji", en: "Citrus, foam, energy" }, target: [2.5, 4.5, 0.5, 2, 3, 1.5], weight: [1, 2, 1, 1, 1, 0.8] },
  { id: "strong", name: { tr: "Sert ve derin", en: "Strong and deep" }, hint: { tr: "Karıştırılmış, yavaş içilen", en: "Stirred, to sip slowly" }, target: [1.5, 0.5, 2.5, 4.5, 0.5, 3], weight: [1, 1.2, 1, 2, 1, 1] },
  { id: "sweet", name: { tr: "Tatlı ve kadifemsi", en: "Sweet and velvety" }, hint: { tr: "Yumuşak, kremsi, tatlı yerine", en: "Smooth, creamy, instead of dessert" }, target: [4.5, 1, 0.5, 2, 1, 2.5], weight: [2, 1, 1.2, 1, 1, 1] },
  { id: "bitter", name: { tr: "Acı ve iştah açıcı", en: "Bitter and appetising" }, hint: { tr: "Aperitivo, yemekten önce", en: "Aperitivo, before dinner" }, target: [2, 1, 4.5, 2.5, 1.5, 3], weight: [1, 1, 2, 1, 1, 1] },
  { id: "aromatic", name: { tr: "Aromatik ve çiçeksi", en: "Aromatic and floral" }, hint: { tr: "Bitkiler, çiçekler, baharat", en: "Herbs, flowers, spice" }, target: [2.5, 2, 1, 2, 3, 4.5], weight: [1, 1, 1, 1, 1, 2] },
];

/** 0..100: how well a drink's profile fits the mood */
export function match(profile: number[], mood: Mood): number {
  let d = 0;
  let w = 0;
  AXES.forEach((_, i) => {
    d += mood.weight[i] * (profile[i] - mood.target[i]) ** 2;
    w += mood.weight[i] * 25;
  });
  return Math.round(100 * (1 - Math.sqrt(d / w)));
}
