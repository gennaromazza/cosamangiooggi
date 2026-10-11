import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { ExternalLink, KeyRound, LogOut, Trash2, Wallet } from 'lucide-react';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  updatePassword,
  updateProfile,
} from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions } from '../lib/firebase';
import { planName } from '../lib/plans';
import { remindersAvailable, setSundayReminder, sundayReminderEnabled } from '../lib/reminders';
import type { UserProfile } from '../types';

interface AccountSettingsProps {
  user: any;
  profile: UserProfile | null;
  onProfileUpdate: (profile: UserProfile) => void;
  onOpenSubscription: () => void;
  onLogout: () => void;
  /** Gli amministratori non possono eliminarsi da qui */
  isAdmin?: boolean;
}

type Notice = { ok: boolean; text: string } | null;

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4">
      <h2 className="font-display text-xl text-slate-900">{title}</h2>
      {children}
    </section>
  );
}

function Message({ notice }: { notice: Notice }) {
  if (!notice) return null;
  return (
    <p
      role="status"
      className={`rounded-xl px-4 py-3 text-sm font-semibold ${
        notice.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'
      }`}
    >
      {notice.text}
    </p>
  );
}

const inputClass =
  'w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-300';
const primaryButton =
  'px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold disabled:opacity-50 transition-colors cursor-pointer';
const secondaryButton =
  'inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold disabled:opacity-50 transition-colors cursor-pointer';

function passwordError(error: any): string {
  switch (error?.code) {
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'La password attuale non è corretta.';
    case 'auth/weak-password':
      return 'La nuova password è troppo corta: servono almeno 6 caratteri.';
    case 'auth/too-many-requests':
      return 'Troppi tentativi. Riprova tra qualche minuto.';
    case 'auth/requires-recent-login':
      return 'Per sicurezza esci e rientra, poi riprova.';
    default:
      return 'Non è stato possibile cambiare la password. Riprova.';
  }
}

