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
    id: '2026-10-13-modifica-piatti',
    date: '13 ottobre 2026',
    title: 'Correggi i piatti del tuo menù',
    items: [
      { emoji: '✏️', title: 'Modifica un piatto senza rifarlo', text: 'Quando scrivi il tuo menù, accanto a ogni piatto c\'è «Modifica»: cambi nome, ingredienti, quantità e preparazione senza cancellare e ricreare.' },
      { emoji: '📖', title: 'Anche i piatti dell\'app', text: 'Puoi correggere pure un piatto che già esiste: l\'app ne salva una versione tua e l\'originale resta com\'è. Dall\'elenco, tocca la matita prima di aggiungerlo.' },
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
