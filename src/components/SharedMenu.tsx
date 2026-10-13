import { useEffect, useMemo, useState } from 'react';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { ChevronDown, Clock, CloudOff, Lock, UtensilsCrossed } from 'lucide-react';
import { db, functions } from '../lib/firebase';
import { INITIAL_RECIPES } from '../data/recipes';
import { dayMenu, dayNameOf, hasMenu, weekMenu } from '../lib/sharedMenu';
import { WEEK_DAYS } from '../lib/manualPlan';
import MenuNotificationsCard from './MenuNotificationsCard';
import JoinFamilyCard from './JoinFamilyCard';
import type { Recipe, WeeklyPlan } from '../types';

interface Props {
  familyId: string;
}

type Failure = 'denied' | 'network' | null;

function RecipeCard({ recipe }: { recipe: Recipe }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-100 rounded-xl">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full min-h-12 px-3 py-2 flex items-center justify-between gap-3 text-left"
      >
        <span className="min-w-0">
          <span className="block font-semibold text-slate-900">{recipe.title}</span>
          {recipe.timeMin > 0 && (
            <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" /> {recipe.timeMin} min</span>
          )}
        </span>
        <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-3 text-sm">
          {recipe.ingredients.length > 0 && (
            <div>
              <p className="font-semibold text-slate-800">Ingredienti{recipe.servings ? ` (per ${recipe.servings})` : ''}</p>
              <ul className="mt-1 text-slate-700 space-y-0.5">
                {recipe.ingredients.map((i, n) => (
                  <li key={`${i.name}-${n}`}>
                    {i.amount > 0 ? `${Math.round(i.amount * 10) / 10} ${i.unit} ` : ''}{i.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {recipe.instructions.length > 0 && (
            <div>
              <p className="font-semibold text-slate-800">Come si prepara</p>
              <ol className="mt-1 text-slate-700 space-y-1.5 list-decimal pl-5">
                {recipe.instructions.map((s, n) => <li key={n}>{s}</li>)}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Meal({ label, recipes }: { label: string; recipes: Recipe[] }) {
  return (
    <section className="space-y-2">
      <h4 className="text-sm font-bold uppercase tracking-wide text-indigo-700">{label}</h4>
      {recipes.length === 0 ? (
        <p className="text-sm text-slate-500">Niente in programma.</p>
      ) : (
        recipes.map((r) => <div key={r.id}><RecipeCard recipe={r} /></div>)
      )}
    </section>
  );
}

/** Il menù di una famiglia a cui ci si è collegati: solo lettura, si aggiorna da solo quando chi lo gestisce lo cambia. */
export default function SharedMenu({ familyId }: Props) {
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [custom, setCustom] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [failure, setFailure] = useState<Failure>(null);
  const [attempt, setAttempt] = useState(0);
  const [view, setView] = useState<'today' | 'week'>('today');
  const [day, setDay] = useState(() => dayNameOf(new Date()));

  useEffect(() => {
    setLoading(true);
    setFailure(null);
    const fail = (e: any) => {
      setFailure(e?.code === 'permission-denied' ? 'denied' : 'network');
      setLoading(false);
    };
    const unsubPlan = onSnapshot(
      doc(db, `users/${familyId}/mealPlans/current`),
      (s) => {
        setPlan(s.exists() ? (s.data() as WeeklyPlan) : null);
        setFailure(null);
        setLoading(false);
      },
      fail,
    );
    const unsubCustom = onSnapshot(
      collection(db, `users/${familyId}/customRecipes`),
      (s) => setCustom(s.docs.map((d) => ({ id: d.id, ...d.data() }) as Recipe)),
      () => setCustom([]),
    );
    return () => {
      unsubPlan();
      unsubCustom();
    };
  }, [familyId, attempt]);

  const recipes = useMemo(() => [...INITIAL_RECIPES, ...custom], [custom]);
  const week = useMemo(() => weekMenu(plan, recipes), [plan, recipes]);
  const today = dayNameOf(new Date());

  const leave = async () => {
    try {
      await httpsCallable(functions, 'leaveFamily')({});
    } catch {
      /* se non riesce, il collegamento resta e si può riprovare dall'account */
    }
  };

  let body;
  if (loading) {
    body = <div role="status" className="py-12 text-center text-slate-500">Carico il menù…</div>;
  } else if (failure === 'denied') {
    body = (
      <div role="alert" className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
        <p className="font-semibold text-amber-900 flex items-center gap-2"><Lock className="w-4 h-4" /> Non vedi più questo menù</p>
        <p className="text-sm text-amber-900 leading-relaxed">
          Chi gestisce la famiglia ti ha scollegato, oppure l'account non esiste più. Chiedi un nuovo invito e inserisci il nuovo codice.
        </p>
        <button onClick={leave} className="h-11 px-4 rounded-xl bg-amber-600 text-white font-bold">Ho capito, esci dalla famiglia</button>
      </div>
    );
  } else if (failure === 'network') {
    body = (
      <div role="alert" className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
        <p className="font-semibold text-slate-900 flex items-center gap-2"><CloudOff className="w-4 h-4" /> Non riesco a caricare il menù</p>
        <p className="text-sm text-slate-600">Controlla la connessione e riprova.</p>
        <button onClick={() => setAttempt((a) => a + 1)} className="h-11 px-4 rounded-xl bg-indigo-600 text-white font-bold">Riprova</button>
      </div>
    );
  } else if (!hasMenu(plan)) {
    body = (
      <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-2">
        <UtensilsCrossed className="w-10 h-10 mx-auto text-indigo-400" />
        <h3 className="text-xl font-semibold text-slate-900">Il menù non c'è ancora</h3>
        <p className="text-slate-600 leading-relaxed">Appena la famiglia lo prepara lo trovi qui, e si aggiorna da solo.</p>
      </div>
    );
  } else {
    const selected = dayMenu(plan, recipes, day);
    body = (
      <div className="space-y-4">
        <div role="tablist" aria-label="Quale menù vedere" className="grid grid-cols-2 gap-2">
          {(['today', 'week'] as const).map((v) => (
            <button
              key={v}
              role="tab"
              aria-selected={view === v}
              onClick={() => {
                setView(v);
                if (v === 'today') setDay(today);
              }}
              className={`h-11 rounded-xl font-bold ${view === v ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}
            >
              {v === 'today' ? 'Oggi' : 'Settimana'}
            </button>
          ))}
        </div>

        {view === 'week' && (
          <div className="flex gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label="Giorno">
            {WEEK_DAYS.map((d) => (
              <button
                key={d}
                role="tab"
                aria-selected={day === d}
                onClick={() => setDay(d)}
                className={`h-10 px-3 rounded-full text-sm font-semibold shrink-0 ${day === d ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}
              >
                {d.slice(0, 3)}{d === today ? ' · oggi' : ''}
              </button>
            ))}
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4">
          <h3 className="text-xl font-semibold text-slate-900">{day}{day === today ? ' (oggi)' : ''}</h3>
          {selected.breakfast.length > 0 && <Meal label="Colazione" recipes={selected.breakfast} />}
          {selected.snackAm.length > 0 && <Meal label="Spuntino di metà mattina" recipes={selected.snackAm} />}
          <Meal label="Pranzo" recipes={selected.lunch} />
          {selected.snackPm.length > 0 && <Meal label="Merenda" recipes={selected.snackPm} />}
          <Meal label="Cena" recipes={selected.dinner} />
        </div>

        {view === 'week' && (
          <p className="text-xs text-slate-500">
            {week.filter((d) => d.lunch.length + d.dinner.length > 0).length} giorni con piatti in programma questa settimana.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-3xl font-semibold text-slate-900">Il menù di casa</h2>
        <p className="text-slate-600 mt-1">Lo gestisce la famiglia a cui sei collegato: qui lo consulti, e si aggiorna da solo.</p>
      </div>
      {body}
      <MenuNotificationsCard />
      <JoinFamilyCard familyId={familyId} />
    </div>
  );
}
