export type DietaryRestriction = 'gluten-free' | 'lactose-free' | 'vegan';

export interface FamilyMember {
  id: string;
  name: string;
  likedIngredients: string[];
  dislikedIngredients: string[];
  likedMeals?: string[];
  dislikedMeals?: string[];
  /** Dieta solo di questa persona: se il piatto di tutti non va bene, il menù prepara un'alternativa */
  dietaryRestrictions?: DietaryRestriction[];
  /** Allergie o ingredienti da evitare assolutamente solo per questa persona */
  allergies?: string[];
  /** È la persona collegata all'account: il suo nome e quello dell'account restano uguali */
  isSelf?: boolean;
  /** Invito per compilare da solo: lo scrive il server (il link, la scadenza, la risposta) */
  inviteStatus?: 'sent' | 'answered' | 'revoked';
  inviteExpiresAt?: number;
  inviteAnsweredAt?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  dietaryRestrictions: DietaryRestriction[];
  excludedIngredients: string[];
  currentOffers?: string[];
  plan?: 'free' | 'smart' | 'pro';
  autoRenew?: boolean;
  subscriptionStatus?: 'active' | 'pending_renewal';
  isAdmin?: boolean;
  isSuspended?: boolean;
  email?: string;
  createdAt?: string;
  aiInteractionsThisMonth?: number;
  aiUsage?: { month: string; flyerScans: number };
  dishUsage?: { month: string; count: number };
  hadSubscription?: boolean;
  tempOTP?: string;
  tempOTPExpires?: string;
  tempOTPGeneratedAt?: string;
  tempPassword?: string;
  tempPasswordGeneratedAt?: string;
  hasCompletedWelcomeTour?: boolean;
  /** Famiglia a cui ci si è collegati con un codice (uid di chi la gestisce): sola consultazione del menù. La scrive il server */
  familyId?: string;
  paymentHistory?: {
    transactionId: string;
    plan: 'smart' | 'pro';
    amount: number;
    date: string;
    status: 'paid';
    paymentMethod: 'stripe' | 'gpay' | 'googleplay';
  }[];
}

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

export interface Recipe {
  id: string;
  title: string;
  ingredients: Ingredient[];
  instructions: string[];
  tags: string[];
  season: 'spring' | 'summer' | 'autumn' | 'winter' | 'all';
  isWHOCompliant: boolean;
  category: 'lunch' | 'dinner' | 'dessert' | 'breakfast' | 'cold' | 'takeaway' | 'side' | 'fast';
  difficulty: 'easy' | 'medium' | 'hard';
  timeMin: number;
  servings?: number;
  proteinType?: 'white-meat' | 'red-meat' | 'fish' | 'cheese' | 'eggs' | 'legumes' | 'veg';
  hasCarbs: boolean;
  hasProtein: boolean;
  hasVeg: boolean;
  seasoningTips?: string;
  nutrients?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

/** Pasto pensato per mangiare tutti insieme: come è stato trovato e a quanti piace */
export interface TogetherInfo {
  /** all: piace a tutti · neutral: piatto semplice per tutti · majority: piace alla maggioranza, alternativa per gli altri */
  mode: 'all' | 'neutral' | 'majority';
  /** Persone per cui il piatto va bene così com'è */
  fits: number;
  total: number;
}

export interface DayPlan {
  lunchIds: string[];
  dinnerIds: string[];
  lunchTogether?: TogetherInfo;
  dinnerTogether?: TogetherInfo;
  /** Alternative per chi ha una dieta o un'allergia personale: id persona → id ricetta */
  lunchAlt?: Record<string, string>;
  dinnerAlt?: Record<string, string>;
}

export interface WeeklyPlan {
  id: string;
  startDate: string; // ISO date
  generatedWithoutFamily?: boolean;
  /** Menù scritto a mano dall'utente (per esempio la dieta del nutrizionista): non si cambia da solo */
  manual?: boolean;
  days: {
    [key: string]: DayPlan; // 'Monday', 'Tuesday', ...
  };
}

export interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
}
