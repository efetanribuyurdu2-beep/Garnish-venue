"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { pick } from "@/lib/i18n";
import { AXES, MOODS, match, type Mood } from "@/lib/moods";
import type { Lang } from "@/lib/types";
import type { SectionView } from "@/lib/view";

const T = {
  tr: {
    title: "Karar veremedin mi?",
    body: "Bu akşam nasıl bir şey istediğini seç; barmenimiz bu menüden üç içki önersin.",
    open: "Bana bir içki öner",
    ask: "Bu akşam nasıl bir şey?",
    zero: "Alkolsüz olsun",
    result: "Barmenin önerileri",
    fit: "uyum",
    again: "Başka bir şey",
    close: "Kapat",
    none: "Bu seçime uyan içki kalmadı; alkolsüz seçeneğini kapatmayı deneyin.",
    axes: ["Tatlı", "Ekşi", "Acı", "Sert", "Ferah", "Aromatik"],
  },
  en: {
    title: "Can't decide?",
    body: "Tell us what you're in the mood for; our bartender will pick three drinks from this menu.",
    open: "Suggest a drink",
    ask: "What are you in the mood for?",
    zero: "Alcohol-free",
    result: "The bartender suggests",
    fit: "match",
    again: "Something else",
    close: "Close",
    none: "Nothing on the menu fits this choice; try without alcohol-free.",
    axes: ["Sweet", "Sour", "Bitter", "Strong", "Fresh", "Aromatic"],
  },
};

/** "Suggest a drink": six moods → the three drinks on this menu whose taste fits best. */
export function Recommender({ sections, lang, base, query }: { sections: SectionView[]; lang: Lang; base: string; query: string }) {
  const t = T[lang];
  const sheet = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const open = () => sheet.current?.showModal();
    window.addEventListener("gv:recommend", open);
    return () => window.removeEventListener("gv:recommend", open);
  }, []);
  const [mood, setMood] = useState<Mood | null>(null);
  const [zero, setZero] = useState(false);
  const all = sections.flatMap((s) => s.items).filter((i): i is typeof i & { profile: number[] } => Boolean(i.profile));
  // alcohol-free drinks are suggested when asked for (or when the menu has too few others)
  const boozy = all.filter((i) => !i.zero);
  const pool = zero ? all.filter((i) => i.zero || i.zeroPrice) : boozy.length >= 3 ? boozy : all;
  const picks = mood
    ? pool
        .map((i) => ({ i, score: match(i.profile, mood) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
    : [];
  if (all.length < 3) return null;

  return (
    <>
      <div className="rc-invite">
        <div>
          <p className="rc-title">{t.title}</p>
          <p className="rc-body">{t.body}</p>
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
                <input type="checkbox" checked={zero} onChange={(e) => setZero(e.target.checked)} />
                <span className="gm-switch-track" aria-hidden />
              </label>
            </>
          ) : (
            <>
              <p className="rc-chosen">
                {pick(mood.name, lang)}
                {zero ? ` · 0%` : ""}
              </p>
              {picks.length === 0 && <p className="rc-body">{t.none}</p>}
              <ol className="rc-list">
                {picks.map(({ i, score }) => (
                  <li key={i.id}>
                    <Link href={`${base}/${encodeURIComponent(i.slug)}${query}`} className="rc-pick" onClick={() => sheet.current?.close()} scroll={false}>
                      <span className="rc-pick-head">
                        <span className="rc-name" lang={i.nameLang}>
                          {i.name}
                        </span>
                        <span className="rc-price">{zero && !i.zero && i.zeroPrice ? i.zeroPrice : i.price}</span>
                      </span>
                      <span className="rc-desc">{i.description}</span>
                      <span className="rc-taste" aria-label={AXES.map((_, k) => `${t.axes[k]} ${i.profile[k]}/5`).join(", ")}>
                        {AXES.map((a, k) => (
                          <span key={a} className="rc-axis">
                            <span className="rc-bar">
                              <i style={{ height: `${Math.max(6, (i.profile[k] / 5) * 100)}%` }} />
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
