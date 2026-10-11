import React, { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';
import { UserProfile } from '../types';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  userId: string;
  profile: UserProfile | null;
}

export default function FlyerAnalysis({ userId, profile }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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
        const result = await httpsCallable<{ data: string; mimeType: string }, { ingredients: string[] }>(
          functions,
          'analyzeFlyer'
        )({ data: base64Data, mimeType });
        const ingredients = result.data.ingredients;

        setExtractedOffers(ingredients);
        await saveOffers(ingredients);
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

  const clearOffers = () => {
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
          
          {extractedOffers.length > 0 && (
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
