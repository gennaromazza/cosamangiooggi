import { db } from './firebase';
import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';
import { Recipe, PantryItem } from '../types';
import { getRawIngredientNames, scaleIngredientAmount } from './utils';

// Helper to normalize strings for comparison in Italian
export function cleanIngredientName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9àèìòùáéíóú\s]/g, '')
    .replace(/\b(di|da|con|in|un|una|uno|il|la|i|gli|le|al|alla|allo|ai|agli|alle|del|della|dello|dei|degli|delle|d')\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const STOP_WORDS = new Set([
  'fresco', 'fresca', 'freschi', 'fresche',
  'secco', 'secca', 'secchi', 'secche',
  'cotto', 'cotta', 'cotti', 'cotte',
  'crudo', 'cruda', 'crudi', 'crude',
  'tritato', 'tritata', 'tritati', 'tritate',
  'macinato', 'macinata', 'macinati', 'macinate',
  'grattugiato', 'grattugiata', 'grattugiati', 'grattugiate',
  'surgelato', 'surgelata', 'surgelati', 'surgelate',
  'precotto', 'precotta', 'precotti', 'precotte',
  'lesso', 'lessa', 'lessi', 'lesse', 'bollito', 'bollita', 'bolliti', 'bollite',
  'cubetti', 'fette', 'affettato', 'affettata', 'affettati', 'pezzettoni', 'pezzetti', 'rondelle', 'julienne', 'strisce',
  'biologico', 'biologica', 'biologici',
  'integrale', 'integrali', 'tipo', '00', '0', '1', '2',
  'verace', 'veraci', 'scatola', 'barattolo', 'confezione',
  'pulito', 'pulita', 'puliti', 'pulite', 'naturale', 'scolato', 'scolate',
  'grammi', 'g', 'kg', 'ml', 'l', 'litro', 'litri',
  'cucchiaio', 'cucchiai', 'cucchiaino', 'cucchiaini',
  'pizzico', 'pizzichi', 'rametto', 'rametti', 'foglia', 'foglie', 'spicchio', 'spicchi', 'qb',
  'medio', 'media', 'medi', 'medie', 'piccolo', 'piccola', 'piccoli', 'piccole', 'grande', 'grandi'
]);

const GENERIC_NOUNS = new Set([
  'farin', 'latt', 'formagg', 'brod', 'crem', 'succ', 'sem', 'oli', 'past', 'ris', 'carn', 'pesc', 'verdur'
]);

function getItalianStem(word: string): string {
  const w = word.toLowerCase().trim();
  if (!w) return '';
  if (w === 'uova' || w === 'uovo') return 'uov';
  if (w.startsWith('pomodor') || w === 'pelati' || w === 'passata') return 'pomodor';
  if (w.startsWith('zucchin')) return 'zucchin';
  if (w.startsWith('melanzan')) return 'melanzan';
  if (w.startsWith('patat')) return 'patat';
  if (w.startsWith('carot')) return 'carot';
  if (w.startsWith('cipoll')) return 'cipoll';
  if (w.startsWith('peperon')) return 'peperon';
  if (w.startsWith('fagiol')) return 'fagiol';
  if (w.startsWith('spaghett')) return 'spaghett';
  if (w.startsWith('lenticch')) return 'lenticch';
  if (w.startsWith('parmigian') || w.startsWith('reggian') || w === 'grana') return 'parmigian';
  if (w.startsWith('salmon')) return 'salmon';
  if (w.startsWith('gamber')) return 'gamber';
  if (w === 'aglio' || w === 'agli' || w === 'spicchio') return 'agli';

  if (w.length > 4) {
    let stem = w.replace(/[aeiouàèìòù]+$/, '');
    if (stem.endsWith('gh')) stem = stem.slice(0, -1);
    if (stem.endsWith('ch')) stem = stem.slice(0, -1);
    return stem;
  }
  return w;
}

