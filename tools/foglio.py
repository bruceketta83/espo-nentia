"""Divide un foglio di oggetti (griglia su sfondo magenta) in tante immagini.

Uso: python3 tools/foglio.py foglio.png righe colonne nome1 nome2 ... [-]
- La griglia si legge da sinistra a destra, dall'alto in basso.
- Un nome "-" salta la cella (cella vuota o oggetto da non usare).
- Ogni oggetto finisce in img/obj/<nome>.webp, senza sfondo e ritagliato.
"""
import os
import sys
from PIL import Image
sys.path.insert(0, os.path.dirname(__file__))
from scontorna import maschera, riquadro  # noqa: E402
import numpy as np  # noqa: E402
from scipy import ndimage  # noqa: E402

OUT = os.path.join(os.path.dirname(__file__), '..', 'img', 'obj')


# Oggetti che brillano: l'alone si toglie tenendo solo ciò che è chiuso dal contorno scuro.
# Valore True = tiene anche le parti gialle senza contorno scuro (il fiore).
BRILLANO = {'seme': False, 'vaso-fiore': True}


def solo_contorno(img, saturi_ok=False, soglia=135):
    a = np.asarray(img).copy()
    rgb = a[..., :3].astype(np.float32)
    lum = 0.3 * rgb[..., 0] + 0.59 * rgb[..., 1] + 0.11 * rgb[..., 2]
    dentro = ndimage.binary_fill_holes((lum < soglia) & (a[..., 3] > 40))
    # Parti gialle o verdi senza contorno scuro (es. il fiore): colori saturi, non rosati come l'alone.
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    saturi = (b < 0.62 * g) & (g > 100) & (a[..., 3] > 40)
    if saturi_ok:
        dentro |= ndimage.binary_opening(saturi, iterations=1)
    dentro = ndimage.binary_dilation(dentro, iterations=1)
    a[~dentro, 3] = 0
    return Image.fromarray(a, 'RGBA')


def dividi(src, rows, cols, names, size=256):
    os.makedirs(OUT, exist_ok=True)
    tmp = src + '.tmp.png'
    full = Image.open(src).convert('RGB')
    W, H = full.size
    done = []
    for i, name in enumerate(names):
        if name == '-':
            continue
        r, c = divmod(i, cols)
        cell = full.crop((c * W // cols, r * H // rows, (c + 1) * W // cols, (r + 1) * H // rows))
        cell.save(tmp)
        img = maschera(tmp, aloni=True)
        # Pezzi che toccano il bordo della cella vengono dalle celle vicine: si tolgono.
        a = np.asarray(img).copy()
        lab, n = ndimage.label(a[..., 3] > 40)
        edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
        if n > len(edge):
            a[np.isin(lab, list(edge)), 3] = 0
            img = Image.fromarray(a, 'RGBA')
        if name in BRILLANO:
            img = solo_contorno(img, BRILLANO[name])
        img = img.crop(riquadro(img, pad=4))
        img.thumbnail((size, size), Image.LANCZOS)
        dst = os.path.join(OUT, name + '.webp')
        img.save(dst, 'WEBP', quality=86, method=6)
        done.append((name, img.size))
    os.remove(tmp)
    return done


if __name__ == '__main__':
    src, rows, cols, *names = sys.argv[1:]
    for n, s in dividi(src, int(rows), int(cols), names):
        print(n, s)
