/* ==========================================================================
   META-GIOCO: MEDAGLIE, NEGOZIO DELL'AURA, PROFILI, MAPPA ILLUSTRATA
   ========================================================================== */

/* --------------------------------------------------------------------------
   MEDAGLIE
   -------------------------------------------------------------------------- */
const MEDALS = [
  { id: 'cristallo', icon: '💎', name: 'Primo cristallo', desc: 'Vinci il primo duello.', check: () => state.crystals.length >= 1 },
  { id: 'lettrice', icon: '🧭', name: 'Esploratrice', desc: 'Leggi la tua prima Curiosità.', check: () => state.curiosities.length >= 1 },
  { id: 'perfetto', icon: '🎯', name: 'Zero errori', desc: 'Vinci un duello senza errori.', check: () => flag('perfect') },
  { id: 'combo', icon: '🔥', name: 'Combo x4', desc: 'Dai 4 risposte giuste di fila (si può solo nel Duello Finale!).', check: () => (state.maxStreak || 0) >= 4 },
  { id: 'curiosa', icon: '🔍', name: 'Super curiosa', desc: 'Leggi tutte le Curiosità dell’isola.', check: () => state.curiosities.length >= Object.keys(CURIOSITIES).length },
  { id: 'detective', icon: '📓', name: 'Detective', desc: 'Trova tutte le pagine del diario di Lavinia.', check: () => questState('diario') === 'done' },
  { id: 'aiutante', icon: '🤝', name: 'Aiutante dell’isola', desc: 'Completa le missioni di Vera, Oste, Archimede e Gemelle.', check: () => ['dobloni', 'boccali', 'cannocchiale', 'bulloni'].every(q => questState(q) === 'done') },
  { id: 'zittalavinia', icon: '👑', name: 'Zitta, Lavinia!', desc: 'Rispondi giusto a tutte le domande lampo di Lavinia.', check: () => [0, 1, 2, 3, 4].every(i => flag(`lav${i}_won`)) },
  { id: 'aura', icon: '✨', name: 'Aura stellare', desc: 'Raggiungi 1000 Aura.', check: () => state.aura >= 1000 },
  { id: 'shopping', icon: '🛍️', name: 'Fashion victim', desc: 'Compra un oggetto nel Negozio dell’Aura.', check: () => state.owned.length >= 1 || flag('shopped') },
  { id: 'stelle', icon: '⭐', name: 'Tutte le stelle', desc: 'Fai 3 stelle in tutte le 6 aree.', check: () => AREAS.every(a => (state.stars[a.id] || 0) === 3) },
  { id: 'faro', icon: '🏆', name: 'Eroina del Faro', desc: 'Accendi il Faro e salva l’isola.', check: () => state.gameWon }
];

let medalsChecking = false;
function checkMedals() {
  if (medalsChecking || !gameStarted) return;
  medalsChecking = true;
  const got = MEDALS.filter(m => !state.medals.includes(m.id) && m.check());
  if (got.length) {
    got.forEach(m => state.medals.push(m.id));
    writeSave();
    got.forEach(m => toast(`🏅 Nuova medaglia: <b>${m.icon} ${m.name}</b>`));
    playSound('crystal');
    restartAnim(document.querySelector('[data-nav="profile"]'), 'pop');
  }
  medalsChecking = false;
}

/* --------------------------------------------------------------------------
   NEGOZIO DELL'AURA (aspetto di Aria)
   -------------------------------------------------------------------------- */
/* Per ora il negozio non vende accessori per Aria (torneranno con le immagini nuove). */
const SHOP_SLOTS = [];
const SHOP = [];

/* Look di Aria tolto dal negozio (colori, cappelli, occhiali).
   Chi li aveva comprati riceve indietro l'Aura, una volta sola. */
