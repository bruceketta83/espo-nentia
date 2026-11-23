/* ==========================================================================
   MONDO: STANZE, PUNTI INTERATTIVI, OGGETTI, ENIGMI
   Ogni area può avere più stanze (area.rooms). Le aree senza stanze
   usano una sola stanza implicita costruita da area.layout.
   ========================================================================== */
let selectedItem = null;
let bubbleTarget = null;

/* --------------------------------------------------------------------------
   UTILITÀ PER I TESTI E LO STATO
   -------------------------------------------------------------------------- */
/* Una frase o un elenco di varianti: ne sceglie una a caso. */
function say(x) {
  if (typeof x === 'function') x = x();
  return Array.isArray(x) ? x[Math.floor(Math.random() * x.length)] : x;
}

const FAIL_USE = [
  'Non credo che funzioni.',
  'Mmm, no. Non ha senso.',
  'Nemmeno con tutta l’aura del mondo.',
  'Bella idea... ma no.',
  'Sei seria? Proviamo altro.',
  'Ehm... no. Anche il granchio ride.',
  'Boh. Così a random non funziona.',
  'Sus. Meglio di no.'
];

function flag(k) { return !!state.flags[k]; }
function setFlag(k, v = true) { state.flags[k] = v; saveState(); }
function hasItem(id) { return state.items.some(i => i.id === id); }

function giveItem(id) {
  if (hasItem(id)) return;
  const it = ITEMS[id];
  state.items.push({ id, ...it });
  saveState();
  updateHUD();
  toast(`${itemInlineHTML(id, it.icon)} Hai preso: <b>${it.name}</b>`);
  restartAnim(document.querySelector('[data-nav="inventory"]'), 'pop');
}

function removeItem(id) {
  state.items = state.items.filter(i => i.id !== id);
  saveState();
  updateHUD();
}

function addAura(n) {
  state.aura += n;
  saveState();
  updateHUD();
  popBadge('hud-aura');
}

function unlockCuriosity(id) {
  if (state.curiosities.includes(id)) return;
  state.curiosities.push(id);
  saveState();
  $('notebook-dot').style.display = 'block';
  toast(`🔍 Nuova Curiosità nel Taccuino: <b>${CURIOSITIES[id].title}</b>`);
  restartAnim(document.querySelector('[data-nav="notebook"]'), 'pop');
}

/* Notifiche in coda: una alla volta, così nessuna si perde. */
const toastQueue = [];
let toastBusy = false;
function toast(html) {
  toastQueue.push(html);
  if (!toastBusy) nextToast();
}
function nextToast() {
  const html = toastQueue.shift();
  if (html === undefined) { toastBusy = false; return; }
  toastBusy = true;
  const t = $('toast');
  t.innerHTML = html;
  t.classList.remove('show');
  void t.offsetWidth;
  t.classList.add('show');
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(nextToast, 280);
  }, 2400);
}

/* --------------------------------------------------------------------------
   STANZE
   -------------------------------------------------------------------------- */
function areaRooms(area) {
  return area.rooms || { main: { scene: area.scene, svgBg: area.svgBg, layout: area.layout } };
}
function currentRoomId(area) {
  const rooms = areaRooms(area);
  const r = state.rooms[area.id];
  return rooms[r] ? r : (area.startRoom || Object.keys(rooms)[0]);
}
function currentRoom(area) { return areaRooms(area)[currentRoomId(area)]; }
function roomLayout(area) { return currentRoom(area).layout; }

function npcRoomId(area, role) {
  const rooms = areaRooms(area);
  return Object.keys(rooms).find(k => rooms[k].layout[role]);
}
function findNpc(area, role) {
  const id = npcRoomId(area, role);
  return id ? areaRooms(area)[id].layout[role] : null;
}

function roomHotspots(area) {
  return (currentRoom(area).hotspots || []).filter(h => !h.visible || h.visible());
}
function roomExits(area) {
  return (currentRoom(area).exits || []).filter(e => !e.visible || e.visible());
}

