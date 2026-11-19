// The guest Atelier on the nine demo bars: the shelf it is given, the preferences it keeps, "Şansına".
import { test } from "node:test";
import assert from "node:assert/strict";
import { INGREDIENTS } from "../src/data/ingredients.ts";
import { DEMO_MENUS } from "../src/repo/demo.ts";
import { atelierLineOf, shelfOf } from "../src/lib/atelier.ts";
import {
  FRAMES, analyseDesign, applyCorrection, correction, draw, frameById, glassesFor, iceFor, partsOf, possible, sanitize, startFrame, usable,
} from "../src/lib/atelierKit.ts";

// a small seeded random, so a failure can be replayed
const seeded = (n) => () => ((n = (n * 1103515245 + 12345) % 2147483648) / 2147483648);
const NONE = { zero: false, avoid: [] };

test("every demo bar offers the Atelier, priced on its menu, with a shelf read from its own drinks", () => {
  for (const m of DEMO_MENUS) {
    const line = atelierLineOf(m);
    assert.ok(line && line.price > 0, m.venue.slug);
    const shelf = shelfOf(m);
    const used = new Set(m.items.flatMap((i) => i.recipe?.parts.map((p) => p.id) ?? []));
    // only this bar's bottles (plus lemon, lime, sugar, soda, Angostura, and the 0% stand-ins it pours), never the catalogue
    assert.ok(shelf.bottles.length < INGREDIENTS.length / 3, `${m.venue.slug}: ${shelf.bottles.length} bottles`);
    for (const b of shelf.bottles) assert.ok(used.has(b.id) || ["lemon", "lime", "simple", "soda", "angostura"].includes(b.id) || b.zeroOnly, `${m.venue.slug}: ${b.id}`);
    const { bottles } = usable(shelf.bottles, NONE);
    assert.ok(FRAMES.filter((f) => possible(f, bottles)).length >= 4, m.venue.slug);
    if (shelf.offersZero) assert.ok(possible(frameById("sour"), usable(shelf.bottles, { zero: true, avoid: [] }).bottles), `${m.venue.slug} 0%`);
  }
});

test("preferences are kept: alcohol-free only means no alcohol, a left-out allergen never comes back", () => {
  for (const m of DEMO_MENUS) {
    const shelf = shelfOf(m);
    const g = shelf.garnishes.map((x) => x.id);
    for (const prefs of [{ zero: true, avoid: [] }, { zero: false, avoid: ["nuts", "egg", "sulphites"] }, { zero: true, avoid: ["nuts", "egg"] }]) {
      if (prefs.zero && !shelf.offersZero) continue;
      const { bottles } = usable(shelf.bottles, prefs);
      const rand = seeded(7);
      for (let k = 0; k < 150; k++) {
        const d = draw(bottles, g, shelf.glasses, rand);
        if (!d) break;
        const parts = partsOf(d, bottles);
        for (const p of parts) {
          const b = bottles.find((x) => x.id === p.id);
          assert.ok(b, `${m.venue.slug}: ${p.id} is not on the usable shelf`);
          assert.ok(!b.allergens.some((a) => prefs.avoid.includes(a)), `${m.venue.slug}: ${p.id} carries a left-out allergen`);
        }
        const a = analyseDesign(d, bottles);
        assert.ok(a.finalVolume > 40, `${m.venue.slug}: ${a.finalVolume} ml`);
        if (!prefs.zero) assert.ok(!parts.some((p) => p.id.startsWith("zero-")), `${m.venue.slug}: a 0% stand-in in a regular drink`);
        if (prefs.zero) assert.equal(a.abv, 0, `${m.venue.slug}: ${JSON.stringify(parts)}`);
      }
    }
  }
});

test("a design made before a preference changed is brought back inside it, bottle by bottle", () => {
  const m = DEMO_MENUS.find((x) => x.venue.world === "tiki");
  const shelf = shelfOf(m);
  const all = usable(shelf.bottles, NONE).bottles;
  const g = shelf.garnishes.map((x) => x.id);
  let d = startFrame(frameById("sour"), all, g, shelf.glasses);
  d = { ...d, picks: { ...d.picks, sweet: { id: "orgeat", ml: 20 } }, foam: true };
  assert.ok(partsOf(d, all).some((p) => p.id === "egg-white"));
  const careful = usable(shelf.bottles, { zero: false, avoid: ["nuts", "egg"] }).bottles;
  const s = sanitize(d, careful, g, shelf.glasses);
  const ids = partsOf(s, careful).map((p) => p.id);
  assert.ok(!ids.includes("orgeat") && !ids.includes("egg-white"), ids.join());
  assert.equal(s.picks.sweet.ml, 20, "the measure stays");
  // a 0% shelf: the rum becomes the bar's 0% rum, nothing else changes frame
  const zero = usable(shelf.bottles, { zero: true, avoid: [] }).bottles;
  const z = sanitize(d, zero, g, shelf.glasses);
  assert.equal(z.frame, "sour");
  assert.ok(zero.find((b) => b.id === z.picks.base.id)?.zero);
});

test("one tap balances: too sweet gets more citrus, never past the frame's limit", () => {
  const m = DEMO_MENUS[0];
  const shelf = shelfOf(m);
  const all = usable(shelf.bottles, NONE).bottles;
  let d = startFrame(frameById("sour"), all, [], shelf.glasses);
  d = { ...d, picks: { ...d.picks, sour: { id: "lemon", ml: 10 }, sweet: { id: "simple", ml: 30 } } };
  const a = analyseDesign(d, all);
  assert.equal(a.tip.kind, "add-acid");
  const fix = correction(d, a);
  assert.equal(fix.key, "sour");
  assert.ok(fix.ml > 10 && fix.ml <= 30);
  const after = analyseDesign(applyCorrection(d, fix), all);
  assert.ok(Math.abs(after.balance) < Math.abs(a.balance));
});

test("glass and ice follow the frame: a sour may go on the rocks, a martini never takes ice", () => {
  const sour = frameById("sour");
  const gl = glassesFor(sour, ["coupe", "rocks", "highball"]);
  assert.deepEqual(gl.slice(0, 2), ["coupe", "rocks"]);
  assert.equal(iceFor(sour, "coupe"), "none");
  assert.equal(iceFor(sour, "rocks"), "cube");
  assert.equal(iceFor(frameById("oldfashioned"), "rocks"), "sphere");
  assert.equal(iceFor(frameById("highball"), "coconut"), "crushed");
  assert.ok(glassesFor(frameById("martini"), ["rocks"]).every((g) => iceFor(frameById("martini"), g) === "none"));
});
