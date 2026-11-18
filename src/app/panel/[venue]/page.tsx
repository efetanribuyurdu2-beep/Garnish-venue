"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { HistoryTab } from "@/components/panel/HistoryTab";
import { MenuTab } from "@/components/panel/MenuTab";
import { PricesTab } from "@/components/panel/PricesTab";
import { PrintTab } from "@/components/panel/PrintTab";
import { SettingsTab } from "@/components/panel/SettingsTab";
import { worldById } from "@/data/worlds";
import { loadWorkspace, type Workspace } from "@/lib/panel/db";

const ICON: Record<string, React.ReactNode> = {
  menu: <path d="M5 6h14M5 12h14M5 18h9" />,
  fiyat: <path d="M4 13l8-8h7v7l-8 8zM15 9h.01" />,
  ayar: <path d="M12 9a3 3 0 100 6 3 3 0 000-6zM12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" />,
  baski: <path d="M7 8V3h10v5M6 18H4v-8h16v8h-2M7 14h10v7H7z" />,
  gecmis: <path d="M12 7v5l3 2M3 12a9 9 0 109-9 9 9 0 00-7 3.3M3 4v4h4" />,
};
const SHORT: Record<string, string> = { menu: "Menü", fiyat: "Fiyat", ayar: "Ayarlar", baski: "Baskı & QR", gecmis: "Geçmiş" };

const TABS = [
  ["menu", "Menü"],
  ["fiyat", "Fiyatlar"],
  ["ayar", "Ayarlar"],
  ["baski", "Basılı menü & QR"],
  ["gecmis", "Fiyat geçmişi"],
] as const;
type Tab = (typeof TABS)[number][0];

export default function VenueWorkspace() {
  const { venue: id } = useParams<{ venue: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const tab = (TABS.find(([k]) => k === search.get("t"))?.[0] ?? "menu") as Tab;
  const [ws, setWs] = useState<Workspace | null | undefined>(undefined);

  const reload = useCallback(() => loadWorkspace(id).then(setWs), [id]);
  useEffect(() => {
    reload();
  }, [reload]);

  if (ws === undefined) return <div className="pn-loading" aria-busy="true" />;
  if (ws === null)
    return (
      <div className="pn-empty">
        <h1>Bu bara erişiminiz yok</h1>
        <Link className="btn ghost" href="/panel">
          Barlarım
        </Link>
      </div>
    );

  const v = ws.venue;
  const canEdit = ws.role !== "staff";
  return (
    <div className="pn-page" data-world-hint={v.world}>
      <header className="pn-head">
        <Link href="/panel" className="pn-back">
          ← Barlarım
        </Link>
        <div className={`pn-head-row wc-${v.world}`}>
          <span className="lp-world-emblem" aria-hidden />
          <div>
            <h1>{v.name}</h1>
            <p className="pn-head-meta">
              {worldById(v.world).name.tr} · /v/{v.slug} ·{" "}
              <span className={`pn-pill ${v.published ? "live" : ""}`}>{v.published ? "Yayında" : "Taslak"}</span>
            </p>
          </div>
          {v.published && (
            <a className="btn ghost pn-open" href={`/v/${v.slug}`} target="_blank" rel="noreferrer">
              Menüyü aç ↗
            </a>
          )}
        </div>
        <nav className="pn-tabs" aria-label="Bölümler">
          {TABS.filter(([k]) => canEdit || k === "menu").map(([k, label]) => (
            <button key={k} className={tab === k ? "on" : ""} aria-current={tab === k ? "page" : undefined} onClick={() => router.replace(`/panel/${id}${k === "menu" ? "" : `?t=${k}`}`, { scroll: false })}>
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden className="pn-tab-icon">
                <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  {ICON[k]}
                </g>
              </svg>
              <span className="pn-tab-long">{label}</span>
              <span className="pn-tab-short">{SHORT[k]}</span>
            </button>
          ))}
        </nav>
      </header>
      {tab === "menu" && <MenuTab ws={ws} reload={reload} canEdit={canEdit} />}
      {tab === "fiyat" && canEdit && <PricesTab ws={ws} reload={reload} />}
      {tab === "ayar" && canEdit && <SettingsTab ws={ws} reload={reload} />}
      {tab === "baski" && canEdit && <PrintTab ws={ws} />}
      {tab === "gecmis" && canEdit && <HistoryTab ws={ws} />}
    </div>
  );
}
