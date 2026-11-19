import type { MenuItem, Venue } from "@/domain/types";
import { nameLang, percent, pick, t } from "@/lib/i18n";
import type { Flavor, Lang, WorldId } from "@/lib/types";
import { itemDetail, itemView } from "@/lib/view";
import { DrinkPhoto } from "./DrinkPhoto";
import { ItemVisual } from "./ItemVisual";
import { Radar } from "./Radar";
import { VersionSwitch, type VersionView } from "./VersionSwitch";

type D = ReturnType<typeof itemDetail>;
type V = D["original"];

const ORIGIN: Record<Lang, string> = { tr: "Köken", en: "Origin" };

function version(key: VersionView["key"], label: string, v: V, lang: Lang, d: D, food: boolean): VersionView {
  const f = v.facts;
  const facts: VersionView["facts"] = [];
  if (d.serving) facts.push({ label: lang === "tr" ? "Servis" : "Serving", value: d.serving });
  else if (f.volume) facts.push({ label: t("volume", lang), value: `${f.volume} ${food ? "g" : "ml"}` });
  if (!food) {
    facts.push({ label: t("strength", lang), value: f.zero ? "0%" : percent(f.abv, lang) });
    facts.push({ label: t("alcohol", lang), value: f.zero ? "0 g" : `≈ ${Math.round(f.alcoholG)} g` });
  }
  if (!d.simple || f.kcal > 0) facts.push({ label: t("energy", lang), value: `${f.kcal < 5 ? "< 5" : `≈ ${f.kcal}`} kcal` });
  return {
    key,
    label,
    price: v.price,
    facts,
    inside: d.simple ? d.origin ?? "" : v.inside.join(" · "),
    allergens: v.allergens.map((a) => ({ id: a.id, name: a.name })),
  };
}

/** The body of a drink's (or dish's) page, shared by the full page and the sheet that opens over the menu. */
export function ItemDetail({ it, venue, lang, world, section, version: asked }: { it: MenuItem; venue: Venue; lang: Lang; world: WorldId; section?: string; version?: VersionView["key"] }) {
  const d = itemDetail(it, venue.currency, lang);
  const food = it.kind === "food";
  const labels = Object.fromEntries((["sweet", "sour", "bitter", "strong", "fresh", "aromatic"] as Flavor[]).map((k) => [k, t(`f_${k}`, lang)])) as Record<Flavor, string>;
  const versions = [version("original", d.simple ? d.style ?? pick(it.name, lang) : d.original.facts.zero ? t("zero", lang) : t("original", lang), d.original, lang, d, food)];
  if (d.zero) versions.push(version("zero", `${t("zero", lang)} · 0%`, d.zero, lang, d, food));
  // the version the guest tapped (`?v=zero`); an address without one opens the original, as before
  const initial = Math.max(0, versions.findIndex((v) => v.key === asked));
  // what differs between the versions above the label (the menu line, the taste) is drawn for both; CSS shows the chosen one
  const zeroDesc = d.zero ? itemView(it, venue.currency, lang).zeroVersion?.description : undefined;
  return (
    <div className={`gi${it.photo ? " gi-has-photo" : ""}${d.simple ? " gi-simple" : ""}`} data-version={versions[initial].key}>
      <div className="gi-visual">
        {it.photo ? (
          <DrinkPhoto photo={it.photo} w={400} h={500} lang={lang} name={pick(it.name, lang)} credit eager className="gi-photo" />
        ) : (
          <div className="gi-glass">
            <ItemVisual item={it} world={world} size={200} uid={`d-${it.slug}`} />
          </div>
        )}
        {!d.simple && (
          <div className="gi-taste">
            <p className="gi-label">{t("taste", lang)}</p>
            {d.zero ? (
              <>
                <div className="gi-v gi-v-original">
                  <Radar profile={d.original.facts.profile} labels={labels} size={190} />
                </div>
                <div className="gi-v gi-v-zero">
                  <Radar profile={d.zero.facts.profile} labels={labels} size={190} />
                </div>
              </>
            ) : (
              <Radar profile={d.original.facts.profile} labels={labels} size={190} />
            )}
          </div>
        )}
      </div>
      <div className="gi-text">
        <p className="wm-kicker">{section ?? venue.name}</p>
        <h1 className="wm-title gi-title" lang={nameLang(it.name)}>
          {pick(it.name, lang)}
        </h1>
        {zeroDesc ? (
          <>
            <p className="gi-desc gi-v gi-v-original">{pick(it.description, lang)}</p>
            <p className="gi-desc gi-v gi-v-zero">{zeroDesc}</p>
          </>
        ) : (
          <p className="gi-desc">{pick(it.description, lang)}</p>
        )}
        {d.garnish && (
          <p className="gi-garnish">
            {t("garnish", lang)}: {d.garnish}
          </p>
        )}
        {it.story && <p className="gi-story">{pick(it.story, lang)}</p>}
        <VersionSwitch
          versions={versions}
          initial={initial}
          alt={d.alt}
          text={{ inside: d.simple ? ORIGIN[lang] : t("inside", lang), allergens: t("allergens", lang), noAllergens: t("noAllergens", lang) }}
        />
      </div>
    </div>
  );
}
