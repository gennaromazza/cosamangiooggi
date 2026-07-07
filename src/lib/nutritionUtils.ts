import { Recipe, Ingredient } from '../types';

interface NutrientInfo {
  calories: number; // per 100g or per unit
  protein: number;
  carbs: number;
  fat: number;
}

const INGREDIENT_DATABASE: Record<string, NutrientInfo> = {
  // Cereali e farine
  'Pasta': { calories: 350, protein: 12, carbs: 70, fat: 1.5 },
  'Pasta corta': { calories: 350, protein: 12, carbs: 70, fat: 1.5 },
  'Riso': { calories: 350, protein: 7, carbs: 78, fat: 0.6 },
  'Riso Carnaroli': { calories: 350, protein: 7, carbs: 78, fat: 0.6 },
  'Farina': { calories: 340, protein: 10, carbs: 72, fat: 1 },
  'Pane integrale': { calories: 250, protein: 9, carbs: 45, fat: 2 },
  'Pane bianco': { calories: 265, protein: 8, carbs: 50, fat: 3 },
  'Pane in cassetta': { calories: 250, protein: 8, carbs: 48, fat: 4 },
  'Panino': { calories: 270, protein: 8, carbs: 55, fat: 3 },
  'Grissini': { calories: 420, protein: 10, carbs: 75, fat: 10 },
  'Patate': { calories: 77, protein: 2, carbs: 17, fat: 0.1 },

  // Proteine animali
  'Pollo': { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  'Petto di pollo': { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  'Tacchino': { calories: 135, protein: 30, carbs: 0, fat: 1.5 },
  'Carne macinata': { calories: 250, protein: 26, carbs: 0, fat: 15 },
  'Hamburger': { calories: 250, protein: 26, carbs: 0, fat: 15 },
  'Uova': { calories: 78 * 2, protein: 13, carbs: 1, fat: 10 }, // assuming ~100g for 2 eggs
  'Uovo': { calories: 78, protein: 6.5, carbs: 0.5, fat: 5 },
  'Tonno': { calories: 130, protein: 28, carbs: 0, fat: 1 },
  'Tonno sott\'olio': { calories: 190, protein: 25, carbs: 0, fat: 10 }, // sgocciolato
  'Merluzzo': { calories: 82, protein: 18, carbs: 0, fat: 0.7 },
  'Salmone': { calories: 208, protein: 20, carbs: 0, fat: 13 },
  'Cozze': { calories: 86, protein: 12, carbs: 3, fat: 2 },
  'Vongole': { calories: 74, protein: 13, carbs: 2, fat: 1 },
  'Gamberi': { calories: 99, protein: 20, carbs: 0, fat: 1.5 },
  'Alici': { calories: 130, protein: 20, carbs: 0, fat: 5 },
  'Polpo': { calories: 82, protein: 15, carbs: 2, fat: 1 },
  'Prosciutto cotto': { calories: 140, protein: 20, carbs: 0, fat: 6 },
  'Speck': { calories: 300, protein: 30, carbs: 0, fat: 20 },

  // Latticini e grassi
  'Mozzarella': { calories: 280, protein: 18, carbs: 2, fat: 22 },
  'Parmigiano': { calories: 430, protein: 33, carbs: 0, fat: 30 },
  'Philadelphia': { calories: 250, protein: 6, carbs: 4, fat: 23 },
  'Ricotta': { calories: 170, protein: 11, carbs: 4, fat: 12 },
  'Formaggio spalmabile': { calories: 250, protein: 6, carbs: 4, fat: 23 },
  'Burro': { calories: 717, protein: 1, carbs: 1, fat: 81 },
  'Olio EVO': { calories: 884, protein: 0, carbs: 0, fat: 100 },
  'Panna': { calories: 335, protein: 2, carbs: 3, fat: 35 },

  // Legumi
  'Lenticchie': { calories: 116, protein: 9, carbs: 20, fat: 0.4 }, // cotte
  'Fagioli': { calories: 139, protein: 10, carbs: 25, fat: 0.5 }, // cotti
  'Ceci': { calories: 164, protein: 9, carbs: 27, fat: 2.6 }, // cotti
  'Piselli': { calories: 81, protein: 5, carbs: 14, fat: 0.4 },

  // Verdure
  'Pomodori': { calories: 18, protein: 1, carbs: 4, fat: 0.2 },
  'Pomodorini': { calories: 20, protein: 1, carbs: 4, fat: 0.2 },
  'Zucchine': { calories: 17, protein: 1, carbs: 3, fat: 0.3 },
  'Melanzane': { calories: 25, protein: 1, carbs: 6, fat: 0.2 },
  'Peperoni': { calories: 31, protein: 1, carbs: 6, fat: 0.3 },
  'Spinaci': { calories: 23, protein: 3, carbs: 4, fat: 0.4 },
  'Zucca': { calories: 26, protein: 1, carbs: 7, fat: 0.1 },
  'Lattuga': { calories: 15, protein: 1, carbs: 3, fat: 0.2 },
  'Mais': { calories: 86, protein: 3, carbs: 19, fat: 1.2 },

  // Frutta e zuccheri
  'Banane': { calories: 89, protein: 1, carbs: 23, fat: 0.3 },
  'Mele': { calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  'Zucchero': { calories: 387, protein: 0, carbs: 100, fat: 0 },
  'Marmellata': { calories: 250, protein: 0.5, carbs: 60, fat: 0.1 },
  'Noci': { calories: 654, protein: 15, carbs: 14, fat: 65 },
};

export const calculateNutrients = (ingredients: Ingredient[]) => {
  let total = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  };

  ingredients.forEach(ing => {
    // Try to find the closest match in the database
    const dbEntry = Object.entries(INGREDIENT_DATABASE).find(([name]) => 
      ing.name.toLowerCase().includes(name.toLowerCase()) || 
      name.toLowerCase().includes(ing.name.toLowerCase())
    )?.[1];

    if (dbEntry) {
      let factor = 0;
      if (ing.unit === 'g' || ing.unit === 'ml') {
        factor = ing.amount / 100;
      } else if (ing.unit === '' || ing.unit === 'pz') {
        factor = ing.amount; // Assume amount is already calibrated if no unit (e.g. 1 uovo)
      } else {
        factor = 1; // Fallback
      }

      total.calories += dbEntry.calories * factor;
      total.protein += dbEntry.protein * factor;
      total.carbs += dbEntry.carbs * factor;
      total.fat += dbEntry.fat * factor;
    }
  });

  return {
    calories: Math.round(total.calories),
    protein: Math.round(total.protein),
    carbs: Math.round(total.carbs),
    fat: Math.round(total.fat)
  };
};
