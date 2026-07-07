import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCurrentSeason(): 'spring' | 'summer' | 'autumn' | 'winter' {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

export function getRawIngredientNames(name: string): string[] {
  const lowercaseName = name.toLowerCase().trim();

  // 1. Mapping for complex/prepared ingredients to their raw components
  const complexMapping: Record<string, string[]> = {
    'fumet di pesce': ['Pesce per brodo', 'Aromi per pesce'],
    'fumetto di pesce': ['Pesce per brodo', 'Aromi per pesce'],
    'brodo vegetale': ['Sedano', 'Carote', 'Cipolla'],
    'brodo di carne': ['Carne per brodo'],
    'brodo di carne o vegetale': ['Preparato per brodo'],
    'passata di pomodoro': ['Pomodori'],
    'polpa di pomodoro': ['Pomodori'],
    'pelati': ['Pomodori'],
    'besciamella': ['Latte', 'Farina', 'Burro'],
    'pesto di panna': ['Panna'],
    'panino al latte o all\'olio': ['Panino'],
    'frutti di mare': ['Cozze', 'Vongole', 'Gamberi'],
    'misto crostacei': ['Gamberi', 'Scampi'],
    'olive e capperi': ['Olive', 'Capperi'],
    'prezzemolo e aglio': ['Prezzemolo', 'Aglio'],
    'prezzemolo e limone': ['Prezzemolo', 'Limone'],
    'origano e aglio': ['Origano', 'Aglio'],
    'aglio e peperoncino': ['Aglio', 'Peperoncino'],
    'formaggio philadelphia': ['Philadelphia'],
    'carota e sedano': ['Carota', 'Sedano'],
    'lenticchie precotte': ['Lenticchie'],
    'ceci precotti': ['Ceci'],
    'fagioli precotti': ['Fagioli'],
    'fagioli bianchi precotti': ['Fagioli bianchi'],
    'fagioli borlotti precotti': ['Fagioli borlotti'],
    'fagioli cannellini precotti': ['Fagioli cannellini'],
    'latte o acqua': ['Latte'],
    'cozze e vongole': ['Cozze', 'Vongole'],
    'calamari e seppie': ['Calamari', 'Seppie'],
    'arancia e limone': ['Arancia', 'Limone']
  };

  // Check for direct mapping (whole string match or significant part)
  for (const [key, components] of Object.entries(complexMapping)) {
    if (lowercaseName === key || lowercaseName.includes(key)) {
      return components;
    }
  }

  // 2. Handle alternatives or combinations if not mapped
  let processedName = lowercaseName;

  // Filter out leftovers explicitly
  const leftoverTerms = ['avanzata', 'avanzato', 'avanzati', 'avanzate', 'residuo', 'avanzi'];
  if (leftoverTerms.some(term => processedName.includes(term))) {
    return []; // Don't buy leftovers
  }

  if (processedName.includes(' o ')) {
    const parts = processedName.split(/\s+o\s+/);
    // Prefer non-water alternatives
    processedName = parts.find(p => !p.includes('acqua')) || parts[0];
  }

  // Split by " e " for multiple items
  const items = processedName.split(/\s+e\s+/).map(item => item.trim());

  // 3. Clean up each item
  const termsToRemove = [
    // Preparation/State
    'bollito', 'bollita', 'bollite', 'bolliti',
    'lesso', 'lessa', 'lesse', 'lessi',
    'cotto', 'cotta', 'cotte', 'cotti',
    'precotto', 'precotta', 'precotte', 'precotti',
    'pulito', 'pulita', 'pulite', 'puliti',
    'fresco', 'fresca', 'fresche', 'freschi',
    'tritato', 'tritata', 'tritate', 'tritati',
    'sott\'olio', 'al naturale',
    'a cubetti', 'cubetti', 'pezzettoni',
    'grattugiato', 'tostato', 'morbido',
    'spalmabile', 'fresco spalmabile', 'da cucina',
    'in scatola', 'in barattolo',

    // Specific descriptions
    'verace', 'veraci', 'veraci freschi',
    'alla luciana', 'alla barese', 'alla siciliana',
    'in cassetta', 'di tipo 0', 'di tipo 1',
    'millefiori', 'di acacia',
    
    // Fillers/Connectives/Quantities
    'un pizzico di', 'una manciata di', 'q.b.', 'qualche foglia di',
    'fresche pulite', 'fresche', 'fresco', 'freschi', 'fresca',
    'un po\' di', 'qualche'
  ];

  return items.map(item => {
    let raw = item;
    termsToRemove.forEach(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      raw = raw.replace(regex, '');
    });
    // Final aggressive cleanup of extra spaces and some remaining connectors
    return raw.replace(/\s+/g, ' ').trim();
  }).filter(name => name.length > 1 && name !== 'acqua' && name !== 'sale' && name !== 'pepe');
}

export function scaleIngredientAmount(amount: number, originalServings: number, targetServings: number): number {
  if (amount <= 0 || !amount) return 0;
  const ratio = targetServings / originalServings;
  const scaled = amount * ratio;
  
  // Round to a reasonable value
  if (scaled >= 100) return Math.round(scaled / 10) * 10;
  if (scaled >= 20) return Math.round(scaled / 5) * 5;
  if (scaled >= 1) return Math.round(scaled);
  return Math.round(scaled * 2) / 2;
}
