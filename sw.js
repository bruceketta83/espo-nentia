/* ==========================================================================
   SERVICE WORKER: gioco offline
   Strategia "prima la rete": online scarica sempre la versione nuova e
   aggiorna la copia; offline usa la copia salvata sul dispositivo.
   Cambia CACHE quando cambia l'elenco dei file.
   Il sito ospita più giochi: tocca solo le cache di questo gioco
   ("espo-nentia-*") e quelle vecchie ("esponentia-vN") di quando era sulla radice.
   ========================================================================== */
const CACHE = 'espo-nentia-v14';
const FILES = [
  './',
  'index.html',
  'style.css',
  'manifest.json',
  'icons/icon.svg',
  'icons/icon-180.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'js/audio.js',
  'js/data.js',
  'js/generator.js',
  'js/exercises.js',
  'js/calculator.js',
  'js/reading.js',
  'img/bg/pontile.webp',
  'img/bg/spiaggia.webp',
  'img/bg/capanno.webp',
  'img/bg/strada.webp',
  'img/bg/strada-aperta.webp',
  'img/bg/taverna.webp',
  'img/bg/torre.webp',
  'img/bg/belvedere.webp',
  'img/bg/piazza.webp',
  'img/bg/piazza-chiusa.webp',
  'img/bg/biblioteca.webp',
  'img/bg/serra.webp',
  'img/bg/vivaio.webp',
  'img/bg/officina.webp',
  'img/bg/officina-chiusa.webp',
  'img/bg/magazzino.webp',
  'img/bg/scala.webp',
  'img/bg/faro-spento.webp',
  'img/bg/faro-acceso.webp',
  'img/bg/titolo.webp',
  'img/obj/annaffiatoio.webp',
  'img/obj/armadio-aperto.webp',
  'img/obj/armadio.webp',
  'img/obj/bacheca-missioni.webp',
  'img/obj/bacheca.webp',
  'img/obj/boccale.webp',
  'img/obj/botte.webp',
  'img/obj/bottiglia.webp',
  'img/obj/bullone.webp',
  'img/obj/cannocchiale.webp',
  'img/obj/cartello.webp',
  'img/obj/cassa.webp',
  'img/obj/chiave-inglese.webp',
  'img/obj/chiave.webp',
  'img/obj/corda.webp',
  'img/obj/dadi.webp',
  'img/obj/diario.webp',
  'img/obj/doblone.webp',
  'img/obj/ingranaggio.webp',
  'img/obj/lente.webp',
  'img/obj/libro.webp',
  'img/obj/lucchetto.webp',
  'img/obj/manuale.webp',
  'img/obj/porta-vivaio.webp',
  'img/obj/rete.webp',
  'img/obj/scheda.webp',
  'img/obj/seme.webp',
  'img/obj/vaso-fiore.webp',
  'img/obj/vaso.webp',
  'img/obj/volantino.webp',
  'img/chars/oste.webp',
  'img/chars/aria.webp',
  'img/chars/aria-passoA.webp',
  'img/chars/aria-passoB.webp',
  'img/chars/vera.webp',
  'img/chars/barnaba.webp',
  'img/chars/lavinia.webp',
  'img/chars/turbina.webp',
  'img/chars/archimede.webp',
  'img/chars/terminale.webp',
  'img/chars/zeri.webp',
  'img/chars/gemelli.webp',
  'img/chars/gemelle.webp',
  'img/chars/automa.webp',
  'img/chars/pianta.webp',
  'img/chars/pianta-aperta.webp',
  'fonts/opendyslexic-latin-400-normal.woff2',
  'fonts/opendyslexic-latin-700-normal.woff2',
  'fonts/atkinson-hyperlegible-latin-400-normal.woff2',
  'fonts/atkinson-hyperlegible-latin-700-normal.woff2',
  'js/characters.js',
  'js/scenes.js',
  'js/objects.js',
  'js/world.js',
  'js/rooms.js',
  'js/rooms2.js',
  'js/meta.js',
  'js/game.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(k => k !== CACHE && (k.startsWith('espo-nentia-') || /^esponentia-v\d+$/.test(k)))
        .map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(req)
      .then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.open(CACHE).then(c => c.match(req, { ignoreSearch: true }).then(hit => hit || c.match('index.html'))))
  );
});
