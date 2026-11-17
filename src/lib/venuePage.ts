import { notFound } from "next/navigation";
import { WORLDS } from "@/data/worlds";
import { getVenueMenu } from "@/repo";
import { demoForWorld, isDemoSlug } from "@/repo/demo";
import { readLang } from "./i18n";
import type { WorldId } from "./types";

export type Search = Promise<Record<string, string | string[] | undefined>>;

/**
 * Shared by the guest pages: the venue, the language and the world.
 * `/v/demo?world=<id>` opens that world's own demo bar; on any other demo bar
 * `?world=` re-dresses the same menu in another world (to show a bar its menu
 * in every world). Real bars always wear their own world.
 */
export async function loadVenue(slug: string, search: Search) {
  const sp = await search;
  const asked = WORLDS.some((w) => w.id === sp.world) ? (sp.world as WorldId) : undefined;
  const menu = slug === "demo" && asked ? demoForWorld(asked) : await getVenueMenu(slug);
  if (!menu) notFound();
  const lang = readLang(sp.lang, menu.venue.languages);
  const preview = slug !== "demo" && isDemoSlug(slug) ? asked : undefined;
  const world = preview ?? menu.venue.world;
  const keep: Record<string, string> = preview ? { world: preview } : {};
  const query = "?" + new URLSearchParams({ ...keep, lang }).toString();
  return { menu, lang, world, keep, query };
}
