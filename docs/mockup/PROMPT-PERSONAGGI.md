# Prompt per i personaggi (Gemini)

Decisioni:
- **Personaggi non giocanti:** 1 immagine per personaggio. Bocca che parla e palpebre le disegno io sopra, nel codice.
- **Pianta carnivora:** 2 immagini (fauci chiuse e aperte), perché il morso non si può disegnare sopra.
- **Aria:** immagini (ferma + 2 passi della camminata). Cappelli e occhiali come immagini separate. I colori di tunica, sciarpa e zaino escono dal negozio.

## Come usare i prompt in Gemini

1. Apri una chat nuova per ogni personaggio.
2. Allega come riferimento di stile 1 mock-up di personaggio (es. `docs/mockup/aria.jpg`) e 1 sfondo (es. `img/bg/taverna.webp`).
3. Incolla il **blocco di stile comune**, poi il prompt del personaggio.
4. Per le varianti (camminata, fauci aperte) resta nella stessa chat e chiedi la modifica dell'ultima immagine.
5. Scarica in PNG alla massima risoluzione.

## Blocco di stile comune

```
Create a single 2D cartoon character for a point-and-click adventure game, in the
same art style as the reference images: clean thin dark navy outline, flat colors
with two-tone cel shading, rounded friendly shapes, chibi proportions (big head,
the body is about 4 heads tall). Full body, standing, three-quarter view, the
character looks and faces to the RIGHT side of the image. Neutral soft even light.
Mouth closed and small, eyes open (I animate mouth and eyes later).
Solid flat pure magenta background (#FF00FF) with nothing else: no floor, no
shadow, no text, no frame. The character is centered, the feet touch the bottom
edge with a small margin. Vertical image, 2:3, high resolution.
```

## Personaggi da rifare su sfondo magenta (stesso aspetto dei mock-up)

Allega il mock-up del personaggio e scrivi:

```
Same character as the attached image, same design, colors and pose.
Redraw it on a solid flat pure magenta background (#FF00FF), full body,
facing right, mouth closed, eyes open. No shadow under the feet.
```

Fallo per: `lavinia.jpg`, `vera.jpg`, `barnaba.jpg`, `turbina.jpg`.

## Aria

**1. Aria ferma** (allega `docs/mockup/aria.jpg`):
```
Same girl as the attached image: young explorer, brown hair with side bangs and a
high long wavy ponytail, teal long tunic to mid-thigh with long sleeves, brown belt
with gold buckle, red scarf around the neck, blue jeans, brown shoes, brown
backpack. Standing relaxed, arms down. NO hat, NO glasses.
```

