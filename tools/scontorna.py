"""Toglie lo sfondo magenta (#FF00FF) dalle immagini dei personaggi.

Uso: python3 tools/scontorna.py ingresso.png uscita.webp [ingresso2.png uscita2.webp ...]
(più coppie = stesso personaggio, stesso ritaglio)

1. Trova i pixel magenta collegati al bordo dell'immagine (lo sfondo).
   I colori magenta dentro il contorno del personaggio restano.
   Anche i buchi chiusi di magenta quasi puro diventano sfondo.
2. Rende trasparenti lo sfondo e i bordi sfumati, e toglie l'alone magenta.
3. Ritaglia attorno al personaggio, con i piedi sul bordo in basso.
"""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage


def maschera(src, aloni=False):
    """Restituisce l'immagine RGBA senza sfondo, non ritagliata.
    aloni=True toglie anche gli aloni luminosi mescolati al magenta (oggetti che brillano)."""
    im = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
    r, g, b = im[..., 0], im[..., 1], im[..., 2]
    mag = np.minimum(r, b) - g                      # quanto è "magenta"
    cand = (mag > 70) & (r > 120) & (b > 120)
    lab, _ = ndimage.label(cand)
    border = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    bg = np.isin(lab, border[border > 0])
    # Buchi chiusi (tra gambe, braccia, foglie): magenta quasi puro come lo sfondo.
    ref = np.median(im[bg], axis=0) if bg.any() else np.array([255, 0, 255], np.float32)
    pure = np.linalg.norm(im - ref, axis=-1) < 70
    lab2, n2 = ndimage.label(pure & ~bg)
    if n2:
        sizes = ndimage.sum(np.ones_like(lab2), lab2, range(1, n2 + 1))
        keep = np.isin(lab2, np.nonzero(sizes >= 12)[0] + 1)
        bg |= keep
    if aloni:
        # Alone (es. luce verde o gialla sul magenta): colore ancora un po' magenta, chiaro,
        # collegato allo sfondo. Il contorno scuro dell'oggetto ferma l'espansione.
        lum = 0.3 * r + 0.59 * g + 0.11 * b
        halo = (mag > 12) & (lum > 95)
        lab3, _ = ndimage.label(halo | bg)
        bg |= np.isin(lab3, np.unique(lab3[bg]))
    # Bordi sfumati: entro 3 pixel dallo sfondo l'alfa dipende da quanto è magenta.
    near = ndimage.binary_dilation(bg, iterations=3) & ~bg
    alpha = np.where(bg, 0.0, 1.0)
    edge_a = np.clip(1 - (mag - 20) / 120, 0, 1)
    alpha = np.where(near, np.minimum(alpha, edge_a), alpha)
    # Toglie l'alone magenta sui bordi.
    lim = np.maximum(g, (r + b) / 2 - 40)
    r2 = np.where(near, np.minimum(r, lim + 30), r)
    b2 = np.where(near, np.minimum(b, lim + 30), b)
    out = np.dstack([r2, g, b2, alpha * 255]).clip(0, 255).astype(np.uint8)
    return Image.fromarray(out, 'RGBA')


def riquadro(img, pad=6):
    a = np.asarray(img)[..., 3]
    ys, xs = np.where(a > 12)
    # In basso si taglia sull'ultima riga davvero piena: i resti dell'ombra a terra
    # (semitrasparenti) farebbero "galleggiare" il personaggio.
    full = np.where((a > 200).sum(1) > 3)[0]
    bottom = full.max() + 2 if len(full) else ys.max() + 1
    return (max(xs.min() - pad, 0), max(ys.min() - pad, 0), min(xs.max() + pad, img.width), min(bottom, img.height))


def scontorna(srcs, dsts, height=640):
    """Più immagini dello stesso personaggio (es. fauci chiuse e aperte):
    stesso ritaglio per tutte, così restano allineate nel gioco."""
    imgs = [maschera(s) for s in srcs]
    boxes = [riquadro(i) for i in imgs]
    box = (min(b[0] for b in boxes), min(b[1] for b in boxes), max(b[2] for b in boxes), max(b[3] for b in boxes))
    sizes = []
    for img, dst in zip(imgs, dsts):
        img = img.crop(box)
        if height and img.height > height:
            img = img.resize((round(img.width * height / img.height), height), Image.LANCZOS)
        img.save(dst, 'WEBP', quality=86, method=6)
        sizes.append(img.size)
    return sizes


if __name__ == '__main__':
    # python3 tools/scontorna.py a.png a.webp [b.png b.webp ...]
    args = sys.argv[1:]
    print(scontorna(args[0::2], args[1::2]))
