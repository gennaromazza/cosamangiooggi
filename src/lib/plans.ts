/**
 * Piani e limiti di "Che cucino oggi?": unica fonte di verità.
 *
 * Gli identificativi interni restano 'free' | 'smart' | 'pro' (sono quelli salvati nel database e
 * collegati a Stripe); cambiano solo i nomi mostrati agli utenti.
 *
 * Principi: le allergie e le diete non si pagano mai; il piano gratuito mostra il valore vero
 * (il menù per tutta la famiglia); si paga per la comodità e per l'intelligenza artificiale.
 */
export type PlanId = 'free' | 'smart' | 'pro';
export type BillingInterval = 'month' | 'year';

export interface PlanLimits {
  maxMembers: number;
  maxPantryItems: number;
  exportList: boolean;
  vacationPlanner: boolean;
  flyerScansPerMonth: number;
  /** Riconoscimenti IA degli ingredienti di un piatto di famiglia (al mese) */
  dishSuggestionsPerMonth: number;
  voiceAssistant: boolean;
}

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: { maxMembers: 4, maxPantryItems: 20, exportList: false, vacationPlanner: false, flyerScansPerMonth: 0, dishSuggestionsPerMonth: 3, voiceAssistant: false },
  smart: { maxMembers: Infinity, maxPantryItems: Infinity, exportList: true, vacationPlanner: true, flyerScansPerMonth: 0, dishSuggestionsPerMonth: 3, voiceAssistant: false },
  // Tetti mensili: ogni richiesta all'IA ha un costo reale (Gemini). Tenere allineati a functions/index.js (3 di prova per tutti, 50 con Chef IA)
  pro: { maxMembers: Infinity, maxPantryItems: Infinity, exportList: true, vacationPlanner: true, flyerScansPerMonth: 30, dishSuggestionsPerMonth: 50, voiceAssistant: true },
};

export const PLAN_NAMES: Record<PlanId, string> = { free: 'Gratis', smart: 'Famiglia', pro: 'Chef IA' };

export const PRICES: Record<'smart' | 'pro', Record<BillingInterval, number>> = {
  smart: { month: 3.99, year: 29.99 },
  pro: { month: 6.99, year: 49.99 },
};

export const TRIAL_DAYS = 7;

/** Scontrini letti dalla foto ogni mese: per tutti i piani (tenere allineato a functions/index.js) */
export const RECEIPT_SCANS_PER_MONTH = 60;

/** Riporta qualunque valore salvato a un piano valido (gli account demo/locali usano 'premium'). */
export function normalizePlan(plan?: string | null): PlanId {
  if (plan === 'pro') return 'pro';
  if (plan === 'smart' || plan === 'premium') return 'smart';
  return 'free';
}

export const limitsFor = (plan?: string | null): PlanLimits => PLAN_LIMITS[normalizePlan(plan)];
export const planName = (plan?: string | null): string => PLAN_NAMES[normalizePlan(plan)];

export function formatPrice(value: number): string {
  return `${value.toFixed(2).replace('.', ',')} €`;
}

/** Quanti mesi si risparmiano pagando l'anno (es. 29,99 € vs 12 × 3,99 € ≈ 1,6 mesi). */
export function yearlySavingPercent(plan: 'smart' | 'pro'): number {
  const yearlyIfMonthly = PRICES[plan].month * 12;
  return Math.round((1 - PRICES[plan].year / yearlyIfMonthly) * 100);
}

/** Quanti riconoscimenti IA restano questo mese (contatore scritto solo dal server). */
export function dishSuggestionsLeft(plan: string | null | undefined, usage?: { month: string; count: number } | null): number {
  const month = new Date().toISOString().slice(0, 7);
  const used = usage && usage.month === month ? usage.count || 0 : 0;
  return Math.max(0, limitsFor(plan).dishSuggestionsPerMonth - used);
}
