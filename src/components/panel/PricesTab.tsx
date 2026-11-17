"use client";

import { useMemo, useState } from "react";
import type { MenuItem } from "@/domain/types";
import { reprice, saveItem, type Workspace } from "@/lib/panel/db";
import { kurusToTl, tl, tlToKurus } from "@/lib/panel/labels";

const STEPS = [
  [100, "1 ₺"],
  [500, "5 ₺"],
  [1000, "10 ₺"],
  [5000, "50 ₺"],
] as const;

const round = (k: number, pct: number, step: number) => Math.max(0, Math.round((k * (1 + pct / 100)) / step) * step);

/** Bulk price change with a preview, and every price editable in one list. */
export function PricesTab({ ws, reload }: { ws: Workspace; reload: () => Promise<unknown> }) {
  const [pct, setPct] = useState("10");
  const [step, setStep] = useState(1000);
  const [scope, setScope] = useState<string>("all");
  const [withZero, setWithZero] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const p = Number(pct.replace(",", "."));
  const ok = Number.isFinite(p) && p !== 0 && p >= -90 && p <= 300;

  const sections = [...ws.sections].sort((a, b) => a.position - b.position);
  const inScope = ws.items.filter((i) => scope === "all" || i.sectionId === scope).sort((a, b) => a.position - b.position);

  const apply = async () => {
    if (!ok) return;
    if (!confirm(`${inScope.length} içkinin fiyatı %${p} ${p > 0 ? "artacak" : "düşecek"}. Onaylıyor musunuz?`)) return;
    setBusy(true);
    try {
      const n = await reprice(ws.venue.id, p, step, scope === "all" ? null : scope, withZero);
      await reload();
      setMsg(`${n} içkinin fiyatı güncellendi. Değişiklikler fiyat geçmişine kaydedildi.`);
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pn-prices">
      <section className="pn-card">
        <p className="pn-eyebrow">Toplu güncelleme</p>
        <h2>Fiyatları tek seferde değiştirin</h2>
        <div className="pn-bulk">
          <label className="pn-field">
            <span>Değişim (%)</span>
            <input className="input" inputMode="decimal" value={pct} onChange={(e) => setPct(e.target.value)} />
          </label>
          <label className="pn-field">
            <span>Yuvarla</span>
            <select className="input" value={step} onChange={(e) => setStep(Number(e.target.value))}>
              {STEPS.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label className="pn-field">
            <span>Kapsam</span>
            <select className="input" value={scope} onChange={(e) => setScope(e.target.value)}>
              <option value="all">Tüm menü</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title.tr}
                </option>
              ))}
            </select>
          </label>
          <label className="pn-check">
            <input type="checkbox" checked={withZero} onChange={(e) => setWithZero(e.target.checked)} /> Alkolsüz fiyatları da
          </label>
        </div>
        {ok && inScope.length > 0 && (
          <ul className="pn-preview">
            {inScope.slice(0, 6).map((i) => (
              <li key={i.id}>
                <span>{i.name.tr}</span>
                <span>
                  {tl(i.price)} → <strong>{tl(round(i.price, p, step))}</strong>
                </span>
              </li>
            ))}
            {inScope.length > 6 && <li className="pn-hint">… ve {inScope.length - 6} içki daha</li>}
          </ul>
        )}
        {msg && <p className="pn-msg ok">{msg}</p>}
        <button className="btn" disabled={!ok || busy || !inScope.length} onClick={apply}>
          {busy ? "Güncelleniyor…" : "Fiyatları güncelle"}
        </button>
      </section>

      <section className="pn-card">
        <p className="pn-eyebrow">Tek tek</p>
        <h2>Bütün fiyatlar</h2>
        {sections.map((s) => {
          const items = ws.items.filter((i) => i.sectionId === s.id).sort((a, b) => a.position - b.position);
          if (!items.length) return null;
          return (
            <div key={s.id} className="pn-pricegroup">
              <h3>{s.title.tr}</h3>
              {items.map((i) => (
                <PriceRow key={`${i.id}-${i.price}-${i.zeroPrice}`} it={i} reload={reload} />
              ))}
            </div>
          );
        })}
      </section>
    </div>
  );
}

function PriceRow({ it, reload }: { it: MenuItem; reload: () => Promise<unknown> }) {
  const [price, setPrice] = useState(kurusToTl(it.price));
  const [zero, setZero] = useState(kurusToTl(it.zeroPrice));
  const [busy, setBusy] = useState(false);
  const changed = useMemo(() => price !== kurusToTl(it.price) || zero !== kurusToTl(it.zeroPrice), [price, zero, it]);
  const valid = Number.isFinite(tlToKurus(price)) && (zero === "" || Number.isFinite(tlToKurus(zero)));
  return (
    <form
      className="pn-pricerow"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          await saveItem({ id: it.id, venueId: it.venueId, price: tlToKurus(price), zeroPrice: zero === "" ? undefined : tlToKurus(zero) });
          await reload();
        } catch (err) {
          alert((err as Error).message);
          setBusy(false);
        }
      }}
    >
      <span className="pn-pricename">{it.name.tr}</span>
      <label>
        <span className="sr">Fiyat</span>
        <input className="input" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} aria-label={`${it.name.tr} fiyatı (₺)`} />
      </label>
      <label>
        <span className="sr">Alkolsüz</span>
        <input className="input" inputMode="decimal" value={zero} placeholder="0% —" onChange={(e) => setZero(e.target.value)} aria-label={`${it.name.tr} alkolsüz fiyatı (₺)`} />
      </label>
      <button className="btn small" disabled={!changed || !valid || busy}>
        Kaydet
      </button>
    </form>
  );
}
