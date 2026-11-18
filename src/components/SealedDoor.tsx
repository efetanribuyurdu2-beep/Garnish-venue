"use client";

import Link from "next/link";
import { useState } from "react";
import type { WorldId } from "@/lib/types";

/**
 * A world's door as a sealed object: closed it shows only the object and an
 * invitation ("Fincanı kaldırın"); a tap opens it (the object's own movement),
 * then the bar's name, a reading in the world's voice (one at random, like a
 * coffee reading) and the way in. `children` (the full door's drinks) appear
 * once it is open.
 */
export function SealedDoor({
  world,
  art,
  bar,
  barLang,
  worldName,
  teaser,
  object,
  fortunes,
  href,
  compact = false,
  children,
}: {
  world: WorldId;
  art: React.ReactNode;
  bar: string;
  barLang: "tr" | "en";
  worldName: string;
  teaser: string;
  object: string;
  fortunes: string[];
  href: string;
  compact?: boolean;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [n, setN] = useState(0);
  const toggle = () => {
    if (!open) setN(Math.floor(Math.random() * fortunes.length));
    setOpen(!open);
  };
  return (
    <article className={`sd wc-${world}${open ? " open" : ""}${compact ? " sd-compact" : ""}`} data-world={world} id={compact ? undefined : `dunya-${world}`}>
      <span className="sd-wall" aria-hidden />
      <span className="sd-band" aria-hidden />
      <button className="sd-face" onClick={toggle} aria-expanded={open} aria-label={open ? `${bar}: kapat` : `${object}. ${teaser}`}>
        <span className="sd-art">{art}</span>
        <span className="sd-world">{worldName}</span>
        <span className="sd-teaser" aria-hidden={open}>
          <span className="sd-dot" aria-hidden />
          {teaser}
        </span>
      </button>
      <div className="sd-reveal" aria-hidden={!open}>
        <p className="sd-bar" lang={barLang}>
          {bar}
        </p>
        <p className="sd-fortune" key={n}>
          {fortunes[n]}
        </p>
        <Link href={href} className="btn sd-enter" tabIndex={open ? 0 : -1}>
          Menüye gir
        </Link>
        {children && <div className="sd-more">{children}</div>}
      </div>
    </article>
  );
}
