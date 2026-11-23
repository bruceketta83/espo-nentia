/* ==========================================================================
   SCENE: sfondi a immagine + animazioni SVG (viewBox 400 x 220, titolo 400 x 800)
   ========================================================================== */

/* Onda ripetuta con periodo 40 (si sposta di 40 unità in loop). */
function wavePath(y, amp) {
  let d = `M-40 ${y}`;
  for (let x = -40; x < 440; x += 40) d += ` q10 ${-amp} 20 0 t20 0`;
  return d;
}

/* Contorno delle scene: marrone scuro per il legno, blu notte per il resto. */
const WOOD_INK = '#2a1a12';
function wink(w = 0.8) { return `stroke="${WOOD_INK}" stroke-width="${w}" stroke-linejoin="round"`; }

const SCENES = {};

/* Colori dei 5 Cristalli: ambra, ciano, viola, smeraldo, rosso. */
const TITLE_CRYSTALS = ['#f59e0b', '#06b6d4', '#a855f7', '#10b981', '#ef4444'];

/* ==========================================================================
   SFONDI A IMMAGINE (img/bg/*.webp, 16:9)
   L'immagine riempie la scena 400 x 220 e si taglia ai lati (slice).
   Sopra restano in SVG solo le animazioni: luci, stelle, onde.
   ========================================================================== */
function bgImage(name) {
  return `<image href="img/bg/${name}.webp" x="0" y="0" width="400" height="220" preserveAspectRatio="xMidYMid slice"/>`;
}

/* Alone di luce che tremola (lanterne, candele). */
function glowSVG(id, x, y, r, color = '#ffb347', delay = 0) {
  return `<radialGradient id="${id}"><stop offset="0" stop-color="${color}" stop-opacity="0.55"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>
    <circle class="flicker" cx="${x}" cy="${y}" r="${r}" fill="url(#${id})" style="animation-delay:-${delay}s"/>`;
}

/* Stelline che brillano sopra il cielo dipinto. */
function twinkleSVG(points) {
  return points.map(([x, y, r], i) =>
    `<circle class="twinkle" cx="${x}" cy="${y}" r="${r || 0.9}" fill="#fff" style="animation-delay:-${(i * 0.7) % 3}s"/>`).join('');
}

