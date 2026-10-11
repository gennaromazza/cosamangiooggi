import type { DayPlan, FamilyMember, Recipe, UserProfile, WeeklyPlan } from '../types';
import { hitsExclusion, satisfiesDiet } from './dietFilters';
import { fitsMember, hasPersonalRules, isMain, pickAlternatives } from './memberAlternatives';

export type Slot = 'lunch' | 'dinner';

export interface PlanIssue {
  day: string;
  slot: Slot;
  /**
   * family: un piatto non rispetta più dieta o allergie di tutta la famiglia
   * member: una persona con regole proprie non ha un piatto adatto
   * orphan: restano alternative di persone che non sono più a tavola
   */
  kind: 'family' | 'member' | 'orphan';
  recipeId?: string;
  memberId?: string;
}

type FamilyRules = Pick<UserProfile, 'dietaryRestrictions' | 'excludedIngredients'> | null | undefined;

const slotIds = (day: DayPlan, slot: Slot) => (slot === 'lunch' ? day.lunchIds : day.dinnerIds) || [];
const slotAlt = (day: DayPlan, slot: Slot) => (slot === 'lunch' ? day.lunchAlt : day.dinnerAlt) || {};

const violatesFamily = (recipe: Recipe, rules: FamilyRules) =>
  !satisfiesDiet(recipe, rules?.dietaryRestrictions || []) || hitsExclusion(recipe, rules?.excludedIngredients || []);

/**
 * Confronta il menù già creato con le regole di adesso (solo quelle rigide: diete e allergie).
 * I gusti (piatti e ingredienti non graditi) sono preferenze: non rendono un menù "non più valido".
 */
export function findPlanIssues(args: {
  plan: WeeklyPlan | null;
  recipes: Recipe[];
  rules: FamilyRules;
  members: FamilyMember[];
}): PlanIssue[] {
  const { plan, recipes, rules, members } = args;
  if (!plan) return [];
  const byId = new Map(recipes.map((r) => [r.id, r]));
  const memberIds = new Set(members.map((m) => m.id));
  const issues: PlanIssue[] = [];

  for (const [day, dayPlan] of Object.entries(plan.days)) {
    for (const slot of ['lunch', 'dinner'] as Slot[]) {
      const dishes = slotIds(dayPlan, slot).map((id) => byId.get(id)).filter((r): r is Recipe => !!r);
      if (dishes.length === 0) continue;

      dishes
        .filter((recipe) => violatesFamily(recipe, rules))
        .forEach((recipe) => issues.push({ day, slot, kind: 'family', recipeId: recipe.id }));

      const alt = slotAlt(dayPlan, slot);
      const mains = dishes.filter(isMain);
      for (const member of members.filter(hasPersonalRules)) {
        if (mains.every((recipe) => fitsMember(recipe, member))) continue;
        const altRecipe = alt[member.id] ? byId.get(alt[member.id]) : undefined;
        if (!altRecipe || !fitsMember(altRecipe, member) || violatesFamily(altRecipe, rules)) {
          issues.push({ day, slot, kind: 'member', memberId: member.id });
        }
      }
      if (Object.keys(alt).some((memberId) => !memberIds.has(memberId))) issues.push({ day, slot, kind: 'orphan' });
    }
  }
  return issues;
}

/** Impronta dei problemi trovati: serve a ricordare "Lascia così" finché non cambiano. */
export const issuesKey = (issues: PlanIssue[]): string =>
  issues.map((i) => `${i.day}:${i.slot}:${i.kind}:${i.recipeId || ''}:${i.memberId || ''}`).sort().join('|');

/**
 * Ricostruisce solo i pasti interessati, lasciando intatto il resto della settimana:
 * sostituisce i piatti che violano le regole della famiglia e rifà le alternative per chi ne ha bisogno.
 * `pool` contiene solo ricette valide per tutta la famiglia (stagione, dieta e allergie comuni).
 */
export function rebuildAffectedMeals(args: {
  plan: WeeklyPlan;
  issues: PlanIssue[];
  recipes: Recipe[];
  pool: Recipe[];
  members: FamilyMember[];
  random?: () => number;
}): { plan: WeeklyPlan; replaced: number; slots: number } {
  const { plan, issues, recipes, pool, members, random = Math.random } = args;
  const byId = new Map(recipes.map((r) => [r.id, r]));
  const memberIds = new Set(members.map((m) => m.id));
  const days: WeeklyPlan['days'] = Object.fromEntries(Object.entries(plan.days).map(([k, v]) => [k, { ...v }]));

  const used = new Set<string>();
  Object.values(days).forEach((d) => [...(d.lunchIds || []), ...(d.dinnerIds || [])].forEach((id) => used.add(id)));

  const softDislikes = members.flatMap((m) => m.dislikedIngredients || []);
  const dislikedMeals = new Set(members.flatMap((m) => m.dislikedMeals || []));
  let replaced = 0;

  const affected = new Map<string, { day: string; slot: Slot }>();
  issues.forEach((i) => affected.set(`${i.day}:${i.slot}`, { day: i.day, slot: i.slot }));

  for (const { day, slot } of affected.values()) {
    const dayPlan = days[day];
    const key = slot === 'lunch' ? 'lunchIds' : 'dinnerIds';
    const altKey = slot === 'lunch' ? 'lunchAlt' : 'dinnerAlt';
    const badIds = new Set(issues.filter((i) => i.day === day && i.slot === slot && i.kind === 'family').map((i) => i.recipeId));

    const nextIds = (dayPlan[key] || []).map((id) => {
      if (!badIds.has(id)) return id;
      const old = byId.get(id);
      const candidates = pool.filter((r) => r.id !== id && !used.has(r.id) && (!old || isMain(r) === isMain(old)));
      if (candidates.length === 0) return id;
      const sameProtein = candidates.filter((r) => old?.proteinType && r.proteinType === old.proteinType);
      const base = sameProtein.length > 0 ? sameProtein : candidates;
      const liked = base.filter((r) => !dislikedMeals.has(r.id) && !hitsExclusion(r, softDislikes));
      const choices = liked.length > 0 ? liked : base;
      const picked = choices[Math.floor(random() * choices.length)];
      used.add(picked.id);
      replaced += 1;
      return picked.id;
    });
    dayPlan[key] = nextIds;

    const mains = nextIds.map((id) => byId.get(id)).filter((r): r is Recipe => !!r && isMain(r));
    const alt = pickAlternatives({ mains, members, pool, random });
    delete dayPlan[altKey];
    if (Object.keys(alt).length > 0) dayPlan[altKey] = alt;
    // Il pasto è cambiato: non è più quello pensato per mangiare tutti insieme
    if (slot === 'lunch') delete dayPlan.lunchTogether;
    else delete dayPlan.dinnerTogether;
  }

  // Alternative di persone che non ci sono più: via, anche nei pasti non toccati
  for (const dayPlan of Object.values(days)) {
    for (const altKey of ['lunchAlt', 'dinnerAlt'] as const) {
      const alt = dayPlan[altKey];
      if (!alt) continue;
      const kept = Object.fromEntries(Object.entries(alt).filter(([memberId]) => memberIds.has(memberId)));
      if (Object.keys(kept).length === 0) delete dayPlan[altKey];
      else dayPlan[altKey] = kept;
    }
  }

  return { plan: { ...plan, days }, replaced, slots: affected.size };
}
