import type { MenuItem, Venue } from "@/domain/types";
import { nameLang, percent, pick, t } from "@/lib/i18n";
import type { Flavor, Lang, WorldId } from "@/lib/types";
import { itemDetail } from "@/lib/view";
import { GlassReal } from "./glassReal";
import { Radar } from "./Radar";
import { VersionSwitch, type VersionView } from "./VersionSwitch";

type D = ReturnType<typeof itemDetail>;
type V = D["original"];

function version(key: VersionView["key"], label: string, v: V, lang: Lang): VersionView {
  const f = v.facts;
  return {
    key,
    label,
    price: v.price,
    facts: [
      { label: t("volume", lang), value: `${f.volume} ml` },
      { label: t("strength", lang), value: f.zero ? "0%" : percent(f.abv, lang) },
      { label: t("alcohol", lang), value: f.zero ? "0 g" : `≈ ${Math.round(f.alcoholG)} g` },
      { label: t("energy", lang), value: `${f.kcal < 5 ? "< 5" : `≈ ${f.kcal}`} kcal` },
    ],
    inside: v.inside.join(" · "),
    allergens: v.allergens.map((a) => ({ id: a.id, name: a.name })),
  };
}

/** The body of a drink's page, shared by the full page and the sheet that opens over the menu. */
export function ItemDetail({ it, venue, lang, world, section }: { it: MenuItem; venue: Venue; lang: Lang; world: WorldId; section?: string }) {
  const d = itemDetail(it, venue.currency, lang);
  const labels = Object.fromEntries((["sweet", "sour", "bitter", "strong", "fresh", "aromatic"] as Flavor[]).map((k) => [k, t(`f_${k}`, lang)])) as Record<Flavor, string>;
  const versions = [version("original", d.original.facts.zero ? t("zero", lang) : t("original", lang), d.original, lang)];
  if (d.zero) versions.push(version("zero", `${t("zero", lang)} · 0%`, d.zero, lang));
  return (
    <div className="gi">
      <div className="gi-visual">
        <div className="gi-glass">
          <GlassReal
            glass={it.recipe.glass}
            color={d.original.facts.color}
            opaque={d.original.facts.opaque}
            ice={it.recipe.ice}
            method={it.recipe.method}
            garnish={it.recipe.garnish}
            size={200}
            world={world}
            uid={`d-${it.slug}`}
          />
        </div>
        <div className="gi-taste">
          <p className="gi-label">{t("taste", lang)}</p>
          <Radar profile={d.original.facts.profile} labels={labels} size={190} />
        </div>
      </div>
      <div className="gi-text">
        <p className="wm-kicker">{section ?? venue.name}</p>
        <h1 className="wm-title gi-title" lang={nameLang(it.name)}>
          {pick(it.name, lang)}
        </h1>
        <p className="gi-desc">{pick(it.description, lang)}</p>
        {d.garnish && (
          <p className="gi-garnish">
            {t("garnish", lang)}: {d.garnish}
          </p>
        )}
        {it.story && <p className="gi-story">{pick(it.story, lang)}</p>}
        <VersionSwitch versions={versions} text={{ inside: t("inside", lang), allergens: t("allergens", lang), noAllergens: t("noAllergens", lang) }} />
      </div>
    </div>
  );
}
