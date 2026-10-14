import { getSupermarketDepartment } from '../lib/departments';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, getDocs, query, onSnapshot, addDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';
import { WeeklyPlan, Recipe, PantryItem, Ingredient, UserProfile } from '../types';
import { INITIAL_RECIPES } from '../data/recipes';
import { ShoppingCart, Download, CheckCircle2, Circle, CheckSquare, Plus, Trash2, Sparkles, Search, X, LayoutGrid, ListTodo, ChevronLeft, ChevronRight, Info, Calendar, PenLine, MessageCircle, AlertTriangle, Lock, Tag, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getRawIngredientNames, scaleIngredientAmount } from '../lib/utils';
import { checkIngredientMatch, isStaple, calculateMissingFromPantry, findPantryDuplicate } from '../lib/pantrySync';
import { limitsFor } from '../lib/plans';
import { planMeals } from '../lib/memberAlternatives';
import { allLabels, compareShopping, emptyTags, firstUseOffsets, groupByLabel, labelsOf, offsetFor, toggleLabel, URGENT_LABEL, WHEN_GROUPS, whenGroup, whenText, cleanLabel, type ShoppingTags, type UseOffset } from '../lib/shoppingOrder';
import { dayNameOf } from '../lib/sharedMenu';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const DEPARTMENTS = [
  { id: 'ortofrutta', name: 'Ortofrutta 🍎', color: 'bg-emerald-50/70 text-emerald-800 border-emerald-200/50', iconColor: 'text-emerald-500 bg-emerald-100/40' },
  { id: 'macelleria', name: 'Macelleria & Pescheria 🥩', color: 'bg-rose-50/70 text-rose-800 border-rose-200/50', iconColor: 'text-rose-500 bg-rose-100/40' },
  { id: 'latticini', name: 'Latticini, Uova & Freschi 🧀', color: 'bg-amber-50/70 text-amber-800 border-amber-200/50', iconColor: 'text-amber-500 bg-amber-100/40' },
  { id: 'pane', name: 'Panetteria 🥖', color: 'bg-orange-50/70 text-orange-950 border-orange-200/50', iconColor: 'text-orange-500 bg-orange-100/40' },
  { id: 'surgelati', name: 'Surgelati ❄️', color: 'bg-sky-50/70 text-sky-800 border-sky-200/50', iconColor: 'text-sky-500 bg-sky-100/40' },
  { id: 'bevande', name: 'Bevande 🥤', color: 'bg-blue-50/70 text-blue-800 border-blue-200/50', iconColor: 'text-blue-500 bg-blue-100/40' },
  { id: 'dispensa', name: 'Dispensa & Condimenti 🥫', color: 'bg-indigo-50/70 text-indigo-850 border-indigo-200/50', iconColor: 'text-indigo-500 bg-indigo-100/40' },
  { id: 'altro', name: 'Altro 📦', color: 'bg-slate-50/70 text-slate-800 border-slate-200/50', iconColor: 'text-slate-500 bg-slate-100/40' }
] as const;

interface Props {
  userId: string;
  profile?: UserProfile | null;
  onNavigateToBusiness?: () => void;
}

interface ShoppingItem {
  name: string;
  amount: number;
  unit: string;
  needed: boolean;
}

