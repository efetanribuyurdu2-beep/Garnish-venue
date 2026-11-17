"use client";

import { useEffect, useState } from "react";
import { priceHistory, type PriceRow, type Workspace } from "@/lib/panel/db";
import { tl } from "@/lib/panel/labels";

/** Every price change, newest first: the record an inspection can ask for. Rows cannot be edited or deleted. */
export function HistoryTab({ ws }: { ws: Workspace }) {
  const [rows, setRows] = useState<PriceRow[] | null>(null);
  useEffect(() => {
    priceHistory(ws.venue.id).then(setRows);
  }, [ws.venue.id]);
  const name = (id: string) => ws.items.find((i) => i.id === id)?.name.tr ?? "(silinmiş içki)";
  const when = (s: string) => new Date(s).toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" });
  if (!rows) return <div className="pn-loading" aria-busy="true" />;
  return (
    <section className="pn-card">
      <p className="pn-eyebrow">Kayıt</p>
      <h2>Fiyat geçmişi</h2>
      <p className="pn-hint">Her fiyat değişikliği otomatik olarak, değiştirilemez biçimde kaydedilir. Denetimde bu liste gösterilebilir.</p>
      {rows.length === 0 ? (
        <p className="pn-hint">Henüz kayıt yok.</p>
      ) : (
        <div className="pn-tablewrap">
          <table className="pn-table">
            <thead>
              <tr>
                <th>Tarih</th>
                <th>İçki</th>
                <th>Eski</th>
                <th>Yeni</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{when(r.at)}</td>
                  <td>
                    {name(r.itemId)}
                    {r.field === "zero_price" && <small> · alkolsüz</small>}
                  </td>
                  <td>{r.oldPrice === null ? "—" : tl(r.oldPrice)}</td>
                  <td>{r.newPrice === null ? "—" : tl(r.newPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
