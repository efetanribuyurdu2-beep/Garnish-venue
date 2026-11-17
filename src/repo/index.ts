/**
 * Where menus come from. With Supabase configured (NEXT_PUBLIC_SUPABASE_URL
 * and NEXT_PUBLIC_SUPABASE_ANON_KEY) venues are read from the database;
 * otherwise, and always for the demo slugs, from src/repo/demo.ts.
 */
import type { Venue, VenueMenu } from "@/domain/types";
import { DEMO_MENUS } from "./demo";
import { supabaseConfigured, supabaseMenu } from "./supabase";

export async function getVenueMenu(slug: string): Promise<VenueMenu | null> {
  const demo = DEMO_MENUS.find((m) => m.venue.slug === slug);
  if (demo) return demo;
  if (supabaseConfigured()) return supabaseMenu(slug);
  return null;
}

export async function demoVenues(): Promise<Venue[]> {
  return DEMO_MENUS.map((m) => m.venue);
}
