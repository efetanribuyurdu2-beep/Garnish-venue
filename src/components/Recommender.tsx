"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { itemHref, recommend } from "@/lib/guestChoice";
import { useGuestPrefs } from "@/lib/guestPrefs";
import { pick } from "@/lib/i18n";
import { AXES, MOODS, match, type Mood } from "@/lib/moods";
import type { Lang } from "@/lib/types";
import type { SectionView } from "@/lib/view";
import { AllergenIcon } from "./AllergenIcon";

const T = {
  tr: {
    title: "Karar veremedin mi?",
    body: "Bu akşam nasıl bir şey istediğini seç; barmenimiz bu menüden üç içki önersin.",
    open: "Bana bir içki öner",
    ask: "Bu akşam nasıl bir şey?",
    zero: "Alkolsüz olsun",
    zeroOn: "0% · Alkolsüz",
    result: "Barmenin önerileri",
    fit: "uyum",
    again: "Başka bir şey",
    close: "Kapat",
    using: "Menü tercihlerin geçerli",
    without: (a: string) => `${a} yok`,
    edit: "Tercihleri düzenle",
    none: "Bu menüde seçtiğin tercihlere uyan bir içki yok. Tercihlerini değiştirmek istersen düzenleyebilirsin; biz kendiliğimizden değiştirmiyoruz.",
    fewer: (n: number) => (n === 1 ? "Tercihlerine uyan yalnızca bir içki var." : `Tercihlerine uyan yalnızca ${n} içki var.`),
    axes: ["Tatlı", "Ekşi", "Acı", "Sert", "Ferah", "Aromatik"],
  },
  en: {
    title: "Can't decide?",
    body: "Tell us what you're in the mood for; our bartender will pick three drinks from this menu.",
    open: "Suggest a drink",
    ask: "What are you in the mood for?",
    zero: "Alcohol-free",
    zeroOn: "0% · Alcohol-free",
    result: "The bartender suggests",
    fit: "match",
    again: "Something else",
    close: "Close",
    using: "Your menu preferences apply",
    without: (a: string) => `${a}-free`,
    edit: "Edit preferences",
    none: "Nothing on this menu fits the preferences you chose. If you'd like to change them, you can edit them; we won't change them for you.",
    fewer: (n: number) => (n === 1 ? "Only one drink fits your preferences." : `Only ${n} drinks fit your preferences.`),
    axes: ["Sweet", "Sour", "Bitter", "Strong", "Fresh", "Aromatic"],
  },
};

/**
 * "Suggest a drink": six moods → the drinks on this menu whose taste fits best.
 * It follows the guest's menu preferences (alcohol-free only, allergens left out):
 * every candidate is judged as the version that would be served, and when nothing
 * fits it says so instead of relaxing them.
 */
