import type { DayPlan, FamilyMember, Recipe } from '../types';
import { capPool, type MealSlot } from './calories';
import { fitsMember, happyWith } from './memberAlternatives';

/** Colazione e merende: dove stanno nel giorno del menù e da quale gruppo di piatti si scelgono. */
export const SLOT_KEY = {
  breakfast: 'breakfastIds',
  snackAm: 'snackAmIds',
  lunch: 'lunchIds',
  snackPm: 'snackPmIds',
  dinner: 'dinnerIds',
} as const satisfies Record<MealSlot, keyof DayPlan>;

export type MorningSlot = 'breakfast' | 'snackAm' | 'snackPm';
export const MORNING_SLOTS: MorningSlot[] = ['breakfast', 'snackAm', 'snackPm'];
/** Ordine nella giornata, per mostrare e per scrivere il menù */
export const DAY_SLOTS: MealSlot[] = ['breakfast', 'snackAm', 'lunch', 'snackPm', 'dinner'];

export const slotCategory = (slot: MorningSlot): 'breakfast' | 'snack' => (slot === 'breakfast' ? 'breakfast' : 'snack');

export const SLOT_TITLES: Record<MealSlot, string> = {
  breakfast: 'Colazione',
  snackAm: 'Spuntino di metà mattina',
  lunch: 'Pranzo',
  snackPm: 'Merenda',
  dinner: 'Cena',
};

/** Il giorno ha almeno un piatto a colazione o nelle merende. */
export const hasMorningMeals = (day: Partial<DayPlan> | undefined): boolean =>
  !!day && MORNING_SLOTS.some((slot) => (day[SLOT_KEY[slot]] as string[] | undefined)?.length);

/** Il menù ha colazione o merende in almeno un giorno. */
export const planHasMorningMeals = (days: Record<string, Partial<DayPlan>> | undefined): boolean =>
  !!days && Object.values(days).some((day) => hasMorningMeals(day));

export interface PickArgs {
  /** Tutti i piatti che si possono usare (già filtrati per stagione, dieta e allergie di tutti) */
  recipes: Recipe[];
  slot: MorningSlot;
  members: FamilyMember[];
  /** Piatti già presi in questa settimana: si evita di ripeterli */
  used?: Set<string>;
  /** Calorie del pasto, se c'è un limite */
  budget?: number;
  /** Piatto da non riproporre (per esempio quello che si sta cambiando) */
  avoid?: string;
  random?: () => number;
}

/**
 * Sceglie un piatto per colazione o merenda adatto a TUTTI (dieta e allergie di ognuno, e se possibile anche i gusti),
 * che non sia già in settimana e che stia nelle calorie del pasto. Se non c'è nulla di ideale si allarga a poco a poco.
 */
export function pickMorningMeal({ recipes, slot, members, used = new Set(), budget, avoid, random = Math.random }: PickArgs): Recipe | undefined {
  const category = slotCategory(slot);
  const all = recipes.filter((r) => r.category === category && r.id !== avoid);
  if (all.length === 0) return undefined;

  const stages: Recipe[][] = [
    all.filter((r) => members.every((m) => happyWith(r, m))),
    all.filter((r) => members.every((m) => fitsMember(r, m))),
    all,
  ];
  let pool = stages.find((stage) => stage.length > 0) || all;
  const fresh = pool.filter((r) => !used.has(r.id));
  if (fresh.length > 0) pool = fresh;
  if (budget) pool = capPool(pool, budget);
  return pool[Math.floor(random() * pool.length)];
}

/** Colazione e due merende di un giorno. */
export function buildMorningDay(
  args: Omit<PickArgs, 'slot' | 'avoid' | 'budget'> & { budgets?: Partial<Record<MorningSlot, number>> },
): Partial<Pick<DayPlan, 'breakfastIds' | 'snackAmIds' | 'snackPmIds'>> {
  const out: Partial<Pick<DayPlan, 'breakfastIds' | 'snackAmIds' | 'snackPmIds'>> = {};
  const used = new Set(args.used || []);
  for (const slot of MORNING_SLOTS) {
    const recipe = pickMorningMeal({ ...args, slot, used, budget: args.budgets?.[slot] });
    if (!recipe) continue;
    out[SLOT_KEY[slot]] = [recipe.id];
    used.add(recipe.id);
    args.used?.add(recipe.id);
  }
  return out;
}
