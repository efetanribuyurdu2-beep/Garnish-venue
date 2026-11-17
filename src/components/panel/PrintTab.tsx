"use client";

import Link from "next/link";
import { useState } from "react";
import type { Workspace } from "@/lib/panel/db";

/** The printed price list (a legal requirement next to a QR menu) and the table cards. */
export function PrintTab({ ws }: { ws: Workspace }) {
  const v = ws.venue;
  const [tables, setTables] = useState("8");
  const [copied, setCopied] = useState(false);
  const n = Math.min(60, Math.max(1, Number(tables) || 1));
  const url = typeof window === "undefined" ? `/v/${v.slug}` : `${location.origin}/v/${v.slug}`;

  if (!v.published)
    return (
      <section className="pn-card">
        <p className="pn-eyebrow">Basılı menü & QR</p>
        <h2>Önce menünüzü yayına alın</h2>
        <p className="pn-hint">Basılı menü ve QR kartları, misafirlerin göreceği yayındaki menüden hazırlanır. Ayarlar sekmesinden &quot;Yayında&quot;yı seçin.</p>
        <Link className="btn ghost" href={`/panel/${v.id}?t=ayar`}>
          Ayarlara git
        </Link>
      </section>
    );

  return (
    <div className="pn-print">
      <section className="pn-card">
        <p className="pn-eyebrow">Basılı menü</p>
        <h2>Fiyat listesi, A4</h2>
        <p className="pn-hint">
          QR menünün yanında basılı bir fiyat listesi bulunması zorunlu. Bu sayfa her içkiyi fiyatı, içindekiler, alkol oranı, kalori ve alerjenleriyle; alerjen açıklamaları, yasal notlar,
          fiyatların geçerlilik tarihi ve menünüze giden bir QR kodla birlikte hazırlar. Fiyat değiştirdiğinizde yeniden yazdırın, tarih kendiliğinden güncellenir.
        </p>
        <div className="pn-row">
          <a className="btn" href={`/yazdir/${v.slug}`} target="_blank" rel="noreferrer">
            Basılı menüyü aç
          </a>
          <a className="btn ghost" href={`/yazdir/${v.slug}?kagit=acik`} target="_blank" rel="noreferrer">
            Açık kâğıt (mürekkep dostu)
          </a>
        </div>
        <p className="pn-hint pn-small">Açılan sayfada &quot;Yazdır · PDF kaydet&quot;e dokunun. Yazıcı seçerken &quot;Arka plan grafikleri&quot; açık olsun.</p>
      </section>

      <section className="pn-card">
        <p className="pn-eyebrow">Masa kartları</p>
        <h2>Her masaya bir QR</h2>
        <p className="pn-hint">Barınızın dünyasında, A6 boyutunda kartlar; bir A4 sayfaya dört tane. Kalın kâğıda basın, kesik çizgilerden kesin, masa standına koyun.</p>
        <div className="pn-row">
          <label className="pn-field pn-tables">
            <span>Masa sayısı</span>
            <input className="input" type="number" inputMode="numeric" min={1} max={60} value={tables} onChange={(e) => setTables(e.target.value)} />
          </label>
          <a className="btn" href={`/yazdir/${v.slug}/qr?masa=${n}`} target="_blank" rel="noreferrer">
            {n} masa kartını aç
          </a>
          <a className="btn ghost" href={`/yazdir/${v.slug}/qr?numara=yok`} target="_blank" rel="noreferrer">
            Numarasız tek kart
          </a>
        </div>
      </section>

      <section className="pn-card">
        <p className="pn-eyebrow">Menü bağlantısı</p>
        <h2>Instagram, Google, WhatsApp için</h2>
        <div className="pn-row">
          <code className="pn-url">{url}</code>
          <button
            className="btn small"
            onClick={async () => {
              await navigator.clipboard.writeText(url);
              setCopied(true);
              setTimeout(() => setCopied(false), 1800);
            }}
          >
            {copied ? "Kopyalandı" : "Kopyala"}
          </button>
        </div>
      </section>
    </div>
  );
}
