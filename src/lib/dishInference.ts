import type { Ingredient, Recipe } from '../types';

const word = (words: string) => new RegExp(`(?:^|[^a-zà-ú])(?:${words})`);

const GLUTEN = word(
  'pasta|spaghett|penne|rigaton|fusill|tagliatell|lasagn|gnocch|farina|pane|pangrattato|panin|pizza|focaccia|piadina|cous ?cous|orzo|farro|semola|segale|seitan|biscott|cracker|grissin|crostin|besciamella|pancarr|cornett|tortellin|ravioli|cannellon|bulgur|avena|cereali|cornflake|muesli|granola|panbauletto|toast|frumento|grano duro|pasta sfoglia',
);
const DAIRY = word(
  'latte|burro|formaggi|formaggio|parmigiano|grana|mozzarella|ricotta|panna|yogurt|mascarpone|pecorino|gorgonzola|caprino|provola|stracchino|besciamella|philadelphia|fontina|emmental|scamorza|burrata|feta|caciotta|gelato',
);
const EGGS = word('uovo|uova|maionese|albume|tuorlo|frittata');
const FISH = word('pesce|salmone|tonno|merluzzo|gamber|calamar|vongol|cozze|branzino|orata|sarde|alici|acciughe|polpo|seppie|baccal|scampi|crostace|molluschi');
const RED_MEAT = word('manzo|vitello|maiale|agnello|salsiccia|salame|prosciutto|pancetta|guanciale|speck|bresaola|mortadella|macinato|bistecca|hamburger|ragù|ragu|wurstel|costin|fettine di manzo');
const WHITE_MEAT = word('pollo|tacchino|coniglio|anatra|petto di|cotoletta');
const OTHER_ANIMAL = word('carne|miele|gelatina|strutto|brodo di carne|dado di carne');
const LEGUMES = word('ceci|fagioli|lenticchie|piselli|fave|soia|legumi|lupini|tofu|tempeh');
const CARBS = word('pasta|riso|avena|cereali|cornflake|muesli|granola|biscott|cracker|gallett|pane|patat|farina|couscous|orzo|farro|gnocch|polenta|semola|spaghett|penne|lasagn|pizza');
const VEG = word('verdur|pomodor|zucchin|melanzan|spinaci|carot|insalat|peperon|broccol|cavol|funghi|cipoll|fagiolin|zucca|finocch|asparag|carciof|radicch|bietol|sedano');

export interface DishInfo {
  tags: string[];
  proteinType: NonNullable<Recipe['proteinType']>;
  hasCarbs: boolean;
  hasProtein: boolean;
  hasVeg: boolean;
  contains: { gluten: boolean; dairy: boolean; animal: boolean };
}

/** Capisce da ingredienti e titolo se il piatto è vegano, senza glutine o senza lattosio, e di che tipo è. */
export function inferDishInfo(ingredients: Pick<Ingredient, 'name'>[], title = ''): DishInfo {
  // "Latte di soia", "yogurt vegetale"… non sono latticini
  const plantBased = (value: string) => value.replace(/(latte|yogurt|bevanda|panna|burro|formaggio)\s+(di\s+)?(soia|mandorl\w*|avena|riso|cocco|vegetale|vegano)/g, 'bevanda-vegetale');
  const text = [title, ...ingredients.map((i) => i.name)].map((s) => plantBased(s.toLowerCase()));
  const any = (pattern: RegExp) => text.some((t) => pattern.test(t));
  const names = ingredients.map((i) => plantBased(i.name.toLowerCase()));
  const anyIng = (pattern: RegExp) => names.some((t) => pattern.test(t));

  const gluten = any(GLUTEN);
  const dairy = any(DAIRY);
  const eggs = any(EGGS);
  const fish = any(FISH);
  const red = any(RED_MEAT);
  const white = any(WHITE_MEAT);
  const animal = dairy || eggs || fish || red || white || any(OTHER_ANIMAL);

  const tags: string[] = [];
  if (!animal) tags.push('vegan');
  if (!gluten) tags.push('gluten-free');
  if (!dairy) tags.push('lactose-free');

  let proteinType: DishInfo['proteinType'] = 'veg';
  if (fish) proteinType = 'fish';
  else if (red) proteinType = 'red-meat';
  else if (white) proteinType = 'white-meat';
  else if (anyIng(word('formaggi|formaggio|parmigiano|grana|mozzarella|ricotta|pecorino|gorgonzola|scamorza|provola|burrata'))) proteinType = 'cheese';
  else if (eggs && anyIng(word('uovo|uova'))) proteinType = 'eggs';
  else if (any(LEGUMES)) proteinType = 'legumes';

  return {
    tags,
    proteinType,
    hasCarbs: any(CARBS),
    hasProtein: proteinType !== 'veg',
    hasVeg: any(VEG),
    contains: { gluten, dairy, animal },
  };
}

const UNITS: Record<string, string> = {
  g: 'g', gr: 'g', grammi: 'g', kg: 'kg', ml: 'ml', l: 'l', litri: 'l', litro: 'l', pz: 'pz', pezzi: 'pz', pezzo: 'pz',
  cucchiai: 'cucchiai', cucchiaio: 'cucchiai', cucchiaini: 'cucchiaini', cucchiaino: 'cucchiaini', spicchi: 'spicchi', spicchio: 'spicchi',
};

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

/**
 * Trasforma un elenco scritto a parole ("200 g pasta, 2 uova, guanciale e pecorino") in ingredienti.
 * Senza quantità, usa una porzione tipica: 2 pezzi per le uova, altrimenti 100 g (si può correggere).
 */
export function parseIngredientText(text: string): Ingredient[] {
  const parts = text
    .split(/[,;\n]| e (?=[a-zà-ú])/i)
    .map((p) => p.trim())
    .filter(Boolean);
  const result: Ingredient[] = [];
  for (const part of parts) {
    const match = part.match(/^(\d+(?:[.,]\d+)?)\s*([a-zà-ú]+)?\s+(?:di\s+|d')?(.+)$/i);
    let name = part;
    let amount = 100;
    let unit = 'g';
    if (match) {
      const mapped = match[2] ? UNITS[match[2].toLowerCase()] : undefined;
      if (mapped) {
        amount = parseFloat(match[1].replace(',', '.'));
        unit = mapped;
        name = match[3];
      } else if (!match[2] || /^[a-zà-ú]+$/i.test(match[2])) {
        // "2 uova": il numero è la quantità, la parola è già l'ingrediente
        amount = parseFloat(match[1].replace(',', '.'));
        unit = 'pz';
        name = match[2] ? `${match[2]} ${match[3]}`.trim() : match[3];
      }
    } else if (/^uov[oa]$/i.test(part)) {
      amount = 2;
      unit = 'pz';
    }
    name = name.replace(/^(un|una|uno|il|la|lo|dei|delle|del)\s+/i, '').trim();
    if (!name) continue;
    if (/^uov[oa]$/i.test(name) && unit === 'g') {
      amount = 2;
      unit = 'pz';
    }
    result.push({ name: capitalize(name), amount, unit });
  }
  return result;
}