export function Recommender({ sections, lang, base, query }: { sections: SectionView[]; lang: Lang; base: string; query: string }) {
  const t = T[lang];
  const sheet = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const open = () => sheet.current?.showModal();
    window.addEventListener("gv:recommend", open);
    return () => window.removeEventListener("gv:recommend", open);
  }, []);
  const [mood, setMood] = useState<Mood | null>(null);
  const [prefs, setPrefs] = useGuestPrefs(base);
  const all = sections.flatMap((s) => s.items).filter((i) => Boolean(i.profile));
  const names = useMemo(() => {
    const m = new Map<string, string>();
    sections.forEach((s) => s.items.forEach((i) => [...i.allergens, ...(i.zeroVersion?.allergens ?? [])].forEach((a) => m.set(a.id, a.name))));
    return m;
  }, [sections]);
  const active = [...(prefs.zero ? [t.zeroOn] : []), ...prefs.avoid.map((id) => t.without(names.get(id) ?? id))];
  const picks = mood ? recommend(all, prefs, (p) => match(p, mood), 3) : [];
  if (all.length < 3) return null;

  const editPrefs = () => {
    sheet.current?.close();
    window.dispatchEvent(new Event("gv:prefs"));
  };

  return (
    <>
      <div className="rc-invite">
        <div>
          <p className="rc-title">{t.title}</p>
          <p className="rc-body">{t.body}</p>
          {active.length > 0 && (
            <p className="rc-prefs">
              {t.using}: {active.join(" · ")}
            </p>
          )}
        </div>
        <button className="btn" onClick={() => sheet.current?.showModal()}>
          ✦ {t.open}
        </button>
      </div>

      <dialog ref={sheet} className="gm-sheet rc-sheet" aria-label={t.open} onClick={(e) => e.target === e.currentTarget && sheet.current?.close()}>
        <div className="gm-sheet-inner">
          <header className="gm-sheet-head">
            <h2>{mood ? t.result : t.ask}</h2>
            <button className="gm-x" onClick={() => sheet.current?.close()} aria-label={t.close}>
              ×
            </button>
          </header>

          {!mood ? (
            <>
              <div className="rc-moods">
                {MOODS.map((m) => (
                  <button key={m.id} className={`rc-mood rc-${m.id}`} onClick={() => setMood(m)}>
                    <strong>{pick(m.name, lang)}</strong>
                    <small>{pick(m.hint, lang)}</small>
                  </button>
                ))}
              </div>
              <label className="gm-switch">
                <span>
                  <strong>0%</strong> · {t.zero}
                </span>
                <input type="checkbox" checked={prefs.zero} onChange={(e) => setPrefs({ zero: e.target.checked })} />
                <span className="gm-switch-track" aria-hidden />
              </label>
              {prefs.avoid.length > 0 && (
                <p className="rc-prefs">
                  {t.using}: {prefs.avoid.map((id) => t.without(names.get(id) ?? id)).join(" · ")}{" "}
                  <button className="gm-linkbtn" onClick={editPrefs}>
                    {t.edit}
                  </button>
                </p>
              )}
            </>
          ) : (
            <>
              <p className="rc-chosen">
                {pick(mood.name, lang)}
                {active.length ? ` · ${active.join(" · ")}` : ""}
              </p>
              {picks.length === 0 && (
                <p className="rc-body rc-none" role="status">
                  {t.none}
                </p>
              )}
              {picks.length > 0 && picks.length < 3 && (prefs.zero || prefs.avoid.length > 0) && (
                <p className="rc-body rc-fewer" role="status">
                  {t.fewer(picks.length)}
                </p>
              )}
              <ol className="rc-list">
                {picks.map(({ item: i, v, score }) => (
                  <li key={i.id}>
                    <Link href={itemHref(base, i.slug, query, v.key)} className="rc-pick" data-version={v.key} onClick={() => sheet.current?.close()} scroll={false}>
                      <span className="rc-pick-head">
                        <span className="rc-name" lang={i.nameLang}>
                          {i.name}
                        </span>
                        <span className="rc-price">{v.price}</span>
                      </span>
                      <span className="rc-desc">{v.description}</span>
                      <span className="rc-meta">
                        {v.zero && <span className="gm-badge">0%</span>}
                        {v.allergens.map((a) => (
                          <AllergenIcon key={a.id} id={a.id} size={15} title={a.name} />
                        ))}
                      </span>
                      <span className="rc-taste" aria-label={AXES.map((_, k) => `${t.axes[k]} ${v.profile[k]}/5`).join(", ")}>
                        {AXES.map((a, k) => (
                          <span key={a} className="rc-axis">
                            <span className="rc-bar">
                              <i style={{ height: `${Math.max(6, (v.profile[k] / 5) * 100)}%` }} />
                            </span>
                            <small>{t.axes[k]}</small>
                          </span>
                        ))}
                        <span className="rc-fit">
                          %{score} <small>{t.fit}</small>
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
              <footer className="gm-sheet-foot">
                {(prefs.zero || prefs.avoid.length > 0) && (
                  <button className="btn ghost" onClick={editPrefs}>
                    {t.edit}
                  </button>
                )}
                <button className="btn ghost" onClick={() => setMood(null)}>
                  {t.again}
                </button>
              </footer>
            </>
          )}
        </div>
      </dialog>
    </>
  );
}
