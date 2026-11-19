"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AllergenIcon } from "@/components/AllergenIcon";
import { ItemThumb } from "@/components/panel/ItemThumb";
import { COCKTAILS, GARNISHES } from "@/data/cocktails";
import { CATEGORY_LABEL, INGREDIENTS, ingredientById } from "@/data/ingredients";
import { DISH_LABEL, LIBRARY_GROUPS, libItemFields, libraryById } from "@/data/kitchen";
import { WORLDS } from "@/data/worlds";
import type { ItemDetails, ItemKind, MenuItem, Photo, Recipe } from "@/domain/types";
import { ALLERGENS } from "@/lib/allergens";
import { factsOf, itemFacts, zeroRecipe } from "@/lib/facts";
import { KIND_LABEL, STYLES } from "@/lib/itemLook";
import { nameLang, percent } from "@/lib/i18n";
import { db, deleteItem, loadWorkspace, saveItem, type Workspace } from "@/lib/panel/db";
import { GLASS_LABEL, ICE_LABEL, METHOD_LABEL, kurusToTl, slugify, tl, tlToKurus } from "@/lib/panel/labels";
import { uploadDrinkPhoto } from "@/lib/photoUpload";
import type { Glass, Ice, IngredientCategory, L, Method, Part } from "@/lib/types";

const CATS = Object.keys(CATEGORY_LABEL) as IngredientCategory[];
const BY_CAT = CATS.map((c) => ({
  c,
  list: INGREDIENTS.filter((i) => i.category === c).sort((a, b) => a.name.tr.localeCompare(b.name.tr, "tr")),
}));

const EMPTY: Recipe = { parts: [], method: "stir", glass: "coupe", ice: "none", garnish: "none" };

function describe(parts: Part[]): L {
  const names = parts.filter((p) => p.ml >= 5).slice(0, 4).map((p) => ingredientById(p.id)?.name).filter(Boolean) as L[];
  return { tr: names.map((n) => n.tr).join(" · "), en: names.map((n) => n.en).join(" · ") };
}

const KINDS: ItemKind[] = ["cocktail", "wine", "beer", "spirit", "food", "other"];
/** allergens a new line of this kind starts with (the bar can untick them) */
const KIND_ALLERGENS: Partial<Record<ItemKind, string[]>> = { wine: ["sulphites"], beer: ["gluten"] };

interface DetailsDraft {
  style: string;
  abv: string;
  volume: string;
  kcal: string;
  serving: L;
  origin: L;
  altLabel: L;
  altPrice: string;
  plate: string;
  color?: string;
}
const num = (s: string) => (s.trim() === "" ? undefined : Number(s.replace(",", ".")));
const detailsFrom = (d?: ItemDetails): DetailsDraft => ({
  style: d?.style ?? "",
  abv: d?.abv !== undefined ? String(d.abv).replace(".", ",") : "",
  volume: d?.volume !== undefined ? String(d.volume) : "",
  kcal: d?.kcal !== undefined ? String(d.kcal) : "",
  serving: d?.serving ?? { tr: "", en: "" },
  origin: d?.origin ?? { tr: "", en: "" },
  altLabel: d?.alt?.label ?? { tr: "", en: "" },
  altPrice: d?.alt ? kurusToTl(d.alt.price) : "",
  plate: d?.plate ?? "",
  color: d?.color,
});
const pair = (l: L) => (l.tr.trim() || l.en.trim() ? { tr: l.tr.trim(), en: (l.en || l.tr).trim() } : undefined);
function detailsTo(x: DetailsDraft, kind: ItemKind): ItemDetails {
  const alt = tlToKurus(x.altPrice);
  const out: ItemDetails = {};
  if (x.style) out.style = x.style;
  if (kind !== "food" && num(x.abv) !== undefined) out.abv = num(x.abv);
  if (num(x.volume) !== undefined) out.volume = num(x.volume);
  if (num(x.kcal) !== undefined) out.kcal = num(x.kcal);
  if (pair(x.serving)) out.serving = pair(x.serving);
  if (pair(x.origin)) out.origin = pair(x.origin);
  if (pair(x.altLabel) && alt > 0) out.alt = { label: pair(x.altLabel)!, price: alt };
  if (kind === "food" && x.plate) out.plate = x.plate;
  if (kind !== "food" && x.color) out.color = x.color;
  return out;
}

