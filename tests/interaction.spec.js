// In ogni stanza: i personaggi non si coprono tra loro né coprono gli oggetti,
// e ogni personaggio, oggetto e uscita si può toccare nel suo centro.
const { test, expect } = require('@playwright/test');
const { startGame } = require('./helpers');

/* Stati da provare: porte chiuse (lucchetti, comparse) e porte aperte. */
const STATES = [
  // Lavinia compare in tutte le aree (lav0…lav4): deve stare lontana da personaggi e oggetti.
  { name: 'porte chiuse', flags: { lav0_here: true, lav1_here: true, lav2_here: true, lav3_here: true, lav4_here: true } },
  { name: 'porte aperte', flags: { capanno_open: true, taverna_open: true, vivaio_open: true, botola_open: true, vivaio_luce: true, armadio_open: true } }
];

async function scanRooms(page, flags) {
  await startGame(page, { currentArea: 0, unlockedArea: 5, completedAreas: [], unlockedRules: [], flags });
  const rooms = await page.evaluate(() => AREAS.flatMap(a => Object.keys(areaRooms(a)).map(r => [a.id, r])));
  const found = [];
  for (const [a, r] of rooms) {
    await page.evaluate(([aa, rr]) => travelTo(aa, rr), [a, r]);
    await page.waitForTimeout(700);
    found.push(await page.evaluate((where) => {
      closeBubble();
      const area = AREAS[state.currentArea];
      const box = el => el.getBoundingClientRect();
      // Rettangolo "pieno" del personaggio: le immagini hanno bordi trasparenti, si stringe del 10% ai lati.
      const charRect = (id) => {
        const img = document.querySelector(`#${id} image`);
        if (!img) return null;
        const b = box(img); const dx = b.width * 0.1;
        return { id, l: b.left + dx, r: b.right - dx, t: b.top, b: b.bottom };
      };
      // Aria conta nella sua posizione di partenza della stanza.
      const chars = ['char-aria', 'char-mentor', 'char-guardian', ...[...document.querySelectorAll('#layer-props [id^="char-"]')].map(e => e.id)]
        .map(charRect).filter(Boolean);
      const hs = roomHotspots(area);
      // Oggetti: tutto ciò che si tocca, tranne i personaggi comparsa (es. Lavinia, Zia Turbina).
      const objects = hs.filter(h => h.box[2] && (h.draw || h.obj || !h.noDot) && !(h.draw && h.draw().includes('id="char-')))
        .map(h => { const b = box(document.querySelector(`rect[data-hs="${h.id}"]`)); return { id: h.id, l: b.left, r: b.right, t: b.top, b: b.bottom }; });
      const hit = (p, q) => p.l < q.r && q.l < p.r && p.t < q.b && q.t < p.b;
      const out = [];
      for (let i = 0; i < chars.length; i++) for (let j = i + 1; j < chars.length; j++)
        // Tra due personaggi resta almeno uno spazio di 12 pixel.
        if (hit({ ...chars[i], l: chars[i].l - 12, r: chars[i].r + 12 }, chars[j])) out.push(`${where}: personaggi ${chars[i].id} / ${chars[j].id} troppo vicini`);
      // Un personaggio "copre" un oggetto se ne nasconde almeno il 30% (gli sfondi grandi, come la nave, restano dietro).
      const area2 = (p, q) => Math.max(0, Math.min(p.r, q.r) - Math.max(p.l, q.l)) * Math.max(0, Math.min(p.b, q.b) - Math.max(p.t, q.t));
      chars.forEach(c => objects.forEach(o => {
        if (area2(c, o) > 0.3 * (o.r - o.l) * (o.b - o.t)) out.push(`${where}: personaggio ${c.id} copre l'oggetto ${o.id}`);
      }));
      // Due oggetti non si coprono (più del 30% del più piccolo).
      for (let i = 0; i < objects.length; i++) for (let j = i + 1; j < objects.length; j++) {
        const p = objects[i], q = objects[j];
        const small = Math.min((p.r - p.l) * (p.b - p.t), (q.r - q.l) * (q.b - q.t));
        if (area2(p, q) > 0.3 * small) out.push(`${where}: oggetti ${p.id} / ${q.id} sovrapposti`);
      }
            // Le scritte delle uscite non stanno sopra gli oggetti.
      roomExits(area).forEach(e => {
        const b = box(document.querySelector(`g[data-exit="${e.id}"] rect`));
        const lab = { l: b.left, r: b.right, t: b.top, b: b.bottom };
        objects.forEach(o => { if (hit(lab, o)) out.push(`${where}: la scritta dell'uscita ${e.id} copre l'oggetto ${o.id}`); });
      });
      // Toccabile: nel centro di ogni bersaglio il dito trova proprio quel bersaglio.
      const targets = [
        ...[...document.querySelectorAll('rect.hit[data-role]')].map(e => ({ el: e, key: 'role', id: e.dataset.role })),
        ...hs.filter(h => h.box[2]).map(h => ({ el: document.querySelector(`rect[data-hs="${h.id}"]`), key: 'hs', id: h.id })),
        // Uscite: si toccano sulla scritta (quella delle uscite laterali sta nell'angolo).
        ...roomExits(area).map(e => ({ el: document.querySelector(`g[data-exit="${e.id}"] rect`), key: 'exit', id: e.id }))
      ];
      targets.forEach(t => {
        const b = box(t.el);
        const x = b.left + b.width / 2, y = b.top + b.height / 2;
        const top = document.elementFromPoint(x, y);
        const owner = top && top.closest('[data-role],[data-hs],[data-exit]');
        const ok = owner && ((t.key === 'role' && owner.dataset.role === t.id) || (t.key === 'hs' && owner.dataset.hs === t.id) || (t.key === 'exit' && owner.dataset.exit === t.id));
        if (!ok) out.push(`${where}: ${t.key} ${t.id} non toccabile (sopra c'è ${owner ? (owner.dataset.role || owner.dataset.hs || owner.dataset.exit) : (top ? (top.id || top.className.baseVal || top.tagName) : 'niente')})`);
      });
      return out;
    }, `${a}/${r}`));
  }
  return found.flat();
}

for (const s of STATES) {
  test(`personaggi, oggetti e uscite: separati e toccabili (${s.name})`, async ({ page }) => {
    const problems = await scanRooms(page, s.flags);
    expect([...new Set(problems)]).toEqual([]);
  });
}
