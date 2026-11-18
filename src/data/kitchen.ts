/**
 * The kitchen & cellar library: everything a bar serves beside its cocktails,
 * ready to put on a menu. Meze and bar food, desserts, wines (Turkish grapes
 * first), beers, spirits, coffee, tea and soft drinks.
 *
 * Prices are a starting point at the middle register (a signature cocktail
 * ≈ ₺700, Nov 2026) and are scaled to the bar's world by `libraryPrice()`.
 * Allergens are cautious (TR Gıda Etiketleme Yön. Ek-1): the bar confirms them.
 * Calories are rough per-portion estimates, always shown with "≈".
 * Brand names are avoided on purpose: the bar writes its own producer in "origin".
 */
import type { ItemDetails, ItemKind, MenuItem } from "@/domain/types";
import { illustrativePhoto } from "@/lib/photos";
import type { L, WorldId } from "@/lib/types";
import { KITCHEN_PHOTOS } from "./kitchenPhotos";

/** what is drawn on the plate (FoodPlate) */
export type Dish = "dips" | "olives" | "cake" | "fries" | "cheese" | "oysters" | "fried" | "bread" | "rolls" | "ramekin" | "baklava" | "greens" | "grill" | "fish" | "tartare" | "bowl" | "dumplings" | "caviar";

export const DISH_LABEL: Record<Dish, string> = {
  dips: "Meze üçlüsü",
  olives: "Kâse (zeytin, kuruyemiş)",
  cake: "Pasta dilimi",
  fries: "Patates / cips",
  cheese: "Peynir & şarküteri",
  oysters: "Kabuklu deniz ürünü",
  fried: "Kızartma",
  bread: "Ekmek, bruschetta",
  rolls: "Börek, gyoza",
  ramekin: "Kâsede tatlı",
  baklava: "Baklava",
  greens: "Yeşillik, sebze",
  grill: "Izgara, şiş",
  fish: "Balık, ince dilimler",
  tartare: "Tartar",
  bowl: "Kâse (poke, salata)",
  dumplings: "Mantı, köfte, toplar",
  caviar: "Havyar & blini",
};

export interface LibItem {
  id: string;
  kind: Exclude<ItemKind, "cocktail">;
  style: string; // a key of STYLES[kind]
  dish?: Dish;
  name: L;
  desc: L;
  origin?: L;
  serving: L;
  /** a second size and its price as a multiple of the first */
  alt?: { label: L; x: number };
  price: number; // ₺ at the middle register
  allergens: string[];
  kcal?: number;
  abv?: number;
  volume?: number;
  /** the drink's colour in the drawing, when the style's own is wrong (ayran, şalgam, cola…) */
  color?: string;
}

const l = (tr: string, en: string): L => ({ tr, en });
const PORTION = l("Porsiyon", "Portion");

function food(id: string, style: "meze" | "snack" | "sweet", dish: Dish, name: [string, string], desc: [string, string], price: number, kcal: number, allergens: string[], serving: [string, string] | null = null): LibItem {
  return { id, kind: "food", style, dish, name: l(...name), desc: l(...desc), serving: serving ? l(...serving) : PORTION, price, kcal, allergens };
}
function wine(id: string, style: string, name: [string, string], desc: [string, string], origin: [string, string], price: number, extra: Partial<LibItem> = {}): LibItem {
  const glass = style === "sparkling" ? l("Kadeh · 125 ml", "Glass · 125 ml") : l("Kadeh · 150 ml", "Glass · 150 ml");
  return { id, kind: "wine", style, name: l(...name), desc: l(...desc), origin: l(...origin), serving: glass, alt: { label: l("Şişe", "Bottle"), x: style === "sparkling" ? 6.4 : 5.2 }, price, allergens: ["sulphites"], ...extra };
}
function beer(id: string, style: string, name: [string, string], desc: [string, string], origin: [string, string] | null, price: number, ml: number, extra: Partial<LibItem> = {}): LibItem {
  const serving = ml >= 440 ? l(`Bardak · ${ml} ml`, `Glass · ${ml} ml`) : l(`Şişe · ${ml} ml`, `Bottle · ${ml} ml`);
  return { id, kind: "beer", style, name: l(...name), desc: l(...desc), ...(origin ? { origin: l(...origin) } : {}), serving, price, allergens: ["gluten"], volume: ml, ...extra };
}
function spirit(id: string, style: string, name: [string, string], desc: [string, string], origin: [string, string] | null, price: number, extra: Partial<LibItem> = {}): LibItem {
  return { id, kind: "spirit", style, name: l(...name), desc: l(...desc), ...(origin ? { origin: l(...origin) } : {}), serving: l("4 cl", "4 cl"), alt: { label: l("Duble", "Double"), x: 1.8 }, price, allergens: [], ...extra };
}
function other(id: string, style: string, name: [string, string], desc: [string, string], price: number, serving: [string, string], extra: Partial<LibItem> = {}): LibItem {
  return { id, kind: "other", style, name: l(...name), desc: l(...desc), serving: l(...serving), price, allergens: [], ...extra };
}

