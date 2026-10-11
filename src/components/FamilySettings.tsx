import { useState, useEffect } from 'react';
import { db, functions } from '../lib/firebase';
import { limitsFor, planName } from '../lib/plans';
import { httpsCallable } from 'firebase/functions';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';
import { FamilyMember, DietaryRestriction, UserProfile, Recipe } from '../types';
import { Plus, Trash2, ChevronDown, X } from 'lucide-react';
import { INITIAL_RECIPES } from '../data/recipes';

interface Props {
  userId: string;
  profile?: UserProfile | null;
  onProfileUpdate?: (profile: UserProfile | null) => void;
  onNavigateToPantry?: () => void;
  onNavigateToPlanner?: () => void;
  onNavigateToBusiness?: () => void;
}

export default function FamilySettings({ userId, profile: propProfile, onProfileUpdate, onNavigateToPantry, onNavigateToPlanner, onNavigateToBusiness }: Props) {
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
  const [openMemberId, setOpenMemberId] = useState<string | null>(null);
  const [memberTab, setMemberTab] = useState<'like' | 'dislike' | 'meals'>('dislike');

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
    if (members.length >= limitsFor(profile?.plan).maxMembers) {
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

  const isPaid = !!profile?.plan && profile.plan !== 'free';
  const DIET_OPTIONS = [
    { id: 'vegan', emoji: '🌱', label: 'Vegani' },
    { id: 'gluten-free', emoji: '🌾', label: 'Senza glutine' },
    { id: 'lactose-free', emoji: '🥛', label: 'Senza lattosio' },
  ] as const;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-3xl font-semibold text-slate-900">La famiglia</h2>
        <p className="text-slate-600 mt-1">Chi mangia a tavola e cosa evitare.</p>
      </div>

      {/* A tavola */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-xl font-semibold text-slate-900">A tavola</h3>
          <span className="text-sm text-slate-500">
            {members.length}
            {Number.isFinite(limitsFor(profile?.plan).maxMembers) ? ` di ${limitsFor(profile?.plan).maxMembers}` : ''}
          </span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Aggiungi una persona (es. Luca)"
            value={newMemberName}
            onChange={(e) => {
              setNewMemberName(e.target.value);
              if (showLimitWarning) setShowLimitWarning(false);
            }}
            onKeyDown={(e) => e.key === 'Enter' && addMember()}
            className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-2xl px-4 h-12 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={addMember}
            aria-label="Aggiungi persona"
            className="shrink-0 h-12 w-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl flex items-center justify-center"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {showLimitWarning && (
          <p className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-2xl p-3">
            Il piano gratuito comprende fino a <strong>{limitsFor(profile?.plan).maxMembers} persone</strong>. Con il piano Famiglia non hai limiti.
            {onNavigateToBusiness && (
              <button onClick={onNavigateToBusiness} className="ml-1 font-bold underline underline-offset-4">Scopri i piani</button>
            )}
          </p>
        )}

        {members.length === 0 ? (
          <p className="text-slate-500 py-4 text-center">Aggiungi chi mangia con te: il menù terrà conto dei suoi gusti.</p>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
            {members.map(member => {
              const open = openMemberId === member.id;
              const dislikes = (member.dislikedIngredients?.length || 0) + (member.dislikedMeals?.length || 0);
              const likes = (member.likedIngredients?.length || 0) + (member.likedMeals?.length || 0);
              return (
                <div key={member.id}>
                  <div className="flex items-center">
                    <button
                      onClick={() => setOpenMemberId(open ? null : member.id)}
                      aria-expanded={open}
                      className="flex-1 min-w-0 flex items-center gap-3 px-4 py-4 text-left active:bg-slate-50"
                    >
                      <span className="w-11 h-11 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block font-semibold text-slate-900 truncate">{member.name}</span>
                        <span className="block text-sm text-slate-500">
                          {likes + dislikes === 0 ? 'Nessun gusto indicato' : `${likes} piace · ${dislikes} da evitare`}
                        </span>
                      </span>
                      <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
                    </button>
                    <button
                      onClick={() => deleteMember(member.id)}
                      aria-label={`Rimuovi ${member.name}`}
                      className="shrink-0 w-11 h-11 mr-2 rounded-full flex items-center justify-center text-slate-300 hover:text-red-500"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {open && (
                    <div className="px-4 pb-5 space-y-4 bg-slate-50/60">
                      <div className="flex bg-slate-100 p-1 rounded-2xl" role="group" aria-label="Gusti di questa persona">
                        {([
                          ['dislike', 'Non mangia'],
                          ['like', 'Ama'],
                          ['meals', 'Piatti'],
                        ] as const).map(([id, label]) => (
                          <button
                            key={id}
                            onClick={() => setMemberTab(id)}
                            aria-pressed={memberTab === id}
                            className={`flex-1 h-10 rounded-xl text-sm font-semibold ${
                              memberTab === id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>

                      {memberTab === 'dislike' && (
                        <div>
                          <p className="text-sm text-slate-600 mb-3">Tocca gli ingredienti che non deve trovare nel piatto.</p>
                          <div className="flex flex-wrap gap-2">
                            {COMMON_INGREDIENTS.map(ing => {
                              const on = member.dislikedIngredients?.includes(ing);
                              return (
                                <button
                                  key={ing}
                                  type="button"
                                  aria-pressed={!!on}
                                  onClick={() => updatePreferences(member.id, 'dislikedIngredients', ing)}
                                  className={`px-3.5 h-10 rounded-full border text-sm font-medium ${
                                    on ? 'bg-slate-800 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-700'
                                  }`}
                                >
                                  {ing}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {memberTab === 'like' && (
                        <div>
                          <p className="text-sm text-slate-600 mb-3">Tocca gli ingredienti che ama: li useremo più spesso.</p>
                          <div className="flex flex-wrap gap-2">
                            {COMMON_INGREDIENTS.map(ing => {
                              const on = member.likedIngredients?.includes(ing);
                              const blocked = member.dislikedIngredients?.includes(ing);
                              return (
                                <button
                                  key={ing}
                                  type="button"
                                  disabled={blocked}
                                  aria-pressed={!!on}
                                  onClick={() => updatePreferences(member.id, 'likedIngredients', ing)}
                                  className={`px-3.5 h-10 rounded-full border text-sm font-medium ${
                                    on
                                      ? 'bg-pink-600 border-pink-600 text-white'
                                      : blocked
                                      ? 'bg-slate-100 border-slate-200 text-slate-300 line-through cursor-not-allowed'
                                      : 'bg-white border-slate-200 text-slate-700'
                                  }`}
                                >
                                  {ing}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {memberTab === 'meals' && (
                        <div className="space-y-5">
                          {([
                            { field: 'likedMeals', title: 'Piatti che ama', onClass: 'bg-emerald-600 border-emerald-600 text-white', blockedField: 'dislikedMeals' },
                            { field: 'dislikedMeals', title: 'Piatti da evitare', onClass: 'bg-slate-800 border-slate-800 text-white', blockedField: null },
                          ] as const).map(group => (
                            <div key={group.field}>
                              <p className="text-sm font-semibold text-slate-800 mb-2">{group.title}</p>
                              <div className="max-h-48 overflow-y-auto p-2.5 bg-white border border-slate-200 rounded-2xl flex flex-wrap gap-2">
                                {allRecipes.map(recipe => {
                                  const on = (member[group.field] || []).includes(recipe.id);
                                  const blocked = group.blockedField ? (member[group.blockedField] || []).includes(recipe.id) : false;
                                  return (
                                    <button
                                      key={recipe.id}
                                      type="button"
                                      disabled={blocked}
                                      aria-pressed={on}
                                      onClick={() => updatePreferences(member.id, group.field, recipe.id)}
                                      className={`px-3 h-9 rounded-full border text-sm ${
                                        on ? group.onClass : blocked ? 'bg-slate-100 border-slate-200 text-slate-300 line-through' : 'bg-white border-slate-200 text-slate-700'
                                      }`}
                                    >
                                      {recipe.title}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Da evitare per tutti: diete e allergie in un'unica scheda */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-5">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Da evitare per tutti</h3>
          <p className="text-sm text-slate-500 mt-1">Il menù non li proporrà mai.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {DIET_OPTIONS.map(diet => {
            const on = profile?.dietaryRestrictions?.includes(diet.id);
            return (
              <button
                key={diet.id}
                onClick={() => updateGlobalRestrictions(diet.id)}
                aria-pressed={!!on}
                className={`px-4 h-11 rounded-full border text-sm font-semibold flex items-center gap-2 ${
                  on ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <span>{diet.emoji}</span>
                {diet.label}
              </button>
            );
          })}
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-800 mb-2">Allergie o ingredienti da escludere</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Es. arachidi"
              value={newAllergy}
              onChange={(e) => setNewAllergy(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addAllergy()}
              className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-2xl px-4 h-12 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={addAllergy}
              aria-label="Aggiungi allergia"
              className="shrink-0 h-12 w-12 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl flex items-center justify-center"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          {profile?.excludedIngredients && profile.excludedIngredients.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {profile.excludedIngredients.map(allergy => (
                <span key={allergy} className="inline-flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-800 pl-3.5 pr-2 h-10 rounded-full text-sm font-medium">
                  {allergy}
                  <button onClick={() => removeAllergy(allergy)} aria-label={`Rimuovi ${allergy}`} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-100">
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Piano e abbonamento: una riga */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-slate-500">Il tuo piano</p>
          <p className="text-lg font-semibold text-slate-900">{planName(profile?.plan)}</p>
        </div>
        {isPaid ? (
          <button onClick={toggleAutoRenew} className="shrink-0 px-4 h-11 rounded-2xl border border-slate-200 text-slate-700 text-sm font-semibold">
            Gestisci
          </button>
        ) : (
          onNavigateToBusiness && (
            <button onClick={onNavigateToBusiness} className="shrink-0 px-4 h-11 rounded-2xl bg-indigo-600 text-white text-sm font-bold">
              Scopri i piani
            </button>
          )
        )}
      </div>

      {members.length > 0 && onNavigateToPlanner && (
        <button
          onClick={onNavigateToPlanner}
          className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-md"
        >
          Crea il menù della settimana
        </button>
      )}

      <button
        onClick={() => window.dispatchEvent(new CustomEvent('open-welcome-tour'))}
        className="block mx-auto text-sm font-semibold text-slate-500 underline underline-offset-4"
      >
        Rivedi la guida iniziale
      </button>
    </div>
  );
}
