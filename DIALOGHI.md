# 💬 Linee guida per i dialoghi

Regole per scrivere e rivedere i dialoghi del gioco. Usale come lista di controllo.

## 1. Pubblico e obiettivo

1. Scrivi per ragazze delle scuole medie. Usa il femminile: "esploratrice", "sei seria?", "pronta?".
2. Insegna le 5 proprietà delle potenze. Ogni dialogo di matematica aiuta ad applicare una regola.
3. Non dare mai il risultato di un enigma. Dai solo la regola da usare.
4. Usa sempre le stesse parole per le stesse cose: "base", "esponente", "potenza", "stessa base". Non usare sinonimi.

## 2. Tono

1. Usa un tono pop e ironico, con lo slang dei ragazzi.
2. Fai battute leggere. Non scrivere insulti, commenti sul corpo o frasi che escludono qualcuno.
3. Non usare parolacce, nemmeno attenuate.
4. Scrivi in italiano. Usa una parola inglese solo se è nello slang approvato (sezione 3).
5. Puoi usare le parole inglesi già entrate nell'italiano: ok, wow, tilt, nerd, follower, TikTok.
6. Puoi usare queste espressioni inglesi approvate: game over, plot twist, zero drama, cringe alert, combo (es. "Combo x3"), boss finale, round, sistemi online, fashion victim, nerd level, too easy, ON, baby, beat, stop.
7. Traduci le altre parole inglesi. Esempi:

| Non scrivere | Scrivi |
| :--- | :--- |
| game on | sfida accettata |
| focus | concentrati |
| boom | bum |
| mother (come lode) | mitica |

## 3. Parole e riferimenti approvati

### Slang

| Parola | Uso nel gioco |
| :--- | :--- |
| bro | Guardiani e Aria, tono amichevole |
| baddie | Barnaba e Lavinia |
| aura | Valuta del gioco e battute ("+1000 aura", "aura persa") |
| scena muta | Chi non risponde |
| easy | Dopo un esempio semplice |
| cringe | Per un errore imbarazzante o una battuta brutta. Esempio: "Moltiplicare gli esponenti qui? Cringe." |
| chillati | Per calmare chi sbaglia o ha fretta. Esempio: "Chillati, rileggi la regola." |
| slay | Lode dopo una risposta giusta. Lavinia: "Ok, slay. Contenta?" |
| delulu | Illusa. Lavinia: "Pensi di arrivare al Faro prima di me? Delulu." |
| red flag / green flag | Errore grave / risposta giusta. "Red flag: esponenti moltiplicati!" |
| POV | Scena tipica. "POV: hai usato la regola sbagliata." |
| boh / raga / ci sta | Parlato comune di Aria, Lavinia e Zia Turbina |
| random | A caso. "Risposta random? Si vede." |
| flexare | Vantarsi. Lavinia: "Oggi flexo: tre cristalli e zero errori." |
| sus | Sospetto. "Base cambiata? Sus." |

### Artisti e meme

| Riferimento | Uso nel gioco |
| :--- | :--- |
| Fabri Fibra | Spiegazione di un errore |
| Marracash | Spiegazione di un errore |
| "Six seven" (6⁷) | Risposta sbagliata buffa (`MSG.meme67`). Mai in "trova l'errore". |
| Anna | Errore di potenza di potenza ("Anna lo direbbe a ritmo…") |
| Angelina Mango | Errore di esponente zero ("La noia") |
| Olly | Errore di quoziente (Sanremo) |
| Annalisa | Errore di base cambiata (ritornello che resta in testa) |
| Elodie | Lavinia studia con Elodie nelle cuffie |
| Mahmood | Zia Turbina canta ai piccioni |
| Sarah Toscano | Zia Turbina canta "come ad Amici" |
| Labubu | Collezione di Zia Turbina e di Lavinia |
| Capibara | Animale chill della Serra e di Zia Turbina |
| Cioccolato di Dubai | Prodotto assurdo di Zia Turbina |

### Frasi della professoressa

| Frase | Uso nel gioco |
| :--- | :--- |
| "a mena dito" | Regola da sapere a memoria |
| "a tappeto" | Ripasso completo, tutte le regole |
| "come se non ci fosse un domani" | Esercizi tanti e veloci |

## 4. Personaggi

| Personaggio | Voce |
| :--- | :--- |
| Aria | Curiosa e ironica. Commenta oggetti e azioni sbagliate. |
| Mentori | Spiegano una regola con un esempio della regola, mai dell'enigma. |
| Guardiani | Duri ma simpatici. Sfidano, poi ammettono la sconfitta. |
| Lavinia | Rivale snob e antipatica. Provoca con domande lampo. I suoi errori servono per "trova l'errore". |
| Zia Turbina | Mercante completamente svalvolata. Frasi assurde, parla veloce. |

Sopra i personaggi non c'è il nome. Il nome compare nella finestra dei dialoghi.

1. Fai dire il nome al personaggio nella prima battuta. Scrivilo in **tutte** le varianti di quella battuta.
2. Per i guardiani, fai dire il nome sia in `intro` sia in `blockMsg`: la prima volta può essere l'una o l'altra.
3. Per i personaggi che tornano più volte (Lavinia, Zia Turbina) usa una battuta fissa al primo incontro (flag `met_...`).

