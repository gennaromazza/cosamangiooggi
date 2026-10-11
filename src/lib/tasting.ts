import type { FamilyMember, Recipe } from '../types';
import { fitsMember, isMain } from './memberAlternatives';
import { cleanIngredientName, isStaple } from './pantrySync';

/** Piatti molto conosciuti da proporre nel gioco dei gusti. */
export const FAMOUS_DISH_IDS = [
  'meal-101', 'meal-102', 'meal-121', 'meal-115', 'meal-28', 'meal-4', 'meal-14', 'meal-31', 'meal-136', 'meal-40',
  'meal-13', 'meal-spaghetti-vongole', 'meal-5', 'cold-9', 'meal-25', 'meal-125', 'meal-29', 'meal-19', 'fast-1',
  'meal-105', 'meal-9', 'fast-2', 'meal-12', 'meal-39', 'meal-pasta-norma', 'meal-137', 'meal-16', 'meal-133',
  'meal-186', 'meal-131', 'meal-30', 'meal-11', 'meal-spaghetti-cozze', 'meal-160', 'meal-47', 'meal-122',
  'meal-38', 'meal-2', 'meal-44', 'meal-27', 'meal-18',
];

export type Verdict = 'like' | 'dislike' | 'skip';

/**
 * Piatti da far assaggiare a una persona: solo quelli che può mangiare (dieta e allergie) e che non ha ancora
 * valutato, alternando i tipi (pasta, carne, pesce, legumi...) così si capiscono più gusti con meno domande.
 */
export function pickTastingDishes(args: {
  recipes: Recipe[];
  member: FamilyMember;
  count?: number;
  random?: () => number;
}): Recipe[] {
  const { recipes, member, count = 12, random = Math.random } = args;
  const rated = new Set([...(member.likedMeals || []), ...(member.dislikedMeals || [])]);
  const byId = new Map(recipes.map((r) => [r.id, r]));
  const candidates = FAMOUS_DISH_IDS.map((id) => byId.get(id)).filter(
    (r): r is Recipe => !!r && isMain(r) && !rated.has(r.id) && fitsMember(r, member),
  );

  const groups = new Map<string, Recipe[]>();
  for (const recipe of candidates) {
    const key = recipe.proteinType || 'altro';
    groups.set(key, [...(groups.get(key) || []), recipe]);
  }
  const queues = [...groups.values()].map((list) => [...list].sort(() => random() - 0.5));
  const picked: Recipe[] = [];
  while (picked.length < count && queues.some((q) => q.length > 0)) {
    for (const queue of queues) {
      const next = queue.shift();
      if (next && picked.length < count) picked.push(next);
    }
  }
  return picked;
}

const without = (list: string[] | undefined, id: string) => (list || []).filter((x) => x !== id);
const withId = (list: string[] | undefined, id: string) => ((list || []).includes(id) ? list! : [...(list || []), id]);

/** Cosa salvare quando la persona risponde: un piatto o è gradito o non lo è; "salta" non cambia nulla. */
export function verdictPatch(member: FamilyMember, recipeId: string, verdict: Verdict): Partial<FamilyMember> {
  if (verdict === 'like') {
    return { likedMeals: withId(member.likedMeals, recipeId), dislikedMeals: without(member.dislikedMeals, recipeId) };
  }
  if (verdict === 'dislike') {
    return { dislikedMeals: withId(member.dislikedMeals, recipeId), likedMeals: without(member.likedMeals, recipeId) };
  }
  return {};
}

export interface IngredientSuggestion {
  ingredient: string;
  kind: 'like' | 'dislike';
  dishes: string[];
}

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
const mainIngredients = (recipe: Recipe): string[] =>
  recipe.ingredients
    .slice(0, 3)
    .filter((i) => !isStaple(i.name))
    .map((i) => cleanIngredientName(i.name))
    .filter((name) => name.length > 2);

/**
 * Dai piatti valutati ricava ingredienti da proporre: se tre piatti non graditi hanno lo stesso ingrediente
 * principale (e nessun piatto gradito lo ha), si propone di evitarlo; il contrario per gli ingredienti amati.
 * Sono solo proposte: l'utente conferma.
 */
export function suggestIngredients(args: { member: FamilyMember; recipes: Recipe[]; threshold?: number }): IngredientSuggestion[] {
  const { member, recipes, threshold = 3 } = args;
  const byId = new Map(recipes.map((r) => [r.id, r]));
  const tally = (ids: string[] | undefined) => {
    const map = new Map<string, string[]>();
    for (const id of ids || []) {
      const recipe = byId.get(id);
      if (!recipe) continue;
      for (const name of new Set(mainIngredients(recipe))) map.set(name, [...(map.get(name) || []), recipe.title]);
    }
    return map;
  };
  const disliked = tally(member.dislikedMeals);
  const liked = tally(member.likedMeals);
  const known = new Set([...(member.likedIngredients || []), ...(member.dislikedIngredients || [])].map((x) => cleanIngredientName(x)));

  const out: IngredientSuggestion[] = [];
  disliked.forEach((dishes, name) => {
    if (dishes.length >= threshold && !liked.has(name) && !known.has(name)) out.push({ ingredient: capitalize(name), kind: 'dislike', dishes });
  });
  liked.forEach((dishes, name) => {
    if (dishes.length >= threshold && !disliked.has(name) && !known.has(name)) out.push({ ingredient: capitalize(name), kind: 'like', dishes });
  });
  return out;
}
