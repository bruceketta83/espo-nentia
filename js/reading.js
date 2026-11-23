/* ==========================================================================
   OPZIONI DI LETTURA (dislessia, ipovisione, chi legge piano)
   - Testo più grande, font leggibili, più spazio tra lettere e righe.
   - Testo subito, senza effetto macchina da scrivere.
   - Lettura ad alta voce dei dialoghi (sintesi vocale del dispositivo).
   Le opzioni sono salvate per profilo, a parte dalla partita:
   "Nuova partita" non le cancella.
   ========================================================================== */
const READING_DEFAULTS = { size: 0, font: 'normal', spacing: false, instant: false, voice: false, auto: false, rate: 1 };
const READING_SIZES = [
  { zoom: 1, name: 'Normale' },
  { zoom: 1.15, name: 'Grande' },
  { zoom: 1.3, name: 'Molto grande' }
];
const READING_FONTS = [
  { id: 'normal', name: 'Normale', css: '' },
  { id: 'easy', name: 'Leggibile', css: '"Atkinson Hyperlegible"' },
  { id: 'dys', name: 'OpenDyslexic', css: '"OpenDyslexic"' }
];

let reading = null;

function readingKey() {
  const id = (typeof profiles !== 'undefined' && profiles.current) || 'p1';
  return `esponentia_reading_${id}`;
}

function readingPrefs() {
  if (reading) return reading;
  reading = { ...READING_DEFAULTS };
  try { Object.assign(reading, JSON.parse(localStorage.getItem(readingKey())) || {}); } catch (e) {}
  return reading;
}

function setReading(key, value) {
  const r = readingPrefs();
  r[key] = value;
  if (key === 'voice' && !value) { r.auto = false; speechStop(); }
  try { localStorage.setItem(readingKey(), JSON.stringify(r)); } catch (e) {}
  applyReading();
  if (typeof renderProfile === 'function' && $('modal-profile').classList.contains('open')) renderProfile('reading');
}

function applyReading() {
  const r = readingPrefs();
  const root = document.documentElement;
  root.style.setProperty('--read-zoom', READING_SIZES[r.size] ? READING_SIZES[r.size].zoom : 1);
  READING_FONTS.forEach(f => root.classList.toggle(`font-${f.id}`, r.font === f.id && f.id !== 'normal'));
  root.classList.toggle('read-spacing', !!r.spacing);
  root.classList.toggle('read-voice', !!r.voice && speechAvailable());
}

/* --------------------------------------------------------------------------
   LETTURA AD ALTA VOCE
   -------------------------------------------------------------------------- */
function speechAvailable() {
  return typeof window.speechSynthesis !== 'undefined' && typeof window.SpeechSynthesisUtterance !== 'undefined';
}

function italianVoice() {
  if (!speechAvailable()) return null;
  const voices = speechSynthesis.getVoices();
  return voices.find(v => /^it[-_]IT/i.test(v.lang) && v.localService) ||
         voices.find(v => /^it/i.test(v.lang)) || null;
}

const SPEECH_SYMBOLS = [
  [/[·×⋅]/g, ' per '],
  [/\s:\s|(?<=[\w)])\s*:\s*(?=[\w(])/g, ' diviso '],
  [/[−–]|(?<=[\w)]\s*)-(?=\s*[\w(])/g, ' meno '],
  [/\+/g, ' più '],
  [/=/g, ' uguale '],
  [/\(/g, ' aperta parentesi '],
  [/\)/g, ' chiusa parentesi ']
];
const SUP_DIGITS = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' };

