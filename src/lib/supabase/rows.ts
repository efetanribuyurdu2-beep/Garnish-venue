/**
 * Database rows ↔ the product model. One place for column names, so the guest
 * menu (server, anon key) and the panel (browser, signed-in member) agree.
 */
import type { MenuItem, MenuSection, Venue } from "@/domain/types";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const venueFrom = (r: any): Venue & { published: boolean } => ({
  id: r.id,
  slug: r.slug,
  name: r.name,
  tagline: r.tagline ?? { tr: "", en: "" },
  city: r.city ?? "",
  world: r.world,
  palette: r.palette ?? undefined,
  currency: r.currency,
  languages: r.languages,
  footer: r.footer ?? undefined,
  serviceNote: r.service_note ?? undefined,
  instagram: r.instagram ?? undefined,
  published: Boolean(r.published),
});

export const venueTo = (v: Partial<Venue & { published: boolean }>) => {
  const o: Record<string, unknown> = {};
  if (v.slug !== undefined) o.slug = v.slug;
  if (v.name !== undefined) o.name = v.name;
  if (v.tagline !== undefined) o.tagline = v.tagline;
  if (v.city !== undefined) o.city = v.city;
  if (v.world !== undefined) o.world = v.world;
  if ("palette" in v) o.palette = v.palette ?? null;
  if (v.currency !== undefined) o.currency = v.currency;
  if (v.languages !== undefined) o.languages = v.languages;
  if ("footer" in v) o.footer = v.footer ?? null;
  if ("serviceNote" in v) o.service_note = v.serviceNote ?? null;
  if ("instagram" in v) o.instagram = v.instagram || null;
  if (v.published !== undefined) o.published = v.published;
  return o;
};

export const sectionFrom = (r: any): MenuSection => ({ id: r.id, venueId: r.venue_id, title: r.title, note: r.note ?? undefined, position: r.position });

export const itemFrom = (r: any): MenuItem => ({
  id: r.id,
  venueId: r.venue_id,
  sectionId: r.section_id,
  slug: r.slug,
  name: r.name,
  description: r.description ?? { tr: "", en: "" },
  story: r.story ?? undefined,
  price: r.price,
  recipe: r.recipe,
  available: r.available,
  featured: r.featured,
  zeroPrice: r.zero_price ?? undefined,
  extraAllergens: r.extra_allergens ?? [],
  libraryId: r.library_id ?? undefined,
  photo: r.photo ?? undefined,
  position: r.position,
});

export const itemTo = (i: Partial<MenuItem>) => {
  const o: Record<string, unknown> = {};
  if (i.venueId !== undefined) o.venue_id = i.venueId;
  if (i.sectionId !== undefined) o.section_id = i.sectionId;
  if (i.slug !== undefined) o.slug = i.slug;
  if (i.name !== undefined) o.name = i.name;
  if (i.description !== undefined) o.description = i.description;
  if ("story" in i) o.story = i.story ?? null;
  if (i.price !== undefined) o.price = i.price;
  if ("zeroPrice" in i) o.zero_price = i.zeroPrice ?? null;
  if (i.recipe !== undefined) o.recipe = i.recipe;
  if (i.available !== undefined) o.available = i.available;
  if (i.featured !== undefined) o.featured = i.featured;
  if (i.extraAllergens !== undefined) o.extra_allergens = i.extraAllergens;
  if ("libraryId" in i) o.library_id = i.libraryId ?? null;
  if ("photo" in i) o.photo = i.photo ?? null;
  if (i.position !== undefined) o.position = i.position;
  return o;
};
