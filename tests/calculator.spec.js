// Calcolatrice: conti giusti, errori chiari, e non copre mai l'esercizio.
const { test, expect } = require('@playwright/test');
const { W, watchErrors, startGame } = require('./helpers');

test('la calcolatrice fa i conti con la precedenza della scuola', async ({ page }) => {
  await page.goto('./');
  const r = await page.evaluate(() => ({
    a: calcEval('12*3+4').value,
    b: calcEval('2+3*4').value,
    c: calcEval('20-8/2').value,
    d: calcEval('7,5*2').value,
    e: calcEval('-5+2').value,
    f: calcEval('1/3').value,
    z: calcEval('7/0').error,
    t: calcEval('5+').error,
    show: calcShow('1234*5-6/2')
  }));
  expect(r.a).toBe(40);
  expect(r.b).toBe(14);
  expect(r.c).toBe(16);
  expect(r.d).toBe(15);
  expect(r.e).toBe(-3);
  expect(r.f).toBe(0.333333);
  expect(r.z).toContain('per 0');
  expect(r.t).toBeTruthy();
  expect(r.show).toBe('1.234 × 5 − 6 ÷ 2');
});

test('la calcolatrice si usa con i tasti e non copre i dialoghi', async ({ page }) => {
  const errors = watchErrors(page);
  await startGame(page);
  for (const inDuel of [false, true]) {
    await page.evaluate((d) => document.getElementById('app').classList.toggle('in-duel', d), inDuel);
    await page.click('[data-nav="calc"]');
    await expect(page.locator('#calc-panel')).toBeVisible();
    for (const k of ['C', '1', '2', '*', '3', '+', '4', '=']) {
      await page.click(`#calc-keys [data-ck="${k}"]`);
    }
    await expect(page.locator('#calc-display')).toHaveText('40');
    await expect(page.locator('#calc-last')).toHaveText('12 × 3 + 4 =');
    // Ogni tasto è dentro lo schermo e la calcolatrice finisce sopra i dialoghi.
    const box = await page.evaluate(() => {
      const p = document.getElementById('calc-panel').getBoundingClientRect();
      const d = document.getElementById('dialogue-area').getBoundingClientRect();
      const keys = [...document.querySelectorAll('.calc-key')].map(k => k.getBoundingClientRect());
      return { bottom: p.bottom, dialogTop: d.top, minKey: Math.min(...keys.map(k => k.height)), maxKeyBottom: Math.max(...keys.map(k => k.bottom)) };
    });
    expect(box.bottom).toBeLessThanOrEqual(box.dialogTop + 1);
    expect(box.maxKeyBottom).toBeLessThanOrEqual(box.bottom + 1);
    expect(box.minKey).toBeGreaterThanOrEqual(30);
    await expect(page.locator('#dialogue-text')).toBeVisible();
    // Divisione per zero: messaggio chiaro, poi si riparte.
    for (const k of ['C', '7', '/', '0', '=']) await page.click(`#calc-keys [data-ck="${k}"]`);
    await expect(page.locator('#calc-display')).toContainText('per 0');
    await page.click('.calc-close');
    await expect(page.locator('#calc-panel')).toBeHidden();
    await W(page, 100);
  }
  expect(errors).toEqual([]);
});
