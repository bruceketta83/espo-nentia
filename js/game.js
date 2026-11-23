/* ==========================================================================
   MOTORE DI GIOCO
   ========================================================================== */
const $ = (id) => document.getElementById(id);
const reducedMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

const SAVE_KEY = 'esponentia_save_v2';
const OLD_SAVE_KEY = 'esponentia_save_v1';
const MAX_HEARTS = 3;
const HINT_COST = 20;

const DEFAULT_STATE = {
  version: 2,
  currentArea: 0,
  unlockedArea: 0,
  aura: 100,
  unlockedRules: [],
  crystals: [],
  items: [],
  completedAreas: [],
  gameWon: false,
  stars: {},
  stats: {},
  rooms: {},
  flags: {},
  curiosities: [],
  quests: {},
  medals: [],
  look: {},
  owned: [],
  maxStreak: 0,
  puz: {},
  cons: {}
};

function clone(obj) {
  return typeof structuredClone === 'function' ? structuredClone(obj) : JSON.parse(JSON.stringify(obj));
}

let gameStarted = false;
const PROFILES_KEY = 'esponentia_profiles';
let profiles = loadProfiles();
let state = loadState();
let duel = null;
let busy = false;
let ariaX = 0;
let typer = null;

/* --------------------------------------------------------------------------
   SALVATAGGIO (con migrazione dal salvataggio v1)
   -------------------------------------------------------------------------- */
/* Profili: ogni giocatrice ha il suo salvataggio. */
function loadProfiles() {
  let p = null;
  try { p = JSON.parse(localStorage.getItem(PROFILES_KEY)); } catch (e) {}
  if (!p || !Array.isArray(p.list) || !p.list.length) p = { list: [{ id: 'p1', name: 'Giocatrice 1' }], current: 'p1' };
  if (!p.list.some(x => x.id === p.current)) p.current = p.list[0].id;
  // Migrazione: il salvataggio senza profilo passa al profilo in uso.
  try {
    const legacy = localStorage.getItem(SAVE_KEY) || localStorage.getItem(OLD_SAVE_KEY);
    if (legacy) {
      localStorage.setItem(`${SAVE_KEY}_${p.current}`, legacy);
      localStorage.removeItem(SAVE_KEY);
      localStorage.removeItem(OLD_SAVE_KEY);
    }
    localStorage.setItem(PROFILES_KEY, JSON.stringify(p));
  } catch (e) {}
  return p;
}
function saveProfiles() {
  try { localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles)); } catch (e) {}
}
function profileSaveKey(id = profiles.current) { return `${SAVE_KEY}_${id}`; }

function loadState() {
  const s = clone(DEFAULT_STATE);
  try {
    const raw = localStorage.getItem(profileSaveKey());
    if (raw) {
      Object.assign(s, JSON.parse(raw));
      s.version = 2;
      // Salvataggi vecchi: aggiunge i campi nuovi con il valore iniziale.
      Object.keys(DEFAULT_STATE).forEach(k => {
        if (s[k] === undefined || s[k] === null) s[k] = clone(DEFAULT_STATE[k]);
      });
      // Colori di Aria tolti dal negozio: rimborso dell'Aura.
      if (typeof refundRemovedLook === 'function') refundRemovedLook(s);
      $('btn-reset-save').style.display = 'inline-block';
    }
  } catch (e) {}
  return s;
}

function writeSave() {
  try { localStorage.setItem(profileSaveKey(), JSON.stringify(state)); } catch (e) {}
}

function saveState() {
  writeSave();
  checkMedals();
}

function resetSave() {
  try { localStorage.removeItem(profileSaveKey()); } catch (e) {}
  state = clone(DEFAULT_STATE);
  location.reload();
}

function hasSave() {
  return state.currentArea > 0 || state.unlockedRules.length > 0 || state.completedAreas.length > 0;
}

function confirmReset() {
  if (window.confirm('Vuoi davvero cancellare i progressi e ricominciare da zero?')) resetSave();
}

/* --------------------------------------------------------------------------
   SCHERMATA INIZIALE
   -------------------------------------------------------------------------- */
function initTitle() {
  $('title-svg').innerHTML = SCENES.title.svg();
  $('profile-chip').innerHTML = `👤 ${currentProfile().name} <span>· cambia</span>`;
  if (hasSave()) {
    const stars = Object.values(state.stars).reduce((a, b) => a + b, 0);
    $('btn-start').textContent = '⛵ CONTINUA L\'AVVENTURA';
    const info = $('save-info');
    info.innerHTML = `📍 ${AREAS[state.currentArea].name} &nbsp;•&nbsp; 💎 ${state.crystals.length}/5 &nbsp;•&nbsp; ⭐ ${stars}`;
    info.style.display = 'block';
    $('title-screen').classList.add('has-save');
  }
  // La musica parte al primo tocco (i browser bloccano l'audio senza un gesto).
  $('title-screen').addEventListener('pointerdown', () => {
    if (!gameStarted) Music.play('title');
  }, { once: true });
}

function startGame() {
  if (gameStarted) return;
  gameStarted = true;
  playSound('success');
  const t = $('title-screen');
  const hide = () => { t.style.display = 'none'; $('title-svg').innerHTML = ''; };
  if (reducedMotion) hide();
  else {
    t.classList.add('leaving');
    setTimeout(hide, 600);
  }
  renderArea(state.currentArea, false);
}

/* --------------------------------------------------------------------------
   UTILITÀ GRAFICHE
   -------------------------------------------------------------------------- */
function updateHUD() {
  $('hud-aura').textContent = state.aura;
  $('hud-crystals').textContent = `${state.crystals.length}/5`;
  $('inv-count').textContent = state.items.length + state.crystals.length;
}

function popBadge(id) {
  const el = $(id).closest('.hud-badge');
  restartAnim(el, 'pop');
}

function restartAnim(el, cls) {
  if (!el || reducedMotion) return;
  el.classList.remove(cls);
  void el.getBoundingClientRect();
  el.classList.add(cls);
  el.addEventListener('animationend', () => el.classList.remove(cls), { once: true });
}

function fadeTransition(cb) {
  if (reducedMotion) { cb(); return; }
  const f = $('fade');
  f.classList.add('on');
  setTimeout(() => {
    cb();
    requestAnimationFrame(() => f.classList.remove('on'));
  }, 320);
}

