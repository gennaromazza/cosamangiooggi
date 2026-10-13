import type { Ingredient, Recipe } from '../types';
import type { DishInfo } from './dishInference';

export interface DishEdits {
  title: string;
  ingredients: Ingredient[];
  category: Recipe['category'];
  difficulty: Recipe['difficulty'];
  timeMin: number;
  steps: string[];
}

/** I passaggi si scrivono uno per riga: righe vuote e spazi in più non contano. */
export const parseSteps = (text: string): string[] =>
  text
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(\d+[.)]\s*|[-•]\s*)/, '').trim())
    .filter(Boolean);

/**
 * Il piatto dopo la modifica. Parte da quello di prima (stagione, consigli…) e cambia ciò che l'utente ha toccato.
 * Cosa vale per dieta e allergie si ricalcola dagli ingredienti nuovi, e i valori nutrizionali (che erano del piatto di
 * prima) si lasciano ricalcolare all'app.
 */
export function editedDish(base: Recipe, edits: DishEdits, info: DishInfo): Omit<Recipe, 'id'> {
  const { id: _id, nutrients: _nutrients, ...rest } = base;
  return {
    ...rest,
    title: edits.title.trim(),
    category: edits.category,
    difficulty: edits.difficulty,
    timeMin: edits.timeMin,
    servings: base.servings || 2,
    ingredients: edits.ingredients.filter((i) => i.name.trim()).map((i) => ({ ...i, name: i.name.trim() })),
    instructions: edits.steps,
    tags: info.tags,
    proteinType: info.proteinType,
    hasCarbs: info.hasCarbs,
    hasProtein: info.hasProtein,
    hasVeg: info.hasVeg,
    isWHOCompliant: false,
  };
}
