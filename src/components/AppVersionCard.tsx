import { useCallback, useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { CheckCircle2, CloudOff, Download, RefreshCcw } from 'lucide-react';
import { checkVersionNow, type VersionStatus } from '../lib/updateCheck';

/**
 * Dice con chiarezza se l'app installata è l'ultima versione: la versione installata e il confronto con quella sul sito,
 * con il pulsante per scaricare l'aggiornamento se ce n'è una più nuova.
 */
export default function AppVersionCard() {
  const native = Capacitor.isNativePlatform();
  const [status, setStatus] = useState<VersionStatus | null>(null);
  const [checking, setChecking] = useState(false);

  const check = useCallback(async () => {
    setChecking(true);
    setStatus(await checkVersionNow());
    setChecking(false);
  }, []);

  useEffect(() => {
    if (native && __BUILD_NUMBER__ > 0) void check();
  }, [native, check]);

  const install = async (url: string) => {
    if (native) await Browser.open({ url });
    else window.location.assign(url);
  };

  const canCheck = native && __BUILD_NUMBER__ > 0;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
      <div>
        <p className="font-semibold text-slate-900">Versione dell’app</p>
        <p className="text-sm text-slate-600">
          Installata: <strong className="text-slate-900">{__APP_VERSION__}</strong>
        </p>
      </div>

      {!canCheck && (
        <p className="text-sm text-slate-600 leading-relaxed">
          {native
            ? 'Questa è una versione di prova.'
            : 'Stai usando l’app dal browser: si aggiorna da sola ogni volta che la riapri.'}
        </p>
      )}

      {canCheck && checking && <p role="status" className="text-sm text-slate-500">Controllo se è l’ultima versione…</p>}

      {canCheck && !checking && status?.state === 'latest' && (
        <p role="status" className="text-sm font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" /> Hai l’ultima versione. Non devi fare nulla.
        </p>
      )}
      {canCheck && !checking && status?.state === 'ahead' && (
        <p role="status" className="text-sm font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" /> Hai una versione più recente di quella pubblicata sul sito.
        </p>
      )}
      {canCheck && !checking && status?.state === 'outdated' && (
        <div role="alert" className="text-sm bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-2">
          <p className="font-semibold text-amber-900">
            C’è una versione più nuova{status.update.version ? `: ${status.update.version}` : ''}. Quella che hai non è l’ultima.
          </p>
          <p className="text-amber-900">I tuoi dati restano al loro posto: scarica il file e conferma l’aggiornamento.</p>
          <button onClick={() => install(status.update.apkUrl)} className="h-11 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-2">
            <Download className="w-4 h-4" /> Scarica e installa
          </button>
        </div>
      )}
      {canCheck && !checking && status?.state === 'offline' && (
        <p role="status" className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
          <CloudOff className="w-5 h-5 shrink-0" /> Non riesco a controllare ora. Verifica la connessione e riprova.
        </p>
      )}

      {canCheck && (
        <button
          onClick={check}
          disabled={checking}
          className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold flex items-center gap-2 disabled:opacity-60"
        >
          <RefreshCcw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} /> Controlla aggiornamenti
        </button>
      )}
    </div>
  );
}
