/* ==========================================================================
   PERSONAGGI
   Tutti i personaggi sono immagini (img/chars/*.webp) preparate con un
   programma esterno; lo sfondo magenta è tolto con tools/scontorna.py.
   I piedi sono in (0,0) e il personaggio guarda a destra.
   Sopra l'immagine, in SVG: palpebre che sbattono, bocca che parla,
   cappelli e occhiali di Aria.
   Le classi CSS (torso, lid, img-mouth...) attivano le animazioni.
   ========================================================================== */

/* Contorno degli elementi disegnati in SVG: blu notte scuro, mai nero puro. */
const INK = '#1c1426';
function ink(w = 0.7) { return `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`; }

/* Aspetto di Aria: cappello e occhiali comprati nel Negozio dell'Aura. */
function ariaLook() {
  return (typeof state !== 'undefined' && state && state.look) || {};
}

/* Cappelli disegnati in SVG sulla testa (centro della testa in 0,-46, raggio 8,6). */
function ariaHatSVG(hat) {
  switch (hat) {
    case 'pirata':
      return `<path d="M-11 -53 Q0 -49 11 -53 Q7 -63 0 -61.5 Q-7 -63 -11 -53 Z" fill="#1d1b22" ${ink(0.6)}/>
        <path d="M-9.5 -53.5 Q0 -50.4 9.5 -53.5" stroke="#fbbf24" stroke-width="0.9" fill="none"/>
        <circle cx="0" cy="-57" r="1.6" fill="#f8fafc"/>`;
    case 'corona':
      return `<path d="M-6 -54 L-5 -60 L-2 -56.5 L0.5 -61.5 L3 -56.5 L6 -60 L7 -54 Q0.5 -55.6 -6 -54 Z" fill="#fbbf24" ${ink(0.5)}/>
        <circle cx="0.5" cy="-58.4" r="1" fill="#ec4899"/>`;
    case 'cappellino':
      return `<path d="M-9 -50 Q-8.4 -59 1 -58.8 Q9 -58.4 9.2 -50.6 Z" fill="#2563eb" ${ink(0.6)}/>
        <path d="M5 -50.6 Q12 -50.8 14.5 -48.6 Q9 -48.4 5 -49.2 Z" fill="#1d4ed8" ${ink(0.5)}/>
        <circle cx="0.5" cy="-58.2" r="1" fill="#fbbf24"/>`;
    case 'fiore':
      return `<g transform="translate(-6.6 -52)">${[0, 72, 144, 216, 288].map(a =>
        `<ellipse cx="0" cy="-2.2" rx="1.4" ry="2.2" fill="#f472b6" transform="rotate(${a})"/>`).join('')}<circle r="1.2" fill="#fde047"/></g>`;
    case 'cuffie':
      return `<path d="M-8.8 -47 Q-9 -58.5 0 -58.5 Q9 -58.5 8.8 -47" stroke="#111827" stroke-width="1.6" fill="none"/>
        <rect x="-10.6" y="-49.5" width="3.6" height="6" rx="1.4" fill="#ec4899" ${ink(0.5)}/>`;
    default:
      return '';
  }
}

/* --------------------------------------------------------------------------
   IMMAGINI DEI PERSONAGGI
   w, px = larghezza e altezza dell'immagine in pixel; h = altezza nel gioco.
   eyes = centri degli occhi (pixel); eyeR = raggio della palpebra (pixel).
   mouth = centro della bocca; head = [x, y, lato] del riquadro del ritratto.
   -------------------------------------------------------------------------- */
