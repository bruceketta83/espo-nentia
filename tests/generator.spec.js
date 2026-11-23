// Generatore di esercizi: 4 opzioni, una sola giusta, nessuna "sbagliata" equivalente alla giusta.
const { test, expect } = require('@playwright/test');

test('ogni esercizio generato è corretto', async ({ page }) => {
  await page.goto('./');
  const problems = await page.evaluate(() => {
    const sup = { '⁰': 0, '¹': 1, '²': 2, '³': 3, '⁴': 4, '⁵': 5, '⁶': 6, '⁷': 7, '⁸': 8, '⁹': 9 };
    const val = (t) => {
      const m = t.match(/^(\d+)([⁰¹²³⁴⁵⁶⁷⁸⁹]*)$/);
      if (!m) return null;
      const e = m[2] ? Number([...m[2]].map(c => sup[c]).join('')) : 1;
      return BigInt(m[1]) ** BigInt(e);
    };
    const out = [];
    AREAS.forEach(area => {
      for (let i = 0; i < 2000; i++) {
        const q = generateQuestion(area);
        const right = q.options.filter(o => o.correct);
        if (q.options.length !== 4) out.push(`area ${area.id}: ${q.options.length} opzioni`);
        if (right.length !== 1) out.push(`area ${area.id}: ${right.length} giuste`);
        if (!q.prompt || !q.steps) out.push(`area ${area.id}: testo mancante`);
        const cv = right[0] && right[0].text !== '0⁰' ? val(right[0].text) : null;
        q.options.filter(o => !o.correct).forEach(o => {
          if (!o.msg) out.push(`area ${area.id}: manca spiegazione per ${o.text}`);
          const v = val(o.text);
          if (v !== null && cv !== null && v === cv) out.push(`area ${area.id}: ${o.text} vale come ${right[0].text}`);
        });
      }
    });
    return out.slice(0, 10);
  });
  expect(problems).toEqual([]);
});

test('i numeri degli enigmi sono casuali per profilo e coerenti', async ({ page }) => {
  await page.goto('./');
  const res = await page.evaluate(() => {
    const seen = new Set();
    for (let i = 0; i < 20; i++) {
      state.puz = {};
      const m = P_molo();
      seen.add(`${m.a}-${m.b}`);
      const b = P_botti();
      const ok = b.kegs.filter(k => k.ok);
      if (ok.length !== 1 || ok[0].m - ok[0].n !== b.k) return 'botti incoerenti';
      if (b.kegs.some(k => !k.ok && k.m - k.n === b.k)) return 'due botti giuste';
    }
    return seen.size;
  });
  expect(typeof res).toBe('number');
  expect(res).toBeGreaterThan(3);
});