/* Disegna un personaggio in una posizione della stanza (per le comparse). */
function charSVG(key, x, y, face = 1, id = '') {
  return `<g ${id ? `id="${id}"` : ''} transform="translate(${x} ${y})"><g transform="scale(${face} 1)">${CHARS[key].draw()}</g></g>`;
}

/* Zone cliccabili degli oggetti e scritte delle uscite. Gli oggetti si riconoscono perché ondeggiano. */
function worldMarkersHTML(area) {
  let html = '';
  roomHotspots(area).forEach(h => {
    const [x, y, w, hh] = h.box;
    html += `<rect data-hs="${h.id}" x="${x}" y="${y}" width="${w}" height="${hh}" fill="transparent"/>`;
  });
  // Uscite ai lati della scena: la scritta va in un angolo, lontano dagli oggetti.
  // Uscita a destra → angolo in alto a destra; uscita a sinistra → angolo in basso a sinistra.
  const corner = { left: 0, right: 0 };
  roomExits(area).forEach(e => {
    const [x, y, w, hh] = e.box;
    const label = e.locked && e.locked() ? `🔒 ${e.label}` : e.label;
    const lw = [...label].length * 4.6 + 14;
    const side = x <= 4 ? 'left' : x + w >= 396 ? 'right' : null;
    let lx, ly;
    if (side === 'right') {
      lx = 351 - lw / 2;
      ly = 46 + corner.right++ * 17;
    } else if (side === 'left') {
      lx = 49 + lw / 2;
      ly = 204 - corner.left++ * 17;
    } else {
      // Margine di 49: sui telefoni stretti i bordi della scena sono tagliati.
      lx = Math.min(Math.max(x + w / 2, lw / 2 + 49), 351 - lw / 2);
      ly = e.labelY || y + hh / 2;
    }
    html += `<rect data-exit="${e.id}" x="${x}" y="${y}" width="${w}" height="${hh}" fill="transparent"/>
      <g data-exit="${e.id}" transform="translate(${lx} ${ly})">
        <g class="exit-bob">
          <rect x="${-lw / 2}" y="-7.5" width="${lw}" height="13" rx="6.5" fill="rgba(15,23,42,0.85)" stroke="#38bdf8" stroke-width="1"/>
          <text x="0" y="1.6" font-size="7.5" fill="#e0f2fe" text-anchor="middle" font-weight="700" font-family="-apple-system, Segoe UI, Roboto, sans-serif">${label}</text>
        </g>
      </g>`;
  });
  return html;
}

function propsHTML(area) {
  // Gli oggetti cliccabili ondeggiano piano (non i personaggi, le porte e i veli di luce).
  return roomHotspots(area).filter(h => h.draw || h.obj).map((h, i) => {
    const svg = h.obj ? objHotspotSVG(h) : h.draw();
    const wobble = h.box[2] && !/porta|botola/.test(h.id) && !svg.includes('id="char-');
    return wobble ? `<g class="obj-wobble" style="animation-delay:-${(i * 0.37) % 2.4}s">${svg}</g>` : svg;
  }).join('');
}

/* Cambia stanza con una dissolvenza. */
function goRoom(area, roomId, arriveX, after) {
  closeBubble();
  fadeTransition(() => {
    state.rooms[area.id] = roomId;
    saveState();
    buildScene(area, arriveX);
    const room = currentRoom(area);
    const first = !flag(`visited_${area.id}_${roomId}`);
    setFlag(`visited_${area.id}_${roomId}`);
    if (after) { after(); return; }
    if (room.onEnter && room.onEnter(first)) return;
    showRoomMenu(area, say(room.enter));
  });
}

/* Menu della stanza: frase di Aria + aiuto + prossima area. */
function showRoomMenu(area, text) {
  if (!area.rooms) { showAreaMenu(area, text || say(area.intro)); return; }
  setFeedback('');
  setDialogue('Aria', 'Esploratrice', 'aria', text || say(currentRoom(area).enter), 'aria');
  clearChoices();
  if (area.objective) {
    addChoice('<span>💡 Cosa devo fare?</span><span>→</span>', () => {
      playSound('blip');
      showRoomMenu(area, `💡 ${say(area.objective())}`);
    });
  }
  if (state.completedAreas.includes(area.id) && area.id < AREAS.length - 1) {
    addChoice(`🚀 Vai a: ${AREAS[area.id + 1].name}`,
      () => { playSound('success'); renderArea(area.id + 1); }, 'primary-action');
  }
}

