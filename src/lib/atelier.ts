/**
 * The guest Atelier on the server: which menu line opens it (and so its price,
 * which is on the printed list like any other line), and the bar's shelf: the
 * bottles its own drinks use, plus the few every cocktail bar keeps, plus the
 * alcohol-free stand-ins when the bar pours 0% versions. Only that shelf goes
 * to the phone, never the catalogue.
 */
import { GARNISHES } from "@/data/cocktails";
import { ingredientById } from "@/data/ingredients";
import { REGISTER } from "@/data/kitchen";
import type { MenuItem, VenueMenu } from "@/domain/types";
import { allergensOf } from "./allergens";
import type { Role, ShelfBottle, ShelfGarnish } from "./atelierKit";
import { kindOf } from "./itemLook";
import type { Glass, Ingredient, L, WorldId } from "./types";
import { isAlcoholic, zeroSwap } from "./zero";

/** `details.style` of the menu line that opens the Atelier (kind "other") */
export const ATELIER = "atelier";
export const isAtelierLine = (it: Pick<MenuItem, "kind" | "details">) => kindOf(it) === "other" && it.details?.style === ATELIER;
export const atelierLineOf = (menu: VenueMenu) => menu.items.find((i) => i.available && isAtelierLine(i));

/** what every cocktail bar keeps, whatever its menu says */
const BASICS = ["lemon", "lime", "simple", "soda", "angostura"];
/** poured as a shot or a long coffee, not built into a frame */
const NOT_A_TOP = new Set(["espresso", "turkish-coffee", "cold-brew", "matcha"]);

export function rolesOf(i: Ingredient): Role[] {
  const r: Role[] = [];
  if (i.category === "spirit") r.push("base");
  if (i.category === "citrus") r.push(i.acid >= 2.2 ? "sour" : "juice");
  if (i.category === "syrup") r.push("sweet");
  if (i.category === "liqueur") r.push("liqueur");
  if (i.category === "wine") {
    if (i.shape === "sparkling") r.push("bubbles");
    else if (i.abv >= 0.14 || i.id === "zero-rosso" || i.id === "zero-dry") r.push("wine");
  }
  if (i.category === "mixer" && !NOT_A_TOP.has(i.id)) r.push("top");
  if (i.category === "bitters") r.push("bitters");
  if (i.id === "egg-white" || i.id === "aquafaba") r.push("foam");
  return r;
}

function bottle(i: Ingredient, zeroOnly: boolean): ShelfBottle {
  return {
    id: i.id,
    name: i.name,
    roles: rolesOf(i),
    allergens: allergensOf([{ id: i.id, ml: 1 }]),
    zero: !isAlcoholic(i.id),
    ...(zeroOnly ? { zeroOnly: true } : {}),
    category: i.category,
    abv: i.abv,
    sugar: i.sugar,
    acid: i.acid,
    color: i.color,
    ...(i.tint !== undefined ? { tint: i.tint } : {}),
    ...(i.opaque ? { opaque: true } : {}),
    ...(i.kcal ? { kcal: i.kcal } : {}),
    profile: i.profile,
  };
}

export interface Shelf {
  bottles: ShelfBottle[];
  garnishes: ShelfGarnish[];
  glasses: Glass[];
  offersZero: boolean;
}

/** the bar's shelf, read from its own (available) cocktails */
export function shelfOf(menu: VenueMenu): Shelf {
  const drinks = menu.items.filter((i) => i.available && kindOf(i) === "cocktail" && i.recipe);
  const ids = new Set<string>(BASICS);
  const garnishes = new Set<string>();
  const glasses = new Set<Glass>();
  for (const d of drinks) {
    d.recipe!.parts.forEach((p) => ids.add(p.id));
    garnishes.add(d.recipe!.garnish);
    glasses.add(d.recipe!.glass);
  }
  // the bar pours alcohol-free versions: their stand-ins are on its shelf too
  const offersZero = drinks.some((d) => d.zeroPrice !== undefined || d.recipe!.parts.every((p) => !isAlcoholic(p.id)));
  const extra = new Set<string>();
  if (offersZero) for (const id of ids) if (isAlcoholic(id)) for (const [z] of zeroSwap(id)) if (!ids.has(z)) extra.add(z);
  const out = [...[...ids].map((id) => [id, false] as const), ...[...extra].map((id) => [id, true] as const)]
    .map(([id, zeroOnly]) => {
      const i = ingredientById(id);
      // a zero-proof stand-in (0% gin…) is for alcohol-free drinks, even when the bar's own 0% recipes use it
      return i ? bottle(i, zeroOnly || Boolean(i.zero)) : undefined;
    })
    .filter((b): b is ShelfBottle => Boolean(b && b.roles.length));
  return {
    bottles: out,
    garnishes: [...garnishes].filter((g) => g !== "none" && GARNISHES[g]).map((id) => ({ id, name: GARNISHES[id], allergens: allergensOf([], id) })),
    glasses: [...glasses],
    offersZero,
  };
}

// ───────────────────────────── the menu line

const l = (tr: string, en: string): L => ({ tr, en });

/** the host's invitation at the top of the Atelier, one line per world */
export const ATELIER_INTRO: Record<WorldId, L> = {
  maison: l("Mermer tezgâh senin. Şişeleri seç, ölçüleri ayarla; gerisini barmenimize bırak.", "The marble counter is yours. Choose the bottles, set the measures; leave the rest to our bartender."),
  anatolia: l("Meyhanenin rafı açık. Gönlünce seç, ölçüsünü kendin koy; meyhaneci doldursun.", "The meyhane's shelf is open. Choose as you please, set your own measures; the meyhaneci will pour."),
  cosmos: l("Rotanı sen çiz: yakıtı, ekşiyi, tatlıyı seç; kaptan karıştırsın.", "Plot your own course: fuel, citrus, sugar. The captain will mix it."),
  jazz: l("Sahne senin. Notaları sen seç, barmen çalsın.", "You have the stage. Pick the notes; the bartender will play them."),
  sakura: l("Rafımız sana açık. Sade tut, dengeyi bul; barmen özenle hazırlasın.", "Our shelf is open to you. Keep it simple, find the balance; the bartender will make it with care."),
  alchemist: l("Kendi formülünü yaz: temel, asit, tatlı. Simyacı damıtsın.", "Write your own formula: base, acid, sweetness. The alchemist will distil it."),
  tiki: l("Kulübenin rafı senin. Adanı kendin kur; barmen çalkalasın.", "The hut's shelf is yours. Build your own island; the bartender will shake it."),
  boreal: l("Kuzeyin rafından seç: ayaz kadar berrak ya da ocak kadar sıcak. Barmen doldursun.", "Choose from the northern shelf: clear as frost or warm as the hearth. The bartender will pour."),
  riviera: l("Mahzenin kapısı açık. Bahçeden ve mahzenden seç; barmen hazırlasın.", "The cellar door is open. Choose from the garden and the cellar; the bartender will pour."),
};

/** the line a world's menu offers (demo bars, new bars started from a world): last among the signatures */
export function atelierLine(world: WorldId): Pick<MenuItem, "slug" | "name" | "description" | "price" | "kind" | "details"> {
  return {
    slug: "kendi-kokteylin",
    name: l("Kendi kokteylin", "Your own cocktail"),
    description: l("Rafımızdaki şişelerden kendi kokteylini tasarla; barmenimiz hazırlasın", "Design your own from the bottles on our shelf; our bartender will make it"),
    price: (Math.round((REGISTER[world] + 60) / 10) * 10) * 100,
    kind: "other",
    details: { style: ATELIER },
  };
}
