import type { FamilyMember, Recipe, WeeklyPlan } from '../types';
import { hitsExclusion, satisfiesDiet } from './dietFilters';

/** Una persona ha regole proprie (dieta o allergie) oltre a quelle di tutta la famiglia. */
export const hasPersonalRules = (member: FamilyMember): boolean =>
  (member.dietaryRestrictions?.length || 0) > 0 || (member.allergies?.length || 0) > 0;

/** Il piatto rispetta la dieta e le allergie di questa persona. */
export const fitsMember = (recipe: Recipe, member: FamilyMember): boolean =>
  satisfiesDiet(recipe, member.dietaryRestrictions || []) && !hitsExclusion(recipe, member.allergies || []);

export const isMain = (recipe: Recipe) => !['side', 'dessert', 'breakfast', 'snack'].includes(recipe.category);

/** Ingredienti che contano davvero in un piatto: titolo e primi tre ingredienti (non il soffritto o la spolverata). */
export const hitsMainIngredient = (recipe: Recipe, ingredients: string[]): boolean =>
  ingredients.length > 0 && hitsExclusion({ ...recipe, ingredients: recipe.ingredients.slice(0, 3) }, ingredients);

/** La persona non gradisce questo piatto: lo ha indicato lui stesso o contiene un suo ingrediente non gradito (tra i principali). */
export const dislikesDish = (recipe: Recipe, member: FamilyMember): boolean =>
  (member.dislikedMeals || []).includes(recipe.id) || hitsMainIngredient(recipe, member.dislikedIngredients || []);

/** Il piatto va bene così com'è per questa persona: rispetta dieta e allergie e non lo gradisce meno. */
export const happyWith = (recipe: Recipe, member: FamilyMember): boolean => fitsMember(recipe, member) && !dislikesDish(recipe, member);

/**
 * Persone per cui il pasto (i piatti principali) non va bene e serve un'alternativa: chi ha una dieta o
 * un'allergia che il piatto non rispetta, e chi non lo gradisce (piatto o ingrediente principale non graditi).
 * Contorni esclusi.
 */
export function membersNeedingAlternative(mains: Recipe[], members: FamilyMember[]): FamilyMember[] {
  const dishes = mains.filter(isMain);
  return members.filter((member) => dishes.some((recipe) => !happyWith(recipe, member)));
}

/**
 * Cosa si toglie dal menù di tutti: un piatto o un ingrediente non gradito si esclude per tutti solo se lo evita
 * almeno metà delle persone. Se lo evita una minoranza resta nel menù e quella persona riceve un'alternativa.
 */
export function dislikeConsensus(
  members: FamilyMember[],
  threshold = 0.5,
): { excludedMealIds: Set<string>; excludedIngredients: string[] } {
  const total = members.length;
  const excludedMealIds = new Set<string>();
  const excludedIngredients: string[] = [];
  if (total === 0) return { excludedMealIds, excludedIngredients };

  const meals = new Map<string, number>();
  const ingredients = new Map<string, { name: string; count: number }>();
  for (const member of members) {
    for (const id of new Set(member.dislikedMeals || [])) meals.set(id, (meals.get(id) || 0) + 1);
    const seen = new Set<string>();
    for (const name of member.dislikedIngredients || []) {
      const key = name.trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      const entry = ingredients.get(key) || { name: name.trim(), count: 0 };
      entry.count += 1;
      ingredients.set(key, entry);
    }
  }
  meals.forEach((count, id) => count / total >= threshold && excludedMealIds.add(id));
  ingredients.forEach(({ name, count }) => count / total >= threshold && excludedIngredients.push(name));
  return { excludedMealIds, excludedIngredients };
}

/**
 * Sceglie un piatto alternativo per ogni persona che ne ha bisogno.
 * `pool` contiene già solo ricette valide per tutta la famiglia (stagione, diete e allergie comuni).
 * `used` ricorda le alternative già date a ciascuno nella settimana, per non ripeterle.
 */
export function pickAlternatives(args: {
  mains: Recipe[];
  members: FamilyMember[];
  pool: Recipe[];
  used?: Map<string, Set<string>>;
  random?: () => number;
}): Record<string, string> {
  const { mains, members, pool, used = new Map(), random = Math.random } = args;
  const result: Record<string, string> = {};
  const mainIds = new Set(mains.map((recipe) => recipe.id));

  for (const member of membersNeedingAlternative(mains, members)) {
    let candidates = pool.filter((recipe) => isMain(recipe) && !mainIds.has(recipe.id) && fitsMember(recipe, member));
    // Gusti della persona: preferenze, si rilassano se non resta nulla (le allergie no)
    const liked = candidates.filter(
      (recipe) =>
        !(member.dislikedMeals || []).includes(recipe.id) && !hitsExclusion(recipe, member.dislikedIngredients || []),
    );
    if (liked.length > 0) candidates = liked;
    if (candidates.length === 0) continue;

    const already = used.get(member.id) || new Set<string>();
    const fresh = candidates.filter((recipe) => !already.has(recipe.id));
    const choices = fresh.length > 0 ? fresh : candidates;
    const picked = choices[Math.floor(random() * choices.length)];
    result[member.id] = picked.id;
    used.set(member.id, new Set([...already, picked.id]));
  }
  return result;
}

/**
 * Quante persone mangiano ogni piatto del piano. Chi ha un'alternativa mangia quella (1 porzione),
 * gli altri mangiano il piatto di tutti: serve a spesa e dispensa per non comprare di troppo.
 * Con `memberIds` si ignorano le alternative di chi non è più a tavola.
 */
export function planMeals(plan: WeeklyPlan, servings: number, memberIds?: Set<string>): { recipeId: string; people: number }[] {
  const people = new Map<string, number>();
  const add = (id: string, count: number) => people.set(id, (people.get(id) || 0) + count);
  for (const day of Object.values(plan.days)) {
    const slots: [string[] | undefined, Record<string, string> | undefined][] = [
      [day.lunchIds, day.lunchAlt],
      [day.dinnerIds, day.dinnerAlt],
    ];
    // Colazione e merende: per tutti lo stesso piatto (si sceglie già adatto a ognuno), quindi niente alternative
    for (const ids of [day.breakfastIds, day.snackAmIds, day.snackPmIds]) (ids || []).forEach((id) => add(id, servings));
    for (const [ids, alt] of slots) {
      // Le alternative di persone non più a tavola non contano
      const altIds = Object.entries(alt || {}).filter(([memberId]) => !memberIds || memberIds.has(memberId)).map(([, recipeId]) => recipeId);
      const forEveryoneElse = Math.max(servings - altIds.length, 0);
      (ids || []).forEach((id) => add(id, forEveryoneElse));
      altIds.forEach((id) => add(id, 1));
    }
  }
  return [...people].filter(([, count]) => count > 0).map(([recipeId, count]) => ({ recipeId, people: count }));
}
