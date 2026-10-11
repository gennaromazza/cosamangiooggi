import { useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  ExternalLink,
  Gift,
  History,
  KeyRound,
  Search,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import {
  addDoc,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { PLAN_NAMES, normalizePlan } from '../lib/plans';
import type { PlanId } from '../lib/plans';

const USERS_LIMIT = 150;

interface AdminUser {
  id: string;
  name: string;
  email: string;
  plan: PlanId;
  suspended: boolean;
  /** Abbonamento gestito da Stripe (il piano cambia solo da lì) */
  hasSubscription: boolean;
  renews: boolean;
  flyerScans: number;
  createdAt: string | null;
}

interface AuditEntry {
  id: string;
  action: string;
  adminEmail: string;
  targetUserEmail: string;
  details: string;
  timestamp: string;
}

type Filter = 'all' | PlanId | 'suspended';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Tutti' },
  { id: 'smart', label: PLAN_NAMES.smart },
  { id: 'pro', label: PLAN_NAMES.pro },
  { id: 'free', label: PLAN_NAMES.free },
  { id: 'suspended', label: 'Sospesi' },
];

const ACTION_LABELS: Record<string, string> = {
  SUSPEND_USER: 'Account sospeso',
  REACTIVE_USER: 'Account riattivato',
  PASSWORD_RESET: 'Email di reset inviata',
  GIFT_PLAN: 'Piano regalato',
};

const currentMonth = () => new Date().toISOString().slice(0, 7);

function toAdminUser(id: string, data: Record<string, any>): AdminUser {
  const created = data.createdAt;
  const aiUsage = data.aiUsage;
  return {
    id,
    name: typeof data.name === 'string' ? data.name : '',
    email: typeof data.email === 'string' ? data.email : '',
    plan: normalizePlan(data.plan),
    suspended: data.isSuspended === true,
    hasSubscription: typeof data.stripeSubscriptionId === 'string' && data.stripeSubscriptionId !== '',
    renews: data.autoRenew === true,
    flyerScans: aiUsage && aiUsage.month === currentMonth() ? Number(aiUsage.flyerScans) || 0 : 0,
    createdAt: created
      ? typeof created.toDate === 'function'
        ? created.toDate().toISOString()
        : String(created)
      : null,
  };
}

const formatDate = (iso: string | null) => {
  if (!iso) return '—';
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('it-IT');
};

const formatDateTime = (iso: string) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
};

const PLAN_BADGE: Record<PlanId, string> = {
  free: 'bg-slate-100 text-slate-600',
  smart: 'bg-emerald-50 text-emerald-700',
  pro: 'bg-purple-50 text-purple-700',
};

