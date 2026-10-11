import { useMemo, useState } from 'react';
import { Check, Plus, Sparkles, Trash2, X } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../lib/firebase';
import type { Ingredient, Recipe } from '../types';
import { inferDishInfo, parseIngredientText } from '../lib/dishInference';

interface Props {
  initialTitle?: string;
  /** Account senza accesso (demo/locale): niente riconoscimento con l'IA */
  offlineOnly?: boolean;
  /** Riconoscimenti IA rimasti questo mese (null se non si sa) */
  aiLeft?: number | null;
  /** Se il piano è già Chef IA */
  isPro?: boolean;
  onUpgrade?: () => void;
  onSave: (recipe: Omit<Recipe, 'id'>) => Promise<void> | void;
  onClose: () => void;
}

const CATEGORIES: { id: Recipe['category']; label: string }[] = [
  { id: 'lunch', label: 'Primo' },
  { id: 'dinner', label: 'Secondo' },
  { id: 'fast', label: 'Piatto unico' },
  { id: 'side', label: 'Contorno' },
  { id: 'dessert', label: 'Dolce' },
];
const UNITS = ['g', 'kg', 'ml', 'l', 'pz', 'cucchiai', 'cucchiaini', 'spicchi'];

interface Suggestion {
  ingredients: Ingredient[];
  category: Recipe['category'];
  difficulty: Recipe['difficulty'];
  timeMin: number;
  steps: string[];
  remaining?: number;
}

