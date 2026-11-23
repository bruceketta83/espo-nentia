/* ==========================================================================
   ESPLORAZIONE DELLE AREE 2–6
   Ogni area: stanze, catena di enigmi con il premio dell'area precedente,
   letture, una pagina del diario di Lavinia, comparsa di Lavinia.
   ========================================================================== */

/* Lavinia compare nella stanza del mentore dopo la lezione. */
function laviniaHotspot(A, key, x, y) {
  return {
    id: 'lavinia', name: '👑 Lavinia', box: [x - 14, y - 66, 28, 66], stand: x - 34,
    visible: () => flag(`${key}_here`),
    draw: () => charSVG('lavinia', x, y, -1, 'char-lavinia-cameo'),
    talk: () => laviniaCameo(A, key)
  };
}
function laviniaAfterLesson(A, key) {
  if (!flag(key) && !flag(`${key}_here`)) {
    setFlag(`${key}_here`);
    refreshLabels(A);
    toast('👑 Lavinia è arrivata... che noia.');
  }
}
/* Uscita verso un'altra area, eventualmente in una stanza precisa. */
function areaExit(id, toArea, toRoom, label, box, stand, labelY, lockedIf, lockedMsg) {
  // Si arriva dal lato opposto: uscita a destra → si entra da sinistra, e viceversa.
  const ex = { id, label, box, stand, toArea, toRoom, labelY, arrive: box[0] > 200 ? 40 : 360 };
  if (lockedIf) {
    ex.locked = lockedIf;
    ex.lockedActions = [{ icon: '🚧', label: 'Bloccato', fn: () => ariaSays(lockedMsg) }];
  }
  return ex;
}
function leftExit(toArea, toRoom, label, lockedIf, lockedMsg) {
  return areaExit(`l-${toArea}-${toRoom}`, toArea, toRoom, label, [0, 112, 52, 70], 22, 106, lockedIf, lockedMsg);
}
function rightExit(toArea, toRoom, label, lockedIf, lockedMsg) {
  return areaExit(`r-${toArea}-${toRoom}`, toArea, toRoom, label, [348, 112, 52, 70], 380, 106, lockedIf, lockedMsg);
}
function backExit(toArea, label) {
  return { id: `back-${toArea}`, label, box: [0, 112, 52, 70], stand: 22, toArea, labelY: 106 };
}
function forwardExit(A, toArea, label) {
  return {
    id: `fwd-${toArea}`, label, box: [348, 112, 52, 70], stand: 380, toArea, labelY: 106,
    visible: () => state.completedAreas.includes(A.id)
  };
}
function done(A) { return state.completedAreas.includes(A.id); }

/* --------------------------------------------------------------------------
   ZIA TURBINA, LA MERCANTE SVALVOLATA
   -------------------------------------------------------------------------- */
const TURBINA = {
  greet: [
    'BENVENUTAAA! Sono Zia Turbina e vendo COSE ESPONENZIALI! Più compri, più... boh, non lo so, ma è bellissimo!',
    'Ciao cliente! Oggi sconti come se non ci fosse un domani! Che poi il domani c’è, l’ho controllato. Due volte. Anzi, 2² volte.',
    'Ho studiato le potenze a tappeto! Poi ho studiato il tappeto: ha 2⁴ frange. Pazzesco, no?',
    'Shhh... i miei calzini parlano. Dicono che oggi devi comprare qualcosa. I calzini non sbagliano MAI.',
    'Il mio cappello ha l’elica! Se gira abbastanza veloce, volo. Non è mai successo. MA SUCCEDERÀ.',
    'Conosco i prezzi a mena dito! Anzi, a mena gomito. A mena ginocchio! Ok, a mena dito.',
    'Benvenuta! Oggi la mia pozione fa le bolle a forma di esponente. Ieri faceva le bolle a forma di gatto.',
    'Ho un Labubu che conta in potenze di 2: uno, due, quattro, otto... poi si addormenta. Come me.',
    'Assaggia! Cioccolato di Dubai al gusto esponente. Il pistacchio è elevato alla seconda!',
    'Il mio capibara è così chill che quando lo guardi ti cala l’ansia alla zero. Cioè fa UNO di ansia. Matematica!',
    'Raga, oggi flexo la mia collezione: 2³ Labubu, tutti diversi. Uno mi guarda male, ma ci sta.',
    'Ieri ho cantato Mahmood ai miei piccioni. Hanno chiesto il bis. Anzi, il bis al quadrato!'
  ],
  bought: [
    'Ottimo acquisto! Lo racconto a tutti i miei piccioni.',
    'Venduto! Uso i soldi per comprare un’elica più grande.',
    'Che scelta! I miei calzini applaudono.',
    'Affare fatto! Torna presto, o tardi, o di lato come i granchi!',
    'Slay! Con questo acquisto il mio Labubu fa la ruota.',
    'Venduto! Festeggio con il cioccolato di Dubai. E col capibara.',
    'Affare! Ora canto come Sarah Toscano ad Amici. Stonata, ma col cuore.'
  ],
  look: ['Zia Turbina. Ha un’elica sul cappello, due occhiali diversi e una pozione che fa le bolle. Normalissima.', 'Ha i capelli di 6 colori. Sei. Come le aree dell’isola. Coincidenza? Sì.', 'Ha un Labubu appeso alla cintura. Il Labubu ha un Labubu più piccolo. È sus.']
};

function talkTurbina() {
  // Primo incontro: Zia Turbina dice il suo nome.
  const greet = flag('met_turbina') ? TURBINA.greet : TURBINA.greet[0];
  setFlag('met_turbina');
  setDialogue('Zia Turbina', 'Mercante svalvolata', 'turbina', greet, 'turbina-npc');
  clearChoices();
  addChoice('🛍️ Fammi vedere la merce!', () => openShop(), 'primary-action');
  addChoice('<span>🤔 Chi sei, scusa?</span><span>→</span>', () => {
    setDialogue('Zia Turbina', 'Mercante svalvolata', 'turbina', [
      'Sono la mercante più famosa dell’isola! Vendo cose utili, cose inutili e cose che non so cosa siano. Si paga in <b>Aura</b>!',
      'Chi sono io? Bella domanda. Chi sei TU? Chi siamo NOI? Ok, sono la mercante. Si paga in <b>Aura</b>, quella che vinci nei duelli.'
    ], 'turbina-npc');
    clearChoices();
    addChoice('🛍️ Fammi vedere la merce!', () => openShop(), 'primary-action');
    addChoice('↩️ Ciao ciao', () => ariaSays(['Che tipa. Mi piace.', 'Ok. Questa è completamente svalvolata.']));
  });
  addChoice('↩️ Ciao ciao', () => ariaSays(['Che tipa. Mi piace.', 'Ok. Questa è completamente svalvolata.', 'Il suo cappello ha appena fatto bip.']));
}

/* Bacheca delle missioni: dove cercare i pezzi mancanti. */
function readQuestBoard() {
  const rows = Object.keys(QUESTS).map(id => {
    const q = QUESTS[id];
    const st = questState(id);
    if (st === 'none') return `<li>❔ <i>Missione non ancora scoperta</i></li>`;
    if (st === 'done') return `<li>✅ <b>${q.title}</b></li>`;
    return `<li>${q.icon} <b>${q.title}</b>: ${q.progress ? q.progress() : ''}<br><small>${q.board || q.desc}</small></li>`;
  }).join('');
  showReading('📋 Bacheca delle missioni', `<ul class="quest-board">${rows}</ul>`, () => ariaSays(['Ok, ho tutto in testa. Più o meno.', 'Missioni segnate. Si parte!']));
}

/* ==========================================================================
   AREA 2: LA TAVERNA DEL QUOZIENTE (piazza + strada + sala)
   ========================================================================== */
