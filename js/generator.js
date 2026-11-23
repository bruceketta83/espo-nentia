/* ==========================================================================
   GENERATORE DI ESERCIZI
   Ogni regola ha un generatore. Le risposte sbagliate nascono dagli
   errori tipici degli studenti, con un messaggio che spiega l'errore.
   ========================================================================== */
const SUPMAP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };

function toSup(n) { return String(n).split('').map(c => SUPMAP[c] || c).join(''); }
function P(b, e) { return `${b}<sup>${e}</sup>`; }
function M(html) { return `<span class="math-expr">${html}</span>`; }
function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

/* Mescolamento uniforme (Fisher-Yates). */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* Opzioni di risposta. val = valore numerico (BigInt) per scartare
   le risposte "sbagliate" che in realtà valgono come quella giusta. */
function optPow(b, e, msg) {
  if (e < 0 || b < 0) return null;
  return { text: `${b}${toSup(e)}`, val: BigInt(b) ** BigInt(e), msg, b, e };
}
function optNum(n, msg) { return { text: String(n), val: BigInt(n), msg, n }; }
function optText(t, msg) { return { text: t, val: null, msg }; }

function assemble(correct, wrongs) {
  const out = [{ ...correct, correct: true }];
  const texts = new Set([correct.text]);
  const vals = new Set(correct.val !== null ? [correct.val] : []);
  for (const w of wrongs) {
    if (!w || out.length >= 4) continue;
    if (texts.has(w.text)) continue;
    if (w.val !== null && vals.has(w.val)) continue;
    texts.add(w.text);
    if (w.val !== null) vals.add(w.val);
    out.push({ ...w, correct: false });
  }
  return out;
}

/* --------------------------------------------------------------------------
   MESSAGGI DI ERRORE (stile pop)
   -------------------------------------------------------------------------- */
const MSG = {
  multExp: [
    'Bro, hai moltiplicato gli esponenti! Con la stessa base gli esponenti si SOMMANO.',
    'Nemmeno Fabri Fibra nei testi più paranoici moltiplicherebbe questi esponenti! Stessa base = esponenti SOMMATI.',
    'Cringe alert: esponenti moltiplicati. Con il PER tra potenze della stessa base si SOMMANO!',
    'Red flag: esponenti moltiplicati! Con la stessa base e il PER, gli esponenti si SOMMANO.'
  ],
  multBase: [
    'Hai moltiplicato le basi! Le basi restano ferme come Marracash sul trono.',
    'Le basi non si toccano, sono intoccabili! Somma solo gli esponenti.',
    'No no no, la base non cambia! Base ferma, esponenti sommati.',
    'Base cambiata? Sus. La base resta uguale, sommi solo gli esponenti.',
    'La base resta uguale, come un ritornello di Annalisa che non esce dalla testa. Somma solo gli esponenti!'
  ],
  sumInsteadSub: [
    'Hai sommato invece di sottrarre! C’è il simbolo di DIVISO (:), non per!',
    'Plot twist: era un DIVISO! Con il diviso gli esponenti si SOTTRAGGONO.',
    'Occhio al segno! DIVISO = esponenti SOTTRATTI.',
    'Chillati e rileggi il segno: è un DIVISO. Gli esponenti si SOTTRAGGONO.',
    'Nemmeno Olly sul palco di Sanremo sbaglierebbe questo segno: con il DIVISO gli esponenti si SOTTRAGGONO.'
  ],
  sumInsteadMult: [
    'Hai sommato gli esponenti! Nella potenza di potenza si MOLTIPLICANO.',
    'Errore di sistema! Potenza di potenza = esponenti MOLTIPLICATI, non sommati.',
    'Quella è la regola del prodotto, non della potenza di potenza! Qui si MOLTIPLICA.',
    'POV: hai usato la regola sbagliata. Potenza di potenza = esponenti MOLTIPLICATI.',
    'Anna lo direbbe a ritmo: potenza di potenza, esponenti MOLTIPLICATI!'
  ],
  zeroIsZero: [
    'Cringe! Un numero elevato a zero non fa zero, fa UNO!',
    'Zero drama: qualsiasi numero (tranne 0) elevato a 0 fa 1, non 0!',
    'Esponente 0 ≠ risultato 0. Il risultato è sempre 1!',
    'Pensare che a<sup>0</sup> faccia 0 è un po’ delulu. Fa sempre 1 (con a diverso da 0)!',
    'Angelina Mango canta “La noia”, ma qui la noia è sbagliare: elevato a 0 fa 1!'
  ],
  meme67: [
    'Six seven?! Ma che stai facendo, il balletto su TikTok?! Concentrati!',
    'Ancora con sto six seven?! Il meme è valido, la risposta no.',
    '6-7 rilevato 🤖. Meme approvato, risposta bocciata.',
    'Six seven a random? Raga, concentrazione: rifai il calcolo.'
  ],
  close: [
    'Quasi! Ricontrolla il calcolo dell’esponente.',
    'Ci sei quasi! Rifai il conto con calma.',
    'Vicina, ma non basta! Ricontrolla l’esponente.',
    'Boh, quasi! Chillati e rifai il conto dell’esponente.'
  ]
};

