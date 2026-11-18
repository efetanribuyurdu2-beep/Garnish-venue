import Link from "next/link";
import type { Venue } from "@/domain/types";
import type { Lang, WorldId } from "@/lib/types";
import { t } from "@/lib/i18n";
import { LogoMark } from "./Logo";
import { WorldBackdrop } from "./WorldBackdrop";

const LANG_NAME: Record<Lang, string> = { tr: "TR", en: "EN" };

/** The venue's world around every guest page: tokens, wall, language switch and the house notes. */
export function VenueFrame({
  venue,
  world,
  lang,
  path,
  keep,
  children,
}: {
  venue: Venue;
  world: WorldId;
  lang: Lang;
  path: string; // current path, for the language links
  keep: Record<string, string>; // query params to keep (world preview)
  children: React.ReactNode;
}) {
  const q = (l: Lang) => "?" + new URLSearchParams({ ...keep, lang: l }).toString();
  return (
    <div className="venue" data-world={world} data-palette={venue.palette ?? "noir"} lang={lang}>
      <WorldBackdrop world={world} />
      <header className="venue-bar">
        <span className="venue-city">{venue.city}</span>
        {venue.languages.length > 1 && (
          <nav className="venue-langs" aria-label="Language">
            {venue.languages.map((l) => (
              <Link key={l} href={path + q(l)} className={l === lang ? "on" : ""} aria-current={l === lang ? "true" : undefined} replace>
                {LANG_NAME[l]}
              </Link>
            ))}
          </nav>
        )}
      </header>
      <main className="venue-main">{children}</main>
      <footer className="venue-foot">
        {venue.serviceNote && <p>{venue.serviceNote[lang]}</p>}
        <p>{t("estimate", lang)}</p>
        <p>{t("printed", lang)}</p>
        <a className="venue-powered" href="/" aria-label="Garnish">
          <LogoMark size={22} /> {t("poweredBy", lang)}
        </a>
      </footer>
    </div>
  );
}
