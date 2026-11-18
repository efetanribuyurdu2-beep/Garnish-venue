"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { WORLDS } from "@/data/worlds";
import { createVenue, myVenues, seedWorldMenu, slugAvailable, type PanelVenue, type Role } from "@/lib/panel/db";
import type { WorldId } from "@/lib/types";
import { slugify } from "@/lib/panel/labels";

const ROLE: Record<Role, string> = { owner: "Sahip", manager: "Yönetici", staff: "Personel" };

export default function PanelHome() {
  const router = useRouter();
  const [list, setList] = useState<{ venue: PanelVenue; role: Role }[] | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [city, setCity] = useState("İstanbul");
  const [world, setWorld] = useState<WorldId>("maison");
  const [starter, setStarter] = useState(true);
  const [free, setFree] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    myVenues().then(setList).catch((e) => setErr(e.message));
  }, []);

  const s = slugTouched ? slug : slugify(name);
  useEffect(() => {
    if (s.length < 2) return setFree(null);
    const t = setTimeout(() => slugAvailable(s).then(setFree).catch(() => setFree(null)), 300);
    return () => clearTimeout(t);
  }, [s]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const v = await createVenue(s, name.trim(), city.trim(), world);
      if (starter) await seedWorldMenu(v.id, world);
      router.push(`/panel/${v.id}`);
    } catch (e) {
      setErr((e as Error).message.includes("duplicate") ? "Bu adres alınmış, başka bir tane deneyin." : (e as Error).message);
      setBusy(false);
    }
  };

  if (!list) return <div className="pn-loading" aria-busy="true" />;

  return (
    <div className="pn-page">
      {list.length > 0 && (
        <section>
          <p className="pn-eyebrow">Barlarınız</p>
          <ul className="pn-venues">
            {list.map(({ venue: v, role }) => (
              <li key={v.id}>
                <Link href={`/panel/${v.id}`} className={`pn-venue wc-${v.world}`} data-world={v.world}>
                  <span className="pn-venue-wall" aria-hidden />
                  <span className="lp-world-emblem" aria-hidden />
                  <span className="pn-venue-name">{v.name}</span>
                  <span className="pn-venue-meta">
                    /v/{v.slug} · {ROLE[role]} · {v.published ? "Yayında" : "Taslak"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="pn-card">
        <p className="pn-eyebrow">{list.length ? "Yeni bar" : "İlk adım"}</p>
        <h1>{list.length ? "Bir bar daha ekleyin" : "Barınızı oluşturun"}</h1>
        <form onSubmit={create} className="pn-form">
          <label className="pn-field">
            <span>Barın adı</span>
            <input className="input" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ör. Maison Noire" />
          </label>
          <label className="pn-field">
            <span>Menü adresi</span>
            <div className="pn-slug">
              <span>…/v/</span>
              <input
                className="input"
                required
                pattern="[a-z0-9][a-z0-9\-]{1,40}"
                value={s}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(slugify(e.target.value));
                }}
              />
            </div>
            <small className={free === false ? "pn-bad" : ""}>{free === false ? "Bu adres alınmış." : free ? "Adres boşta." : "Misafirlerin QR ile açacağı adres."}</small>
          </label>
          <label className="pn-field">
            <span>Şehir</span>
            <input className="input" value={city} onChange={(e) => setCity(e.target.value)} />
          </label>
          <fieldset className="pn-field">
            <span>Dünya</span>
            <div className="pn-worlds">
              {WORLDS.map((w) => (
                <button type="button" key={w.id} className={`pn-world wc-${w.id}${world === w.id ? " on" : ""}`} aria-pressed={world === w.id} onClick={() => setWorld(w.id)}>
                  <span className="lp-world-emblem" aria-hidden />
                  <span lang={w.name.tr === w.name.en ? "en" : undefined}>{w.name.tr}</span>
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="pn-field">
            <span>Menü</span>
            <div className="pn-choice">
              <label className={`pn-option${starter ? " on" : ""}`}>
                <input type="radio" name="starter" checked={starter} onChange={() => setStarter(true)} />
                <span>
                  <strong>{WORLDS.find((w) => w.id === world)?.bar.tr} menüsüyle başla</strong>
                  <small>
                    {WORLDS.find((w) => w.id === world)?.collection.tr}, klasikler, alkolsüzler, şarap ve içki rafı, mutfağı (meze, atıştırmalık, tatlı) önerilen fiyatlarla gelir; dilediğinizi değiştirir, silersiniz.
                  </small>
                </span>
              </label>
              <label className={`pn-option${!starter ? " on" : ""}`}>
                <input type="radio" name="starter" checked={!starter} onChange={() => setStarter(false)} />
                <span>
                  <strong>Boş menü</strong>
                  <small>Bölümleri ve içkileri kendiniz eklersiniz.</small>
                </span>
              </label>
            </div>
          </fieldset>
          {err && <p className="pn-msg err">{err}</p>}
          <button className="btn" disabled={busy || free === false || s.length < 2 || !name.trim()}>
            {busy ? (starter ? "Bar ve menü hazırlanıyor…" : "Oluşturuluyor…") : "Barı oluştur"}
          </button>
        </form>
      </section>
    </div>
  );
}