function maybeMeme(wrongs) {
  if (Math.random() < 0.25) wrongs.splice(1, 0, optPow(6, 7, pick(MSG.meme67)));
}

/* --------------------------------------------------------------------------
   REGOLA 1: prodotto con la stessa base
   -------------------------------------------------------------------------- */
/* lvl: 0 = facile, 1 = medio, 2 = sfida (difficoltà adattiva). */
function genProd(lvl = 1) {
  const a = pick([[2, 3, 5], [2, 3, 5, 7, 10], [3, 5, 7, 10, 11]][lvl]);
  const three = Math.random() < [0, 0.4, 0.75][lvl];
  const hi = [5, 7, 9][lvl];
  const exps = three ? [rnd(2, hi - 2), rnd(1, 4), rnd(2, hi - 2)] : [rnd(2, hi), rnd(2, hi)];
  if (three && Math.random() < 0.5) exps[1] = 1;
  const sum = exps.reduce((s, e) => s + e, 0);
  const prod = exps.reduce((s, e) => s * e, 1);
  const hasOne = exps.includes(1);
  const terms = exps.map(e => (e === 1 ? `${a}` : P(a, e))).join(' · ');
  const intro = pick(['Calcola il prodotto:', 'Riduci a una sola potenza:', 'Unisci il carico:']);
  const prompt = `${intro} ${M(terms)}` + (hasOne ? ` (ricorda: ${a} = ${P(a, 1)})` : '');
  const sumTxt = exps.join(' + ');

  const wrongs = [
    optPow(a, prod, pick(MSG.multExp)),
    a ** exps.length <= 1000 ? optPow(a ** exps.length, sum, pick(MSG.multBase)) : null,
    hasOne ? optPow(a, sum - 1, `Hai dimenticato l’esponente 1 nascosto nel ${a} da solo! ${sumTxt} = ${sum}.`) : null,
    optPow(a, sum + 1, `${pick(MSG.close)} ${sumTxt} = ${sum}.`),
    optPow(a, sum - 1, `${pick(MSG.close)} ${sumTxt} = ${sum}.`),
    optPow(a, sum + 2, `${pick(MSG.close)} ${sumTxt} = ${sum}.`)
  ];
  maybeMeme(wrongs);

  return {
    ruleId: 'prod_same_base',
    expr: terms,
    prompt,
    steps: `${exps.map(e => P(a, e)).join(' · ')} = ${P(a, exps.join('+'))} = ${P(a, sum)}`,
    options: assemble(optPow(a, sum), wrongs)
  };
}

/* --------------------------------------------------------------------------
   REGOLA 2: quoziente con la stessa base
   -------------------------------------------------------------------------- */