/* Aria commenta e torna al menu della stanza. */
function ariaSays(text) {
  showRoomMenu(AREAS[state.currentArea], say(text));
}

/* --------------------------------------------------------------------------
   FUMETTO DELLE AZIONI
   -------------------------------------------------------------------------- */
function actionsFor(area, target) {
  const list = [];
  if (target.kind === 'npc') {
    const c = target.ref;
    if (target.role === 'mentor') list.push({ icon: '💬', label: 'Parla', fn: () => startMentorDialogue(area) });
    else list.push({ icon: '⚔️', label: 'Sfida', fn: () => startGuardianChallenge(area) });
    if (c.look) list.push({ icon: '👁', label: 'Guarda', fn: () => ariaSays(c.look) });
    return list;
  }
  const h = target.ref;
  if (target.kind === 'exit') {
    (h.lockedActions || []).forEach(a => list.push(a));
    return list;
  }
  if (h.talk) list.push({ icon: '💬', label: 'Parla', fn: h.talk });
  if (h.read) list.push({ icon: '📖', label: 'Leggi', fn: h.read });
  if (h.take) list.push({ icon: '✋', label: 'Prendi', fn: h.take });
  if (h.use && (!h.useIf || h.useIf())) list.push({ icon: h.useIcon || '🔧', label: h.useLabel || 'Usa', fn: h.use });
  if (h.look) list.push({ icon: '👁', label: 'Guarda', fn: () => ariaSays(h.look) });
  return list;
}

function targetTitle(target) {
  if (target.kind === 'npc') return target.ref.label;
  return target.ref.name || target.ref.label;
}

function targetAnchor(area, target) {
  if (target.kind === 'npc') {
    const b = charBounds(area, target.role);
    return { x: target.ref.x, y: b.top - 2 };
  }
  const [x, y, w] = target.ref.box;
  return { x: x + w / 2, y: y - 2 };
}

function targetStand(target) {
  if (target.kind === 'npc') return target.ref.stand;
  return target.ref.stand !== undefined ? target.ref.stand : target.ref.box[0] + target.ref.box[2] / 2;
}

function openBubble(area, target) {
  const actions = actionsFor(area, target);
  if (!actions.length) return;
  // Una sola azione: niente fumetto, Aria la esegue subito.
  if (actions.length === 1) { runAction(area, target, actions[0].fn); return; }
  bubbleTarget = target;
  playSound('blip');
  const el = $('action-bubble');
  el.innerHTML = `<div class="bubble-title">${targetTitle(target)}</div>
    <div class="bubble-actions">${actions.map((a, i) =>
      `<button data-i="${i}"><span>${a.icon}</span>${a.label}</button>`).join('')}</div>`;
  el.querySelectorAll('button').forEach(b => {
    b.onclick = (ev) => {
      ev.stopPropagation();
      runAction(area, target, actions[Number(b.dataset.i)].fn);
    };
  });
  const container = $('scene-container');
  const a = targetAnchor(area, target);
  const p = svgToLocal(a.x, a.y, container);
  el.classList.add('open');
  const half = el.offsetWidth / 2;
  const left = Math.min(Math.max(p.x, half + 6), container.clientWidth - half - 6);
  el.style.left = `${left}px`;
  el.style.top = `${Math.max(p.y, el.offsetHeight + 6)}px`;
}

function closeBubble() {
  bubbleTarget = null;
  const el = $('action-bubble');
  if (el) el.classList.remove('open');
}

function runAction(area, target, fn) {
  closeBubble();
  const stand = targetStand(target);
  const faceX = target.kind === 'npc' ? target.ref.x : target.ref.box[0] + target.ref.box[2] / 2;
  walkTo(stand, () => {
    if (Math.abs(faceX - ariaX) > 2) faceAria(faceX > ariaX ? 1 : -1);
    fn();
  });
}

