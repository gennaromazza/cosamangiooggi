import { getSupermarketDepartment } from './departments';
import { inferDishInfo, parseIngredientText } from './dishInference';
import { fitsMember, membersNeedingAlternative, pickAlternatives, planMeals } from './memberAlternatives';
import type { FamilyMember, WeeklyPlan } from '../types';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  checkIngredientMatch,
  convertIngredientUnit,
  calculateMissingFromPantry,
  planConsumption,
  matchesExclusion,
  findPantryDuplicate,
} from './pantrySync';
import { hitsExclusion } from './dietFilters';
import { extractVoiceArgument } from './voiceText';
import { INITIAL_RECIPES } from '../data/recipes';
import type { PantryItem, Recipe } from '../types';
import { dishSuggestionsLeft, limitsFor, normalizePlan, planName, PRICES, yearlySavingPercent, PLAN_LIMITS } from './plans';

const item = (id: string, name: string, quantity: number, unit: string): PantryItem =>
  ({ id, name, quantity, unit, category: 'Altro' } as PantryItem);

test('abbinamento ingredienti: nessun falso positivo da sottostringhe', () => {
  assert.equal(checkIngredientMatch('Mela', 'Melanzane'), false);
  assert.equal(checkIngredientMatch('Pepe', 'Peperoni'), false);
  assert.equal(checkIngredientMatch('Riso', 'Risotto'), false);
  assert.equal(checkIngredientMatch('Pomodori', 'Passata di pomodoro'), true);
  assert.equal(checkIngredientMatch('Uova', 'Uova sode'), true);
});

test('conversione unità: peso, volume e pezzi', () => {
  assert.equal(convertIngredientUnit(1, 'kg', 'g'), 1000);
  assert.equal(convertIngredientUnit(500, 'ml', 'l'), 0.5);
  assert.equal(convertIngredientUnit(2, 'pz', 'kg'), 0.3);
  assert.equal(convertIngredientUnit(2, 'cucchiai', 'g'), 2); // non convertibile: invariato
});

test('mancanti: 1 kg di pomodori in dispensa copre 2 pezzi', () => {
  const missing = calculateMissingFromPantry(
    [{ name: 'Pomodori', amount: 2, unit: 'pz' }],
    [item('1', 'Pomodori', 1, 'kg')]
  );
  assert.deepEqual(missing, []);
});

test('consumo: due ingredienti sullo stesso prodotto non si sovrascrivono', () => {
  const recipe = {
    id: 'r', title: 'Test', servings: 2,
    ingredients: [
      { name: 'Pomodori', amount: 200, unit: 'g' },
      { name: 'Passata di pomodoro', amount: 200, unit: 'g' },
    ],
  } as unknown as Recipe;
  const { results, finalQuantities } = planConsumption([item('a', 'Pomodori', 300, 'g')], recipe, 2);
  assert.equal(finalQuantities.get('a'), 0);
  assert.deepEqual(results.map(r => r.status), ['reduced', 'depleted']);
});

test('allergie: radici e plurali, niente "rana" dentro "grana"', () => {
  assert.equal(matchesExclusion('Gamberi', 'Gambero'), true);
  assert.equal(matchesExclusion('Zucchine', 'Zucchina'), true);
  assert.equal(matchesExclusion('Grana Padano', 'Rana'), false);
  const shrimp = INITIAL_RECIPES.filter(r => hitsExclusion(r, ['Gambero']));
  assert.ok(shrimp.length > 0, 'escludere "Gambero" deve eliminare le ricette con i gamberi');
});

test('dispensa: stesso prodotto e stessa unità vengono riconosciuti', () => {
  const items = [item('1', 'Uova', 6, 'pz')];
  assert.equal(findPantryDuplicate(items, ' uova ', 'pz')?.id, '1');
  assert.equal(findPantryDuplicate(items, 'Uova', 'g'), undefined);
});

test('comandi vocali: gli articoli si tolgono solo come parole intere', () => {
  const add = ['aggiungi', 'alla spesa', 'alla lista della spesa', 'nella spesa', 'compra'];
  assert.equal(extractVoiceArgument('aggiungi la mela alla spesa', add), 'mela');
  assert.equal(extractVoiceArgument('aggiungi latte alla spesa', add), 'latte');
  assert.equal(extractVoiceArgument('aggiungi fusilli alla lista della spesa', add), 'fusilli');
  const exclude = ['escludi', 'allergia a', 'allergico a', 'evita'];
  assert.equal(extractVoiceArgument('escludi arachidi', exclude), 'arachidi');
});

