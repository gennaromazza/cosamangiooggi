import { Coffee, RefreshCcw } from 'lucide-react';
import { recipeKcal } from '../lib/calories';
import { MORNING_SLOTS, SLOT_KEY, SLOT_TITLES, type MorningSlot } from '../lib/morningMeals';
import type { DayPlan, Recipe } from '../types';

interface Props {
  day: DayPlan | undefined;
  recipes: Recipe[];
  onOpen: (recipe: Recipe) => void;
  /** Cambia il piatto di quel momento della giornata con un altro adatto */
  onSwap: (slot: MorningSlot) => void;
  busy?: boolean;
}

/** Colazione e merende del giorno: un piatto per volta, con le calorie a persona. */
export default function MorningMeals({ day, recipes, onOpen, onSwap, busy = false }: Props) {
  const byId = new Map(recipes.map((r) => [r.id, r] as [string, Recipe]));
  const rows = MORNING_SLOTS.map((slot) => ({
    slot,
    items: ((day?.[SLOT_KEY[slot]] as string[] | undefined) ?? []).map((id) => byId.get(id)).filter((r): r is Recipe => !!r),
  })).filter((row) => row.items.length > 0);
  if (rows.length === 0) return null;

  return (
    <section aria-label="Colazione e merende" className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3">
      <div className="flex items-center gap-2">
        <div className="bg-amber-50 text-amber-600 p-2 rounded-xl"><Coffee className="w-4 h-4" /></div>
        <h3 className="text-base font-black text-slate-900">Colazione e merende</h3>
      </div>
      <ul className="divide-y divide-slate-100">
        {rows.map(({ slot, items }) =>
          items.map((recipe) => (
            <li key={`${slot}-${recipe.id}`} className="flex items-center gap-3 py-2.5">
              <button onClick={() => onOpen(recipe)} className="flex-1 min-w-0 text-left">
                <span className="block text-[10px] font-extrabold uppercase tracking-widest text-amber-600">{SLOT_TITLES[slot]}</span>
                <span className="block text-sm font-bold text-slate-900 leading-snug">{recipe.title}</span>
                <span className="block text-xs text-slate-500">{recipeKcal(recipe).perServing} kcal · {recipe.timeMin} min</span>
              </button>
              <button
                onClick={() => onSwap(slot)}
                disabled={busy}
                aria-label={`Cambia ${SLOT_TITLES[slot].toLowerCase()}`}
                title="Sostituisci questo piatto"
                className="shrink-0 w-10 h-10 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-indigo-600 flex items-center justify-center disabled:opacity-50"
              >
                <RefreshCcw className="w-4 h-4" />
              </button>
            </li>
          )),
        )}
      </ul>
    </section>
  );
}
