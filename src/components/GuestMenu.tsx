"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { SectionView } from "@/lib/view";

export interface GuestMenuText {
  zeroOnly: string;
  avoid: string;
  bigText: string;
  none: string;
  zeroAlso: string;
  zero: string;
  allergens: string;
}

const BIG_KEY = "garnish-venue:big";

/**
 * The interactive part of the guest menu: filters (alcohol-free only, leave
 * out an allergen) and a large-text mode for guests who find phone menus
 * hard to read. Everything else is rendered on the server.
 */
export function GuestMenu({ sections, text, base, query }: { sections: SectionView[]; text: GuestMenuText; base: string; query: string }) {
  const [zeroOnly, setZeroOnly] = useState(false);
  const [avoid, setAvoid] = useState<string[]>([]);
  const [big, setBig] = useState(false);

  useEffect(() => {
    try {
      setBig(localStorage.getItem(BIG_KEY) === "1");
    } catch {}
  }, []);
  const toggleBig = () => {
    setBig((b) => {
      try {
        localStorage.setItem(BIG_KEY, b ? "0" : "1");
      } catch {}
      return !b;
    });
  };

  // only the allergens that actually occur on this menu are offered as filters
  const present = useMemo(() => {
    const m = new Map<string, { id: string; name: string; mark: string }>();
    sections.forEach((s) => s.items.forEach((i) => i.allergens.forEach((a) => m.set(a.id, a))));
    return [...m.values()];
  }, [sections]);

  const shown = sections
    .map((s) => ({
      ...s,
      items: s.items.filter(
        (i) => (!zeroOnly || i.zero || i.zeroPrice) && !i.allergens.some((a) => avoid.includes(a.id)),
      ),
    }))
    .filter((s) => s.items.length);

  return (
    <div className={`gm${big ? " gm-big" : ""}`}>
      <div className="gm-tools" role="group">
        <button className={`chip${zeroOnly ? " on" : ""}`} aria-pressed={zeroOnly} onClick={() => setZeroOnly(!zeroOnly)}>
          0% · {text.zeroOnly}
        </button>
        <button className={`chip${big ? " on" : ""}`} aria-pressed={big} onClick={toggleBig}>
          <span aria-hidden>A</span>
          <span className="gm-bigA" aria-hidden>A</span> {text.bigText}
        </button>
        {present.length > 0 && (
          <div className="gm-avoid">
            <span className="gm-avoid-label">{text.avoid}:</span>
            {present.map((a) => {
              const on = avoid.includes(a.id);
              return (
                <button
                  key={a.id}
                  className={`chip${on ? " on" : ""}`}
                  aria-pressed={on}
                  onClick={() => setAvoid(on ? avoid.filter((x) => x !== a.id) : [...avoid, a.id])}
                >
                  {a.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {shown.length === 0 && <p className="gm-none">{text.none}</p>}

      {shown.map((s) => (
        <section className="gm-section" key={s.id}>
          <h2 className="gm-section-title">{s.title}</h2>
          {s.note && <p className="gm-section-note">{s.note}</p>}
          <ol className="gm-list">
            {s.items.map((i) => (
              <li key={i.id} className={`gm-item${i.featured ? " featured" : ""}`}>
                <Link href={`${base}/${encodeURIComponent(i.slug)}${query}`} className="gm-link" prefetch={false}>
                  <span className="gm-row">
                    <span className="gm-name" lang={i.nameLang}>
                      {i.featured && <span className="gm-star" aria-hidden>✦ </span>}
                      {i.name}
                    </span>
                    <span className="gm-leader" aria-hidden />
                    <span className="gm-price">{zeroOnly && !i.zero && i.zeroPrice ? i.zeroPrice : i.price}</span>
                  </span>
                  <span className="gm-desc">{i.description}</span>
                  <span className="gm-meta">
                    {i.zero ? <span className="gm-badge">0%</span> : <span>{i.abv}</span>}
                    <span>{i.kcal < 5 ? "< 5" : `≈ ${i.kcal}`} kcal</span>
                    {i.allergens.length > 0 && (
                      <span className="gm-allergens" aria-label={`${text.allergens}: ${i.allergens.map((a) => a.name).join(", ")}`}>
                        {i.allergens.map((a) => (
                          <abbr key={a.id} title={a.name} className="gm-al">
                            {a.mark}
                          </abbr>
                        ))}
                      </span>
                    )}
                    {!i.zero && i.zeroPrice && !zeroOnly && (
                      <span className="gm-zero-also">
                        {text.zeroAlso} · {i.zeroPrice}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
