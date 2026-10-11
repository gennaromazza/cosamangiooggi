import type { FamilyMember } from '../types';

/** La persona ha indicato almeno una preferenza (gusti, piatti, dieta o allergie). */
export const hasAnyPreference = (member: FamilyMember): boolean =>
  [
    member.likedIngredients,
    member.dislikedIngredients,
    member.likedMeals,
    member.dislikedMeals,
    member.dietaryRestrictions,
    member.allergies,
  ].some((list) => (list?.length || 0) > 0);

/** Persone per cui non è stato indicato nulla: il menù per loro sarà generico. */
export const membersWithoutPreferences = (members: FamilyMember[]): FamilyMember[] =>
  members.filter((member) => !hasAnyPreference(member));

export interface PantryStarter {
  name: string;
  quantity: number;
  unit: string;
  category: string;
}

/** Dispensa di partenza: prodotti comuni da toccare, con quantità ragionevoli (si correggono poi in Dispensa). */
export const PANTRY_STARTERS: PantryStarter[] = [
  { name: 'Pasta', quantity: 500, unit: 'g', category: 'Pasta e Cereali' },
  { name: 'Riso', quantity: 500, unit: 'g', category: 'Pasta e Cereali' },
  { name: 'Farina', quantity: 1000, unit: 'g', category: 'Pasta e Cereali' },
  { name: 'Passata di pomodoro', quantity: 2, unit: 'pz', category: 'Conservati' },
  { name: 'Legumi in scatola', quantity: 2, unit: 'pz', category: 'Conservati' },
  { name: 'Tonno in scatola', quantity: 2, unit: 'pz', category: 'Conservati' },
  { name: 'Olio d\'oliva', quantity: 1, unit: 'l', category: 'Altro' },
  { name: 'Uova', quantity: 6, unit: 'pz', category: 'Latticini e Uova' },
  { name: 'Latte', quantity: 1, unit: 'l', category: 'Latticini e Uova' },
  { name: 'Parmigiano Reggiano', quantity: 200, unit: 'g', category: 'Latticini e Uova' },
  { name: 'Patate', quantity: 1000, unit: 'g', category: 'Ortofrutta' },
  { name: 'Cipolle', quantity: 4, unit: 'pz', category: 'Ortofrutta' },
];

/** Prodotto della dispensa a partire da un nome: se è tra quelli noti usa le sue quantità, altrimenti 1 pezzo. */
export const pantryItemFor = (name: string): PantryStarter => {
  const known = PANTRY_STARTERS.find((item) => item.name.toLowerCase() === name.toLowerCase());
  return known ? { ...known } : { name, quantity: 1, unit: 'pz', category: 'Altro' };
};
