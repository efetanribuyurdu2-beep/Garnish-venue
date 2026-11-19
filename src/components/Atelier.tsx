"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Shelf } from "@/lib/atelier";
import {
  FRAMES,
  GLASS_NAME,
  ICE_NAME,
  METHOD_NAME,
  SLOT_NAME,
  amount,
  analyseDesign,
  applyCorrection,
  correction,
  draw,
  foamOf,
  forSlot,
  frameById,
  glassesFor,
  iceFor,
  methodOf,
  partsOf,
  possible,
  sanitize,
  startFrame,
  suggestName,
  usable,
  type Design,
  type ShelfBottle,
  type SlotDef,
} from "@/lib/atelierKit";
import { readTable, rememberTable, useGuestPrefs, writeTable } from "@/lib/guestPrefs";
import { brandLang, percent, pick } from "@/lib/i18n";
import type { L, Lang, WorldId } from "@/lib/types";
import { AllergenIcon } from "./AllergenIcon";
import { GlassReal } from "./glassReal";

const T = {
  tr: {
    back: "Menü",
    kicker: "Atelier",
    title: "Kendi kokteylini tasarla",
    family: "Aile",
    shelf: "Raf",
    serve: "Sunum",
    glass: "Bardak",
    garnish: "Süs",
    noGarnish: "Süssüz",
    none: "Yok",
    optional: "isteğe bağlı",
    foam: "Köpük",
    name: "Adı",
    another: "Başka bir isim",
    lucky: "Şansına",
    show: "Barmene göster",
    less: "Azalt",
    more: "Arttır",
    balanced: "Dengeli",
    tooSweet: "Biraz tatlı kaçtı",
    tooSour: "Biraz ekşi kaçtı",
    strong: "Oldukça sert",
    weak: "Hafif kaldı",
    fix: "Dengele",
    ends: { sour: ["Ekşi", "Tatlı"], spirit: ["Kuru", "Tatlı"], long: ["Kuru", "Tatlı"], empty: ["", ""] },
    alcohol: "alkol",
    saved: "İmzaların",
    remove: "Sil",
    zero: "Alkolsüz olsun",
    using: "Menü tercihlerin geçerli",
    without: (a: string) => `${a} yok`,
    hidden: (n: number) => (n === 1 ? "Bir şişe tercihlerin yüzünden rafta gösterilmiyor." : `${n} şişe tercihlerin yüzünden rafta gösterilmiyor.`),
    nothing: "Bu rafta tercihlerine uyan bir kokteyl kuracak kadar şişe yok. İstersen tercihlerini değiştirebilirsin; biz kendiliğimizden değiştirmiyoruz.",
    estimate: "≈ değerler tarifinden tahmindir; alerjenleri barmeninle teyit et.",
    axes: ["Tatlı", "Ekşi", "Acı", "Sert", "Ferah", "Aromatik"],
    // the card, read by the bartender
    card: "Misafir imzası",
    table: "Masa",
    tablePh: "Masa no",
    close: "Kapat",
    showThis: "Bu ekranı barmenine göster",
    allergens: "Alerjenler",
    noAllergen: "Bilinen alerjen yok",
    made: "Garnish Atelier",
  },
  en: {
    back: "Menu",
    kicker: "Atelier",
    title: "Design your own cocktail",
    family: "Family",
    shelf: "Shelf",
    serve: "Serve",
    glass: "Glass",
    garnish: "Garnish",
    noGarnish: "No garnish",
    none: "None",
    optional: "optional",
    foam: "Foam",
    name: "Name",
    another: "Another name",
    lucky: "Surprise me",
    show: "Show the bartender",
    less: "Less",
    more: "More",
    balanced: "Balanced",
    tooSweet: "A little too sweet",
    tooSour: "A little too sharp",
    strong: "Quite strong",
    weak: "Rather light",
    fix: "Balance it",
    ends: { sour: ["Sour", "Sweet"], spirit: ["Dry", "Sweet"], long: ["Dry", "Sweet"], empty: ["", ""] },
    alcohol: "alcohol",
    saved: "Your signatures",
    remove: "Remove",
    zero: "Alcohol-free",
    using: "Your menu preferences apply",
    without: (a: string) => `${a}-free`,
    hidden: (n: number) => (n === 1 ? "One bottle is off the shelf because of your preferences." : `${n} bottles are off the shelf because of your preferences.`),
    nothing: "This shelf has too few bottles that fit your preferences to build a cocktail. You can change your preferences if you like; we won't change them for you.",
    estimate: "≈ values are estimated from your recipe; confirm allergens with your bartender.",
    axes: ["Sweet", "Sour", "Bitter", "Strong", "Fresh", "Aromatic"],
    card: "Guest's signature",
    table: "Table",
    tablePh: "Table no.",
    close: "Close",
    showThis: "Show this screen to your bartender",
    allergens: "Allergens",
    noAllergen: "No known allergens",
    made: "Garnish Atelier",
  },
};