/* Una formula detta a voce: 2<sup>3</sup> · 2<sup>4</sup> → "2 alla 3 per 2 alla 4". */
function mathSpeech(html) {
  let s = html
    .replace(/<sup>(.*?)<\/sup>/gi, (m, e) => ` alla ${e.replace(/<[^>]+>/g, '')} `)
    .replace(/([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, m => ` alla ${m.split('').map(c => SUP_DIGITS[c]).join('')} `)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ');
  SPEECH_SYMBOLS.forEach(([re, word]) => { s = s.replace(re, word); });
  return s.replace(/\s+/g, ' ').trim();
}

/* Il testo da leggere: formule a parole, niente emoji e simboli decorativi. */
function speechText(html) {
  const box = document.createElement('div');
  box.innerHTML = html;
  box.querySelectorAll('.math-expr, .solution').forEach(m => { m.textContent = ` ${mathSpeech(m.innerHTML)}. `; });
  box.querySelectorAll('sup').forEach(s => { s.textContent = ` alla ${s.textContent} `; });
  box.querySelectorAll('br, p, div, li').forEach(b => b.insertAdjacentText('afterend', ' '));
  return box.textContent
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, m => ` alla ${m.split('').map(c => SUP_DIGITS[c]).join('')} `)
    .replace(/\p{Extended_Pictographic}|[\u{1F1E6}-\u{1F1FF}\uFE0F\u200D→←✕]/gu, ' ')
    .replace(/\s+([.,!?;:])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

let speaking = false;

function speechStop() {
  if (speechAvailable()) speechSynthesis.cancel();
  speaking = false;
  updateListenBtn();
}

function speak(text, queue = false) {
  if (!speechAvailable() || !text) return;
  if (!queue) speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'it-IT';
  const v = italianVoice();
  if (v) u.voice = v;
  u.rate = readingPrefs().rate || 1;
  u.onend = u.onerror = () => { if (!speechSynthesis.speaking) { speaking = false; updateListenBtn(); } };
  speaking = true;
  updateListenBtn();
  speechSynthesis.speak(u);
}

/* Il pulsante 🔈 legge il dialogo e la spiegazione dell'ultima risposta. */
function currentSpeech() {
  return [$('dialogue-text').innerHTML, $('feedback-slot').innerHTML].map(speechText).filter(Boolean).join(' ');
}

function toggleListen() {
  if (speaking) { speechStop(); return; }
  speak(currentSpeech());
}

function updateListenBtn() {
  const b = $('btn-listen');
  if (!b) return;
  b.textContent = speaking ? '⏹ Stop' : '🔈 Ascolta';
  b.setAttribute('aria-pressed', speaking ? 'true' : 'false');
}

/* Chiamate dal motore dei dialoghi. */
function readingOnDialogue(html) {
  const r = readingPrefs();
  if (!r.voice) return;
  if (r.auto) speak(speechText(html));
  else speechStop();
}
function readingOnFeedback(html) {
  const r = readingPrefs();
  if (r.voice && r.auto && html) speak(speechText(html), true);
}

/* --------------------------------------------------------------------------
   SCHEDA "LETTURA" NEL PROFILO
   -------------------------------------------------------------------------- */
function openReading() {
  if (typeof playSound === 'function') playSound('blip');
  renderProfile('reading');
  $('modal-profile').classList.add('open');
}

function readingOptionRow(title, desc, buttons) {
  return `<div class="read-row"><div class="read-title">${title}</div>
    ${desc ? `<div class="inv-desc">${desc}</div>` : ''}
    <div class="read-choices">${buttons}</div></div>`;
}

function readingBtn(on, label, action, extra = '') {
  return `<button type="button" class="read-opt ${on ? 'on' : ''}" aria-pressed="${on}" onclick="${action}" ${extra}>${label}</button>`;
}

function renderReadingTab() {
  const r = readingPrefs();
  const voiceOk = speechAvailable();
  const it = italianVoice();
  const voiceNote = !voiceOk
    ? 'Questo browser non sa leggere ad alta voce.'
    : (it ? `Voce: ${it.name}.` : 'Se non senti nulla, installa la voce italiana nelle impostazioni del dispositivo.');
  return `<div class="reading-panel">
    <div class="read-sample">Prova: Aria trova ${M('2<sup>3</sup> · 2<sup>4</sup> = 2<sup>7</sup>')}</div>
    ${readingOptionRow('🔠 Grandezza del testo', '',
      READING_SIZES.map((s, i) => readingBtn(r.size === i, s.name, `setReading('size', ${i})`, `style="font-size:${0.85 * s.zoom}rem"`)).join(''))}
    ${readingOptionRow('🔤 Carattere', 'OpenDyslexic e Leggibile aiutano chi ha la dislessia a non confondere le lettere.',
      READING_FONTS.map(f => readingBtn(r.font === f.id, f.name, `setReading('font', '${f.id}')`, f.css ? `style='font-family:${f.css}'` : '')).join(''))}
    ${readingOptionRow('↔️ Più spazio tra lettere e righe', '',
      readingBtn(!r.spacing, 'No', "setReading('spacing', false)") + readingBtn(r.spacing, 'Sì', "setReading('spacing', true)"))}
    ${readingOptionRow('⚡ Testo subito', 'Il testo appare tutto insieme, senza effetto macchina da scrivere.',
      readingBtn(!r.instant, 'No', "setReading('instant', false)") + readingBtn(r.instant, 'Sì', "setReading('instant', true)"))}
    ${readingOptionRow('🔈 Lettura ad alta voce', `Mostra il pulsante "Ascolta" sopra i dialoghi. ${voiceNote}`,
      readingBtn(!r.voice, 'No', "setReading('voice', false)") + readingBtn(r.voice, 'Sì', "setReading('voice', true)", voiceOk ? '' : 'disabled'))}
    ${r.voice && voiceOk ? readingOptionRow('🔁 Leggi ogni dialogo da solo', '',
      readingBtn(!r.auto, 'No', "setReading('auto', false)") + readingBtn(r.auto, 'Sì', "setReading('auto', true)")) +
      readingOptionRow('🐢 Velocità della voce', '',
        [[0.8, 'Lenta'], [1, 'Normale']].map(([v, n]) => readingBtn(r.rate === v, n, `setReading('rate', ${v})`)).join('') +
        `<button type="button" class="read-opt" onclick="speak(speechText(document.querySelector('.read-sample').innerHTML))">▶ Prova la voce</button>`) : ''}
  </div>`;
}

document.addEventListener('DOMContentLoaded', () => {
  applyReading();
  // Le voci arrivano dopo il caricamento della pagina.
  if (speechAvailable()) speechSynthesis.addEventListener && speechSynthesis.addEventListener('voiceschanged', () => italianVoice());
});
