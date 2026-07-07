import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, 
  Coins, 
  Cpu, 
  Cloud, 
  Users, 
  Layers, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  Info,
  DollarSign,
  Percent,
  Check,
  Building,
  Target,
  X,
  CreditCard,
  Lock,
  Sparkles,
  Award,
  Wallet,
  Smartphone,
  Fingerprint,
  FileText,
  Download,
  AlertCircle,
  Terminal,
  Sliders,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';
import { jsPDF } from 'jspdf';

interface BusinessModelProps {
  userId: string;
  profile?: UserProfile | null;
  isAdmin?: boolean;
  onProfileUpdate?: (profile: UserProfile | null) => void;
  hasMealPlan?: boolean;
  hasFamilyMember?: boolean;
}

export default function BusinessModel({ 
  userId, 
  profile, 
  isAdmin = false, 
  onProfileUpdate,
  hasMealPlan = false,
  hasFamilyMember = false
}: BusinessModelProps) {
  // Simulator State variables
  const [mau, setMau] = useState<number>(1000); // Monthly Active Users
  const [payingConversionRateStandard, setPayingConversionRateStandard] = useState<number>(5); // % of MAU subscribing to Standard (2.99)
  const [payingConversionRatePro, setPayingConversionRatePro] = useState<number>(3); // % of MAU subscribing to Pro (5.99)
  
  // Checkout modal states
  const [showCheckout, setShowCheckout] = useState<boolean>(false);
  const [checkoutPlan, setCheckoutPlan] = useState<'smart' | 'pro' | null>(null);
  const [selectedGateway, setSelectedGateway] = useState<'gpay' | 'googleplay'>('gpay');
  
  // Payment states
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  
  // Google Pay specific biometric state
  const [isBiometricScanning, setIsBiometricScanning] = useState<boolean>(false);
  const [biometricProgress, setBiometricProgress] = useState<number>(0);
  
  // Google Play Billing native state
  const [isPlayBillingLoading, setIsPlayBillingLoading] = useState<boolean>(false);

  // Active Plan Level For Current User
  const currentPlan = profile?.plan || 'free';
  const invoiceHistory = profile?.paymentHistory || [];

  // Real Cost structures (Monthly basis in €)
  const costs = useMemo(() => {
    const serverHostingCost = 15 + Math.max(0, (mau - 100) * 0.008);
    const databaseCost = Math.max(0, mau * 0.00018);
    const proUsers = mau * (payingConversionRatePro / 100);
    const freeUsersAiEstimate = mau * 0.05;
    const totalAiInvocations = (proUsers * 4) + (freeUsersAiEstimate * 0.2);
    const geminiApiCost = totalAiInvocations * 0.0025;
    const operationalCost = 25 + (mau * 0.001);
    const totalCost = serverHostingCost + databaseCost + geminiApiCost + operationalCost;

    return {
      serverHostingCost,
      databaseCost,
      geminiApiCost,
      operationalCost,
      totalCost
    };
  }, [mau, payingConversionRatePro]);

  // Revenues structures
  const financialReport = useMemo(() => {
    const standardUsersCount = Math.round(mau * (payingConversionRateStandard / 100));
    const proUsersCount = Math.round(mau * (payingConversionRatePro / 100));
    const freeUsersCount = Math.max(0, mau - standardUsersCount - proUsersCount);

    const priceStandard = 2.99;
    const pricePro = 5.99;

    const revenueStandard = standardUsersCount * priceStandard;
    const revenuePro = proUsersCount * pricePro;
    const totalRevenue = revenueStandard + revenuePro;

    const netProfit = totalRevenue - costs.totalCost;
    const marginPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    const breakEvenUsers = totalRevenue > 0 ? Math.ceil((costs.totalCost / (totalRevenue / mau))) : 0;

    return {
      standardUsersCount,
      proUsersCount,
      freeUsersCount,
      revenueStandard,
      revenuePro,
      totalRevenue,
      netProfit,
      marginPercent,
      breakEvenUsers
    };
  }, [mau, payingConversionRateStandard, payingConversionRatePro, costs]);

  // Handle Checkout Open Click
  const handleOpenCheckout = (plan: 'smart' | 'pro') => {
    setCheckoutPlan(plan);
    setCheckoutError(null);
    setPaymentSuccess(false);
    setSelectedGateway('gpay');
    setShowCheckout(true);
    setIsBiometricScanning(false);
    setBiometricProgress(0);
    setIsPlayBillingLoading(false);
  };

  // Google Pay Biometric Scan simulation
  const handleGPayTouchStart = () => {
    if (isProcessingPayment || paymentSuccess) return;
    setIsBiometricScanning(true);
    setBiometricProgress(0);
    setCheckoutError(null);
  };

  useEffect(() => {
    let interval: any;
    if (isBiometricScanning && biometricProgress < 100) {
      interval = setInterval(() => {
        setBiometricProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            handleCompleteGPayPayment();
            return 100;
          }
          return prev + 5;
        });
      }, 70);
    }
    return () => clearInterval(interval);
  }, [isBiometricScanning, biometricProgress]);

  const handleGPayTouchEnd = () => {
    if (biometricProgress < 100) {
      setIsBiometricScanning(false);
      setBiometricProgress(0);
    }
  };

  const handleCompleteGPayPayment = async () => {
    setIsBiometricScanning(false);
    setIsProcessingPayment(true);

    setTimeout(async () => {
      try {
        if (checkoutPlan) {
          const currentHistory = profile?.paymentHistory || [];
          const mockTxId = `gpay_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

          const newPayment = {
            transactionId: mockTxId,
            plan: checkoutPlan,
            amount: checkoutPlan === 'smart' ? 2.99 : 5.99,
            date: new Date().toISOString(),
            status: 'paid' as const,
            paymentMethod: 'gpay' as const,
          };

          const updatedHistory = [newPayment, ...currentHistory];

          if (userId === 'demo-family-user' || userId.startsWith('local-')) {
            const updatedProfile: UserProfile = {
              ...(profile || {
                id: userId,
                name: 'Famiglia Demo',
                email: 'demo@che-cucino-oggi.it',
                dietaryRestrictions: [],
                excludedIngredients: [],
                createdAt: new Date().toISOString()
              }),
              plan: checkoutPlan,
              paymentHistory: updatedHistory,
              subscriptionStatus: 'active',
              autoRenew: true
            };
            localStorage.setItem(`profile_${userId}`, JSON.stringify(updatedProfile));
            if (onProfileUpdate) {
              onProfileUpdate(updatedProfile);
            }
          } else {
            const userRef = doc(db, 'users', userId);
            await setDoc(userRef, {
              plan: checkoutPlan,
              paymentHistory: updatedHistory,
              subscriptionStatus: 'active',
              autoRenew: true
            }, { merge: true });
          }

          setPaymentSuccess(true);
          setIsProcessingPayment(false);

          setTimeout(() => {
            setShowCheckout(false);
            setPaymentSuccess(false);
          }, 2500);
        }
      } catch (e) {
        console.error(e);
        setCheckoutError("Errore nell'attivazione del piano.");
        setIsProcessingPayment(false);
      }
    }, 1500);
  };

  // Google Play Billing (IAP Android) simulation
  const handleGooglePlaySubscribe = async () => {
    if (!checkoutPlan) return;
    setIsPlayBillingLoading(true);
    setCheckoutError(null);

    setTimeout(async () => {
      try {
        const currentHistory = profile?.paymentHistory || [];
        const mockTxId = `gplay_iap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const newPayment = {
          transactionId: mockTxId,
          plan: checkoutPlan,
          amount: checkoutPlan === 'smart' ? 2.99 : 5.99,
          date: new Date().toISOString(),
          status: 'paid' as const,
          paymentMethod: 'googleplay' as const,
        };

        const updatedHistory = [newPayment, ...currentHistory];

        if (userId === 'demo-family-user' || userId.startsWith('local-')) {
          const updatedProfile: UserProfile = {
            ...(profile || {
              id: userId,
              name: 'Famiglia Demo',
              email: 'demo@che-cucino-oggi.it',
              dietaryRestrictions: [],
              excludedIngredients: [],
              createdAt: new Date().toISOString()
            }),
            plan: checkoutPlan,
            paymentHistory: updatedHistory,
            subscriptionStatus: 'active',
            autoRenew: true
          };
          localStorage.setItem(`profile_${userId}`, JSON.stringify(updatedProfile));
          if (onProfileUpdate) {
            onProfileUpdate(updatedProfile);
          }
        } else {
          const userRef = doc(db, 'users', userId);
          await setDoc(userRef, {
            plan: checkoutPlan,
            paymentHistory: updatedHistory,
            subscriptionStatus: 'active',
            autoRenew: true
          }, { merge: true });
        }

        setIsPlayBillingLoading(false);
        setPaymentSuccess(true);

        setTimeout(() => {
          setShowCheckout(false);
          setPaymentSuccess(false);
        }, 2500);
      } catch (err) {
        console.error(err);
        setCheckoutError("Impossibile connettersi al Google Play Service.");
        setIsPlayBillingLoading(false);
      }
    }, 2000);
  };

  // Downgrade / Cancel Subscription
  const handleDowngradeToFree = async () => {
    if (window.confirm("Vuoi davvero disdire il tuo abbonamento e tornare al piano Famiglia Base gratuito?")) {
      try {
        if (userId === 'demo-family-user' || userId.startsWith('local-')) {
          const updatedProfile: UserProfile = {
            ...(profile || {
              id: userId,
              name: 'Famiglia Demo',
              email: 'demo@che-cucino-oggi.it',
              dietaryRestrictions: [],
              excludedIngredients: [],
              createdAt: new Date().toISOString()
            }),
            plan: 'free',
            subscriptionStatus: undefined,
            autoRenew: false
          };
          localStorage.setItem(`profile_${userId}`, JSON.stringify(updatedProfile));
          if (onProfileUpdate) {
            onProfileUpdate(updatedProfile);
          }
        } else {
          const userRef = doc(db, 'users', userId);
          await setDoc(userRef, {
            plan: 'free',
            subscriptionStatus: null,
            autoRenew: false
          }, { merge: true });
        }
        alert("Abbonamento disdetto correttamente. Sei tornato al Piano Base Gratuito.");
      } catch (e) {
        console.error(e);
        alert("Errore durante il downgrade del piano.");
      }
    }
  };

  // PDF Invoice Builder using jsPDF
  const handleDownloadInvoice = (invoice: any) => {
    try {
      const docPdf = new jsPDF();
      
      const primaryColor = '#4f46e5'; 
      const darkColor = '#0f172a'; 
      const lightColor = '#f8fafc'; 
      const grayColor = '#64748b'; 

      // Header Banner color block
      docPdf.setFillColor(79, 70, 229); 
      docPdf.rect(0, 0, 210, 40, 'F');

      // Title header
      docPdf.setTextColor(255, 255, 255);
      docPdf.setFont('helvetica', 'bold');
      docPdf.setFontSize(22);
      docPdf.text('RICEVUTA DI ADDEBITO', 15, 25);

      docPdf.setFontSize(10);
      docPdf.setFont('helvetica', 'normal');
      docPdf.text('CHE CUCINO OGGI? MEAL PLANNER', 140, 25);

      // Section: Transaction Details
      docPdf.setTextColor(darkColor);
      docPdf.setFontSize(12);
      docPdf.setFont('helvetica', 'bold');
      docPdf.text('DETTAGLI TRANSAZIONE', 15, 55);

      docPdf.setFontSize(10);
      docPdf.setFont('helvetica', 'normal');
      docPdf.text(`ID Transazione: ${invoice.transactionId}`, 15, 65);
      docPdf.text(`Data di addebito: ${new Date(invoice.date).toLocaleString('it-IT')}`, 15, 72);
      docPdf.text(`Metodo di Pagamento: ${invoice.paymentMethod.toUpperCase()}`, 15, 79);
      docPdf.text(`Stato Sottoscrizione: PAGATO (Rinnovo automatico)`, 15, 86);

      // Section: Client info
      docPdf.setFont('helvetica', 'bold');
      docPdf.text('INTESTATARIO / UTENTE', 120, 55);

      docPdf.setFont('helvetica', 'normal');
      docPdf.text(`Nome Profilo: ${profile?.name || 'Utente registrato'}`, 120, 65);
      docPdf.text(`Email associata: ${profile?.email || 'N/A'}`, 120, 72);
      docPdf.text(`Account ID: ${userId.substring(0, 12)}...`, 120, 79);

      // Grid header
      docPdf.setFillColor(248, 250, 252); 
      docPdf.rect(15, 100, 180, 8, 'F');
      
      docPdf.setFont('helvetica', 'bold');
      docPdf.text('Descrizione Prodotto', 18, 105);
      docPdf.text('Durata', 110, 105);
      docPdf.text('Prezzo Unitario', 140, 105);
      docPdf.text('Totale', 175, 105);

      // Grid Values
      docPdf.setFont('helvetica', 'normal');
      const planName = invoice.plan === 'pro' ? 'Abbonamento Mensile Chef IA & OCR Premium' : 'Abbonamento Mensile Famiglia Smart';
      docPdf.text(planName, 18, 117);
      docPdf.text('1 Mese', 110, 117);
      docPdf.text(`EUR ${invoice.amount.toFixed(2)}`, 140, 117);
      docPdf.text(`EUR ${invoice.amount.toFixed(2)}`, 175, 117);

      // Border line
      docPdf.setDrawColor(226, 232, 240); 
      docPdf.line(15, 125, 195, 125);

      // Calculations
      const subtotal = invoice.amount / 1.22;
      const tax = invoice.amount - subtotal;

      docPdf.text('Subtotale Imponibile:', 120, 135);
      docPdf.text(`EUR ${subtotal.toFixed(2)}`, 175, 135);

      docPdf.text('Aliquota IVA (22% inclusa):', 120, 142);
      docPdf.text(`EUR ${tax.toFixed(2)}`, 175, 142);

      docPdf.setFont('helvetica', 'bold');
      docPdf.text('Importo Totale Addebitato:', 120, 152);
      docPdf.text(`EUR ${invoice.amount.toFixed(2)}`, 175, 152);

      // Footer notes
      docPdf.setFont('helvetica', 'italic');
      docPdf.setFontSize(8);
      docPdf.setTextColor(grayColor);
      docPdf.text('La presente ricevuta costituisce prova fiscale di pagamento telematico.', 15, 180);
      docPdf.text('Per assistenza commerciale contattare support@checucinooggi.com o gestire la disdetta nel pannello utente.', 15, 185);

      docPdf.save(`Ricevuta_CheCucinoOggi_${invoice.transactionId.substring(0, 8)}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Si è verificato un errore durante la compilazione della ricevuta PDF.");
    }
  };

  const handleSimulateSubscription = async (plan: 'free' | 'smart' | 'pro', autoRenew: boolean, status: 'active' | 'pending_renewal' | undefined) => {
    try {
      const updatedProfile: UserProfile = {
        ...(profile || {
          id: userId,
          name: 'Famiglia Demo',
          email: 'demo@che-cucino-oggi.it',
          dietaryRestrictions: [],
          excludedIngredients: [],
          createdAt: new Date().toISOString()
        }),
        plan,
        autoRenew,
        subscriptionStatus: status
      };

      if (userId === 'demo-family-user' || userId.startsWith('local-')) {
        localStorage.setItem(`profile_${userId}`, JSON.stringify(updatedProfile));
        if (onProfileUpdate) {
          onProfileUpdate(updatedProfile);
        }
      } else {
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, {
          plan,
          autoRenew,
          subscriptionStatus: status || null
        }, { merge: true });
        
        if (onProfileUpdate) {
          onProfileUpdate(updatedProfile);
        }
      }
    } catch (e) {
      console.error("Errore durante la simulazione dello stato:", e);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* Sandbox & Debugging Console (Admin only) */}
      {isAdmin && (
        <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 bg-indigo-500/10 text-indigo-400 font-mono text-[9px] uppercase tracking-wider rounded-bl-xl border-l border-b border-slate-800">
            Console Sandbox Audit
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                Console di Test & Simulazione Abbonamenti
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] px-2 py-0.5 rounded-full uppercase font-mono font-bold animate-pulse">
                  Online
                </span>
              </h3>
              <p className="text-[10px] text-slate-400">
                Usa questa console di audit per forzare gli stati dell'abbonamento e verificare istantaneamente la reattività dei gate di sicurezza e dei badge.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
            {/* Preset Buttons */}
            <div className="lg:col-span-7 space-y-3">
              <span className="text-[9px] uppercase font-bold text-slate-500 block tracking-wider">Forza Stato Abbonamento</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSimulateSubscription('free', false, undefined)}
                  className={`py-2 px-3 text-left rounded-xl transition-all flex items-center gap-2 text-xs border cursor-pointer ${
                    currentPlan === 'free'
                      ? 'bg-slate-850 text-white border-slate-700 font-bold shadow-md shadow-indigo-500/10'
                      : 'bg-slate-950/50 hover:bg-slate-850 text-slate-400 border-transparent'
                  }`}
                >
                  <span className="text-sm">🆓</span>
                  <div className="leading-tight">
                    <span className="block font-bold">Piano Base (Free)</span>
                    <span className="text-[9px] opacity-75">Nessun abbonamento attivo</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSimulateSubscription('smart', true, 'active')}
                  className={`py-2 px-3 text-left rounded-xl transition-all flex items-center gap-2 text-xs border cursor-pointer ${
                    currentPlan === 'smart' && profile?.autoRenew !== false && profile?.subscriptionStatus !== 'pending_renewal'
                      ? 'bg-indigo-950/80 text-indigo-300 border-indigo-900/50 font-bold shadow-md shadow-indigo-500/20'
                      : 'bg-slate-950/50 hover:bg-slate-850 text-slate-400 border-transparent'
                  }`}
                >
                  <span className="text-sm">⚡</span>
                  <div className="leading-tight">
                    <span className="block font-bold">Smart (Attivo)</span>
                    <span className="text-[9px] opacity-75">Rinnovo auto attivo</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSimulateSubscription('smart', false, 'pending_renewal')}
                  className={`py-2 px-3 text-left rounded-xl transition-all flex items-center gap-2 text-xs border cursor-pointer ${
                    currentPlan === 'smart' && (profile?.autoRenew === false || profile?.subscriptionStatus === 'pending_renewal')
                      ? 'bg-amber-950/80 text-amber-300 border-amber-900/50 font-bold shadow-md shadow-amber-500/20'
                      : 'bg-slate-950/50 hover:bg-slate-850 text-slate-400 border-transparent'
                  }`}
                >
                  <span className="text-sm">⏳</span>
                  <div className="leading-tight">
                    <span className="block font-bold">Smart (In scadenza)</span>
                    <span className="text-[9px] opacity-75">In attesa di rinnovo</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSimulateSubscription('pro', true, 'active')}
                  className={`py-2 px-3 text-left rounded-xl transition-all flex items-center gap-2 text-xs border cursor-pointer ${
                    currentPlan === 'pro' && profile?.autoRenew !== false && profile?.subscriptionStatus !== 'pending_renewal'
                      ? 'bg-purple-950/80 text-purple-300 border-purple-900/50 font-bold shadow-md shadow-purple-500/20'
                      : 'bg-slate-950/50 hover:bg-slate-850 text-slate-400 border-transparent'
                  }`}
                >
                  <span className="text-sm">💎</span>
                  <div className="leading-tight">
                    <span className="block font-bold">Chef Pro (Attivo)</span>
                    <span className="text-[9px] opacity-75">Rinnovo auto attivo</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSimulateSubscription('pro', false, 'pending_renewal')}
                  className={`py-2 px-3 text-left rounded-xl transition-all flex items-center gap-2 text-xs border cursor-pointer ${
                    currentPlan === 'pro' && (profile?.autoRenew === false || profile?.subscriptionStatus === 'pending_renewal')
                      ? 'bg-purple-950/50 text-purple-400 border-purple-900/30 font-bold shadow-md shadow-purple-500/20'
                      : 'bg-slate-950/50 hover:bg-slate-850 text-slate-400 border-transparent'
                  }`}
                >
                  <span className="text-sm">⚠️</span>
                  <div className="leading-tight">
                    <span className="block font-bold">Chef Pro (In scadenza)</span>
                    <span className="text-[9px] opacity-75">In attesa di rinnovo</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Current Gates Status */}
            <div className="lg:col-span-5 bg-slate-950/40 border border-slate-800/80 p-4 rounded-2xl space-y-3">
              <span className="text-[9px] uppercase font-bold text-slate-500 block tracking-wider">Risposta dei Gate di Sicurezza</span>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800/40 pb-1.5">
                  <span className="text-slate-400">Pianificatore Avanzato</span>
                  <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                    currentPlan !== 'free' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {currentPlan !== 'free' ? '🔓 SBLOCCATO' : '🔒 BLOCCATO'}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-800/40 pb-1.5">
                  <span className="text-slate-400">Chef IA & OCR Volantini</span>
                  <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                    currentPlan === 'pro' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {currentPlan === 'pro' ? '🔓 SBLOCCATO' : '🔒 BLOCCATO'}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-800/40 pb-1.5">
                  <span className="text-slate-400">Membri Famiglia</span>
                  <span className="font-mono text-indigo-400 font-bold">
                    {currentPlan !== 'free' ? 'Illimitati' : 'Max 1'}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/40">
                  <span className="text-slate-400">Articoli in Dispensa</span>
                  <span className="font-mono text-indigo-400 font-bold">
                    {currentPlan !== 'free' ? 'Illimitati' : 'Max 15'}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 pt-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Lista della Spesa</span>
                    <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                      hasMealPlan && hasFamilyMember ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {hasMealPlan && hasFamilyMember ? '🔓 VISIBILE' : '🔒 NASCOSTA'}
                    </span>
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-500">
                    <span>Menu: {hasMealPlan ? '✅ Generato' : '❌ Assente'}</span>
                    <span>Membri: {hasFamilyMember ? '✅ Inseriti' : '❌ Assenti'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic current user subscription status bar */}
      <div className="bg-white p-5 rounded-3xl border border-indigo-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest">Abbonamento Famiglia</span>
            <span className="text-xs text-slate-700">
              Il tuo stato attuale: 
              <strong className={`ml-1.5 font-extrabold uppercase px-2 py-0.5 rounded-full text-[10px] ${
                currentPlan === 'pro' ? 'bg-purple-100 text-purple-700 font-black' :
                currentPlan === 'smart' ? 'bg-indigo-100 text-indigo-700 font-bold' :
                'bg-slate-100 text-slate-600'
              }`}>
                {currentPlan === 'pro' ? 'Chef IA ed OCR' : currentPlan === 'smart' ? 'SMART' : 'FREE'}
              </strong>
            </span>
          </div>
        </div>

        {currentPlan !== 'free' ? (
          <button 
            onClick={handleDowngradeToFree}
            className="text-xs text-slate-400 hover:text-red-500 font-bold underline transition-colors cursor-pointer"
          >
            Disdici Abbonamento
          </button>
        ) : (
          <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3.5 py-1.5 rounded-full text-[10px] font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            Sblocca l'app con i Piani Smart o Pro!
          </div>
        )}
      </div>

      {/* Intro Hero Section - Admin Only */}
      {isAdmin && (
        <>
          <div className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden animate-fade-in">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent)] pointer-events-none" />
            <div className="relative z-10 max-w-3xl">
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase">
                Console Amministratore e Analisi Finanziaria
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight mt-4 text-white">
                Analisi Economica e Strategia Commerciale
              </h1>
              <p className="text-slate-300 text-xs mt-3 leading-relaxed">
                Visualizza in tempo reale i costi vivi relativi ai server, database Firestore ed API Gemini IA.
                Questo simulatore calcola i tassi di conversione ideali per rendere l'app scalabile e redditizia.
              </p>
            </div>
          </div>

          {/* Grid: 4 Metrics cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target Utenti (MAU)</span>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-xl font-black text-slate-800">{mau.toLocaleString()}</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Utenti Attivi Mensili</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ricavi Lordi (MRR)</span>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-xl font-black text-emerald-600">€{financialReport.totalRevenue.toFixed(2)}</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Entrate ricorrenti / mese</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Costi Totali</span>
                <div className="p-2 bg-red-50 text-red-600 rounded-xl">
                  <Coins className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-xl font-black text-red-600">€{costs.totalCost.toFixed(2)}</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Costo vivo infrastruttura</p>
              </div>
            </div>

            <div className={`p-5 rounded-3xl shadow-sm border flex flex-col justify-between ${
              financialReport.netProfit >= 0 
                ? 'bg-indigo-50/50 border-indigo-100 text-indigo-950' 
                : 'bg-rose-50/50 border-rose-100 text-rose-950'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider">Utile Netto</span>
                <div className={`p-2 rounded-xl ${
                  financialReport.netProfit >= 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  <Percent className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-xl font-black">
                  {financialReport.netProfit >= 0 ? '+' : ''}€{financialReport.netProfit.toFixed(2)}
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Margine ROI: <strong className="font-bold">{financialReport.marginPercent.toFixed(1)}%</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Simulator Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <div>
                <h3 className="font-extrabold text-slate-900 flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-indigo-600" />
                  Simulatore Dinamico
                </h3>
                <p className="text-[10px] text-slate-500 mt-1">
                  Modifica i parametri per testare la scalabilità finanziaria della tua app sul mercato reale.
                </p>
              </div>

              <hr className="border-slate-100" />

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">Dimensione Utenti (MAU)</span>
                  <span className="text-indigo-600 font-extrabold text-xs">{mau.toLocaleString()} famiglie</span>
                </div>
                <input 
                  type="range" 
                  min="100" 
                  max="20000" 
                  step="100"
                  value={mau} 
                  onChange={(e) => setMau(parseInt(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">Conversione a Famiglia Smart</span>
                  <span className="text-indigo-600 font-extrabold text-xs">{payingConversionRateStandard}%</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="30" 
                  step="0.5"
                  value={payingConversionRateStandard} 
                  onChange={(e) => setPayingConversionRateStandard(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">Conversione a Famiglia Pro</span>
                  <span className="text-indigo-600 font-extrabold text-xs">{payingConversionRatePro}%</span>
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="20" 
                  step="0.5"
                  value={payingConversionRatePro} 
                  onChange={(e) => setPayingConversionRatePro(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
                />
              </div>
            </div>

            {/* Cost breakdown details */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
                  <div>
                    <h3 className="font-extrabold text-slate-900 flex items-center gap-2 text-sm">
                      <Cloud className="w-4 h-4 text-sky-500" />
                      Valutazione dei Costi Vivi Mensili
                    </h3>
                  </div>
                  <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-600">
                    Totale Costi: €{costs.totalCost.toFixed(2)}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-white rounded-xl shadow-xs text-indigo-600">
                          <Building className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-xs">Google Cloud Run (Server Hosting)</h4>
                          <p className="text-[9px] text-slate-400 mt-0.5">€15 fissa + €0.008/famiglia attiva</p>
                        </div>
                      </div>
                      <span className="font-black text-slate-700">€{costs.serverHostingCost.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-white rounded-xl shadow-xs text-amber-500">
                          <Layers className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-xs">Firestore Database & Auth</h4>
                          <p className="text-[9px] text-slate-400 mt-0.5">€0.00018 per utente attivo</p>
                        </div>
                      </div>
                      <span className="font-black text-slate-700">€{costs.databaseCost.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-white rounded-xl shadow-xs text-purple-600">
                          <Cpu className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-850 text-xs">Gemini AI API & OCR scans</h4>
                          <p className="text-[9px] text-slate-450 mt-0.5">Costo flat limitato a 4 operazioni/user/mese: €0.01/Pro user.</p>
                        </div>
                      </div>
                      <span className="font-black text-slate-700">€{costs.geminiApiCost.toFixed(3)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Pricing Packages Breakdown Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            I Pacchetti di Vendita per le Famiglie
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Seleziona il piano ideale per eliminare lo stress dei menu ed ottimizzare la spesa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Plan 1: Free */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden transition-all hover:shadow-md">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">
                    Iniziale
                  </span>
                  <h3 className="text-lg font-black text-slate-850 mt-3">Famiglia Base</h3>
                </div>
                <span className="text-xl font-black text-slate-800">0 €</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                Ideale per i primi passi. Strumenti base per la spesa e dispensa singola senza sincronizzazione ed automazione IA.
              </p>

              <hr className="border-slate-100 my-4" />

              <ul className="space-y-3">
                <li className="flex items-start gap-2.5 text-xs text-slate-600">
                  <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span>Configurazione 1 Profilo Famiglia</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-slate-600">
                  <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span>Menu Settimanale base stagionale</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-slate-600">
                  <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span>Max 15 alimenti in Dispensa</span>
                </li>
              </ul>
            </div>

            <button className="w-full mt-6 py-2.5 bg-slate-100 text-slate-400 text-xs font-bold rounded-2xl cursor-not-allowed">
              Piano Base {currentPlan === 'free' ? 'Attivo' : ''}
            </button>
          </div>

          {/* Plan 2: Family Standard */}
          <div className={`bg-white rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden transition-all hover:shadow-md border-2 ${
            currentPlan === 'smart' ? 'border-indigo-600 shadow-indigo-100' : 'border-slate-100'
          }`}>
            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[8px] font-bold px-4 py-1 rounded-bl-xl uppercase tracking-widest">
              Raccomandato
            </div>
            
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                    Sincronizzazione Spesa
                  </span>
                  <h3 className="text-lg font-black text-indigo-950 mt-3">Famiglia Smart</h3>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-slate-900">2.99 €</span>
                  <span className="text-[9px] text-slate-400 block">/ mese</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                Perfetto per famiglie che vogliono fare la spesa in sintonia, sincronizzare la dispensa in tempo reale.
              </p>

              <hr className="border-slate-100 my-4" />

              <ul className="space-y-3">
                <li className="flex items-start gap-2.5 text-xs text-slate-700">
                  <Check className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                  <span className="font-semibold text-slate-900">Sincronizzazione Multidispositivo</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-slate-700">
                  <Check className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                  <span>Dispensa Illimitata con alert scadenze</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-slate-700">
                  <Check className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                  <span>Condivisione Lista Spesa in tempo reale</span>
                </li>
              </ul>
            </div>

            <button 
              onClick={() => handleOpenCheckout('smart')}
              disabled={currentPlan === 'smart'}
              className={`w-full mt-6 py-2.5 text-xs font-bold rounded-2xl transition-all shadow-xs active:scale-95 cursor-pointer ${
                currentPlan === 'smart' 
                  ? 'bg-emerald-100 text-emerald-700 cursor-default shadow-none border border-emerald-200' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {currentPlan === 'smart' ? 'Abbonamento Smart Attivo ✔' : 'Attiva Abbonamento Smart'}
            </button>
          </div>

          {/* Plan 3: Family Pro (Chef IA) */}
          <div className={`bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden transition-all hover:shadow-2xl border-2 ${
            currentPlan === 'pro' ? 'border-yellow-500 shadow-yellow-100/10' : 'border-transparent'
          }`}>
            <div className="absolute top-0 right-0 bg-yellow-500 text-slate-950 text-[8px] font-bold px-4 py-1 rounded-bl-xl uppercase tracking-widest">
              Intelligenza Artificiale
            </div>
            
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-bold text-yellow-400 bg-white/10 px-2.5 py-1 rounded-md">
                    Gemini AI Pro
                  </span>
                  <h3 className="text-lg font-black text-white mt-3">Chef IA & OCR</h3>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-yellow-400">5.99 €</span>
                  <span className="text-[9px] text-indigo-200 block">/ mese</span>
                </div>
              </div>
              <p className="text-[11px] text-indigo-100 mt-2 leading-relaxed">
                Sfrutta la massima potenza tecnologica. Scansiona i volantini delle offerte con OCR, parla con l'Assistente Vocale intelligente e ricalcola menu.
              </p>

              <hr className="border-white/10 my-4" />

              <ul className="space-y-3">
                <li className="flex items-start gap-2.5 text-xs text-indigo-100">
                  <Check className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                  <span className="font-semibold text-white">Scansione Volantini Offerte con OCR</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-indigo-100">
                  <Check className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                  <span>Assistente Vocale Intelligente Integrato</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-indigo-100">
                  <Check className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                  <span>Algoritmi di intolleranze e recupero scarti</span>
                </li>
              </ul>
            </div>

            <button 
              onClick={() => handleOpenCheckout('pro')}
              disabled={currentPlan === 'pro'}
              className={`w-full mt-6 py-2.5 text-xs font-bold rounded-2xl transition-all shadow-xs active:scale-95 cursor-pointer ${
                currentPlan === 'pro' 
                  ? 'bg-emerald-500 text-white cursor-default border border-emerald-400' 
                  : 'bg-yellow-500 hover:bg-yellow-400 text-slate-950'
              }`}
            >
              {currentPlan === 'pro' ? 'Abbonamento Chef IA Attivo ✔' : 'Attiva Chef IA Premium'}
            </button>
          </div>

        </div>
      </div>

      {/* Storico Ricevute e Fatturazioni (Connected to DB & jsPDF Download!) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-indigo-600" />
          <h3 className="font-extrabold text-slate-900 text-sm">Storico Pagamenti e Ricevute Scaricabili</h3>
        </div>
        
        {invoiceHistory.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            Nessun pagamento registrato. Attiva un abbonamento per generare le ricevute.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold">
                  <th className="pb-3 font-semibold">Data</th>
                  <th className="pb-3 font-semibold">Abbonamento</th>
                  <th className="pb-3 font-semibold">Metodo</th>
                  <th className="pb-3 font-semibold text-right">Importo</th>
                  <th className="pb-3 font-semibold text-center">Stato</th>
                  <th className="pb-3 font-semibold text-right">Azione</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoiceHistory.map((invoice, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3 text-slate-600 font-medium">
                      {new Date(invoice.date).toLocaleDateString('it-IT')}
                    </td>
                    <td className="py-3 font-extrabold text-slate-800">
                      {invoice.plan === 'pro' ? 'Chef IA ed OCR' : 'Famiglia Smart'}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold uppercase">
                        {invoice.paymentMethod === 'stripe' ? '💳 Stripe / Web' : 
                         invoice.paymentMethod === 'gpay' ? '📱 Google Pay' : '🤖 Google Play'}
                      </span>
                    </td>
                    <td className="py-3 text-right font-black text-slate-900">
                      €{invoice.amount.toFixed(2)}
                    </td>
                    <td className="py-3 text-center">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[9px] font-extrabold">
                        Approvato
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDownloadInvoice(invoice)}
                        className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-extrabold cursor-pointer hover:underline"
                        title="Scarica Ricevuta PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Multi-Option Secure Checkout sliding Modal dialog */}
      <AnimatePresence>
        {showCheckout && checkoutPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-md w-full border border-slate-200 relative overflow-hidden"
            >
              {/* Modal close */}
              {!paymentSuccess && !isProcessingPayment && (
                <button 
                  onClick={() => setShowCheckout(false)} 
                  className="absolute right-4 top-4 p-1.5 hover:bg-slate-100 rounded-full text-slate-400 cursor-pointer transition-all z-10"
                >
                  <X size={18} />
                </button>
              )}

              {/* Payment Success state */}
              {paymentSuccess ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-3xl font-bold mx-auto border border-emerald-100 animate-bounce">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-base">Pagamento Approvato!</h4>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      La transazione è stata completata con successo sul circuito sicuro. Il tuo account Famiglia è stato promosso al livello:
                      <strong className="uppercase font-black text-indigo-600 block mt-1 text-sm tracking-wide">
                        {checkoutPlan === 'smart' ? 'Famiglia Smart' : 'Chef IA & OCR Premium'}
                      </strong>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  
                  {/* Header title */}
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">Completa l'Abbonamento</h3>
                      <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Scegli il metodo di addebito per Android o Web</p>
                    </div>
                  </div>

                  {/* Summary card */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">Sottoscrizione Mensile</span>
                      <span className="font-black text-slate-800">
                        {checkoutPlan === 'smart' ? 'Famiglia Smart' : 'Chef IA ed OCR Premium'}
                      </span>
                    </div>
                    <span className="font-extrabold text-indigo-700 text-xs bg-indigo-50 px-2.5 py-1 rounded-xl">
                      {checkoutPlan === 'smart' ? '€2.99/mese' : '€5.99/mese'}
                    </span>
                  </div>

                  {/* Tab selection for Payment Method */}
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => { setSelectedGateway('gpay'); setCheckoutError(null); }}
                      className={`py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                        selectedGateway === 'gpay' ? 'bg-white text-indigo-600 shadow-xs font-black' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      📱 Google Pay
                    </button>
                    <button
                      type="button"
                      onClick={() => { setSelectedGateway('googleplay'); setCheckoutError(null); }}
                      className={`py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                        selectedGateway === 'googleplay' ? 'bg-white text-indigo-600 shadow-xs font-black' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      🤖 Google Play IAP
                    </button>
                  </div>

                  {checkoutError && (
                    <div className="p-3 bg-rose-50 text-rose-700 text-[11px] rounded-xl border border-rose-100 font-bold flex items-start gap-1.5">
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>{checkoutError}</span>
                    </div>
                  )}

                  {/* GATEWAY 2: Google Pay Sheet Simulator (Android Focused) */}
                  {selectedGateway === 'gpay' && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-4 relative overflow-hidden">
                        <div className="flex justify-between items-center border-b border-white/10 pb-3">
                          <span className="text-[11px] font-black tracking-widest text-slate-300">GPay</span>
                          <span className="text-xs text-white/80">{profile?.email}</span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Carta predefinita</span>
                            <span className="font-bold text-white">Google Smart Wallet (•••• 4242)</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Importo</span>
                            <span className="font-black text-yellow-400">€{checkoutPlan === 'smart' ? '2.99' : '5.99'}</span>
                          </div>
                        </div>

                        {/* Interactive Fingerprint scanner */}
                        <div className="text-center py-4 space-y-3 relative">
                          <button
                            onMouseDown={handleGPayTouchStart}
                            onMouseUp={handleGPayTouchEnd}
                            onTouchStart={handleGPayTouchStart}
                            onTouchEnd={handleGPayTouchEnd}
                            className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                              isBiometricScanning 
                                ? 'bg-indigo-600/20 border-indigo-400 scale-105 shadow-lg shadow-indigo-500/20' 
                                : 'bg-white/5 border-white/10 hover:bg-white/10 active:scale-95'
                            }`}
                          >
                            <Fingerprint className={`w-8 h-8 text-white ${isBiometricScanning ? 'animate-pulse text-indigo-400' : ''}`} />
                          </button>
                          
                          <div>
                            <p className="text-[10px] font-extrabold text-white">Tieni premuto per autorizzare biometricamente</p>
                            <p className="text-[9px] text-slate-400 mt-0.5">Scansione impronta digitale Android integrata</p>
                          </div>

                          {isBiometricScanning && (
                            <div className="w-32 bg-slate-800 h-1 mx-auto rounded-full overflow-hidden mt-2">
                              <div className="bg-indigo-500 h-1 transition-all duration-70" style={{ width: `${biometricProgress}%` }} />
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => setShowCheckout(false)}
                        className="w-full py-2.5 border border-slate-200 text-slate-500 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                      >
                        Annulla
                      </button>
                    </div>
                  )}

                  {/* GATEWAY 3: Google Play IAP Bottom Sheet Simulator */}
                  {selectedGateway === 'googleplay' && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-xs space-y-4 shadow-2xs">
                        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-md">
                            G
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-xs">Google Play Billing</h4>
                            <p className="text-[9px] text-slate-400">Pagamento In-App sicuro</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Prodotto:</span>
                            <span className="font-extrabold text-slate-800">{checkoutPlan === 'smart' ? 'Smart Family Monthly' : 'Chef IA Monthly'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Prezzo:</span>
                            <span className="font-extrabold text-slate-800">€{checkoutPlan === 'smart' ? '2.99' : '5.99'} / mese</span>
                          </div>
                          <div className="flex justify-between text-[9px] text-slate-400">
                            <span>Tassazione:</span>
                            <span>IVA 22% inclusa</span>
                          </div>
                        </div>

                        <div className="p-2.5 bg-yellow-50 rounded-xl border border-yellow-100 text-[10px] text-yellow-800 leading-snug">
                          🤖 Questo simula l'interfaccia nativa del Google Play Store per le transazioni in-app di Android.
                        </div>

                        <button
                          onClick={handleGooglePlaySubscribe}
                          disabled={isPlayBillingLoading}
                          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {isPlayBillingLoading ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Connessione Google Play...</span>
                            </>
                          ) : (
                            <>
                              <span>Abbonati con 1-Click</span>
                            </>
                          )}
                        </button>
                      </div>

                      <button
                        onClick={() => setShowCheckout(false)}
                        className="w-full py-2.5 border border-slate-200 text-slate-500 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                      >
                        Annulla
                      </button>
                    </div>
                  )}

                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