test('piani: limiti e nomi coerenti con l\'offerta', () => {
  assert.equal(limitsFor(undefined).maxMembers, 4);
  assert.equal(limitsFor('free').maxPantryItems, 20);
  assert.equal(limitsFor('smart').maxMembers, Infinity);
  assert.equal(limitsFor('smart').exportList, true);
  assert.equal(limitsFor('smart').flyerScansPerMonth, 0);
  assert.equal(limitsFor('pro').voiceAssistant, true);
  assert.equal(limitsFor('pro').flyerScansPerMonth, 30);
  assert.equal(limitsFor('free').vacationPlanner, false);
  assert.equal(normalizePlan('premium'), 'smart'); // account demo/locali
  assert.equal(normalizePlan('qualcosa'), 'free');
  assert.deepEqual([planName('free'), planName('smart'), planName('pro')], ['Gratis', 'Famiglia', 'Chef IA']);
});

test('piani: ogni piano a pagamento include le funzioni di quello inferiore', () => {
  for (const key of ['exportList', 'vacationPlanner'] as const) {
    assert.ok(PLAN_LIMITS.pro[key] >= PLAN_LIMITS.smart[key] && PLAN_LIMITS.smart[key] >= PLAN_LIMITS.free[key]);
  }
  assert.ok(PRICES.pro.month > PRICES.smart.month);
  assert.ok(yearlySavingPercent('smart') > 0 && yearlySavingPercent('pro') > 0);
});


test('reparti del supermercato: conservati prima dei freschi, parole intere', () => {
  const cases: [string, string][] = [
    ['Passata di pomodoro', 'dispensa'],
    ['Pomodori', 'ortofrutta'],
    ['Latte di cocco', 'dispensa'],
    ['Latte', 'latticini'],
    ['Tonno in scatola', 'dispensa'],
    ['Tonno fresco', 'macelleria'],
    ['Peperoni', 'ortofrutta'],
    ['Pepe', 'dispensa'],
    ['Pane grattugiato', 'dispensa'],
    ['Pane', 'pane'],
    ['Fettine di manzo', 'macelleria'],
    ['Piselli surgelati', 'surgelati'],
    ['Acqua frizzante', 'bevande'],
    ['Melanzane', 'ortofrutta'],
    ['Riso', 'dispensa'],
    ['Detersivo', 'altro'],
  ];
  for (const [name, expected] of cases) {
    assert.equal(getSupermarketDepartment(name), expected, name);
  }
});


// ---- Alternative per persona -------------------------------------------------

const recipe = (id: string, tags: string[], extra: Partial<Recipe> = {}): Recipe =>
  ({
    id,
    title: id,
    ingredients: [{ name: 'Acqua', amount: 1, unit: 'l' }],
    instructions: [],
    tags,
    season: 'all',
    isWHOCompliant: true,
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 20,
    servings: 2,
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true,
    ...extra,
  }) as Recipe;

const person = (id: string, extra: Partial<FamilyMember> = {}): FamilyMember => ({
  id,
  name: id,
  likedIngredients: [],
  dislikedIngredients: [],
  ...extra,
});

test('alternative: serve solo a chi ha regole proprie e il piatto non va bene', () => {
  const carne = recipe('carne', []);
  const lenticchie = recipe('lenticchie', ['vegan']);
  const vegana = person('giulia', { dietaryRestrictions: ['vegan'] });
  const libero = person('marco');
  assert.deepEqual(membersNeedingAlternative([carne], [vegana, libero]).map((m) => m.id), ['giulia']);
  assert.deepEqual(membersNeedingAlternative([lenticchie], [vegana, libero]), []);
  assert.equal(fitsMember(lenticchie, vegana), true);
  assert.equal(fitsMember(carne, vegana), false);
});

