import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AllergenIcon } from "@/components/AllergenIcon";
import { LogoMark } from "@/components/Logo";
import { PrintBar } from "@/components/PrintBar";
import { ingredientById } from "@/data/ingredients";
import { factsOf, itemFacts, zeroRecipe } from "@/lib/facts";
import { brandLang, money, nameLang, percent, pick } from "@/lib/i18n";
import { allergenById } from "@/lib/allergens";
import { isAtelierLine } from "@/lib/atelier";
import { qrSvg } from "@/lib/qr";
import { HEAD } from "@/lib/worldMenu";
import { siteOrigin } from "@/lib/siteUrl";
import type { Lang } from "@/lib/types";
import { getVenueMenu } from "@/repo";

type Params = Promise<{ venue: string }>;
type Search = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const m = await getVenueMenu((await params).venue);
  return m ? { title: `${m.venue.name} · Basılı menü` } : {};
}

const T = {
  tr: { menu: "Menü", inside: "İçindekiler", zero: "Alkolsüz", allergens: "Alerjenler", valid: "Fiyatlar {d} tarihinden itibaren geçerlidir.", estimate: "Alkol oranı ve enerji değerleri tarifinden hesaplanmış tahminlerdir. Alerjenler hakkında personelimize danışabilirsiniz.", online: "Menünün tamamı, fotoğraflar ve alkolsüz seçenekler için okutun", none: "Bildirilmesi gereken alerjen yok", atelier: "Tarif misafirin: alkol, enerji ve alerjenler seçilen şişelere göre değişir; personelimize danışın." },
  en: { menu: "Menu", inside: "Ingredients", zero: "Alcohol-free", allergens: "Allergens", valid: "Prices valid from {d}.", estimate: "Strength and energy are estimates calculated from the recipe. Please ask our staff about allergens.", online: "Scan for the full menu, photographs and alcohol-free options", none: "No declarable allergens", atelier: "The guest's own recipe: strength, energy and allergens depend on the bottles chosen; please ask our staff." },
};

/**
 * The printed price list the law asks for next to a QR menu: every drink with
 * its price (and alcohol-free price), full ingredients, strength, energy and
 * allergens, the allergen key, the legal notes, the date the prices apply
 * from, and a QR code back to the live menu. A4, dressed in the bar's world;
 * "light paper" saves ink on an office printer.
 */