(function setupTaverna() {
  const A = AREAS[1];
  A.startRoom = 'piazza';
  A.intro = [
    'Benvenuta nella Piazza del Mercato, il cuore dell’isola! Da qui partono le strade per il Molo, la Taverna e la Torre. E c’è una bancarella... molto strana.',
    'La Piazza del Mercato! Fontana, bandierine e una mercante che urla cose senza senso. A destra c’è la strada per la Taverna.'
  ];

  A.mentor.lines = [
    ['Benvenuta nella Taverna! Io sono l’Oste Bartolomeo. Quei due pirati laggiù hanno rubato il cannocchiale dell’Osservatorio e il Cristallo Ciano.',
     'Ehi, piccola esploratrice! Sono Bartolomeo, l’oste. Attenta ai Pirati Gemelli: hanno il Cristallo Ciano e barano pure.'],
    'Per batterli ti serve la regola della <b>divisione (quoziente)</b>: se due potenze hanno la <b>stessa base</b>, mantieni la base e <b>sottrai gli esponenti</b>.',
    ['Esempio: <span class="math-expr">5<sup>7</sup> : 5<sup>2</sup> = 5<sup>7−2</sup> = 5<sup>5</sup></span>. La base non si tocca!',
     'Tipo così: <span class="math-expr">6<sup>9</sup> : 6<sup>4</sup> = 6<sup>5</sup></span>. Sottrai e via.'],
    'Ho scritto la <b>Regola 2</b> nel Taccuino. E se trovi i miei <b>3 boccali</b> spariti, ti offro una ricompensa!'
  ];
  A.mentor.again = () => (questState('boccali') === 'active' && questCount('boccali') < 3
    ? say([`Boccali trovati: ${questCount('boccali')} su 3. Uno l’ha preso in prestito Archimede, quel distratto. Un altro l’ho lasciato da Madame Zeri!`, `Me ne mancano ancora ${3 - questCount('boccali')}. Cerca alla Torre e alla Serra!`])
    : say(['Ricorda: con il diviso, gli esponenti si sottraggono!', 'Ripassa il Taccuino a tappeto, poi torna da quei due imbroglioni.', 'I Gemelli barano. Tu no. Vinci tu.']));
  A.mentor.onEnd = () => {
    if (questState('boccali') === 'none') setQuest('boccali', 'active');
    laviniaAfterLesson(A, 'lav1');
  };
  A.mentor.extraChoices = () => questDeliverChoice('boccali',
    { name: A.mentor.name, role: A.mentor.role, avatar: 'oste' }, 80,
    ['I miei boccali! Sei un tesoro. Ecco <b>80 Aura</b>!', 'Tutti e tre! Offre la casa: <b>80 Aura</b> per te!']);

  A.guardian.intro = [
    'Ehi ragazzina, noi siamo i Pirati Gemelli e qui si gioca pesante! Vuoi il Cannocchiale e il Cristallo? Risolvi queste divisioni senza andare in tilt!',
    'Siamo i Pirati Gemelli: con i dadi fortunati siamo imbattibili. Vediamo se reggi!',
    'Pirati Gemelli contro Aria: due contro una. Mi sembra giusto. Pronta?'
  ];
  A.guardian.blockMsg = [
    'Siamo i Pirati Gemelli! Al nostro tavolo si siede solo chi conosce le regole! Parla prima con l’<b>Oste Bartolomeo</b>.',
    'Noi Pirati Gemelli abbiamo una regola: prima la lezione dell’<b>Oste</b>, poi i dadi. Regole della casa.'
  ];
  A.guardian.loseMsg = [
    'Ahah, sei andata in tilt! Ripassa la Regola 2 e torna al tavolo, se hai il coraggio.',
    'Game over! Ma il tavolo è sempre aperto. Torna quando vuoi.'
  ];
  A.guardian.winMsg = [
    'Incredibile, ci ha ripuliti! Prendi pure il <b>Cristallo Ciano</b> e il <b>Cannocchiale</b>. Hai un’aura spaventosa!',
    'Ok, ok, ci arrendiamo! Ecco il <b>Cristallo Ciano</b> e il <b>Cannocchiale</b>. Non dirlo a nessuno.'
  ];
  A.duelGate = () => (flag('dadi_ok') ? null : [
    `Ehm... abbiamo perso i nostri <b>dadi fortunati</b>. Sono caduti nella botte che vale <b>3<sup>${P_botti().k}</sup></b>! Senza dadi niente sfida.`,
    `Niente dadi, niente partita. Sono finiti in una botte: quella che vale <b>3<sup>${P_botti().k}</sup></b>, ci pare.`
  ]);

  A.objective = () => {
    if (!flag('taverna_open')) return 'Dalla Piazza vai a destra fino alla Taverna. La porta è chiusa: hai una chiave nello Zaino, usala sulla porta!';
    if (!state.unlockedRules.includes(A.ruleId)) return 'Entra e parla con l’Oste Bartolomeo: ti spiega la Regola 2.';
    if (!flag('dadi_ok') && !hasItem('dadi')) return `I Gemelli hanno perso i dadi in una botte. Controlla le tre botticelle: cerca quella che vale 3${toSup(P_botti().k)}. Usa la Regola 2!`;
    if (!flag('dadi_ok')) return 'Usa i dadi sui Pirati Gemelli: Zaino → Usa → tocca i Gemelli.';
    if (!done(A)) return 'Ora sfida i Pirati Gemelli!';
    if (questState('boccali') === 'active' && questCount('boccali') < 3) return `Missione extra: trova i boccali dell’Oste (${questCount('boccali')}/3). L’Oste dice: uno alla Torre, uno alla Serra.`;
    if (questState('boccali') === 'active') return 'Porta i boccali all’Oste!';
    return 'Area completata! Torna in Piazza e prendi il sentiero per la Torre.';
  };

  A.rooms = {
    piazza: {
      scene: 'piazza',
      title: '🏛️ Piazza del Mercato',
      enter: ['La Piazza del Mercato. Profuma di frittelle e di follia.', 'La fontana fa gli zampilli. Zia Turbina fa i rumori.', 'Il cuore dell’isola! Da qui si va dappertutto... quasi.'],
      layout: { groundY: 170, ariaStart: 150 },
      hotspots: [
        {
          id: 'turbina', name: '🌀 Zia Turbina', box: [196, 96, 32, 74], stand: 176,
          draw: () => charSVG('turbina', 212, 170, 1, 'char-turbina-npc'),
          talk: () => talkTurbina(),
          look: TURBINA.look
        },
        {
          id: 'bacheca-missioni', name: '📋 Bacheca delle missioni', box: [278, 100, 30, 34], stand: 292,
          obj: 'bacheca-missioni', objScale: 1.4,
          read: () => readQuestBoard(),
          look: 'Una bacheca piena di annunci. Qualcuno cerca dobloni, boccali, bulloni...'
        },
        { id: 'fontana', name: '⛲ Fontana', box: [70, 100, 58, 66], stand: 132, noDot: true, look: ['Una fontana. Se butti una moneta esprimi un desiderio. Desidero non buttare monete.', 'L’acqua sale e scende. Come il mio umore durante le verifiche.'] }
      ],
      exits: [
        { ...areaExit('pz-molo', 0, 'pontile', '⬅ Molo', [0, 112, 52, 76], 22, 106), arrive: 360 },
        { id: 'to-strada', label: 'Taverna ➜', box: [348, 164, 52, 36], stand: 370, to: 'strada', arrive: 40, labelY: 192 },
        areaExit('pz-torre', 2, 'terrazza', '⬆ Torre', [334, 58, 46, 104], 340, 84, () => state.unlockedArea < 2,
          ['Il cancello per la Torre è chiuso. Prima devo battere i Pirati Gemelli!', 'Chiuso. Il sentiero per la Torre si apre dopo la Taverna.'])
      ]
    },

    strada: {
      scene: 'strada',
      enter: ['Strada di ciottoli. Dalla Taverna arriva odore di frittelle.', 'Un gatto dorme sul davanzale. Beato lui.', 'Qui fuori è tutto tranquillo. Dentro, decisamente no.'],
      layout: { groundY: 184, ariaStart: 200 },
      hotspots: [
        {
          id: 'porta', name: '🚪 Porta della Taverna', box: [140, 84, 46, 88], stand: 162,
          visible: () => !flag('taverna_open'),
          use: () => ariaSays(['È chiusa a chiave. Mi serve una chiave...', 'Spingo... niente. Chiusa.']),
          useIcon: '✋', useLabel: 'Apri',
          look: ['Una porta robusta con una serratura grande. Mi ricorda una certa chiave...', 'Chiusa. Dentro però fanno festa.'],
          useItem: {
            i1: () => {
              removeItem('i1');
              setFlag('taverna_open');
              playSound('success');
              // Sfondo con la porta aperta.
              if ($('layer-bg')) $('layer-bg').innerHTML = SCENES.strada.bg();
              refreshLabels(A);
              ariaSays(['Clack! La chiave di Barnaba funziona. Si entra!', 'La chiave gira. Taverna, sto arrivando!']);
            }
          }
        },
        {
          id: 'volantino', name: '📄 Volantino', box: [112, 116, 22, 28], stand: 123,
          obj: 'volantino',
          read: () => readCuriosity('carta'),
          look: 'Un volantino attaccato al muro. Parla di fogli di carta. Su un’isola pirata. Ok.'
        },
        {
          id: 'coin2', name: '💰 Qualcosa che luccica', box: [240, 176, 16, 12], stand: 248,
          visible: () => !flag('coin2'),
          draw: () => sparkleSVG(248, 183, COIN),
          take: () => takeCoin(2)
        },
        { id: 'gatto', name: '🐈‍⬛ Gatto', box: [212, 118, 28, 18], stand: 226, noDot: true, look: ['Il gatto dorme. Elevato alla zero: vale 1 gatto, ma pigrissimo.', 'Miao? No, ronfa e basta.'] },
        { id: 'casse', name: '📦 Casse', box: [260, 134, 80, 46], stand: 252, noDot: true, look: 'Casse di frittelle e succo di mirtillo. La Taverna fa sul serio.' }
      ],
      exits: [
        { id: 'to-piazza', label: '⬅ Piazza', box: [0, 112, 52, 70], stand: 22, to: 'piazza', arrive: 350, labelY: 106 },
        { id: 'to-sala', label: '🚪 Entra', box: [140, 84, 46, 88], stand: 162, to: 'sala', arrive: 60, labelY: 78, visible: () => flag('taverna_open') }
      ]
    },

    sala: {
      scene: 'taverna',
      enter: ['La Taverna è piena di fumo e risate.', 'Qualcuno canta stonato in fondo alla sala.', 'Odore di frittelle e di guai.'],
      layout: {
        ...A.layout,
        ariaStart: 332,
        mentor: { ...A.layout.mentor, look: ['L’Oste Bartolomeo. Ha i baffi più curati dell’isola.', 'Lucida i boccali con un’energia incredibile.'] },
        guardian: {
          ...A.layout.guardian,
          look: ['Due pirati identici. Uno ha la benda a destra, l’altro a sinistra. Simmetria perfetta.', 'I Pirati Gemelli bisbigliano. Sicuro stanno barando.'],
          useItem: {
            dadi: () => {
              removeItem('dadi');
              setFlag('dadi_ok');
              playSound('success');
              refreshLabels(A);
              setDialogue(A.guardian.name, A.guardian.role, 'gemelli', ['I NOSTRI DADI! Ok, adesso possiamo giocare. Preparati!', 'Grazie... cioè, ora ti distruggiamo. Ma grazie.'], 'guardian');
              clearChoices();
              addChoice('⚔️ Sfida i Gemelli', () => startGuardianChallenge(A), 'primary-action');
              addChoice('↩️ Più tardi', () => ariaSays(null));
            }
          }
        }
      },
      hotspots: [
        {
          id: 'botti', name: '🛢️ Tre botticelle', box: [52, 164, 62, 26], stand: 83,
          draw: () => ['A', 'B', 'C'].map((l, i) => objImg('botte', 63 + i * 20, 190, 19) + objText(l, 63 + i * 20, 184, 7, '#fef3c7')).join(''),
          look: () => `Tre botticelle con delle scritte: ${P_botti().kegs.map(k => `${k.l} = 3${toSup(k.m)} : 3${toSup(k.n)}`).join(', ')}.`,
          useIf: () => !flag('dadi_ok') && !hasItem('dadi'),
          use: () => {
            const P = P_botti();
            askChoice({
              title: 'Le tre botticelle', role: `Quale vale 3${toSup(P.k)}?`, avatar: '🛢️',
              prompt: `I dadi sono nella botte che vale <span class="math-expr">3<sup>${P.k}</sup></span>. Quale apri?`,
              options: P.kegs.map(k => ({
                text: `${k.l}: 3${toSup(k.m)} : 3${toSup(k.n)}`,
                correct: !!k.ok,
                msg: [`Questa non vale 3${toSup(P.k)}. Ricontrolla: con il diviso gli esponenti si sottraggono.`, 'Botte sbagliata! Rifai la sottrazione degli esponenti.']
              })),
              onSuccess: () => {
                giveItem('dadi');
                ariaSays(['Botte giusta! Dentro ci sono i dadi fortunati dei Gemelli.', 'Trovati i dadi! Bleah, sanno di vino.']);
              }
            });
          },
          useIcon: '🔍', useLabel: 'Apri una'
        },
        {
          id: 'mug2', name: '🍺 Un boccale', box: [104, 140, 18, 14], stand: 118,
          visible: () => !flag('mug2'),
          draw: () => sparkleSVG(113, 148, MUG),
          take: () => collectPiece('boccali', 'mug2', ['Un boccale dell’Oste! Gli altri due sono in giro per l’isola.', 'Boccale numero uno. Pare che Archimede e Madame Zeri ne abbiano presi in prestito altri...'])
        },
        {
          id: 'diario2', name: '📓 Un foglio viola', box: [240, 186, 18, 14], stand: 249,
          visible: () => !flag('dia2'),
          draw: () => diaryPageSVG(249, 193),
          read: () => readDiary(2),
          look: 'Un foglio viola sul bancone. Profuma di profumo costoso.'
        },
        laviniaHotspot(A, 'lav1', 222, 194)
      ],
      exits: [
        { id: 'to-strada', label: '🚪 Esci', box: [0, 112, 52, 60], stand: 22, to: 'strada', arrive: 238, labelY: 104 }
      ]
    }
  };
})();

