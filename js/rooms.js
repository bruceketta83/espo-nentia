/* ==========================================================================
   ESPLORAZIONE: OGGETTI, CURIOSITÀ, MISSIONI E STANZE DELLE AREE
   Le frasi in [ ... ] sono varianti: il gioco ne sceglie una a caso.
   ========================================================================== */

/* --------------------------------------------------------------------------
   OGGETTI RACCOGLIBILI (usable = si può usare dallo Zaino)
   -------------------------------------------------------------------------- */
const ITEMS = {
  corda: { name: 'Corda robusta', icon: '🧶', desc: 'Lunga e resistente. Utile per ripescare cose.', usable: true },
  dadi: { name: 'Dadi fortunati', icon: '🎲', desc: 'I dadi dei Pirati Gemelli. Odorano di botte.', usable: true },
  scheda: { name: 'Scheda di calibrazione', icon: '💾', desc: 'Una scheda perforata con scritto "(a^m)^n".', usable: true },
  annaffiatoio: { name: 'Annaffiatoio', icon: '🚿', desc: 'Pieno d’acqua fresca del vivaio.', usable: true },
  ingranaggio: { name: 'Ingranaggio d’oro', icon: '⚙️', desc: 'Il pezzo mancante dell’Automa.', usable: true },
  rete: { name: 'Rete robusta', icon: '🕸️', desc: 'Una rete da pesca nuova. Ottima per ripescare cose piccole.', usable: true },
  // Premi dei guardiani: servono nell'area successiva.
  i1: { name: 'Chiave della Taverna', icon: '🗝️', desc: 'Consegnata da Barnaba dopo aver sistemato il carico.', usable: true },
  i2: { name: 'Cannocchiale Ottico', icon: '🔭', desc: 'Vinto ai dadi contro i Pirati Gemelli.', usable: true },
  i3: { name: 'Lente Stellare', icon: '🔍', desc: 'Calibrata in cima alla Torre. Concentra la luce.', usable: true },
  i4: { name: 'Seme Luminescente', icon: '🌱', desc: 'Donato da Madame Zeri. Brilla al buio.', usable: true },
  i5: { name: 'Chiave Inglese d’Oro', icon: '🔧', desc: 'Forgiata dalle Gemelle Mira e Nora.', usable: true }
};

/* --------------------------------------------------------------------------
   CURIOSITÀ SULLE POTENZE (si sbloccano leggendo)
   -------------------------------------------------------------------------- */
