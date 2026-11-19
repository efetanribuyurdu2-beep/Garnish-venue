// Guest Atelier acceptance, through the real UI on the demo bars (TR and EN): the menu line and the dock lead to it,
// the glass and the numbers follow every choice, one tap balances, 0% and left-out allergens are kept, "Şansına",
// the bartender's card (bar's language, table number from the QR, the line's price), signatures kept in the browser,
// the old item address, the printed list. Needs a production server on :3200. Run: npm run test:e2e
const { chromium } = require('playwright');
const BASE = 'http://localhost:3200';
let fails = 0;
const ok = (c, msg) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${msg}`); if (!c) fails++; };
const facts = (p) => p.locator('.at-facts').textContent();
const picked = (p, slot) => p.locator(`.at-slot[data-slot="${slot}"] .at-bottle.on`).textContent().then((s) => s.trim());

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(String(e)));
  p.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

  // the menu line (table 7 from the QR) → the Atelier
  await p.goto(`${BASE}/v/le-grand-bar?masa=7`, { waitUntil: 'networkidle' });
  const line = p.locator('.gm-atelier a');
  ok(await line.count() === 1, 'the menu has one "Kendi kokteylin" line');
  ok((await line.locator('.gm-price').textContent()).includes('880'), 'the line carries its price (₺880)');
  ok(await p.locator('.gd a[href*="/atelier"]').count() === 1, 'the dock offers "Kendi kokteylin"');
  await line.click();
  await p.waitForURL(/\/v\/le-grand-bar\/atelier\?lang=tr$/);
  await p.locator('.at-stage').waitFor();
  ok(await p.locator('.at-frame.on').textContent().then((s) => s.startsWith('Sour')), 'starts on the Sour frame');
  ok((await p.locator('.at-verdict').textContent()).includes('Dengeli'), 'the starting sour is balanced');

  // measures move the numbers and the glass
  const before = await facts(p);
  const fill = () => p.locator('.at-glass svg').innerHTML();
  const glass0 = await fill();
  await p.locator('.at-slot[data-slot="sweet"] .at-stepper button').last().click();
  await p.locator('.at-slot[data-slot="sweet"] .at-stepper button').last().click();
  await p.locator('.at-slot[data-slot="sweet"] .at-stepper button').last().click();
  await p.locator('.at-slot[data-slot="sweet"] .at-stepper button').last().click();
  ok((await p.locator('.at-slot[data-slot="sweet"] output').textContent()) === '30 ml', 'the stepper stops at the frame limit (30 ml)');
  ok((await facts(p)) !== before, 'strength / energy / volume follow the measure');
  await p.locator('.at-slot[data-slot="sour"] .at-stepper button').first().click();
  await p.locator('.at-slot[data-slot="sour"] .at-stepper button').first().click();
  await p.locator('.at-slot[data-slot="sour"] .at-stepper button').first().click();
  ok((await p.locator('.at-verdict').textContent()).includes('tatlı kaçtı'), 'too much sugar, too little lemon: "Biraz tatlı kaçtı"');
  const fix = p.locator('.at-fix');
  ok(await fix.count() === 1, 'one tap to balance is offered');
  const sour0 = await p.locator('.at-slot[data-slot="sour"] output').textContent();
  await fix.click();
  ok((await p.locator('.at-slot[data-slot="sour"] output').textContent()) !== sour0, `"Dengele" adds citrus (${sour0} → ${await p.locator('.at-slot[data-slot="sour"] output').textContent()})`);

  // a bottle changes the colour; changing frame keeps the base
  await p.locator('.at-slot[data-slot="sweet"] .at-bottle', { hasText: 'Grenadin' }).click();
  ok((await fill()) !== glass0, 'grenadine turns the glass');
  await p.locator('.at-slot[data-slot="base"] .at-bottle', { hasText: 'Rye' }).click();
  await p.locator('.at-frame', { hasText: 'Daisy' }).click();
  ok((await picked(p, 'base')).includes('Rye'), 'the base (rye) carries over to the Daisy');
  ok(await p.locator('.at-slot[data-slot="liqueur"]').count() === 1, 'the Daisy asks for a liqueur');
  await p.locator('.at-frame', { hasText: 'Old Fashioned' }).click();
  ok((await p.locator('.at-slot[data-slot="bitters"] output').textContent()) === '2 dash', 'bitters are counted in dashes');
  ok(await p.locator('.at-bottles[aria-label="Bardak"] .at-bottle.on').textContent().then((s) => s.includes('Rocks')), 'an Old Fashioned is served in a rocks glass');

  // 0%: every bottle on the shelf is alcohol-free, the drink is 0%
  await p.locator('.at-zero input').setChecked(true, { force: true });
  await p.locator('.at-frame', { hasText: 'Sour' }).click();
  ok((await facts(p)).includes('%0'), `0%: the drink is alcohol-free (${(await facts(p)).trim()})`);
  ok((await p.locator('.at-slot[data-slot="base"] .at-bottle').allTextContents()).every((s) => /Alkolsüz/i.test(s)), 'the base shelf holds only alcohol-free stand-ins');
  await p.locator('.at-zero input').setChecked(false, { force: true });

  // Şansına
  const name0 = await p.locator('.at-name').textContent();
  let changed = false;
  for (let k = 0; k < 4 && !changed; k++) {
    await p.locator('.at-actions .btn.ghost').click();
    changed = (await p.locator('.at-name').textContent()) !== name0;
  }
  ok(changed, '"Şansına" draws another drink, with a name in the world\'s voice');

  // the bartender's card
  await p.fill('#at-name', 'Kına Gecesi');
  await p.locator('.at-actions .btn:not(.ghost)').click();
  const card = p.locator('dialog.at-show[open]');
  await card.waitFor();
  ok((await card.locator('.at-show-name').textContent()) === 'Kına Gecesi', 'the card carries the guest\'s name for the drink');
  ok((await card.locator('.at-table input').inputValue()) === '7', 'the table number comes from the QR (?masa=7)');
  ok((await card.locator('.at-show-price b').textContent()).includes('880'), 'the card shows the line\'s price');
  const spec = await card.locator('.at-spec li').allTextContents();
  ok(spec.length >= 3 && spec.every((s) => /\d+(,\d)? (ml|dash)/.test(s)), `the spec is measured (${spec.join(' / ')})`);
  await card.locator('.at-show-close').click();
  await p.reload({ waitUntil: 'networkidle' });
  ok((await p.locator('.at-saved-chip').allTextContents()).some((s) => s.includes('Kına Gecesi')), 'after a refresh the drink is among "İmzaların"');

  // allergens left out on the menu stay out of the shelf
  await p.goto(`${BASE}/v/the-lagoon-hut`, { waitUntil: 'networkidle' });
  await p.click('.gm-prefs-btn');
  await p.locator('dialog.gm-sheet:not(.rc-sheet) .gm-al-opt', { hasText: 'Sert kabuklu' }).click();
  await p.locator('dialog.gm-sheet:not(.rc-sheet) .gm-al-opt', { hasText: 'Yumurta' }).click();
  await p.locator('dialog.gm-sheet:not(.rc-sheet) .gm-sheet-foot .btn:not(.ghost)').click();
  await p.locator('.gm-atelier a').click();
  await p.locator('.at-stage').waitFor();
  const shelf = await p.locator('.at-bottle').allTextContents();
  ok(!shelf.some((s) => /Orgeat|Badem/.test(s)), 'nuts left out: no orgeat on the Lagoon Hut\'s shelf');
  ok((await p.locator('.at-hidden').count()) === 1, 'the guest is told some bottles are off the shelf');
  ok((await p.locator('.at-foam').count()) === 0 || !(await p.locator('.at-foam').textContent()).includes('Yumurta'), 'egg left out: no egg-white foam');
  ok((await p.locator('.at-prefs .gm-active button').count()) === 2, 'the active preferences are shown, removable only by the guest');

  // English guest, Turkish bar: the card is for the bartender
  await p.goto(`${BASE}/v/the-blind-tiger/atelier?lang=en`, { waitUntil: 'networkidle' });
  ok((await p.locator('.wm-title').textContent()) === 'Design your own cocktail', 'EN: the Atelier speaks English');
  await p.locator('.at-actions .btn:not(.ghost)').click();
  const c2 = p.locator('dialog.at-show[open]');
  await c2.waitFor();
  ok((await c2.locator('.at-show-guest').textContent()).includes('Show this screen'), 'EN: the guest is told to show the screen');
  ok((await c2.getAttribute('lang')) === 'tr' && (await c2.locator('.at-show-how').textContent()).includes('çalkalanır'), 'EN: the card itself is in the bar\'s Turkish');

  // the old item address and a bar without the line
  const r = await p.goto(`${BASE}/v/le-grand-bar/kendi-kokteylin?lang=en`);
  ok(p.url().endsWith('/v/le-grand-bar/atelier?lang=en') && r.ok(), 'the line\'s own address leads to the Atelier');

  // the printed list: the line, its price, an honest note instead of strength and energy
  await p.goto(`${BASE}/yazdir/le-grand-bar`, { waitUntil: 'networkidle' });
  const pr = p.locator('.pr-item', { hasText: 'Kendi kokteylin' });
  ok(await pr.count() === 1 && (await pr.locator('.pr-price').textContent()).includes('880'), 'the printed list carries the line and its price');
  ok((await pr.locator('.pr-meta').textContent()).includes('Tarif misafirin'), 'the printed line explains its strength and energy depend on the recipe');

  ok(errors.length === 0, `no console errors${errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''}`);
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall passed');
  process.exit(fails ? 1 : 0);
})();
