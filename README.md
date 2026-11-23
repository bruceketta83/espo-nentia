# 🏝️ Il Segreto dell'Isola di Espo-Nentia

Un videogioco educativo HTML5/JavaScript in stile avventura punta-e-clicca, ideato per ripassare le **proprietà delle potenze** in modo divertente, interattivo e ottimizzato per dispositivi mobile. Pubblico: ragazze e ragazzi delle scuole medie.

▶️ **Gioca:** https://bruceketta83.github.io/espo-nentia/

---

## 📌 Panoramica del Gioco

Nei panni della giovane esploratrice **Aria**, il giocatore esplora le 6 ambientazioni dell'Isola di Espo-Nentia per recuperare i **5 Cristalli Esponenziali** rubati e riattivare il Faro dell'Accademia prima della rivale Lavinia.

L'avventura combina dialoghi in stile pop/moderno, scene animate in grafica vettoriale SVG e duelli matematici.

---

## 🎯 Obiettivi Didattici (Le 5 Regole delle Potenze)

1. **Prodotto di potenze con la stessa base**: $a^m \cdot a^n = a^{m+n}$
2. **Quoziente di potenze con la stessa base**: $a^m : a^n = a^{m-n}$
3. **Potenza di una potenza**: $(a^m)^n = a^{m \cdot n}$
4. **Esponente 0 e 1**: $a^0 = 1$ (con $a \neq 0$) e $a^1 = a$
5. **Prodotto e quoziente con lo stesso esponente**: $a^n \cdot b^n = (a \cdot b)^n$ e $a^n : b^n = (a : b)^n$

---

## 🗺️ Ambientazioni

| Livello | Ambientazione | Mentore | Guardiano / Sfida | Regola Didattica |
| :--- | :--- | :--- | :--- | :--- |
| **1** | Il Molo delle Basi Uguali | 🏴‍☠️ Capitana Vera | 🦍 Barnaba il Buttafuori | Prodotto con stessa base |
| **2** | La Taverna del Quoziente | 🍺 Oste Bartolomeo | 🎲 Pirati Gemelli | Quoziente con stessa base |
| **3** | La Torre dell'Osservatorio | 🔭 Archimede | ⚙️ Ascensore Meccanico | Potenza di una potenza |
| **4** | La Serra degli Esponenti Zero | 🕶️ Madame Zeri | 🌺 Pianta Carnivora | Esponente $0$ e $1$ |
| **5** | L'Officina Steampunk | 👯‍♀️ Gemelle Mira & Nora | 🤖 Automa Meccanico | Stesso esponente |
| **6** | La Cima del Faro | *(Nessuno)* | 👑 Lavinia (Boss Finale) | Sfida Finale Combinata |

---

## 🎮 Meccaniche di Gioco (Gamification)

