import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Atelier } from "@/components/Atelier";
import { GuestDock } from "@/components/GuestDock";
import { VenueFrame } from "@/components/VenueFrame";
import { ALLERGENS } from "@/lib/allergens";
import { ATELIER_INTRO, atelierLineOf, shelfOf } from "@/lib/atelier";
import { money, pick } from "@/lib/i18n";
import { loadVenue, type Search } from "@/lib/venuePage";
import type { L } from "@/lib/types";
import { getVenueMenu } from "@/repo";

type Params = Promise<{ venue: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const m = await getVenueMenu((await params).venue);
  const lang = m?.venue.languages[0] ?? "tr";
  return m ? { title: `${lang === "tr" ? "Kendi kokteylin" : "Your own cocktail"} · ${m.venue.name}` } : {};
}

/**
 * The guest Atelier: open only when the bar's menu has the "your own cocktail"
 * line (its price is on the printed list) and the line is not switched off.
 * The shelf is read from the bar's own drinks, here on the server.
 */
export default async function AtelierPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { venue: slug } = await params;
  const { menu, lang, world, keep, query } = await loadVenue(slug, searchParams);
  const line = atelierLineOf(menu);
  if (!line) notFound();
  const v = menu.venue;
  const shelf = shelfOf(menu);
  const present = new Set([...shelf.bottles.flatMap((b) => b.allergens), ...shelf.garnishes.flatMap((g) => g.allergens)]);
  const allergenNames: Record<string, L> = Object.fromEntries(ALLERGENS.filter((a) => present.has(a.id)).map((a) => [a.id, a.name]));
  const other = v.languages.find((l) => l !== lang);
  return (
    <VenueFrame venue={v} world={world} lang={lang} path={`/v/${v.slug}/atelier`} keep={keep}>
      <div className={`wmenu wmenu-${world}`}>
        <article className="wm-card at-card">
          <span className="wm-corner tl" aria-hidden />
          <span className="wm-corner tr" aria-hidden />
          <span className="wm-corner bl" aria-hidden />
          <span className="wm-corner br" aria-hidden />
          <Atelier
            shelf={shelf}
            world={world}
            lang={lang}
            barLang={v.languages[0]}
            venueName={v.name}
            lineName={line.name}
            price={money(line.price, v.currency, lang)}
            intro={pick(ATELIER_INTRO[world], lang)}
            base={`/v/${v.slug}`}
            query={query}
            allergenNames={allergenNames}
          />
        </article>
      </div>
      <GuestDock
        lang={lang}
        suggest={false}
        menuHref={`/v/${v.slug}${query}`}
        langHref={other ? `/v/${v.slug}/atelier?${new URLSearchParams({ ...keep, lang: other })}` : undefined}
        langLabel={other?.toUpperCase()}
      />
    </VenueFrame>
  );
}
