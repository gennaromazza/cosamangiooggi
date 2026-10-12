import { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { Users } from 'lucide-react';
import { functions } from '../lib/firebase';
import { normalizeShareCode } from '../lib/sharedMenu';

interface Props {
  /** Famiglia a cui ci si è già collegati, se c'è. */
  familyId?: string;
  onChanged?: () => void;
}

const errorText = (e: any, fallback: string) => e?.message?.replace(/^.*?: /, '') || fallback;

/** Collega questo account alla famiglia di un parente con il codice che ha mandato: da lì si vede il menù (solo lettura). */
export default function JoinFamilyCard({ familyId, onChanged }: Props) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const join = async () => {
    const normalized = normalizeShareCode(code);
    if (!normalized) {
      setError('Il codice non è corretto. Sono 12 caratteri, per esempio ABCD-EFGH-JKMN. Puoi anche incollare tutto il link.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await httpsCallable(functions, 'joinFamily')({ code: normalized });
      setCode('');
      onChanged?.();
    } catch (e: any) {
      setError(errorText(e, 'Non è stato possibile collegarti. Controlla la connessione e riprova.'));
    } finally {
      setBusy(false);
    }
  };

  const leave = async () => {
    if (!window.confirm('Vuoi uscire da questa famiglia? Non vedrai più il suo menù.')) return;
    setBusy(true);
    setError(null);
    try {
      await httpsCallable(functions, 'leaveFamily')({});
      onChanged?.();
    } catch (e: any) {
      setError(errorText(e, 'Non è stato possibile uscire. Riprova.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
      <div className="flex items-start gap-3">
        <span className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
          <Users className="w-4 h-4" />
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-slate-900">{familyId ? 'Sei collegato a una famiglia' : 'Hai ricevuto un invito?'}</p>
          <p className="text-sm text-slate-600 mt-0.5 leading-relaxed">
            {familyId
              ? 'Vedi il menù della settimana di questa famiglia e puoi ricevere le notifiche. Non puoi modificarlo e non vedi i loro dati personali.'
              : 'Inserisci il codice (o incolla il link) che ti ha mandato un familiare: vedrai il suo menù nell\'app.'}
          </p>
        </div>
      </div>

      {familyId ? (
        <button onClick={leave} disabled={busy} className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold disabled:opacity-60">
          {busy ? 'Un attimo…' : 'Esci dalla famiglia'}
        </button>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="text"
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => e.key === 'Enter' && join()}
              placeholder="ABCD-EFGH-JKMN"
              aria-label="Codice di invito"
              className="flex-1 min-w-0 h-11 px-3 bg-white border border-slate-200 rounded-xl text-base tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <button onClick={join} disabled={busy || code.trim().length < 4} className="h-11 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold disabled:opacity-60">
              {busy ? 'Un attimo…' : 'Collegami'}
            </button>
          </div>
        </div>
      )}
      {error && <p role="alert" className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">{error}</p>}
    </div>
  );
}
