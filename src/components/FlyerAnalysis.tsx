import React, { useEffect, useMemo, useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../lib/firebase';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { INITIAL_RECIPES } from '../data/recipes';
import { offerFit, rankOffers } from '../lib/offerFit';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';
import { FamilyMember, UserProfile } from '../types';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles, X, Link2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  userId: string;
  profile: UserProfile | null;
  /** Porta al menù, dove si può rifare con le offerte appena trovate */
  onNavigateToPlanner?: () => void;
}

export default function FlyerAnalysis({ userId, profile, onNavigateToPlanner }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [link, setLink] = useState('');
  // Dopo la lettura si sceglie cosa si compra davvero: solo quello conta per il menù. Nulla è scelto in partenza.
  const [candidates, setCandidates] = useState<string[]>([]);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  // Chi siede a tavola: per dire di ogni offerta se va bene a tutti o solo ad alcuni
  const [members, setMembers] = useState<FamilyMember[]>([]);
  useEffect(() => {
    if (userId === 'demo-family-user' || userId.startsWith('local-')) {
      try {
        setMembers(JSON.parse(localStorage.getItem(`members_${userId}`) || '[]'));
      } catch {
        setMembers([]);
      }
      return;
    }
    return onSnapshot(
      collection(db, `users/${userId}/familyMembers`),
      (snap) => setMembers(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<FamilyMember, 'id'>) }))),
      () => setMembers([]),
    );
  }, [userId]);
  const fits = useMemo(
    () => rankOffers(candidates.map((name) => offerFit({ name, members, profile, recipes: INITIAL_RECIPES }))),
    [candidates, members, profile],
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scansLeft, setScansLeft] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [extractedOffers, setExtractedOffers] = useState<string[]>(profile?.currentOffers || []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const analyzeFlyer = async () => {
    if (!file) return;

    // Check file size (limit to 10MB to avoid browser crashes with base64)
    if (file.size > 6 * 1024 * 1024) {
      setError("Il file è troppo grande (massimo 6MB). Carica un file più piccolo.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = (reader.result as string).split(',')[1];
        const mimeType = file.type;

        // L'analisi avviene sul server: la chiave Gemini non è mai nell'app
        const result = await httpsCallable<{ data: string; mimeType: string }, { ingredients: string[]; remaining: number }>(
          functions,
          'analyzeFlyer'
        )({ data: base64Data, mimeType });
        const ingredients = result.data.ingredients;
        setScansLeft(result.data.remaining);

        showCandidates(ingredients);
      } catch (err: any) {
        console.error("Flyer analysis error:", err);
        setError(`Errore: ${err.message || "Impossibile analizzare il volantino. Prova un'immagine più chiara."}`);
      } finally {
        setIsAnalyzing(false);
      }
    };

    reader.onerror = () => {
      setError("Errore durante la lettura del file.");
      setIsAnalyzing(false);
    };

    reader.readAsDataURL(file);
  };

  // Volantino da un link a un PDF o a un'immagine: il server lo scarica e lo legge
  const analyzeLink = async () => {
    const url = link.trim();
    if (!/^https:\/\//i.test(url)) {
      setError('Incolla l\'indirizzo completo del volantino, che inizia con https://');
      return;
    }
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await httpsCallable<{ url: string }, { ingredients: string[]; remaining: number }>(functions, 'analyzeFlyerUrl')({ url });
      setScansLeft(result.data.remaining);
      showCandidates(result.data.ingredients);
    } catch (err: any) {
      console.error('Flyer link error:', err);
      setError(err?.message?.replace(/^.*?: /, '') || 'Non è stato possibile leggere il link. Prova con uno screenshot.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveOffers = async (ingredients: string[]) => {
    const path = `users/${userId}`;
    try {
      await setDoc(doc(db, path), {
        currentOffers: ingredients
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const showCandidates = (ingredients: string[]) => {
    setCandidates([...new Set(ingredients)]);
    setPicked(new Set());
  };

  const togglePick = (name: string) =>
    setPicked((current) => {
      const next = new Set(current);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  // Si salva solo ciò che l'utente ha scelto; il menù si rifà solo se lo chiede
  const confirmPicks = async (rebuild: boolean) => {
    const chosen = candidates.filter((name) => picked.has(name));
    setExtractedOffers(chosen);
    await saveOffers(chosen);
    setCandidates([]);
    setPicked(new Set());
    if (rebuild && chosen.length > 0) {
      try {
        sessionStorage.setItem('auto_regenerate_plan', '1');
      } catch {
        /* storage non disponibile */
      }
      onNavigateToPlanner?.();
    }
  };

  const clearOffers = () => {
    setCandidates([]);
    setPicked(new Set());
    setExtractedOffers([]);
    saveOffers([]);
    setFile(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Analisi Volantino Offerte</h2>
          <p className="text-slate-500 italic">Carica il volantino per personalizzare il tuo menù in base al risparmio.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-600" />
              Carica Volantino
            </h3>
            <p className="text-sm text-slate-500">Trascina o seleziona una foto o un PDF del volantino della settimana.</p>
          </div>

          {scansLeft !== null && (
            <p className="text-xs font-semibold text-slate-500 text-center">
              Scansioni rimaste questo mese: {scansLeft}
            </p>
          )}

          <div 
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
              file ? 'border-indigo-300 bg-indigo-50/30' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50'
            }`}
          >
            <input 
              type="file" 
              id="flyer-upload" 
              className="hidden" 
              accept="image/*,application/pdf"
              onChange={handleFileChange}
            />
            <label htmlFor="flyer-upload" className="cursor-pointer block">
              {file ? (
                <div className="flex flex-col items-center">
                  <div className="bg-indigo-600 p-3 rounded-xl mb-4 text-white shadow-lg">
                    <FileText className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-bold text-slate-700 mb-1">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="bg-slate-100 p-3 rounded-xl mb-4 text-slate-400 group-hover:text-indigo-500 transition-colors">
                    <Upload className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Clicca per caricare</p>
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Immagine o PDF</p>
                </div>
              )}
            </label>
          </div>

          <div className="mt-8">
            <button
              onClick={analyzeFlyer}
              disabled={!file || isAnalyzing}
              className="w-full bg-indigo-600 text-white font-bold py-4 px-6 rounded-2xl hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isAnalyzing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
              )}
              {isAnalyzing ? 'Analizzando...' : 'Analizza Offerte'}
            </button>
            <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
              <label htmlFor="flyer-link" className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-indigo-600" /> Oppure incolla il link del volantino
              </label>
              <div className="flex gap-2">
                <input
                  id="flyer-link"
                  type="url"
                  inputMode="url"
                  value={link}
                  onChange={(e) => { setLink(e.target.value); setError(null); }}
                  onKeyDown={(e) => e.key === 'Enter' && !isAnalyzing && analyzeLink()}
                  placeholder="https://…/volantino.pdf"
                  className="flex-1 min-w-0 h-12 px-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
                <button
                  onClick={analyzeLink}
                  disabled={isAnalyzing || link.trim().length < 8}
                  className="shrink-0 h-12 px-4 rounded-xl bg-indigo-600 text-white font-bold text-sm disabled:opacity-50"
                >
                  Leggi
                </button>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Funziona se il link porta direttamente a un PDF o a un'immagine. Se il volantino si sfoglia sul sito, fai uno screenshot delle pagine e caricale come foto.
              </p>
            </div>
            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-slate-50 rounded-3xl border border-slate-200 p-8 shadow-inner overflow-hidden flex flex-col h-[500px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Ingredienti in Offerta
            </h3>
            {extractedOffers.length > 0 && (
              <button 
                onClick={clearOffers}
                className="text-xs font-bold text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
              >
                <X className="w-3 h-3" />
                Svuota
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {extractedOffers.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {extractedOffers.map((ing, i) => (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    key={`${ing}-${i}`}
                    className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-medium text-slate-700 shadow-sm"
                  >
                    {ing}
                  </motion.span>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                <Sparkles className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-slate-500 font-medium tracking-tight">
                  Analizza un volantino per vedere qui gli ingredienti in offerta. <br />
                  Verranno usati per suggerirti le ricette più convenienti!
                </p>
              </div>
            )}
          </div>
          
          {candidates.length > 0 && (
            <div role="group" aria-label="Cosa compri davvero" className="mb-6 bg-indigo-50 border border-indigo-100 rounded-2xl p-4 space-y-3">
              <p className="text-sm font-bold text-indigo-950">Ho trovato {candidates.length} ingredienti in offerta. Quali compri davvero?</p>
              <p className="text-xs text-indigo-900 leading-relaxed">Tocca solo quelli che vuoi comprare: il menù userà soltanto questi. Gli altri vengono ignorati. Per ognuno ti diciamo per chi va bene, secondo allergie, diete e gusti di ognuno.</p>
              <ul className="space-y-2">
                {fits.map((fit) => {
                  const on = picked.has(fit.name);
                  return (
                    <li key={fit.name}>
                      <button
                        onClick={() => !fit.blocked && togglePick(fit.name)}
                        disabled={fit.blocked}
                        aria-pressed={on}
                        className={`w-full text-left rounded-xl border px-3 py-2.5 flex items-start gap-3 ${
                          on ? 'bg-indigo-600 border-indigo-600 text-white' : fit.blocked ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-white border-indigo-100 text-slate-900'
                        }`}
                      >
                        <span className={`mt-0.5 w-5 h-5 shrink-0 rounded-md border flex items-center justify-center ${on ? 'bg-white border-white text-indigo-700' : 'border-slate-300'}`}>
                          {on && <CheckCircle2 className="w-4 h-4" />}
                        </span>
                        <span className="min-w-0">
                          <span className="block font-semibold">{fit.name}</span>
                          <span className={`block text-xs ${on ? 'text-indigo-100' : fit.tone === 'all' ? 'text-emerald-700' : fit.tone === 'some' ? 'text-amber-700' : 'text-slate-500'}`}>
                            {fit.summary}
                          </span>
                          {(fit.likedBy.length > 0 || fit.dislikedBy.length > 0) && (
                            <span className={`block text-xs ${on ? 'text-indigo-100' : 'text-slate-500'}`}>
                              {[fit.likedBy.length > 0 ? `Piace a ${fit.likedBy.join(', ')}` : '', fit.dislikedBy.length > 0 ? `Non piace a ${fit.dislikedBy.join(', ')}` : ''].filter(Boolean).join(' · ')}
                            </span>
                          )}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="flex gap-3 text-xs font-semibold text-indigo-800">
                <button onClick={() => setPicked(new Set(fits.filter((f) => !f.blocked).map((f) => f.name)))} className="underline underline-offset-4">Scegli tutti</button>
                <button onClick={() => setPicked(new Set(fits.filter((f) => f.tone === 'all' && !f.majorityDislikes).map((f) => f.name)))} className="underline underline-offset-4">Solo quelli per tutti</button>
                <button onClick={() => setPicked(new Set())} className="underline underline-offset-4">Nessuno</button>
                <span className="ml-auto">{picked.size} scelti</span>
              </div>
              <div className="flex flex-col gap-2">
                {onNavigateToPlanner && (
                  <button
                    onClick={() => confirmPicks(true)}
                    disabled={picked.size === 0}
                    className="h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold disabled:opacity-50"
                  >
                    Usali e rifai il menù
                  </button>
                )}
                <button
                  onClick={() => confirmPicks(false)}
                  disabled={picked.size === 0}
                  className="h-11 rounded-xl border border-indigo-200 bg-white text-indigo-900 text-sm font-semibold disabled:opacity-50"
                >
                  Usali senza rifare il menù
                </button>
                <button onClick={() => { setCandidates([]); setPicked(new Set()); }} className="h-10 text-sm font-semibold text-slate-500 underline underline-offset-4">
                  Non uso nulla
                </button>
              </div>
              <p className="text-xs text-indigo-900/80">Rifacendo il menù, quello di adesso viene sostituito; gusti, diete e allergie di tutti restano rispettati.</p>
            </div>
          )}

          {extractedOffers.length > 0 && candidates.length === 0 && (
            <div className="mt-6 pt-6 border-t border-slate-200 border-dashed">
              <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />
                <p className="text-xs text-emerald-700 leading-relaxed font-medium">
                  Ottimo! Questi {extractedOffers.length} ingredienti verranno ora prioritizzati nella generazione dei prossimi menù settimanali.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