test('alternative: allergie personali e contorni ignorati', () => {
  const pasta = recipe('pasta', [], { ingredients: [{ name: 'Gamberi', amount: 100, unit: 'g' }] });
  const contorno = recipe('pane', [], { category: 'side' });
  const allergica = person('anna', { allergies: ['Gamberi'] });
  assert.equal(membersNeedingAlternative([pasta], [allergica]).length, 1);
  assert.equal(membersNeedingAlternative([contorno], [allergica]).length, 0);
});

test('alternative: scelta valida, senza ripetizioni e senza inventare', () => {
  const carne = recipe('carne', []);
  const a = recipe('a', ['vegan']);
  const b = recipe('b', ['vegan']);
  const vegana = person('giulia', { dietaryRestrictions: ['vegan'] });
  const used = new Map<string, Set<string>>();
  const first = pickAlternatives({ mains: [carne], members: [vegana], pool: [carne, a, b], used, random: () => 0 });
  const second = pickAlternatives({ mains: [carne], members: [vegana], pool: [carne, a, b], used, random: () => 0 });
  assert.ok(['a', 'b'].includes(first.giulia));
  assert.notEqual(first.giulia, second.giulia);
  // nessun piatto adatto: nessuna alternativa
  assert.deepEqual(pickAlternatives({ mains: [carne], members: [vegana], pool: [carne] }), {});
});

test('alternative: la spesa conta le porzioni di ognuno', () => {
  const plan: WeeklyPlan = {
    id: 'current',
    startDate: '2026-01-01',
    days: {
      Lunedì: { lunchIds: ['carne'], dinnerIds: ['zuppa'], lunchAlt: { giulia: 'lenticchie' } },
      Martedì: { lunchIds: ['zuppa'], dinnerIds: [] },
    },
  };
  const result = Object.fromEntries(planMeals(plan, 4).map((x) => [x.recipeId, x.people]));
  assert.deepEqual(result, { carne: 3, lenticchie: 1, zuppa: 8 });
});


test('piatto personale: riconosce dieta e tipo dagli ingredienti', () => {
  const carbonara = inferDishInfo(parseIngredientText('200 g spaghetti, 2 uova, guanciale, pecorino'), 'Carbonara');
  assert.equal(carbonara.contains.gluten, true);
  assert.equal(carbonara.contains.dairy, true);
  assert.equal(carbonara.contains.animal, true);
  assert.ok(!carbonara.tags.includes('vegan'));
  assert.ok(!carbonara.tags.includes('gluten-free'));
  assert.equal(carbonara.proteinType, 'red-meat');

  const lenticchie = inferDishInfo(parseIngredientText('lenticchie, carote, sedano, cipolla'), 'Zuppa di lenticchie');
  assert.deepEqual(lenticchie.tags.sort(), ['gluten-free', 'lactose-free', 'vegan']);
  assert.equal(lenticchie.proteinType, 'legumes');
  assert.equal(lenticchie.hasVeg, true);

  const salmone = inferDishInfo([{ name: 'Salmone' }, { name: 'Limone' }]);
  assert.equal(salmone.proteinType, 'fish');
  assert.ok(salmone.tags.includes('gluten-free') && salmone.tags.includes('lactose-free'));
});

test('piatto personale: legge quantità e unità scritte a parole', () => {
  const list = parseIngredientText('200 g di pasta, 2 uova, 1 cucchiaio olio, guanciale e pecorino');
  assert.deepEqual(
    list.map((i) => [i.name, i.amount, i.unit]),
    [['Pasta', 200, 'g'], ['Uova', 2, 'pz'], ['Olio', 1, 'cucchiai'], ['Guanciale', 100, 'g'], ['Pecorino', 100, 'g']],
  );
});

test('riconoscimenti IA dei piatti: 3 di prova, 50 con Chef IA, il contatore riparte ogni mese', () => {
  const month = new Date().toISOString().slice(0, 7);
  assert.equal(dishSuggestionsLeft('free'), 3);
  assert.equal(dishSuggestionsLeft('smart'), 3);
  assert.equal(dishSuggestionsLeft('pro'), 50);
  assert.equal(dishSuggestionsLeft('free', { month, count: 2 }), 1);
  assert.equal(dishSuggestionsLeft('free', { month, count: 9 }), 0);
  assert.equal(dishSuggestionsLeft('pro', { month: '2020-01', count: 50 }), 50);
});
