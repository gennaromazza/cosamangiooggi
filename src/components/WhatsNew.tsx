import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { CHANGELOG, LATEST_NEWS_ID, type NewsEntry } from '../data/changelog';
import { pendingNews, readSeen, writeSeen } from '../lib/whatsNew';
import type { UserProfile } from '../types';

interface Props {
  userId: string;
  profile: UserProfile | null;
}

export const OPEN_WHATS_NEW_EVENT = 'open-whats-new';

/**
 * Schermata "Novità": dopo ogni aggiornamento racconta cosa è cambiato, una volta sola.
 * Chi usa l'app per la prima volta non la vede (c'è già la guida iniziale). Si può rivedere dall'account.
 */
export default function WhatsNew({ userId, profile }: Props) {
  const [entries, setEntries] = useState<NewsEntry[]>([]);

  const completedTour = (() => {
    if (profile?.hasCompletedWelcomeTour) return true;
    try {
      return localStorage.getItem(`welcome_tour_completed_${userId}`) === 'true';
    } catch {
      return false;
    }
  })();

  useEffect(() => {
    if (!profile && !userId.startsWith('local-') && userId !== 'demo-family-user') return; // si aspetta il profilo
    const pending = pendingNews(CHANGELOG, readSeen(), completedTour);
    if (pending.length > 0) setEntries(pending);
    else if (!readSeen()) writeSeen(LATEST_NEWS_ID);
  }, [userId, profile?.id, completedTour]);

  useEffect(() => {
    const open = () => setEntries(CHANGELOG.slice(0, 5));
    window.addEventListener(OPEN_WHATS_NEW_EVENT, open);
    return () => window.removeEventListener(OPEN_WHATS_NEW_EVENT, open);
  }, []);

  if (entries.length === 0) return null;

  const close = () => {
    writeSeen(LATEST_NEWS_ID);
    setEntries([]);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-slate-900/50 sm:p-4" role="dialog" aria-modal="true" aria-label="Novità dell'app">
      <div className="w-full max-w-lg max-h-[92dvh] flex flex-col bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl">
        <div className="px-5 pt-6 pb-3 flex items-center gap-3">
          <span className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0"><Sparkles className="w-6 h-6" /></span>
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 leading-tight">Novità</h2>
            <p className="text-sm text-slate-500">Cosa c'è di nuovo nell'app</p>
          </div>
        </div>
        <div className="px-5 pb-4 overflow-y-auto space-y-6">
          {entries.map((entry) => (
            <section key={entry.id} className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{entry.title}</h3>
                <p className="text-xs text-slate-500">{entry.date}</p>
              </div>
              <ul className="space-y-3">
                {entry.items.map((item) => (
                  <li key={item.title} className="flex gap-3">
                    <span className="text-2xl leading-none shrink-0" aria-hidden="true">{item.emoji}</span>
                    <span>
                      <span className="block font-semibold text-slate-900">{item.title}</span>
                      <span className="block text-sm text-slate-600 leading-relaxed">{item.text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] border-t border-slate-100">
          <button onClick={close} className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg">
            Ho capito
          </button>
        </div>
      </div>
    </div>
  );
}
