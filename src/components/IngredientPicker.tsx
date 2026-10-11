import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';

interface IngredientPickerProps {
  /** Ingredienti proposti */
  options: string[];
  /** Quelli già scelti (anche scritti a mano, non presenti tra le proposte) */
  selected: string[];
  /** Non selezionabili (per esempio già indicati come non graditi) */
  blocked?: string[];
  onToggle: (value: string) => void;
  /** Classi del pulsante scelto */
  activeClass: string;
  placeholder?: string;
}

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

/** Elenco di ingredienti con ricerca: se quello che cerchi manca, lo aggiungi con un tocco. */
export default function IngredientPicker({
  options,
  selected,
  blocked = [],
  onToggle,
  activeClass,
  placeholder = 'Cerca o aggiungi un ingrediente',
}: IngredientPickerProps) {
  const [query, setQuery] = useState('');
  const term = query.trim().toLowerCase();

  // Prima gli ingredienti scritti a mano e già scelti, poi quelli proposti
  const all = useMemo(() => {
    const known = new Set(options.map((o) => o.toLowerCase()));
    const custom = selected.filter((s) => !known.has(s.toLowerCase()));
    return [...custom, ...options];
  }, [options, selected]);

  const visible = term ? all.filter((item) => item.toLowerCase().includes(term)) : all;
  const exact = all.find((item) => item.toLowerCase() === term);
  const canAdd = term.length > 1 && !exact;

  const add = () => {
    if (exact) {
      if (!blocked.includes(exact)) onToggle(exact);
    } else if (canAdd) {
      onToggle(capitalize(query.trim()));
    }
    setQuery('');
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                add();
              }
            }}
            placeholder={placeholder}
            className="w-full pl-10 pr-3 h-12 bg-white border border-slate-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        {canAdd && (
          <button
            type="button"
            onClick={add}
            className="shrink-0 h-12 px-4 rounded-2xl bg-slate-800 text-white text-sm font-bold flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Aggiungi
          </button>
        )}
      </div>

      {canAdd && (
        <p className="text-sm text-slate-500">
          Non lo trovi tra quelli proposti? Tocca «Aggiungi» per inserire «{capitalize(query.trim())}».
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {visible.map((item) => {
          const on = selected.includes(item);
          const isBlocked = blocked.includes(item) && !on;
          return (
            <button
              key={item}
              type="button"
              disabled={isBlocked}
              aria-pressed={on}
              onClick={() => onToggle(item)}
              className={`px-3.5 h-10 rounded-full border text-sm font-medium ${
                on
                  ? activeClass
                  : isBlocked
                    ? 'bg-slate-100 border-slate-200 text-slate-300 line-through cursor-not-allowed'
                    : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              {item}
            </button>
          );
        })}
        {visible.length === 0 && !canAdd && <p className="text-sm text-slate-500">Nessun risultato.</p>}
      </div>
    </div>
  );
}