export function extractCoreStems(text: string): string[] {
  const cleaned = cleanIngredientName(text);
  const words = cleaned.split(' ').filter(w => w.length > 1 && !STOP_WORDS.has(w) && isNaN(Number(w)));
  return Array.from(new Set(words.map(getItalianStem).filter(Boolean)));
}

function containsWholeWords(haystack: string, needle: string): boolean {
  return ` ${haystack} `.includes(` ${needle} `);
}

/**
 * Vero se `text` (titolo di ricetta o ingrediente) contiene l'ingrediente da escludere (allergia o
 * non gradito). Confronta parole intere e radici italiane, quindi "gambero" intercetta "gamberi"
 * ma "rana" non scatta più su "grana". Sbagliare per eccesso è accettabile, per difetto no.
 */
export function matchesExclusion(text: string, excluded: string): boolean {
  if (!text || !excluded) return false;
  const cleanText = cleanIngredientName(text);
  const cleanEx = cleanIngredientName(excluded);
  if (!cleanText || !cleanEx) return false;
  if (containsWholeWords(cleanText, cleanEx)) return true;
  const exStems = extractCoreStems(excluded);
  if (exStems.length === 0) return false;
  const textStems = extractCoreStems(text);
  return exStems.every(stem => textStems.includes(stem));
}

export function checkIngredientMatch(pantryItem: string, recipeIngredient: string): boolean {
  if (!pantryItem || !recipeIngredient) return false;
  
  const cleanA = cleanIngredientName(pantryItem);
  const cleanB = cleanIngredientName(recipeIngredient);
  
  if (!cleanA || !cleanB) return false;
  if (cleanA === cleanB) return true;
  
  if (cleanA.length >= 4 && cleanB.length >= 4) {
    // Contenimento a parole intere: "mela" non deve combaciare con "melanzane"
    if (containsWholeWords(cleanA, cleanB) || containsWholeWords(cleanB, cleanA)) {
      return true;
    }
  }
  
  const rawsA = getRawIngredientNames(pantryItem);
  const rawsB = getRawIngredientNames(recipeIngredient);
  
  const allTextsA = [pantryItem, ...rawsA];
  const allTextsB = [recipeIngredient, ...rawsB];
  
  for (const textA of allTextsA) {
    for (const textB of allTextsB) {
      const stemsA = extractCoreStems(textA);
      const stemsB = extractCoreStems(textB);
      
      if (stemsA.length === 0 || stemsB.length === 0) continue;
      
      for (const stem of stemsA) {
        if (stemsB.includes(stem)) {
          if (!GENERIC_NOUNS.has(stem)) {
            return true;
          } else {
            const qualifiersA = stemsA.filter(s => s !== stem);
            const qualifiersB = stemsB.filter(s => s !== stem);
            if (qualifiersA.length === 0 || qualifiersB.length === 0) {
              return true;
            }
            if (qualifiersA.some(q => qualifiersB.includes(q))) {
              return true;
            }
          }
        }
      }
    }
  }
  
  return false;
}

// Unità riconducibili a un peso/volume comune (1 ml ≈ 1 g; 1 pz ≈ 150 g, come già assunto in app)
const UNIT_ALIASES: Record<string, string> = {
  gr: 'g', grammi: 'g', grammo: 'g',
  kilo: 'kg', chili: 'kg', kilogrammi: 'kg',
  lt: 'l', litro: 'l', litri: 'l',
  pezzo: 'pz', pezzi: 'pz',
};
const UNIT_TO_GRAMS: Record<string, number> = { g: 1, kg: 1000, ml: 1, l: 1000, pz: 150 };

function normalizeUnit(unit: string): string {
  const u = (unit || '').toLowerCase().trim();
  return UNIT_ALIASES[u] || u;
}

