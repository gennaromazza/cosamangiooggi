import { useState } from 'react';
import { Coffee } from 'lucide-react';
import { saveProfileFields } from '../lib/profileSave';
import type { UserProfile } from '../types';

interface Props {
  userId: string;
  profile: UserProfile | null;
  onLocalChange: (profile: UserProfile) => void;
}

/** Interruttore: il menù comprende anche colazione e due merende, oltre a pranzo e cena. */
export default function MorningMealsCard({ userId, profile, onLocalChange }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!profile) return null;
  const on = !!profile.includeMorningMeals;

  const toggle = async () => {
    setBusy(true);
    setError(null);
    try {
      await saveProfileFields(userId, profile, { includeMorningMeals: !on }, onLocalChange);
    } catch {
      setError('Non è stato possibile salvare. Riprova.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2"><Coffee className="w-5 h-5 text-amber-600" /> Colazione e merende</h3>
          <p className="text-sm text-slate-500 mt-1 leading-relaxed">
            Nel menù compaiono anche la colazione, uno spuntino di metà mattina e la merenda, sempre adatti a tutti e, se hai un limite di calorie, dentro quello.
          </p>
        </div>
        <button
          role="switch"
          aria-checked={on}
          aria-label="Colazione e merende nel menù"
          disabled={busy}
          onClick={toggle}
          className={`shrink-0 w-14 h-8 rounded-full p-1 transition-colors ${on ? 'bg-indigo-600' : 'bg-slate-300'} disabled:opacity-60`}
        >
          <span className={`block w-6 h-6 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-6' : ''}`} />
        </button>
      </div>
      {on && <p className="text-xs text-slate-500">Vale dal prossimo menù che crei. Nel menù scritto a mano compaiono i campi per colazione e merende.</p>}
      {error && <p role="alert" className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">{error}</p>}
    </div>
  );
}
