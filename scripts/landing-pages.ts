/**
 * Pagine guida del sito ufficiale: ognuna risponde a una domanda vera di chi cucina per una famiglia.
 * Il testo è pensato per essere utile da solo (non pagine fotocopia): l'app compare dove aiuta davvero.
 */
export interface GuidePage {
  slug: string;
  title: string;
  description: string;
  h1: string;
  lead: string;
  /** Breve frase per la scheda nell'elenco delle guide */
  summary: string;
  shot?: { file: string; alt: string; caption: string };
  sections: { h2: string; html: string }[];
  faq: { q: string; a: string }[];
  related: string[];
  /** Pagine di salute: aggiunge l'avviso di prudenza */
  health?: boolean;
}

const HEALTH_NOTE =
  '<p class="note"><strong>Una precisazione:</strong> questa guida è informativa e non sostituisce il parere del medico o del dietista. In caso di allergie o celiachia, segui sempre le indicazioni di chi ti segue e controlla le etichette dei prodotti.</p>';

export const PAGES: GuidePage[] = [
  {
    slug: 'menu-settimanale-famiglia',
    title: 'Menù settimanale per la famiglia: come organizzarlo senza stress',
    description:
      'Come preparare un menù della settimana per tutta la famiglia: metodo in 5 passi, consigli su avanzi e stagionalità e come farlo in un tocco con Che cucino oggi?',
    h1: 'Menù settimanale per la famiglia: come organizzarlo senza stress',
    lead: 'La domanda «cosa cucino oggi?» consuma energie ogni giorno. Decidere i pasti una volta sola, per tutta la settimana, toglie il pensiero e riduce spesa e sprechi.',
    summary: 'Un metodo in 5 passi per decidere i pasti una volta a settimana.',
    shot: {
      file: 'menu',
      alt: 'Schermata del menù della settimana di Che cucino oggi? con pranzi e cene',
      caption: 'Il menù della settimana in Che cucino oggi?: pranzi e cene, con un tocco per cambiare un piatto.',
    },
    sections: [
      {
        h2: 'Perché conviene pianificare i pasti',
        html: `<p>Pianificare non significa mangiare sempre le stesse cose: significa togliere l'improvvisazione dell'ultimo minuto, quella che porta a ordinare una pizza, a comprare di troppo o a buttare verdure dimenticate in frigo. Con un menù deciso in anticipo fai la spesa una volta sola, sai già cosa scongelare e puoi coinvolgere anche chi in casa dice «io non so cosa mangiare».</p>`,
      },
      {
        h2: 'Il metodo in 5 passi',
        html: `<ol>
<li><strong>Parti da quello che hai.</strong> Guarda frigo e dispensa: le verdure fresche e gli avanzi vanno consumati per primi.</li>
<li><strong>Scegli i pasti forti.</strong> Metti prima nel calendario le cene a cui tieni (il piatto della domenica, la pizza del sabato), poi riempi il resto.</li>
<li><strong>Alterna le proteine.</strong> Legumi, pesce, uova, carne bianca e formaggi a rotazione: è più vario e più leggero da digerire che ripetere sempre lo stesso secondo.</li>
<li><strong>Prevedi un paio di pasti veloci.</strong> Nelle sere piene un piatto da 15 minuti evita di ripiegare sul pronto.</li>
<li><strong>Scrivi la lista della spesa dal menù, non a memoria.</strong> Togli quello che hai già e compra solo il resto.</li>
</ol>`,
      },
      {
        h2: 'Stagionalità e avanzi: due alleati',
        html: `<p>Le verdure di stagione costano meno, hanno più sapore e di solito si trovano più fresche. Se scegli i piatti attorno a ciò che è in stagione, la spesa diventa quasi automatica. Per gli avanzi, pensa già al menù di domani: il riso lesso diventa un'insalata di riso, la pasta avanzata una frittata, il pollo arrosto un ripieno per le piadine.</p>`,
      },
      {
        h2: 'Quando in famiglia gusti ed esigenze sono diversi',
        html: `<p>Il vero ostacolo è che in casa non si mangia tutti allo stesso modo: c'è chi non ama certe verdure, chi è vegano, chi ha un'allergia. Una regola semplice è partire da un piatto base adatto a tutti e prevedere una variante per chi ha esigenze particolari, invece di cucinare due cene diverse. Se vuoi approfondire, leggi come gestire <a href="/allergie-e-intolleranze-in-famiglia">allergie e intolleranze in famiglia</a>.</p>`,
      },
      {
        h2: 'Come fa Che cucino oggi? a farlo per te',
        html: `<p>Con un tocco l'app crea pranzi e cene per sette giorni, equilibrati e senza ripetizioni, tenendo conto di stagione, gusti e diete di ogni persona. Se un piatto non ti convince lo cambi con uno simile. Poi prepara da sola la <a href="/lista-della-spesa-famiglia">lista della spesa</a>, togliendo quello che hai già in dispensa.</p>`,
      },
    ],
    faq: [
      {
        q: 'Quanto tempo ci vuole a fare il menù della settimana?',
        a: 'Con carta e penna circa 20-30 minuti, con una app che propone i piatti pochi minuti. Il tempo risparmiato si vede soprattutto nella spesa, che diventa una sola.',
      },
      {
        q: 'Il menù settimanale non diventa noioso?',
        a: 'Non se alterni proteine e piatti di stagione e lasci uno o due pasti liberi. Un buon menù ha una base fissa e un po\' di margine per le voglie del momento.',
      },
      {
        q: 'Posso cambiare un piatto dopo aver creato il menù?',
        a: 'Sì. In Che cucino oggi? ogni piatto si sostituisce con uno simile, senza ricreare il menù da capo.',
      },
    ],
    related: ['lista-della-spesa-famiglia', 'dispensa-e-spreco-alimentare', 'allergie-e-intolleranze-in-famiglia'],
  },
  {
    slug: 'menu-vegano-settimanale',
    title: 'Menù vegano settimanale: organizzarlo anche in una famiglia mista',
    description:
      'Come costruire un menù vegano della settimana, anche se in famiglia non siete tutti vegani: proteine vegetali, organizzazione e alternative per persona.',
    h1: 'Menù vegano settimanale: come organizzarlo anche in una famiglia mista',
    lead: 'Mangiare vegano è più semplice di quanto sembri, ma diventa complicato quando in casa lo è solo una persona. Ecco come organizzare la settimana senza cucinare due cene.',
    summary: 'Proteine vegetali, organizzazione e alternative quando solo uno è vegano.',
    health: true,
    shot: {
      file: 'famiglia-dieta',
      alt: 'Scheda Dieta di una persona in Che cucino oggi? con l\'opzione Solo piatti vegani',
      caption: 'In Che cucino oggi? la dieta si imposta per ogni persona: qui «Solo piatti vegani».',
    },
    sections: [
      {
        h2: 'Le basi di un menù vegano equilibrato',
        html: `<p>Un'alimentazione vegana si regge su pochi pilastri da avere ogni giorno: <strong>cereali</strong> (pasta, riso, farro, pane), <strong>legumi</strong> (ceci, lenticchie, fagioli, piselli), <strong>verdure</strong> di più colori, <strong>frutta secca e semi</strong> e una buona fonte di grassi come l'olio extravergine. Per le proteine, l'abbinamento cereali e legumi (pasta e ceci, riso e piselli) è il classico che funziona; tofu, tempeh e seitan sono comodi per variare.</p>`,
      },
      {
        h2: 'Una settimana tipo',
        html: `<ul>
<li><strong>Lunedì:</strong> pasta e ceci, verdure al forno.</li>
<li><strong>Martedì:</strong> riso con piselli e curcuma, insalata mista.</li>
<li><strong>Mercoledì:</strong> zuppa di lenticchie con crostini.</li>
<li><strong>Giovedì:</strong> burger di fagioli con patate al forno.</li>
<li><strong>Venerdì:</strong> spaghetti al pomodoro e basilico, finocchi gratinati senza formaggio.</li>
<li><strong>Sabato:</strong> pizza con verdure grigliate.</li>
<li><strong>Domenica:</strong> lasagne di verdure con besciamella vegetale.</li>
</ul>
<p>La logica è sempre la stessa: un cereale, un legume, una verdura. Cucinare una volta sola legumi e cereali per due giorni (batch cooking) rende tutto più veloce.</p>`,
      },
      {
        h2: 'Cosa tenere d\'occhio',
        html: `<p>Chi segue una dieta vegana deve prestare attenzione a qualche nutriente, in particolare la <strong>vitamina B12</strong>, che va integrata, e a ferro, calcio e omega 3. Ne vale la pena parlare una volta con il medico o con un dietista, soprattutto per i bambini.</p>`,
      },
      {
        h2: 'Quando in casa lo è solo una persona',
        html: `<p>È il caso più comune. Invece di preparare due cene diverse, scegli piatti «a base vegana» a cui chi vuole può aggiungere: pasta al pomodoro con il formaggio a parte, riso e verdure con un secondo di carne per gli altri, zuppe di legumi con il parmigiano sul tavolo. Quando il piatto della famiglia non si può adattare, serve un'alternativa dedicata, comoda se pensata in anticipo.</p>`,
      },
      {
        h2: 'Come ti aiuta Che cucino oggi?',
        html: `<p>Nell'app puoi impostare <strong>«Solo piatti vegani»</strong> per una singola persona. Quando il piatto di tutti non va bene per lei o per lui, il menù propone nello stesso pasto un'alternativa vegana, e la lista della spesa conta le porzioni giuste. Se la dieta è per tutta la famiglia, la imposti una volta sola e il menù userà solo piatti adatti. Controlla comunque gli ingredienti dei prodotti confezionati: l'app è un aiuto, non una garanzia.</p>`,
      },
      { h2: 'Un\'ultima cosa', html: HEALTH_NOTE },
    ],
    faq: [
      {
        q: 'Un menù vegano è adatto ai bambini?',
        a: 'Può esserlo, ma richiede più attenzione ai nutrienti: è bene farsi seguire dal pediatra o da un dietista.',
      },
      {
        q: 'Come fare se solo una persona in famiglia è vegana?',
        a: 'Si scelgono piatti facili da adattare e, quando serve, si prevede per quella persona un piatto alternativo nello stesso pasto, invece di cucinare due cene.',
      },
      {
        q: 'Che proteine ci sono in un menù vegano?',
        a: 'Soprattutto legumi (ceci, lenticchie, fagioli, piselli, soia) abbinati ai cereali, più tofu, tempeh, seitan, frutta secca e semi.',
      },
    ],
    related: ['allergie-e-intolleranze-in-famiglia', 'menu-settimanale-famiglia', 'aggiungere-le-ricette-di-famiglia'],
  },
  {
    slug: 'menu-senza-glutine-celiachia',
    title: 'Menù senza glutine: come organizzare la settimana in famiglia',
    description:
      'Come organizzare i pasti senza glutine in famiglia: alimenti naturalmente senza glutine, contaminazione in cucina, etichette e come gestire il menù con un celiaco.',
    h1: 'Menù senza glutine in famiglia: come organizzare la settimana',
    lead: 'Quando in casa c\'è una persona celiaca, la cucina cambia: non solo cosa si compra, ma come si prepara. Ecco come tenere tutto sotto controllo senza complicarsi la vita.',
    summary: 'Cosa mangiare, come evitare le contaminazioni e come gestire un celiaco in famiglia.',
    health: true,
    shot: {
      file: 'menu-alternative',
      alt: 'Menù di Che cucino oggi? con un piatto alternativo per una persona con dieta diversa',
      caption: 'Quando il piatto di tutti non va bene per una persona, il menù propone un\'alternativa nello stesso pasto.',
    },
    sections: [
      {
        h2: 'Cosa significa «senza glutine»',
        html: `<p>Il glutine è una proteina presente in frumento, orzo e segale. Per le persone con celiachia anche tracce piccolissime fanno male, quindi non basta «togliere la pasta»: serve attenzione agli ingredienti e a come si cucina. Per informazioni affidabili e aggiornate, il riferimento è l'Associazione Italiana Celiachia e il medico che segue la persona.</p>`,
      },
      {
        h2: 'Cosa si può mangiare ogni giorno',
        html: `<p>Molti alimenti sono naturalmente senza glutine: <strong>riso, mais, patate, quinoa, miglio e grano saraceno</strong>, legumi, carne, pesce, uova, latticini non lavorati, frutta e verdura. Per pasta, pane e dolci esistono prodotti specifici senza glutine, riconoscibili dal simbolo della spiga barrata o dalla dicitura in etichetta.</p>
<ul>
<li>Piatti facili: risotti, polenta, patate al forno, frittate, carne o pesce con verdure.</li>
<li>Per la pasta: scegli formati senza glutine e cuocili in acqua dedicata.</li>
</ul>`,
      },
      {
        h2: 'La contaminazione in cucina',
        html: `<p>È il punto più importante quando solo una persona è celiaca. Per evitare il contatto con il glutine: usa pentole, colini e taglieri dedicati o ben lavati, tosta il pane del celiaco in un tostapane separato (o con gli appositi sacchetti), non intingere lo stesso cucchiaio in barattoli condivisi (burro, marmellata, spalmabili) e prepara prima il piatto senza glutine.</p>`,
      },
      {
        h2: 'Gli ingredienti «nascosti»',
        html: `<p>Il glutine compare dove non te lo aspetti: sughi pronti, dadi, salumi e insaccati, salse, zuppe in busta, impanature, besciamella, <em>surimi</em>, alcune spezie miste. La regola è sempre leggere l'etichetta, anche dei prodotti che compri da anni, perché le ricette cambiano.</p>`,
      },
      {
        h2: 'Il menù di tutta la famiglia, con una variante',
        html: `<p>La soluzione più semplice è scegliere piatti base già senza glutine (risotti, polenta, secondi con contorni di patate) e prevedere una variante solo dove serve, per esempio la pasta. In questo modo si cucina una volta sola e il celiaco non ha mai un piatto «a parte» diverso da quello degli altri.</p>`,
      },
      {
        h2: 'Come ti aiuta Che cucino oggi?',
        html: `<p>In Che cucino oggi? puoi impostare <strong>«Solo senza glutine»</strong> per una singola persona (o per tutta la famiglia). Il menù usa piatti adatti e, quando il piatto di tutti contiene glutine, propone per quella persona un'alternativa nello stesso pasto. Se aggiungi una ricetta di famiglia, l'app capisce dagli ingredienti se contiene glutine: è una stima, da controllare sempre. Le allergie e gli ingredienti da evitare non vengono mai proposti.</p>`,
      },
      { h2: 'Un\'ultima cosa', html: HEALTH_NOTE },
    ],
    faq: [
      {
        q: 'Cosa mangia un celiaco?',
        a: 'Alimenti naturalmente senza glutine come riso, mais, patate, legumi, carne, pesce, uova, frutta e verdura, più prodotti specifici senza glutine per pasta, pane e dolci.',
      },
      {
        q: 'Basta togliere la pasta per un menù senza glutine?',
        a: 'No: il glutine può essere in sughi, dadi, salumi e salse, e basta una contaminazione in cucina. Serve leggere le etichette e usare utensili puliti o dedicati.',
      },
      {
        q: 'Posso cucinare lo stesso menù per tutti?',
        a: 'Sì, se si scelgono piatti già senza glutine e si prevede una variante solo dove serve. Così si cucina una volta sola.',
      },
    ],
    related: ['allergie-e-intolleranze-in-famiglia', 'menu-senza-lattosio', 'menu-settimanale-famiglia'],
  },
  {
    slug: 'menu-senza-lattosio',
    title: 'Menù senza lattosio: organizzare i pasti di tutti i giorni',
    description:
      'Come organizzare un menù senza lattosio: dove si nasconde il lattosio, alimenti adatti, alternative e come gestire una persona intollerante in famiglia.',
    h1: 'Menù senza lattosio: come organizzare i pasti di tutti i giorni',
    lead: 'L\'intolleranza al lattosio è molto comune e, con qualche accorgimento, non rovina i pasti. Il segreto è sapere dove si nasconde il lattosio e avere alternative pronte.',
    summary: 'Dove si nasconde il lattosio, cosa scegliere e come gestire chi è intollerante in famiglia.',
    health: true,
    shot: {
      file: 'spesa',
      alt: 'Lista della spesa di Che cucino oggi? divisa per reparto del supermercato',
      caption: 'Con una lista della spesa per reparto è più facile controllare etichette e alternative.',
    },
    sections: [
      {
        h2: 'Intolleranza e allergia non sono la stessa cosa',
        html: `<p>L'intolleranza al lattosio dipende dalla difficoltà a digerire lo zucchero del latte, e provoca disturbi digestivi. L'allergia alle proteine del latte è un'altra cosa, più seria, e richiede attenzione assoluta. Se hai dubbi su quale delle due riguarda la tua famiglia, chiedi al medico prima di tutto.</p>`,
      },
      {
        h2: 'Dove si trova il lattosio',
        html: `<p>Oltre a latte, panna, burro e yogurt, il lattosio compare in molti prodotti lavorati: pane e prodotti da forno confezionati, salumi, sughi e salse pronte, zuppe in busta, purè istantaneo, dolci e merendine. Per questo conviene leggere le etichette cercando «latte», «siero di latte» o «lattosio».</p>`,
      },
      {
        h2: 'Cosa scegliere',
        html: `<ul>
<li><strong>Latte e yogurt delattosati</strong>, oppure bevande vegetali (soia, avena, riso, mandorla).</li>
<li><strong>Formaggi molto stagionati</strong> come il parmigiano: contengono di norma pochissimo lattosio, ma la tolleranza è personale.</li>
<li><strong>Olio extravergine</strong> al posto del burro per soffritti e condimenti.</li>
<li>Carne, pesce, uova, legumi, cereali, frutta e verdura sono naturalmente senza lattosio.</li>
</ul>`,
      },
      {
        h2: 'Un menù facile da adattare',
        html: `<p>Molti piatti italiani non hanno bisogno del latte: pasta al pomodoro, risotti con olio, secondi di carne o pesce, minestre di verdure e legumi. Dove serve, basta una variante: il parmigiano a parte, una besciamella con latte delattosato, uno yogurt vegetale al posto di quello normale.</p>`,
      },
      {
        h2: 'Come ti aiuta Che cucino oggi?',
        html: `<p>Imposta <strong>«Solo senza lattosio»</strong> per una persona e, quando il piatto di tutti contiene latticini, il menù le prepara un'alternativa nello stesso pasto. Per le allergie al latte indica «Latte» tra le allergie: non verrà mai proposto un piatto che lo contiene. La lista della spesa, divisa per reparto, ti aiuta a controllare con calma le etichette.</p>`,
      },
      { h2: 'Un\'ultima cosa', html: HEALTH_NOTE },
    ],
    faq: [
      {
        q: 'Il parmigiano contiene lattosio?',
        a: 'I formaggi molto stagionati contengono di norma pochissimo lattosio, ma la tolleranza varia da persona a persona: se hai dubbi, chiedi al medico.',
      },
      {
        q: 'Con quale ingrediente sostituisco il burro?',
        a: 'Per i soffritti e i condimenti l\'olio extravergine d\'oliva; per i dolci esistono burri senza lattosio o margarine vegetali.',
      },
      {
        q: 'Dove trovo lattosio senza saperlo?',
        a: 'In pane confezionato, salumi, sughi pronti, zuppe in busta, purè istantaneo e dolci: leggi sempre le etichette.',
      },
    ],
    related: ['allergie-e-intolleranze-in-famiglia', 'menu-senza-glutine-celiachia', 'lista-della-spesa-famiglia'],
  },
  {
    slug: 'allergie-e-intolleranze-in-famiglia',
    title: 'Allergie e intolleranze in famiglia: come organizzare cucina e menù',
    description:
      'Come gestire allergie e intolleranze alimentari in famiglia: differenze, 14 allergeni da conoscere, organizzazione della cucina e un menù che le rispetta.',
    h1: 'Allergie e intolleranze in famiglia: come organizzare cucina e menù',
    lead: 'Quando una persona di casa ha un\'allergia o un\'intolleranza, ogni pasto richiede attenzione. Con un po\' di organizzazione, però, si mangia tutti insieme e in sicurezza.',
    summary: 'Allergia, intolleranza o celiachia: cosa cambia e come organizzare casa e menù.',
    health: true,
    shot: {
      file: 'famiglia-dieta',
      alt: 'Scheda di una persona in Che cucino oggi? con diete e allergie personali',
      caption: 'Diete e allergie si indicano per ogni persona: il menù non le propone mai.',
    },
    sections: [
      {
        h2: 'Allergia, intolleranza, celiachia: le differenze',
        html: `<p>Sono tre cose diverse. L'<strong>allergia</strong> coinvolge il sistema immunitario e può essere pericolosa anche con quantità minime. L'<strong>intolleranza</strong> (per esempio al lattosio) provoca soprattutto disturbi digestivi e spesso dipende dalla quantità. La <strong>celiachia</strong> è una malattia autoimmune legata al glutine, che richiede una dieta rigorosa per tutta la vita. La diagnosi spetta sempre al medico.</p>`,
      },
      {
        h2: 'I 14 allergeni da conoscere',
        html: `<p>In Europa le etichette devono evidenziare 14 allergeni: cereali contenenti glutine, crostacei, uova, pesce, arachidi, soia, latte, frutta a guscio, sedano, senape, semi di sesamo, anidride solforosa e solfiti, lupini e molluschi. Sapere quali sono aiuta a leggere le etichette e a fare attenzione ai prodotti confezionati.</p>`,
      },
      {
        h2: 'Come organizzare la cucina',
        html: `<ul>
<li>Leggi sempre l'etichetta, anche dei prodotti già comprati altre volte: gli ingredienti cambiano.</li>
<li>Usa utensili, taglieri e pentole ben lavati o dedicati, per evitare contaminazioni.</li>
<li>Prepara prima il piatto per chi ha l'allergia e coprilo.</li>
<li>Tieni in dispensa una scorta di alternative sicure.</li>
<li>Spiega a tutti in casa, bambini compresi, cosa può e non può mangiare chi ha un'allergia.</li>
</ul>`,
      },
      {
        h2: 'Un menù per tutti, con una variante',
        html: `<p>La soluzione più semplice è partire da piatti adatti a tutti e prevedere una variante solo per chi ne ha bisogno, invece di cucinare due cene diverse. È più comodo, e il «piatto diverso» pesa meno a chi lo deve mangiare, soprattutto ai bambini.</p>`,
      },
      {
        h2: 'Come ti aiuta Che cucino oggi?',
        html: `<p>In Che cucino oggi? indichi <strong>per ogni persona</strong> dieta, allergie e ingredienti che non ama. Le allergie e gli ingredienti da evitare <strong>non vengono mai proposti</strong>: nemmeno quando restano poche ricette. Se il piatto di tutti non va bene per qualcuno, il menù propone un'alternativa nello stesso pasto e la lista della spesa conta le porzioni di ciascuno. Se il tuo piatto non c'è, puoi <a href="/aggiungere-le-ricette-di-famiglia">aggiungere le ricette di famiglia</a> e l'app capisce da sola cosa contengono.</p>`,
      },
      { h2: 'Un\'ultima cosa', html: HEALTH_NOTE },
    ],
    faq: [
      {
        q: 'Qual è la differenza tra allergia e intolleranza alimentare?',
        a: 'L\'allergia coinvolge il sistema immunitario e può essere pericolosa anche con quantità minime, l\'intolleranza provoca soprattutto disturbi digestivi e spesso dipende dalla quantità.',
      },
      {
        q: 'Posso fidarmi dell\'app per un\'allergia grave?',
        a: 'L\'app non propone mai gli ingredienti che indichi come allergie, ma non sostituisce il medico: controlla sempre le etichette dei prodotti che compri.',
      },
      {
        q: 'Come cucinare per una famiglia dove solo una persona è allergica?',
        a: 'Con piatti adatti a tutti e una variante per chi ha l\'allergia, usando utensili puliti o dedicati per evitare contaminazioni.',
      },
    ],
    related: ['menu-senza-glutine-celiachia', 'menu-senza-lattosio', 'menu-vegano-settimanale'],
  },
  {
    slug: 'lista-della-spesa-famiglia',
    title: 'Lista della spesa per la famiglia: come farla bene e risparmiare',
    description:
      'Come fare la lista della spesa di famiglia: parti dal menù, sottrai la dispensa, ordina per reparto e condividila. Consigli per risparmiare e non sprecare cibo.',
    h1: 'Lista della spesa per la famiglia: come farla bene e risparmiare',
    lead: 'Una buona lista della spesa fa risparmiare tempo e denaro. Il trucco è non farla a memoria, ma partire dal menù e da quello che hai già in casa.',
    summary: 'Parti dal menù, togli la dispensa, ordina per reparto: risparmi tempo e spesa.',
    shot: {
      file: 'spesa',
      alt: 'Lista della spesa di Che cucino oggi? ordinata per reparto con pulsanti PDF e WhatsApp',
      caption: 'La lista della spesa per reparto, con esportazione in PDF e condivisione su WhatsApp.',
    },
    sections: [
      {
        h2: 'Parti dal menù, non dagli scaffali',
        html: `<p>Il primo errore è fare la lista guardando cosa «manca» in casa: si comprano cose che piacciono ma non servono a nessun pasto. Fai l'opposto: decidi prima il <a href="/menu-settimanale-famiglia">menù della settimana</a>, poi elenca gli ingredienti necessari, quindi togli quello che hai già. Quello che resta è la tua spesa.</p>`,
      },
      {
        h2: 'Togli quello che hai già in dispensa',
        html: `<p>Prima di uscire controlla dispensa, frigo e congelatore. Le quantità contano: se la ricetta chiede 500 g di pomodori e ne hai 200, devi comprarne 300, non 500. Una <a href="/dispensa-e-spreco-alimentare">dispensa tenuta aggiornata</a> rende questo passaggio immediato.</p>`,
      },
      {
        h2: 'Ordina la lista per reparto',
        html: `<p>Raggruppa i prodotti come sono disposti nel supermercato: ortofrutta, macelleria e pescheria, latticini, panetteria, surgelati, bevande, dispensa. Si cammina meno, si dimentica meno e si cede meno alle tentazioni fuori lista. Metti i prodotti freschi e surgelati alla fine, per tenerli al fresco più a lungo.</p>`,
      },
      {
        h2: 'Qualche abitudine che fa risparmiare',
        html: `<ul>
<li>Fai la spesa grossa una volta a settimana e solo piccoli rifornimenti di fresco nel mezzo.</li>
<li>Non andare a fare la spesa affamato.</li>
<li>Guarda i volantini <em>dopo</em> aver scritto il menù, per sfruttare le offerte sugli ingredienti che ti servono davvero.</li>
<li>Condividi la lista con il partner, così non si compra due volte la stessa cosa.</li>
</ul>`,
      },
      {
        h2: 'Come la prepara Che cucino oggi?',
        html: `<p>Una volta creato il menù, la lista della spesa è già pronta: l'app somma gli ingredienti di tutti i piatti, tiene conto delle porzioni e <strong>toglie quello che hai in dispensa</strong>. La lista si vede per reparto o tutta insieme, si può scaricare in PDF o mandare su WhatsApp (nel piano Famiglia), e puoi aggiungere a mano o a voce quello che serve al di fuori del menù. Se in casa ci sono persone con diete diverse, le porzioni tengono già conto dei piatti alternativi.</p>`,
      },
    ],
    faq: [
      {
        q: 'Come si fa una lista della spesa per una famiglia?',
        a: 'Si parte dal menù della settimana, si elencano gli ingredienti, si tolgono quelli già in dispensa e si ordina il resto per reparto del supermercato.',
      },
      {
        q: 'Ogni quanto conviene fare la spesa?',
        a: 'Una spesa grossa a settimana, più piccoli rifornimenti di frutta e verdura fresche: si riducono viaggi e acquisti d\'impulso.',
      },
      {
        q: 'Posso condividere la lista con il partner?',
        a: 'Sì: in Che cucino oggi? la lista si manda su WhatsApp o si scarica in PDF (piano Famiglia).',
      },
    ],
    related: ['dispensa-e-spreco-alimentare', 'menu-settimanale-famiglia', 'menu-senza-lattosio'],
  },
  {
    slug: 'dispensa-e-spreco-alimentare',
    title: 'Dispensa e spreco alimentare: come tenere in ordine ciò che hai in casa',
    description:
      'Come organizzare la dispensa per sprecare meno cibo: regola del «primo dentro, primo fuori», scadenze, cosa cucinare con ciò che hai e come tenere traccia delle scorte.',
    h1: 'Dispensa e spreco alimentare: come tenere in ordine ciò che hai in casa',
    lead: 'Una parte del cibo che compriamo finisce nella spazzatura perché non ci ricordiamo di averlo. Una dispensa in ordine fa risparmiare e rende più facile decidere cosa cucinare.',
    summary: 'Scorte in ordine, scadenze sotto controllo e idee con quello che hai già.',
    shot: {
      file: 'dispensa',
      alt: 'Dispensa di Che cucino oggi? con prodotti e quantità',
      caption: 'La dispensa in Che cucino oggi?: cosa hai in casa e in che quantità.',
    },
    sections: [
      {
        h2: 'La regola del «primo dentro, primo fuori»',
        html: `<p>Quando rientri con la spesa, metti i prodotti nuovi <strong>dietro</strong> e quelli più vecchi <strong>davanti</strong>. È la regola più semplice contro le scadenze dimenticate, e vale per dispensa, frigo e congelatore. Dedica a un ripiano del frigo gli alimenti da consumare per primi: sarà la prima cosa che vedi quando ti chiedi cosa mangiare.</p>`,
      },
      {
        h2: 'Scadenze: «da consumarsi entro» e «da consumarsi preferibilmente entro»',
        html: `<p>Sono due cose diverse. «Da consumarsi entro» indica una data di sicurezza, da rispettare (alimenti freschi come latte e carne). «Da consumarsi preferibilmente entro» indica una data di qualità: dopo, il prodotto può essere ancora buono (pasta, riso, scatolame). Controllare l'aspetto e l'odore prima di buttare evita molti sprechi inutili.</p>`,
      },
      {
        h2: 'Cucina prima quello che hai',
        html: `<p>Prima di scegliere i piatti, guarda cosa c'è: una confezione di ceci, mezzo cavolfiore e del riso sono già una cena. Mettere al centro del menù gli ingredienti che hai in casa è il modo più efficace per sprecare meno e comprare meno.</p>`,
      },
      {
        h2: 'Tieni traccia delle scorte',
        html: `<p>Basta una lista aggiornata di quello che hai: prodotto, quantità, unità. Quando cucini, scala quello che usi. Con la lista sempre allineata la <a href="/lista-della-spesa-famiglia">spesa</a> diventa precisa e il frigo smette di nascondere sorprese.</p>`,
      },
      {
        h2: 'Come aiuta Che cucino oggi?',
        html: `<p>Nell'app aggiungi i prodotti con quantità e unità, e quando cuci un piatto le quantità si aggiornano da sole. Il menù dà priorità alle ricette che usano ciò che hai già, e una sezione ti mostra <strong>cosa puoi cucinare adesso</strong> con la dispensa che hai. Il confronto tra menù e dispensa dice solo cosa manca: così compri il necessario e basta. Nel piano Gratis puoi tenere fino a 20 prodotti, in Famiglia nessun limite.</p>`,
      },
    ],
    faq: [
      {
        q: 'Come organizzare la dispensa per non sprecare cibo?',
        a: 'Con la regola «primo dentro, primo fuori», un ripiano per ciò che va consumato per primo e una lista aggiornata delle scorte.',
      },
      {
        q: 'Che differenza c\'è tra «da consumarsi entro» e «preferibilmente entro»?',
        a: 'La prima è una data di sicurezza, da rispettare; la seconda è una data di qualità: dopo, il prodotto può essere ancora buono.',
      },
      {
        q: 'L\'app aggiorna da sola la dispensa?',
        a: 'Quando segni che hai cucinato un piatto, le quantità degli ingredienti usati si scalano dalla dispensa.',
      },
    ],
    related: ['lista-della-spesa-famiglia', 'menu-settimanale-famiglia', 'aggiungere-le-ricette-di-famiglia'],
  },
  {
    slug: 'aggiungere-le-ricette-di-famiglia',
    title: 'Ricette di famiglia: come salvarle e capire cosa contengono',
    description:
      'Come salvare le ricette di famiglia in un\'app e capire subito ingredienti, glutine, lattosio e adatto a vegani: scrivi il nome e Che cucino oggi? fa il resto.',
    h1: 'Ricette di famiglia: come salvarle e capire cosa contengono',
    lead: 'Le ricette di casa sono scritte a mente o su fogli ingialliti. Metterle in un posto sicuro è un regalo per chi verrà dopo, e le rende utilizzabili nel menù di ogni settimana.',
    summary: 'Scrivi il nome del piatto: l\'app riconosce gli ingredienti e a chi è adatto.',
    shot: {
      file: 'piatto-nuovo',
      alt: 'Schermata Aggiungi un piatto in Che cucino oggi? con ingredienti riconosciuti',
      caption: 'Scrivi il nome del piatto e cosa c\'è dentro: gli ingredienti si riconoscono e si correggono.',
    },
    sections: [
      {
        h2: 'Perché salvare le ricette di casa',
        html: `<p>Le ricette di nonna e di mamma raramente hanno quantità precise: «un pugno di», «quanto basta», «a occhio». Raccoglierle, anche in modo approssimato, evita che vadano perse e permette di rifarle uguali. Un piatto salvato può entrare nel menù della settimana insieme a tutti gli altri.</p>`,
      },
      {
        h2: 'Come scrivere una ricetta che funziona',
        html: `<ol>
<li><strong>Il nome e la porzione:</strong> per quante persone è, più o meno.</li>
<li><strong>Gli ingredienti con una quantità indicativa:</strong> anche solo «circa 300 g».</li>
<li><strong>I passaggi in poche frasi:</strong> basta l'ordine delle operazioni.</li>
<li><strong>Una nota sulle esigenze:</strong> contiene glutine, latte, uova, frutta a guscio?</li>
</ol>`,
      },
      {
        h2: 'Capire a chi è adatto un piatto',
        html: `<p>Il passaggio che si dimentica più spesso è chiedersi se il piatto va bene per tutti. Dagli ingredienti si capisce molto: pasta, farina e pangrattato indicano glutine; latte, burro, formaggi e panna indicano lattosio; carne, pesce, uova e miele escludono il piatto vegano. Segnarlo una volta sola ti evita ogni volta di rifare il ragionamento quando cucini per più persone.</p>`,
      },
      {
        h2: 'Come ti aiuta Che cucino oggi?',
        html: `<p>Nella scheda di una persona, sotto «Piatti», tocca <strong>«Il suo piatto non c'è? Aggiungilo»</strong>: scrivi il nome e, se vuoi, cosa c'è dentro a parole tue (per esempio «sfoglie di lasagna, ragù, besciamella, parmigiano»). L'app riconosce gli ingredienti con quantità e unità, e puoi correggerli. Con il piano Chef IA, per i piatti di cui sai solo il nome, l'intelligenza artificiale propone ingredienti e quantità. Dagli ingredienti l'app capisce se il piatto è vegano, senza glutine o senza lattosio e lo tiene presente quando prepara le alternative per chi ha esigenze diverse. È una stima: va sempre controllata.</p>`,
      },
    ],
    faq: [
      {
        q: 'Posso aggiungere le mie ricette a Che cucino oggi?',
        a: 'Sì: scrivi il nome del piatto e cosa c\'è dentro, e gli ingredienti vengono riconosciuti e resi modificabili. Il piatto entra nel menù insieme agli altri.',
      },
      {
        q: 'L\'app capisce se un piatto è senza glutine?',
        a: 'Lo stima dagli ingredienti, e ti mostra il risultato per controllarlo: non sostituisce la lettura delle etichette.',
      },
      {
        q: 'Quanti piatti posso riconoscere con l\'intelligenza artificiale?',
        a: 'Ogni mese ci sono 3 riconoscimenti di prova nei piani Gratis e Famiglia e 50 nel piano Chef IA. Scrivere gli ingredienti a mano è sempre illimitato.',
      },
    ],
    related: ['allergie-e-intolleranze-in-famiglia', 'menu-vegano-settimanale', 'dispensa-e-spreco-alimentare'],
  },
];

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const stripHtml = (s: string) => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

