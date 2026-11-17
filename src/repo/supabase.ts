/**
 * Supabase reads for the guest menu (public, read-only: the anon key and the
 * row-level policies in supabase/migrations allow reading published venues
 * and their available items, nothing else).
 */
import { createClient } from "@supabase/supabase-js";
import type { VenueMenu } from "@/domain/types";
import { itemFrom, sectionFrom, venueFrom } from "@/lib/supabase/rows";

import { SUPABASE_KEY, SUPABASE_URL, supabaseConfigured } from "@/lib/supabase/env";

export { supabaseConfigured };

const client = () => createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

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