/* Converte coordinate SVG in pixel relativi a un contenitore. */
function svgToLocal(x, y, container) {
  const svg = $('scene-svg');
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const pt = svg.createSVGPoint();
  pt.x = x;
  pt.y = y;
  const p = pt.matrixTransform(ctm);
  const r = container.getBoundingClientRect();
  return { x: p.x - r.left, y: p.y - r.top };
}

function burst(svgX, svgY, emojis, count = 10) {
  if (reducedMotion) return;
  const container = $('scene-container');
  const o = svgToLocal(svgX, svgY, container);
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.textContent = pick(emojis);
    container.appendChild(p);
    const ang = Math.random() * Math.PI * 2;
    const dist = 30 + Math.random() * 50;
    const dx = Math.cos(ang) * dist;
    const dy = Math.sin(ang) * dist - 20;
    const anim = p.animate([
      { transform: `translate(${o.x}px, ${o.y}px) translate(-50%, -50%) scale(0.5)`, opacity: 1 },
      { transform: `translate(${o.x + dx}px, ${o.y + dy}px) translate(-50%, -50%) scale(1.2)`, opacity: 0 }
    ], { duration: 700 + Math.random() * 400, easing: 'cubic-bezier(.2,.8,.3,1)' });
    anim.onfinish = () => p.remove();
  }
}

function flyCrystal(icon, svgX, svgY, done) {
  const app = $('app');
  const from = svgToLocal(svgX, svgY, app);
  const target = $('hud-crystals').getBoundingClientRect();
  const appR = app.getBoundingClientRect();
  const to = { x: target.left - appR.left + target.width / 2, y: target.top - appR.top + target.height / 2 };
  if (reducedMotion) { done && done(); return; }
  const el = document.createElement('div');
  el.className = 'flying-crystal';
  el.textContent = icon;
  app.appendChild(el);
  const midX = (from.x + to.x) / 2;
  const midY = Math.min(from.y, to.y) - 40;
  const anim = el.animate([
    { transform: `translate(${from.x}px, ${from.y}px) translate(-50%, -50%) scale(0.6)`, opacity: 0 },
    { transform: `translate(${from.x}px, ${from.y - 20}px) translate(-50%, -50%) scale(2.2)`, opacity: 1, offset: 0.3 },
    { transform: `translate(${midX}px, ${midY}px) translate(-50%, -50%) scale(1.6)`, opacity: 1, offset: 0.65 },
    { transform: `translate(${to.x}px, ${to.y}px) translate(-50%, -50%) scale(0.6)`, opacity: 0.9 }
  ], { duration: 1300, easing: 'ease-in-out' });
  anim.onfinish = () => { el.remove(); done && done(); };
}

/* --------------------------------------------------------------------------
   DIALOGHI CON EFFETTO MACCHINA DA SCRIVERE
   -------------------------------------------------------------------------- */
function typeText(el, html, done) {
  el.innerHTML = html;
  if (reducedMotion || (typeof readingPrefs === 'function' && readingPrefs().instant)) { done(); return; }

  const nodes = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) nodes.push(walker.currentNode);
  const chars = [];
  nodes.forEach(n => {
    const frag = document.createDocumentFragment();
    for (const ch of n.textContent) {
      const s = document.createElement('span');
      s.className = 'tw-h';
      s.textContent = ch;
      frag.appendChild(s);
      chars.push(s);
    }
    n.parentNode.replaceChild(frag, n);
  });
  el.querySelectorAll('.math-expr').forEach(b => b.classList.add('tw-box'));

  let i = 0;
  let finished = false;
  const iv = setInterval(() => {
    for (let k = 0; k < 2 && i < chars.length; k++, i++) {
      chars[i].classList.remove('tw-h');
      const box = chars[i].closest('.tw-box');
      if (box) box.classList.remove('tw-box');
    }
    if (i >= chars.length) finish();
  }, 22);

  function finish() {
    if (finished) return;
    finished = true;
    clearInterval(iv);
    el.querySelectorAll('.tw-h').forEach(s => s.classList.remove('tw-h'));
    el.querySelectorAll('.tw-box').forEach(b => b.classList.remove('tw-box'));
    typer = null;
    done();
  }
  typer = { finish };
}

function skipTyping() {
  if (typer) typer.finish();
}

/* avatar: chiave di CHARS (ritratto SVG) oppure emoji.
   speaker: 'aria' | 'mentor' | 'guardian' per animare la bocca nella scena. */
function setDialogue(name, role, avatar, html, speaker, boxClass = '') {
  if (typer) typer.finish();
  html = say(html);
  $('dialogue-text').className = `dialogue-box ${boxClass}`;
  $('dialogue-area').scrollTop = 0;
  $('speaker-name').textContent = name;
  $('speaker-role').textContent = role;
  const av = $('speaker-avatar');
  if (CHARS[avatar]) av.innerHTML = portraitSVG(avatar);
  else av.textContent = avatar;

  const choices = $('choices-container');
  choices.classList.add('pending');
  const talkers = [av];
  if (speaker) {
    const s = document.querySelector(`#char-${speaker} .char`);
    if (s) talkers.push(s);
  }
  talkers.forEach(t => t.classList.add('talking'));
  if (typeof readingOnDialogue === 'function') readingOnDialogue(html);
  typeText($('dialogue-text'), html, () => {
    talkers.forEach(t => t.classList.remove('talking'));
    choices.classList.remove('pending');
  });
}

function clearChoices() {
  const c = $('choices-container');
  c.innerHTML = '';
  return c;
}

function addChoice(html, onClick, cls = '') {
  const b = document.createElement('button');
  b.className = `choice-btn ${cls}`;
  b.innerHTML = html;
  b.onclick = onClick;
  $('choices-container').appendChild(b);
  return b;
}

function setFeedback(html) {
  $('feedback-slot').innerHTML = html;
  if (typeof readingOnFeedback === 'function') readingOnFeedback(html);
}

function scrollDialogueToEnd() {
  const d = $('dialogue-area');
  requestAnimationFrame(() => d.scrollTo({ top: d.scrollHeight, behavior: reducedMotion ? 'auto' : 'smooth' }));
}

function mentorAvatar(area) {
  const c = findNpc(area, 'mentor');
  return c && c.draw ? c.draw : area.mentor.avatar;
}
function guardianAvatar(area) {
  const c = findNpc(area, 'guardian');
  return c && c.draw ? c.draw : area.guardian.avatar;
}

/* --------------------------------------------------------------------------
   SCENA: COSTRUZIONE, ETICHETTE, CAMMINATA DI ARIA
   -------------------------------------------------------------------------- */
