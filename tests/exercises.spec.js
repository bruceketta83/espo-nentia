// Difficoltà adattiva e nuovi tipi di esercizio.
const { test, expect } = require('@playwright/test');
const { W, watchErrors, startGame } = require('./helpers');

test('ogni tipo di esercizio è coerente con la risposta giusta', async ({ page }) => {
  await page.goto('./');
  const problems = await page.evaluate(() => {
    const out = [];
    AREAS.forEach(area => [0, 1, 2].forEach(lvl => {
      for (let i = 0; i < 150; i++) {
        ['input', 'truefalse', 'error', 'build'].forEach(type => {
          const q = generateQuestion(area, lvl);
          if (!canUse(type, q)) return;
          convertQuestion(q, type);
          const tag = `${area.id}/${lvl}/${type}`;
          if (type === 'input' && q.answer !== String(q.ans.e !== undefined ? q.ans.e : q.ans.n)) out.push(`${tag}: risposta errata`);
          if (type === 'build' && (!q.bases.includes(q.ans.b) || !q.exps.includes(q.ans.e))) out.push(`${tag}: tessere senza la risposta`);
          if (type === 'error' && q.errOptions.filter(o => o.correct).length !== 1) out.push(`${tag}: ${q.errOptions.filter(o => o.correct).length} giuste`);
          if (type === 'error' && new Set(q.errOptions.map(o => o.text)).size !== q.errOptions.length) out.push(`${tag}: opzioni doppie`);
          if (type === 'error' && q.errOptions.some(o => MSG.meme67.includes(o.text))) out.push(`${tag}: meme tra le spiegazioni`);
          if (type === 'error' && q.errOptions.length < 3) out.push(`${tag}: troppo poche opzioni`);
          if (type === 'truefalse' && typeof q.claimTrue !== 'boolean') out.push(`${tag}: vero/falso senza soluzione`);
        });
      }
    }));
    return out.slice(0, 10);
  });
  expect(problems).toEqual([]);
});

test('il livello si adatta alle ultime risposte', async ({ page }) => {
  await page.goto('./');
  const lv = await page.evaluate(() => {
    const r = 'prod_same_base';
    state.recent = {};
    const start = ruleLevel(r);
    [0, 0, 1, 0].forEach(x => pushRecent(r, !!x));
    const weak = ruleLevel(r);
    state.recent = {};
    [1, 1, 1, 1, 1, 1].forEach(x => pushRecent(r, !!x));
    const strong = ruleLevel(r);
    return [start, weak, strong];
  });
  expect(lv).toEqual([1, 0, 2]);
});

test('i nuovi tipi si giocano con i pulsanti, anche con risposte sbagliate', async ({ page }) => {
  const errors = watchErrors(page);
  await startGame(page, { currentArea: 0, unlockedArea: 0, completedAreas: [0], unlockedRules: ['prod_same_base'], rooms: { 0: 'pontile' }, flags: { visited_0: true, cassa_ok: true, lav0: true } });
  for (const type of ['input', 'truefalse', 'error', 'build']) {
    await page.evaluate((t) => {
      const area = AREAS[0];
      startGuardianChallenge(area);
      duel.hearts = 3;
      duel.q = convertQuestion(generateQuestion(area, 1), t);
      duel.answered = false;
      renderQuestion();
    }, type);
    await page.click('#dialogue-text'); await W(page, 200);
    // Risposta sbagliata, fatta con l'interfaccia.
    if (type === 'input') {
      const wrong = await page.evaluate(() => String(Number(duel.q.answer) + 1));
      for (const k of [...wrong, 'OK']) await page.click(`.keypad-grid button[data-k="${k}"]`);
    } else if (type === 'truefalse') {
      await page.click(`.tf-grid button[data-v="${await page.evaluate(() => (duel.q.claimTrue ? 0 : 1))}"]`);
    } else if (type === 'error') {
      await page.evaluate(() => [...document.querySelectorAll('.error-list button')].find(b => !b._opt.correct).click());
    } else {
      await page.evaluate(() => {
        const b = duel.q.bases.find(x => x !== duel.q.ans.b);
        document.querySelector(`.tile[data-b="${b}"]`).click();
        document.querySelector(`.tile[data-e="${duel.q.exps[0]}"]`).click();
        document.querySelector('.build-ok').click();
      });
    }
    await W(page, 300);
    await expect(page.locator('.feedback-error'), type).toBeVisible();
    expect(await page.evaluate(() => duel.hearts), type).toBe(2);
    await page.click('.choice-btn:has-text("Prossima domanda")');
    await W(page, 300);
  }
  // Vero/falso: il tempo scade.
  await page.evaluate(() => {
    duel.q = convertQuestion(generateQuestion(AREAS[0], 1), 'truefalse');
    duel.q.seconds = 1;
    duel.answered = false;
    renderQuestion();
  });
  await W(page, 1800);
  await expect(page.locator('.feedback-error')).toContainText('Tempo scaduto');
  expect(errors).toEqual([]);
});