const SHOP_REMOVED = {
  'hat-none': 0,
  'hat-fiore': 60,
  'hat-cappellino': 100,
  'hat-cuffie': 120,
  'hat-pirata': 180,
  'hat-corona': 300,
  'glasses-none': 0,
  'glasses-rosa': 120,
  'glasses-oro': 160,
  'tunic-teal': 0,
  'tunic-viola': 80,
  'tunic-rosa': 80,
  'tunic-rosso': 80,
  'tunic-notte': 120,
  'tunic-oro': 200,
  'scarf-rossa': 0,
  'scarf-azzurra': 50,
  'scarf-verde': 50,
  'scarf-oro': 90,
  'pack-marrone': 0,
  'pack-rosa': 60,
  'pack-nero': 60,
  'pack-viola': 60,
};
function refundRemovedLook(s) {
  let back = 0;
  s.owned = (s.owned || []).filter(id => {
    if (!(id in SHOP_REMOVED)) return true;
    back += SHOP_REMOVED[id];
    return false;
  });
  s.look = {};
  s.aura = (s.aura || 0) + back;
  return back;
}

function shopOwned(item) { return item.price === 0 || state.owned.includes(item.id); }
function shopEquipped(item) { return (state.look[item.slot] || null) === item.value; }

/* Oggetti utili (si consumano, tranne la Bussola). */
const CONSUMABLES = [
  { id: 'cuore', icon: '❤️', name: 'Cuore extra', desc: 'Nel prossimo duello parti con 4 cuori invece di 3.', price: 80 },
  { id: 'aiuto', icon: '💡', name: 'Pergamena aiutino', desc: 'Un "Aiutino" gratis in un duello (toglie una risposta sbagliata).', price: 40 },
  { id: 'pozione', icon: '🧪', name: 'Pozione Doppia Aura', desc: 'Nel prossimo duello ogni risposta giusta vale il doppio di Aura.', price: 120 },
  { id: 'bussola', icon: '🧭', name: 'Bussola dei tesori', desc: 'Per sempre: sulla mappa vedi dove mancano oggetti da raccogliere.', price: 150, once: true }
];
function consCount(id) { return (state.cons && state.cons[id]) || 0; }
function useCons(id) {
  if (consCount(id) <= 0) return false;
  state.cons[id]--;
  saveState();
  return true;
}

function refreshShopViews() {
  if ($('modal-shop').classList.contains('open')) renderShop();
  if ($('modal-profile').classList.contains('open')) renderProfile();
  if (gameStarted && !duel) {
    const flip = $('aria-flip');
    if (flip) flip.innerHTML = CHARS.aria.draw();
  }
}

function shopPick(id) {
  const item = SHOP.find(i => i.id === id);
  if (!shopOwned(item)) {
    if (!$('modal-shop').classList.contains('open')) {
      toast('Questo si compra da <b>Zia Turbina</b> nella Piazza del Mercato!');
      return;
    }
    if (state.aura < item.price) {
      playSound('error');
      toast(`Ti servono <b>${item.price} Aura</b>. Ne hai ${state.aura}. Vinci duelli e completa missioni!`);
      return;
    }
    state.aura -= item.price;
    state.owned.push(item.id);
    playSound('victory');
    toast(`🛍️ Comprato: <b>${item.name}</b> (−${item.price} Aura). ${say(TURBINA.bought)}`);
  } else {
    playSound('blip');
  }
  if (item.value === null) delete state.look[item.slot];
  else state.look[item.slot] = item.value;
  saveState();
  updateHUD();
  refreshShopViews();
}

function buyConsumable(id) {
  const c = CONSUMABLES.find(x => x.id === id);
  if (c.once && flag(id)) { toast('Ce l’hai già! Zia Turbina dice: "Due bussole fanno girare la testa."'); return; }
  if (state.aura < c.price) {
    playSound('error');
    toast(`Ti servono <b>${c.price} Aura</b>. Ne hai ${state.aura}.`);
    return;
  }
  state.aura -= c.price;
  state.flags.shopped = true;
  if (c.once) state.flags[id] = true;
  else state.cons[id] = consCount(id) + 1;
  playSound('victory');
  toast(`${c.icon} Comprato: <b>${c.name}</b>! ${say(TURBINA.bought)}`);
  saveState();
  updateHUD();
  refreshShopViews();
}

