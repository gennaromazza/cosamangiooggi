import { useEffect, useState } from 'react';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { INITIAL_RECIPES } from '../data/recipes';
import { DAILY_CHANGED_EVENT, refreshDailyMenuReminders, remindersAvailable } from '../lib/reminders';
import type { Recipe, WeeklyPlan } from '../types';

interface Props {
  userId: string;
  /** Famiglia a cui ci si è collegati: si segue il suo menù. Altrimenti il proprio. */
  familyId?: string;
}

/**
 * Tiene aggiornati i promemoria del menù di questo telefono: segue il menù (proprio o della famiglia a cui ci si è
 * collegati) e riprogramma i prossimi giorni a ogni cambio, a ogni apertura dell'app e a ogni cambio di scelte.
 * Non mostra nulla.
 */
export default function MenuReminderSync({ userId, familyId }: Props) {
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [custom, setCustom] = useState<Recipe[]>([]);
  const [tick, setTick] = useState(0);
  const source = familyId || userId;
  const enabled = remindersAvailable() && !userId.startsWith('local-') && userId !== 'demo-family-user';

  useEffect(() => {
    if (!enabled) return;
    const unsubPlan = onSnapshot(doc(db, `users/${source}/mealPlans/current`), (s) => setPlan(s.exists() ? (s.data() as WeeklyPlan) : null), () => setPlan(null));
    const unsubCustom = onSnapshot(
      collection(db, `users/${source}/customRecipes`),
      (s) => setCustom(s.docs.map((d) => ({ id: d.id, ...d.data() }) as Recipe)),
      () => setCustom([]),
    );
    return () => {
      unsubPlan();
      unsubCustom();
    };
  }, [enabled, source]);

  useEffect(() => {
    if (!enabled) return;
    const bump = () => setTick((t) => t + 1);
    const onVisible = () => document.visibilityState === 'visible' && bump();
    window.addEventListener(DAILY_CHANGED_EVENT, bump);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener(DAILY_CHANGED_EVENT, bump);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    refreshDailyMenuReminders(plan, [...INITIAL_RECIPES, ...custom]).catch((e) => console.error('Promemoria non aggiornati:', e));
  }, [enabled, plan, custom, tick]);

  return null;
}
