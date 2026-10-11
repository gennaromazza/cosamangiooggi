import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Utensils, 
  ShoppingCart, 
  Users, 
  Package, 
  ChefHat,
  LogOut,
  Info,
  Sparkles,
  Mic,
  MicOff,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  X,
  Lock,
  MessageSquare,
  Wallet,
  Sun,
  MoreHorizontal,
  Check,
  UserCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Capacitor } from '@capacitor/core';
import Logo from './components/Logo';
import UpgradeCard from './components/UpgradeCard';
import { limitsFor, planName, normalizePlan } from './lib/plans';
import MealPlanner from './components/MealPlanner';
import VacationPlanner from './components/VacationPlanner';
import Pantry from './components/Pantry';
import ShoppingList from './components/ShoppingList';
import FamilySettings from './components/FamilySettings';
import RecipeList from './components/RecipeList';
import FlyerAnalysis from './components/FlyerAnalysis';
import { FoodPyramid } from './components/FoodPyramid';
import VoiceAssistant from './components/VoiceAssistant';
import BusinessModel from './components/BusinessModel';
import AdminDashboard from './components/AdminDashboard';
import WelcomeTour from './components/WelcomeTour';
import AccountSettings from './components/AccountSettings';
import UpdateBanner from './components/UpdateBanner';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import { auth, db, functions } from './lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { onAuthStateChanged, signInWithPopup, signInWithCredential, GoogleAuthProvider, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { doc, onSnapshot, collection } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './lib/firebaseUtils';
import { UserProfile } from './types';