## 5. Struttura di un esercizio

1. **Domanda:** frase breve + formula nel riquadro giallo (`M()` con `<sup>`).
2. **Risposta giusta:** lode breve, poi la soluzione passo-passo.
3. **Risposte sbagliate:** ognuna nasce da un errore tipico. Ognuna ha una spiegazione che nomina la regola.
4. Scrivi le formule nel riquadro. Così la lettura ad alta voce dice "2 alla 3 per 2 alla 4".

## 6. Forma e lunghezza

1. Scrivi al massimo 2–3 frasi per battuta. Il testo deve stare in un iPhone SE, anche con il testo "Molto grande".
2. Usa il **grassetto** solo per la parola chiave della regola o per un nome.
3. Metti le emoji solo all'inizio di pulsanti ed etichette. La lettura ad alta voce le salta.
4. Scrivi più varianti per le frasi che si ripetono (array e `say()`). Così il testo cambia se si rigioca.
5. Non scrivere numeri di indizi se l'enigma ha numeri casuali. I numeri vengono dal codice (`puz()`).

## 7. Dove sono i dialoghi

| File | Contenuto |
| :--- | :--- |
| `js/data.js` | Mentori, guardiani, domande d'autore, messaggi di errore, `MSG` |
| `js/rooms.js` | Molo, oggetti, Curiosità, missioni, diario di Lavinia |
| `js/rooms2.js` | Aree 2–6, Zia Turbina, Piazza e Belvedere |
| `js/world.js` | Frasi generiche (`FAIL_USE`, guarda, prendi) |
| `js/generator.js` | Spiegazioni degli errori tipici negli esercizi casuali |

## 8. Proposte valutate

Stato: ✅ approvato e già nel gioco · ❌ non scelto · ⚠️ solo con cautela.
Le mode cambiano in fretta. Prima di usare una voce, chiedi conferma alla professoressa o alle ragazze.

### Slang

| Parola | Significato | Esempio nel gioco | Stato |
| :--- | :--- | :--- | :--- |
| slay | Fare una cosa benissimo | "Tre giuste di fila: slay!" | ✅ |
| delulu | Illusa, fuori dalla realtà | Lavinia: "Pensi di battermi? Delulu." | ✅ |
| red flag / green flag | Segnale cattivo / buono | "Moltiplicare esponenti con basi diverse: red flag." | ✅ |
| POV | Punto di vista, scena tipica | Curiosità: "POV: dividi due potenze con la stessa base." | ✅ |
| main character | La protagonista | Zia Turbina: "Oggi sei la main character!" | ❌ |
| NPC | Personaggio senza idee | Lavinia ai guardiani: "Sei proprio un NPC." | ❌ |
| random | A caso | "Hai risposto random?" | ✅ |
| boh / raga / ci sta | Parlato comune | Battute di Aria | ✅ |
| flexare | Vantarsi | Lavinia: "Flexo il mio record." | ✅ |
| ick | Cosa che fa ribrezzo | "L'esponente zero che fa zero? Che ick." | ❌ |
| aura farming | Fare scena per guadagnare aura | Zia Turbina vende "kit per aura farming" | ❌ |
| sus | Sospetto | "Questo risultato è sus." | ✅ |
| rizz / sigma / mewing | Slang maschile, da social | Meglio di no: il pubblico è femminile | ⚠️ |

### Artisti

| Artista | Perché | Stato |
| :--- | :--- | :--- |
| Anna (Pepe) | Rapper italiana molto ascoltata dalle ragazze | ✅ |
| Angelina Mango | Cantautrice, Sanremo 2024 | ✅ |
| Olly | Vincitore di Sanremo 2025 | ✅ |
| Sarah Toscano | Da Amici, molto seguita dalle più giovani | ✅ |
| Annalisa, Elodie, Mahmood | Pop italiano conosciuto da tutti | ✅ |
| Taylor Swift, Sabrina Carpenter, Olivia Rodrigo, Billie Eilish | Pop internazionale molto seguito dalle ragazze | ❌ |
| K-pop (BTS, Stray Kids, Blackpink) | Fandom grandi tra le ragazze delle medie | ❌ |
| Rosé e Bruno Mars, "APT." | Canzone e balletto diventati meme | ❌ |
| Geolier, Lazza, Sfera Ebbasta | Molto ascoltati, ma con testi espliciti: citare solo il nome | ⚠️ |

### Meme e mode

| Meme | Esempio nel gioco | Stato |
| :--- | :--- | :--- |
| Italian brainrot (Tung Tung Tung Sahur, Ballerina Cappuccina) | Nomi buffi nelle frasi di Zia Turbina | ⚠️ Usa solo i nomi. Alcuni audio originali hanno bestemmie o frasi offensive (es. Tralalero Tralala, Bombardiro Crocodilo). |
| Labubu | Peluche collezionabile nel negozio di Zia Turbina | ✅ |
| Capibara | Animale "chill" nella Serra | ✅ |
| Cioccolato di Dubai | Prodotto assurdo di Zia Turbina | ✅ |
| GRWM ("get ready with me") | Armadio: "GRWM per il duello" | ❌ |
| "It's giving..." | "It's giving esponente zero." | ❌ |
