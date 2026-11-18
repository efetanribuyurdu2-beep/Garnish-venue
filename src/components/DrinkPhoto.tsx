import type { Photo } from "@/domain/types";
import { pick } from "@/lib/i18n";
import { photoSrc, unsplashRef } from "@/lib/photos";
import type { Lang } from "@/lib/types";

/** A drink's photograph, framed for the menu (thumb) or the drink page (hero, with credit). */
export function DrinkPhoto({ photo, w, h, lang, name, credit = false, eager = false, className = "" }: { photo: Photo; w: number; h: number; lang: Lang; name: string; credit?: boolean; eager?: boolean; className?: string }) {
  return (
    <figure className={`dp ${className}`} style={{ background: photo.color ?? "var(--surface2)", aspectRatio: `${w} / ${h}` }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photoSrc(photo, w, h)} alt={pick(photo.alt, lang) || name} width={w} height={h} loading={eager ? "eager" : "lazy"} decoding="async" />
      {credit && photo.credit && (
        <figcaption>
          {photo.illustrative && <span className="dp-illus">{lang === "tr" ? "Temsili görsel" : "Illustrative photo"} · </span>}
          {lang === "tr" ? "Fotoğraf" : "Photo"}{" "}
          <a href={unsplashRef(photo.credit.authorUrl)} target="_blank" rel="noreferrer">
            {photo.credit.author}
          </a>{" "}
          ·{" "}
          <a href={unsplashRef(photo.credit.sourceUrl)} target="_blank" rel="noreferrer">
            Unsplash
          </a>
        </figcaption>
      )}
    </figure>
  );
}
