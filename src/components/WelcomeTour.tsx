import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  Users,
  Check,
  ArrowRight,
  ArrowLeft,
  Plus,
  X,
  PartyPopper,
  Heart,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Logo from './Logo';
import { DietaryRestriction, FamilyMember, UserProfile } from '../types';
import { limitsFor } from '../lib/plans';

type Tab = 'planner' | 'shopping' | 'pantry' | 'recipes' | 'family' | 'offers' | 'vacation' | 'guide' | 'business' | 'admin';

interface WelcomeTourProps {
  user: any;
  profile: UserProfile | null;
  onNavigate: (tab: Tab) => void;
  onProfileUpdate: (profile: UserProfile) => void;
}

const DIETS: { id: DietaryRestriction; emoji: string; label: string }[] = [
  { id: 'vegan', emoji: '🌱', label: 'Vegano' },
  { id: 'gluten-free', emoji: '🌾', label: 'Senza glutine' },
  { id: 'lactose-free', emoji: '🥛', label: 'Senza lattosio' },
];

const TOTAL_STEPS = 5;

/**
 * Percorso di benvenuto a schermate: compare a ogni nuova registrazione e accompagna
 * l'utente, passo dopo passo, fino al primo menù. Salva davvero i dati inseriti.
 */
export default function WelcomeTour({ user, profile, onNavigate, onProfileUpdate }: WelcomeTourProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const [members, setMembers] = useState<{ id: string; name: string }[]>([]);
  const [memberName, setMemberName] = useState('');
  const [limitHit, setLimitHit] = useState(false);
  const [diets, setDiets] = useState<DietaryRestriction[]>([]);
  const [excluded, setExcluded] = useState<string[]>([]);
  const [excludedInput, setExcludedInput] = useState('');

  const isDemo = user?.uid === 'demo-family-user';
  const isLocal = isDemo || !!user?.uid?.startsWith('local-');
  // L'account demo ha dati d'esempio già pronti: gli mostriamo solo la visita guidata
  const interactive = !isDemo;
  // Il nome mostrato è quello della persona; 'Nuova Famiglia spesa' è solo il segnaposto del profilo
  const profileName = profile?.name && profile.name !== 'Nuova Famiglia spesa' ? profile.name : '';
  const firstName = (user?.displayName || profileName || '').trim().split(' ')[0];
  const seededFor = useRef<string | null>(null);

  useEffect(() => {
    if (!user || !profile) return;
    const storageKey = `welcome_tour_completed_${user.uid}`;
    let localCompleted = false;
    try {
      localCompleted = localStorage.getItem(storageKey) === 'true';
    } catch {
      /* storage non disponibile */
    }
    if (profile.hasCompletedWelcomeTour || localCompleted) return;

    const createdAtTime = profile.createdAt ? new Date(profile.createdAt).getTime() : 0;
    const isRecent = Date.now() - createdAtTime < 7 * 24 * 60 * 60 * 1000;
    const isEmptyDiet =
      (!profile.dietaryRestrictions || profile.dietaryRestrictions.length === 0) &&
      (!profile.excludedIngredients || profile.excludedIngredients.length === 0);

    if (isRecent || isEmptyDiet) {
      const timer = setTimeout(() => setIsOpen(true), 600);
      return () => clearTimeout(timer);
    }
  }, [user, profile]);

  // Permette di rivedere la guida dal menù Famiglia
  useEffect(() => {
    const open = () => {
      setStep(0);
      setIsOpen(true);
    };
    window.addEventListener('open-welcome-tour', open);
    return () => window.removeEventListener('open-welcome-tour', open);
  }, []);

  // All'apertura: mostra chi c'è già a tavola e, se non c'è nessuno, aggiunge la persona che si è appena registrata
  useEffect(() => {
    if (!isOpen || !interactive || !user || seededFor.current === user.uid) return;
    seededFor.current = user.uid;
    let cancelled = false;
    (async () => {
      try {
        let existing: { id: string; name: string }[];
        if (isLocal) {
          existing = readLocal<FamilyMember[]>(`members_${user.uid}`, []).map((m) => ({ id: m.id, name: m.name }));
        } else {
          const snap = await getDocs(collection(db, `users/${user.uid}/familyMembers`));
          existing = snap.docs.map((d) => ({ id: d.id, name: String(d.data().name || '') }));
        }
        if (cancelled) return;
        if (existing.length > 0 || !firstName) {
          setMembers(existing);
          return;
        }
        const blank = { likedIngredients: [], dislikedIngredients: [], likedMeals: [], dislikedMeals: [] };
        if (isLocal) {
          const created: FamilyMember = { id: Date.now().toString(), name: firstName, ...blank };
          localStorage.setItem(`members_${user.uid}`, JSON.stringify([created]));
          setMembers([{ id: created.id, name: firstName }]);
        } else {
          const ref = await addDoc(collection(db, `users/${user.uid}/familyMembers`), { name: firstName, ...blank });
          if (!cancelled) setMembers([{ id: ref.id, name: firstName }]);
        }
      } catch (e) {
        console.error('Impossibile caricare le persone a tavola:', e);
        seededFor.current = null;
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, interactive, user?.uid]);

  // Impedisce lo scroll della pagina sotto la guida
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const go = (next: number) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  // ---- Salvataggio -------------------------------------------------------

  const readLocal = <T,>(key: string, fallback: T): T => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  };

  const addMember = async () => {
    const name = memberName.trim();
    if (!name) return;
    if (members.length >= limitsFor(profile?.plan).maxMembers) {
      setLimitHit(true);
      return;
    }
    setLimitHit(false);
    try {
      if (isLocal) {
        const saved = readLocal<FamilyMember[]>(`members_${user.uid}`, []);
        const created: FamilyMember = {
          id: Date.now().toString(),
          name,
          likedIngredients: [],
          dislikedIngredients: [],
          likedMeals: [],
          dislikedMeals: [],
        };
        localStorage.setItem(`members_${user.uid}`, JSON.stringify([...saved, created]));
        setMembers((m) => [...m, { id: created.id, name }]);
      } else {
        const ref = await addDoc(collection(db, `users/${user.uid}/familyMembers`), {
          name,
          likedIngredients: [],
          dislikedIngredients: [],
          likedMeals: [],
          dislikedMeals: [],
        });
        setMembers((m) => [...m, { id: ref.id, name }]);
      }
      setMemberName('');
    } catch (e) {
      console.error('Impossibile aggiungere il membro:', e);
    }
  };

  const removeMember = async (id: string) => {
    setMembers((m) => m.filter((x) => x.id !== id));
    setLimitHit(false);
    try {
      if (isLocal) {
        const saved = readLocal<FamilyMember[]>(`members_${user.uid}`, []);
        localStorage.setItem(`members_${user.uid}`, JSON.stringify(saved.filter((x) => x.id !== id)));
      } else {
        await deleteDoc(doc(db, `users/${user.uid}/familyMembers`, id));
      }
    } catch (e) {
      console.error('Impossibile rimuovere il membro:', e);
    }
  };

  const savePreferences = async () => {
    try {
      if (isLocal) {
        const base = readLocal<UserProfile | null>(`profile_${user.uid}`, null) || profile;
        if (!base) return;
        const updated = { ...base, dietaryRestrictions: diets, excludedIngredients: excluded } as UserProfile;
        localStorage.setItem(`profile_${user.uid}`, JSON.stringify(updated));
        onProfileUpdate(updated);
      } else {
        await updateDoc(doc(db, 'users', user.uid), {
          dietaryRestrictions: diets,
          excludedIngredients: excluded,
        });
      }
    } catch (e) {
      console.error('Impossibile salvare le preferenze:', e);
    }
  };

  const addExcluded = () => {
    const value = excludedInput.trim();
    if (!value) return;
    const normalized = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    setExcluded((list) => (list.some((x) => x.toLowerCase() === normalized.toLowerCase()) ? list : [...list, normalized]));
    setExcludedInput('');
  };

  const finish = async (target: Tab | null) => {
    setIsOpen(false);
    try {
      localStorage.setItem(`welcome_tour_completed_${user.uid}`, 'true');
    } catch {
      /* storage non disponibile */
    }
    if (!isLocal) {
      try {
        await updateDoc(doc(db, 'users', user.uid), { hasCompletedWelcomeTour: true });
      } catch (e) {
        console.error('Impossibile salvare lo stato della guida:', e);
      }
    }
    if (target === 'planner') {
      try {
        sessionStorage.setItem('auto_generate_plan', '1');
      } catch {
        /* storage non disponibile */
      }
    }
    if (target) onNavigate(target);
  };

  const next = async () => {
    if (interactive && step === 3) await savePreferences();
    // Nell'account demo si saltano le schermate da compilare
    if (!interactive && step === 0) return go(TOTAL_STEPS - 1);
    go(step + 1);
  };

  const back = () => {
    if (!interactive && step === TOTAL_STEPS - 1) return go(0);
    go(step - 1);
  };

  if (!isOpen) return null;

  // ---- Schermate ---------------------------------------------------------

  const screens = [
    // 0 — benvenuto
    <div key="welcome" className="flex flex-col items-center text-center">
      <Logo className="w-24 h-24 drop-shadow-lg mb-6" />
      <h2 className="text-3xl font-semibold text-slate-900 mb-2">
        {firstName ? `Ciao ${firstName}!` : 'Benvenuto!'}
      </h2>
      <p className="text-slate-600 leading-relaxed max-w-xs">
        {interactive
          ? 'In due minuti prepariamo tutto per il tuo primo menù. Niente di complicato: ti accompagniamo noi.'
          : 'Ti mostriamo come funziona l\'app, in pochi passi.'}
      </p>
      <ol className="mt-8 w-full max-w-xs space-y-3 text-left">
        {[
          interactive ? 'Ci dici chi mangia a tavola' : 'Chi mangia a tavola',
          interactive ? 'Segnali cosa evitare' : 'Cosa evitare',
          'Il menù della settimana è pronto',
        ].map((label, i) => (
          <li key={label} className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
              {i + 1}
            </span>
            <span className="text-slate-700 font-medium">{label}</span>
          </li>
        ))}
      </ol>
    </div>,

    // 1 — chi siede a tavola
    <div key="members">
      <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-5">
        <Users className="w-7 h-7" />
      </div>
      <h2 className="text-3xl font-semibold text-slate-900 mb-2">Chi siede a tavola?</h2>
      <p className="text-slate-600 leading-relaxed mb-6">
        {members.length > 0 && firstName && members.some((m) => m.name === firstName)
          ? `Ho già aggiunto te, ${firstName}. Aggiungi anche gli altri: il menù terrà conto dei gusti di tutti.`
          : 'Aggiungi le persone per cui cucini: il menù terrà conto dei loro gusti.'}
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          autoFocus
          value={memberName}
          onChange={(e) => {
            setMemberName(e.target.value);
            setLimitHit(false);
          }}
          onKeyDown={(e) => e.key === 'Enter' && addMember()}
          placeholder="Nome (es. Luca)"
          className="flex-1 min-w-0 bg-white border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={addMember}
          aria-label="Aggiungi persona"
          className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 flex items-center gap-1.5 font-bold"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Aggiungi</span>
        </button>
      </div>
      {limitHit && (
        <p className="mt-3 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">
          Il piano gratuito comprende fino a 4 persone a tavola. Con Famiglia non hai limiti, quando vorrai.
        </p>
      )}
      <div className="mt-5 flex flex-wrap gap-2">
        {members.map((m) => (
          <span
            key={m.id}
            className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full pl-4 pr-2 py-1.5 font-semibold text-slate-800"
          >
            {m.name}
            <button
              onClick={() => removeMember(m.id)}
              aria-label={`Rimuovi ${m.name}`}
              className="w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </span>
        ))}
      </div>
      <p className="mt-6 text-sm text-slate-500">Puoi anche aggiungerle più tardi.</p>
    </div>,

    // 2 — abitudini a tavola (una sola scelta per volta)
    <div key="diet">
      <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-5">
        <Heart className="w-7 h-7" />
      </div>
      <h2 className="text-3xl font-semibold text-slate-900 mb-2">Mangiate in modo particolare?</h2>
      <p className="text-slate-600 leading-relaxed mb-6">Tocca ciò che vale per la tua famiglia. Se non ti serve, vai avanti.</p>
      <div className="space-y-2">
        {DIETS.map((d) => {
          const active = diets.includes(d.id);
          return (
            <button
              key={d.id}
              onClick={() => setDiets((cur) => (active ? cur.filter((x) => x !== d.id) : [...cur, d.id]))}
              aria-pressed={active}
              className={`w-full flex items-center gap-3 rounded-2xl border-2 px-4 py-4 text-left font-semibold transition-all ${
                active ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              <span className="text-2xl">{d.emoji}</span>
              <span className="flex-1">{d.label}</span>
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  active ? 'bg-indigo-600 text-white' : 'border-2 border-slate-300'
                }`}
              >
                {active && <Check className="w-4 h-4" />}
              </span>
            </button>
          );
        })}
      </div>
    </div>,

    // 3 — allergie e ingredienti da escludere
    <div key="excluded">
      <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center mb-5">
        <ShieldAlert className="w-7 h-7" />
      </div>
      <h2 className="text-3xl font-semibold text-slate-900 mb-2">Ci sono allergie?</h2>
      <p className="text-slate-600 leading-relaxed mb-6">
        Scrivi gli ingredienti che non devono mai finire nel piatto. Uno alla volta.
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          autoFocus
          value={excludedInput}
          onChange={(e) => setExcludedInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addExcluded()}
          placeholder="Es. Arachidi"
          className="flex-1 min-w-0 bg-white border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={addExcluded}
          aria-label="Aggiungi ingrediente da escludere"
          className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {excluded.map((x) => (
          <span
            key={x}
            className="inline-flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 rounded-full pl-3 pr-2 py-1 text-sm font-semibold"
          >
            {x}
            <button onClick={() => setExcluded((l) => l.filter((y) => y !== x))} aria-label={`Rimuovi ${x}`}>
              <X className="w-4 h-4" />
            </button>
          </span>
        ))}
      </div>
    </div>,

    // 4 — pronto
    <div key="ready" className="flex flex-col items-center text-center">
      <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6">
        <PartyPopper className="w-10 h-10" />
      </div>
      <h2 className="text-3xl font-semibold text-slate-900 mb-2">Tutto pronto!</h2>
      <p className="text-slate-600 leading-relaxed max-w-xs">
        {interactive
          ? 'Ora crea la tua prima settimana: ci vuole un tocco. Poi puoi cambiare ogni piatto come preferisci.'
          : 'Provala liberamente: questo è un account di prova. Dal Menù puoi creare una settimana con un tocco.'}
      </p>
      {interactive && (members.length > 0 || diets.length > 0 || excluded.length > 0) && (
        <div className="mt-6 w-full max-w-xs bg-white border border-slate-200 rounded-2xl p-4 text-left space-y-1.5 text-sm">
          {members.length > 0 && (
            <p className="text-slate-700"><span className="font-bold">A tavola:</span> {members.map((m) => m.name).join(', ')}</p>
          )}
          {diets.length > 0 && (
            <p className="text-slate-700"><span className="font-bold">Abitudini:</span> {DIETS.filter((d) => diets.includes(d.id)).map((d) => d.label).join(', ')}</p>
          )}
          {excluded.length > 0 && (
            <p className="text-slate-700"><span className="font-bold">Da evitare:</span> {excluded.join(', ')}</p>
          )}
        </div>
      )}
    </div>,
  ];

  const isLast = step === TOTAL_STEPS - 1;
  const visibleSteps = interactive ? TOTAL_STEPS : 2;
  const visibleIndex = interactive ? step : step === 0 ? 0 : 1;
  const nothingEntered =
    (step === 1 && members.length === 0 && memberName.trim() === '') ||
    (step === 2 && diets.length === 0) ||
    (step === 3 && excluded.length === 0 && excludedInput.trim() === '');

  return (
    <div
      className="fixed inset-0 z-[60] bg-slate-50 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Guida di benvenuto"
    >
      {/* Barra superiore: avanzamento + salta */}
      <div className="px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-3 flex items-center gap-4">
        <div
          className="flex-1 flex gap-1.5"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={visibleSteps}
          aria-valuenow={visibleIndex + 1}
        >
          {Array.from({ length: visibleSteps }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${i <= visibleIndex ? 'bg-indigo-600' : 'bg-slate-200'}`}
            />
          ))}
        </div>
        {!isLast && (
          <button onClick={() => finish(null)} className="text-sm font-semibold text-slate-500 hover:text-slate-700">
            Salta
          </button>
        )}
      </div>

      {/* Contenuto della schermata */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-md mx-auto">
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.2 }}
            >
              {screens[step]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Pulsanti */}
      <div className="px-6 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] border-t border-slate-200 bg-slate-50">
        <div className="max-w-md mx-auto flex items-center gap-3">
          {step > 0 && (
            <button
              onClick={back}
              aria-label="Indietro"
              className="h-14 w-14 shrink-0 rounded-2xl border border-slate-200 bg-white text-slate-600 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          {isLast ? (
            <button
              onClick={() => finish('planner')}
              className="flex-1 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg flex items-center justify-center gap-2 shadow-md"
            >
              Crea il mio primo menù
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={next}
              className="flex-1 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg flex items-center justify-center gap-2 shadow-md"
            >
              {step === 0 ? 'Cominciamo' : nothingEntered ? 'Salta per ora' : 'Avanti'}
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
