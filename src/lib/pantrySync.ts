import { db } from './firebase';
import { collection, doc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
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

export function checkIngredientMatch(pantryItem: string, recipeIngredient: string): boolean {
  if (!pantryItem || !recipeIngredient) return false;
  
  const cleanA = cleanIngredientName(pantryItem);
  const cleanB = cleanIngredientName(recipeIngredient);
  
  if (!cleanA || !cleanB) return false;
  if (cleanA === cleanB) return true;
  
  if (cleanA.length >= 4 && cleanB.length >= 4) {
    if (cleanA.includes(cleanB) || cleanB.includes(cleanA)) {
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

export function convertIngredientUnit(val: number, from: string, to: string): number {
  const f = from.toLowerCase().trim();
  const t = to.toLowerCase().trim();
  if (f === t) return val;
  if (f === 'kg' && t === 'g') return val * 1000;
  if (f === 'g' && t === 'kg') return val / 1000;
  if (f === 'l' && t === 'ml') return val * 1000;
  if (f === 'ml' && t === 'l') return val / 1000;
  if (f === 'pz' && t === 'g') return val * 150;
  if (f === 'g' && t === 'pz') return val / 150;
  return val;
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

interface ConsumptionResult {
  ingredientName: string;
  amountConsumed: number;
  unit: string;
  pantryItemName: string;
  newQuantity: number;
  status: 'depleted' | 'reduced' | 'not_found';
}

/**
 * Deducts recipe ingredients from the user's pantry.
 * @param userId - The user's Firebase UID
 * @param recipe - The recipe being prepared
 * @param targetServings - The target servings scaling the recipe
 */
export async function consumeIngredientsFromPantry(
  userId: string,
  recipe: Recipe,
  targetServings: number
): Promise<ConsumptionResult[]> {
  if (userId === 'demo-family-user' || userId.startsWith('local-')) {
    const saved = localStorage.getItem(`pantry_${userId}`);
    let pantryItems: PantryItem[] = saved ? JSON.parse(saved) : [];
    const results: ConsumptionResult[] = [];

    for (const ing of recipe.ingredients) {
      if (isStaple(ing.name)) continue;
      const neededAmount = scaleIngredientAmount(ing.amount, recipe.servings || 2, targetServings);
      let matchedItem = pantryItems.find(p => p.quantity > 0 && checkIngredientMatch(p.name, ing.name));
      if (!matchedItem) {
        const raws = getRawIngredientNames(ing.name);
        for (const rawName of raws) {
          const m = pantryItems.find(p => p.quantity > 0 && checkIngredientMatch(p.name, rawName));
          if (m) { matchedItem = m; break; }
        }
      }

      if (matchedItem) {
        const currentQty = matchedItem.quantity;
        const convertedNeeded = convertIngredientUnit(neededAmount, ing.unit, matchedItem.unit);
        const newQty = Math.max(0, currentQty - convertedNeeded);
        if (newQty <= 0) {
          pantryItems = pantryItems.filter(p => p.id !== matchedItem!.id);
          results.push({
            ingredientName: ing.name,
            amountConsumed: currentQty,
            unit: matchedItem.unit,
            pantryItemName: matchedItem.name,
            newQuantity: 0,
            status: 'depleted'
          });
        } else {
          pantryItems = pantryItems.map(p => p.id === matchedItem!.id ? { ...p, quantity: newQty } : p);
          results.push({
            ingredientName: ing.name,
            amountConsumed: convertedNeeded,
            unit: matchedItem.unit,
            pantryItemName: matchedItem.name,
            newQuantity: newQty,
            status: 'reduced'
          });
        }
      } else {
        results.push({
          ingredientName: ing.name,
          amountConsumed: 0,
          unit: ing.unit,
          pantryItemName: 'Non in dispensa',
          newQuantity: 0,
          status: 'not_found'
        });
      }
    }
    localStorage.setItem(`pantry_${userId}`, JSON.stringify(pantryItems));
    return results;
  }

  const pantryPath = `users/${userId}/pantry`;
  const pantrySnapshot = await getDocs(collection(db, pantryPath));
  const pantryItems: PantryItem[] = pantrySnapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  } as PantryItem));

  const results: ConsumptionResult[] = [];

  for (const ing of recipe.ingredients) {
    if (isStaple(ing.name)) {
      continue;
    }

    const neededAmount = scaleIngredientAmount(ing.amount, recipe.servings || 2, targetServings);
    
    // Find matching item in pantry
    let matchedItem = pantryItems.find(p => p.quantity > 0 && checkIngredientMatch(p.name, ing.name));
    
    if (!matchedItem) {
      // Try raw component mapping
      const raws = getRawIngredientNames(ing.name);
      if (raws.length > 0) {
        for (const rawName of raws) {
          const m = pantryItems.find(p => p.quantity > 0 && checkIngredientMatch(p.name, rawName));
          if (m) {
            matchedItem = m;
            break;
          }
        }
      }
    }

    if (matchedItem) {
      const currentQty = matchedItem.quantity;
      const convertedNeeded = convertIngredientUnit(neededAmount, ing.unit, matchedItem.unit);
      const newQty = Math.max(0, currentQty - convertedNeeded);
      
      const itemRef = doc(db, pantryPath, matchedItem.id);

      if (newQty <= 0) {
        await deleteDoc(itemRef);
        results.push({
          ingredientName: ing.name,
          amountConsumed: currentQty,
          unit: matchedItem.unit,
          pantryItemName: matchedItem.name,
          newQuantity: 0,
          status: 'depleted'
        });
      } else {
        await updateDoc(itemRef, { quantity: newQty });
        results.push({
          ingredientName: ing.name,
          amountConsumed: convertedNeeded,
          unit: matchedItem.unit,
          pantryItemName: matchedItem.name,
          newQuantity: newQty,
          status: 'reduced'
        });
      }
    } else {
      results.push({
        ingredientName: ing.name,
        amountConsumed: neededAmount,
        unit: ing.unit,
        pantryItemName: ing.name,
        newQuantity: 0,
        status: 'not_found'
      });
    }
  }

  return results;
}