const IMAGE_SCENES = {
  /* Molo: pontile con il Faro sabotato e le casse 2³ e 2⁴ */
  molo: {
    bg() {
      return `${bgImage('pontile')}
      ${twinkleSVG([[22, 8], [64, 24], [128, 10], [176, 30], [236, 14], [330, 12], [378, 30, 1.1]])}
      <circle class="faro-blink" cx="85" cy="52" r="9" fill="#ff5a5a" opacity="0.45"/>
      ${glowSVG('gl-pont', 198, 74, 26)}
      <g class="wave" style="animation-duration:9s"><path d="${wavePath(126, 1)}" stroke="#e4ddff" stroke-opacity="0.35" fill="none" stroke-width="0.8"/></g>`;
    }
  },

  /* Molo: spiaggia con la nave di Vera e il capanno */
  spiaggia: {
    bg() {
      return `${bgImage('spiaggia')}
      ${[[255, 120, 24], [258, 126, 18], [254, 132, 12]].map(([x, y, w], i) =>
        `<rect class="shimmer" x="${x - w / 2}" y="${y}" width="${w}" height="1.2" rx="0.6" fill="#fff4c4" style="animation-delay:-${i * 0.5}s"/>`).join('')}
      ${glowSVG('gl-sp1', 309, 113, 14)}${glowSVG('gl-sp2', 358, 113, 14, '#ffb347', 1.1)}
      <g class="wave" style="animation-duration:7s"><path d="${wavePath(150, 1.2)}" stroke="#fff" stroke-opacity="0.5" fill="none" stroke-width="1"/></g>`;
    }
  },

  /* Molo: interno del capanno */
  capanno: {
    bg() {
      const motes = [[192, 70], [206, 92], [186, 112], [214, 128], [200, 150], [178, 132], [220, 104]].map(([x, y], i) =>
        `<circle class="twinkle" cx="${x}" cy="${y}" r="0.7" fill="#ffe1a0" style="animation-delay:-${i * 0.5}s"/>`).join('');
      return `${bgImage('capanno')}${glowSVG('gl-cap', 196, 44, 34)}${motes}`;
    }
  },

  /* Taverna: strada davanti alla Taverna */
  strada: {
    bg() {
      // Dopo il codice la porta della Taverna è aperta (seconda immagine).
      const open = typeof state !== 'undefined' && state.flags.taverna_open;
      return `${bgImage(open ? 'strada-aperta' : 'strada')}
      ${twinkleSVG([[16, 30], [40, 64, 0.7], [92, 52], [356, 40], [384, 64, 0.7], [362, 14]])}
      ${glowSVG('gl-st1', 127, 88, 18)}${glowSVG('gl-st2', 284, 86, 24, '#ffb347', 1.3)}`;
    }
  },

  /* Taverna: sala con il tavolo dei dadi */
  taverna: {
    bg() {
      return `${bgImage('taverna')}
      ${glowSVG('gl-tv1', 103, 46, 34)}${glowSVG('gl-tv2', 299, 46, 34, '#ffb347', 1.2)}${glowSVG('gl-tv3', 131, 140, 10, '#ffd27a', 0.6)}
      <circle class="smoke" cx="131" cy="130" r="1.6" fill="#e5e7eb" opacity="0.5"/>
      <circle class="smoke" cx="131" cy="130" r="1.2" fill="#e5e7eb" opacity="0.5" style="animation-delay:-2s"/>`;
    }
  },

  /* Torre: terrazza dell'osservatorio con l'ascensore */
  torre: {
    bg() {
      return `${bgImage('torre')}
      ${twinkleSVG([[150, 20], [182, 44, 1.1], [214, 22], [262, 70], [120, 60, 0.7], [280, 34, 0.7], [204, 100, 0.7]])}
      <g transform="translate(280 30)"><line class="shoot" x1="0" y1="0" x2="12" y2="-6" stroke="#fff" stroke-width="0.8" style="animation-delay:-3s"/></g>
      ${glowSVG('gl-to', 310, 86, 22, '#ff5a3a')}
      <circle class="led-blink" cx="310" cy="86" r="2.6" fill="#ff7a5a" opacity="0.8"/>`;
    }
  },

  /* Belvedere: terrazza con mongolfiera, galleria e scalinata del Faro */
  belvedere: {
    bg() {
      return `${bgImage('belvedere')}
      ${twinkleSVG([[12, 10], [86, 8, 1.1], [150, 18], [210, 24], [244, 12], [338, 22, 1.1], [384, 12]])}
      <circle class="faro-blink" cx="55" cy="28" r="4" fill="#fde68a" opacity="0.6"/>
      ${[[366, 130, 22], [368, 136, 14]].map(([x, y, w], i) =>
        `<rect class="shimmer" x="${x - w / 2}" y="${y}" width="${w}" height="1" rx="0.5" fill="#ffe1a0" style="animation-delay:-${i * 0.6}s"/>`).join('')}`;
    }
  }
};
Object.assign(SCENES, IMAGE_SCENES);

/* Cristallo luminoso (piedistallo della Serra e del Faro). */
function crystalGem(x, y, color, size = 1) {
  return `<g transform="translate(${x} ${y}) scale(${size})">
    <circle class="crystal-glow" r="6" fill="${color}" opacity="0.45"/>
    <g class="crystal-float"><polygon points="0,-6 3.4,-1 0,6 -3.4,-1" fill="${color}" stroke="${INK}" stroke-width="0.5"/>
    <polygon points="0,-6 3.4,-1 0,-0.4" fill="#fff" opacity="0.45"/></g></g>`;
}