function genQuot(lvl = 1) {
  const a = pick([[2, 3, 5], [2, 3, 5, 7, 10], [3, 5, 7, 10, 11]][lvl]);
  const three = Math.random() < [0, 0.35, 0.7][lvl];
  let exps;
  if (three) {
    const n = rnd(1, 4), p = rnd(1, 3);
    exps = [n + p + rnd(1, 5), n, p];
  } else {
    const m = rnd(4, [8, 12, 15][lvl]);
    exps = [m, rnd(1, m - 1)];
  }
  const diff = exps.slice(1).reduce((d, e) => d - e, exps[0]);
  const sumAll = exps.reduce((s, e) => s + e, 0);
  const terms = exps.map(e => P(a, e)).join(' : ');
  const subTxt = exps.join(' − ');
  const intro = pick(['Riduci a potenza unica:', 'Dividi il bottino:', 'Calcola il quoziente:']);

  const wrongs = [
    optPow(a, sumAll, pick(MSG.sumInsteadSub)),
    optPow(1, diff, `Non devi fare ${a} : ${a} = 1! La base resta ${a}, sottrai solo gli esponenti.`),
    three ? optPow(a, exps[0] - exps[1] + exps[2], `Hai sottratto il primo ma sommato il secondo! Si sottraggono tutti: ${subTxt} = ${diff}.`) : null,
    !three && exps[0] % exps[1] === 0 ? optPow(a, exps[0] / exps[1], 'Hai DIVISO gli esponenti! Con il diviso tra potenze della stessa base si SOTTRAGGONO.') : null,
    optPow(a, diff + 1, `${pick(MSG.close)} ${subTxt} = ${diff}.`),
    optPow(a, diff - 1, `${pick(MSG.close)} ${subTxt} = ${diff}.`),
    optPow(a, diff + 2, `${pick(MSG.close)} ${subTxt} = ${diff}.`)
  ];
  maybeMeme(wrongs);

  return {
    ruleId: 'quot_same_base',
    expr: terms,
    prompt: `${intro} ${M(terms)}`,
    steps: `${terms} = ${P(a, subTxt.replace(/ /g, ''))} = ${P(a, diff)}`,
    options: assemble(optPow(a, diff), wrongs)
  };
}

/* --------------------------------------------------------------------------
   REGOLA 3: potenza di potenza
   -------------------------------------------------------------------------- */
function genPow(lvl = 1) {
  const a = pick([[2, 3], [2, 3, 5, 7], [3, 5, 7, 10]][lvl]);
  const nested = Math.random() < [0, 0.3, 0.6][lvl];
  const m = rnd([2, 2, 3][lvl], [4, 5, 6][lvl]), n = rnd(2, [3, 4, 4][lvl]), p = nested ? rnd(2, 3) : 1;
  const tot = m * n * p;
  const expr = nested ? `[(${P(a, m)})<sup>${n}</sup>]<sup>${p}</sup>` : `(${P(a, m)})<sup>${n}</sup>`;
  const multTxt = nested ? `${m}·${n}·${p}` : `${m}·${n}`;
  const intro = pick(['Calibra il contrappeso:', 'Calcola:', 'Riduci a potenza unica:']);

  const wrongs = [
    optPow(a, nested ? m + n + p : m + n, pick(MSG.sumInsteadMult)),
    optPow(a * n, m, `Hai moltiplicato la base per l’esponente (${a} · ${n})! La base ${a} resta ferma.`),
    nested ? optPow(a, m * n + p, `Hai fatto ${m} · ${n} ma poi hai sommato ${p}! Moltiplica tutti: ${multTxt.replace(/·/g, ' · ')} = ${tot}.`) : null,
    !nested && m ** n <= 40 ? optPow(a, m ** n, `Hai fatto ${m} elevato alla ${n}! Gli esponenti si MOLTIPLICANO: ${m} · ${n} = ${tot}.`) : null,
    optPow(a, tot + 1, `${pick(MSG.close)} ${multTxt.replace(/·/g, ' · ')} = ${tot}.`),
    optPow(a, tot - 1, `${pick(MSG.close)} ${multTxt.replace(/·/g, ' · ')} = ${tot}.`),
    optPow(a, tot + 2, `${pick(MSG.close)} ${multTxt.replace(/·/g, ' · ')} = ${tot}.`)
  ];
  maybeMeme(wrongs);

  return {
    ruleId: 'pow_of_pow',
    expr,
    prompt: `${intro} ${M(expr)}`,
    steps: `${expr} = ${P(a, multTxt)} = ${P(a, tot)}`,
    options: assemble(optPow(a, tot), wrongs)
  };
}

/* --------------------------------------------------------------------------
   REGOLA 4: esponente 0 e 1
   -------------------------------------------------------------------------- */
