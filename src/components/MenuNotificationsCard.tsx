import { useState } from 'react';
import { Bell } from 'lucide-react';
import { dailyMenuPrefs, remindersAvailable, setDailyMenuReminder } from '../lib/reminders';
import { formatReminderTime, parseReminderTime } from '../lib/sharedMenu';

/** Notifiche del menù di questo telefono: ognuno le attiva, le spegne e sceglie l'orario per sé. */
export default function MenuNotificationsCard() {
  const [prefs, setPrefs] = useState(dailyMenuPrefs);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  if (!remindersAvailable()) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1">
        <p className="font-semibold text-slate-900 flex items-center gap-2"><Bell className="w-4 h-4" /> Notifiche del menù</p>
        <p className="text-sm text-slate-600 leading-relaxed">
          Le notifiche con il menù del giorno funzionano nell'app Android. Da browser e da iPhone puoi aprire il menù quando vuoi.
        </p>
      </div>
    );
  }

  const apply = async (enabled: boolean, time = prefs) => {
    setBusy(true);
    setNotice(null);
    try {
      const result = await setDailyMenuReminder(enabled, { hour: time.hour, minute: time.minute });
      setPrefs(dailyMenuPrefs());
      if (result === 'denied') setNotice({ ok: false, text: 'Per ricevere le notifiche consentile dalle impostazioni del telefono, poi riprova.' });
      else setNotice({ ok: true, text: result === 'on' ? 'Fatto: riceverai il menù del giorno.' : 'Notifiche spente su questo telefono.' });
    } catch {
      setNotice({ ok: false, text: 'Non è stato possibile impostare le notifiche. Riprova.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
      <p className="font-semibold text-slate-900 flex items-center gap-2"><Bell className="w-4 h-4" /> Notifiche del menù</p>
      <p className="text-sm text-slate-600 leading-relaxed">
        Un promemoria al giorno con pranzo e cena di oggi. È una scelta tua: vale solo per questo telefono e non cambia nulla per gli altri.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-semibold text-slate-700" htmlFor="reminder-time">Orario</label>
        <input
          id="reminder-time"
          type="time"
          value={formatReminderTime(prefs)}
          disabled={busy}
          onChange={(e) => {
            const time = parseReminderTime(e.target.value);
            setPrefs((p) => ({ ...p, ...time }));
            if (prefs.enabled) void apply(true, { ...prefs, ...time });
          }}
          className="h-11 px-3 bg-white border border-slate-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>
      <button
        onClick={() => apply(!prefs.enabled)}
        disabled={busy}
        role="switch"
        aria-checked={prefs.enabled}
        className={`w-full h-12 rounded-2xl font-bold disabled:opacity-60 ${
          prefs.enabled ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-800'
        }`}
      >
        {prefs.enabled ? 'Notifiche attive · tocca per spegnerle' : 'Attiva le notifiche del menù'}
      </button>
      {notice && (
        <p role="status" className={`text-sm rounded-xl p-3 border ${notice.ok ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
          {notice.text}
        </p>
      )}
      <p className="text-xs text-slate-500 leading-relaxed">
        Il testo segue il menù che questo telefono ha ricevuto l'ultima volta che hai aperto l'app: se il menù cambia, aprila per aggiornarlo.
      </p>
    </div>
  );
}
