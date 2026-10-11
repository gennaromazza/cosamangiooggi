import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { Download, X } from 'lucide-react';
import { APK_URL, checkForUpdate, dismissUpdate } from '../lib/updateCheck';
import type { UpdateInfo } from '../lib/updateCheck';

/** Nell'app Android: avvisa quando sul sito c'è una versione nuova e porta al download. */
export default function UpdateBanner() {
  const [update, setUpdate] = useState<UpdateInfo | null>(null);

  useEffect(() => {
    let active = true;
    const run = (force: boolean) => checkForUpdate(force).then((info) => active && info && setUpdate(info));
    run(false);
    const onVisible = () => document.visibilityState === 'visible' && run(false);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      active = false;
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  if (!update) return null;

  const install = async () => {
    // Il file si scarica e Android propone di aggiornare l'app già installata (stessa firma: i dati restano)
    if (Capacitor.isNativePlatform()) await Browser.open({ url: APK_URL });
    else window.location.assign(APK_URL);
  };

  return (
    <div
      role="status"
      className="fixed left-3 right-3 z-[70] top-[calc(env(safe-area-inset-top)+0.75rem)] bg-white border border-indigo-200 rounded-2xl shadow-xl p-4 flex items-center gap-3"
    >
      <div className="flex-1 min-w-0">
        <p className="font-bold text-slate-900">C’è una versione nuova dell’app</p>
        <p className="text-sm text-slate-600">Aggiorna per avere le ultime novità. I tuoi dati restano al loro posto.</p>
      </div>
      <button
        onClick={install}
        className="shrink-0 h-11 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2"
      >
        <Download className="w-4 h-4" /> Aggiorna
      </button>
      <button
        onClick={() => {
          dismissUpdate(update.build);
          setUpdate(null);
        }}
        aria-label="Più tardi"
        className="shrink-0 w-9 h-11 text-slate-400 hover:text-slate-600 flex items-center justify-center"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
