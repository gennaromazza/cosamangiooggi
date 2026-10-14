import type { FamilyMember, Recipe, WeeklyPlan } from '../types';
import { fitsMember, isMain, pickAlternatives } from './memberAlternatives';
import type { MealSlot } from './calories';
import { DAY_SLOTS, SLOT_KEY } from './morningMeals';

export const WEEK_DAYS = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];

export interface ManualDay {
  lunchIds: string[];
  dinnerIds: string[];
  breakfastIds?: string[];
  snackAmIds?: string[];
  snackPmIds?: string[];
}
export type ManualDays = Record<string, ManualDay>;
export type ManualSlot = MealSlot;

export const emptyManualDays = (): ManualDays =>
  Object.fromEntries(WEEK_DAYS.map((day) => [day, { lunchIds: [], dinnerIds: [] }]));

/** Parte dal menù attuale (se c'è) per modificarlo, altrimenti da una settimana vuota. */
export function manualDaysFromPlan(plan: WeeklyPlan | null): ManualDays {
  const days = emptyManualDays();
  if (!plan) return days;
  for (const day of WEEK_DAYS) {
    const source = plan.days[day];
    if (!source) continue;
    const entry: ManualDay = { lunchIds: [...(source.lunchIds || [])], dinnerIds: [...(source.dinnerIds || [])] };
    for (const slot of ['breakfast', 'snackAm', 'snackPm'] as const) {
      const key = SLOT_KEY[slot];
      if (source[key]?.length) entry[key] = [...(source[key] as string[])];
    }
    days[day] = entry;
  }
  return days;
}

export const idsOf = (day: ManualDay | undefined, slot: ManualSlot): string[] => (day ? ((day[SLOT_KEY[slot]] as string[] | undefined) ?? []) : []);

export const addToSlot = (days: ManualDays, day: string, slot: ManualSlot, recipeId: string): ManualDays => {
  const current = days[day] || { lunchIds: [], dinnerIds: [] };
  return { ...days, [day]: { ...current, [SLOT_KEY[slot]]: [...idsOf(current, slot), recipeId] } };
};

export const removeFromSlot = (days: ManualDays, day: string, slot: ManualSlot, index: number): ManualDays => {
  const current = days[day] || { lunchIds: [], dinnerIds: [] };
  return { ...days, [day]: { ...current, [SLOT_KEY[slot]]: idsOf(current, slot).filter((_, i) => i !== index) } };
};

/** Cambia il piatto in una posizione (per esempio con la versione modificata), senza spostare gli altri. */
export const replaceInSlot = (days: ManualDays, day: string, slot: ManualSlot, index: number, recipeId: string): ManualDays => {
  const current = days[day] || { lunchIds: [], dinnerIds: [] };
  return { ...days, [day]: { ...current, [SLOT_KEY[slot]]: idsOf(current, slot).map((id, i) => (i === index ? recipeId : id)) } };
};

export const countManualMeals = (days: ManualDays): number =>
  Object.values(days).reduce((n, d) => n + DAY_SLOTS.filter((slot) => idsOf(d, slot).length > 0).length, 0);

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
    // Colazione e merende restano come scritte: non hanno alternative per persona
    for (const slot of ['breakfast', 'snackAm', 'snackPm'] as const) {
      const ids = idsOf(source, slot);
      if (ids.length > 0) entry[SLOT_KEY[slot]] = [...ids];
    }
    for (const slot of ['lunch', 'dinner'] as const) {
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

/** Sostituisce un piatto con un altro in tutto il menù (per esempio con la versione corretta dall'utente). */
export function replaceRecipeInPlan(plan: WeeklyPlan, from: string, to: string): WeeklyPlan {
  if (from === to) return plan;
  const swap = (ids: string[] | undefined) => (ids ? ids.map((id) => (id === from ? to : id)) : ids);
  const days: WeeklyPlan['days'] = {};
  for (const [name, day] of Object.entries(plan.days)) {
    const next = { ...day } as WeeklyPlan['days'][string];
    for (const slot of DAY_SLOTS) {
      const key = SLOT_KEY[slot];
      if (day[key]) (next as unknown as Record<string, unknown>)[key] = swap(day[key] as string[]);
    }
    for (const altKey of ['lunchAlt', 'dinnerAlt'] as const) {
      const alt = day[altKey];
      if (alt) next[altKey] = Object.fromEntries(Object.entries(alt).map(([member, id]) => [member, id === from ? to : id]));
    }
    days[name] = next;
  }
  return { ...plan, days };
}
