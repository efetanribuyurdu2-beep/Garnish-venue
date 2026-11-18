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
import type { L, WorldId } from "@/lib/types";

/** what is drawn on the plate (FoodPlate) */
export type Dish = "dips" | "olives" | "cake" | "fries" | "cheese" | "oysters" | "fried" | "bread" | "rolls" | "ramekin" | "baklava" | "greens" | "grill" | "fish";

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
  fish: "Balık dilimleri",
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
function beer(id: string, style: string, name: [string, string], desc: [string, string], origin: [string, string] | null, price: number, ml: number): LibItem {
  const serving = ml >= 440 ? l(`Bardak · ${ml} ml`, `Glass · ${ml} ml`) : l(`Şişe · ${ml} ml`, `Bottle · ${ml} ml`);
  return { id, kind: "beer", style, name: l(...name), desc: l(...desc), ...(origin ? { origin: l(...origin) } : {}), serving, price, allergens: ["gluten"], volume: ml };
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
  other("turk-kahvesi", "coffee", ["Türk Kahvesi", "Turkish Coffee"], ["Lokum ve bir bardak suyla", "With Turkish delight and a glass of water"], 160, ["Fincan", "Cup"]),
  other("espresso", "coffee", ["Espresso", "Espresso"], ["Tek shot, kısa ve yoğun", "A single shot, short and dense"], 140, ["Fincan · 30 ml", "Cup · 30 ml"], { volume: 30 }),
  other("cay", "tea", ["Çay", "Turkish Tea"], ["İnce belli bardakta, demli", "Brewed strong, in a tulip glass"], 80, ["Bardak", "Glass"]),
  other("bitki-cayi", "tea", ["Bitki Çayı", "Herbal Tea"], ["Ihlamur, adaçayı ya da papatya", "Linden, sage or camomile"], 140, ["Demlik", "Pot"]),
  other("sencha", "tea", ["Sencha", "Sencha"], ["Japon yeşil çayı, ılık demlenir", "Japanese green tea, brewed warm"], 180, ["Demlik", "Pot"]),
  other("limonata", "soft", ["Ev Yapımı Limonata", "House Lemonade"], ["Taze limon, nane", "Fresh lemon, mint"], 180, ["Bardak · 300 ml", "Glass · 300 ml"], { volume: 300 }),
  other("portakal-suyu", "juice", ["Taze Portakal Suyu", "Fresh Orange Juice"], ["Sıkma, şekersiz", "Freshly squeezed, no added sugar"], 200, ["Bardak · 250 ml", "Glass · 250 ml"]),
  other("tonik", "soft", ["Tonik", "Tonic Water"], ["Kınakına, narenciye", "Quinine, citrus"], 140, ["Şişe · 200 ml", "Bottle · 200 ml"], { volume: 200 }),
  other("maden-suyu", "water", ["Maden Suyu", "Sparkling Mineral Water"], ["Limon dilimiyle", "With a slice of lemon"], 90, ["Şişe · 200 ml", "Bottle · 200 ml"], { volume: 200 }),
  other("su", "water", ["Su", "Still Water"], ["Kaynak suyu", "Spring water"], 70, ["Şişe · 330 ml", "Bottle · 330 ml"], { volume: 330 }),
  other("hindistan-cevizi-suyu", "water", ["Hindistan Cevizi Suyu", "Coconut Water"], ["Taze, buz gibi", "Fresh, ice-cold"], 220, ["Bardak · 250 ml", "Glass · 250 ml"]),
];

export const libraryById = (id: string) => LIBRARY.find((x) => x.id === id);

/** the library grouped for a picker: Meze, Bar food, Desserts, Sparkling, White… */
export const LIBRARY_GROUPS: { label: string; items: LibItem[] }[] = (() => {
  const order: [string, (x: LibItem) => boolean][] = [
    ["Mezeler", (x) => x.kind === "food" && x.style === "meze"],
    ["Atıştırmalıklar", (x) => x.kind === "food" && x.style === "snack"],
    ["Tatlılar", (x) => x.kind === "food" && x.style === "sweet"],
    ["Köpüklü şaraplar", (x) => x.kind === "wine" && x.style === "sparkling"],
    ["Beyaz şaraplar", (x) => x.kind === "wine" && x.style === "white"],
    ["Kırmızı şaraplar", (x) => x.kind === "wine" && x.style === "red"],
    ["Roze, turuncu & tatlı şaraplar", (x) => x.kind === "wine" && ["rose", "orange", "sweet"].includes(x.style)],
    ["Biralar", (x) => x.kind === "beer"],
    ["Rakı & distile içkiler", (x) => x.kind === "spirit"],
    ["Kahve, çay & meşrubat", (x) => x.kind === "other"],
  ];
  return order.map(([label, f]) => ({ label, items: LIBRARY.filter(f) }));
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
export function libItemFields(x: LibItem, world: WorldId, over: { name?: L; desc?: L } = {}): Pick<MenuItem, "name" | "description" | "price" | "kind" | "details" | "extraAllergens"> {
  const p = libraryPrice(x, world);
  const details: ItemDetails = { style: x.style, serving: x.serving };
  if (x.dish) details.plate = x.dish;
  if (x.origin) details.origin = x.origin;
  if (x.abv !== undefined) details.abv = x.abv;
  if (x.volume !== undefined) details.volume = x.volume;
  if (x.kcal !== undefined) details.kcal = x.kcal;
  if (x.alt && p.alt) details.alt = { label: x.alt.label, price: p.alt * 100 };
  return { name: over.name ?? x.name, description: over.desc ?? x.desc, price: p.price * 100, kind: x.kind, details, extraAllergens: [...x.allergens] };
}
