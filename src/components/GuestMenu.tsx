"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { itemHref, shownVersion } from "@/lib/guestChoice";
import { rememberTable, useGuestPrefs } from "@/lib/guestPrefs";
import type { SectionView } from "@/lib/view";
import { AllergenIcon } from "./AllergenIcon";

export interface GuestMenuText {
  prefs: string;
  zeroOnly: string;
  avoid: string;
  avoidHint: string;
  bigText: string;
  none: string;
  zeroAlso: string;
  allergens: string;
  clear: string;
  done: string;
  chosen: string;
  close: string;
  without: string;
  design: string; // "Tasarlamaya başla" on the Atelier line
}

const BIG_KEY = "garnish-venue:big";

/**
 * The interactive guest menu. A slim bar that stays in reach while scrolling
 * (sections + one "Preferences" button), the drinks with their glass drawn in
 * their own colour, and a preferences sheet (alcohol-free only, leave out an
 * allergen, large text). Glass thumbnails are drawn on the server and passed in.
 */
export function GuestMenu({
  sections,
  thumbs,
  text,
  base,
  query,
  world,
  jaSections,
  atelierHref,
}: {
  sections: SectionView[];
  thumbs: Record<string, React.ReactNode>;
  text: GuestMenuText;
  base: string;
  query: string;
  world: string;
  jaSections?: string[];
  /** where the "your own cocktail" line leads (the Atelier, its own page) */
  atelierHref?: string;
}) {
  const sakura = world === "sakura";
  // shared with "Suggest a drink" and kept for the tab: what the guest asked for applies everywhere
  const [prefs, setPrefs] = useGuestPrefs(base);
  const zeroOnly = prefs.zero;
  const avoid = prefs.avoid;
  const setZeroOnly = (zero: boolean) => setPrefs({ zero });
  const setAvoid = (list: string[]) => setPrefs({ avoid: list });
  const [big, setBig] = useState(false);
  const [active, setActive] = useState(sections[0]?.id);
  const sheet = useRef<HTMLDialogElement>(null);
  // the guest dock (bottom bar) opens the preferences from anywhere on the page
  useEffect(() => {
    const open = () => sheet.current?.showModal();
    window.addEventListener("gv:prefs", open);
    return () => window.removeEventListener("gv:prefs", open);
  }, []);
  const nav = useRef<HTMLDivElement>(null);
  // a table card's QR carries ?masa=N: kept for the tab, for the Atelier's card
  useEffect(() => rememberTable(base), [base]);

  useEffect(() => {
    try {
      setBig(localStorage.getItem(BIG_KEY) === "1");
    } catch {}
  }, []);
  const setBigSaved = (v: boolean) => {
    setBig(v);
    try {
      localStorage.setItem(BIG_KEY, v ? "1" : "0");
    } catch {}
  };

  // only the allergens that actually occur on this menu are offered
  const present = useMemo(() => {
    const m = new Map<string, { id: string; name: string }>();
    sections.forEach((s) => s.items.forEach((i) => [...i.allergens, ...(i.zeroVersion?.allergens ?? [])].forEach((a) => m.set(a.id, a))));
    return [...m.values()];
  }, [sections]);

  // each line as the version the guest is shown (original, or its alcohol-free version), or left out
  const shown = sections
    .map((s) => ({
      ...s,
      items: s.items.flatMap((i) => {
        // the Atelier follows the preferences itself (its shelf), so its line always stays
        if (i.atelier) return prefs.zero && !i.atelierZero ? [] : [{ ...i, v: { key: "original" as const, zero: prefs.zero, price: i.price, description: i.description, kcal: 0, allergens: [] } }];
        const v = shownVersion(i, prefs);
        return v ? [{ ...i, v }] : [];
      }),
    }))
    .filter((s) => s.items.length);

  // scroll-spy: the section in the middle of the screen is the active tab
  useEffect(() => {
    const els = shown.map((s) => document.getElementById(`s-${s.id}`)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id.slice(2))),
      { rootMargin: "-40% 0px -55% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [shown.map((s) => s.id).join()]); // eslint-disable-line react-hooks/exhaustive-deps

  // keep the active tab visible inside the scrolling tab row
  useEffect(() => {
    const tab = nav.current?.querySelector<HTMLElement>(`[data-s="${active}"]`);
    const row = tab?.parentElement;
    if (tab && row) row.scrollTo({ left: tab.offsetLeft - row.clientWidth / 2 + tab.clientWidth / 2, behavior: "smooth" });
  }, [active]);

  const filters = (zeroOnly ? 1 : 0) + avoid.length;
  const clear = () => {
    setZeroOnly(false);
    setAvoid([]);
  };

  return (
    <div className={`gm${big ? " gm-big" : ""}`}>
      <div className="gm-nav" ref={nav}>
        <div className="gm-tabs" role="navigation">
          {shown.map((s) => (
            <a key={s.id} href={`#s-${s.id}`} data-s={s.id} lang={s.titleLang} className={active === s.id ? "on" : ""} aria-current={active === s.id ? "true" : undefined}>
              {s.title}
            </a>
          ))}
        </div>
        <button className="gm-prefs-btn" onClick={() => sheet.current?.showModal()} aria-haspopup="dialog">
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
            <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
              <circle cx="15" cy="7" r="2" />
              <circle cx="9" cy="17" r="2" />
            </g>
          </svg>
          <span className="gm-prefs-label">{text.prefs}</span>
          {filters > 0 && <span className="gm-count">{filters}</span>}
        </button>
      </div>

      {filters > 0 && (
        <div className="gm-active">
          {zeroOnly && (
            <button onClick={() => setZeroOnly(false)}>
              0% · {text.zeroOnly} <span aria-hidden>×</span>
            </button>
          )}
          {avoid.map((id) => {
            const a = present.find((p) => p.id === id);
            return (
              <button key={id} onClick={() => setAvoid(avoid.filter((x) => x !== id))}>
                <AllergenIcon id={id} size={14} /> {a?.name} {text.without} <span aria-hidden>×</span>
              </button>
            );
          })}
        </div>
      )}

      {shown.length === 0 && (
        <p className="gm-none">
          {text.none}{" "}
          <button className="gm-linkbtn" onClick={clear}>
            {text.clear}
          </button>
        </p>
      )}

      {shown.map((s) => (
        <section className="gm-section" key={s.id} id={`s-${s.id}`}>
          <h2 className={`gm-section-title${sakura ? "" : " wm-section-title"}`}>
            {sakura && jaSections?.[sections.findIndex((x) => x.id === s.id)] && (
              <span className="gm-ja-title" lang="ja">
                {jaSections[sections.findIndex((x) => x.id === s.id)]}
              </span>
            )}
            <span lang={s.titleLang}>{s.title}</span>
          </h2>
          {s.note && <p className="gm-section-note">{s.note}</p>}
          <ol className="gm-list">
            {s.items.map((i) => (
              <li key={i.id} className={`gm-item${i.featured ? " featured" : ""}${i.atelier ? " gm-atelier" : ""}`} data-kind={i.kind} data-version={i.v.key}>
                {i.atelier ? (
                  <a href={atelierHref} className="gm-link">
                    <span className="gm-thumb" aria-hidden>
                      {thumbs[i.id]}
                    </span>
                    <span className="gm-body">
                      <span className="gm-eyebrow">
                        <span className="gm-mark wm-mark">✦</span>
                        <span className="gm-chosen" lang="en">Atelier</span>
                      </span>
                      <span className="gm-row">
                        <span className="gm-name" lang={i.nameLang}>
                          {i.name}
                        </span>
                        <span className="gm-leader wm-leader" aria-hidden />
                        <span className="gm-price">{i.price}</span>
                      </span>
                      <span className="gm-desc">{i.description}</span>
                      <span className="gm-meta gm-atelier-go">
                        {i.v.zero && <span className="gm-badge">0%</span>}
                        <span>{text.design} ›</span>
                      </span>
                    </span>
                  </a>
                ) : (
                <Link href={itemHref(base, i.slug, query, i.v.key)} className={`gm-link${i.ja ? " has-ja" : ""}`} scroll={false}>
                  {i.ja && (
                    <span className="gm-ja" lang="ja" aria-hidden>
                      {i.ja.split(/(\d+)/).map((part, k) => (/^\d+$/.test(part) ? <span key={k} className="tcy">{part}</span> : part))}
                    </span>
                  )}
                  <span className="gm-thumb" aria-hidden>
                    {thumbs[i.id]}
                  </span>
                  <span className="gm-body">
                    <span className="gm-eyebrow">
                      <span className="gm-mark wm-mark">{i.mark}</span>
                      {i.featured && <span className="gm-chosen">✦ {text.chosen}</span>}
                    </span>
                    <span className="gm-row">
                      <span className="gm-name" lang={i.nameLang}>
                        {i.name}
                      </span>
                      <span className="gm-leader wm-leader" aria-hidden />
                      <span className="gm-price">{i.v.price}</span>
                    </span>
                    <span className="gm-desc">{i.v.description}</span>
                    <span className="gm-meta">
                      {i.food ? null : i.v.zero ? <span className="gm-badge">0%</span> : <span>{i.abv}</span>}
                      {i.serving && <span>{i.serving}</span>}
                      {i.kcalKnown && i.v.kcal > 0 && <span>{i.v.kcal < 5 ? "< 5" : `≈ ${i.v.kcal}`} kcal</span>}
                      {i.kcalKnown && i.v.kcal === 0 && !i.food && <span>&lt; 5 kcal</span>}
                      {i.alt && <span className="gm-alt">{i.alt}</span>}
                      {i.v.allergens.length > 0 && (
                        <span className="gm-allergens" aria-label={`${text.allergens}: ${i.v.allergens.map((a) => a.name).join(", ")}`}>
                          {i.v.allergens.map((a) => (
                            <AllergenIcon key={a.id} id={a.id} size={big ? 20 : 16} title={a.name} />
                          ))}
                        </span>
                      )}
                      {i.v.key === "original" && i.zeroVersion && (
                        <span className="gm-zero-also">
                          {text.zeroAlso} · {i.zeroVersion.price}
                        </span>
                      )}
                    </span>
                  </span>
                </Link>
                )}
              </li>
            ))}
          </ol>
        </section>
      ))}

      <dialog
        ref={sheet}
        className="gm-sheet"
        aria-label={text.prefs}
        onClick={(e) => e.target === e.currentTarget && sheet.current?.close()}
      >
        <div className="gm-sheet-inner">
          <header className="gm-sheet-head">
            <h2>{text.prefs}</h2>
            <button className="gm-x" onClick={() => sheet.current?.close()} aria-label={text.close}>
              ×
            </button>
          </header>

          <label className="gm-switch">
            <span>
              <strong>0%</strong> · {text.zeroOnly}
            </span>
            <input type="checkbox" checked={zeroOnly} onChange={(e) => setZeroOnly(e.target.checked)} />
            <span className="gm-switch-track" aria-hidden />
          </label>
          <label className="gm-switch">
            <span>
              <strong className="gm-aa">Aa</strong> · {text.bigText}
            </span>
            <input type="checkbox" checked={big} onChange={(e) => setBigSaved(e.target.checked)} />
            <span className="gm-switch-track" aria-hidden />
          </label>

          {present.length > 0 && (
            <>
              <h3 className="gm-sheet-sub">{text.avoid}</h3>
              <p className="gm-sheet-hint">{text.avoidHint}</p>
              <div className="gm-al-grid">
                {present.map((a) => {
                  const on = avoid.includes(a.id);
                  return (
                    <button
                      key={a.id}
                      className={`gm-al-opt${on ? " on" : ""}`}
                      aria-pressed={on}
                      onClick={() => setAvoid(on ? avoid.filter((x) => x !== a.id) : [...avoid, a.id])}
                    >
                      <AllergenIcon id={a.id} size={26} />
                      <span>{a.name}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <footer className="gm-sheet-foot">
            <button className="btn ghost" onClick={clear} disabled={!filters}>
              {text.clear}
            </button>
            <button className="btn" onClick={() => sheet.current?.close()}>
              {text.done}
            </button>
          </footer>
        </div>
      </dialog>
    </div>
  );
}