const CHAR_IMG = {
  aria: { w: 382, px: 640, h: 57, eyes: [[232, 147], [280, 147]], eyeR: 13, lid: '#f8c09b', mouth: [263, 196], mouthW: 16, mouthH: 7, head: [228, 125, 240] },
  vera: { w: 387, px: 588, h: 61.6, eyes: [[237, 132]], eyeR: 12, lid: '#f5c4a6', mouth: [250, 168], mouthW: 13, mouthH: 6, head: [215, 120, 230] },
  barnaba: { w: 385, px: 592, h: 75.8, eyes: [], mouth: [247, 122], mouthW: 20, mouthH: 7, head: [225, 85, 210] },
  lavinia: { w: 241, px: 640, h: 65, eyes: [[163, 148], [207, 148]], eyeR: 11, lid: '#fbd3b7', mouth: [184, 190], mouthW: 18, mouthH: 6, head: [150, 125, 220] },
  turbina: { w: 318, px: 640, h: 72, eyes: [], mouth: [240, 257], mouthW: 18, mouthH: 6, head: [180, 170, 270] },
  oste: { w: 432, px: 640, h: 61, eyes: [[188, 86], [238, 84]], eyeR: 9, lid: '#f2c4a2', mouth: [229, 128], mouthW: 18, mouthH: 8, head: [212, 95, 190] },
  gemelli: { w: 576, px: 640, h: 56, eyes: [[156, 132], [420, 132]], eyeR: 10, lid: '#f2bd96', head: [288, 150, 560] },
  archimede: { w: 359, px: 640, h: 66, eyes: [[160, 168], [228, 168]], eyeR: 12, lid: '#f6c6a4', head: [180, 150, 250] },
  terminale: { w: 369, px: 640, h: 79, eyes: [[205, 181], [262, 182]], eyeR: 22, lid: '#1f4730', mouth: [236, 256], mouthW: 52, mouthH: 7, mouthColor: '#4ade80', head: [225, 190, 250] },
  zeri: { w: 375, px: 640, h: 64, eyes: [], mouth: [177, 225], mouthW: 20, mouthH: 7, head: [180, 175, 270] },
  pianta: { w: 362, px: 640, h: 110, eyes: [[246, 150], [318, 150]], eyeR: 21, lid: '#c4479f', head: [260, 160, 230] },
  gemelle: { w: 499, px: 640, h: 56, eyes: [[137, 170], [220, 170], [372, 172], [452, 171]], eyeR: 14, lid: '#f5c2a3', mouth: [[170, 217], [407, 219]], mouthW: 22, mouthH: 7, head: [250, 160, 490] },
  automa: { w: 496, px: 640, h: 84, eyes: [[288, 105], [363, 107]], eyeR: 21, lid: '#5f7787', head: [320, 100, 260] }
};

function imgScale(file) {
  const C = CHAR_IMG[file];
  return { sc: C.h / C.px, width: C.w * C.h / C.px, C };
}

/* Punto dell'immagine (pixel) → coordinate del gioco (piedi in 0,0). */
function imgPoint(file, x, y) {
  const { sc, width, C } = imgScale(file);
  return [x * sc - width / 2, y * sc - C.h];
}

/* base = personaggio da cui prendere le misure (stesso ritaglio per tutte le sue immagini). */
function imgTag(file, cls = '', base = file) {
  const { width, C } = imgScale(base);
  return `<image ${cls ? `class="${cls}"` : ''} href="img/chars/${file}.webp" x="${(-width / 2).toFixed(2)}" y="${-C.h}" width="${width.toFixed(2)}" height="${C.h}"/>`;
}

