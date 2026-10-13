import type { Ingredient, Recipe } from '../types';
import { inferDishInfo } from '../lib/dishInference';

/**
 * Colazioni e merende: pochi ingredienti, pronti in pochi minuti, quantità PER UNA PERSONA (servings: 1).
 * Dieta e tipo di piatto si ricavano dagli ingredienti, come per i piatti scritti dagli utenti.
 */
type Row = [id: string, title: string, minutes: number, ingredients: [name: string, amount: number, unit: string][], steps: string[]];

const ing = (list: Row[3]): Ingredient[] => list.map(([name, amount, unit]) => ({ name, amount, unit }));

function build(rows: Row[], category: 'breakfast' | 'snack'): Recipe[] {
  return rows.map(([id, title, timeMin, ingredients, steps]) => {
    const list = ing(ingredients);
    const info = inferDishInfo(list, title);
    return {
      id: `${category}-${id}`,
      title,
      category,
      difficulty: 'easy',
      timeMin,
      servings: 1,
      season: 'all',
      isWHOCompliant: true,
      tags: info.tags,
      ingredients: list,
      instructions: steps,
      proteinType: info.proteinType,
      hasCarbs: info.hasCarbs,
      hasProtein: info.hasProtein,
      hasVeg: info.hasVeg,
    } as Recipe;
  });
}