- **Punta-e-clicca**: tocca un personaggio e Aria cammina fino a lui. Tocca la scena per muovere Aria.
- **Esplorazione a stanze**: ogni area ha 2–3 stanze collegate da uscite. Un fumetto mostra le azioni possibili: 👁 Guarda, 📖 Leggi, ✋ Prendi, 🔧 Usa, 💬 Parla.
- **Oggetti**: si raccolgono e si usano dallo Zaino ("Usa su…"). Gli enigmi si risolvono con le potenze (es. il codice di un lucchetto).
- **Curiosità sulle potenze**: testi da leggere nelle stanze, raccolti nel Taccuino.
- **Missioni secondarie** e **Lavinia** che compare per provocare Aria con una domanda lampo.
- **Frasi variabili**: molti dialoghi hanno più versioni, scelte a caso a ogni partita.
- **Oggetti a catena**: il premio di ogni guardiano serve nell'area successiva (Chiave → porta della Taverna, Cannocchiale → Archimede, Lente → lucernario del vivaio, Seme → vaso del magazzino, Chiave Inglese → botola del Faro).
- **Diario di Lavinia**: 5 pagine nascoste, una per area. Trovarle tutte sblocca il finale segreto.
- **Negozio dell'Aura**: la bancarella di **Zia Turbina**, mercante svalvolata, nella Piazza del Mercato. Vende oggetti utili: ❤️ cuore extra, 💡 pergamena aiutino, 🧪 pozione Doppia Aura, 🧭 bussola dei tesori.
- **Medaglie**: 12 traguardi (zero errori, tutte le Curiosità, tutte le stelle...).
- **Profili**: fino a 6 giocatrici sullo stesso dispositivo, ognuna con il suo salvataggio.
- **Isola a rete con due punti centrali**: la **Piazza del Mercato** (Molo, Taverna, Torre) e il **Belvedere** (Torre, Serra, Officina, Faro), più il ponte tra Serra e Officina.
- **Mappa illustrata** con viaggio rapido solo tra Molo, Piazza e Belvedere: gli altri luoghi si raggiungono a piedi.
- **Enigmi con numeri casuali**, diversi per ogni profilo: nessuno può copiare la soluzione dalla compagna. Il gioco non dà mai il risultato, solo la regola da usare.
- **Oggetti sparsi** tra le aree: per completare le missioni bisogna tornare indietro (es. la rete dell'Officina serve per il doblone in fondo al mare del Molo).
- **Duello**: ogni guardiano ha una barra di vita. Ogni risposta giusta è un colpo. Aria ha 3 cuori.
- **Difficoltà adattiva**: il gioco ricorda le ultime 8 risposte di ogni regola e sceglie il livello (🟢 Facile, 🟡 Medio, 🔴 Sfida). Il livello scende dopo 2 errori nel duello e sale dopo 3 risposte giuste di fila. Il Taccuino mostra il livello di ogni regola.
- **5 tipi di esercizio** nei duelli: scelta multipla, ⌨️ esponente da scrivere con il tastierino, ⏱️ vero/falso a tempo, 🔍 trova l'errore di Lavinia, 🧱 costruisci la potenza con le tessere. Il mix cambia con il livello.
- **Esercizi sempre nuovi**: un generatore crea esercizi casuali per ogni regola. Le risposte sbagliate nascono dagli errori tipici e ogni errore ha la sua spiegazione.
- **Soluzione passo-passo** dopo ogni risposta.
- **🔤 Opzioni di lettura** (pulsante **Aa** in alto, oppure Profilo → Lettura), salvate per ogni profilo:
  - testo Normale, Grande o Molto grande;
  - carattere **OpenDyslexic** o **Leggibile** (Atkinson Hyperlegible) per chi ha la dislessia;
  - più spazio tra lettere e righe;
  - testo subito, senza effetto macchina da scrivere;
  - lettura ad alta voce con il pulsante 🔈 Ascolta, anche automatica a ogni dialogo, velocità lenta o normale. Le formule sono lette a parole (es. "2 alla 3 per 2 alla 4").
- **🧮 Calcolatrice** nella barra in basso, per chi ha difficoltà con i calcoli (discalculia). Fa solo + − × ÷, con la precedenza della scuola. Si apre sopra la scena: l'esercizio e le risposte restano visibili. Nessun tasto per le potenze: le regole restano da applicare.
- **Aura**: +50 per ogni risposta giusta, bonus combo per le risposte giuste di fila, −10 per ogni errore. Spendi 20 Aura per un "Aiutino".
- **Stelle (1–3)** per ogni area, in base agli errori nel duello.
- **Resoconto finale** con la percentuale di risposte giuste per ogni regola (utile per insegnanti e genitori).

---

## 🛠️ Struttura Tecnica

Nessuna dipendenza esterna e nessuna compilazione: GitHub Pages pubblica i file così come sono.

| File | Contenuto |
| :--- | :--- |
| `index.html` | Struttura della pagina |
| `style.css` | Grafica e animazioni CSS |
| `js/audio.js` | Effetti sonori e musica generati con Web Audio API |
| `js/data.js` | Regole, aree, dialoghi, domande d'autore |
| `js/generator.js` | Generatore di esercizi casuali per ogni regola |
| `js/exercises.js` | Difficoltà adattiva e 5 tipi di esercizio |
| `js/calculator.js` | Calcolatrice (+ − × ÷) che copre solo la scena |
| `js/reading.js` | Opzioni di lettura e lettura ad alta voce |
| `fonts/` | Font OpenDyslexic e Atkinson Hyperlegible (SIL Open Font License) |
| `js/characters.js` | Personaggi SVG animati |
| `js/scenes.js` | Scene SVG animate (schermata iniziale, aree e stanze) |
| `js/world.js` | Motore dell'esplorazione: stanze, fumetto azioni, oggetti, lucchetti, domande lampo, missioni |
| `js/rooms.js` | Oggetti, Curiosità, missioni, diario di Lavinia, stanze del Molo |
| `js/rooms2.js` | Stanze, enigmi e dialoghi delle aree 2–6 |
| `js/meta.js` | Medaglie, Negozio dell'Aura, profili, mappa illustrata |
| `js/game.js` | Motore di gioco: scena, dialoghi, duelli, salvataggio |

- **Salvataggio automatico** in `localStorage`, uno per profilo (chiave `esponentia_save_v2_<profilo>`). I salvataggi precedenti passano al primo profilo.
- **Accessibilità**: rispetta l'impostazione di sistema "riduci movimento"; lo zoom della pagina è consentito.

### Aggiungere una nuova scena animata
1. Disegna i personaggi in `js/characters.js` (piedi in `0,0`, sguardo a destra) e registrali in `CHARS`.
2. Aggiungi la scena in `SCENES` con le funzioni `bg()` e `fg()`.
3. In `js/data.js`, nell'area, imposta `scene` e `draw` per mentore e guardiano.

---

## 📲 Gioco offline (app)

Il gioco è una PWA: dopo la prima apertura funziona anche **senza Internet**.

1. Apri https://bruceketta83.github.io/espo-nentia/ con il telefono.
2. Android (Chrome): tocca **"📲 Installa il gioco"** nella schermata iniziale, oppure Menu → *Installa app*.
3. iPhone (Safari): tocca **Condividi** → **Aggiungi alla schermata Home**.

## 🧪 Test automatici

A ogni pull request GitHub esegue i test (`.github/workflows/test.yml`): generatore di esercizi, tipi di esercizio, calcolatrice, opzioni di lettura, personaggi e oggetti separati e toccabili in ogni stanza, tutte le stanze, una partita completa con i ritorni, gioco offline, salvataggi vecchi.

Per eseguirli sul computer:

1. Installa Node.js 22.
2. Nella cartella del progetto esegui `npm ci`, poi `npx playwright install chromium`.
3. Esegui `npm test`. Il server locale parte da solo.

Elenco delle evoluzioni proposte: [ROADMAP.md](ROADMAP.md). Linee guida per i dialoghi: [DIALOGHI.md](DIALOGHI.md). Descrizione grafica: [GRAFICA.md](GRAFICA.md).

## 🚀 Pubblicazione su GitHub Pages

1. Vai nelle impostazioni del repository (**Settings > Pages**).
2. Seleziona il branch `main` e la cartella `/ (root)` come sorgente di pubblicazione.
3. Salva: dopo circa un minuto il gioco è online su `https://bruceketta83.github.io/espo-nentia/`.

---

## 📄 Licenza

Progetto ad uso didattico libero e gratuito.