/* ==========================================================================
   AREA 3: LA TORRE DELL'OSSERVATORIO (terrazza + biblioteca)
   ========================================================================== */
(function setupTorre() {
  const A = AREAS[2];
  A.startRoom = 'terrazza';
  A.intro = [
    'Sei ai piedi della Torre dell’Osservatorio. Il cielo è pieno di stelle e l’ascensore è bloccato.',
    'La Torre dell’Osservatorio! Un vecchio con la barba sta sistemando delle lenti. L’ascensore lampeggia rosso.'
  ];

  A.mentor.lines = [
    ['Oh, una visitatrice! Sono il Bibliotecario Archimede. I Pirati Gemelli mi hanno rubato il cannocchiale, sai?',
     'Benvenuta alla Torre! Sono Archimede. Scusa il disordine: da quando mi hanno rubato il cannocchiale, non vedo più le stelle.'],
    'Guarda come funzionano due lenti una dentro l’altra: se una ingrandisce <span class="math-expr">2<sup>3</sup></span> e l’altra eleva tutto alla <span class="math-expr">2</span>...',
    'In una <b>potenza di potenza</b> <span class="math-expr">(a<sup>m</sup>)<sup>n</sup></span>, la base rimane uguale e gli esponenti si <b>MOLTIPLICANO</b>!',
    'Ho annotato la <b>Regola 3</b> nel Taccuino. L’ascensore vuole una <b>scheda di calibrazione</b>: l’ho chiusa nell’armadio della biblioteca. E se ritrovi il mio cannocchiale... riportamelo!'
  ];
  A.mentor.again = () => say([
    'Potenza di potenza: gli esponenti si moltiplicano. Mai sommarli!',
    'La scheda è nell’armadio della biblioteca. Il calcolo è sulla lavagna: il risultato fallo tu!',
    'Studia come se non ci fosse un domani! Ma domani c’è, quindi dormi anche un po’.',
    'Le stelle stanotte sono bellissime. Peccato non avere il cannocchiale...'
  ]);
  A.mentor.onEnd = () => {
    if (questState('cannocchiale') === 'none') setQuest('cannocchiale', 'active');
    laviniaAfterLesson(A, 'lav2');
  };

  A.guardian.intro = [
    'BEEP! QUI TERMINALE ASCENSORE. Accesso alla cupola bloccato. Inserire il valore corretto dei contrappesi per attivare il motore.',
    'TERMINALE ASCENSORE: SCHEDA RICEVUTA. AVVIO TEST DI CALIBRAZIONE. BEEP BOOP.',
    'TERMINALE ASCENSORE. PROTOCOLLO MATEMATICO ATTIVO. PREGO RISPONDERE.'
  ];
  A.guardian.blockMsg = [
    'BEEP! QUI TERMINALE ASCENSORE. Utente non autorizzato. Consultare il <b>Bibliotecario Archimede</b> per la procedura.',
    'TERMINALE ASCENSORE. ERRORE 403: LEZIONE MANCANTE. Parlare con <b>Archimede</b>.'
  ];
  A.guardian.loseMsg = [
    'ERRORE CRITICO. Accesso negato. Consultare il Taccuino e riprovare.',
    'CALIBRAZIONE FALLITA. Riprovare. BEEP triste.'
  ];
  A.guardian.winMsg = [
    'ACCESSO CONSENTITO! L’ascensore sale fino alla cima e rilascia il <b>Cristallo Viola</b> e la <b>Lente Stellare</b>!',
    'CALIBRAZIONE PERFETTA. Rilascio <b>Cristallo Viola</b> e <b>Lente Stellare</b>. BEEP felice.'
  ];
  A.duelGate = () => (flag('scheda_ok') ? null : [
    'BEEP! SCHEDA DI CALIBRAZIONE MANCANTE. Inserire la scheda per avviare il test.',
    'IMPOSSIBILE PROCEDERE: serve la <b>scheda di calibrazione</b>.'
  ]);

  A.objective = () => {
    if (!state.unlockedRules.includes(A.ruleId)) return 'Parla con Archimede sulla terrazza: ti spiega la Regola 3.';
    if (hasItem('i2') && questState('cannocchiale') === 'active') return 'Hai il cannocchiale di Archimede nello Zaino! Usalo su di lui.';
    if (!flag('armadio_open')) return 'Entra nella biblioteca (porta della torre). Sulla lavagna c’è il calcolo del codice: usa la Regola 3.';
    if (!flag('scheda_ok')) return 'Usa la scheda di calibrazione sul Terminale dell’ascensore.';
    if (!done(A)) return 'Sfida il Terminale dell’ascensore!';
    if (questState('bulloni') === 'active' && !flag('bul3')) return 'C’è un bullone d’oro vicino alla cabina dell’ascensore!';
    return 'Area completata! Vai al Belvedere: da lì partono le strade per Serra, Officina e Faro.';
  };

  A.rooms = {
    terrazza: {
      scene: 'torre',
      enter: ['Che cielo stellato! Si vede la via lattea.', 'L’ascensore cigola nel vento.', 'Le stelle sembrano esponenti luminosi.'],
      layout: {
        ...A.layout,
        mentor: {
          ...A.layout.mentor,
          look: ['Archimede. Ha più barba che faccia.', 'Ha gli occhiali tondi e una lente in mano. Nerd level: leggendario.'],
          useItem: {
            i2: () => {
              removeItem('i2');
              setFlag('cannocchiale_reso');
              setQuest('cannocchiale', 'done');
              addAura(60);
              playSound('victory');
              setDialogue(A.mentor.name, A.mentor.role, 'archimede', [
                'Il mio cannocchiale! Grazie, giovane esploratrice. Ecco <b>60 Aura</b>. Ora rivedo le stelle!',
                'Lo hai ritrovato! Sei un genio. Prendi <b>60 Aura</b>, te le meriti tutte.'
              ], 'mentor');
              clearChoices();
              addChoice('↩️ Continua a esplorare', () => ariaSays(null), 'primary-action');
            }
          }
        },
        guardian: {
          ...A.layout.guardian,
          look: ['Il Terminale dell’ascensore. Ha due occhi verdi sullo schermo. Mi fissa.', 'BEEP. Anche io posso fare BEEP.'],
          useItem: {
            scheda: () => {
              removeItem('scheda');
              setFlag('scheda_ok');
              playSound('success');
              refreshLabels(A);
              setDialogue(A.guardian.name, A.guardian.role, 'terminal', ['SCHEDA ACCETTATA. Test di calibrazione pronto. BEEP!', 'CLICK. Scheda letta. Iniziamo quando vuoi.'], 'guardian');
              clearChoices();
              addChoice('⚔️ Inizia il test', () => startGuardianChallenge(A), 'primary-action');
              addChoice('↩️ Più tardi', () => ariaSays(null));
            }
          }
        }
      },
      hotspots: [
        { id: 'porta-biblioteca', box: [0, 0, 0, 0], noDot: true, draw: () => `<path d="M38 176 L38 150 Q49 140 60 150 L60 176 Z" fill="#6b4022" ${wink(0.8)}/><path d="M45 147 L45 176 M53 147 L53 176" stroke="#4e2e18" stroke-width="0.7"/><circle cx="56" cy="163" r="1" fill="#fbbf24"/>` },
        { id: 'sfera', name: '🌐 Sfera armillare', box: [100, 104, 40, 84], stand: 120, noDot: true, look: 'Una sfera armillare che gira da sola. Magia? No, ingranaggi.' },
        { id: 'libri', name: '📚 Libri', box: [82, 162, 24, 26], stand: 94, noDot: true, look: 'Libri di astronomia. Uno si chiama "Stelle al quadrato".' },
        { id: 'pesi', name: '⚖️ Contrappesi', box: [326, 100, 48, 44], stand: 318, noDot: true, look: ['Due contrappesi con delle potenze. Per l’ascensore servono calcoli precisi.', 'I contrappesi dondolano. Mi fanno venire il mal di mare.'] },
        {
          id: 'bul3', name: '🔩 Qualcosa che luccica', box: [244, 178, 18, 12], stand: 252,
          visible: () => !flag('bul3'),
          draw: () => sparkleSVG(253, 186, BOLT),
          take: () => collectPiece('bulloni', 'bul3', ['Un bullone d’oro vicino all’ascensore! Le Gemelle lo staranno cercando.', 'Un bullone tutto d’oro. Questo è roba da Officina.'])
        },
        laviniaHotspot(A, 'lav2', 222, 188)
      ],
      exits: [
        { ...leftExit(1, 'piazza', '⬅ Piazza'), arrive: 302 },
        { id: 'to-belvedere', label: 'Belvedere ➜', box: [358, 112, 42, 70], stand: 380, to: 'belvedere', arrive: 60, labelY: 160,
          locked: () => !done(A),
          lockedActions: [{ icon: '🚧', label: 'Bloccato', fn: () => ariaSays(['La strada per il Belvedere passa dall’ascensore. Prima devo battere il Terminale!', 'Bloccato. Il Terminale non mi lascia passare.']) }] },
        { id: 'to-biblioteca', label: '🚪 Biblioteca', box: [36, 140, 26, 36], stand: 52, to: 'biblioteca', arrive: 60, labelY: 134 }
      ]
    },

    belvedere: {
      scene: 'belvedere',
      title: '🏔️ Belvedere',
      enter: ['Il Belvedere! Da qui si vede tutta l’isola.', 'Che vento quassù. La mongolfiera dondola.', 'Strade per la Serra, l’Officina e il Faro. Si sceglie!'],
      layout: { groundY: 188, ariaStart: 60 },
      hotspots: [
        {
          id: 'mongolfiera', name: '🎈 Mongolfiera', box: [266, 8, 56, 80], stand: 256,
          use: () => { ariaSays('Salgo sulla mongolfiera: dove vado?'); openModal('map'); },
          useIcon: '🗺️', useLabel: 'Viaggia',
          look: ['La mongolfiera del Belvedere. Porta al Molo, alla Piazza e qui. Niente cinture di sicurezza. Ok.', 'Una mongolfiera rossa e gialla. Il viaggio rapido più stiloso dell’isola.']
        },
        { id: 'panorama', name: '🔭 Cannocchiale panoramico', box: [280, 106, 62, 82], stand: 274, noDot: true, look: ['Dal cannocchiale vedo il Molo, la Piazza e il Faro in cima al monte. Che vista!', 'Vedo Zia Turbina che parla con un piccione. Normale.'] }
      ],
      exits: [
        { id: 'to-terrazza2', label: '⬅ Torre', box: [0, 112, 52, 76], stand: 22, to: 'terrazza', arrive: 340, labelY: 106 },
        { ...areaExit('bv-officina', 4, 'officina', 'Officina', [164, 100, 50, 62], 190, 92), arrive: 60, locked: () => state.unlockedArea < 4, lockedActions: [{ icon: '🚧', label: 'Bloccato', fn: () => ariaSays(['La galleria per l’Officina è chiusa. Prima devo finire la Serra.', 'Bloccata. L’Officina si apre dopo la Serra.']) }] },
        { ...areaExit('bv-faro', 5, 'scala', '⬆ Faro', [58, 88, 46, 56], 96, 80), arrive: 70, locked: () => state.unlockedArea < 5, lockedActions: [{ icon: '🚧', label: 'Bloccato', fn: () => ariaSays(['La scalinata del Faro è bloccata. Prima l’Officina!', 'Il Faro è l’ultima tappa. Prima l’Officina!']) }] },
        areaExit('bv-serra', 3, 'giardino', 'Serra', [118, 80, 40, 44], 138, 72, () => state.unlockedArea < 3,
          ['La Serra si apre dopo la Torre.', 'Bloccata.'])
      ]
    },

    biblioteca: {
      scene: 'biblioteca',
      enter: ['Quanti libri! Odore di carta vecchia e di segreti.', 'La biblioteca della Torre. Silenzio... e una candela accesa.', 'Libri fino al soffitto. Archimede legge davvero tanto.'],
      layout: { groundY: 186, ariaStart: 60 },
      hotspots: [
        {
          id: 'lavagna', name: '🟩 Lavagna', box: [150, 46, 118, 80], stand: 200,
          read: () => {
            setFlag('read_lavagna');
            const P = P_torre();
            showReading('🟩 Lavagna di Archimede', `Combinazione dell’armadio:<br>l’<b>esponente</b> di <span class="math-expr">(${P.b}<sup>${P.m}</sup>)<sup>${P.n}</sup></span><br><br><i>Il risultato calcolalo tu, mica io!</i> — A.`,
              () => ariaSays(['Potenza di potenza... gli esponenti si moltiplicano. Faccio il conto.', 'Ok, devo moltiplicare gli esponenti. Calcolatrice mentale: ON.']));
          },
          look: 'Una lavagna con un calcolo scritto col gesso.'
        },
        {
          id: 'armadio', name: '🗄️ Armadio', box: [204, 128, 40, 54], stand: 224,
          obj: () => (flag('armadio_open') ? 'armadio-aperto' : 'armadio'),
          look: ['Un armadio con un tastierino.', 'Chiuso a combinazione. Archimede è un tipo prudente.'],
          useIf: () => !flag('armadio_open'),
          use: () => {
            const P = P_torre();
            askCode({
              title: 'Armadio di Archimede',
              prompt: flag('read_lavagna')
                ? `Tastierino. La combinazione è l’<b>esponente</b> di <span class="math-expr">(${P.b}<sup>${P.m}</sup>)<sup>${P.n}</sup></span>.`
                : 'Tastierino. Forse la combinazione è scritta da qualche parte qui intorno...',
              answer: String(P.m * P.n),
              onSuccess: () => {
                setFlag('armadio_open');
                giveItem('scheda');
                refreshLabels(A);
                ariaSays(['L’armadio si apre! Dentro c’è la scheda di calibrazione.', 'Click! Esponenti moltiplicati, armadio aperto. Presa la scheda.']);
              }
            });
          },
          useIcon: '🔢', useLabel: 'Codice'
        },
        {
          id: 'arenario', name: '📖 Libro antico', box: [156, 124, 30, 14], stand: 170,
          obj: 'libro', objScale: 1.6,
          read: () => readCuriosity('arenario'),
          look: 'Un libro antico sulla scrivania. Il titolo dice "Arenario".'
        },
        {
          id: 'diario3', name: '📓 Un foglio viola', box: [96, 172, 22, 14], stand: 108,
          visible: () => !flag('dia3'),
          draw: () => diaryPageSVG(107, 180),
          read: () => readDiary(3),
          look: 'Un altro foglio viola. Lavinia è passata anche di qui.'
        },
        {
          id: 'mug1', name: '🍺 Un boccale', box: [258, 170, 18, 14], stand: 266,
          visible: () => !flag('mug1'),
          draw: () => sparkleSVG(267, 180, MUG),
          take: () => collectPiece('boccali', 'mug1', ['Un boccale della Taverna! Archimede ci beveva la camomilla.', 'Il boccale dell’Oste. Archimede, sei un ladro di boccali!'])
        },
        { id: 'scaffali', name: '📚 Scaffali', box: [72, 10, 64, 112], stand: 100, noDot: true, look: ['Libri su libri. Uno si chiama "Potenze per principianti". Lo leggerei.', 'C’è un libro intitolato "2 alla 10: storia di un kilobyte".'] }
      ],
      exits: [
        { id: 'to-terrazza', label: '🚪 Terrazza', box: [8, 96, 36, 88], stand: 30, to: 'terrazza', arrive: 196, labelY: 90 }
      ]
    }
  };
})();

