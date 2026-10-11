import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import {
  Coins,
  Cpu,
  DollarSign,
  Filter,
  History,
  Mail,
  Search,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Trash2,
  TrendingUp,
  UserPlus,
  X,
} from 'lucide-react';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  query,
  limit,
  orderBy,
  addDoc,
  runTransaction,
} from 'firebase/firestore';
import { sendPasswordResetEmail, onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import type { UserProfile } from '../types';
import { PRICES } from '../lib/plans';

type Plan = 'free' | 'smart' | 'pro';
type AlertType = 'success' | 'info' | 'error';
type UserOverride = Pick<Partial<UserProfile>, 'plan' | 'isAdmin' | 'isSuspended'>;

export interface AuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetUserId: string;
  targetUserEmail: string;
  timestamp: string;
  details: string;
}

const MOCK_FAMILIES = [
  {
    id: 'mock_1',
    name: 'Famiglia Rossi',
    email: 'rossi.famiglia@outlook.it',
    plan: 'pro',
    isAdmin: false,
    isSuspended: false,
    createdAt: '2026-04-12T10:00:00Z',
    aiInteractionsThisMonth: 3,
    dietaryRestrictions: [],
    excludedIngredients: [],
  },
  {
    id: 'mock_2',
    name: 'Elena e Matteo Bianchi',
    email: 'elena.bianchi@gmail.com',
    plan: 'smart',
    isAdmin: false,
    isSuspended: false,
    createdAt: '2026-05-01T15:30:00Z',
    aiInteractionsThisMonth: 0,
    dietaryRestrictions: [],
    excludedIngredients: [],
  },
  {
    id: 'mock_3',
    name: 'Famiglia Ricci',
    email: 'ricci.spesa90@gmail.com',
    plan: 'free',
    isAdmin: false,
    isSuspended: false,
    createdAt: '2026-05-18T09:12:00Z',
    aiInteractionsThisMonth: 1,
    dietaryRestrictions: [],
    excludedIngredients: [],
  },
  {
    id: 'mock_4',
    name: 'Marco Esposito',
    email: 'marco.esposito@unina.it',
    plan: 'pro',
    isAdmin: false,
    isSuspended: true,
    createdAt: '2026-03-24T18:45:00Z',
    aiInteractionsThisMonth: 4,
    dietaryRestrictions: [],
    excludedIngredients: [],
  },
  {
    id: 'mock_5',
    name: 'Famiglia Moretti (6 persone)',
    email: 'infofamigliamoretti@libero.it',
    plan: 'pro',
    isAdmin: false,
    isSuspended: false,
    createdAt: '2026-06-02T11:20:00Z',
    aiInteractionsThisMonth: 2,
    dietaryRestrictions: [],
    excludedIngredients: [],
  },
  {
    id: 'mock_6',
    name: 'Giuseppe Verdi',
    email: 'peppe.verdi@gmail.com',
    plan: 'smart',
    isAdmin: false,
    isSuspended: false,
    createdAt: '2026-06-10T22:15:00Z',
    aiInteractionsThisMonth: 0,
    dietaryRestrictions: [],
    excludedIngredients: [],
  },
  {
    id: 'mock_7',
    name: 'Famiglia Ferrari',
    email: 'ferrari.casa@gmail.com',
    plan: 'free',
    isAdmin: false,
    isSuspended: false,
    createdAt: '2026-06-11T08:05:00Z',
    aiInteractionsThisMonth: 0,
    dietaryRestrictions: [],
    excludedIngredients: [],
  },
  {
    id: 'mock_8',
    name: 'Admin Di Bellucci',
    email: 'debora.dibellucci12@gmail.com',
    plan: 'pro',
    isAdmin: true,
    isSuspended: false,
    createdAt: '2026-01-15T14:00:00Z',
    aiInteractionsThisMonth: 12,
    dietaryRestrictions: [],
    excludedIngredients: [],
  },
] as UserProfile[];

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function createProfileId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `profile_${crypto.randomUUID()}`;
  }

  return `profile_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

function normalizeUser(id: string, data: any): UserProfile {
  return {
    id: String(id),
    name: typeof data.name === 'string' ? data.name : '',
    email: typeof data.email === 'string' ? data.email : '',
    plan: (data.plan === 'smart' || data.plan === 'pro' || data.plan === 'free') ? data.plan : 'free',
    isAdmin: Boolean(data.isAdmin),
    isSuspended: Boolean(data.isSuspended),
    aiInteractionsThisMonth: typeof data.aiInteractionsThisMonth === 'number' ? data.aiInteractionsThisMonth : 0,
    dietaryRestrictions: Array.isArray(data.dietaryRestrictions) ? data.dietaryRestrictions : [],
    excludedIngredients: Array.isArray(data.excludedIngredients) ? data.excludedIngredients : [],
    createdAt: data.createdAt 
      ? (typeof data.createdAt.toDate === 'function' 
          ? data.createdAt.toDate().toISOString() 
          : String(data.createdAt)) 
      : undefined,
  } as UserProfile;
}

export default function AdminDashboard() {
  const [realUsers, setRealUsers] = useState<UserProfile[]>([]);
  const [currentAdminUser, setCurrentAdminUser] = useState<User | null>(null);
  const [includeSimulated, setIncludeSimulated] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState<'all' | Plan>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended' | 'admin'>('all');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [mockOverrides, setMockOverrides] = useState<Record<string, UserOverride>>({});
  const [deletedMockIds, setDeletedMockIds] = useState<Set<string>>(() => new Set());

  const [alertMessage, setAlertMessage] = useState<{ type: AlertType; text: string } | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  
  // Set tracking concurrent transactions/actions to resolve race conditions
  const [pendingActions, setPendingActions] = useState<Set<string>>(() => new Set());

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);

  const [showAddNewUser, setShowAddNewUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPlan, setNewUserPlan] = useState<Plan>('free');

  // Track currently authenticated admin
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setCurrentAdminUser(usr);
    });
    return unsubscribe;
  }, []);

  const startAction = (key: string) => {
    setPendingActions((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  };

  const endAction = (key: string) => {
    setPendingActions((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  };

  const isActionPending = (key: string) => pendingActions.has(key);
  const isAnyActionPending = pendingActions.size > 0;

  // Real-time Users query bounded to 150 documents to prevent malicious scaling costs
  useEffect(() => {
    const qUsers = query(collection(db, 'users'), limit(150));
    const unsubscribe = onSnapshot(
      qUsers,
      (snapshot) => {
        const users = snapshot.docs.map((snapshotDoc) => {
          const rawData = { ...snapshotDoc.data(), id: snapshotDoc.id };
          const normalized = normalizeUser(snapshotDoc.id, rawData);
          return {
            ...normalized,
            id: snapshotDoc.id,
          };
        });

        setRealUsers(users);
        setUsersError(null);
        setIsLoadingUsers(false);
      },
      (error) => {
        console.error('Errore nel caricamento degli utenti:', error);
        setUsersError('Non è stato possibile caricare gli utenti da Firestore (accesso negato o timeout).');
        setIsLoadingUsers(false);
      },
    );

    return unsubscribe;
  }, []);

  // Real-time administrator audit log subscription
  useEffect(() => {
    const qLogs = query(
      collection(db, 'admin_audit_logs'),
      orderBy('timestamp', 'desc'),
      limit(15),
    );
    const unsubscribe = onSnapshot(
      qLogs,
      (snapshot) => {
        const logs = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const ts = data.timestamp;
          let timestampStr = '';
          if (ts) {
            if (typeof ts.toDate === 'function') {
              timestampStr = ts.toDate().toISOString();
            } else {
              timestampStr = String(ts);
            }
          }
          return {
            id: docSnap.id,
            adminId: String(data.adminId || ''),
            adminEmail: String(data.adminEmail || ''),
            action: String(data.action || ''),
            targetUserId: String(data.targetUserId || ''),
            targetUserEmail: String(data.targetUserEmail || ''),
            timestamp: timestampStr,
            details: String(data.details || ''),
          } as AuditLog;
        });
        setAuditLogs(logs);
        setIsLoadingLogs(false);
      },
      (error) => {
        console.error('Errore nel caricamento dei log di audit:', error);
        setIsLoadingLogs(false);
      },
    );

    return unsubscribe;
  }, []);

  // Write audit log entry to database helper
  const logAdminAction = async (action: string, targetId: string, targetEmail: string, details: string) => {
    try {
      await addDoc(collection(db, 'admin_audit_logs'), {
        adminId: currentAdminUser?.uid || 'unknown_admin',
        adminEmail: currentAdminUser?.email || 'admin@example.com',
        action,
        targetUserId: targetId,
        targetUserEmail: targetEmail,
        timestamp: serverTimestamp(),
        details,
      });
    } catch (e) {
      console.error('Errore durante la scrittura del log di audit:', e);
    }
  };;

  const mergedUsers = useMemo(() => {
    const merged = [...realUsers];

    if (!includeSimulated) {
      return merged;
    }

    const existingEmails = new Set(
      realUsers.map((user) => normalizeEmail(user.email ?? '')).filter(Boolean),
    );

    for (const mockUser of MOCK_FAMILIES) {
      if (deletedMockIds.has(mockUser.id)) continue;
      if (existingEmails.has(normalizeEmail(mockUser.email ?? ''))) continue;
      if (realUsers.some((user) => user.id === mockUser.id)) continue;

      merged.push({
        ...mockUser,
        ...(mockOverrides[mockUser.id] ?? {}),
      });
    }

    return merged;
  }, [deletedMockIds, includeSimulated, mockOverrides, realUsers]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return mergedUsers.filter((user) => {
      const matchesSearch =
        !normalizedSearch ||
        (user.name ?? '').toLowerCase().includes(normalizedSearch) ||
        (user.email ?? '').toLowerCase().includes(normalizedSearch);

      const matchesPlan = filterPlan === 'all' || user.plan === filterPlan;

      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && !user.isSuspended) ||
        (filterStatus === 'suspended' && Boolean(user.isSuspended)) ||
        (filterStatus === 'admin' && Boolean(user.isAdmin));

      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [filterPlan, filterStatus, mergedUsers, searchTerm]);

  const selectedUser = useMemo(
    () => mergedUsers.find((user) => user.id === selectedUserId) ?? null,
    [mergedUsers, selectedUserId],
  );

  useEffect(() => {
    if (selectedUserId && !selectedUser) {
      setSelectedUserId(null);
    }
  }, [selectedUser, selectedUserId]);

  // Le metriche usano esclusivamente utenti reali. Ricerca, filtri e demo non devono alterare i totali.
  const stats = useMemo(() => {
    const productionUsers = realUsers.filter((user) => !user.isAdmin);
    const billableUsers = productionUsers.filter((user) => !user.isSuspended);

    const totalUsers = productionUsers.length;
    const standardUsers = billableUsers.filter((user) => user.plan === 'smart').length;
    const proUsers = billableUsers.filter((user) => user.plan === 'pro').length;
    const freeUsers = billableUsers.filter((user) => user.plan === 'free' || !user.plan).length;
    const suspendedUsers = productionUsers.filter((user) => user.isSuspended).length;

    const mrr = standardUsers * PRICES.smart.month + proUsers * PRICES.pro.month;
    const serverHostingCost = 15 + Math.max(0, totalUsers - 10) * 0.01;
    const firestoreCost = totalUsers * 0.00018;
    const geminiApiCost = productionUsers.reduce(
      (total, user) => total + (user.aiInteractionsThisMonth ?? 0) * 0.0025,
      0,
    );
    const maintenanceCost = 20 + totalUsers * 0.001;
    const totalCost = serverHostingCost + firestoreCost + geminiApiCost + maintenanceCost;
    const netProfit = mrr - totalCost;
    const margin = mrr > 0 ? (netProfit / mrr) * 100 : 0;

    return {
      totalUsers,
      standardUsers,
      proUsers,
      freeUsers,
      suspendedUsers,
      mrr,
      serverHostingCost,
      firestoreCost,
      geminiApiCost,
      maintenanceCost,
      totalCost,
      netProfit,
      margin,
    };
  }, [realUsers]);

  const runSecureToggle = async (
    userId: string,
    fieldName: 'plan' | 'isAdmin' | 'isSuspended',
    newValue: any,
    auditAction: string,
    successMsg: string,
    targetUser: UserProfile
  ) => {
    if (userId.startsWith('mock_')) {
      const patch = { [fieldName]: newValue };
      setMockOverrides((previous) => ({
        ...previous,
        [userId]: { ...previous[userId], ...patch },
      }));
      setAlertMessage({ type: 'info', text: `[SIMULATO] ${successMsg}` });
      await logAdminAction(auditAction + ' [SIMULATO]', userId, targetUser.email || '', `Valore simulato modificato in: ${newValue}`);
      return;
    }

    const actionKey = `update:${userId}`;
    startAction(actionKey);

    try {
      const userRef = doc(db, 'users', userId);
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
          throw new Error("L'utente non esiste nel database.");
        }
        transaction.update(userRef, { [fieldName]: newValue });
      });

      setAlertMessage({ type: 'success', text: successMsg });
      await logAdminAction(auditAction, userId, targetUser.email || '', `Modificato campo '${fieldName}' in '${newValue}'`);
    } catch (error: any) {
      console.error('Errore durante transazione aggiornamento profilo:', error);
      setAlertMessage({ type: 'error', text: `Aggiornamento non riuscito: ${error.message || error}` });
    } finally {
      endAction(actionKey);
    }
  };

  const handleUpdateUserPlan = async (userId: string, plan: Plan) => {
    const userToUpdate = mergedUsers.find(u => u.id === userId);
    if (!userToUpdate) return;
    await runSecureToggle(
      userId,
      'plan',
      plan,
      'UPDATE_PLAN',
      `Piano aggiornato a ${plan.toUpperCase()}.`,
      userToUpdate
    );
  };

  const handleToggleAdminStatus = async (user: UserProfile) => {
    const isSelf = user.id === currentAdminUser?.uid || 
      (user.email && currentAdminUser?.email && normalizeEmail(user.email) === normalizeEmail(currentAdminUser.email));
    
    if (isSelf) {
      setAlertMessage({
        type: 'error',
        text: 'Non puoi rimuovere o modificare i privilegi amministrativi dal tuo stesso account.',
      });
      return;
    }

    await runSecureToggle(
      user.id,
      'isAdmin',
      !user.isAdmin,
      user.isAdmin ? 'REVOKE_ADMIN' : 'GRANT_ADMIN',
      `Privilegi amministrativi ${!user.isAdmin ? 'abilitati' : 'rimossi'}.`,
      user
    );
  };

  const handleToggleSuspension = async (user: UserProfile) => {
    const isSelf = user.id === currentAdminUser?.uid || 
      (user.email && currentAdminUser?.email && normalizeEmail(user.email) === normalizeEmail(currentAdminUser.email));

    if (isSelf) {
      setAlertMessage({ type: 'error', text: 'Non puoi sospendere il tuo stesso account.' });
      return;
    }

    await runSecureToggle(
      user.id,
      'isSuspended',
      !user.isSuspended,
      !user.isSuspended ? 'SUSPEND_USER' : 'REACTIVE_USER',
      `Account ${!user.isSuspended ? 'sospeso' : 'riattivato'}.`,
      user
    );
  };

  const handleSendPasswordReset = async (user: UserProfile) => {
    if (user.id.startsWith('mock_')) {
      setAlertMessage({
        type: 'info',
        text: '[SIMULATO] Nessuna email è stata realmente inviata.',
      });
      return;
    }

    const email = normalizeEmail(user.email ?? '');
    if (!email) {
      setAlertMessage({ type: 'error', text: 'Questo profilo non contiene un indirizzo email.' });
      return;
    }

    const actionKey = `reset:${user.id}`;
    startAction(actionKey);

    try {
      await sendPasswordResetEmail(auth, email);
      setAlertMessage({
        type: 'success',
        text: `Email ufficiale di reimpostazione inviata a ${email}.`,
      });
      await logAdminAction('PASSWORD_RESET', user.id, email, `Inviata email di reset a ${email}`);
    } catch (error: any) {
      console.error('Errore durante l’invio del reset password:', error);
      let errorMsg = 'Invio non riuscito.';
      if (error.code === 'auth/user-not-found') {
        errorMsg = `L'utente con email ${email} non esiste in Firebase Authentication (deve effettuare il primo accesso/registrazione con questa email tramite login o Google).`;
      } else {
        errorMsg = `Errore di Firebase Auth: ${error.message || error}`;
      }
      setAlertMessage({
        type: 'error',
        text: errorMsg,
      });
    } finally {
      endAction(actionKey);
    }
  };

  const handleCreateProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isLoadingUsers || usersError) {
      setAlertMessage({
        type: 'error',
        text: 'Creazione non consentita durante il caricamento o se sono presenti errori di connessione.',
      });
      return;
    }

    const name = newUserName.trim();
    const email = normalizeEmail(newUserEmail);

    if (!name || !email) {
      setAlertMessage({ type: 'error', text: 'Nome ed email sono obbligatori.' });
      return;
    }

    const duplicatedEmail = realUsers.some(
      (user) => normalizeEmail(user.email ?? '') === email,
    );

    if (duplicatedEmail) {
      setAlertMessage({ type: 'error', text: 'Esiste già un profilo nel database con questa email.' });
      return;
    }

    const actionKey = 'create-profile';
    startAction(actionKey);

    try {
      const profileId = createProfileId();
      const newUserDoc = {
        name,
        email,
        plan: newUserPlan,
        isAdmin: false,
        isSuspended: false,
        dietaryRestrictions: [],
        excludedIngredients: [],
        aiInteractionsThisMonth: 0,
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', profileId), newUserDoc);

      setNewUserName('');
      setNewUserEmail('');
      setNewUserPlan('free');
      setShowAddNewUser(false);
      setAlertMessage({
        type: 'info',
        text: `Profilo “${name}” creato con ID: ${profileId}. Nota: L'utente dovrà eseguire l'accesso per attivare le credenziali di Authentication.`,
      });
      await logAdminAction('CREATE_PROFILE', profileId, email, `Creato profilo con piano ${newUserPlan.toUpperCase()}`);
    } catch (error: any) {
      console.error('Errore durante la creazione del profilo:', error);
      setAlertMessage({ type: 'error', text: `Creazione del profilo non riuscita: ${error.message || error}` });
    } finally {
      endAction(actionKey);
    }
  };

  const handleDeleteUser = async (user: UserProfile) => {
    if (user.id.startsWith('mock_')) {
      setDeletedMockIds((previous) => {
        const next = new Set(previous);
        next.add(user.id);
        return next;
      });
      setSelectedUserId(null);
      setAlertMessage({ type: 'info', text: '[SIMULATO] Utente demo rimosso dalla sessione.' });
      return;
    }

    const isSelf = user.id === currentAdminUser?.uid || 
      (user.email && currentAdminUser?.email && normalizeEmail(user.email) === normalizeEmail(currentAdminUser.email));

    if (isSelf) {
      setAlertMessage({ type: 'error', text: 'Non puoi eliminare il tuo stesso profilo.' });
      return;
    }

    const confirmed = window.confirm(
      `Sei sicuro di voler eliminare definitivamente il profilo Firestore di "${user.name}" (ID: ${user.id})?\n\n` +
      'ATTENZIONE: Questa azione elimina SOLO il profilo Firestore originario. Sottocollezioni di ricette, piani settimanali o preferenze e le credenziali di Firebase Authentication (se l\'utente ha già effettuato l\'accesso) continueranno ad esistere. Dovranno essere rimosse manualmente dall\'amministrazione di sistema.'
    );
    if (!confirmed) return;

    const actionKey = `delete:${user.id}`;
    startAction(actionKey);

    try {
      await deleteDoc(doc(db, 'users', user.id));
      setSelectedUserId(null);
      setAlertMessage({
        type: 'info',
        text: 'Profilo Firestore eliminato con successo dall’anagrafica.',
      });
      await logAdminAction('DELETE_PROFILE', user.id, user.email || '', `Eliminato profilo di ${user.name}`);
    } catch (error: any) {
      console.error('Errore durante l’eliminazione del profilo:', error);
      setAlertMessage({ type: 'error', text: `Eliminazione fallita: ${error.message || error}` });
    } finally {
      endAction(actionKey);
    }
  };

  return (
    <div className="space-y-8 pb-24">
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 p-8 text-white shadow-xl">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-red-500/10 to-indigo-500/10 opacity-40" />
        <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="max-w-xl">
            <span className="rounded-full border border-red-500/30 bg-red-500/20 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-red-400">
              Super Admin Console
            </span>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
              Pannello Controllo Amministratore
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Gestisci i profili Firestore, i piani e gli stati degli utenti. Le metriche escludono demo,
              amministratori e filtri della tabella.
            </p>
          </div>

          <div className="flex shrink-0 items-center justify-between gap-4 rounded-2xl border border-slate-700/60 bg-slate-800/80 p-4 backdrop-blur-sm">
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-300">
                Utenti di prova
              </span>
              <span className="text-xs text-slate-400">Mostra simulazioni</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={includeSimulated}
              aria-label="Mostra utenti simulati"
              onClick={() => setIncludeSimulated((value) => !value)}
              className={`h-6 w-12 cursor-pointer rounded-full p-0.5 transition-colors ${
                includeSimulated ? 'bg-indigo-600' : 'bg-slate-600'
              }`}
            >
              <span
                className={`block h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
                  includeSimulated ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {alertMessage && (
        <div
          className={`flex items-center justify-between rounded-2xl border p-4 text-xs font-semibold shadow-sm ${
            alertMessage.type === 'success'
              ? 'border-emerald-100 bg-emerald-50 text-emerald-800'
              : alertMessage.type === 'info'
                ? 'border-sky-100 bg-sky-50 text-sky-800'
                : 'border-rose-100 bg-rose-50 text-rose-800'
          }`}
        >
          <span>{alertMessage.text}</span>
          <button
            type="button"
            aria-label="Chiudi messaggio"
            onClick={() => setAlertMessage(null)}
            className="cursor-pointer rounded-full p-1 hover:bg-black/5"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <MetricCard
          label="Ricavi teorici dai piani (MRR)"
          value={`€${stats.mrr.toFixed(2)}`}
          detail={`Smart: ${stats.standardUsers} • Pro: ${stats.proUsers}`}
          icon={<TrendingUp className="h-4 w-4" />}
          iconClassName="bg-indigo-50 text-indigo-600"
          isLoading={isLoadingUsers}
        />
        <MetricCard
          label="Costo Gemini stimato"
          value={`€${stats.geminiApiCost.toFixed(3)}`}
          detail="Basato sulle interazioni registrate"
          icon={<Cpu className="h-4 w-4" />}
          iconClassName="bg-purple-50 text-purple-600"
          isLoading={isLoadingUsers}
        />
        <MetricCard
          label="Costi cloud totali"
          value={`€${stats.totalCost.toFixed(2)}`}
          detail={`Hosting: €${stats.serverHostingCost.toFixed(2)} • DB: €${stats.firestoreCost.toFixed(2)}`}
          icon={<Coins className="h-4 w-4" />}
          iconClassName="bg-rose-50 text-rose-600"
          isLoading={isLoadingUsers}
        />
        <MetricCard
          label="Margine utile"
          value={`${stats.netProfit >= 0 ? '+' : ''}€${stats.netProfit.toFixed(2)}`}
          detail={`Margine operativo: ${stats.margin.toFixed(1)}%`}
          icon={<DollarSign className="h-4 w-4" />}
          iconClassName={
            stats.netProfit >= 0 ? 'bg-indigo-100 text-indigo-600' : 'bg-rose-100 text-rose-600'
          }
          isLoading={isLoadingUsers}
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Anagrafica Famiglie & Clienti</h2>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Ricerca e gestisci i profili salvati nella raccolta users.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddNewUser((value) => !value)}
              className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 active:scale-95"
            >
              <UserPlus className="h-4 w-4" />
              Crea profilo
            </button>
          </div>

          {showAddNewUser && (
            <form
              onSubmit={handleCreateProfile}
              className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5"
            >
              <h3 className="text-xs font-bold uppercase text-slate-900">Nuovo profilo Firestore</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <label className="space-y-1">
                  <span className="block text-[10px] font-bold uppercase text-slate-500">Nome famiglia</span>
                  <input
                    required
                    type="text"
                    value={newUserName}
                    onChange={(event) => setNewUserName(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </label>
                <label className="space-y-1">
                  <span className="block text-[10px] font-bold uppercase text-slate-500">Email</span>
                  <input
                    required
                    type="email"
                    value={newUserEmail}
                    onChange={(event) => setNewUserEmail(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </label>
                <label className="space-y-1">
                  <span className="block text-[10px] font-bold uppercase text-slate-500">Piano</span>
                  <select
                    value={newUserPlan}
                    onChange={(event) => setNewUserPlan(event.target.value as Plan)}
                    className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-200"
                  >
                    <option value="free">Famiglia Free</option>
                    <option value="smart">Famiglia (€3,99)</option>
                    <option value="pro">Chef IA (€6,99)</option>
                  </select>
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddNewUser(false)}
                  className="cursor-pointer rounded-xl px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={isActionPending('create-profile')}
                  className="cursor-pointer rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isActionPending('create-profile') ? 'Salvataggio…' : 'Salva profilo'}
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="search"
                placeholder="Cerca per nome o email…"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs outline-none transition focus:bg-white focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <label className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-1">
              <Filter className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <select
                value={filterPlan}
                onChange={(event) => setFilterPlan(event.target.value as 'all' | Plan)}
                className="w-full cursor-pointer border-none bg-slate-50 text-xs text-slate-600 outline-none"
              >
                <option value="all">Tutti i piani</option>
                <option value="free">Free</option>
                <option value="smart">Smart</option>
                <option value="pro">Pro</option>
              </select>
            </label>

            <label className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-1">
              <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <select
                value={filterStatus}
                onChange={(event) =>
                  setFilterStatus(event.target.value as 'all' | 'active' | 'suspended' | 'admin')
                }
                className="w-full cursor-pointer border-none bg-slate-50 text-xs text-slate-600 outline-none"
              >
                <option value="all">Tutti gli stati</option>
                <option value="active">Attivi</option>
                <option value="suspended">Sospesi</option>
                <option value="admin">Amministratori</option>
              </select>
            </label>
          </div>

          {usersError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
              {usersError}
            </div>
          )}

          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Piano</th>
                  <th className="px-4 py-3">Stato</th>
                  <th className="px-4 py-3 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {isLoadingUsers ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                      Caricamento utenti…
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                      Nessun utente corrisponde ai filtri selezionati.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const isMock = user.id.startsWith('mock_');
                    return (
                      <tr
                        key={user.id}
                        className={`cursor-pointer transition hover:bg-slate-50/70 ${
                          selectedUserId === user.id ? 'bg-indigo-50/40' : ''
                        }`}
                        onClick={() => setSelectedUserId(user.id)}
                      >
                        <td className="px-4 py-3.5 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span>{user.name || 'Senza nome'}</span>
                            {isMock && (
                              <span className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[8px] font-black uppercase text-slate-400">
                                Demo
                              </span>
                            )}
                            {user.isAdmin && (
                              <span className="rounded border border-red-200 bg-red-100 px-1.5 py-0.5 text-[8px] font-black uppercase text-red-600">
                                Admin
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-[11px] text-slate-500">
                          {user.email || 'Nessuna email'}
                        </td>
                        <td className="px-4 py-3.5">
                          <PlanBadge plan={user.plan as Plan | undefined} />
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-semibold ${
                              user.isSuspended ? 'text-red-600' : 'text-emerald-600'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                user.isSuspended ? 'bg-red-500' : 'bg-emerald-500'
                              }`}
                            />
                            {user.isSuspended ? 'Sospeso' : 'Attivo'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedUserId(user.id);
                            }}
                            className="cursor-pointer rounded-lg p-1 text-[11px] font-bold text-indigo-600 hover:bg-slate-100 hover:text-indigo-800"
                          >
                            Ispeziona →
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-4">
          {selectedUser ? (
            <div className="sticky top-24 space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-400">
                    Dettaglio utente
                  </span>
                  <h3 className="mt-1 text-base font-extrabold text-slate-900">
                    {selectedUser.name || 'Senza nome'}
                  </h3>
                  <p className="mt-0.5 text-[10px] font-mono text-slate-400">
                    {selectedUser.email || 'Nessuna email'}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Chiudi dettaglio"
                  onClick={() => setSelectedUserId(null)}
                  className="cursor-pointer rounded-full p-1 text-slate-400 hover:bg-slate-100"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-2">
                <span className="block text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Piano
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(['free', 'smart', 'pro'] as const).map((plan) => (
                    <button
                      key={plan}
                      type="button"
                      disabled={isActionPending(`update:${selectedUser.id}`)}
                      onClick={() => handleUpdateUserPlan(selectedUser.id, plan)}
                      className={`cursor-pointer rounded-xl border px-1 py-2 text-center text-[10px] font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        selectedUser.plan === plan
                          ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {plan.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div>
                  <span className="block text-xs font-bold text-slate-800">Privilegi amministrativi</span>
                  <span className="text-[10px] text-slate-400">Campo profilo Firestore</span>
                </div>
                <button
                  type="button"
                  disabled={isActionPending(`update:${selectedUser.id}`)}
                  onClick={() => handleToggleAdminStatus(selectedUser)}
                  className={`cursor-pointer rounded-xl border px-3 py-1.5 text-[10px] font-bold disabled:cursor-not-allowed disabled:opacity-60 ${
                    selectedUser.isAdmin
                      ? 'border-red-200 bg-red-100 text-red-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {selectedUser.isAdmin ? 'Rimuovi admin' : 'Fai amministratore'}
                </button>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div>
                  <span className="block text-xs font-bold text-slate-800">Stato sospensione</span>
                  <span className="text-[10px] text-slate-400">Deve essere applicato anche dalle regole dell’app</span>
                </div>
                <button
                  type="button"
                  disabled={isActionPending(`update:${selectedUser.id}`)}
                  onClick={() => handleToggleSuspension(selectedUser)}
                  className={`cursor-pointer rounded-xl border px-3 py-1.5 text-[10px] font-bold disabled:cursor-not-allowed disabled:opacity-60 ${
                    selectedUser.isSuspended
                      ? 'border-emerald-200 bg-emerald-100 text-emerald-700'
                      : 'border-rose-200 bg-rose-100 text-rose-700 hover:bg-rose-50'
                  }`}
                >
                  {selectedUser.isSuspended ? 'Riattiva' : 'Sospendi'}
                </button>
              </div>

              <div className="space-y-3">
                <span className="block text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Credenziali & sicurezza
                </span>
                <button
                  type="button"
                  disabled={isActionPending(`reset:${selectedUser.id}`)}
                  onClick={() => handleSendPasswordReset(selectedUser)}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-left text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Mail className="h-4 w-4 shrink-0 text-indigo-500" />
                  {isActionPending(`reset:${selectedUser.id}`)
                    ? 'Invio in corso…'
                    : 'Invia email reset password'}
                </button>

                <button
                  type="button"
                  disabled={isActionPending(`delete:${selectedUser.id}`)}
                  onClick={() => handleDeleteUser(selectedUser)}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-left text-xs font-bold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4 shrink-0 text-rose-500" />
                  {selectedUser.id.startsWith('mock_') ? 'Rimuovi demo' : 'Elimina profilo Firestore'}
                </button>
              </div>

              <div className="rounded-2xl border border-indigo-100/50 bg-indigo-50/50 p-3 text-[10px] leading-relaxed text-indigo-950">
                <span className="mb-1 flex items-center gap-1 font-bold">
                  <Smartphone className="h-3 w-3 text-indigo-600" />
                  Informazioni profilo
                </span>
                <p>
                  ID: <code className="rounded bg-indigo-100 px-1 py-0.5 font-mono">{selectedUser.id}</code>
                </p>
                <p className="mt-1">
                  Interazioni IA: <strong>{selectedUser.aiInteractionsThisMonth ?? 0} / mese</strong>
                </p>
                <p className="mt-1">
                  Costo API stimato:{' '}
                  <strong>
                    €{((selectedUser.aiInteractionsThisMonth ?? 0) * 0.0025).toFixed(4)}
                  </strong>
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-100/60 p-8 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800">Pannello ispezione</h3>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  Seleziona un utente dalla tabella per gestire il profilo.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Registro delle Attività Amministrative in tempo reale */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <History className="h-5 w-5 text-indigo-600 font-bold" />
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Registro delle Attività Amministrative</h2>
            <p className="text-[11px] text-slate-500">
              Tracciamento in tempo reale degli eventi di audit e delle modifiche effettuate dagli amministratori.
            </p>
          </div>
        </div>

        {isLoadingLogs ? (
          <div className="py-8 text-center text-xs text-slate-400 font-medium">Caricamento registro di audit...</div>
        ) : auditLogs.length === 0 ? (
          <div className="py-12 border-2 border-dashed border-slate-100 rounded-2xl text-center text-xs text-slate-400 font-medium">
            Nessun evento salvato nel log di audit di Firestore.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-150">
            <table className="w-full border-collapse text-left text-xs bg-white">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                  <th className="px-4 py-2.5">Data & Ora</th>
                  <th className="px-4 py-2.5">Amministratore</th>
                  <th className="px-4 py-2.5">Azione</th>
                  <th className="px-4 py-2.5">Target Email</th>
                  <th className="px-4 py-2.5">Dettagli Evento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {auditLogs.map((log) => {
                  let actionBadgeColor = 'bg-slate-100 text-slate-600 border-slate-200';
                  if (log.action.includes('GRANT_ADMIN')) {
                    actionBadgeColor = 'bg-red-50 text-red-700 border-red-200';
                  } else if (log.action.includes('REVOKE_ADMIN')) {
                    actionBadgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
                  } else if (log.action.includes('SUSPEND')) {
                    actionBadgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
                  } else if (log.action.includes('REACTIVE')) {
                    actionBadgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  } else if (log.action.includes('CREATE_PROFILE')) {
                    actionBadgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-200';
                  } else if (log.action.includes('DELETE_PROFILE')) {
                    actionBadgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
                  } else if (log.action.includes('PASSWORD_RESET')) {
                    actionBadgeColor = 'bg-sky-50 text-sky-700 border-sky-200';
                  } else if (log.action.includes('UPDATE_PLAN')) {
                    actionBadgeColor = 'bg-purple-50 text-purple-700 border-purple-200';
                  }

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-slate-400 font-mono text-[10px] whitespace-nowrap">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString('it-IT') : 'Data sconosciuta'}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700 whitespace-nowrap">
                        {log.adminEmail || 'Admin locale'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-bold ${actionBadgeColor}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-semibold text-slate-800">{log.targetUserEmail || 'N/A'}</span>
                        <span className="block text-[9px] text-slate-400 font-mono">ID: {log.targetUserId}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {log.details}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon,
  iconClassName,
  isLoading,
}: {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
  iconClassName: string;
  isLoading?: boolean;
}) {
  return (
    <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm min-h-[120px]">
      {isLoading ? (
        <div className="animate-pulse space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-3 w-2/3 rounded bg-slate-100" />
            <div className="h-8 w-8 rounded-xl bg-slate-100" />
          </div>
          <div className="space-y-1.5">
            <div className="h-6 w-1/2 rounded bg-slate-200" />
            <div className="h-3 w-3/4 rounded bg-slate-100" />
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
            <span className={`rounded-xl p-2 ${iconClassName}`}>{icon}</span>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-black text-slate-900">{value}</h3>
            <p className="mt-1 text-[10px] text-slate-400">{detail}</p>
          </div>
        </>
      )}
    </div>
  );
}

function PlanBadge({ plan }: { plan?: string }) {
  if (plan === 'pro') {
    return (
      <span className="inline-flex items-center rounded-full border border-purple-200 bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700">
        PRO (IA)
      </span>
    );
  }
  if (plan === 'smart') {
    return (
      <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
        SMART
      </span>
    );
  }
  if (plan === 'free') {
    return (
      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
        FREE
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
      PIANO NON VALIDO ({String(plan || 'VUOTO')})
    </span>
  );
}