const CURIOSITIES = {
  scacchiera: {
    icon: '♟️',
    title: 'La leggenda della scacchiera',
    text: `Un re vuole premiare l'inventore degli scacchi. L'inventore chiede solo del riso: <b>1 chicco</b> sulla prima casella, <b>2</b> sulla seconda, <b>4</b> sulla terza... e così via, <b>raddoppiando</b> a ogni casella.<br><br>
      Sulla casella n° 64 ci vanno <span class="math-expr">2<sup>63</sup></span> chicchi: circa <b>9 miliardi di miliardi</b>! Il re non ha abbastanza riso in tutto il regno.<br><br>
      Morale: le potenze crescono in modo <b>esplosivo</b>.`,
    comment: ['Il re è stato fregato da una potenza di 2. Iconico.', 'Raddoppiare sembra poco... finché non arrivi a 2⁶³!', 'Note to self: mai sfidare un matematico con il riso.']
  },
  carta: {
    icon: '📄',
    title: 'I fogli A4 e le potenze di 2',
    text: `Il foglio <b>A0</b> ha un’area di <b>1 m²</b>. Se lo tagli a metà ottieni un A1, a metà ancora un A2... e così via.<br><br>
      Un foglio <b>A4</b> è A0 diviso 4 volte per 2: <span class="math-expr">1 : 2<sup>4</sup> = 1/16</span> di metro quadrato.<br><br>
      Ecco perché in un A3 ci stanno esattamente <b>2 fogli A4</b>!`,
    comment: ['Quindi il mio quaderno è fatto di potenze di 2. Pazzesco.', 'Dividere per 2 quattro volte = dividere per 2⁴. Chiaro!']
  },
  arenario: {
    icon: '🏖️',
    title: 'L’Arenario di Archimede',
    text: `Più di 2000 anni fa il vero <b>Archimede</b> si chiese: quanti granelli di sabbia servono per riempire tutto l’universo?<br><br>
      Per scrivere numeri così grandi inventò un sistema simile alle potenze. Il suo risultato: circa <span class="math-expr">10<sup>63</sup></span> granelli.<br><br>
      Il libro si chiama <b>"Arenario"</b>.`,
    comment: ['Archimede contava la sabbia dell’universo. E io mi lamento dei compiti.', '10⁶³ granelli. Mi fa male la testa, ma in modo bello.']
  },
  batteri: {
    icon: '🦠',
    title: 'I batteri che raddoppiano',
    text: `Alcuni batteri si dividono in due circa ogni <b>20 minuti</b>.<br><br>
      Da <b>1</b> batterio, dopo 10 divisioni ne hai <span class="math-expr">2<sup>10</sup> = 1024</span>. Dopo 20 divisioni ne hai più di <b>un milione</b> (2<sup>20</sup>).<br><br>
      Per questo è importante lavarsi le mani!`,
    comment: ['Ok, vado a lavarmi le mani. Subito.', '2²⁰ batteri. Bleah, ma che matematica!']
  },
  kilobyte: {
    icon: '💻',
    title: 'Perché 1 KB vale 1024 byte',
    text: `I computer contano in <b>base 2</b>: ogni bit vale 0 oppure 1.<br><br>
      Per questo un <b>kilobyte</b> nei computer vale spesso <span class="math-expr">2<sup>10</sup> = 1024</span> byte, non 1000.<br><br>
      E <span class="math-expr">2<sup>10</sup> · 2<sup>10</sup> = 2<sup>20</sup></span> byte fanno circa un megabyte!`,
    comment: ['Il mio telefono parla in potenze di 2. Lo sapevo che era nerd.', '2¹⁰ · 2¹⁰ = 2²⁰. Stessa base, esponenti sommati. Ovunque!']
  },
  videogiochi: {
    icon: '🎮',
    title: 'Il numero 256 nei videogiochi',
    text: `Molti videogiochi vecchi salvavano i numeri in <b>8 bit</b>. Con 8 bit puoi scrivere <span class="math-expr">2<sup>8</sup> = 256</span> valori diversi: da 0 a 255.<br><br>
      Per questo in alcuni giochi classici il livello <b>256</b> si "rompe": il contatore torna a zero e lo schermo impazzisce!`,
    comment: ['Un livello che si rompe per colpa di 2⁸. Leggendario.', 'Ora capisco perché 255 è un numero così famoso.']
  },
  googol: {
    icon: '🔟',
    title: 'Il Googol',
    text: `Un <b>googol</b> è il numero <span class="math-expr">10<sup>100</sup></span>: un 1 seguito da <b>100 zeri</b>.<br><br>
      Il nome lo ha inventato un bambino di 9 anni, Milton Sirotta, nipote del matematico Edward Kasner, intorno al 1920.<br><br>
      Il motore di ricerca <b>Google</b> prende il nome proprio da questo numero!`,
    comment: ['Un bambino di 9 anni ha dato il nome a un numero gigante. Goals.', 'Google viene da 10¹⁰⁰. Lo dico a tutti domani.', '100 zeri. Il mio quaderno non basterebbe.']
  }
};

/* --------------------------------------------------------------------------
   MISSIONI SECONDARIE
   -------------------------------------------------------------------------- */
function coinsFound() { return ['coin1', 'coin2', 'coin3'].filter(flag).length; }

const QUESTS = {
  dobloni: {
    board: 'Uno sulla spiaggia, uno in città vicino alla Taverna, uno in fondo al mare (serve una rete).',
    icon: '💰', piece: 'Doblone d’oro', giverName: 'Capitana Vera',
    title: 'I dobloni di Vera',
    desc: 'Trova i 3 dobloni d’oro persi da Capitana Vera e riportaglieli.',
    flags: ['coin1', 'coin2', 'coin3'],
    progress: () => `${coinsFound()}/3`
  },
  boccali: {
    board: 'Uno in Taverna, uno l’ha preso Archimede (Torre), uno Madame Zeri (Serra).',
    icon: '🍺', piece: 'Boccale', giverName: 'l’Oste',
    title: 'I boccali dell’Oste',
    desc: 'Trova i 3 boccali sparsi intorno alla Taverna.',
    flags: ['mug1', 'mug2', 'mug3'],
    progress: () => `${questCount('boccali')}/3`
  },
  cannocchiale: {
    board: 'Lo vincono i Pirati Gemelli: riportalo ad Archimede alla Torre.',
    icon: '🔭', piece: 'Cannocchiale', giverName: 'Archimede',
    title: 'Il cannocchiale di Archimede',
    desc: 'Riporta ad Archimede il cannocchiale rubato dai Pirati Gemelli.',
    flags: ['cannocchiale_reso'],
    progress: () => (hasItem('i2') ? 'ce l’hai!' : '0/1')
  },
  bulloni: {
    board: 'Uno all’Officina, uno nel capanno del Molo, uno vicino all’ascensore della Torre.',
    icon: '🔩', piece: 'Bullone d’oro', giverName: 'Mira e Nora',
    title: 'I bulloni delle Gemelle',
    desc: 'Trova i 3 bulloni d’oro di Mira e Nora tra officina e magazzino.',
    flags: ['bul1', 'bul2', 'bul3'],
    progress: () => `${questCount('bulloni')}/3`
  },
  diario: {
    board: 'Una pagina viola in ogni area. Cerca bene!',
    icon: '📓', piece: 'Pagina del diario', autoStart: true,
    title: 'Il diario di Lavinia',
    desc: 'Trova le 5 pagine del diario segreto di Lavinia sparse per l’isola.',
    flags: ['dia1', 'dia2', 'dia3', 'dia4', 'dia5'],
    progress: () => `${questCount('diario')}/5`,
    onComplete: () => {
      setQuest('diario', 'done');
      addAura(150);
      ariaSays('Ho tutte e 5 le pagine del diario di Lavinia (+150 Aura). Ora capisco tante cose...');
    }
  }
};