Object.assign(SCENES, {
  /* Piazza del Mercato: il cancello della Torre si apre dopo l'area 1. */
  piazza: {
    bg() {
      const open = typeof state !== 'undefined' && state.unlockedArea >= 2;
      return `${bgImage(open ? 'piazza' : 'piazza-chiusa')}
      ${glowSVG('gl-pz1', 176, 128, 14)}${glowSVG('gl-pz2', 244, 128, 14, '#ffb347', 1)}${glowSVG('gl-pz3', 29, 101, 12, '#ffb347', 0.5)}
      ${[[98, 118], [92, 124], [104, 124]].map(([x, y], i) => `<circle class="shimmer" cx="${x}" cy="${y}" r="1.2" fill="#e0f2fe" style="animation-delay:-${i * 0.4}s"/>`).join('')}`;
    }
  },

  /* Biblioteca di Archimede: il calcolo sulla lavagna cambia per ogni profilo. */
  biblioteca: {
    bg() {
      const P = typeof P_torre === 'function' ? P_torre() : { b: 2, m: 3, n: 4 };
      return `${bgImage('biblioteca')}
      ${glowSVG('gl-bi1', 343, 136, 20, '#ffb347')}${glowSVG('gl-bi2', 138, 156, 10, '#ffb347', 0.8)}
      ${twinkleSVG([[22, 26, 0.7], [36, 44, 0.8], [28, 66, 0.6]])}
      <text x="209" y="94" font-size="16" fill="#f8fafc" fill-opacity="0.9" text-anchor="middle" font-family="Courier New, monospace" font-weight="700">(${P.b}${toSup(P.m)})${toSup(P.n)} = ?</text>`;
    }
  },

  /* Serra: il Cristallo Smeraldo resta sul piedistallo finché la Pianta non perde. */
  serra: {
    bg() {
      const taken = typeof state !== 'undefined' && state.completedAreas.includes(3);
      return `${bgImage('serra')}
      ${taken ? '' : crystalGem(70, 128, '#10b981', 2)}
      ${[[90, 70, '#f472b6'], [300, 120, '#facc15']].map(([x, y, c], i) =>
        `<g class="crystal-float" style="animation-duration:${3 + i}s"><path d="M${x} ${y} q-3 -4 -5 0 q2 3 5 0 q3 -4 5 0 q-2 3 -5 0" fill="${c}"/></g>`).join('')}
      ${[[150, 60], [230, 90], [260, 50], [120, 110]].map(([x, y], i) => `<circle class="twinkle" cx="${x}" cy="${y}" r="0.8" fill="#fef08a" style="animation-delay:-${i * 0.8}s"/>`).join('')}
      <ellipse class="shimmer" cx="198" cy="170" rx="30" ry="2" fill="#e0f2fe" opacity="0.5"/>`;
    }
  },

  /* Vivaio: lo scuro e la luce sono disegnati dagli oggetti della stanza. */
  vivaio: {
    bg() {
      return `${bgImage('vivaio')}
      ${[[180, 60], [214, 90], [196, 120], [232, 70], [170, 100]].map(([x, y], i) => `<circle class="twinkle" cx="${x}" cy="${y}" r="0.8" fill="#fef9c3" style="animation-delay:-${i * 0.6}s"/>`).join('')}`;
    }
  },

  /* Officina: il cancello verso il Faro si apre dopo l'area 5. */
  officina: {
    bg() {
      const open = typeof state !== 'undefined' && state.completedAreas.includes(4);
      return `${bgImage(open ? 'officina' : 'officina-chiusa')}
      ${glowSVG('gl-of1', 86, 52, 30)}${glowSVG('gl-of2', 320, 52, 30, '#ffb347', 1.1)}${glowSVG('gl-of3', 30, 110, 22, '#ff7a2a', 0.4)}
      <circle class="steam" cx="178" cy="60" r="3" fill="#e5e7eb" opacity="0.6"/>
      <circle class="steam" cx="246" cy="62" r="2.6" fill="#e5e7eb" opacity="0.6" style="animation-delay:-1.2s"/>
      <circle class="steam" cx="206" cy="110" r="2.4" fill="#e5e7eb" opacity="0.6" style="animation-delay:-0.6s"/>
      ${[[110, 120], [116, 114], [104, 116]].map(([x, y], i) => `<g transform="translate(${x} ${y})"><path class="spark-pop" d="M0 -3 L0.8 -0.8 L3 0 L0.8 0.8 L0 3 L-0.8 0.8 L-3 0 L-0.8 -0.8 Z" fill="#fde047" style="animation-duration:0.9s;animation-delay:-${i * 0.3}s"/></g>`).join('')}`;
    }
  },

  /* Magazzino: il calcolo della bilancia cambia per ogni profilo. */
  magazzino: {
    bg() {
      const P = typeof P_bilancia === 'function' ? P_bilancia() : { a: 2, b: 3, n: 4 };
      return `${bgImage('magazzino')}
      ${glowSVG('gl-ma', 200, 30, 34, '#ffcf7a')}
      <text x="167" y="129" font-size="7" fill="#fef3c7" stroke="${INK}" stroke-width="1.6" paint-order="stroke" text-anchor="middle" font-family="Courier New, monospace" font-weight="700">${P.a}${toSup(P.n)}·${P.b}${toSup(P.n)}</text>
      <text x="233" y="129" font-size="9" fill="#fef3c7" stroke="${INK}" stroke-width="1.6" paint-order="stroke" text-anchor="middle" font-family="Courier New, monospace" font-weight="700">?</text>`;
    }
  },

  /* Faro: scala a chiocciola con la botola. */
  scala: {
    bg() {
      return `${bgImage('scala')}
      ${glowSVG('gl-sc', 250, 104, 26, '#ff5a3a')}
      <rect class="lightning" x="244" y="62" width="14" height="40" fill="#e9d5ff" opacity="0"/>`;
    }
  },

  /* Faro: cima con il piedistallo dei 5 Cristalli. La classe "lit" accende il faro. */
  faro: {
    bg() {
      const owned = typeof state !== 'undefined' ? state.crystals.map(c => c.id) : [];
      const gems = ['c1', 'c2', 'c3', 'c4', 'c5'].map((id, i) =>
        owned.includes(id) ? crystalGem([181, 190.5, 199.5, 209, 218.5][i], 142, TITLE_CRYSTALS[i], 0.9) : '').join('');
      return `<g class="unlit-only">${bgImage('faro-spento')}
        <rect class="lightning" width="400" height="220" fill="#e9d5ff" opacity="0"/>
        ${glowSVG('gl-fs', 96, 30, 26, '#c084fc')}</g>
      <g class="lit-only">${bgImage('faro-acceso')}
        <circle class="faro-on" cx="96" cy="32" r="16" fill="#fef9c3" opacity="0.5"/></g>
      ${gems}`;
    }
  },

  /* Schermata iniziale: illustrazione verticale con luci animate. */
  title: {
    svg() {
      const gems = [[116, 212], [155.5, 185], [197, 175], [239, 188], [281, 214]].map(([x, y], i) =>
        `<circle class="crystal-glow" cx="${x}" cy="${y}" r="14" fill="${['#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'][i]}" opacity="0.35" style="animation-delay:-${i * 0.5}s"/>`).join('');
      return `<image href="img/bg/titolo.webp" x="0" y="0" width="400" height="800" preserveAspectRatio="xMidYMid slice"/>
      ${twinkleSVG([[60, 30], [120, 60, 1.2], [250, 26], [300, 70, 1.1], [360, 40], [200, 100, 0.8], [40, 120, 0.8]])}
      ${gems}
      <circle class="faro-blink" cx="134" cy="264" r="12" fill="#fff4c4" opacity="0.6"/>
      ${[[150, 520], [180, 532], [210, 526]].map(([x, y], i) => `<rect class="shimmer" x="${x}" y="${y}" width="40" height="1.6" rx="0.8" fill="#ffe1a0" style="animation-delay:-${i * 0.6}s"/>`).join('')}`;
    }
  }
});