function genZero(lvl = 1) {
  // Facile: solo a⁰ e a¹. Sfida: parentesi, quozienti e trabocchetti.
  const r = [Math.random() * 0.45, Math.random(), 0.45 + Math.random() * 0.55][lvl];
  const noMeaning = (v) => optText('Non ha significato', `Ha significato eccome! Solo ${P(0, 0)} non ce l’ha. Qui il risultato è ${v}.`);

  if (r < 0.25) {
    const big = rnd(12, 999);
    return {
      ruleId: 'zero_one_exp',
      expr: P(big, 0),
      prompt: `Quanto fa ${M(P(big, 0))}?`,
      steps: `${P(big, 0)} = 1 &nbsp;(ogni numero diverso da 0 elevato a 0 fa 1)`,
      options: assemble(optNum(1), [
        optNum(0, pick(MSG.zeroIsZero)),
        optNum(big, 'Quello sarebbe con esponente 1! Con esponente 0 il risultato è sempre 1.'),
        noMeaning(1)
      ])
    };
  }
  if (r < 0.45) {
    const x = rnd(2, 99);
    return {
      ruleId: 'zero_one_exp',
      expr: P(x, 1),
      prompt: `Quanto fa ${M(P(x, 1))}?`,
      steps: `${P(x, 1)} = ${x} &nbsp;(con esponente 1 il numero resta se stesso)`,
      options: assemble(optNum(x), [
        optNum(1, 'Esponente 1 lascia il numero com’è! Il risultato 1 arriva con esponente 0.'),
        optNum(0, `Con esponente 1 non si azzera niente: ${x} resta ${x}.`),
        optNum(x * x, 'Esponente 1 non vuol dire "al quadrato"! Il numero resta se stesso.'),
        noMeaning(x)
      ])
    };
  }
  if (r < 0.7) {
    const a = pick([2, 3, 5, 7, 12, 458]);
    const m = rnd(2, 9), n = rnd(2, 9);
    return {
      ruleId: 'zero_one_exp',
      expr: `(${P(a, m)} · ${P(a, n)})<sup>0</sup>`,
      prompt: `Calcola al volo: ${M(`(${P(a, m)} · ${P(a, n)})<sup>0</sup>`)}`,
      steps: `(${P(a, m)} · ${P(a, n)})<sup>0</sup> = 1 &nbsp;(tutto elevato a 0 fa 1)`,
      options: assemble(optNum(1), [
        optNum(0, pick(MSG.zeroIsZero)),
        optPow(a, m + n, 'Ti sei messa a fare i conti dentro la parentesi?! Fuori c’era uno ZERO! Come dice Fibra: "Non c’è problema, tranne te"!'),
        optNum(a, 'Quello sarebbe con esponente 1! Con esponente 0 il risultato è sempre 1.')
      ])
    };
  }
  if (r < 0.9) {
    const a = pick([2, 3, 5, 7, 10]);
    const m = rnd(2, 9);
    return {
      ruleId: 'zero_one_exp',
      expr: `${P(a, m)} : ${P(a, m)}`,
      prompt: `Doppia regola! ${M(`${P(a, m)} : ${P(a, m)}`)}`,
      steps: `${P(a, m)} : ${P(a, m)} = ${P(a, `${m}−${m}`)} = ${P(a, 0)} = 1`,
      options: assemble(optNum(1), [
        optNum(0, `${m} − ${m} = 0 va all’ESPONENTE: ${P(a, 0)} = 1, non 0!`),
        optNum(a, `Esponente 0, non 1! ${P(a, 0)} = 1.`),
        optPow(a, 2 * m, pick(MSG.sumInsteadSub))
      ])
    };
  }
  const k = rnd(2, 99);
  return {
    ruleId: 'zero_one_exp',
    prompt: 'Attenta al trabocchetto! Quale di queste scritture <b>NON ha significato</b> in matematica?',
    steps: `${P(0, 0)} non ha significato. Tutte le altre sì.`,
    options: assemble(optText('0⁰'), [
      optText('1⁰', '1 elevato a 0 fa tranquillamente 1! C’è un’altra scrittura impossibile.'),
      optText('0¹', '0 elevato a 1 fa 0, è validissimo! Cerca lo zero elevato a zero.'),
      optText(`${k}⁰`, `${k} elevato a 0 fa 1. Riguarda la Regola 4 nel Taccuino!`)
    ])
  };
}

