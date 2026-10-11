import type { FamilyMember, Recipe, TogetherInfo } from '../types';
import { fitsMember, happyWith, isMain, pickAlternatives } from './memberAlternatives';

/** Piatti semplici che piacciono a quasi tutti: la scelta quando nessun piatto va bene a ognuno. */
export const NEUTRAL_DISH_IDS = [
  'meal-19', 'fast-1', 'meal-115', 'meal-4', 'meal-131', 'meal-25', 'meal-31', 'meal-48', 'meal-29', 'meal-28',
  'meal-144', 'meal-14', 'meal-2', 'meal-12', 'meal-17', 'meal-27',
];

export interface TogetherResult {
  ids: string[];
  alt: Record<string, string>;
  info: TogetherInfo;
}

const likesRecipe = (recipe: Recipe, member: FamilyMember) => (member.likedMeals || []).includes(recipe.id);
const pick = <T,>(list: T[], random: () => number): T => list[Math.floor(random() * list.length)];

/**
 * Un pasto in cui si mangia tutti insieme. Cerca, in quest'ordine:
 * 1. un piatto che va bene a ognuno (dieta, allergie e gusti), preferendo quelli amati da più persone;
 * 2. un piatto semplice e conosciuto che va bene al maggior numero di persone;
 * 3. il piatto che va bene a più persone, rispettando prima di tutto dieta e allergie.
 * A chi non va bene il piatto scelto viene preparata un'alternativa.
 * `pool` deve contenere solo ricette valide per tutta la famiglia; `exclude` i piatti già nel menù.
 */
export function planTogetherSlot(args: {
  pool: Recipe[];
  members: FamilyMember[];
  exclude?: Set<string>;
  random?: () => number;
}): TogetherResult | null {
  const { pool, members, exclude = new Set(), random = Math.random } = args;
  const total = members.length;
  if (total === 0) return null;
  const mains = pool.filter((r) => isMain(r) && !exclude.has(r.id));
  if (mains.length === 0) return null;

  const happy = (r: Recipe) => members.filter((m) => happyWith(r, m)).length;
  const hardOk = (r: Recipe) => members.filter((m) => fitsMember(r, m)).length;
  const loved = (r: Recipe) => members.filter((m) => likesRecipe(r, m)).length;
  const best = (list: Recipe[], score: (r: Recipe) => number) => {
    const top = Math.max(...list.map(score));
    return pick(list.filter((r) => score(r) === top), random);
  };

  let chosen: Recipe | undefined;
  let mode: TogetherInfo['mode'];

  const everyone = mains.filter((r) => happy(r) === total);
  if (everyone.length > 0) {
    chosen = best(everyone, loved);
    mode = 'all';
  } else {
    const neutralIds = new Set(NEUTRAL_DISH_IDS);
    const neutral = mains.filter((r) => neutralIds.has(r.id) && hardOk(r) === total);
    const safe = mains.filter((r) => hardOk(r) === total);
    const bestNeutral = neutral.length > 0 ? Math.max(...neutral.map(happy)) : -1;
    const bestSafe = safe.length > 0 ? Math.max(...safe.map(happy)) : -1;
    // Un piatto semplice vale se va bene ad almeno metà delle persone e non è molto peggio del migliore possibile
    if (neutral.length > 0 && bestNeutral * 2 >= total && bestNeutral >= bestSafe - 1) {
      chosen = best(neutral.filter((r) => happy(r) === bestNeutral), loved);
      mode = 'neutral';
    } else {
      chosen = best(mains, (r) => hardOk(r) * 1000 + happy(r) * 10 + loved(r));
      mode = 'majority';
    }
  }

  const alt = pickAlternatives({ mains: [chosen], members, pool, random });
  const fits = members.filter((m) => happyWith(chosen!, m)).length;
  return { ids: [chosen.id], alt, info: { mode: fits === total ? 'all' : mode, fits, total } };
}