**2–3. Camminata: 2 immagini** (nella stessa chat dell'Aria ferma)

I passi "di passaggio" (gambe sotto il corpo) sono quasi uguali all'Aria ferma: uso quella e la alzo un po' nel codice. Servono solo 2 immagini nuove.

Passo A:
```
Edit the standing girl image. CHANGE THE POSE CLEARLY: she is walking to the right
with a long step. The leg closer to the viewer is stretched FORWARD (to the right),
the heel touches the ground. The leg farther from the viewer is stretched BACK
(to the left), only the toes touch the ground. The arms swing: the arm closer to
the viewer goes back, the other arm goes forward. Keep everything else identical:
same girl, same clothes, same size, same head position, same magenta background.
```

Passo B (riparti sempre dall'Aria ferma, non dal passo A):
```
Edit the standing girl image. CHANGE THE POSE CLEARLY: she is walking to the right
with a long step. The leg farther from the viewer is stretched FORWARD (to the
right), the heel touches the ground. The leg closer to the viewer is stretched BACK
(to the left), only the toes touch the ground. The arms swing: the arm closer to
the viewer goes forward, the other arm goes back. Keep everything else identical:
same girl, same clothes, same size, same head position, same magenta background.
```

Se Gemini non cambia la posa:
1. Apri una chat nuova, allega solo l'Aria ferma e incolla il prompt.
2. Aggiungi all'inizio: `The legs in the result must look very different from the attached image.`
3. Se serve, chiedi la posa con un esempio: `like a cartoon character walking in a side-scrolling game, mid-stride, legs in an upside-down V shape`.

**6. Cappelli e occhiali** (una immagine per oggetto, chat nuova, allega Aria ferma):
```
Draw only this accessory, alone, sized to fit the head of the attached girl,
three-quarter view facing right, same art style, on a solid flat pure magenta
background (#FF00FF): <ACCESSORIO>
```
Sostituisci `<ACCESSORIO>` con:
1. `a small pink flower hair clip with five petals and a yellow center`
2. `a blue baseball cap with a short visor and a yellow button on top`
3. `pink headphones with a black headband`
4. `a black pirate tricorn hat with gold trim and a small white skull`
5. `a small golden crown with a pink gem`
6. `pink rectangular sunglasses with dark lenses`
7. `gold rectangular sunglasses with dark lenses`

## Personaggi nuovi

**Oste Bartolomeo** (mentore della Taverna):
```
A round, cheerful tavern keeper: big belly, short legs, big bald head with a grey
tuft at the back, big curled brown moustache, rosy cheeks, kind expression. Light
grey shirt, burgundy waistcoat, long white apron, a red-striped cream cloth on the
shoulder, brown trousers, dark shoes. He holds an amber beer mug with foam.
```

**Pirati Gemelli** (guardiani della Taverna, una sola immagine con tutti e due):
```
Two identical short pirate twins standing side by side, both facing right: dotted
bandanas, gold hoop earring, stubble, a cheeky grin, black eye patch on opposite
eyes (one on the left eye, one on the right eye). White shirt, open waistcoat:
one blue, one crimson red. Yellow sash, dark trousers, black boots. Each holds a
white die with black dots.
```

**Archimede** (mentore della Torre, bibliotecario):
```
An old kind astronomer librarian: long midnight-blue robe with small yellow stars
and a gold hem, rope belt with tassels, long pointed white beard, round glasses,
thick white eyebrows, a blue round cap with a gold tassel. He raises a magnifying
glass with a wooden handle.
```

**Terminale dell'ascensore** (guardiano della Torre):
```
A friendly but strict old elevator terminal machine: a tall slate-grey metal
cabinet with screws, an antenna with a small red light on top, a dark green
screen with a simple face (two rectangular green eyes and a straight green mouth
line), a grey keypad with one green key, a yellow button, a cable on the side.
Seen in three-quarter view facing right.
```

**Madame Zeri** (mentore della Serra):
```
A glamorous diva botanist: voluminous black bob haircut with bangs, gold hoop
earring, pink-framed sunglasses, a beauty mark, crimson lipstick. Pink bell-shaped
dress with a white collar, gold belt, pearl necklace, pink heeled shoes. She holds
a fan of light pink feathers.
```

**Pianta carnivora** (guardiana della Serra, 2 immagini nella stessa chat):
```
A giant cartoon carnivorous plant in a terracotta pot: curved green stem, two big
leaves and a curly tendril, a magenta head like a jaw with pink spots, cream
triangular teeth, big yellow eyes with slit pupils and angry eyebrows. Funny, not
scary. Seen from the front, slightly turned to the right. JAWS CLOSED.
```
Poi: `Same image, same size and position: now the JAWS are WIDE OPEN, showing a pink tongue.`

**Gemelle Mira e Nora** (mentori dell'Officina, una sola immagine con tutte e due):
```
Two young mechanic twin girls side by side, both facing right, with aviator goggles
with cyan lenses on the forehead and freckles. Mira: black bob hair, light blue
overalls, white shirt, holds a wrench. Nora: orange hair with two round buns, purple
overalls, white shirt, holds a screwdriver with a yellow handle.
```

**Automa del cancello** (guardiano dell'Officina):
```
A steampunk boiler robot guard: copper round boiler body with rivets, a small furnace
door with orange fire, a pressure gauge, a chimney with a puff of steam, a grey-blue
box head with bolts, two round red eyes, a grille mouth, arched metal arms with
pincers, short sturdy legs. Seen in three-quarter view facing right.
```

## Controllo del risultato

1. Sfondo magenta pieno, senza ombra e senza pavimento.
2. Il personaggio guarda a destra, intero, con i piedi in basso.
3. Bocca chiusa e piccola, occhi aperti (tranne la Pianta con le fauci aperte).
4. Per la camminata di Aria: stessa grandezza e stessa posizione della testa nelle 3 immagini (ferma, passo A, passo B).
5. Nomi dei file: `aria.png`, `aria-passoA.png`, `aria-passoB.png`, `cappello-fiore.png`, `oste.png`, `pianta.png`, `pianta-aperta.png`, ecc.