/** Cerca nella dispensa lo stesso prodotto (stesso nome normalizzato e stessa unità) per sommare le quantità invece di duplicarlo. */
export function findPantryDuplicate(items: PantryItem[], name: string, unit: string): PantryItem | undefined {
  const cleaned = cleanIngredientName(name);
  if (!cleaned) return undefined;
  return items.find(i => cleanIngredientName(i.name) === cleaned && normalizeUnit(i.unit) === normalizeUnit(unit));
}

/** Converte tra unità note (g, kg, ml, l, pz). Se un'unità non è convertibile (es. "cucchiaio") restituisce il valore invariato. */
export function convertIngredientUnit(val: number, from: string, to: string): number {
  const f = normalizeUnit(from);
  const t = normalizeUnit(to);
  if (f === t) return val;
  const fromGrams = UNIT_TO_GRAMS[f];
  const toGrams = UNIT_TO_GRAMS[t];
  if (fromGrams === undefined || toGrams === undefined) return val;
  return (val * fromGrams) / toGrams;
}

export function calculateMissingFromPantry(
  requirements: { name: string; amount: number; unit: string }[],
  pantryItems: PantryItem[]
): { name: string; amount: number; unit: string; needed: boolean }[] {
  // 1. Aggregate requirements by matching ingredient identity
  const aggregated: { name: string; amount: number; unit: string }[] = [];
  
  for (const req of requirements) {
    if (isStaple(req.name)) continue;
    const existing = aggregated.find(ex => checkIngredientMatch(ex.name, req.name) && ex.unit === req.unit);
    if (existing) {
      existing.amount += req.amount;
    } else {
      aggregated.push({
        name: req.name.charAt(0).toUpperCase() + req.name.slice(1),
        amount: req.amount,
        unit: req.unit
      });
    }
  }

  // 2. Simulate multi-item consumption against available pantry inventory
  const simulatedPantry = pantryItems.map(p => ({ ...p }));
  const missingItems: { name: string; amount: number; unit: string; needed: boolean }[] = [];

  for (const item of aggregated) {
    let remainingNeeded = item.amount;
    for (const p of simulatedPantry) {
      if (p.quantity > 0 && checkIngredientMatch(p.name, item.name)) {
        let availableInNeededUnit = p.quantity;
        if (p.unit !== item.unit) {
          availableInNeededUnit = convertIngredientUnit(p.quantity, p.unit, item.unit);
        }
        const consumed = Math.min(remainingNeeded, availableInNeededUnit);
        remainingNeeded -= consumed;
        if (p.unit !== item.unit) {
          const consumedInPantryUnit = convertIngredientUnit(consumed, item.unit, p.unit);
          p.quantity = Math.max(0, p.quantity - consumedInPantryUnit);
        } else {
          p.quantity = Math.max(0, p.quantity - consumed);
        }
        if (remainingNeeded <= 0) break;
      }
    }

    if (remainingNeeded > 0.05) {
      missingItems.push({
        name: item.name,
        amount: Math.ceil(remainingNeeded * 10) / 10,
        unit: item.unit,
        needed: true
      });
    }
  }

  return missingItems;
}

export const isStaple = (name: string): boolean => {
  const n = name.toLowerCase().trim();
  return n === 'acqua' || 
         n === 'sale' || 
         n === 'pepe' || 
         n === 'olio' || 
         n === 'olio d\'oliva' || 
         n === 'olio extravergine d\'oliva' || 
         n === 'olio extravergine di oliva' || 
         n === 'q.b.' || 
         n === 'ghiaccio' ||
         n.includes('pizzico di sale') ||
         n.includes('pepe nero');
};

