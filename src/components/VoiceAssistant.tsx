import { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, doc, setDoc, query, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';
import { Recipe, UserProfile, PantryItem } from '../types';
import { INITIAL_RECIPES } from '../data/recipes';
import { consumeIngredientsFromPantry } from '../lib/pantrySync';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Clock, 
  Sparkles, 
  Compass, 
  UtensilsCrossed, 
  Check, 
  FileText,
  ChefHat,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  userId: string;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  voiceSearchQuery: string;
  setVoiceSearchQuery: (query: string) => void;
}

// Word normalizations to match Italian language variations
function cleanMatchTerm(term: string): string {
  return term
    .toLowerCase()
    .trim()
    .replace(/\b(un|uno|una|il|la|i|gli|le|di|da|con|in|del|della|dei|degli|delle|al|alla|ai|agli|alle|da|a|per|un po' di|un pizzico di|un sacco di|pezzi di|grammi di|chili di)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function VoiceAssistant({ 
  userId, 
  activeTab, 
  setActiveTab, 
  voiceSearchQuery, 
  setVoiceSearchQuery 
}: Props) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [showMicHelpModal, setShowMicHelpModal] = useState(false);
  const [allRecipes, setAllRecipes] = useState<Recipe[]>(INITIAL_RECIPES);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [familyCount, setFamilyCount] = useState(2);

  // Active cooking overlay states
  const [cookingRecipe, setCookingRecipe] = useState<Recipe | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  // Sound feedback state
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [cookingSuccessMessage, setCookingSuccessMessage] = useState<string | null>(null);
  const [isConsuming, setIsConsuming] = useState(false);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setCookingSuccessMessage(null);
  }, [cookingRecipe]);

  // Load recipes and profile to have accurate data with voice actions
  useEffect(() => {
    // Custom Recipes listener
    const customRecipesPath = `users/${userId}/customRecipes`;
    const qCustom = query(collection(db, customRecipesPath));
    const unsubCustom = onSnapshot(qCustom, (snapshot) => {
      const customData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe));
      setAllRecipes([...INITIAL_RECIPES, ...customData]);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, customRecipesPath);
    });

    // Profile listener
    const profilePath = `users/${userId}`;
    const unsubProfile = onSnapshot(doc(db, profilePath), (snapshot) => {
      if (snapshot.exists()) {
        setProfile({ id: snapshot.id, ...snapshot.data() } as UserProfile);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, profilePath);
    });

    // Family members listener
    const membersPath = `users/${userId}/familyMembers`;
    const qMembers = query(collection(db, membersPath));
    const unsubMembers = onSnapshot(qMembers, (snapshot) => {
      const count = snapshot.docs.length || 2;
      setFamilyCount(count);
    }, (error) => {
      console.error(error);
    });

    return () => {
      unsubCustom();
      unsubProfile();
      unsubMembers();
    };
  }, [userId]);

  const handleCompleteRecipeVoice = async () => {
    if (!cookingRecipe) return;
    setIsConsuming(true);
    setCookingSuccessMessage(null);
    try {
      const results = await consumeIngredientsFromPantry(userId, cookingRecipe, familyCount);
      const consumedList = results
        .filter(r => r.status !== 'not_found')
        .map(r => r.pantryItemName)
        .join(', ');
      
      let speechResponse = `Hai completato la ricetta ${cookingRecipe.title}!`;
      if (consumedList) {
        speechResponse += ` Ho tolto dalla tua dispensa: ${consumedList}. Buon appetito!`;
        setCookingSuccessMessage(`Complimenti! Ricetta completata con successo. Ho scaricato dalla tua dispensa: ${consumedList}. 🎉`);
      } else {
        speechResponse += ` Tutti gli ingredienti erano di base e la dispensa è rimasta invariata. Buon appetito!`;
        setCookingSuccessMessage(`Complimenti! Ricetta completata con successo. Tutti gli ingredienti erano di base e la dispensa è rimasta invariata. 🎉`);
      }
      speakFeedback(speechResponse);
      
      // Auto close after 5 seconds of displaying result
      setTimeout(() => {
        setCookingRecipe(null);
        setCookingSuccessMessage(null);
      }, 5000);
    } catch (e) {
      console.error(e);
      speakFeedback("Si è verificato un errore durante la detrazione degli ingredienti.");
      setCookingSuccessMessage("Errore durante la detrazione degli ingredienti dalla dispensa.");
    } finally {
      setIsConsuming(false);
    }
  };

  // Handle visual response speech feedback
  const speakFeedback = (text: string) => {
    setActionFeedback(text);
    setTimeout(() => {
      setActionFeedback(null);
    }, 4500);

    if (soundEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'it-IT';
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Setup Web Speech API Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition API not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'it-IT';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
      setInterimTranscript('');
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (final) {
        setTranscript(final);
        handleSpeechCommand(final);
      } else {
        setInterimTranscript(interim);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech Recognition error:", event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        speakFeedback("Permesso per il microfono negato. Controlla le impostazioni.");
        setShowMicHelpModal(true);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [allRecipes, profile, activeTab, cookingRecipe, currentStep]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('voice-assistant-listening-change', { detail: { isListening } }));
  }, [isListening]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Il controllo vocale non è supportato in questo browser. Ti consigliamo di usare Google Chrome o Apple Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn("Exception starting speech recognition:", e);
      }
    }
  };

  const toggleListeningRef = useRef(toggleListening);
  useEffect(() => {
    toggleListeningRef.current = toggleListening;
  }, [toggleListening]);

  useEffect(() => {
    const handleToggleEvent = () => {
      toggleListeningRef.current();
    };
    window.addEventListener('toggle-voice-assistant', handleToggleEvent);
    return () => {
      window.removeEventListener('toggle-voice-assistant', handleToggleEvent);
    };
  }, []);

  // Execute actual command logic from transcripts
  const handleSpeechCommand = async (rawText: string) => {
    const cmd = rawText.toLowerCase().trim();
    console.log("Comando vocale:", cmd);

    // 1. NAVIGATION TAB COMMANDS
    if (cmd.includes("vai al menu") || cmd.includes("vai a menu") || cmd.includes("apri menu") || cmd.includes("piano settimanale") || cmd.includes("mostra menu")) {
      setActiveTab('planner');
      speakFeedback("Aperto il piano settimanale.");
      return;
    }
    if (cmd.includes("apri dispensa") || cmd.includes("vai alla dispensa") || cmd.includes("mostra la dispensa") || cmd.includes("cosa ho in dispensa")) {
      setActiveTab('pantry');
      speakFeedback("Aperta la dispensa.");
      return;
    }
    if (cmd.includes("apri spesa") || cmd.includes("vai alla spesa") || cmd.includes("lista della spesa") || cmd.includes("mostra la spesa")) {
      setActiveTab('shopping');
      speakFeedback("Aperta la lista della spesa.");
      return;
    }
    if (cmd.includes("apri famiglia") || cmd.includes("vai a famiglia") || cmd.includes("membri della famiglia") || cmd.includes("apri impostazioni")) {
      setActiveTab('family');
      speakFeedback("Aperte le impostazioni familiari.");
      return;
    }
    if (cmd.includes("apri ricette") || cmd.includes("vai a ricette") || cmd.includes("le ricette") || cmd.includes("mostra ricette")) {
      setActiveTab('recipes');
      speakFeedback("Aperta la lista delle ricette.");
      return;
    }
    if (cmd.includes("apri offerte") || cmd.includes("vai a offerte") || cmd.includes("apri volantino") || cmd.includes("mostra offerte")) {
      setActiveTab('offers');
      speakFeedback("Aperta l'analisi dei volantini di spesa.");
      return;
    }
    if (cmd.includes("apri guida") || cmd.includes("apri piramide") || cmd.includes("mostra piramide")) {
      setActiveTab('guide');
      speakFeedback("Aperto il tempio nutrizionale OMS.");
      return;
    }

    // 2. HANDS-FREE COOKING PROCESS NAVIGATION
    if (cookingRecipe) {
      if (cmd.includes("finito") || cmd.includes("ricetta completata") || cmd.includes("completa ricetta") || cmd.includes("concludi") || cmd.includes("fatto")) {
        handleCompleteRecipeVoice();
        return;
      }
      if (cmd.includes("prossimo") || cmd.includes("avanti") || cmd.includes("successivo") || cmd.includes("passaggio successivo")) {
        const next = Math.min(cookingRecipe.instructions.length - 1, currentStep + 1);
        if (next === currentStep) {
          speakFeedback("Hai completato la ricetta! Buon appetito!");
        } else {
          setCurrentStep(next);
          speakFeedback(`Passaggio ${next + 1}: ${cookingRecipe.instructions[next]}`);
        }
        return;
      }
      if (cmd.includes("indietro") || cmd.includes("precedente") || cmd.includes("passaggio precedente") || cmd.includes("torna indietro")) {
        const prev = Math.max(0, currentStep - 1);
        setCurrentStep(prev);
        speakFeedback(`Passaggio ${prev + 1}: ${cookingRecipe.instructions[prev]}`);
        return;
      }
      if (cmd.includes("ripeti") || cmd.includes("leggi ancora") || cmd.includes("riproduci") || cmd.includes("riprendi")) {
        speakFeedback(`Passaggio ${currentStep + 1}: ${cookingRecipe.instructions[currentStep]}`);
        return;
      }
      if (cmd.includes("chiudi") || cmd.includes("esci") || cmd.includes("stop") || cmd.includes("termina")) {
        const title = cookingRecipe.title;
        setCookingRecipe(null);
        speakFeedback(`Preparazione di ${title} completata.`);
        return;
      }
    }

    // 3. START PREPARING A RECIPE COMMAND
    if (cmd.includes("avvia preparazione") || cmd.includes("prepara") || cmd.includes("cucina") || cmd.includes("inizia a cucinare")) {
      let recipeQuery = cmd
        .replace("avvia preparazione", "")
        .replace("prepara", "")
        .replace("cucina", "")
        .replace("inizia a cucinare", "")
        .replace("la ricetta", "")
        .replace("il", "")
        .replace("la", "")
        .trim();

      if (recipeQuery.length > 2) {
        // Find best recipe match
        const matchingRecipe = allRecipes.find(r => 
          cleanMatchTerm(r.title).includes(cleanMatchTerm(recipeQuery)) ||
          cleanMatchTerm(recipeQuery).includes(cleanMatchTerm(r.title))
        );

        if (matchingRecipe) {
          setCookingRecipe(matchingRecipe);
          setCurrentStep(0);
          speakFeedback(`Avvio preparazione della ricetta: ${matchingRecipe.title}. Avremo ${matchingRecipe.instructions.length} passaggi. Passaggio 1: ${matchingRecipe.instructions[0]}`);
          return;
        } else {
          speakFeedback(`Non ho trovato nessuna ricetta chiamata ${recipeQuery}. Cerca di essere più specifico.`);
          return;
        }
      }
    }

    // 4. ADD INGREDIENT TO SHOPPING LIST COMMAND
    if (cmd.includes("aggiungi") && (cmd.includes("alla spesa") || cmd.includes("alla lista della spesa") || cmd.includes("nella spesa") || cmd.includes("compra"))) {
      let rawIng = cmd
        .replace("aggiungi", "")
        .replace("alla spesa", "")
        .replace("alla lista della spesa", "")
        .replace("nella spesa", "")
        .replace("compra", "")
        .replace("la", "")
        .replace("il", "")
        .replace("delle", "")
        .replace("degli", "")
        .replace("del", "")
        .replace("di", "")
        .replace("un po' di", "")
        .trim();
        
      if (rawIng) {
        // Capitalize 
        const ingName = rawIng.charAt(0).toUpperCase() + rawIng.slice(1);
        const voiceShoppingPath = `users/${userId}/voiceShoppingItems`;
        
        try {
          await addDoc(collection(db, voiceShoppingPath), {
            name: ingName,
            amount: 1,
            unit: 'pz',
            needed: true,
            createdAt: new Date().toISOString()
          });
          speakFeedback(`Ho aggiunto ${ingName} alla tua lista della spesa.`);
          setActiveTab('shopping');
        } catch (e) {
          console.error("Error adding voice item:", e);
          speakFeedback("Si è verificato un errore aggiungendo l'ingrediente.");
        }
        return;
      }
    }

    // 5. ADD INGREDIENT TO PANTRY COMMAND
    if (cmd.includes("aggiungi") && (cmd.includes("alla dispensa") || cmd.includes("in dispensa") || cmd.includes("ho in dispensa") || cmd.includes("ho"))) {
      let rawIng = cmd
        .replace("aggiungi", "")
        .replace("alla dispensa", "")
        .replace("in dispensa", "")
        .replace("ho in dispensa", "")
        .replace("ho", "")
        .replace("la", "")
        .replace("il", "")
        .replace("della", "")
        .replace("del", "")
        .replace("dei", "")
        .trim();

      if (rawIng.length > 1) {
        const ingName = rawIng.charAt(0).toUpperCase() + rawIng.slice(1);
        const pantryPath = `users/${userId}/pantry`;

        try {
          await addDoc(collection(db, pantryPath), {
            name: ingName,
            quantity: 1,
            unit: 'pz',
            category: 'Altro'
          });
          speakFeedback(`Ho aggiunto ${ingName} alla tua dispensa.`);
          setActiveTab('pantry');
        } catch (e) {
          console.error("Error adding pantry item:", e);
          speakFeedback("Errore nell'aggiunta alla dispensa.");
        }
        return;
      }
    }

    // 6. EXCLUDE ALIMENTO (ALLERGY/EXCLUSION) COMMAND
    if (cmd.includes("escludi") || cmd.includes("allergia a") || cmd.includes("evita") || cmd.includes("allergico a")) {
      let rawIng = cmd
        .replace("escludi", "")
        .replace("allergia a", "")
        .replace("allergico a", "")
        .replace("evita", "")
        .replace("il", "")
        .replace("la", "")
        .replace("i", "")
        .replace("gli", "")
        .replace("le", "")
        .trim();

      if (rawIng && profile) {
        const ingName = rawIng.charAt(0).toUpperCase() + rawIng.slice(1);
        const current = profile.excludedIngredients || [];
        if (!current.includes(ingName)) {
          const updated = [...current, ingName];
          const path = `users/${userId}`;
          try {
            await setDoc(doc(db, path), {
              ...profile,
              excludedIngredients: updated
            }, { merge: true });
            speakFeedback(`Ho aggiunto ${ingName} alle tue esclusioni alimentari. I prossimi menu eviteranno questo ingrediente.`);
            setActiveTab('family');
          } catch (e) {
            console.error("Error writing exclusion:", e);
            speakFeedback("Errore nel salvare l'esclusione.");
          }
        } else {
          speakFeedback(`${ingName} è già escluso.`);
        }
        return;
      }
    }

    // 7. SEARCH RECIPES COMMAND
    if (cmd.includes("cerca") || cmd.includes("cerca ricette con") || cmd.includes("trova ricette")) {
      let searchQueryText = cmd
        .replace("cerca ricette con", "")
        .replace("cerca ricette", "")
        .replace("cerca", "")
        .replace("trova ricette con", "")
        .replace("trova ricette", "")
        .replace("le", "")
        .replace("la", "")
        .trim();

      if (searchQueryText.length > 1) {
        setVoiceSearchQuery(searchQueryText);
        setActiveTab('recipes');
        speakFeedback(`Sto cercando ricette corrispondenti a: ${searchQueryText}.`);
        return;
      }
    }

    // Unrecognized command fallback
    speakFeedback("Non ho capito bene il comando. Puoi dire: aggiungi uova alla spesa, escludi farina, cerca riso o apri dispensa.");
  };

  return (
    <>
      <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
        {/* Floating Voice Assistant Action Bar & Micro-Feedback */}
        <AnimatePresence>
          {actionFeedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="bg-indigo-950 text-indigo-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 backdrop-blur-md max-w-xs border border-indigo-500/30 font-semibold text-xs pointer-events-auto"
            >
              <div className="bg-indigo-500 p-1.5 rounded-lg text-white">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <p className="leading-snug">{actionFeedback}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xl flex items-center gap-4 w-72 pointer-events-auto"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                  <Mic className="w-4 h-4 animate-bounce" />
                </div>
                <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-25" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] uppercase font-bold text-indigo-600 block tracking-wider">Assistente Vocale attivo</span>
                <p className="text-slate-700 font-medium text-xs truncate italic">
                  {interimTranscript || transcript || "Parla adesso..."}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Big voice mic bubble activator */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Mute output button */}
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-3 rounded-full border shadow-lg transition-all active:scale-90 flex items-center justify-center bg-white border-slate-200 text-slate-500 hover:bg-slate-50`}
            title={soundEnabled ? "Disattiva feedback vocale" : "Attiva feedback vocale"}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          <button
            onClick={toggleListening}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all cursor-pointer active:scale-95 duration-150 ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600 ring-4 ring-red-200' 
                : 'bg-indigo-600 hover:bg-indigo-700 ring-4 ring-indigo-100 hover:shadow-indigo-200'
            }`}
            title="Controllo Vocale"
            id="mic-vocal-trigger-btn"
          >
            <Mic className={`w-6 h-6 ${isListening ? 'animate-pulse' : ''}`} />
          </button>
        </div>
      </div>

      {/* Hands-free Cooking overlay when a recipe is active */}
      <AnimatePresence>
        {cookingRecipe && (
          <div className="fixed inset-0 bg-slate-950/95 z-[60] flex flex-col justify-between p-6 md:p-12 text-white">
            {/* Header section with Recipe metadata */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-500 p-2.5 rounded-2xl">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-lg md:text-xl">{cookingRecipe.title}</h3>
                  <p className="text-xs text-indigo-300 md:text-sm flex items-center gap-2 mt-0.5">
                    <span>Cottura Vivavoce</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {cookingRecipe.timeMin} min</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const next = Math.max(0, currentStep - 1);
                    setCurrentStep(next);
                    speakFeedback(`Passaggio ${next + 1}: ${cookingRecipe.instructions[next]}`);
                  }}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-xl cursor-pointer text-white"
                  title="Passaggio Prima (Indietro)"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="text-indigo-200 font-extrabold text-sm px-3 bg-white/10 rounded-xl py-2">
                  Passaggio {currentStep + 1} di {cookingRecipe.instructions.length}
                </div>
                <button
                  onClick={() => {
                    const next = Math.min(cookingRecipe.instructions.length - 1, currentStep + 1);
                    setCurrentStep(next);
                    speakFeedback(`Passaggio ${next + 1}: ${cookingRecipe.instructions[next]}`);
                  }}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-xl cursor-pointer text-white"
                  title="Passaggio Dopo (Avanti)"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => speakFeedback(cookingRecipe.instructions[currentStep])}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-xl cursor-pointer text-white"
                  title="Ripeti passaggio"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCookingRecipe(null)}
                  className="p-3 bg-red-500/20 hover:bg-red-500/40 rounded-xl text-red-300 transition-colors"
                  title="Chiudi preparazione vocale"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Huge current cooking step display */}
            <div className="my-auto max-w-4xl mx-auto text-center space-y-6 md:space-y-8 py-8">
              {cookingSuccessMessage ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 bg-emerald-500/20 border border-emerald-500/30 text-emerald-100 rounded-3xl space-y-3"
                >
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h4 className="text-xl font-bold">Complimenti!</h4>
                  <p className="text-sm md:text-base">{cookingSuccessMessage}</p>
                </motion.div>
              ) : (
                <>
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-4"
                  >
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block bg-indigo-500/10 w-fit mx-auto px-4 py-1.5 rounded-full border border-indigo-500/20">
                      Istruzione Attiva
                    </span>
                    <p className="text-2xl md:text-4xl lg:text-5xl font-bold leading-normal text-indigo-50">
                      {cookingRecipe.instructions[currentStep]}
                    </p>
                  </motion.div>

                  {/* Complete button shown during prep */}
                  <div className="pt-8">
                    <button
                      onClick={handleCompleteRecipeVoice}
                      disabled={isConsuming}
                      className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-400 text-white text-sm font-bold rounded-2xl transition-all shadow-lg hover:shadow-emerald-950/30 flex items-center gap-2 mx-auto cursor-pointer active:scale-95"
                    >
                      <ChefHat className="w-4 h-4" />
                      {isConsuming ? "Completamento in corso..." : "Completa Ricetta (Scala ingredienti dalla dispensa)"}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Vocals Commands Helper Cheatsheet Footer */}
            <div className="border-t border-white/10 pt-6">
              <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-400 block tracking-wider mb-1">Cottura a mani libere</span>
                  <p className="text-xs text-slate-400">Parla ad alta voce dopo aver attivato il microfono. Prova questi comandi:</p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-300">
                  <span className="bg-white/10 px-3 py-1 rounded-full border border-white/5">"Avanti" / "Prossimo"</span>
                  <span className="bg-white/10 px-3 py-1 rounded-full border border-white/5">"Indietro"</span>
                  <span className="bg-white/10 px-3 py-1 rounded-full border border-white/5">"Ripeti"</span>
                  <span className="bg-white/10 px-3 py-1 rounded-full border border-white/5">"Finito" / "Completa"</span>
                  <span className="bg-white/10 px-3 py-1 rounded-full border border-white/5">"Chiudi"</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Help Modal for Microphone Permissions/Iframe blocking */}
      <AnimatePresence>
        {showMicHelpModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 shadow-2xl max-w-md w-full relative border border-slate-100"
            >
              <button
                onClick={() => setShowMicHelpModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                title="Chiudi questa finestra"
              >
                <X size={18} />
              </button>

              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                  <MicOff className="w-6 h-6" />
                </div>
                
                <div>
                  <h3 className="text-base font-bold text-slate-900">Perché non riusciamo ad attivare il microfono?</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Questo può accadere per due motivi molto comuni. Ecco come sbloccarlo all'istante:
                  </p>
                </div>

                <div className="w-full space-y-3 pt-2 text-left">
                  {/* Step 1 */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex gap-3 text-xs leading-relaxed text-slate-755">
                    <span className="flex items-center justify-center bg-indigo-600 text-white font-bold rounded-full w-5 h-5 text-[10px] shrink-0 mt-0.5">1</span>
                    <div>
                      <p className="font-semibold text-slate-900 text-xs">Abilita il permesso nel Browser</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                        Assicurati di fare clic su <strong>"Consenti"</strong> nella richiesta di autorizzazione del browser. Se l'hai negata in precedenza, clicca sull'icona del <strong>Lucchetto 🔒 o del Microfono 🎤</strong> a sinistra dell'indirizzo del sito nella barra superiore e imposta su <em>Consenti</em>.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 (Iframe specific) */}
                  <div className="p-3.5 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 flex gap-3 text-xs leading-relaxed text-indigo-950">
                    <span className="flex items-center justify-center bg-indigo-600 text-white font-bold rounded-full w-5 h-5 text-[10px] shrink-0 mt-0.5">2</span>
                    <div>
                      <p className="font-semibold text-indigo-950 text-xs shadow-none">Apri l'app in una Nuova Scheda</p>
                      <p className="text-[11px] text-indigo-700 mt-0.5 leading-normal">
                        Molti browser (in particolare Chrome e Safari) applicano rigidi blocchi di sicurezza se il microfono viene attivato all'interno di un'anteprima (iframe). 
                        Risolvi subito cliccando su <strong>"Apri l'app in un'altra scheda"</strong> o usa il link qui sotto.
                      </p>
                      <a 
                        href={window.location.href} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-indigo-700 hover:text-indigo-800 underline active:scale-95 cursor-pointer"
                      >
                        Apri in nuova scheda ora ↗
                      </a>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowMicHelpModal(false)}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-95"
                >
                  Riprova o Chiudi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
