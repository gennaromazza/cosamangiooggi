import type { NewsEntry } from '../data/changelog';

export const SEEN_KEY = 'whats_new_seen';
const MAX_SHOWN = 3;

/**
 * Cosa mostrare nella schermata "Novità".
 * - Mai visto nulla e l'app è nuova per questa persona (la guida iniziale non è ancora fatta): niente, si parte da oggi.
 * - Mai visto nulla ma usa già l'app: le ultime novità.
 * - Ha già visto qualcosa: le voci uscite dopo, dalla più recente.
 */
export function pendingNews(entries: NewsEntry[], seenId: string | null, isExistingUser: boolean, max = MAX_SHOWN): NewsEntry[] {
  if (entries.length === 0) return [];
  if (!seenId) return isExistingUser ? entries.slice(0, max) : [];
  const index = entries.findIndex((e) => e.id === seenId);
  if (index === 0) return [];
  return (index < 0 ? entries : entries.slice(0, index)).slice(0, max);
}

export const readSeen = (): string | null => {
  try {
    return localStorage.getItem(SEEN_KEY);
  } catch {
    return null;
  }
};

export const writeSeen = (id: string) => {
  try {
    localStorage.setItem(SEEN_KEY, id);
  } catch {
    /* storage non disponibile */
  }
};