function charBounds(area, role) {
  const L = roomLayout(area);
  const c = L[role];
  if (c.draw) return { top: L.groundY - CHARS[c.draw].h, bottom: L.groundY };
  return { top: c.top, bottom: c.bottom };
}

function labelsHTML(area) {
  // Nessun nome sopra i personaggi: il nome compare nella finestra dei dialoghi.
  // Resta solo il "!" quando il personaggio ha qualcosa di nuovo da dire.
  let html = '';
  ['mentor', 'guardian'].forEach(role => {
    const c = roomLayout(area)[role];
    if (!c) return;
    const b = charBounds(area, role);
    const isNew = role === 'mentor'
      ? area.ruleId && !state.unlockedRules.includes(area.ruleId)
      : (!area.ruleId || state.unlockedRules.includes(area.ruleId)) && !state.completedAreas.includes(area.id);
    // Margine di 48: con preserveAspectRatio=slice i bordi della scena possono essere tagliati sui telefoni stretti.
    const x = Math.min(Math.max(c.x, 48), 352);
    html += `
      <rect class="hit" data-role="${role}" x="${c.x - 22}" y="${b.top}" width="44" height="${b.bottom - b.top}" fill="transparent"/>
      ${isNew ? `<g id="label-${role}" class="label" data-role="${role}" transform="translate(${x} ${b.top - 6})">
        <g class="label-bob"><circle class="alert-dot" r="5" fill="#f59e0b" stroke="#0f172a" stroke-width="0.8"/><text x="0" y="3" font-size="8" text-anchor="middle" font-weight="900" fill="#0f172a">!</text></g>
      </g>` : ''}`;
  });
  return html + worldMarkersHTML(area);
}

function refreshLabels(area) {
  const props = $('layer-props');
  if (props) props.innerHTML = propsHTML(area);
  const layer = $('layer-ui');
  if (layer) layer.innerHTML = labelsHTML(area);
}

function buildScene(area, arriveX) {
  const room = currentRoom(area);
  const L = room.layout;
  const ariaY = L.ariaY || L.groundY;
  const sc = room.scene ? SCENES[room.scene] : null;
  if ((arriveX === undefined || arriveX === null) && pendingArrive !== null) arriveX = pendingArrive;
  pendingArrive = null;
  ariaX = arriveX !== undefined && arriveX !== null ? arriveX : L.ariaStart;
  $('location-banner').textContent = room.title || area.name;
  if (walkTimer) { clearTimeout(walkTimer); walkTimer = null; busy = false; }
  closeBubble();

  let chars = '';
  ['mentor', 'guardian'].forEach(role => {
    const c = L[role];
    if (!c || !c.draw) return;
    chars += `<g id="char-${role}" transform="translate(${c.x} ${L.groundY})"><g transform="scale(${c.face || 1} 1)">${CHARS[c.draw].draw()}</g></g>`;
  });
  chars += `<g id="char-aria" style="transform: translate(${ariaX}px, ${ariaY}px)"><g id="aria-flip">${CHARS.aria.draw()}</g></g>`;

  $('scene-svg').classList.remove('lit');
  $('scene-svg').innerHTML = `
    <g id="layer-bg">${sc ? sc.bg() : room.svgBg}</g>
    <g id="layer-props">${propsHTML(area)}</g>
    <g id="layer-chars">${chars}</g>
    <g id="layer-fg">${sc && sc.fg ? sc.fg() : ''}</g>
    <g id="layer-ui">${labelsHTML(area)}</g>`;
}

function faceAria(dir) {
  const f = $('aria-flip');
  if (f) f.setAttribute('transform', `scale(${dir} 1)`);
}

let walkTimer = null;

function walkTo(x, cb) {
  const area = AREAS[state.currentArea];
  const L = roomLayout(area);
  const y = L.ariaY || L.groundY;
  const el = $('char-aria');
  if (!el) { cb && cb(); return; }
  // Un nuovo tocco interrompe la camminata in corso: Aria riparte da dove si trova.
  if (walkTimer) {
    clearTimeout(walkTimer);
    walkTimer = null;
    const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
    ariaX = m.m41;
    el.style.transition = 'none';
    el.style.transform = `translate(${ariaX}px, ${y}px)`;
    void el.getBoundingClientRect();
  }
  const dist = Math.abs(x - ariaX);
  if (dist < 3) { el.classList.remove('walking'); busy = false; cb && cb(); return; }
  busy = true;
  faceAria(x > ariaX ? 1 : -1);
  const dur = reducedMotion ? 0 : Math.max(0.25, dist / 115);
  el.classList.add('walking');
  el.style.transition = `transform ${dur}s linear`;
  el.style.transform = `translate(${x}px, ${y}px)`;
  ariaX = x;
  walkTimer = setTimeout(() => {
    walkTimer = null;
    el.classList.remove('walking');
    busy = false;
    cb && cb();
  }, dur * 1000);
}

function onSceneClick(e) {
  if (!gameStarted || duel) return;
  const area = AREAS[state.currentArea];
  if (worldClick(area, e)) return;
  if (selectedItem) cancelUse();
  const svg = $('scene-svg');
  const pt = svg.createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return;
  const p = pt.matrixTransform(ctm.inverse());
  walkTo(Math.min(385, Math.max(15, p.x)));
}

function interact(area, role) {
  const c = roomLayout(area)[role];
  if (!c) {
    // Il personaggio è in un'altra stanza: Aria ci va e poi parla.
    const rid = npcRoomId(area, role);
    if (!rid) return;
    goRoom(area, rid, areaRooms(area)[rid].layout.ariaStart, () => interact(area, role));
    return;
  }
  playSound('blip');
  walkTo(c.stand, () => {
    faceAria(c.x > ariaX ? 1 : -1);
    if (role === 'mentor') startMentorDialogue(area);
    else startGuardianChallenge(area);
  });
}

/* --------------------------------------------------------------------------
   AREE
   -------------------------------------------------------------------------- */
function renderArea(areaIndex, withFade = true) {
  if (withFade) fadeTransition(() => buildArea(areaIndex));
  else buildArea(areaIndex);
}