export const LIBRARY: LibItem[] = [
  // ───────── cold meze
  food("haydari", "meze", "dips", ["Haydari", "Haydari"], ["Süzme yoğurt, sarımsak, dereotu, nane", "Strained yoghurt, garlic, dill, mint"], 240, 180, ["milk"]),
  food("acili-ezme", "meze", "dips", ["Acılı Ezme", "Spicy Ezme"], ["Domates, biber, soğan, nar ekşisi", "Tomato, pepper, onion, pomegranate molasses"], 220, 110, []),
  food("fava", "meze", "dips", ["Fava", "Fava"], ["Bakla ezmesi, zeytinyağı, dereotu, kırmızı soğan", "Broad bean purée, olive oil, dill, red onion"], 240, 220, []),
  food("humus", "meze", "dips", ["Humus", "Hummus"], ["Nohut, tahin, limon, kimyon", "Chickpeas, tahini, lemon, cumin"], 240, 320, ["sesame"]),
  food("babagannus", "meze", "dips", ["Babagannuş", "Baba Ghanoush"], ["Közlenmiş patlıcan, tahin, nar", "Charred aubergine, tahini, pomegranate"], 260, 200, ["sesame"]),
  food("atom", "meze", "dips", ["Atom", "Atom"], ["Süzme yoğurt, kuru acı biber, kızgın tereyağı", "Strained yoghurt, dried chilli, brown butter"], 240, 210, ["milk"]),
  food("muhammara", "meze", "dips", ["Muhammara", "Muhammara"], ["Közlenmiş kırmızı biber, ceviz, nar ekşisi", "Roast red pepper, walnut, pomegranate molasses"], 260, 300, ["nuts", "gluten"]),
  food("girit-ezmesi", "meze", "dips", ["Girit Ezmesi", "Cretan Cheese Spread"], ["Beyaz peynir, lor, Antep fıstığı, taze otlar", "White cheese, curd, pistachio, fresh herbs"], 280, 280, ["milk", "nuts"]),
  food("saksuka", "meze", "dips", ["Şakşuka", "Şakşuka"], ["Kızarmış patlıcan, domates sosu, sarımsaklı yoğurt", "Fried aubergine, tomato sauce, garlic yoghurt"], 260, 260, ["milk"]),
  food("deniz-borulcesi", "meze", "greens", ["Deniz Börülcesi", "Samphire"], ["Zeytinyağı, limon, sarımsak", "Olive oil, lemon, garlic"], 280, 120, []),
  food("peynir-kavun", "meze", "cheese", ["Beyaz Peynir & Kavun", "White Cheese & Melon"], ["Ezine peyniri, mevsim kavunu", "Ezine cheese, melon in season"], 320, 330, ["milk"]),
  food("lakerda", "meze", "fish", ["Lakerda", "Lakerda"], ["Tuzlanmış palamut, kırmızı soğan, zeytinyağı", "Salt-cured bonito, red onion, olive oil"], 420, 260, ["fish"]),
  food("midye-dolma", "meze", "oysters", ["Midye Dolma", "Stuffed Mussels"], ["Baharatlı pirinç, limon", "Spiced rice, lemon"], 360, 380, ["molluscs"], ["6 adet", "6 pieces"]),
  // ───────── hot meze
  food("sigara-boregi", "meze", "rolls", ["Sigara Böreği", "Cheese Rolls"], ["Yufka, beyaz peynir, maydanoz", "Filo, white cheese, parsley"], 280, 420, ["gluten", "milk", "egg"], ["4 adet", "4 pieces"]),
  food("pacanga", "meze", "rolls", ["Paçanga Böreği", "Paçanga Börek"], ["Pastırma, kaşar, domates", "Pastırma, kaşar cheese, tomato"], 340, 480, ["gluten", "milk"]),
  food("kalamar-tava", "meze", "fried", ["Kalamar Tava", "Fried Calamari"], ["Tarator sos, limon", "Tarator sauce, lemon"], 520, 520, ["molluscs", "gluten", "nuts"]),
  food("arnavut-cigeri", "meze", "fried", ["Arnavut Ciğeri", "Albanian Liver"], ["Kızarmış kuzu ciğeri, sumaklı soğan", "Fried lamb's liver, sumac onions"], 420, 450, ["gluten"]),
  food("ahtapot-izgara", "meze", "grill", ["Izgara Ahtapot", "Grilled Octopus"], ["Zeytinyağı, kekik, közlenmiş biber", "Olive oil, thyme, roast pepper"], 780, 340, ["molluscs"]),
  food("karides-guvec", "meze", "ramekin", ["Karides Güveç", "Prawn Casserole"], ["Tereyağı, domates, kaşar", "Butter, tomato, kaşar cheese"], 620, 420, ["crustaceans", "milk"]),
  // ───────── bar food
  food("zeytin", "snack", "olives", ["Marine Zeytin", "Marinated Olives"], ["Kekik, portakal kabuğu, zeytinyağı", "Thyme, orange peel, olive oil"], 180, 180, []),
  food("kuruyemis", "snack", "olives", ["Kavrulmuş Kuruyemiş", "Roasted Nuts"], ["Badem, fındık, kaju, deniz tuzu", "Almonds, hazelnuts, cashews, sea salt"], 240, 520, ["nuts"], ["Kâse", "Bowl"]),
  food("tuzlu-fistik", "snack", "olives", ["Tuzlu Fıstık", "Salted Peanuts"], ["Kavrulmuş, deniz tuzu", "Roasted, sea salt"], 160, 480, ["peanuts"], ["Kâse", "Bowl"]),
  food("patates", "snack", "fries", ["Patates Kızartması", "French Fries"], ["Deniz tuzu, ev yapımı mayonez", "Sea salt, house mayonnaise"], 240, 430, ["egg", "mustard"]),
  food("truf-patates", "snack", "fries", ["Trüflü Patates", "Truffle Fries"], ["Trüf yağı, parmesan", "Truffle oil, parmesan"], 340, 520, ["milk"]),
  food("edamame", "snack", "greens", ["Edamame", "Edamame"], ["Deniz tuzu, shichimi", "Sea salt, shichimi"], 240, 190, ["soy", "sesame"]),
  food("padron", "snack", "greens", ["Padrón Biberi", "Padrón Peppers"], ["Kızarmış, iri deniz tuzu", "Blistered, flaky sea salt"], 280, 150, []),
  food("bruschetta", "snack", "bread", ["Bruschetta", "Bruschetta"], ["Domates, fesleğen, sarımsak, zeytinyağı", "Tomato, basil, garlic, olive oil"], 280, 320, ["gluten"]),
  food("focaccia", "snack", "bread", ["Focaccia & Zeytinyağı", "Focaccia & Olive Oil"], ["Biberiye, deniz tuzu", "Rosemary, sea salt"], 240, 380, ["gluten"]),
  food("nachos", "snack", "fried", ["Nachos", "Nachos"], ["Mısır cipsi, cheddar, jalapeño, guacamole", "Corn chips, cheddar, jalapeño, guacamole"], 360, 720, ["milk"]),
  food("burrata", "meze", "cheese", ["Burrata", "Burrata"], ["Domates, fesleğen, zeytinyağı", "Tomato, basil, olive oil"], 520, 420, ["milk"]),
  food("peynir-tabagi", "meze", "cheese", ["Peynir Tabağı", "Cheese Board"], ["Üç olgun peynir, ceviz, bal, kraker", "Three aged cheeses, walnuts, honey, crackers"], 620, 620, ["milk", "nuts", "gluten"]),
  food("sarkuteri", "meze", "cheese", ["Şarküteri Tabağı", "Charcuterie Board"], ["Pastırma, sucuk, kurutulmuş etler, turşu, hardal", "Pastırma, sucuk, cured meats, pickles, mustard"], 680, 640, ["mustard", "sulphites"]),
  food("istiridye", "meze", "oysters", ["İstiridye", "Oysters"], ["Mignonette sos, limon", "Mignonette, lemon"], 980, 90, ["molluscs", "sulphites"], ["6 adet", "6 pieces"]),
  food("karaage", "meze", "fried", ["Tavuk Karaage", "Chicken Karaage"], ["Soya, zencefil, yuzu mayonez", "Soy, ginger, yuzu mayo"], 420, 560, ["soy", "gluten", "egg"]),
  food("gyoza", "meze", "rolls", ["Gyoza", "Gyoza"], ["Mantar ve lahana, ponzu", "Mushroom and cabbage, ponzu"], 380, 380, ["gluten", "soy", "sesame"], ["5 adet", "5 pieces"]),
  food("tavuk-sis", "meze", "grill", ["Ananaslı Tavuk Şiş", "Pineapple Chicken Skewers"], ["Teriyaki, ızgara ananas", "Teriyaki, grilled pineapple"], 420, 420, ["soy", "gluten", "sesame"]),
  food("sliders", "meze", "grill", ["Mini Burger", "Sliders"], ["Dana köfte, cheddar, turşu", "Beef, cheddar, pickles"], 520, 640, ["gluten", "milk", "egg", "mustard", "sesame"], ["3 adet", "3 pieces"]),
  food("ringa", "meze", "fish", ["Ringa & Çavdar Ekmeği", "Herring & Rye"], ["Marine ringa, kırmızı soğan, dereotu", "Pickled herring, red onion, dill"], 420, 360, ["fish", "gluten", "mustard"]),
  food("somon", "meze", "fish", ["Somon Gravlax", "Salmon Gravlax"], ["Dereotu, hardallı sos, çavdar", "Dill, mustard sauce, rye"], 560, 320, ["fish", "mustard", "gluten"]),
  food("ceviche", "meze", "fish", ["Levrek Ceviche", "Sea Bass Ceviche"], ["Lime, kırmızı soğan, kişniş, acı biber", "Lime, red onion, coriander, chilli"], 620, 210, ["fish"]),
  // ───────── desserts
  food("fondan", "sweet", "cake", ["Çikolatalı Fondan", "Chocolate Fondant"], ["Bitter çikolata, vanilyalı dondurma", "Dark chocolate, vanilla ice cream"], 360, 480, ["gluten", "egg", "milk"]),
  food("tiramisu", "sweet", "cake", ["Tiramisu", "Tiramisu"], ["Mascarpone, espresso, kakao", "Mascarpone, espresso, cocoa"], 340, 420, ["gluten", "egg", "milk"]),
  food("creme-brulee", "sweet", "ramekin", ["Crème Brûlée", "Crème Brûlée"], ["Vanilya, karamelize şeker", "Vanilla, burnt sugar"], 320, 380, ["egg", "milk"]),
  food("baklava", "sweet", "baklava", ["Fıstıklı Baklava", "Pistachio Baklava"], ["Antep fıstığı, kaymak", "Pistachio, clotted cream"], 380, 430, ["gluten", "nuts", "milk"], ["3 dilim", "3 pieces"]),
  food("kazandibi", "sweet", "ramekin", ["Kazandibi", "Kazandibi"], ["Karamelize sütlü tatlı, tarçın", "Caramelised milk pudding, cinnamon"], 260, 360, ["milk"]),
  food("sorbe", "sweet", "ramekin", ["Limon Sorbesi", "Lemon Sorbet"], ["Nane, limon kabuğu", "Mint, lemon zest"], 220, 160, []),
  food("matcha-cheesecake", "sweet", "cake", ["Matcha Cheesecake", "Matcha Cheesecake"], ["Matcha, beyaz çikolata", "Matcha, white chocolate"], 340, 450, ["gluten", "egg", "milk"]),
  food("tarcinli-corek", "sweet", "cake", ["Tarçınlı Çörek", "Cinnamon Bun"], ["Kakule, tarçın, inci şeker", "Cardamom, cinnamon, pearl sugar"], 220, 380, ["gluten", "milk", "egg"]),

  // ───────── wine
  wine("champagne-brut", "sparkling", ["Champagne Brut", "Champagne Brut"], ["Pinot Noir · Chardonnay · Pinot Meunier", "Pinot Noir · Chardonnay · Pinot Meunier"], ["Champagne, Fransa", "Champagne, France"], 950),
  wine("prosecco", "sparkling", ["Prosecco", "Prosecco"], ["Glera · armut, beyaz çiçek", "Glera · pear, white blossom"], ["Veneto, İtalya", "Veneto, Italy"], 520),
  wine("yerli-kopuklu", "sparkling", ["Yerli Köpüklü", "Turkish Sparkling"], ["Emir · Narince, geleneksel yöntem", "Emir · Narince, traditional method"], ["Kapadokya", "Cappadocia"], 480),
  wine("narince", "white", ["Narince", "Narince"], ["Narince · çiçek, ayva, mineral", "Narince · blossom, quince, mineral"], ["Tokat", "Tokat"], 520),
  wine("emir", "white", ["Emir", "Emir"], ["Emir · yeşil elma, volkanik mineral", "Emir · green apple, volcanic minerality"], ["Kapadokya", "Cappadocia"], 520),
  wine("sauvignon-blanc", "white", ["Sauvignon Blanc", "Sauvignon Blanc"], ["Sauvignon Blanc · greyfurt, taze ot", "Sauvignon Blanc · grapefruit, cut grass"], ["Marlborough, Yeni Zelanda", "Marlborough, New Zealand"], 620),
  wine("chablis", "white", ["Chablis", "Chablis"], ["Chardonnay · çakmaktaşı, limon", "Chardonnay · flint, lemon"], ["Burgonya, Fransa", "Burgundy, France"], 720),
  wine("okuzgozu", "red", ["Öküzgözü", "Öküzgözü"], ["Öküzgözü · kiraz, nar, yumuşak tanen", "Öküzgözü · cherry, pomegranate, soft tannins"], ["Elazığ", "Elazığ"], 560),
  wine("bogazkere", "red", ["Boğazkere", "Boğazkere"], ["Boğazkere · kara meyve, baharat, sıkı tanen", "Boğazkere · black fruit, spice, firm tannins"], ["Diyarbakır", "Diyarbakır"], 580),
  wine("kalecik-karasi", "red", ["Kalecik Karası", "Kalecik Karası"], ["Kalecik Karası · çilek, menekşe, ipeksi", "Kalecik Karası · strawberry, violet, silky"], ["Ankara", "Ankara"], 560),
  wine("chianti", "red", ["Chianti Classico", "Chianti Classico"], ["Sangiovese · vişne, kuru ot", "Sangiovese · sour cherry, dried herbs"], ["Toskana, İtalya", "Tuscany, Italy"], 620),
  wine("pinot-noir", "red", ["Bourgogne Pinot Noir", "Bourgogne Pinot Noir"], ["Pinot Noir · frenk üzümü, orman zemini", "Pinot Noir · redcurrant, forest floor"], ["Burgonya, Fransa", "Burgundy, France"], 780),
  wine("malbec", "red", ["Malbec", "Malbec"], ["Malbec · mürdüm eriği, kakao", "Malbec · damson, cocoa"], ["Mendoza, Arjantin", "Mendoza, Argentina"], 600),
  wine("provence-rose", "rose", ["Provence Rosé", "Provence Rosé"], ["Grenache · Cinsault · şeftali, tuz", "Grenache · Cinsault · peach, salt"], ["Provence, Fransa", "Provence, France"], 580),
  wine("kalecik-roze", "rose", ["Kalecik Roze", "Kalecik Rosé"], ["Kalecik Karası · ahududu, taze", "Kalecik Karası · raspberry, fresh"], ["Ankara", "Ankara"], 480),
  wine("turuncu-sarap", "orange", ["Turuncu Şarap", "Orange Wine"], ["Kabukla mayalanmış beyaz · kayısı, çay, tanen", "Skin-contact white · apricot, tea, tannin"], ["Gürcistan · amfora", "Georgia · amphora"], 640),
  wine("tawny-port", "sweet", ["Tawny Port", "Tawny Port"], ["Fındık, kuru incir, karamel", "Hazelnut, dried fig, caramel"], ["Douro, Portekiz", "Douro, Portugal"], 520, { serving: l("Kadeh · 75 ml", "Glass · 75 ml"), alt: undefined, abv: 20, volume: 75 }),

  // ───────── beer
  beer("fici-lager", "lager", ["Fıçı Lager", "Draught Lager"], ["Soğuk, berrak, ferah", "Cold, clear, crisp"], null, 280, 500),
  beer("pilsner", "lager", ["Pilsner", "Pilsner"], ["Çiçeksi şerbetçiotu, kuru bitiş", "Floral hops, a dry finish"], ["Çek usulü", "Czech style"], 320, 330),
  beer("bugday", "wheat", ["Buğday Birası", "Wheat Beer"], ["Muz, karanfil, bulutlu", "Banana, clove, cloudy"], ["Bavyera usulü", "Bavarian style"], 360, 500),
  beer("ipa", "ale", ["IPA", "IPA"], ["Turunçgil, çam, keskin acılık", "Citrus, pine, a sharp bitterness"], ["Craft", "Craft"], 380, 330),
  beer("amber-ale", "ale", ["Amber Ale", "Amber Ale"], ["Karamel malt, kızıl renk", "Caramel malt, a red glow"], ["Craft", "Craft"], 360, 330),
  beer("stout", "dark", ["Stout", "Stout"], ["Kavrulmuş arpa, kahve, kremsi köpük", "Roasted barley, coffee, a creamy head"], ["İrlanda usulü", "Irish style"], 380, 440),

  // ───────── spirits
  spirit("raki", "anise", ["Rakı", "Rakı"], ["Buz, su ve beyaz peynirle", "With ice, water and white cheese"], ["Türkiye", "Türkiye"], 380, { serving: l("Tek · 7 cl", "Single · 7 cl"), alt: { label: l("Duble", "Double"), x: 1.65 }, volume: 70 }),
  spirit("single-malt", "whisky", ["Single Malt Scotch", "Single Malt Scotch"], ["Bal, meşe, hafif is", "Honey, oak, a breath of smoke"], ["Speyside, İskoçya", "Speyside, Scotland"], 620),
  spirit("islay", "whisky", ["Islay Single Malt", "Islay Single Malt"], ["Turba, deniz tuzu, iyot", "Peat, sea salt, iodine"], ["Islay, İskoçya", "Islay, Scotland"], 720),
  spirit("bourbon", "whisky", ["Bourbon", "Bourbon"], ["Vanilya, karamel, meşe", "Vanilla, caramel, oak"], ["Kentucky, ABD", "Kentucky, USA"], 520),
  spirit("rye", "whisky", ["Straight Rye", "Straight Rye"], ["Çavdar baharatı, kuru meyve", "Rye spice, dried fruit"], ["ABD", "USA"], 560),
  spirit("japon-viskisi", "whisky", ["Japon Viskisi", "Japanese Whisky"], ["Armut, sandal ağacı, yumuşak", "Pear, sandalwood, gentle"], ["Japonya", "Japan"], 780),
  spirit("yillanmis-rom", "rum", ["Yıllanmış Rom", "Aged Rum"], ["Melas, muz, tropik baharat", "Molasses, banana, tropical spice"], ["Karayipler", "Caribbean"], 480),
  spirit("tekila", "agave", ["Tekila Blanco", "Tequila Blanco"], ["Agave, karabiber, lime", "Agave, black pepper, lime"], ["Jalisco, Meksika", "Jalisco, Mexico"], 480),
  spirit("meskal", "agave", ["Meskal", "Mezcal"], ["Odun dumanı, agave, toprak", "Wood smoke, agave, earth"], ["Oaxaca, Meksika", "Oaxaca, Mexico"], 580),
  spirit("konyak", "brandy", ["Konyak VSOP", "Cognac VSOP"], ["Kuru kayısı, vanilya, meşe", "Dried apricot, vanilla, oak"], ["Cognac, Fransa", "Cognac, France"], 680),
  spirit("london-dry", "clear", ["London Dry Cin", "London Dry Gin"], ["Ardıç, kişniş, narenciye · tonikle", "Juniper, coriander, citrus · with tonic"], null, 420, { serving: l("4 cl · tonikle", "4 cl · with tonic") }),
  spirit("votka", "clear", ["Buzlu Votka", "Ice-cold Vodka"], ["Dondurucudan, kadeh buzlu", "From the freezer, in a frosted glass"], null, 380),
  spirit("absinthe", "anise", ["Absinthe", "Absinthe"], ["Şeker küpü, damla damla buzlu su", "A sugar cube, iced water drop by drop"], ["Val-de-Travers, İsviçre", "Val-de-Travers, Switzerland"], 620, { serving: l("3 cl", "3 cl"), alt: undefined, abv: 60, volume: 30 }),
  spirit("amaro", "liqueur", ["Amaro", "Amaro"], ["Bitter otlar, portakal kabuğu · yemek sonrası", "Bitter herbs, orange peel · a digestif"], ["İtalya", "Italy"], 420, { alt: undefined, abv: 30 }),
  spirit("limoncello", "liqueur", ["Limoncello", "Limoncello"], ["Amalfi limonu, buz gibi", "Amalfi lemons, ice-cold"], ["Campania, İtalya", "Campania, Italy"], 340, { alt: undefined, abv: 30 }),
  spirit("sake", "sake", ["Junmai Ginjo Sake", "Junmai Ginjo Sake"], ["Armut, pirinç, yumuşak bitiş", "Pear, rice, a soft finish"], ["Niigata, Japonya", "Niigata, Japan"], 640, { serving: l("Ochoko · 90 ml", "Ochoko · 90 ml"), alt: { label: l("Tokkuri · 300 ml", "Tokkuri · 300 ml"), x: 3 } }),

  // ───────── coffee, tea, soft
  other("turk-kahvesi", "coffee", ["Türk Kahvesi", "Turkish Coffee"], ["Lokum ve bir bardak suyla", "With Turkish delight and a glass of water"], 160, ["Fincan", "Cup"], { kcal: 5 }),
  other("espresso", "coffee", ["Espresso", "Espresso"], ["Tek shot, kısa ve yoğun", "A single shot, short and dense"], 140, ["Fincan · 30 ml", "Cup · 30 ml"], { volume: 30 }),
  other("cay", "tea", ["Çay", "Turkish Tea"], ["İnce belli bardakta, demli", "Brewed strong, in a tulip glass"], 80, ["Bardak", "Glass"]),
  other("bitki-cayi", "tea", ["Bitki Çayı", "Herbal Tea"], ["Ihlamur, adaçayı ya da papatya", "Linden, sage or camomile"], 140, ["Demlik", "Pot"]),
  other("sencha", "tea", ["Sencha", "Sencha"], ["Japon yeşil çayı, ılık demlenir", "Japanese green tea, brewed warm"], 180, ["Demlik", "Pot"]),
  other("limonata", "soft", ["Ev Yapımı Limonata", "House Lemonade"], ["Taze limon, nane", "Fresh lemon, mint"], 180, ["Bardak · 300 ml", "Glass · 300 ml"], { volume: 300, kcal: 120 }),
  other("portakal-suyu", "juice", ["Taze Portakal Suyu", "Fresh Orange Juice"], ["Sıkma, şekersiz", "Freshly squeezed, no added sugar"], 200, ["Bardak · 250 ml", "Glass · 250 ml"], { kcal: 110 }),
  other("tonik", "soft", ["Tonik", "Tonic Water"], ["Kınakına, narenciye", "Quinine, citrus"], 140, ["Şişe · 200 ml", "Bottle · 200 ml"], { volume: 200, kcal: 70 }),
  other("maden-suyu", "water", ["Maden Suyu", "Sparkling Mineral Water"], ["Limon dilimiyle", "With a slice of lemon"], 90, ["Şişe · 200 ml", "Bottle · 200 ml"], { volume: 200 }),
  other("su", "water", ["Su", "Still Water"], ["Kaynak suyu", "Spring water"], 70, ["Şişe · 330 ml", "Bottle · 330 ml"], { volume: 330 }),
  other("hindistan-cevizi-suyu", "water", ["Hindistan Cevizi Suyu", "Coconut Water"], ["Taze, buz gibi", "Fresh, ice-cold"], 220, ["Bardak · 250 ml", "Glass · 250 ml"], { kcal: 45, color: "#eef0e2" }),

  // ───────── more kitchens: French bistro, Turkish sweets, Japanese, speakeasy, apothecary, island, North, Riviera
  food("havyar", "meze", "caviar", ["Havyar & Blini", "Caviar & Blinis"], ["30 g siyah havyar, ekşi krema, sıcak blini", "30 g black caviar, crème fraîche, warm blinis"], 2400, 260, ["fish", "gluten", "egg", "milk"]),
  food("dana-tartar", "meze", "tartare", ["Dana Tartar", "Steak Tartare"], ["Elde kıyılmış bonfile, yumurta sarısı, kapari, hardal", "Hand-cut beef fillet, egg yolk, capers, mustard"], 620, 380, ["egg", "mustard", "fish"]),
  food("carpaccio", "meze", "fish", ["Dana Carpaccio", "Beef Carpaccio"], ["İnce dilim bonfile, roka, parmesan, limon", "Thin-sliced beef fillet, rocket, parmesan, lemon"], 560, 280, ["milk"]),
  food("gougeres", "meze", "dumplings", ["Gougères", "Gougères"], ["Gruyère peynirli sıcak hamur topları", "Warm choux puffs with Gruyère"], 280, 320, ["gluten", "egg", "milk"], ["6 adet", "6 pieces"]),
  food("escargot", "meze", "oysters", ["Escargots de Bourgogne", "Escargots de Bourgogne"], ["Sarımsaklı, maydanozlu tereyağı, ekmek", "Garlic and parsley butter, bread"], 520, 360, ["molluscs", "milk", "gluten"], ["6 adet", "6 pieces"]),
  food("croque-monsieur", "meze", "bread", ["Croque Monsieur", "Croque Monsieur"], ["Hindi füme, gruyère, beşamel, hardal", "Smoked turkey, Gruyère, béchamel, mustard"], 420, 560, ["gluten", "milk", "egg", "mustard"]),
  food("cikolatali-mus", "sweet", "ramekin", ["Çikolatalı Mus", "Chocolate Mousse"], ["Bitter çikolata, deniz tuzu, krema", "Dark chocolate, sea salt, cream"], 320, 420, ["egg", "milk"]),
  food("macaron", "sweet", "cake", ["Macaron", "Macarons"], ["Ahududu, Antep fıstığı, vanilya, çikolata", "Raspberry, pistachio, vanilla, chocolate"], 300, 320, ["nuts", "egg", "milk"], ["4 adet", "4 pieces"]),
  food("kunefe", "sweet", "baklava", ["Künefe", "Künefe"], ["Hatay peyniri, kadayıf, şerbet, Antep fıstığı", "Hatay cheese, kadayıf pastry, syrup, pistachio"], 380, 520, ["gluten", "milk", "nuts"]),
  food("sutlac", "sweet", "ramekin", ["Fırın Sütlaç", "Baked Rice Pudding"], ["Güveçte, üstü kızarmış, tarçınla", "In a clay pot, browned on top, with cinnamon"], 220, 320, ["milk"]),
  food("ton-tartar", "meze", "tartare", ["Ton Balığı Tartar", "Tuna Tartare"], ["Ton balığı, avokado, soya, susam, wasabi", "Tuna, avocado, soy, sesame, wasabi"], 620, 280, ["fish", "soy", "sesame"]),
  food("mor-cips", "snack", "fries", ["Mor Patates Cipsi", "Purple Potato Crisps"], ["Mor patates, karabiber, deniz tuzu", "Purple potato, black pepper, sea salt"], 240, 430, []),
  food("bao", "meze", "dumplings", ["Kısa Kaburga Bao", "Short Rib Bao"], ["Buharda bao, ağır pişmiş kaburga, salatalık turşusu", "Steamed bao, slow-cooked short rib, pickled cucumber"], 460, 480, ["gluten", "soy", "sesame"], ["2 adet", "2 pieces"]),
  food("tempura", "meze", "fried", ["Karides Tempura", "Prawn Tempura"], ["Hafif hamur, tentsuyu sos", "Light batter, tentsuyu dip"], 560, 420, ["crustaceans", "gluten", "egg", "soy"]),
  food("nitro-dondurma", "sweet", "ramekin", ["Nitro Dondurma", "Nitro Ice Cream"], ["Masada sıvı azotla dondurulur: vanilya ya da çikolata", "Frozen at the table with liquid nitrogen: vanilla or chocolate"], 320, 300, ["milk", "egg"]),
  food("deviled-eggs", "snack", "dumplings", ["Deviled Eggs", "Deviled Eggs"], ["Hardallı yumurta, kırmızı toz biber, frenk soğanı", "Mustard-yolk eggs, paprika, chives"], 260, 280, ["egg", "mustard"], ["4 adet", "4 pieces"]),
  food("karides-kokteyli", "meze", "bowl", ["Karides Kokteyli", "Shrimp Cocktail"], ["Haşlanmış karides, kokteyl sos, limon", "Poached prawns, cocktail sauce, lemon"], 620, 260, ["crustaceans", "egg", "celery"]),
  food("hurma-pastirma", "snack", "rolls", ["Pastırmalı Hurma", "Pastırma-wrapped Dates"], ["Medjool hurma, pastırma, közde", "Medjool dates wrapped in pastırma, flame-grilled"], 340, 320, [], ["4 adet", "4 pieces"]),
  food("tavuk-kanat", "meze", "fried", ["Acılı Tavuk Kanat", "Buffalo Wings"], ["Tereyağlı acı sos, mavi peynir sos, kereviz sapı", "Butter hot sauce, blue cheese dip, celery sticks"], 420, 620, ["milk", "celery", "egg"]),
  food("mac-cheese", "meze", "fried", ["Mac & Cheese Kroket", "Mac & Cheese Bites"], ["Cheddar, makarna, çıtır kaplama", "Cheddar, macaroni, a crisp crumb"], 340, 520, ["gluten", "milk", "egg"], ["6 adet", "6 pieces"]),
  food("pekan-tart", "sweet", "cake", ["Pekan Tart", "Pecan Pie"], ["Pekan cevizi, karamel, vanilyalı krema", "Pecans, caramel, vanilla cream"], 340, 520, ["gluten", "egg", "milk", "nuts"]),
  food("ny-cheesecake", "sweet", "cake", ["New York Cheesecake", "New York Cheesecake"], ["Krem peynir, bisküvi taban, frenk üzümü", "Cream cheese, biscuit base, redcurrants"], 340, 480, ["gluten", "egg", "milk"]),
  food("sashimi", "meze", "fish", ["Somon & Ton Sashimi", "Salmon & Tuna Sashimi"], ["Günün balığı, wasabi, zencefil turşusu", "Today's fish, wasabi, pickled ginger"], 720, 220, ["fish", "soy"]),
  food("ton-tataki", "meze", "fish", ["Ton Tataki", "Tuna Tataki"], ["Kenarları mühürlenmiş ton, ponzu, yeşil soğan", "Seared tuna, ponzu, spring onion"], 640, 240, ["fish", "soy", "gluten"]),
  food("hiyayakko", "meze", "cheese", ["Hiyayakko", "Hiyayakko"], ["Soğuk ipek tofu, zencefil, bonito, soya", "Chilled silken tofu, ginger, bonito, soy"], 240, 140, ["soy", "fish", "gluten"]),
  food("sunomono", "meze", "greens", ["Sunomono", "Sunomono"], ["Pirinç sirkeli salatalık, wakame, susam", "Cucumber in rice vinegar, wakame, sesame"], 200, 70, ["sesame", "soy"]),
  food("yakitori", "meze", "grill", ["Yakitori", "Yakitori"], ["Kömürde tavuk şiş, tare sos, yeşil soğan", "Charcoal chicken skewers, tare glaze, spring onion"], 380, 360, ["soy", "gluten", "sesame"], ["3 şiş", "3 skewers"]),
  food("agedashi", "meze", "fried", ["Agedashi Tofu", "Agedashi Tofu"], ["Kızarmış tofu, dashi, rendelenmiş turp", "Fried tofu in dashi, grated daikon"], 300, 280, ["soy", "gluten", "fish"]),
  food("takoyaki", "meze", "dumplings", ["Takoyaki", "Takoyaki"], ["Ahtapotlu hamur topları, sos, mayonez, bonito", "Octopus dumplings, sauce, mayo, bonito"], 380, 420, ["molluscs", "gluten", "egg", "fish", "soy"], ["6 adet", "6 pieces"]),
  food("mochi", "sweet", "dumplings", ["Dondurmalı Mochi", "Mochi Ice Cream"], ["Matcha, yuzu, siyah susam", "Matcha, yuzu, black sesame"], 280, 280, ["milk", "sesame"], ["3 adet", "3 pieces"]),
  food("dorayaki", "sweet", "cake", ["Dorayaki", "Dorayaki"], ["Ballı pankek, kırmızı fasulye ezmesi", "Honey pancakes, sweet red bean"], 240, 320, ["gluten", "egg", "milk"]),
  food("pate", "meze", "bread", ["Tavuk Ciğeri Pâté", "Chicken Liver Pâté"], ["Konyaklı, kızarmış brioche, kornişon", "With cognac, toasted brioche, cornichons"], 380, 420, ["milk", "gluten", "egg", "sulphites"]),
  food("fume-alabalik", "meze", "fish", ["Füme Alabalık", "Smoked Trout"], ["Bayır turpu kreması, dereotu, çavdar", "Horseradish cream, dill, rye"], 480, 300, ["fish", "milk", "gluten"]),
  food("tursu", "snack", "greens", ["Turşu Kavanozu", "Pickle Jar"], ["Evin turşuları: salatalık, havuç, pancar, biber", "House pickles: cucumber, carrot, beetroot, pepper"], 180, 60, ["mustard", "sulphites"]),
  food("mantar-tart", "meze", "bread", ["Yabani Mantar Tart", "Wild Mushroom Tart"], ["Milföy, mantar, kekik, keçi peyniri", "Puff pastry, mushrooms, thyme, goat's cheese"], 380, 460, ["gluten", "milk", "egg"]),
  food("kroket", "meze", "fried", ["Patates Kroket", "Potato Croquettes"], ["Dışı çıtır, içi yumuşak, sarımsaklı mayonez", "Crisp outside, soft inside, aioli"], 300, 420, ["gluten", "milk", "egg"], ["6 adet", "6 pieces"]),
  food("kemik-ilik", "meze", "grill", ["Fırın Kemik İliği", "Roasted Bone Marrow"], ["Maydanoz salatası, deniz tuzu, kızarmış ekmek", "Parsley salad, sea salt, toast"], 560, 520, ["gluten"]),
  food("firin-camembert", "meze", "cheese", ["Fırın Camembert", "Baked Camembert"], ["Bal, ceviz, biberiye, ekmek", "Honey, walnuts, rosemary, bread"], 520, 620, ["milk", "gluten", "nuts"]),
  food("sticky-toffee", "sweet", "cake", ["Sticky Toffee Puding", "Sticky Toffee Pudding"], ["Hurmalı kek, karamel sos, kaymak", "Date sponge, toffee sauce, clotted cream"], 340, 560, ["gluten", "egg", "milk"]),
  food("sarapta-armut", "sweet", "ramekin", ["Şarapta Armut", "Wine-poached Pear"], ["Baharatlı kırmızı şarapta, vanilyalı krema", "In spiced red wine, vanilla cream"], 320, 300, ["sulphites", "milk"]),
  food("poke", "meze", "bowl", ["Somon Poke", "Salmon Poke"], ["Somon, avokado, mango, susam, suşi pirinci", "Salmon, avocado, mango, sesame, sushi rice"], 560, 520, ["fish", "soy", "sesame"]),
  food("tropik-meyve", "snack", "bowl", ["Tropik Meyve Tabağı", "Tropical Fruit Plate"], ["Ananas, mango, papaya, çarkıfelek, lime", "Pineapple, mango, papaya, passion fruit, lime"], 340, 180, []),
  food("muz-cips", "snack", "fries", ["Muz Cipsi", "Plantain Chips"], ["Lime, deniz tuzu", "Lime, sea salt"], 200, 380, []),
  food("hindistan-karides", "meze", "fried", ["Hindistan Cevizli Karides", "Coconut Shrimp"], ["Çıtır hindistan cevizi kabuğu, tatlı acı sos", "A crisp coconut crust, sweet chilli sauce"], 560, 480, ["crustaceans", "gluten", "egg"]),
  food("tatli-patates", "snack", "fries", ["Tatlı Patates Kızartması", "Sweet Potato Fries"], ["Füme kırmızı biber, lime mayonez", "Smoked paprika, lime mayo"], 260, 420, ["egg"]),
  food("ananasli-kek", "sweet", "cake", ["Ters Yüz Ananaslı Kek", "Pineapple Upside-down Cake"], ["Karamelize ananas, romlu krema", "Caramelised pineapple, rum cream"], 300, 420, ["gluten", "egg", "milk"]),
  food("haupia", "sweet", "ramekin", ["Haupia", "Haupia"], ["Hindistan cevizi pudingi, kavrulmuş hindistan cevizi", "Coconut pudding, toasted coconut"], 260, 260, []),
  food("blini", "meze", "caviar", ["Blini & Kırmızı Havyar", "Blinis & Salmon Roe"], ["Karabuğday blini, somon havyarı, ekşi krema", "Buckwheat blinis, salmon roe, sour cream"], 520, 320, ["fish", "gluten", "egg", "milk"]),
  food("olivier", "meze", "bowl", ["Olivier Salatası", "Olivier Salad"], ["Patates, havuç, bezelye, turşu, yumurta, mayonez", "Potato, carrot, peas, pickles, egg, mayonnaise"], 280, 360, ["egg", "mustard"]),
  food("pelmeni", "meze", "dumplings", ["Pelmeni", "Pelmeni"], ["Dana etli Sibirya mantısı, ekşi krema, dereotu", "Siberian beef dumplings, sour cream, dill"], 420, 480, ["gluten", "egg", "milk"]),
  food("isvec-koftesi", "meze", "dumplings", ["İsveç Köftesi", "Swedish Meatballs"], ["Kremalı sos, patates püresi, kırmızı yaban mersini", "Cream gravy, mash, lingonberries"], 460, 560, ["gluten", "milk", "egg"]),
  food("pirojki", "meze", "rolls", ["Pirojki", "Pirozhki"], ["Patatesli ve lahanalı fırın börekleri", "Baked buns with potato and cabbage"], 280, 380, ["gluten", "egg", "milk"], ["3 adet", "3 pieces"]),
  food("bulut-meyvesi", "sweet", "ramekin", ["Bulut Meyvesi & Krema", "Cloudberries & Cream"], ["Kuzey'in altın meyvesi, çırpılmış krema", "The North's golden berry, whipped cream"], 320, 260, ["milk"]),
  food("syrniki", "sweet", "cake", ["Syrniki", "Syrniki"], ["Lor peynirli pankek, ekşi krema, orman meyvesi reçeli", "Curd-cheese pancakes, sour cream, berry jam"], 280, 380, ["gluten", "egg", "milk"]),
  food("vitello-tonnato", "meze", "fish", ["Vitello Tonnato", "Vitello Tonnato"], ["İnce dilim dana, ton balıklı krema sos, kapari", "Thin-sliced veal, creamy tuna sauce, capers"], 580, 360, ["fish", "egg"]),
  food("bresaola", "meze", "fish", ["Bresaola & Roka", "Bresaola & Rocket"], ["Kurutulmuş dana, roka, parmesan, limon", "Air-dried beef, rocket, parmesan, lemon"], 520, 240, ["milk"]),
  food("arancini", "meze", "dumplings", ["Arancini", "Arancini"], ["Safranlı risotto topları, mozzarella", "Saffron risotto balls, mozzarella"], 340, 420, ["gluten", "milk", "egg"], ["3 adet", "3 pieces"]),
  food("fritto-misto", "meze", "fried", ["Fritto Misto", "Fritto Misto"], ["Kalamar, karides, hamsi, limon", "Squid, prawns, anchovies, lemon"], 620, 520, ["molluscs", "crustaceans", "fish", "gluten"]),
  food("midye-mariniere", "meze", "oysters", ["Midye Marinière", "Moules Marinière"], ["Beyaz şarap, tereyağı, sarımsak, maydanoz", "White wine, butter, garlic, parsley"], 560, 380, ["molluscs", "milk", "sulphites"]),
  food("panna-cotta", "sweet", "ramekin", ["Panna Cotta", "Panna Cotta"], ["Vanilya, kırmızı meyve sosu", "Vanilla, red berry coulis"], 280, 320, ["milk"]),
  food("affogato", "sweet", "ramekin", ["Affogato", "Affogato"], ["Vanilyalı dondurma, sıcak espresso", "Vanilla gelato, a shot of hot espresso"], 240, 220, ["milk", "egg"]),

  // ───────── more beer
  beer("alkolsuz-bira", "lager", ["Alkolsüz Bira", "Alcohol-free Beer"], ["Lager tadında, alkol %0,5'in altında", "A lager taste, under 0.5% alcohol"], null, 220, 330, { abv: 0.5, color: "#e9b94a" }),
  beer("belcika-tripel", "ale", ["Belçika Tripel", "Belgian Tripel"], ["Altın renk, baharatlı maya, kuru bitiş", "Golden, spicy yeast, a dry finish"], ["Belçika usulü", "Belgian style"], 480, 330, { abv: 8.5, color: "#e0a531" }),
  beer("pirinc-lager", "lager", ["Pirinç Lager", "Rice Lager"], ["Japon usulü, çok hafif, buz gibi", "Japanese style, very light, ice-cold"], ["Japon usulü", "Japanese style"], 340, 330, { color: "#f0d27a" }),
  beer("koyu-lager", "dark", ["Koyu Lager", "Dark Lager"], ["Kavrulmuş malt, kakao, yumuşak", "Roasted malt, cocoa, smooth"], null, 360, 500),
  beer("trappist-dubbel", "dark", ["Manastır Dubbel", "Abbey Dubbel"], ["Kuru erik, karamel, baharat", "Prune, caramel, spice"], ["Belçika manastır usulü", "Belgian abbey style"], 520, 330, { abv: 7, color: "#6a2c12" }),
  beer("sour-ale", "ale", ["Vişneli Ekşi Bira", "Sour Cherry Ale"], ["Ekşi, meyveli, şarap gibi", "Tart, fruity, wine-like"], ["Craft", "Craft"], 440, 330, { abv: 5.5, color: "#b8263a" }),
  beer("tropik-lager", "lager", ["Tropik Lager", "Tropical Lager"], ["Hafif, lime dilimiyle", "Light, with a wedge of lime"], null, 320, 330, { abv: 4.5 }),
  beer("pale-ale", "ale", ["Pale Ale", "Pale Ale"], ["Mango, çarkıfelek, yumuşak acılık", "Mango, passion fruit, a gentle bitterness"], ["Craft", "Craft"], 360, 330, { abv: 5.2, color: "#e09a3a" }),
  beer("italyan-lager", "lager", ["İtalyan Lager", "Italian Lager"], ["Kuru, ferah, çiçeksi", "Dry, crisp, floral"], ["İtalya", "Italy"], 320, 330),

  // ───────── more spirits
  spirit("umeshu", "liqueur", ["Umeshu", "Umeshu"], ["Japon erik likörü, buzla", "Japanese plum liqueur, on ice"], ["Japonya", "Japan"], 420, { serving: l("6 cl", "6 cl"), alt: undefined, abv: 14, volume: 60, color: "#d9a441" }),
  spirit("akvavit", "clear", ["Akvavit", "Aquavit"], ["Kimyon, dereotu, buz gibi", "Caraway, dill, ice-cold"], ["İskandinavya", "Scandinavia"], 420, { color: "#efe3b0" }),
  spirit("baharatli-rom", "rum", ["Baharatlı Rom", "Spiced Rum"], ["Vanilya, tarçın, karanfil", "Vanilla, cinnamon, clove"], ["Karayipler", "Caribbean"], 440),

  // ───────── more soft drinks
  other("ayran", "soft", ["Ayran", "Ayran"], ["Yayık ayranı, köpüklü", "Churned, frothy yoghurt drink"], 90, ["Bardak · 250 ml", "Glass · 250 ml"], { allergens: ["milk"], kcal: 90, volume: 250, color: "#f6f3ea" }),
  other("salgam", "soft", ["Şalgam", "Şalgam"], ["Acılı ya da acısız, Adana usulü", "Spicy or mild, Adana style"], 100, ["Bardak · 250 ml", "Glass · 250 ml"], { kcal: 20, volume: 250, color: "#5a0f2e" }),
  other("murver-gazozu", "soft", ["Mürver Çiçeği Gazozu", "Elderflower Pressé"], ["Mürver çiçeği, limon, maden suyu", "Elderflower, lemon, sparkling water"], 180, ["Bardak · 250 ml", "Glass · 250 ml"], { kcal: 90, volume: 250, color: "#efe7c0" }),
  other("kola", "soft", ["Kola", "Cola"], ["Buz ve limonla", "With ice and lemon"], 140, ["Şişe · 330 ml", "Bottle · 330 ml"], { kcal: 140, volume: 330, color: "#2a1408" }),
  other("zencefilli-gazoz", "soft", ["Zencefilli Gazoz", "Ginger Beer"], ["Keskin zencefil, alkolsüz", "Fiery ginger, alcohol-free"], 160, ["Şişe · 200 ml", "Bottle · 200 ml"], { kcal: 80, volume: 200, color: "#e8c56a" }),
  other("cold-brew", "soft", ["Soğuk Demleme Kahve", "Cold Brew"], ["18 saat demlenir, buzla", "Steeped for 18 hours, over ice"], 220, ["Bardak · 250 ml", "Glass · 250 ml"], { kcal: 5, volume: 250, color: "#2a160c" }),
  other("kombucha", "soft", ["Kombucha", "Kombucha"], ["Evde mayalanmış, zencefil ve limon", "House-fermented, ginger and lemon"], 220, ["Şişe · 330 ml", "Bottle · 330 ml"], { kcal: 45, volume: 330, color: "#d8a75a" }),
  other("mor-limonata", "soft", ["Kelebek Bezelyesi Limonatası", "Butterfly Pea Lemonade"], ["Limonu döktükçe maviden mora döner", "Turns from blue to violet as the lemon goes in"], 200, ["Bardak · 300 ml", "Glass · 300 ml"], { kcal: 110, volume: 300, color: "#7a5ad8" }),
  other("matcha-latte", "soft", ["Buzlu Matcha Latte", "Iced Matcha Latte"], ["Uji matcha, süt ya da yulaf sütü", "Uji matcha, milk or oat milk"], 240, ["Bardak · 300 ml", "Glass · 300 ml"], { allergens: ["milk"], kcal: 150, volume: 300, color: "#9cbf6a" }),
  other("yuzu-soda", "soft", ["Yuzu Soda", "Yuzu Soda"], ["Yuzu suyu, bal, maden suyu", "Yuzu juice, honey, sparkling water"], 200, ["Bardak · 300 ml", "Glass · 300 ml"], { kcal: 80, volume: 300, color: "#f1e27a" }),
  other("japon-gazozu", "soft", ["Japon Misket Gazozu", "Japanese Marble Soda"], ["Misket kapaklı şişe, limon aroması", "The bottle with a marble stopper, lemon"], 180, ["Şişe · 200 ml", "Bottle · 200 ml"], { kcal: 80, volume: 200, color: "#dff0f6" }),
  other("ananas-suyu", "juice", ["Taze Ananas Suyu", "Fresh Pineapple Juice"], ["Sıkma, köpüklü", "Freshly pressed, frothy"], 200, ["Bardak · 250 ml", "Glass · 250 ml"], { kcal: 130, color: "#f2c94c" }),
  other("carkifelek-gazozu", "soft", ["Çarkıfelek Gazozu", "Passion Fruit Soda"], ["Çarkıfelek, lime, maden suyu", "Passion fruit, lime, sparkling water"], 200, ["Bardak · 300 ml", "Glass · 300 ml"], { kcal: 100, volume: 300, color: "#f0a640" }),
  other("kvas", "soft", ["Kvas", "Kvass"], ["Çavdar ekmeğinden mayalanır, hafif ekşi (≈ %1 alkol)", "Fermented from rye bread, gently sour (≈ 1% alcohol)"], 160, ["Bardak · 330 ml", "Glass · 330 ml"], { allergens: ["gluten"], kcal: 90, volume: 330, abv: 1, color: "#6b3a16" }),
  other("mors", "soft", ["Mors", "Mors"], ["Kızılcık ve yaban mersini, bal", "Cranberry and bilberry, honey"], 180, ["Bardak · 300 ml", "Glass · 300 ml"], { kcal: 120, volume: 300, color: "#9e1b3a" }),
  other("kan-portakali-soda", "soft", ["Kan Portakalı Gazozu", "Blood Orange Soda"], ["Sicilya kan portakalı, maden suyu", "Sicilian blood orange, sparkling water"], 200, ["Şişe · 275 ml", "Bottle · 275 ml"], { kcal: 110, volume: 275, color: "#d8462a" }),
  other("chinotto", "soft", ["Chinotto", "Chinotto"], ["Acı portakal gazozu, otsu ve buruk", "Bitter-orange soda, herbal and bittersweet"], 180, ["Şişe · 200 ml", "Bottle · 200 ml"], { kcal: 90, volume: 200, color: "#3a1a0c" }),
  other("sicak-cikolata", "coffee", ["Sıcak Çikolata", "Hot Chocolate"], ["Bitter çikolata, süt, tarçın", "Dark chocolate, milk, cinnamon"], 220, ["Fincan", "Cup"], { allergens: ["milk"], kcal: 260, volume: 200, color: "#4a2614" }),
];