/* ==========================================================================
   AREA 4: LA SERRA DEGLI ESPONENTI ZERO (giardino + vivaio)
   ========================================================================== */
(function setupSerra() {
  const A = AREAS[3];
  A.startRoom = 'giardino';
  A.intro = [
    'L’aria nella Serra è umida e profuma di ozono. Una pianta gigante dorme davanti al Cristallo Smeraldo.',
    'La Serra degli Esponenti Zero! Farfalle, liane e una pianta carnivora che russa. Rassicurante.'
  ];

  A.mentor.lines = [
    ['Tesoro, io sono Madame Zeri. Qui dentro vige la legge della Vera Baddie: non importa quanto un numero sia gigante, se lo elevi a <b>0</b> diventa subito <b>1</b>. Zero drama.',
     'Ciao cara. Io sono Madame Zeri e ti insegno la regola più chic dell’isola: l’esponente zero.'],
    'Ricorda due cose: <b>qualsiasi numero (tranne zero) elevato a 0 fa 1</b>, mentre <b>qualsiasi numero elevato a 1 resta se stesso</b>. E 0<sup>0</sup> non esiste!',
    'Ho inserito la <b>Regola 4</b> nel Taccuino. La pianta dorme: per svegliarla serve acqua. L’annaffiatoio è nel <b>vivaio</b>, ma è chiuso e buio. Il codice è sul cartello del banco.'
  ];
  A.mentor.again = () => say([
    'Elevato a zero = 1. Sempre. Tranne 0⁰, che è un mistero.',
    'Il codice del vivaio è sul cartello. Il calcolo però lo fai tu, tesoro.',
    'Le regole, tesoro, a mena dito. Come lo smalto.',
    'Gli occhiali da sole? Li porto perché il mio futuro è luminoso.'
  ]);
  A.mentor.onEnd = () => laviniaAfterLesson(A, 'lav3');

  A.guardian.intro = [
    'GRRR! Mi hai svegliata! Io sono la Pianta Carnivora! Se non mi riduci all’unità, ti mangio lo zaino!',
    'Chi osa annaffiare la Pianta Carnivora?! Ok, era buona l’acqua. Ma adesso ti sfido!',
    'GNAM GNAM. Sono la Pianta Carnivora: rispondi o diventi concime!'
  ];
  A.guardian.blockMsg = [
    'GRRR! Io sono la Pianta Carnivora. E tu chi sei? Prima vai da <b>Madame Zeri</b>, poi forse non ti mangio.',
    'ZzZ... (La pianta dorme. Meglio parlare prima con <b>Madame Zeri</b>.)'
  ];
  A.guardian.loseMsg = [
    'GNAM! Mi sono mangiata il tuo zaino... scherzo. Ripassa la Regola 4 e riprova!',
    'GRRR! Torna quando sai che tutto alla zero fa 1!'
  ];
  A.guardian.winMsg = [
    'GNAM... La pianta si rimpicciolisce fino a diventare un fiorellino alto 1 centimetro! Ottieni il <b>Cristallo Smeraldo</b> e il <b>Seme Luminescente</b>.',
    'La pianta fa "pop" e diventa minuscola. Carina, quasi. Ecco il <b>Cristallo Smeraldo</b> e il <b>Seme Luminescente</b>!'
  ];
  A.duelGate = () => (flag('pianta_sveglia') ? null : [
    'ZzZzZ... (La pianta dorme profondamente. Forse un po’ d’acqua la sveglia.)',
    'RONF... ZzZ... (Russa come un motorino. Serve acqua per svegliarla.)'
  ]);

  A.objective = () => {
    if (!state.unlockedRules.includes(A.ruleId)) return 'Parla con Madame Zeri: ti spiega la Regola 4.';
    if (!flag('vivaio_open')) return 'Leggi il cartello sul banco, calcola il codice con la Regola 4 e apri la porta verde del vivaio.';
    if (!flag('vivaio_luce')) return 'Il vivaio è buio. Usa la Lente Stellare sul lucernario per far entrare la luce.';
    if (!flag('pianta_sveglia') && !hasItem('annaffiatoio')) return 'Prendi l’annaffiatoio nel vivaio.';
    if (!flag('pianta_sveglia')) return 'Usa l’annaffiatoio sulla pianta carnivora per svegliarla.';
    if (!done(A)) return 'Sfida la Pianta Carnivora!';
    return 'Area completata! Torna al Belvedere o prendi il ponte verso l’Officina.';
  };

  A.rooms = {
    giardino: {
      scene: 'serra',
      enter: ['Farfalle ovunque. E una pianta che russa.', 'Che caldo umido! I miei capelli fanno "boing".', 'La luce passa dai vetri e fa tutto verde.', 'Un capibara fa il bagno nella vasca delle ninfee. Chillissimo. Lui sì che sa vivere.'],
      layout: {
        ...A.layout,
        mentor: { ...A.layout.mentor, look: ['Madame Zeri. Occhiali da sole al chiuso. Icona.', 'Ha un ventaglio rosa e un’aura da diva.'] },
        guardian: {
          ...A.layout.guardian,
          look: () => (flag('pianta_sveglia') ? 'La pianta è sveglia e mi fissa. Ha più denti di un pettine.' : 'La pianta dorme e russa. Ogni tanto sbatte i denti nel sonno.'),
          useItem: {
            annaffiatoio: () => {
              removeItem('annaffiatoio');
              setFlag('pianta_sveglia');
              playSound('success');
              refreshLabels(A);
              setDialogue(A.guardian.name, A.guardian.role, 'plant', ['SPLASH! ...GRRR! Chi mi ha svegliata?! Preparati alla sfida!', 'Glu glu... ACQUA FRESCA! Ok, ora sono sveglia e affamata!'], 'guardian');
              clearChoices();
              addChoice('⚔️ Sfida la Pianta', () => startGuardianChallenge(A), 'primary-action');
              addChoice('↩️ Più tardi', () => ariaSays(null));
            }
          }
        }
      },
      hotspots: [
        {
          id: 'cartello', name: '📋 Cartello', box: [208, 154, 24, 24], stand: 218,
          obj: 'cartello', objText: ['VIVAIO', 0.38, 4.6],
          read: () => {
            setFlag('read_cartello');
            const P = P_serra();
            showReading('📋 Cartello del banco', `Termostato del <b>vivaio</b>:<br>imposta <span class="math-expr">${P.a}<sup>0</sup> + ${P.b}<sup>1</sup> + ${P.c}<sup>0</sup></span> gradi.<br><br><i>(Il risultato è anche il codice della porta.)</i>`,
              () => ariaSays(['Esponente 0 ed esponente 1... Madame Zeri me l’ha spiegato. Faccio il conto.', 'Attenta: qualcosa elevato a 0 non fa 0! Calcolo con calma.']));
          },
          look: 'Un cartellino infilato in un vaso.'
        },
        {
          id: 'porta-vivaio', name: '🚪 Porta del vivaio', box: [236, 126, 26, 56], stand: 249,
          visible: () => !flag('vivaio_open'),
          obj: 'porta-vivaio',
          use: () => {
            const P = P_serra();
            askCode({
              title: 'Porta del vivaio',
              prompt: flag('read_cartello') ? `Tastierino. Il codice è <span class="math-expr">${P.a}<sup>0</sup> + ${P.b}<sup>1</sup> + ${P.c}<sup>0</sup></span>.` : 'Tastierino. Forse il codice è scritto qui vicino...',
              answer: String(P.b + 2),
              onSuccess: () => {
                setFlag('vivaio_open');
                refreshLabels(A);
                ariaSays(['Bip! La porta del vivaio si apre.', 'Aperto! Elevato a zero fa 1, mica 0.']);
              }
            });
          },
          useIcon: '🔢', useLabel: 'Codice',
          look: 'Una porta verde con un tastierino. Il vivaio è chiuso.'
        },
        {
          id: 'mug3', name: '🍺 Un boccale', box: [52, 178, 18, 14], stand: 70,
          visible: () => !flag('mug3'),
          draw: () => sparkleSVG(61, 188, MUG),
          take: () => collectPiece('boccali', 'mug3', ['Un boccale tra le piante! Madame Zeri ci annaffiava le orchidee.', 'Il boccale dell’Oste, pieno di terriccio. Che stile.'])
        },
        {
          id: 'porta-vivaio-aperta', box: [0, 0, 0, 0], noDot: true,
          visible: () => flag('vivaio_open'),
          draw: () => '<rect x="238" y="128" width="22" height="54" fill="#022c22"/><path d="M238 128 L232 132 L232 184 L238 182 Z" fill="#065f46"/>'
        },
        laviniaHotspot(A, 'lav3', 150, 196)
      ],
      exits: [
        leftExit(2, 'belvedere', '⬅ Belvedere'),
        // Il ponte di corda arriva nel magazzino dell'Officina, dal lato destro.
        { ...rightExit(4, 'magazzino', '🌉 Officina ➜', () => state.unlockedArea < 4, ['Il ponte di corda porta all’Officina. È ancora rotto: prima devo battere la Pianta!', 'Il ponte è chiuso. Prima la Serra, poi l’Officina.']), arrive: 360 },
        { id: 'to-vivaio', label: '🚪 Vivaio', box: [236, 126, 26, 56], stand: 249, to: 'vivaio', arrive: 70, labelY: 120, visible: () => flag('vivaio_open') }
      ]
    },

    vivaio: {
      scene: 'vivaio',
      enter: () => (flag('vivaio_luce') ? say(['Ora il vivaio è pieno di luce e di piantine.', 'Che bello con la luce! Le piantine sembrano felici.']) : say(['Che buio! Non vedo quasi niente.', 'Buio pesto. Sopra di me c’è un lucernario sporco.'])),
      layout: { groundY: 186, ariaStart: 70 },
      hotspots: [
        {
          id: 'buio', box: [0, 0, 0, 0], noDot: true,
          visible: () => !flag('vivaio_luce'),
          draw: () => '<rect width="400" height="220" fill="#020617" opacity="0.84"/><rect class="shimmer" x="136" y="0" width="132" height="20" fill="#bae6fd" style="animation-duration:2.4s"/><rect x="134" y="-2" width="136" height="24" rx="2" fill="none" stroke="#fde68a" stroke-width="1" opacity="0.5"/>'
        },
        {
          id: 'luce', box: [0, 0, 0, 0], noDot: true,
          visible: () => flag('vivaio_luce'),
          draw: () => '<polygon class="shimmer" points="140,20 266,20 300,182 106,182" fill="#fef9c3" opacity="0.18" style="animation-duration:4s"/>'
        },
        {
          id: 'lucernario', name: '🖼️ Lucernario', box: [134, 0, 136, 24], stand: 200,
          look: () => (flag('vivaio_luce') ? 'Il lucernario con la Lente: la luce entra concentrata. Fotosintesi turbo!' : 'Un lucernario sporco. Entra pochissima luce. Se potessi concentrarla...'),
          useItem: {
            i3: () => {
              removeItem('i3');
              setFlag('vivaio_luce');
              playSound('success');
              buildScene(A, ariaX);
              ariaSays(['Monto la Lente Stellare sul lucernario... LUCE! Ora vedo tutto.', 'La Lente concentra la luce come una potenza di potenza. Il vivaio si illumina!']);
            }
          }
        },
        {
          id: 'annaffiatoio', name: '🚿 Annaffiatoio', box: [296, 166, 26, 20], stand: 300,
          visible: () => flag('vivaio_luce') && !hasItem('annaffiatoio') && !flag('pianta_sveglia'),
          obj: 'annaffiatoio',
          take: () => {
            giveItem('annaffiatoio');
            refreshLabels(A);
            ariaSays(['Annaffiatoio pieno! Perfetto per una certa pianta che russa.', 'Preso. Spero che la pianta apprezzi la doccia.']);
          }
        },
        {
          id: 'poster-batteri', name: '🦠 Poster', box: [222, 62, 44, 50], stand: 244,
          visible: () => flag('vivaio_luce'),
          
          read: () => readCuriosity('batteri'),
          look: 'Un poster sui batteri. In una serra. Ha senso, credo.'
        },
        {
          id: 'diario4', name: '📓 Un foglio viola', box: [120, 176, 22, 14], stand: 131,
          visible: () => flag('vivaio_luce') && !flag('dia4'),
          draw: () => diaryPageSVG(131, 183),
          read: () => readDiary(4),
          look: 'Un foglio viola tra le piantine. Ancora Lavinia!'
        },
        { id: 'piantine', name: '🌱 Piantine', box: [84, 60, 124, 104], stand: 140, noDot: true, visible: () => flag('vivaio_luce'), look: ['Centinaia di piantine. Se ognuna fa 2 semi, poi 4, poi 8...', 'Piantine baby. Adorabili. Non carnivore, spero.'] }
      ],
      exits: [
        { id: 'to-giardino', label: '🚪 Giardino', box: [10, 98, 36, 88], stand: 30, to: 'giardino', arrive: 249, labelY: 92 }
      ]
    }
  };
})();