/* --------------------------------------------------------------------------
   OGGETTI DELLO ZAINO: MODALITÀ "USA SU..."
   -------------------------------------------------------------------------- */
function selectItem(id) {
  selectedItem = id;
  closeModal('inventory');
  const it = ITEMS[id] || state.items.find(i => i.id === id);
  // La richiesta appare nel riquadro del dialogo: niente fasce sopra la scena.
  setDialogue('Aria', 'Esploratrice', 'aria', `${itemInlineHTML(id, it.icon)} Su cosa uso <b>${it.name}</b>? Tocca un oggetto o un personaggio nella scena.`, 'aria');
  clearChoices();
  addChoice('✕ Annulla', () => { cancelUse(); ariaSays(null); });
}

function cancelUse(ev) {
  if (ev) ev.stopPropagation();
  selectedItem = null;
}

function useSelectedOn(area, target) {
  const id = selectedItem;
  cancelUse();
  const handler = target.ref.useItem && target.ref.useItem[id];
  runAction(area, target, handler || (() => ariaSays(FAIL_USE)));
}

/* --------------------------------------------------------------------------
   CLIC SULLA SCENA
   -------------------------------------------------------------------------- */
function worldClick(area, e) {
  const hsEl = e.target.closest('[data-hs]');
  const exEl = e.target.closest('[data-exit]');
  const npcEl = e.target.closest('[data-role]');
  let target = null;
  if (hsEl) target = { kind: 'hs', ref: roomHotspots(area).find(h => h.id === hsEl.dataset.hs) };
  else if (npcEl) target = { kind: 'npc', role: npcEl.dataset.role, ref: roomLayout(area)[npcEl.dataset.role] };
  else if (exEl) target = { kind: 'exit', ref: roomExits(area).find(x => x.id === exEl.dataset.exit) };

  if (!target || !target.ref) {
    closeBubble();
    return false;
  }
  if (selectedItem) { useSelectedOn(area, target); return true; }
  if (target.kind === 'exit') {
    const ex = target.ref;
    if (ex.locked && ex.locked()) { openBubble(area, target); return true; }
    closeBubble();
    playSound('blip');
    // Uscita verso un'altra area (avanti o indietro sull'isola).
    if (ex.toArea !== undefined) walkTo(ex.stand, () => travelTo(ex.toArea, ex.toRoom, ex.arrive));
    else walkTo(ex.stand, () => goRoom(area, ex.to, ex.arrive));
    return true;
  }
  openBubble(area, target);
  return true;
}

/* --------------------------------------------------------------------------
   LETTURE (pergamene, cartelli, curiosità)
   -------------------------------------------------------------------------- */
function showReading(title, html, after) {
  setDialogue(title, 'Da leggere', '📜', html, null, 'parchment');
  clearChoices();
  addChoice('Ok, ho letto →', () => { playSound('blip'); after ? after() : ariaSays(null); }, 'primary-action');
}

function readCuriosity(id) {
  const c = CURIOSITIES[id];
  showReading(`${c.icon} ${c.title}`, c.text, () => {
    unlockCuriosity(id);
    ariaSays(c.comment || ['Wow. Le potenze sono ovunque!', 'Questa la racconto in classe.', 'Ok, questa è pazzesca.']);
  });
}

/* --------------------------------------------------------------------------
   LUCCHETTO A COMBINAZIONE
   -------------------------------------------------------------------------- */