function cosmeticsHTML(onlyOwned) {
  let body = '';
  SHOP_SLOTS.forEach(slot => {
    const items = SHOP.filter(i => i.slot === slot.id && (!onlyOwned || shopOwned(i)));
    if (!items.length) return;
    body += `<div class="inv-section">${slot.name}</div><div class="shop-grid">`;
    items.forEach(i => {
      const owned = shopOwned(i);
      const eq = shopEquipped(i);
      const sw = i.color ? `<span class="swatch" style="background:${i.color}"></span>` : `<span class="swatch-emoji">${i.swatch}</span>`;
      body += `<button class="shop-item ${eq ? 'equipped' : ''} ${owned ? 'owned' : ''}" onclick="shopPick('${i.id}')">
        ${sw}<span class="shop-item-name">${i.name}</span>
        <span class="shop-price">${eq ? '✓ Indossato' : owned ? 'Indossa' : `✨ ${i.price}`}</span></button>`;
    });
    body += '</div>';
  });
  return body;
}

/* Negozio: si apre solo parlando con Zia Turbina in Piazza. */
function openShop() {
  playSound('blip');
  renderShop();
  $('modal-shop').classList.add('open');
}

function renderShop() {
  const c = $('shop-content');
  const useful = CONSUMABLES.map(x => {
    const have = x.once ? (flag(x.id) ? '✓ Tua' : '') : (consCount(x.id) ? `Ne hai ${consCount(x.id)}` : '');
    return `<button class="cons-item" onclick="buyConsumable('${x.id}')">
      <span class="cons-icon">${x.icon}</span>
      <span class="cons-text"><b>${x.name}</b><small>${x.desc}</small>${have ? `<em>${have}</em>` : ''}</span>
      <span class="shop-price">${x.once && flag(x.id) ? '✓' : `✨ ${x.price}`}</span></button>`;
  }).join('');
  c.innerHTML = `<div class="shop-head">
      <svg viewBox="${CHARS.turbina.portraitVB}" class="shop-preview small">${CHARS.turbina.draw()}</svg>
      <div><div class="shop-name">🌀 Zia Turbina</div><div class="shop-aura">✨ ${state.aura} Aura</div>
      <div class="inv-desc">"${say(['Tocca, compra, indossa! Restituzioni? Mai sentite.', 'Tutto originale! Tranne quello che non lo è.', 'Prezzi esponenziali! Cioè... normali. Ma il nome è bello.'])}"</div></div>
    </div>
    <div class="inv-section">🧪 Oggetti utili</div>
    <div class="cons-list">${useful}</div>
    ${SHOP.length ? `<div class="shop-head small-head">
      <svg viewBox="-26 -70 52 76" class="shop-preview">${CHARS.aria.draw()}</svg>
      <div><div class="shop-name">👗 Look di Aria</div><div class="inv-desc">Tocca per comprare o indossare.</div></div>
    </div>
    ${cosmeticsHTML(false)}` : ''}`;
}

/* --------------------------------------------------------------------------
   MODALE PROFILO: ARMADIO + MEDAGLIE
   -------------------------------------------------------------------------- */
let profileTab = 'wardrobe';
function renderProfile(tab) {
  if (tab) profileTab = tab === 'shop' ? 'wardrobe' : tab;
  const c = $('profile-content');
  const me = currentProfile();
  const tabs = `<div class="tabs">
    <button class="${profileTab === 'wardrobe' ? 'on' : ''}" onclick="renderProfile('wardrobe')">🎒 Oggetti</button>
    <button class="${profileTab === 'medals' ? 'on' : ''}" onclick="renderProfile('medals')">🏅 Medaglie ${state.medals.length}/${MEDALS.length}</button>
    <button class="${profileTab === 'reading' ? 'on' : ''}" onclick="renderProfile('reading')">🔤 Lettura</button>
  </div>`;
  let body = '';
  if (profileTab === 'wardrobe') {
    const cons = CONSUMABLES.filter(x => !x.once && consCount(x.id)).map(x => `${x.icon} ${x.name} ×${consCount(x.id)}`)
      .concat(CONSUMABLES.filter(x => x.once && flag(x.id)).map(x => `${x.icon} ${x.name}`));
    body = `<div class="shop-head">
        <svg viewBox="-26 -70 52 76" class="shop-preview">${CHARS.aria.draw()}</svg>
        <div><div class="shop-name">👤 ${me.name}</div><div class="shop-aura">✨ ${state.aura} Aura</div>
        <div class="inv-desc">Vuoi oggetti utili? Vai da <b>Zia Turbina</b> nella Piazza del Mercato!</div></div>
      </div>
      ${cons.length ? `<div class="inv-section">🧪 I tuoi oggetti utili</div><div class="inv-desc">${cons.join(' · ')}</div>` : ''}
      ${cosmeticsHTML(true)}`;
  } else if (profileTab === 'reading') {
    body = renderReadingTab();
  } else {
    body = '<div class="medal-grid">' + MEDALS.map(m => {
      const on = state.medals.includes(m.id);
      return `<div class="medal ${on ? 'on' : ''}"><div class="medal-icon">${on ? m.icon : '🔒'}</div>
        <div class="medal-name">${m.name}</div><div class="medal-desc">${m.desc}</div></div>`;
    }).join('') + '</div>';
  }
  c.innerHTML = tabs + body;
}

