/**
 * What each world's sealed object says: the invitation on the closed object,
 * and the readings that come out of it (one at random each time it is opened,
 * as with a coffee reading).
 */
import type { WorldId } from "./types";

export const SEAL: Record<WorldId, { teaser: string; object: string; fortunes: string[] }> = {
  maison: {
    teaser: "Mührü kırın",
    object: "Altın mühürlü bir zarf",
    fortunes: [
      "Davetiyeniz onaylandı: bu akşam mermer tezgâhta bir kristal kadeh sizin için soğuyor.",
      "Le Grand Bar sizi bekliyor. Kıyafet: siyah kravat; gülümseme şart.",
      "Şampanya bu gece sizden yana. Bir de Vesper, çalkalanmış, karıştırılmamış.",
    ],
  },
  anatolia: {
    teaser: "Fincanı kaldırın",
    object: "Tabağına kapatılmış bir kahve fincanı",
    fortunes: [
      "Fincanında bir kuş var: yakında güzel bir haber. Yanına bir kadeh rakı yakışır.",
      "Telvede bir yol görünüyor; sonu kalabalık, güzel bir meyhane sofrasına çıkıyor.",
      "Kalp şeklinde bir leke: bu akşam iyi bir sohbet ve bir Kına Gecesi seni bekliyor.",
    ],
  },
  cosmos: {
    teaser: "Kapağı açın",
    object: "Kapalı bir uzay penceresi",
    fortunes: [
      "Biniş kartınız onaylandı. Kapı: Orbital Lounge, Sektör 9.",
      "Koordinatlar hazır. Yer çekimi bu katta isteğe bağlı; bardaklar değil.",
      "Bir yıldız kaydı: dileğinizi bu gece bir Nebula'ya saklayın.",
    ],
  },
  jazz: {
    teaser: "Kapıyı çalın",
    object: "Gözetleme delikli bir kapı",
    fortunes: [
      "“Parola?” “Bee's Knees.” “Buyur dostum, sesini alçak tut.”",
      "Piyanist bu gece senin için çalıyor. Kimseye söyleme.",
      "Kapı aralandı: içerisi 1923, dışarısı yasak.",
    ],
  },
  sakura: {
    teaser: "Falı açın",
    object: "Dala bağlanmış bir omikuji",
    fortunes: [
      "大吉 · Büyük şans: bu akşam kiraz çiçekleri sizin için açtı.",
      "吉 · İyi şans: buz az önce elde yontuldu, sizi bekliyor.",
      "中吉 · Orta şans, yüksek keyif: bir yudum, bir mevsim.",
    ],
  },
  alchemist: {
    teaser: "Şişeyi açın",
    object: "Mühürlü bir iksir şişesi",
    fortunes: [
      "Formül tamam: üç damla bergamot, bir tutam merak.",
      "Mühür kırıldı. İksir yalnızca meraklılara görünür.",
      "Yeşil buhar bir isim yazıyor: The Apothecary.",
    ],
  },
  tiki: {
    teaser: "Mantarı çekin",
    object: "Kumsalda bir şişe",
    fortunes: [
      "Haritadaki X, The Lagoon Hut'ı gösteriyor. Aloha!",
      "Mesaj şöyle: meşaleler yanıyor, rom bol, hemen gel.",
      "Dalgalar bu şişeyi sana getirdi; şimdi sıra bir Mai Tai'de.",
    ],
  },
  boreal: {
    teaser: "Buzu silin",
    object: "Buz tutmuş bir pencere",
    fortunes: [
      "Pencerenin ardında soba yanıyor. Kapıyı çabuk kapatın, ayaz dolmasın.",
      "Buzun ardında kuzey ışığı ve buz gibi bir votka var.",
      "Kar yağıyor; Aurora Hall'da masanız hazır.",
    ],
  },
  riviera: {
    teaser: "Kapıyı itin",
    object: "Limon dalı altında bir mahzen kapısı",
    fortunes: [
      "Mahzen kapısı açıldı: Bağ Bozumu sizi bekliyor.",
      "Serin taş, güneşli bahçe. Önce bir spritz mi, yoksa fıçıdan bir şey mi?",
      "Fıçılar dolu, limonlar sarı. Benvenuti!",
    ],
  },
};
