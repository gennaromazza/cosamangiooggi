import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface TipCardProps {
  icon: ReactNode;
  text: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  tone?: 'default' | 'success';
}

/** Un solo suggerimento alla volta: una frase e, al massimo, un pulsante. */
export default function TipCard({ icon, text, actionLabel, onAction, onDismiss, tone = 'default' }: TipCardProps) {
  const success = tone === 'success';
  return (
    <div
      className={`rounded-2xl border p-4 flex items-center gap-3 ${
        success ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-white border-slate-200 text-slate-800'
      }`}
    >
      <span
        className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
          success ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-50 text-indigo-600'
        }`}
      >
        {icon}
      </span>
      <p className="flex-1 min-w-0 text-sm font-medium leading-snug">{text}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="shrink-0 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold active:scale-95 transition-all"
        >
          {actionLabel}
        </button>
      )}
      {onDismiss && (
        <button onClick={onDismiss} aria-label="Nascondi" className="shrink-0 p-1.5 rounded-full text-slate-400 hover:bg-slate-100">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
