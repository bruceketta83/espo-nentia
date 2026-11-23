# Prompt per gli oggetti (Gemini)

Gli oggetti si preparano a **fogli**: una sola immagine con 9 oggetti in una griglia 3 × 3.
Lo script `tools/foglio.py` taglia ogni cella, toglie lo sfondo magenta e salva gli oggetti in `img/obj/`.

Decisioni:
- Le scritte e i numeri che cambiano (lettere A-B-C, "2⁵", "VIVAIO", "2¹⁰", "ARENARIO") li scrivo io sopra l'immagine. Gli oggetti vanno **senza scritte**.
- Le stesse immagini servono nella scena e nello Zaino (al posto delle emoji).
- Il luccichio sopra gli oggetti da prendere resta disegnato nel codice.

## Come usare i prompt in Gemini

1. Apri una chat nuova per ogni foglio.
2. Allega come riferimento di stile 1 sfondo (es. `img/bg/taverna.webp`) e 1 personaggio (es. `img/chars/oste.webp`).
3. Incolla il **blocco di stile comune**, poi la lista del foglio.
4. Scarica in PNG alla massima risoluzione.

## Blocco di stile comune

```
Create a sprite sheet of game items for a 2D point-and-click adventure game, in the
same art style as the reference images: clean thin dark navy outline, flat colors
with two-tone cel shading, warm soft light, friendly cartoon shapes.
Layout: a 3 x 3 grid of 9 separate items, one item centered in each cell, all
items about the same size and well separated (big empty space between them).
Each item is seen from the front, slightly from above, alone, complete, not cut.
Solid flat pure magenta background (#FF00FF) everywhere: no shadows on the floor,
no grid lines, no frames, no text, no letters, no numbers, no labels.
Square image, high resolution.
Items, from top-left to bottom-right, row by row:
```

## Foglio 1 – Molo e oggetti da collezione

```
1. a shiny gold pirate doubloon coin
2. a green glass bottle with a rolled paper message inside and a cork
3. a small brass combination padlock with two number wheels
4. a small wooden notice board on two legs with pinned papers
5. a plain wooden cargo crate with metal corners (blank front, no marks)
6. a coiled thick rope
7. a torn purple diary page with handwriting lines (no readable words)
8. an amber beer mug with white foam
9. a shiny golden hexagonal bolt
```
Nomi per lo script: `doblone bottiglia lucchetto bacheca cassa corda diario boccale bullone`

## Foglio 2 – Taverna e Torre

```
1. a small wooden keg with iron bands (blank front)
2. a cream paper flyer pinned with a red pin (wavy lines, no words)
3. a wooden mission board with three colored paper notes
4. two white dice with black dots
5. a closed wooden cabinet with a small keypad on the door
6. the same wooden cabinet with the door open and the inside empty
7. an old thick red book with a blank gold-framed cover
8. a metal calibration card with punched holes
9. a brass spyglass telescope
```
Nomi per lo script: `botte volantino bacheca-missioni dadi armadio armadio-aperto libro scheda cannocchiale`

## Foglio 3 – Serra e Officina

```
1. a small wooden sign on a stick with a blank cream board
2. a dark green wooden greenhouse door with a small window, closed
3. a grey metal watering can
4. an empty terracotta flower pot with soil
5. the same terracotta pot with a glowing yellow magic flower
6. a blue manual book with a blank light-blue label on the cover
7. a rolled strong fishing net with cork floats
8. a golden gear cog
9. a glowing green magic seed
```
Nomi per lo script: `cartello porta-vivaio annaffiatoio vaso vaso-fiore manuale rete ingranaggio seme`

## Foglio 4 – Premi dei guardiani

Usa il blocco di stile con `a 1 x 3 grid of 3 separate items` al posto di `a 3 x 3 grid of 9 separate items`.

```
1. an old iron key with a round head
2. a magnifying lens with a starry blue glass
3. a golden wrench
```
Nomi per lo script: `chiave lente chiave-inglese`

## Controllo del risultato

1. Sfondo magenta pieno, senza ombre e senza righe della griglia.
2. Un oggetto per cella, intero, ben staccato dagli altri.
3. Nessuna scritta, nessun numero.
4. Ordine giusto: da sinistra a destra, dall'alto in basso.
5. Nomi dei file: `oggetti-1.png` … `oggetti-4.png`.