/** Il profilo di chi è collegato: nome, accesso (Google o email), password, abbonamento, uscita ed eliminazione. */
export default function AccountSettings({
  user,
  profile,
  onProfileUpdate,
  onOpenSubscription,
  onLogout,
  isAdmin = false,
}: AccountSettingsProps) {
  const isLocal = user?.uid === 'demo-family-user' || !!user?.uid?.startsWith('local-');
  const providers: string[] = (user?.providerData || []).map((p: any) => p.providerId);
  const usesGoogle = providers.includes('google.com');
  const usesPassword = providers.includes('password');
  const email: string = user?.email || profile?.email || '';

  const [name, setName] = useState(user?.displayName || profile?.name || '');
  const [nameNotice, setNameNotice] = useState<Notice>(null);
  const [savingName, setSavingName] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [passwordNotice, setPasswordNotice] = useState<Notice>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  const [reminderOn, setReminderOn] = useState(sundayReminderEnabled);
  const [reminderNotice, setReminderNotice] = useState<Notice>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteNotice, setDeleteNotice] = useState<Notice>(null);

  const loginLabel = isLocal
    ? 'Account su questo dispositivo'
    : usesGoogle && usesPassword
      ? 'Google ed email con password'
      : usesGoogle
        ? 'Accesso con Google'
        : 'Email e password';

  const saveName = async (event: FormEvent) => {
    event.preventDefault();
    const clean = name.trim();
    if (!clean || !profile) return;
    setSavingName(true);
    setNameNotice(null);
    try {
      if (isLocal) {
        const updated = { ...profile, name: clean };
        try {
          localStorage.setItem(`profile_${user.uid}`, JSON.stringify(updated));
        } catch {
          /* storage non disponibile */
        }
        onProfileUpdate(updated);
      } else {
        if (auth.currentUser) await updateProfile(auth.currentUser, { displayName: clean });
        await updateDoc(doc(db, 'users', user.uid), { name: clean });
        onProfileUpdate({ ...profile, name: clean });
      }
      setNameNotice({ ok: true, text: 'Nome aggiornato.' });
    } catch (error) {
      console.error('Impossibile aggiornare il nome:', error);
      setNameNotice({ ok: false, text: 'Non è stato possibile salvare il nome. Riprova.' });
    } finally {
      setSavingName(false);
    }
  };

  const changePassword = async (event: FormEvent) => {
    event.preventDefault();
    setPasswordNotice(null);
    if (newPassword.length < 6) {
      setPasswordNotice({ ok: false, text: 'La nuova password deve avere almeno 6 caratteri.' });
      return;
    }
    if (newPassword !== repeatPassword) {
      setPasswordNotice({ ok: false, text: 'Le due password nuove non coincidono.' });
      return;
    }
    const current = auth.currentUser;
    if (!current || !current.email) return;
    setSavingPassword(true);
    try {
      await reauthenticateWithCredential(current, EmailAuthProvider.credential(current.email, currentPassword));
      await updatePassword(current, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setRepeatPassword('');
      setPasswordNotice({ ok: true, text: 'Password cambiata.' });
    } catch (error) {
      console.error('Cambio password non riuscito:', error);
      setPasswordNotice({ ok: false, text: passwordError(error) });
    } finally {
      setSavingPassword(false);
    }
  };

  const sendReset = async () => {
    if (!email) return;
    setPasswordNotice(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setPasswordNotice({ ok: true, text: `Ti ho scritto a ${email}: apri il link per scegliere una nuova password.` });
    } catch (error) {
      console.error('Invio email di reset non riuscito:', error);
      setPasswordNotice({ ok: false, text: 'Non è stato possibile inviare l’email. Riprova.' });
    }
  };

  const toggleReminder = async () => {
    setReminderNotice(null);
    try {
      const result = await setSundayReminder(!reminderOn);
      if (result === 'denied') {
        setReminderNotice({ ok: false, text: 'Per ricevere il promemoria consenti le notifiche dalle impostazioni del telefono.' });
        return;
      }
      setReminderOn(result === 'on');
    } catch (error) {
      console.error('Promemoria non impostato:', error);
      setReminderNotice({ ok: false, text: 'Non è stato possibile impostare il promemoria. Riprova.' });
    }
  };

  const deleteAccount = async () => {
    const extra = profile?.plan && profile.plan !== 'free' ? '\n\nL’abbonamento verrà chiuso subito, senza altri addebiti.' : '';
    const confirmed = window.confirm(
      `Eliminare definitivamente il tuo account?\n\nSi cancellano accesso, menù, dispensa e famiglia. Non si può annullare.${extra}`,
    );
    if (!confirmed) return;
    setDeleting(true);
    setDeleteNotice(null);
    try {
      await httpsCallable(functions, 'deleteMyAccount')();
      onLogout();
    } catch (error: any) {
      console.error('Eliminazione account non riuscita:', error);
      setDeleteNotice({ ok: false, text: error?.message || 'Non è stato possibile eliminare l’account. Riprova.' });
      setDeleting(false);
    }
  };

  const initial = (name || email || '?').trim().charAt(0).toUpperCase();
  const paid = !!profile?.plan && profile.plan !== 'free';

  return (
    <div className="space-y-5 pb-24 max-w-2xl mx-auto">
      <div>
        <h1 className="font-display text-3xl text-slate-900">Il mio account</h1>
        <p className="text-sm text-slate-500 mt-1">I tuoi dati e l’accesso all’app.</p>
      </div>

      <Card title="Profilo">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-2xl font-display shrink-0">
            {initial}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-slate-900 truncate">{email || 'Nessuna email'}</div>
            <div className="text-sm text-slate-500">{loginLabel}</div>
          </div>
        </div>
        <form onSubmit={saveName} className="space-y-3">
          <label className="block text-sm font-bold text-slate-700" htmlFor="account-name">
            Il tuo nome
          </label>
          <div className="flex gap-2">
            <input
              id="account-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              className={inputClass}
            />
            <button type="submit" disabled={savingName || !name.trim()} className={`${primaryButton} shrink-0`}>
              Salva
            </button>
          </div>
          <Message notice={nameNotice} />
        </form>
      </Card>

      {!isLocal && (
        <Card title="Password">
          {usesPassword ? (
            <>
              <form onSubmit={changePassword} className="space-y-3">
                <input
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Password attuale"
                  required
                  className={inputClass}
                />
                <input
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nuova password (almeno 6 caratteri)"
                  required
                  className={inputClass}
                />
                <input
                  type="password"
                  autoComplete="new-password"
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  placeholder="Ripeti la nuova password"
                  required
                  className={inputClass}
                />
                <div className="flex flex-wrap gap-2">
                  <button type="submit" disabled={savingPassword} className={primaryButton}>
                    Cambia password
                  </button>
                  <button type="button" onClick={sendReset} className={secondaryButton}>
                    <KeyRound className="w-4 h-4" /> Ho dimenticato la password
                  </button>
                </div>
              </form>
              <Message notice={passwordNotice} />
            </>
          ) : (
            <>
              <p className="text-sm text-slate-600 leading-relaxed">
                Entri con il tuo account Google, quindi qui non c’è una password da gestire: la sicurezza dell’accesso
                (password, verifica in due passaggi) si regola dal tuo account Google.
              </p>
              <a
                href="https://myaccount.google.com/security"
                target="_blank"
                rel="noopener noreferrer"
                className={secondaryButton}
              >
                Sicurezza dell’account Google <ExternalLink className="w-4 h-4" />
              </a>
            </>
          )}
        </Card>
      )}

      <Card title="Abbonamento">
        <p className="text-sm text-slate-600">
          Piano attuale: <strong className="text-slate-900">{planName(profile?.plan)}</strong>
          {paid && profile?.autoRenew === false ? ' · non si rinnova' : ''}
        </p>
        <button onClick={onOpenSubscription} className={secondaryButton}>
          <Wallet className="w-4 h-4" /> {paid ? 'Gestisci abbonamento' : 'Scopri i piani'}
        </button>
      </Card>

      {remindersAvailable() && (
        <Card title="Promemoria">
          <p className="text-sm text-slate-600 leading-relaxed">
            Ogni domenica alle 10:00 ti ricordiamo di preparare il menù della settimana.
          </p>
          <button
            onClick={toggleReminder}
            role="switch"
            aria-checked={reminderOn}
            className={reminderOn ? primaryButton : secondaryButton}
          >
            {reminderOn ? 'Promemoria attivo · tocca per spegnerlo' : 'Attiva il promemoria della domenica'}
          </button>
          <Message notice={reminderNotice} />
        </Card>
      )}

      <p className="text-center text-sm text-slate-500">
        Versione dell’app: <strong className="text-slate-700">{__APP_VERSION__}</strong>
      </p>

      <Card title="Esci">
        <button onClick={onLogout} className={secondaryButton}>
          <LogOut className="w-4 h-4" /> Esci dall’app
        </button>
      </Card>

      {!isLocal && !isAdmin && (
        <Card title="Elimina account">
          <p className="text-sm text-slate-600 leading-relaxed">
            Cancella per sempre il tuo accesso e tutti i tuoi dati: menù, dispensa e famiglia.
            {paid ? ' L’abbonamento viene chiuso subito.' : ''}
          </p>
          <button
            onClick={deleteAccount}
            disabled={deleting}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-red-200 text-red-700 hover:bg-red-50 text-sm font-bold disabled:opacity-50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" /> {deleting ? 'Elimino…' : 'Elimina il mio account'}
          </button>
          <Message notice={deleteNotice} />
        </Card>
      )}
    </div>
  );
}
