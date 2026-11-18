/**
 * Where menus come from. The nine world demo bars live in code (src/repo/demo.ts);
 * every other venue is read from Supabase when it is configured
 * (NEXT_PUBLIC_SUPABASE_URL and the public key).
 */
import type { Venue, VenueMenu } from "@/domain/types";
import { DEMO_MENUS, demoBySlug } from "./demo";
import { supabaseConfigured, supabaseMenu } from "./supabase";

export async function getVenueMenu(slug: string): Promise<VenueMenu | null> {
  const demo = demoBySlug(slug);
  if (demo) return demo;
  if (supabaseConfigured()) return supabaseMenu(slug);
  return null;
}

export async function demoVenues(): Promise<Venue[]> {
  return DEMO_MENUS.map((m) => m.venue);
}
