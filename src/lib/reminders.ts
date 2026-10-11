import { Capacitor } from '@capacitor/core';

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