export const libraryById = (id: string) => LIBRARY.find((x) => x.id === id);

/** food by kitchen, for the panel's picker */
const FOOD_GROUPS: [string, string[]][] = [
  ["Türk mezeleri & ara sıcaklar", ["haydari", "acili-ezme", "fava", "humus", "babagannus", "atom", "muhammara", "girit-ezmesi", "saksuka", "deniz-borulcesi", "peynir-kavun", "lakerda", "midye-dolma", "sigara-boregi", "pacanga", "kalamar-tava", "arnavut-cigeri", "ahtapot-izgara", "karides-guvec"]],
  ["Akdeniz & İtalyan", ["zeytin", "padron", "bruschetta", "focaccia", "burrata", "vitello-tonnato", "bresaola", "arancini", "fritto-misto", "midye-mariniere"]],
  ["Fransız bistro & şarküteri", ["istiridye", "havyar", "dana-tartar", "carpaccio", "gougeres", "escargot", "croque-monsieur", "peynir-tabagi", "sarkuteri", "pate", "mantar-tart", "kroket", "kemik-ilik", "firin-camembert"]],
  ["Japon & Asya", ["edamame", "sashimi", "ton-tataki", "ton-tartar", "hiyayakko", "sunomono", "karaage", "yakitori", "gyoza", "agedashi", "takoyaki", "tempura", "bao"]],
  ["Kuzey & Rus", ["ringa", "somon", "fume-alabalik", "blini", "olivier", "tursu", "pelmeni", "isvec-koftesi", "pirojki"]],
  ["Tropik & Latin", ["poke", "ceviche", "tropik-meyve", "muz-cips", "nachos", "tavuk-sis", "hindistan-karides", "tatli-patates"]],
  ["Bar atıştırmalıkları", ["kuruyemis", "tuzlu-fistik", "patates", "truf-patates", "mor-cips", "deviled-eggs", "karides-kokteyli", "hurma-pastirma", "sliders", "tavuk-kanat", "mac-cheese"]],
];

