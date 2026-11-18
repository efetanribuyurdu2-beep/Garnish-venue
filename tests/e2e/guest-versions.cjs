// Guest flow acceptance, through the real UI (TR and EN): menu preferences → "Suggest a drink" → the drink (sheet over the menu)
// → refresh (full page) → switch versions → back to the menu → nothing fits → an old link without ?v=.
// Needs a production server on :3200 (npm run build && npx next start -p 3200); the surum-testi cases need local
// Supabase with supabase/fixtures/surum-testi.sql, the le-grand-bar cases run on the demo data. Run: npm run test:e2e
const { chromium } = require('playwright');
const BASE = 'http://localhost:3200';
let fails = 0;
const ok = (c, msg) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${msg}`); if (!c) fails++; };
const CASES = [
  { lang: 'tr', bar: 'surum-testi', avoid: 'Sert kabuklu meyveler', expect: ['Sake Highball', 'Whiskey Sour'], open: 'Sake Highball', more: ['Sülfitler', 'Yumurta'], zeroTab: 'Alkolsüz', strength: 'Alkol' },
  { lang: 'en', bar: 'surum-testi', avoid: 'Sulphites', expect: ['Chartreuse Swizzle', 'Whiskey Sour'], open: 'Chartreuse Swizzle', more: ['Tree nuts', 'Egg'], zeroTab: 'Alcohol-free', strength: 'Strength' },
  { lang: 'tr', bar: 'le-grand-bar', avoid: 'Sülfitler', zeroTab: 'Alkolsüz', strength: 'Alkol' },
  { lang: 'en', bar: 'le-grand-bar', avoid: 'Sulphites', zeroTab: 'Alcohol-free', strength: 'Strength' },
];
const prefsDialog = 'dialog.gm-sheet:not(.rc-sheet)';
async function setPrefs(p, zero, avoids) {
  await p.click('.gm-prefs-btn');
  const d = p.locator(prefsDialog);
  if (zero !== null) await d.locator('.gm-switch input').first().setChecked(zero, { force: true });
  for (const a of avoids) await d.locator('.gm-al-opt', { hasText: a }).click();
  await d.locator('.gm-sheet-foot .btn:not(.ghost)').click();
}
const cards = (p) => p.$$eval('.gm-item', (els) => els.map((e) => ({ kind: e.dataset.kind, version: e.dataset.version, name: e.querySelector('.gm-name').textContent.trim(), price: e.querySelector('.gm-price').textContent.trim(), zero: !!e.querySelector('.gm-badge'), al: [...e.querySelectorAll('.gm-allergens svg title')].map((t) => t.textContent), href: e.querySelector('a').getAttribute('href') })));
async function detail(p, root) {
  const c = p.locator(`${root} .gi-label-card`);
  await c.waitFor();
  return {
    version: await c.getAttribute('data-version'),
    tab: (await p.locator(`${root} [role=tab][aria-selected=true], ${root} .gi-version-name`).allTextContents())[0] ?? '',
    price: (await c.locator('.gi-price-row .gi-price').textContent()).trim(),
    strip: Object.fromEntries(await c.locator('.gi-strip > div').evaluateAll((ds) => ds.map((d) => [d.querySelector('dt').textContent, d.querySelector('dd').textContent]))),
    allergens: (await c.locator('.gi-allergens li').allTextContents()).map((s) => s.trim()),
    desc: (await p.locator(`${root} .gi-desc`).evaluateAll((ps) => ps.filter((x) => x.offsetParent !== null).map((x) => x.textContent.trim())))[0],
    page: await p.locator(`${root} .gi`).first().getAttribute('data-version'),
    langLinks: await p.locator('.venue-langs a').evaluateAll((as) => as.map((a) => a.getAttribute('href'))),
  };
}
(async () => {
  const b = await chromium.launch();
  for (const C of CASES) {
    console.log(`\n── ${C.bar} · ${C.lang.toUpperCase()} · 0% + leave out ${C.avoid}`);
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
    const p = await ctx.newPage();
    const errs = []; p.on('console', (m) => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', (e) => errs.push(String(e)));
    await p.goto(`${BASE}/v/${C.bar}?lang=${C.lang}`, { waitUntil: 'networkidle' });
    const all = await cards(p);
    await setPrefs(p, true, [C.avoid]);
    const menu = await cards(p);
    ok(menu.length > 0 && menu.every((c) => (c.zero || c.kind === 'food') && !c.al.includes(C.avoid)), `menu: ${menu.length} cards (${menu.filter((c) => c.kind === 'food').length} dishes), every drink 0%, none with ${C.avoid}`);
    ok(menu.every((c) => c.href.includes(`lang=${C.lang}`) && c.href.includes('v=zero') === (c.version === 'zero')), `cards link to their version (${menu.filter((c) => c.version === 'zero').length} with ?v=zero) and keep the language`);
    if (C.expect) ok(JSON.stringify(menu.map((c) => c.name)) === JSON.stringify(C.expect), `menu shows exactly ${C.expect.join(', ')} (judged on the 0% recipe's allergens)`);
    // suggestion
    await p.click('.rc-invite .btn');
    const rc = p.locator('dialog.rc-sheet[open]');
    ok((await rc.locator('.rc-prefs').textContent().catch(() => '')).includes(C.avoid), 'suggestion sheet shows the inherited allergen preference');
    ok(await rc.locator('.gm-switch input').isChecked(), 'suggestion sheet: 0% switch inherited from the menu');
    await rc.locator('.rc-mood').first().click();
    const picks = await rc.locator('.rc-pick').evaluateAll((ls) => ls.map((l) => ({ name: l.querySelector('.rc-name').textContent.trim(), price: l.querySelector('.rc-price').textContent.trim(), version: l.dataset.version, desc: l.querySelector('.rc-desc').textContent.trim(), href: l.getAttribute('href'), zero: !!l.querySelector('.gm-badge'), al: [...l.querySelectorAll('svg title')].map((t) => t.textContent) })));
    ok(picks.length > 0 && picks.every((x) => x.zero && !x.al.includes(C.avoid)), `${picks.length} suggestions, every one 0% and without ${C.avoid}: ${picks.map((x) => `${x.name} ${x.price} [${x.al.join(',') || '-'}]`).join(' · ')}`);
    ok(picks.every((x) => menu.find((c) => c.name === x.name && c.price === x.price)), 'each suggestion has the price its card shows');
    if (C.expect) {
      ok(picks.length === 2, 'two fit → two suggested');
      ok(await rc.locator('.rc-fewer').isVisible(), `says so: "${(await rc.locator('.rc-fewer').textContent().catch(() => '')).trim()}"`);
    }
    const target = picks.find((x) => x.version === 'zero' && (!C.open || x.name === C.open)) ?? picks[0];
    await rc.locator('.rc-pick', { hasText: target.name }).click();
    const m = await detail(p, '.gi-sheet');
    ok(p.url().includes('v=zero') === (target.version === 'zero') && p.url().includes(`lang=${C.lang}`), `opened over the menu: ${p.url().replace(BASE, '')}`);
    ok(m.version === target.version && m.tab.startsWith(C.zeroTab), `sheet opens on "${m.tab}"`);
    ok(m.price === target.price, `sheet price ${m.price} = suggested ${target.price}`);
    ok(m.desc === target.desc && m.page === m.version, `sheet description is the same version's: "${m.desc}"`);
    ok(m.strip[C.strength] === '0%' && !m.allergens.some((a) => a.includes(C.avoid)), `sheet: ${C.strength} ${m.strip[C.strength]}, allergens [${m.allergens.join(', ') || '-'}]`);
    // refresh: the same address, now the full page
    await p.reload({ waitUntil: 'networkidle' });
    const f = await detail(p, '.venue-main');
    ok(f.version === m.version && f.price === m.price && JSON.stringify(f.allergens) === JSON.stringify(m.allergens) && f.strip[C.strength] === m.strip[C.strength], `after refresh: same version (${f.version}), price ${f.price}, allergens, strength`);
    ok(f.langLinks.every((h) => h.includes('v=zero') === (target.version === 'zero')), `language links keep the version: ${f.langLinks.join(' ')}`);
    if (target.version === 'zero') {
      await p.locator('.venue-main [role=tab][data-version=original]').click();
      const o = await detail(p, '.venue-main');
      ok(!p.url().includes('v=zero') && o.version === 'original' && o.page === 'original' && o.desc !== f.desc && o.strip[C.strength] !== '0%', `switching to the original: address ${p.url().replace(BASE, '')}, "${o.desc}", ${o.strip[C.strength]}, ${o.price}`);
      await p.reload({ waitUntil: 'networkidle' });
      ok((await detail(p, '.venue-main')).version === 'original', 'refresh after switching keeps the original');
      await p.locator('.venue-main [role=tab][data-version=zero]').click();
      ok(p.url().includes('v=zero'), 'and back to 0%: the address follows');
    }
    // back to the menu
    await p.click('.gi-back');
    await p.waitForURL((u) => u.pathname === `/v/${C.bar}`);
    await p.waitForSelector('.gm-active');
    const pills = (await p.locator('.gm-active button').allTextContents()).join(' | ');
    const back = await cards(p);
    ok(pills.includes('0%') && pills.includes(C.avoid) && JSON.stringify(back.map((c) => c.name)) === JSON.stringify(menu.map((c) => c.name)), `back on the menu, preferences kept (${pills.replace(/\s+/g, ' ')}), same ${back.length} cards`);
    if (C.more) {
      await setPrefs(p, null, C.more);
      await p.click('.rc-invite .btn');
      await rc.locator('.rc-mood').first().click();
      const none = (await rc.locator('.rc-none').textContent().catch(() => '')).trim();
      ok(none.length > 0 && (await rc.locator('.rc-pick').count()) === 0, `nothing fits → says so: "${none}"`);
      await rc.locator('.gm-x').click();
      const after = (await p.locator('.gm-active button').count());
      ok(after === 2 + C.more.length, `preferences left as chosen (${after} active), nothing loosened`);
    }
    // an old link without a version opens the original, as before
    const q = await ctx.newPage();
    await q.goto(`${BASE}/v/${C.bar}/${encodeURIComponent((all.find((a) => a.name === target.name) || {}).href?.split('/').pop().split('?')[0] || '')}?lang=${C.lang}`, { waitUntil: 'networkidle' });
    const legacy = await detail(q, '.venue-main');
    ok(legacy.version === 'original' && legacy.price === all.find((a) => a.name === target.name).price, `old link without ?v= opens the original: ${legacy.tab} ${legacy.price}`);
    if (C.bar === 'le-grand-bar') ok(picks.some((x) => x.version === 'zero'), `demo data: at least one suggestion is a 0% version of a drink (${picks.filter((x) => x.version === 'zero').map((x) => x.name).join(', ')})`);
    ok(errs.length === 0, `no console errors${errs.length ? ': ' + errs.slice(0, 2).join(' | ') : ''}`);
    await ctx.close();
  }
  await b.close();
  console.log(`\n${fails ? fails + ' FAILED' : 'all passed'}`);
  process.exit(fails ? 1 : 0);
})();
