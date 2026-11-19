// The Atelier runs the balance maths on the phone with the shelf it was sent (src/lib/mix.ts).
// It must stay the same maths as the core's `analyse` (src/lib/balance.ts): checked on every library cocktail and its 0% version.
import { test } from "node:test";
import assert from "node:assert/strict";
import { COCKTAILS } from "../src/data/cocktails.ts";
import { ingredientById } from "../src/data/ingredients.ts";
import { analyse } from "../src/lib/balance.ts";
import { analyseWith } from "../src/lib/mix.ts";
import { toZero } from "../src/lib/zero.ts";

test("analyseWith gives exactly what analyse gives, on every library cocktail and its alcohol-free version", () => {
  assert.ok(COCKTAILS.length > 80);
  for (const c of COCKTAILS) {
    for (const parts of [c.parts, toZero(c.parts)]) {
      assert.deepEqual(analyseWith(parts, c.method, ingredientById), analyse(parts, c.method), c.id);
    }
  }
});