/* --------------------------------------------------------------------------
   PROFILI (più giocatrici sullo stesso dispositivo)
   -------------------------------------------------------------------------- */
function currentProfile() {
  return profiles.list.find(p => p.id === profiles.current) || profiles.list[0];
}

function profileSummary(id) {
  try {
    const raw = localStorage.getItem(profileSaveKey(id));
    if (!raw) return 'Nuova partita';
    const s = JSON.parse(raw);
    const stars = Object.values(s.stars || {}).reduce((a, b) => a + b, 0);
    return `💎 ${(s.crystals || []).length}/5 · ⭐ ${stars} · ✨ ${s.aura || 0}`;
  } catch (e) { return ''; }
}

function openPlayers() {
  playSound('blip');
  renderPlayers();
  $('modal-players').classList.add('open');
}

function renderPlayers() {
  const c = $('players-content');
  c.innerHTML = profiles.list.map(p => `
    <div class="player-row ${p.id === profiles.current ? 'current' : ''}">
      <div><b>👤 ${p.name}</b><div class="inv-desc">${profileSummary(p.id)}</div></div>
      <div class="player-actions">
        ${p.id === profiles.current ? '<span class="quest-status">In uso</span>' : `<button onclick="switchProfile('${p.id}')">▶ Gioca</button>`}
        ${profiles.list.length > 1 ? `<button class="danger" onclick="deleteProfile('${p.id}')">🗑</button>` : ''}
      </div>
    </div>`).join('') + (profiles.list.length < 6 ? `
    <div class="player-new">
      <input id="new-player-name" maxlength="14" placeholder="Nome della nuova giocatrice">
      <button onclick="createProfile()">➕ Crea</button>
    </div>` : '<div class="inv-desc">Massimo 6 profili.</div>');
}

