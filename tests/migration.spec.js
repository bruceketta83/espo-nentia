// Salvataggi vecchi: si caricano nel primo profilo senza perdere i progressi.
const { test, expect } = require('@playwright/test');
const { watchErrors } = require('./helpers');

test('un salvataggio v1 si carica nel profilo 1', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('./');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('esponentia_save_v1', JSON.stringify({
      currentArea: 3, unlockedArea: 3, aura: 500,
      unlockedRules: ['prod_same_base', 'quot_same_base', 'pow_of_pow'],
      crystals: AREAS.slice(0, 3).map(a => a.crystal), items: AREAS.slice(0, 3).map(a => a.item),
      completedAreas: [0, 1, 2], gameWon: false
    }));
  });
  await page.reload();
  await expect(page.locator('#save-info')).toContainText('Serra');
  await page.click('#btn-start');
  await page.waitForTimeout(2600);
  const s = await page.evaluate(() => ({ area: state.currentArea, cr: state.crystals.length, keys: Object.keys(localStorage).sort() }));
  expect(s.area).toBe(3);
  expect(s.cr).toBe(3);
  expect(s.keys).toEqual(['esponentia_profiles', 'esponentia_save_v2_p1']);
  expect(errors).toEqual([]);
});

// Il look di Aria non è più in vendita: l'Aura spesa torna indietro una volta sola.
test('il look di Aria comprato prima viene rimborsato', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('./');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('esponentia_save_v2', JSON.stringify({
      currentArea: 1, unlockedArea: 1, aura: 100,
      owned: ['tunic-viola', 'scarf-oro', 'hat-corona'],
      look: { tunic: 'viola', scarf: '#fbbf24', hat: 'corona' }
    }));
  });
  await page.reload();
  await page.click('#btn-start');
  await page.waitForTimeout(2600);
  const s = await page.evaluate(() => ({ aura: state.aura, owned: state.owned, look: state.look, aria: CHARS.aria.draw() }));
  expect(s.aura).toBe(100 + 80 + 90 + 300);
  expect(s.owned).toEqual([]);
  expect(s.look).toEqual({});
  expect(s.aria).toContain('img/chars/aria.webp');
  // Al secondo caricamento nessun rimborso in più.
  await page.reload();
  await page.click('#btn-start');
  await page.waitForTimeout(2600);
  expect(await page.evaluate(() => state.aura)).toBe(570);
  expect(errors).toEqual([]);
});
