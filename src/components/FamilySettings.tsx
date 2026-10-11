import { useState, useEffect } from 'react';
import { db, functions } from '../lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';
import { FamilyMember, DietaryRestriction, UserProfile, Recipe } from '../types';
import { Plus, Trash2, Heart, HeartOff, User, Settings2, X, UtensilsCrossed, ShieldCheck, Sparkles, RefreshCw, Calendar, Mail, Info, CreditCard } from 'lucide-react';
import { INITIAL_RECIPES } from '../data/recipes';

interface Props {
  userId: string;
  profile?: UserProfile | null;
  onProfileUpdate?: (profile: UserProfile | null) => void;
  onNavigateToPantry?: () => void;
  onNavigateToPlanner?: () => void;
}

export default function FamilySettings({ userId, profile: propProfile, onProfileUpdate, onNavigateToPantry, onNavigateToPlanner }: Props) {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(propProfile || null);

  useEffect(() => {
    if (propProfile) {
      setProfile(propProfile);
    }
  }, [propProfile]);
  const [customRecipes, setCustomRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMemberName, setNewMemberName] = useState('');
  const [showLimitWarning, setShowLimitWarning] = useState(false);

  const allRecipes = [...INITIAL_RECIPES, ...customRecipes];

  useEffect(() => {
    if (userId === 'demo-family-user' || userId.startsWith('local-')) {
      const savedMembers = localStorage.getItem(`members_${userId}`);
      if (savedMembers) {
        try { setMembers(JSON.parse(savedMembers)); } catch (e) {}
      } else {
        const def: FamilyMember[] = [
          { id: '1', name: 'Marco (Papà)', likedIngredients: ['Spaghetti', 'Pollo'], dislikedIngredients: ['Cavolfiore'], likedMeals: ['meal-spaghetti-gamberi'], dislikedMeals: [] },
          { id: '2', name: 'Laura (Mamma)', likedIngredients: ['Salmone', 'Zucchine'], dislikedIngredients: ['Cipolla'], likedMeals: ['meal-salmone'], dislikedMeals: [] },
          { id: '3', name: 'Sofia (Bimba)', likedIngredients: ['Polpette', 'Patate'], dislikedIngredients: ['Broccoli'], likedMeals: ['meal-polpette'], dislikedMeals: [] },
          { id: '4', name: 'Luca (Bimbo)', likedIngredients: ['Pizza', 'Hamburger'], dislikedIngredients: ['Spinaci'], likedMeals: ['meal-hamburger'], dislikedMeals: [] }
        ];
        setMembers(def);
        localStorage.setItem(`members_${userId}`, JSON.stringify(def));
      }

      const savedCustom = localStorage.getItem(`customRecipes_${userId}`);
      if (savedCustom) {
        try { setCustomRecipes(JSON.parse(savedCustom)); } catch (e) {}
      }

      const savedProf = localStorage.getItem(`profile_${userId}`);
      if (savedProf) {
        try { setProfile(JSON.parse(savedProf)); } catch (e) {}
      } else {
        setProfile({
          id: userId,
          name: 'Famiglia Locale',
          email: 'locale@che-cucino-oggi.it',
          dietaryRestrictions: [],
          excludedIngredients: [],
          plan: 'premium',
          isAdmin: false,
          isSuspended: false,
          createdAt: new Date().toISOString()
        });
      }
      setLoading(false);
      return;
    }

    const membersPath = `users/${userId}/familyMembers`;
    const qMembers = query(collection(db, membersPath));
    const unsubMembers = onSnapshot(qMembers, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FamilyMember));
      setMembers(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, membersPath);
    });

    const profilePath = `users/${userId}`;
    const unsubProfile = onSnapshot(doc(db, profilePath), (snapshot) => {
      if (snapshot.exists()) {
        const p = { id: snapshot.id, ...snapshot.data() } as UserProfile;
        setProfile(p);
        if (onProfileUpdate) onProfileUpdate(p);
      } else {
        const p = {
          id: userId,
          name: '',
          dietaryRestrictions: [],
          excludedIngredients: []
        } as UserProfile;
        setProfile(p);
        if (onProfileUpdate) onProfileUpdate(p);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, profilePath);
      setLoading(false);
    });

    const customRecipesPath = `users/${userId}/customRecipes`;
    const qCustom = query(collection(db, customRecipesPath));
    const unsubCustom = onSnapshot(qCustom, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe));
      setCustomRecipes(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, customRecipesPath);
    });

    return () => {
      unsubMembers();
      unsubProfile();
      unsubCustom();
    };
  }, [userId]);

  const updateGlobalRestrictions = async (restriction: DietaryRestriction) => {
    if (!profile) return;
    const current = profile.dietaryRestrictions || [];
    const updated = current.includes(restriction)
      ? current.filter(r => r !== restriction)
      : [...current, restriction];
    
    if (userId === 'demo-family-user' || userId.startsWith('local-')) {
      const newProf = { ...profile, dietaryRestrictions: updated };
      setProfile(newProf);
      localStorage.setItem(`profile_${userId}`, JSON.stringify(newProf));
      return;
    }
    const path = `users/${userId}`;
    try {
      await updateDoc(doc(db, path), { dietaryRestrictions: updated });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
    }
  };

  const [newAllergy, setNewAllergy] = useState('');

  const addAllergy = async () => {
    if (!profile || !newAllergy.trim()) return;
    const current = profile.excludedIngredients || [];
    const value = newAllergy.trim();
    // Niente doppioni: "Arachidi" e "arachidi" sono la stessa cosa
    if (current.some(a => a.toLowerCase() === value.toLowerCase())) {
      setNewAllergy('');
      return;
    }

    const updated = [...current, value];
    if (userId === 'demo-family-user' || userId.startsWith('local-')) {
      const newProf = { ...profile, excludedIngredients: updated };
      setProfile(newProf);
      localStorage.setItem(`profile_${userId}`, JSON.stringify(newProf));
      setNewAllergy('');
      return;
    }
    const path = `users/${userId}`;
    try {
      await updateDoc(doc(db, path), { excludedIngredients: updated });
      setNewAllergy('');
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
    }
  };

  const removeAllergy = async (allergy: string) => {
    if (!profile) return;
    const updated = (profile.excludedIngredients || []).filter(a => a !== allergy);
    if (userId === 'demo-family-user' || userId.startsWith('local-')) {
      const newProf = { ...profile, excludedIngredients: updated };
      setProfile(newProf);
      localStorage.setItem(`profile_${userId}`, JSON.stringify(newProf));
      return;
    }
    const path = `users/${userId}`;
    try {
      await updateDoc(doc(db, path), { excludedIngredients: updated });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
    }
  };

  const addMember = async () => {
    if (!newMemberName.trim()) return;
    const isFree = !profile || !profile.plan || profile.plan === 'free';
    if (isFree && members.length >= 1) {
      setShowLimitWarning(true);
      return;
    }
    if (userId === 'demo-family-user' || userId.startsWith('local-')) {
      const updated = [...members, { id: Date.now().toString(), name: newMemberName, likedIngredients: [], dislikedIngredients: [], likedMeals: [], dislikedMeals: [] }];
      setMembers(updated);
      localStorage.setItem(`members_${userId}`, JSON.stringify(updated));
      setNewMemberName('');
      setShowLimitWarning(false);
      return;
    }
    const path = `users/${userId}/familyMembers`;
    try {
      await addDoc(collection(db, path), {
        name: newMemberName,
        likedIngredients: [],
        dislikedIngredients: [],
        likedMeals: [],
        dislikedMeals: []
      });
      setNewMemberName('');
      setShowLimitWarning(false);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    }
  };

  const deleteMember = async (id: string) => {
    if (userId === 'demo-family-user' || userId.startsWith('local-')) {
      const updated = members.filter(m => m.id !== id);
      setMembers(updated);
      localStorage.setItem(`members_${userId}`, JSON.stringify(updated));
      return;
    }
    const path = `users/${userId}/familyMembers`;
    try {
      await deleteDoc(doc(db, path, id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  };

  const toggleAutoRenew = async () => {
    if (!profile) return;
    const isCurrentlyActive = profile.autoRenew !== false && profile.subscriptionStatus !== 'pending_renewal';
    const newAutoRenew = !isCurrentlyActive;
    const newStatus = newAutoRenew ? 'active' : 'pending_renewal';

    // Account reali: rinnovo e disdetta si gestiscono dal portale Stripe (aggiorna il piano via server)
    if (!(userId === 'demo-family-user' || userId.startsWith('local-'))) {
      try {
        const result = await httpsCallable<unknown, { url: string }>(functions, 'createPortalSession')();
        if (Capacitor.isNativePlatform()) {
          await Browser.open({ url: result.data.url });
        } else {
          window.location.assign(result.data.url);
        }
      } catch (e: any) {
        alert(e?.message || 'Impossibile aprire la gestione abbonamento. Riprova.');
      }
      return;
    }

    const updatedProfile: UserProfile = {
      ...profile,
      autoRenew: newAutoRenew,
      subscriptionStatus: newStatus as 'active' | 'pending_renewal'
    };
    setProfile(updatedProfile);
    if (onProfileUpdate) {
      onProfileUpdate(updatedProfile);
    }
    localStorage.setItem(`profile_${userId}`, JSON.stringify(updatedProfile));
  };

  const updatePreferences = async (id: string, field: 'likedIngredients' | 'dislikedIngredients' | 'likedMeals' | 'dislikedMeals', value: string) => {
    const member = members.find(m => m.id === id);
    if (!member) return;

    const current = member[field] || [];
    const oppositeField = field === 'likedIngredients' ? 'dislikedIngredients' 
                        : field === 'dislikedIngredients' ? 'likedIngredients'
                        : field === 'likedMeals' ? 'dislikedMeals' : 'likedMeals';
    const currentOpposite = member[oppositeField] || [];

    // If trying to select a liked item that is currently not to their liking (in disliked list), block selection
    if ((field === 'likedMeals' || field === 'likedIngredients') && !current.includes(value) && currentOpposite.includes(value)) {
      return;
    }

    const updated = current.includes(value) 
      ? current.filter(v => v !== value)
      : [...current, value];

    // If marking as disliked, automatically remove from liked list if present
    let updatedOpposite = currentOpposite;
    if ((field === 'dislikedMeals' || field === 'dislikedIngredients') && !current.includes(value) && currentOpposite.includes(value)) {
      updatedOpposite = currentOpposite.filter(v => v !== value);
    }

    if (userId === 'demo-family-user' || userId.startsWith('local-')) {
      const updatedMembers = members.map(m => m.id === id ? { ...m, [field]: updated, [oppositeField]: updatedOpposite } : m);
      setMembers(updatedMembers);
      localStorage.setItem(`members_${userId}`, JSON.stringify(updatedMembers));
      return;
    }

    const path = `users/${userId}/familyMembers`;
    try {
      await updateDoc(doc(db, path, id), {
        [field]: updated,
        [oppositeField]: updatedOpposite
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
    }
  };

  const COMMON_INGREDIENTS = [
    'Pomodoro', 'Pesce', 'Manzo', 'Vitello', 'Pollo', 'Tacchino', 'Coniglio', 'Rana', 'Agnello', 'Pecora', 'Piccione',
    'Pasta', 'Riso', 'Uova', 'Frutta', 'Formaggi', 'Verdure', 'Legumi', 'Cipolla', 'Aglio', 'Broccoli', 'Peperoni', 'Melanzane', 'Spinaci', 'Funghi', 'Crostacei'
  ];

  if (loading) return <div className="p-8 text-center">Caricamento...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Membri della Famiglia</h2>
          <p className="text-slate-500">Imposta i gusti di tutti per menù personalizzati.</p>
        </div>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('open-welcome-tour'))}
          className="self-start md:self-auto text-sm font-bold text-indigo-600 hover:text-indigo-800 underline underline-offset-4"
        >
          Rivedi la guida iniziale
        </button>
      </div>

      {/* Visual subscription and profile status card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Profilo Famiglia</span>
                <h3 className="text-lg font-extrabold text-slate-800">
                  {profile?.name || 'Nuova Famiglia spesa'}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="flex items-center gap-2 text-slate-600 bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="truncate">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">E-mail</span>
                  <span className="font-semibold">{profile?.email || 'N/A'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-600 bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Registrato il</span>
                  <span className="font-semibold">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('it-IT') : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-600 bg-slate-50 border border-slate-100 p-2.5 rounded-xl sm:col-span-2 md:col-span-1">
                <CreditCard className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Livello Piano</span>
                  <span className={`inline-flex items-center gap-1 font-bold rounded px-1.5 py-0.5 mt-0.5 ${
                    profile?.plan === 'pro' ? 'bg-purple-50 text-purple-700' :
                    profile?.plan === 'smart' ? 'bg-indigo-50 text-indigo-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {profile?.plan === 'pro' ? 'Chef IA & OCR' : profile?.plan === 'smart' ? 'Smart' : 'Free (Base)'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50/80 border border-slate-100 p-5 rounded-2xl flex flex-col justify-between gap-4 lg:w-80 shrink-0">
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider mb-1">Stato Abbonamento</span>
              
              {(!profile || !profile.plan || profile.plan === 'free') ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                    <span className="text-xs font-bold text-slate-600">Piano Base Gratuito</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Sei sul piano gratuito. Sblocca ricette e pianificazioni illimitate con i piani Premium.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {(profile.autoRenew !== false && profile.subscriptionStatus !== 'pending_renewal') ? (
                    <>
                      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl w-fit">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-extrabold text-emerald-800 font-bold">Premium attivo</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-normal font-medium">
                        Il tuo abbonamento è attivo con fatturazione e rinnovo automatico regolare.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 bg-amber-50 border border-amber-150 px-3 py-1.5 rounded-xl w-fit">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="text-xs font-extrabold text-amber-800 font-bold">In attesa di rinnovo</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-normal font-medium">
                        Rinnovo automatico in sospeso o disattivato. L'abbonamento rimarrà attivo fino al termine del periodo pagato.
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>

            {profile && profile.plan !== 'free' && (
              <button
                type="button"
                onClick={toggleAutoRenew}
                className="w-full text-center py-2 px-3 border border-slate-200 hover:border-indigo-200 hover:bg-white text-[11px] font-bold text-slate-600 hover:text-indigo-600 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                <span>
                  {(profile.autoRenew !== false && profile.subscriptionStatus !== 'pending_renewal')
                    ? "Disattiva rinnovo automatico"
                    : "Attiva rinnovo automatico"
                  }
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="mb-6 flex items-center justify-between text-xs text-slate-500 font-semibold bg-slate-50 border border-slate-150 px-4 py-2 rounded-xl">
          <span>Profili aggiuntivi aggiunti:</span>
          <span className="font-black text-slate-850">
            {members.length} {(!profile || !profile.plan || profile.plan === 'free') ? '/ 1 (Piano Base)' : '(Illimitati)'}
          </span>
        </div>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Nome membro (es. Luca)"
            value={newMemberName}
            onChange={(e) => {
              setNewMemberName(e.target.value);
              if (showLimitWarning) setShowLimitWarning(false);
            }}
            className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button 
            onClick={addMember}
            className="shrink-0 bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Aggiungi
          </button>
        </div>

        {showLimitWarning && (
          <div className="mb-6 p-4 bg-red-50 border border-red-150 rounded-xl text-xs text-red-800 space-y-1 animate-pulse">
            <div className="flex items-center gap-2 font-bold">
              <span>⚠️ Limite profili raggiunto</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600">
              Il piano gratuito consente di configurare fino a <strong>1 profilo aggiuntivo</strong> per la famiglia. Sblocca profili illimitati per tutta la famiglia con il piano Smart o Pro!
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {members.map(member => (
            <div key={member.id} className="border border-slate-100 rounded-xl p-6 bg-slate-50/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <User className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-800">{member.name}</h3>
                </div>
                <button 
                  onClick={() => deleteMember(member.id)}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1 mb-2">
                    <Heart className="w-3 h-3 text-pink-500" />
                    Ingredienti preferiti
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_INGREDIENTS.map(ing => {
                      const isLiked = member.likedIngredients?.includes(ing);
                      const isDisliked = member.dislikedIngredients?.includes(ing);
                      return (
                        <button
                          key={ing}
                          type="button"
                          disabled={isDisliked}
                          onClick={() => updatePreferences(member.id, 'likedIngredients', ing)}
                          className={`text-xs px-3 py-1 rounded-full border transition-all ${
                            isLiked
                              ? 'bg-pink-50 border-pink-200 text-pink-600 font-bold'
                              : isDisliked
                              ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-40 cursor-not-allowed line-through'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                          title={isDisliked ? 'Ingrediente non gradito: impossibile selezionarlo tra i preferiti' : ing}
                        >
                          {ing}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1 mb-2">
                    <HeartOff className="w-3 h-3 text-slate-400" />
                    Ingredienti non graditi
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_INGREDIENTS.map(ing => {
                      const isDisliked = member.dislikedIngredients?.includes(ing);
                      return (
                        <button
                          key={ing}
                          type="button"
                          onClick={() => updatePreferences(member.id, 'dislikedIngredients', ing)}
                          className={`text-xs px-3 py-1 rounded-full border transition-all ${
                            isDisliked
                              ? 'bg-slate-200 border-slate-300 text-slate-700 font-bold'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {ing}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1 mb-2">
                    <UtensilsCrossed className="w-3 h-3 text-emerald-500" />
                    Piatti preferiti (Ricette amate)
                  </label>
                  <div className="max-h-36 overflow-y-auto p-2.5 bg-white border border-slate-200/80 rounded-xl flex flex-wrap gap-1.5 shadow-2xs">
                    {allRecipes.map(recipe => {
                      const isLiked = member.likedMeals?.includes(recipe.id);
                      const isDisliked = member.dislikedMeals?.includes(recipe.id);
                      return (
                        <button
                          key={recipe.id}
                          type="button"
                          disabled={isDisliked}
                          onClick={() => updatePreferences(member.id, 'likedMeals', recipe.id)}
                          className={`text-xs px-2.5 py-1 rounded-full border transition-all flex items-center gap-1 ${
                            isLiked
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold shadow-2xs'
                              : isDisliked
                              ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-40 cursor-not-allowed line-through'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                          title={isDisliked ? 'Piatto non gradito: impossibile selezionarlo come preferito' : recipe.title}
                        >
                          {recipe.title}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1 mb-2">
                    <HeartOff className="w-3 h-3 text-red-400" />
                    Piatti non graditi (Esclusi per questo membro)
                  </label>
                  <div className="max-h-36 overflow-y-auto p-2.5 bg-white border border-slate-200/80 rounded-xl flex flex-wrap gap-1.5 shadow-2xs">
                    {allRecipes.map(recipe => {
                      const isDisliked = member.dislikedMeals?.includes(recipe.id);
                      return (
                        <button
                          key={recipe.id}
                          type="button"
                          onClick={() => updatePreferences(member.id, 'dislikedMeals', recipe.id)}
                          className={`text-xs px-2.5 py-1 rounded-full border transition-all flex items-center gap-1 ${
                            isDisliked
                              ? 'bg-red-50 border-red-200 text-red-700 font-bold shadow-2xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                          title={recipe.title}
                        >
                          {recipe.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {members.length === 0 && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400">Aggiungi i membri della tua famiglia per iniziare.</p>
          </div>
        )}
      </div>

      <div className="bg-orange-50 border border-orange-100 rounded-xl p-6 flex flex-col md:flex-row gap-6">
        <div className="flex gap-4">
          <div className="bg-orange-100 p-2 rounded-lg h-fit">
            <Settings2 className="text-orange-600 w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-orange-900">Restrizioni Alimentari Globali</h4>
            <p className="text-xs text-orange-700 leading-relaxed mb-4">
              Queste impostazioni filtrano automaticamente tutte le ricette nel piano settimanale.
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 md:ml-auto">
          {([
            { id: 'vegan', label: 'Vegan' },
            { id: 'lactose-free', label: 'Senza Lattosio' },
            { id: 'gluten-free', label: 'Senza Glutine' }
          ] as const).map(diet => {
            const isActive = profile?.dietaryRestrictions?.includes(diet.id);
            return (
              <button
                key={diet.id}
                onClick={() => updateGlobalRestrictions(diet.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                  isActive
                    ? 'bg-orange-200 border-orange-300 text-orange-900 shadow-sm'
                    : 'bg-white border-orange-100 text-orange-600 hover:border-orange-200'
                }`}
              >
                {isActive && <div className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />}
                {diet.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-red-50 border border-red-100 rounded-xl p-6">
        <div className="flex gap-4 mb-4">
          <div className="bg-red-100 p-2 rounded-lg h-fit">
            <HeartOff className="text-red-600 w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-red-900">Allergie e Ingredienti da Escludere</h4>
            <p className="text-xs text-red-700 leading-relaxed">
              Aggiungi qui gli ingredienti che devono essere totalmente evitati nella generazione dei menù.
            </p>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Aggiungi ingrediente (es. Arachidi)"
            value={newAllergy}
            onChange={(e) => setNewAllergy(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addAllergy()}
            className="flex-1 min-w-0 bg-white border border-red-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button 
            onClick={addAllergy}
            className="shrink-0 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors"
          >
            Aggiungi
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {profile?.excludedIngredients?.map(allergy => (
            <div 
              key={allergy}
              className="flex items-center gap-2 bg-white border border-red-200 px-3 py-1.5 rounded-full text-sm font-medium text-red-700"
            >
              {allergy}
              <button 
                onClick={() => removeAllergy(allergy)}
                className="hover:text-red-900 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {(!profile?.excludedIngredients || profile.excludedIngredients.length === 0) && (
            <p className="text-xs text-red-400 italic">Nessun ingrediente escluso.</p>
          )}
        </div>
      </div>

      {/* Next Step Guidance: Passa alla Dispensa */}
      {members.length > 0 && (onNavigateToPantry || onNavigateToPlanner) && (
        <div className="bg-gradient-to-r from-indigo-50 via-emerald-50 to-indigo-50 border border-indigo-200/80 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-600 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider shadow-2xs">Step 1 Completato</span>
                <h3 className="text-base font-bold text-slate-900">Famiglia configurata con successo!</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                Ora puoi passare alla <strong>Dispensa</strong> per impostare i prodotti che hai già in casa prima di generare il menù. <em>(Tuttavia, questo passaggio è facoltativo e può essere saltato).</em>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
              {onNavigateToPantry && (
                <button
                  onClick={onNavigateToPantry}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>Imposta Prodotti in Dispensa</span>
                  <span>→</span>
                </button>
              )}
              {onNavigateToPlanner && (
                <button
                  onClick={onNavigateToPlanner}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer shadow-2xs"
                >
                  Salta e Genera Menù
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