function buildArea(areaIndex) {
  state.currentArea = areaIndex;
  duel = null;
  busy = false;
  cancelUse();
  saveState();
  updateHUD();
  hideDuelPanel();

  const area = AREAS[areaIndex];
  $('location-banner').textContent = area.name;
  setFeedback('');
  buildScene(area);
  if (gameStarted) Music.play(area.music);

  if (state.gameWon && areaIndex === AREAS.length - 1) {
    if (area.rooms && currentRoomId(area) !== 'cima') {
      state.rooms[area.id] = 'cima';
      buildScene(area);
    }
    lightTheLighthouse();
    showVictoryScreen();
    return;
  }
  if (area.rooms) {
    const rid = currentRoomId(area);
    const firstArea = !flag(`visited_${area.id}`);
    const firstRoom = !flag(`visited_${area.id}_${rid}`);
    setFlag(`visited_${area.id}`);
    setFlag(`visited_${area.id}_${rid}`);
    const room = currentRoom(area);
    if (!firstArea && room.onEnter && room.onEnter(firstRoom)) return;
    showRoomMenu(area, firstArea ? say(area.intro) : say(room.enter));
    return;
  }
  showAreaMenu(area, say(area.intro));
}

function showAreaMenu(area, text) {
  setDialogue('Aria', 'Esploratrice', 'aria', text, 'aria');
  clearChoices();

  if (area.mentor) {
    addChoice(`<span>💬 Parla con ${area.mentor.name} (Teoria)</span><span>→</span>`,
      () => interact(area, 'mentor'));
  }

  const isDone = state.completedAreas.includes(area.id);
  addChoice(`<span>⚔️ ${isDone ? 'Rigioca la sfida con' : 'Affronta'} ${area.guardian.name}</span><span>→</span>`,
    () => interact(area, 'guardian'));

  if (isDone && area.id < AREAS.length - 1) {
    addChoice(`🚀 Vai a: ${AREAS[area.id + 1].name}`,
      () => { playSound('success'); renderArea(area.id + 1); }, 'primary-action');
  }
}

/* --------------------------------------------------------------------------
   DIALOGO MENTORE
   -------------------------------------------------------------------------- */
function startMentorDialogue(area, forceFull = false) {
  duel = null;
  hideDuelPanel();
  setFeedback('');
  const m = area.mentor;
  const already = area.ruleId && state.unlockedRules.includes(area.ruleId);
  // Seconda visita: frasi brevi (m.again) invece della lezione intera.
  const lines = already && m.again && !forceFull ? [m.again] : m.lines;
  let step = 0;

  if (area.ruleId && !already) {
    state.unlockedRules.push(area.ruleId);
    saveState();
    $('notebook-dot').style.display = 'block';
  }

  function showStep() {
    setDialogue(m.name, m.role, mentorAvatar(area), lines[step], 'mentor');
    clearChoices();
    if (step < lines.length - 1) {
      addChoice('Continua →', () => { playSound('blip'); step++; showStep(); }, 'primary-action');
      return;
    }
    refreshLabels(area);
    if (m.onEnd) m.onEnd(area);
    if (m.extraChoices) m.extraChoices(area).forEach(c => addChoice(c.html, c.fn, c.cls || ''));
    if (already && m.again && !forceFull) {
      addChoice('<span>🔁 Ripeti la lezione</span><span>→</span>', () => startMentorDialogue(area, true));
    }
    addChoice('<span>📖 Apri il Taccuino per fissare la regola</span><span>→</span>',
      () => openModal('notebook'));
    if (area.rooms) {
      addChoice('↩️ Continua a esplorare', () => ariaSays(null), 'primary-action');
    } else {
      addChoice(`⚔️ Vai alla sfida di ${area.guardian.name}`,
        () => interact(area, 'guardian'), 'primary-action');
    }
  }
  showStep();
}

/* --------------------------------------------------------------------------
   DUELLO CON IL GUARDIANO
   -------------------------------------------------------------------------- */
function startGuardianChallenge(area) {
  const g = area.guardian;
  setFeedback('');

  if (area.ruleId && !state.unlockedRules.includes(area.ruleId)) {
    setDialogue(g.name, g.role, guardianAvatar(area), g.blockMsg, 'guardian');
    clearChoices();
    addChoice(`<span>💬 Vai da ${area.mentor.name}</span><span>→</span>`,
      () => interact(area, 'mentor'), 'primary-action');
    return;
  }

  // Condizione extra dell'area (es. Barnaba vuole prima la sua cassa).
  const gateMsg = !state.completedAreas.includes(area.id) && area.duelGate && area.duelGate();
  if (gateMsg) {
    setDialogue(g.name, g.role, guardianAvatar(area), gateMsg, 'guardian');
    clearChoices();
    addChoice('↩️ Ok, ci penso io', () => ariaSays(null), 'primary-action');
    return;
  }

  const replay = state.completedAreas.includes(area.id);
  duel = {
    areaId: area.id,
    max: area.maxHp,
    hp: area.maxHp,
    hearts: MAX_HEARTS,
    errors: 0,
    streak: 0,
    // Prima partita: domande d'autore in ordine. Rigiocata: solo esercizi nuovi.
    authored: replay ? [] : [...g.questions],
    q: null,
    answered: false,
    first: true,
    maxHearts: MAX_HEARTS,
    double: false
  };
  // Oggetti utili comprati da Zia Turbina.
  const boosts = [];
  if (useCons('cuore')) { duel.hearts = duel.maxHearts = MAX_HEARTS + 1; boosts.push('❤️ Cuore extra: parti con 4 cuori!'); }
  if (useCons('pozione')) { duel.double = true; boosts.push('🧪 Pozione: Aura doppia in questo duello!'); }
  boosts.forEach(b => toast(b));
  showDuelPanel(area);
  nextQuestion();
}

function authoredToQuestion(q, area) {
  return {
    ruleId: q.rule || area.ruleId,
    prompt: q.prompt,
    steps: q.steps,
    options: q.options.map(o => ({ text: o.text, correct: !!o.correct, msg: o.msg }))
  };
}

function nextQuestion() {
  const area = AREAS[duel.areaId];
  clearTimeout(duel.timer);
  duel.q = duel.authored.length ? authoredToQuestion(duel.authored.shift(), area) : makeDuelQuestion(area);
  duel.answered = false;
  duel.solve = null;
  setFeedback('');
  renderQuestion();
}