/** the library grouped for a picker: kitchens, desserts, then the cellar and the soft drinks */
export const LIBRARY_GROUPS: { label: string; items: LibItem[] }[] = (() => {
  const byId = new Map(LIBRARY.map((x) => [x.id, x]));
  const grouped = new Set(FOOD_GROUPS.flatMap(([, ids]) => ids));
  const order: [string, (x: LibItem) => boolean][] = [
    ["Diğer yemekler", (x) => x.kind === "food" && x.style !== "sweet" && !grouped.has(x.id)],
    ["Tatlılar", (x) => x.kind === "food" && x.style === "sweet"],
    ["Köpüklü şaraplar", (x) => x.kind === "wine" && x.style === "sparkling"],
    ["Beyaz şaraplar", (x) => x.kind === "wine" && x.style === "white"],
    ["Kırmızı şaraplar", (x) => x.kind === "wine" && x.style === "red"],
    ["Roze, turuncu & tatlı şaraplar", (x) => x.kind === "wine" && ["rose", "orange", "sweet"].includes(x.style)],
    ["Biralar", (x) => x.kind === "beer"],
    ["Rakı & distile içkiler", (x) => x.kind === "spirit"],
    ["Meşrubat, meyve suyu & su", (x) => x.kind === "other" && !["coffee", "tea"].includes(x.style)],
    ["Kahve & çay", (x) => x.kind === "other" && ["coffee", "tea"].includes(x.style)],
  ];
  const food = FOOD_GROUPS.map(([label, ids]) => ({ label, items: ids.map((id) => byId.get(id)!).filter(Boolean) }));
  return [...food, ...order.map(([label, f]) => ({ label, items: LIBRARY.filter(f) }))].filter((g) => g.items.length);
})();