/* --------------------------------------------------------------------------
   DIARIO DI LAVINIA (5 pagine, una per area)
   -------------------------------------------------------------------------- */
const DIARY = [
  'Giorno 1. Oggi all’Accademia hanno premiato Aria come "Esploratrice dell’anno". Io avevo fatto 100 esercizi in più. Nessuno se n’è accorto. Ho un piano.',
  'Giorno 3. I cristalli del Faro sono 5. Se li prendo io, tutti vedranno chi è la vera prima della classe. I Pirati Gemelli mi hanno aiutata per 10 dobloni. Costosi, ma ne vale la pena.',
  'Giorno 5. Ho sbagliato un calcolo: ho moltiplicato le basi invece di sommare gli esponenti. Nessuno lo deve sapere. MAI.',
  'Giorno 7. Aria sta arrivando. È più brava di quanto pensassi. Tipo... davvero brava. Ugh.',
  'Giorno 9. Forse volevo solo che qualcuno mi dicesse "brava". Se Aria arriva fin quassù, forse se lo merita lei. Ma non glielo dirò mai. Forse.'
];

function readDiary(n) {
  showReading(`📓 Diario di Lavinia – pag. ${n}`, `<i>${DIARY[n - 1]}</i>`, () =>
    collectPiece('diario', `dia${n}`, [
      'Il diario segreto di Lavinia! Non dovrei leggerlo... ma l’ho già fatto.',
      'Una pagina del diario di Lavinia. Interessante...',
      'Lavinia scrive tutto. Proprio tutto.'
    ]));
}

/* Disegno di un foglio di diario a terra. */
function diaryPageSVG(x, y) {
  return `<g transform="translate(${x} ${y}) rotate(-12)">${objIcon('diario', 13)}</g>`;
}

/* Disegno di un oggetto da raccogliere che luccica. */
function sparkleSVG(x, y, inner) {
  return `<g transform="translate(${x} ${y})">${inner}
    <path class="spark-pop" d="M4 -6 L4.8 -3.8 L7 -3 L4.8 -2.2 L4 0 L3.2 -2.2 L1 -3 L3.2 -3.8 Z" fill="#fff" style="animation-duration:1.6s"/></g>`;
}
/* Oggetti che luccicano: immagini centrate in (0,0). */
const MUG = objIcon('boccale', 11);
const BOLT = objIcon('bullone', 10);
const COIN = objIcon('doblone', 9);

function takeCoin(n) {
  setFlag(`coin${n}`);
  playSound('crystal');
  refreshLabels(AREAS[state.currentArea]);
  const c = coinsFound();
  toast(`💰 Doblone d’oro trovato! <b>${c}/3</b>`);
  if (c === 3 && questState('dobloni') === 'active') {
    ariaSays(['Tre dobloni su tre! Torno da Capitana Vera.', 'Ho tutti i dobloni. Vera, arrivo!']);
  } else {
    ariaSays(['Un doblone d’oro! Brilla più della mia aura.', 'Oro! Qualcuno l’ha perso qui.', 'Un doblone. Questo è di Vera, ci scommetto.']);
  }
}

/* --------------------------------------------------------------------------
   LAVINIA: COMPARSE ANTIPATICHE CON DOMANDA LAMPO
   -------------------------------------------------------------------------- */