function askCode({ title, prompt, answer, onSuccess }) {
  let entered = '';
  setDialogue(title, 'Lucchetto a combinazione', '🔒', prompt, null);
  const c = clearChoices();
  const pad = document.createElement('div');
  pad.className = 'keypad';
  pad.innerHTML = `<div class="keypad-display">${'_ '.repeat(answer.length).trim()}</div>
    <div class="keypad-grid">${[1, 2, 3, 4, 5, 6, 7, 8, 9, '⌫', 0, 'OK'].map(k =>
      `<button data-k="${k}" class="${k === 'OK' ? 'ok' : ''}">${k}</button>`).join('')}</div>`;
  c.appendChild(pad);
  addChoice('↩️ Lascia stare', () => ariaSays(null));
  scrollDialogueToEnd();
  const display = pad.querySelector('.keypad-display');
  const render = () => {
    display.textContent = (entered + '_'.repeat(answer.length - entered.length)).split('').join(' ');
  };
  pad.querySelectorAll('button').forEach(b => {
    b.onclick = () => {
      const k = b.dataset.k;
      if (k === '⌫') entered = entered.slice(0, -1);
      else if (k === 'OK') {
        if (entered === answer) { playSound('success'); onSuccess(); return; }
        playSound('error');
        restartAnim(display, 'shake-x');
        setFeedback(`<div class="feedback-banner feedback-error">🔒 ${say(['Clack! Codice sbagliato.', 'Il lucchetto non si apre. Ricontrolla il calcolo.', 'Niente da fare. Prova a rileggere l’indizio.'])}</div>`);
        entered = '';
      } else if (entered.length < answer.length) {
        entered += k;
        playSound('blip');
      }
      render();
    };
  });
  render();
}

/* --------------------------------------------------------------------------
   DOMANDA LAMPO (per le comparse, es. Lavinia)
   -------------------------------------------------------------------------- */
function quickQuestion(q, who, onDone) {
  setDialogue(who.name, who.role, who.avatar, `${who.intro ? `<p class="g-intro">${who.intro}</p>` : ''}<div>${q.prompt}</div>`, who.speaker);
  const c = clearChoices();
  const grid = document.createElement('div');
  grid.className = 'choices-grid';
  shuffle(q.options).forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn math-choice';
    btn.innerHTML = formatMathString(opt.text);
    btn._opt = opt;
    btn.onclick = () => {
      grid.querySelectorAll('button').forEach(b => {
        b.disabled = true;
        if (b._opt.correct) b.classList.add('right');
      });
      recordStat(q.ruleId, opt.correct);
      if (opt.correct) {
        playSound('hit');
        btn.classList.add('right');
        state.aura += 30;
        saveState();
        updateHUD();
        popBadge('hud-aura');
        setFeedback(`<div class="feedback-banner feedback-success">✅ <b>Esatto! +30 Aura</b><div class="solution">${q.steps}</div></div>`);
      } else {
        playSound('error');
        btn.classList.add('wrong');
        setFeedback(`<div class="feedback-banner feedback-error">❌ <b>${opt.msg}</b><div class="solution">✔️ ${q.steps}</div></div>`);
      }
      saveState();
      addChoice('Continua →', () => { setFeedback(''); onDone(opt.correct); }, 'primary-action');
      scrollDialogueToEnd();
    };
    grid.appendChild(btn);
  });
  c.appendChild(grid);
}

/* --------------------------------------------------------------------------
   MISSIONI SECONDARIE
   -------------------------------------------------------------------------- */
function questState(id) { return state.quests[id] || 'none'; }
function setQuest(id, s) {
  const before = state.quests[id];
  state.quests[id] = s;
  saveState();
  if (s === 'active' && before !== 'active') toast(`📜 Nuova missione: <b>${QUESTS[id].title}</b>`);
  if (s === 'done') toast(`🏅 Missione completata: <b>${QUESTS[id].title}</b>`);
}

/* --------------------------------------------------------------------------
   SCELTA CON NUOVO TENTATIVO (bilance, botti, enigmi a scelta)
   -------------------------------------------------------------------------- */
function askChoice({ title, role, avatar, prompt, options, onSuccess }) {
  setDialogue(title, role || 'Enigma', avatar || '🧩', prompt, null);
  const c = clearChoices();
  const grid = document.createElement('div');
  grid.className = 'choices-grid';
  shuffle(options).forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn math-choice';
    btn.innerHTML = formatMathString(opt.text);
    btn.onclick = () => {
      if (opt.correct) {
        playSound('success');
        grid.querySelectorAll('button').forEach(b => { b.disabled = true; });
        btn.classList.add('right');
        setFeedback('');
        setTimeout(onSuccess, 600);
        return;
      }
      playSound('error');
      btn.classList.add('wrong');
      btn.disabled = true;
      setFeedback(`<div class="feedback-banner feedback-error">❌ ${say(opt.msg)}</div>`);
      scrollDialogueToEnd();
    };
    grid.appendChild(btn);
  });
  c.appendChild(grid);
  addChoice('↩️ Lascia stare', () => ariaSays(null));
}

