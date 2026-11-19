// npm test (node --test tests/guest-choice.test.mjs) — the guest's preferences against both versions of a drink.
// Small hand-made data: a drink whose original and alcohol-free recipes carry different allergens.
import { test } from "node:test";
import assert from "node:assert/strict";
import { itemHref, recommend, shownVersion, versionParam } from "../src/lib/guestChoice.ts";

const A = (...ids) => ids.map((id) => ({ id, name: id }));
// original: vermouth (sulphites) + egg white; 0%: a cordial with gluten, no sulphites, still egg white
const sour = {
  id: "sour", zero: false, price: "₺700", description: "Gin · Vermouth", kcal: 160, allergens: A("sulphites", "egg"), profile: [2, 4, 1, 3, 3, 2],
  zeroVersion: { price: "₺430", description: "0% gin · Barley cordial", kcal: 90, allergens: A("gluten", "egg"), profile: [2.5, 4, 1, 0, 3.5, 2] },
};
// original: sulphites; 0%: none at all
const spritz = {
  id: "spritz", zero: false, price: "₺640", description: "Aperitivo · Prosecco", kcal: 150, allergens: A("sulphites"), profile: [2, 2, 3, 2, 4, 3],
  zeroVersion: { price: "₺400", description: "0% aperitivo · 0% sparkling", kcal: 70, allergens: [], profile: [2.5, 2, 3, 0, 4.5, 3] },
};
const lemonade = { id: "lemonade", zero: true, price: "₺380", description: "Lemon · Soda", kcal: 90, allergens: [], profile: [3, 3, 0, 0, 4.5, 1] };
const martini = { id: "martini", zero: false, price: "₺820", description: "Gin · Vermouth", kcal: 180, allergens: A("sulphites"), profile: [0.5, 0, 1, 5, 1, 3] };
const menu = [sour, spritz, lemonade, martini];
const fresh = (p) => 100 - Math.abs(p[4] - 4.5) * 10 - p[3] * 5;

test("no preferences: every line shows its original", () => {
  for (const i of menu) assert.equal(shownVersion(i, { zero: false, avoid: [] }).key, "original");
});

test("alcohol-free only: the 0% version is shown, with its own price, description and allergens", () => {
  const v = shownVersion(sour, { zero: true, avoid: [] });
  assert.equal(v.key, "zero");
  assert.equal(v.price, "₺430");
  assert.equal(v.description, "0% gin · Barley cordial");
  assert.deepEqual(v.allergens.map((a) => a.id), ["gluten", "egg"]);
  assert.equal(shownVersion(martini, { zero: true, avoid: [] }), null, "no 0% version: left out");
  assert.equal(shownVersion(lemonade, { zero: true, avoid: [] }).key, "original", "already 0%: itself");
});

test("allergens are checked on the version that is shown, not on the original", () => {
  // sulphites are only in the original sour: its 0% version stays
  assert.equal(shownVersion(sour, { zero: true, avoid: ["sulphites"] }).key, "zero");
  // gluten is only in the 0% sour: with 0% on it goes, with 0% off the original stays
  assert.equal(shownVersion(sour, { zero: true, avoid: ["gluten"] }), null);
  assert.equal(shownVersion(sour, { zero: false, avoid: ["gluten"] }).key, "original");
  assert.equal(shownVersion(sour, { zero: false, avoid: ["sulphites"] }), null);
});

test("suggestions keep both preferences on every pick, and use the 0% version's taste", () => {
  const prefs = { zero: true, avoid: ["gluten"] };
  const picks = recommend(menu, prefs, fresh, 3);
  assert.deepEqual(picks.map((p) => p.item.id).sort(), ["lemonade", "spritz"]);
  for (const p of picks) {
    assert.ok(p.v.zero, `${p.item.id} is 0%`);
    assert.ok(!p.v.allergens.some((a) => prefs.avoid.includes(a.id)), `${p.item.id} has no gluten`);
  }
  const spritzPick = picks.find((p) => p.item.id === "spritz");
  assert.equal(spritzPick.v.key, "zero");
  assert.equal(spritzPick.v.price, "₺400");
  assert.deepEqual(spritzPick.v.profile, spritz.zeroVersion.profile);
});

test("two that fit: two are suggested; none that fit: nothing, preferences unchanged", () => {
  assert.equal(recommend(menu, { zero: true, avoid: ["gluten"] }, fresh, 3).length, 2);
  const prefs = { zero: true, avoid: ["egg", "gluten", "sulphites"] };
  const before = JSON.stringify(prefs);
  // lemonade has no allergens, so leave it out too to empty the list
  assert.equal(recommend([sour, spritz, martini], prefs, fresh, 3).length, 1);
  assert.equal(recommend([sour, martini], prefs, fresh, 3).length, 0);
  assert.equal(JSON.stringify(prefs), before, "nothing is loosened");
});

test("links name the version and keep language and world", () => {
  assert.equal(itemHref("/v/bar", "sour", "?lang=en", "zero"), "/v/bar/sour?lang=en&v=zero");
  assert.equal(itemHref("/v/bar", "sour", "?world=sakura&lang=tr", "zero"), "/v/bar/sour?world=sakura&lang=tr&v=zero");
  assert.equal(itemHref("/v/bar", "sour", "?lang=tr"), "/v/bar/sour?lang=tr", "the original needs no parameter");
  assert.equal(itemHref("/v/bar", "sour", "?lang=tr&v=zero", "original"), "/v/bar/sour?lang=tr");
  assert.equal(versionParam("zero"), "zero");
  assert.equal(versionParam(undefined), undefined, "old links: the default");
  assert.equal(versionParam(["zero", "x"]), undefined);
});
