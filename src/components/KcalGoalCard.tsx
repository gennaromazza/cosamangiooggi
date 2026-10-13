import { useState } from 'react';
import { Flame, Minus, Plus } from 'lucide-react';
import { saveProfileFields } from '../lib/profileSave';
import { clampKcal, dailyKcalTarget, DEFAULT_DAILY_KCAL, MEAL_LABELS, mealBudgets, type MealSlot } from '../lib/calories';
import type { UserProfile } from '../types';

interface Props {
  userId: string;
  profile: UserProfile | null;
  /** Account senza accesso: il profilo sta sul dispositivo */
  onLocalChange: (profile: UserProfile) => void;
}

const PRESETS = [1600, 1800, 2000, 2200, 2500];

/** Limite di calorie al giorno per persona: il menù lo rispetta e il giorno mostra quanto manca o si supera. */
export default function KcalGoalCard({ userId, profile, onLocalChange }: Props) {
  const target = dailyKcalTarget(profile);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!profile) return null;

  const save = async (value: number) => {
    setBusy(true);
    setError(null);
    try {
      await saveProfileFields(userId, profile, { dailyKcalTarget: value }, onLocalChange);
    } catch {
      setError('Non è stato possibile salvare. Riprova.');
    } finally {
      setBusy(false);
    }
  };

  const budgets = target ? mealBudgets(target) : null;
  const order: MealSlot[] = ['breakfast', 'snackAm', 'lunch', 'snackPm', 'dinner'];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2"><Flame className="w-5 h-5 text-orange-500" /> Calorie al giorno</h3>
          <p className="text-sm text-slate-500 mt-1 leading-relaxed">
            Se vuoi, il menù resta entro un limite di calorie per persona, contando anche colazione e merende.
          </p>
        </div>
        <button
          role="switch"
          aria-checked={!!target}
          aria-label="Limite di calorie al giorno"
          disabled={busy}
          onClick={() => save(target ? 0 : DEFAULT_DAILY_KCAL)}
          className={`shrink-0 w-14 h-8 rounded-full p-1 transition-colors ${target ? 'bg-indigo-600' : 'bg-slate-300'} disabled:opacity-60`}
        >
          <span className={`block w-6 h-6 rounded-full bg-white shadow transition-transform ${target ? 'translate-x-6' : ''}`} />
        </button>
      </div>

      {target && budgets && (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => save(clampKcal(target - 50))} disabled={busy} aria-label="Meno calorie" className="w-11 h-11 rounded-full border border-slate-200 flex items-center justify-center disabled:opacity-60"><Minus className="w-5 h-5" /></button>
            <p className="text-3xl font-semibold text-slate-900 min-w-[8ch] text-center">{target} <span className="text-base font-medium text-slate-500">kcal</span></p>
            <button onClick={() => save(clampKcal(target + 50))} disabled={busy} aria-label="Più calorie" className="w-11 h-11 rounded-full border border-slate-200 flex items-center justify-center disabled:opacity-60"><Plus className="w-5 h-5" /></button>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {PRESETS.map((p) => (
              <button key={p} onClick={() => save(p)} disabled={busy} aria-pressed={target === p} className={`px-3.5 h-10 rounded-full border text-sm font-semibold ${target === p ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-700'}`}>
                {p}
              </button>
            ))}
          </div>
          <ul className="text-sm text-slate-600 bg-slate-50 rounded-2xl p-3 space-y-1">
            {order.map((slot) => (
              <li key={slot} className="flex justify-between gap-3">
                <span>{MEAL_LABELS[slot]}</span>
                <span className="font-semibold text-slate-800">~{budgets[slot]} kcal</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-500 leading-relaxed">
            Il limite vale per una persona. Le calorie dei piatti sono stime dagli ingredienti: orientano, ma non sostituiscono il parere di un medico o di un nutrizionista.
            Vale dal prossimo menù che crei; quello già creato mostra solo quanto si discosta.
          </p>
        </div>
      )}
      {error && <p role="alert" className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">{error}</p>}
    </div>
  );
}
