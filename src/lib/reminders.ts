import { Capacitor } from '@capacitor/core';
import type { Recipe, WeeklyPlan } from '../types';
import {
  buildDailyReminders,
  DAILY_REMINDER_BASE_ID,
  DAILY_REMINDER_DAYS,
  formatReminderTime,
  parseReminderTime,
} from './sharedMenu';

const REMINDER_ID = 1001;
const STORAGE_KEY = 'sunday_reminder';

/** I promemoria esistono solo nell'app Android: sul sito non ci sono notifiche locali. */
export const remindersAvailable = () => Capacitor.isNativePlatform();

export function sundayReminderEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'on';
  } catch {
    return false;
  }
}

/** Promemoria ogni domenica alle 10:00: "è ora di preparare il menù della settimana". */
export async function setSundayReminder(enabled: boolean): Promise<'on' | 'off' | 'denied'> {
  const { LocalNotifications } = await import('@capacitor/local-notifications');
  if (!enabled) {
    await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] });
    try {
      localStorage.setItem(STORAGE_KEY, 'off');
    } catch {
      /* storage non disponibile */
    }
    return 'off';
  }
  const permission = await LocalNotifications.requestPermissions();
  if (permission.display !== 'granted') return 'denied';
  await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] });
  await LocalNotifications.schedule({
    notifications: [
      {
        id: REMINDER_ID,
        title: 'Che cucino oggi?',
        body: 'È domenica: prepariamo il menù della settimana?',
        // weekday: 1 = domenica
        schedule: { on: { weekday: 1, hour: 10, minute: 0 }, allowWhileIdle: true },
      },
    ],
  });
  try {
    localStorage.setItem(STORAGE_KEY, 'on');
  } catch {
    /* storage non disponibile */
  }
  return 'on';
}

// ---- Promemoria giornaliero con il menù del giorno ----------------------------------

const DAILY_KEY = 'daily_menu_reminder';
export const DAILY_CHANGED_EVENT = 'menu-reminders-changed';

export interface DailyPrefs {
  enabled: boolean;
  hour: number;
  minute: number;
}

/** Scelte di questo dispositivo: ognuno attiva o spegne i suoi promemoria senza toccare quelli degli altri. */
export function dailyMenuPrefs(): DailyPrefs {
  try {
    const saved = JSON.parse(localStorage.getItem(DAILY_KEY) || 'null') as Partial<DailyPrefs> | null;
    const { hour, minute } = parseReminderTime(formatReminderTime({ hour: Number(saved?.hour), minute: Number(saved?.minute) }));
    return { enabled: saved?.enabled === true, hour, minute };
  } catch {
    return { enabled: false, ...parseReminderTime(null) };
  }
}

const savePrefs = (prefs: DailyPrefs) => {
  try {
    localStorage.setItem(DAILY_KEY, JSON.stringify(prefs));
  } catch {
    /* storage non disponibile */
  }
  window.dispatchEvent(new CustomEvent(DAILY_CHANGED_EVENT));
};

const dailyIds = () => Array.from({ length: DAILY_REMINDER_DAYS }, (_, i) => ({ id: DAILY_REMINDER_BASE_ID + i + 1 }));

/** Attiva, spegne o cambia l'orario del promemoria giornaliero (chiede il permesso al telefono se serve). */
export async function setDailyMenuReminder(enabled: boolean, time?: { hour: number; minute: number }): Promise<'on' | 'off' | 'denied'> {
  const current = dailyMenuPrefs();
  const next = { enabled, hour: time?.hour ?? current.hour, minute: time?.minute ?? current.minute };
  const { LocalNotifications } = await import('@capacitor/local-notifications');
  if (!enabled) {
    await LocalNotifications.cancel({ notifications: dailyIds() });
    savePrefs(next);
    return 'off';
  }
  const permission = await LocalNotifications.requestPermissions();
  if (permission.display !== 'granted') {
    savePrefs({ ...next, enabled: false });
    return 'denied';
  }
  savePrefs(next);
  return 'on';
}

/**
 * Programma i promemoria dei prossimi 7 giorni con il menù di adesso. Si richiama a ogni apertura dell'app e a ogni
 * cambio del menù: i testi seguono il menù che il dispositivo ha ricevuto l'ultima volta che l'app era aperta.
 */
export async function refreshDailyMenuReminders(plan: WeeklyPlan | null | undefined, recipes: Recipe[]): Promise<number> {
  if (!remindersAvailable()) return 0;
  const prefs = dailyMenuPrefs();
  const { LocalNotifications } = await import('@capacitor/local-notifications');
  await LocalNotifications.cancel({ notifications: dailyIds() });
  if (!prefs.enabled) return 0;
  const list = buildDailyReminders({ plan, recipes, hour: prefs.hour, minute: prefs.minute });
  if (list.length === 0) return 0;
  await LocalNotifications.schedule({
    notifications: list.map((r) => ({ id: r.id, title: r.title, body: r.body, schedule: { at: r.at, allowWhileIdle: true } })),
  });
  return list.length;
}
