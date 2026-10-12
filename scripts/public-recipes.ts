/**
 * Ricette dell'app ridotte ai campi che servono alla pagina pubblica del menù condiviso (/menu).
 * Niente alternative, tag o valori nutrizionali: solo come si chiama il piatto e come si prepara.
 */
import type { Recipe } from '../src/types';

export interface PublicRecipe {
  title: string;
  timeMin: number;
  servings: number;
  ingredients: { name: string; amount: number; unit: string }[];
  instructions: string[];
}

export function publicRecipes(recipes: Recipe[]): Record<string, PublicRecipe> {
  const out: Record<string, PublicRecipe> = {};
  for (const r of recipes) {
    out[r.id] = {
      title: r.title,
      timeMin: r.timeMin || 0,
      servings: r.servings || 2,
      ingredients: r.ingredients.map((i) => ({ name: i.name, amount: i.amount, unit: i.unit })),
      instructions: [...r.instructions],
    };
  }
  return out;
}