const LAVINIA = {
  name: 'Lavinia',
  role: 'Rivale (molto antipatica)',
  hello: 'Ciao, Aria. Io sono Lavinia, la prima della classe. Ricorda il mio nome: lo leggerai in cima alla classifica.',
  taunts: [
    'Oh, ma guarda chi c’è: la turista della matematica. Carino lo zainetto, l’hai preso in saldo?',
    'Aria! Che sorpresa... ah no, nessuna sorpresa: sei sempre in ritardo.',
    'Ciao Aria. Io i cristalli li ho quasi tutti. Tu invece hai... un taccuino. Adorabile.',
    'Ancora tu? Pensavo fossi rimasta a giocare con i granchi.',
    'Io le potenze le so a mena dito. Tu a mena... niente.',
    'Ho studiato come se non ci fosse un domani. Tu? Ah già, tu giochi coi granchi.',
    'Ho ripassato tutto a tappeto. Il tuo tappeto invece è... vuoto.',
    'Pensi di arrivare al Faro prima di me? Delulu.',
    'Guarda il mio Labubu edizione limitata. Ah, tu non ce l’hai? Che peccato. Non.',
    'Oggi flexo: tre cristalli e zero errori. Tu? Boh, lascia stare.',
    'Io studio con Elodie nelle cuffie. Tu con i granchi che fanno il beat.'
  ],
  challenge: [
    'Domanda lampo. Vediamo se reggi o se vai in tilt.',
    'Facciamo un test. Tanto lo so già come finisce.',
    'Una domandina facile facile. Per me, eh.'
  ],
  win: [
    'Tsk. Fortuna. Pura fortuna. Ci vediamo in cima al Faro!',
    'Ok, questa la sapevi. Non montarti la testa.',
    'Ugh. Va bene. Ma il Faro sarà mio!',
    'Ok, slay. Contenta? Tanto vinco io.'
  ],
  lose: [
    'Ahahah! Lo sapevo. Torna a giocare con i granchi.',
    'Sbagliato! Dovrei postarlo per i miei follower.',
    'Che cringe. Ripassa, principiante.',
    'Red flag: sbagli le basi. Letteralmente.',
    'Risposta random? Si vede.'
  ],
  ariaAfter: [
    'Che antipatica. Ma la batterò.',
    'Lavinia se n’è andata. Finalmente si respira.',
    'Ok, Lavinia: sfida accettata.',
    'Lavinia è troppo delulu. Io mi chillo e ripasso.'
  ]
};

/* Lavinia appare, provoca Aria e fa una domanda lampo sulla regola dell'area. */
function laviniaCameo(area, flagKey) {
  const who = { name: LAVINIA.name, role: LAVINIA.role, avatar: 'lavinia', speaker: 'lavinia-cameo' };
  // Primo incontro: Lavinia dice il suo nome.
  const taunt = flag('met_lavinia') ? LAVINIA.taunts : LAVINIA.hello;
  setFlag('met_lavinia');
  setDialogue(who.name, who.role, who.avatar, taunt, who.speaker);
  clearChoices();
  const go = () => {
    const q = generateQuestion(area, area.ruleId ? ruleLevel(area.ruleId) : 1);
    quickQuestion(q, { ...who, intro: say(LAVINIA.challenge) }, (ok) => {
      setDialogue(who.name, who.role, who.avatar, ok ? LAVINIA.win : LAVINIA.lose, who.speaker);
      clearChoices();
      addChoice('Continua →', () => {
        setFlag(flagKey);
        if (ok) setFlag(`${flagKey}_won`);
        setFlag(`${flagKey}_here`, false);
        refreshLabels(area);
        ariaSays(LAVINIA.ariaAfter);
      }, 'primary-action');
    });
  };
  addChoice('⚡ Accetta la sfida', go, 'primary-action');
  addChoice('<span>🙄 Ignorala</span><span>→</span>', () => {
    setDialogue(who.name, who.role, who.avatar, ['Scappi? Tipico.', 'Paura, eh? Ti capisco.', 'Ok, vai pure. Tanto perdi lo stesso.'], who.speaker);
    clearChoices();
    addChoice('⚡ Va bene, sfida accettata', go, 'primary-action');
  });
}

/* ==========================================================================
   AREA 1: IL MOLO DELLE BASI UGUALI (3 stanze)
   ========================================================================== */
