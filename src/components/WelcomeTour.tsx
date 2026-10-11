import React, { useState, useEffect } from 'react';
import { Sparkles, Users, Heart, Calendar, ArrowRight, ChevronLeft, ChevronRight, X, CheckCircle2, ShieldCheck } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';

interface WelcomeTourProps {
  user: any;
  profile: UserProfile | null;
  onNavigateToFamily: () => void;
}

export default function WelcomeTour({ user, profile, onNavigateToFamily }: WelcomeTourProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Check localStorage first for immediate responsiveness
    const storageKey = `welcome_tour_completed_${user.uid}`;
    const localCompleted = localStorage.getItem(storageKey) === 'true';

    if (profile?.hasCompletedWelcomeTour || localCompleted) {
      setIsOpen(false);
      return;
    }

    if (!profile) return;

    // Detect if profile is empty or recently created
    const createdAtTime = profile.createdAt ? new Date(profile.createdAt).getTime() : 0;
    const isRecent = (Date.now() - createdAtTime) < 7 * 24 * 60 * 60 * 1000; // 7 days
    const isEmptyDiet = (!profile.dietaryRestrictions || profile.dietaryRestrictions.length === 0) &&
                        (!profile.excludedIngredients || profile.excludedIngredients.length === 0);

    if (isRecent || isEmptyDiet) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [user, profile]);

  const handleCompleteTour = async (navigateToFamily: boolean) => {
    setIsOpen(false);
    if (user?.uid) {
      const storageKey = `welcome_tour_completed_${user.uid}`;
      localStorage.setItem(storageKey, 'true');

      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          hasCompletedWelcomeTour: true
        });
      } catch (err) {
        console.error("Error updating tour status in Firestore:", err);
      }
    }

    if (navigateToFamily) {
      onNavigateToFamily();
    }
  };

  if (!isOpen) return null;

  const steps = [
    {
      icon: Sparkles,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-100',
      badge: 'BENVENUTO',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      title: 'Benvenuto in Che Cucino Oggi?',
      subtitle: 'Il menù di casa, senza il pensiero della sera',
      description: 'Basta con il "cosa mangiamo stasera?". Costruisci in pochi tocchi un menù settimanale di stagione e equilibrato, con la spesa già pronta e la dispensa sempre sotto controllo.',
      highlights: [
        'Menù stagionali conformi alle linee guida OMS',
        'Lista della spesa automatizzata per reparti',
        'Sincronizzazione intelligente con la tua dispensa'
      ]
    },
    {
      icon: Heart,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100',
      badge: 'PASSO 1 ESSENZIALE',
      badgeColor: 'bg-red-50 text-red-800 border-red-200',
      title: 'Imposta le Preferenze Alimentari',
      subtitle: 'Il primo step per creare un menù su misura per voi',
      description: 'Prima di generare il tuo primo piano settimanale, è fondamentale configurare le restrizioni della tua famiglia (es. Vegano, Senza Glutine, Senza Lattosio) e inserire eventuali allergie specifiche nella sezione Famiglia.',
      highlights: [
        'Filtro automatico di tutte le ricette proposte dall\'IA',
        'Sicurezza totale a tavola per allergie o intolleranze',
        'Esclusione mirata di ingredienti sgraditi o indesiderati'
      ]
    },
    {
      icon: Users,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      badge: 'PASSO 2',
      badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
      title: 'Configura i Membri della Famiglia',
      subtitle: 'Porzioni e nutrizione calibrate per adulti e bambini',
      description: 'Registra i componenti del nucleo familiare specificando se sono adulti o bambini. L\'algoritmo calcolerà il corretto fabbisogno nutrizionale ed eviterà di preparare porzioni eccessive o insufficienti.',
      highlights: [
        'Calcolo delle porzioni ottimizzato per fasce d\'età',
        'Integrazione di ricette gradite anche ai bambini',
        'Prevenzione ed eliminazione degli sprechi alimentari'
      ]
    },
    {
      icon: Calendar,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-100',
      badge: 'PRONTI A PARTIRE',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      title: 'Genera il Tuo Primo Menù!',
      subtitle: 'Tutto pronto in meno di un minuto',
      description: 'Una volta completate le impostazioni nella sezione Famiglia, clicca sul pulsante di generazione nel Menù e lasciati ispirare o crea la tua lista della spesa intelligente in un solo clic.',
      highlights: [
        'Pianificazione completa dal lunedì alla domenica',
        'Sostituzione rapida di ogni singolo piatto o pasto',
        'Esportazione PDF e invio su WhatsApp istantaneo'
      ]
    }
  ];

  const current = steps[currentStep];
  const IconComponent = current.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col transform transition-all duration-300">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${current.badgeColor}`}>
              {current.badge}
            </span>
            <span className="text-xs font-semibold text-gray-400">
              Passo {currentStep + 1} di {steps.length}
            </span>
          </div>
          <button
            onClick={() => handleCompleteTour(false)}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="Chiudi introduzione"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 flex-1">
          <div className="flex items-start gap-4 mb-6">
            <div className={`p-3.5 rounded-2xl ${current.iconBg} ${current.iconColor} shadow-sm shrink-0`}>
              <IconComponent className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mb-1">
                {current.title}
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-emerald-700">
                {current.subtitle}
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed mb-6">
            {current.description}
          </p>

          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Punti Chiave:
            </div>
            {current.highlights.map((point, idx) => (
              <div key={idx} className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-gray-700">{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Dots & Navigation Footer */}
        <div className="px-6 py-5 bg-gray-50/80 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentStep ? 'w-6 bg-emerald-600' : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Vai al passo ${idx + 1}`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {currentStep > 0 ? (
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-200/60 transition-all flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                Indietro
              </button>
            ) : (
              <button
                onClick={() => handleCompleteTour(false)}
                className="px-3 py-2 text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors"
              >
                Salta introduzione
              </button>
            )}

            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(prev => prev - 1 + 2)}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
              >
                Avanti
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => handleCompleteTour(true)}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 group animate-bounce"
              >
                <span>Imposta ora in Famiglia</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
