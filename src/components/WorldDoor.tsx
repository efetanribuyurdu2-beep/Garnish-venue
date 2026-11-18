import Link from "next/link";
import { WORLDS, worldById } from "@/data/worlds";
import { brandLang, nameLang, pick } from "@/lib/i18n";
import type { WorldId } from "@/lib/types";
import { HEAD } from "@/lib/worldMenu";
import { demoForWorld } from "@/repo/demo";
import { DrinkPhoto } from "./DrinkPhoto";
import { ItemVisual } from "./ItemVisual";
import { money } from "@/lib/i18n";
import { SEAL } from "@/lib/seals";
import { Artifact } from "./Artifact";
import { SealedDoor } from "./SealedDoor";

/**
 * A world's door: its bar, dressed in the world's wall, band, emblem and type,
 * with three of its signatures and the way in. `compact` is the small door of
 * the home page's row; the full door lives on /dunyalar.
 */
export function WorldDoor({ world, compact = false }: { world: WorldId; compact?: boolean }) {
  const w = worldById(world);
  const m = demoForWorld(world);
  const sig = m.sections[0];
  const drinks = m.items.filter((i) => i.sectionId === sig.id).slice(0, 3);
  const count = m.items.length;
  const href = `/v/${m.venue.slug}`;
  if (compact)
    return (
      <Link href={href} className={`wd wd-compact wc-${world}`} data-world={world}>
        <span className="wd-wall" aria-hidden />
        <span className="wd-band" aria-hidden />
        <span className="lp-world-emblem" aria-hidden />
        <span className="wd-bar" lang={brandLang(m.venue.name)}>
          {m.venue.name}
        </span>
        <span className="wd-world">{w.name.tr}</span>
      </Link>
    );
  return (
    <article className={`wd wc-${world}`} data-world={world} id={`dunya-${world}`}>
      <span className="wd-wall" aria-hidden />
      <span className="wd-band" aria-hidden />
      <header className="wd-head">
        <span className="lp-world-emblem" aria-hidden />
        <p className="wd-kicker" lang={brandLang(pick(HEAD[world].kicker, "tr"))}>
          {pick(HEAD[world].kicker, "tr")}
        </p>
        <h2 className="wd-bar" lang={brandLang(m.venue.name)}>
          {m.venue.name}
        </h2>
        <p className="wd-tagline">
          <strong>{w.name.tr}</strong> · {w.tagline.tr}
        </p>
      </header>
      <p className="wd-greeting">“{w.greeting.tr}”</p>
      <p className="wd-collection">{w.collection.tr}</p>
      <ul className="wd-drinks">
        {drinks.map((it) => (
          <li key={it.id}>
            <span className="wd-thumb" aria-hidden>
              {it.photo ? <DrinkPhoto photo={it.photo} w={44} h={56} lang="tr" name={it.name.tr} className="dp-thumb" /> : <ItemVisual item={it} world={world} size={40} uid={`door-${world}-${it.slug}`} />}
            </span>
            <span className="wd-name" lang={nameLang(it.name)}>
              {it.name.tr}
            </span>
            <span className="wd-leader" aria-hidden />
            <span className="wd-price">{money(it.price, "TRY", "tr")}</span>
          </li>
        ))}
      </ul>
      <footer className="wd-foot">
        <Link href={href} className="btn">
          Menüye gir
        </Link>
        <span className="wd-count">{count} kalem · TR / EN</span>
      </footer>
    </article>
  );
}

export const NAV_WORLDS = () =>
  WORLDS.map((w) => ({ id: w.id, name: w.name.tr, bar: demoForWorld(w.id).venue.name, slug: demoForWorld(w.id).venue.slug }));

/** The world's door as its sealed object (home row: compact; /dunyalar: full, with three signatures inside). */
export function WorldSeal({ world, compact = false }: { world: WorldId; compact?: boolean }) {
  const w = worldById(world);
  const m = demoForWorld(world);
  const s = SEAL[world];
  const sig = m.sections[0];
  const drinks = m.items.filter((i) => i.sectionId === sig.id).slice(0, 3);
  return (
    <SealedDoor
      world={world}
      art={<Artifact world={world} uid={`${compact ? "c" : "f"}-${world}`} />}
      bar={m.venue.name}
      barLang={brandLang(m.venue.name)}
      worldName={w.name.tr}
      teaser={s.teaser}
      object={s.object}
      fortunes={s.fortunes}
      href={`/v/${m.venue.slug}`}
      compact={compact}
    >
      {!compact && (
        <>
          <p className="wd-collection">{w.collection.tr}</p>
          <ul className="wd-drinks">
            {drinks.map((it) => (
              <li key={it.id}>
                <span className="wd-thumb" aria-hidden>
                  {it.photo ? <DrinkPhoto photo={it.photo} w={44} h={56} lang="tr" name={it.name.tr} className="dp-thumb" /> : <ItemVisual item={it} world={world} size={40} uid={`seal-${world}-${it.slug}`} />}
                </span>
                <span className="wd-name" lang={nameLang(it.name)}>
                  {it.name.tr}
                </span>
                <span className="wd-leader" aria-hidden />
                <span className="wd-price">{money(it.price, "TRY", "tr")}</span>
              </li>
            ))}
          </ul>
          <p className="sd-count">
            {m.items.length} kalem · {w.tagline.tr}
          </p>
        </>
      )}
    </SealedDoor>
  );
}