function renderQuestion() {
  const area = AREAS[duel.areaId];
  const g = area.guardian;
  const q = duel.q;
  const intro = duel.first ? `<p class="g-intro">"${say(g.intro)}"</p>` : '';
  duel.first = false;
  const lvl = LEVELS[q.level !== undefined ? q.level : 1];
  const typeTag = q.type && q.type !== 'choice' ? `<div class="q-type">${TYPE_NAMES[q.type]}</div>` : '';

  setDialogue(g.name, `${g.role} • Colpo ${duel.max - duel.hp + 1} di ${duel.max} • ${lvl.icon} ${lvl.name}`,
    guardianAvatar(area), `${intro}${typeTag}<div>${q.prompt}</div>`, 'guardian');

  const choices = clearChoices();
  if (q.type === 'input') renderInputQ(choices, q);
  else if (q.type === 'truefalse') renderTrueFalseQ(choices, q);
  else if (q.type === 'error') renderErrorQ(choices, q);
  else if (q.type === 'build') renderBuildQ(choices, q);
  else renderChoiceQ(choices, q);

  const canHint = (!q.type || q.type === 'choice' || q.type === 'error')
    && document.querySelectorAll('.q-opt').length > 2;
  const freeHints = consCount('aiuto');
  if (canHint && (freeHints > 0 || state.aura >= HINT_COST)) {
    const label = freeHints > 0 ? `💡 Aiutino gratis (pergamene: ${freeHints})` : `💡 Aiutino: togli una risposta sbagliata (−${HINT_COST} Aura)`;
    const hint = addChoice(label, () => useHint(hint), 'hint-btn');
  }
}

/* Scelta multipla classica. */
function renderChoiceQ(choices, q) {
  const grid = document.createElement('div');
  grid.className = 'choices-grid';
  shuffle(q.options).forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn math-choice q-opt';
    btn.innerHTML = formatMathString(opt.text);
    btn._opt = opt;
    btn.onclick = () => handleAnswer(opt, btn);
    grid.appendChild(btn);
  });
  choices.appendChild(grid);
  duel.solve = () => [...grid.children].find(b => b._opt.correct).click();
}

/* Tastierino: si scrive l'esponente (o il risultato). */
function renderInputQ(choices, q) {
  let typed = '';
  const pad = document.createElement('div');
  pad.className = 'keypad';
  pad.innerHTML = `<div class="keypad-display">?</div>
    <div class="keypad-grid">${[1, 2, 3, 4, 5, 6, 7, 8, 9, '⌫', 0, 'OK'].map(k =>
      `<button data-k="${k}" class="${k === 'OK' ? 'ok' : ''}">${k}</button>`).join('')}</div>`;
  choices.appendChild(pad);
  const display = pad.querySelector('.keypad-display');
  const submit = () => {
    if (!typed || duel.answered) return;
    pad.querySelectorAll('button').forEach(b => { b.disabled = true; });
    const ok = typed === q.answer;
    display.classList.add(ok ? 'right' : 'wrong');
    submitAnswer(ok, ok ? '' : q.msgFor(typed), ok ? '' : `La risposta giusta era <b>${q.answer}</b>.`);
  };
  pad.querySelectorAll('button').forEach(b => {
    b.onclick = () => {
      const k = b.dataset.k;
      if (k === 'OK') { submit(); return; }
      if (k === '⌫') typed = typed.slice(0, -1);
      else if (typed.length < 3) typed += k;
      playSound('blip');
      display.textContent = typed || '?';
    };
  });
  duel.solve = () => { typed = q.answer; display.textContent = typed; submit(); };
}

/* Vero o falso con il tempo che scorre. */
function renderTrueFalseQ(choices, q) {
  const wrap = document.createElement('div');
  wrap.innerHTML = `<div class="tf-timer"><div style="animation-duration:${q.seconds}s"></div></div>
    <div class="choices-grid tf-grid">
      <button class="choice-btn math-choice" data-v="1">✅ Vero</button>
      <button class="choice-btn math-choice" data-v="0">❌ Falso</button>
    </div>`;
  choices.appendChild(wrap);
  const token = duel;
  const answer = (v, btn) => {
    if (duel !== token || duel.answered) return;
    clearTimeout(duel.timer);
    wrap.querySelector('.tf-timer').classList.add('stopped');
    wrap.querySelectorAll('button').forEach(b => {
      b.disabled = true;
      if ((b.dataset.v === '1') === q.claimTrue) b.classList.add('right');
    });
    const ok = v === q.claimTrue;
    if (btn && !ok) btn.classList.add('wrong');
    const msg = v === null ? '⏰ Tempo scaduto! Prova a essere più veloce.' : q.claimTrue ? 'Era vero! Il calcolo era giusto.' : q.claimMsg;
    submitAnswer(ok, ok ? '' : msg);
  };
  wrap.querySelectorAll('button').forEach(b => { b.onclick = () => answer(b.dataset.v === '1', b); });
  duel.timer = setTimeout(() => answer(null, null), q.seconds * 1000);
  duel.solve = () => answer(q.claimTrue, wrap.querySelector(`button[data-v="${q.claimTrue ? 1 : 0}"]`));
}

/* Trova l'errore di Lavinia. */
function renderErrorQ(choices, q) {
  const list = document.createElement('div');
  list.className = 'error-list';
  q.errOptions.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn q-opt';
    btn.innerHTML = opt.text;
    btn._opt = opt;
    btn.onclick = () => {
      if (duel.answered) return;
      list.querySelectorAll('button').forEach(b => { b.disabled = true; if (b._opt.correct) b.classList.add('right'); });
      if (!opt.correct) btn.classList.add('wrong');
      submitAnswer(opt.correct, opt.msg);
    };
    list.appendChild(btn);
  });
  choices.appendChild(list);
  duel.solve = () => [...list.children].find(b => b._opt.correct).click();
}