/** Aggiunta rapida di un piatto di famiglia: nome, ingredienti riconosciuti in automatico, controllo finale. */
export default function QuickDishModal({ initialTitle = '', offlineOnly = false, aiLeft = null, isPro = false, onUpgrade, onSave, onClose }: Props) {
  const [left, setLeft] = useState<number | null>(aiLeft);
  const [title, setTitle] = useState(initialTitle);
  const [notes, setNotes] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [category, setCategory] = useState<Recipe['category']>('lunch');
  const [extra, setExtra] = useState<Pick<Suggestion, 'difficulty' | 'timeMin' | 'steps'>>({ difficulty: 'easy', timeMin: 30, steps: [] });
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const info = useMemo(() => inferDishInfo(ingredients, title), [ingredients, title]);
  const cleanIngredients = ingredients.filter((i) => i.name.trim());

  const recognize = async () => {
    setMessage(null);
    if (title.trim().length < 2) {
      setMessage({ ok: false, text: 'Scrivi prima il nome del piatto.' });
      return;
    }
    setBusy(true);
    try {
      if (!offlineOnly && left !== 0) {
        const result = await httpsCallable<{ title: string; notes: string }, Suggestion>(functions, 'suggestDish')({
          title: title.trim(),
          notes: notes.trim(),
        });
        if (typeof result.data.remaining === 'number') setLeft(result.data.remaining);
        setIngredients(result.data.ingredients);
        setCategory(result.data.category);
        setExtra({ difficulty: result.data.difficulty, timeMin: result.data.timeMin, steps: result.data.steps });
        setMessage({ ok: true, text: 'Ho riconosciuto gli ingredienti: controlla che siano giusti e correggi se serve.' });
        return;
      }
      throw Object.assign(new Error('Riconoscimenti IA finiti'), { code: left === 0 ? 'functions/resource-exhausted' : undefined });
    } catch (error: any) {
      // Senza IA (account senza accesso, tetto raggiunto, rete assente) si legge quello che hai scritto
      const parsed = parseIngredientText(notes);
      if (parsed.length > 0) {
        setIngredients(parsed);
        setMessage({
          ok: true,
          text:
            error?.code === 'functions/resource-exhausted'
              ? `${left === 0 && !isPro ? 'Hai finito i riconoscimenti IA di prova di questo mese.' : error.message} Ho letto gli ingredienti che hai scritto: controllali.`
              : 'Ho letto gli ingredienti che hai scritto: controllali e correggi quantità e unità.',
        });
      } else {
        setMessage({
          ok: false,
          text: offlineOnly
            ? 'Scrivi gli ingredienti nella casella qui sopra, separati da una virgola.'
            : error?.message && error?.code ? String(error.message) : 'Non riesco a riconoscerli ora: scrivi gli ingredienti separati da una virgola.',
        });
      }
    } finally {
      setBusy(false);
    }
  };

  const update = (index: number, patch: Partial<Ingredient>) =>
    setIngredients((list) => list.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  const save = async () => {
    if (title.trim().length < 2 || cleanIngredients.length === 0) return;
    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        category,
        difficulty: extra.difficulty,
        timeMin: extra.timeMin,
        servings: 2,
        proteinType: info.proteinType,
        ingredients: cleanIngredients,
        instructions: extra.steps,
        tags: info.tags,
        season: 'all',
        isWHOCompliant: false,
        hasCarbs: info.hasCarbs,
        hasProtein: info.hasProtein,
        hasVeg: info.hasVeg,
      });
    } finally {
      setSaving(false);
    }
  };

  const diets = [
    { label: 'Vegano', ok: info.tags.includes('vegan') },
    { label: 'Senza glutine', ok: info.tags.includes('gluten-free') },
    { label: 'Senza lattosio', ok: info.tags.includes('lactose-free') },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-slate-900/60" onClick={onClose} />
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl relative z-10 flex flex-col max-h-[92dvh]">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-display text-2xl text-slate-900">Aggiungi un piatto</h3>
          <button onClick={onClose} aria-label="Chiudi" className="p-2 text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="dish-title">Come si chiama?</label>
            <input
              id="dish-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Es. Lasagne di nonna"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 h-12 text-base focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="dish-notes">
              Cosa c’è dentro? <span className="font-normal text-slate-500">(facoltativo)</span>
            </label>
            <textarea
              id="dish-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Scrivilo a parole tue: pasta, ragù, besciamella, parmigiano…"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <button
            onClick={recognize}
            disabled={busy}
            className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-5 h-5" /> {busy ? 'Riconosco gli ingredienti…' : ingredients.length > 0 ? 'Riconosci di nuovo' : 'Riconosci gli ingredienti'}
          </button>

          {!offlineOnly && left !== null && (
            <p className="text-sm text-slate-500 -mt-2 text-center">
              {left > 0
                ? `Riconoscimenti IA rimasti questo mese: ${left}${isPro ? '' : ' (prova)'}`
                : 'Riconoscimenti IA finiti per questo mese: puoi scrivere gli ingredienti a mano.'}
              {left === 0 && !isPro && onUpgrade && (
                <>
                  {' '}
                  <button type="button" onClick={onUpgrade} className="font-bold text-indigo-700 underline underline-offset-2">
                    Con Chef IA ne hai 50 al mese
                  </button>
                </>
              )}
            </p>
          )}

          {message && (
            <p role="status" className={`rounded-xl px-4 py-3 text-sm font-semibold ${message.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'}`}>
              {message.text}
            </p>
          )}

          {ingredients.length > 0 && (
            <>
              <div className="space-y-2">
                <p className="text-sm font-bold text-slate-700">Ingredienti (per 2 persone)</p>
                {ingredients.map((ing, index) => (
                  <div key={index} className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-100 p-2">
                    <input
                      value={ing.name}
                      onChange={(e) => update(index, { name: e.target.value })}
                      aria-label="Ingrediente"
                      className="basis-full bg-slate-50 border border-slate-200 rounded-xl px-3 h-11 text-base"
                    />
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      value={ing.amount}
                      onChange={(e) => update(index, { amount: Math.max(0, Number(e.target.value)) })}
                      aria-label="Quantità"
                      className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-xl px-2 h-11 text-base"
                    />
                    <select
                      value={ing.unit}
                      onChange={(e) => update(index, { unit: e.target.value })}
                      aria-label="Unità"
                      className="w-28 shrink-0 bg-slate-50 border border-slate-200 rounded-xl px-1 h-11 text-sm"
                    >
                      {[...new Set([ing.unit, ...UNITS])].filter(Boolean).map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => setIngredients((list) => list.filter((_, i) => i !== index))}
                      aria-label="Togli ingrediente"
                      className="shrink-0 w-9 h-11 text-slate-300 hover:text-red-500 flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setIngredients((list) => [...list, { name: '', amount: 100, unit: 'g' }])}
                  className="text-sm font-bold text-indigo-700 flex items-center gap-1.5 py-2"
                >
                  <Plus className="w-4 h-4" /> Aggiungi un ingrediente
                </button>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-700 mb-2">Che piatto è?</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setCategory(c.id)}
                      aria-pressed={category === c.id}
                      className={`px-4 h-10 rounded-full border text-sm font-semibold ${
                        category === c.id ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <p className="text-sm font-bold text-slate-700">Adatto a chi? <span className="font-normal text-slate-500">(lo capisco dagli ingredienti)</span></p>
                <ul className="space-y-1">
                  {diets.map((d) => (
                    <li key={d.label} className="flex items-center gap-2 text-sm">
                      {d.ok ? <Check className="w-4 h-4 text-emerald-600" /> : <X className="w-4 h-4 text-slate-400" />}
                      <span className={d.ok ? 'text-slate-900 font-semibold' : 'text-slate-500'}>{d.label}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-slate-500">Controlla che sia giusto: se un ingrediente è sbagliato, correggilo qui sopra.</p>
              </div>
            </>
          )}
        </div>

        <div className="p-5 border-t border-slate-100">
          <button
            onClick={save}
            disabled={saving || title.trim().length < 2 || cleanIngredients.length === 0}
            className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg disabled:opacity-40"
          >
            {saving ? 'Salvo…' : 'Salva il piatto'}
          </button>
        </div>
      </div>
    </div>
  );
}
