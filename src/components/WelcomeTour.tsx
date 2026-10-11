import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  ArrowRight,
  ArrowLeft,
  Plus,
  X,
  PartyPopper,
  Heart,
  Pencil,
  Package,
  AlertTriangle,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Logo from './Logo';
import { FamilyMember, PantryItem, UserProfile } from '../types';
import { limitsFor } from '../lib/plans';
import { membersWithoutPreferences, PANTRY_STARTERS, pantryItemFor } from '../lib/onboarding';
import FamilySettings from './FamilySettings';
import { applyAccountName } from '../lib/selfMember';
import IngredientPicker from './IngredientPicker';

type Tab = 'planner' | 'shopping' | 'pantry' | 'recipes' | 'family' | 'offers' | 'vacation' | 'guide' | 'business' | 'admin';

interface WelcomeTourProps {
  user: any;
  profile: UserProfile | null;
  onNavigate: (tab: Tab) => void;
  onProfileUpdate: (profile: UserProfile) => void;
}

type Step =
  | { kind: 'welcome' }
  | { kind: 'family' }
  | { kind: 'person'; memberId: string }
  | { kind: 'pantry' }
  | { kind: 'ready' };

const readLocal = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const BLANK_MEMBER = { likedIngredients: [], dislikedIngredients: [], likedMeals: [], dislikedMeals: [] };

/**
 * Percorso di benvenuto a schermate. L'ordine è sempre lo stesso:
 * famiglia → preferenze di ogni persona → dispensa (saltabile) → menù.
 * Salva davvero i dati inseriti e non genera mai il menù prima di aver chiesto chi mangia cosa.
 */