const FLAVORS = ["sweet", "sour", "bitter", "strong", "fresh", "aromatic"] as const;
/** "limon kabuğu" → "Limon kabuğu" on a chip (Turkish i → İ) */
const cap = (s: string, lang: Lang) => s.charAt(0).toLocaleUpperCase(lang === "tr" ? "tr-TR" : "en-GB") + s.slice(1);
const SAVE_MAX = 6;
interface Saved {
  d: Design;
  at: number;
}

/** a small bottle, jar, fruit or soda in the liquid's colour, so the shelf reads at a glance */
function BottleMark({ b }: { b: ShelfBottle }) {
  const c = b.color;
  const stroke = "currentColor";
  const shape =
    b.category === "citrus" ? (
      <>
        <circle cx="8" cy="14" r="6.2" fill={c} stroke={stroke} strokeWidth="0.9" />
        <path d="M8 7.8v12.4M2.6 11l10.8 6M2.6 17l10.8-6" stroke="rgba(255,255,255,.55)" strokeWidth="0.7" />
      </>
    ) : b.category === "syrup" || b.category === "other" ? (
      <>
        <path d="M5 6h6v2.2c1.6.7 2.4 2 2.4 3.6v7.6c0 .9-.7 1.6-1.6 1.6H4.2c-.9 0-1.6-.7-1.6-1.6v-7.6c0-1.6.8-2.9 2.4-3.6z" fill={c} stroke={stroke} strokeWidth="0.9" />
        <rect x="4.6" y="3.4" width="6.8" height="2.6" rx="0.6" fill={stroke} />
      </>
    ) : b.category === "mixer" ? (
      <>
        <path d="M6.4 3h3.2v3.4l1.6 2.4v11.6c0 .9-.7 1.6-1.6 1.6H6.4c-.9 0-1.6-.7-1.6-1.6V8.8l1.6-2.4z" fill={c} stroke={stroke} strokeWidth="0.9" />
        <circle cx="7" cy="14" r="0.7" fill="rgba(255,255,255,.7)" />
        <circle cx="9" cy="17" r="0.5" fill="rgba(255,255,255,.7)" />
      </>
    ) : b.category === "bitters" ? (
      <>
        <path d="M4.6 10.2c0-1.4 1.1-2.4 2.4-2.6V5.4h2v2.2c1.3.2 2.4 1.2 2.4 2.6v9.6c0 .9-.7 1.6-1.6 1.6H6.2c-.9 0-1.6-.7-1.6-1.6z" fill={c} stroke={stroke} strokeWidth="0.9" />
        <path d="M6.4 1.6h3.2v3.8H6.4z" fill={stroke} />
      </>
    ) : (
      <>
        <path d="M6.6 1.8h2.8v5.4c2 .8 3 2.3 3 4.4v8.6c0 .9-.7 1.6-1.6 1.6H5.2c-.9 0-1.6-.7-1.6-1.6v-8.6c0-2.1 1-3.6 3-4.4z" fill={c} stroke={stroke} strokeWidth="0.9" />
        <rect x="4.6" y="12" width="6.8" height="4.4" fill="rgba(255,255,255,.55)" />
      </>
    );
  return (
    <svg className="at-bm" width="16" height="24" viewBox="0 0 16 24" aria-hidden>
      {shape}
    </svg>
  );
}

