"use client";

import { useRef, useState } from "react";
import { AllergenIcon } from "./AllergenIcon";

export interface VersionView {
  key: "original" | "zero";
  label: string;
  price: string;
  facts: { label: string; value: string }[];
  inside: string;
  allergens: { id: string; name: string }[];
}

/**
 * Original / alcohol-free on the item page: one label at a time, switched
 * like a wine list's "by the glass / by the bottle", instead of two long blocks.
 */
export function VersionSwitch({
  versions,
  initial = 0,
  text,
  alt,
}: {
  versions: VersionView[];
  initial?: number;
  text: { inside: string; allergens: string; noAllergens: string };
  alt?: { label: string; price: string };
}) {
  const [k, setK] = useState(initial);
  const card = useRef<HTMLDivElement>(null);
  const v = versions[k] ?? versions[0];
  // switching keeps the address in step (`?v=zero`, or none for the original), so a refresh or a shared link opens the same version
  const choose = (i: number) => {
    setK(i);
    // the parts of the page drawn for both versions (description, taste) follow the chosen one
    const page = card.current?.closest<HTMLElement>(".gi");
    if (page) page.dataset.version = versions[i].key;
    try {
      const url = new URL(window.location.href);
      if (versions[i].key === "zero") url.searchParams.set("v", "zero");
      else url.searchParams.delete("v");
      window.history.replaceState(window.history.state, "", url);
    } catch {}
  };
  return (
    <div className="gi-label-card" data-version={v.key} ref={card}>
      {versions.length > 1 && (
        <div className="gi-switch" role="tablist">
          {versions.map((x, i) => (
            <button key={x.key} role="tab" aria-selected={i === k} className={i === k ? "on" : ""} data-version={x.key} onClick={() => choose(i)}>
              {x.label}
            </button>
          ))}
        </div>
      )}
      <div className="gi-price-row">
        {versions.length === 1 && <span className="gi-version-name">{v.label}</span>}
        <span className="gi-price">{v.price}</span>
      </div>
      {alt && (
        <p className="gi-alt">
          <span>{alt.label}</span>
          <span className="gi-price">{alt.price}</span>
        </p>
      )}
      <dl className="gi-strip">
        {v.facts.map((f) => (
          <div key={f.label}>
            <dt>{f.label}</dt>
            <dd>{f.value}</dd>
          </div>
        ))}
      </dl>
      {v.inside && (
        <>
          <p className="gi-label">{text.inside}</p>
          <p className="gi-inside">{v.inside}</p>
        </>
      )}
      <p className="gi-label">{text.allergens}</p>
      {v.allergens.length ? (
        <ul className="gi-allergens">
          {v.allergens.map((a) => (
            <li key={a.id}>
              <AllergenIcon id={a.id} size={22} /> {a.name}
            </li>
          ))}
        </ul>
      ) : (
        <p className="gi-inside">{text.noAllergens}</p>
      )}
    </div>
  );
}
