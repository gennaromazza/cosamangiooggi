/** Reparti del supermercato per la lista della spesa. */
export type DepartmentId =
  | 'ortofrutta'
  | 'macelleria'
  | 'latticini'
  | 'pane'
  | 'surgelati'
  | 'bevande'
  | 'dispensa'
  | 'altro';

// Le parole devono iniziare dove inizia una parola: 'pera' non deve trovare 'peperoni', 'riso' non 'rischio'.
const rule = (words: string) => new RegExp(`(?:^|[^a-zà-ú])(?:${words})`);

// L'ordine conta: i prodotti conservati vanno prima di quelli freschi
// ('passata di pomodoro' non è ortofrutta, 'latte di cocco' non è un latticino, 'tonno in scatola' non è macelleria).
const RULES: [DepartmentId, RegExp][] = [
  // Casi particolari prima di tutto: il nome contiene una parola che da sola porterebbe nel reparto sbagliato
  ['ortofrutta', rule('piselli fresch|succo di limone|succo di lime|succo di arancia|succo d.arancia|succo filtrato|scorza|limone|lime\\b|frutti di bosco|erbe aromatiche|erbe fresche')],
  ['macelleria', rule('carne per brodo|pesce per brodo|aromi per pesce|tonno fresco|trancio di tonno')],
  ['latticini', rule("tagliatelle all'uovo|pasta fresca|pasta all'uovo|tortellini|tortelli|ravioli|gnocchi")],
  ['surgelati', rule('surgelat|congelat|gelato|frozen|sottozero|piselli|spinaci in blocchi')],
  [
    'dispensa',
    rule(
      "lievito di birra|lievito per|lievito istantaneo|lievito alimentare|sale marino|sale grosso|sale fino|olio|pesto|fecola|tahin|miso|cornflakes|uvetta|mais|sorgo|strutto|ragù|ragu|passata|pelati|polpa di pomodor|concentrato|sugo|conserva|in scatola|scatola|barattolo|sott'olio|sottolio|sottaceti|latte di cocco|latte condensato|latte in polvere|brodo|dado|pangrattato|pan grattato|pane grattugiato|olive|oliva|capperi|acciughe|alici sotto|tonno in|tonno sott|tonno sgocciolato|tonno al naturale|tonno$|pasta|spaghett|penne|rigatoni|fusilli|farfalle|tagliatelle|trofie|ditalini|pici|orecchiette|linguine|bucatini|maccheroni|paccheri|sedani|mezze maniche|fregola|granola|sciroppo|sfoglia per lasagne|sfoglie per lasagne|cous ?cous|quinoa|semola|origano|maggiorana|alloro|cannella|curcuma|paprika|zafferano|noce moscata|cumino|curry|vaniglia|peperoncino secco|fiocchi",
    ),
  ],
  ['bevande', rule('acqua|vino|birra|succo\\b|succhi|bibita|bibite|coca cola|aranciata|gassosa|chinotto|spumante|sidro|limonata|aperitivo|aperol|prosecco')],
  ['latticini', rule("mozzarell|stracciatella|tortellini|tortelli|ravioli|gnocchi|tagliatelle all'uovo|pasta fresca|pasta all'uovo")],
  ['pane', rule('freselle|fresella|focaccia|pizza|piadina|piadine|pancarrè|pancarre|panbauletto|fette biscottate|panino|panini|mollica|pane|piada|schiacciata|taralli|sfogliatina|bignè|torta|crostata|cornett|crostini|sfilatini|ciabattin')],
  ['macelleria', rule('pollo|tacchino|manzo|maiale|vitello|agnello|salsiccia|salsicce|pancetta|guanciale|prosciutto|salame|bresaola|pesce|salmone|tonno|merluzzo|gamber|scamp|calamar|vongol|cozze|branzino|orata|sarde|alici|sogliola|carne|macinato|petto|lonza|bistecca|hamburger|affettat|quaglia|coniglio|fesa|spezzatino|fettine|straccetti|scottona|lacerto|cinghiale|fegato|rana|wurstel|speck|mortadella|polpo|seppie|frutti di mare|filett|coppa|culatello|polpettine')],
  ['latticini', rule('latte|burro|formaggi|formaggio|parmigiano|grana|ricotta|panna|yogurt|uovo|uova|tuorl|mascarpone|gorgonzola|pecorino|caprino|provola|stracchino|taleggio|tofu|seitan|tempeh|hummus|lievito fresco|margarina|philadelphia|caciotta|fontina|emmental|edamer|scamorza|burrata|feta|bocconcini')],
  ['ortofrutta', rule('mela|mele|banana|banane|limon|aranci|cipoll|scalogno|pomodor|insalat|zucchin|carot|patat|aglio|spinaci|fung|basilico|prezzemolo|rucola|menta|melanzan|zucca|peperon|broccol|cavolfior|cavolo|cavolini|cavoletti|verza|scarola|bieta|barbabietola|rapa|cime di rapa|friarielli|germogli|lattuga|erbette|fragol|kiwi|avocado|pera|pere|pesca|pesche|albicocc|sedano|frutta|verdura|ananas|lamponi|cachi|clementine|arance|taccole|rabarbaro|barbabietol|finocch|porr|asparag|carciof|radicch|bietol|cetriol|fagiolini|uva|mandarin|melone|anguria|ciliegi|susin|rosmarino|salvia|timo|erba cipollina|zenzero|peperoncino')],
  [
    'dispensa',
    rule(
      "sale|pepe|zucchero|farina|riso|cracker|grissini|biscott|cereali|miele|marmellata|aceto|maionese|ketchup|senape|spezie|lievito|pinoli|noci|gherigli|mandorle|nocciole|arachidi|semi di|sesamo|ceci|fagioli|lenticchie|cacao|cioccolato|caffè|caffe|tè|the|infus|salsa|confettura|granella|pistacchi|maizena|polenta|orzo|farro|avena|muesli|gomma di guar|lupini",
    ),
  ],
];

export function getSupermarketDepartment(name: string): DepartmentId {
  const clean = name.toLowerCase().trim();
  for (const [id, pattern] of RULES) {
    if (pattern.test(clean)) return id;
  }
  return 'altro';
}
