import { DietaryRestriction, Recipe } from '../types';
import { matchesExclusion } from './pantrySync';
import { DAIRY, EGGS, FISH, GLUTEN } from './dishInference';

// Se l'utente esclude una categoria generica ("Pesce", "Manzo"...), escludiamo le ricette con quella proteina
const CATEGORY_EXCLUSION_MAP: Record<string, string[]> = {
  pesce: ['fish'],
  manzo: ['red-meat'],
  vitello: ['red-meat'],
  pollo: ['white-meat'],
  tacchino: ['white-meat'],
  coniglio: ['white-meat'],
  rana: ['white-meat'],
  agnello: ['red-meat'],
  pecora: ['red-meat'],
  piccione: ['red-meat'],
  uova: ['eggs'],
  formaggi: ['cheese'],
  legumi: ['legumes'],
};

/** Una ricetta deve rispettare TUTTE le restrizioni alimentari della famiglia. */
export function satisfiesDiet(recipe: Recipe, restrictions: DietaryRestriction[]): boolean {
  const tags = recipe.tags || [];
  return restrictions.every(restriction => {
    if (restriction === 'vegan') return tags.includes('vegan') || tags.includes('vegan-friendly');
    // L'etichetta non basta: anche gli ingredienti devono essere senza lattosio / senza glutine
    if (restriction === 'lactose-free') return tags.includes('lactose-free') && !hitsAllergen(recipe, 'lattosio');
    if (restriction === 'gluten-free') return tags.includes('gluten-free') && !hitsAllergen(recipe, 'glutine');
    return true;
  });
}

const word = (words: string) => new RegExp(`(?:^|[^a-zà-ú])(?:${words})`);

/**
 * I 14 allergeni (e qualche sinonimo) sono categorie, non ingredienti: "Glutine" deve escludere la pasta e il pane,
 * "Crostacei" i gamberi, "Frutta a guscio" noci e mandorle. Sbagliare per eccesso va bene, per difetto no.
 */
const ALLERGEN_PATTERNS: Record<string, RegExp> = {
  glutine: GLUTEN,
  celiachia: GLUTEN,
  frumento: GLUTEN,
  latte: DAIRY,
  lattosio: DAIRY,
  latticini: DAIRY,
  uova: EGGS,
  uovo: EGGS,
  pesce: FISH,
  crostacei: word('gamber|scamp|astice|aragost|granch|mazzancoll|crostace|frutti di mare|misto mare|cicale'),
  molluschi: word('cozz|vongol|calamar|seppi|polp|totan|molluschi|frutti di mare|misto mare|ostric|lumach'),
  'frutta a guscio': word('noci|noce(?! moscata)|gherigli|mandorl|nocciol|pistacch|anacard|pinoli|castagn|pecan|macadamia|pesto|frutta secca|frutta a guscio|amaretti|marzapane|torrone'),
  arachidi: word('arachid|noccioline|burro di arachidi'),
  soia: word('soia|tofu|tempeh|edamame|miso|tamari|lecitina'),
  sedano: word('sedano|soffritto|brodo vegetale|dado'),
  senape: word('senape|mostarda'),
  sesamo: word('sesamo|tahin|gomasio|hummus'),
  solfiti: word('vino|aceto|uvetta|marsala|albicocche secche|frutta secca|birra'),
  lupini: word('lupin'),
};

// "Latte di soia", "yogurt vegetale"… non sono latticini: per l'allergia al latte non contano
const plantBased = (value: string) =>
  value.toLowerCase().replace(/(latte|yogurt|bevanda|panna|burro|formaggio)\s+(di\s+)?(soia|mandorl\w*|avena|riso|cocco|vegetale|vegano)/g, 'bevanda-vegetale');

/** L'allergene (categoria) compare nel titolo o negli ingredienti della ricetta. */
export function hitsAllergen(recipe: Pick<Recipe, 'title' | 'ingredients'>, allergen: string): boolean | undefined {
  const pattern = ALLERGEN_PATTERNS[allergen.trim().toLowerCase()];
  if (!pattern) return undefined;
  const texts = [recipe.title, ...recipe.ingredients.map((i) => i.name)].map(plantBased);
  // "senza glutine", "senza lattosio" nel nome dell'ingrediente non contano come presenza dell'allergene
  const key = allergen.trim().toLowerCase();
  // Un ingrediente (o un piatto) dichiarato "senza glutine" / "senza lattosio" non conta per quell'allergene
  const declaredFree =
    key === 'glutine' || key === 'celiachia' || key === 'frumento'
      ? /senza\s+glutine|gluten[- ]?free/
      : key === 'latte' || key === 'lattosio' || key === 'latticini'
        ? /senza\s+(lattosio|latte)|lactose[- ]?free/
        : null;
  const neutral = (t: string) =>
    (declaredFree && declaredFree.test(t) ? '' : t)
      .replace(/senza\s+(glutine|lattosio|latte|uova)|gluten[- ]?free|lactose[- ]?free/g, ' ')
      // farine e prodotti naturalmente senza glutine
      .replace(/farina\s+di\s+(riso|mais|ceci|castagne|mandorle|grano saraceno|cocco|lenticchie|piselli|fave|quinoa)/g, ' ')
      .replace(/(pasta|spaghetti|penne|fusilli|noodles|tagliatelle|pane|gnocchi)\s+di\s+(riso|lenticchie|ceci|piselli|mais|legumi|grano saraceno|quinoa)(\s+rosse)?/g, ' ')
      .replace(/pizzaiola/g, ' ');
  return texts.some((t) => pattern.test(neutral(t)));
}

/** Vero se la ricetta contiene (nel titolo, negli ingredienti o come proteina) uno degli ingredienti elencati. */
export function hitsExclusion(recipe: Recipe, exclusions: string[]): boolean {
  return exclusions.some(excluded => {
    const trimmed = excluded.trim();
    if (!trimmed) return false;
    // Per le categorie di allergeni decide la categoria: "latte di soia" o "pasta senza glutine" non vanno esclusi per il nome
    const allergen = hitsAllergen(recipe, trimmed);
    if (allergen !== undefined) return allergen || (!!recipe.proteinType && !!CATEGORY_EXCLUSION_MAP[trimmed.toLowerCase()]?.includes(recipe.proteinType));
    if (matchesExclusion(recipe.title, trimmed)) return true;
    if (recipe.ingredients.some(ing => matchesExclusion(ing.name, trimmed))) return true;
    return !!recipe.proteinType && !!CATEGORY_EXCLUSION_MAP[trimmed.toLowerCase()]?.includes(recipe.proteinType);
  });
}
