import type { Ingredient, Recipe } from '../types';

/**
 * Calorie dei piatti, stimate dagli ingredienti. Sono stime utili per orientarsi, non una prescrizione medica.
 * Le quantità di una ricetta sono per `servings` persone (2 se non indicato): qui si ragiona sempre PER PERSONA.
 */

// kcal per 100 g (o 100 ml) e, se serve, peso in grammi di un singolo pezzo. Il primo che combacia vince: prima i casi specifici.
// Pasta, riso e cereali sono a crudo (come si pesano in cucina); legumi e verdure già cotte sono contati cotti.
type Rule = [pattern: RegExp, kcal: number, pieceGrams?: number];

const RULES: Rule[] = [
  // Quasi senza calorie
  [/^(acqua|sale|pepe|sale e pepe|aceto|spezie)\b|sale marino|pepe nero|acqua tiepida|ghiaccio/, 0],
  [/aceto balsamico|aceto/, 90],
  [/\b(origano|paprika|curcuma|curry|cannella|noce moscata|zafferano|alloro|timo|salvia|sage|rosmarino|basilico|prezzemolo|menta|erba cipollina|maggiorana|zenzero|peperoncino|pepe|cumino)\b/, 20, 3],
  [/gomma di guar|colla di pesce|agar|fumet/, 5],
  [/brodo|dado/, 5],
  // Cereali, pasta, pane
  [/gnocchi/, 150],
  [/tortellini|ravioli|tortelli/, 300],
  [/sfoglia per lasagne|lasagne|tagliatelle|pasta all'uovo/, 350],
  [/pasta sfoglia/, 450, 230],
  [/impasto per pizza/, 250],
  [/cornflakes|corn flakes/, 380],
  [/pasta|spaghetti|penne|farfalle|fusilli|rigatoni|ditalini|trofie|trenette|pici|orecchiette|sedani|mezze maniche|linguine|bucatini|maccheroni|conchiglie|cavatelli|strozzapreti|tonnarelli|vermicelli|fregola|capellini|paccheri|semola|cous cous|couscous/, 355],
  [/riso basmati|riso già cotto|riso cotto/, 130],
  [/\briso\b|originario|carnaroli|farro|orzo|quinoa|avena|fiocchi|miglio|grano saraceno|bulgur|polenta|mais per polenta/, 350],
  [/pangrattato|pane grattugiato/, 360],
  [/grissini/, 430],
  [/carasau/, 380],
  [/fresell/, 360, 30],
  [/mollica|pane|panbauletto|panino|rosetta|piadina|crostini|focaccia|tramezzino|toast|cassetta/, 270, 40],
  [/fecola|maizena|amido/, 350],
  [/farina|lievito alimentare|lievito/, 340],
  [/patat/, 77, 150],
  // Carne e pesce
  [/guanciale/, 650],
  [/pancetta/, 540],
  [/speck/, 300],
  [/prosciutto crudo/, 250],
  [/prosciutto|mortadella|bresaola/, 150],
  [/salsiccia/, 300, 100],
  [/ragù/, 150],
  [/salame|culatello|coppa|salumi/, 400],
  [/carne macinata|macinato|hamburger|polpett/, 230],
  [/pollo|petto di|fesa|tacchino|coniglio|fettine|straccetti|scottona|fetta di vitello|vitello|manzo|muscolo|lacerto|girello|scamone|maiale|agnello|fegato|costolett/, 130, 150],
  [/rana/, 70],
  [/salmone affumicato/, 180],
  [/salmone/, 200, 150],
  [/tonno.*(olio)/, 190],
  [/tonno/, 120],
  [/merluzzo|pesce bianco|orata|branzino|spigola|nasello|sogliola|platessa|trancio|filetto di pesce|filetti di pesce/, 85, 150],
  [/pesce spada/, 140, 150],
  [/alici|acciughe|sarde/, 110],
  [/gamberi|gamberetti|scampi/, 85],
  [/cozze|vongole|calamari|seppie|polpo|frutti di mare|misto frutti/, 80],
  [/uovo|uova|tuorl/, 143, 55],
  // Latticini
  [/parmigiano|grana|pecorino|caciocavallo|fontina|taleggio|stelvio|edamer|provola|scamorza|formaggio saporito|asiago/, 380, 20],
  [/ricotta salata/, 250],
  [/stracchino|crescenza/, 300],
  [/ricotta/, 150],
  [/mozzarella|bufala|fior di latte|ciliegine|burrata/, 250, 125],
  [/feta/, 260],
  [/philadelphia light/, 130],
  [/philadelphia|spalmabile|mascarpone/, 250],
  [/formaggio/, 340, 20],
  [/besciamella/, 120],
  [/panna da cucina/, 200],
  [/panna/, 300],
  [/burro/, 717, 10],
  [/yogurt/, 60, 125],
  [/latte (di soia|vegetale)|latte vegetale|bevanda/, 33],
  [/latte/, 55],
  [/tofu|tempeh|seitan/, 120],
  // Grassi e salse
  [/olio/, 884],
  [/tahin|tahina/, 600],
  [/pesto/, 450],
  [/concentrato di pomodoro/, 80],
  [/salsa di soia|tamari/, 55],
  [/maionese/, 700],
  // Legumi (cotti)
  [/lenticchie rosse|penne di lenticchie|pasta di legumi/, 340],
  [/ceci|lenticchie|fagioli|borlotti|cannellini|piselli|fave|lupini|soia|edamame/, 125],
  [/farina di ceci/, 380],
  // Verdura e frutta
  [/passata|pelati|polpa di pomodoro|salsa di pomodoro/, 30],
  [/pomodor|ramato|datterini|pachino|ciliegino|costoluti/, 20, 120],
  [/zucchin/, 17, 200],
  [/melanzan/, 25, 250],
  [/peperon/, 30, 150],
  [/carot|barbabietola/, 40, 80],
  [/cipollotto|scalogno|cipolla|cipolle|aglione/, 40, 100],
  [/\baglio\b|aglio/, 130, 4],
  [/broccol|cavolfiore|cime di rapa|cavolo|verza|cappuccio|asparag|carciof|spinaci|bietol|bieta|cavolini|cavoletti|taccole|rabarbaro|rucola|lattuga|radicchio|scarola|indivia|cetriol|finocch|sedano|fagiolini|funghi|porcini|champignon|zucca|insalata|verdur|soffritto|rapa|porri|cicoria/, 25, 100],
  [/mais/, 90],
  [/olive/, 150, 4],
  [/capperi/, 25, 5],
  [/avocado/, 160, 150],
  [/banan/, 90, 120],
  [/mele|mela\b|pere|pera\b|pesche|albicocche|fragole|frutti di bosco|kiwi|uva|frutta/, 50, 150],
  [/arancia|arance|cachi|melone|lamponi|limone|lime|scorza|succo/, 40, 120],
  [/arachidi|sesamo/, 580, 10],
  [/miso/, 200],
  [/uvetta|datteri|fichi secchi/, 290],
  [/noci|gherigli|mandorle|nocciole|pistacchi|anacardi/, 620, 5],
  [/pinoli/, 670],
  [/cioccolato|cacao/, 540],
  [/zucchero|miele|sciroppo/, 390],
  [/marmellata|confettura|crema di nocciole/, 250],
  [/vino|birra|marsala/, 60],
  [/cereali|muesli|biscott|biscotti/, 400],
];

// Quanto pesa, in grammi, un'unità di misura "a occhio" quando non è un peso (per 1 unità)
const UNIT_GRAMS: Record<string, number> = {
  cucchiaio: 14, cucchiai: 14, cchiaio: 14, cucchiaino: 5, cuchiaino: 5, pizzico: 1, spolverata: 2, spruzzata: 3, filo: 5, goccia: 0.3,
  ciuffo: 4, ciuffetto: 2, rametto: 1.5, rametti: 1.5, foglie: 0.5, foglia: 0.5, mazzetto: 10, manciata: 20, spicchio: 4, spicchi: 4,
  bustina: 16, noce: 10, costa: 40, fetta: 25, fette: 25, filetti: 80, pezzetto: 15, pezzi: 50, rotolo: 230, succo: 15, mezzo: 0.5, misto: 0,
};

const QB = new Set(['q.b.', 'qb', 'q.b', 'a piacere']);

/** Grammi di un ingrediente: pesi e volumi diretti, altrimenti si stima con l'unità di misura o con il peso di un pezzo. */
function gramsOf(ing: Ingredient, pieceGrams?: number): number {
  const unit = (ing.unit || '').toLowerCase().trim();
  const amount = Number.isFinite(ing.amount) ? Math.max(0, ing.amount) : 0;
  if (unit === 'g' || unit === 'ml') return amount;
  if (unit === 'kg' || unit === 'l') return amount * 1000;
  if (QB.has(unit)) return 0; // "quanto basta": condimenti non contati
  if (unit === '' || unit === 'pz' || unit === 'piccola' || unit === 'piccolo' || unit === 'mezzo') {
    const each = pieceGrams ?? 100;
    return amount * each * (unit === 'mezzo' ? 0.5 : 1);
  }
  if (unit in UNIT_GRAMS) {
    // fetta/spicchio: se la regola dice quanto pesa un pezzo (es. 20 g di formaggio) si usa quello
    if (pieceGrams && (unit === 'fetta' || unit === 'fette' || unit === 'spicchio' || unit === 'spicchi')) return amount * pieceGrams;
    return amount * UNIT_GRAMS[unit];
  }
  return 0;
}

export interface KcalEstimate {
  /** Calorie per persona */
  perServing: number;
  /** Quota di ingredienti (per peso e numero) che abbiamo saputo riconoscere, da 0 a 1 */
  coverage: number;
}

const normalize = (s: string) => s.toLowerCase().replace(/[’`]/g, "'").trim();

/** kcal totali di un elenco di ingredienti, e quanti ne abbiamo riconosciuti. */
export function estimateIngredients(ingredients: Ingredient[]): { total: number; matched: number; counted: number } {
  let total = 0;
  let matched = 0;
  let counted = 0;
  for (const ing of ingredients) {
    const name = normalize(ing.name);
    if (!name) continue;
    const rule = RULES.find(([pattern]) => pattern.test(name));
    const grams = gramsOf(ing, rule?.[2]);
    if (grams <= 0 && !QB.has((ing.unit || '').toLowerCase().trim())) {
      // Unità che non sappiamo pesare: non conta come riconosciuto
      counted++;
      continue;
    }
    counted++;
    if (rule) {
      matched++;
      // Tanto olio (100 ml o più) è per friggere: nel piatto ne resta solo una parte
      const absorbed = /olio/.test(name) && grams >= 100 ? 0.2 : 1;
      total += (rule[1] * grams * absorbed) / 100;
    }
  }
  return { total, matched, counted };
}

const DEFAULT_PER_CATEGORY: Record<Recipe['category'], number> = {
  lunch: 520, dinner: 480, dessert: 280, breakfast: 300, cold: 450, takeaway: 650, side: 120, fast: 550,
};

/** Calorie per persona di un piatto. Se gli ingredienti non bastano per stimare, si usa un valore tipico della categoria. */
export function recipeKcal(recipe: Pick<Recipe, 'ingredients' | 'servings' | 'category'>): KcalEstimate {
  const servings = Math.max(1, recipe.servings || 2);
  const { total, matched, counted } = estimateIngredients(recipe.ingredients || []);
  const coverage = counted === 0 ? 0 : matched / counted;
  const perServing = Math.round(total / servings);
  const typical = DEFAULT_PER_CATEGORY[recipe.category] ?? 450;
  // Stima credibile: abbastanza ingredienti riconosciuti e un valore che un piatto può avere
  if (coverage >= 0.6 && perServing >= 40) return { perServing: Math.min(perServing, 1800), coverage };
  return { perServing: Math.max(perServing, typical), coverage };
}

// ---- Obiettivo di calorie al giorno ------------------------------------------------------------

export const DEFAULT_DAILY_KCAL = 2000;
export const MIN_DAILY_KCAL = 1200;
export const MAX_DAILY_KCAL = 4000;

export type MealSlot = 'breakfast' | 'snackAm' | 'lunch' | 'snackPm' | 'dinner';

/** Come si dividono le calorie della giornata (linee guida di nutrizione per una giornata da 5 pasti). */
export const MEAL_SHARES: Record<MealSlot, number> = { breakfast: 0.15, snackAm: 0.05, lunch: 0.4, snackPm: 0.05, dinner: 0.35 };

export const MEAL_LABELS: Record<MealSlot, string> = {
  breakfast: 'Colazione',
  snackAm: 'Spuntino di metà mattina',
  lunch: 'Pranzo',
  snackPm: 'Merenda',
  dinner: 'Cena',
};

/** Obiettivo valido tra i limiti, arrotondato a 50 kcal. */
export const clampKcal = (value: number): number =>
  Math.min(MAX_DAILY_KCAL, Math.max(MIN_DAILY_KCAL, Math.round((Number.isFinite(value) ? value : DEFAULT_DAILY_KCAL) / 50) * 50));

/** Calorie a disposizione di ogni pasto, dato l'obiettivo del giorno. */
export const mealBudgets = (target: number): Record<MealSlot, number> => {
  const t = clampKcal(target);
  return {
    breakfast: Math.round(t * MEAL_SHARES.breakfast),
    snackAm: Math.round(t * MEAL_SHARES.snackAm),
    lunch: Math.round(t * MEAL_SHARES.lunch),
    snackPm: Math.round(t * MEAL_SHARES.snackPm),
    dinner: Math.round(t * MEAL_SHARES.dinner),
  };
};

/** Obiettivo scelto da chi usa l'app; null se non ha attivato il limite. */
export const dailyKcalTarget = (profile: { dailyKcalTarget?: number } | null | undefined): number | null =>
  profile && typeof profile.dailyKcalTarget === 'number' && profile.dailyKcalTarget > 0 ? clampKcal(profile.dailyKcalTarget) : null;

type Lookup = Map<string, Recipe> | ((id: string) => Recipe | undefined);
const find = (lookup: Lookup, id: string) => (typeof lookup === 'function' ? lookup(id) : lookup.get(id));

/** Calorie per persona di un pasto fatto da più piatti (piatto principale e contorni). */
export const kcalOfIds = (ids: string[] | undefined, lookup: Lookup): number =>
  (ids || []).reduce((sum, id) => {
    const recipe = find(lookup, id);
    return sum + (recipe ? recipeKcal(recipe).perServing : 0);
  }, 0);

/**
 * Tra i piatti candidati tiene quelli che stanno nelle calorie del pasto. Se nessuno ci sta si tengono i più leggeri:
 * meglio un piatto un po' sopra che nessun piatto.
 */
export function capPool<T extends Pick<Recipe, 'ingredients' | 'servings' | 'category'>>(pool: T[], budget: number): T[] {
  const withKcal = pool.map((recipe) => ({ recipe, kcal: recipeKcal(recipe).perServing }));
  const fits = withKcal.filter((item) => item.kcal <= budget);
  if (fits.length > 0) return fits.map((item) => item.recipe);
  return withKcal.sort((a, b) => a.kcal - b.kcal).slice(0, 8).map((item) => item.recipe);
}

/** Se un pasto (piatto + contorni) supera le sue calorie, toglie i contorni più pesanti; il piatto principale resta. */
export function fitMeal(ids: string[], budget: number, lookup: Lookup): string[] {
  const kept = [...ids];
  while (kept.length > 1 && kcalOfIds(kept, lookup) > budget) {
    let heaviest = 1;
    for (let i = 2; i < kept.length; i++) {
      const a = find(lookup, kept[i]);
      const b = find(lookup, kept[heaviest]);
      if ((a ? recipeKcal(a).perServing : 0) > (b ? recipeKcal(b).perServing : 0)) heaviest = i;
    }
    kept.splice(heaviest, 1);
  }
  return kept;
}

export interface DayKcal {
  /** Calorie per persona dei pasti che ci sono nel menù */
  total: number;
  byMeal: Partial<Record<MealSlot, number>>;
}

/** Calorie di un giorno del menù, pasto per pasto. */
export function dayKcal(
  day: { lunchIds?: string[]; dinnerIds?: string[]; breakfastIds?: string[]; snackAmIds?: string[]; snackPmIds?: string[] } | undefined,
  lookup: Lookup,
): DayKcal {
  const byMeal: Partial<Record<MealSlot, number>> = {};
  const add = (slot: MealSlot, ids?: string[]) => {
    if (ids && ids.length > 0) byMeal[slot] = kcalOfIds(ids, lookup);
  };
  add('breakfast', day?.breakfastIds);
  add('snackAm', day?.snackAmIds);
  add('lunch', day?.lunchIds);
  add('snackPm', day?.snackPmIds);
  add('dinner', day?.dinnerIds);
  return { total: Object.values(byMeal).reduce((a, b) => a + b, 0), byMeal };
}

/**
 * Calorie di cui tenere conto per colazione e merende quando non sono nel menù (rilascio con solo pranzo e cena):
 * restano riservate, così il totale vero della giornata non supera l'obiettivo.
 */
export const reservedKcal = (target: number): number => {
  const b = mealBudgets(target);
  return b.breakfast + b.snackAm + b.snackPm;
};
