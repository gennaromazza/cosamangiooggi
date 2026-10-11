import { DietaryRestriction, Recipe } from '../types';
import { matchesExclusion } from './pantrySync';

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
    if (restriction === 'lactose-free') return tags.includes('lactose-free');
    if (restriction === 'gluten-free') return tags.includes('gluten-free');
    return true;
  });
}

/** Vero se la ricetta contiene (nel titolo, negli ingredienti o come proteina) uno degli ingredienti elencati. */
export function hitsExclusion(recipe: Recipe, exclusions: string[]): boolean {
  return exclusions.some(excluded => {
    const trimmed = excluded.trim();
    if (!trimmed) return false;
    if (matchesExclusion(recipe.title, trimmed)) return true;
    if (recipe.ingredients.some(ing => matchesExclusion(ing.name, trimmed))) return true;
    return !!recipe.proteinType && !!CATEGORY_EXCLUSION_MAP[trimmed.toLowerCase()]?.includes(recipe.proteinType);
  });
}
