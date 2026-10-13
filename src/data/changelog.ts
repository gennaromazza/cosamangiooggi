/**
 * Novità dell'app, dalla più recente alla più vecchia.
 * Da aggiornare a ogni rilascio: aggiungi una voce IN CIMA con un `id` nuovo. Chi aggiorna vede la schermata "Novità"
 * una volta sola, con tutte le voci uscite dall'ultima volta che l'ha vista.
 */
export interface NewsItem {
  emoji: string;
  title: string;
  text: string;
}

export interface NewsEntry {
  id: string;
  date: string;
  title: string;
  items: NewsItem[];
}

export const CHANGELOG: NewsEntry[] = [
  {
    id: '2026-10-14-spesa-vegani',
    date: '14 ottobre 2026',
    title: 'Spesa più ordinata, niente piatti vegani a sorpresa',
    items: [
      { emoji: '🛒', title: 'Ogni ingrediente una volta sola', text: 'Nella lista della spesa lo stesso ingrediente non si ripete più: se serve in più piatti, anche con misure diverse (spicchi, grammi, cucchiai), le quantità si sommano in una riga.' },
      { emoji: '🌱', title: 'Piatti vegani solo se serve', text: 'Tofu, seitan e piatti «vegani» compaiono nel menù solo se hai scelto la dieta vegana. Chi ha una dieta vegana personale riceve comunque la sua alternativa.' },
    ],
  },
  {
    id: '2026-10-14-colazione-merende',
    date: '14 ottobre 2026',
    title: 'Colazione e merende nel menù',
    items: [
      { emoji: '☕', title: 'Cinque pasti al giorno', text: 'In «Famiglia», «Colazione e merende»: il menù comprende anche la colazione, uno spuntino di metà mattina e la merenda, sempre adatti a tutti.' },
      { emoji: '🍎', title: 'Dentro il tuo limite di calorie', text: 'Se hai attivato il limite, ogni pasto resta nella sua parte: colazione 15%, spuntini 5%, pranzo 40%, cena 35%. Il giorno mostra il totale e te lo dice se lo supera.' },
      { emoji: '🔁', title: 'Cambiali quando vuoi', text: 'Tocca la freccia accanto a un piatto per sostituirlo. Colazione e merende compaiono anche nel menù condiviso, nei promemoria e nella spesa.' },
      { emoji: '✍️', title: 'Anche nel menù scritto a mano', text: 'Se scrivi tu il menù, trovi i campi per colazione e merende.' },
    ],
  },
  {
    id: '2026-10-13-calorie',
    date: '13 ottobre 2026',
    title: 'Un limite di calorie al giorno',
    items: [
      { emoji: '🔥', title: 'Scegli il tuo limite', text: 'In «Famiglia», «Calorie al giorno»: attivi il limite (di solito 2000 kcal a persona) e il menù lo rispetta, contando anche colazione e due merende.' },
      { emoji: '📊', title: 'Le calorie di ogni giorno', text: 'Nel menù, sotto ogni giorno, vedi le calorie a persona di pranzo e cena e quanto manca al limite. Se un giorno lo supera, te lo diciamo.' },
      { emoji: '✍️', title: 'Anche nel tuo menù', text: 'Se scrivi tu il menù, vedi subito le calorie di ogni giorno mentre aggiungi i piatti.' },
    ],
  },
  {
    id: '2026-10-13-modifica-piatti',
    date: '13 ottobre 2026',
    title: 'Correggi i piatti del tuo menù',
    items: [
      { emoji: '✏️', title: 'Modifica un piatto senza rifarlo', text: 'Quando scrivi il tuo menù, accanto a ogni piatto c\'è «Modifica»: cambi nome, ingredienti, quantità e preparazione senza cancellare e ricreare.' },
      { emoji: '📖', title: 'Anche i piatti dell\'app', text: 'Puoi correggere pure un piatto che già esiste: l\'app ne salva una versione tua e l\'originale resta com\'è. Dall\'elenco, tocca la matita prima di aggiungerlo.' },
      { emoji: '✅', title: 'Sei sull\'ultima versione?', text: 'In «Il mio account», «Versione dell\'app» ti dice se hai l\'ultima versione o se ce n\'è una più nuova da scaricare, con il pulsante per farlo.' },
    ],
  },
  {
    id: '2026-10-12-schede',
    date: '12 ottobre 2026',
    title: 'Più facile gestire chi mangia a tavola',
    items: [
      { emoji: '👤', title: 'La scheda di ogni persona', text: 'In «Famiglia» tocca una persona: si apre una scheda a tutto schermo con gusti, allergie, assaggi e invito. Per tornare indietro c\'è la freccia in alto.' },
      { emoji: '✨', title: 'Questa schermata', text: 'Ogni volta che l\'app si aggiorna ti raccontiamo cosa c\'è di nuovo. Puoi rivederla da «Il mio account» → «Novità dell\'app».' },
    ],
  },
  {
    id: '2026-10-12-menu-casa',
    date: '12 ottobre 2026',
    title: 'Il menù di casa si condivide',
    items: [
      { emoji: '🔗', title: 'Condividi il menù', text: 'Dal menù tocca «Condividi menu» e manda il link su WhatsApp: chi lo apre vede pranzo e cena della settimana, con le ricette, senza installare nulla né creare un account. Non vede mai persone, allergie o preferenze.' },
      { emoji: '👪', title: 'Collega i familiari', text: 'Chi ha l\'app inserisce il codice in «Famiglia» e trova «Menù di casa» in sola lettura, sempre aggiornato. Chi gestisce può annullare il link e scollegare le persone.' },
      { emoji: '🔔', title: 'Notifiche del menù', text: 'Su Android ricevi ogni giorno il menù di oggi, all\'orario che scegli tu. Si attivano e si spengono da «Il mio account», solo per il tuo telefono.' },
      { emoji: '✍️', title: 'Scrivi tu il menù', text: 'Segui già una dieta? Dal menù, tra le opzioni, scegli «Scrivi il tuo menù»: l\'app lo usa così com\'è, senza cambiarlo.' },
    ],
  },
  {
    id: '2026-10-10-gusti',
    date: '10 ottobre 2026',
    title: 'Gusti di tutti, menù per tutti',
    items: [
      { emoji: '🍽️', title: 'Il gioco degli assaggi', text: 'Nella scheda di una persona, «Assaggi»: ti proponiamo dei piatti e tocchi «mi piace» o «non mi piace». Il menù impara i gusti.' },
      { emoji: '🧑‍🍳', title: 'Ceniamo tutti insieme', text: 'Quando serve un piatto che vada bene a tutti, il menù sceglie quello giusto e prepara l\'alternativa per chi non può mangiarlo.' },
      { emoji: '✉️', title: 'Fai compilare ai familiari', text: 'Manda un link a una persona: compila da sola allergie e gusti dal suo telefono, senza app né account.' },
      { emoji: '📱', title: 'Anche su iPhone', text: 'Apri il sito in Safari e aggiungi l\'app alla schermata Home.' },
    ],
  },
];

export const LATEST_NEWS_ID = CHANGELOG[0].id;