(function setupMolo() {
  const A = AREAS[0];

  A.intro = [
    'Sei appena sbarcata sulla spiaggia del Molo. Il Faro in lontananza lampeggia a fatica. Tocca le cose per guardarle, leggerle o prenderle!',
    'Eccoti al Molo delle Basi Uguali! Esplora: tocca persone e oggetti. Il puntino giallo indica le cose interessanti.'
  ];
  A.startRoom = 'spiaggia';

  /* ---------- Mentore: Capitana Vera ---------- */
  A.mentor.lines = [
    ['Ehilà mozzo! Benvenuta al Molo. Io sono Capitana Vera e questa è la mia spiaggia.',
     'Ahoy, mozzo! Sono Capitana Vera. Hai la faccia di chi cerca guai... o cristalli.',
     'Ehi, tu! Sì, tu con lo zaino. Sono Capitana Vera e qui comando io.'],
    'Ascolta bene: quando due navi hanno la <b>stessa bandiera (la base)</b> e uniscono i carichi (moltiplicazione), non devi moltiplicare le basi! Tieni la <b>stessa base</b> e <b>somma gli esponenti</b>.',
    ['Guarda qua: <span class="math-expr">3<sup>2</sup> · 3<sup>5</sup> = 3<sup>2+5</sup> = 3<sup>7</sup></span>. Base ferma, esponenti sommati. Easy.',
     'Esempio lampo: <span class="math-expr">4<sup>3</sup> · 4<sup>6</sup> = 4<sup>3+6</sup> = 4<sup>9</sup></span>. La base resta 4, gli esponenti si sommano. Zero sbatti.'],
    'Ti ho trascritto la <b>Regola 1</b> nel Taccuino. Barnaba è sul pontile, a destra. Ah, e già che ci sei: ho perso <b>3 dobloni d’oro</b> qui in giro. Se li trovi, ti ricompenso!'
  ];
  A.mentor.again = () => {
    if (questState('dobloni') === 'active' && coinsFound() < 3) {
      return say([
        `Hai trovato ${coinsFound()} dobloni su 3. Uno l’ho perso in città, vicino alla Taverna. Un altro è in fondo al mare: serve una rete!`,
        `${coinsFound()}/3 dobloni. Cerca a tappeto, mozzo: spiaggia, città e fondale!`
      ]);
    }
    return say([
      'Ancora qui, mozzo? Ricorda: stessa base, esponenti sommati!',
      'Le regole delle potenze le devi sapere a mena dito, mozzo!',
      'Se ti serve la lezione, chiedi pure. Ma senza piangere, eh.',
      'Barnaba è sul pontile. Non farti mettere i piedi in testa!',
      'Il mare è calmo, la matematica pure. Vai e spacca.'
    ]);
  };
  A.mentor.onEnd = () => {
    if (questState('dobloni') === 'none') setQuest('dobloni', 'active');
  };
  A.mentor.extraChoices = (area) => {
    if (questState('dobloni') !== 'active' || coinsFound() < 3) return [];
    return [{
      html: '💰 Consegna i 3 dobloni',
      cls: 'primary-action',
      fn: () => {
        setQuest('dobloni', 'done');
        addAura(100);
        playSound('victory');
        setDialogue(A.mentor.name, A.mentor.role, 'vera', [
          'I miei dobloni! Sei una vera piratessa. Ecco <b>100 Aura</b> di ricompensa!',
          'Tutti e tre! Mozzo, hai l’occhio di un’aquila. Prendi <b>100 Aura</b>!'
        ], 'mentor');
        clearChoices();
        addChoice('↩️ Continua a esplorare', () => ariaSays(null), 'primary-action');
      }
    }];
  };

  /* ---------- Guardiano: Barnaba ---------- */
  A.guardian.intro = [
    'Alt lì, baddie! Sono Barnaba, il buttafuori del Molo. Qui non si passa se non sistemi il carico. E non fare scena muta.',
    'Eccoti. Io sono Barnaba e il carico è tornato: ora tocca ai conti. Pronta?',
    'Ok, cassa ripescata. Rispetto. Ma io sono Barnaba e adesso si fa sul serio.'
  ];
  A.guardian.blockMsg = [
    'Ehi, frena! Io sono Barnaba e non ti conosco. Prima fatti spiegare la regola da <b>Capitana Vera</b>, sulla spiaggia.',
    'Sono Barnaba, il buttafuori. Niente sfide senza lezione. Vai da <b>Capitana Vera</b> sulla spiaggia, poi ne riparliamo.'
  ];
  A.guardian.loseMsg = [
    'Fuori dal mio molo! Torna quando sai sommare gli esponenti, baddie. Ti aspetto qui.',
    'Hai perso, ma niente drammi. Ripassa e torna: io non mi muovo.',
    'Tilt totale! Rileggi il Taccuino e riprova.'
  ];
  A.guardian.winMsg = [
    'Slay! Stessa base, esponenti sommati alla perfezione. Ecco il <b>Cristallo Ambra</b> e la chiave per la Taverna. Passa pure, vera baddie della matematica!',
    'Ok, ok, mi arrendo! Sei forte. Prendi il <b>Cristallo Ambra</b> e la chiave della Taverna. Rispetto totale.'
  ];
  A.duelGate = () => (flag('cassa_ok') ? null : [
    'Alt! Il mio carico è caduto in acqua, sotto il pontile. Ripescalo e poi parliamo di matematica.',
    'Prima la cassa, poi la sfida. Regole del molo, baddie. È lì sotto, in acqua.',
    'Senza la mia cassa niente duello. Trova un modo per ripescarla!'
  ]);

  /* ---------- Cosa devo fare? ---------- */
  A.objective = () => {
    if (!state.unlockedRules.includes(A.ruleId)) return 'Parla con Capitana Vera sulla spiaggia. Ti spiega la prima regola.';
    if (!flag('cassa_ok') && !hasItem('corda') && !flag('capanno_open')) {
      return flag('read_bacheca')
        ? `Barnaba vuole la sua cassa. Serve una corda: forse nel capanno sulla spiaggia. Il codice del lucchetto è l’esponente di 2${toSup(P_molo().a)} · 2${toSup(P_molo().b)}: usa la Regola 1!`
        : 'Barnaba vuole la sua cassa, che galleggia sotto il pontile. Ti serve una corda. Leggi la bacheca sul pontile!';
    }
    if (!flag('cassa_ok') && !hasItem('corda')) return 'Il capanno è aperto. Dentro c’è una corda: prendila!';
    if (!flag('cassa_ok')) return 'Apri lo Zaino, tocca "Usa" sulla corda, poi tocca la cassa che galleggia sotto il pontile.';
    if (!state.completedAreas.includes(A.id)) return 'La cassa è salva. Ora sfida Barnaba sul pontile!';
    if (questState('dobloni') === 'active' && coinsFound() < 3) {
      if (!flag('coin2')) return `Missione extra (${coinsFound()}/3): Vera dice che un doblone è finito in città, vicino alla Taverna.`;
      if (!flag('coin3')) return `Missione extra (${coinsFound()}/3): un doblone è in fondo al mare sotto il pontile. Ti serve una rete robusta... forse all’Officina.`;
      return `Missione extra: trova i dobloni di Vera (${coinsFound()}/3).`;
    }
    if (questState('dobloni') === 'active') return 'Porta i 3 dobloni a Capitana Vera!';
    return 'Area completata! Puoi proseguire verso la Taverna.';
  };

  /* ---------- Stanze ---------- */
  A.rooms = {
    /* ===== SPIAGGIA ===== */
    spiaggia: {
      scene: 'spiaggia',
      enter: [
        'La sabbia è tiepida. Un granchio mi guarda male.',
        'Che tramonto! Peccato per il Faro spento laggiù.',
        'Spiaggia del Molo. Odore di salsedine e di avventura.'
      ],
      layout: {
        groundY: 178,
        ariaStart: 262,
        mentor: {
          x: 196, draw: 'vera', stand: 162, label: '🏴‍☠️ Capitana Vera',
          look: ['Capitana Vera. Ha un cappello più grande del mio zaino.', 'Vera ha la spada, il cappello e l’autostima. Tutto il pacchetto.']
        }
      },
      hotspots: [
        {
          id: 'granchio', name: '🦀 Granchio', box: [96, 160, 26, 18], stand: 124, noDot: true,
          
          look: [
            'Un granchio. Cammina di lato, come chi non sa le regole delle potenze.',
            'Il granchio mi fissa. Ha un’aura minacciosa.',
            'Ha due chele. 2¹ chele. Ok, sto diventando nerd.'
          ]
        },
        {
          id: 'nave', name: '⛵ La nave di Vera', box: [120, 12, 116, 126], stand: 150,
          look: [
            'La nave di Capitana Vera si chiama "Base Uguale". Che nome nerd.',
            'Una nave pirata vera! Le vele hanno delle toppe a forma di 2.'
          ]
        },
        {
          id: 'palma', name: '🌴 Palma', box: [22, 18, 76, 126], stand: 60, noDot: true,
          look: ['Una palma. Niente cocchi, purtroppo.', 'Se fossi una palma, sarei una palma elevata alla seconda.']
        },
        {
          id: 'bottiglia', name: '🍾 Messaggio in bottiglia', box: [276, 184, 24, 16], stand: 282,
          obj: 'bottiglia', objScale: 1.5,
          read: () => readCuriosity('scacchiera'),
          look: 'Una bottiglia con dentro un foglio arrotolato. Classico messaggio in bottiglia!'
        },
        {
          id: 'doblone1', name: '💰 Qualcosa che luccica', box: [220, 184, 18, 12], stand: 229,
          visible: () => !flag('coin1'),
          draw: () => sparkleSVG(229, 190, COIN),
          take: () => takeCoin(1)
        },
        {
          id: 'lucchetto', name: '🔒 Lucchetto del capanno', box: [326, 120, 16, 16], stand: 334,
          visible: () => !flag('capanno_open'),
          obj: 'lucchetto', objScale: 1.1,
          use: () => openPadlock(),
          useIcon: '🔢',
          useLabel: 'Codice',
          look: ['Un lucchetto a combinazione con 2 rotelle. Serve un codice di 2 cifre.', 'Il capanno è chiuso. Il lucchetto vuole un numero di 2 cifre.']
        },
        {
          id: 'porta-aperta', box: [0, 0, 0, 0], noDot: true,
          // Nell'immagine la porta è aperta: finché c'è il lucchetto la copriamo con la porta chiusa.
          visible: () => !flag('capanno_open'),
          draw: () => `<rect x="322.5" y="103" width="23.5" height="47" fill="#7a5a3c" ${wink(0.7)}/>
            <path d="M330 103 L330 150 M338 103 L338 150" stroke="#5a3e26" stroke-width="0.8"/>`
        }
      ],
      exits: [
        { id: 'to-pontile', label: 'Pontile ➜', box: [348, 120, 52, 66], stand: 372, to: 'pontile', arrive: 60, labelY: 112 },
        {
          id: 'to-capanno', label: '🚪 Capanno', box: [322, 102, 26, 50], stand: 334, to: 'capanno', arrive: 70, labelY: 96,
          visible: () => flag('capanno_open')
        }
      ]
    },

    /* ===== PONTILE (scena del Molo, con Barnaba) ===== */
    pontile: {
      scene: 'molo',
      enter: [
        'Il pontile scricchiola a ogni passo.',
        'Barnaba è ancora lì, con le braccia incrociate.',
        'Le casse del carico profumano di pesce. Bleah.'
      ],
      onEnter: (first) => {
        // Lavinia compare una volta, dopo la lezione di Vera.
        if (state.unlockedRules.includes(A.ruleId) && !flag('lav0') && !flag('lav0_here')) {
          setFlag('lav0_here');
          refreshLabels(A);
          laviniaCameo(A, 'lav0');
          return true;
        }
        return false;
      },
      layout: {
        groundY: 162,
        ariaStart: 60,
        guardian: {
          x: 330, draw: 'barnaba', stand: 296, label: '🦍 Barnaba',
          look: ['Barnaba. Braccia grosse come due potenze di 10.', 'Ha gli occhiali da sole anche al tramonto. Iconico.']
        }
      },
      hotspots: [
        {
          id: 'bacheca', name: '📌 Bacheca del porto', box: [96, 112, 32, 36], stand: 112,
          obj: 'bacheca',
          read: () => {
            setFlag('read_bacheca');
            showReading('📌 Bacheca del porto',
              `<b>AVVISO DELLA CAPITANERIA</b><br>Il capanno degli attrezzi sulla spiaggia è chiuso con un lucchetto.<br>
               La combinazione è l’<b>esponente</b> del risultato di: <span class="math-expr">2<sup>${P_molo().a}</sup> · 2<sup>${P_molo().b}</sup></span><br><br>
               <b>CERCASI</b><br>3 dobloni d’oro smarriti. Ricompensa! Chiedere di Capitana Vera.`,
              () => ariaSays(['Il codice del capanno è un calcolo con le potenze. Ora tocca a me fare i conti.', 'Stessa base... quindi gli esponenti si sommano. Faccio il conto e provo il lucchetto.']));
          },
          look: 'Una bacheca con dei fogli appesi. Qualcuno ha scritto qualcosa.'
        },
        {
          id: 'cassa-acqua', name: '📦 Cassa in acqua', box: [183, 180, 34, 26], stand: 200,
          visible: () => !flag('cassa_ok'),
          draw: () => `<g class="bob">${objInBox('cassa', [183, 180, 34, 24]).svg}${objText('2⁵', 200, 197, 8, '#fef3c7')}</g>
            <ellipse class="shimmer" cx="200" cy="205" rx="16" ry="2.4" fill="#c4b5fd" opacity="0.5"/>`,
          look: [
            'Una cassa del carico galleggia sotto il pontile. Senza una corda non ci arrivo.',
            'È la cassa di Barnaba! Dondola tra le onde. Mi serve qualcosa per tirarla su.'
          ],
          useItem: {
            corda: () => {
              removeItem('corda');
              setFlag('cassa_ok');
              playSound('success');
              refreshLabels(A);
              ariaSays([
                'Lancio la corda... presa! La cassa è salva. Sul fondo però luccica ancora qualcosa...',
                'Tiro, tiro... fatto! Cassa recuperata. Ehi, laggiù in fondo brilla qualcosa!'
              ]);
            }
          }
        },
        {
          id: 'cassa-salva', name: '📦 Cassa recuperata', box: [124, 140, 26, 22], stand: 136, noDot: true,
          visible: () => flag('cassa_ok'),
          obj: 'cassa', objText: ['2⁵', 0.62, 8, '#fef3c7'],
          look: ['La cassa recuperata. Barnaba la guarda con amore.', 'Ancora bagnata. Odora di alghe e di vittoria.']
        },
        {
          id: 'doblone-mare', name: '💰 Luccichio sul fondo', box: [134, 196, 30, 18], stand: 150,
          visible: () => flag('cassa_ok') && !flag('coin3'),
          draw: () => sparkleSVG(150, 205, COIN),
          look: ['Sul fondo del mare luccica un doblone. Troppo in basso per le mani. Serve una rete robusta.', 'Un doblone sul fondale! Con una rete lo prenderei.'],
          useItem: {
            rete: () => { removeItem('rete'); takeCoin(3); },
            corda: () => ariaSays('La corda non basta: il doblone è piccolo e scivola via. Serve una rete.')
          }
        },
        {
          id: 'casse', name: '📦 Casse del carico', box: [228, 120, 84, 42], stand: 220, noDot: true,
          look: ['Due casse con delle potenze scritte sopra. Barnaba ci tiene tantissimo.', 'Casse con le potenze scritte sopra. Su quest’isola sono tutti fissati.']
        },
        {
          id: 'lavinia', name: '👑 Lavinia', box: [202, 96, 28, 68], stand: 160, noDot: true,
          visible: () => flag('lav0_here'),
          draw: () => charSVG('lavinia', 216, 164, -1, 'char-lavinia-cameo'),
          talk: () => laviniaCameo(A, 'lav0')
        }
      ],
      exits: [
        { id: 'to-spiaggia', label: '⬅ Spiaggia', box: [0, 108, 52, 56], stand: 26, to: 'spiaggia', arrive: 360, labelY: 104 },
        {
          id: 'to-piazza', label: 'Piazza ➜', box: [348, 160, 52, 30], stand: 378, toArea: 1, toRoom: 'piazza', arrive: 40, labelY: 176,
          locked: () => !state.completedAreas.includes(0),
          lockedActions: [{ icon: '🚧', label: 'Bloccato', fn: () => ariaSays(['Barnaba non mi fa passare. Prima la sfida!', 'La strada per la Piazza è dietro Barnaba. Devo batterlo.']) }]
        }
      ]
    },

    /* ===== CAPANNO ===== */
    capanno: {
      scene: 'capanno',
      enter: [
        'Il capanno è pieno di reti e corde.',
        'Qui dentro c’è un sacco di roba utile. E polvere.',
        'Che disordine! Però magari trovo qualcosa.'
      ],
      layout: { groundY: 178, ariaStart: 76 },
      hotspots: [
        {
          id: 'corda', name: '🧶 Corda', box: [158, 162, 34, 18], stand: 175,
          visible: () => !hasItem('corda') && !flag('cassa_ok'),
          obj: 'corda',
          take: () => {
            giveItem('corda');
            refreshLabels(A);
            ariaSays(['Una corda robusta. Perfetta per ripescare qualcosa!', 'Presa! Con questa posso tirare su anche un elefante. O una cassa.']);
          },
          look: 'Un rotolo di corda. Sembra resistente.'
        },
        {
          id: 'bul2', name: '🔩 Qualcosa che luccica', box: [334, 100, 16, 12], stand: 330,
          visible: () => !flag('bul2'),
          draw: () => sparkleSVG(342, 108, BOLT),
          take: () => collectPiece('bulloni', 'bul2', ['Un bullone d’oro! Chissà di chi è...', 'Un bullone tutto d’oro. Qualcuno all’Officina lo starà cercando.'])
        },
        {
          id: 'poster', name: '📜 Poster "Googol"', box: [238, 68, 52, 54], stand: 262,
          read: () => readCuriosity('googol'),
          look: 'Un poster con scritto 10¹⁰⁰. Chi appende un numero in un capanno? Un pirata nerd.'
        },
        {
          id: 'mappa', name: '🗺️ Mappa', box: [228, 128, 84, 20], stand: 270,
          look: [
            'Una mappa dell’isola: Molo, Taverna, Torre, Serra, Officina e il Faro in cima. Sei tappe, sei regole.',
            'Sulla mappa qualcuno ha cerchiato il Faro in rosso. E ha scritto "LAVINIA WAS HERE". Che nervi.'
          ]
        },
        {
          id: 'diario1', name: '📓 Un quaderno viola', box: [323, 166, 22, 14], stand: 334,
          visible: () => !flag('dia1'),
          draw: () => diaryPageSVG(334, 173),
          read: () => readDiary(1),
          look: 'Un foglio viola con una corona disegnata sopra. Mi ricorda qualcuno...'
        },
        {
          id: 'rete', name: '🕸️ Rete da pesca', box: [106, 68, 42, 84], stand: 126, noDot: true,
          look: ['Una rete da pesca. Ha un buco enorme. Il pesce ringrazia.', 'Una rete con dei galleggianti. Uno, due, quattro, otto... ok basta.']
        }
      ],
      exits: [
        { id: 'to-spiaggia2', label: '🚪 Esci', box: [20, 64, 80, 94], stand: 70, to: 'spiaggia', arrive: 334, labelY: 90 }
      ]
    }
  };

  /* Lucchetto del capanno: il codice è l'esponente di 2⁵ · 2⁷ = 2¹². */
  function openPadlock() {
    askCode({
      title: 'Lucchetto del capanno',
      prompt: flag('read_bacheca')
        ? `Due rotelle con i numeri da 0 a 9. Il codice è l’<b>esponente</b> di <span class="math-expr">2<sup>${P_molo().a}</sup> · 2<sup>${P_molo().b}</sup></span>.`
        : 'Due rotelle con i numeri da 0 a 9. Serve un codice di 2 cifre. Forse qualcuno l’ha scritto da qualche parte...',
      answer: String(P_molo().a + P_molo().b),
      onSuccess: () => {
        setFlag('capanno_open');
        refreshLabels(A);
        ariaSays(['Click! Il lucchetto si apre. Stessa base, esponenti sommati: too easy.', 'Aperto! Le potenze le so a mena dito.']);
      }
    });
  }
})();
