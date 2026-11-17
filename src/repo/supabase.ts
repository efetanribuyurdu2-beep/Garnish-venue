/**
 * Supabase reads for the guest menu (public, read-only: the anon key and the
 * row-level policies in supabase/migrations allow reading published venues
 * and their available items, nothing else).
 */
import { createClient } from "@supabase/supabase-js";
import type { MenuItem, MenuSection, Venue, VenueMenu } from "@/domain/types";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = () => Boolean(URL && KEY);

const client = () => createClient(URL!, KEY!, { auth: { persistSession: false } });

/* eslint-disable @typescript-eslint/no-explicit-any */
const venueFrom = (r: any): Venue => ({
  id: r.id,
  slug: r.slug,
  name: r.name,
  tagline: r.tagline,
  city: r.city,
  world: r.world,
  palette: r.palette ?? undefined,
  currency: r.currency,
  languages: r.languages,
  footer: r.footer ?? undefined,
  serviceNote: r.service_note ?? undefined,
  instagram: r.instagram ?? undefined,
});
const sectionFrom = (r: any): MenuSection => ({ id: r.id, venueId: r.venue_id, title: r.title, note: r.note ?? undefined, position: r.position });
const itemFrom = (r: any): MenuItem => ({
  id: r.id,
  venueId: r.venue_id,
  sectionId: r.section_id,
  slug: r.slug,
  name: r.name,
  description: r.description,
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

export async function supabaseMenu(slug: string): Promise<VenueMenu | null> {
  const db = client();
  const { data: v } = await db.from("venues").select("*").eq("slug", slug).eq("published", true).maybeSingle();
  if (!v) return null;
  const [{ data: s }, { data: i }] = await Promise.all([
    db.from("menu_sections").select("*").eq("venue_id", v.id).order("position"),
    db.from("menu_items").select("*").eq("venue_id", v.id).eq("available", true).order("position"),
  ]);
  return { venue: venueFrom(v), sections: (s ?? []).map(sectionFrom), items: (i ?? []).map(itemFrom) };
}
