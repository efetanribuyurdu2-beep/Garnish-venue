"use client";

import Link from "next/link";
import { useState } from "react";
import type { MenuItem, MenuSection } from "@/domain/types";
import { worldById } from "@/data/worlds";
import { addSection, deleteSection, saveSection, seedWorldMenu, setAvailable, setPositions, type Workspace } from "@/lib/panel/db";
import { tl } from "@/lib/panel/labels";
import type { L } from "@/lib/types";
import { ItemThumb } from "./ItemThumb";

const STARTERS: L[] = [
  { tr: "İmza Kokteyller", en: "Signatures" },
  { tr: "Klasikler", en: "The Classics" },
  { tr: "Alkolsüz", en: "Zero Proof" },
];

const move = <T,>(list: T[], i: number, d: number) => {
  const out = [...list];
  const j = i + d;
  if (j < 0 || j >= out.length) return out;
  [out[i], out[j]] = [out[j], out[i]];
  return out;
};

/** Sections and drinks: add, rename, order, mark sold out, open a drink to edit. */
export function MenuTab({ ws, reload, canEdit }: { ws: Workspace; reload: () => Promise<unknown>; canEdit: boolean }) {
  const [busy, setBusy] = useState("");
  const [newTitle, setNewTitle] = useState({ tr: "", en: "" });
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState({ tr: "", en: "" });
  const sections = [...ws.sections].sort((a, b) => a.position - b.position);
  const itemsOf = (s: MenuSection) => ws.items.filter((i) => i.sectionId === s.id).sort((a, b) => a.position - b.position);
  const run = async (key: string, fn: () => Promise<unknown>) => {
    setBusy(key);
    try {
      await fn();
      await reload();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setBusy("");
    }
  };

  const add = (title: L) => run("add", () => addSection(ws.venue.id, { tr: title.tr.trim(), en: (title.en || title.tr).trim() }, sections.length));

  return (
    <div className="pn-menu">
      {ws.items.length === 0 && canEdit && (
        <div className="pn-card pn-start pn-seed">
          <p className="pn-eyebrow">{worldById(ws.venue.world).name.tr} dünyası</p>
          <h2>{worldById(ws.venue.world).bar.tr} menüsüyle başlayın</h2>
          <p>
            {worldById(ws.venue.world).collection.tr} koleksiyonu, dünyaya uygun klasikler ve alkolsüzler; reçeteleri, hikâyeleri ve önerilen fiyatlarıyla. Sonra dilediğinizi
            değiştirin ya da silin.
          </p>
          <button className="btn" disabled={!!busy} onClick={() => run("seed", () => seedWorldMenu(ws.venue.id, ws.venue.world, sections.length))}>
            {busy === "seed" ? "Menü hazırlanıyor…" : "Dünyanın menüsünü ekle"}
          </button>
        </div>
      )}

      {sections.length === 0 && (
        <div className="pn-card pn-start">
          <h2>Ya da kendiniz kurun</h2>
          <p>Önce bölümleri ekleyin, sonra her bölüme içkilerinizi. Hızlı başlangıç:</p>
          <div className="pn-row">
            {STARTERS.map((s) => (
              <button key={s.tr} className="btn ghost" disabled={!!busy} onClick={() => add(s)}>
                + {s.tr}
              </button>
            ))}
          </div>
        </div>
      )}

      {sections.map((s, si) => {
        const items = itemsOf(s);
        return (
          <section key={s.id} className="pn-section">
            <header className="pn-section-head">
              {editing === s.id ? (
                <form
                  className="pn-inline"
                  onSubmit={(e) => {
                    e.preventDefault();
                    run(s.id, () => saveSection(s.id, { title: { tr: draft.tr.trim(), en: (draft.en || draft.tr).trim() } })).then(() => setEditing(null));
                  }}
                >
                  <input className="input" value={draft.tr} onChange={(e) => setDraft({ ...draft, tr: e.target.value })} aria-label="Bölüm adı (TR)" required />
                  <input className="input" value={draft.en} onChange={(e) => setDraft({ ...draft, en: e.target.value })} aria-label="Bölüm adı (EN)" placeholder="English" />
                  <button className="btn small">Kaydet</button>
                  <button type="button" className="pn-link" onClick={() => setEditing(null)}>
                    Vazgeç
                  </button>
                </form>
              ) : (
                <>
                  <h2>
                    {s.title.tr} <small>{s.title.en !== s.title.tr ? s.title.en : ""}</small>
                  </h2>
                  {canEdit && (
                    <div className="pn-tools">
                      <button className="pn-icon" title="Yukarı" disabled={si === 0 || !!busy} onClick={() => run("mv", () => setPositions("menu_sections", move(sections, si, -1).map((x) => x.id)))}>
                        ↑
                      </button>
                      <button className="pn-icon" title="Aşağı" disabled={si === sections.length - 1 || !!busy} onClick={() => run("mv", () => setPositions("menu_sections", move(sections, si, 1).map((x) => x.id)))}>
                        ↓
                      </button>
                      <button
                        className="pn-link"
                        onClick={() => {
                          setEditing(s.id);
                          setDraft({ tr: s.title.tr, en: s.title.en });
                        }}
                      >
                        Adını değiştir
                      </button>
                      {items.length === 0 && (
                        <button className="pn-link pn-danger" onClick={() => confirm(`"${s.title.tr}" bölümü silinsin mi?`) && run(s.id, () => deleteSection(s.id))}>
                          Sil
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </header>

            {items.length === 0 && <p className="pn-hint">Bu bölümde henüz içki yok.</p>}
            <ol className="pn-items">
              {items.map((it, ii) => (
                <ItemRow
                  key={it.id}
                  it={it}
                  ws={ws}
                  canEdit={canEdit}
                  busy={busy}
                  first={ii === 0}
                  last={ii === items.length - 1}
                  onMove={(d) => run("mv", () => setPositions("menu_items", move(items, ii, d).map((x) => x.id)))}
                  onToggle={() => run(it.id, () => setAvailable(it.id, !it.available))}
                />
              ))}
            </ol>
            {canEdit && (
              <Link className="pn-add" href={`/panel/${ws.venue.id}/icki/yeni?bolum=${s.id}`}>
                + Bu bölüme içki ekle
              </Link>
            )}
          </section>
        );
      })}

      {canEdit && sections.length > 0 && (
        <form
          className="pn-card pn-inline pn-newsec"
          onSubmit={(e) => {
            e.preventDefault();
            add(newTitle).then(() => setNewTitle({ tr: "", en: "" }));
          }}
        >
          <span className="pn-eyebrow">Yeni bölüm</span>
          {STARTERS.filter((st) => !sections.some((x) => x.title.tr === st.tr)).map((st) => (
            <button key={st.tr} type="button" className="chip" disabled={!!busy} onClick={() => add(st)}>
              + {st.tr}
            </button>
          ))}
          <input className="input" required value={newTitle.tr} onChange={(e) => setNewTitle({ ...newTitle, tr: e.target.value })} placeholder="Ör. Şerbetler" aria-label="Bölüm adı (TR)" />
          <input className="input" value={newTitle.en} onChange={(e) => setNewTitle({ ...newTitle, en: e.target.value })} placeholder="English (ör. Sherbets)" aria-label="Bölüm adı (EN)" />
          <button className="btn small" disabled={busy === "add"}>
            Ekle
          </button>
        </form>
      )}
    </div>
  );
}

function ItemRow({ it, ws, canEdit, busy, first, last, onMove, onToggle }: { it: MenuItem; ws: Workspace; canEdit: boolean; busy: string; first: boolean; last: boolean; onMove: (d: number) => void; onToggle: () => void }) {
  const body = (
    <>
      <span className="pn-thumb">
        <ItemThumb item={it} world={ws.venue.world} />
      </span>
      <span className="pn-item-text">
        <span className="pn-item-name" lang={it.name.tr === it.name.en ? "en" : undefined}>
          {it.featured && <span className="pn-star" title="Barmenin seçimi">✦ </span>}
          {it.name.tr}
        </span>
        <span className="pn-item-meta">
          {tl(it.price)}
          {it.zeroPrice !== undefined && <> · 0% {tl(it.zeroPrice)}</>}
          {it.photo && <> · fotoğraflı</>}
        </span>
      </span>
    </>
  );
  return (
    <li className={`pn-item${it.available ? "" : " sold"}`}>
      {canEdit ? (
        <Link href={`/panel/${ws.venue.id}/icki/${it.id}`} className="pn-item-main">
          {body}
        </Link>
      ) : (
        <span className="pn-item-main">{body}</span>
      )}
      <div className="pn-item-tools">
        <button className={`pn-stock ${it.available ? "" : "out"}`} disabled={busy === it.id} onClick={onToggle} aria-pressed={!it.available} title="Satış durumunu değiştir">
          {it.available ? "Satışta" : "Bitti"}
        </button>
        {canEdit && (
          <>
            <button className="pn-icon" title="Yukarı" disabled={first || !!busy} onClick={() => onMove(-1)}>
              ↑
            </button>
            <button className="pn-icon" title="Aşağı" disabled={last || !!busy} onClick={() => onMove(1)}>
              ↓
            </button>
          </>
        )}
      </div>
    </li>
  );
}
