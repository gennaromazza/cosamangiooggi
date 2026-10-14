import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { Recipe } from '../types';

const isLocalUser = (uid: string) => uid === 'demo-family-user' || uid.startsWith('local-');

export const readLocalDishes = (userId: string): Recipe[] => {
  try {
    return JSON.parse(localStorage.getItem(`customRecipes_${userId}`) || '[]') as Recipe[];
  } catch {
    return [];
  }
};

/**
 * Salva un piatto corretto. Se l'aveva scritto l'utente si aggiorna lo stesso piatto; se era dell'app se ne crea una
 * copia dell'utente (l'originale non cambia). Restituisce l'id del piatto salvato, o null se non è riuscito.
 */
export async function saveDishEdit(userId: string, original: Recipe, edited: Omit<Recipe, 'id'>, isCustom: boolean): Promise<string | null> {
  try {
    if (isLocalUser(userId)) {
      const saved = readLocalDishes(userId);
      const id = isCustom ? original.id : `custom-${Date.now()}`;
      const next = { ...edited, id } as Recipe;
      localStorage.setItem(`customRecipes_${userId}`, JSON.stringify(isCustom ? saved.map((r) => (r.id === id ? next : r)) : [...saved, next]));
      return id;
    }
    if (isCustom) {
      await setDoc(doc(db, `users/${userId}/customRecipes`, original.id), edited);
      return original.id;
    }
    return (await addDoc(collection(db, `users/${userId}/customRecipes`), edited)).id;
  } catch (error) {
    console.error('Piatto non salvato:', error);
    return null;
  }
}
