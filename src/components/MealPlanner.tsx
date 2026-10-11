import { useState, useEffect, useMemo, useRef } from 'react';
import MemberAlternatives from './MemberAlternatives';
import { pickAlternatives, planMeals } from '../lib/memberAlternatives';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, setDoc, doc, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';
import { WeeklyPlan, Recipe, UserProfile, DietaryRestriction, PantryItem, DayPlan } from '../types';
import { INITIAL_RECIPES } from '../data/recipes';
import { calculateNutrients } from '../lib/nutritionUtils';
import { Calendar as CalendarIcon, RefreshCcw, Save, Trash2, ChevronLeft, ChevronRight, X, Clock, Gauge, UtensilsCrossed, ChefHat, Info, Tag, Sparkles, Users, Heart, ShoppingCart, Check, AlertTriangle, Package, SlidersHorizontal } from 'lucide-react';
import { getCurrentSeason, scaleIngredientAmount, getRawIngredientNames } from '../lib/utils';
import { checkIngredientMatch, isStaple, calculateMissingFromPantry } from '../lib/pantrySync';
import { hitsExclusion, satisfiesDiet } from '../lib/dietFilters';
import TipCard from './TipCard';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  userId: string;
  onNavigateToShopping?: () => void;
  onNavigateToFamily?: () => void;
  onNavigateToPantry?: () => void;
}

const DAYS = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];