/* --------------------------------------------------------------------------
   MISSIONI A RACCOLTA (boccali, bulloni, pagine...)
   -------------------------------------------------------------------------- */
function questCount(id) {
  const q = QUESTS[id];
  return q.count ? q.count() : q.flags.filter(flag).length;
}
function questTotal(id) { return QUESTS[id].total || QUESTS[id].flags.length; }

function collectPiece(questId, flagKey, lines) {
  const q = QUESTS[questId];
  setFlag(flagKey);
  playSound('crystal');
  refreshLabels(AREAS[state.currentArea]);
  if (questState(questId) === 'none' && q.autoStart) setQuest(questId, 'active');
  const n = questCount(questId);
  const tot = questTotal(questId);
  toast(`${q.icon} ${q.piece} trovato! <b>${n}/${tot}</b>`);
  if (n === tot && q.onComplete && questState(questId) !== 'done') { q.onComplete(); return; }
  if (n === tot && q.giverName) {
    ariaSays(`Ho tutto! Torno da ${q.giverName}.`);
    return;
  }
  ariaSays(lines || [`Un altro pezzo: ${n} su ${tot}.`, `${q.piece}! Ne ho ${n} su ${tot}.`]);
}

/* Scelta "Consegna" per chi ha dato la missione. */
function questDeliverChoice(questId, who, reward, thanks) {
  if (questState(questId) !== 'active' || questCount(questId) < questTotal(questId)) return [];
  return [{
    html: `${QUESTS[questId].icon} Consegna: ${QUESTS[questId].title}`,
    cls: 'primary-action',
    fn: () => {
      setQuest(questId, 'done');
      addAura(reward);
      playSound('victory');
      setDialogue(who.name, who.role, who.avatar, thanks, who.speaker || 'mentor');
      clearChoices();
      addChoice('↩️ Continua a esplorare', () => ariaSays(null), 'primary-action');
    }
  }];
}

/* --------------------------------------------------------------------------
   NUMERI CASUALI DEGLI ENIGMI (diversi per ogni profilo, fissi nel profilo)
   -------------------------------------------------------------------------- */
function puz(key, gen) {
  if (!state.puz) state.puz = {};
  if (!state.puz[key]) {
    state.puz[key] = gen();
    writeSave();
  }
  return state.puz[key];
}
function P_molo() { return puz('molo', () => ({ a: rnd(4, 9), b: rnd(6, 9) })); }
function P_botti() {
  return puz('botti', () => {
    const k = rnd(2, 6);
    const make = (d) => { const n = rnd(2, 6); return { m: n + d, n }; };
    const kegs = shuffle([{ ...make(k), ok: true }, { ...make(k + 1) }, { ...make(k > 2 ? k - 1 : k + 2) }]);
    ['A', 'B', 'C'].forEach((l, i) => { kegs[i].l = l; });
    return { k, kegs };
  });
}
function P_torre() { return puz('torre', () => ({ b: pick([2, 3, 5, 7]), m: rnd(3, 6), n: rnd(2, 4) })); }
function P_serra() { return puz('serra', () => ({ a: rnd(3, 99), b: rnd(11, 40), c: rnd(2, 9) })); }
function P_bilancia() {
  return puz('bilancia', () => { const [a, b] = pick([[2, 5], [3, 4], [2, 7], [4, 5], [3, 5]]); return { a, b, n: rnd(3, 6) }; });
}

/* --------------------------------------------------------------------------
   VIAGGIO TRA AREE (stanza e posizione di arrivo precise)
   -------------------------------------------------------------------------- */
let pendingArrive = null;
function travelTo(areaId, roomId, arriveX) {
  if (roomId) state.rooms[areaId] = roomId;
  pendingArrive = arriveX !== undefined ? arriveX : null;
  renderArea(areaId);
}
