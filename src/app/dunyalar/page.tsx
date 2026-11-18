import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { SiteNav } from "@/components/SiteNav";
import { NAV_WORLDS, WorldSeal } from "@/components/WorldDoor";
import { WORLDS } from "@/data/worlds";

export const metadata: Metadata = {
  title: "Dokuz dünya · Garnish Venue",
  description: "Garnish'in dokuz dünyası ve dokuz barı: her birinin kendi menüsü, imza kokteylleri ve menü dili.",
};

/** The nine worlds, one door each: the bar, its collection, three signatures and the way in. */
export default function Worlds() {
  return (
    <main className="lp dw">
      <SiteNav worlds={NAV_WORLDS()} />
      <header className="dw-head">
        <p className="lp-eyebrow">Garnish · dokuz dünya</p>
        <h1>Dokuz dünya, dokuz bar.</h1>
        <p>
          Her dünyanın kendi barı, kendi imza kokteylleri ve kendi menü dili var: Art Deco bir salon, bir meyhane, bir yörünge salonu, bir speakeasy, bir izakaya, bir simyacı
          laboratuvarı, bir lagün kulübesi, bir kuzey salonu ve bir Akdeniz mahzeni. Her biri kapalı bir sır: açın, falınıza bakın, menüye girin.
        </p>
        <nav className="dw-jump" aria-label="Dünyalara git">
          {WORLDS.map((w) => (
            <a key={w.id} href={`#dunya-${w.id}`} className={`dw-chip wc-${w.id}`} data-world={w.id}>
              <span className="lp-world-emblem" aria-hidden />
              <span lang={w.name.tr === w.name.en ? "en" : undefined}>{w.name.tr}</span>
            </a>
          ))}
        </nav>
      </header>
      <div className="dw-grid">
        {WORLDS.map((w) => (
          <WorldSeal key={w.id} world={w.id} />
        ))}
      </div>
      <section className="lp-sec lp-pilot">
        <p className="lp-eyebrow">Barlar için</p>
        <h2>Barınız hangi dünyada?</h2>
        <p>Bir dünya seçin, menüsü reçeteleri, hikâyeleri ve önerilen fiyatlarıyla hazır gelsin; sonra kendi barınıza göre değiştirin.</p>
        <div className="lp-cta lp-cta-center">
          <Link className="btn" href="/panel">
            Barınızı ekleyin
          </Link>
        </div>
      </section>
      <footer className="lp-foot">
        <LogoMark size={28} />
        <p>Garnish Venue · İstanbul</p>
      </footer>
    </main>
  );
}
