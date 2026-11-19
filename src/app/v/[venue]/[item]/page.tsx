import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ItemDetail } from "@/components/ItemDetail";
import { VenueFrame } from "@/components/VenueFrame";
import { pick, t } from "@/lib/i18n";
import { isAtelierLine } from "@/lib/atelier";
import { versionParam } from "@/lib/guestChoice";
import { loadVenue, type Search } from "@/lib/venuePage";
import { getVenueMenu } from "@/repo";

type Params = Promise<{ venue: string; item: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { venue, item } = await params;
  const m = await getVenueMenu(venue);
  const it = m?.items.find((i) => i.slug === item);
  const lang = m?.venue.languages[0] ?? "tr";
  return m && it ? { title: `${pick(it.name, lang)} · ${m.venue.name}`, description: pick(it.description, lang) } : {};
}

export default async function ItemPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { venue: slug, item: itemSlug } = await params;
  const { menu, lang, world, keep, query } = await loadVenue(slug, searchParams);
  const it = menu.items.find((i) => i.slug === itemSlug && i.available);
  if (!it) notFound();
  const v = menu.venue;
  // "your own cocktail" is not a drink page: it is the Atelier
  if (isAtelierLine(it)) redirect(`/v/${v.slug}/atelier${query}`);
  const section = menu.sections.find((s) => s.id === it.sectionId);
  return (
    <VenueFrame venue={v} world={world} lang={lang} path={`/v/${v.slug}/${it.slug}`} keep={{ ...keep, ...(versionParam((await searchParams).v) ? { v: "zero" } : {}) }}>
      <div className={`wmenu wmenu-${world}`}>
        <article className="wm-card gi-card">
          <span className="wm-corner tl" aria-hidden />
          <span className="wm-corner tr" aria-hidden />
          <span className="wm-corner bl" aria-hidden />
          <span className="wm-corner br" aria-hidden />
          <Link href={`/v/${v.slug}${query}`} className="gi-back">
            ← {t("back", lang)}
          </Link>
          <ItemDetail it={it} venue={v} lang={lang} world={world} section={section ? pick(section.title, lang) : undefined} version={versionParam((await searchParams).v)} />
        </article>
      </div>
    </VenueFrame>
  );
}
