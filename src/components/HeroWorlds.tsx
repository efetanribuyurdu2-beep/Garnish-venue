"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { WorldId } from "@/lib/types";
import { WorldBackdrop } from "./WorldBackdrop";

export interface HeroWorld {
  id: WorldId;
  bar: string;
  barLang: "tr" | "en";
  slug: string;
  kicker: string;
  kickerLang: "tr" | "en";
  greeting: string;
  name: string;
  tagline: string;
}

const STEP = 6000;

/**
 * The first thing anyone sees: the nine worlds one after another, the whole
 * scene re-dressed in each (backdrop, colours, type), the world's bar named in
 * its own face, and two clear ways on: guests to the menus, bars to the panel.
 */
export function HeroWorlds({ worlds }: { worlds: HeroWorld[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    timer.current = setInterval(() => setI((n) => (n + 1) % worlds.length), STEP);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused, worlds.length]);
  const w = worlds[i];
  return (
    <section className={`hx wc-${w.id}`} data-world={w.id} data-palette="noir" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} aria-label="Garnish Venue">
      <div className="hx-stage" key={w.id}>
        <WorldBackdrop world={w.id} />
      </div>
      <div className="hx-veil" aria-hidden />
      <div className="hx-content">
        <p className="hx-kicker">GARNISH · VENUE</p>
        <h1 className="hx-title">
          Barınızın menüsü,
          <br />
          kendi dünyasında.
        </h1>
        <div className="hx-now" key={`now-${w.id}`} aria-live="polite">
          <span className="lp-world-emblem" aria-hidden />
          <p className="hx-now-kicker" lang={w.kickerLang}>
            {w.kicker}
          </p>
          <p className="hx-now-bar" lang={w.barLang}>
            {w.bar}
          </p>
          <p className="hx-now-greet">“{w.greeting}”</p>
        </div>
        <div className="hx-cta">
          <Link className="btn" href={`/v/${w.slug}`}>
            Menüye gir
          </Link>
          <Link className="btn ghost" href="/dunyalar">
            Dokuz dünyayı keşfet
          </Link>
        </div>
        <p className="hx-owner">
          Bar sahibi misiniz? <Link href="/panel">Barınızı ekleyin →</Link>
        </p>
      </div>
      <nav className="hx-dots" aria-label="Dünyalar">
        {worlds.map((x, k) => (
          <button
            key={x.id}
            className={`hx-dot wc-${x.id}${k === i ? " on" : ""}`}
            aria-label={`${x.name}: ${x.bar}`}
            aria-pressed={k === i}
            onClick={() => {
              setI(k);
              setPaused(true);
            }}
          >
            <span className="lp-world-emblem" aria-hidden />
            {k === i && !paused && <i className="hx-progress" style={{ animationDuration: `${STEP}ms` }} />}
          </button>
        ))}
      </nav>
    </section>
  );
}
