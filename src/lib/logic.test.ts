import { getSupermarketDepartment } from './departments';
import { inferDishInfo, parseIngredientText } from './dishInference';
import { fitsMember, membersNeedingAlternative, pickAlternatives, planMeals } from './memberAlternatives';
import { hasAnyPreference, membersWithoutPreferences, pantryItemFor, PANTRY_STARTERS } from './onboarding';
import { findPlanIssues, issuesKey, rebuildAffectedMeals } from './planCompatibility';
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
import { readFileSync } from 'node:fs';
import { isNewer } from './updateCheck';
import { fillPlaceholders } from '../../scripts/landing';
import { PAGES, pageText, renderPage } from '../../scripts/landing-pages';
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


test('sito ufficiale: prezzi dal codice, nessun segnaposto rimasto e SEO di base', () => {
  const vars = { siteUrl: 'https://esempio.web.app/', appUrl: 'https://app.web.app' };
  for (const file of ['index.html', 'privacy.html', 'robots.txt', 'sitemap.xml']) {
    const filled = fillPlaceholders(readFileSync(`landing/${file}`, 'utf8'), vars);
    assert.ok(!filled.includes('__'), `${file}: segnaposto non sostituito`);
  }
  const home = fillPlaceholders(readFileSync('landing/index.html', 'utf8'), vars);
  for (const price of ['3,99 €', '29,99 €', '6,99 €', '49,99 €']) assert.ok(home.includes(price), price);
  assert.ok(home.includes('<link rel="canonical" href="https://esempio.web.app/">'));
  const title = /<title>([^<]+)<\/title>/.exec(home)?.[1] ?? '';
  const description = /<meta name="description" content="([^"]+)"/.exec(home)?.[1] ?? '';
  assert.ok(title.length > 20 && title.length <= 80, `titolo di ${title.length} caratteri`);
  assert.ok(description.length >= 80 && description.length <= 170, `descrizione di ${description.length} caratteri`);
  assert.equal((home.match(/<h1[ >]/g) || []).length, 1);
});


test('aggiornamenti: si propone solo una build più recente di quella installata', () => {
  assert.equal(isNewer(19, 18), true);
  assert.equal(isNewer(18, 18), false);
  assert.equal(isNewer(17, 18), false);
  assert.equal(isNewer(0, 18), false);
  assert.equal(isNewer(Number.NaN, 18), false);
});


test('pagine guida: contenuti veri, titoli unici e link interni validi', () => {
  const slugs = new Set(PAGES.map((p) => p.slug));
  assert.equal(slugs.size, PAGES.length, 'indirizzi duplicati');
  assert.equal(new Set(PAGES.map((p) => p.title)).size, PAGES.length, 'titoli duplicati');
  assert.equal(new Set(PAGES.map((p) => p.description)).size, PAGES.length, 'descrizioni duplicate');
  for (const page of PAGES) {
    const words = pageText(page).split(' ').length;
    assert.ok(words >= 380, `${page.slug}: solo ${words} parole (contenuto troppo scarno)`);
    assert.ok(page.title.length >= 30 && page.title.length <= 75, `${page.slug}: titolo di ${page.title.length} caratteri`);
    assert.ok(page.description.length >= 100 && page.description.length <= 170, `${page.slug}: descrizione di ${page.description.length} caratteri`);
    assert.ok(page.faq.length >= 3, `${page.slug}: poche domande frequenti`);
    for (const r of page.related) assert.ok(slugs.has(r), `${page.slug}: guida correlata inesistente ${r}`);
    const html = renderPage(page, 'https://esempio.web.app', 'https://app.web.app');
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1, `${page.slug}: serve un solo h1`);
    assert.ok(html.includes(`<link rel="canonical" href="https://esempio.web.app/${page.slug}">`));
    for (const m of html.matchAll(/href="\/([a-z0-9-]+)["#]/g)) {
      if (!['privacy', 'icon-192.png'].includes(m[1])) assert.ok(slugs.has(m[1]), `${page.slug}: link interno rotto /${m[1]}`);
    }
    if (page.shot) assert.ok(readFileSync(`landing/img/${page.shot.file}.webp`).length > 1000, `${page.slug}: screenshot mancante`);
    if (page.health) assert.ok(html.includes('non sostituisce il parere del medico'), `${page.slug}: manca l'avviso di prudenza`);
  }
  const sitemap = fillPlaceholders(readFileSync('landing/sitemap.xml', 'utf8'), { siteUrl: 'https://esempio.web.app', appUrl: 'https://app.web.app' });
  for (const slug of slugs) assert.ok(sitemap.includes(`https://esempio.web.app/${slug}</loc>`), `sitemap senza ${slug}`);
});


