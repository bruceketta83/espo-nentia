/* ==========================================================================
   OGGETTI A IMMAGINE (img/obj/*.webp)
   Preparati con Gemini a fogli 3 x 3 e tagliati con tools/foglio.py.
   OBJ_DIM = larghezza e altezza dell'immagine in pixel.
   ========================================================================== */
const OBJ_DIM = {
  'annaffiatoio': [256, 210],
  'armadio-aperto': [256, 224],
  'armadio': [236, 256],
  'bacheca-missioni': [249, 256],
  'bacheca': [246, 256],
  'boccale': [203, 256],
  'botte': [256, 199],
  'bottiglia': [125, 256],
  'bullone': [219, 256],
  'cannocchiale': [256, 187],
  'cartello': [206, 256],
  'cassa': [251, 256],
  'chiave-inglese': [155, 256],
  'chiave': [107, 256],
  'corda': [256, 215],
  'dadi': [256, 143],
  'diario': [204, 256],
  'doblone': [256, 256],
  'ingranaggio': [255, 256],
  'lente': [145, 256],
  'libro': [256, 246],
  'lucchetto': [185, 256],
  'manuale': [256, 246],
  'porta-vivaio': [171, 256],
  'rete': [256, 202],
  'scheda': [256, 209],
  'seme': [145, 256],
  'vaso-fiore': [152, 256],
  'vaso': [246, 256],
  'volantino': [204, 256]
};

/* Immagine di un oggetto: centro in x, base in y, larghezza w (unità della scena). */
function objImg(name, x, y, w, cls = '') {
  const [pw, ph] = OBJ_DIM[name];
  const h = w * ph / pw;
  return `<image ${cls ? `class="${cls}"` : ''} href="img/obj/${name}.webp" x="${(x - w / 2).toFixed(2)}" y="${(y - h).toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}"/>`;
}

/* Immagine centrata in (0,0), per gli oggetti che luccicano (sparkleSVG). */
function objIcon(name, size) {
  const [pw, ph] = OBJ_DIM[name];
  const k = size / Math.max(pw, ph);
  return objImg(name, 0, ph * k / 2, pw * k);
}

/* Oggetto dentro il suo riquadro cliccabile: più grande possibile, appoggiato in basso. */
function objInBox(name, [bx, by, bw, bh], scale = 1) {
  const [pw, ph] = OBJ_DIM[name];
  const k = Math.min(bw / pw, bh / ph) * scale;
  return { svg: objImg(name, bx + bw / 2, by + bh, pw * k), w: pw * k, h: ph * k, cx: bx + bw / 2, top: by + bh - ph * k, bottom: by + bh };
}

/* Scritta sopra un oggetto (numeri e parole che cambiano nel gioco). */
function objText(text, x, y, size, color = '#3a2414') {
  return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${size}" fill="${color}" text-anchor="middle" font-weight="900" font-family="Courier New, monospace">${text}</text>`;
}

/* Disegno di un oggetto della stanza: h.obj = nome (o funzione che dà il nome);
   h.objText = [testo, posizione verticale 0–1 nell'immagine, grandezza]. */
function objHotspotSVG(h) {
  const name = typeof h.obj === 'function' ? h.obj() : h.obj;
  const o = objInBox(name, h.box, h.objScale || 1);
  let t = '';
  if (h.objText) {
    const [text, fy, size, color] = h.objText;
    t = objText(typeof text === 'function' ? text() : text, o.cx, o.top + o.h * fy, size, color);
  }
  return o.svg + t;
}

/* Immagini degli oggetti nello Zaino (al posto delle emoji). */
const ITEM_IMG = {
  corda: 'corda', dadi: 'dadi', scheda: 'scheda', annaffiatoio: 'annaffiatoio', ingranaggio: 'ingranaggio', rete: 'rete',
  i1: 'chiave', i2: 'cannocchiale', i3: 'lente', i4: 'seme', i5: 'chiave-inglese'
};
function itemIconHTML(obj) {
  const f = ITEM_IMG[obj.id];
  return f ? `<img class="inv-img" src="img/obj/${f}.webp" alt="">` : obj.icon;
}

/* Immagine piccola dentro un testo (avvisi e dialoghi). */
function itemInlineHTML(id, fallback) {
  const f = ITEM_IMG[id];
  return f ? `<img class="inline-obj" src="img/obj/${f}.webp" alt="">` : fallback;
}