export interface ConsumptionResult {
  ingredientName: string;
  amountConsumed: number;
  unit: string;
  pantryItemName: string;
  newQuantity: number;
  status: 'depleted' | 'reduced' | 'not_found';
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Calcola cosa togliere dalla dispensa per cucinare una ricetta, senza toccare i dati.
 * Lavora su una copia aggiornata a ogni ingrediente: due ingredienti che combaciano con lo stesso
 * prodotto (es. "pomodori" e "passata") non si sovrascrivono e un prodotto esaurito non viene riusato.
 * `finalQuantities` contiene solo i prodotti modificati: quantità 0 = da eliminare.
 */
export function planConsumption(
  pantryItems: PantryItem[],
  recipe: Recipe,
  targetServings: number
): { results: ConsumptionResult[]; finalQuantities: Map<string, number> } {
  const working = pantryItems.map(p => ({ ...p }));
  const finalQuantities = new Map<string, number>();
  const results: ConsumptionResult[] = [];

  for (const ing of recipe.ingredients) {
    if (isStaple(ing.name)) continue;
    const neededAmount = scaleIngredientAmount(ing.amount, recipe.servings || 2, targetServings);

    let matchedItem = working.find(p => p.quantity > 0 && checkIngredientMatch(p.name, ing.name));
    if (!matchedItem) {
      for (const rawName of getRawIngredientNames(ing.name)) {
        const m = working.find(p => p.quantity > 0 && checkIngredientMatch(p.name, rawName));
        if (m) { matchedItem = m; break; }
      }
    }

    if (!matchedItem) {
      results.push({
        ingredientName: ing.name,
        amountConsumed: 0,
        unit: ing.unit,
        pantryItemName: 'Non in dispensa',
        newQuantity: 0,
        status: 'not_found'
      });
      continue;
    }

    const currentQty = matchedItem.quantity;
    const convertedNeeded = convertIngredientUnit(neededAmount, ing.unit, matchedItem.unit);
    const newQty = Math.max(0, round2(currentQty - convertedNeeded));
    matchedItem.quantity = newQty;
    finalQuantities.set(matchedItem.id, newQty);
    results.push({
      ingredientName: ing.name,
      amountConsumed: round2(Math.min(currentQty, convertedNeeded)),
      unit: matchedItem.unit,
      pantryItemName: matchedItem.name,
      newQuantity: newQty,
      status: newQty <= 0 ? 'depleted' : 'reduced'
    });
  }

  return { results, finalQuantities };
}

/**
 * Detrae dalla dispensa gli ingredienti di una ricetta.
 * @param userId - UID Firebase (o id dell'account locale/demo)
 * @param recipe - la ricetta preparata
 * @param targetServings - le porzioni preparate
 */
export async function consumeIngredientsFromPantry(
  userId: string,
  recipe: Recipe,
  targetServings: number
): Promise<ConsumptionResult[]> {
  if (userId === 'demo-family-user' || userId.startsWith('local-')) {
    let pantryItems: PantryItem[] = [];
    try {
      pantryItems = JSON.parse(localStorage.getItem(`pantry_${userId}`) || '[]');
    } catch {
      pantryItems = [];
    }
    const { results, finalQuantities } = planConsumption(pantryItems, recipe, targetServings);
    const updated = pantryItems
      .filter(p => finalQuantities.get(p.id) !== 0)
      .map(p => (finalQuantities.has(p.id) ? { ...p, quantity: finalQuantities.get(p.id)! } : p));
    localStorage.setItem(`pantry_${userId}`, JSON.stringify(updated));
    return results;
  }

  const pantryPath = `users/${userId}/pantry`;
  const pantrySnapshot = await getDocs(collection(db, pantryPath));
  const pantryItems: PantryItem[] = pantrySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as PantryItem));

  const { results, finalQuantities } = planConsumption(pantryItems, recipe, targetServings);

  // Un'unica scrittura atomica: o si aggiorna tutta la dispensa o niente
  const batch = writeBatch(db);
  finalQuantities.forEach((qty, id) => {
    const ref = doc(db, pantryPath, id);
    if (qty <= 0) batch.delete(ref);
    else batch.update(ref, { quantity: qty });
  });
  await batch.commit();

  return results;
}
