import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';
import { PantryItem, Recipe, UserProfile } from '../types';
import { INITIAL_RECIPES } from '../data/recipes';
import { getRawIngredientNames, scaleIngredientAmount } from '../lib/utils';
import { calculateNutrients } from '../lib/nutritionUtils';
import { consumeIngredientsFromPantry, checkIngredientMatch, isStaple, findPantryDuplicate } from '../lib/pantrySync';
import { 
  Plus, 
  Trash2, 
  Package, 
  Search, 
  ChevronUp, 
  ChevronDown, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  Clock, 
  Gauge, 
  X, 
  UtensilsCrossed, 
  Info,
  Users,
  ChefHat,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  userId: string;
  profile?: UserProfile | null;
  onNavigateToPlanner?: () => void;
}

export default function Pantry({ userId, profile, onNavigateToPlanner }: Props) {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [pantrySearch, setPantrySearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({ name: '', quantity: 1, unit: 'pz', category: 'Altro' });
  const [showLimitWarning, setShowLimitWarning] = useState(false);

  // Custom and combined recipes
  const [customRecipes, setCustomRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [targetServings, setTargetServings] = useState(2);

  // Suggested recipes display state
  const [matchFilter, setMatchFilter] = useState<'all' | 'ready' | 'almost'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [cookingSuccessMessage, setCookingSuccessMessage] = useState<string | null>(null);
  const [isConsuming, setIsConsuming] = useState(false);

  useEffect(() => {
    setCookingSuccessMessage(null);
  }, [selectedRecipe]);

  const handleCookRecipe = async () => {
    if (!selectedRecipe) return;
    setIsConsuming(true);
    setCookingSuccessMessage(null);
    try {
      const results = await consumeIngredientsFromPantry(userId, selectedRecipe, targetServings);
      const consumedList = results
        .filter(r => r.status !== 'not_found')
        .map(r => `${r.pantryItemName} (${Math.round(r.amountConsumed * 10) / 10} ${r.unit})`)
        .join(', ');
      
      if (consumedList) {
        setCookingSuccessMessage(`Complimenti! Hai preparato questo piatto. I seguenti ingredienti sono stati detratti dalla dispensa: ${consumedList}. Buon appetito! 👩‍🍳`);
      } else {
        setCookingSuccessMessage(`Complimenti! Hai preparato questo piatto. Tutti gli ingredienti erano di base e la dispensa è rimasta invariata. Buon appetito! 👩‍🍳`);
      }
    } catch (error) {
      console.error(error);
      setCookingSuccessMessage("Errore durante la detrazione degli ingredienti dalla dispensa.");
    } finally {
      setIsConsuming(false);
    }
  };

  useEffect(() => {
    const isLocal = userId === 'demo-family-user' || userId.startsWith('local-');
    if (isLocal) {
      const saved = localStorage.getItem(`pantry_${userId}`);
      if (saved) {
        try { setItems(JSON.parse(saved)); } catch (e) {}
      } else {
        setItems([
          { id: '1', name: 'Spaghetti', quantity: 2, unit: 'pz', category: 'Pasta e Cereali' },
          { id: '2', name: 'Passata di pomodoro', quantity: 3, unit: 'pz', category: 'Conservati' },
          { id: '3', name: 'Zucchine', quantity: 500, unit: 'g', category: 'Ortofrutta' },
          { id: '4', name: 'Uova', quantity: 6, unit: 'pz', category: 'Latticini e Uova' },
          { id: '5', name: 'Parmigiano Reggiano', quantity: 200, unit: 'g', category: 'Latticini e Uova' }
        ]);
      }
      setLoading(false);
      return;
    }

    const path = `users/${userId}/pantry`;
    const q = query(collection(db, path));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PantryItem));
      setItems(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [userId]);

  useEffect(() => {
    const isLocal = userId === 'demo-family-user' || userId.startsWith('local-');
    if (isLocal) {
      const saved = localStorage.getItem(`customRecipes_${userId}`);
      if (saved) {
        try { setCustomRecipes(JSON.parse(saved)); } catch (e) {}
      }
      return;
    }

    const path = `users/${userId}/customRecipes`;
    const q = query(collection(db, path));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe));
      setCustomRecipes(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
    return () => unsubscribe();
  }, [userId]);

  const addItem = async () => {
    const name = newItem.name.trim();
    const quantity = Number(newItem.quantity);
    if (!name || !Number.isFinite(quantity) || quantity <= 0) return;
    const isLocal = userId === 'demo-family-user' || userId.startsWith('local-');

    // Stesso prodotto già presente: si somma la quantità (non si crea un doppione e non si consuma il limite)
    const duplicate = findPantryDuplicate(items, name, newItem.unit);
    if (duplicate) {
      const merged = Math.round((duplicate.quantity + quantity) * 100) / 100;
      if (isLocal) {
        const updated = items.map(i => i.id === duplicate.id ? { ...i, quantity: merged } : i);
        setItems(updated);
        localStorage.setItem(`pantry_${userId}`, JSON.stringify(updated));
      } else {
        const path = `users/${userId}/pantry`;
        try {
          await updateDoc(doc(db, path, duplicate.id), { quantity: merged });
        } catch (e) {
          handleFirestoreError(e, OperationType.UPDATE, path);
          return;
        }
      }
      setNewItem({ name: '', quantity: 1, unit: 'pz', category: 'Altro' });
      setShowLimitWarning(false);
      return;
    }

    const isFree = !profile || !profile.plan || profile.plan === 'free';
    if (isFree && items.length >= 15) {
      setShowLimitWarning(true);
      return;
    }
    const toSave = { ...newItem, name, quantity };
    if (isLocal) {
      const updated = [...items, { ...toSave, id: Date.now().toString() }];
      setItems(updated);
      localStorage.setItem(`pantry_${userId}`, JSON.stringify(updated));
      setNewItem({ name: '', quantity: 1, unit: 'pz', category: 'Altro' });
      setShowLimitWarning(false);
      return;
    }
    const path = `users/${userId}/pantry`;
    try {
      await addDoc(collection(db, path), toSave);
      setNewItem({ name: '', quantity: 1, unit: 'pz', category: 'Altro' });
      setShowLimitWarning(false);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    }
  };

  const deleteItem = async (id: string) => {
    if (userId === 'demo-family-user' || userId.startsWith('local-')) {
      const updated = items.filter(i => i.id !== id);
      setItems(updated);
      localStorage.setItem(`pantry_${userId}`, JSON.stringify(updated));
      return;
    }
    const path = `users/${userId}/pantry`;
    try {
      await deleteDoc(doc(db, path, id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  };

  // Passo sensato per unità: 1 g per volta sarebbe inutilizzabile
  const stepForUnit = (unit: string) => {
    const u = (unit || '').toLowerCase();
    if (u === 'g' || u === 'ml') return 50;
    if (u === 'kg' || u === 'l') return 0.5;
    return 1;
  };

  const updateQuantity = async (id: string, direction: 1 | -1) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const delta = direction * stepForUnit(item.unit);
    const newQty = Math.max(0, Math.round((item.quantity + delta) * 100) / 100);
    if (userId === 'demo-family-user' || userId.startsWith('local-')) {
      const updated = items.map(i => i.id === id ? { ...i, quantity: newQty } : i);
      setItems(updated);
      localStorage.setItem(`pantry_${userId}`, JSON.stringify(updated));
      return;
    }
    const path = `users/${userId}/pantry`;
    try {
      await updateDoc(doc(db, path, id), { quantity: newQty });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
    }
  };

  // Extract match metrics per recipe
  const getRecipeMatchInfo = (recipe: Recipe) => {
    const matched: string[] = [];
    const missing: string[] = [];
    
    const tracksIngredients = recipe.ingredients.filter(ing => {
      const raws = getRawIngredientNames(ing.name);
      return !isStaple(ing.name) && (raws.length > 0 || ing.name.length > 2);
    });
    
    tracksIngredients.forEach(ing => {
      // 1. Check direct name match
      const isDirectMatch = items.some(p => p.quantity > 0 && checkIngredientMatch(p.name, ing.name));
      if (isDirectMatch) {
        matched.push(ing.name);
        return;
      }
      
      // 2. Check resolved raw component names match
      const raws = getRawIngredientNames(ing.name);
      const isRawMatch = raws.length > 0 && raws.some(rawIng => 
        items.some(p => p.quantity > 0 && checkIngredientMatch(p.name, rawIng))
      );
      
      if (isRawMatch) {
         matched.push(ing.name);
      } else {
         missing.push(ing.name);
      }
    });

    const totalTracked = tracksIngredients.length;
    const matchCount = matched.length;
    const percentage = totalTracked > 0 ? (matchCount / totalTracked) * 100 : 100;

    return {
      matched,
      missing,
      totalTracked,
      matchCount,
      percentage
    };
  };

  // Combine data recipes with custom user ones
  const allRecipes = [...INITIAL_RECIPES, ...customRecipes];

  // Map and filter recipes based on pantry matching
  const matchedRecipesList = allRecipes
    .map(recipe => {
      const matchMetrics = getRecipeMatchInfo(recipe);
      return { recipe, matchMetrics };
    })
    .filter(({ matchMetrics }) => {
      // Must have at least 1 tracked matched ingredient to display (otherwise not helpful/too noisy)
      // Exception: If the pantry is completely empty, we don't display suggestions
      if (items.length === 0) return false;
      return matchMetrics.matchCount > 0;
    })
    .filter(({ recipe, matchMetrics }) => {
      // Filtering by category type
      if (categoryFilter !== 'all') {
        const matchesCategory = categoryFilter === 'lunch' ? recipe.category === 'lunch' :
                               categoryFilter === 'dinner' ? recipe.category === 'dinner' :
                               recipe.category === categoryFilter;
        if (!matchesCategory) return false;
      }

      // Filtering by matching score logic
      if (matchFilter === 'ready') {
        return matchMetrics.missing.length === 0;
      }
      if (matchFilter === 'almost') {
        return matchMetrics.missing.length > 0 && matchMetrics.missing.length <= 2;
      }

      return true;
    })
    // Sort: prioritizes recipes where most ingredients are owned (fewer missing ingredients, then higher percentage)
    .sort((a, b) => {
      if (a.matchMetrics.missing.length !== b.matchMetrics.missing.length) {
        return a.matchMetrics.missing.length - b.matchMetrics.missing.length;
      }
      return b.matchMetrics.percentage - a.matchMetrics.percentage;
    });

  if (loading) return <div className="p-8 text-center text-slate-500">Caricamento dispensa in corso...</div>;

  return (
    <div className="space-y-6">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-indigo-900 bg-clip-text text-transparent">Dispensa Intelligente</h2>
          <p className="text-slate-500">Monitora gli ingredienti che hai in casa e scopri come usarli senza sprechi.</p>
        </div>
        {onNavigateToPlanner && (
          <button
            onClick={onNavigateToPlanner}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Genera Menù IA con questi Prodotti</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left pane: Pantry Stock Manager */}
        <div className="xl:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 bg-slate-50/70">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2 mb-3">
                <Package className="w-5 h-5 text-indigo-600" />
                La Mia Dispensa
              </h3>
              
              <div className="mb-4 flex items-center justify-between text-xs text-slate-500 font-semibold bg-white border border-slate-150 px-3 py-1.5 rounded-xl shadow-2xs">
                <span>Prodotti in dispensa:</span>
                <span className="font-black text-slate-850">
                  {items.length} {(!profile || !profile.plan || profile.plan === 'free') ? '/ 15 (Piano Base)' : '(Illimitati)'}
                </span>
              </div>
              
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Ingredienti (es. Zucchine, Uova, Farina)"
                  value={newItem.name}
                  onChange={(e) => {
                    setNewItem({ ...newItem, name: e.target.value });
                    if (showLimitWarning) setShowLimitWarning(false);
                  }}
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                    className="w-20 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <select
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="flex-1 min-w-0 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="pz">pz</option>
                    <option value="g">g</option>
                    <option value="kg">kg</option>
                    <option value="ml">ml</option>
                    <option value="l">l</option>
                  </select>
                  
                  <button 
                    onClick={addItem}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 font-bold text-sm transition-colors active:scale-95 duration-100"
                  >
                    <Plus className="w-4 h-4" />
                    Aggiungi
                  </button>
                </div>
              </div>

              {showLimitWarning && (
                <div className="mt-3 p-3 bg-red-50 border border-red-150 rounded-xl text-xs text-red-800 space-y-1 animate-pulse">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertTriangle className="w-4 h-4 text-red-650 shrink-0" />
                    <span>Limite dispensa raggiunto</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    Il piano gratuito consente di inserire fino a 15 ingredienti. Sblocca inserimenti illimitati con il piano Smart o Pro!
                  </p>
                </div>
              )}

              {/* Cerca in dispensa */}
              {items.length > 0 && (
                <div className="relative mt-3 pt-3 border-t border-slate-100">
                  <Search className="absolute left-3 top-[23px] text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Cerca nella tua dispensa..."
                    value={pantrySearch}
                    onChange={(e) => setPantrySearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {pantrySearch && (
                    <button 
                      onClick={() => setPantrySearch('')}
                      className="absolute right-3 top-[21px] text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {(() => {
                const filteredPantryItems = items.filter(item => 
                  item.name.toLowerCase().includes(pantrySearch.toLowerCase()) ||
                  (item.category && item.category.toLowerCase().includes(pantrySearch.toLowerCase()))
                );

                return (
                  <>
                    {filteredPantryItems.map(item => (
                      <div key={item.id} className="p-3 sm:p-4 flex items-center justify-between gap-2 hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-9 h-9 shrink-0 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                            <Package className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-slate-800 text-sm truncate">{item.name}</h4>
                            <p className="text-[10px] text-slate-400 capitalize truncate">{item.category}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 sm:gap-4 shrink-0">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <button 
                              onClick={() => updateQuantity(item.id, -1)}
                              className="p-1.5 hover:bg-slate-200 rounded-md text-slate-400 hover:text-slate-600"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                            <div className="w-14 sm:w-16 text-center">
                              <span className="font-bold text-slate-700 text-sm">{item.quantity}</span>
                              <span className="text-xs text-slate-400 ml-1">{item.unit}</span>
                            </div>
                            <button 
                              onClick={() => updateQuantity(item.id, 1)}
                              className="p-1.5 hover:bg-slate-200 rounded-md text-slate-400 hover:text-slate-600"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <button 
                            onClick={() => deleteItem(item.id)}
                            className="text-slate-300 hover:text-red-500 transition-colors p-1.5"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {items.length > 0 && filteredPantryItems.length === 0 && (
                      <div className="p-10 text-center text-slate-400 text-xs">
                        Nessun prodotto trovato per "{pantrySearch}"
                      </div>
                    )}
                  </>
                );
              })()}
              
              {items.length === 0 && (
                <div className="p-10 text-center text-slate-400">
                  <div className="mb-2">🥖 🥛 🥕</div>
                  La dispensa è vuota. Aggiungi i prodotti che hai in casa per ricevere suggerimenti di ricette.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right pane: "Cosa ho in dispensa?" Recipe Suggestions engine */}
        <div className="xl:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-500 fill-indigo-200" />
                  Cosa ho in dispensa?
                </h3>
                <p className="text-xs text-slate-400">Ricette su misura che riducono gli sprechi e massimizzano il risparmio.</p>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50 space-y-3">
                <ChefHat className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-700">Pronto per gli abbinamenti?</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto px-4">
                  Aggiungi gli ingredienti della tua dispensa nella sezione di sinistra. Ti consiglieremo le ricette migliori compatibili e ti diremo cosa comprare!
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Search and Filters Layout */}
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-4">
                    {/* Filter level selector */}
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                      {[
                        { id: 'all', label: 'Tutte' },
                        { id: 'ready', label: 'Pronte da cucinare' },
                        { id: 'almost', label: 'Manca poco (1-2)' }
                      ].map((btn) => (
                        <button
                          key={btn.id}
                          onClick={() => setMatchFilter(btn.id as any)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all ${
                            matchFilter === btn.id
                              ? 'bg-white text-slate-800 shadow-sm'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>

                    <div className="hidden sm:block h-4 w-[1px] bg-slate-200" />

                    {/* Filter categories pills */}
                    <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full">
                      {[
                        { id: 'all', label: 'Tutte' },
                        { id: 'lunch', label: 'Primi' },
                        { id: 'dinner', label: 'Secondi' },
                        { id: 'dessert', label: 'Dolci' },
                        { id: 'side', label: 'Contorni' }
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setCategoryFilter(cat.id)}
                          className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                            categoryFilter === cat.id
                              ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recommendations list */}
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                  {matchedRecipesList.map(({ recipe, matchMetrics }) => {
                    const isReady = matchMetrics.missing.length === 0;
                    return (
                      <div 
                        key={recipe.id} 
                        className="bg-white rounded-xl border border-slate-200 p-5 hover:border-indigo-300 hover:shadow-md transition-all group relative duration-200"
                      >
                        {/* Status absolute badges */}
                        {isReady ? (
                          <span className="absolute top-4 right-4 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Cucinalo subito!
                          </span>
                        ) : matchMetrics.missing.length <= 2 ? (
                          <span className="absolute top-4 right-4 bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-100 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-500" /> Manca pochissimo
                          </span>
                        ) : null}

                        <h4 className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors line-clamp-1 pr-32">
                          {recipe.title}
                        </h4>

                        <div className="flex gap-3 text-[11px] text-slate-500 mt-1.5">
                          <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {recipe.timeMin} min</span>
                          <span className="flex items-center gap-0.5 capitalize"><Gauge className="w-3 h-3" /> {recipe.difficulty}</span>
                          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded uppercase font-bold tracking-wider text-[8px]">{recipe.category === 'lunch' ? 'Primo' : recipe.category === 'dinner' ? 'Secondo' : recipe.category}</span>
                        </div>

                        {/* Ingredients tracking progress */}
                        <div className="mt-4 space-y-1">
                          <div className="flex justify-between text-[11px] font-extrabold text-slate-600">
                            <span>Corrispondenza ingredienti:</span>
                            <span>{Math.round(matchMetrics.percentage)}% ({matchMetrics.matchCount}/{matchMetrics.totalTracked})</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 ${
                                isReady ? 'bg-emerald-500' : matchMetrics.percentage >= 60 ? 'bg-indigo-500' : 'bg-amber-400'
                              }`}
                              style={{ width: `${matchMetrics.percentage}%` }}
                            />
                          </div>
                        </div>

                        {/* Possessed and Missing Lists */}
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-[11px]">
                          <div>
                            <span className="text-[9px] uppercase font-bold text-emerald-600 block mb-0.5">Hai in dispensa:</span>
                            {matchMetrics.matched.length > 0 ? (
                              <p className="text-slate-600 font-medium line-clamp-1">{matchMetrics.matched.join(', ')}</p>
                            ) : (
                              <span className="text-slate-400 italic">Nessuno tracciato</span>
                            )}
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-bold text-amber-600 block mb-0.5">Ti manca da acquistare:</span>
                            {matchMetrics.missing.length > 0 ? (
                              <p className="text-amber-700 font-extrabold line-clamp-1">{matchMetrics.missing.join(', ')}</p>
                            ) : (
                              <span className="text-emerald-600 font-bold">Nessuno di rilevante! Ricetta a costo zero 🎉</span>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-50 flex justify-end">
                          <button
                            onClick={() => setSelectedRecipe(recipe)}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
                          >
                            Vedi preparazione e dosi →
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {matchedRecipesList.length === 0 && (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      Nessuna ricetta corrisponde ai filtri di ricerca impostati.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected Suggested Recipe Details Modal popup */}
      <AnimatePresence>
        {selectedRecipe && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRecipe(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[90vh]"
            >
              <div className="h-48 bg-indigo-600 flex items-center justify-center relative p-8 text-center text-white">
                <button 
                  onClick={() => setSelectedRecipe(null)}
                  className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 p-2 rounded-full text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{selectedRecipe.title}</h3>
                  <div className="flex items-center justify-center gap-4 text-indigo-100 text-sm">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {selectedRecipe.timeMin} min</span>
                    <span className="flex items-center gap-1 uppercase font-bold tracking-widest text-[10px]"><Gauge className="w-4 h-4" /> {selectedRecipe.difficulty}</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
                <div className="flex flex-wrap gap-2">
                  {selectedRecipe.hasCarbs && (
                    <span className="px-2 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold uppercase rounded border border-amber-100">Carboidrati</span>
                  )}
                  {selectedRecipe.hasProtein && (
                    <span className="px-2 py-1 bg-red-50 text-red-700 text-[10px] font-bold uppercase rounded border border-red-100">Proteine</span>
                  )}
                  {selectedRecipe.hasVeg && (
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase rounded border border-emerald-100">Verdure</span>
                  )}
                </div>

                {/* Nutritional Information panel */}
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-indigo-600" />
                      Porzioni
                    </h4>
                    <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg p-1">
                      <button 
                        onClick={() => setTargetServings(Math.max(1, targetServings - 1))}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-100 text-indigo-600 font-bold cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-bold text-slate-700">{targetServings}</span>
                      <button 
                        onClick={() => setTargetServings(targetServings + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-100 text-indigo-600 font-bold cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  {(() => {
                    const n = selectedRecipe.nutrients || calculateNutrients(selectedRecipe.ingredients);
                    const ratio = targetServings / (selectedRecipe.servings || 2);
                    return (
                      <div className="grid grid-cols-4 gap-2">
                        <div className="text-center p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                          <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Calorie</div>
                          <div className="text-sm font-bold text-slate-800">{Math.round(n.calories * ratio)}</div>
                          <div className="text-[9px] text-slate-400">kcal</div>
                        </div>
                        <div className="text-center p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                          <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Proteine</div>
                          <div className="text-sm font-bold text-red-600">{Math.round(n.protein * ratio)}g</div>
                        </div>
                        <div className="text-center p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                          <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Carbo</div>
                          <div className="text-sm font-bold text-amber-600">{Math.round(n.carbs * ratio)}g</div>
                        </div>
                        <div className="text-center p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                          <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Grassi</div>
                          <div className="text-sm font-bold text-indigo-600">{Math.round(n.fat * ratio)}g</div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                    <UtensilsCrossed className="w-5 h-5 text-indigo-600" />
                    Ingredienti Richiesti (Confrontati col tuo inventario)
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedRecipe.ingredients.map((ing, idx) => {
                      const scaledAmount = scaleIngredientAmount(ing.amount, selectedRecipe.servings || 2, targetServings);
                      
                      // Check matching to display a visual indicator next to each ingredient
                      const isStapleIng = isStaple(ing.name);
                      const isDirectMatch = items.some(p => p.quantity > 0 && checkIngredientMatch(p.name, ing.name));
                      const raws = getRawIngredientNames(ing.name);
                      const isRawMatch = raws.length > 0 && raws.some(rawIng => 
                        items.some(p => p.quantity > 0 && checkIngredientMatch(p.name, rawIng))
                      );
                      const hasIngredient = isStapleIng || isDirectMatch || isRawMatch;

                      return (
                        <li 
                          key={idx} 
                          className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                            hasIngredient 
                              ? 'bg-emerald-50/70 border-emerald-100 text-slate-800' 
                              : 'bg-amber-50/20 border-slate-100 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {hasIngredient ? (
                              <span className="text-emerald-600 font-bold">✓</span>
                            ) : (
                              <span className="text-amber-500 font-bold">○</span>
                            )}
                            <span className={`font-semibold text-xs ${hasIngredient ? 'text-emerald-900' : 'text-slate-700'}`}>
                              {ing.name}
                            </span>
                          </div>
                          <span className="text-indigo-600 font-bold text-xs bg-white border border-slate-100 rounded px-2 py-0.5">
                            {scaledAmount > 0 ? `${scaledAmount} ${ing.unit}` : ing.unit}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                    <ChefHat className="w-5 h-5 text-indigo-600" />
                    Preparazione
                  </h4>
                  <div className="space-y-4">
                    {selectedRecipe.instructions.map((step, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                          {idx + 1}
                        </div>
                        <p className="text-slate-600 leading-relaxed text-sm pt-0.5">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedRecipe.seasoningTips && (
                  <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-2xl flex gap-3">
                    <div className="bg-indigo-100 p-2 rounded-lg h-fit">
                      <Info className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-indigo-900 uppercase tracking-wide">Condimento Bilanciato Suggerito</h5>
                      <p className="text-xs text-indigo-700 mt-1 italic">
                        {selectedRecipe.seasoningTips}
                      </p>
                    </div>
                  </div>
                )}

                {/* Cook recipe and subtract ingredients button/form */}
                <div className="pt-4 border-t border-slate-100">
                  {cookingSuccessMessage ? (
                    <div className="p-5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-xs font-semibold">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>{cookingSuccessMessage}</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleCookRecipe}
                      disabled={isConsuming}
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-2xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ChefHat className="w-5 h-5" />
                      {isConsuming ? "Preparazione in corso..." : "Cucina questo piatto (Scala ingredienti della dispensa)"}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
