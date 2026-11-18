"use client";

import Link from "next/link";

const T = {
  tr: { menu: "Menü", suggest: "Bana öner", atelier: "Kendi kokteylin", prefs: "Tercihler" },
  en: { menu: "Menu", suggest: "Suggest", atelier: "Your cocktail", prefs: "Preferences" },
};

const I = {
  menu: <path d="M5 6h14M5 12h14M5 18h9" />,
  suggest: <path d="M12 3l2.2 5.2L20 9l-4.4 3.8L17 19l-5-3-5 3 1.4-6.2L4 9l5.8-.8z" />,
  atelier: <path d="M7 4h10l-2 8a3 3 0 01-6 0zM12 15v5M9 20h6" />,
  prefs: <path d="M4 7h9M17 7h3M4 17h3M11 17h9M15 5v4M9 15v4" />,
};

/**
 * The guest's bar at the bottom of the menu, always in reach: back to the menu,
 * a suggestion, one's own cocktail (when the bar offers the Atelier), the
 * preferences, and the other language.
 */
export function GuestDock({ lang, langHref, langLabel, suggest, atelierHref }: { lang: "tr" | "en"; langHref?: string; langLabel?: string; suggest: boolean; atelierHref?: string }) {
  const t = T[lang];
  const icon = (k: keyof typeof I) => (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {I[k]}
      </g>
    </svg>
  );
  return (
    <nav className="gd" aria-label={t.menu}>
      <button onClick={() => document.querySelector(".gm")?.scrollIntoView({ behavior: "smooth", block: "start" })}>
        {icon("menu")}
        <span>{t.menu}</span>
      </button>
      {suggest && (
        <button onClick={() => window.dispatchEvent(new Event("gv:recommend"))}>
          {icon("suggest")}
          <span>{t.suggest}</span>
        </button>
      )}
      {atelierHref && (
        <Link href={atelierHref}>
          {icon("atelier")}
          <span>{t.atelier}</span>
        </Link>
      )}
      <button onClick={() => window.dispatchEvent(new Event("gv:prefs"))}>
        {icon("prefs")}
        <span>{t.prefs}</span>
      </button>
      {langHref && (
        <Link href={langHref} replace className="gd-lang">
          <b>{langLabel}</b>
        </Link>
      )}
    </nav>
  );
}