/* --------------------------------------------------------------------------
   REGOLA 5: stesso esponente
   -------------------------------------------------------------------------- */
function genSame(lvl = 1) {
  const n = rnd(2, [3, 5, 7][lvl]);
  if (Math.random() < [0.8, 0.6, 0.4][lvl]) {
    const pair = shuffle([2, 3, 4, 5, 6]).slice(0, 2);
    const [a, b] = pair;
    const ab = a * b;
    return {
      ruleId: 'same_exp',
      expr: `${P(a, n)} · ${P(b, n)}`,
      prompt: `${pick(['Fondi gli ingranaggi:', 'Calcola:', 'Unisci le potenze:'])} ${M(`${P(a, n)} · ${P(b, n)}`)}`,
      steps: `${P(a, n)} · ${P(b, n)} = (${a} · ${b})<sup>${n}</sup> = ${P(ab, n)}`,
      options: assemble(optPow(ab, n), [
        optPow(ab, 2 * n, `Hai moltiplicato le basi E sommato gli esponenti! L’esponente resta ${n}.`),
        optPow(a + b, n, `Hai fatto ${a} + ${b}! C’è il segno PER: ${a} · ${b} = ${ab}.`),
        optPow(ab, n * n, `Non moltiplicare gli esponenti, lascia ${n}!`),
        optPow(ab, n + 1, `L’esponente resta ${n}! Non cambiarlo.`),
        optPow(ab, n - 1, `L’esponente resta ${n}! Non cambiarlo.`)
      ])
    };
  }
  const b = pick([2, 3, 4, 5, 6]);
  const k = pick([2, 3, 4, 5]);
  const a = b * k;
  return {
    ruleId: 'same_exp',
    expr: `${P(a, n)} : ${P(b, n)}`,
    prompt: `${pick(['Dividi la potenza:', 'Calcola:', 'Separa gli ingranaggi:'])} ${M(`${P(a, n)} : ${P(b, n)}`)}`,
    steps: `${P(a, n)} : ${P(b, n)} = (${a} : ${b})<sup>${n}</sup> = ${P(k, n)}`,
    options: assemble(optPow(k, n), [
      optPow(k, 0, `Non sottrarre gli esponenti! Qui l’esponente ${n} resta uguale: dividi solo le basi.`),
      optPow(a - b, n, `Hai fatto ${a} − ${b} invece di ${a} : ${b}! Dividi le basi.`),
      optPow(k, 2 * n, `L’esponente resta ${n}! Non sommarlo.`),
      optPow(k, n + 1, `L’esponente resta ${n}! Non cambiarlo.`),
      optPow(k, n - 1, `L’esponente resta ${n}! Non cambiarlo.`)
    ])
  };
}

/* --------------------------------------------------------------------------
   DUELLO FINALE: esercizi combinati
   -------------------------------------------------------------------------- */
