import type { Recipe, WeeklyPlan } from '../types';
import { WEEK_DAYS } from './manualPlan';

export interface DayMenu {
  day: string;
  lunch: Recipe[];
  dinner: Recipe[];
  /** Colazione e merende: vuote se il menù non le comprende */
  breakfast: Recipe[];
  snackAm: Recipe[];
  snackPm: Recipe[];
}

/** Nome del giorno in italiano (la settimana parte dal lunedì, come nel menù). */
export const dayNameOf = (date: Date): string => WEEK_DAYS[(date.getDay() + 6) % 7];

/** Pranzo e cena di un giorno, con le ricette trovate (i piatti non più disponibili si saltano). */
export function dayMenu(plan: WeeklyPlan | null | undefined, recipes: Recipe[], day: string): DayMenu {
  const byId = new Map(recipes.map((r) => [r.id, r]));
  const source = plan?.days?.[day];
  const pick = (ids: string[] | undefined) => (ids || []).map((id) => byId.get(id)).filter((r): r is Recipe => !!r);
  return {
    day,
    lunch: pick(source?.lunchIds),
    dinner: pick(source?.dinnerIds),
    breakfast: pick(source?.breakfastIds),
    snackAm: pick(source?.snackAmIds),
    snackPm: pick(source?.snackPmIds),
  };
}

export const weekMenu = (plan: WeeklyPlan | null | undefined, recipes: Recipe[]): DayMenu[] =>
  WEEK_DAYS.map((day) => dayMenu(plan, recipes, day));

/** Il menù ha almeno un piatto. */
export const hasMenu = (plan: WeeklyPlan | null | undefined): boolean =>
  !!plan?.days &&
  Object.values(plan.days).some(
    (d) => (d.lunchIds?.length || 0) + (d.dinnerIds?.length || 0) + (d.breakfastIds?.length || 0) + (d.snackAmIds?.length || 0) + (d.snackPmIds?.length || 0) > 0,
  );

const titles = (list: Recipe[]) => list.map((r) => r.title).join(' + ');

/** Testo del promemoria: "Pranzo: … · Cena: …". Vuoto se quel giorno non c'è nulla. */
export function reminderText(menu: DayMenu): string {
  const parts: string[] = [];
  if (menu.breakfast.length > 0) parts.push(`Colazione: ${titles(menu.breakfast)}`);
  if (menu.snackAm.length > 0) parts.push(`Spuntino: ${titles(menu.snackAm)}`);
  if (menu.lunch.length > 0) parts.push(`Pranzo: ${titles(menu.lunch)}`);
  if (menu.snackPm.length > 0) parts.push(`Merenda: ${titles(menu.snackPm)}`);
  if (menu.dinner.length > 0) parts.push(`Cena: ${titles(menu.dinner)}`);
  return parts.join(' · ');
}

export interface ScheduledReminder {
  id: number;
  at: Date;
  title: string;
  body: string;
}

export const DAILY_REMINDER_BASE_ID = 2000;
export const DAILY_REMINDER_DAYS = 7;

/**
 * Promemoria dei prossimi giorni all'orario scelto, ognuno con il menù di quel giorno.
 * Si salta oggi se l'orario è già passato e i giorni senza piatti (nessuna notifica vuota).
 */
export function buildDailyReminders(args: {
  plan: WeeklyPlan | null | undefined;
  recipes: Recipe[];
  hour: number;
  minute: number;
  now?: Date;
  days?: number;
}): ScheduledReminder[] {
  const { plan, recipes, hour, minute, now = new Date(), days = DAILY_REMINDER_DAYS } = args;
  const out: ScheduledReminder[] = [];
  for (let i = 0; i < days; i++) {
    const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, hour, minute, 0, 0);
    if (at.getTime() <= now.getTime()) continue;
    const body = reminderText(dayMenu(plan, recipes, dayNameOf(at)));
    if (!body) continue;
    out.push({ id: DAILY_REMINDER_BASE_ID + i + 1, at, title: 'Che cucino oggi?', body });
  }
  return out;
}

/** Orario scelto "HH:MM" → ore e minuti validi; altrimenti l'orario predefinito (18:00). */
export function parseReminderTime(value: string | null | undefined): { hour: number; minute: number } {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value || '');
  if (m) {
    const hour = Number(m[1]);
    const minute = Number(m[2]);
    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) return { hour, minute };
  }
  return { hour: 18, minute: 0 };
}

export const formatReminderTime = ({ hour, minute }: { hour: number; minute: number }) =>
  `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

// ---- Link e codice di condivisione ---------------------------------------------------

/** Come il server salva il link attivo della famiglia (users/{uid}/familyShare/current). */
export interface ShareInfo {
  code: string;
  createdAt: number;
  expiresAt: number;
  revoked: boolean;
}

/** Link da mandare: il codice sta dopo il # , quindi non viene inviato ai server né registrato dal sito. */
export const shareUrl = (siteUrl: string, code: string) => `${siteUrl.replace(/\/$/, '')}/menu#${code}`;

/** Messaggio pronto per WhatsApp: il link per chi non ha l'app, il codice per chi ce l'ha. */
export const shareMessage = (siteUrl: string, code: string) =>
  `Ecco il menù di casa! Aprilo da qui, senza installare nulla: ${shareUrl(siteUrl, code)}\nSe usi l'app "Che cucino oggi?", il codice è ${code}.`;

/** Il codice scritto a mano (anche minuscolo, con spazi o trattini) → formato XXXX-XXXX-XXXX; null se non è valido. */
export function normalizeShareCode(input: string): string | null {
  const raw = (input.includes('#') ? input.slice(input.indexOf('#') + 1) : input).toUpperCase().replace(/[\s-]/g, '');
  if (!/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{12}$/.test(raw)) return null;
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;
}
