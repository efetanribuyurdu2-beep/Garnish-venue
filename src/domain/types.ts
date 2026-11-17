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

export interface MenuItem {
  id: string;
  venueId: string;
  sectionId: string;
  slug: string;
  name: L;
  description: L; // one line on the menu
  story?: L; // longer text on the item page
  price: Money;
  recipe: Recipe;
  available: boolean; // false = "bitti" (sold out), hidden from guests
  featured?: boolean;
  /** price of the alcohol-free version, if the bar offers one; the recipe is derived with toZero() */
  zeroPrice?: Money;
  /** allergens the bar declares on top of the computed ones (house syrups, garnishes…) */
  extraAllergens?: string[];
  libraryId?: string; // Garnish catalogue cocktail it was started from
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
