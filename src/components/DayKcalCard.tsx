import { AlertTriangle, Flame } from 'lucide-react';
import { dayKcal, mealBudgets, reservedKcal, MEAL_LABELS, type MealSlot } from '../lib/calories';
import type { DayPlan, Recipe } from '../types';

interface Props {
  day: DayPlan | undefined;
  recipes: Recipe[];
  /** Limite di calorie al giorno per persona, se attivato */
  target: number | null;
}

/** Calorie del giorno per persona (stima dagli ingredienti), con il limite scelto e quanto manca o si supera. */
export default function DayKcalCard({ day, recipes, target }: Props) {
  const lookup = new Map<string, Recipe>(recipes.map((r) => [r.id, r] as [string, Recipe]));
  const { total, byMeal } = dayKcal(day, lookup);
  if (total === 0) return null;

  const hasExtraMeals = !!(byMeal.breakfast || byMeal.snackAm || byMeal.snackPm);
  // Se colazione e merende non sono nel menù, la loro parte resta riservata dentro il limite
  const reserved = target && !hasExtraMeals ? reservedKcal(target) : 0;
  const counted = total + reserved;
  const over = target ? counted > target : false;
  const budgets = target ? mealBudgets(target) : null;
  const percent = target ? Math.min(100, Math.round((counted / target) * 100)) : 0;
  const slots = (['breakfast', 'snackAm', 'lunch', 'snackPm', 'dinner'] as MealSlot[]).filter((slot) => byMeal[slot] !== undefined);

  return (
    <div className={`rounded-2xl border px-4 py-3 space-y-3 ${over ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500" /> Calorie del giorno <span className="font-normal text-slate-500">(a persona)</span>
        </p>
        <p className="text-sm font-bold text-slate-900">
          {Math.round(counted)}
          {target ? <span className="font-medium text-slate-500"> / {target} kcal</span> : <span className="font-medium text-slate-500"> kcal</span>}
        </p>
      </div>

      {target && (
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden" role="progressbar" aria-valuenow={Math.round(counted)} aria-valuemin={0} aria-valuemax={target} aria-label="Calorie del giorno">
          <div className={`h-full rounded-full ${over ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${percent}%` }} />
        </div>
      )}

      <ul className="text-sm text-slate-600 space-y-0.5">
        {slots.map((slot) => (
          <li key={slot} className="flex justify-between gap-3">
            <span>{MEAL_LABELS[slot]}</span>
            <span className={budgets && (byMeal[slot] as number) > budgets[slot] ? 'font-semibold text-amber-800' : ''}>
              {Math.round(byMeal[slot] as number)}{budgets ? ` / ${budgets[slot]}` : ''} kcal
            </span>
          </li>
        ))}
        {reserved > 0 && (
          <li className="flex justify-between gap-3 text-slate-500">
            <span>Colazione e merende (riservate)</span>
            <span>{reserved} kcal</span>
          </li>
        )}
      </ul>

      {over && target && (
        <p role="alert" className="text-sm text-amber-900 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          Questo giorno supera il tuo limite di {target} kcal di circa {Math.round(counted - target)}. Cambia un piatto o togli un contorno.
        </p>
      )}
      <p className="text-xs text-slate-400">Stime calcolate dagli ingredienti: servono a orientarsi, non sostituiscono il parere di un medico o di un nutrizionista.</p>
    </div>
  );
}