export interface AtelierProps {
  shelf: Shelf;
  world: WorldId;
  lang: Lang;
  barLang: Lang; // the bartender reads the card in the bar's first language
  venueName: string;
  lineName: L; // the menu line, "Kendi kokteylin"
  price: string;
  intro: string;
  base: string; // /v/<slug>
  query: string; // ?lang=…(&world=…)
  allergenNames: Record<string, L>;
}

/**
 * The guest Atelier: a cocktail designed on this bar's own shelf. Pick a family,
 * the bottles and the measures; the glass fills in its colour, the balance,
 * strength, energy and allergens follow every change (the Garnish maths, run
 * here on the shelf the server sent). "Şansına" draws a balanced one. "Show the
 * bartender" opens a card in the bar's language with the table number; the
 * drink is kept in this browser as one of the guest's signatures.
 */
export function Atelier(p: AtelierProps) {
  const t = T[p.lang];
  const tb = T[p.barLang];
  const [prefs, setPrefs] = useGuestPrefs(p.base);
  const { bottles, hidden } = useMemo(() => usable(p.shelf.bottles, prefs), [p.shelf.bottles, prefs]);
  const garnishes = useMemo(() => p.shelf.garnishes.filter((g) => !g.allergens.some((a) => prefs.avoid.includes(a))), [p.shelf.garnishes, prefs.avoid]);
  const gIds = useMemo(() => garnishes.map((g) => g.id), [garnishes]);
  const frames = FRAMES.filter((f) => possible(f, bottles));

  const [wish, setWish] = useState<Design | null>(null);
  const d = useMemo(() => sanitize(wish, bottles, gIds, p.shelf.glasses), [wish, bottles, gIds, p.shelf.glasses]);
  const [nameN, setNameN] = useState(0);
  const [saved, setSaved] = useState<Saved[]>([]);
  const [table, setTable] = useState("");
  const [shownAt, setShownAt] = useState<Date | null>(null);
  const card = useRef<HTMLDialogElement>(null);
  const storeKey = `garnish-venue:atelier:${p.base}`;

  useEffect(() => {
    rememberTable(p.base);
    setTable(readTable(p.base));
    try {
      const raw = localStorage.getItem(storeKey);
      if (raw) setSaved((JSON.parse(raw) as Saved[]).filter((s) => s && s.d && frameById(s.d.frame)).slice(0, SAVE_MAX));
    } catch {}
  }, [p.base, storeKey]);

  const byId = useMemo(() => new Map(p.shelf.bottles.map((b) => [b.id, b])), [p.shelf.bottles]);
  const f = d ? frameById(d.frame)! : undefined;
  const a = d ? analyseDesign(d, bottles) : undefined;
  const fix = d && a ? correction(d, a) : undefined;
  const parts = d ? partsOf(d, bottles) : [];
  const allergens = d
    ? [...new Set([...parts.flatMap((x) => byId.get(x.id)?.allergens ?? []), ...(garnishes.find((g) => g.id === d.garnish)?.allergens ?? [])])]
    : [];
  const foam = foamOf(bottles);
  const name = (lang: Lang) => (d ? d.name.trim() || suggestName(p.world, d.frame, lang, nameN) : "");

  const set = (patch: Partial<Design>) => d && setWish({ ...d, ...patch });
  const setPick = (s: SlotDef, id: string | null) => {
    if (!d) return;
    const picks = { ...d.picks };
    if (id) picks[s.key] = { id, ml: d.picks[s.key]?.ml ?? s.ml };
    else delete picks[s.key];
    setWish({ ...d, picks });
  };
  const step = (s: SlotDef, dir: 1 | -1) => {
    const cur = d?.picks[s.key];
    if (!d || !cur) return;
    const ml = Math.min(s.max, Math.max(s.min, Math.round((cur.ml + dir * s.step) * 10) / 10));
    setWish({ ...d, picks: { ...d.picks, [s.key]: { ...cur, ml } } });
  };
  const chooseFrame = (id: string) => {
    const nf = frameById(id);
    if (nf && d && nf.id !== d.frame) setWish(startFrame(nf, bottles, gIds, p.shelf.glasses, d));
  };
  const lucky = () => {
    const x = draw(bottles, gIds, p.shelf.glasses);
    if (x) {
      setWish(x);
      setNameN((n) => n + 1 + Math.floor(Math.random() * 3));
    }
  };

  const show = () => {
    if (!d) return;
    const keep: Design = { ...d, name: name(p.lang) };
    const same = (x: Design) => JSON.stringify({ ...x, name: "" }) === JSON.stringify({ ...keep, name: "" });
    const next = [{ d: keep, at: Date.now() }, ...saved.filter((s) => !same(s.d))].slice(0, SAVE_MAX);
    setSaved(next);
    try {
      localStorage.setItem(storeKey, JSON.stringify(next));
    } catch {}
    setShownAt(new Date());
    card.current?.showModal();
  };
  const forget = (i: number) => {
    const next = saved.filter((_, k) => k !== i);
    setSaved(next);
    try {
      localStorage.setItem(storeKey, JSON.stringify(next));
    } catch {}
  };

  const activePrefs = prefs.avoid.map((id) => ({ id, name: pick(p.allergenNames[id], p.lang) || id }));
  const balance = a && a.style !== "empty" ? a.balance : 0;
  const verdict = !a
    ? ""
    : a.tip?.kind === "add-acid"
      ? t.tooSweet
      : a.tip?.kind === "add-sugar"
        ? t.tooSour
        : a.tip?.kind === "strong"
          ? t.strong
          : a.tip?.kind === "weak"
            ? t.weak
            : t.balanced;
  const fixSlot = fix && f ? f.slots.find((s) => s.key === fix.key) : undefined;
  const fixBottle = fix && d ? byId.get(d.picks[fix.key]!.id) : undefined;

  return (
    <div className="at" data-frame={d?.frame}>
      <a href={`${p.base}${p.query}`} className="gi-back at-back">
        ← {t.back}
      </a>
      <header className="wm-head at-head">
        <span className="wm-emblem" aria-hidden />
        <p className="wm-kicker" lang="en">
          {t.kicker}
        </p>
        <h1 className="wm-title">{t.title}</h1>
        <p className="wm-greeting">{p.intro}</p>
        <p className="at-price">
          <span>{pick(p.lineName, p.lang)}</span>
          <span className="at-price-v">{p.price}</span>
        </p>
      </header>

      {saved.length > 0 && (
        <div className="at-saved" aria-label={t.saved}>
          <span className="at-label">{t.saved}</span>
          <div className="at-saved-row">
            {saved.map((s, i) => (
              <span key={s.at} className="at-saved-chip">
                <button onClick={() => setWish(s.d)}>
                  {s.d.name}
                </button>
                <button className="at-saved-x" onClick={() => forget(i)} aria-label={`${t.remove}: ${s.d.name}`}>
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {(p.shelf.offersZero || prefs.zero || activePrefs.length > 0) && (
        <div className="at-prefs">
          {(p.shelf.offersZero || prefs.zero) && (
            <label className="gm-switch at-zero">
              <span>
                <strong>0%</strong> · {t.zero}
              </span>
              <input type="checkbox" checked={prefs.zero} onChange={(e) => setPrefs({ zero: e.target.checked })} />
              <span className="gm-switch-track" aria-hidden />
            </label>
          )}
          {activePrefs.length > 0 && (
            <div className="gm-active">
              <span className="at-using">{t.using}:</span>
              {activePrefs.map((x) => (
                <button key={x.id} onClick={() => setPrefs({ avoid: prefs.avoid.filter((y) => y !== x.id) })}>
                  <AllergenIcon id={x.id} size={14} /> {t.without(x.name)} <span aria-hidden>×</span>
                </button>
              ))}
            </div>
          )}
          {hidden > 0 && <p className="at-hidden">{t.hidden(hidden)}</p>}
        </div>
      )}

      {!d || !f || !a ? (
        <p className="at-nothing" role="status">
          {t.nothing}
        </p>
      ) : (
        <div className="at-grid">
          <section className="at-stage" aria-live="polite">
            <div className="at-glass">
              <GlassReal glass={d.glass} color={a.color} opaque={a.opaque} ice={iceFor(f, d.glass)} method={methodOf(d)} garnish={d.garnish} size={150} world={p.world} uid="atelier" />
            </div>
            <div className="at-read">
              <p className="at-name">{name(p.lang)}</p>
              <p className="at-facts">
                <span>≈ {percent(a.abv, p.lang, 0)} {t.alcohol}</span>
                <span>≈ {Math.round(a.kcal / 5) * 5} kcal</span>
                <span>≈ {Math.round(a.finalVolume / 5) * 5} ml</span>
                {allergens.length > 0 && (
                  <span className="at-allergens">
                    {allergens.map((x) => (
                      <AllergenIcon key={x} id={x} size={15} title={pick(p.allergenNames[x], p.lang)} />
                    ))}
                  </span>
                )}
              </p>
              <div className="at-meter" role="meter" aria-valuemin={-1} aria-valuemax={1} aria-valuenow={Math.round(balance * 100) / 100} aria-valuetext={verdict}>
                <span className="at-meter-end">{t.ends[a.style][0]}</span>
                <span className="at-meter-track">
                  <span className="at-meter-mid" aria-hidden />
                  <span className="at-meter-needle" style={{ left: `${((balance + 1) / 2) * 100}%` }} aria-hidden />
                </span>
                <span className="at-meter-end">{t.ends[a.style][1]}</span>
              </div>
              <p className={`at-verdict${a.tip?.kind === "ok" ? " ok" : ""}`}>
                {verdict}
                {fix && fixSlot && fixBottle && (
                  <button className="at-fix" onClick={() => setWish(applyCorrection(d, fix))}>
                    {t.fix}: {pick(fixBottle.name, p.lang)} → {amount(fix.ml, fixSlot.dash, p.lang)}
                  </button>
                )}
              </p>
              <span className="rc-taste at-taste" aria-label={FLAVORS.map((k, i) => `${t.axes[i]} ${Math.round(a.profile[k] * 10) / 10}/5`).join(", ")}>
                {FLAVORS.map((k, i) => (
                  <span key={k} className="rc-axis">
                    <span className="rc-bar">
                      <i style={{ height: `${Math.max(6, (a.profile[k] / 5) * 100)}%` }} />
                    </span>
                    <small>{t.axes[i]}</small>
                  </span>
                ))}
              </span>
            </div>
          </section>

          <div className="at-steps">
            <section className="at-step">
              <h2 className="at-label">
                <span className="at-n">1</span> {t.family}
              </h2>
              <div className="at-frames" role="radiogroup" aria-label={t.family}>
                {frames.map((x) => (
                  <button key={x.id} role="radio" aria-checked={x.id === d.frame} className={`at-frame${x.id === d.frame ? " on" : ""}`} onClick={() => chooseFrame(x.id)} lang="en">
                    <strong>{pick(x.name, p.lang)}</strong>
                    <small lang={p.lang}>{pick(x.hint, p.lang)}</small>
                  </button>
                ))}
              </div>
            </section>

            <section className="at-step">
              <h2 className="at-label">
                <span className="at-n">2</span> {t.shelf}
              </h2>
              {f.slots.map((s) => {
                const list = forSlot(s, bottles);
                const cur = d.picks[s.key];
                if (!list.length) return null;
                return (
                  <div key={s.key} className="at-slot" data-slot={s.key}>
                    <div className="at-slot-head">
                      <span className="at-slot-name">
                        {pick(SLOT_NAME[s.key], p.lang)}
                        {s.optional && <small> · {t.optional}</small>}
                      </span>
                      {cur && (
                        <span className="at-stepper">
                          <button onClick={() => step(s, -1)} disabled={cur.ml <= s.min} aria-label={`${t.less}: ${pick(SLOT_NAME[s.key], p.lang)}`}>
                            −
                          </button>
                          <output>{amount(cur.ml, s.dash, p.lang)}</output>
                          <button onClick={() => step(s, 1)} disabled={cur.ml >= s.max} aria-label={`${t.more}: ${pick(SLOT_NAME[s.key], p.lang)}`}>
                            +
                          </button>
                        </span>
                      )}
                    </div>
                    <div className="at-bottles" role="radiogroup" aria-label={pick(SLOT_NAME[s.key], p.lang)}>
                      {s.optional && (
                        <button role="radio" aria-checked={!cur} className={`at-bottle at-none${!cur ? " on" : ""}`} onClick={() => setPick(s, null)}>
                          {t.none}
                        </button>
                      )}
                      {list.map((b) => (
                        <button key={b.id} role="radio" aria-checked={cur?.id === b.id} className={`at-bottle${cur?.id === b.id ? " on" : ""}`} onClick={() => setPick(s, b.id)}>
                          <BottleMark b={b} />
                          <span>{pick(b.name, p.lang)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
              {f.foam && foam && (
                <label className="gm-switch at-foam">
                  <span>
                    <strong>{t.foam}</strong> · {pick(foam.name, p.lang)}
                  </span>
                  <input type="checkbox" checked={d.foam} onChange={(e) => set({ foam: e.target.checked })} />
                  <span className="gm-switch-track" aria-hidden />
                </label>
              )}
            </section>

            <section className="at-step">
              <h2 className="at-label">
                <span className="at-n">3</span> {t.serve}
              </h2>
              <div className="at-slot">
                <div className="at-slot-head">
                  <span className="at-slot-name">{t.glass}</span>
                </div>
                <div className="at-bottles" role="radiogroup" aria-label={t.glass}>
                  {glassesFor(f, p.shelf.glasses).map((g) => (
                    <button key={g} role="radio" aria-checked={d.glass === g} className={`at-bottle${d.glass === g ? " on" : ""}`} onClick={() => set({ glass: g })}>
                      {pick(GLASS_NAME[g], p.lang)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="at-slot">
                <div className="at-slot-head">
                  <span className="at-slot-name">{t.garnish}</span>
                </div>
                <div className="at-bottles" role="radiogroup" aria-label={t.garnish}>
                  <button role="radio" aria-checked={d.garnish === "none"} className={`at-bottle at-none${d.garnish === "none" ? " on" : ""}`} onClick={() => set({ garnish: "none" })}>
                    {t.noGarnish}
                  </button>
                  {garnishes.map((g) => (
                    <button key={g.id} role="radio" aria-checked={d.garnish === g.id} className={`at-bottle${d.garnish === g.id ? " on" : ""}`} onClick={() => set({ garnish: g.id })}>
                      {cap(pick(g.name, p.lang), p.lang)}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="at-step">
              <h2 className="at-label">
                <label htmlFor="at-name">
                  <span className="at-n">4</span> {t.name}
                </label>
              </h2>
              <div className="at-name-row">
                <input id="at-name" className="input" value={d.name} placeholder={suggestName(p.world, d.frame, p.lang, nameN)} maxLength={40} onChange={(e) => set({ name: e.target.value })} autoComplete="off" />
                <button className="btn ghost" onClick={() => (set({ name: "" }), setNameN((n) => n + 1))} aria-label={t.another} title={t.another}>
                  ↻
                </button>
              </div>
            </section>

            <div className="at-actions">
              <button className="btn ghost" onClick={lucky}>
                ✦ {t.lucky}
              </button>
              <button className="btn" onClick={show}>
                {t.show}
              </button>
            </div>
            <p className="at-note">{t.estimate}</p>
          </div>
        </div>
      )}

      {d && f && a && (
        <dialog ref={card} className="at-show" aria-label={t.show} lang={p.barLang} onClick={(e) => e.target === e.currentTarget && card.current?.close()}>
          <div className="at-show-inner">
            {p.lang !== p.barLang && (
              <p className="at-show-guest" lang={p.lang}>
                {t.showThis}
              </p>
            )}
            <header className="at-show-head">
              <p className="at-show-kicker">
                {tb.card} · <span lang={brandLang(p.venueName)}>{p.venueName}</span>
              </p>
              <h2 className="at-show-name">{name(p.barLang)}</h2>
              {(!name(p.barLang).endsWith(pick(f.name, p.barLang)) || prefs.zero) && (
                <p className="at-show-frame" lang="en">
                  {pick(f.name, p.barLang)}
                  {prefs.zero ? " · 0%" : ""}
                </p>
              )}
            </header>
            <div className="at-show-body">
              <GlassReal glass={d.glass} color={a.color} opaque={a.opaque} ice={iceFor(f, d.glass)} method={methodOf(d)} garnish={d.garnish} size={96} world={p.world} uid="atelier-card" />
              <ol className="at-spec">
                {parts.map((x) => {
                  const s = f.slots.find((y) => d.picks[y.key]?.id === x.id);
                  return (
                    <li key={x.id}>
                      <b>{amount(x.ml, s?.dash, p.barLang)}</b> {pick(byId.get(x.id)?.name, p.barLang)}
                    </li>
                  );
                })}
              </ol>
            </div>
            <p className="at-show-how">
              {pick(METHOD_NAME[methodOf(d)], p.barLang)} · {pick(GLASS_NAME[d.glass], p.barLang)}, {pick(ICE_NAME[iceFor(f, d.glass)], p.barLang)}
              {d.garnish !== "none" && ` · ${pick(garnishes.find((g) => g.id === d.garnish)?.name, p.barLang)}`}
            </p>
            <p className="at-show-facts">
              ≈ {percent(a.abv, p.barLang, 0)} · ≈ {Math.round(a.kcal / 5) * 5} kcal · ≈ {Math.round(a.finalVolume / 5) * 5} ml
            </p>
            <p className="at-show-allergens">
              <span>{tb.allergens}:</span>{" "}
              {allergens.length
                ? allergens.map((x) => (
                    <span key={x} className="at-show-a">
                      <AllergenIcon id={x} size={16} /> {pick(p.allergenNames[x], p.barLang)}
                    </span>
                  ))
                : tb.noAllergen}
            </p>
            <div className="at-show-foot">
              <label className="at-table">
                <span>{tb.table}</span>
                <input
                  className="input"
                  inputMode="numeric"
                  value={table}
                  placeholder={tb.tablePh}
                  maxLength={8}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^\w-]/g, "");
                    setTable(v);
                    writeTable(p.base, v);
                  }}
                />
              </label>
              <p className="at-show-price">
                <span>{pick(p.lineName, p.barLang)}</span>
                <b>{p.price}</b>
              </p>
            </div>
            <p className="at-show-time">
              {shownAt?.toLocaleTimeString(p.barLang === "tr" ? "tr-TR" : "en-GB", { hour: "2-digit", minute: "2-digit" })} · <span lang="en">{tb.made}</span>
            </p>
            <button className="btn ghost at-show-close" onClick={() => card.current?.close()}>
              {t.close}
            </button>
          </div>
        </dialog>
      )}
    </div>
  );
}