export default async function PrintedMenu({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { venue: slug } = await params;
  const sp = await searchParams;
  const menu = await getVenueMenu(slug);
  if (!menu) notFound();
  const v = menu.venue;
  const lang: Lang = sp.lang === "en" && v.languages.includes("en") ? "en" : "tr";
  const light = sp.kagit === "acik";
  const t = T[lang];
  const origin = await siteOrigin();
  const qr = await qrSvg(`${origin}/v/${v.slug}${lang === "en" ? "?lang=en" : ""}`);
  const today = new Date().toLocaleDateString(lang === "tr" ? "tr-TR" : "en-GB", { day: "numeric", month: "long", year: "numeric" });

  const sections = [...menu.sections]
    .sort((a, b) => a.position - b.position)
    .map((s) => ({
      s,
      items: menu.items
        .filter((i) => i.sectionId === s.id && i.available)
        .sort((a, b) => a.position - b.position)
        .map((it) => {
          const f = itemFacts(it);
          const z = !f.simple && it.recipe && it.zeroPrice !== undefined && !f.zero ? factsOf(zeroRecipe(it.recipe), it.extraAllergens) : null;
          // cocktails: every ingredient; wine, beer, food…: what the bar wrote (grape, producer, ingredients)
          const inside = it.recipe && !f.simple
            ? it.recipe.parts.filter((p) => p.ml > 0).map((p) => pick(ingredientById(p.id)?.name, lang) || p.id).join(", ")
            : [pick(it.description, lang), it.details?.origin ? pick(it.details.origin, lang) : ""].filter(Boolean).join(" · ");
          return { it, f, z, inside, food: it.kind === "food" };
        }),
    }))
    .filter((x) => x.items.length);
  const legend = [...new Set(sections.flatMap((x) => x.items.flatMap((i) => [...i.f.allergens, ...(i.z?.allergens ?? [])])))];
  const count = sections.reduce((n, x) => n + x.items.length, 0);
  const href = (l: Lang, paperLight: boolean) => {
    const p = new URLSearchParams();
    if (l === "en") p.set("lang", "en");
    if (paperLight) p.set("kagit", "acik");
    const s = p.toString();
    return s ? `?${s}` : `/yazdir/${v.slug}`;
  };

  return (
    <div className={`pr${light ? " pr-light" : ""}`} data-world={v.world} data-palette={v.palette ?? "noir"}>
      {/* the page background follows the world on paper too */}
      <script dangerouslySetInnerHTML={{ __html: `document.documentElement.dataset.world=${JSON.stringify(v.world)};document.documentElement.dataset.palette=${JSON.stringify(v.palette ?? "noir")};document.documentElement.classList.toggle("pr-light-root",${light});` }} />
      <PrintBar title={`${v.name} · basılı menü`} back="/panel">
        <Link className={`chip${!light ? " on" : ""}`} href={href(lang, false)} replace>
          Dünyanın renkleri
        </Link>
        <Link className={`chip${light ? " on" : ""}`} href={href(lang, true)} replace>
          Açık kâğıt (mürekkep dostu)
        </Link>
        {v.languages.includes("en") && (
          <Link className="chip" href={href(lang === "tr" ? "en" : "tr", light)} replace>
            {lang === "tr" ? "English" : "Türkçe"}
          </Link>
        )}
      </PrintBar>

      <article className={`pr-doc${count > 12 ? " two" : ""}`}>
        <span className="pr-frame" aria-hidden>
          <span className="wm-corner tl" />
          <span className="wm-corner tr" />
          <span className="wm-corner bl" />
          <span className="wm-corner br" />
        </span>
        <header className="pr-head">
          <span className="pr-emblem" aria-hidden />
          <p className="pr-kicker" lang={brandLang(pick(v.tagline, lang) || pick(HEAD[v.world].kicker, lang))}>
            {pick(v.tagline, lang) || pick(HEAD[v.world].kicker, lang)}
          </p>
          <h1 lang={brandLang(v.name)}>{v.name}</h1>
          <p className="pr-sub">{t.menu}</p>
          <span className="pr-band" aria-hidden />
        </header>

        <div className="pr-body">
          {sections.map(({ s, items }) => (
            <section key={s.id} className="pr-section">
              <h2>{pick(s.title, lang)}</h2>
              {s.note && <p className="pr-note">{pick(s.note, lang)}</p>}
              {items.map(({ it, f, z, inside, food }) => (
                <div key={it.id} className="pr-item">
                  <div className="pr-row">
                    <span className="pr-name" lang={nameLang(it.name)}>
                      {pick(it.name, lang)}
                    </span>
                    <span className="pr-leader" aria-hidden />
                    <span className="pr-price">{money(it.price, v.currency, lang)}</span>
                  </div>
                  {inside && (
                    <p className="pr-inside">
                      {!f.simple || food ? <span>{t.inside}: </span> : null}
                      {inside}
                    </p>
                  )}
                  {isAtelierLine(it) ? (
                    <p className="pr-meta">
                      <span>{t.atelier}</span>
                    </p>
                  ) : (
                  <p className="pr-meta">
                    {!food && <span>{f.zero ? "0%" : percent(f.abv, lang)}</span>}
                    {f.kcalKnown && f.kcal > 0 && <span>{f.kcal < 5 ? "< 5" : `≈ ${f.kcal}`} kcal</span>}
                    {it.details?.serving ? <span>{pick(it.details.serving, lang)}</span> : f.volume > 0 && <span>{f.volume} {food ? "g" : "ml"}</span>}
                    {f.allergens.length > 0 && (
                      <span className="pr-al">
                        {f.allergens.map((a) => (
                          <AllergenIcon key={a} id={a} size={13} />
                        ))}
                      </span>
                    )}
                  </p>
                  )}
                  {it.details?.alt && (
                    <div className="pr-row pr-zero">
                      <span>{pick(it.details.alt.label, lang)}</span>
                      <span className="pr-leader" aria-hidden />
                      <span className="pr-price">{money(it.details.alt.price, v.currency, lang)}</span>
                    </div>
                  )}
                  {z && it.zeroPrice !== undefined && (
                    <div className="pr-row pr-zero">
                      <span>
                        {t.zero} · {z.kcal < 5 ? "< 5" : `≈ ${z.kcal}`} kcal
                      </span>
                      <span className="pr-leader" aria-hidden />
                      <span className="pr-price">{money(it.zeroPrice, v.currency, lang)}</span>
                    </div>
                  )}
                </div>
              ))}
            </section>
          ))}
        </div>

        <footer className="pr-foot">
          <div className="pr-legend">
            <h3>{t.allergens}</h3>
            {legend.length ? (
              <ul>
                {legend.map((a) => (
                  <li key={a}>
                    <AllergenIcon id={a} size={14} /> {pick(allergenById(a)?.name, lang)}
                  </li>
                ))}
              </ul>
            ) : (
              <p>{t.none}</p>
            )}
            {v.serviceNote && <p className="pr-legal">{pick(v.serviceNote, lang)}</p>}
            <p className="pr-legal">{t.estimate}</p>
            <p className="pr-legal">
              <strong>{t.valid.replace("{d}", today)}</strong>
            </p>
          </div>
          <div className="pr-qr">
            <span className="pr-qr-code" dangerouslySetInnerHTML={{ __html: qr }} />
            <span>{t.online}</span>
          </div>
        </footer>
        <p className="pr-house">{pick(v.footer, lang) || pick(HEAD[v.world].foot, lang)}</p>
        <p className="pr-made">
          <LogoMark size={14} /> Garnish
        </p>
      </article>
    </div>
  );
}
