import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';
import { PantryItem, Recipe, UserProfile } from '../types';
import { INITIAL_RECIPES } from '../data/recipes';
import { getRawIngredientNames, scaleIngredientAmount } from '../lib/utils';
import { calculateNutrients } from '../lib/nutritionUtils';
import { limitsFor } from '../lib/plans';
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
  const [visibleSuggestions, setVisibleSuggestions] = useState(6);

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

    if (items.length >= limitsFor(profile?.plan).maxPantryItems) {
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
      <div>
        <h2 className="text-3xl font-semibold text-slate-900">La dispensa</h2>
        <p className="text-slate-600 mt-1">Cosa hai in casa, per non sprecare nulla.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left pane: Pantry Stock Manager */}
        <div className="xl:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 bg-slate-50/70">
              {Number.isFinite(limitsFor(profile?.plan).maxPantryItems) && (
                <p className="mb-3 text-sm text-slate-500">
                  {items.length} di {limitsFor(profile?.plan).maxPantryItems} prodotti (piano gratuito)
                </p>
              )}

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Cosa aggiungi? (es. zucchine)"
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
                    Il piano gratuito consente fino a 20 prodotti. Con il piano Famiglia o Chef IA la dispensa è illimitata.
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

        {/* Cosa posso cucinare con quello che ho */}
        <div className="xl:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-2xl font-semibold text-slate-900">Cosa posso cucinare?</h3>
              <p className="text-sm text-slate-500 mt-1">Piatti che usano ciò che hai già in dispensa.</p>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-10 rounded-2xl bg-slate-50">
                <ChefHat className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 max-w-xs mx-auto">Aggiungi qualche prodotto e ti suggeriamo cosa cucinare.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex bg-slate-100 p-1 rounded-2xl" role="group" aria-label="Quanto manca per cucinarli">
                  {[
                    { id: 'all', label: 'Tutti' },
                    { id: 'ready', label: 'Hai tutto' },
                    { id: 'almost', label: 'Manca poco' }
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => { setMatchFilter(btn.id as any); setVisibleSuggestions(6); }}
                      aria-pressed={matchFilter === btn.id}
                      className={`flex-1 h-10 rounded-xl text-sm font-semibold transition-all ${
                        matchFilter === btn.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                  {matchedRecipesList.slice(0, visibleSuggestions).map(({ recipe, matchMetrics }) => {
                    const isReady = matchMetrics.missing.length === 0;
                    return (
                      <button
                        key={recipe.id}
                        onClick={() => setSelectedRecipe(recipe)}
                        className="w-full text-left px-4 py-4 active:bg-slate-50 flex items-center gap-3"
                      >
                        <span className="flex-1 min-w-0">
                          <span className="block font-semibold text-slate-900 leading-snug">{recipe.title}</span>
                          <span className={`block text-sm mt-0.5 ${isReady ? 'text-emerald-700 font-semibold' : 'text-amber-700'}`}>
                            {isReady
                              ? 'Hai tutto, cucinalo subito'
                              : `Ti manca: ${matchMetrics.missing.slice(0, 2).join(', ')}${matchMetrics.missing.length > 2 ? ` e altri ${matchMetrics.missing.length - 2}` : ''}`}
                          </span>
                        </span>
                        <span className="shrink-0 text-xs font-bold text-slate-500 bg-slate-100 rounded-full px-2.5 py-1">
                          {matchMetrics.matchCount}/{matchMetrics.totalTracked}
                        </span>
                      </button>
                    );
                  })}
                  {matchedRecipesList.length === 0 && (
                    <p className="text-center py-10 text-slate-500 px-4">Nessun piatto per ora: prova ad aggiungere altri prodotti.</p>
                  )}
                </div>

                {matchedRecipesList.length > visibleSuggestions && (
                  <button
                    onClick={() => setVisibleSuggestions(n => n + 6)}
                    className="w-full h-12 rounded-2xl border border-slate-200 text-slate-700 font-semibold"
                  >
                    Mostra altri ({matchedRecipesList.length - visibleSuggestions})
                  </button>
                )}

                {onNavigateToPlanner && (
                  <button
                    onClick={onNavigateToPlanner}
                    className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    Crea il menù con questi prodotti
                  </button>
                )}
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