export default function WelcomeTour({ user, profile, onNavigate, onProfileUpdate }: WelcomeTourProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [memberName, setMemberName] = useState('');
  const [limitHit, setLimitHit] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [pantry, setPantry] = useState<PantryItem[]>([]);
  const [pantryLimitHit, setPantryLimitHit] = useState(false);

  const isDemo = user?.uid === 'demo-family-user';
  const isLocal = isDemo || !!user?.uid?.startsWith('local-');
  // L'account demo ha dati d'esempio già pronti: gli mostriamo solo la visita guidata
  const interactive = !isDemo;
  // Il nome mostrato è quello della persona; 'Nuova Famiglia spesa' è solo il segnaposto del profilo
  const profileName = profile?.name && profile.name !== 'Nuova Famiglia spesa' ? profile.name : '';
  const firstName = (user?.displayName || profileName || '').trim().split(' ')[0];
  const seededFor = useRef<string | null>(null);

  const flow: Step[] = interactive
    ? [
        { kind: 'welcome' },
        { kind: 'family' },
        ...members.map((m): Step => ({ kind: 'person', memberId: m.id })),
        { kind: 'pantry' },
        { kind: 'ready' },
      ]
    : [{ kind: 'welcome' }, { kind: 'ready' }];
  const index = Math.min(step, flow.length - 1);
  const current = flow[index];
  const isLast = index === flow.length - 1;
  const personNumber = current.kind === 'person' ? members.findIndex((m) => m.id === current.memberId) + 1 : 0;
  const incomplete = membersWithoutPreferences(members);

  // La guida compare a tutti, una volta sola: chi la salta o la completa non la rivede se non la richiama
  useEffect(() => {
    if (!user || !profile) return;
    let localCompleted = false;
    try {
      localCompleted = localStorage.getItem(`welcome_tour_completed_${user.uid}`) === 'true';
    } catch {
      /* storage non disponibile */
    }
    if (profile.hasCompletedWelcomeTour || localCompleted) return;
    const timer = setTimeout(() => setIsOpen(true), 600);
    return () => clearTimeout(timer);
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

  // Persone a tavola: sempre aggiornate. Se non c'è nessuno, aggiunge la persona che si è appena registrata.
  useEffect(() => {
    if (!isOpen || !interactive || !user) return;
    const shouldSeed = () => !!firstName && seededFor.current !== user.uid;

    if (isLocal) {
      let list = readLocal<FamilyMember[]>(`members_${user.uid}`, []);
      if (list.length === 0 && shouldSeed()) {
        seededFor.current = user.uid;
        list = [{ id: Date.now().toString(), name: firstName, isSelf: true, ...BLANK_MEMBER }];
        try {
          localStorage.setItem(`members_${user.uid}`, JSON.stringify(list));
        } catch {
          /* storage non disponibile */
        }
      }
      setMembers(list);
      return;
    }

    const unsubscribe = onSnapshot(
      collection(db, `users/${user.uid}/familyMembers`),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<FamilyMember, 'id'>) }));
        setMembers(list);
        if (list.length === 0 && shouldSeed()) {
          seededFor.current = user.uid;
          addDoc(collection(db, `users/${user.uid}/familyMembers`), { name: firstName, isSelf: true, ...BLANK_MEMBER }).catch((e) => {
            console.error('Impossibile aggiungere la persona registrata:', e);
            seededFor.current = null;
          });
        }
      },
      (e) => console.error('Impossibile caricare le persone a tavola:', e),
    );
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, interactive, user?.uid]);

  // Account locale: le preferenze si salvano sul dispositivo (fuori da questa schermata), quindi si rileggono di continuo
  useEffect(() => {
    if (!isOpen || !interactive || !isLocal || !user) return;
    const reload = () => {
      const saved = readLocal<FamilyMember[]>(`members_${user.uid}`, []);
      setMembers((prev) => (JSON.stringify(prev) === JSON.stringify(saved) ? prev : saved));
    };
    const timer = setInterval(reload, 500);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, interactive, isLocal, user?.uid]);

  // Dispensa: carica quello che c'è già quando si arriva al passo
  useEffect(() => {
    if (!isOpen || !interactive || !user || current.kind !== 'pantry') return;
    let cancelled = false;
    (async () => {
      try {
        if (isLocal) {
          setPantry(readLocal<PantryItem[]>(`pantry_${user.uid}`, []));
        } else {
          const snap = await getDocs(collection(db, `users/${user.uid}/pantry`));
          if (!cancelled) setPantry(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PantryItem, 'id'>) })));
        }
      } catch (e) {
        console.error('Impossibile caricare la dispensa:', e);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, interactive, current.kind, user?.uid]);

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
    setDirection(next > index ? 1 : -1);
    setStep(Math.max(0, Math.min(next, flow.length - 1)));
  };

  // ---- Persone -----------------------------------------------------------

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
        const created: FamilyMember = { id: Date.now().toString(), name, ...BLANK_MEMBER };
        const next = [...readLocal<FamilyMember[]>(`members_${user.uid}`, []), created];
        localStorage.setItem(`members_${user.uid}`, JSON.stringify(next));
        setMembers(next);
      } else {
        await addDoc(collection(db, `users/${user.uid}/familyMembers`), { name, ...BLANK_MEMBER });
      }
      setMemberName('');
    } catch (e) {
      console.error('Impossibile aggiungere il membro:', e);
    }
  };

  const removeMember = async (id: string) => {
    setLimitHit(false);
    try {
      if (isLocal) {
        const next = readLocal<FamilyMember[]>(`members_${user.uid}`, []).filter((x) => x.id !== id);
        localStorage.setItem(`members_${user.uid}`, JSON.stringify(next));
        setMembers(next);
      } else {
        await deleteDoc(doc(db, `users/${user.uid}/familyMembers`, id));
      }
    } catch (e) {
      console.error('Impossibile rimuovere il membro:', e);
    }
  };

  const renameMember = async (id: string) => {
    const name = renameValue.trim();
    setRenamingId(null);
    if (!name) return;
    try {
      if (isLocal) {
        const next = readLocal<FamilyMember[]>(`members_${user.uid}`, []).map((m) => (m.id === id ? { ...m, name } : m));
        localStorage.setItem(`members_${user.uid}`, JSON.stringify(next));
        setMembers(next);
      } else {
        await updateDoc(doc(db, `users/${user.uid}/familyMembers`, id), { name });
      }
      if (members.find((m) => m.id === id)?.isSelf) {
        const updated = await applyAccountName(user.uid, name, profile);
        if (updated) onProfileUpdate(updated);
      }
    } catch (e) {
      console.error('Impossibile cambiare il nome:', e);
    }
  };

  // ---- Dispensa ----------------------------------------------------------

  const togglePantry = async (name: string) => {
    const existing = pantry.find((p) => p.name.toLowerCase() === name.toLowerCase());
    if (!existing && pantry.length >= limitsFor(profile?.plan).maxPantryItems) {
      setPantryLimitHit(true);
      return;
    }
    setPantryLimitHit(false);
    try {
      if (existing) {
        if (isLocal) {
          const next = pantry.filter((p) => p.id !== existing.id);
          localStorage.setItem(`pantry_${user.uid}`, JSON.stringify(next));
          setPantry(next);
        } else {
          await deleteDoc(doc(db, `users/${user.uid}/pantry`, existing.id));
          setPantry((list) => list.filter((p) => p.id !== existing.id));
        }
        return;
      }
      const item = pantryItemFor(name);
      if (isLocal) {
        const created: PantryItem = { id: Date.now().toString(), ...item };
        const next = [...pantry, created];
        localStorage.setItem(`pantry_${user.uid}`, JSON.stringify(next));
        setPantry(next);
      } else {
        const ref = await addDoc(collection(db, `users/${user.uid}/pantry`), item);
        setPantry((list) => [...list, { id: ref.id, ...item }]);
      }
    } catch (e) {
      console.error('Impossibile aggiornare la dispensa:', e);
    }
  };

  // ---- Fine --------------------------------------------------------------

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

  if (!isOpen) return null;

  const currentMember = current.kind === 'person' ? members.find((m) => m.id === current.memberId) : undefined;
  const firstIncompleteIndex = flow.findIndex((s) => s.kind === 'person' && incomplete.some((m) => m.id === s.memberId));

  // ---- Schermate ---------------------------------------------------------

  const welcome = (
    <div className="flex flex-col items-center text-center">
      <Logo className="w-24 h-24 drop-shadow-lg mb-6" />
      <h2 className="text-3xl font-semibold text-slate-900 mb-2">{firstName ? `Ciao ${firstName}!` : 'Benvenuto!'}</h2>
      <p className="text-slate-600 leading-relaxed max-w-xs">
        {interactive
          ? 'Prima di creare il menù ci serve sapere chi mangia e cosa mangia. Pochi minuti e il menù sarà davvero il vostro.'
          : 'Ti mostriamo come funziona l\'app, in pochi passi.'}
      </p>
      <ol className="mt-8 w-full max-w-xs space-y-3 text-left">
        {(interactive
          ? ['Chi mangia a tavola', 'Cosa mangia ognuno', 'La dispensa (si può saltare)', 'Il menù della settimana']
          : ['Chi mangia a tavola', 'Il menù della settimana']
        ).map((label, i) => (
          <li key={label} className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
              {i + 1}
            </span>
            <span className="text-slate-700 font-medium">{label}</span>
          </li>
        ))}
      </ol>
    </div>
  );

  const family = (
    <div>
      <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-5">
        <Users className="w-7 h-7" />
      </div>
      <h2 className="text-3xl font-semibold text-slate-900 mb-2">Chi siede a tavola?</h2>
      <p className="text-slate-600 leading-relaxed mb-6">
        {members.length > 0 && firstName && members.some((m) => m.name === firstName)
          ? `Ho già aggiunto te, ${firstName}: se il nome non va bene, cambialo con la matita. Aggiungi anche gli altri.`
          : 'Aggiungi le persone per cui cucini. Poi ci dici cosa mangia ognuna.'}
      </p>
      <div className="flex gap-2">
        <input
          type="text"
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
      <div className="mt-5 space-y-2">
        {members.map((m) =>
          renamingId === m.id ? (
            <form
              key={m.id}
              onSubmit={(e) => {
                e.preventDefault();
                renameMember(m.id);
              }}
              className="flex gap-2"
            >
              <input
                autoFocus
                value={renameValue}
                maxLength={40}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && setRenamingId(null)}
                aria-label={`Nome di ${m.name}`}
                className="flex-1 min-w-0 bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button type="submit" className="shrink-0 rounded-xl bg-indigo-600 text-white font-bold px-4">
                Salva
              </button>
            </form>
          ) : (
            <div key={m.id} className="flex items-center bg-white border border-slate-200 rounded-2xl pl-4 pr-1 py-1">
              <span className="flex-1 min-w-0 font-semibold text-slate-800 truncate">{m.name}</span>
              <button
                onClick={() => {
                  setRenamingId(m.id);
                  setRenameValue(m.name);
                }}
                aria-label={`Cambia il nome di ${m.name}`}
                className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => removeMember(m.id)}
                aria-label={`Rimuovi ${m.name}`}
                className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ),
        )}
      </div>
      {members.length === 0 && <p className="mt-6 text-sm text-slate-500">Serve almeno una persona per continuare.</p>}
    </div>
  );

  const person = currentMember && (
    <div>
      <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-5">
        <Heart className="w-7 h-7" />
      </div>
      <p className="text-sm font-semibold text-indigo-700 mb-1">
        Persona {personNumber} di {members.length}
      </p>
      <h2 className="text-3xl font-semibold text-slate-900 mb-2">Cosa mangia {currentMember.name}?</h2>
      <p className="text-slate-600 leading-relaxed mb-5">
        Indica cosa non mangia, cosa ama e i suoi piatti. In «Dieta e allergie» trovi anche <strong>allergie e intolleranze</strong>:
        valgono solo per {currentMember.name}, e il menù le rispetta con un piatto alternativo. Puoi saltare e completare dopo.
      </p>
      <FamilySettings
        userId={user.uid}
        profile={profile}
        onProfileUpdate={(p) => p && onProfileUpdate(p)}
        onlyMemberId={currentMember.id}
      />
    </div>
  );

  const pantryScreen = (
    <div>
      <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-5">
        <Package className="w-7 h-7" />
      </div>
      <h2 className="text-3xl font-semibold text-slate-900 mb-2">Cosa hai in casa?</h2>
      <p className="text-slate-600 leading-relaxed mb-5">
        Tocca quello che hai: i piatti con questi ingredienti avranno la precedenza e la spesa non li ricomprerà.
        Questo passo si può saltare: lo completi quando vuoi dalla Dispensa.
      </p>
      <IngredientPicker
        options={PANTRY_STARTERS.map((item) => item.name)}
        selected={pantry.map((p) => p.name)}
        onToggle={togglePantry}
        activeClass="bg-emerald-600 border-emerald-600 text-white"
        placeholder="Cerca o aggiungi un prodotto"
      />
      {pantryLimitHit && (
        <p className="mt-3 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">
          Il piano gratuito comprende fino a {limitsFor(profile?.plan).maxPantryItems} prodotti in dispensa. Con Famiglia non hai limiti, quando vorrai.
        </p>
      )}
      <p className="mt-4 text-sm text-slate-500">Le quantità sono indicative: le correggi in Dispensa.</p>
    </div>
  );

  const ready = (
    <div className="flex flex-col items-center text-center">
      <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6">
        <PartyPopper className="w-10 h-10" />
      </div>
      <h2 className="text-3xl font-semibold text-slate-900 mb-2">Tutto pronto!</h2>
      <p className="text-slate-600 leading-relaxed max-w-xs">
        {interactive
          ? 'Ora crea la settimana: ci vuole un tocco. Poi puoi cambiare ogni piatto come preferisci.'
          : 'Provala liberamente: questo è un account di prova. Dal Menù puoi creare una settimana con un tocco.'}
      </p>
      {interactive && (
        <div className="mt-6 w-full max-w-xs bg-white border border-slate-200 rounded-2xl p-4 text-left space-y-2 text-sm">
          {members.map((m) => {
            const missing = incomplete.some((x) => x.id === m.id);
            return (
              <p key={m.id} className="flex items-center justify-between gap-3 text-slate-700">
                <span className="font-bold truncate">{m.name}</span>
                <span className={missing ? 'text-amber-700 font-semibold shrink-0' : 'text-emerald-700 font-semibold shrink-0'}>
                  {missing ? 'da completare' : 'fatto'}
                </span>
              </p>
            );
          })}
          <p className="flex items-center justify-between gap-3 text-slate-700 border-t border-slate-100 pt-2">
            <span className="font-bold">Dispensa</span>
            <span className="text-slate-500 shrink-0">{pantry.length > 0 ? `${pantry.length} prodotti` : 'saltata'}</span>
          </p>
        </div>
      )}
      {interactive && incomplete.length > 0 && (
        <div className="mt-4 w-full max-w-xs text-left bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-900">
          <p className="flex items-start gap-2 leading-relaxed">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              Per {incomplete.map((m) => m.name).join(', ')} non hai indicato nulla: il menù sarà più generico.
            </span>
          </p>
          <button
            onClick={() => firstIncompleteIndex >= 0 && go(firstIncompleteIndex)}
            className="mt-3 font-bold underline underline-offset-4"
          >
            Completa ora
          </button>
        </div>
      )}
      {interactive && (
        <p className="mt-4 text-xs text-slate-500 max-w-xs">
          Le regole valide per tutti (per esempio tutta la famiglia vegana) le trovi in Famiglia → Regole per tutti.
        </p>
      )}
    </div>
  );

  const screen =
    current.kind === 'welcome' ? welcome : current.kind === 'family' ? family : current.kind === 'person' ? person : current.kind === 'pantry' ? pantryScreen : ready;

  const nothingEntered =
    (current.kind === 'person' && !!currentMember && membersWithoutPreferences([currentMember]).length > 0) ||
    (current.kind === 'pantry' && pantry.length === 0);
  const needsMember = current.kind === 'family' && members.length === 0 && memberName.trim() === '';

  const onNext = async () => {
    if (current.kind === 'family' && memberName.trim()) await addMember();
    go(index + 1);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-50 flex flex-col" role="dialog" aria-modal="true" aria-label="Guida di benvenuto">
      {/* Barra superiore: avanzamento + salta */}
      <div className="px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-3 flex items-center gap-4">
        <div
          className="flex-1 flex gap-1.5"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={flow.length}
          aria-valuenow={index + 1}
        >
          {flow.map((_, i) => (
            <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= index ? 'bg-indigo-600' : 'bg-slate-200'}`} />
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
              key={current.kind === 'person' ? `person-${current.memberId}` : current.kind}
              custom={direction}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.2 }}
            >
              {screen}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Pulsanti */}
      <div className="px-6 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] border-t border-slate-200 bg-slate-50">
        <div className="max-w-md mx-auto flex items-center gap-3">
          {index > 0 && (
            <button
              onClick={() => go(index - 1)}
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
              {interactive && incomplete.length > 0 ? 'Crea comunque il menù' : 'Crea il menù'}
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={onNext}
              disabled={needsMember}
              className="flex-1 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
            >
              {current.kind === 'welcome' ? 'Cominciamo' : nothingEntered ? 'Salta per ora' : 'Avanti'}
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
