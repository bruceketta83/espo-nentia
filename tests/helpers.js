// Funzioni comuni ai test: avvio partita, clic su oggetti, uscite, duelli.
const W = (page, ms) => page.waitForTimeout(ms);

/* Raccoglie gli errori JavaScript della pagina. */
function watchErrors(page) {
  const errors = [];
  page.on('pageerror', e => errors.push(`PAGEERR ${e.message}`));
  page.on('console', m => { if (m.type() === 'error') errors.push(`CONSOLE ${m.text()}`); });
  page.on('dialog', d => d.accept());
  return errors;
}

/* Apre il gioco con un salvataggio (o vuoto) e preme "Salpa". */
async function startGame(page, save = null) {
  await page.goto('./');
  await page.evaluate((sv) => {
    localStorage.clear();
    if (sv) localStorage.setItem('esponentia_save_v2', JSON.stringify(sv));
  }, save);
  await page.reload();
  await page.click('#btn-start');
  await W(page, 2600);
}

function game(page) {
  const idle = async () => {
    await page.waitForFunction(() => !busy && !document.querySelector('#fade.on'), null, { timeout: 15000 });
    await W(page, 120);
    await page.click('#dialogue-text');
    await W(page, 80);
  };
  const g = {
    idle,
    ev: (fn, arg) => page.evaluate(fn, arg),
    hs: async (id) => { await idle(); await page.click(`[data-hs="${id}"]`, { force: true }); await W(page, 300); },
    exit: async (id) => { await idle(); await page.click(`rect[data-exit="${id}"]`, { force: true }); await W(page, 700); await idle(); await W(page, 500); await idle(); },
    npc: async (role) => { await idle(); await page.click(`rect[data-role="${role}"]`, { force: true }); await W(page, 300); },
    bubble: async (label) => { await page.click(`#action-bubble button:has-text("${label}")`); await W(page, 300); await idle(); },
    choice: async (t) => { await idle(); await page.click(`.choice-btn:has-text("${t}")`); await W(page, 300); },
    contAll: async () => { while (await page.$('.choice-btn:has-text("Continua →")')) { await g.choice('Continua →'); } },
    read: async (id) => { await g.hs(id); await g.bubble('Leggi'); await g.choice('Ok, ho letto'); },
    useItem: async (name, target) => {
      await idle();
      await page.click('[data-nav="inventory"]');
      await W(page, 300);
      await page.click(`.inv-card:has(.inv-name:has-text("${name}")) .inv-use`);
      await W(page, 200);
      await page.click(target, { force: true });
      await W(page, 300);
      await idle();
    },
    code: async (digits) => {
      for (const k of [...String(digits), 'OK']) { await page.click(`.keypad-grid button[data-k="${k}"]`); await W(page, 100); }
      await W(page, 800);
    },
    correct: async () => {
      await idle();
      await page.evaluate(() => [...document.querySelectorAll('.math-choice')].find(b => b._opt && b._opt.correct).click());
      await W(page, 300);
    },
    lavinia: async () => { await g.hs('lavinia'); await g.choice('Accetta la sfida'); await g.correct(); await g.choice('Continua →'); await g.choice('Continua →'); },
    talkMentor: async () => { await g.npc('mentor'); await g.bubble('Parla'); await g.contAll(); },
    duel: async () => {
      for (let k = 0; k < 16; k++) {
        const st = await page.evaluate(() => (duel ? duel.answered : null));
        if (st === null) break;
        if (st) { await W(page, 400); continue; }
        await page.click('#dialogue-text');
        // Risponde giusto con qualunque tipo di esercizio (scelta, tastierino, vero/falso...).
        await page.evaluate(() => duel.solve());
        await W(page, 1900);
      }
      await W(page, 1500);
      await idle();
    },
    state: () => page.evaluate(() => ({
      area: state.currentArea,
      room: state.rooms[state.currentArea],
      crystals: state.crystals.length,
      done: state.completedAreas,
      items: state.items.map(i => i.id),
      quests: state.quests
    }))
  };
  return g;
}

module.exports = { W, watchErrors, startGame, game };