type Tab = 'planner' | 'vacation' | 'pantry' | 'shopping' | 'family' | 'recipes' | 'guide' | 'offers' | 'business' | 'account' | 'admin';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('planner');
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  // Motivo tecnico dell'ultimo errore di accesso: serve a capire cosa non va (es. impronta non registrata)
  const [loginDetail, setLoginDetail] = useState<string | null>(null);
  const [loginNotice, setLoginNotice] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [voiceSearchQuery, setVoiceSearchQuery] = useState('');
  const [voiceIsListening, setVoiceIsListening] = useState(false);
  
  // Premium Gate Trigger State
  const [showMore, setShowMore] = useState(false);
  const [showPremiumGate, setShowPremiumGate] = useState<'voice' | 'offers' | null>(null);

  // Ritorno da Stripe Checkout (?checkout=success): mostra la conferma e pulisce l'indirizzo
  const [checkoutDone, setCheckoutDone] = useState(false);
  // App Android: il pagamento avviene nel browser; quando il piano diventa a pagamento mostriamo la stessa conferma
  useEffect(() => {
    if (!profile || normalizePlan(profile.plan) === 'free') return;
    let waiting: string | null = null;
    try { waiting = localStorage.getItem('awaiting_checkout'); } catch { /* storage non disponibile */ }
    if (!waiting) return;
    try { localStorage.removeItem('awaiting_checkout'); } catch { /* storage non disponibile */ }
    if (Date.now() - Number(waiting) < 60 * 60 * 1000) setCheckoutDone(true);
  }, [profile?.plan]);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const result = params.get('checkout');
    if (!result) return;
    if (result === 'success') setCheckoutDone(true);
    params.delete('checkout');
    const rest = params.toString();
    window.history.replaceState({}, '', window.location.pathname + (rest ? `?${rest}` : '') + window.location.hash);
  }, []);

  // Shopping List Visibility Constraints
  const [hasMealPlan, setHasMealPlan] = useState<boolean>(false);
  const [hasFamilyMember, setHasFamilyMember] = useState<boolean>(false);

  // Email and Password Login States
  const [loginMethod, setLoginMethod] = useState<'signin' | 'signup'>('signin');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');

  useEffect(() => {
    const handleStatus = (e: any) => {
      setVoiceIsListening(!!e.detail?.isListening);
    };
    window.addEventListener('voice-assistant-listening-change', handleStatus);
    return () => {
      window.removeEventListener('voice-assistant-listening-change', handleStatus);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    }, (error) => {
      console.error("Auth state error:", error);
      setAuthLoading(false);
      setLoginError("Errore nel caricamento delle credenziali.");
    });
    
    const timeout = setTimeout(() => {
      if (authLoading) {
        setAuthLoading(false);
      }
    }, 5000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, [authLoading]);

  // Sync profile & Initialize missing database fields for new accounts
  useEffect(() => {
    if (!user) return;
    if (user.uid === 'demo-family-user' || user.uid.startsWith('local-')) return;
    const profilePath = `users/${user.uid}`;
    const uDoc = doc(db, profilePath);

    const unsubProfile = onSnapshot(uDoc, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() || {};
        setProfile({ id: snapshot.id, ...data } as UserProfile);
      } else {
        // Piano, ruoli e abbonamento li gestisce solo il server: qui niente di tutto ciò
        const defaultProfile: Partial<UserProfile> = {
          name: user.displayName || 'Nuova Famiglia spesa',
          email: user.email || '',
          dietaryRestrictions: [],
          excludedIngredients: [],
          createdAt: new Date().toISOString()
        };

        try {
          const { setDoc } = await import('firebase/firestore');
          await setDoc(uDoc, defaultProfile);
        } catch (e: any) {
          console.error("Error creating default profile:", e);
        }
      }
    }, (error) => {
      console.error("Profile onSnapshot error:", error);
      handleFirestoreError(error, OperationType.GET, profilePath);
    });

    return () => unsubProfile();
  }, [user]);

  // Listen to meal plan and family members count to determine if Shopping List is unlocked/visible
  useEffect(() => {
    if (!user) {
      setHasMealPlan(false);
      setHasFamilyMember(false);
      return;
    }

    const isLocal = user.uid === 'demo-family-user' || user.uid.startsWith('local-');

    if (isLocal) {
      const checkLocalData = () => {
        // Check meal plan
        const savedPlan = localStorage.getItem(`mealPlan_${user.uid}`);
        if (savedPlan) {
          try {
            const parsed = JSON.parse(savedPlan);
            setHasMealPlan(!!(parsed && parsed.days && Object.keys(parsed.days).length > 0));
          } catch (e) {
            setHasMealPlan(false);
          }
        } else {
          setHasMealPlan(false);
        }

        // Check members
        const savedMembers = localStorage.getItem(`members_${user.uid}`);
        if (savedMembers) {
          try {
            const parsed = JSON.parse(savedMembers);
            setHasFamilyMember(Array.isArray(parsed) && parsed.length > 0);
          } catch (e) {
            setHasFamilyMember(false);
          }
        } else {
          setHasFamilyMember(false);
        }
      };

      checkLocalData();

      const interval = setInterval(checkLocalData, 1000);
      window.addEventListener('storage', checkLocalData);

      return () => {
        clearInterval(interval);
        window.removeEventListener('storage', checkLocalData);
      };
    } else {
      // Real user with Firestore
      const planDocRef = doc(db, 'users', user.uid, 'mealPlans', 'current');
      const unsubPlan = onSnapshot(planDocRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setHasMealPlan(!!(data && data.days && Object.keys(data.days).length > 0));
        } else {
          setHasMealPlan(false);
        }
      }, (err) => {
        console.error("Error listening to meal plan:", err);
      });

      const membersColRef = collection(db, 'users', user.uid, 'familyMembers');
      const unsubMembers = onSnapshot(membersColRef, (snapshot) => {
        setHasFamilyMember(snapshot.size > 0);
      }, (err) => {
        console.error("Error listening to family members:", err);
      });

      return () => {
        unsubPlan();
        unsubMembers();
      };
    }
  }, [user]);

  // Handle activeTab redirection if Shopping List becomes unavailable
  useEffect(() => {
    if (activeTab === 'shopping' && !hasMealPlan) {
      setActiveTab('planner');
    }
  }, [activeTab, hasMealPlan, hasFamilyMember]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setLoginError(null);
    setLoginDetail(null);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    try {
      const { setPersistence, browserLocalPersistence } = await import('firebase/auth');
      await setPersistence(auth, browserLocalPersistence);
      if (Capacitor.isNativePlatform()) {
        // Nell'app il popup del browser non funziona: si usa la finestra di accesso Google di Android
        const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
        const result = await FirebaseAuthentication.signInWithGoogle({ skipNativeAuth: true });
        const idToken = result.credential?.idToken;
        if (!idToken) throw new Error('google-token-mancante');
        await signInWithCredential(auth, GoogleAuthProvider.credential(idToken));
      } else {
        await signInWithPopup(auth, provider);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      let message = "Errore durante l'accesso. Riprova.";
      const text = String(error?.message || error?.code || '').toLowerCase();
      if (text.includes('cancel') || text.includes('12501') || text.includes('dismiss')) {
        message = "Accesso annullato.";
      } else if (error.code === 'auth/popup-blocked') {
        message = "Il popup di accesso è stato bloccato. Abilita i popup per questo sito.";
      } else if (error.code === 'auth/cancelled-popup-request') {
        message = "Accesso annullato.";
      } else if (error.code === 'auth/internal-error') {
        message = "Errore interno di Firebase. Verifica la connessione.";
      }
      setLoginError(message);
      const detail = [error?.code, error?.message].filter(Boolean).join(' · ');
      setLoginDetail(detail ? detail.slice(0, 220) : null);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !passwordInput.trim()) {
      setLoginError("Compila tutti i campi richiesti.");
      return;
    }
    if (loginMethod === 'signup' && !nameInput.trim()) {
      setLoginError("Inserisci il nome della famiglia.");
      return;
    }

    setIsLoggingIn(true);
    setLoginError(null);
    setLoginNotice(null);

    try {
      if (loginMethod === 'signin') {
        await signInWithEmailAndPassword(auth, emailInput.trim(), passwordInput);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, emailInput.trim(), passwordInput);
        if (userCredential.user) {
          await updateProfile(userCredential.user, {
            displayName: nameInput.trim()
          });
        }
      }
    } catch (error: any) {
      console.error("Email auth error:", error);
      let message = "Errore durante l'autenticazione. Riprova.";
      if (
        error.code === 'auth/invalid-credential' || 
        error.code === 'auth/wrong-password' || 
        error.code === 'auth/user-not-found'
      ) {
        message = "Email o password non corrette. Riprova, tocca «Password dimenticata?» oppure registrati.";
      } else if (error.code === 'auth/email-already-in-use') {
        message = "Questa email è già registrata. Effettua l'accesso.";
      } else if (error.code === 'auth/weak-password') {
        message = "La password deve contenere almeno 6 caratteri.";
      } else if (error.code === 'auth/invalid-email') {
        message = "Indirizzo email non valido.";
      } else if (error.code === 'auth/operation-not-allowed' || error.code === 'auth/admin-restricted-operation') {
        message = "L'accesso con email non è ancora attivo. Usa «Accedi con Google» oppure riprova più tardi.";
      }
      setLoginError(message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = emailInput.trim();
    setLoginNotice(null);
    setLoginDetail(null);
    if (!email) {
      setLoginError("Scrivi qui sopra la tua email, poi tocca di nuovo «Password dimenticata?».");
      return;
    }
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      auth.languageCode = 'it';
      await sendPasswordResetEmail(auth, email);
      setLoginNotice(`Se «${email}» è registrata, ti abbiamo scritto un link per scegliere una nuova password. Controlla anche la posta indesiderata.`);
    } catch (error: any) {
      if (error.code === 'auth/invalid-email') {
        setLoginError("Indirizzo email non valido.");
      } else if (error.code === 'auth/too-many-requests') {
        setLoginError("Troppi tentativi. Aspetta qualche minuto e riprova.");
      } else {
        // Per non rivelare quali email esistono, anche 'utente non trovato' mostra lo stesso messaggio.
        setLoginNotice(`Se «${email}» è registrata, ti abbiamo scritto un link per scegliere una nuova password. Controlla anche la posta indesiderata.`);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleDemoLogin = () => {
    setIsLoggingIn(true);
    setLoginError(null);
    const demoUser = {
      uid: 'demo-family-user',
      email: 'demo@che-cucino-oggi.it',
      displayName: nameInput.trim() || 'Famiglia Demo'
    };
    setUser(demoUser as any);
    setProfile({
      id: 'demo-family-user',
      name: demoUser.displayName,
      email: demoUser.email,
      dietaryRestrictions: [],
      excludedIngredients: [],
      plan: 'premium',
      isAdmin: false,
      isSuspended: false,
      createdAt: new Date().toISOString(),
      aiInteractionsThisMonth: 0
    });
    setIsLoggingIn(false);
  };

  const handleLogout = () => {
    if (user?.uid === 'demo-family-user' || user?.uid.startsWith('local-')) {
      setUser(null);
      setProfile(null);
    } else {
      signOut(auth);
    }
  };

  // Admin = claim assegnato dal server (verificato anche dalle regole del database)
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  useEffect(() => {
    setUserIsAdmin(false);
    if (!user || user.uid === 'demo-family-user' || user.uid.startsWith('local-')) return;
    let cancelled = false;
    (async () => {
      try {
        const { admin } = (await httpsCallable(functions, 'syncAdminClaim')()).data as { admin: boolean };
        if (admin) await user.getIdToken(true);
        if (!cancelled) setUserIsAdmin(admin);
      } catch (e) {
        console.error('Verifica amministratore non riuscita:', e);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  // Auto-switch to Admin Dashboard if admin logs in
  useEffect(() => {
    if (userIsAdmin) {
      setActiveTab('admin');
    }
  }, [userIsAdmin]);

  // Compile active tabs dynamically
  const tabs = useMemo(() => {
    const isShoppingVisible = hasMealPlan;
    const list = [
      { id: 'planner', label: 'Menu', icon: Calendar },
      ...(isShoppingVisible ? [{ id: 'shopping', label: 'Spesa', icon: ShoppingCart }] : []),
      { id: 'pantry', label: 'Dispensa', icon: Package },
      { id: 'recipes', label: 'Ricette', icon: ChefHat },
      { id: 'family', label: 'Famiglia', icon: Users },
      { id: 'offers', label: 'Offerte', icon: Sparkles },
      { id: 'vacation', label: 'Vacanze', icon: Sun },
      { id: 'guide', label: 'Guida', icon: Info },
      { id: 'account', label: 'Il mio account', icon: UserCircle },
    ];
    if (userIsAdmin) {
      list.push({ id: 'business', label: 'Business', icon: TrendingUp });
      list.push({ id: 'admin', label: 'Admin', icon: ShieldCheck });
    } else {
      list.push({ id: 'business', label: 'Abbonamento', icon: Wallet });
    }
    return list;
  }, [userIsAdmin, hasMealPlan, hasFamilyMember]);

  // Barra in basso: cinque voci principali, il resto sta sotto "Altro"
  const PRIMARY_TAB_IDS = ['planner', 'shopping', 'pantry', 'recipes', 'family'];
  const primaryTabs = tabs.filter(t => PRIMARY_TAB_IDS.includes(t.id));
  const moreTabs = tabs.filter(t => !PRIMARY_TAB_IDS.includes(t.id));
  const moreDescriptions: Record<string, string> = {
    offers: 'Scansiona i volantini del supermercato',
    vacation: 'Menù e spesa anche fuori casa',
    guide: 'Come funziona e cosa mangiare',
    business: 'Piani e abbonamento',
    account: 'Nome, password ed elimina account',
    admin: 'Gestione utenti',
  };
  const moreActive = moreTabs.some(t => t.id === activeTab);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-dvh bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
          <div className="text-center">
            <Logo className="w-20 h-20 mx-auto mb-6 drop-shadow-lg" />
            <h1 className="text-4xl font-semibold text-slate-900 mb-2">Che cucino oggi?</h1>
            <p className="text-slate-500 mb-6 text-sm leading-relaxed">
              Il menù della settimana, pensato per la tua famiglia. Tu scegli cosa mangiare, a spesa e dispensa pensiamo noi.
            </p>
          </div>
          
          {/* Tabs for Login / Register */}
          <div className="flex border-b border-slate-100 mb-6">
            <button
              onClick={() => {
                setLoginMethod('signin');
                setLoginError(null);
                setLoginNotice(null);
              }}
              className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all ${
                loginMethod === 'signin'
                  ? 'border-indigo-600 text-indigo-600 font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Accedi
            </button>
            <button
              onClick={() => {
                setLoginMethod('signup');
                setLoginError(null);
                setLoginNotice(null);
              }}
              className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all ${
                loginMethod === 'signup'
                  ? 'border-indigo-600 text-indigo-600 font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Registrati
            </button>
          </div>

          {loginNotice && (
            <div role="status" className="mb-4 p-4 bg-emerald-50 text-emerald-900 rounded-2xl border border-emerald-200 text-sm leading-relaxed">
              {loginNotice}
            </div>
          )}

          {loginError && (
            <div role="alert" className="mb-4 p-4 bg-amber-50 text-amber-900 rounded-2xl border border-amber-200 flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm leading-relaxed text-amber-900">{loginError}</p>
                {loginDetail && (
                  <p className="mt-1 text-xs text-amber-800/80 break-words">Dettaglio: {loginDetail}</p>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {loginMethod === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Nome Famiglia / Utente
                </label>
                <input
                  type="text"
                  placeholder="Es. Famiglia Rossi"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                Indirizzo Email
              </label>
              <input
                type="email"
                placeholder="nome@esempio.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                minLength={6}
              />
              {loginMethod === 'signin' && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isLoggingIn}
                  className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 underline underline-offset-2 cursor-pointer disabled:opacity-60"
                >
                  Password dimenticata?
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-indigo-600 text-white font-bold py-3.5 px-6 rounded-xl hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoggingIn ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <span>{loginMethod === 'signin' ? 'Accedi' : 'Crea Account'}</span>
              )}
            </button>
          </form>

          <div className="relative flex items-center justify-center my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <span className="relative bg-white px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
              Oppure
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full bg-white border border-slate-200 text-slate-700 font-bold py-3.5 px-6 rounded-xl hover:bg-slate-50 transition-all shadow-xs flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            <Users className="w-5 h-5 text-indigo-600" />
            <span>Accedi con Google</span>
          </button>

          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isLoggingIn}
            className="w-full mt-3 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold py-3 px-6 rounded-xl hover:bg-emerald-100/70 transition-all shadow-xs flex items-center justify-center gap-2 text-sm active:scale-[0.98] cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Prova subito, senza registrarti</span>
          </button>

          <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-3 gap-4 text-[10px] uppercase font-bold text-slate-400 tracking-widest text-center">
            <span>Stagionale</span>
            <span>OMS</span>
            <span>Pantry</span>
          </div>
          <p className="mt-5 text-center text-xs text-slate-500">Versione dell’app: {__APP_VERSION__}</p>
        </div>
      </div>
    );
  }

  // Account Suspension Enforcement Screen
  if (profile?.isSuspended) {
    return (
      <div className="min-h-dvh bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center border-t-4 border-t-red-600 border border-slate-100 space-y-6">
          <div className="w-16 h-16 bg-red-50 text-red-600 border border-red-150 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Account temporaneamente Sospeso</h1>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Gentile utente, l'accesso a questa famiglia è stato disattivato dall'amministrazione per violazione dei termini di vendita, sospetto phishing o insoluti nei pagamenti Stripe.
            </p>
          </div>
          
          <div className="p-3 bg-slate-50 rounded-xl text-[11px] font-medium text-slate-500 flex items-center justify-center gap-2">
            <Lock className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Contattare: info.mondogadgets@gmail.com</span>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-97"
          >
            Scollegati
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-slate-50 flex flex-col overflow-x-clip">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 pt-[env(safe-area-inset-top)]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Logo className="w-10 h-10 shrink-0" />
            <h1 className="text-lg sm:text-xl font-bold whitespace-nowrap bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Che cucino oggi?
            </h1>
          </div>
          <div className="flex items-center gap-1 sm:gap-4 shrink-0">
            {/* Pulsante per l'Assistente Vocale (Con restrizione licenza Pro) */}
            <button
              onClick={() => {
                if (!limitsFor(profile?.plan).voiceAssistant) {
                  setShowPremiumGate('voice');
                } else {
                  window.dispatchEvent(new CustomEvent('toggle-voice-assistant'));
                }
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold transition-all shadow-sm active:scale-95 border cursor-pointer ${
                voiceIsListening 
                  ? 'bg-red-500 hover:bg-red-600 text-white border-red-400 ring-2 ring-red-100' 
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-100 hover:border-indigo-200'
              }`}
              title={voiceIsListening ? "Interrompi ascolto" : "Attiva Assistente Vocale"}
            >
              {voiceIsListening ? (
                <>
                  <MicOff className="w-3.5 h-3.5 animate-pulse" />
                  <span className="flex items-center gap-1">
                    <span className="hidden sm:inline">In ascolto...</span>
                    <span className="flex gap-0.5 ml-1">
                      <span className="w-1 h-3 bg-white rounded-full animate-pulse"></span>
                      <span className="w-1 h-3 bg-white rounded-full animate-pulse delay-100"></span>
                      <span className="w-1 h-3 bg-white rounded-full animate-pulse delay-200"></span>
                    </span>
                  </span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline font-bold">Assistente Vocale IA</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('account')}
                className="text-sm text-slate-500 hover:text-indigo-700 hidden md:inline cursor-pointer"
                title="Il mio account"
              >
                Benvenuto, {user.displayName?.split(' ')[0]}
              </button>
              {profile?.plan && profile.plan !== 'free' && (
                <span className={`hidden sm:inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                  profile.autoRenew !== false && profile.subscriptionStatus !== 'pending_renewal'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-150'
                    : 'bg-amber-50 text-amber-700 border-amber-150'
                }`} title={profile.autoRenew !== false && profile.subscriptionStatus !== 'pending_renewal' ? 'Premium Attivo (Rinnovo automatico)' : 'In attesa di rinnovo (Rinnovo disattivato)'}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    profile.autoRenew !== false && profile.subscriptionStatus !== 'pending_renewal'
                      ? 'bg-emerald-500 animate-pulse'
                      : 'bg-amber-500'
                  }`} />
                  {planName(profile.plan).toUpperCase()}
                </span>
              )}
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full min-w-0 p-4 pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-8 md:pl-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTab === 'planner' && (
              <MealPlanner 
                userId={user.uid} 
                onNavigateToShopping={() => setActiveTab('shopping')} 
                onNavigateToFamily={() => setActiveTab('family')} 
                onNavigateToPantry={() => setActiveTab('pantry')}
              />
            )}
            {activeTab === 'vacation' && (
              limitsFor(profile?.plan).vacationPlanner ? (
                <VacationPlanner 
                  userId={user.uid} 
                  onNavigateToShopping={() => setActiveTab('shopping')} 
                />
              ) : (
                <UpgradeCard
                  title="Pianifica le vacanze"
                  text="Organizza menù e spesa anche fuori casa, per tutto il periodo che serve. È incluso nel piano Famiglia, con 7 giorni di prova gratuita."
                  badge="Famiglia"
                  onUpgrade={() => setActiveTab('business')}
                />
              )
            )}
            {activeTab === 'offers' && (
              limitsFor(profile?.plan).flyerScansPerMonth > 0 ? (
                <FlyerAnalysis userId={user.uid} profile={profile} />
              ) : (
                <UpgradeCard
                  title="Scansiona i volantini"
                  text="Fotografa il volantino del supermercato: ti diciamo quali ingredienti sani sono in offerta e li usiamo nel menù. Fa parte del piano Chef IA."
                  badge="Chef IA"
                  onUpgrade={() => setActiveTab('business')}
                />
              )
            )}
            {activeTab === 'pantry' && (
              <Pantry 
                userId={user.uid} 
                profile={profile} 
                onNavigateToPlanner={() => setActiveTab('planner')}
              />
            )}
            {activeTab === 'shopping' && (
              <ShoppingList 
                userId={user.uid} 
                profile={profile} 
                onNavigateToBusiness={() => setActiveTab('business')} 
              />
            )}
            {activeTab === 'family' && (
              <FamilySettings 
                userId={user.uid} 
                profile={profile}
                onProfileUpdate={setProfile}
                onNavigateToPantry={() => setActiveTab('pantry')}
                onNavigateToPlanner={() => setActiveTab('planner')}
                onNavigateToBusiness={() => setActiveTab('business')}
              />
            )}
            {activeTab === 'recipes' && (
              <RecipeList 
                userId={user.uid} 
                voiceSearchQuery={voiceSearchQuery} 
                setVoiceSearchQuery={setVoiceSearchQuery} 
              />
            )}
            {activeTab === 'guide' && <FoodPyramid />}
            {activeTab === 'business' && (
              <BusinessModel 
                userId={user.uid} 
                profile={profile} 
                isAdmin={userIsAdmin} 
                onProfileUpdate={setProfile}
                hasMealPlan={hasMealPlan}
                hasFamilyMember={hasFamilyMember}
              />
            )}
            {activeTab === 'account' && (
              <AccountSettings
                user={user}
                profile={profile}
                onProfileUpdate={setProfile}
                onOpenSubscription={() => setActiveTab('business')}
                onLogout={handleLogout}
                isAdmin={userIsAdmin}
              />
            )}
            {activeTab === 'admin' && userIsAdmin && <AdminDashboard />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Menù "Altro" (mobile) */}
      <AnimatePresence>
        {showMore && (
          <div className="fixed inset-0 z-[45] md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMore(false)}
              className="absolute inset-0 bg-slate-950/40"
            />
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="absolute left-3 right-3 bottom-[calc(5rem+env(safe-area-inset-bottom))] bg-white rounded-3xl shadow-2xl border border-slate-200 p-2"
            >
              {moreTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id as Tab); setShowMore(false); }}
                  className={`w-full flex items-center gap-4 p-3 rounded-2xl text-left ${activeTab === tab.id ? 'bg-indigo-50' : 'active:bg-slate-50'}`}
                >
                  <span className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <tab.icon className="w-6 h-6" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-bold text-slate-900">{tab.label}</span>
                    <span className="block text-sm text-slate-500">{moreDescriptions[tab.id]}</span>
                  </span>
                </button>
              ))}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 pt-2.5 pb-[max(0.25rem,env(safe-area-inset-bottom))] flex items-center justify-around z-40 md:hidden">
        {primaryTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as Tab); setShowMore(false); }}
            className={`flex flex-col items-center gap-1 transition-colors flex-1 pb-1 cursor-pointer ${
              activeTab === tab.id && !showMore ? 'text-indigo-600 font-bold' : 'text-slate-400'
            }`}
          >
            <tab.icon className="w-5.5 h-5.5" />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
        <button
          onClick={() => setShowMore(m => !m)}
          aria-expanded={showMore}
          className={`flex flex-col items-center gap-1 transition-colors flex-1 pb-1 cursor-pointer ${
            showMore || moreActive ? 'text-indigo-600 font-bold' : 'text-slate-400'
          }`}
        >
          <MoreHorizontal className="w-5.5 h-5.5" />
          <span className="text-[10px] font-medium">Altro</span>
        </button>
      </nav>

      {/* Sidebar Navigation (Desktop) */}
      <nav className="hidden md:flex fixed left-0 top-16 bottom-0 w-20 bg-white border-r border-slate-200 flex-col items-center py-4 gap-4 overflow-y-auto z-20 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            title={tab.label}
            className={`p-3 rounded-xl transition-all shrink-0 cursor-pointer ${
              activeTab === tab.id 
                ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            <tab.icon className="w-6 h-6" />
          </button>
        ))}
      </nav>

      {/* Only Load voice assistant panel for premium PRO users */}
      {limitsFor(profile?.plan).voiceAssistant && (
        <VoiceAssistant 
          userId={user.uid}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          voiceSearchQuery={voiceSearchQuery}
          setVoiceSearchQuery={setVoiceSearchQuery}
        />
      )}

      {/* Friendly upgrade gate modal popup for header Voice Assistant button */}
      <AnimatePresence>
        {showPremiumGate && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 text-center space-y-4"
            >
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-xl mx-auto border border-indigo-150 animate-pulse">
                <Sparkles size={24} />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-950 text-sm">Sblocca l'Assistente Vocale IA!</h4>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Controlla i menù, detta a voce cosa manca nella lista e fatti aiutare mentre cucini con l'Assistente Vocale del piano <strong>Chef IA</strong>.
                </p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowPremiumGate(null)}
                  className="w-1/3 py-2 border border-slate-200 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-slate-500"
                >
                  Indietro
                </button>
                <button 
                  onClick={() => {
                    setShowPremiumGate(null);
                    setActiveTab('business');
                  }}
                  className="w-2/3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer text-center"
                >
                  Sblocca Ora
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {checkoutDone && user && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full border border-slate-200 text-center space-y-4"
            >
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
                <Check size={30} />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 text-2xl">Grazie, è tutto pronto!</h4>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  {profile && normalizePlan(profile.plan) !== 'free'
                    ? <>Ora hai il piano <strong>{planName(profile.plan)}</strong>. Puoi gestire o disdire l'abbonamento quando vuoi da Altro → Abbonamento.</>
                    : <>Stiamo attivando il tuo piano: ci vogliono pochi secondi.</>}
                </p>
              </div>
              <button
                onClick={() => setCheckoutDone(false)}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-bold transition-all active:scale-95 cursor-pointer"
              >
                Ottimo, iniziamo
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <WelcomeTour
        user={user}
        profile={profile}
        onNavigate={(tab) => setActiveTab(tab)}
        onProfileUpdate={setProfile}
      />

      <PWAInstallPrompt />
      <UpdateBanner />
    </div>
  );
}
