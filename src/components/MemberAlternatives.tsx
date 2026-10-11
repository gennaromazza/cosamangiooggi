import { Clock } from 'lucide-react';
import type { FamilyMember, Recipe } from '../types';
import { membersNeedingAlternative } from '../lib/memberAlternatives';

interface Props {
  /** Piatti del pasto (principali e contorni) */
  recipes: Recipe[];
  members: FamilyMember[];
  /** Alternative salvate nel menù: id persona → id ricetta */
  alt?: Record<string, string>;
  allRecipes: Recipe[];
  onOpen: (recipe: Recipe) => void;
}

/** Sotto il pasto: cosa mangia chi ha una dieta o un'allergia personale. */
export default function MemberAlternatives({ recipes, members, alt, allRecipes, onOpen }: Props) {
  const needing = membersNeedingAlternative(recipes, members);
  if (needing.length === 0) return null;

  return (
    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-3 space-y-2">
      <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">Alternative per chi ha esigenze diverse</p>
      {needing.map((member) => {
        const chosen = alt?.[member.id] ? allRecipes.find((r) => r.id === alt[member.id]) : undefined;
        return chosen ? (
          <button
            key={member.id}
            type="button"
            onClick={() => onOpen(chosen)}
            className="w-full text-left rounded-xl bg-white border border-indigo-100 px-3 py-2.5 flex items-center justify-between gap-3"
          >
            <span className="min-w-0">
              <span className="block text-xs font-semibold text-slate-500">Per {member.name}</span>
              <span className="block text-sm font-bold text-slate-900 truncate">{chosen.title}</span>
            </span>
            <span className="shrink-0 text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {chosen.timeMin} min
            </span>
          </button>
        ) : (
          <p key={member.id} className="text-sm text-slate-600 rounded-xl bg-white border border-dashed border-indigo-200 px-3 py-2.5">
            Per <strong>{member.name}</strong> non c’è ancora un piatto adatto: cambia piatto o crea di nuovo il menù.
          </p>
        );
      })}
    </div>
  );
}
