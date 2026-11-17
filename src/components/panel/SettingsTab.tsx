"use client";

import { useState } from "react";
import { PALETTES, WORLDS } from "@/data/worlds";
import { saveVenue, type PanelVenue, type Workspace } from "@/lib/panel/db";
import { WORLD_LINE } from "@/lib/panel/labels";
import type { L } from "@/lib/types";

const blank = (l?: L): L => ({ tr: l?.tr ?? "", en: l?.en ?? "" });
const orNone = (l: L) => (l.tr.trim() || l.en.trim() ? { tr: l.tr.trim(), en: (l.en || l.tr).trim() } : undefined);

/** The bar's identity on the menu: name, line, world, languages, house notes, publishing. */
export function SettingsTab({ ws, reload }: { ws: Workspace; reload: () => Promise<unknown> }) {
  const v = ws.venue;
  const [f, setF] = useState({
    name: v.name,
    city: v.city,
    tagline: blank(v.tagline),
    world: v.world,
    palette: v.palette ?? "noir",
    english: v.languages.includes("en"),
    footer: blank(v.footer),
    serviceNote: blank(v.serviceNote ?? { tr: "Fiyatlara KDV dahildir. Servis ücreti alınmaz.", en: "Prices include VAT. No service charge." }),
    instagram: v.instagram ?? "",
    published: v.published,
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const hasItems = ws.items.some((i) => i.available);
  const set = <K extends keyof typeof f>(k: K, val: (typeof f)[K]) => setF((x) => ({ ...x, [k]: val }));
  const pair = (k: "tagline" | "footer" | "serviceNote", label: string, hint?: string) => (
    <div className="pn-field">
      <span>{label}</span>
      <div className="pn-pair">
        <input className="input" value={f[k].tr} onChange={(e) => set(k, { ...f[k], tr: e.target.value })} placeholder="Türkçe" aria-label={`${label} (TR)`} />
        {f.english && <input className="input" value={f[k].en} onChange={(e) => set(k, { ...f[k], en: e.target.value })} placeholder="English" aria-label={`${label} (EN)`} />}
      </div>
      {hint && <small>{hint}</small>}
    </div>
  );

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (f.published && !hasItems) return setMsg({ kind: "err", text: "Yayına almadan önce menüye en az bir içki ekleyin." });
    setBusy(true);
    setMsg(null);
    try {
      const patch: Partial<PanelVenue> = {
        name: f.name.trim(),
        city: f.city.trim(),
        tagline: { tr: f.tagline.tr.trim(), en: (f.tagline.en || f.tagline.tr).trim() },
        world: f.world,
        palette: f.world === "maison" ? f.palette : undefined,
        languages: f.english ? ["tr", "en"] : ["tr"],
        footer: orNone(f.footer),
        serviceNote: orNone(f.serviceNote),
        instagram: f.instagram.replace(/^@/, "").trim() || undefined,
        published: f.published,
      };
      await saveVenue(v.id, patch);
      await reload();
      setMsg({ kind: "ok", text: f.published ? "Kaydedildi. Menünüz yayında." : "Kaydedildi." });
    } catch (err) {
      setMsg({ kind: "err", text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="pn-card pn-form pn-settings" onSubmit={save}>
      <p className="pn-eyebrow">Ayarlar</p>
      <h2>Menünüzün kimliği</h2>
      <div className="pn-grid2">
        <label className="pn-field">
          <span>Barın adı</span>
          <input className="input" required value={f.name} onChange={(e) => set("name", e.target.value)} />
        </label>
        <label className="pn-field">
          <span>Şehir</span>
          <input className="input" value={f.city} onChange={(e) => set("city", e.target.value)} />
        </label>
      </div>
      <label className="pn-check">
        <input type="checkbox" checked={f.english} onChange={(e) => set("english", e.target.checked)} /> Menü İngilizce de olsun
      </label>
      {pair("tagline", "Alt başlık", "Menünün en üstünde, adın üstünde durur. Ör. Kokteyl Salonu · Karaköy")}

      <fieldset className="pn-field">
        <span>Dünya</span>
        <div className="pn-worlds big">
          {WORLDS.map((w) => (
            <button type="button" key={w.id} className={`pn-world wc-${w.id}${f.world === w.id ? " on" : ""}`} aria-pressed={f.world === w.id} onClick={() => set("world", w.id)}>
              <span className="lp-world-emblem" aria-hidden />
              <span lang={w.name.tr === w.name.en ? "en" : undefined}>{w.name.tr}</span>
              <small>{WORLD_LINE[w.id]}</small>
            </button>
          ))}
        </div>
      </fieldset>
      {f.world === "maison" && (
        <fieldset className="pn-field">
          <span>Maison paleti</span>
          <div className="pn-row">
            {PALETTES.map((p) => (
              <button type="button" key={p.id} className={`chip${f.palette === p.id ? " on" : ""}`} onClick={() => set("palette", p.id)}>
                <span className="pn-swatch" style={{ background: `linear-gradient(135deg, ${p.swatch[0]} 50%, ${p.swatch[1]} 50%)` }} aria-hidden /> {p.name.tr}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {pair("footer", "Kapanış cümlesi", "Menünün sonunda, barın sesiyle. Ör. Her kokteyl siparişle hazırlanır.")}
      {pair("serviceNote", "Yasal not", "Her sayfanın altında görünür. KDV ve servis ücreti bilgisi.")}
      <label className="pn-field">
        <span>Instagram</span>
        <input className="input" value={f.instagram} onChange={(e) => set("instagram", e.target.value)} placeholder="@kullaniciadi" />
      </label>

      <label className={`pn-publish${f.published ? " on" : ""}`}>
        <input type="checkbox" checked={f.published} onChange={(e) => set("published", e.target.checked)} />
        <span>
          <strong>{f.published ? "Yayında" : "Taslak"}</strong>
          <small>{f.published ? "Misafirler QR kodla menünüzü açabilir." : "Menünüz yalnızca bu panelden görünür."}</small>
        </span>
      </label>

      {msg && <p className={`pn-msg ${msg.kind}`}>{msg.text}</p>}
      <button className="btn" disabled={busy}>
        {busy ? "Kaydediliyor…" : "Kaydet"}
      </button>
    </form>
  );
}