/* ==========================================================================
   AREA 5: L'OFFICINA STEAMPUNK (officina + magazzino)
   ========================================================================== */
(function setupOfficina() {
  const A = AREAS[4];
  A.startRoom = 'officina';
  A.intro = [
    'Ingranaggi dorati girano sulle pareti dell’Officina. Un enorme Automa sbarra il cancello verso il Faro... ma è spento.',
    'L’Officina Steampunk! Vapore, scintille e un robot gigante che non si muove. Per ora.'
  ];

  A.mentor.lines = [
    ['Mira: "Ciao! Io sono Mira, lei è Nora. Abbiamo gusti diversi (basi diverse), ma portiamo gli stessi occhiali (<b>stesso esponente</b>)!"',
     'Mira: "Ciao! Noi siamo Mira e Nora. Gemelle, meccaniche e geniali. In quest’ordine."'],
    'Nora: "Quando moltiplichi o dividi potenze con lo <b>stesso esponente</b>, fai prima l’operazione tra le basi e lasci lo stesso esponente!"',
    ['Mira: "Esempio: <span class="math-expr">4<sup>3</sup> · 5<sup>3</sup> = (4 · 5)<sup>3</sup> = 20<sup>3</sup></span>. Facile come stringere un bullone."',
     'Nora: "Tipo <span class="math-expr">12<sup>4</sup> : 4<sup>4</sup> = (12 : 4)<sup>4</sup> = 3<sup>4</sup></span>. Bum."'],
    'Mira: "Abbiamo scritto la <b>Regola 5</b> nel Taccuino. L’Automa è spento: gli manca l’<b>ingranaggio d’oro</b>, chiuso nella bilancia del magazzino." Nora: "E se trovi i nostri <b>3 bulloni d’oro</b>... ti paghiamo!"'
  ];
  A.mentor.again = () => (questState('bulloni') === 'active' && questCount('bulloni') < 3
    ? say([`Nora: "Bulloni trovati: ${questCount('bulloni')} su 3. Uno l’abbiamo perso al Molo, uno su alla Torre!"`, `Mira: "Ne mancano ${3 - questCount('bulloni')}. Li abbiamo cercati a tappeto... ma non al Molo e alla Torre."`])
    : say(['Mira: "Stesso esponente? Opera sulle basi!"', 'Nora: "L’ingranaggio è nella bilancia del magazzino."', 'Mira e Nora: "Siamo gemelle, mica uguali!"', 'Nora: "Abbiamo controllato l’Automa a tappeto. Manca solo l’ingranaggio!"']));
  A.mentor.onEnd = () => {
    if (questState('bulloni') === 'none') setQuest('bulloni', 'active');
    laviniaAfterLesson(A, 'lav4');
  };
  A.mentor.extraChoices = () => questDeliverChoice('bulloni',
    { name: A.mentor.name, role: A.mentor.role, avatar: 'gemelle' }, 80,
    ['Mira e Nora: "I nostri bulloni! Sei la migliore. Ecco <b>80 Aura</b>!"', 'Nora: "Tutti e tre!" Mira: "Prendi <b>80 Aura</b>, socia!"']);

  A.guardian.intro = [
    'QUI AUTOMA DEL CANCELLO. PROTOCOLLO DI BLOCCO ATTIVO. Fondere gli ingranaggi con lo stesso esponente per aprire il passaggio.',
    'AUTOMA DEL CANCELLO: INGRANAGGIO INSERITO. SISTEMI ONLINE. AVVIO SFIDA.',
    'CLANK CLANK. QUI AUTOMA DEL CANCELLO. RISPONDERE CORRETTAMENTE O RESTARE QUI PER SEMPRE.'
  ];
  A.guardian.blockMsg = [
    'QUI AUTOMA DEL CANCELLO. ACCESSO NEGATO. Richiesta autorizzazione delle <b>Gemelle Mira e Nora</b>.',
    'AUTOMA DEL CANCELLO. ERRORE: LEZIONE NON TROVATA. Consultare <b>Mira e Nora</b>.'
  ];
  A.guardian.loseMsg = [
    'PROTOCOLLO DI ESPULSIONE. Ricalibrare le conoscenze e riprovare.',
    'SFIDA FALLITA. VAPORE DI DELUSIONE. Riprovare.'
  ];
  A.guardian.winMsg = [
    'CLANK! Il cancello del Faro si spalanca! Hai recuperato il <b>Cristallo Rubino</b> (5/5) e la <b>Chiave Inglese d’Oro</b>!',
    'SISTEMI SPENTI. Cancello aperto. Ecco il <b>Cristallo Rubino</b> e la <b>Chiave Inglese d’Oro</b>. BZZT.'
  ];
  A.duelGate = () => (flag('ingranaggio_ok') ? null : [
    '...(L’Automa è spento. Al centro del petto manca un ingranaggio.)',
    '...BZZT... (Niente. Senza il suo ingranaggio d’oro l’Automa non si accende.)'
  ]);

  A.objective = () => {
    if (!state.unlockedRules.includes(A.ruleId)) return 'Parla con Mira e Nora: ti spiegano la Regola 5.';
    if (!flag('bilancia_ok')) return 'Vai nel magazzino (porta di metallo) ed equilibra la bilancia a potenze.';
    if (!flag('ingranaggio_ok')) return 'Usa l’ingranaggio d’oro sull’Automa per accenderlo.';
    if (!done(A)) return 'Sfida l’Automa del Cancello!';
    if (questState('bulloni') === 'active' && questCount('bulloni') < 3) return `Missione extra: trova i bulloni d’oro (${questCount('bulloni')}/3). Le Gemelle dicono: uno al Molo, uno alla Torre.`;
    if (hasItem('i4') && !flag('seme_ok')) return 'Nel magazzino c’è un vaso vuoto e un angolo buio. Il Seme Luminescente potrebbe servire...';
    if (questState('bulloni') === 'active') return 'Porta i bulloni a Mira e Nora!';
    return 'Area completata! Il cancello è aperto: prosegui verso il Faro.';
  };

  A.rooms = {
    officina: {
      scene: 'officina',
      enter: ['Ingranaggi, vapore e rumore. Adoro.', 'Il pavimento vibra. Qualcosa qui sotto lavora tanto.', 'Odore di olio e di genio.'],
      layout: {
        ...A.layout,
        mentor: { ...A.layout.mentor, look: ['Mira e Nora. Stessi occhialoni, tute diverse.', 'Le gemelle si passano gli attrezzi senza guardarsi. Telepatia meccanica.'] },
        guardian: {
          ...A.layout.guardian,
          look: () => (flag('ingranaggio_ok') ? 'L’Automa è acceso. Gli occhi rossi brillano. Brrr.' : 'L’Automa è spento. Al centro del petto c’è un buco a forma di ingranaggio.'),
          useItem: {
            ingranaggio: () => {
              removeItem('ingranaggio');
              setFlag('ingranaggio_ok');
              playSound('success');
              refreshLabels(A);
              setDialogue(A.guardian.name, A.guardian.role, 'automa', ['CLICK... VRRRM! SISTEMI ONLINE. Avvio protocollo di sfida.', 'INGRANAGGIO RILEVATO. BUONGIORNO. ORA TI SFIDO.'], 'guardian');
              clearChoices();
              addChoice('⚔️ Sfida l’Automa', () => startGuardianChallenge(A), 'primary-action');
              addChoice('↩️ Più tardi', () => ariaSays(null));
            }
          }
        }
      },
      hotspots: [
        {
          id: 'porta-magazzino', box: [0, 0, 0, 0], noDot: true,
          draw: () => `<rect x="222" y="116" width="28" height="56" rx="1" fill="#52525b" ${wink(1)}/><rect x="226" y="121" width="20" height="9" fill="#2b2b33"/><circle cx="245" cy="146" r="1.4" fill="#a8a29e"/><text x="236" y="128" font-size="4.4" fill="#fbbf24" text-anchor="middle" font-weight="800">RICAMBI</text>`
        },
        {
          id: 'bul1', name: '🔩 Qualcosa che luccica', box: [222, 182, 16, 12], stand: 230,
          visible: () => !flag('bul1'),
          draw: () => sparkleSVG(230, 189, BOLT),
          take: () => collectPiece('bulloni', 'bul1')
        },
        { id: 'manometro', name: '⏲️ Manometro', box: [288, 82, 24, 26], stand: 296, noDot: true, look: 'La lancetta balla. La pressione è alla seconda... o alla terza.' },
        laviniaHotspot(A, 'lav4', 190, 180)
      ],
      exits: [
        leftExit(2, 'belvedere', '⬅ Belvedere'),
        { id: 'fwd-5', label: 'Faro ➜', box: [348, 112, 52, 70], stand: 380, toArea: 5, toRoom: 'scala', labelY: 106, visible: () => done(A) },
        { id: 'to-magazzino', label: '🚪 Magazzino', box: [222, 116, 28, 56], stand: 236, to: 'magazzino', arrive: 60, labelY: 108 }
      ]
    },

    magazzino: {
      scene: 'magazzino',
      enter: ['Scaffali pieni di ricambi. Un paradiso per Mira e Nora.', 'Il magazzino. C’è una bilancia strana al centro.', 'Polvere, bulloni e una lampada che sfarfalla.'],
      layout: { groundY: 190, ariaStart: 60 },
      hotspots: [
        {
          id: 'bilancia', name: '⚖️ Bilancia a potenze', box: [156, 70, 88, 110], stand: 200,
          look: () => (flag('bilancia_ok') ? 'La bilancia è in equilibrio. Soddisfazione massima.' : `Una bilancia: a sinistra c’è ${P_bilancia().a}${toSup(P_bilancia().n)} · ${P_bilancia().b}${toSup(P_bilancia().n)}. A destra manca il peso giusto.`),
          useIf: () => !flag('bilancia_ok'),
          use: () => {
            const { a, b, n } = P_bilancia();
            askChoice({
              title: 'Bilancia a potenze', role: 'Trova il peso giusto', avatar: '⚖️',
              prompt: `Sul piatto sinistro c’è <span class="math-expr">${a}<sup>${n}</sup> · ${b}<sup>${n}</sup></span>. Quale peso metti a destra per l’equilibrio?`,
              options: [
                { text: `${a * b}${toSup(n)}`, correct: true },
                { text: `${a + b}${toSup(n)}`, msg: `${a} + ${b}? No! C’è il PER tra le basi.` },
                { text: `${a * b}${toSup(2 * n)}`, msg: `L’esponente resta ${n}! Non sommarli.` },
                { text: `${a * b}${toSup(n * n)}`, msg: `Non moltiplicare gli esponenti: resta ${n}.` }
              ],
              onSuccess: () => {
                setFlag('bilancia_ok');
                giveItem('ingranaggio');
                refreshLabels(A);
                ariaSays(['Equilibrio! Dal cassetto della bilancia cade un ingranaggio d’oro.', 'Click! La bilancia si ferma e libera l’ingranaggio d’oro.']);
              }
            });
          },
          useIcon: '⚖️', useLabel: 'Prova'
        },
        {
          id: 'manuale', name: '📘 Manuale', box: [290, 104, 22, 24], stand: 300,
          obj: 'manuale', objText: ['2¹⁰', 0.42, 5, '#1e3a8a'],
          read: () => readCuriosity('kilobyte'),
          look: 'Un manuale di istruzioni. In copertina c’è scritto 2¹⁰.'
        },
        {
          id: 'vaso', name: '🌱 Vaso vuoto', box: [254, 166, 28, 24], stand: 268,
          obj: () => (flag('seme_ok') ? 'vaso-fiore' : 'vaso'),
          look: () => (flag('seme_ok') ? 'Il fiore luminoso illumina tutto l’angolo. Che spettacolo!' : 'Un vaso con la terra, ma niente dentro. L’angolo intorno è buio.'),
          useItem: {
            i4: () => {
              removeItem('i4');
              setFlag('seme_ok');
              playSound('success');
              refreshLabels(A);
              ariaSays(['Pianto il Seme Luminescente... cresce un fiore che brilla! Nell’angolo ora vedo una rete.', 'Il seme diventa un fiore-lampada. L’angolo buio si illumina: c’è una rete!']);
            }
          }
        },
        {
          id: 'rete', name: '🕸️ Rete robusta', box: [128, 176, 24, 18], stand: 140,
          visible: () => flag('seme_ok') && !hasItem('rete') && !flag('coin3'),
          obj: 'rete',
          take: () => {
            giveItem('rete');
            refreshLabels(A);
            ariaSays(['Una rete robusta! Perfetta per ripescare cose piccole... tipo un doblone in fondo al mare.', 'Presa la rete. Al Molo c’era qualcosa che luccicava sul fondale...']);
          },
          look: 'Una rete da pesca nuova di zecca, nascosta nell’angolo buio.'
        },
        { id: 'cassettiera', name: '🗄️ Cassettiera', box: [272, 126, 68, 54], stand: 300, noDot: true, look: ['Cassetti pieni di viti. Mira le ha messe in ordine di grandezza. Nora no.', 'Una cassettiera. Un cassetto dice "potenze di 2", un altro "potenze di 10".'] }
      ],
      exits: [
        { id: 'to-officina', label: '🚪 Officina', box: [8, 96, 40, 88], stand: 30, to: 'officina', arrive: 236, labelY: 90 },
        { ...rightExit(3, 'giardino', '🌉 Serra ➜'), arrive: 360 }
      ]
    }
  };
})();

