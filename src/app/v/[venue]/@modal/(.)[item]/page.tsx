import { notFound, redirect } from "next/navigation";
import { ItemDetail } from "@/components/ItemDetail";
import { ItemSheet } from "@/components/ItemSheet";
import { pick, t } from "@/lib/i18n";
import { isAtelierLine } from "@/lib/atelier";
import { versionParam } from "@/lib/guestChoice";
import { loadVenue, type Search } from "@/lib/venuePage";

type Params = Promise<{ venue: string; item: string }>;

export default async function ItemModal({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { venue: slug, item: itemSlug } = await params;
  const { menu, lang, world, query } = await loadVenue(slug, searchParams);
  const it = menu.items.find((i) => i.slug === itemSlug && i.available);
  if (!it) notFound();
  if (isAtelierLine(it)) redirect(`/v/${menu.venue.slug}/atelier${query}`);
  const section = menu.sections.find((s) => s.id === it.sectionId);
  return (
    <ItemSheet world={world} palette={menu.venue.palette ?? "noir"} closeLabel={t("close", lang)}>
      <ItemDetail it={it} venue={menu.venue} lang={lang} world={world} section={section ? pick(section.title, lang) : undefined} version={versionParam((await searchParams).v)} />
    </ItemSheet>
  );
}