const BREAKFASTS: Row[] = [
  ['yogurt-cereali', 'Yogurt greco con cereali e frutta', 5, [['Yogurt greco bianco', 150, 'g'], ['Fiocchi d\'avena', 30, 'g'], ['Banana', 1, 'pz'], ['Miele', 1, 'cucchiaino']], ['Versare lo yogurt in una ciotola.', 'Aggiungere i fiocchi d\'avena, la banana a rondelle e un filo di miele.']],
  ['porridge-mela', 'Porridge di avena e mela', 10, [['Fiocchi d\'avena', 40, 'g'], ['Latte', 200, 'ml'], ['Mela', 1, 'pz'], ['Cannella', 1, 'pizzico']], ['Scaldare il latte con i fiocchi d\'avena mescolando per 5 minuti.', 'Servire con la mela a pezzetti e un pizzico di cannella.']],
  ['porridge-vegano', 'Porridge vegano con frutti di bosco', 10, [['Fiocchi d\'avena', 40, 'g'], ['Latte di soia non dolcificato', 200, 'ml'], ['Frutti di bosco', 80, 'g']], ['Cuocere i fiocchi nel latte di soia per 5 minuti.', 'Completare con i frutti di bosco.']],
  ['pane-marmellata', 'Pane integrale con marmellata e un caffè', 5, [['Pane integrale', 2, 'fetta'], ['Marmellata', 20, 'g'], ['Caffè', 1, 'pz']], ['Spalmare la marmellata sulle fette di pane.', 'Accompagnare con il caffè o il tè.']],
  ['pane-ricotta-miele', 'Pane tostato con ricotta e miele', 5, [['Pane integrale', 2, 'fetta'], ['Ricotta', 60, 'g'], ['Miele', 1, 'cucchiaino']], ['Tostare il pane.', 'Spalmare la ricotta e completare con il miele.']],
  ['fette-biscottate', 'Fette biscottate con marmellata e latte', 5, [['Fette biscottate', 4, 'pz'], ['Marmellata', 20, 'g'], ['Latte', 200, 'ml']], ['Spalmare la marmellata sulle fette biscottate.', 'Servire con un bicchiere di latte.']],
  ['cornflakes-latte', 'Cereali con latte e frutta', 5, [['Cornflakes', 40, 'g'], ['Latte', 200, 'ml'], ['Pera', 1, 'pz']], ['Versare i cereali nel latte.', 'Aggiungere la pera a pezzetti.']],
  ['uova-pane', 'Uovo strapazzato con pane integrale', 10, [['Uova', 1, 'pz'], ['Pane integrale', 1, 'fetta'], ['Olio EVO', 5, 'ml']], ['Strapazzare l\'uovo in padella con un filo d\'olio.', 'Servire con il pane tostato.']],
  ['avocado-toast', 'Toast con avocado e pomodoro', 10, [['Pane integrale', 2, 'fetta'], ['Avocado', 50, 'g'], ['Pomodoro', 60, 'g'], ['Olio EVO', 3, 'ml']], ['Tostare il pane.', 'Schiacciare l\'avocado, spalmarlo e aggiungere il pomodoro a fette.']],
  ['toast-prosciutto', 'Toast con prosciutto cotto e formaggio', 8, [['Pane in cassetta', 2, 'fetta'], ['Prosciutto cotto', 30, 'g'], ['Fontina', 20, 'g']], ['Farcire il pane con il prosciutto e il formaggio.', 'Scaldare il toast in padella o nel tostapane.']],
  ['pancake-avena', 'Pancake di avena e banana', 15, [['Fiocchi d\'avena', 40, 'g'], ['Banana', 1, 'pz'], ['Uova', 1, 'pz']], ['Frullare la banana con l\'uovo e i fiocchi.', 'Cuocere piccole frittelle in padella antiaderente per 2 minuti per lato.']],
  ['yogurt-granola', 'Yogurt bianco con granola e kiwi', 5, [['Yogurt bianco', 125, 'g'], ['Granola', 30, 'g'], ['Kiwi', 1, 'pz']], ['Versare lo yogurt in una ciotola.', 'Completare con la granola e il kiwi a fette.']],
  ['yogurt-soia', 'Yogurt di soia con cereali e frutta', 5, [['Yogurt di soia', 150, 'g'], ['Cereali', 30, 'g'], ['Mela', 1, 'pz']], ['Mescolare lo yogurt con i cereali.', 'Aggiungere la mela a dadini.']],
  ['senza-glutine', 'Gallette di riso con marmellata e latte', 5, [['Gallette di riso', 4, 'pz'], ['Marmellata', 20, 'g'], ['Latte', 200, 'ml']], ['Spalmare la marmellata sulle gallette.', 'Servire con il latte.']],
  ['senza-lattosio', 'Pane tostato con marmellata e bevanda di soia', 5, [['Pane bianco', 2, 'fetta'], ['Marmellata', 20, 'g'], ['Latte di soia non dolcificato', 200, 'ml']], ['Tostare il pane e spalmare la marmellata.', 'Accompagnare con la bevanda di soia.']],
  ['frutta-mandorle', 'Macedonia con yogurt e mandorle', 8, [['Mela', 1, 'pz'], ['Banana', 1, 'pz'], ['Yogurt greco bianco', 100, 'g'], ['Mandorle', 10, 'g']], ['Tagliare la frutta a pezzetti.', 'Unire lo yogurt e le mandorle.']],
  ['ricotta-pera', 'Ricotta con pera e noci', 5, [['Ricotta', 100, 'g'], ['Pera', 1, 'pz'], ['Noci', 10, 'g']], ['Servire la ricotta con la pera a fette.', 'Completare con le noci spezzettate.']],
  ['frullato', 'Frullato di banana e latte con fiocchi d\'avena', 5, [['Banana', 1, 'pz'], ['Latte', 200, 'ml'], ['Fiocchi d\'avena', 30, 'g']], ['Frullare tutti gli ingredienti fino a ottenere una crema liscia.']],
  ['pane-burro-marmellata', 'Pane con burro e marmellata', 5, [['Pane bianco', 2, 'fetta'], ['Burro', 10, 'g'], ['Marmellata', 20, 'g']], ['Spalmare il burro e poi la marmellata sul pane.']],
  ['muesli', 'Muesli con yogurt e frutta', 5, [['Muesli', 40, 'g'], ['Yogurt bianco', 125, 'g'], ['Frutti di bosco', 60, 'g']], ['Mescolare il muesli con lo yogurt.', 'Aggiungere i frutti di bosco.']],
  ['soia-frutta', 'Yogurt di soia con frutta e mandorle', 5, [['Yogurt di soia', 150, 'g'], ['Mela', 1, 'pz'], ['Mandorle', 12, 'g']], ['Versare lo yogurt in una ciotola.', 'Aggiungere la mela a dadini e le mandorle.']],
  ['gallette-mandorle', 'Gallette di riso con crema di mandorle e banana', 5, [['Gallette di riso', 4, 'pz'], ['Crema di mandorle', 15, 'g'], ['Banana', 1, 'pz']], ['Spalmare la crema di mandorle sulle gallette.', 'Completare con la banana a rondelle.']],
  ['frullato-soia', 'Frullato di frutta con bevanda di soia', 5, [['Banana', 1, 'pz'], ['Fragole', 100, 'g'], ['Latte di soia non dolcificato', 200, 'ml'], ['Noci', 10, 'g']], ['Frullare la frutta con la bevanda di soia.', 'Servire con le noci tritate.']],
  ['salato', 'Pane, ricotta e pomodorini', 5, [['Pane integrale', 2, 'fetta'], ['Ricotta', 60, 'g'], ['Pomodorini', 60, 'g'], ['Basilico', 3, 'foglie']], ['Spalmare la ricotta sul pane tostato.', 'Completare con i pomodorini e il basilico.']],
];