// ---- Guida iniziale e modifiche successive ----------------------------------------

const persona = (id: string, extra: Partial<FamilyMember> = {}): FamilyMember =>
  ({ id, name: id, likedIngredients: [], dislikedIngredients: [], likedMeals: [], dislikedMeals: [], ...extra } as FamilyMember);

test('guida iniziale: chi non ha indicato nulla viene segnalato, chi ha indicato qualcosa no', () => {
  const vuota = persona('anna');
  const conGusti = persona('luca', { dislikedIngredients: ['Cipolla'] });
  const conAllergia = persona('sara', { allergies: ['Arachidi'] });
  const conDieta = persona('gino', { dietaryRestrictions: ['vegan'] });
  assert.equal(hasAnyPreference(vuota), false);
  for (const m of [conGusti, conAllergia, conDieta]) assert.equal(hasAnyPreference(m), true);
  assert.deepEqual(membersWithoutPreferences([vuota, conGusti, conAllergia, conDieta]).map((m) => m.id), ['anna']);
});

test('guida iniziale: dispensa di partenza con quantità sensate e nomi noti', () => {
  assert.equal(new Set(PANTRY_STARTERS.map((p) => p.name.toLowerCase())).size, PANTRY_STARTERS.length);
  assert.deepEqual(pantryItemFor('pasta'), { name: 'Pasta', quantity: 500, unit: 'g', category: 'Pasta e Cereali' });
  assert.deepEqual(pantryItemFor('Zenzero'), { name: 'Zenzero', quantity: 1, unit: 'pz', category: 'Altro' });
});

const carne = recipe('carne', []);
const veg1 = recipe('veg1', ['vegan', 'gluten-free']);
const veg2 = recipe('veg2', ['vegan', 'gluten-free']);
const pesce = recipe('pesce', ['gluten-free']);
const tutte = [carne, veg1, veg2, pesce];
const settimana = (lunch: string[], lunchAlt?: Record<string, string>): WeeklyPlan => ({
  id: 'current',
  startDate: '2026-01-01',
  days: { Monday: { lunchIds: lunch, dinnerIds: [], ...(lunchAlt ? { lunchAlt } : {}) } },
});

test('menù già creato: nessun avviso se le regole non sono cambiate', () => {
  const anna = persona('anna', { dietaryRestrictions: ['vegan'] });
  const plan = settimana(['carne'], { anna: 'veg1' });
  assert.deepEqual(findPlanIssues({ plan, recipes: tutte, rules: { dietaryRestrictions: [], excludedIngredients: [] }, members: [anna] }), []);
});

test('menù già creato: una dieta aggiunta dopo senza alternativa viene segnalata', () => {
  const anna = persona('anna', { dietaryRestrictions: ['vegan'] });
  const plan = settimana(['carne']);
  const issues = findPlanIssues({ plan, recipes: tutte, rules: null, members: [anna] });
  assert.equal(issues.length, 1);
  assert.deepEqual([issues[0].kind, issues[0].memberId, issues[0].slot], ['member', 'anna', 'lunch']);
});

test('menù già creato: una regola di tutta la famiglia violata viene segnalata, i gusti no', () => {
  const plan = settimana(['carne']);
  const celiaci = { dietaryRestrictions: ['gluten-free' as const], excludedIngredients: [] };
  const issues = findPlanIssues({ plan, recipes: tutte, rules: celiaci, members: [] });
  assert.deepEqual(issues.map((i) => [i.kind, i.recipeId]), [['family', 'carne']]);
  // piatto non gradito: è una preferenza, il menù resta valido
  const luca = persona('luca', { dislikedMeals: ['carne'] });
  assert.deepEqual(findPlanIssues({ plan, recipes: tutte, rules: null, members: [luca] }), []);
});

