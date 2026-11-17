import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GlassSvg } from "@/components/glassSvg";
import { Radar } from "@/components/Radar";
import { VenueFrame } from "@/components/VenueFrame";
import { nameLang, percent, pick, t } from "@/lib/i18n";
import type { Flavor, Lang } from "@/lib/types";
import { loadVenue, type Search } from "@/lib/venuePage";
import { itemDetail } from "@/lib/view";
import { getVenueMenu } from "@/repo";

type Params = Promise<{ venue: string; item: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { venue, item } = await params;
  const m = await getVenueMenu(venue);
  const it = m?.items.find((i) => i.slug === item);
  const lang = m?.venue.languages[0] ?? "tr";
  return m && it ? { title: `${pick(it.name, lang)} · ${m.venue.name}`, description: pick(it.description, lang) } : {};
}

type Version = NonNullable<ReturnType<typeof itemDetail>["zero"]>;

function Facts({ v, lang, title }: { v: Version; lang: Lang; title: string }) {
  const f = v.facts;
  return (
    <section className="gi-version">
      <h2 className="gi-version-title">
        <span>{title}</span>
        <span className="gi-price">{v.price}</span>
      </h2>
      <dl className="gi-facts">
        <div>
          <dt>{t("volume", lang)}</dt>
          <dd>{f.volume} ml</dd>
        </div>
        <div>
          <dt>{t("strength", lang)}</dt>
          <dd>{f.zero ? "0%" : percent(f.abv, lang)}</dd>
        </div>
        <div>
          <dt>{t("alcohol", lang)}</dt>
          <dd>{f.zero ? "0 g" : `≈ ${Math.round(f.alcoholG)} g`}</dd>
        </div>
        <div>
          <dt>{t("energy", lang)}</dt>
          <dd>{f.kcal < 5 ? "< 5" : `≈ ${f.kcal}`} kcal</dd>
        </div>
      </dl>
      <p className="gi-label">{t("inside", lang)}</p>
      <p className="gi-inside">{v.inside.join(" · ")}</p>
      <p className="gi-label">{t("allergens", lang)}</p>
      {v.allergens.length ? (
        <ul className="gi-allergens">
          {v.allergens.map((a) => (
            <li key={a.id}>
              <span className="gm-al">{a.mark}</span> {a.name}
            </li>
          ))}
        </ul>
      ) : (
        <p className="gi-inside">{t("noAllergens", lang)}</p>
      )}
    </section>
  );
}

export default async function ItemPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { venue: slug, item: itemSlug } = await params;
  const { menu, lang, world, keep, query } = await loadVenue(slug, searchParams);
  const it = menu.items.find((i) => i.slug === itemSlug && i.available);
  if (!it) notFound();
  const v = menu.venue;
  const d = itemDetail(it, v.currency, lang);
  const labels = Object.fromEntries((["sweet", "sour", "bitter", "strong", "fresh", "aromatic"] as Flavor[]).map((k) => [k, t(`f_${k}`, lang)])) as Record<Flavor, string>;
  return (
    <VenueFrame venue={v} world={world} lang={lang} path={`/v/${v.slug}/${it.slug}`} keep={keep}>
      <div className={`wmenu wmenu-${world}`}>
        <article className="wm-card gi-card">
          <span className="wm-corner tl" aria-hidden />
          <span className="wm-corner tr" aria-hidden />
          <span className="wm-corner bl" aria-hidden />
          <span className="wm-corner br" aria-hidden />
          <Link href={`/v/${v.slug}${query}`} className="gi-back">
            ← {t("back", lang)}
          </Link>
          <header className="gi-head">
            <div className="gi-glass">
              <GlassSvg
                glass={it.recipe.glass}
                color={d.original.facts.color}
                ice={it.recipe.ice}
                method={it.recipe.method}
                garnish={it.recipe.garnish}
                size={180}
                world={world}
                uid={`g-${it.slug}`}
              />
            </div>
            <div>
              <p className="wm-kicker">{v.name}</p>
              <h1 className="wm-title gi-title" lang={nameLang(it.name)}>
                {pick(it.name, lang)}
              </h1>
              <p className="gi-desc">{pick(it.description, lang)}</p>
              {d.garnish && (
                <p className="gi-garnish">
                  {t("garnish", lang)}: {d.garnish}
                </p>
              )}
            </div>
          </header>
          {it.story && <p className="gi-story">{pick(it.story, lang)}</p>}
          <div className="gi-grid">
            <div className="gi-taste">
              <p className="gi-label">{t("taste", lang)}</p>
              <Radar profile={d.original.facts.profile} labels={labels} />
            </div>
            <div className="gi-versions">
              <Facts v={d.original} lang={lang} title={d.original.facts.zero ? t("zero", lang) : t("original", lang)} />
              {d.zero && <Facts v={d.zero} lang={lang} title={`${t("zero", lang)} · 0%`} />}
            </div>
          </div>
        </article>
      </div>
    </VenueFrame>
  );
}
