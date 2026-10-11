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
import { limitsFor, normalizePlan, planName, PRICES, yearlySavingPercent, PLAN_LIMITS } from './plans';

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