/** Testo della pagina senza tag (per controllare la lunghezza e per le anteprime). */
export const pageText = (page: GuidePage): string =>
  stripHtml([page.lead, ...page.sections.map((s) => s.h2 + ' ' + s.html), ...page.faq.map((f) => f.q + ' ' + f.a)].join(' '));

export function renderGuideLinks(): string {
  return PAGES.map((p) => `<a href="/${p.slug}"><strong>${esc(p.h1.replace(/:.*$/, ''))}</strong><span>${esc(p.summary)}</span></a>`).join('\n          ');
}

export function renderPage(page: GuidePage, siteUrl: string, appUrl: string): string {
  const url = `${siteUrl}/${page.slug}`;
  const related = page.related
    .map((slug) => PAGES.find((p) => p.slug === slug))
    .filter((p): p is GuidePage => !!p)
    .map((p) => `<a href="/${p.slug}"><strong>${esc(p.h1.replace(/:.*$/, ''))}</strong><span>${esc(p.summary)}</span></a>`)
    .join('\n          ');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: page.h1,
        description: page.description,
        inLanguage: 'it',
        mainEntityOfPage: url,
        image: `${siteUrl}/img/${page.shot?.file ?? 'menu'}.webp`,
        author: { '@type': 'Organization', name: 'Che cucino oggi?' },
        publisher: { '@type': 'Organization', name: 'Che cucino oggi?', logo: { '@type': 'ImageObject', url: `${siteUrl}/icon-512.png` } },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Che cucino oggi?', item: `${siteUrl}/` },
          { '@type': 'ListItem', position: 2, name: page.h1, item: url },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: page.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
    ],
  };
  return `<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="google-site-verification" content="Tl9as-TuakdQI-j2nG1QtSZ7vNQ_9Dpq3q-PS2Q0Gp0" />
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(page.title)} | Che cucino oggi?</title>
  <meta name="description" content="${esc(page.description)}">
  <link rel="canonical" href="${url}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta name="theme-color" content="#c8440f">
  <meta property="og:type" content="article">
  <meta property="og:locale" content="it_IT">
  <meta property="og:site_name" content="Che cucino oggi?">
  <meta property="og:title" content="${esc(page.title)}">
  <meta property="og:description" content="${esc(page.description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${siteUrl}/img/${page.shot?.file ?? 'menu'}.webp">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="preload" href="/fonts/fraunces.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/site.css">
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body>
  <header>
    <div class="wrap bar">
      <a class="brand" href="/" aria-label="Che cucino oggi? - pagina iniziale"><img src="/icon-192.png" alt="" width="36" height="36">Che cucino oggi?</a>
      <nav aria-label="Principale">
        <a href="/#funzioni">Funzioni</a>
        <a href="/#guide">Guide</a>
        <a href="/#piani">Piani</a>
        <a href="/#installa">Scarica</a>
      </nav>
    </div>
  </header>
  <main class="wrap">
    <p class="crumbs"><a href="/">Che cucino oggi?</a> › <a href="/#guide">Guide</a></p>
    <article class="prose">
      <h1>${esc(page.h1)}</h1>
      <p class="lead">${page.lead}</p>
      ${
        page.shot
          ? `<figure><img src="/img/${page.shot.file}.webp" width="560" height="1212" loading="lazy" alt="${esc(page.shot.alt)}"><figcaption>${esc(page.shot.caption)}</figcaption></figure>`
          : ''
      }
      ${page.sections.map((s) => `<h2>${esc(s.h2)}</h2>\n      ${s.html}`).join('\n      ')}
      <div class="box">
        <h2>Prova Che cucino oggi?</h2>
        <p>Il menù della settimana, la lista della spesa e la dispensa in un'unica app, con diete e allergie di ogni persona. Gratis per cominciare, con 7 giorni di prova dei piani a pagamento.</p>
        <div class="cta">
          <a class="btn btn-primary" href="/#installa">⬇ Scarica per Android</a>
          <a class="btn btn-ghost" href="${appUrl}">Usa nel browser</a>
        </div>
      </div>
      <h2>Domande frequenti</h2>
      ${page.faq.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('\n      ')}
      <h2>Guide correlate</h2>
      <div class="guide-grid">
          ${related}
      </div>
    </article>
  </main>
  <footer>
    <div class="wrap">
      <span>© <span id="year">2026</span> Che cucino oggi?</span>
      <span><a href="/">Home</a> · <a href="/privacy">Privacy</a> · <a href="${appUrl}">Versione nel browser</a></span>
    </div>
  </footer>
  <script>document.getElementById('year').textContent = new Date().getFullYear();</script>
</body>
</html>
`;
}
