import Link from "next/link";
import { Fonts } from "@/components/Fonts";
import { HeroWorlds, type HeroWorld } from "@/components/HeroWorlds";
import { LandingPhone } from "@/components/LandingPhone";
import { LogoMark } from "@/components/Logo";
import { SiteNav } from "@/components/SiteNav";
import { NAV_WORLDS, WorldSeal } from "@/components/WorldDoor";
import { WORLDS } from "@/data/worlds";
import { brandLang, pick } from "@/lib/i18n";
import { HEAD } from "@/lib/worldMenu";
import { demoForWorld } from "@/repo/demo";

/**
 * The home page (Turkish first: the first market is Turkey). It opens on the
 * nine worlds, one after another; right under them the nine bars' doors; then
 * what a guest gets at the table; then, for bars, how it works, why now and
 * the pilot.
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

const GUEST: [string, string][] = [
  ["Dünyasında açılır", "QR okutulur, bar kendi dünyasında belirir: duvarı, yazısı, kadehleri, hareketli arka planı."],
  ["Bana bir içki öner", "Misafir ruh hâlini seçer, barmen bu menüden üç içki önerir."],
  ["Herkes için", "Alkolsüz ve alerjen filtresi, büyük yazı modu, Türkçe ve İngilizce."],
  ["Gerçekçi ve şeffaf", "Her içki kendi bardağında, kendi renginde; alkol, kalori ve alerjen bilgisiyle."],
];

export default function Home() {
  const worlds = WORLDS.map((w) => ({ id: w.id, name: w.name.tr }));
  const hero: HeroWorld[] = WORLDS.map((w) => {
    const v = demoForWorld(w.id).venue;
    const kicker = pick(HEAD[w.id].kicker, "tr");
    return { id: w.id, bar: v.name, barLang: brandLang(v.name), slug: v.slug, kicker, kickerLang: brandLang(kicker), greeting: w.greeting.tr, name: w.name.tr, tagline: w.tagline.tr };
  });
  return (
    <main className="lp">
      <Fonts />
      <SiteNav worlds={NAV_WORLDS()} />
      <HeroWorlds worlds={hero} />

      <section className="lp-doors" aria-labelledby="doors-title">
        <div className="lp-doors-head">
          <p className="lp-eyebrow">Dokuz bar · dokuz sır</p>
          <h2 id="doors-title">Hangisini açacaksınız?</h2>
          <Link href="/dunyalar" className="lp-more">
            Tüm dünyalar →
          </Link>
        </div>
        <div className="lp-doors-row">
          {WORLDS.map((w) => (
            <WorldSeal key={w.id} world={w.id} compact />
          ))}
        </div>
      </section>

      <section className="lp-sec lp-guest" id="misafir">
        <div className="lp-guest-grid">
          <div className="lp-guest-text">
            <p className="lp-eyebrow">Masada</p>
            <h2>Misafiriniz bir PDF değil, barınızı görür.</h2>
            <ul className="lp-guest-list">
              {GUEST.map(([h, p]) => (
                <li key={h}>
                  <h3>{h}</h3>
                  <p>{p}</p>
                </li>
              ))}
            </ul>
            <p className="lp-hint">Yandaki telefon gerçek: kaydırın, bir içkiye dokunun, alttan başka bir dünyanın barına geçin.</p>
          </div>
          <LandingPhone worlds={worlds} />
        </div>
      </section>

      <section className="lp-sec" id="nasil">
        <p className="lp-eyebrow">Barlar için · nasıl çalışır</p>
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
        <div className="lp-cta lp-cta-center">
          <Link className="btn" href="/panel">
            Barınızı ekleyin
          </Link>
        </div>
      </section>

      <section className="lp-sec" id="barlar">
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
        <nav className="lp-foot-links" aria-label="Alt menü">
          <Link href="/dunyalar">Dünyalar</Link>
          <Link href="/#nasil">Nasıl çalışır</Link>
          <Link href="/panel">Bar girişi</Link>
        </nav>
      </footer>
    </main>
  );
}