export default function MealPlanner({ userId, onNavigateToShopping, onNavigateToFamily, onNavigateToPantry }: Props) {
  const [currentPlan, setCurrentPlan] = useState<WeeklyPlan | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>(INITIAL_RECIPES);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [targetServings, setTargetServings] = useState(2);
  // Le porzioni partono dalle persone a tavola (come la lista della spesa), finché non le cambi a mano
  const [servingsTouched, setServingsTouched] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  useEffect(() => {
    if (!servingsTouched && familyMembers.length > 0) setTargetServings(familyMembers.length);
  }, [familyMembers.length, servingsTouched]);
  const season = getCurrentSeason();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [showNoFamilyModal, setShowNoFamilyModal] = useState(false);
  const [showPantryPromptModal, setShowPantryPromptModal] = useState(false);
  const [hasSkippedPantryPrompt, setHasSkippedPantryPrompt] = useState(false);
  const [swappingMeal, setSwappingMeal] = useState<{ day: string, type: 'lunch' | 'dinner', recipe: Recipe } | null>(null);

  const [activeDay, setActiveDay] = useState<string>(() => {
    const dayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday ...
    const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
    return DAYS[adjustedIndex] || 'Lunedì';
  });

  const goToPrevDay = () => {
    const currentIndex = DAYS.indexOf(activeDay);
    const prevIndex = (currentIndex - 1 + DAYS.length) % DAYS.length;
    setActiveDay(DAYS[prevIndex]);
  };

  const goToNextDay = () => {
    const currentIndex = DAYS.indexOf(activeDay);
    const nextIndex = (currentIndex + 1) % DAYS.length;
    setActiveDay(DAYS[nextIndex]);
  };

  const seasonNames = {
    spring: 'Primavera',
    summer: 'Estate',
    autumn: 'Autunno',
    winter: 'Inverno'
  };

  const seasonTips = {
    spring: 'Asparagi, carciofi, piselli, fragole e agrumi tardivi.',
    summer: 'Pomodori, zucchine, melanzane, pesche e albicocche.',
    autumn: 'Zucca, funghi, castagne, broccoli e pere.',
    winter: 'Finocchi, cavoli, arance, kiwi e legumi secchi.'
  };

  const [isGenerating, setIsGenerating] = useState(false);
  const [excludeVeganAlternatives, setExcludeVeganAlternatives] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [useOnlyFavorites, setUseOnlyFavorites] = useState(false);

  const missingIngredientsInfo = useMemo(() => {
    if (!currentPlan || !recipes || recipes.length === 0) return { count: 0, items: [] };

    const rawRequirements: { name: string; amount: number; unit: string }[] = [];
    
    // Chi ha un'alternativa mangia quella: si compra per le porzioni reali di ogni piatto
    planMeals(currentPlan, targetServings).forEach(({ recipeId, people }) => {
      const recipe = recipes.find(r => r.id === recipeId);
      if (!recipe) return;
      const ratio = people / (recipe.servings || 2);
      recipe.ingredients.forEach(ing => {
        if (isStaple(ing.name)) return;
        getRawIngredientNames(ing.name).forEach(name => {
          if (isStaple(name)) return;
          rawRequirements.push({ name, amount: ing.amount * ratio, unit: ing.unit });
        });
      });
    });

    const list = calculateMissingFromPantry(rawRequirements, pantryItems);

    return {
      count: list.length,
      items: list
    };
  }, [currentPlan, recipes, pantryItems, targetServings]);

  const planHasMeals = useMemo(() => {
    if (!currentPlan) return false;
    return Object.values(currentPlan.days).some((day: any) => 
      (day.lunchIds && day.lunchIds.length > 0) || (day.dinnerIds && day.dinnerIds.length > 0)
    );
  }, [currentPlan]);

  // Hash of missing ingredients to detect changes
  const missingItemsHash = useMemo(() => {
    if (!missingIngredientsInfo || missingIngredientsInfo.count === 0) return '';
    return missingIngredientsInfo.items.map(i => `${i.name}:${Math.round(i.amount)}`).join('|');
  }, [missingIngredientsInfo]);

  // Read dismissal from localStorage
  const [dismissedHash, setDismissedHash] = useState<string>(() => {
    try {
      return localStorage.getItem(`dismissed_missing_warning_${userId}`) || '';
    } catch {
      return '';
    }
  });

  const isMissingBannerDismissed = dismissedHash === missingItemsHash;

  const handleDismissBanner = () => {
    try {
      localStorage.setItem(`dismissed_missing_warning_${userId}`, missingItemsHash);
    } catch (e) {
      console.error(e);
    }
    setDismissedHash(missingItemsHash);
  };

  useEffect(() => {
    const isLocal = userId === 'demo-family-user' || userId.startsWith('local-');
    if (isLocal) {
      const loadLocalData = () => {
        const savedPlan = localStorage.getItem(`mealPlan_${userId}`);
        if (savedPlan) {
          try { setCurrentPlan(JSON.parse(savedPlan)); } catch (e) {}
        }
        const savedCustom = localStorage.getItem(`customRecipes_${userId}`);
        if (savedCustom) {
          try { setRecipes([...INITIAL_RECIPES, ...JSON.parse(savedCustom)]); } catch (e) {}
        }
        const savedPantry = localStorage.getItem(`pantry_${userId}`);
        if (savedPantry) {
          try { setPantryItems(JSON.parse(savedPantry)); } catch (e) {}
        } else {
          setPantryItems([
            { id: '1', name: 'Spaghetti', quantity: 2, unit: 'pz', category: 'Pasta e Cereali' },
            { id: '2', name: 'Passata di pomodoro', quantity: 3, unit: 'pz', category: 'Conservati' },
            { id: '3', name: 'Zucchine', quantity: 500, unit: 'g', category: 'Ortofrutta' },
            { id: '4', name: 'Uova', quantity: 6, unit: 'pz', category: 'Latticini e Uova' },
            { id: '5', name: 'Parmigiano Reggiano', quantity: 200, unit: 'g', category: 'Latticini e Uova' }
          ]);
        }
        const savedMembers = localStorage.getItem(`members_${userId}`);
        if (savedMembers) {
          try {
            const m = JSON.parse(savedMembers);
            setFamilyMembers(m);
            if (m.length > 0) setTargetServings(m.length);
          } catch (e) {}
        }
        const savedFavs = localStorage.getItem(`favorites_${userId}`);
        if (savedFavs) {
          try { setFavorites(JSON.parse(savedFavs)); } catch (e) {}
        }
      };
      loadLocalData();
      window.addEventListener('storage', loadLocalData);
      setLoading(false);
      return () => window.removeEventListener('storage', loadLocalData);
    }

    // Listen to the current meal plan for the user
    const planPath = `users/${userId}/mealPlans/current`;
    const unsubPlan = onSnapshot(doc(db, planPath), (snapshot) => {
      if (snapshot.exists()) {
        setCurrentPlan({ id: snapshot.id, ...snapshot.data() } as WeeklyPlan);
      } else {
        setCurrentPlan(null);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, planPath);
    });

    // Listen to custom recipes
    const customPath = `users/${userId}/customRecipes`;
    const qCustom = query(collection(db, customPath));
    const unsubCustom = onSnapshot(qCustom, (snapshot) => {
      const customData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe));
      setRecipes([...INITIAL_RECIPES, ...customData]);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, customPath);
    });

    // Listen to profile
    const profilePath = `users/${userId}`;
    const unsubProfile = onSnapshot(doc(db, profilePath), (snapshot) => {
      if (snapshot.exists()) {
        setProfile({ id: snapshot.id, ...snapshot.data() } as UserProfile);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, profilePath);
      setLoading(false);
    });

    // Listen to family members
    const membersPath = `users/${userId}/familyMembers`;
    const qMembers = query(collection(db, membersPath));
    const unsubMembers = onSnapshot(qMembers, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFamilyMembers(data);
      if (data.length > 0) {
        setTargetServings(data.length);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, membersPath);
    });

    // Listen to pantry
    const pantryPath = `users/${userId}/pantry`;
    const unsubPantry = onSnapshot(collection(db, pantryPath), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PantryItem));
      setPantryItems(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, pantryPath);
    });

    // Listen to favorites
    const favoritesPath = `users/${userId}/favorites`;
    const qFavorites = query(collection(db, favoritesPath));
    const unsubFavorites = onSnapshot(qFavorites, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.id);
      setFavorites(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, favoritesPath);
    });

    return () => {
      unsubPlan();
      unsubCustom();
      unsubProfile();
      unsubMembers();
      unsubPantry();
      unsubFavorites();
    };
  }, [userId]);

  const generatePlan = async (forceSkipPantryCheck = false, forceSkipFamilyCheck = false) => {
    if (familyMembers.length === 0 && !forceSkipFamilyCheck) {
      setShowNoFamilyModal(true);
      return;
    }
    if (pantryItems.length === 0 && !forceSkipPantryCheck && !hasSkippedPantryPrompt) {
      setShowPantryPromptModal(true);
      return;
    }
    setIsGenerating(true);
    const newPlan: WeeklyPlan = {
      id: 'current',
      startDate: new Date().toISOString(),
      generatedWithoutFamily: familyMembers.length === 0 || forceSkipFamilyCheck,
      days: {}
    };

    // Filter recipes by season and global dietary restrictions
    // If a recipe is explicitly marked as favorite, bypass season restriction so the user can always plan their favorite dishes
    let availableRecipes = recipes.filter(r => r.season === season || r.season === 'all' || favorites.includes(r.id));
    
    // Feature: Exclude vegan dishes/alternatives entirely
    if (excludeVeganAlternatives) {
      availableRecipes = availableRecipes.filter(r => {
        const titleLower = r.title.toLowerCase();
        const isVeganAlternative = titleLower.includes('vegano') || 
                                   titleLower.includes('vegana') || 
                                   titleLower.includes('vegan') ||
                                   r.ingredients.some(ing => {
                                     const nameLower = ing.name.toLowerCase();
                                     return nameLower.includes('tofu') || nameLower.includes('seitan') || nameLower.includes('tempeh');
                                   });
        return !isVeganAlternative;
      });
    }
    
    let activeRestrictions = profile?.dietaryRestrictions || [];
    if (excludeVeganAlternatives) {
      // If we are strictly excluding vegan alternatives, skip conflicts with vegan dietary restrictions
      activeRestrictions = activeRestrictions.filter(r => r !== 'vegan');
    }

    if (activeRestrictions.length > 0) {
      availableRecipes = availableRecipes.filter(r => {
        const tags = r.tags || [];
        // A recipe must satisfy ALL global restrictions
        return activeRestrictions.every(restriction => {
          if (restriction === 'vegan') return tags.includes('vegan') || tags.includes('vegan-friendly');
          if (restriction === 'lactose-free') return tags.includes('lactose-free');
          if (restriction === 'gluten-free') return tags.includes('gluten-free');
          return true;
        });
      });
    }

    // ALLERGIE e ingredienti esclusi dal profilo: vincoli rigidi, non si rilassano mai
    // (la sicurezza viene prima della varietà del menù).
    const hardExclusions = profile?.excludedIngredients || [];
    if (hardExclusions.length > 0) {
      availableRecipes = availableRecipes.filter(r => !hitsExclusion(r, hardExclusions));
    }
    if (availableRecipes.length === 0) {
      setIsGenerating(false);
      alert('Con le restrizioni e le allergie impostate non ci sono ricette adatte in questa stagione. Controlla l\'elenco nella sezione Famiglia.');
      return;
    }

    // Gusti dei membri (piatti e ingredienti non graditi): preferenze, si possono rilassare se restano troppe poche ricette
    const dislikedMealIds = new Set<string>(
      familyMembers.flatMap(member => (member.dislikedMeals || []))
    );
    const softExclusions = familyMembers.flatMap(member => (member.dislikedIngredients || []));

    let filteredRecipesWithExclusions = availableRecipes;
    if (dislikedMealIds.size > 0 || softExclusions.length > 0) {
      filteredRecipesWithExclusions = availableRecipes.filter(recipe =>
        !dislikedMealIds.has(recipe.id) && !hitsExclusion(recipe, softExclusions)
      );
    }

    // Se le preferenze lasciano troppe poche ricette le rilassiamo, ma solo quelle (mai le allergie)
    if (filteredRecipesWithExclusions.length >= 10) {
      availableRecipes = filteredRecipesWithExclusions;
    } else {
      console.warn("Available recipes pool too small due to preferences. Relaxing ingredient dislikes (allergies stay enforced).");
      availableRecipes = availableRecipes.filter(r => !dislikedMealIds.has(r.id));
    }

    // Protein requirements based on WHO Pyramid proportions (Total 14 meals/week)
    const requirements: Record<string, number> = {
      'legumes': 5,      // Regular (Every day/High priority)
      'fish': 2,         // Moderation (2-3/week)
      'white-meat': 2,   // Moderation (2-3/week)
      'eggs': 2,         // Moderation (2-3/week)
      'cheese': 2,       // Regular (Moderate/Daily)
      'red-meat': 1      // Occasional (Max 1/week)
    };

    const usedRecipeIds = new Set<string>();
    const usedTitles = new Set<string>();

    // PRE-ASSIGN FAVORITES: To guarantee favorites are in the weekly plan,
    // pre-populate empty slots with the user's available favorite dishes first.
    const preAssigned: Record<string, { lunch?: Recipe; dinner?: Recipe }> = {};
    DAYS.forEach(day => {
      preAssigned[day] = {};
    });

    const availableFavs = availableRecipes.filter(r => favorites.includes(r.id) && r.category !== 'side' && r.category !== 'dessert');
    const shuffledFavs = [...availableFavs].sort(() => Math.random() - 0.5);

    shuffledFavs.forEach(fav => {
      const isDinnerIdeal = fav.category === 'dinner';
      const firstChoice = isDinnerIdeal ? 'dinner' : 'lunch';
      const secondChoice = isDinnerIdeal ? 'lunch' : 'dinner';
      
      let assigned = false;
      const shuffledDays = [...DAYS].sort(() => Math.random() - 0.5);
      
      for (const day of shuffledDays) {
        if (!preAssigned[day][firstChoice]) {
          preAssigned[day][firstChoice] = fav;
          usedRecipeIds.add(fav.id);
          usedTitles.add(fav.title.toLowerCase());
          assigned = true;
          break;
        }
      }
      
      if (!assigned) {
        for (const day of shuffledDays) {
          if (!preAssigned[day][secondChoice]) {
            preAssigned[day][secondChoice] = fav;
            usedRecipeIds.add(fav.id);
            usedTitles.add(fav.title.toLowerCase());
            assigned = true;
            break;
          }
        }
      }
    });

    // Count assigned protein types to subtract them from requirements
    const assignedCounts: Record<string, number> = {};
    let totalEmptySlots = 0;
    DAYS.forEach(day => {
      if (preAssigned[day].lunch) {
        const pType = preAssigned[day].lunch!.proteinType;
        if (pType) assignedCounts[pType] = (assignedCounts[pType] || 0) + 1;
      } else {
        totalEmptySlots++;
      }
      if (preAssigned[day].dinner) {
        const pType = preAssigned[day].dinner!.proteinType;
        if (pType) assignedCounts[pType] = (assignedCounts[pType] || 0) + 1;
      } else {
        totalEmptySlots++;
      }
    });

    // Filter requirements based on actual availability in availableRecipes
    const availableProteinTypes = new Set<string>(availableRecipes.map(r => r.proteinType).filter((t): t is string => !!t));
    const finalRequirements: Record<string, number> = {};
    let missingSlots = 0;

    Object.entries(requirements).forEach(([type, count]) => {
      if (availableProteinTypes.has(type)) {
        const assigned = assignedCounts[type] || 0;
        finalRequirements[type] = Math.max(0, count - assigned);
      } else {
        finalRequirements[type] = 0;
      }
    });

    // Calculate sum of remaining requirements
    const currentPoolSum = Object.values(finalRequirements).reduce((a, b) => a + b, 0);
    missingSlots = totalEmptySlots - currentPoolSum;

    // Adjust the pool size to match exactly the number of empty slots
    if (missingSlots > 0) {
      const priorityRedistribution = ['legumes', 'white-meat', 'eggs', 'cheese', 'red-meat', 'fish'];
      while (missingSlots > 0) {
        for (const type of priorityRedistribution) {
          if (availableProteinTypes.has(type) && missingSlots > 0) {
            finalRequirements[type] = (finalRequirements[type] || 0) + 1;
            missingSlots--;
          }
        }
        if (!priorityRedistribution.some(t => availableProteinTypes.has(t))) break;
      }
    }

    // Group requirements into a list and shuffle
    let remainingProteinPool: string[] = [];
    Object.entries(finalRequirements).forEach(([type, count]) => {
      for (let i = 0; i < count; i++) {
        remainingProteinPool.push(type);
      }
    });

    // Truncate or pad remainingProteinPool to match totalEmptySlots exactly
    if (remainingProteinPool.length > totalEmptySlots) {
      remainingProteinPool = remainingProteinPool.slice(0, totalEmptySlots);
    } else {
      const fillPriority = ['legumes', 'white-meat', 'eggs', 'cheese', 'red-meat', 'fish'];
      const actualFillTypes = fillPriority.filter(type => availableProteinTypes.has(type));
      const finalFillTypes = actualFillTypes.length > 0 ? actualFillTypes : Array.from(availableProteinTypes);

      if (finalFillTypes.length > 0) {
        while (remainingProteinPool.length < totalEmptySlots) {
          for (const type of finalFillTypes) {
            if (remainingProteinPool.length < totalEmptySlots) {
              remainingProteinPool.push(type);
            }
          }
        }
      } else {
        // Ultimate fallback if no protein types are available in database
        while (remainingProteinPool.length < totalEmptySlots) {
          remainingProteinPool.push('legumes');
        }
      }
    }

    // Strategy: Distribute proteins to avoid repeats if possible
    remainingProteinPool.sort(() => Math.random() - 0.5);
    for (let i = 0; i < remainingProteinPool.length - 1; i++) {
      if (remainingProteinPool[i] === remainingProteinPool[i+1]) {
        for (let j = i + 2; j < remainingProteinPool.length; j++) {
          if (remainingProteinPool[j] !== remainingProteinPool[i]) {
            [remainingProteinPool[i+1], remainingProteinPool[j]] = [remainingProteinPool[j], remainingProteinPool[i+1]];
            break;
          }
        }
      }
    }

    // Feature: Scoring based on family likes
    const familyLikes = Array.from(new Set<string>(
      familyMembers.flatMap(member => (member.likedIngredients || []))
    )).map(ing => ing.toLowerCase());

    const getRecipesForType = (type: string, categoryPreference?: string, currentExclusions?: Set<string>) => {
      let pool = availableRecipes.filter(r => 
        r.proteinType === type && 
        r.category !== 'side' && 
        r.category !== 'dessert'
      );
      
      const filteredPool = pool.filter(r => 
        !usedRecipeIds.has(r.id) && 
        !usedTitles.has(r.title.toLowerCase())
      );
      
      if (useOnlyFavorites) {
        // Find unused favorite recipes matching this protein type first
        const favPool = filteredPool.filter(r => favorites.includes(r.id));
        if (favPool.length > 0) {
          pool = favPool;
        } else {
          // Fallback 1: Allow reusing favorites matching this protein type
          const reuseFavPool = pool.filter(r => favorites.includes(r.id));
          if (reuseFavPool.length > 0) {
            pool = reuseFavPool;
          } else {
            // Fallback 2: Search for ANY unused favorite recipe that fits the category (lunch/dinner)
            const categoryToSearch = categoryPreference === 'dinner' ? 'dinner' : 'lunch';
            const anyUnusedFavs = availableRecipes.filter(r => 
              favorites.includes(r.id) && 
              !usedRecipeIds.has(r.id) && 
              !usedTitles.has(r.title.toLowerCase()) &&
              (r.category === categoryToSearch || r.category === 'lunch' || r.category === 'dinner' || r.category === 'fast')
            );
            if (anyUnusedFavs.length > 0) {
              pool = anyUnusedFavs;
            } else {
              // Fallback 3: Search for ANY favorite matching category (allow reuse)
              const anyFavs = availableRecipes.filter(r => 
                favorites.includes(r.id) && 
                (r.category === categoryToSearch || r.category === 'lunch' || r.category === 'dinner' || r.category === 'fast')
              );
              if (anyFavs.length > 0) {
                pool = anyFavs;
              }
            }
          }
        }
      } else {
        // If useOnlyFavorites is false, we STILL want to prioritize unused favorite recipes of this protein type!
        const favsMatchingType = filteredPool.filter(r => favorites.includes(r.id));
        if (favsMatchingType.length > 0) {
          pool = favsMatchingType;
        } else {
          pool = filteredPool;
        }
      }
      
      // If we are strictly excluding ingredients (for day-to-day variety), attempt to filter
      if (currentExclusions && currentExclusions.size > 0) {
        const filteredPoolWithExclusions = pool.filter(recipe => {
          return !recipe.ingredients.some(ing => {
            const rawName = ing.name.toLowerCase();
            return Array.from(currentExclusions).some(ex => rawName.includes(ex.toLowerCase()));
          });
        });
        if (filteredPoolWithExclusions.length > 0) pool = filteredPoolWithExclusions;
      }

      if (categoryPreference === 'cold') {
        const coldPool = pool.filter(r => r.category === 'cold');
        if (coldPool.length > 0) return coldPool;
      }
      if (categoryPreference === 'dinner') {
        const dinnerPool = pool.filter(r => r.category === 'dinner');
        if (dinnerPool.length > 0) return dinnerPool;
      }
      if (categoryPreference === 'lunch') {
        const lunchPool = pool.filter(r => r.category === 'lunch');
        if (lunchPool.length > 0) return lunchPool;
      }

      return pool;
    };

    const calculateRecipePriorityScore = (recipe: Recipe): number => {
      let score = 0;

      // 1. User Custom Dish Priority (dishes entered textually by the user get highest baseline priority)
      const isCustomRecipe = recipe.id.startsWith('custom-') || !INITIAL_RECIPES.some(init => init.id === recipe.id);
      if (isCustomRecipe) {
        score += 50;
      }

      // 2. Family Liked Meals Priority (dishes explicitly selected by family members)
      const isFamilyLikedMeal = familyMembers.some(member => member.likedMeals?.includes(recipe.id));
      if (isFamilyLikedMeal) {
        score += 40;
      }

      // 3. User Favorite Dish Priority
      if (favorites.includes(recipe.id)) {
        score += 30;
      }

      // 4. Dispensa (Pantry) Matching Priority - optimizes dispensing & spending by using what is stored
      if (pantryItems && pantryItems.length > 0) {
        let matchedPantryCount = 0;
        recipe.ingredients.forEach(ing => {
          if (isStaple(ing.name)) return;
          const matchesPantry = pantryItems.some(pItem => checkIngredientMatch(pItem.name, ing.name));
          if (matchesPantry) matchedPantryCount++;
        });
        score += matchedPantryCount * 25;
      }

      // 5. Family Liked Ingredients Matching (stemmed textual matching of user-typed ingredients)
      const familyLikedIngs = familyMembers.flatMap(member => (member.likedIngredients || []));
      if (familyLikedIngs.length > 0) {
        let matchedLikedCount = 0;
        recipe.ingredients.forEach(ing => {
          const matchesLike = familyLikedIngs.some(likedIng => checkIngredientMatch(likedIng, ing.name));
          if (matchesLike) matchedLikedCount++;
        });
        score += matchedLikedCount * 15;
      }

      // 6. Supermarket Offers Matching - optimizes spending ("spesa")
      if (profile?.currentOffers && profile.currentOffers.length > 0) {
        let matchedOffersCount = 0;
        recipe.ingredients.forEach(ing => {
          const matchesOffer = profile.currentOffers!.some(offer => checkIngredientMatch(offer, ing.name));
          if (matchesOffer) matchedOffersCount++;
        });
        score += matchedOffersCount * 15;
      }

      // 7. WHO Compliance bonus
      if (recipe.isWHOCompliant) {
        score += 10;
      }

      return score;
    };

    const pickRandom = (pool: Recipe[]) => {
      if (!pool || pool.length === 0) return undefined as any;
      if (pool.length === 1) return pool[0];

      const scored = pool.map(recipe => ({
        recipe,
        score: calculateRecipePriorityScore(recipe)
      }));

      // Sort descending by priority score
      scored.sort((a, b) => b.score - a.score);

      const maxScore = scored[0].score;
      // Select from top-tier candidates (within 15 points of top score) to maintain healthy variety
      const topCandidates = scored.filter(item => item.score >= maxScore - 15);
      return topCandidates[Math.floor(Math.random() * topCandidates.length)].recipe;
    };

    // Track side dish titles separately if needed, but adding to global usedTitles is safer
    const completeMeal = (main?: Recipe, excludedIngredients?: Set<string>) => {
      if (!main) return [];
      const mealIds = [main.id];
      
      // Balance Carbs
      if (!main.hasCarbs) {
        let pool = availableRecipes.filter(r => 
          r.category === 'side' && 
          r.hasCarbs && 
          !r.hasProtein && 
          !usedRecipeIds.has(r.id) &&
          !usedTitles.has(r.title.toLowerCase())
        );
        
        // Exclude specific ingredients if requested
        if (excludedIngredients && excludedIngredients.size > 0) {
          const filtered = pool.filter(r => !r.ingredients.some(ing => 
            Array.from(excludedIngredients).some(ex => ing.name.toLowerCase().includes(ex.toLowerCase()))
          ));
          if (filtered.length > 0) pool = filtered;
        }

        // NOVELTY: If there are current offers, prioritize side dishes that contain them
        if (profile?.currentOffers && profile.currentOffers.length > 0) {
          const matchingOffers = pool.filter(r => {
            return r.ingredients.some(ing => 
              profile.currentOffers!.some(offer => {
                const cleanIng = ing.name.toLowerCase().trim();
                const cleanOffer = offer.toLowerCase().trim();
                return cleanIng.includes(cleanOffer) || cleanOffer.includes(cleanIng);
              })
            );
          });
          if (matchingOffers.length > 0) pool = matchingOffers;
        }

        const breadIds = ['side-8', 'side-9', 'side-10', 'side-11', 'side-12'];
        if (pool.length === 0) {
          pool = availableRecipes.filter(r => breadIds.includes(r.id) && !usedRecipeIds.has(r.id));
        }

        if (pool.length === 0) {
          // Absolute fallback
          pool = availableRecipes.filter(r => r.category === 'side' && r.hasCarbs);
        }
        
        const carbToAdd = pickRandom(pool);
        if (carbToAdd) {
          mealIds.push(carbToAdd.id);
          usedRecipeIds.add(carbToAdd.id);
          usedTitles.add(carbToAdd.title.toLowerCase());
        }
      }

      // Balance Veg
      if (!main.hasVeg) {
        let pool = availableRecipes.filter(r => 
          r.category === 'side' && 
          r.hasVeg && 
          !r.hasProtein && 
          !usedRecipeIds.has(r.id) &&
          !usedTitles.has(r.title.toLowerCase())
        );
        
        // Exclude specific ingredients if requested
        if (excludedIngredients && excludedIngredients.size > 0) {
          const filtered = pool.filter(r => !r.ingredients.some(ing => 
            Array.from(excludedIngredients).some(ex => ing.name.toLowerCase().includes(ex.toLowerCase()))
          ));
          if (filtered.length > 0) pool = filtered;
        }

        // NOVELTY: If there are current offers, prioritize side dishes that contain them
        if (profile?.currentOffers && profile.currentOffers.length > 0) {
          const matchingOffers = pool.filter(r => {
            return r.ingredients.some(ing => 
              profile.currentOffers!.some(offer => {
                const cleanIng = ing.name.toLowerCase().trim();
                const cleanOffer = offer.toLowerCase().trim();
                return cleanIng.includes(cleanOffer) || cleanOffer.includes(cleanIng);
              })
            );
          });
          if (matchingOffers.length > 0) pool = matchingOffers;
        }
        
        if (pool.length === 0) {
          // Secondary fallback: allow protein sides if needed for veg
          pool = availableRecipes.filter(r => 
            r.category === 'side' && 
            r.hasVeg && 
            !usedRecipeIds.has(r.id) &&
            !usedTitles.has(r.title.toLowerCase())
          );
        }

        if (pool.length === 0) {
          // Final fallback
          pool = availableRecipes.filter(r => r.category === 'side' && r.hasVeg);
        }

        const vegToAdd = pickRandom(pool);
        if (vegToAdd && !mealIds.includes(vegToAdd.id)) {
          mealIds.push(vegToAdd.id);
          usedRecipeIds.add(vegToAdd.id);
          usedTitles.add(vegToAdd.title.toLowerCase());
        }
      }

      return mealIds;
    };

    let prevDayIngredients = new Set<string>();
    let remainingPoolIndex = 0;
    // Alternative già date a ciascuno nella settimana (per non ripeterle)
    const usedAlternatives = new Map<string, Set<string>>();
    const findRecipes = (ids: string[]) =>
      ids.map(id => recipes.find(r => r.id === id)).filter((r): r is Recipe => !!r);

    DAYS.forEach((day, index) => {
      // Current day ingredients to track and avoid for the NEXT day
      const currentDayIngredients = new Set<string>();

      // Lunch
      let lunchMain = preAssigned[day].lunch;
      if (!lunchMain) {
        const lunchType = remainingProteinPool[remainingPoolIndex++];
        const lunchPool = getRecipesForType(lunchType, Math.random() > 0.5 ? 'cold' : 'lunch', prevDayIngredients);
        lunchMain = pickRandom(lunchPool);
      }
      
      // Absolute fallback if lunch recipe cannot be found
      if (!lunchMain) {
        const generalPool = availableRecipes.filter(r => r.category !== 'side' && r.category !== 'dessert');
        lunchMain = pickRandom(generalPool);
      }
      
      if (lunchMain) {
        usedRecipeIds.add(lunchMain.id);
        usedTitles.add(lunchMain.title.toLowerCase());
        lunchMain.ingredients.slice(0, 3).forEach(i => {
          const mainPart = i.name.split(' ')[0].toLowerCase();
          if (mainPart.length > 3) currentDayIngredients.add(mainPart);
        });
      }
      const lunchIds = completeMeal(lunchMain, prevDayIngredients);

      // Dinner
      let dinnerMain = preAssigned[day].dinner;
      if (!dinnerMain) {
        const dinnerType = remainingProteinPool[remainingPoolIndex++];
        const combinedExclusions = new Set([...prevDayIngredients, ...currentDayIngredients]);
        let dinnerPool = getRecipesForType(dinnerType, 'dinner', combinedExclusions);
        dinnerMain = pickRandom(dinnerPool);
      }

      // Absolute fallback if dinner recipe cannot be found
      if (!dinnerMain) {
        const generalPool = availableRecipes.filter(r => r.category !== 'side' && r.category !== 'dessert' && r.id !== lunchMain?.id);
        dinnerMain = pickRandom(generalPool) || lunchMain;
      }
      
      if (dinnerMain) {
        usedRecipeIds.add(dinnerMain.id);
        usedTitles.add(dinnerMain.title.toLowerCase());
        dinnerMain.ingredients.slice(0, 3).forEach(i => {
          const mainPart = i.name.split(' ')[0].toLowerCase();
          if (mainPart.length > 3) currentDayIngredients.add(mainPart);
        });
      }
      const dinnerIds = completeMeal(dinnerMain, new Set([...prevDayIngredients, ...currentDayIngredients]));

      // Chi ha una dieta o un'allergia personale riceve un piatto alternativo quando quello di tutti non va bene
      const lunchAlt = pickAlternatives({ mains: findRecipes(lunchIds), members: familyMembers, pool: availableRecipes, used: usedAlternatives });
      const dinnerAlt = pickAlternatives({ mains: findRecipes(dinnerIds), members: familyMembers, pool: availableRecipes, used: usedAlternatives });
      newPlan.days[day] = {
        lunchIds,
        dinnerIds,
        ...(Object.keys(lunchAlt).length > 0 ? { lunchAlt } : {}),
        ...(Object.keys(dinnerAlt).length > 0 ? { dinnerAlt } : {}),
      };

      // Set for next iteration
      prevDayIngredients = currentDayIngredients;
    });

    await savePlan(newPlan);
    setIsGenerating(false);
  };

  const savePlan = async (plan: WeeklyPlan) => {
    if (userId === 'demo-family-user' || userId.startsWith('local-')) {
      localStorage.setItem(`mealPlan_${userId}`, JSON.stringify(plan));
      setCurrentPlan(plan);
      return;
    }
    const path = `users/${userId}/mealPlans`;
    try {
      await setDoc(doc(db, path, 'current'), plan);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const isOfferMatch = (recipe: Recipe) => {
    if (!profile?.currentOffers || profile.currentOffers.length === 0) return false;
    return recipe.ingredients.some(ing => 
      profile.currentOffers!.some(offer => checkIngredientMatch(offer, ing.name))
    );
  };

  const isFamilyFavorite = (recipe: Recipe) => {
    if (familyMembers.length === 0) return false;
    let hasLikedMeal = false;
    const familyLikedIngs = familyMembers.flatMap(m => m.likedIngredients || []);
    familyMembers.forEach(member => {
      if (member.likedMeals?.includes(recipe.id)) hasLikedMeal = true;
    });
    if (hasLikedMeal) return true;
    return recipe.ingredients.some(ing => 
      familyLikedIngs.some(likedIng => checkIngredientMatch(likedIng, ing.name))
    );
  };

  const isUserFavorite = (recipe: Recipe) => {
    return favorites.includes(recipe.id);
  };

  const handleInitiateSwap = (day: string, type: 'lunch' | 'dinner', recipe: Recipe) => {
    setSwappingMeal({ day, type, recipe });
  };

  const handleExecuteSwap = async (targetRecipeId: string) => {
    if (!swappingMeal || !currentPlan) return;
    const { day, type } = swappingMeal;

    const newPlan = { ...currentPlan };
    const dayPlan = { ...newPlan.days[day] };

    // Con il piatto nuovo cambiano anche le alternative per chi ha esigenze personali
    const newMain = recipes.find(r => r.id === targetRecipeId);
    const altPool = recipes.filter(r =>
      (r.season === season || r.season === 'all' || favorites.includes(r.id)) &&
      satisfiesDiet(r, profile?.dietaryRestrictions || []) &&
      !hitsExclusion(r, profile?.excludedIngredients || [])
    );
    const newAlt = pickAlternatives({ mains: newMain ? [newMain] : [], members: familyMembers, pool: altPool });

    if (type === 'lunch') {
      dayPlan.lunchIds = [targetRecipeId];
      delete dayPlan.lunchAlt;
      if (Object.keys(newAlt).length > 0) dayPlan.lunchAlt = newAlt;
    } else {
      dayPlan.dinnerIds = [targetRecipeId];
      delete dayPlan.dinnerAlt;
      if (Object.keys(newAlt).length > 0) dayPlan.dinnerAlt = newAlt;
    }

    newPlan.days[day] = dayPlan;
    await savePlan(newPlan);
    setSwappingMeal(null);
  };

  const getAlternativeRecipes = (originalRecipe: Recipe): Recipe[] => {
    if (!originalRecipe) return [];
    
    // Find recipes that:
    // 1. Are of the same category if possible, or season-appropriate (season === currentSeason or 'all')
    // 2. Have the same proteinType (e.g. 'white-meat')
    // 3. Are NOT already used in the current weekly plan to avoid duplicates
    const currentScheduledIds = new Set<string>();
    if (currentPlan) {
      Object.values(currentPlan.days).forEach((dayPlan: any) => {
        if (dayPlan.lunchIds) dayPlan.lunchIds.forEach((id: string) => currentScheduledIds.add(id));
        if (dayPlan.dinnerIds) dayPlan.dinnerIds.forEach((id: string) => currentScheduledIds.add(id));
      });
    }

    // Filter available candidates
    const candidates = recipes.filter(r => {
      // Don't suggest the same recipe
      if (r.id === originalRecipe.id) return false;
      
      // Filter out recipes already in the plan
      if (currentScheduledIds.has(r.id)) return false;

      // Filter by season
      const isSeasonMatch = r.season === season || r.season === 'all';
      if (!isSeasonMatch) return false;

      // Una sostituzione non deve mai violare diete e allergie della famiglia
      if (!satisfiesDiet(r, profile?.dietaryRestrictions || [])) return false;
      if (hitsExclusion(r, profile?.excludedIngredients || [])) return false;

      // Filter out based on family disliked items if present
      const dislikedMeals = familyMembers.flatMap(member => member.dislikedMeals || []);
      const dislikedIngredients = familyMembers.flatMap(member => member.dislikedIngredients || []);
      if (dislikedMeals.includes(r.id)) return false;
      if (hitsExclusion(r, dislikedIngredients)) return false;

      return true;
    });

    // Score / rank candidates based on matching proteinType and proximity of macro nutrients
    const scored = candidates.map(r => {
      let score = 0;
      
      // 1. Exact proteinType match is huge
      if (r.proteinType && originalRecipe.proteinType && r.proteinType === originalRecipe.proteinType) {
        score += 100;
      } else if (r.proteinType === originalRecipe.proteinType) { // both undefined or same
        score += 50;
      }

      // 2. Proximity of protein value
      const origNutrients = originalRecipe.nutrients || calculateNutrients(originalRecipe.ingredients);
      const rNutrients = r.nutrients || calculateNutrients(r.ingredients);
      const proteinDiff = Math.abs(origNutrients.protein - rNutrients.protein);
      const calorieDiff = Math.abs(origNutrients.calories - rNutrients.calories);

      score += Math.max(0, 50 - proteinDiff * 2); // Closer protein gives more score
      score += Math.max(0, 50 - calorieDiff / 10); // Closer calories gives more score

      // 3. Offer matches get a bonus
      if (isOfferMatch(r)) {
        score += 20;
      }

      // 4. Favorites get a bonus
      if (favorites.includes(r.id)) {
        score += 15;
      }

      return { recipe: r, score };
    });

    // Sort by score descending and return the top 6
    return scored
      .sort((a, b) => b.score - a.score)
      .map(item => item.recipe)
      .slice(0, 6);
  };

  const generateNow = () => generatePlan(true, familyMembers.length === 0);

  // Dopo la guida iniziale il primo menù parte da solo: niente schermata vuota da interpretare
  const generateRef = useRef(generateNow);
  generateRef.current = generateNow;
  useEffect(() => {
    if (loading || currentPlan) return;
    let wanted = false;
    try {
      wanted = sessionStorage.getItem('auto_generate_plan') === '1';
    } catch {
      /* storage non disponibile */
    }
    if (!wanted) return;
    // Un attimo di margine perché arrivino persone e dispensa
    const timer = setTimeout(() => {
      try {
        sessionStorage.removeItem('auto_generate_plan');
      } catch {
        /* storage non disponibile */
      }
      generateRef.current();
    }, 900);
    return () => clearTimeout(timer);
  }, [loading, currentPlan]);

  return (
    <div className="space-y-5">
      {/* Intestazione: titolo, chi mangia, e due piccoli comandi */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-3xl font-semibold text-slate-900">Il menù della settimana</h2>
          {familyMembers.length > 0 ? (
            <p className="text-slate-600 mt-1">
              A tavola: <strong className="font-semibold text-slate-800">{familyMembers.map(m => m.name).join(', ')}</strong>
              {onNavigateToFamily && (
                <button onClick={onNavigateToFamily} className="ml-2 text-sm font-semibold text-indigo-600 underline underline-offset-4">
                  Modifica
                </button>
              )}
            </p>
          ) : (
            <p className="text-slate-600 mt-1">Pranzi e cene, pronti da cucinare.</p>
          )}
          {profile?.currentOffers && profile.currentOffers.length > 0 && (
            <p className="mt-1 text-sm font-semibold text-emerald-700 flex items-center gap-1.5">
              <Tag className="w-4 h-4" /> {profile.currentOffers.length} offerte del volantino nel menù
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {currentPlan && (
            <button
              onClick={generateNow}
              disabled={isGenerating}
              aria-label="Crea un nuovo menù"
              className="h-11 px-3.5 rounded-2xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCcw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Nuovo menù</span>
            </button>
          )}
          <button
            onClick={() => setShowOptions(o => !o)}
            aria-label="Opzioni del menù"
            aria-expanded={showOptions}
            className={`h-11 w-11 rounded-2xl border flex items-center justify-center ${
              showOptions ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-600'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Opzioni: nascoste finché non servono */}
      {showOptions && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1">
          <label className="flex items-center justify-between gap-4 py-2 cursor-pointer">
            <span className="text-sm font-medium text-slate-800">Senza piatti vegani</span>
            <input
              type="checkbox"
              checked={excludeVeganAlternatives}
              onChange={(e) => setExcludeVeganAlternatives(e.target.checked)}
              className="w-5 h-5 accent-indigo-600"
            />
          </label>
          {favorites.length > 0 && (
            <label className="flex items-center justify-between gap-4 py-2 cursor-pointer border-t border-slate-100">
              <span className="text-sm font-medium text-slate-800">Solo i miei preferiti ({favorites.length})</span>
              <input
                type="checkbox"
                checked={useOnlyFavorites}
                onChange={(e) => setUseOnlyFavorites(e.target.checked)}
                className="w-5 h-5 accent-indigo-600"
              />
            </label>
          )}
          <p className="text-xs text-slate-500 pt-2">Le opzioni valgono dal prossimo menù che crei.</p>
        </div>
      )}

      {!currentPlan ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-sm">
          <div className="w-20 h-20 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-5">
            <CalendarIcon className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-semibold text-slate-900">Cosa mangiamo questa settimana?</h3>
          <p className="text-slate-600 mt-2 max-w-xs mx-auto leading-relaxed">
            Con un tocco il menù è pronto. Poi puoi cambiare ogni piatto come preferisci.
          </p>
          <button
            onClick={generateNow}
            disabled={isGenerating}
            className="mt-6 w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-md flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.98] transition-all"
          >
            <RefreshCcw className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Sto preparando…' : 'Crea il menù della settimana'}
          </button>
          {familyMembers.length === 0 && onNavigateToFamily && (
            <button onClick={onNavigateToFamily} className="mt-4 text-sm font-semibold text-indigo-600 underline underline-offset-4">
              Prima aggiungi chi mangia a tavola
            </button>
          )}
        </div>
      ) : (() => {
                const plan = currentPlan.days[activeDay];
        const lunchRecipes = (plan?.lunchIds || []).map(id => recipes.find(r => r.id === id)).filter(Boolean) as Recipe[];
        const dinnerRecipes = (plan?.dinnerIds || []).map(id => recipes.find(r => r.id === id)).filter(Boolean) as Recipe[];

        // Dynamic nutrition sum for the active day
        let totalCal = 0;
        let totalProt = 0;
        let totalCarbs = 0;
        let totalFat = 0;

        [...lunchRecipes, ...dinnerRecipes].forEach(recipe => {
          const n = recipe.nutrients || calculateNutrients(recipe.ingredients);
          const ratio = targetServings / (recipe.servings || 2);
          totalCal += (n.calories || 0) * ratio;
          totalProt += (n.protein || 0) * ratio;
          totalCarbs += (n.carbs || 0) * ratio;
          totalFat += (n.fat || 0) * ratio;
        });

        return (
          <div className="space-y-6">
            {/* Un solo suggerimento alla volta, in ordine di importanza */}
            {familyMembers.length === 0 ? (
              onNavigateToFamily && (
                <TipCard
                  icon={<Users className="w-5 h-5" />}
                  text="Questo menù è uguale per tutti. Aggiungi chi mangia a tavola per personalizzarlo."
                  actionLabel="Aggiungi"
                  onAction={onNavigateToFamily}
                />
              )
            ) : missingIngredientsInfo.count > 0 && !isMissingBannerDismissed ? (
              <TipCard
                icon={<ShoppingCart className="w-5 h-5" />}
                text={`Per questo menù mancano ${missingIngredientsInfo.count} prodotti.`}
                actionLabel="Vedi la spesa"
                onAction={onNavigateToShopping}
                onDismiss={handleDismissBanner}
              />
            ) : planHasMeals && missingIngredientsInfo.count === 0 ? (
              <TipCard
                tone="success"
                icon={<Check className="w-5 h-5" />}
                text="Hai già tutto in dispensa: questa settimana niente spesa."
              />
            ) : null}

            <div className="space-y-6">
            {/* Horizontal Slide Bar for Days of the Week */}
            <div className="bg-white rounded-3xl border border-slate-200 p-2 shadow-sm flex items-center justify-between gap-2">
              <button
                onClick={goToPrevDay}
                className="p-2.5 rounded-2xl text-slate-500 hover:text-indigo-600 hover:bg-slate-50 active:bg-slate-100 transition-colors flex-shrink-0 cursor-pointer"
                title="Giorno precedente"
              >
                <ChevronLeft className="w-5 h-5 font-bold" />
              </button>

              <div className="flex-1 overflow-x-auto scroller-hide flex items-center gap-1.5 md:gap-2.5 py-1 px-1 justify-between md:justify-center">
                {DAYS.map((day) => {
                  const isActive = activeDay === day;
                  const dayPlan = currentPlan.days[day];
                  const hasLunch = dayPlan && (dayPlan.lunchIds || []).length > 0;
                  const hasDinner = dayPlan && (dayPlan.dinnerIds || []).length > 0;

                  return (
                    <button
                      key={day}
                      onClick={() => setActiveDay(day)}
                      className={`relative flex flex-col items-center py-2 px-3 md:px-5 rounded-2xl border text-center transition-all cursor-pointer min-w-[72px] md:min-w-[105px] ${
                        isActive
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      {/* Abbreviation for mobile, full name on desktop */}
                      <span className="text-[11px] md:text-xs font-extrabold uppercase tracking-wider block md:hidden">
                        {day.slice(0, 3)}
                      </span>
                      <span className="text-[11px] md:text-xs font-extrabold uppercase tracking-wider hidden md:block">
                        {day}
                      </span>

                      {/* Micro Indicators */}
                      <div className="flex gap-1 mt-1.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isActive
                              ? 'bg-white/80'
                              : hasLunch
                              ? 'bg-indigo-400'
                              : 'bg-slate-200'
                          }`}
                          title="Pranzo"
                        />
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isActive
                              ? 'bg-white/80'
                              : hasDinner
                              ? 'bg-orange-400'
                              : 'bg-slate-200'
                          }`}
                          title="Cena"
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={goToNextDay}
                className="p-2.5 rounded-2xl text-slate-500 hover:text-indigo-600 hover:bg-slate-50 active:bg-slate-100 transition-colors flex-shrink-0 cursor-pointer"
                title="Giorno successivo"
              >
                <ChevronRight className="w-5 h-5 font-bold" />
              </button>
            </div>

            {/* Slider day card with slide animation */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeDay}
                initial={{ opacity: 0, y: 10, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.99 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                {/* LUNCH CARD */}
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="bg-indigo-50 text-indigo-600 p-2 rounded-xl">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] text-indigo-500 font-extrabold uppercase tracking-widest block">Pasto di mezzogiorno</span>
                          <h3 className="text-base font-black text-slate-900">Pranzo</h3>
                        </div>
                      </div>
                    </div>

                    {lunchRecipes.length > 0 ? (
                      <div className="space-y-4">
                        {lunchRecipes.map(recipe => {
                          const rNutrients = recipe.nutrients || calculateNutrients(recipe.ingredients);
                          const rRatio = targetServings / (recipe.servings || 2);

                          return (
                            <div key={recipe.id} className="relative group/card">
                              <div 
                                className={`w-full p-3 rounded-2xl border transition-all ${
                                  isOfferMatch(recipe) 
                                    ? 'bg-emerald-50/60 border-emerald-200 hover:bg-emerald-50' 
                                    : 'bg-slate-50 border-slate-150 hover:bg-slate-100/70 hover:border-slate-200'
                                }`}
                              >
                                <div className="space-y-2">
                                  <div className="flex items-start justify-between gap-2">
                                    <div 
                                      onClick={() => setSelectedRecipe(recipe)}
                                      className="flex-1 cursor-pointer"
                                    >
                                      <div className="flex flex-wrap items-center gap-1 mb-1">
                                        {isUserFavorite(recipe) && (
                                          <span className="bg-rose-100 text-rose-800 text-[9px] font-black uppercase px-1.5 py-0.5 rounded flex items-center gap-1 flex-shrink-0 animate-pulse">
                                            <Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500" /> PIATTO PREFERITO
                                          </span>
                                        )}
                                        {!isUserFavorite(recipe) && isOfferMatch(recipe) && (
                                          <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase px-1.5 py-0.5 rounded flex items-center gap-1 flex-shrink-0">
                                            <Tag className="w-2.5 h-2.5" /> OFFERTA
                                          </span>
                                        )}
                                        {!isUserFavorite(recipe) && !isOfferMatch(recipe) && isFamilyFavorite(recipe) && (
                                          <span className="bg-pink-100 text-pink-800 text-[9px] font-black uppercase px-1.5 py-0.5 rounded flex items-center gap-1 flex-shrink-0">
                                            <Heart className="w-2.5 h-2.5 fill-pink-500 text-pink-500" /> PREFERITO FAMIGLIA
                                          </span>
                                        )}
                                      </div>
                                      <h4 className={`text-sm md:text-base font-extrabold leading-snug ${isOfferMatch(recipe) ? 'text-emerald-950' : 'text-slate-900'} hover:text-indigo-600 transition-colors`}>
                                        {recipe.title}
                                      </h4>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <button
                                        onClick={() => handleInitiateSwap(activeDay, 'lunch', recipe)}
                                        className="p-1.5 bg-white hover:bg-indigo-50 border border-slate-200 text-slate-500 hover:text-indigo-600 rounded-xl transition-all cursor-pointer shadow-2xs hover:scale-105"
                                        title="Sostituisci questo piatto"
                                      >
                                        <RefreshCcw className="w-3.5 h-3.5" />
                                      </button>
                                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider whitespace-nowrap bg-white px-2 py-1 rounded-lg border border-slate-100">
                                        {recipe.timeMin} min
                                      </span>
                                    </div>
                                  </div>

                                  <p
                                    onClick={() => setSelectedRecipe(recipe)}
                                    className="cursor-pointer text-sm text-slate-600 leading-snug"
                                  >
                                    {recipe.ingredients.slice(0, 3).map(ing => ing.name).join(', ')}
                                    {recipe.ingredients.length > 3 ? '…' : ''}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-8 text-center border border-dashed border-slate-200 rounded-3xl">
                        <UtensilsCrossed className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-medium text-slate-400">Nessun pranzo programmato</p>
                      </div>
                    )}
                    <MemberAlternatives recipes={lunchRecipes} members={familyMembers} alt={plan?.lunchAlt} allRecipes={recipes} onOpen={setSelectedRecipe} />
                  </div>

                </div>

                {/* DINNER CARD */}
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="bg-orange-50 text-orange-600 p-2 rounded-xl">
                          <ChefHat className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] text-orange-500 font-extrabold uppercase tracking-widest block">Pasto serale</span>
                          <h3 className="text-base font-black text-slate-900">Cena</h3>
                        </div>
                      </div>
                    </div>

                    {dinnerRecipes.length > 0 ? (
                      <div className="space-y-4">
                        {dinnerRecipes.map(recipe => {
                          const rNutrients = recipe.nutrients || calculateNutrients(recipe.ingredients);
                          const rRatio = targetServings / (recipe.servings || 2);

                          return (
                            <div key={recipe.id} className="relative group/card">
                              <div 
                                className={`w-full p-3 rounded-2xl border transition-all ${
                                  isOfferMatch(recipe) 
                                    ? 'bg-emerald-50/60 border-emerald-200 hover:bg-emerald-50' 
                                    : 'bg-slate-50 border-slate-150 hover:bg-slate-100/70 hover:border-slate-200'
                                }`}
                              >
                                <div className="space-y-2">
                                  <div className="flex items-start justify-between gap-2">
                                    <div 
                                      onClick={() => setSelectedRecipe(recipe)}
                                      className="flex-1 cursor-pointer"
                                    >
                                      <div className="flex flex-wrap items-center gap-1 mb-1">
                                        {isUserFavorite(recipe) && (
                                          <span className="bg-rose-100 text-rose-800 text-[9px] font-black uppercase px-1.5 py-0.5 rounded flex items-center gap-1 flex-shrink-0 mt-0.5 animate-pulse">
                                            <Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500" /> PIATTO PREFERITO
                                          </span>
                                        )}
                                        {!isUserFavorite(recipe) && isOfferMatch(recipe) && (
                                          <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase px-1.5 py-0.5 rounded flex items-center gap-1 flex-shrink-0">
                                            <Tag className="w-2.5 h-2.5" /> OFFERTA
                                          </span>
                                        )}
                                        {!isUserFavorite(recipe) && !isOfferMatch(recipe) && isFamilyFavorite(recipe) && (
                                          <span className="bg-pink-100 text-pink-800 text-[9px] font-black uppercase px-1.5 py-0.5 rounded flex items-center gap-1 flex-shrink-0">
                                            <Heart className="w-2.5 h-2.5 fill-pink-500 text-pink-500" /> PREFERITO FAMIGLIA
                                          </span>
                                        )}
                                      </div>
                                      <h4 className={`text-sm md:text-base font-extrabold leading-snug ${isOfferMatch(recipe) ? 'text-emerald-950' : 'text-slate-900'} hover:text-indigo-600 transition-colors`}>
                                        {recipe.title}
                                      </h4>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <button
                                        onClick={() => handleInitiateSwap(activeDay, 'dinner', recipe)}
                                        className="p-1.5 bg-white hover:bg-indigo-50 border border-slate-200 text-slate-500 hover:text-indigo-600 rounded-xl transition-all cursor-pointer shadow-2xs hover:scale-105"
                                        title="Sostituisci questo piatto"
                                      >
                                        <RefreshCcw className="w-3.5 h-3.5" />
                                      </button>
                                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider whitespace-nowrap bg-white px-2 py-1 rounded-lg border border-slate-100">
                                        {recipe.timeMin} min
                                      </span>
                                    </div>
                                  </div>

                                  <p
                                    onClick={() => setSelectedRecipe(recipe)}
                                    className="cursor-pointer text-sm text-slate-600 leading-snug"
                                  >
                                    {recipe.ingredients.slice(0, 3).map(ing => ing.name).join(', ')}
                                    {recipe.ingredients.length > 3 ? '…' : ''}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-8 text-center border border-dashed border-slate-200 rounded-3xl">
                        <UtensilsCrossed className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-medium text-slate-400">Nessuna cena programmata</p>
                      </div>
                    )}
                    <MemberAlternatives recipes={dinnerRecipes} members={familyMembers} alt={plan?.dinnerAlt} allRecipes={recipes} onOpen={setSelectedRecipe} />
                  </div>

                </div>
              </motion.div>
            </AnimatePresence>

            {/* Valori nutrizionali: chiusi finché non servono */}
            {(lunchRecipes.length > 0 || dinnerRecipes.length > 0) && (
              <details className="bg-white border border-slate-200 rounded-2xl px-4 py-3">
                <summary className="cursor-pointer list-none flex items-center justify-between text-sm font-semibold text-slate-700">
                  <span>Valori nutrizionali del giorno</span>
                  <span className="text-xs font-medium text-slate-400">{Math.round(totalCal)} kcal ▾</span>
                </summary>
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {[
                    { label: 'Calorie', value: Math.round(totalCal), unit: 'kcal', color: 'text-slate-800' },
                    { label: 'Proteine', value: Math.round(totalProt), unit: 'g', color: 'text-red-600' },
                    { label: 'Carbo', value: Math.round(totalCarbs), unit: 'g', color: 'text-amber-600' },
                    { label: 'Grassi', value: Math.round(totalFat), unit: 'g', color: 'text-indigo-600' },
                  ].map(item => (
                    <div key={item.label} className="bg-slate-50 py-2 rounded-xl text-center">
                      <span className="block text-[10px] font-semibold text-slate-400 uppercase">{item.label}</span>
                      <span className={`text-sm font-bold ${item.color}`}>{item.value}{item.unit === 'g' ? 'g' : ''}</span>
                      {item.unit === 'kcal' && <span className="block text-[10px] text-slate-400">kcal</span>}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-3">Calcolati per {targetServings} porzioni.</p>
              </details>
            )}
            </div>
          </div>
        );
      })()}

      {/* In stagione */}
      <p className="text-sm text-slate-500 text-center px-4">
        In stagione, {seasonNames[season].toLowerCase()}: {seasonTips[season]}
      </p>

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
                        onClick={() => { setServingsTouched(true); setTargetServings(Math.max(1, targetServings - 1)); }}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-100 text-indigo-600 font-bold"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-bold text-slate-700">{targetServings}</span>
                      <button 
                        onClick={() => { setServingsTouched(true); setTargetServings(targetServings + 1); }}
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
                    Ingredienti
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedRecipe.ingredients.map((ing, idx) => {
                      const scaledAmount = scaleIngredientAmount(ing.amount, selectedRecipe.servings || 2, targetServings);
                      return (
                        <li key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-slate-700 font-medium">{ing.name}</span>
                          <span className="text-indigo-600 font-bold text-sm">
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
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Configurazione Famiglia */}
      <AnimatePresence>
        {showNoFamilyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 text-center space-y-4 shadow-xl"
            >
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-xl mx-auto border border-amber-200">
                <Users size={26} />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">Configurazione Famiglia Consigliata</h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Per un menù personalizzato e sicuro su allergie o preferenze è consigliato <strong>aggiungere almeno un membro della famiglia</strong>.
                </p>
                <p className="text-[11px] text-slate-400 mt-2 italic">
                  Tuttavia, se preferisci procedere senza vincoli, puoi generare un menù standard per tutti.
                </p>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <button 
                  onClick={() => {
                    setShowNoFamilyModal(false);
                    if (onNavigateToFamily) onNavigateToFamily();
                  }}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Users className="w-4 h-4" />
                  <span>Configura Membri in Famiglia</span>
                </button>
                <button 
                  onClick={() => {
                    setShowNoFamilyModal(false);
                    generatePlan(false, true);
                  }}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Genera Senza Considerare i Membri</span>
                </button>
                <button 
                  onClick={() => setShowNoFamilyModal(false)}
                  className="w-full py-2 border border-slate-200 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors text-slate-500 cursor-pointer"
                >
                  Annulla
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Sostituisci Piatto con Alternative */}
      <AnimatePresence>
        {swappingMeal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSwappingMeal(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[85vh]"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-indigo-600 text-white">
                <div>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                    {swappingMeal.type === 'lunch' ? 'Pranzo' : 'Cena'} • {swappingMeal.day}
                  </span>
                  <h3 className="text-lg font-black mt-1">Sostituisci Piatto</h3>
                </div>
                <button 
                  onClick={() => setSwappingMeal(null)}
                  className="bg-white/25 hover:bg-white/45 p-2 rounded-xl text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-5 flex-1">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Piatto Attuale</span>
                  <h4 className="text-sm font-extrabold text-slate-800 mt-1">{swappingMeal.recipe.title}</h4>
                  
                  {/* Nutritional values of original */}
                  {(() => {
                    const originalNutrients = swappingMeal.recipe.nutrients || calculateNutrients(swappingMeal.recipe.ingredients);
                    const ratio = targetServings / (swappingMeal.recipe.servings || 2);
                    return (
                      <div className="flex gap-4 text-[10px] text-slate-500 font-semibold mt-1.5 pt-1.5 border-t border-slate-200/50">
                        <span>🥩 {Math.round(originalNutrients.protein * ratio)}g pro</span>
                        <span>🍞 {Math.round(originalNutrients.carbs * ratio)}g carb</span>
                        <span>💧 {Math.round(originalNutrients.fat * ratio)}g grassi</span>
                        <span className="ml-auto font-bold text-slate-700">{Math.round(originalNutrients.calories * ratio)} kcal</span>
                      </div>
                    );
                  })()}
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Alternative Disponibili dello stesso valore</h4>
                  
                  {(() => {
                    const alternatives = getAlternativeRecipes(swappingMeal.recipe);
                    
                    if (alternatives.length === 0) {
                      return (
                        <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                          <UtensilsCrossed className="w-8 h-8 text-slate-300 mx-auto mb-2 animate-bounce" />
                          <p className="text-sm font-bold text-slate-500">Nessuna alternativa disponibile</p>
                          <p className="text-xs text-slate-400 mt-1">Tutte le altre ricette compatibili sono già state programmate o non corrispondono alla stagione.</p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3">
                        {alternatives.map(alt => {
                          const altNutrients = alt.nutrients || calculateNutrients(alt.ingredients);
                          const altRatio = targetServings / (alt.servings || 2);
                          
                          // check protein type match
                          const exactProteinMatch = alt.proteinType && swappingMeal.recipe.proteinType && alt.proteinType === swappingMeal.recipe.proteinType;

                          return (
                            <div 
                              key={alt.id}
                              className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-400/80 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-2xs hover:shadow-xs group"
                            >
                              <div className="space-y-1.5 flex-1">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  {exactProteinMatch ? (
                                    <span className="bg-indigo-50 border border-indigo-200/50 text-indigo-700 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md">
                                      Stessa Categoria Proteica
                                    </span>
                                  ) : (
                                    <span className="bg-slate-50 border border-slate-200 text-slate-600 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md">
                                      Alternativa Bilanciata
                                    </span>
                                  )}
                                  {favorites.includes(alt.id) && (
                                    <span className="bg-rose-50 border border-rose-100 text-rose-700 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                      <Heart className="w-2 h-2 fill-rose-500 text-rose-500" /> Preferito
                                    </span>
                                  )}
                                </div>
                                <h5 className="text-sm font-extrabold text-slate-800 group-hover:text-indigo-600 transition-colors leading-snug">
                                  {alt.title}
                                </h5>
                                
                                <div className="flex gap-3 text-[10px] text-slate-500 font-semibold">
                                  <span>🥩 {Math.round(altNutrients.protein * altRatio)}g</span>
                                  <span>🍞 {Math.round(altNutrients.carbs * altRatio)}g</span>
                                  <span>💧 {Math.round(altNutrients.fat * altRatio)}g</span>
                                  <span className="text-slate-700 font-bold">{Math.round(altNutrients.calories * altRatio)} kcal</span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleExecuteSwap(alt.id)}
                                className="w-full md:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-2xs transition-all active:scale-95 shrink-0 cursor-pointer flex items-center justify-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Usa</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Configurazione Dispensa Prima di Generare */}
      <AnimatePresence>
        {showPantryPromptModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 text-center space-y-4 shadow-xl"
            >
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl mx-auto border border-emerald-200 shadow-2xs">
                <Package size={26} />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">Passare prima alla Dispensa?</h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Hai la possibilità di <strong>impostare tutti i prodotti che possiedi a casa</strong> prima di generare il menù. In questo modo l'IA utilizzerà i tuoi ingredienti per proporti piatti intelligenti e ridurre la lista della spesa.
                </p>
                <p className="text-[11px] text-slate-400 mt-2 italic">
                  Tuttavia, se preferisci, puoi saltare questo passaggio e generare subito il menù.
                </p>
              </div>
              <div className="flex gap-2.5 pt-2">
                <button 
                  onClick={() => {
                    setShowPantryPromptModal(false);
                    setHasSkippedPantryPrompt(true);
                    generatePlan(true);
                  }}
                  className="w-1/2 py-2.5 bg-white border border-slate-300 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors text-slate-700 cursor-pointer shadow-2xs"
                >
                  Salta e Genera Subito
                </button>
                <button 
                  onClick={() => {
                    setShowPantryPromptModal(false);
                    if (onNavigateToPantry) onNavigateToPantry();
                  }}
                  className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  Vai alla Dispensa
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
