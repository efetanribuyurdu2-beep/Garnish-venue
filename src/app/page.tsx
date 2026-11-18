import Link from "next/link";
import { LandingPhone } from "@/components/LandingPhone";
import { LogoMark } from "@/components/Logo";
import { WORLDS } from "@/data/worlds";

/**
 * The product page for bars (Turkish first: the first market is Turkey).
 * A live demo menu in a phone, why now (the law), how it works, the worlds,
 * and the pilot invitation.
 */
const CONTACT = process.env.NEXT_PUBLIC_CONTACT_URL;

const LAW: [string, string, string][] = [
  ["Temmuz 2026", "Basılı fiyat listesi", "Ticaret Bakanlığı: menü yalnızca QR ile sunulamaz; basılı liste de bulunmalı. Listede olmayan ücret alınamaz."],
  ["31 Aralık 2026", "İçerik ve alerjen", "Tarım ve Orman Bakanlığı: zincirlerde Temmuz 2026'da başladı; diğer işletmeler için duyurulan son tarih."],
  ["31 Aralık 2027", "Kalori", "Menüdeki her ürün için enerji bilgisi. Garnish bunu reçeteden hesaplar."],
];

const STEPS: [string, string][] = [
  ["Reçeteyi girin", "Malzemeleri ve ölçüleri seçin. Alkol oranı, kalori, alerjenler ve alkolsüz versiyon kendiliğinden hesaplanır."],
  ["Dünyanızı seçin", "Dokuz el çizimi dünyadan biri ya da yalnızca barınız için tasarlanan bir dünya. Fotoğraflarınızı ekleyin."],
  ["QR'ı masaya koyun", "Fiyatı değiştirdiğiniz an menü değişir. Basılı menü tek tıkla PDF olur, her değişiklik kayda geçer."],
];

const POINTS: [string, string, React.ReactNode][] = [
  ["Yasaya hazır", "İçerik, alerjen ve kalori reçeteden. Basılı PDF menü, silinemeyen fiyat geçmişi.", <path key="a" d="M12 3l7 3v5c0 4.4-3 8.3-7 9.5C8 19.3 5 15.4 5 11V6zM9 12l2 2 4-4" />],
  ["Fiyatlar tek tıkla", "Tüm kokteyllere yüzde artış, biten ürünü gizleme, alkolsüzün ayrı fiyatı.", <path key="b" d="M4 13l8-8h7v7l-8 8zM15 9h.01M8 13l3 3" />],
  ["Misafir sever", "Hızlı açılır, büyük yazı modu, iki dil, alkolsüz ve alerjen filtresi, gerçek fotoğraflar.", <path key="c" d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z" />],
  ["Sizin dünyanız", "Menü şablon gibi değil, barınızın kendisi gibi görünür: duvarı, yazısı, kadehleri.", <path key="d" d="M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c2.5 2.5 3.6 5.6 3.6 9S14.5 18.5 12 21c-2.5-2.5-3.6-5.6-3.6-9S9.5 5.5 12 3z" />],
];

export default function Home() {
  const worlds = WORLDS.map((w) => ({ id: w.id, name: w.name.tr }));
  return (
    <main className="lp">
      <nav className="lp-nav">
        <Link href="/" className="lp-nav-brand" aria-label="Garnish Venue">
          <LogoMark size={28} />
          <span>GARNISH · VENUE</span>
        </Link>
        <Link href="/panel" className="btn ghost small lp-nav-login">
          Bar girişi
        </Link>
      </nav>
      <section className="lp-hero">
        <div className="lp-hero-text">
          <span className="lp-mark">
            <LogoMark size={64} />
          </span>
          <p className="lp-kicker">GARNISH · VENUE</p>
          <h1>Barınızın menüsü, kendi dünyasında.</h1>
          <p className="lp-lead">
            Kokteyl barları için lüks ve etkileşimli QR menü. Misafiriniz bir PDF değil, barınızın kendisini görür. Alerjen ve kalori reçeteden gelir, fiyatlar tek tıkla değişir.
          </p>
          <div className="lp-cta">
            <Link className="btn" href="/panel">Barınızın menüsünü oluşturun</Link>
            <Link className="btn ghost" href="/v/demo">Demo menüyü aç</Link>
          </div>
          <p className="lp-hint">Telefondaki menüler gerçek: kaydırın, bir içkiye dokunun, alttan başka bir dünyanın barına geçin.</p>
        </div>
        <LandingPhone worlds={worlds} />
      </section>

      <section className="lp-sec lp-law">
        <p className="lp-eyebrow">Neden şimdi</p>
        <h2>Menüler artık yasal bir belge.</h2>
        <ol className="lp-timeline">
          {LAW.map(([d, h, p]) => (
            <li key={d}>
              <span className="lp-date">{d}</span>
              <h3>{h}</h3>
              <p>{p}</p>
            </li>
          ))}
        </ol>
        <p className="lp-small">Tarihler bakanlık duyurularına göredir; uygulama ayrıntıları için Resmî Gazete esastır.</p>
      </section>

      <section className="lp-sec">
        <p className="lp-eyebrow">Nasıl çalışır</p>
        <h2>Üç adımda masada.</h2>
        <ol className="lp-steps">
          {STEPS.map(([h, p], i) => (
            <li key={h}>
              <span className="lp-num">{["I", "II", "III"][i]}</span>
              <h3>{h}</h3>
              <p>{p}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="lp-sec">
        <div className="lp-points">
          {POINTS.map(([h, p, icon]) => (
            <article key={h}>
              <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden>
                <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  {icon}
                </g>
              </svg>
              <h3>{h}</h3>
              <p>{p}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="lp-sec lp-worlds">
        <p className="lp-eyebrow">Dünyalar</p>
        <h2>Dokuz dünya, dokuz bar.</h2>
        <p>Her dünyanın kendi barı, kendi imza kokteylleri ve kendi menü dili var. Barınızı açarken birini seçin, menüsü hazır gelsin.</p>
        <ul>
          {WORLDS.map((w) => (
            <li key={w.id}>
              <Link href={`/v/demo?world=${w.id}`} className={`lp-portal wc-${w.id}`} data-world={w.id}>
                <span className="lp-portal-wall" aria-hidden />
                <span className="lp-world-emblem" aria-hidden />
                <span className="lp-portal-name" lang={w.name.tr === w.name.en ? "en" : undefined}>
                  {w.name.tr}
                </span>
                <span className="lp-portal-line">{w.tagline.tr}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="lp-sec lp-pilot" id="pilot">
        <p className="lp-eyebrow">Pilot programı</p>
        <h2>İlk üç bar için ücretsiz kurulum.</h2>
        <p>Menünüzü biz girelim, dünyanızı birlikte seçelim, fotoğraflarınızı ekleyelim. Karşılığında yalnızca dürüst geri bildiriminizi istiyoruz.</p>
        <div className="lp-cta lp-cta-center">
          <Link className="btn" href="/panel">
            Hemen deneyin
          </Link>
          {CONTACT && (
            <a className="btn ghost" href={CONTACT} target="_blank" rel="noreferrer">
              Bize yazın
            </a>
          )}
        </div>
      </section>

      <footer className="lp-foot">
        <LogoMark size={28} />
        <p>Garnish Venue · İstanbul</p>
        <Link href="/panel" className="lp-foot-login">
          Bar girişi →
        </Link>
      </footer>
    </main>
  );
}
