import { Sparkles } from 'lucide-react';
import { TRIAL_DAYS } from '../lib/plans';

interface UpgradeCardProps {
  title: string;
  text: string;
  /** Nome del piano che include la funzione */
  badge: string;
  onUpgrade: () => void;
}

/** Schermata mostrata al posto di una funzione riservata a un piano a pagamento. */
export default function UpgradeCard({ title, text, badge, onUpgrade }: UpgradeCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-5 py-14 max-w-xl mx-auto mt-6 shadow-sm">
      <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto border border-indigo-100">
        <Sparkles className="w-8 h-8" />
      </div>
      <div>
        <span className="inline-block text-[10px] uppercase font-bold tracking-widest text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full mb-3">
          Piano {badge}
        </span>
        <h3 className="font-semibold text-slate-900 text-2xl">{title}</h3>
        <p className="text-sm text-slate-600 mt-2 max-w-sm mx-auto leading-relaxed">{text}</p>
      </div>
      <button
        onClick={onUpgrade}
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-bold transition-all shadow-md active:scale-95 cursor-pointer"
      >
        Scopri i piani · {TRIAL_DAYS} giorni di prova
      </button>
    </div>
  );
}
