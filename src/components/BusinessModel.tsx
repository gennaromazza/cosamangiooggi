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
import { httpsCallable } from 'firebase/functions';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { functions } from '../lib/firebase';
import { PRICES, PLAN_LIMITS, TRIAL_DAYS, BillingInterval, formatPrice, planName, yearlySavingPercent } from '../lib/plans';
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
  
  const [billingBusy, setBillingBusy] = useState<boolean>(false);
  const [waitingPayment, setWaitingPayment] = useState<boolean>(false);
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('year');

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

    const priceStandard = PRICES.smart.month;
    const pricePro = PRICES.pro.month;

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

  const isLocalAccount = userId === 'demo-family-user' || userId.startsWith('local-');

  // Apre una pagina di Stripe (checkout o gestione abbonamento) nel browser
  const openStripePage = async (fn: 'createCheckoutSession' | 'createPortalSession', data?: { plan: 'smart' | 'pro'; interval: BillingInterval }) => {
    if (isLocalAccount) {
      alert("Per abbonarti devi accedere con un account (email o Google), non in modalità demo/locale.");
      return;
    }
    setBillingBusy(true);
    try {
      const native = Capacitor.isNativePlatform();
      const result = await httpsCallable<unknown, { url: string }>(functions, fn)({ ...data, native });
      if (native) {
        // L'app ricorda che sta aspettando un pagamento: al rientro mostra la conferma quando il piano cambia
        if (fn === 'createCheckoutSession') {
          try { localStorage.setItem('awaiting_checkout', String(Date.now())); } catch { /* storage non disponibile */ }
          setWaitingPayment(true);
        }
        await Browser.open({ url: result.data.url });
      } else {
        window.location.assign(result.data.url);
      }
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Impossibile aprire la pagina di pagamento. Riprova.");
    } finally {
      setBillingBusy(false);
    }
  };

  const handleOpenCheckout = (plan: 'smart' | 'pro') => openStripePage('createCheckoutSession', { plan, interval: billingInterval });
  // Disdetta, riattivazione, metodo di pagamento e fatture: portale clienti Stripe
  const handleManageSubscription = () => openStripePage('createPortalSession');

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
      const planName = invoice.plan === 'pro' ? 'Abbonamento Chef IA' : 'Abbonamento Famiglia';
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

  return (
    <div className="space-y-8 pb-20">
      
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
                {planName(currentPlan)}
              </strong>
            </span>
          </div>
        </div>

        {currentPlan !== 'free' ? (
          <button 
            onClick={handleManageSubscription}
            disabled={billingBusy}
            className="text-xs text-slate-400 hover:text-red-500 font-bold underline transition-colors cursor-pointer"
          >
            Gestisci / Disdici Abbonamento
          </button>
        ) : (
          <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3.5 py-1.5 rounded-full text-[10px] font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            Prova Famiglia: 7 giorni gratis
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

      {/* I tre piani */}
      <div className="space-y-5">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Scegli come usare l'app</h2>
          <p className="text-sm text-slate-500 mt-1">
            Diete e allergie sono sempre incluse, in ogni piano. Provi {TRIAL_DAYS} giorni gratis e disdici quando vuoi.
          </p>
        </div>

        {waitingPayment && (
          <p role="status" className="text-sm font-semibold text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3">
            Finito il pagamento? Chiudi la pagina e torna qui: il piano si aggiorna da solo, in pochi secondi.
          </p>
        )}

        {/* Mensile / annuale */}
        <div className="inline-flex p-1 bg-slate-100 rounded-2xl" role="group" aria-label="Frequenza di pagamento">
          {([['month', 'Mensile'], ['year', 'Annuale']] as [BillingInterval, string][]).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setBillingInterval(value)}
              aria-pressed={billingInterval === value}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                billingInterval === value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              {label}
              {value === 'year' && (
                <span className="ml-1.5 text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                  fino a -{Math.max(yearlySavingPercent('smart'), yearlySavingPercent('pro'))}%
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Gratis */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">Per iniziare</span>
              <div className="flex justify-between items-end mt-3">
                <h3 className="text-2xl font-semibold text-slate-900">Gratis</h3>
                <span className="text-xl font-black text-slate-800">0 €</span>
              </div>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Il menù della settimana per la tua famiglia, con diete e allergie sempre rispettate.
              </p>
              <hr className="border-slate-100 my-4" />
              <ul className="space-y-3">
                {[
                  `Fino a ${PLAN_LIMITS.free.maxMembers} persone a tavola`,
                  'Menù settimanale di stagione',
                  'Diete e allergie rispettate',
                  `Dispensa fino a ${PLAN_LIMITS.free.maxPantryItems} prodotti`,
                  'Lista della spesa a schermo',
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-full mt-6 py-3 bg-slate-100 text-slate-500 text-xs font-bold rounded-2xl text-center">
              {currentPlan === 'free' ? 'Il tuo piano' : 'Incluso sempre'}
            </div>
          </div>

          {/* Famiglia e Chef IA */}
          {([
            {
              id: 'smart' as const,
              badge: 'Consigliato',
              desc: 'Per la famiglia di ogni giorno: nessun limite e la spesa pronta da condividere.',
              features: ['Tutto del piano Gratis', 'Persone e dispensa senza limiti', 'Esporta la lista della spesa (PDF e WhatsApp)', 'Pianificatore vacanze'],
              dark: false,
            },
            {
              id: 'pro' as const,
              badge: 'Intelligenza artificiale',
              desc: 'Per chi vuole farsi aiutare: scansiona le offerte e comanda l\'app con la voce.',
              features: ['Tutto del piano Famiglia', `Scansione volantini (fino a ${PLAN_LIMITS.pro.flyerScansPerMonth} al mese)`, `Riconosce gli ingredienti dei vostri piatti (fino a ${PLAN_LIMITS.pro.dishSuggestionsPerMonth} al mese)`, 'Assistente vocale'],
              dark: true,
            },
          ]).map((plan) => {
            const price = PRICES[plan.id][billingInterval];
            const isCurrent = currentPlan === plan.id;
            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden border-2 ${
                  plan.dark ? 'bg-gradient-to-br from-slate-900 to-indigo-950 text-white' : 'bg-white'
                } ${isCurrent ? 'border-emerald-500' : plan.dark ? 'border-transparent' : 'border-indigo-600'}`}
              >
                <div>
                  <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-md ${
                    plan.dark ? 'text-yellow-300 bg-white/10' : 'text-indigo-700 bg-indigo-50'
                  }`}>
                    {plan.badge}
                  </span>
                  <div className="flex justify-between items-end mt-3">
                    <h3 className={`text-2xl font-semibold ${plan.dark ? 'text-white' : 'text-slate-900'}`}>{planName(plan.id)}</h3>
                    <div className="text-right">
                      <span className={`text-xl font-black ${plan.dark ? 'text-yellow-300' : 'text-slate-900'}`}>{formatPrice(price)}</span>
                      <span className={`text-[10px] block ${plan.dark ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {billingInterval === 'year' ? `all'anno · ${formatPrice(price / 12)}/mese` : 'al mese'}
                      </span>
                    </div>
                  </div>
                  <p className={`text-xs mt-2 leading-relaxed ${plan.dark ? 'text-indigo-100' : 'text-slate-500'}`}>{plan.desc}</p>
                  <hr className={`my-4 ${plan.dark ? 'border-white/10' : 'border-slate-100'}`} />
                  <ul className="space-y-3">
                    {plan.features.map((t) => (
                      <li key={t} className={`flex items-start gap-2.5 text-sm ${plan.dark ? 'text-indigo-100' : 'text-slate-700'}`}>
                        <Check className={`w-4 h-4 mt-0.5 shrink-0 ${plan.dark ? 'text-yellow-300' : 'text-indigo-600'}`} />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => handleOpenCheckout(plan.id)}
                  disabled={isCurrent || billingBusy}
                  className={`w-full mt-6 py-3 text-sm font-bold rounded-2xl transition-all active:scale-95 ${
                    isCurrent
                      ? 'bg-emerald-100 text-emerald-800 cursor-default'
                      : plan.dark
                        ? 'bg-yellow-400 hover:bg-yellow-300 text-slate-950'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {isCurrent
                    ? 'Il tuo piano ✔'
                    : profile?.hadSubscription
                      ? `Scegli ${planName(plan.id)}`
                      : `Prova gratis ${TRIAL_DAYS} giorni`}
                </button>
              </div>
            );
          })}
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
                      {planName(invoice.plan)}
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
    </div>
  );
}
