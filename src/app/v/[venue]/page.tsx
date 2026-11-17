import type { Metadata } from "next";
import { GuestMenu } from "@/components/GuestMenu";
import { VenueFrame } from "@/components/VenueFrame";
import { worldById } from "@/data/worlds";
import { pick, t } from "@/lib/i18n";
import { loadVenue, type Search } from "@/lib/venuePage";
import { menuView } from "@/lib/view";
import { getVenueMenu } from "@/repo";

type Params = Promise<{ venue: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const m = await getVenueMenu((await params).venue);
  return m ? { title: `${m.venue.name} · ${t("menu", m.venue.languages[0])}`, description: pick(m.venue.tagline, m.venue.languages[0]) } : {};
}

export default async function VenuePage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { venue: slug } = await params;
  const { menu, lang, world, keep, query } = await loadVenue(slug, searchParams);
  const v = menu.venue;
  const w = worldById(world);
  return (
    <VenueFrame venue={v} world={world} lang={lang} path={`/v/${v.slug}`} keep={keep}>
      <div className={`wmenu wmenu-${world}`}>
        <article className="wm-card gm-card">
          <span className="wm-corner tl" aria-hidden />
          <span className="wm-corner tr" aria-hidden />
          <span className="wm-corner bl" aria-hidden />
          <span className="wm-corner br" aria-hidden />
          <header className="wm-head">
            <span className="wm-emblem" aria-hidden />
            <p className="wm-kicker">{pick(v.tagline, lang)}</p>
            <h1 className="wm-title" lang="en">
              {v.name}
            </h1>
            <p className="wm-greeting">{pick(w.greeting, lang)}</p>
          </header>
          <GuestMenu
            sections={menuView(menu, lang)}
            base={`/v/${v.slug}`}
            query={query}
            text={{
              zeroOnly: t("zeroOnly", lang),
              avoid: t("avoid", lang),
              bigText: t("bigText", lang),
              none: t("none", lang),
              zeroAlso: t("zeroAlso", lang),
              zero: t("zero", lang),
              allergens: t("allergens", lang),
            }}
          />
          {v.footer && (
            <footer className="wm-foot">
              {world === "sakura" && (
                <span className="wm-hanko" aria-hidden>
                  花見
                </span>
              )}
              <p>{pick(v.footer, lang)}</p>
            </footer>
          )}
        </article>
      </div>
    </VenueFrame>
  );
}