function imageChar(cls, file, { images, extra = '' } = {}) {
  const { sc, width, C } = imgScale(file);
  const lids = (C.eyes || []).map(([x, y]) => {
    const [cx, cy] = imgPoint(file, x, y);
    return `<ellipse cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" rx="${(C.eyeR * sc).toFixed(2)}" ry="${(C.eyeR * sc).toFixed(2)}" fill="${C.lid}"/>`;
  }).join('');
  const mouths = !C.mouth ? [] : Array.isArray(C.mouth[0]) ? C.mouth : [C.mouth];
  const m = mouths.map(([x, y]) => {
    const [mx, my] = imgPoint(file, x, y);
    return `<ellipse class="img-mouth" cx="${mx.toFixed(2)}" cy="${my.toFixed(2)}" rx="${(C.mouthW / 2 * sc).toFixed(2)}" ry="${(C.mouthH / 2 * sc).toFixed(2)}" fill="${C.mouthColor || '#5c1a1a'}"/>`;
  }).join('');
  return `
  <g class="char ${cls} img-char">
    <ellipse cx="0" cy="0.3" rx="${(Math.min(width, 40) * 0.32).toFixed(1)}" ry="2.8" fill="#000" opacity="0.3"/>
    <g class="torso">
      ${images || imgTag(file)}
      ${lids ? `<g class="lid">${lids}</g>` : ''}
      ${m}
      ${extra}
    </g>
  </g>`;
}

/* Aria: immagine ferma + 2 passi. Mentre cammina: passo A, ferma, passo B, ferma. */
function drawAria() {
  const look = ariaLook();
  const images = imgTag('aria', 'frame-0') + imgTag('aria-passoA', 'frame-a', 'aria') + imgTag('aria-passoB', 'frame-b', 'aria');
  // Cappello e occhiali sopra la testa dell'immagine.
  const hat = look.hat ? `<g transform="translate(3.6 0.4) scale(1.12) translate(0 4.9)">${ariaHatSVG(look.hat)}</g>` : '';
  let glasses = '';
  if (look.glasses) {
    const C = CHAR_IMG.aria;
    const [l, r] = C.eyes.map(([x, y]) => imgPoint('aria', x, y));
    const lens = ([x, y]) => `<rect x="${(x - 2.3).toFixed(2)}" y="${(y - 1.7).toFixed(2)}" width="4.6" height="3.4" rx="1.3" fill="#0f172a" stroke="${look.glasses}" stroke-width="0.7"/>`;
    glasses = `${lens(l)}${lens(r)}<path d="M${(l[0] + 2.3).toFixed(2)} ${l[1].toFixed(2)} L${(r[0] - 2.3).toFixed(2)} ${r[1].toFixed(2)}" stroke="${look.glasses}" stroke-width="0.7"/>`;
  }
  return imageChar('aria', 'aria', { images, extra: glasses + hat });
}

/* La Pianta ha 2 immagini: fauci chiuse e aperte. Quella aperta compare per il morso. */
function drawPlant() {
  return imageChar('plant', 'pianta', { extra: imgTag('pianta-aperta', 'jaw-open', 'pianta') });
}

/* Riquadro del ritratto nei dialoghi, ritagliato sulla testa. */
function portraitBox(file) {
  const [x, y, size] = CHAR_IMG[file].head;
  const { sc } = imgScale(file);
  const [cx, cy] = imgPoint(file, x, y);
  const s = size * sc;
  return `${(cx - s / 2).toFixed(1)} ${(cy - s / 2).toFixed(1)} ${s.toFixed(1)} ${s.toFixed(1)}`;
}

const CHAR_FILES = {
  aria: 'aria', vera: 'vera', barnaba: 'barnaba', oste: 'oste', gemelli: 'gemelli', archimede: 'archimede',
  terminal: 'terminale', zeri: 'zeri', plant: 'pianta', gemelle: 'gemelle', automa: 'automa', lavinia: 'lavinia', turbina: 'turbina'
};
const CHAR_DRAW = { aria: drawAria, plant: drawPlant };

const CHARS = {};
Object.entries(CHAR_FILES).forEach(([key, file]) => {
  CHARS[key] = {
    draw: CHAR_DRAW[key] || (() => imageChar(key, file)),
    h: CHAR_IMG[file].h,
    portraitVB: portraitBox(file)
  };
});

function portraitSVG(key) {
  const c = CHARS[key];
  return `<svg viewBox="${c.portraitVB}" class="portrait" aria-hidden="true">${c.draw()}</svg>`;
}
