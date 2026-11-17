import { notFound } from "next/navigation";
import { WORLDS } from "@/data/worlds";
import { getVenueMenu } from "@/repo";
import { DEMO_MENUS } from "@/repo/demo";
import { readLang } from "./i18n";
import type { WorldId } from "./types";

export type Search = Promise<Record<string, string | string[] | undefined>>;

/** Shared by the guest pages: the venue, the language and (demo venues only) a world preview. */
export async function loadVenue(slug: string, search: Search) {
  const sp = await search;
  const menu = await getVenueMenu(slug);
  if (!menu) notFound();
  const lang = readLang(sp.lang, menu.venue.languages);
  const isDemo = DEMO_MENUS.some((m) => m.venue.slug === slug);
  const preview = isDemo && WORLDS.some((w) => w.id === sp.world) ? (sp.world as WorldId) : undefined;
  const world = preview ?? menu.venue.world;
  const keep: Record<string, string> = preview ? { world: preview } : {};
  const query = "?" + new URLSearchParams({ ...keep, lang }).toString();
  return { menu, lang, world, keep, query };
}
