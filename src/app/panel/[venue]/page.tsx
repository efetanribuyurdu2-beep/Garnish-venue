"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { HistoryTab } from "@/components/panel/HistoryTab";
import { MenuTab } from "@/components/panel/MenuTab";
import { PricesTab } from "@/components/panel/PricesTab";
import { SettingsTab } from "@/components/panel/SettingsTab";
import { worldById } from "@/data/worlds";
import { loadWorkspace, type Workspace } from "@/lib/panel/db";

const TABS = [
  ["menu", "Menü"],
  ["fiyat", "Fiyatlar"],
  ["ayar", "Ayarlar"],
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
              {label}
            </button>
          ))}
        </nav>
      </header>
      {tab === "menu" && <MenuTab ws={ws} reload={reload} canEdit={canEdit} />}
      {tab === "fiyat" && canEdit && <PricesTab ws={ws} reload={reload} />}
      {tab === "ayar" && canEdit && <SettingsTab ws={ws} reload={reload} />}
      {tab === "gecmis" && canEdit && <HistoryTab ws={ws} />}
    </div>
  );
}
