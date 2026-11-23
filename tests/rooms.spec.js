// Tutte le stanze si aprono senza errori e gli oggetti sono nell'area visibile dei telefoni.
const { test, expect } = require('@playwright/test');
const { watchErrors, startGame } = require('./helpers');

test('ogni stanza di ogni area si carica senza errori', async ({ page }) => {
  const errors = watchErrors(page);
  await startGame(page, { currentArea: 0, unlockedArea: 5, completedAreas: [0, 1, 2, 3, 4], unlockedRules: [] });
  const rooms = await page.evaluate(() => AREAS.flatMap(a => Object.keys(areaRooms(a)).map(r => [a.id, r])));
  expect(rooms.length).toBeGreaterThanOrEqual(15);
  for (const [a, r] of rooms) {
    await page.evaluate(([aa, rr]) => travelTo(aa, rr), [a, r]);
    await page.waitForTimeout(700);
    const banner = await page.textContent('#location-banner');
    expect(banner.length, `banner ${a}/${r}`).toBeGreaterThan(3);
    expect(await page.locator('#scene-svg #char-aria').count(), `Aria in ${a}/${r}`).toBe(1);
  }
  expect(errors).toEqual([]);
});

test('nessun oggetto è fuori dall’area visibile sui telefoni stretti', async ({ page }) => {
  await page.goto('./');
  const outside = await page.evaluate(() => {
    const res = [];
    AREAS.forEach(a => Object.entries(areaRooms(a)).forEach(([rid, r]) => (r.hotspots || []).forEach(h => {
      const [x, , w] = h.box;
      if (!w) return;
      const cx = x + w / 2;
      if (cx < 50 || cx > 350) res.push(`${a.id}/${rid}/${h.id}`);
    })));
    return res;
  });
  // La nave di Vera è grande: il suo centro è visibile.
  expect(outside.filter(id => !id.endsWith('/nave'))).toEqual([]);
});

// Scritte delle uscite, nomi dei personaggi e puntini non si coprono: si sceglie bene col dito.
test('le scritte e i puntini cliccabili non si sovrappongono', async ({ page }) => {
  const problems = [];
  // Prima con le porte chiuse (lucchetti visibili), poi aperte (tutte le uscite insieme).
  const open = { capanno_open: true, taverna_open: true, vivaio_open: true, botola_open: true, vivaio_luce: true };
  for (const flags of [{}, open]) {
  await startGame(page, { currentArea: 0, unlockedArea: 5, completedAreas: [], unlockedRules: [], flags });
  const rooms = await page.evaluate(() => AREAS.flatMap(a => Object.keys(areaRooms(a)).map(r => [a.id, r])));
  for (const [a, r] of rooms) {
    await page.evaluate(([aa, rr]) => travelTo(aa, rr), [a, r]);
    await page.waitForTimeout(700);
    const found = await page.evaluate((where) => {
      const pick = (sel, kind) => [...document.querySelectorAll(sel)].map(el => {
        const b = el.getBoundingClientRect();
        const host = el.closest('[data-exit],[data-hs],.label');
        return { kind, id: host.dataset.exit || host.dataset.hs || host.id, l: b.left, t: b.top, r: b.right, b: b.bottom };
      });
      const items = [
        ...pick('#layer-ui g[data-exit] > g', 'uscita'),
        ...pick('#layer-ui g[data-hs] circle', 'puntino'),
        ...pick('#layer-ui .label circle', 'avviso')
      ];
      const gap = 6; // pixel minimi tra due elementi: spazio per il dito
      const out = [];
      for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
        const p = items[i], q = items[j];
        if (p.l < q.r + gap && q.l < p.r + gap && p.t < q.b + gap && q.t < p.b + gap) out.push(`${where}: ${p.kind} ${p.id} / ${q.kind} ${q.id}`);
      }
      return out;
    }, `${a}/${r}`);
    problems.push(...found);
  }
  }
  expect([...new Set(problems)]).toEqual([]);
});

// Le uscite verso un'altra area dicono dove portano (es. "🌉 Officina ➜", non "Ponte ➜").
test('le uscite verso altre aree hanno il nome della destinazione', async ({ page }) => {
  await page.goto('./');
  const wrong = await page.evaluate(() => {
    const names = { 0: ['Molo'], 1: ['Piazza', 'Taverna'], 2: ['Torre', 'Belvedere'], 3: ['Serra'], 4: ['Officina'], 5: ['Faro'] };
    const out = [];
    AREAS.forEach(a => Object.entries(areaRooms(a)).forEach(([rid, r]) => (r.exits || []).forEach(e => {
      if (e.toArea === undefined || e.toArea === a.id) return;
      if (!names[e.toArea].some(n => e.label.includes(n))) out.push(`${a.id}/${rid}: "${e.label}" → area ${e.toArea}`);
    })));
    return out;
  });
  expect(wrong).toEqual([]);
});