interface Draft {
  kind: ItemKind;
  details: DetailsDraft;
  name: L;
  description: L;
  story: L;
  sectionId: string;
  price: string;
  hasZero: boolean;
  zeroPrice: string;
  recipe: Recipe;
  extraAllergens: string[];
  featured: boolean;
  available: boolean;
  photo?: Photo;
  libraryId?: string;
}

const fromItem = (i: MenuItem): Draft => ({
  kind: i.kind ?? "cocktail",
  details: detailsFrom(i.details),
  name: i.name,
  description: i.description,
  story: i.story ?? { tr: "", en: "" },
  sectionId: i.sectionId,
  price: kurusToTl(i.price),
  hasZero: i.zeroPrice !== undefined,
  zeroPrice: kurusToTl(i.zeroPrice),
  recipe: i.recipe ?? EMPTY,
  extraAllergens: i.extraAllergens ?? [],
  featured: Boolean(i.featured),
  available: i.available,
  photo: i.photo,
  libraryId: i.libraryId,
});

/** One drink: recipe in, everything the guest sees out, previewed live. */
export default function ItemEditor() {
  const { venue: venueId, item: itemId } = useParams<{ venue: string; item: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const isNew = itemId === "yeni";
  const [ws, setWs] = useState<Workspace | null | undefined>(undefined);
  const [d, setD] = useState<Draft | null>(null);
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    loadWorkspace(venueId).then((w) => {
      setWs(w);
      if (!w) return;
      const existing = w.items.find((i) => i.id === itemId);
      if (existing) setD(fromItem(existing));
      else
        setD({
          kind: (search.get("tur") as ItemKind) || "cocktail",
          details: detailsFrom(),
          name: { tr: "", en: "" },
          description: { tr: "", en: "" },
          story: { tr: "", en: "" },
          sectionId: search.get("bolum") ?? w.sections[0]?.id ?? "",
          price: "",
          hasZero: false,
          zeroPrice: "",
          recipe: EMPTY,
          extraAllergens: [],
          featured: false,
          available: true,
        });
    });
  }, [venueId, itemId, search]);

  const cocktail = d?.kind === "cocktail";
  const facts = useMemo(() => {
    if (!d) return null;
    if (d.kind === "cocktail") return d.recipe.parts.length ? factsOf(d.recipe, d.extraAllergens) : null;
    return itemFacts({ kind: d.kind, details: detailsTo(d.details, d.kind), extraAllergens: d.extraAllergens });
  }, [d]);
  const zeroFacts = useMemo(() => (d && cocktail && d.hasZero && facts && !facts.zero ? factsOf(zeroRecipe(d.recipe), d.extraAllergens) : null), [d, facts, cocktail]);
  const computed = useMemo(() => (d && cocktail && d.recipe.parts.length ? factsOf(d.recipe).allergens : []), [d, cocktail]);

  if (ws === undefined || (ws && !d)) return <div className="pn-loading" aria-busy="true" />;
  if (ws === null || !d) return <div className="pn-empty"><h1>Bu bara erişiminiz yok</h1></div>;
  if (!isNew && !ws.items.some((i) => i.id === itemId)) return <div className="pn-empty"><h1>İçki bulunamadı</h1></div>;

  const world = ws.venue.world;
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => (x ? { ...x, [k]: v } : x));
  const setDet = (p: Partial<DetailsDraft>) => setD((x) => (x ? { ...x, details: { ...x.details, ...p } } : x));
  const setKind = (k: ItemKind) =>
    setD((x) =>
      x
        ? {
            ...x,
            kind: k,
            hasZero: k === "cocktail" ? x.hasZero : false,
            details: { ...x.details, style: k === "cocktail" ? "" : Object.keys(STYLES[k as Exclude<ItemKind, "cocktail">])[0], plate: k === "food" ? x.details.plate : "", color: undefined },
            extraAllergens: x.extraAllergens.length || !KIND_ALLERGENS[k] ? x.extraAllergens : KIND_ALLERGENS[k]!,
          }
        : x,
    );
  const setRecipe = (r: Partial<Recipe>) => set("recipe", { ...d.recipe, ...r });
  const setPart = (i: number, p: Partial<Part>) => setRecipe({ parts: d.recipe.parts.map((x, j) => (j === i ? { ...x, ...p } : x)) });
  const slug = (() => {
    const base = slugify(d.name.tr || d.name.en) || "icki";
    const taken = new Set(ws.items.filter((i) => i.id !== itemId).map((i) => i.slug));
    let s = base;
    for (let n = 2; taken.has(s); n++) s = `${base}-${n}`;
    return s;
  })();

  const fromClassic = (id: string) => {
    const c = COCKTAILS.find((x) => x.id === id);
    if (!c) return;
    if (d.recipe.parts.length && !confirm(`Reçete "${c.name.tr}" ile değiştirilsin mi?`)) return;
    setD({
      ...d,
      name: d.name.tr ? d.name : c.name,
      description: describe(c.parts),
      story: c.story,
      recipe: { parts: c.parts.map((p) => ({ ...p })), method: c.method, glass: c.glass, ice: c.ice, garnish: c.garnish },
      libraryId: c.id,
    });
  };

  // a line from the kitchen & cellar library: name, notes, serving, allergens and a price for this world
  const fromLibrary = (id: string) => {
    const x = libraryById(id);
    if (!x) return;
    if (d.name.tr.trim() && d.name.tr !== x.name.tr && !confirm(`Bilgiler "${x.name.tr}" ile doldurulsun mu?`)) return;
    const f = libItemFields(x, world);
    setD({
      ...d,
      kind: x.kind,
      name: f.name,
      description: f.description,
      details: detailsFrom(f.details),
      extraAllergens: f.extraAllergens ?? [],
      price: d.price.trim() ? d.price : kurusToTl(f.price),
      photo: d.photo && !d.photo.illustrative ? d.photo : f.photo,
      hasZero: false,
      libraryId: undefined,
    });
  };
  const libGroups = [...LIBRARY_GROUPS].sort((a, b) => Number(b.items[0]?.kind === d.kind) - Number(a.items[0]?.kind === d.kind));

  const priceK = tlToKurus(d.price);
  const zeroK = d.hasZero ? tlToKurus(d.zeroPrice) : undefined;
  const problems = [
    !d.name.tr.trim() && "İçkinin adını yazın.",
    !d.sectionId && "Bir bölüm seçin.",
    !(priceK > 0) && "Geçerli bir fiyat girin.",
    d.hasZero && !(zeroK! > 0) && "Alkolsüz fiyatı girin.",
    cocktail && d.recipe.parts.length === 0 && "Reçeteye en az bir malzeme ekleyin.",
    cocktail && d.recipe.parts.some((p) => !p.id) && "Her satırda bir malzeme seçin.",
    !cocktail && d.details.altPrice.trim() !== "" && !(tlToKurus(d.details.altPrice) > 0) && "İkinci boyun fiyatını kontrol edin.",
  ].filter(Boolean) as string[];

  const save = async () => {
    if (problems.length) return setErr(problems[0]);
    setBusy("save");
    setErr("");
    try {
      const sectionItems = ws.items.filter((i) => i.sectionId === d.sectionId && i.id !== itemId);
      const existing = ws.items.find((i) => i.id === itemId);
      await saveItem({
        ...(isNew ? {} : { id: itemId }),
        venueId,
        sectionId: d.sectionId,
        slug,
        name: { tr: d.name.tr.trim(), en: (d.name.en || d.name.tr).trim() },
        description: { tr: d.description.tr.trim(), en: (d.description.en || d.description.tr).trim() },
        story: d.story.tr.trim() || d.story.en.trim() ? { tr: d.story.tr.trim(), en: (d.story.en || d.story.tr).trim() } : undefined,
        price: priceK,
        zeroPrice: cocktail ? zeroK : undefined,
        kind: d.kind,
        recipe: cocktail ? { ...d.recipe, parts: d.recipe.parts.filter((p) => p.id && p.ml > 0) } : undefined,
        details: cocktail ? undefined : detailsTo(d.details, d.kind),
        extraAllergens: d.extraAllergens.filter((a) => !computed.includes(a as never)),
        featured: d.featured,
        available: d.available,
        photo: d.photo,
        libraryId: cocktail ? d.libraryId : undefined,
        position: existing && existing.sectionId === d.sectionId ? existing.position : sectionItems.length,
      });
      router.push(`/panel/${venueId}`);
    } catch (e) {
      const m = (e as Error).message;
      setErr(m.includes("duplicate") ? "Bu adla bir içki zaten var." : m);
      setBusy("");
    }
  };

  const upload = async (file?: File) => {
    if (!file) return;
    setBusy("photo");
    setErr("");
    try {
      set("photo", await uploadDrinkPhoto(db(), venueId, slug, file));
    } catch (e) {
      setErr(`Fotoğraf yüklenemedi: ${(e as Error).message}`);
    } finally {
      setBusy("");
    }
  };

  const remove = async () => {
    if (!confirm(`"${d.name.tr}" menüden tamamen silinsin mi? Geçici olarak kaldırmak için "Bitti" işaretleyebilirsiniz.`)) return;
    setBusy("del");
    try {
      await deleteItem(itemId);
      router.push(`/panel/${venueId}`);
    } catch (e) {
      setErr((e as Error).message);
      setBusy("");
    }
  };

  const groups = [
    { label: "Klasikler", list: COCKTAILS.filter((c) => c.world === "all") },
    ...WORLDS.map((w) => ({ label: `${w.name.tr} imzaları`, list: COCKTAILS.filter((c) => c.world === w.id) })),
  ];

  return (
    <div className="pn-page pn-editor">
      <header className="pn-head">
        <Link href={`/panel/${venueId}`} className="pn-back">
          ← {ws.venue.name}
        </Link>
        <h1>{isNew ? (cocktail ? "Yeni kokteyl" : `Yeni · ${KIND_LABEL[d.kind].tr}`) : d.name.tr}</h1>
      </header>

      <div className="pn-editor-grid">
        <div className="pn-editor-form">
          <section className="pn-card">
            <p className="pn-eyebrow">Ne ekliyorsunuz?</p>
            <div className="pn-kinds" role="radiogroup">
              {KINDS.map((k) => (
                <button key={k} type="button" role="radio" aria-checked={d.kind === k} className={`pn-kind${d.kind === k ? " on" : ""}`} onClick={() => setKind(k)}>
                  <span className="pn-kind-art" aria-hidden>
                    <ItemThumb
                      item={{ kind: k, details: { style: k === "cocktail" ? undefined : Object.keys(STYLES[k as Exclude<ItemKind, "cocktail">])[0] }, recipe: k === "cocktail" ? { parts: [{ id: "gin", ml: 50 }, { id: "dry-vermouth", ml: 10 }], method: "stir", glass: "martini", ice: "none", garnish: "olive" } : undefined, slug: `k-${k}`, name: { tr: k, en: k }, extraAllergens: [] }}
                      world={world}
                      size={34}
                    />
                  </span>
                  {KIND_LABEL[k].tr}
                </button>
              ))}
            </div>
          </section>

          {cocktail && (
          <section className="pn-card">
            <label className="pn-field">
              <span>Klasikten başla</span>
              <select className="input" value="" onChange={(e) => fromClassic(e.target.value)}>
                <option value="">Garnish kütüphanesinden bir kokteyl seçin…</option>
                {groups.map((g) => (
                  <optgroup key={g.label} label={g.label}>
                    {g.list.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name.tr}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <small>Reçete, hikâye ve açıklama gelir; sonra dilediğiniz gibi değiştirirsiniz.</small>
            </label>
          </section>
          )}

          {!cocktail && (
            <section className="pn-card">
              <label className="pn-field">
                <span>Kütüphaneden seç</span>
                <select className="input" value="" onChange={(e) => fromLibrary(e.target.value)}>
                  <option value="">Mutfak & mahzen kütüphanesinden bir kalem seçin…</option>
                  {libGroups.map((g) => (
                    <optgroup key={g.label} label={g.label}>
                      {g.items.map((x) => (
                        <option key={x.id} value={x.id}>
                          {x.name.tr}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <small>Ad, açıklama, servis, alerjenler ve önerilen fiyat gelir; sonra hepsini değiştirebilirsiniz.</small>
              </label>
            </section>
          )}

          <section className="pn-card">
            <p className="pn-eyebrow">Menüde</p>
            <div className="pn-grid2">
              <label className="pn-field">
                <span>Adı</span>
                <input className="input" value={d.name.tr} onChange={(e) => set("name", { ...d.name, tr: e.target.value })} placeholder="Türkçe" />
              </label>
              <label className="pn-field">
                <span>Adı (İngilizce)</span>
                <input className="input" value={d.name.en} onChange={(e) => set("name", { ...d.name, en: e.target.value })} placeholder="Aynıysa boş bırakın" />
              </label>
            </div>
            <div className="pn-field">
              <span>
                Kısa açıklama{" "}
                {cocktail && (
                  <button type="button" className="pn-link" onClick={() => set("description", describe(d.recipe.parts))} disabled={!d.recipe.parts.length}>
                    Reçeteden yaz
                  </button>
                )}
              </span>
              <div className="pn-pair">
                <input className="input" value={d.description.tr} onChange={(e) => set("description", { ...d.description, tr: e.target.value })} placeholder={d.kind === "food" ? "İçindekiler: ör. Süzme yoğurt, sarımsak, dereotu" : d.kind === "wine" ? "Ör. Öküzgözü · Boğazkere" : "Ör. Cin · Campari · Tatlı Vermut"} aria-label="Kısa açıklama (TR)" />
                <input className="input" value={d.description.en} onChange={(e) => set("description", { ...d.description, en: e.target.value })} placeholder="English" aria-label="Kısa açıklama (EN)" />
              </div>
            </div>
            <div className="pn-field">
              <span>Hikâyesi (içki sayfasında)</span>
              <div className="pn-pair">
                <textarea className="input" rows={3} value={d.story.tr} onChange={(e) => set("story", { ...d.story, tr: e.target.value })} placeholder="Bir iki cümle, barın sesiyle" aria-label="Hikâye (TR)" />
                <textarea className="input" rows={3} value={d.story.en} onChange={(e) => set("story", { ...d.story, en: e.target.value })} placeholder="English" aria-label="Hikâye (EN)" />
              </div>
            </div>
            <div className="pn-grid3">
              <label className="pn-field">
                <span>Bölüm</span>
                <select className="input" value={d.sectionId} onChange={(e) => set("sectionId", e.target.value)}>
                  {ws.sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title.tr}
                    </option>
                  ))}
                </select>
              </label>
              <label className="pn-field">
                <span>Fiyat (₺)</span>
                <input className="input" inputMode="decimal" value={d.price} onChange={(e) => set("price", e.target.value)} placeholder="Ör. 720" />
              </label>
              {cocktail ? (
                <label className="pn-field">
                  <span>
                    <input type="checkbox" checked={d.hasZero} onChange={(e) => set("hasZero", e.target.checked)} disabled={facts?.zero} /> Alkolsüzü de var (₺)
                  </span>
                  <input className="input" inputMode="decimal" value={d.zeroPrice} disabled={!d.hasZero} onChange={(e) => set("zeroPrice", e.target.value)} placeholder="Ör. 480" />
                </label>
              ) : (
                <label className="pn-field">
                  <span>İkinci boy (₺)</span>
                  <input className="input" inputMode="decimal" value={d.details.altPrice} onChange={(e) => setDet({ altPrice: e.target.value })} placeholder={d.kind === "wine" ? "Şişe: ör. 1900" : "Ör. duble 900"} />
                </label>
              )}
            </div>
            <div className="pn-row">
              <label className="pn-check">
                <input type="checkbox" checked={d.featured} onChange={(e) => set("featured", e.target.checked)} /> ✦ Barmenin seçimi
              </label>
              <label className="pn-check">
                <input type="checkbox" checked={d.available} onChange={(e) => set("available", e.target.checked)} /> Satışta
              </label>
            </div>
          </section>

          {!cocktail && (
            <section className="pn-card">
              <p className="pn-eyebrow">Ayrıntılar</p>
              <div className="pn-grid2">
                <label className="pn-field">
                  <span>Tür</span>
                  <select className="input" value={d.details.style} onChange={(e) => setDet({ style: e.target.value, color: undefined })}>
                    {Object.entries(STYLES[d.kind as Exclude<ItemKind, "cocktail">]).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label.tr}
                      </option>
                    ))}
                  </select>
                </label>
                {d.kind === "other" && d.details.style === "atelier" && (
                  <p className="pn-hint" style={{ gridColumn: "1 / -1" }}>
                    Bu satır misafiri <b>Atelier</b>'e götürür: barınızın kokteyl tariflerindeki şişelerle (artı limon, misket limonu, şeker şurubu, soda ve Angostura) kendi kokteylini tasarlar,
                    alkolsüz versiyon sunuyorsanız alkolsüz karşılıklarıyla. Barmene gösterdiği kartta tarif, masa numarası ve bu satırın fiyatı yazar. Fiyat basılı menüde de görünür; kapatmak için satırı “bitti” yapın.
                  </p>
                )}
                {d.kind === "food" && (
                  <label className="pn-field">
                    <span>Tabakta</span>
                    <select className="input" value={d.details.plate} onChange={(e) => setDet({ plate: e.target.value })}>
                      <option value="">Türe göre</option>
                      {Object.entries(DISH_LABEL).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {d.kind !== "food" && (
                  <label className="pn-field">
                    <span>Alkol (%)</span>
                    <input className="input" inputMode="decimal" value={d.details.abv} onChange={(e) => setDet({ abv: e.target.value })} placeholder={`Ör. ${String(STYLES[d.kind as Exclude<ItemKind, "cocktail">][d.details.style]?.abv ?? "").replace(".", ",")}`} />
                  </label>
                )}
              </div>
              <div className="pn-field">
                <span>{d.kind === "food" ? "Köken / not" : d.kind === "wine" ? "Üretici, bölge, yıl" : "Üretici, köken"}</span>
                <div className="pn-pair">
                  <input className="input" value={d.details.origin.tr} onChange={(e) => setDet({ origin: { ...d.details.origin, tr: e.target.value } })} placeholder={d.kind === "wine" ? "Ör. Kavaklıdere · Elazığ · 2021" : "Türkçe"} aria-label="Köken (TR)" />
                  <input className="input" value={d.details.origin.en} onChange={(e) => setDet({ origin: { ...d.details.origin, en: e.target.value } })} placeholder="English" aria-label="Köken (EN)" />
                </div>
              </div>
              <div className="pn-field">
                <span>Servis (fiyatın karşılığı)</span>
                <div className="pn-pair">
                  <input className="input" value={d.details.serving.tr} onChange={(e) => setDet({ serving: { ...d.details.serving, tr: e.target.value } })} placeholder={d.kind === "wine" ? "Ör. Kadeh · 150 ml" : d.kind === "food" ? "Ör. Porsiyon · 2 kişilik" : "Ör. 4 cl"} aria-label="Servis (TR)" />
                  <input className="input" value={d.details.serving.en} onChange={(e) => setDet({ serving: { ...d.details.serving, en: e.target.value } })} placeholder="English" aria-label="Servis (EN)" />
                </div>
              </div>
              <div className="pn-grid3">
                <label className="pn-field">
                  <span>{d.kind === "food" ? "Gramaj (g)" : "Hacim (ml)"}</span>
                  <input className="input" inputMode="numeric" value={d.details.volume} onChange={(e) => setDet({ volume: e.target.value })} placeholder={d.kind === "food" ? "Ör. 200" : `Ör. ${STYLES[d.kind as Exclude<ItemKind, "cocktail">][d.details.style]?.volume ?? ""}`} />
                </label>
                <label className="pn-field">
                  <span>Kalori (kcal)</span>
                  <input className="input" inputMode="numeric" value={d.details.kcal} onChange={(e) => setDet({ kcal: e.target.value })} placeholder={d.kind === "food" ? "Biliyorsanız" : "Boşsa tahmin edilir"} />
                </label>
                <div className="pn-field">
                  <span>İkinci boyun adı</span>
                  <div className="pn-pair pn-pair-tight">
                    <input className="input" value={d.details.altLabel.tr} onChange={(e) => setDet({ altLabel: { ...d.details.altLabel, tr: e.target.value } })} placeholder={d.kind === "wine" ? "Şişe" : "Duble"} aria-label="İkinci boy (TR)" />
                    <input className="input" value={d.details.altLabel.en} onChange={(e) => setDet({ altLabel: { ...d.details.altLabel, en: e.target.value } })} placeholder={d.kind === "wine" ? "Bottle" : "Double"} aria-label="İkinci boy (EN)" />
                  </div>
                </div>
              </div>
            </section>
          )}

          {cocktail && (
          <section className="pn-card">
            <p className="pn-eyebrow">Reçete</p>
            <p className="pn-hint">Ölçüler ml cinsinden; bitter için 1 dash ≈ 1 ml. Alkol oranı, kalori ve alerjenler buradan hesaplanır.</p>
            <ol className="pn-parts">
              {d.recipe.parts.map((p, i) => (
                <li key={i} className="pn-part">
                  <select className="input" value={p.id} onChange={(e) => setPart(i, { id: e.target.value })} aria-label="Malzeme">
                    <option value="">Malzeme seçin…</option>
                    {BY_CAT.map(({ c, list }) => (
                      <optgroup key={c} label={CATEGORY_LABEL[c].tr}>
                        {list.map((ing) => (
                          <option key={ing.id} value={ing.id}>
                            {ing.name.tr}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <input className="input pn-ml" type="number" inputMode="decimal" min={0} step={0.5} value={p.ml} onChange={(e) => setPart(i, { ml: Number(e.target.value) })} aria-label="ml" />
                  <span className="pn-unit">ml</span>
                  <label className="pn-check pn-top" title="Bardağı bununla tamamla">
                    <input type="checkbox" checked={Boolean(p.top)} onChange={(e) => setPart(i, { top: e.target.checked || undefined })} /> üstüne
                  </label>
                  <button type="button" className="pn-icon" aria-label="Satırı sil" onClick={() => setRecipe({ parts: d.recipe.parts.filter((_, j) => j !== i) })}>
                    ×
                  </button>
                </li>
              ))}
            </ol>
            <button type="button" className="pn-add" onClick={() => setRecipe({ parts: [...d.recipe.parts, { id: "", ml: 30 }] })}>
              + Malzeme ekle
            </button>
            <div className="pn-grid2">
              <label className="pn-field">
                <span>Hazırlanış</span>
                <select className="input" value={d.recipe.method} onChange={(e) => setRecipe({ method: e.target.value as Method })}>
                  {Object.entries(METHOD_LABEL).map(([k, l]) => (
                    <option key={k} value={k}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
              <label className="pn-field">
                <span>Bardak</span>
                <select className="input" value={d.recipe.glass} onChange={(e) => setRecipe({ glass: e.target.value as Glass })}>
                  {Object.entries(GLASS_LABEL).map(([k, l]) => (
                    <option key={k} value={k}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
              <label className="pn-field">
                <span>Buz</span>
                <select className="input" value={d.recipe.ice} onChange={(e) => setRecipe({ ice: e.target.value as Ice })}>
                  {Object.entries(ICE_LABEL).map(([k, l]) => (
                    <option key={k} value={k}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
              <label className="pn-field">
                <span>Süsleme</span>
                <select className="input" value={d.recipe.garnish} onChange={(e) => setRecipe({ garnish: e.target.value })}>
                  {Object.entries(GARNISHES).map(([k, l]) => (
                    <option key={k} value={k}>
                      {l.tr}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>
          )}

          <section className="pn-card">
            <p className="pn-eyebrow">Alerjenler</p>
            <p className="pn-hint">
              {cocktail
                ? "Reçeteden bulunanlar işaretli gelir. Ev yapımı şurup, süsleme gibi ek alerjenleri siz işaretleyin. Son kontrol barın sorumluluğundadır."
                : "Bu üründeki alerjenleri işaretleyin. Şarapta sülfit, birada gluten olağandır. Son kontrol barın sorumluluğundadır."}
            </p>
            <div className="pn-allergens">
              {ALLERGENS.map((a) => {
                const auto = computed.includes(a.id);
                const on = auto || d.extraAllergens.includes(a.id);
                return (
                  <label key={a.id} className={`pn-al${on ? " on" : ""}${auto ? " auto" : ""}`}>
                    <input
                      type="checkbox"
                      checked={on}
                      disabled={auto}
                      onChange={(e) => set("extraAllergens", e.target.checked ? [...d.extraAllergens, a.id] : d.extraAllergens.filter((x) => x !== a.id))}
                    />
                    <AllergenIcon id={a.id} size={22} />
                    <span>{a.name.tr}</span>
                    {auto && <small>reçeteden</small>}
                  </label>
                );
              })}
            </div>
          </section>

          <section className="pn-card">
            <p className="pn-eyebrow">Fotoğraf</p>
            <p className="pn-hint">Kendi çektiğiniz bir fotoğraf; dikey ve sade bir arka plan en iyisi. Yoksa menüde içki, kendi renginde çizilmiş bardağıyla görünür.</p>
            {d.photo?.illustrative && (
              <p className="pn-hint">
                Şu an kütüphanenin temsili fotoğrafı ({d.photo.credit?.author} · Unsplash). Misafir menüsünde &quot;Temsili görsel&quot; yazar; kendi fotoğrafınızı yükleyebilir ya da kaldırabilirsiniz.
              </p>
            )}
            <div className="pn-row">
              <label className="btn ghost pn-file">
                {busy === "photo" ? "Yükleniyor…" : d.photo ? "Fotoğrafı değiştir" : "Fotoğraf yükle"}
                <input type="file" accept="image/*" onChange={(e) => upload(e.target.files?.[0])} disabled={!!busy} />
              </label>
              {d.photo && (
                <button type="button" className="pn-link pn-danger" onClick={() => set("photo", undefined)}>
                  Fotoğrafı kaldır
                </button>
              )}
            </div>
          </section>

          {err && <p className="pn-msg err">{err}</p>}
          <div className="pn-actions">
            <button className="btn" onClick={save} disabled={!!busy}>
              {busy === "save" ? "Kaydediliyor…" : "Kaydet"}
            </button>
            <Link className="btn ghost" href={`/panel/${venueId}`}>
              Vazgeç
            </Link>
            {!isNew && (
              <button className="pn-link pn-danger" onClick={remove} disabled={!!busy}>
                İçkiyi sil
              </button>
            )}
          </div>
        </div>

        <aside className="pn-preview-card">
          <p className="pn-eyebrow">Menüde böyle görünecek</p>
          <div className={`pn-pv wmenu wmenu-${world}`} data-world={world} data-palette={ws.venue.palette ?? "noir"}>
            <div className="wm-card pn-pv-card">
              <div className="pn-pv-visual">
                <ItemThumb item={{ kind: d.kind, recipe: cocktail ? d.recipe : undefined, details: cocktail ? undefined : detailsTo(d.details, d.kind), extraAllergens: d.extraAllergens, photo: d.photo, slug: slug || "yeni", name: d.name }} world={world} size={d.photo ? 150 : 130} />
              </div>
              <div className="gm-row">
                <span className="gm-name" lang={d.name.tr ? nameLang({ tr: d.name.tr, en: d.name.en || d.name.tr }) : undefined}>
                  {d.featured && <span className="gm-star">✦ </span>}
                  {d.name.tr || "İçkinin adı"}
                </span>
                <span className="gm-leader" aria-hidden />
                <span className="gm-price">{priceK > 0 ? tl(priceK) : "—"}</span>
              </div>
              <span className="gm-desc">{d.description.tr || "Kısa açıklama"}</span>
              {facts && (
                <>
                  <span className="gm-meta">
                    {d.kind === "food" ? null : facts.zero ? <span className="gm-badge">0%</span> : <span>{percent(facts.abv, "tr", 1)}</span>}
                    {facts.kcal > 0 && <span>{facts.kcal < 5 ? "< 5" : `≈ ${facts.kcal}`} kcal</span>}
                    {d.details.serving.tr && !cocktail ? <span>{d.details.serving.tr}</span> : facts.volume > 0 && <span>{facts.volume} {d.kind === "food" ? "g" : "ml"}</span>}
                    <span className="gm-allergens">
                      {facts.allergens.map((a) => (
                        <AllergenIcon key={a} id={a} size={16} title={a} />
                      ))}
                    </span>
                  </span>
                  {zeroFacts && (
                    <p className="pn-pv-zero">
                      Alkolsüz versiyon: {zeroFacts.volume} ml · {zeroFacts.kcal < 5 ? "< 5" : `≈ ${zeroFacts.kcal}`} kcal{zeroK && zeroK > 0 ? ` · ${tl(zeroK)}` : ""}
                    </p>
                  )}
                </>
              )}
              {!cocktail && d.details.altPrice && tlToKurus(d.details.altPrice) > 0 && (
                <p className="pn-pv-zero">
                  {d.details.altLabel.tr || "İkinci boy"} · {tl(tlToKurus(d.details.altPrice))}
                </p>
              )}
              {!facts && <p className="pn-hint">Reçeteyi girdikçe alkol, kalori ve alerjenler burada belirir.</p>}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