test('menù già creato: le alternative di chi non c\'è più si segnalano e si tolgono', () => {
  const plan = settimana(['veg1'], { fantasma: 'veg2' });
  const issues = findPlanIssues({ plan, recipes: tutte, rules: null, members: [persona('anna')] });
  assert.deepEqual(issues.map((i) => i.kind), ['orphan']);
  const fatto = rebuildAffectedMeals({ plan, issues, recipes: tutte, pool: tutte, members: [persona('anna')], random: () => 0 });
  assert.equal(fatto.plan.days.Monday.lunchAlt, undefined);
  assert.deepEqual(findPlanIssues({ plan: fatto.plan, recipes: tutte, rules: null, members: [persona('anna')] }), []);
});

test('ricostruzione: sostituisce solo i piatti non più adatti e rifà le alternative', () => {
  const celiaci = { dietaryRestrictions: ['gluten-free' as const], excludedIngredients: [] };
  const anna = persona('anna', { dietaryRestrictions: ['vegan'] });
  const plan: WeeklyPlan = {
    id: 'current',
    startDate: '2026-01-01',
    days: {
      Monday: { lunchIds: ['carne'], dinnerIds: ['veg1'] },
      Tuesday: { lunchIds: ['pesce'], dinnerIds: [] },
    },
  };
  const issues = findPlanIssues({ plan, recipes: tutte, rules: celiaci, members: [anna] });
  const pool = tutte.filter((r) => (r.tags || []).includes('gluten-free'));
  const out = rebuildAffectedMeals({ plan, issues, recipes: tutte, pool, members: [anna], random: () => 0 });
  // il pranzo del lunedì cambia piatto, il resto della settimana resta com'era
  assert.notEqual(out.plan.days.Monday.lunchIds[0], 'carne');
  assert.deepEqual(out.plan.days.Monday.dinnerIds, ['veg1']);
  // martedì il piatto resta lo stesso ma Anna, che era senza alternativa, ora ne ha una vegana
  assert.deepEqual(out.plan.days.Tuesday.lunchIds, ['pesce']);
  assert.deepEqual(out.plan.days.Tuesday.lunchAlt, { anna: 'veg1' });
  assert.equal(out.replaced, 1);
  // il piano originale non viene modificato e dopo la ricostruzione non restano problemi
  assert.deepEqual(plan.days.Monday.lunchIds, ['carne']);
  assert.deepEqual(findPlanIssues({ plan: out.plan, recipes: tutte, rules: celiaci, members: [anna] }), []);
});

test('ricostruzione: se non c\'è un piatto adatto lo dice invece di inventare', () => {
  const solo = [carne];
  const celiaci = { dietaryRestrictions: ['vegan' as const], excludedIngredients: [] };
  const plan = settimana(['carne']);
  const issues = findPlanIssues({ plan, recipes: solo, rules: celiaci, members: [] });
  const out = rebuildAffectedMeals({ plan, issues, recipes: solo, pool: [], members: [], random: () => 0 });
  assert.equal(out.replaced, 0);
  assert.equal(findPlanIssues({ plan: out.plan, recipes: solo, rules: celiaci, members: [] }).length, 1);
});

test('"Lascia così": l\'impronta cambia solo se cambiano i problemi', () => {
  const anna = persona('anna', { dietaryRestrictions: ['vegan'] });
  const plan = settimana(['carne']);
  const a = issuesKey(findPlanIssues({ plan, recipes: tutte, rules: null, members: [anna] }));
  const b = issuesKey(findPlanIssues({ plan, recipes: tutte, rules: null, members: [anna] }));
  const c = issuesKey(findPlanIssues({ plan, recipes: tutte, rules: { dietaryRestrictions: ['gluten-free'], excludedIngredients: [] }, members: [anna] }));
  assert.equal(a, b);
  assert.notEqual(a, c);
});
