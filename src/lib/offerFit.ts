import type { DietaryRestriction, FamilyMember, Recipe, UserProfile } from '../types';
import { inferDishInfo } from './dishInference';
import { dislikeConsensus } from './memberAlternatives';
import { checkIngredientMatch } from './pantrySync';
import { hitsExclusion, satisfiesDiet } from './dietFilters';

/**
 * Un ingrediente in offerta va bene per la famiglia? Per ognuno: allergie e dieta (regole rigide) e gusti (preferenze).
 * Serve a scegliere cosa comprare e a sapere se il menù lo potrà davvero usare.
 */
export interface OfferFit {
  name: string;
  /** Vietato a tutti dalle regole della famiglia (allergia o dieta di casa): il menù non lo userà mai */
  blocked: boolean;
  /** Chi non può mangiarlo (allergia o dieta personale) */
  cannot: string[];
  /** A chi non piace */
  dislikedBy: string[];
  /** A chi piace */
  likedBy: string[];
  /** Persone che lo possono mangiare (al netto di allergie e diete) */
  okFor: string[];
  /** Lo evita almeno metà della famiglia: il menù lo toglie per tutti */
  majorityDislikes: boolean;
  /** Piatti adatti alla famiglia che lo usano: con 0 sceglierlo non cambia il menù */
  dishes: number;
  summary: string;
  tone: 'all' | 'some' | 'none';
}

const dietOk = (name: string, diets: DietaryRestriction[]): boolean => {
  if (diets.length === 0) return true;
  const tags = inferDishInfo([{ name }], name).tags;
  return diets.every((d) => tags.includes(d));
};

const names = (list: string[]) => (list.length <= 1 ? list.join('') : `${list.slice(0, -1).join(', ')} e ${list[list.length - 1]}`);

export function offerFit(args: {
  name: string;
  members: FamilyMember[];
  profile: Pick<UserProfile, 'dietaryRestrictions' | 'excludedIngredients'> | null | undefined;
  recipes: Recipe[];
}): OfferFit {
  const { name, members, profile, recipes } = args;
  const homeDiets = profile?.dietaryRestrictions || [];
  const homeAllergies = profile?.excludedIngredients || [];
  // L'ingrediente come se fosse un piatto: così valgono le stesse regole del menù (anche gli allergeni come "Glutine")
  const asDish = { title: name, ingredients: [{ name, amount: 1, unit: 'pz' }] } as unknown as Recipe;
  const blocked = hitsExclusion(asDish, homeAllergies) || !dietOk(name, homeDiets);

  const cannot: string[] = [];
  const dislikedBy: string[] = [];
  const likedBy: string[] = [];
  for (const m of members) {
    const allergic = hitsExclusion(asDish, m.allergies || []);
    if (allergic || !dietOk(name, m.dietaryRestrictions || [])) {
      cannot.push(m.name);
      continue;
    }
    if ((m.dislikedIngredients || []).some((d) => checkIngredientMatch(d, name))) dislikedBy.push(m.name);
    else if ((m.likedIngredients || []).some((l) => checkIngredientMatch(l, name))) likedBy.push(m.name);
  }
  const okFor = blocked ? [] : members.filter((m) => !cannot.includes(m.name)).map((m) => m.name);
  const consensus = dislikeConsensus(members);
  const majorityDislikes = consensus.excludedIngredients.some((d) => checkIngredientMatch(d, name));

  // Piatti che lo usano e che vanno bene alla famiglia (diete e allergie di casa, e il consenso sui gusti)
  const dishes = blocked
    ? 0
    : recipes.filter(
        (r) =>
          r.ingredients.some((i) => checkIngredientMatch(name, i.name)) &&
          satisfiesDiet(r, homeDiets) &&
          !hitsExclusion(r, homeAllergies) &&
          !hitsExclusion(r, consensus.excludedIngredients),
      ).length;

  let summary: string;
  let tone: OfferFit['tone'];
  if (blocked) {
    summary = 'Non adatto alla tua famiglia (allergie o dieta di casa)';
    tone = 'none';
  } else if (members.length > 0 && okFor.length === 0) {
    summary = 'Nessuno a tavola lo può mangiare';
    tone = 'none';
  } else if (cannot.length === 0) {
    summary = members.length > 0 ? 'Va bene per tutti' : 'Adatto';
    tone = 'all';
  } else {
    summary = `Per ${names(okFor)} · non per ${names(cannot)}`;
    tone = 'some';
  }
  if (!blocked && majorityDislikes) summary += ' · a metà famiglia non piace: il menù lo evita';
  else if (!blocked && dishes === 0) summary += ' · nessun piatto adatto lo usa';
  return { name, blocked, cannot, dislikedBy, likedBy, okFor, majorityDislikes, dishes, summary, tone };
}

/** Prima le offerte che vanno bene a tutti e che il menù userà, poi le altre; in fondo quelle non adatte. */
export function rankOffers(fits: OfferFit[]): OfferFit[] {
  const score = (f: OfferFit) => (f.tone === 'none' ? 0 : f.tone === 'some' ? 1 : 2) * 10 + (f.majorityDislikes || f.dishes === 0 ? 0 : 5) + Math.min(f.likedBy.length, 4);
  return [...fits].sort((a, b) => score(b) - score(a) || a.name.localeCompare(b.name, 'it'));
}
