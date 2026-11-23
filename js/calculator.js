/* ==========================================================================
   CALCOLATRICE (aiuto per la discalculia)
   - Solo + − × ÷, con la precedenza della scuola (× e ÷ prima di + e −).
   - Il pannello copre la scena, mai i dialoghi: l'esercizio resta visibile.
   - Nessun tasto per le potenze: il ragionamento sulle regole resta alla giocatrice.
   ========================================================================== */
const CALC_OPS = { '+': '+', '-': '−', '*': '×', '/': '÷' };

const calc = { expr: '', last: '', error: false, justDone: false };

function calcToggle(force) {
  const panel = $('calc-panel');
  const open = force !== undefined ? force : !panel.classList.contains('open');
  panel.classList.toggle('open', open);
  panel.setAttribute('aria-hidden', open ? 'false' : 'true');
  const btn = document.querySelector('[data-nav="calc"]');
  if (btn) btn.classList.toggle('active', open);
  if (typeof playSound === 'function') playSound('blip');
}

/* Legge l'espressione: numeri (con la virgola) e operazioni. */
function calcTokens(s) {
  const out = [];
  let num = '';
  for (const ch of s) {
    if (/[0-9,]/.test(ch)) num += ch;
    else if (CALC_OPS[ch]) {
      if (num !== '') { out.push(num); num = ''; }
      out.push(ch);
    }
  }
  if (num !== '') out.push(num);
  return out;
}

/* Calcola con la precedenza: prima × e ÷, poi + e −. Restituisce un numero o un messaggio. */
function calcEval(s) {
  const t = calcTokens(s);
  if (!t.length) return { value: 0 };
  // Un segno meno all'inizio rende negativo il primo numero.
  if (t[0] === '-' && t.length > 1 && !CALC_OPS[t[1]]) { t.splice(0, 2, '-' + t[1]); }
  if (CALC_OPS[t[t.length - 1]]) return { error: 'Manca un numero alla fine.' };
  const nums = [];
  const ops = [];
  for (let i = 0; i < t.length; i++) {
    if (i % 2 === 0) {
      if (CALC_OPS[t[i]] || (t[i].match(/,/g) || []).length > 1 || t[i] === ',') return { error: 'Controlla i numeri.' };
      nums.push(parseFloat(t[i].replace(',', '.')));
    } else {
      if (!CALC_OPS[t[i]]) return { error: 'Controlla le operazioni.' };
      ops.push(t[i]);
    }
  }
  // Primo giro: × e ÷.
  const n2 = [nums[0]];
  const o2 = [];
  for (let i = 0; i < ops.length; i++) {
    const b = nums[i + 1];
    if (ops[i] === '*') n2[n2.length - 1] *= b;
    else if (ops[i] === '/') {
      if (b === 0) return { error: 'Non si divide per 0!' };
      n2[n2.length - 1] /= b;
    } else { o2.push(ops[i]); n2.push(b); }
  }
  // Secondo giro: + e −.
  let v = n2[0];
  o2.forEach((op, i) => { v = op === '+' ? v + n2[i + 1] : v - n2[i + 1]; });
  if (!isFinite(v) || Math.abs(v) > 1e15) return { error: 'Numero troppo grande.' };
  return { value: Math.round(v * 1e6) / 1e6 };
}

/* Numero scritto (es. "1234,5" o "-12"): punto delle migliaia nella parte intera. */
function calcFormatNum(str) {
  const [int, dec] = str.split(',');
  const sign = int.startsWith('-') ? '-' : '';
  const digits = int.replace('-', '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return sign + digits + (dec !== undefined ? ',' + dec : '');
}

/* Mostra i simboli della scuola (× ÷ −) e il punto delle migliaia. */
function calcShow(s) {
  return calcTokens(s).map(x => CALC_OPS[x] ? ` ${CALC_OPS[x]} ` : calcFormatNum(x)).join('').trim();
}

function calcRender() {
  $('calc-last').textContent = calc.last;
  const d = $('calc-display');
  d.textContent = calc.error ? calc.error : (calc.expr ? calcShow(calc.expr) : '0');
  d.classList.toggle('err', !!calc.error);
}

function calcKey(k) {
  if (calc.error) { calc.error = false; if (k !== 'C') calc.expr = ''; }
  if (k === 'C') { calc.expr = ''; calc.last = ''; calc.justDone = false; }
  else if (k === 'back') { calc.expr = calc.expr.slice(0, -1); calc.justDone = false; }
  else if (k === '=') {
    if (!calc.expr) return calcRender();
    const r = calcEval(calc.expr);
    if (r.error) { calc.error = r.error; }
    else {
      calc.last = `${calcShow(calc.expr)} =`;
      calc.expr = String(r.value).replace('.', ',');
      calc.justDone = true;
    }
  } else if (CALC_OPS[k]) {
    const lastCh = calc.expr.slice(-1);
    if (CALC_OPS[lastCh]) calc.expr = calc.expr.slice(0, -1) + k;      // cambia operazione
    else if (calc.expr || k === '-') calc.expr += k;
    calc.justDone = false;
  } else if (k === ',') {
    if (calc.justDone) { calc.expr = ''; calc.justDone = false; }
    const lastNum = calc.expr.split(/[+\-*/]/).pop();
    if (!lastNum.includes(',')) calc.expr += lastNum === '' ? '0,' : ',';
  } else if (/^[0-9]$/.test(k)) {
    if (calc.justDone) { calc.expr = ''; calc.last = ''; calc.justDone = false; }
    if (calc.expr.length < 40) calc.expr += k;
  }
  calcRender();
}

function initCalculator() {
  const keys = [
    ['7', '7'], ['8', '8'], ['9', '9'], ['/', '÷', 'op'], ['C', 'C', 'clear'], ['back', '⌫', 'clear'],
    ['4', '4'], ['5', '5'], ['6', '6'], ['*', '×', 'op'], ['-', '−', 'op'], ['+', '+', 'op'],
    ['1', '1'], ['2', '2'], ['3', '3'], ['0', '0'], [',', ','], ['=', '=', 'eq']
  ];
  $('calc-keys').innerHTML = keys.map(([k, label, cls]) =>
    `<button type="button" class="calc-key ${cls || ''}" data-ck="${k}" aria-label="${label === '⌫' ? 'Cancella' : label}">${label}</button>`).join('');
  $('calc-keys').addEventListener('click', (e) => {
    const b = e.target.closest('[data-ck]');
    if (b) calcKey(b.dataset.ck);
  });
  // Tastiera del computer, solo con la calcolatrice aperta e fuori dai campi di testo.
  document.addEventListener('keydown', (e) => {
    if (!$('calc-panel').classList.contains('open')) return;
    if (e.target.closest && e.target.closest('input, textarea')) return;
    const map = { Enter: '=', '=': '=', Backspace: 'back', Escape: 'C', Delete: 'C', '.': ',', ',': ',', x: '*', X: '*', ':': '/' };
    const k = map[e.key] || (/^[0-9+\-*/]$/.test(e.key) ? e.key : null);
    if (!k) return;
    e.preventDefault();
    calcKey(k);
  });
  calcRender();
}

document.addEventListener('DOMContentLoaded', initCalculator);
