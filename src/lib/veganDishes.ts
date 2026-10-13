import type { Recipe, UserProfile } from '../types';

/** Piatto pensato come alternativa vegana (tofu, seitan, tempeh o «vegano» nel nome), non un piatto che per caso è senza carne. */
export const isVeganDish = (recipe: Pick<Recipe, 'title' | 'ingredients'>): boolean => {
  const title = recipe.title.toLowerCase();
  if (title.includes('vegan')) return true;
  return recipe.ingredients.some((ing) => /tofu|seitan|tempeh/.test(ing.name.toLowerCase()));
};

/** Chi non ha scelto la dieta vegana non deve trovare piatti vegani nel menù. */
export const excludesVeganDishes = (profile: Pick<UserProfile, 'dietaryRestrictions'> | null | undefined): boolean =>
  !(profile?.dietaryRestrictions || []).includes('vegan');
