export type DietaryRestriction = 'gluten-free' | 'lactose-free' | 'vegan';

export interface FamilyMember {
  id: string;
  name: string;
  likedIngredients: string[];
  dislikedIngredients: string[];
  likedMeals?: string[];
  dislikedMeals?: string[];
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
  hadSubscription?: boolean;
  tempOTP?: string;
  tempOTPExpires?: string;
  tempOTPGeneratedAt?: string;
  tempPassword?: string;
  tempPasswordGeneratedAt?: string;
  hasCompletedWelcomeTour?: boolean;
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

export interface DayPlan {
  lunchIds: string[];
  dinnerIds: string[];
}

export interface WeeklyPlan {
  id: string;
  startDate: string; // ISO date
  generatedWithoutFamily?: boolean;
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
