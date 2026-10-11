import { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { Copy, Link2, MessageCircle, Share2, X } from 'lucide-react';
import { functions } from '../lib/firebase';
import type { FamilyMember } from '../types';
import { inviteLabel } from '../lib/inviteStatus';

interface Props {
  member: FamilyMember;
  userId: string;
}

const isLocalUser = (uid: string) => uid === 'demo-family-user' || uid.startsWith('local-');

/** Invita una persona a compilare da sola allergie e gusti con un link riservato (senza app né account). */
export default function MemberInvite({ member, userId }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (isLocalUser(userId) || member.isSelf) return null;

  const first = member.name.trim().split(' ')[0];
  const message = (link: string) =>
    `Ciao ${first}! Ci metti un minuto: dimmi cosa ti piace e le tue allergie, così il menù di casa va bene anche per te. ${link}`;
  const status = inviteLabel(member);

  const create = async () => {
    setBusy(true);
    setError(null);
    setCopied(false);
    try {
      const result = await httpsCallable<{ memberId: string }, { url: string }>(functions, 'createMemberInvite')({ memberId: member.id });
      setUrl(result.data.url);
    } catch (e: any) {
      setError(e?.message?.replace(/^.*?: /, '') || 'Non è stato possibile creare il link. Riprova.');
    } finally {
      setBusy(false);
    }
  };

  const revoke = async () => {
    setBusy(true);
    setError(null);
    try {
      await httpsCallable(functions, 'revokeMemberInvite')({ memberId: member.id });
      setUrl(null);
    } catch {
      setError('Non è stato possibile annullare il link. Riprova.');
    } finally {
      setBusy(false);
    }
  };

  const share = async () => {
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: 'Che cucino oggi?', text: message(url) });
      else await copy();
    } catch {
      /* condivisione annullata */
    }
  };
  const copy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(message(url));
      setCopied(true);
    } catch {
      setError('Non riesco a copiare: tieni premuto sul link qui sopra e copialo.');
    }
  };
  const whatsapp = async () => {
    if (!url) return;
    const target = `https://wa.me/?text=${encodeURIComponent(message(url))}`;
    if (Capacitor.isNativePlatform()) await Browser.open({ url: target });
    else window.open(target, '_blank', 'noopener');
  };

  const hasLive = member.inviteStatus === 'sent' && !!member.inviteExpiresAt && member.inviteExpiresAt >= Date.now();

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
      <div className="flex items-start gap-3">
        <span className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
          <Link2 className="w-4 h-4" />
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-slate-900">Fai compilare a {first}</p>
          <p className="text-sm text-slate-600 mt-0.5 leading-relaxed">
            Invia un link: {first} risponde dal suo telefono, senza app né account. Se preferisci (e per i bambini) compila tu con le schede qui sotto.
          </p>
        </div>
      </div>

      {status && <p className="text-sm font-semibold text-indigo-700">{status}</p>}

      {url ? (
        <div className="space-y-2">
          <p className="text-xs text-slate-500 break-all bg-slate-50 border border-slate-200 rounded-xl p-2.5 select-all">{url}</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={whatsapp} className="h-11 px-4 rounded-xl bg-emerald-600 text-white font-bold flex items-center gap-2">
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </button>
            {typeof navigator !== 'undefined' && !!navigator.share && (
              <button onClick={share} className="h-11 px-4 rounded-xl bg-indigo-600 text-white font-bold flex items-center gap-2">
                <Share2 className="w-4 h-4" /> Condividi
              </button>
            )}
            <button onClick={copy} className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold flex items-center gap-2">
              <Copy className="w-4 h-4" /> {copied ? 'Copiato' : 'Copia'}
            </button>
          </div>
          <p className="text-xs text-slate-500">Il link è riservato: chi lo apre può compilare per {first}. Vale 14 giorni.</p>
        </div>
      ) : (
        <button
          onClick={create}
          disabled={busy}
          className="h-11 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold disabled:opacity-60"
        >
          {busy ? 'Un attimo…' : status ? 'Crea un nuovo link' : `Crea il link per ${first}`}
        </button>
      )}

      {(url || hasLive) && (
        <button onClick={revoke} disabled={busy} className="text-sm font-semibold text-slate-500 underline underline-offset-4 flex items-center gap-1 disabled:opacity-60">
          <X className="w-3.5 h-3.5" /> Annulla il link
        </button>
      )}
      {error && <p role="alert" className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">{error}</p>}
    </div>
  );
}