/* ==========================================================================
   AREA 6: LA CIMA DEL FARO (scala + cima)
   ========================================================================== */
(function setupFaro() {
  const A = AREAS[5];
  A.startRoom = 'scala';
  A.intro = [
    'Sei dentro il Faro. Una scala a chiocciola sale verso la cima. Fuori c’è la tempesta.',
    'La scala del Faro! In cima ti aspetta Lavinia. Il cuore batte a mille.'
  ];

  A.guardian.intro = [
    'Pensi davvero di battere Lavinia, Aria? Io ho l’aura da prima della classe! Vediamo se reggi questi round combinati!',
    'Finalmente. Io, Lavinia, ti aspettavo. Ultimo duello: tutte le regole insieme.',
    'Sei arrivata fin qui? Ok, Lavinia è sorpresa. Ma qui finisce la tua fortuna.'
  ];
  A.guardian.loseMsg = [
    'Visto? L’aura da prima della classe è mia. Ripassa il Taccuino e torna, se hai coraggio!',
    'Ahah! Lo sapevo. Riprova, se ci riesci.'
  ];
  A.guardian.winMsg = () => (questState('diario') === 'done'
    ? 'NOOO... aspetta. Hai letto il mio diario, vero? ...Ok. <b>Brava, Aria. Davvero.</b> I cristalli tornano al loro posto. Forse... la prossima volta facciamo squadra?'
    : say([
      'NOOO, LA MIA AURA! Mi hai sbugiardata peggio di un dissing di Marra! I 5 Cristalli tornano al loro posto e il Faro illumina tutta l’isola!',
      'Impossibile! Hai vinto tu. Ugh. I Cristalli tornano al Faro. Ma la rivincita è già prenotata!'
    ]));

  A.objective = () => {
    if (!flag('botola_open')) return 'La botola verso la cima è bloccata da bulloni. Usa la Chiave Inglese d’Oro sulla botola!';
    if (!done(A)) return 'Sali in cima e affronta Lavinia nel Duello Finale!';
    return questState('diario') === 'done' ? 'Hai salvato l’isola e letto tutto il diario. Leggendaria!' : `Hai salvato l’isola! Pagine del diario di Lavinia: ${questCount('diario')}/5.`;
  };

  A.rooms = {
    scala: {
      scene: 'scala',
      enter: ['Fuori tuona. Dentro, i gradini girano e girano.', 'La scala a chiocciola. Ogni gradino è un esponente in più.', 'Si sente il vento fischiare tra le pietre.'],
      layout: { groundY: 188, ariaStart: 70 },
      hotspots: [
        {
          id: 'botola', name: '🔩 Botola', box: [212, 6, 94, 40], stand: 258,
          visible: () => !flag('botola_open'),
          draw: () => '<g><circle cx="222" cy="36" r="3" fill="#fbbf24" stroke="#1c1426" stroke-width="0.6"/><circle cx="296" cy="30" r="3" fill="#fbbf24" stroke="#1c1426" stroke-width="0.6"/><path d="M220 34 L224 38 M294 28 L298 32" stroke="#92400e" stroke-width="0.8"/></g>',
          look: ['Una botola bloccata da due bulloni enormi. Serve un attrezzo speciale.', 'La botola porta in cima. Bulloni d’oro... come la chiave inglese delle Gemelle!'],
          useItem: {
            i5: () => {
              removeItem('i5');
              setFlag('botola_open');
              playSound('success');
              refreshLabels(A);
              ariaSays(['Svito i bulloni con la Chiave Inglese d’Oro... la botola si apre! In cima c’è Lavinia.', 'Click, click. La botola è aperta. È il momento.']);
            }
          }
        },
        {
          id: 'botola-aperta', box: [0, 0, 0, 0], noDot: true,
          visible: () => flag('botola_open'),
          draw: () => '<path d="M214 10 L302 6 L305 42 L222 46 Z" fill="#0b0712"/><path d="M214 10 L196 2 L200 40 L222 46 Z" fill="#6b4022" stroke="#1c1426" stroke-width="0.8"/>'
        },
        {
          id: 'graffito', name: '✏️ Scritta sul muro', box: [264, 78, 52, 26], stand: 288,
          read: () => readCuriosity('videogiochi'),
          look: 'Qualcuno ha scritto "2⁸ = 256!" sul muro. Un nerd dei videogiochi, sicuro.'
        },
        {
          id: 'diario5', name: '📓 Un foglio viola', box: [146, 176, 22, 14], stand: 157,
          visible: () => !flag('dia5'),
          draw: () => diaryPageSVG(157, 184),
          read: () => readDiary(5),
          look: 'L’ultimo foglio viola. Questo sembra scritto in fretta.'
        },
        { id: 'finestra', name: '🖼️ Finestra', box: [242, 60, 20, 42], stand: 252, noDot: true, look: ['Fuori la tempesta. I lampi illuminano il mare.', 'Un lampo! Ho contato fino a 3: il temporale è vicino.'] }
      ],
      exits: [
        leftExit(2, 'belvedere', '⬅ Belvedere'),
        { id: 'to-cima', label: '⬆ Cima', box: [212, 6, 94, 40], stand: 258, to: 'cima', arrive: 140, labelY: 54, visible: () => flag('botola_open') }
      ]
    },

    cima: {
      scene: 'faro',
      enter: ['Il vento in cima è fortissimo.', 'La lanterna è spenta. Lavinia mi guarda dall’altra parte.', 'Ci siamo. Ultimo duello.'],
      layout: {
        ...A.layout,
        guardian: { ...A.layout.guardian, look: ['Lavinia. Corona, capelli viola e zero umiltà.', 'Mi guarda come se fossi un esercizio troppo facile.'] }
      },
      hotspots: [
        { id: 'piedistallo', name: '💎 Piedistallo', box: [172, 136, 56, 48], stand: 200, noDot: true, look: () => `Il piedistallo dei Cristalli. Ce ne sono ${state.crystals.length} su 5.` }
      ],
      exits: [
        { id: 'to-scala', label: '⬇ Scala', box: [108, 134, 24, 34], stand: 120, to: 'scala', arrive: 258, labelY: 128 }
      ]
    }
  };
})();
