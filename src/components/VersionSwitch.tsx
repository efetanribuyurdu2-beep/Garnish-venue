"use client";

import { useState } from "react";
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
  text,
}: {
  versions: VersionView[];
  text: { inside: string; allergens: string; noAllergens: string };
}) {
  const [k, setK] = useState(0);
  const v = versions[k];
  return (
    <div className="gi-label-card">
      {versions.length > 1 && (
        <div className="gi-switch" role="tablist">
          {versions.map((x, i) => (
            <button key={x.key} role="tab" aria-selected={i === k} className={i === k ? "on" : ""} onClick={() => setK(i)}>
              {x.label}
            </button>
          ))}
        </div>
      )}
      <div className="gi-price-row">
        {versions.length === 1 && <span className="gi-version-name">{v.label}</span>}
        <span className="gi-price">{v.price}</span>
      </div>
      <dl className="gi-strip">
        {v.facts.map((f) => (
          <div key={f.label}>
            <dt>{f.label}</dt>
            <dd>{f.value}</dd>
          </div>
        ))}
      </dl>
      <p className="gi-label">{text.inside}</p>
      <p className="gi-inside">{v.inside}</p>
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
