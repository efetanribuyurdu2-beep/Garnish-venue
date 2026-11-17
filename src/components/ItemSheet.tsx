"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * A drink opened from the menu slides up over it (an intercepted route), so
 * closing returns the guest to the same place in the menu. Opened directly
 * (shared link, refresh), the same drink is a full page instead.
 */
export function ItemSheet({ world, palette, closeLabel, children }: { world: string; palette: string; closeLabel: string; children: React.ReactNode }) {
  const router = useRouter();
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    panel.current?.focus();
    const key = (e: KeyboardEvent) => e.key === "Escape" && router.back();
    window.addEventListener("keydown", key);
    return () => {
      document.documentElement.style.overflow = prev;
      window.removeEventListener("keydown", key);
    };
  }, [router]);
  return (
    <div className="gi-sheet-root venue-sheet" data-world={world} data-palette={palette}>
      <div className="gi-scrim" onClick={() => router.back()} aria-hidden />
      <div className="gi-sheet" role="dialog" aria-modal="true" tabIndex={-1} ref={panel}>
        <span className="gi-grip" aria-hidden />
        <button className="gm-x gi-close" onClick={() => router.back()} aria-label={closeLabel}>
          ×
        </button>
        <div className={`wmenu wmenu-${world}`}>
          <article className="wm-card gi-card">{children}</article>
        </div>
      </div>
    </div>
  );
}