/* Costruisci la potenza: scegli la base e l'esponente. */
function renderBuildQ(choices, q) {
  let b = null;
  let e = null;
  const box = document.createElement('div');
  box.className = 'build';
  box.innerHTML = `<div class="build-result"><span class="build-base">?</span><sup class="build-exp">?</sup></div>
    <div class="build-row"><span>Base</span>${q.bases.map(x => `<button class="tile" data-b="${x}">${x}</button>`).join('')}</div>
    <div class="build-row"><span>Esponente</span>${q.exps.map(x => `<button class="tile exp" data-e="${x}">${x}</button>`).join('')}</div>
    <button class="choice-btn primary-action build-ok" disabled>✔ Conferma</button>`;
  choices.appendChild(box);
  const ok = box.querySelector('.build-ok');
  const refresh = () => {
    box.querySelector('.build-base').textContent = b === null ? '?' : b;
    box.querySelector('.build-exp').textContent = e === null ? '?' : e;
    box.querySelectorAll('[data-b]').forEach(t => t.classList.toggle('on', Number(t.dataset.b) === b));
    box.querySelectorAll('[data-e]').forEach(t => t.classList.toggle('on', Number(t.dataset.e) === e));
    ok.disabled = b === null || e === null;
  };
  box.querySelectorAll('[data-b]').forEach(t => { t.onclick = () => { b = Number(t.dataset.b); playSound('blip'); refresh(); }; });
  box.querySelectorAll('[data-e]').forEach(t => { t.onclick = () => { e = Number(t.dataset.e); playSound('blip'); refresh(); }; });
  ok.onclick = () => {
    if (duel.answered) return;
    box.querySelectorAll('button').forEach(x => { x.disabled = true; });
    const right = b === q.ans.b && e === q.ans.e;
    box.querySelector('.build-result').classList.add(right ? 'right' : 'wrong');
    submitAnswer(right, right ? '' : q.msgFor(b, e), right ? '' : `La potenza giusta era <b>${q.ans.b}<sup>${q.ans.e}</sup></b>.`);
  };
  duel.solve = () => { b = q.ans.b; e = q.ans.e; refresh(); ok.click(); };
}

