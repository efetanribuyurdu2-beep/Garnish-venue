"use client";

/**
 * Everything the bar panel reads and writes, through the signed-in member's
 * Supabase session. Row-level security decides what is allowed; these are thin.
 */
import type { MenuItem, MenuSection, Venue } from "@/domain/types";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { itemFrom, itemTo, sectionFrom, venueFrom, venueTo } from "@/lib/supabase/rows";
import type { L } from "@/lib/types";

export type Role = "owner" | "manager" | "staff";
export type PanelVenue = Venue & { published: boolean };

let _db: ReturnType<typeof supabaseBrowser> | null = null;
export const db = () => (_db ??= supabaseBrowser());

const must = <T,>(r: { data: T; error: { message: string } | null }) => {
  if (r.error) throw new Error(r.error.message);
  return r.data;
};

// ───────────── account
export async function currentUser() {
  const { data } = await db().auth.getUser();
  return data.user;
}
export async function signIn(email: string, password: string) {
  const { error } = await db().auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
}
export async function signUp(email: string, password: string) {
  const { data, error } = await db().auth.signUp({ email, password, options: { emailRedirectTo: `${location.origin}/panel` } });
  if (error) throw new Error(error.message);
  return { needsConfirmation: !data.session };
}
export async function signOut() {
  await db().auth.signOut();
}

// ───────────── venues
export async function myVenues(): Promise<{ venue: PanelVenue; role: Role }[]> {
  const user = await currentUser();
  if (!user) return [];
  const rows = must(await db().from("venue_members").select("role, venues(*)").eq("user_id", user.id));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (rows as any[]).filter((r) => r.venues).map((r) => ({ venue: venueFrom(r.venues), role: r.role as Role }));
}
export async function slugAvailable(slug: string) {
  return must(await db().rpc("slug_available", { p_slug: slug })) as boolean;
}
export async function createVenue(slug: string, name: string, city: string, world: string): Promise<PanelVenue> {
  const row = must(await db().rpc("create_venue", { p_slug: slug, p_name: name, p_city: city, p_world: world }));
  return venueFrom(row);
}
export async function saveVenue(id: string, patch: Partial<PanelVenue>) {
  must(await db().from("venues").update(venueTo(patch)).eq("id", id));
}

export interface Workspace {
  venue: PanelVenue;
  role: Role;
  sections: MenuSection[];
  items: MenuItem[];
}
export async function loadWorkspace(venueId: string): Promise<Workspace | null> {
  const user = await currentUser();
  if (!user) return null;
  const [v, m, s, i] = await Promise.all([
    db().from("venues").select("*").eq("id", venueId).maybeSingle(),
    db().from("venue_members").select("role").eq("venue_id", venueId).eq("user_id", user.id).maybeSingle(),
    db().from("menu_sections").select("*").eq("venue_id", venueId).order("position"),
    db().from("menu_items").select("*").eq("venue_id", venueId).order("position"),
  ]);
  if (!v.data || !m.data) return null;
  return { venue: venueFrom(v.data), role: m.data.role as Role, sections: (s.data ?? []).map(sectionFrom), items: (i.data ?? []).map(itemFrom) };
}

// ───────────── sections
export async function addSection(venueId: string, title: L, position: number) {
  return sectionFrom(must(await db().from("menu_sections").insert({ venue_id: venueId, title, position }).select().single()));
}
export async function saveSection(id: string, patch: { title?: L; note?: L | null; position?: number }) {
  must(await db().from("menu_sections").update(patch).eq("id", id));
}
export async function deleteSection(id: string) {
  must(await db().from("menu_sections").delete().eq("id", id));
}

// ───────────── items
export async function saveItem(item: Partial<MenuItem> & { venueId: string }): Promise<MenuItem> {
  const row = itemTo(item);
  const q = item.id ? db().from("menu_items").update(row).eq("id", item.id) : db().from("menu_items").insert(row);
  return itemFrom(must(await q.select().single()));
}
export async function deleteItem(id: string) {
  must(await db().from("menu_items").delete().eq("id", id));
}
export async function setAvailable(id: string, available: boolean) {
  must(await db().rpc("set_item_available", { item: id, is_available: available }));
}
export async function setPositions(table: "menu_items" | "menu_sections", ids: string[]) {
  await Promise.all(ids.map((id, position) => db().from(table).update({ position }).eq("id", id)));
}

// ───────────── prices
export async function reprice(venueId: string, percent: number, stepKurus: number, sectionId: string | null, includeZero: boolean) {
  return must(await db().rpc("reprice", { p_venue: venueId, p_percent: percent, p_step: stepKurus, p_section: sectionId, p_include_zero: includeZero })) as number;
}
export interface PriceRow {
  id: number;
  itemId: string;
  field: "price" | "zero_price";
  oldPrice: number | null;
  newPrice: number | null;
  at: string;
}
export async function priceHistory(venueId: string, limit = 200): Promise<PriceRow[]> {
  const rows = must(await db().from("price_history").select("*").eq("venue_id", venueId).order("changed_at", { ascending: false }).limit(limit));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (rows as any[]).map((r) => ({ id: r.id, itemId: r.item_id, field: r.field, oldPrice: r.old_price, newPrice: r.new_price, at: r.changed_at }));
}
