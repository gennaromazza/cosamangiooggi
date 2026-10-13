import type { FamilyMember, Recipe, WeeklyPlan } from '../types';
import { fitsMember, isMain, pickAlternatives } from './memberAlternatives';

export const WEEK_DAYS = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];

export type ManualDays = Record<string, { lunchIds: string[]; dinnerIds: string[] }>;
export type ManualSlot = 'lunch' | 'dinner';

export const emptyManualDays = (): ManualDays =>
  Object.fromEntries(WEEK_DAYS.map((day) => [day, { lunchIds: [], dinnerIds: [] }]));

/** Parte dal menù attuale (se c'è) per modificarlo, altrimenti da una settimana vuota. */
export function manualDaysFromPlan(plan: WeeklyPlan | null): ManualDays {
  const days = emptyManualDays();
  if (!plan) return days;
  for (const day of WEEK_DAYS) {
    const source = plan.days[day];
    if (source) days[day] = { lunchIds: [...(source.lunchIds || [])], dinnerIds: [...(source.dinnerIds || [])] };
  }
  return days;
}

export const addToSlot = (days: ManualDays, day: string, slot: ManualSlot, recipeId: string): ManualDays => {
  const current = days[day] || { lunchIds: [], dinnerIds: [] };
  const key = slot === 'lunch' ? 'lunchIds' : 'dinnerIds';
  return { ...days, [day]: { ...current, [key]: [...current[key], recipeId] } };
};

export const removeFromSlot = (days: ManualDays, day: string, slot: ManualSlot, index: number): ManualDays => {
  const current = days[day] || { lunchIds: [], dinnerIds: [] };
  const key = slot === 'lunch' ? 'lunchIds' : 'dinnerIds';
  return { ...days, [day]: { ...current, [key]: current[key].filter((_, i) => i !== index) } };
};

/** Cambia il piatto in una posizione (per esempio con la versione modificata), senza spostare gli altri. */
export const replaceInSlot = (days: ManualDays, day: string, slot: ManualSlot, index: number, recipeId: string): ManualDays => {
  const current = days[day] || { lunchIds: [], dinnerIds: [] };
  const key = slot === 'lunch' ? 'lunchIds' : 'dinnerIds';
  return { ...days, [day]: { ...current, [key]: current[key].map((id, i) => (i === index ? recipeId : id)) } };
};

export const countManualMeals = (days: ManualDays): number =>
  Object.values(days).reduce((n, d) => n + (d.lunchIds.length > 0 ? 1 : 0) + (d.dinnerIds.length > 0 ? 1 : 0), 0);

/**
 * Il menù scritto a mano diventa un normale menù della settimana: spesa, dispensa e porzioni funzionano come sempre.
 * I piatti restano esattamente quelli scelti. Solo per chi ha una dieta o un'allergia che un piatto non rispetta
 * si prepara l'alternativa (come negli altri menù); i gusti non generano alternative, perché i piatti li ha scelti l'utente.
 */
export function buildManualPlan(args: {
  days: ManualDays;
  recipes: Recipe[];
  members: FamilyMember[];
  pool: Recipe[];
  now?: Date;
  random?: () => number;
}): WeeklyPlan {
  const { days, recipes, members, pool, now = new Date(), random = Math.random } = args;
  const byId = new Map(recipes.map((r) => [r.id, r]));
  const planDays: WeeklyPlan['days'] = {};
  for (const day of WEEK_DAYS) {
    const source = days[day] || { lunchIds: [], dinnerIds: [] };
    const entry: WeeklyPlan['days'][string] = { lunchIds: [...source.lunchIds], dinnerIds: [...source.dinnerIds] };
    for (const slot of ['lunch', 'dinner'] as ManualSlot[]) {
      const ids = slot === 'lunch' ? source.lunchIds : source.dinnerIds;
      const mains = ids.map((id) => byId.get(id)).filter((r): r is Recipe => !!r && isMain(r));
      if (mains.length === 0) continue;
      const alt = pickAlternatives({ mains, members, pool, random });
      const hard = Object.fromEntries(
        Object.entries(alt).filter(([memberId]) => {
          const member = members.find((m) => m.id === memberId);
          return !!member && mains.some((r) => !fitsMember(r, member));
        }),
      );
      if (Object.keys(hard).length > 0) entry[slot === 'lunch' ? 'lunchAlt' : 'dinnerAlt'] = hard;
    }
    planDays[day] = entry;
  }
  return { id: 'current', startDate: now.toISOString(), manual: true, days: planDays };
}
