import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { WORLDS } from "@/data/worlds";

/**
 * The product page for bars (Turkish first: the first market is Turkey).
 * Kept deliberately short until the pilots: what it is, why, and the demo.
 */
const POINTS: [string, string][] = [
  ["Yasaya hazır", "İçerik, alerjen ve kalori bilgisi reçeteden otomatik hesaplanır. Basılı menü tek tıkla PDF olur; her fiyat değişikliği kayda geçer."],
  ["Fiyatlar tek tıkla", "Tüm kokteyllere yüzde artış, biten ürünü gizleme, alkolsüz versiyonun ayrı fiyatı. Menü yeniden basılmaz."],
  ["Misafir sever", "Hızlı açılır, büyük yazı modu var, iki dilde. Alkolsüz ya da alerjensiz seçmek bir dokunuş."],
  ["Sizin dünyanız", "Dokuz el çizimi dünya: Art Deco salondan meyhaneye, speakeasy'den Japon barına. Ya da yalnızca size ait bir dünya."],
];

export default function Home() {
  return (
    <main className="lp">
      <header className="lp-hero">
        <LogoMark size={88} />
        <p className="lp-kicker">GARNISH · VENUE</p>
        <h1>Barınızın menüsü, kendi dünyasında.</h1>
        <p className="lp-lead">
          Kokteyl barları için lüks ve etkileşimli QR menü. Misafiriniz bir PDF değil, barınızın kendisini görür.
        </p>
        <div className="lp-cta">
          <Link className="btn" href="/v/demo">Demo menüyü aç</Link>
          <Link className="btn ghost" href="/v/sirkeci">Meyhane örneği</Link>
        </div>
      </header>

      <section className="lp-points">
        {POINTS.map(([h, p]) => (
          <article key={h}>
            <h2>{h}</h2>
            <p>{p}</p>
          </article>
        ))}
      </section>

      <section className="lp-worlds">
        <h2>Aynı menü, dokuz dünya</h2>
        <p>Demo menüyü dilediğiniz dünyada açın:</p>
        <ul>
          {WORLDS.map((w) => (
            <li key={w.id}>
              <Link href={`/v/demo?world=${w.id}`} className={`lp-world wc-${w.id}`} data-world={w.id} lang={w.name.tr === w.name.en ? "en" : undefined}>
                <span className="lp-world-emblem" aria-hidden />
                {w.name.tr}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <footer className="lp-foot">
        <p>Pilot programı: ilk barlar için ücretsiz kurulum. Yakında.</p>
      </footer>
    </main>
  );
}