const SNACKS: Row[] = [
  ['mela', 'Una mela', 1, [['Mela', 1, 'pz']], ['Lavare e mangiare la mela con la buccia.']],
  ['yogurt', 'Yogurt bianco', 1, [['Yogurt bianco', 125, 'g']], ['Servire lo yogurt freddo.']],
  ['yogurt-miele', 'Yogurt bianco con miele', 2, [['Yogurt bianco', 125, 'g'], ['Miele', 1, 'cucchiaino']], ['Aggiungere un filo di miele allo yogurt.']],
  ['mandorle', 'Una manciata di mandorle', 1, [['Mandorle', 15, 'g']], ['Mangiare 10-12 mandorle non salate.']],
  ['noci', 'Qualche noce', 1, [['Noci', 15, 'g']], ['Sgusciare e mangiare 2-3 noci.']],
  ['banana', 'Una banana piccola', 1, [['Banana', 90, 'g']], ['Sbucciare e mangiare.']],
  ['pera', 'Una pera', 1, [['Pera', 1, 'pz']], ['Lavare e mangiare la pera.']],
  ['kiwi', 'Due kiwi', 2, [['Kiwi', 2, 'pz']], ['Sbucciare e tagliare a fette.']],
  ['clementine', 'Due clementine', 2, [['Clementine', 2, 'pz']], ['Sbucciare e dividere gli spicchi.']],
  ['arancia', 'Un\'arancia', 2, [['Arancia', 1, 'pz']], ['Sbucciare e mangiare a spicchi.']],
  ['carote', 'Carote e sedano a bastoncini', 5, [['Carote', 1, 'pz'], ['Sedano', 50, 'g']], ['Tagliare le verdure a bastoncini e servirle fredde.']],
  ['carote-hummus', 'Carote con hummus', 5, [['Carote', 1, 'pz'], ['Hummus', 30, 'g']], ['Tagliare le carote a bastoncini e intingerle nell\'hummus.']],
  ['frutti-bosco', 'Frutti di bosco', 1, [['Frutti di bosco', 100, 'g']], ['Lavare e mangiare.']],
  ['gallette', 'Gallette di riso', 1, [['Gallette di riso', 3, 'pz']], ['Mangiare le gallette da sole o con un velo di marmellata.']],
  ['pane-pomodoro', 'Pane integrale con pomodoro', 3, [['Pane integrale', 1, 'fetta'], ['Pomodoro', 60, 'g'], ['Olio EVO', 3, 'ml']], ['Tostare il pane e strofinarlo con il pomodoro.', 'Completare con un filo d\'olio.']],
  ['grana', 'Scaglie di grana con pane', 2, [['Parmigiano', 15, 'g'], ['Pane integrale', 0.5, 'fetta']], ['Servire le scaglie di formaggio con un pezzo di pane.']],
  ['cioccolato', 'Due quadretti di cioccolato fondente', 1, [['Cioccolato fondente', 15, 'g']], ['Mangiare lentamente, per gustarlo meglio.']],
  ['ananas', 'Ananas a pezzetti', 3, [['Ananas', 120, 'g']], ['Tagliare l\'ananas a pezzetti.']],
  ['ricotta', 'Ricotta con cannella', 2, [['Ricotta', 60, 'g'], ['Cannella', 1, 'pizzico']], ['Servire la ricotta con una spolverata di cannella.']],
  ['cracker', 'Cracker integrali', 1, [['Cracker integrali', 20, 'g']], ['Mangiare i cracker da soli o con una fettina di formaggio.']],
  ['prosciutto', 'Prosciutto cotto e un grissino', 2, [['Prosciutto cotto', 30, 'g'], ['Grissini', 1, 'pz']], ['Arrotolare il prosciutto attorno al grissino.']],
  ['frutta-secca', 'Frutta secca mista', 1, [['Mandorle', 8, 'g'], ['Noci', 6, 'g'], ['Uvetta', 8, 'g']], ['Mescolare e mangiare con calma.']],
  ['smoothie', 'Frullato di frutta', 5, [['Mela', 1, 'pz'], ['Fragole', 80, 'g'], ['Acqua', 100, 'ml']], ['Frullare tutti gli ingredienti e bere subito.']],
];

export const MORNING_RECIPES: Recipe[] = [...build(BREAKFASTS, 'breakfast'), ...build(SNACKS, 'snack')];
export const isMorningCategory = (category: Recipe['category']): boolean => category === 'breakfast' || category === 'snack';
