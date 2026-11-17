import type { Metadata } from "next";
import { AllergenIcon } from "@/components/AllergenIcon";
import { GlassReal } from "@/components/glassReal";
import { DrinkPhoto } from "@/components/DrinkPhoto";
import { GuestMenu } from "@/components/GuestMenu";
import { VenueFrame } from "@/components/VenueFrame";
import { worldById } from "@/data/worlds";
import { pick, t } from "@/lib/i18n";
import type { Glass, Ice, Method } from "@/lib/types";
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
  const sections = menuView(menu, lang);
  // the bar's photograph when there is one, otherwise the glass, drawn here on the server
  const byId = new Map(menu.items.map((it) => [it.id, it]));
  const thumbs = Object.fromEntries(
    sections.flatMap((s) =>
      s.items.map((i) => {
        const photo = byId.get(i.id)?.photo;
        const [w, h] = i.featured ? [104, 132] : [64, 80];
        return [
          i.id,
          photo ? (
            <DrinkPhoto key={i.id} photo={photo} w={w} h={h} lang={lang} name={i.name} className="dp-thumb" />
          ) : (
            <GlassReal
              key={i.id}
              glass={i.glass.glass as Glass}
              color={i.glass.color}
              opaque={i.glass.opaque}
              ice={i.glass.ice as Ice}
              method={i.glass.method as Method}
              garnish={i.glass.garnish}
              size={i.featured ? 96 : 56}
              world={world}
              uid={`t-${i.slug}`}
            />
          ),
        ];
      }),
    ),
  );
  const legend = [...new Map(sections.flatMap((s) => s.items.flatMap((i) => i.allergens.map((a) => [a.id, a] as const)))).values()];
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
            sections={sections}
            thumbs={thumbs}
            base={`/v/${v.slug}`}
            query={query}
            text={{
              prefs: t("prefs", lang),
              zeroOnly: t("zeroOnly", lang),
              avoid: t("avoid", lang),
              avoidHint: t("avoidHint", lang),
              bigText: t("bigText", lang),
              none: t("none", lang),
              zeroAlso: t("zeroAlso", lang),
              allergens: t("allergens", lang),
              clear: t("clear", lang),
              done: t("done", lang),
              chosen: t("chosen", lang),
              close: t("close", lang),
              without: t("without", lang),
            }}
          />
          {legend.length > 0 && (
            <dl className="gm-legend" aria-label={t("allergens", lang)}>
              {legend.map((a) => (
                <div key={a.id}>
                  <dt>
                    <AllergenIcon id={a.id} size={16} />
                  </dt>
                  <dd>{a.name}</dd>
                </div>
              ))}
            </dl>
          )}
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