function createProfile() {
  const input = $('new-player-name');
  const name = (input.value || '').trim().replace(/[<>&"]/g, '').slice(0, 14);
  if (!name) { input.focus(); return; }
  const id = `p${Date.now().toString(36)}`;
  profiles.list.push({ id, name });
  profiles.current = id;
  saveProfiles();
  location.reload();
}

function switchProfile(id) {
  profiles.current = id;
  saveProfiles();
  location.reload();
}

function deleteProfile(id) {
  const p = profiles.list.find(x => x.id === id);
  if (!window.confirm(`Cancellare il profilo "${p.name}" e tutti i suoi progressi?`)) return;
  try { localStorage.removeItem(profileSaveKey(id)); } catch (e) {}
  profiles.list = profiles.list.filter(x => x.id !== id);
  if (profiles.current === id) {
    profiles.current = profiles.list[0].id;
    saveProfiles();
    location.reload();
    return;
  }
  saveProfiles();
  renderPlayers();
}

/* --------------------------------------------------------------------------
   MAPPA ILLUSTRATA DELL'ISOLA (rete di strade e punti centrali)
   -------------------------------------------------------------------------- */
/* Luoghi della mappa: area, stanza, posizione. hub = viaggio rapido. */
const MAP_NODES = [
  { id: 'molo', area: 0, room: 'spiaggia', x: 62, y: 352, icon: '⚓', name: 'Molo', hub: true, unlock: () => true },
  { id: 'piazza', area: 1, room: 'piazza', x: 150, y: 318, icon: '🏛️', name: 'Piazza del Mercato', hub: true, unlock: () => state.unlockedArea >= 1 },
  { id: 'taverna', area: 1, room: 'strada', x: 244, y: 350, icon: '🍺', name: 'Taverna', unlock: () => state.unlockedArea >= 1 },
  { id: 'torre', area: 2, room: 'terrazza', x: 92, y: 236, icon: '🔭', name: 'Torre', unlock: () => state.unlockedArea >= 2 },
  { id: 'belvedere', area: 2, room: 'belvedere', x: 172, y: 176, icon: '🎈', name: 'Belvedere', hub: true, unlock: () => state.completedAreas.includes(2) },
  { id: 'serra', area: 3, room: 'giardino', x: 250, y: 222, icon: '🌺', name: 'Serra', unlock: () => state.unlockedArea >= 3 },
  { id: 'officina', area: 4, room: 'officina', x: 74, y: 124, icon: '⚙️', name: 'Officina', unlock: () => state.unlockedArea >= 4 },
  { id: 'faro', area: 5, room: 'scala', x: 204, y: 60, icon: '🌟', name: 'Faro', unlock: () => state.unlockedArea >= 5 }
];
const MAP_EDGES = [
  ['molo', 'piazza'], ['piazza', 'taverna'], ['piazza', 'torre'], ['torre', 'belvedere'],
  ['belvedere', 'serra'], ['belvedere', 'officina'], ['belvedere', 'faro'], ['officina', 'faro'], ['serra', 'officina', 'ponte']
];
/* Punto centrale da cui si raggiunge a piedi ogni luogo. */
const MAP_VIA = { taverna: 'Piazza del Mercato', torre: 'Piazza del Mercato', serra: 'Belvedere', officina: 'Belvedere', faro: 'Belvedere' };
/* Dove si trova ogni pezzo da raccogliere (per la Bussola dei tesori). */
const PIECE_PLACES = {
  coin1: ['molo', '💰'], coin2: ['taverna', '💰'], coin3: ['molo', '💰'],
  mug1: ['torre', '🍺'], mug2: ['taverna', '🍺'], mug3: ['serra', '🍺'],
  bul1: ['officina', '🔩'], bul2: ['molo', '🔩'], bul3: ['torre', '🔩'],
  dia1: ['molo', '📓'], dia2: ['taverna', '📓'], dia3: ['torre', '📓'], dia4: ['serra', '📓'], dia5: ['faro', '📓']
};

function currentMapNode() {
  const a = state.currentArea;
  const r = currentRoomId(AREAS[a]);
  if (a === 1) return r === 'piazza' ? 'piazza' : 'taverna';
  if (a === 2) return r === 'belvedere' ? 'belvedere' : 'torre';
  return MAP_NODES.find(n => n.area === a).id;
}

function renderMap() {
  const c = $('map-content');
  const byId = Object.fromEntries(MAP_NODES.map(n => [n.id, n]));
  const here = currentMapNode();
  const bussola = flag('bussola');
  const missing = {};
  if (bussola) {
    Object.entries(PIECE_PLACES).forEach(([f, [place, icon]]) => {
      if (!flag(f)) missing[place] = (missing[place] || '') + icon;
    });
  }
  const edges = MAP_EDGES.map(([a, b, kind]) => {
    const A = byId[a], B = byId[b];
    const open = A.unlock() && B.unlock();
    return `<line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" stroke="${kind ? '#a16207' : '#fef3c7'}" stroke-width="${kind ? 2.5 : 3}" stroke-dasharray="${kind ? '6 3' : '2 6'}" stroke-linecap="round" opacity="${open ? 0.95 : 0.35}"/>`;
  }).join('');
  const nodes = MAP_NODES.map(n => {
    const unlocked = n.unlock();
    const completed = state.completedAreas.includes(n.area) && !n.hub;
    const fill = n.hub ? '#0ea5e9' : completed ? '#10b981' : unlocked ? '#f59e0b' : '#475569';
    const stars = completed ? '⭐'.repeat(state.stars[n.area] || 0) : '';
    const miss = unlocked && missing[n.id] ? missing[n.id] : '';
    const lines = (stars ? 1 : 0) + (miss ? 1 : 0);
    return `<g class="map-node ${unlocked ? 'unlocked' : 'locked'} ${n.hub ? 'hub' : ''}" data-node="${n.id}" transform="translate(${n.x} ${n.y})">
      ${n.id === here ? '<circle r="27" fill="none" stroke="#fde047" stroke-width="2.5" class="map-pulse"/>' : ''}
      <circle r="${n.hub ? 21 : 18}" fill="${fill}" stroke="${n.hub ? '#e0f2fe' : '#0f172a'}" stroke-width="3"/>
      <text y="6" font-size="${n.hub ? 18 : 16}" text-anchor="middle">${unlocked ? n.icon : '🔒'}</text>
      <rect x="-50" y="22" width="100" height="${16 + lines * 11}" rx="7" fill="rgba(15,23,42,0.85)"/>
      <text y="33" font-size="9" fill="#f8fafc" text-anchor="middle" font-weight="800" font-family="-apple-system, Segoe UI, Roboto, sans-serif">${n.hub ? '✈ ' : ''}${n.name}</text>
      ${stars ? `<text y="45" font-size="7.5" text-anchor="middle">${stars}</text>` : ''}
      ${miss ? `<text y="${stars ? 56 : 45}" font-size="7.5" text-anchor="middle">${miss}</text>` : ''}
      ${n.id === here ? '<g class="map-pin"><text x="0" y="-24" font-size="16" text-anchor="middle">📍</text></g>' : ''}
    </g>`;
  }).join('');

  c.innerHTML = `
    <svg viewBox="0 0 300 410" class="island-map">
      <defs>
        <radialGradient id="mp-sea" cx="0.5" cy="0.5" r="0.75"><stop offset="0" stop-color="#0ea5e9"/><stop offset="1" stop-color="#1e3a8a"/></radialGradient>
        <linearGradient id="mp-land" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4d7c0f"/><stop offset="1" stop-color="#65a30d"/></linearGradient>
      </defs>
      <rect width="300" height="410" fill="url(#mp-sea)"/>
      <g class="wave" style="animation-duration:9s"><path d="${wavePath(30, 2)}" stroke="#bae6fd" stroke-opacity="0.35" fill="none"/></g>
      <g class="wave" style="animation-duration:12s;animation-direction:reverse"><path d="${wavePath(395, 2)}" stroke="#bae6fd" stroke-opacity="0.35" fill="none"/></g>
      <path d="M150 22 Q228 26 262 82 Q290 140 268 212 Q292 288 252 346 Q206 398 120 392 Q40 384 26 318 Q12 248 46 190 Q26 120 70 66 Q100 24 150 22 Z" fill="#f6d38b"/>
      <path d="M150 34 Q220 38 250 88 Q274 140 254 210 Q276 284 240 334 Q200 380 124 376 Q54 368 42 312 Q30 250 62 192 Q44 124 82 74 Q108 36 150 34 Z" fill="url(#mp-land)"/>
      <path d="M150 90 Q200 30 250 96 Z" fill="#78716c" opacity="0.8"/>
      <g fill="#166534">${[[60, 290], [262, 280], [140, 260], [236, 140], [52, 176], [120, 120]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7"/><circle cx="${x + 7}" cy="${y + 3}" r="5"/>`).join('')}</g>
      <g transform="translate(270 386)"><circle r="13" fill="#fef3c7" opacity="0.9"/><path d="M0 -11 L3 0 L0 11 L-3 0 Z" fill="#dc2626"/><text y="-14" font-size="8" text-anchor="middle" fill="#fef3c7" font-weight="900">N</text></g>
      ${edges}
      ${nodes}
    </svg>
    <p class="map-hint">✈ = viaggio rapido (Molo, Piazza, Belvedere). Gli altri luoghi si raggiungono a piedi dal punto centrale più vicino.${bussola ? ' 🧭 La Bussola mostra gli oggetti ancora da trovare.' : ' Con la 🧭 Bussola di Zia Turbina vedi dove mancano oggetti.'}</p>`;

  c.querySelectorAll('.map-node.unlocked').forEach(g => {
    g.addEventListener('click', () => {
      const n = byId[g.dataset.node];
      if (n.id === here) { closeModal('map'); return; }
      if (!n.hub) {
        playSound('error');
        toast(`🚶 ${n.name}: si raggiunge a piedi dal <b>${MAP_VIA[n.id]}</b>.`);
        return;
      }
      closeModal('map');
      playSound('success');
      travelTo(n.area, n.room);
    });
  });
}
