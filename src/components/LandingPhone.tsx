"use client";

import { useState } from "react";

/**
 * A phone on the product page with a live menu inside (an iframe of
 * /v/demo?world=…), and the nine worlds under it: tapping one opens that
 * world's own bar and menu.
 */
export function LandingPhone({ worlds }: { worlds: { id: string; name: string }[] }) {
  const [world, setWorld] = useState("maison");
  return (
    <div className="lp-phone-wrap">
      <div className="lp-phone" aria-label="Demo menü">
        <span className="lp-phone-btn a" aria-hidden />
        <span className="lp-phone-btn b" aria-hidden />
        <span className="lp-phone-btn c" aria-hidden />
        <div className="lp-phone-screen">
          <iframe key={world} src={`/v/demo?world=${world}`} title="Garnish demo menü" loading="lazy" />
          <span className="lp-phone-island" aria-hidden />
        </div>
        <span className="lp-phone-glare" aria-hidden />
      </div>
      <div className="lp-switch" role="group" aria-label="Dünya seç">
        {worlds.map((w) => (
          <button
            key={w.id}
            className={`lp-switch-btn wc-${w.id}${w.id === world ? " on" : ""}`}
            aria-pressed={w.id === world}
            onClick={() => setWorld(w.id)}
            title={w.name}
          >
            <span className="lp-world-emblem" aria-hidden />
            <span className="lp-switch-name" lang={w.name === "Anatolia" || w.name === "Boreal" ? "en" : undefined}>{w.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
