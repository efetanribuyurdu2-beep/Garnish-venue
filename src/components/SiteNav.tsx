"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoMark } from "./Logo";

export interface NavWorld {
  id: string;
  bar: string;
  name: string;
  slug: string;
}

/**
 * The public site's header: Garnish mark, the way to the worlds, how it works,
 * and the bar login. Clear over the hero, solid once the page scrolls. On
 * phones a single button opens a panel with every page and all nine bars.
 */
export function SiteNav({ worlds }: { worlds: NavWorld[] }) {
  const path = usePathname();
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const links: [string, string][] = [
    ["/dunyalar", "Dünyalar"],
    ["/#nasil", "Nasıl çalışır"],
    ["/#barlar", "Barlar için"],
  ];
  return (
    <>
      <header className={`sn${solid || open ? " solid" : ""}`}>
        <Link href="/" className="sn-brand" aria-label="Garnish Venue">
          <LogoMark size={30} />
          <span>GARNISH · VENUE</span>
        </Link>
        <nav className="sn-links" aria-label="Site">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className={path === href ? "on" : ""}>
              {label}
            </Link>
          ))}
        </nav>
        <Link href="/panel" className="btn small sn-login">
          Bar girişi
        </Link>
        <button className="sn-burger" aria-expanded={open} aria-label={open ? "Menüyü kapat" : "Menü"} onClick={() => setOpen(!open)}>
          <span />
          <span />
          <span />
        </button>
      </header>
      {open && (
        <div className="sn-sheet" role="dialog" aria-label="Menü">
          <nav className="sn-sheet-links">
            {links.map(([href, label]) => (
              <Link key={href} href={href} onClick={() => setOpen(false)}>
                {label}
              </Link>
            ))}
            <Link href="/panel" className="btn" onClick={() => setOpen(false)}>
              Bar girişi
            </Link>
          </nav>
          <p className="sn-sheet-eyebrow">Dokuz bar</p>
          <ul className="sn-sheet-worlds">
            {worlds.map((w) => (
              <li key={w.id}>
                <Link href={`/v/${w.slug}`} className={`wc-${w.id}`} data-world={w.id} onClick={() => setOpen(false)}>
                  <span className="lp-world-emblem" aria-hidden />
                  <span className="sn-w-bar">{w.bar}</span>
                  <small>{w.name}</small>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