function genMix(lvl = 1) {
  // Le regole con più errori escono più spesso (peso 3 = facile, 1 = sfida).
  const rules = ['pow_of_pow', 'prod_same_base', 'same_exp', 'zero_one_exp'];
  const w = rules.map(r => (typeof ruleLevel === 'function' ? 3 - ruleLevel(r) : 1));
  let x = Math.random() * w.reduce((a, b) => a + b, 0);
  let t = 1;
  for (let i = 0; i < w.length; i++) { x -= w[i]; if (x <= 0) { t = i + 1; break; } }
  const close = (e, txt) => optPow(...e, `${pick(MSG.close)} ${txt}`);

  if (t === 1) {
    const a = pick([2, 3, 5]);
    const m = rnd(2, 4), n = rnd(2, 3), p = rnd(1, m * n - 1);
    const r = m * n - p;
    const expr = `(${P(a, m)})<sup>${n}</sup> : ${P(a, p)}`;
    return {
      ruleId: 'pow_of_pow',
      expr,
      prompt: `Due passaggi! ${M(expr)}`,
      steps: `(${P(a, m)})<sup>${n}</sup> = ${P(a, m * n)} → ${P(a, m * n)} : ${P(a, p)} = ${P(a, r)}`,
      options: assemble(optPow(a, r), [
        optPow(a, m + n - p, `Potenza di potenza: ${m} · ${n}, non ${m} + ${n}!`),
        optPow(a, m * n + p, `Alla fine c’era un DIVISO! ${m * n} − ${p} = ${r}.`),
        optPow(1, r, `La base ${a} resta ${a}!`),
        close([a, r + 1], `${m * n} − ${p} = ${r}.`),
        close([a, r - 1], `${m * n} − ${p} = ${r}.`)
      ])
    };
  }
  if (t === 2) {
    const a = pick([2, 3, 5, 7]);
    const m = rnd(2, 6), n = rnd(2, 6), p = rnd(1, m + n - 1);
    const r = m + n - p;
    const expr = `(${P(a, m)} · ${P(a, n)}) : ${P(a, p)}`;
    return {
      ruleId: 'prod_same_base',
      expr,
      prompt: `Stabilizza il nucleo! ${M(expr)}`,
      steps: `${P(a, m)} · ${P(a, n)} = ${P(a, m + n)} → ${P(a, m + n)} : ${P(a, p)} = ${P(a, r)}`,
      options: assemble(optPow(a, r), [
        m * n - p >= 0 ? optPow(a, m * n - p, `Dentro la parentesi c’è un PER tra potenze con la stessa base: ${m} + ${n}, non ${m} · ${n}!`) : null,
        optPow(a, m + n + p, `L’ultimo è un DIVISO! ${m + n} − ${p} = ${r}.`),
        close([a, r + 1], `(${m} + ${n}) − ${p} = ${r}.`),
        close([a, r - 1], `(${m} + ${n}) − ${p} = ${r}.`),
        close([a, r + 2], `(${m} + ${n}) − ${p} = ${r}.`)
      ])
    };
  }
  if (t === 3) {
    const [a, b] = pick([[2, 5], [2, 3], [3, 5], [2, 7]]);
    const ab = a * b;
    const n = rnd(3, 6), p = rnd(1, n - 1);
    const r = n - p;
    const expr = `(${P(a, n)} · ${P(b, n)}) : ${P(ab, p)}`;
    return {
      ruleId: 'same_exp',
      expr,
      prompt: `L’onda d’urto! ${M(expr)}`,
      steps: `${P(a, n)} · ${P(b, n)} = ${P(ab, n)} → ${P(ab, n)} : ${P(ab, p)} = ${P(ab, r)}`,
      options: assemble(optPow(ab, r), [
        optPow(ab, n + p, `Devi sottrarre ${p}, non sommarlo! ${n} − ${p} = ${r}.`),
        optPow(a + b, r, `${a} per ${b} fa ${ab}, non ${a + b}!`),
        optPow(ab, 2 * n - p, `Con lo stesso esponente l’esponente resta ${n}: non sommare ${n} + ${n}!`),
        close([ab, r + 1], `${n} − ${p} = ${r}.`)
      ])
    };
  }
  const a = pick([2, 3, 5, 7, 10]);
  const m = rnd(3, 9), n = rnd(2, 6);
  const expr = `(${P(a, m)})<sup>0</sup> · ${P(a, n)}`;
  return {
    ruleId: 'zero_one_exp',
    expr,
    prompt: `Trappola di Lavinia! ${M(expr)}`,
    steps: `(${P(a, m)})<sup>0</sup> = 1 → 1 · ${P(a, n)} = ${P(a, n)}`,
    options: assemble(optPow(a, n), [
      optPow(a, m + n, `(${P(a, m)})<sup>0</sup> fa 1! Quindi resta solo ${P(a, n)}.`),
      optNum(0, pick(MSG.zeroIsZero)),
      optPow(a, m * n, `Niente moltiplicazioni: (${P(a, m)})<sup>0</sup> = 1.`),
      optNum(1, `Hai azzerato tutto, ma 1 · ${P(a, n)} = ${P(a, n)}!`)
    ])
  };
}

const GENERATORS = {
  prod_same_base: genProd,
  quot_same_base: genQuot,
  pow_of_pow: genPow,
  zero_one_exp: genZero,
  same_exp: genSame
};

function generateQuestion(area, lvl = 1) {
  const gen = area.ruleId ? GENERATORS[area.ruleId] : genMix;
  const q = gen(lvl);
  q.level = lvl;
  q.type = 'choice';
  return q;
}
