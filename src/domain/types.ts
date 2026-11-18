/**
 * The product's own model: venues, their menus and what a guest sees.
 * The drink maths (ingredients, recipes, balance) is the Garnish core in
 * src/lib and src/data; a menu item points at a recipe made of core
 * ingredient ids, so ABV, calories and allergens are always computed, never typed.
 */
import type { Glass, Ice, L, Lang, Method, PaletteId, Part, WorldId } from "@/lib/types";

/** Money is stored in the smallest unit (kuruş), never as a float. */
export type Money = number;

export interface Venue {
  id: string;
  slug: string; // /v/<slug>
  name: string; // the bar's own name, shown as written
  tagline: L;
  city: string;
  world: WorldId; // the Garnish world the menu is dressed in
  palette?: PaletteId; // Maison only
  currency: "TRY" | "EUR" | "USD";
  languages: Lang[]; // first = default
  footer?: L; // house line under the menu
  serviceNote?: L; // legal / house notes (e.g. "Prices include VAT")
  instagram?: string;
}

export interface MenuSection {
  id: string;
  venueId: string;
  title: L;
  note?: L;
  position: number;
}

export interface Recipe {
  parts: Part[]; // core ingredient ids + ml
  method: Method;
  glass: Glass;
  ice: Ice;
  garnish: string; // key in GARNISHES
}

/** A photograph of the drink: the bar's own upload, or a credited stock photo (demo). */
export interface Photo {
  url: string; // public URL (Supabase storage, or Unsplash urls.raw)
  alt?: L;
  color?: string; // average colour, painted while it loads
  credit?: { author: string; authorUrl: string; sourceUrl: string; source: "unsplash" };
}

/** What a menu line is. Cocktails are computed from their recipe; the rest are described by the bar. */
export type ItemKind = "cocktail" | "wine" | "beer" | "spirit" | "food" | "other";

/** For everything that is not a cocktail: what the bar tells us instead of a recipe. */
export interface ItemDetails {
  style?: string; // wine: red | white | rose | sparkling | orange; beer: lager | ale | dark | wheat; spirit: whisky | rum | clear | agave | anise | brandy; other: coffee | tea | soft | water
  abv?: number; // percent, e.g. 13.5
  volume?: number; // ml (drinks) or g (food) per serving
  serving?: L; // "Kadeh · 150 ml", "Porsiyon"
  kcal?: number; // per serving, if the bar knows it
  origin?: L; // producer, region, grape…
  alt?: { label: L; price: number }; // a second size: bottle, double…
}

export interface MenuItem {
  id: string;
  venueId: string;
  sectionId: string;
  slug: string;
  name: L;
  description: L; // one line on the menu
  story?: L; // longer text on the item page
  price: Money;
  kind?: ItemKind; // default cocktail
  recipe?: Recipe; // cocktails only
  details?: ItemDetails; // everything else
  available: boolean; // false = "bitti" (sold out), hidden from guests
  featured?: boolean;
  /** price of the alcohol-free version, if the bar offers one; the recipe is derived with toZero() */
  zeroPrice?: Money;
  /** allergens the bar declares on top of the computed ones (house syrups, garnishes…) */
  extraAllergens?: string[];
  libraryId?: string; // Garnish catalogue cocktail it was started from
  photo?: Photo; // shown instead of the drawn glass when present
  position: number;
}

export interface PriceChange {
  itemId: string;
  from: Money;
  to: Money;
  at: string; // ISO date
  by?: string;
}

/** Everything the guest menu needs, in one read. */
export interface VenueMenu {
  venue: Venue;
  sections: MenuSection[];
  items: MenuItem[];
}
