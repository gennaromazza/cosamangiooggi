import { useEffect, useMemo, useRef, useState } from 'react';
import { ThumbsDown, ThumbsUp, SkipForward, Check } from 'lucide-react';
import type { FamilyMember, Recipe } from '../types';
import { pickTastingDishes, suggestIngredients, verdictPatch, type Verdict } from '../lib/tasting';

interface Props {
  member: FamilyMember;
  recipes: Recipe[];
  onChange: (patch: Partial<FamilyMember>) => void;
}

const TOTAL = 12;

/** Il gioco dei piatti: un piatto conosciuto alla volta, un tocco per dire se piace. Insegna al menù i gusti di una persona. */
export default function TastingGame({ member, recipes, onChange }: Props) {
  const [round, setRound] = useState(0);
  const dishes = useMemo(
    () => pickTastingDishes({ recipes, member, count: TOTAL }),
    // Le domande si scelgono una volta per giro: non cambiano mentre si risponde
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [member.id, round, recipes.length],
  );
  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState(0);

  // Le risposte si accumulano qui: due tocchi veloci non devono perdere il primo
  const latest = useRef(member);
  useEffect(() => {
    latest.current = member;
  }, [member]);

  const answer = (verdict: Verdict) => {
    const dish = dishes[index];
    if (!dish) return;
    if (verdict !== 'skip') {
      const patch = verdictPatch(latest.current, dish.id, verdict);
      latest.current = { ...latest.current, ...patch };
      onChange(patch);
      setAnswered((n) => n + 1);
    }
    setIndex((i) => i + 1);
  };

  const dish = dishes[index];
  const finished = !dish;
  const suggestions = useMemo(
    () => (finished ? suggestIngredients({ member, recipes }) : []),
    [finished, member, recipes],
  );
  const [accepted, setAccepted] = useState<string[]>([]);

  const accept = (ingredient: string, kind: 'like' | 'dislike') => {
    const field = kind === 'like' ? 'likedIngredients' : 'dislikedIngredients';
    const current = latest.current[field] || [];
    const patch = { [field]: [...current, ingredient] } as Partial<FamilyMember>;
    latest.current = { ...latest.current, ...patch };
    onChange(patch);
    setAccepted((list) => [...list, `${kind}:${ingredient}`]);
  };

  if (dishes.length === 0 && index === 0) {
    return (
      <p className="text-sm text-slate-600 leading-relaxed">
        Hai già valutato tutti i piatti che proponiamo a {member.name} (o non ce ne sono adatti alla sua dieta). Puoi aggiungerne altri dalla scheda «Piatti».
      </p>
    );
  }

  if (finished) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <span className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Check className="w-5 h-5" />
          </span>
          <div>
            <p className="font-semibold text-slate-900">
              {answered > 0 ? `Ottimo: ${answered} ${answered === 1 ? 'piatto valutato' : 'piatti valutati'}` : 'Nessun piatto valutato'}
            </p>
            <p className="text-sm text-slate-600 mt-0.5">I prossimi menù terranno conto dei gusti di {member.name}.</p>
          </div>
        </div>

        {suggestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-800">Abbiamo notato una cosa</p>
            {suggestions.map((s) => {
              const key = `${s.kind}:${s.ingredient}`;
              const done = accepted.includes(key);
              return (
                <div key={key} className="bg-white border border-slate-200 rounded-2xl p-3 space-y-2">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {s.kind === 'dislike'
                      ? `${member.name} ha scartato ${s.dishes.length} piatti con «${s.ingredient}» (${s.dishes.slice(0, 3).join(', ')}). Lo evitiamo?`
                      : `${member.name} ha scelto ${s.dishes.length} piatti con «${s.ingredient}» (${s.dishes.slice(0, 3).join(', ')}). Gli piace molto?`}
                  </p>
                  <button
                    onClick={() => accept(s.ingredient, s.kind)}
                    disabled={done}
                    className="h-10 px-4 rounded-xl bg-indigo-600 text-white text-sm font-bold disabled:bg-emerald-600"
                  >
                    {done ? 'Aggiunto' : s.kind === 'dislike' ? `Sì, evita ${s.ingredient}` : `Sì, aggiungi ${s.ingredient}`}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={() => {
            setRound((r) => r + 1);
            setIndex(0);
            setAnswered(0);
            setAccepted([]);
          }}
          className="h-11 px-4 rounded-2xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold"
        >
          Altri piatti
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={dishes.length} aria-valuenow={index}>
          <div className="h-full bg-indigo-600 transition-all" style={{ width: `${(index / dishes.length) * 100}%` }} />
        </div>
        <span className="text-xs font-semibold text-slate-500">{index + 1} di {dishes.length}</span>
      </div>

      <p className="text-sm text-slate-600">A {member.name} piace questo piatto?</p>
      <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center space-y-2 min-h-[9rem] flex flex-col justify-center">
        <h4 className="text-2xl font-semibold text-slate-900 leading-snug">{dish.title}</h4>
        <p className="text-sm text-slate-500">
          {dish.ingredients.slice(0, 4).map((i) => i.name).join(' · ')}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => answer('dislike')}
          aria-label="Non mi piace"
          className="h-14 rounded-2xl border-2 border-slate-200 bg-white text-slate-700 font-bold flex flex-col items-center justify-center text-xs gap-0.5 active:bg-slate-100"
        >
          <ThumbsDown className="w-5 h-5" /> Non piace
        </button>
        <button
          onClick={() => answer('skip')}
          aria-label="Salta, non lo conosco"
          className="h-14 rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 font-semibold flex flex-col items-center justify-center text-xs gap-0.5 active:bg-slate-100"
        >
          <SkipForward className="w-5 h-5" /> Non lo conosco
        </button>
        <button
          onClick={() => answer('like')}
          aria-label="Mi piace"
          className="h-14 rounded-2xl bg-indigo-600 text-white font-bold flex flex-col items-center justify-center text-xs gap-0.5 active:bg-indigo-700"
        >
          <ThumbsUp className="w-5 h-5" /> Piace
        </button>
      </div>
    </div>
  );
}