/** price registers per world, relative to the middle (₺700 signature) */
export const REGISTER: Record<WorldId, number> = { maison: 820, anatolia: 620, cosmos: 720, jazz: 700, sakura: 760, alchemist: 740, tiki: 680, boreal: 660, riviera: 640 };
const r10 = (n: number) => Math.round(n / 10) * 10;
/** the library price for this world's register, in ₺ (and the second size's) */
export function libraryPrice(x: Pick<LibItem, "price" | "alt">, world: WorldId) {
  const price = r10((x.price * REGISTER[world]) / 700);
  return { price, alt: x.alt ? r10(price * x.alt.x) : undefined };
}

/** a library line as menu fields, priced for the world (kuruş), with optional overrides */
export function libItemFields(x: LibItem, world: WorldId, over: { name?: L; desc?: L } = {}): Pick<MenuItem, "name" | "description" | "price" | "kind" | "details" | "extraAllergens" | "photo"> {
  const p = libraryPrice(x, world);
  const details: ItemDetails = { style: x.style, serving: x.serving };
  if (x.dish) details.plate = x.dish;
  if (x.origin) details.origin = x.origin;
  if (x.abv !== undefined) details.abv = x.abv;
  if (x.volume !== undefined) details.volume = x.volume;
  if (x.kcal !== undefined) details.kcal = x.kcal;
  if (x.color) details.color = x.color;
  if (x.alt && p.alt) details.alt = { label: x.alt.label, price: p.alt * 100 };
  const name = over.name ?? x.name;
  const photo = KITCHEN_PHOTOS[x.id];
  return { name, description: over.desc ?? x.desc, price: p.price * 100, kind: x.kind, details, extraAllergens: [...x.allergens], ...(photo ? { photo: illustrativePhoto(photo, name) } : {}) };
}