export default function ShoppingList({ userId, profile, onNavigateToBusiness }: Props) {
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [voiceList, setVoiceList] = useState<any[]>([]);
  const [shoppingSearch, setShoppingSearch] = useState('');
  type ViewMode = 'when' | 'labels' | 'departments' | 'all';
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    try {
      const saved = localStorage.getItem('shopping_view');
      return saved === 'labels' || saved === 'departments' || saved === 'all' || saved === 'when' ? saved : 'when';
    } catch {
      return 'when';
    }
  });
  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    try {
      localStorage.setItem('shopping_view', mode);
    } catch {
      /* storage non disponibile */
    }
  };
  // Quando serve ogni ingrediente e le etichette scelte da chi usa l'app
  const [uses, setUses] = useState<UseOffset[]>([]);
  const [tags, setTags] = useState<ShoppingTags>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(`shoppingTags_${userId}`) || 'null') as ShoppingTags | null;
      return saved && saved.labels ? { labels: saved.labels, custom: saved.custom || [] } : emptyTags();
    } catch {
      return emptyTags();
    }
  });
  const [labelling, setLabelling] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [newItem, setNewItem] = useState({ name: '', amount: 1, unit: 'pz' });
  const [loading, setLoading] = useState(true);
  const [pantryCount, setPantryCount] = useState<number>(0);
  const [showLimitWarningModal, setShowLimitWarningModal] = useState<boolean>(false);
  const [showPdfGate, setShowPdfGate] = useState<boolean>(false);

  useEffect(() => {
    const fromProfile = profile?.shoppingTags;
    if (fromProfile && !(userId === 'demo-family-user' || userId.startsWith('local-'))) {
      setTags({ labels: fromProfile.labels || {}, custom: fromProfile.custom || [] });
    }
  }, [profile?.shoppingTags, userId]);

  const saveTags = async (next: ShoppingTags) => {
    setTags(next);
    if (userId === 'demo-family-user' || userId.startsWith('local-')) {
      try {
        localStorage.setItem(`shoppingTags_${userId}`, JSON.stringify(next));
      } catch {
        /* storage non disponibile */
      }
      return;
    }
    try {
      await updateDoc(doc(db, `users/${userId}`), { shoppingTags: next });
    } catch (e) {
      console.error('Etichette non salvate:', e);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [shoppingSearch, viewMode]);

  useEffect(() => {
    let unsubPantry: (() => void) | null = null;
    let unsubVoice: (() => void) | null = null;

    const setupListeners = async () => {
      if (userId === 'demo-family-user' || userId.startsWith('local-')) {
        const savedPlanStr = localStorage.getItem(`mealPlan_${userId}`);
        const activePlan = savedPlanStr ? JSON.parse(savedPlanStr) as WeeklyPlan : null;
        const savedCustomStr = localStorage.getItem(`customRecipes_${userId}`);
        const customRecipes = savedCustomStr ? JSON.parse(savedCustomStr) as Recipe[] : [];
        const allRecipes = [...INITIAL_RECIPES, ...customRecipes];
        // Porzioni = persone a tavola (come nel menù); senza persone indicate, 2
        let localMemberIds = new Set<string>();
        try { localMemberIds = new Set((JSON.parse(localStorage.getItem(`members_${userId}`) || '[]') as { id: string }[]).map(m => m.id)); } catch { /* dati non validi */ }
        const targetServings = localMemberIds.size || 2;

        const savedPantryStr = localStorage.getItem(`pantry_${userId}`);
        const pantry = savedPantryStr ? JSON.parse(savedPantryStr) as PantryItem[] : [];
        setPantryCount(pantry.length);
        // Articoli aggiunti a mano (o dal pianificatore vacanze): prima venivano salvati ma mai mostrati
        try { setVoiceList(JSON.parse(localStorage.getItem(`voiceShopping_${userId}`) || '[]')); } catch { setVoiceList([]); }

        if (!activePlan) {
          setShoppingList([]);
          setUses([]);
          setLoading(false);
          return;
        }
        setUses(firstUseOffsets({ plan: activePlan, recipes: allRecipes, servings: targetServings, memberIds: localMemberIds, today: dayNameOf(new Date()) }));

        const rawRequirements: { name: string; amount: number; unit: string }[] = [];
        // Chi ha un'alternativa mangia quella: si compra per le porzioni reali di ogni piatto
        planMeals(activePlan, targetServings, localMemberIds).forEach(({ recipeId, people }) => {
          const recipe = allRecipes.find(r => r.id === recipeId);
          if (!recipe) return;
          const originalServings = recipe.servings || 2;
          recipe.ingredients.forEach(ing => {
            if (isStaple(ing.name)) return;
            getRawIngredientNames(ing.name).forEach(name => {
              if (isStaple(name)) return;
              rawRequirements.push({
                name,
                amount: scaleIngredientAmount(ing.amount, originalServings, people),
                unit: ing.unit
              });
            });
          });
        });

        const missing = calculateMissingFromPantry(rawRequirements, pantry);
        const autoList: ShoppingItem[] = missing.map(item => ({
          name: item.name,
          amount: item.amount,
          unit: item.unit,
          needed: true,
          category: 'Ricetta dal Menu'
        }));
        setShoppingList(autoList);
        setLoading(false);
        return;
      }

      try {
        // 1. Get Current Plan
        const planPath = `users/${userId}/mealPlans/current`;
        const planDoc = await getDoc(doc(db, planPath));
        const activePlan = planDoc.exists() ? planDoc.data() as WeeklyPlan : null;

        // 2. Get Custom Recipes
        const customPath = `users/${userId}/customRecipes`;
        const customSnapshot = await getDocs(collection(db, customPath));
        const customRecipes = customSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe));
        const allRecipes = [...INITIAL_RECIPES, ...customRecipes];

        // 3. Get Family Members to scale doses
        const membersPath = `users/${userId}/familyMembers`;
        const membersSnapshot = await getDocs(collection(db, membersPath));
        const targetServings = membersSnapshot.docs.length || 2;
        const memberIds = new Set(membersSnapshot.docs.map(d => d.id));

        // 4. Real-time Pantry Listener
        const pantryPath = `users/${userId}/pantry`;
        unsubPantry = onSnapshot(collection(db, pantryPath), (pantrySnapshot) => {
          const pantry = pantrySnapshot.docs.map(doc => doc.data() as PantryItem);
          setPantryCount(pantry.length);

          if (!activePlan) {
            setShoppingList([]);
            setUses([]);
            setLoading(false);
            return;
          }
          setUses(firstUseOffsets({ plan: activePlan, recipes: allRecipes, servings: targetServings, memberIds, today: dayNameOf(new Date()) }));

          // 5. Extract all ingredients from the plan
          const rawRequirements: { name: string; amount: number; unit: string }[] = [];
          
          planMeals(activePlan, targetServings, memberIds).forEach(({ recipeId, people }) => {
            const recipe = allRecipes.find(r => r.id === recipeId);
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

          // 6. Compare with current Pantry
          const missing = calculateMissingFromPantry(rawRequirements, pantry);
          const list: ShoppingItem[] = missing.map(item => ({
            name: item.name,
            amount: item.amount,
            unit: item.unit,
            needed: true,
            category: 'Ricetta dal Menu'
          }));

          setShoppingList(list);
          setLoading(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, pantryPath);
        });

        // 7. Real-time Voice & Custom Shopping Items Listener
        const voicePath = `users/${userId}/voiceShoppingItems`;
        unsubVoice = onSnapshot(collection(db, voicePath), (voiceSnapshot) => {
          const items = voiceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setVoiceList(items);
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, voicePath);
        });

      } catch (error) {
        console.error("Error setting up real-time Shopping List:", error);
        setLoading(false);
      }
    };

    setupListeners();

    return () => {
      if (unsubPantry) unsubPantry();
      if (unsubVoice) unsubVoice();
    };
  }, [userId]);

  // Support manual/input addition of shopping item
  const addCustomItem = async () => {
    if (!newItem.name.trim()) return;
    if (userId === 'demo-family-user' || userId.startsWith('local-')) {
      const savedStr = localStorage.getItem(`voiceShopping_${userId}`);
      const list = savedStr ? JSON.parse(savedStr) : [];
      const updated = [...list, { id: Date.now().toString(), name: newItem.name.trim(), amount: newItem.amount, unit: newItem.unit, needed: true }];
      localStorage.setItem(`voiceShopping_${userId}`, JSON.stringify(updated));
      setVoiceList(updated);
      setNewItem({ name: '', amount: 1, unit: 'pz' });
      return;
    }
    const voicePath = `users/${userId}/voiceShoppingItems`;
    try {
      await addDoc(collection(db, voicePath), {
        name: newItem.name.trim(),
        amount: newItem.amount,
        unit: newItem.unit,
        needed: true,
        createdAt: new Date().toISOString()
      });
      setNewItem({ name: '', amount: 1, unit: 'pz' });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, voicePath);
    }
  };

  const deleteCustomItem = async (id: string) => {
    if (userId === 'demo-family-user' || userId.startsWith('local-')) {
      const savedStr = localStorage.getItem(`voiceShopping_${userId}`);
      if (savedStr) {
        const list = JSON.parse(savedStr).filter((item: any) => item.id !== id);
        localStorage.setItem(`voiceShopping_${userId}`, JSON.stringify(list));
        setVoiceList(list);
      }
      return;
    }
    const voicePath = `users/${userId}/voiceShoppingItems`;
    try {
      await deleteDoc(doc(db, voicePath, id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `users/${userId}/voiceShoppingItems/${id}`);
    }
  };

  // Segnare un articolo come acquistato lo sposta in dispensa (sommando la quantità se esiste già)
  const handlePurchaseItem = async (name: string, amount: number, unit: string, customDocId?: string) => {
    const isLocal = userId === 'demo-family-user' || userId.startsWith('local-');
    const pantryLimit = limitsFor(profile?.plan).maxPantryItems;
    const quantity = amount > 0 ? amount : 1;
    const finalUnit = unit || 'pz';

    if (isLocal) {
      let pantry: PantryItem[] = [];
      try {
        pantry = JSON.parse(localStorage.getItem(`pantry_${userId}`) || '[]');
      } catch {
        pantry = [];
      }
      const duplicate = findPantryDuplicate(pantry, name, finalUnit);
      if (!duplicate && pantry.length >= pantryLimit) {
        // Limite del piano gratuito: avvisiamo senza perdere l'articolo dalla lista
        setShowLimitWarningModal(true);
        return;
      }
      const updatedPantry = duplicate
        ? pantry.map(p => p.id === duplicate.id ? { ...p, quantity: Math.round((p.quantity + quantity) * 100) / 100 } : p)
        : [...pantry, { id: Date.now().toString(), name, quantity, unit: finalUnit, category: 'Altro' }];
      localStorage.setItem(`pantry_${userId}`, JSON.stringify(updatedPantry));
      if (customDocId) {
        deleteCustomItem(customDocId);
      }
      return;
    }

    const pantryPath = `users/${userId}/pantry`;
    try {
      const snapshot = await getDocs(collection(db, pantryPath));
      const pantry = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PantryItem));
      const duplicate = findPantryDuplicate(pantry, name, finalUnit);

      if (!duplicate && pantry.length >= pantryLimit) {
        // Limite del piano gratuito: avvisiamo senza perdere l'articolo dalla lista
        setShowLimitWarningModal(true);
        return;
      }

      if (duplicate) {
        await updateDoc(doc(db, pantryPath, duplicate.id), {
          quantity: Math.round((duplicate.quantity + quantity) * 100) / 100
        });
      } else {
        await addDoc(collection(db, pantryPath), { name, quantity, unit: finalUnit, category: 'Altro' });
      }

      // Se era un articolo aggiunto a voce o a mano, lo togliamo dalla lista
      if (customDocId) {
        await deleteDoc(doc(db, `users/${userId}/voiceShoppingItems`, customDocId));
      }
    } catch (e) {
      console.error("Error finalizing shopping purchase:", e);
    }
  };

  const exportPDF = () => {
    if (!limitsFor(profile?.plan).exportList) {
      setShowPdfGate(true);
      return;
    }

    const doc = new jsPDF();
    doc.text('Lista della Spesa SaporeSaggio', 14, 15);
    
    const tableData = [
      ...shoppingList.map(item => [item.name, `${Math.ceil(item.amount)} ${item.unit}`, 'Rilevato da menù']),
      ...voiceList.map(item => [item.name, `${item.amount} ${item.unit}`, 'Aggiunto a voce/mano'])
    ];
    
    autoTable(doc, {
      head: [['Prodotto', 'Quantità', 'Tipo']],
      body: tableData,
      startY: 25,
    });
    
    doc.save('lista-spesa-saporesaggio.pdf');
  };

  const handleShareWhatsApp = () => {
    if (!limitsFor(profile?.plan).exportList) {
      setShowPdfGate(true);
      return;
    }
    const text = `🛒 *Lista della Spesa Che Cucino Oggi*\n\n` +
      shoppingList.map(item => `• ${item.name}: ${Math.ceil(item.amount)} ${item.unit}`).join('\n') +
      (voiceList.length > 0 ? `\n\n📝 *Aggiunti a mano/voce:*\n` + voiceList.map(item => `• ${item.name}: ${item.amount} ${item.unit}`).join('\n') : '');
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Preparo la lista della spesa…</div>;

  const totalLength = shoppingList.length + voiceList.length;

  const filteredShoppingList = shoppingList.filter(item =>
    item.name.toLowerCase().includes(shoppingSearch.toLowerCase())
  );
  const filteredVoiceList = voiceList.filter(item =>
    item.name.toLowerCase().includes(shoppingSearch.toLowerCase())
  );

  const unifiedList = [
    ...filteredShoppingList.map(item => ({
      ...item,
      id: undefined as string | undefined,
      source: 'menu' as const,
      department: getSupermarketDepartment(item.name),
      offset: offsetFor(item.name, uses),
      labels: labelsOf(tags, item.name)
    })),
    ...filteredVoiceList.map(item => ({
      ...item,
      id: item.id as string,
      source: 'manual' as const,
      department: getSupermarketDepartment(item.name),
      offset: undefined as number | undefined,
      labels: labelsOf(tags, item.name)
    }))
  ].sort(compareShopping);
  type ListItem = (typeof unifiedList)[number];

  // Per giorno: prima ciò che serve prima
  const groupedByWhen = WHEN_GROUPS.map(group => ({
    ...group,
    items: unifiedList.filter(item => whenGroup(item.offset) === group.id)
  })).filter(group => group.items.length > 0);

  // Per etichetta
  const groupedByLabel = groupByLabel(unifiedList, allLabels(tags));

  const renderRow = (item: ListItem, key: string) => {
    const isManual = item.source === 'manual';
    const deptInfo = DEPARTMENTS.find(d => d.id === item.department);
    const urgent = item.labels.includes(URGENT_LABEL);
    return (
      <div key={key} className={`px-4 py-3 flex items-center justify-between gap-2 hover:bg-slate-50/50 group transition-all duration-150 ${urgent ? 'bg-amber-50/50' : ''}`}>
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => handlePurchaseItem(item.name, isManual ? item.amount : Math.ceil(item.amount), item.unit, item.id)}
            className="w-11 h-11 -ml-2 shrink-0 flex items-center justify-center text-slate-300 hover:text-indigo-600 transition-colors cursor-pointer"
            title="Segna come acquistato e sposta in dispensa"
            aria-label={`Ho comprato ${item.name}`}
          >
            <Circle className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>
          <div className="min-w-0">
            <span className="block font-semibold text-slate-900 capitalize">{item.name}</span>
            <span className="block text-xs text-slate-500">
              {[isManual ? 'Aggiunto da te' : deptInfo ? deptInfo.name.split(' ')[0].replace(/[,;]$/, '') : '', whenText(item.offset)].filter(Boolean).join(' · ')}
            </span>
            {item.labels.length > 0 && (
              <span className="flex flex-wrap gap-1 mt-1">
                {item.labels.map(label => (
                  <span key={label} className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${label === URGENT_LABEL ? 'bg-amber-100 border-amber-300 text-amber-900' : 'bg-indigo-50 border-indigo-100 text-indigo-800'}`}>{label}</span>
                ))}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg">
            {isManual ? item.amount : Math.ceil(item.amount)} {item.unit}
          </span>
          <button
            onClick={() => { setLabelling(item.name); setNewLabel(''); }}
            aria-label={`Etichette per ${item.name}`}
            title="Etichette: urgente, surgelato…"
            className={`w-10 h-10 rounded-full flex items-center justify-center ${item.labels.length > 0 ? 'text-indigo-600' : 'text-slate-300 hover:text-indigo-600'}`}
          >
            <Tag className="w-4 h-4" />
          </button>
          {isManual && item.id && (
            <button
              onClick={() => deleteCustomItem(item.id!)}
              className="text-slate-300 hover:text-red-500 w-9 h-10 flex items-center justify-center transition-colors cursor-pointer"
              title="Elimina"
              aria-label={`Elimina ${item.name}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  };

  // Pagination for the Unified View
  const totalItems = unifiedList.length;
  const paginatedList = unifiedList.slice(0, itemsPerPage);

  // Group by Supermarket Department
  const groupedByDept = DEPARTMENTS.map(dept => {
    const deptItems = unifiedList.filter(item => item.department === dept.id);
    return {
      ...dept,
      items: deptItems
    };
  }).filter(group => group.items.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold text-slate-900">La spesa</h2>
          <p className="text-slate-600 mt-1">Quello che ti serve comprare per il menù.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {totalLength > 0 && (
            <>
              <button 
                onClick={exportPDF}
                className="flex items-center gap-1.5 bg-indigo-600 text-white px-3.5 py-2 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer font-bold text-xs"
              >
                <Download className="w-4 h-4" />
                <span>Scarica PDF</span>
                {!limitsFor(profile?.plan).exportList && <Lock className="w-3 h-3 text-indigo-200 ml-0.5" />}
              </button>
              <button 
                onClick={handleShareWhatsApp}
                className="flex items-center gap-1.5 bg-emerald-600 text-white px-3.5 py-2 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer font-bold text-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
                {!limitsFor(profile?.plan).exportList && <Lock className="w-3 h-3 text-emerald-200 ml-0.5" />}
              </button>
            </>
          )}
        </div>
      </div>

      {totalLength > 0 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cerca prodotti nella spesa..."
              value={shoppingSearch}
              onChange={(e) => setShoppingSearch(e.target.value)}
              className="w-full bg-transparent pl-11 pr-10 py-3 text-sm focus:outline-none placeholder:text-slate-400 text-slate-800 focus:ring-2 focus:ring-indigo-500/10"
            />
            {shoppingSearch && (
              <button
                onClick={() => setShoppingSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-fit overflow-x-auto" role="tablist" aria-label="Come vuoi vedere la spesa">
            {([
              ['when', 'Per giorno', Clock],
              ['labels', 'Etichette', Tag],
              ['departments', 'Per reparto', LayoutGrid],
              ['all', 'Lista unica', ListTodo],
            ] as const).map(([id, label, Icon]) => (
              <button
                key={id}
                role="tab"
                aria-selected={viewMode === id}
                onClick={() => setViewMode(id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  viewMode === id ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left section: The structured items lists */}
        <div className="lg:col-span-8 space-y-6">
          
          {viewMode === 'all' ? (
            /* ==================== LISTA UNICA VIEW ==================== */
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-indigo-600" />
                  Tutti i prodotti mancanti
                </h3>
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-indigo-50 border border-indigo-100 text-indigo-650 px-2.5 py-0.5 rounded-full font-bold font-mono">
                    {totalItems} articoli
                  </span>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {paginatedList.map((item, index) => renderRow(item, `${item.name}-${index}`))}

                {totalItems === 0 && (
                  <div className="p-10 text-center text-slate-400 text-sm">
                    {shoppingSearch ? 'Nessun prodotto corrisponde alla ricerca.' : 'La tua lista della spesa è vuota! Aggiungi articoli a mano o pianifica un menù.'}
                  </div>
                )}
              </div>

              {totalItems > itemsPerPage && (
                <div className="p-4 border-t border-slate-100">
                  <button
                    onClick={() => setItemsPerPage(n => n + 15)}
                    className="w-full h-12 rounded-2xl border border-slate-200 bg-white text-slate-700 font-semibold"
                  >
                    Mostra altri ({totalItems - itemsPerPage})
                  </button>
                </div>
              )}
            </div>
          ) : viewMode === 'departments' ? (
            /* ==================== VISTA PER REPARTO VIEW ==================== */
            <div className="space-y-4">
              {groupedByDept.map(group => (
                <div key={group.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition-all hover:shadow-sm">
                  <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h4 className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${group.id === 'ortofrutta' ? 'bg-emerald-500' : group.id === 'macelleria' ? 'bg-rose-500' : group.id === 'latticini' ? 'bg-amber-400' : group.id === 'pane' ? 'bg-orange-400' : group.id === 'surgelati' ? 'bg-sky-400' : group.id === 'bevande' ? 'bg-blue-400' : group.id === 'dispensa' ? 'bg-indigo-400' : 'bg-slate-400'}`}></span>
                      {group.name}
                    </h4>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full font-bold font-mono">
                      {group.items.length} {group.items.length === 1 ? 'articolo' : 'articoli'}
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {group.items.map((item, index) => renderRow(item, `${item.name}-${index}`))}
                  </div>
                </div>
              ))}

              {groupedByDept.length === 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400 text-sm shadow-sm">
                  {shoppingSearch ? 'Nessun reparto corrisponde alla tua ricerca.' : 'Nessun prodotto categorizzabile in questo momento.'}
                </div>
              )}
            </div>
          ) : viewMode === 'when' ? (
            /* ==================== PER GIORNO: PRIMA CIÒ CHE SERVE PRIMA ==================== */
            <div className="space-y-4">
              {groupedByWhen.map(group => (
                <div key={group.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h4 className="font-bold text-slate-800 text-sm">{group.title}</h4>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full font-bold font-mono">{group.items.length}</span>
                  </div>
                  <div className="divide-y divide-slate-100">{group.items.map((item, index) => renderRow(item, `${group.id}-${item.name}-${index}`))}</div>
                </div>
              ))}
              {groupedByWhen.length === 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400 text-sm shadow-sm">
                  {shoppingSearch ? 'Nessun prodotto corrisponde alla ricerca.' : 'La tua lista della spesa è vuota! Aggiungi articoli a mano o pianifica un menù.'}
                </div>
              )}
              <p className="text-xs text-slate-500 px-1">Gli articoli urgenti stanno in cima a ogni gruppo. Tocca l'etichetta <Tag className="inline w-3 h-3" /> su un prodotto per segnarlo.</p>
            </div>
          ) : (
            /* ==================== PER ETICHETTA ==================== */
            <div className="space-y-4">
              {groupedByLabel.map(group => (
                <div key={group.label ?? 'senza'} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h4 className="font-bold text-slate-800 text-sm">{group.label ?? 'Senza etichetta'}</h4>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full font-bold font-mono">{group.items.length}</span>
                  </div>
                  <div className="divide-y divide-slate-100">{group.items.map((item, index) => renderRow(item, `${group.label}-${item.name}-${index}`))}</div>
                </div>
              ))}
              {groupedByLabel.length === 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400 text-sm shadow-sm">
                  {shoppingSearch ? 'Nessun prodotto corrisponde alla ricerca.' : 'La tua lista della spesa è vuota! Aggiungi articoli a mano o pianifica un menù.'}
                </div>
              )}
              {groupedByLabel.every(g => g.label === null) && groupedByLabel.length > 0 && (
                <p className="text-xs text-slate-500 px-1">Nessun prodotto ha ancora un'etichetta: tocca <Tag className="inline w-3 h-3" /> su un prodotto per segnarlo come urgente, surgelato, fresco…</p>
              )}
            </div>
          )}

        </div>

        {/* Right Section: Add custom manual items & hints */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Aggiungi a mano</h3>
            
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nome alimento..."
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  value={newItem.amount}
                  onChange={(e) => setNewItem({ ...newItem, amount: Number(e.target.value) })}
                  className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-xs text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <select
                  value={newItem.unit}
                  onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                  className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="pz">pz</option>
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="ml">ml</option>
                  <option value="l">l</option>
                </select>
                <button
                  onClick={addCustomItem}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 rounded-lg flex items-center justify-center gap-1 shadow-sm transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Aggiungi
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Etichette di un prodotto */}
      {labelling && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/50 sm:p-4" role="dialog" aria-modal="true" aria-label={`Etichette per ${labelling}`} onClick={() => setLabelling(null)}>
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[85dvh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div>
              <h4 className="text-lg font-semibold text-slate-900 capitalize">{labelling}</h4>
              <p className="text-sm text-slate-500">Scegli le etichette: gli urgenti salgono in cima alla lista.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {allLabels(tags).map(label => {
                const on = labelsOf(tags, labelling).some(l => l.toLowerCase() === label.toLowerCase());
                return (
                  <button
                    key={label}
                    onClick={() => saveTags(toggleLabel(tags, labelling, label))}
                    aria-pressed={on}
                    className={`px-3.5 h-10 rounded-full border text-sm font-semibold ${on ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-700'}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const clean = cleanLabel(newLabel);
                if (!clean) return;
                if (!labelsOf(tags, labelling).some(l => l.toLowerCase() === clean.toLowerCase())) saveTags(toggleLabel(tags, labelling, clean));
                setNewLabel('');
              }}
              className="flex gap-2"
            >
              <input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                maxLength={24}
                placeholder="Nuova etichetta (es. Mercato)"
                aria-label="Nuova etichetta"
                className="flex-1 min-w-0 h-11 bg-slate-50 border border-slate-200 rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <button type="submit" className="h-11 px-4 rounded-xl bg-indigo-600 text-white font-bold text-sm">Aggiungi</button>
            </form>
            <button onClick={() => setLabelling(null)} className="w-full h-12 rounded-2xl bg-slate-100 text-slate-800 font-bold">Fatto</button>
          </div>
        </div>
      )}

      {/* Modal: Dispensa limit reached */}
      <AnimatePresence>
        {showLimitWarningModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 text-center space-y-4 shadow-xl"
            >
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-xl mx-auto border border-amber-200">
                <AlertTriangle size={26} />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">Dispensa piena (piano gratuito)</h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Il piano gratuito comprende fino a <strong>20 prodotti in dispensa</strong>. L'articolo resta nella lista: libera un po' di spazio in dispensa oppure passa a Famiglia, senza limiti.
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => setShowLimitWarningModal(false)}
                  className="w-1/3 py-2.5 border border-slate-200 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors text-slate-500"
                >
                  Capito
                </button>
                <button 
                  onClick={() => {
                    setShowLimitWarningModal(false);
                    if (onNavigateToBusiness) onNavigateToBusiness();
                  }}
                  className="w-2/3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95"
                >
                  Sblocca Illimitati
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: PDF & WhatsApp Export Gate */}
      <AnimatePresence>
        {showPdfGate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 text-center space-y-4 shadow-xl"
            >
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-xl mx-auto border border-indigo-200">
                <Sparkles size={26} />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">Funzione dei piani Famiglia e Chef IA</h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  L'esportazione in PDF e la condivisione istantanea su WhatsApp sono funzionalità riservate ai piani <strong>Famiglia</strong> e <strong>Chef IA</strong>.
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => setShowPdfGate(false)}
                  className="w-1/3 py-2.5 border border-slate-200 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors text-slate-500"
                >
                  Indietro
                </button>
                <button 
                  onClick={() => {
                    setShowPdfGate(false);
                    if (onNavigateToBusiness) onNavigateToBusiness();
                  }}
                  className="w-2/3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95"
                >
                  Scopri il piano Famiglia
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
