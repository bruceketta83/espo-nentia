// Opzioni di lettura: testo grande, font per la dislessia, testo subito, lettura ad alta voce.
const { test, expect } = require('@playwright/test');
const { W, watchErrors, startGame } = require('./helpers');

test('le formule si leggono a parole, senza emoji', async ({ page }) => {
  await page.goto('./');
  const r = await page.evaluate(() => ({
    prod: speechText('Calcola: <span class="math-expr">2<sup>3</sup> · 2<sup>4</sup></span> 🍺'),
    quot: speechText('<span class="math-expr">7<sup>8</sup> : 7<sup>3</sup> = 7<sup>8−3</sup></span>'),
    pow: speechText('<span class="math-expr">(5<sup>2</sup>)<sup>3</sup></span>'),
    uni: speechText('Hai scelto 2⁷ ✨'),
    text: speechText('Ehi, frena! Non ti conosco.<br>Prima parla con <b>Vera</b>.')
  }));
  expect(r.prod).toBe('Calcola: 2 alla 3 per 2 alla 4.');
  expect(r.quot).toBe('7 alla 8 diviso 7 alla 3 uguale 7 alla 8 meno 3.');
  expect(r.pow).toBe('aperta parentesi 5 alla 2 chiusa parentesi alla 3.');
  expect(r.uni).toBe('Hai scelto 2 alla 7');
  expect(r.text).toBe('Ehi, frena! Non ti conosco. Prima parla con Vera.');
});

test('le opzioni di lettura si applicano, restano dopo il riavvio e non rompono la pagina', async ({ page }) => {
  const errors = watchErrors(page);
  // Voce finta: il test non ha altoparlanti.
  await page.addInitScript(() => {
    window.__spoken = [];
    if (window.speechSynthesis) {
      speechSynthesis.speak = (u) => { window.__spoken.push(u.text); setTimeout(() => u.onend && u.onend(), 10); };
      speechSynthesis.cancel = () => {};
    }
  });
  await startGame(page);
  await page.click('#btn-reading');
  await expect(page.locator('#modal-profile')).toHaveClass(/open/);
  await page.click('.read-opt:has-text("Molto grande")');
  await page.click('.read-opt:has-text("OpenDyslexic")');
  await page.click('.read-row:has-text("Più spazio") .read-opt:has-text("Sì")');
  await page.click('.read-row:has-text("Testo subito") .read-opt:has-text("Sì")');
  await page.click('.read-row:has-text("alta voce") .read-opt:has-text("Sì")');
  await page.click('.read-row:has-text("da solo") .read-opt:has-text("Sì")');
  await page.click('#modal-profile .close-modal');

  const html = await page.evaluate(() => ({
    cls: document.documentElement.className,
    zoom: getComputedStyle(document.documentElement).getPropertyValue('--read-zoom').trim(),
    font: getComputedStyle(document.querySelector('.dialogue-box')).fontFamily,
    fontReady: document.fonts.check('16px OpenDyslexic')
  }));
  expect(html.cls).toContain('font-dys');
  expect(html.cls).toContain('read-spacing');
  expect(html.cls).toContain('read-voice');
  expect(html.zoom).toBe('1.3');
  expect(html.font).toContain('OpenDyslexic');

  // Testo subito + lettura automatica di ogni dialogo.
  await page.evaluate(() => setDialogue('Aria', 'Prova', 'aria', 'Calcola <span class="math-expr">2<sup>3</sup> · 2<sup>4</sup></span>', 'aria'));
  expect(await page.locator('#dialogue-text .tw-h').count()).toBe(0);
  await W(page, 50);
  expect(await page.evaluate(() => window.__spoken.at(-1))).toBe('Calcola 2 alla 3 per 2 alla 4.');
  await expect(page.locator('#btn-listen')).toBeVisible();

  // Niente scorrimento orizzontale con testo molto grande sul telefono.
  const overflow = await page.evaluate(() => {
    const d = document.getElementById('dialogue-area');
    const hud = document.getElementById('hud');
    const nav = document.getElementById('bottom-nav');
    const listen = document.getElementById('btn-listen').getBoundingClientRect();
    return Math.max(d.scrollWidth - d.clientWidth, hud.scrollWidth - hud.clientWidth, nav.scrollWidth - nav.clientWidth,
      listen.right - window.innerWidth);
  });
  expect(overflow).toBeLessThanOrEqual(1);

  // Le opzioni restano dopo il riavvio, ma "Nuova partita" non le tocca.
  await page.reload();
  expect(await page.evaluate(() => document.documentElement.className)).toContain('font-dys');
  expect(await page.evaluate(() => readingPrefs().size)).toBe(2);
  expect(errors).toEqual([]);
});
