import React, { useState, useEffect } from 'react';
import { INITIAL_RECIPES } from '../data/recipes';
import { Recipe, PantryItem } from '../types';
import { db } from '../lib/firebase';
import { collection, addDoc, query, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';
import { calculateNutrients } from '../lib/nutritionUtils';
import { Search, ChefHat, Clock, Gauge, X, UtensilsCrossed, Info, Plus, Trash2, Heart, Users, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import RecipeForm from './RecipeForm';
import { scaleIngredientAmount, getRawIngredientNames } from '../lib/utils';
import { checkIngredientMatch, isStaple, consumeIngredientsFromPantry } from '../lib/pantrySync';
import { FamilyMember } from '../types';

interface Props {
  userId: string;
  voiceSearchQuery?: string;
  setVoiceSearchQuery?: (q: string) => void;
}

export default function RecipeList({ userId, voiceSearchQuery, setVoiceSearchQuery }: Props) {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (voiceSearchQuery !== undefined) {
      setSearchTerm(voiceSearchQuery);
    }
  }, [voiceSearchQuery]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dietaryFilter, setDietaryFilter] = useState<string[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [customRecipes, setCustomRecipes] = useState<Recipe[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [familyCount, setFamilyCount] = useState(2);
  const [targetServings, setTargetServings] = useState(2);

  const [cookingSuccessMessage, setCookingSuccessMessage] = useState<string | null>(null);
  const [isConsuming, setIsConsuming] = useState(false);

  useEffect(() => {
    setCookingSuccessMessage(null);
  }, [selectedRecipe]);

  useEffect(() => {
    if (userId === 'demo-family-user' || userId.startsWith('local-')) {
      const savedFavs = localStorage.getItem(`favs_${userId}`);
      if (savedFavs) {
        try { setFavorites(JSON.parse(savedFavs)); } catch (e) {}
      }
      return;
    }
    const path = `users/${userId}/favorites`;
    const q = query(collection(db, path));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.id);
      setFavorites(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
    return () => unsubscribe();
  }, [userId]);

  useEffect(() => {
    if (userId === 'demo-family-user' || userId.startsWith('local-')) {
      const savedPantry = localStorage.getItem(`pantry_${userId}`);
      if (savedPantry) {
        try { setPantryItems(JSON.parse(savedPantry)); } catch (e) {}
      }
      return;
    }
    const path = `users/${userId}/pantry`;
    const q = query(collection(db, path));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PantryItem));
      setPantryItems(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
    return () => unsubscribe();
  }, [userId]);

  useEffect(() => {
    if (userId === 'demo-family-user' || userId.startsWith('local-')) {
      setFamilyCount(4);
      setTargetServings(4);
      return;
    }
    const membersPath = `users/${userId}/familyMembers`;
    const q = query(collection(db, membersPath));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const count = snapshot.docs.length || 2;
      setFamilyCount(count);
      setTargetServings(count);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, membersPath);
    });
    return () => unsubscribe();
  }, [userId]);

  useEffect(() => {
    if (userId === 'demo-family-user' || userId.startsWith('local-')) {
      const savedCustom = localStorage.getItem(`customRecipes_${userId}`);
      if (savedCustom) {
        try { setCustomRecipes(JSON.parse(savedCustom)); } catch (e) {}
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

  const allRecipes = [...INITIAL_RECIPES, ...customRecipes];

  const filteredRecipes = allRecipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         recipe.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesCategory = false;
    if (categoryFilter === 'all') {
      matchesCategory = true;
    } else if (categoryFilter === 'favorites') {
      matchesCategory = favorites.includes(recipe.id);
    } else if (categoryFilter === 'primi') {
      matchesCategory = recipe.category === 'lunch';
    } else if (categoryFilter === 'secondi') {
      matchesCategory = recipe.category === 'dinner';
    } else {
      matchesCategory = recipe.category === categoryFilter;
    }

    const matchesDietary = dietaryFilter.length === 0 || dietaryFilter.every(diet => {
      if (diet === 'vegetarian') {
        return recipe.tags.includes('vegan') || recipe.tags.includes('vegetarian') || recipe.proteinType === 'veg' || recipe.proteinType === 'cheese' || recipe.proteinType === 'eggs' || recipe.proteinType === 'legumes';
      }
      return recipe.tags.includes(diet);
    });
    
    return matchesSearch && matchesCategory && matchesDietary;
  });

  const handleSaveCustomRecipe = async (recipeData: Omit<Recipe, 'id'>) => {
    if (userId === 'demo-family-user' || userId.startsWith('local-')) {
      const newRec = { ...recipeData, id: 'custom-' + Date.now() };
      const updated = [...customRecipes, newRec];
      setCustomRecipes(updated);
      localStorage.setItem(`customRecipes_${userId}`, JSON.stringify(updated));
      setShowAddForm(false);
      return;
    }
    const path = `users/${userId}/customRecipes`;
    try {
      await addDoc(collection(db, path), recipeData);
      setShowAddForm(false);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    }
  };

  const handleDeleteRecipe = async (e: React.MouseEvent, recipeId: string) => {
    e.stopPropagation();
    if (!window.confirm('Sei sicuro di voler eliminare questa ricetta?')) return;

    if (userId === 'demo-family-user' || userId.startsWith('local-')) {
      const updated = customRecipes.filter(r => r.id !== recipeId);
      setCustomRecipes(updated);
      localStorage.setItem(`customRecipes_${userId}`, JSON.stringify(updated));
      return;
    }

    const path = `users/${userId}/customRecipes/${recipeId}`;
    try {
      await deleteDoc(doc(db, `users/${userId}/customRecipes`, recipeId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const handleCookRecipe = async () => {
    if (!selectedRecipe) return;
    setIsConsuming(true);
    setCookingSuccessMessage(null);
    try {
      const results = await consumeIngredientsFromPantry(userId, selectedRecipe, targetServings);
      const consumedList = results
        .filter(r => r.status !== 'not_found')
        .map(r => `${r.pantryItemName} (${r.amountConsumed} ${r.unit})`)
        .join(', ');
      
      if (consumedList) {
        setCookingSuccessMessage(`Complimenti! Hai preparato questo piatto. I seguenti ingredienti sono stati dettratti dalla dispensa: ${consumedList}. Buon appetito! 👩‍🍳`);
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

  const isCustom = (recipeId: string) => customRecipes.some(r => r.id === recipeId);

  const toggleFavorite = async (e: React.MouseEvent, recipeId: string) => {
    e.stopPropagation();
    const isFav = favorites.includes(recipeId);
    if (userId === 'demo-family-user' || userId.startsWith('local-')) {
      const updated = isFav ? favorites.filter(id => id !== recipeId) : [...favorites, recipeId];
      setFavorites(updated);
      localStorage.setItem(`favs_${userId}`, JSON.stringify(updated));
      return;
    }
    const path = `users/${userId}/favorites/${recipeId}`;
    try {
      if (isFav) {
        await deleteDoc(doc(db, `users/${userId}/favorites`, recipeId));
      } else {
        const { setDoc } = await import('firebase/firestore');
        await setDoc(doc(db, `users/${userId}/favorites`, recipeId), {
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Le Ricette</h2>
          <p className="text-slate-500">Esplora piatti sani e aggiungi le tue creazioni.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold hover:bg-indigo-700 transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Aggiungi Nuova Ricetta
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cerca ricette o tag (es. vegan)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {[
              { id: 'all', label: 'Tutte' },
              { id: 'favorites', label: 'Preferiti ❤️' },
              { id: 'primi', label: 'Primi Piatti' },
              { id: 'secondi', label: 'Secondi Piatti' },
              { id: 'dessert', label: 'Dolci' },
              { id: 'side', label: 'Contorni' },
              { id: 'fast', label: 'Veloci' }
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => setCategoryFilter(filter.id)}
                className={`px-4 py-2 rounded-xl border text-sm font-medium whitespace-nowrap transition-all ${
                  categoryFilter === filter.id
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="h-6 w-[1px] bg-slate-200 hidden md:block" />

          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {[
              { id: 'gluten-free', label: 'Senza Glutine' },
              { id: 'lactose-free', label: 'Senza Lattosio' },
              { id: 'vegan', label: 'Vegan' },
              { id: 'vegetarian', label: 'Vegetariano' }
            ].map(diet => {
              const isActive = dietaryFilter.includes(diet.id);
              return (
                <button
                  key={diet.id}
                  onClick={() => {
                    if (isActive) {
                      setDietaryFilter(dietaryFilter.filter(d => d !== diet.id));
                    } else {
                      setDietaryFilter([...dietaryFilter, diet.id]);
                    }
                  }}
                  className={`px-4 py-2 rounded-xl border text-sm font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {diet.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map(recipe => (
          <div key={recipe.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all group relative">
            {isCustom(recipe.id) && (
              <div className="absolute top-3 left-3 z-10 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
                <ChefHat size={10} />
                Tua Ricetta
              </div>
            )}
            <button 
              onClick={(e) => toggleFavorite(e, recipe.id)}
              className={`absolute top-3 z-10 p-2 rounded-full shadow-sm transition-all cursor-pointer ${
                isCustom(recipe.id) ? 'right-12' : 'right-3'
              } ${
                favorites.includes(recipe.id)
                  ? 'bg-rose-500 text-white hover:bg-rose-600 scale-105'
                  : 'bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-rose-50'
              }`}
              title={favorites.includes(recipe.id) ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
            >
              <Heart className={`w-3.5 h-3.5 ${favorites.includes(recipe.id) ? 'fill-current' : ''}`} />
            </button>
            {isCustom(recipe.id) && (
              <button 
                onClick={(e) => handleDeleteRecipe(e, recipe.id)}
                className="absolute top-3 right-3 z-10 bg-white/90 hover:bg-red-50 p-2 rounded-full text-slate-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 shadow-sm cursor-pointer"
                title="Elimina ricetta"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <div className="h-32 bg-slate-100 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
              <ChefHat className="w-12 h-12 text-slate-300 group-hover:text-indigo-200 transition-colors" />
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-2 mb-3">
                {recipe.tags.map(tag => (
                  <span key={tag} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    {tag}
                  </span>
                ))}
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 group-hover:text-indigo-600 transition-colors line-clamp-1 pr-8">
                {recipe.title}
              </h3>
              
              <div className="flex items-center justify-between text-slate-500 text-sm mb-6">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{recipe.timeMin} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <Gauge className="w-4 h-4" />
                  <span className="capitalize">{recipe.difficulty}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">
                  {recipe.category === 'lunch' ? 'Primo' : 
                   recipe.category === 'dinner' ? 'Secondo' : 
                   recipe.category === 'dessert' ? 'Dolce' : 
                   recipe.category === 'side' ? 'Contorno' :
                   recipe.category === 'fast' ? 'Veloce' :
                   recipe.category}
                </span>
                <button 
                  onClick={() => setSelectedRecipe(recipe)}
                  className="text-indigo-600 text-sm font-bold hover:underline"
                >
                  Vedi Ricetta
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredRecipes.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
          <p className="text-slate-400">Nessuna ricetta trovata con questi filtri.</p>
        </div>
      )}

      {/* Recipe Modal */}
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
              <div className="h-48 bg-indigo-600 flex items-center justify-center relative p-8 text-center">
                <button 
                  onClick={() => setSelectedRecipe(null)}
                  className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 p-2 rounded-full text-white transition-colors"
                >
                  <X className="w-6 h-6" />
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

                {/* Nutritional Information Section */}
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-indigo-600" />
                      Porzioni
                    </h4>
                    <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg p-1">
                      <button 
                        onClick={() => setTargetServings(Math.max(1, targetServings - 1))}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-100 text-indigo-600 font-bold"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-bold text-slate-700">{targetServings}</span>
                      <button 
                        onClick={() => setTargetServings(targetServings + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-100 text-indigo-600 font-bold"
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
                        <div className="text-center p-2 bg-white rounded-lg shadow-sm border border-slate-50">
                          <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Calorie</div>
                          <div className="text-sm font-bold text-slate-800">{Math.round(n.calories * ratio)}</div>
                          <div className="text-[9px] text-slate-400">kcal</div>
                        </div>
                        <div className="text-center p-2 bg-white rounded-lg shadow-sm border border-slate-50">
                          <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Proteine</div>
                          <div className="text-sm font-bold text-red-600">{Math.round(n.protein * ratio)}g</div>
                        </div>
                        <div className="text-center p-2 bg-white rounded-lg shadow-sm border border-slate-50">
                          <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Carbo</div>
                          <div className="text-sm font-bold text-amber-600">{Math.round(n.carbs * ratio)}g</div>
                        </div>
                        <div className="text-center p-2 bg-white rounded-lg shadow-sm border border-slate-50">
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
                      const isDirectMatch = pantryItems.some(p => p.quantity > 0 && checkIngredientMatch(p.name, ing.name));
                      const raws = getRawIngredientNames(ing.name);
                      const isRawMatch = raws.length > 0 && raws.some(rawIng => 
                        pantryItems.some(p => p.quantity > 0 && checkIngredientMatch(p.name, rawIng))
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
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                          {idx + 1}
                        </div>
                        <p className="text-slate-600 leading-relaxed pt-1">{step}</p>
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
                      <h5 className="text-sm font-bold text-indigo-900 uppercase tracking-wide">Condimento Bilanciato Suggerito</h5>
                      <p className="text-sm text-indigo-700 mt-1 italic">
                        {selectedRecipe.seasoningTips}
                      </p>
                    </div>
                  </div>
                )}

                {selectedRecipe.isWHOCompliant && (
                  <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex gap-3">
                    <div className="bg-green-100 p-2 rounded-lg h-fit">
                      <ChefHat className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-green-900">Approvato OMS</h5>
                      <p className="text-xs text-green-700 mt-1">
                        Questa ricetta segue le linee guida per una dieta sana e bilanciata, favorendo nutrienti essenziali e cotture leggere.
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
      
      {/* Add Custom Recipe Form Modal */}
      <AnimatePresence>
        {showAddForm && (
          <RecipeForm 
            onSave={handleSaveCustomRecipe} 
            onClose={() => setShowAddForm(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
