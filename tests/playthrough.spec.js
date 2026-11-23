// Partita completa: tutte le aree, enigmi con numeri casuali, missioni con ritorni.
const { test, expect } = require('@playwright/test');
const { W, watchErrors, startGame, game } = require('./helpers');

test('partita completa dal Molo al Faro, con ritorni e negozio', async ({ page }) => {
  test.setTimeout(20 * 60_000);
  const errors = watchErrors(page);
  await startGame(page);
  const g = game(page);

  // MOLO
  await g.talkMentor(); await g.choice('Continua a esplorare');
  await g.hs('doblone1');
  await g.exit('to-pontile');
  await g.choice('Accetta la sfida'); await g.correct(); await g.choice('Continua →'); await g.choice('Continua →');
  await g.read('bacheca');
  await g.exit('to-spiaggia');
  await g.hs('lucchetto'); await g.bubble('Codice'); await g.code(await g.ev(() => P_molo().a + P_molo().b));
  expect(await g.ev(() => flag('capanno_open'))).toBe(true);
  await g.exit('to-capanno');
  await g.hs('corda'); await g.bubble('Prendi');
  await g.hs('bul2');
  await g.read('diario1');
  await g.read('poster');
  await g.exit('to-spiaggia2'); await g.read('bottiglia'); await g.exit('to-pontile');
  await g.useItem('Corda', '[data-hs="cassa-acqua"]');
  await g.npc('guardian'); await g.bubble('Sfida'); await g.duel();
  expect((await g.state()).done).toEqual([0]);
  await g.choice('Prosegui verso'); await W(page, 1500);

  // PIAZZA + TAVERNA
  await g.idle();
  expect(await page.textContent('#location-banner')).toContain('Piazza');
  await g.hs('turbina'); await g.bubble('Parla'); await g.choice('Fammi vedere'); await W(page, 300);
  await page.click('.cons-item:has-text("Cuore extra")'); await W(page, 300);
  await page.click('#modal-shop .close-modal'); await W(page, 300);
  await g.choice('Ciao ciao');
  await g.exit('to-strada');
  await g.hs('coin2');
  await g.read('volantino');
  await g.useItem('Chiave della Taverna', '[data-hs="porta"]');
  await g.exit('to-sala');
  await g.talkMentor(); await g.choice('Continua a esplorare');
  await g.lavinia();
  await g.hs('botti'); await g.bubble('Apri');
  const letter = await g.ev(() => P_botti().kegs.find(k => k.ok).l);
  await page.click(`.math-choice:has-text("${letter}:")`); await W(page, 1200);
  await g.hs('mug2');
  await g.read('diario2');
  await g.useItem('Dadi', 'rect[data-role="guardian"]');
  await g.choice('Sfida i Gemelli'); await W(page, 500);
  expect(await g.ev(() => duel.hearts)).toBe(4);
  await g.duel();
  await g.choice('Prosegui verso'); await W(page, 1500);

  // TORRE
  await g.hs('bul3');
  await g.talkMentor(); await g.choice('Continua a esplorare');
  await g.lavinia();
  await g.useItem('Cannocchiale', 'rect[data-role="mentor"]'); await g.choice('Continua a esplorare');
  await g.exit('to-biblioteca');
  await g.read('lavagna');
  await g.hs('armadio'); await g.bubble('Codice'); await g.code(await g.ev(() => P_torre().m * P_torre().n));
  await g.read('arenario');
  await g.hs('mug1');
  await g.read('diario3');
  await g.exit('to-terrazza');
  await g.useItem('Scheda', 'rect[data-role="guardian"]');
  await g.choice('Inizia il test'); await g.duel();
  await g.exit('to-belvedere');
  expect(await page.textContent('#location-banner')).toContain('Belvedere');
  await g.exit('bv-serra');

  // SERRA
  await g.talkMentor(); await g.choice('Continua a esplorare');
  await g.lavinia();
  await g.hs('mug3');
  await g.read('cartello');
  await g.hs('porta-vivaio'); await g.bubble('Codice'); await g.code(await g.ev(() => P_serra().b + 2));
  await g.exit('to-vivaio');
  await g.useItem('Lente Stellare', '[data-hs="lucernario"]');
  await g.hs('annaffiatoio');
  await g.read('poster-batteri');
  await g.read('diario4');
  await g.exit('to-giardino');
  await g.useItem('Annaffiatoio', 'rect[data-role="guardian"]');
  await g.choice('Sfida la Pianta'); await g.duel();
  await g.exit('r-4-magazzino');

  // OFFICINA (dal ponte)
  await g.hs('bilancia'); await g.bubble('Prova');
  const bt = await g.ev(() => { const P = P_bilancia(); return `${P.a * P.b}${P.n}`; });
  await page.evaluate((t) => [...document.querySelectorAll('.math-choice')].find(b => b.textContent.trim() === t).click(), bt);
  await W(page, 1200);
  await g.read('manuale');
  await g.useItem('Seme Luminescente', '[data-hs="vaso"]');
  await g.hs('rete'); await g.bubble('Prendi');
  await g.exit('to-officina');
  await g.hs('bul1');
  await g.talkMentor(); await g.choice('Consegna'); await g.choice('Continua a esplorare');
  await g.lavinia();
  await g.useItem('Ingranaggio', 'rect[data-role="guardian"]');
  await g.choice('Sfida l’Automa'); await g.duel();
  await g.choice('Prosegui verso'); await W(page, 1500);

  // FARO
  await g.read('graffito');
  await g.read('diario5');
  await g.useItem('Chiave Inglese', '[data-hs="botola"]');
  await g.exit('to-cima');
  await g.npc('guardian'); await g.bubble('Sfida'); await g.duel();
  await g.choice('Accendi il Faro'); await W(page, 1200); await g.idle();
  expect(await g.ev(() => state.gameWon)).toBe(true);
  expect(await g.ev(() => document.querySelector('#scene-svg').classList.contains('lit'))).toBe(true);

  // RITORNI CON IL VIAGGIO RAPIDO
  await page.click('[data-nav="map"]'); await W(page, 400);
  await page.click('.map-node[data-node="taverna"]', { force: true }); await W(page, 500);
  expect(await g.ev(() => state.currentArea)).toBe(5);
  await page.click('.map-node[data-node="molo"]', { force: true }); await W(page, 2600); await g.idle();
  await g.exit('to-pontile');
  await g.useItem('Rete', '[data-hs="doblone-mare"]');
  await g.exit('to-spiaggia');
  await g.npc('mentor'); await g.bubble('Parla'); await g.choice('Consegna'); await g.choice('Continua a esplorare');
  await page.click('[data-nav="map"]'); await W(page, 400);
  await page.click('.map-node[data-node="piazza"]', { force: true }); await W(page, 2600); await g.idle();
  await g.exit('to-strada'); await g.exit('to-sala');
  await g.npc('mentor'); await g.bubble('Parla'); await g.choice('Consegna'); await g.choice('Continua a esplorare');

  const s = await g.state();
  expect(s.crystals).toBe(5);
  expect(Object.values(s.quests).every(q => q === 'done')).toBe(true);
  expect(await g.ev(() => state.curiosities.length)).toBe(await g.ev(() => Object.keys(CURIOSITIES).length));
  expect(errors).toEqual([]);
});
