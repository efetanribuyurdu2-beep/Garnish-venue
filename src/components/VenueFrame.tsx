import Link from "next/link";
import type { Venue } from "@/domain/types";
import type { Lang, WorldId } from "@/lib/types";
import { brandLang, t } from "@/lib/i18n";
import { Fonts } from "./Fonts";
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
  demo,
  illustrative,
}: {
  venue: Venue;
  world: WorldId;
  lang: Lang;
  path: string; // current path, for the language links
  keep: Record<string, string>; // query params to keep (world preview)
  children: React.ReactNode;
  /** some photos on this menu are look-alikes: say so in the footer */
  illustrative?: boolean;
  /** demo bars: the bars of the worlds before and after, to walk between them */
  demo?: { prev: { slug: string; name: string }; next: { slug: string; name: string } };
}) {
  const q = (l: Lang) => "?" + new URLSearchParams({ ...keep, lang: l }).toString();
  return (
    <div className="venue" data-world={world} data-palette={venue.palette ?? "noir"} lang={lang}>
      <Fonts worlds={[world]} />
      <WorldBackdrop world={world} />
      {demo && (
        <nav className="venue-demo" aria-label={lang === "tr" ? "Diğer dünyalar" : "Other worlds"}>
          <Link href={`/v/${demo.prev.slug}`} lang={brandLang(demo.prev.name)}>
            ‹ {demo.prev.name}
          </Link>
          <Link href="/dunyalar" className="venue-demo-all">
            {lang === "tr" ? "Dokuz dünya" : "Nine worlds"}
          </Link>
          <Link href={`/v/${demo.next.slug}`} lang={brandLang(demo.next.name)}>
            {demo.next.name} ›
          </Link>
        </nav>
      )}
      <header className="venue-bar">
        {demo ? (
          <Link href="/" className="venue-home" aria-label="Garnish Venue">
            <LogoMark size={22} />
          </Link>
        ) : (
          <span className="venue-city">{venue.city}</span>
        )}
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
        {illustrative && <p>{lang === "tr" ? "Fotoğraflar temsilidir." : "Photographs are illustrative."}</p>}
        <a className="venue-powered" href="/" aria-label="Garnish">
          <LogoMark size={22} /> {t("poweredBy", lang)}
        </a>
      </footer>
    </div>
  );
}
