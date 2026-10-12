import { useEffect, useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { Copy, Link2, MessageCircle, RefreshCcw, Share2, UserMinus, X } from 'lucide-react';
import { db, functions } from '../lib/firebase';
import { SITE_URL } from '../lib/updateCheck';
import { shareMessage, shareUrl, type ShareInfo } from '../lib/sharedMenu';

interface Viewer {
  uid: string;
  name: string;
  joinedAt?: number;
}

interface Props {
  userId: string;
}

const isLocalUser = (uid: string) => uid === 'demo-family-user' || uid.startsWith('local-');
const errorText = (e: any, fallback: string) => e?.message?.replace(/^.*?: /, '') || fallback;

/**
 * Chi gestisce la famiglia crea qui il link del menù: chi lo apre vede pranzo e cena della settimana (senza app né account),
 * oppure si collega dall'app con il codice. Qui si rigenera, si annulla e si scollega chi non deve più vederlo.
 */
export default function FamilyShare({ userId }: Props) {
  const [share, setShare] = useState<ShareInfo | null>(null);
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const local = isLocalUser(userId);

  useEffect(() => {
    if (local) return;
    const unsubShare = onSnapshot(
      doc(db, `users/${userId}/familyShare/current`),
      (s) => {
        setShare(s.exists() ? (s.data() as ShareInfo) : null);
        setLoaded(true);
      },
      () => setLoaded(true),
    );
    const unsubViewers = onSnapshot(
      collection(db, `users/${userId}/viewers`),
      (s) => setViewers(s.docs.map((d) => ({ uid: d.id, ...(d.data() as Omit<Viewer, 'uid'>) }))),
      () => setViewers([]),
    );
    return () => {
      unsubShare();
      unsubViewers();
    };
  }, [userId, local]);

  if (local) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1">
        <p className="font-semibold text-slate-900 flex items-center gap-2"><Link2 className="w-4 h-4" /> Condividi il menù</p>
        <p className="text-sm text-slate-600 leading-relaxed">Per condividere il menù serve un account: esci dalla prova ed entra con Google o con la tua email.</p>
      </div>
    );
  }

  const live = share && !share.revoked && share.expiresAt >= Date.now() ? share : null;
  const link = live ? shareUrl(SITE_URL, live.code) : null;
  const message = live ? shareMessage(SITE_URL, live.code) : '';

  const run = async (name: 'createFamilyShare' | 'revokeFamilyShare', failure: string) => {
    setBusy(true);
    setError(null);
    setCopied(false);
    try {
      await httpsCallable(functions, name)({});
    } catch (e: any) {
      setError(errorText(e, failure));
    } finally {
      setBusy(false);
    }
  };

  const whatsapp = async () => {
    const target = `https://wa.me/?text=${encodeURIComponent(message)}`;
    if (Capacitor.isNativePlatform()) await Browser.open({ url: target });
    else window.open(target, '_blank', 'noopener');
  };
  const nativeShare = async () => {
    try {
      await navigator.share({ title: 'Il menù di casa', text: message });
    } catch {
      /* condivisione annullata */
    }
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
    } catch {
      setError('Non riesco a copiare: tieni premuto sul link qui sopra e copialo.');
    }
  };
  const removeViewer = async (viewer: Viewer) => {
    if (!window.confirm(`Scollegare ${viewer.name}? Non vedrà più il menù.`)) return;
    setBusy(true);
    setError(null);
    try {
      await httpsCallable(functions, 'removeFamilyViewer')({ viewerUid: viewer.uid });
    } catch (e: any) {
      setError(errorText(e, 'Non è stato possibile scollegare la persona. Riprova.'));
    } finally {
      setBusy(false);
    }
  };

  const expired = !!share && !share.revoked && share.expiresAt < Date.now();
  const days = live ? Math.max(1, Math.ceil((live.expiresAt - Date.now()) / 86_400_000)) : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
      <div className="flex items-start gap-3">
        <span className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
          <Link2 className="w-4 h-4" />
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-slate-900">Condividi il menù con la famiglia</p>
          <p className="text-sm text-slate-600 mt-0.5 leading-relaxed">
            Manda un link: chi lo apre vede pranzo e cena della settimana, con le ricette, senza installare nulla. Non vede mai le persone, le allergie o le preferenze.
            Se cambi un piatto, si aggiorna da solo.
          </p>
        </div>
      </div>

      {!loaded ? (
        <p className="text-sm text-slate-500">Un attimo…</p>
      ) : live ? (
        <div className="space-y-2">
          <p className="text-xs text-slate-500 break-all bg-slate-50 border border-slate-200 rounded-xl p-2.5 select-all">{link}</p>
          <p className="text-sm text-slate-700">
            Codice per chi ha l'app: <strong className="tracking-wider select-all">{live.code}</strong>
          </p>
          <div className="flex flex-wrap gap-2">
            <button onClick={whatsapp} className="h-11 px-4 rounded-xl bg-emerald-600 text-white font-bold flex items-center gap-2">
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </button>
            {typeof navigator !== 'undefined' && !!navigator.share && (
              <button onClick={nativeShare} className="h-11 px-4 rounded-xl bg-indigo-600 text-white font-bold flex items-center gap-2">
                <Share2 className="w-4 h-4" /> Condividi
              </button>
            )}
            <button onClick={copy} className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold flex items-center gap-2">
              <Copy className="w-4 h-4" /> {copied ? 'Copiato' : 'Copia'}
            </button>
          </div>
          <p className="text-xs text-slate-500">Chi ha il link vede il menù: mandalo solo a chi vuoi. Vale ancora {days} {days === 1 ? 'giorno' : 'giorni'}. Un nuovo link rende subito inutilizzabile il vecchio; chi si era collegato dall'app resta collegato finché non lo scolleghi.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            <button
              onClick={() => run('createFamilyShare', 'Non è stato possibile creare un nuovo link. Riprova.')}
              disabled={busy}
              className="text-sm font-semibold text-slate-600 underline underline-offset-4 flex items-center gap-1 disabled:opacity-60"
            >
              <RefreshCcw className="w-3.5 h-3.5 shrink-0" /> Crea un nuovo link
            </button>
            <button
              onClick={() => run('revokeFamilyShare', 'Non è stato possibile annullare il link. Riprova.')}
              disabled={busy}
              className="text-sm font-semibold text-slate-500 underline underline-offset-4 flex items-center gap-1 disabled:opacity-60"
            >
              <X className="w-3.5 h-3.5" /> Annulla il link
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {share?.revoked && <p className="text-sm text-slate-600">Il link è stato annullato: nessuno può più aprirlo.</p>}
          {expired && <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">Il link è scaduto. Creane uno nuovo.</p>}
          <button
            onClick={() => run('createFamilyShare', 'Non è stato possibile creare il link. Riprova.')}
            disabled={busy}
            className="h-11 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold disabled:opacity-60"
          >
            {busy ? 'Un attimo…' : share ? 'Crea un nuovo link' : 'Crea il link del menù'}
          </button>
        </div>
      )}

      {viewers.length > 0 && (
        <div className="border-t border-slate-100 pt-3 space-y-2">
          <p className="text-sm font-semibold text-slate-800">Collegati dall'app ({viewers.length})</p>
          <ul className="space-y-1.5">
            {viewers.map((v) => (
              <li key={v.uid} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-700 truncate">{v.name || 'Familiare'} · vede il menù</span>
                <button onClick={() => removeViewer(v)} disabled={busy} aria-label={`Scollega ${v.name}`} className="h-9 px-3 rounded-lg border border-slate-200 text-slate-600 font-semibold flex items-center gap-1.5 disabled:opacity-60">
                  <UserMinus className="w-3.5 h-3.5" /> Scollega
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && <p role="alert" className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">{error}</p>}
    </div>
  );
}
