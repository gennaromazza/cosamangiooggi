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
  ['surgelati', rule('surgelat|congelat|gelato|frozen|sottozero')],
  [
    'dispensa',
    rule(
      "passata|pelati|polpa di pomodor|concentrato|sugo|conserva|in scatola|scatola|barattolo|sott'olio|sottolio|sottaceti|latte di cocco|latte condensato|latte in polvere|brodo|dado|pangrattato|pane grattugiato|olive|oliva|capperi|acciughe|alici sotto|tonno in|tonno sott",
    ),
  ],
  ['bevande', rule('acqua|vino|birra|succo|succhi|bibita|bibite|coca cola|aranciata|gassosa|chinotto|spumante|sidro|limonata|aperitivo|aperol|prosecco')],
  ['pane', rule('focaccia|pizza|piadina|piadine|pancarrè|pancarre|fette biscottate|panino|panini|mollica|pane|piada|schiacciata|taralli|sfogliatina|bignè|torta|crostata|cornett')],
  ['macelleria', rule('pollo|tacchino|manzo|maiale|vitello|agnello|salsiccia|salsicce|pancetta|prosciutto|salame|bresaola|pesce|salmone|tonno|merluzzo|gamber|calamar|vongol|cozze|branzino|orata|sarde|alici|carne|macinato|petto|lonza|bistecca|hamburger|affettat|quaglia|coniglio|fesa|spezzatino|fettine|fesa|wurstel|speck|mortadella|polpo|seppie')],
  ['latticini', rule('latte|burro|formaggi|formaggio|parmigiano|grana|mozzarella|ricotta|panna|yogurt|uovo|uova|mascarpone|gorgonzola|pecorino|caprino|provola|stracchino|tofu|lievito fresco|margarina|philadelphia|caciotta|fontina|emmental|scamorza|burrata|feta')],
  ['ortofrutta', rule('mela|mele|banana|banane|limon|aranci|cipoll|pomodor|insalat|zucchin|carot|patat|aglio|spinaci|fung|basilico|prezzemolo|rucola|melanzan|zucca|peperon|broccol|cavolfior|cavolo|lattuga|erbette|fragol|kiwi|avocado|pera|pere|pesca|pesche|albicocc|sedano|frutta|verdura|ananas|finocch|porr|asparag|carciof|radicch|bietol|cetriol|fagiolini|piselli freschi|uva|mandarin|melone|anguria|ciliegi|susin|rosmarino fresco|erbe fresche|zenzero|peperoncino')],
  [
    'dispensa',
    rule(
      "olio|sale|pepe|zucchero|farina|riso|pasta|cracker|grissini|biscott|cereali|miele|marmellata|aceto|maionese|ketchup|senape|spezie|origano|rosmarino|salvia|timo|cannella|vaniglia|lievito|pinoli|noci|mandorle|nocciole|ceci|fagioli|lenticchie|cacao|cioccolato|caffè|caffe|tè|the|infus|salsa|confettura|granella|pistacchi|maizena|fecola|curcuma|curry|semola|polenta|couscous|orzo|farro|avena|muesli",
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
