/* ==========================================================================
   DIFFICOLTÀ ADATTIVA E TIPI DI ESERCIZIO
   - Il livello di ogni regola dipende dalle ultime 8 risposte.
   - Ogni esercizio generato può diventare: scelta multipla, tastierino,
     vero/falso a tempo, "trova l'errore" di Lavinia, costruisci la potenza.
   ========================================================================== */
const LEVELS = [
  { icon: '🟢', name: 'Facile' },
  { icon: '🟡', name: 'Medio' },
  { icon: '🔴', name: 'Sfida' }
];

/* Quanto spesso esce ogni tipo, per livello. */
const TYPE_MIX = [
  { choice: 0.5, truefalse: 0.25, build: 0.25 },
  { choice: 0.35, input: 0.25, truefalse: 0.15, build: 0.15, error: 0.1 },
  { choice: 0.2, input: 0.3, error: 0.25, truefalse: 0.1, build: 0.15 }
];

const TYPE_NAMES = {
  choice: '🔘 Scelta',
  input: '⌨️ Scrivi la risposta',
  truefalse: '⏱️ Vero o falso',
  error: '🔍 Trova l’errore',
  build: '🧱 Costruisci la potenza'
};

function recentOf(rule) { return (state.recent && state.recent[rule]) || []; }

function pushRecent(rule, ok) {
  if (!rule) return;
  if (!state.recent) state.recent = {};
  state.recent[rule] = recentOf(rule).concat(ok ? 1 : 0).slice(-8);
}

/* 0 = facile, 1 = medio, 2 = sfida. */
function ruleLevel(rule) {
  if (!rule) return 1;
  const r = recentOf(rule);
  if (r.length < 3) return 1;
  const acc = r.reduce((a, b) => a + b, 0) / r.length;
  if (acc < 0.6 || r.slice(-2).every(x => x === 0)) return 0;
  if (acc >= 0.85 && r.length >= 5) return 2;
  return 1;
}

/* Livello del duello: quello della regola, corretto da come sta andando. */
function duelLevel(area) {
  let lvl;
  if (area.ruleId) lvl = ruleLevel(area.ruleId);
  else {
    const ids = RULES_DATA.map(r => r.id);
    lvl = Math.round(ids.reduce((a, id) => a + ruleLevel(id), 0) / ids.length);
  }
  if (duel && duel.errors >= 2) lvl = Math.max(0, lvl - 1);
  if (duel && duel.streak >= 3) lvl = Math.min(2, lvl + 1);
  return lvl;
}

/* Le risposte-meme (6⁷) non spiegano un errore di calcolo. */
function isMeme(o) { return MSG.meme67.includes(o.msg); }

function canUse(type, q) {
  const ans = q.options.find(o => o.correct);
  const wrongs = q.options.filter(o => !o.correct);
  switch (type) {
    case 'choice': return true;
    case 'input': return !!q.expr && (ans.e !== undefined || ans.n !== undefined);
    case 'truefalse': return !!q.expr && wrongs.length > 0;
    case 'build': return !!q.expr && ans.e !== undefined && ans.b !== undefined;
    case 'error': return !!q.expr && new Set(wrongs.filter(w => w.msg && !isMeme(w)).map(w => w.msg)).size >= 3;
    default: return false;
  }
}

function pickType(lvl, q) {
  const mix = Object.entries(TYPE_MIX[lvl]).filter(([t]) => canUse(t, q));
  let x = Math.random() * mix.reduce((a, [, w]) => a + w, 0);
  for (const [t, w] of mix) { x -= w; if (x <= 0) return t; }
  return 'choice';
}

/* Domanda per il duello: livello adattivo + tipo a sorpresa. */
function makeDuelQuestion(area) {
  const lvl = duelLevel(area);
  const q = generateQuestion(area, lvl);
  return convertQuestion(q, pickType(lvl, q));
}

function convertQuestion(q, type) {
  const ans = q.options.find(o => o.correct);
  const wrongs = q.options.filter(o => !o.correct);
  q.type = type;
  q.ans = ans;
  q.wrongs = wrongs;

  if (type === 'input') {
    if (ans.e !== undefined) {
      q.prompt = `Completa: ${M(`${q.expr} = ${ans.b}<sup>?</sup>`)}<br>Scrivi l’<b>esponente</b>.`;
      q.answer = String(ans.e);
      q.msgFor = (typed) => {
        const w = wrongs.find(o => o.b === ans.b && String(o.e) === typed);
        return w ? w.msg : `Non è ${typed}. Rifai il calcolo dell’esponente con la regola!`;
      };
    } else {
      q.prompt = `Quanto fa ${M(q.expr)}? Scrivi il <b>risultato</b>.`;
      q.answer = String(ans.n);
      q.msgFor = (typed) => {
        const w = wrongs.find(o => o.n !== undefined && String(o.n) === typed);
        return w ? w.msg : `Non fa ${typed}. Ricorda: elevato a 0 fa 1, elevato a 1 resta uguale.`;
      };
    }
  }

  if (type === 'truefalse') {
    const showTrue = Math.random() < 0.5;
    const shown = showTrue ? ans : pick(wrongs);
    q.claimTrue = showTrue;
    q.claimMsg = shown.msg;
    q.seconds = [15, 12, 9][q.level];
    q.prompt = `Vero o falso? Hai <b>${q.seconds} secondi</b>!<br>${M(`${q.expr} = ${formatMathString(shown.text)}`)}`;
  }

  if (type === 'error') {
    const correctShown = Math.random() < 0.25;
    const real = wrongs.filter(w => w.msg && !isMeme(w));
    const shown = correctShown ? ans : pick(real);
    const seen = new Set([shown.msg]);
    const others = shuffle(real.filter(w => w !== shown)).filter(w => !seen.has(w.msg) && seen.add(w.msg)).slice(0, 2);
    q.prompt = `Lavinia ha risolto così:<br>${M(`${q.expr} = ${formatMathString(shown.text)}`)}<br>Che errore ha fatto?`;
    q.errOptions = shuffle([
      ...(correctShown ? [] : [{ text: shown.msg, correct: true }]),
      ...others.map(o => ({ text: o.msg, correct: false, msg: 'Non è questo l’errore di Lavinia. Rileggi bene il suo calcolo!' })),
      { text: '😳 Nessun errore: ha fatto giusto!', correct: correctShown, msg: 'Invece l’errore c’è! Rifai il calcolo e confronta.' }
    ]);
  }

  if (type === 'build') {
    const bases = new Set([ans.b]);
    const exps = new Set([ans.e]);
    wrongs.forEach(w => { if (w.b !== undefined) { bases.add(w.b); exps.add(w.e); } });
    while (bases.size < 3) bases.add(ans.b + rnd(1, 9));
    while (exps.size < 4) exps.add(Math.max(0, ans.e + rnd(-3, 4)));
    q.bases = shuffle([...bases].slice(0, 4));
    q.exps = shuffle([...exps].slice(0, 4));
    if (!q.bases.includes(ans.b)) q.bases[0] = ans.b;
    if (!q.exps.includes(ans.e)) q.exps[0] = ans.e;
    q.prompt = `Costruisci il risultato come <b>una sola potenza</b>:<br>${M(`${q.expr} = ?`)}`;
    q.msgFor = (b, e) => {
      const w = wrongs.find(o => o.b === b && o.e === e);
      if (w) return w.msg;
      if (b !== ans.b) return `La base non è ${b}. Pensa a cosa succede alla base con questa regola.`;
      return `L’esponente non è ${e}. Rifai il conto degli esponenti.`;
    };
  }
  return q;
}
