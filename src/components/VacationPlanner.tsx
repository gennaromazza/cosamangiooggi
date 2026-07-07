import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';
import { Recipe, PantryItem } from '../types';
import { INITIAL_RECIPES } from '../data/recipes';
import { Sun, Umbrella, Palmtree, Sparkles, RefreshCw, ShoppingCart, Clock, Utensils, Check, ChefHat, Heart, Info, ArrowRight, ShieldCheck, ThermometerSnowflake } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  userId: string;
  onNavigateToShopping?: () => void;
}

const DAYS = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];

export default function VacationPlanner({ userId, onNavigateToShopping }: Props) {
  const [recipes, setRecipes] = useState<Recipe[]>(INITIAL_RECIPES);
  const [vacationPlan, setVacationPlan] = useState<{ [day: string]: { lunchId: string; dinnerId: string } } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string>('Lunedì');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [targetServings, setTargetServings] = useState<number>(2);
  const [onlyNoCook, setOnlyNoCook] = useState<boolean>(false);
  const [addedToCartSuccess, setAddedToCartSuccess] = useState(false);

  // Load custom user recipes from Firestore along with INITIAL_RECIPES
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const customPath = `users/${userId}/customRecipes`;
        const snapshot = await getDocs(collection(db, customPath));
        const userRecipes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe));
        
        // Merge without duplicates
        const existingIds = new Set(INITIAL_RECIPES.map(r => r.id));
        const merged = [...INITIAL_RECIPES];
        userRecipes.forEach(ur => {
          if (!existingIds.has(ur.id)) merged.push(ur);
        });
        setRecipes(merged);
      } catch (err) {
        console.error("Error loading recipes for vacation planner:", err);
      }
    };

    loadData();
  }, [userId]);

  // Load existing vacation plan from Firestore
  useEffect(() => {
    if (!userId) return;
    const planRef = doc(db, 'users', userId, 'vacationPlan', 'current');
    const unsub = onSnapshot(planRef, (snap) => {
      if (snap.exists()) {
        setVacationPlan(snap.data().days || null);
      } else {
        // If no plan exists, auto generate initial one
        generateVacationPlan(false);
      }
      setLoading(false);
    }, (err) => {
      console.error("Error loading vacation plan:", err);
      setLoading(false);
    });

    return () => unsub();
  }, [userId, recipes]);

  // Filter recipes suitable for beach lunch (takeaway, cold, make-ahead)
  const beachLunchRecipes = useMemo(() => {
    return recipes.filter(r => {
      const isBeachTag = r.tags?.some(t => t.toLowerCase() === 'beach' || t.toLowerCase() === 'cold' || t.toLowerCase() === 'make-ahead');
      const isTakeaway = r.category === 'takeaway' || r.category === 'cold';
      const titleLower = r.title.toLowerCase();
      const isColdKeyword = titleLower.includes('insalata') || titleLower.includes('fredd') || titleLower.includes('couscous') || titleLower.includes('farro') || titleLower.includes('wrap') || titleLower.includes('torta salata') || titleLower.includes('frittata');
      return isBeachTag || isTakeaway || isColdKeyword;
    });
  }, [recipes]);

  // Filter recipes suitable for post-beach dinner (fast, <= 20 mins, 0 stress)
  const beachDinnerRecipes = useMemo(() => {
    return recipes.filter(r => {
      if (onlyNoCook) {
        return r.timeMin <= 10 || r.tags?.includes('fast') || r.title.toLowerCase().includes('carpaccio') || r.title.toLowerCase().includes('caprese') || r.title.toLowerCase().includes('prosciutto');
      }
      const isFast = r.category === 'fast' || r.timeMin <= 20;
      const isBeachDinner = r.tags?.includes('beach') || r.tags?.includes('fast');
      return isFast || isBeachDinner;
    });
  }, [recipes, onlyNoCook]);

  const generateVacationPlan = async (forceSave = true) => {
    if (beachLunchRecipes.length === 0 || beachDinnerRecipes.length === 0) return;
    setIsGenerating(true);

    const newPlan: { [day: string]: { lunchId: string; dinnerId: string } } = {};
    const usedLunches = new Set<string>();
    const usedDinners = new Set<string>();

    DAYS.forEach(day => {
      // Pick lunch
      let availableLunches = beachLunchRecipes.filter(r => !usedLunches.has(r.id));
      if (availableLunches.length === 0) {
        usedLunches.clear();
        availableLunches = beachLunchRecipes;
      }
      const randomLunch = availableLunches[Math.floor(Math.random() * availableLunches.length)];
      usedLunches.add(randomLunch.id);

      // Pick dinner
      let availableDinners = beachDinnerRecipes.filter(r => !usedDinners.has(r.id));
      if (availableDinners.length === 0) {
        usedDinners.clear();
        availableDinners = beachDinnerRecipes;
      }
      const randomDinner = availableDinners[Math.floor(Math.random() * availableDinners.length)];
      usedDinners.add(randomDinner.id);

      newPlan[day] = {
        lunchId: randomLunch.id,
        dinnerId: randomDinner.id
      };
    });

    setVacationPlan(newPlan);
    setIsGenerating(false);

    if (forceSave && userId) {
      try {
        await setDoc(doc(db, 'users', userId, 'vacationPlan', 'current'), {
          updatedAt: new Date().toISOString(),
          days: newPlan
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'users/vacationPlan');
      }
    }
  };

  const regenerateSingleMeal = async (day: string, type: 'lunch' | 'dinner') => {
    if (!vacationPlan) return;
    const pool = type === 'lunch' ? beachLunchRecipes : beachDinnerRecipes;
    const currentId = type === 'lunch' ? vacationPlan[day].lunchId : vacationPlan[day].dinnerId;
    
    let available = pool.filter(r => r.id !== currentId);
    if (available.length === 0) available = pool;
    const nextRecipe = available[Math.floor(Math.random() * available.length)];

    const updatedPlan = {
      ...vacationPlan,
      [day]: {
        ...vacationPlan[day],
        [type === 'lunch' ? 'lunchId' : 'dinnerId']: nextRecipe.id
      }
    };

    setVacationPlan(updatedPlan);
    if (userId) {
      try {
        await setDoc(doc(db, 'users', userId, 'vacationPlan', 'current'), {
          updatedAt: new Date().toISOString(),
          days: updatedPlan
        });
      } catch (err) {
        console.error("Error updating meal:", err);
      }
    }
  };

  const handleAddAllToShoppingList = async () => {
    if (!vacationPlan || !userId) return;
    
    // Collect ingredients for all days
    const itemsToAdd = new Map<string, { amount: number; unit: string }>();

    Object.values(vacationPlan).forEach((day: { lunchId: string; dinnerId: string }) => {
      [day.lunchId, day.dinnerId].forEach(id => {
        const r = recipes.find(rec => rec.id === id);
        if (r) {
          const ratio = targetServings / (r.servings || 2);
          r.ingredients.forEach(ing => {
            const key = ing.name.toLowerCase().trim();
            const current = itemsToAdd.get(key) || { amount: 0, unit: ing.unit };
            itemsToAdd.set(key, { amount: current.amount + (ing.amount * ratio), unit: ing.unit });
          });
        }
      });
    });

    try {
      const voiceListRef = collection(db, 'users', userId, 'voiceShoppingItems');
      const shoppingListRef = collection(db, 'users', userId, 'shoppingList');
      for (const [name, data] of itemsToAdd.entries()) {
        const cleanId = name.replace(/[\/.\#\$\[\]]/g, '_');
        const cleanName = name.charAt(0).toUpperCase() + name.slice(1);
        const calcAmount = Math.round(data.amount * 10) / 10 || 1;
        
        await setDoc(doc(voiceListRef, cleanId), {
          name: cleanName,
          amount: calcAmount,
          unit: data.unit,
          needed: true,
          createdAt: new Date().toISOString()
        }, { merge: true });

        await setDoc(doc(shoppingListRef, cleanId), {
          name: cleanName,
          amount: calcAmount,
          unit: data.unit,
          category: 'Vacanze & Spiaggia',
          purchased: false,
          addedAt: new Date().toISOString()
        }, { merge: true });
      }

      setAddedToCartSuccess(true);
      setTimeout(() => setAddedToCartSuccess(false), 4000);
    } catch (err) {
      console.error("Error adding to shopping list:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  const currentLunch = vacationPlan ? recipes.find(r => r.id === vacationPlan[selectedDay]?.lunchId) : null;
  const currentDinner = vacationPlan ? recipes.find(r => r.id === vacationPlan[selectedDay]?.dinnerId) : null;

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
              <Sun className="w-3.5 h-3.5 text-yellow-300" /> Speciale Estate & Spiaggia
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Menù Vacanze 0-Stress
            </h1>
            <p className="text-amber-100 text-sm sm:text-base leading-relaxed">
              Dimentica lo stress del mare: <strong>Pranzi al sacco</strong> da preparare la sera prima o al mattino e conservare freschi nella borsa frigo, abbinati a <strong>Cene lampo in 10-15 min</strong> al rientro dall'ombrellone!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => generateVacationPlan(true)}
              disabled={isGenerating}
              className="px-6 py-3.5 bg-white text-orange-600 font-extrabold rounded-2xl shadow-lg hover:bg-orange-50 transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Sparkles className={`w-5 h-5 text-amber-500 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>Genera Menù Vacanza</span>
            </button>
          </div>
        </div>

        {/* Quick Filter Bar */}
        <div className="mt-6 pt-6 border-t border-white/20 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-white/90">Porzioni per la spiaggia:</span>
            <div className="flex bg-white/20 rounded-xl p-1 backdrop-blur-xs">
              {[2, 4, 6].map(num => (
                <button
                  key={num}
                  onClick={() => setTargetServings(num)}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    targetServings === num ? 'bg-white text-orange-600 shadow-xs' : 'text-white hover:bg-white/10'
                  }`}
                >
                  {num} pers.
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none bg-white/15 px-3.5 py-1.5 rounded-xl hover:bg-white/25 transition-all">
            <input
              type="checkbox"
              checked={onlyNoCook}
              onChange={(e) => {
                setOnlyNoCook(e.target.checked);
                setTimeout(() => generateVacationPlan(true), 100);
              }}
              className="rounded text-orange-600 focus:ring-0 w-4 h-4"
            />
            <span className="font-bold text-white">Solo cene senza fornelli (0 cottura post-mare)</span>
          </label>
        </div>
      </div>

      {/* Cooler Box Tip Banner */}
      <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-100 rounded-2xl p-4 flex items-start gap-4">
        <div className="p-2.5 bg-sky-500 text-white rounded-xl shrink-0 mt-0.5 shadow-xs">
          <ThermometerSnowflake className="w-5 h-5" />
        </div>
        <div className="text-xs text-sky-900 space-y-1">
          <h4 className="font-extrabold text-sm">Consiglio del Nutrizionista per la Borsa Frigo</h4>
          <p className="leading-relaxed">
            Per mantenere intatti sapori e sicurezza alimentare sotto l'ombrellone: <strong>1)</strong> Prepara insalate di riso, pasta o farro la sera prima e tienile in frigo a 4°C tutta la notte; <strong>2)</strong> Posiziona 2 siberini ghiacciati sul fondo e 1 in cima al contenitore; <strong>3)</strong> Evita maionese o uova crude e condisci con olio a crudo e limone prima di uscire.
          </p>
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
        {DAYS.map(day => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-5 py-3 rounded-2xl font-bold text-sm transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
              selectedDay === day
                ? 'bg-orange-600 text-white shadow-md scale-105'
                : 'bg-white text-slate-600 hover:bg-orange-50 border border-slate-200'
            }`}
          >
            <span>{day}</span>
          </button>
        ))}
      </div>

      {/* Day Meals Display */}
      {vacationPlan && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LUNCH CARD: SPIAGGIA */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full pointer-events-none -z-0"></div>
            
            <div className="space-y-4 z-10">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-extrabold tracking-wide">
                  🎒 PRANZO DA SPIAGGIA / AL SACCO
                </div>
                <button
                  onClick={() => regenerateSingleMeal(selectedDay, 'lunch')}
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-orange-600 transition-colors cursor-pointer"
                  title="Cambia piatto"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {currentLunch ? (
                <div className="space-y-3">
                  <h3 
                    onClick={() => setSelectedRecipe(currentLunch)}
                    className="text-xl font-extrabold text-slate-900 hover:text-orange-600 transition-colors cursor-pointer leading-snug"
                  >
                    {currentLunch.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-150 font-medium">
                      <Clock className="w-3.5 h-3.5 text-amber-500" /> Prep: {currentLunch.timeMin} min
                    </span>
                    <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg font-bold">
                      {currentLunch.proteinType === 'fish' ? '🐟 Ricco di Omega-3' : currentLunch.proteinType === 'veg' || currentLunch.proteinType === 'legumes' ? '🌱 Più Leggerezza' : '🍳 Proteine Nobili'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 bg-amber-50/60 p-3 rounded-xl border border-amber-100/80 leading-relaxed font-medium">
                    {currentLunch.seasoningTips || '💡 Ideale da preparare la sera prima o al mattino presto. Mantiene croccantezza e freschezza dentro la borsa termica.'}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-400">Nessuna ricetta selezionata</p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between z-10">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Per {targetServings} persone
              </span>
              {currentLunch && (
                <button
                  onClick={() => setSelectedRecipe(currentLunch)}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>Leggi Ricetta e Ingredienti</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* DINNER CARD: POST-MARE */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full pointer-events-none -z-0"></div>
            
            <div className="space-y-4 z-10">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-extrabold tracking-wide">
                  🌅 CENA RELAX POST-MARE
                </div>
                <button
                  onClick={() => regenerateSingleMeal(selectedDay, 'dinner')}
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-orange-600 transition-colors cursor-pointer"
                  title="Cambia piatto"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {currentDinner ? (
                <div className="space-y-3">
                  <h3 
                    onClick={() => setSelectedRecipe(currentDinner)}
                    className="text-xl font-extrabold text-slate-900 hover:text-orange-600 transition-colors cursor-pointer leading-snug"
                  >
                    {currentDinner.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-150 font-medium">
                      <Clock className="w-3.5 h-3.5 text-orange-500" /> Pronto in: {currentDinner.timeMin} min
                    </span>
                    <span className="bg-rose-50 text-rose-700 px-2.5 py-1 rounded-lg font-bold">
                      ⚡ 0 Stress / Facilissimo
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 bg-orange-50/60 p-3 rounded-xl border border-orange-100/80 leading-relaxed font-medium">
                    {currentDinner.seasoningTips || '🌅 Cena espressa che reintegra sali minerali e idratazione dopo una giornata di sole e mare.'}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-400">Nessuna ricetta selezionata</p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between z-10">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Per {targetServings} persone
              </span>
              {currentDinner && (
                <button
                  onClick={() => setSelectedRecipe(currentDinner)}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>Leggi Ricetta e Ingredienti</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Bar for Week Shopping */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-lg sm:text-xl font-extrabold flex items-center justify-center md:justify-start gap-2">
            <ShoppingCart className="w-6 h-6 text-orange-400" />
            <span>Spesa Unica per Tutta la Settimana al Mare</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
            Esporta con un clic tutti gli ingredienti necessari per i 7 giorni (ricalcolati per {targetServings} persone) direttamente nella tua Lista della Spesa in app.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button
            onClick={handleAddAllToShoppingList}
            className={`px-6 py-4 rounded-2xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
              addedToCartSuccess
                ? 'bg-emerald-500 text-white'
                : 'bg-orange-500 hover:bg-orange-600 text-white active:scale-95'
            }`}
          >
            {addedToCartSuccess ? (
              <>
                <Check className="w-5 h-5" />
                <span>Aggiunto alla Spesa!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                <span>Invia a Lista Spesa ({targetServings} pers.)</span>
              </>
            )}
          </button>
          {onNavigateToShopping && (
            <button
              onClick={onNavigateToShopping}
              className="px-5 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-sm transition-all cursor-pointer"
            >
              Apri Lista Spesa
            </button>
          )}
        </div>
      </div>

      {/* Full Recipe Modal */}
      <AnimatePresence>
        {selectedRecipe && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6"
            >
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-bold mb-2 uppercase tracking-wide">
                    {selectedRecipe.category === 'takeaway' || selectedRecipe.category === 'cold' ? '🎒 Piatto da Spiaggia / Borsa Frigo' : '🌅 Cena Lampo Post-Mare'}
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 leading-tight">
                    {selectedRecipe.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Ingredients */}
              <div className="space-y-3">
                <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                  <span>Ingredienti per {targetServings} persone</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-150">
                  {selectedRecipe.ingredients.map((ing, i) => {
                    const ratio = targetServings / (selectedRecipe.servings || 2);
                    const calcAmount = Math.round(ing.amount * ratio * 10) / 10;
                    return (
                      <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-slate-200/50 last:border-0">
                        <span className="font-medium text-slate-700">{ing.name}</span>
                        <span className="font-extrabold text-orange-600 ml-2">
                          {calcAmount > 0 ? `${calcAmount} ${ing.unit}` : ing.unit}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-3">
                <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                  <span>Preparazione</span>
                </h3>
                <ol className="space-y-3">
                  {selectedRecipe.instructions.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                      <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {selectedRecipe.seasoningTips && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 leading-relaxed font-medium">
                  <strong>💡 Consiglio per il Mare / Servizio:</strong> {selectedRecipe.seasoningTips}
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-all cursor-pointer"
                >
                  Chiudi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
