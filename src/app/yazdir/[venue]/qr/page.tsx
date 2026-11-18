import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LogoMark } from "@/components/Logo";
import { PrintBar } from "@/components/PrintBar";
import { brandLang, pick } from "@/lib/i18n";
import { qrSvg } from "@/lib/qr";
import { HEAD } from "@/lib/worldMenu";
import { siteOrigin } from "@/lib/siteUrl";
import { getVenueMenu } from "@/repo";

type Params = Promise<{ venue: string }>;
type Search = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const m = await getVenueMenu((await params).venue);
  return m ? { title: `${m.venue.name} · Masa QR kartları` } : {};
}

/**
 * Table cards: one per table, four to an A4 sheet (A6 each, with cut marks),
 * dressed in the bar's world. Each QR opens the live menu and says which
 * table it came from (?masa=), for later use.
 */
export default async function TableCards({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { venue: slug } = await params;
  const sp = await searchParams;
  const menu = await getVenueMenu(slug);
  if (!menu) notFound();
  const v = menu.venue;
  const n = Math.min(60, Math.max(1, Number(sp.masa) || 8));
  const bare = sp.numara === "yok"; // one card without a table number, for the bar or the door
  const origin = await siteOrigin();
  const labels = bare ? [""] : Array.from({ length: n }, (_, i) => String(i + 1));
  const cards = await Promise.all(
    labels.map(async (label) => ({ label, svg: await qrSvg(`${origin}/v/${v.slug}${label ? `?masa=${label}` : ""}`) })),
  );
  const sheets: (typeof cards)[] = [];
  for (let i = 0; i < cards.length; i += 4) sheets.push(cards.slice(i, i + 4));
  const tagline = pick(v.tagline, "tr") || pick(HEAD[v.world].kicker, "tr");

  return (
    <div className="pr pr-cards" data-world={v.world} data-palette={v.palette ?? "noir"}>
      <script dangerouslySetInnerHTML={{ __html: `document.documentElement.dataset.world=${JSON.stringify(v.world)};document.documentElement.dataset.palette=${JSON.stringify(v.palette ?? "noir")};` }} />
      <PrintBar title={`${v.name} · masa kartları`} back="/panel">
        <form className="pr-form">
          <label>
            Masa sayısı <input className="input" type="number" name="masa" min={1} max={60} defaultValue={n} />
          </label>
          <button className="chip">Güncelle</button>
        </form>
        <Link className={`chip${bare ? " on" : ""}`} href={bare ? `?masa=${n}` : "?numara=yok"} replace>
          {bare ? "Masa numaralı kartlar" : "Numarasız tek kart"}
        </Link>
      </PrintBar>
      {sheets.map((sheet, si) => (
        <div key={si} className="pr-sheet">
          {sheet.map((c) => (
            <div key={c.label || "bar"} className="pr-card">
              <span className="pr-card-wall" aria-hidden />
              <span className="wm-corner tl" aria-hidden />
              <span className="wm-corner tr" aria-hidden />
              <span className="wm-corner bl" aria-hidden />
              <span className="wm-corner br" aria-hidden />
              <span className="pr-emblem" aria-hidden />
              <p className="pr-kicker" lang={brandLang(tagline)}>
                {tagline}
              </p>
              <p className="pr-card-name" lang={brandLang(v.name)}>
                {v.name}
              </p>
              <span className="pr-card-qr" dangerouslySetInnerHTML={{ __html: c.svg }} />
              <p className="pr-card-call">
                Menü <span>·</span> <em lang="en">Menu</em>
              </p>
              <p className="pr-card-hint">
                Telefonunuzun kamerasıyla okutun
                <br />
                <span lang="en">Scan with your phone&apos;s camera</span>
              </p>
              {c.label && (
                <p className="pr-card-table">
                  Masa <strong>{c.label}</strong>
                </p>
              )}
              <p className="pr-made">
                <LogoMark size={12} /> Garnish
              </p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
