import type { Recipe, WeeklyPlan } from '../types';
import { WEEK_DAYS } from './manualPlan';
import { planMeals } from './memberAlternatives';
import { checkIngredientMatch, extractCoreStems, cleanIngredientName, isStaple } from './pantrySync';
import { getRawIngredientNames } from './utils';

/** Etichette già pronte per la spesa; ognuno ne può aggiungere di sue. */
export const BUILTIN_LABELS = ['Urgente', 'Poco urgente', 'Fresco', 'Surgelato', 'Lunga conservazione'] as const;
export const URGENT_LABEL = 'Urgente';

export interface ShoppingTags {
  /** Etichette di ogni prodotto, per chiave del prodotto */
  labels: Record<string, string[]>;
  /** Etichette create da chi usa l'app */
  custom: string[];
}

export const emptyTags = (): ShoppingTags => ({ labels: {}, custom: [] });

/** Chiave stabile di un prodotto: "Parmigiano" e "Parmigiano reggiano grattugiato" sono lo stesso prodotto. */
export const shoppingKey = (name: string): string => extractCoreStems(name).sort().join(' ') || cleanIngredientName(name);

export const cleanLabel = (label: string): string => label.replace(/\s+/g, ' ').trim().slice(0, 24);

export const labelsOf = (tags: ShoppingTags, name: string): string[] => tags.labels[shoppingKey(name)] || [];

/** Aggiunge o toglie un'etichetta a un prodotto (le etichette nuove entrano tra quelle dell'utente). */
export function toggleLabel(tags: ShoppingTags, name: string, label: string): ShoppingTags {
  const clean = cleanLabel(label);
  if (!clean) return tags;
  const key = shoppingKey(name);
  const current = tags.labels[key] || [];
  const has = current.some((l) => l.toLowerCase() === clean.toLowerCase());
  const next = has ? current.filter((l) => l.toLowerCase() !== clean.toLowerCase()) : [...current, clean];
  const labels = { ...tags.labels };
  if (next.length > 0) labels[key] = next;
  else delete labels[key];
  const builtin = (BUILTIN_LABELS as readonly string[]).map((l) => l.toLowerCase());
  const custom = !has && !builtin.includes(clean.toLowerCase()) && !tags.custom.some((c) => c.toLowerCase() === clean.toLowerCase()) ? [...tags.custom, clean] : tags.custom;
  return { labels, custom };
}

/** Tutte le etichette tra cui scegliere. */
export const allLabels = (tags: ShoppingTags): string[] => [...BUILTIN_LABELS, ...tags.custom];

export interface UseOffset {
  name: string;
  /** Giorni da oggi al primo pasto che lo usa (0 = oggi) */
  offset: number;
}

/**
 * Per ogni ingrediente del menù, tra quanti giorni serve per la prima volta (0 = oggi). Così si può comprare per primo
 * ciò che si mangia prima. `today` è il nome del giorno di oggi nel menù (per esempio «Martedì»).
 */
export function firstUseOffsets(args: {
  plan: WeeklyPlan;
  recipes: Recipe[];
  servings: number;
  memberIds?: Set<string>;
  today: string;
}): UseOffset[] {
  const { plan, recipes, servings, memberIds, today } = args;
  const byId = new Map(recipes.map((r) => [r.id, r]));
  const start = Math.max(0, WEEK_DAYS.indexOf(today));
  const found = new Map<string, UseOffset>();
  WEEK_DAYS.forEach((day, index) => {
    if (!plan.days[day]) return;
    const offset = (index - start + 7) % 7;
    for (const { recipeId } of planMeals({ ...plan, days: { [day]: plan.days[day] } }, servings, memberIds)) {
      const recipe = byId.get(recipeId);
      if (!recipe) continue;
      for (const ing of recipe.ingredients) {
        for (const name of getRawIngredientNames(ing.name)) {
          if (isStaple(name)) continue;
          const key = shoppingKey(name);
          const seen = found.get(key);
          if (!seen || offset < seen.offset) found.set(key, { name, offset });
        }
      }
    }
  });
  return [...found.values()];
}

/** Tra quanti giorni serve un prodotto della spesa; undefined se non è nel menù (per esempio aggiunto a mano). */
export function offsetFor(name: string, uses: UseOffset[]): number | undefined {
  const key = shoppingKey(name);
  let best: number | undefined;
  for (const use of uses) {
    if ((shoppingKey(use.name) === key || checkIngredientMatch(use.name, name)) && (best === undefined || use.offset < best)) best = use.offset;
  }
  return best;
}

export type WhenGroup = 'oggi' | 'domani' | 'presto' | 'dopo' | 'senza';

export const WHEN_GROUPS: { id: WhenGroup; title: string }[] = [
  { id: 'oggi', title: 'Serve oggi' },
  { id: 'domani', title: 'Serve domani' },
  { id: 'presto', title: 'Nei prossimi giorni' },
  { id: 'dopo', title: 'Più avanti nella settimana' },
  { id: 'senza', title: 'Aggiunti da te' },
];

export const whenGroup = (offset: number | undefined): WhenGroup =>
  offset === undefined ? 'senza' : offset === 0 ? 'oggi' : offset === 1 ? 'domani' : offset <= 3 ? 'presto' : 'dopo';

export const whenText = (offset: number | undefined): string =>
  offset === undefined ? '' : offset === 0 ? 'serve oggi' : offset === 1 ? 'serve domani' : `serve tra ${offset} giorni`;

export interface OrderableItem {
  name: string;
  offset?: number;
  labels: string[];
}

/** Ordine della spesa: prima gli urgenti, poi ciò che serve prima, poi per nome. */
export function compareShopping(a: OrderableItem, b: OrderableItem): number {
  const ua = a.labels.includes(URGENT_LABEL) ? 0 : 1;
  const ub = b.labels.includes(URGENT_LABEL) ? 0 : 1;
  if (ua !== ub) return ua - ub;
  const oa = a.offset ?? 99;
  const ob = b.offset ?? 99;
  if (oa !== ob) return oa - ob;
  return a.name.localeCompare(b.name, 'it');
}

/** Raggruppa per etichetta: un prodotto con più etichette compare in ognuna; chi non ne ha va in fondo. */
export function groupByLabel<T extends OrderableItem>(items: T[], labels: string[]): { label: string | null; items: T[] }[] {
  const groups = labels.map((label) => ({ label: label as string | null, items: items.filter((i) => i.labels.some((l) => l.toLowerCase() === label.toLowerCase())) }));
  const none = items.filter((i) => i.labels.length === 0);
  return [...groups, { label: null, items: none }].filter((g) => g.items.length > 0).map((g) => ({ ...g, items: [...g.items].sort(compareShopping) }));
}