export default function AdminDashboard() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const me = auth.currentUser;

  useEffect(() => {
    return onSnapshot(
      query(collection(db, 'users'), limit(USERS_LIMIT)),
      (snap) => {
        setUsers(snap.docs.map((d) => toAdminUser(d.id, d.data())));
        setLoadError(false);
        setLoading(false);
      },
      (error) => {
        console.error('Errore nel caricamento degli utenti:', error);
        setLoadError(true);
        setLoading(false);
      },
    );
  }, []);

  useEffect(() => {
    return onSnapshot(
      query(collection(db, 'admin_audit_logs'), orderBy('timestamp', 'desc'), limit(15)),
      (snap) => {
        setLogs(
          snap.docs.map((d) => {
            const data = d.data();
            const ts = data.timestamp;
            return {
              id: d.id,
              action: String(data.action || ''),
              adminEmail: String(data.adminEmail || ''),
              targetUserEmail: String(data.targetUserEmail || ''),
              details: String(data.details || ''),
              timestamp: ts && typeof ts.toDate === 'function' ? ts.toDate().toISOString() : '',
            };
          }),
        );
      },
      (error) => console.error('Errore nel caricamento del registro:', error),
    );
  }, []);

  // Il proprio account non conta nelle statistiche e non può essere modificato da qui
  const people = useMemo(() => users.filter((u) => u.id !== me?.uid), [users, me?.uid]);

  const counts = useMemo(
    () => ({
      total: people.length,
      smart: people.filter((u) => u.plan === 'smart').length,
      pro: people.filter((u) => u.plan === 'pro').length,
      free: people.filter((u) => u.plan === 'free').length,
      suspended: people.filter((u) => u.suspended).length,
    }),
    [people],
  );

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return people
      .filter((u) => {
        if (filter === 'suspended' && !u.suspended) return false;
        if ((filter === 'free' || filter === 'smart' || filter === 'pro') && u.plan !== filter) return false;
        if (!term) return true;
        return u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term);
      })
      .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
  }, [people, search, filter]);

  const writeLog = async (action: string, user: AdminUser, details: string) => {
    try {
      await addDoc(collection(db, 'admin_audit_logs'), {
        adminId: me?.uid || 'unknown',
        adminEmail: me?.email || 'unknown',
        action,
        targetUserId: user.id,
        targetUserEmail: user.email,
        timestamp: serverTimestamp(),
        details,
      });
    } catch (error) {
      console.error('Errore durante la scrittura del registro:', error);
    }
  };

  const run = async (key: string, user: AdminUser, task: () => Promise<string>) => {
    if (busy) return;
    setBusy(key);
    setMessage(null);
    try {
      const text = await task();
      setMessage({ ok: true, text });
    } catch (error: any) {
      console.error('Azione amministratore non riuscita:', error);
      setMessage({ ok: false, text: `Non riuscito: ${error?.message || error}` });
    } finally {
      setBusy(null);
    }
  };

  const toggleSuspension = (user: AdminUser) =>
    run(`suspend:${user.id}`, user, async () => {
      const next = !user.suspended;
      await updateDoc(doc(db, 'users', user.id), { isSuspended: next });
      await writeLog(next ? 'SUSPEND_USER' : 'REACTIVE_USER', user, next ? 'Account sospeso' : 'Account riattivato');
      return next ? 'Account sospeso: non potrà più usare l’app.' : 'Account riattivato.';
    });

  const sendReset = (user: AdminUser) =>
    run(`reset:${user.id}`, user, async () => {
      if (!user.email) throw new Error('Questo account non ha un’email.');
      await sendPasswordResetEmail(auth, user.email);
      await writeLog('PASSWORD_RESET', user, `Email di reset inviata a ${user.email}`);
      return `Email di reset inviata a ${user.email}.`;
    });

  const giftPlan = (user: AdminUser, plan: PlanId) =>
    run(`plan:${user.id}`, user, async () => {
      await updateDoc(doc(db, 'users', user.id), { plan });
      await writeLog('GIFT_PLAN', user, `Piano impostato a mano: ${PLAN_NAMES[plan]}`);
      return `Piano ${PLAN_NAMES[plan]} assegnato.`;
    });

  return (
    <div className="space-y-5 pb-24 max-w-3xl mx-auto">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-slate-900">Gestione</h1>
          <p className="text-sm text-slate-500 mt-1">Chi usa l’app e che piano ha.</p>
        </div>
        <a
          href="https://dashboard.stripe.com/subscriptions"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 active:scale-95 transition-all"
        >
          Incassi su Stripe <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Persone', value: counts.total },
          { label: PLAN_NAMES.smart, value: counts.smart },
          { label: PLAN_NAMES.pro, value: counts.pro },
          { label: PLAN_NAMES.free, value: counts.free },
        ].map((card) => (
          <div key={card.label} className="bg-white border border-slate-200 rounded-2xl p-4">
            <div className="text-3xl font-display text-slate-900">{loading ? '…' : card.value}</div>
            <div className="text-sm text-slate-500">{card.label}</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500 -mt-2">
        Gli incassi reali e i rimborsi sono su Stripe: qui vedi solo i piani attivi sugli account.
      </p>

      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cerca per nome o email"
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-colors cursor-pointer ${
              filter === f.id
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {f.label}
            {f.id === 'suspended' && counts.suspended > 0 ? ` (${counts.suspended})` : ''}
          </button>
        ))}
      </div>

      {message && (
        <div
          role="status"
          className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
            message.ok ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
          }`}
        >
          {message.text}
        </div>
      )}

      {loadError ? (
        <div className="bg-red-50 border border-red-100 text-red-700 rounded-2xl p-5 text-sm">
          Non riesco a leggere gli utenti. Esci e rientra con l’account amministratore: se continua, controlla che la
          tua email sia in <strong>ADMIN_EMAILS</strong> e che le funzioni siano state pubblicate.
        </div>
      ) : loading ? (
        <div className="text-center text-slate-500 py-10">Caricamento…</div>
      ) : visible.length === 0 ? (
        <div className="text-center text-slate-500 py-10 bg-white border border-slate-200 rounded-2xl">
          {people.length === 0 ? 'Ancora nessun utente registrato.' : 'Nessun risultato.'}
        </div>
      ) : (
        <ul className="space-y-2">
          {visible.map((user) => {
            const open = openId === user.id;
            return (
              <li key={user.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenId(open ? null : user.id)}
                  aria-expanded={open}
                  className="w-full flex items-center gap-3 p-4 text-left cursor-pointer"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-900 truncate">{user.name || user.email || 'Senza nome'}</div>
                    {user.name && user.email && <div className="text-sm text-slate-500 truncate">{user.email}</div>}
                  </div>
                  {user.suspended && (
                    <span className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-700">
                      Sospeso
                    </span>
                  )}
                  <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${PLAN_BADGE[user.plan]}`}>
                    {PLAN_NAMES[user.plan]}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>

                {open && (
                  <div className="border-t border-slate-100 p-4 space-y-4 bg-slate-50/60">
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <dt className="text-slate-500">Iscritto dal</dt>
                      <dd className="text-slate-900 font-semibold">{formatDate(user.createdAt)}</dd>
                      <dt className="text-slate-500">Abbonamento</dt>
                      <dd className="text-slate-900 font-semibold">
                        {user.hasSubscription ? (user.renews ? 'Attivo, si rinnova' : 'Attivo, scade a fine periodo') : 'Nessuno'}
                      </dd>
                      {user.plan === 'pro' && (
                        <>
                          <dt className="text-slate-500">Volantini questo mese</dt>
                          <dd className="text-slate-900 font-semibold">{user.flyerScans}</dd>
                        </>
                      )}
                    </dl>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => toggleSuspension(user)}
                        disabled={busy !== null}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-colors disabled:opacity-50 cursor-pointer ${
                          user.suspended
                            ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                            : 'bg-white text-red-700 border-red-200 hover:bg-red-50'
                        }`}
                      >
                        {user.suspended ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                        {user.suspended ? 'Riattiva account' : 'Sospendi account'}
                      </button>
                      {user.email && (
                        <button
                          onClick={() => sendReset(user)}
                          disabled={busy !== null}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                        >
                          <KeyRound className="w-4 h-4" /> Email per cambiare password
                        </button>
                      )}
                    </div>

                    {user.hasSubscription ? (
                      <p className="text-xs text-slate-500">
                        Il piano di questa persona è gestito da Stripe: per cambiarlo o rimborsarla usa la dashboard di
                        Stripe.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                          <Gift className="w-4 h-4" /> Regala un piano
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(['free', 'smart', 'pro'] as PlanId[]).map((plan) => (
                            <button
                              key={plan}
                              onClick={() => giftPlan(user, plan)}
                              disabled={busy !== null || user.plan === plan}
                              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors disabled:opacity-50 cursor-pointer ${
                                user.plan === plan
                                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              {PLAN_NAMES[plan]}
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-slate-500">Non passa da Stripe: nessun addebito e nessuna scadenza.</p>
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {users.length >= USERS_LIMIT && (
        <p className="text-xs text-slate-500">Sono mostrati i primi {USERS_LIMIT} account: usa la ricerca per trovare gli altri.</p>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <button
          onClick={() => setShowLogs((v) => !v)}
          aria-expanded={showLogs}
          className="w-full flex items-center gap-3 p-4 text-left cursor-pointer"
        >
          <History className="w-5 h-5 text-slate-500" />
          <span className="flex-1 font-bold text-slate-900">Ultime azioni</span>
          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showLogs ? 'rotate-180' : ''}`} />
        </button>
        {showLogs && (
          <ul className="border-t border-slate-100 divide-y divide-slate-100">
            {logs.length === 0 && <li className="p-4 text-sm text-slate-500">Nessuna azione registrata.</li>}
            {logs.map((log) => (
              <li key={log.id} className="p-4 text-sm">
                <div className="font-semibold text-slate-900">{ACTION_LABELS[log.action] || log.action}</div>
                <div className="text-slate-500">
                  {log.targetUserEmail || 'utente'} · {log.adminEmail} · {formatDateTime(log.timestamp)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