function formatMathString(str) {
  const map = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' };
  return str.replace(/([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, match => `<sup>${match.split('').map(c => map[c] || c).join('')}</sup>`);
}

function useHint(hintBtn) {
  const free = consCount('aiuto') > 0;
  if (!duel || duel.answered || (!free && state.aura < HINT_COST)) return;
  const wrongBtns = [...document.querySelectorAll('.q-opt')]
    .filter(b => b._opt && !b._opt.correct && !b.disabled);
  if (wrongBtns.length <= 1) return;
  const b = pick(wrongBtns);
  b.disabled = true;
  b.classList.add('eliminated');
  if (free) useCons('aiuto');
  else state.aura -= HINT_COST;
  saveState();
  updateHUD();
  popBadge('hud-aura');
  playSound('blip');
  hintBtn.remove();
}

function recordStat(ruleId, ok) {
  if (!ruleId) return;
  pushRecent(ruleId, ok);
  const s = state.stats[ruleId] || { ok: 0, ko: 0 };
  if (ok) s.ok++; else s.ko++;
  state.stats[ruleId] = s;
}

function guardianTarget() {
  return document.querySelector('#char-guardian .char') || $('label-guardian');
}

function guardianCenter(area) {
  const c = roomLayout(area).guardian;
  const b = charBounds(area, 'guardian');
  return { x: c.x, y: (b.top + b.bottom) / 2 };
}

function handleAnswer(opt, btn) {
  if (!duel || duel.answered) return;
  document.querySelectorAll('.choices-grid .math-choice').forEach(b => {
    b.disabled = true;
    if (b._opt && b._opt.correct) b.classList.add('right');
  });
  btn.classList.add(opt.correct ? 'right' : 'wrong');
  submitAnswer(opt.correct, opt.msg);
}

/* Parte comune a tutti i tipi di esercizio: punti, cuori, feedback. */
function submitAnswer(ok, msg, extra = '') {
  if (!duel || duel.answered) return;
  duel.answered = true;
  clearTimeout(duel.timer);
  const token = duel;
  const area = AREAS[duel.areaId];
  const q = duel.q;
  const hint = document.querySelector('.hint-btn');
  if (hint) hint.remove();
  recordStat(q.ruleId, ok);

  if (!ok) {
    playSound('error');
    restartAnim($('app'), 'shake');
    state.aura = Math.max(0, state.aura - 10);
    duel.hearts--;
    duel.errors++;
    duel.streak = 0;
    saveState();
    updateHUD();
    updateDuelPanel();
    setFeedback(`
      <div class="feedback-banner feedback-error">
        ❌ <b>${msg}</b> <span style="opacity:0.8;">(−10 Aura, −1 ❤️)</span>
        ${extra ? `<div>${extra}</div>` : ''}
        <div class="solution">✔️ ${q.steps}</div>
      </div>`);
    if (duel.hearts <= 0) {
      addChoice('Continua →', () => duelLost(area), 'primary-action');
    } else {
      addChoice('Prossima domanda →', () => { playSound('blip'); nextQuestion(); }, 'primary-action');
    }
    scrollDialogueToEnd();
    return;
  }

  // Risposta giusta: colpo al guardiano
  playSound('hit');
  duel.streak++;
  state.maxStreak = Math.max(state.maxStreak || 0, duel.streak);
  duel.hp--;
  const bonus = 10 * (duel.streak - 1);
  const gain = (50 + bonus) * (duel.double ? 2 : 1);
  state.aura += gain;
  saveState();
  updateHUD();
  popBadge('hud-aura');
  updateDuelPanel();
  restartAnim(guardianTarget(), 'hit');
  const gc = guardianCenter(area);
  burst(gc.x, gc.y, ['✨', '⭐', '💥', '💫'], 12);

  const slay = pick(['Slay!', 'Che aura!', 'Iconica!', 'Bum!', 'Mitica!', 'Zero sbatti!', 'Green flag!', 'Ci sta!']);
  setFeedback(`
    <div class="feedback-banner feedback-success">
      ✅ <b>${slay} +${gain} Aura</b>${duel.double ? ' 🧪' : ''}${duel.streak > 1 ? ` &nbsp;🔥 Combo x${duel.streak}` : ''}
      <div class="solution">${q.steps}</div>
    </div>`);
  scrollDialogueToEnd();

  setTimeout(() => {
    if (duel !== token) return;
    if (duel.hp <= 0) winDuel(area);
    else nextQuestion();
  }, 1700);
}

function starsHTML(n) { return '⭐'.repeat(n) + '☆'.repeat(3 - n); }

function winDuel(area) {
  if (duel) clearTimeout(duel.timer);
  const stars = duel.errors === 0 ? 3 : duel.errors === 1 ? 2 : 1;
  if (duel.errors === 0) state.flags.perfect = true;
  const prev = state.stars[area.id] || 0;
  if (stars > prev) state.stars[area.id] = stars;
  duel = null;
  hideDuelPanel();
  const gt = guardianTarget();
  if (gt && !reducedMotion) gt.classList.add('defeated');

  const isFirstTime = !state.completedAreas.includes(area.id);
  if (isFirstTime) {
    state.completedAreas.push(area.id);
    if (area.crystal) state.crystals.push(area.crystal);
    if (area.item) state.items.push(area.item);
    if (area.id + 1 < AREAS.length) state.unlockedArea = Math.max(state.unlockedArea, area.id + 1);
    if (area.id === AREAS.length - 1) state.gameWon = true;
  }
  saveState();

  const gc = guardianCenter(area);
  // Se la scena mostra il cristallo (es. la Serra), il cristallo sparisce quando Aria lo prende.
  const sceneCrystal = $('area-crystal');
  if (sceneCrystal) sceneCrystal.remove();
  if (isFirstTime && area.crystal) {
    playSound('crystal');
    flyCrystal(area.crystal.icon, gc.x, gc.y, () => { updateHUD(); popBadge('hud-crystals'); });
  } else {
    playSound('success');
    updateHUD();
  }
  burst(gc.x, gc.y, ['🎉', '✨', '⭐'], 16);

  const record = prev > 0 && stars > prev ? ' &nbsp;🏅 Nuovo record!' : '';
  setFeedback(`
    <div class="feedback-banner feedback-success">
      🎉 <b>SFIDA SUPERATA!</b> &nbsp;${starsHTML(stars)}${record}
    </div>`);
  setDialogue(area.guardian.name, area.guardian.role, guardianAvatar(area), area.guardian.winMsg, 'guardian');
  refreshLabels(area);
  clearChoices();

  if (area.id < AREAS.length - 1) {
    addChoice(`🚀 Prosegui verso: ${AREAS[area.id + 1].name}`,
      () => { playSound('blip'); renderArea(area.id + 1); }, 'primary-action');
  } else {
    addChoice('🏆 Accendi il Faro!', () => { lightTheLighthouse(); showVictoryScreen(); }, 'primary-action');
  }
  if (stars < 3) {
    addChoice('<span>⭐ Rigioca per fare 3 stelle</span><span>→</span>',
      () => startGuardianChallenge(area));
  }
}

function duelLost(area) {
  if (duel) clearTimeout(duel.timer);
  duel = null;
  hideDuelPanel();
  playSound('defeat');
  const g = area.guardian;
  setFeedback(`
    <div class="feedback-banner feedback-info">
      💔 Hai finito i cuori. Niente panico: ripassa la regola a tappeto e riprova. Ogni duello ha esercizi nuovi!
    </div>`);
  setDialogue(g.name, g.role, guardianAvatar(area), g.loseMsg, 'guardian');
  clearChoices();
  addChoice('🔁 Riprova il duello', () => { playSound('blip'); startGuardianChallenge(area); }, 'primary-action');
  addChoice('<span>📖 Ripassa sul Taccuino</span><span>→</span>', () => openModal('notebook'));
  if (area.mentor) {
    addChoice(`<span>💬 Chiedi aiuto a ${area.mentor.name}</span><span>→</span>`, () => interact(area, 'mentor'));
  }
}

/* --------------------------------------------------------------------------
   PANNELLO DEL DUELLO
   -------------------------------------------------------------------------- */
function showDuelPanel(area) {
  $('location-banner').style.display = 'none';
  $('app').classList.add('in-duel');
  $('duel-foe').textContent = findNpc(area, 'guardian').label;
  $('duel-panel').classList.add('open');
  updateDuelPanel();
}

function hideDuelPanel() {
  $('duel-panel').classList.remove('open');
  $('app').classList.remove('in-duel');
  $('location-banner').style.display = '';
}

function updateDuelPanel() {
  if (!duel) return;
  $('duel-hp-fill').style.width = `${(duel.hp / duel.max) * 100}%`;
  $('duel-hearts').textContent = '❤️'.repeat(Math.max(0, duel.hearts)) + '🖤'.repeat(Math.max(0, duel.maxHearts - Math.max(0, duel.hearts)));
  $('duel-combo').textContent = duel.streak > 1 ? `🔥 x${duel.streak}` : '';
}

/* --------------------------------------------------------------------------
   VITTORIA FINALE E RESOCONTO
   -------------------------------------------------------------------------- */
function lightTheLighthouse() {
  const svg = $('scene-svg');
  if (svg.classList.contains('lit')) return;
  svg.classList.add('lit');
  // Le scene statiche non hanno elementi "lit-only": aggiunge un bagliore generico.
  if (!svg.querySelector('.lit-only')) {
    $('layer-fg').insertAdjacentHTML('beforeend',
      '<circle class="faro-on" cx="200" cy="45" r="55" fill="#fde047" opacity="0.6"/>');
  }
}

function reportHTML() {
  const rows = RULES_DATA.map(r => {
    const s = state.stats[r.id] || { ok: 0, ko: 0 };
    const tot = s.ok + s.ko;
    const pct = tot ? Math.round((s.ok / tot) * 100) : 0;
    return `<tr><td>${r.short}<div class="report-bar"><div style="width:${pct}%"></div></div></td>
      <td>${tot ? `${s.ok}/${tot} (${pct}%)` : '—'}</td></tr>`;
  }).join('');
  const totalStars = Object.values(state.stars).reduce((a, b) => a + b, 0);
  return `<table class="report">${rows}
    <tr><td>Stelle totali</td><td>${totalStars}/${AREAS.length * 3} ⭐</td></tr></table>`;
}

function showVictoryScreen() {
  playSound('victory');
  setFeedback('');
  setDialogue("Faro dell'Accademia", 'Missione Compiuta!', '🏆',
    `<b>HAI SALVATO L'ISOLA DI ESPO-NENTIA!</b><br><br>
    Tutti e 5 i Cristalli Esponenziali brillano di nuovo e la flotta dell'Accademia può salpare!<br>
    Hai studiato come se non ci fosse un domani: le potenze ora le sai a mena dito! 💪<br>
    ${questState('diario') === 'done'
      ? '<i>Lavinia ti saluta da lontano. Per la prima volta, sorride davvero. 💜</i><br><br>'
      : `<i>Pagine del diario di Lavinia trovate: ${questCount('diario')}/5. Trovale tutte per il finale segreto!</i><br><br>`}
    Punteggio finale: <b>${state.aura} Aura</b> · Medaglie: <b>${state.medals.length}/${MEDALS.length}</b><br><br>
    <b>📊 Il tuo resoconto:</b>${reportHTML()}`, null);
  burst(200, 60, ['🎉', '✨', '⭐', '💎'], 24);
  clearChoices();
  addChoice('🗺️ Esplora ancora l’isola dalla Mappa', () => openModal('map'));
  addChoice('<span>🏅 Guarda le medaglie</span><span>→</span>', () => { openModal('profile'); renderProfile('medals'); });
  addChoice("🔄 Gioca di nuovo dall'inizio", () => resetSave(), 'primary-action');
}

/* --------------------------------------------------------------------------
   MODALI (TACCUINO, MAPPA, ZAINO)
   -------------------------------------------------------------------------- */
function openModal(type) {
  playSound('blip');
  if (type === 'notebook') {
    $('notebook-dot').style.display = 'none';
    renderNotebook();
  } else if (type === 'map') {
    renderMap();
  } else if (type === 'inventory') {
    renderInventory();
  } else if (type === 'profile') {
    renderProfile('shop');
  }
  $(`modal-${type}`).classList.add('open');
}

function closeModal(type) {
  playSound('blip');
  $(`modal-${type}`).classList.remove('open');
}

function renderNotebook() {
  const container = $('notebook-content');
  container.innerHTML = `
    <p style="font-size:0.85rem; color:#78350f; margin-bottom:4px;">
      Consulta queste schede in qualsiasi momento durante le sfide. Le regole si sbloccano parlando con i Mentori dell'isola.
    </p>`;

  RULES_DATA.forEach(rule => {
    const unlocked = state.unlockedRules.includes(rule.id);
    const card = document.createElement('div');
    card.className = `rule-card ${unlocked ? '' : 'locked'}`;
    card.innerHTML = unlocked
      ? `<div class="rule-title"><span>${rule.title}</span><span>✅</span></div>
         <div class="rule-formula">${rule.formula}</div>
         <div class="rule-desc">${rule.desc}</div>
         <div class="rule-example">${rule.example}</div>
         <div class="rule-level">Il tuo livello: <b>${LEVELS[ruleLevel(rule.id)].icon} ${LEVELS[ruleLevel(rule.id)].name}</b>
           <span class="recent-dots">${recentOf(rule.id).map(x => (x ? '🟩' : '🟥')).join('') || '—'}</span></div>`
      : `<div class="rule-title"><span>${rule.title}</span><span>🔒</span></div>
         <div class="rule-desc">Parla con il Mentore dell'area corrispondente per sbloccare questa regola.</div>`;
    container.appendChild(card);
  });

  const all = Object.keys(CURIOSITIES);
  const head = document.createElement('div');
  head.className = 'nb-section';
  head.innerHTML = `🔍 Curiosità sulle potenze <span>${state.curiosities.length}/${all.length}</span>`;
  container.appendChild(head);
  all.forEach(id => {
    const c = CURIOSITIES[id];
    const open = state.curiosities.includes(id);
    const card = document.createElement('div');
    card.className = `rule-card curiosity ${open ? '' : 'locked'}`;
    card.innerHTML = open
      ? `<div class="rule-title"><span>${c.icon} ${c.title}</span></div><div class="rule-desc">${c.text}</div>`
      : `<div class="rule-title"><span>❔ Curiosità nascosta</span><span>🔒</span></div>
         <div class="rule-desc">Esplora l'isola e leggi tutto quello che trovi.</div>`;
    container.appendChild(card);
  });

  const pages = DIARY.map((_, i) => i + 1).filter(n => flag(`dia${n}`));
  const dHead = document.createElement('div');
  dHead.className = 'nb-section';
  dHead.innerHTML = `📓 Diario di Lavinia <span>${pages.length}/${DIARY.length}</span>`;
  container.appendChild(dHead);
  const dCard = document.createElement('div');
  dCard.className = 'rule-card curiosity diary';
  dCard.innerHTML = pages.length
    ? pages.map(n => `<div class="rule-desc"><b>Pag. ${n}.</b> <i>${DIARY[n - 1]}</i></div>`).join('<hr>')
    : '<div class="rule-desc">Lavinia ha perso delle pagine viola in giro per l’isola...</div>';
  container.appendChild(dCard);
}

function renderInventory() {
  const container = $('inventory-content');
  container.innerHTML = '';
  const allStuff = [...state.crystals, ...state.items];

  if (allStuff.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:30px 10px; color:#94a3b8;">
        <div style="font-size:2.5rem; margin-bottom:8px;">🎒</div>
        Il tuo zaino è ancora vuoto.<br>Esplora l'isola e sconfiggi i Guardiani per raccogliere oggetti e Cristalli!
      </div>`;
  } else {
    const grid = document.createElement('div');
    grid.className = 'inv-grid';
    allStuff.forEach(obj => {
      const usable = ITEMS[obj.id] && ITEMS[obj.id].usable;
      const card = document.createElement('div');
      card.className = `inv-card ${usable ? 'usable' : ''}`;
      card.innerHTML = `
        <div class="inv-icon">${itemIconHTML(obj)}</div>
        <div class="inv-name">${obj.name}</div>
        <div class="inv-desc">${obj.desc}</div>
        ${usable ? '<button class="inv-use">✋ Usa</button>' : ''}`;
      if (usable) card.querySelector('.inv-use').onclick = () => selectItem(obj.id);
      grid.appendChild(card);
    });
    container.appendChild(grid);
  }

  const quests = Object.keys(QUESTS).filter(id => questState(id) !== 'none');
  if (quests.length) {
    const head = document.createElement('div');
    head.className = 'inv-section';
    head.textContent = '📜 Missioni';
    container.appendChild(head);
    quests.forEach(id => {
      const q = QUESTS[id];
      const done = questState(id) === 'done';
      const row = document.createElement('div');
      row.className = `quest-row ${done ? 'done' : ''}`;
      row.innerHTML = `<div><b>${q.icon} ${q.title}</b><div class="inv-desc">${q.desc}</div></div>
        <div class="quest-status">${done ? '✅' : q.progress ? q.progress() : '…'}</div>`;
      container.appendChild(row);
    });
  }
}

/* --------------------------------------------------------------------------
   AVVIO
   -------------------------------------------------------------------------- */
$('scene-svg').addEventListener('click', onSceneClick);
$('dialogue-text').addEventListener('click', skipTyping);
updateHUD();
initTitle();

/* --------------------------------------------------------------------------
   GIOCO OFFLINE (PWA): service worker e pulsante "Installa"
   -------------------------------------------------------------------------- */
let installPrompt = null;
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  installPrompt = e;
  $('btn-install').style.display = 'inline-block';
});
function installApp() {
  if (!installPrompt) return;
  installPrompt.prompt();
  installPrompt.userChoice.finally(() => {
    installPrompt = null;
    $('btn-install').style.display = 'none';
  });
}
