import { useMemo, useState } from 'react';
import { Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import type { Recipe } from '../types';
import QuickDishModal from './QuickDishModal';
import {
  addToSlot,
  countManualMeals,
  removeFromSlot,
  replaceInSlot,
  WEEK_DAYS,
  type ManualDays,
  type ManualSlot,
} from '../lib/manualPlan';

interface Props {
  initial: ManualDays;
  recipes: Recipe[];
  /** Ricette che l'utente ha scritto da sé: si propongono per prime */
  customIds: Set<string>;
  isEditing: boolean;
  onSave: (days: ManualDays) => Promise<void> | void;
  /** Salva un piatto scritto a mano e restituisce il suo id */
  onCreateDish: (recipe: Omit<Recipe, 'id'>) => Promise<string | null>;
  /** Salva il piatto corretto e restituisce il suo id: lo stesso se era scritto da te, uno nuovo (copia tua) se era dell'app */
  onEditDish: (original: Recipe, edited: Omit<Recipe, 'id'>) => Promise<string | null>;
  onClose: () => void;
}

const SLOTS: { id: ManualSlot; label: string }[] = [
  { id: 'lunch', label: 'Pranzo' },
  { id: 'dinner', label: 'Cena' },
];

/** Scrivi il tuo menù: per ogni giorno, pranzo e cena, scegli i piatti dell'app o scrivine di tuoi (per esempio la dieta del nutrizionista). */
export default function ManualPlanEditor({ initial, recipes, customIds, isEditing, onSave, onCreateDish, onEditDish, onClose }: Props) {
  const [days, setDays] = useState<ManualDays>(initial);
  const [day, setDay] = useState(WEEK_DAYS[0]);
  const [picker, setPicker] = useState<ManualSlot | null>(null);
  const [search, setSearch] = useState('');
  const [writing, setWriting] = useState<ManualSlot | null>(null);
  // Piatto che si sta correggendo: dove sta nel menù (se già inserito) oppure dove aggiungerlo (se scelto dall'elenco)
  const [fixing, setFixing] = useState<{ recipe: Recipe; slot: ManualSlot; index: number | null } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const byId = useMemo(() => new Map(recipes.map((r) => [r.id, r])), [recipes]);
  const results = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return recipes.filter((r) => customIds.has(r.id)).slice(0, 20);
    return recipes.filter((r) => r.title.toLowerCase().includes(term)).slice(0, 40);
  }, [recipes, customIds, search]);

  const meals = countManualMeals(days);
  const current = days[day];

  const add = (slot: ManualSlot, id: string) => {
    setDays((d) => addToSlot(d, day, slot, id));
    setPicker(null);
    setSearch('');
  };

  const save = async () => {
    setSaving(true);
    try {
      await onSave(days);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[55] bg-slate-50 flex flex-col" role="dialog" aria-modal="true" aria-label="Scrivi il tuo menù">
      <div className="px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-3 flex items-start justify-between gap-3 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">{isEditing ? 'Modifica il tuo menù' : 'Scrivi il tuo menù'}</h2>
          <p className="text-sm text-slate-600 mt-0.5 leading-snug">
            Per esempio la dieta del nutrizionista. Resta come l'hai scritto: l'app non lo cambia da sola.
          </p>
        </div>
        <button onClick={onClose} aria-label="Chiudi" className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 shrink-0">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="px-3 pt-3 flex gap-1.5 overflow-x-auto" role="tablist" aria-label="Giorni">
        {WEEK_DAYS.map((d) => {
          const filled = days[d].lunchIds.length + days[d].dinnerIds.length > 0;
          return (
            <button
              key={d}
              role="tab"
              aria-selected={day === d}
              onClick={() => {
                setDay(d);
                setPicker(null);
              }}
              className={`shrink-0 h-11 px-4 rounded-2xl text-sm font-semibold border ${
                day === d ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              {d.slice(0, 3)}
              {filled && <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 align-middle" aria-label="compilato" />}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">{day}</h3>
        {SLOTS.map(({ id, label }) => {
          const ids = id === 'lunch' ? current.lunchIds : current.dinnerIds;
          return (
            <div key={id} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">{label}</p>
              {ids.length === 0 && <p className="text-sm text-slate-400">Nessun piatto</p>}
              {ids.map((rid, i) => (
                <div key={`${rid}-${i}`} className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl pl-3 pr-1 py-1">
                  <span className="flex-1 min-w-0 font-semibold text-slate-800 truncate">{byId.get(rid)?.title || 'Piatto non più disponibile'}</span>
                  {byId.get(rid) && (
                    <button
                      onClick={() => setFixing({ recipe: byId.get(rid)!, slot: id, index: i })}
                      aria-label={`Modifica ${byId.get(rid)!.title}`}
                      className="h-10 px-2.5 rounded-full flex items-center gap-1 text-sm font-semibold text-indigo-700 active:bg-indigo-50"
                    >
                      <Pencil className="w-4 h-4" /> Modifica
                    </button>
                  )}
                  <button
                    onClick={() => setDays((d) => removeFromSlot(d, day, id, i))}
                    aria-label={`Togli ${byId.get(rid)?.title || 'il piatto'}`}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {picker === id ? (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      autoFocus
                      type="search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Cerca un piatto (es. pasta al pomodoro)"
                      className="w-full pl-10 pr-3 h-12 bg-white border border-slate-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>
                  <div className="max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100">
                    {results.length === 0 ? (
                      <p className="text-sm text-slate-500 p-3">{search.trim() ? 'Nessun piatto con questo nome.' : 'Scrivi il nome di un piatto.'}</p>
                    ) : (
                      results.map((r) => (
                        <div key={r.id} className="flex items-center">
                          <button onClick={() => add(id, r.id)} className="flex-1 min-w-0 text-left px-3 py-3 text-sm font-medium text-slate-800 active:bg-slate-50">
                            {r.title}
                          </button>
                          <button
                            onClick={() => setFixing({ recipe: r, slot: id, index: null })}
                            aria-label={`Modifica ${r.title} prima di aggiungerlo`}
                            className="shrink-0 w-11 h-11 mr-1 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  <button
                    onClick={() => setWriting(id)}
                    className="w-full h-11 rounded-2xl border border-dashed border-indigo-300 bg-indigo-50/60 text-indigo-700 text-sm font-bold flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Il piatto non c'è? Scrivilo tu
                  </button>
                  <button onClick={() => { setPicker(null); setSearch(''); }} className="text-sm font-semibold text-slate-500 underline underline-offset-4">
                    Annulla
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setPicker(id);
                    setSearch('');
                  }}
                  className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-bold flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Aggiungi un piatto
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="px-4 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] border-t border-slate-200 bg-slate-50">
        <button
          onClick={save}
          disabled={saving || meals === 0}
          className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-md disabled:opacity-50"
        >
          {saving ? 'Salvo…' : meals === 0 ? 'Aggiungi almeno un piatto' : `Salva il mio menù (${meals} ${meals === 1 ? 'pasto' : 'pasti'})`}
        </button>
      </div>

      {notice && (
        <div role="status" className="fixed left-4 right-4 bottom-24 z-[58] bg-slate-900 text-white rounded-2xl px-4 py-3 text-sm shadow-xl flex items-start justify-between gap-3">
          <span className="leading-relaxed">{notice}</span>
          <button onClick={() => setNotice(null)} aria-label="Chiudi" className="font-bold shrink-0">×</button>
        </div>
      )}

      {fixing && (
        <QuickDishModal
          initial={fixing.recipe}
          offlineOnly
          onSave={async (edited) => {
            const { recipe, slot, index } = fixing;
            const id = await onEditDish(recipe, edited);
            setFixing(null);
            if (!id) {
              setNotice('Non è stato possibile salvare il piatto. Riprova.');
              return;
            }
            const copied = id !== recipe.id;
            if (index === null) add(slot, id);
            else if (copied) setDays((d) => replaceInSlot(d, day, slot, index, id));
            setNotice(copied ? 'Ho salvato la tua versione di questo piatto: l\'originale resta com\'è. Ricordati di salvare il menù.' : 'Piatto aggiornato: vale in tutti i giorni in cui lo hai messo. Ricordati di salvare il menù.');
          }}
          onClose={() => setFixing(null)}
        />
      )}

      {writing && (
        <QuickDishModal
          initialTitle={search.trim()}
          offlineOnly
          onSave={async (recipe) => {
            const id = await onCreateDish(recipe);
            if (id) add(writing, id);
            setWriting(null);
          }}
          onClose={() => setWriting(null)}
        />
      )}
    </div>
  );
}
