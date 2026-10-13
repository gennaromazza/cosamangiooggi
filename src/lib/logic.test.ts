import { getSupermarketDepartment } from './departments';
import { inferDishInfo, parseIngredientText } from './dishInference';
import { dislikeConsensus, dislikesDish, fitsMember, happyWith, membersNeedingAlternative, pickAlternatives, planMeals } from './memberAlternatives';
import { FAMOUS_DISH_IDS, pickTastingDishes, suggestIngredients, verdictPatch } from './tasting';
import { NEUTRAL_DISH_IDS, planTogetherSlot } from './together';
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
import { createRequire } from 'node:module';
import { inviteLabel } from './inviteStatus';
import { shouldShowIosInstallHint } from './iosInstall';
import { buildDailyReminders, dayMenu, dayNameOf, formatReminderTime, hasMenu, normalizeShareCode, parseReminderTime, reminderText, shareMessage, shareUrl, weekMenu } from './sharedMenu';
import { publicRecipes } from '../../scripts/public-recipes';
import { CHANGELOG, LATEST_NEWS_ID } from '../data/changelog';
import { pendingNews } from './whatsNew';
import { editedDish, parseSteps } from './dishEdit';
import { capPool, clampKcal, dailyKcalTarget, dayKcal, estimateIngredients, fitMeal, kcalOfIds, mealBudgets, MEAL_SHARES, recipeKcal, reservedKcal } from './calories';
import { addToSlot, buildManualPlan, countManualMeals, emptyManualDays, manualDaysFromPlan, removeFromSlot, replaceInSlot, WEEK_DAYS } from './manualPlan';
import { compareBuilds, isNewer } from './updateCheck';
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

test('spesa: le alternative di chi non è più a tavola non contano nelle porzioni', () => {
  const plan = settimana(['carne'], { anna: 'veg1', fantasma: 'veg2' });
  const conTutti = Object.fromEntries(planMeals(plan, 2).map((m) => [m.recipeId, m.people]));
  assert.equal(conTutti.veg2, 1);
  const soloAnna = Object.fromEntries(planMeals(plan, 2, new Set(['anna'])).map((m) => [m.recipeId, m.people]));
  assert.equal(soloAnna.veg2, undefined);
  assert.equal(soloAnna.veg1, 1);
  assert.equal(soloAnna.carne, 1);
});


// ---- Gusti, assaggi e pasti "tutti insieme" ----------------------------------------

const piatto = (id: string, ings: string[], extra: Partial<Recipe> = {}): Recipe =>
  recipe(id, [], { ingredients: ings.map((name) => ({ name, amount: 100, unit: 'g' })), ...extra });

test('gusti: un piatto o ingrediente non gradito si toglie per tutti solo se lo evita metà delle persone', () => {
  const quattro = [
    persona('a', { dislikedMeals: ['x'], dislikedIngredients: ['Melanzane'] }),
    persona('b'),
    persona('c'),
    persona('d'),
  ];
  const uno = dislikeConsensus(quattro);
  assert.equal(uno.excludedMealIds.size, 0, 'uno su quattro: resta nel menù');
  assert.deepEqual(uno.excludedIngredients, []);

  const due = dislikeConsensus([persona('a', { dislikedMeals: ['x'], dislikedIngredients: ['Melanzane'] }), persona('b', { dislikedMeals: ['x'], dislikedIngredients: ['melanzane'] }), persona('c'), persona('d')]);
  assert.deepEqual([...due.excludedMealIds], ['x'], 'metà delle persone: si toglie');
  assert.equal(due.excludedIngredients.length, 1, 'maiuscole e minuscole contano come uno');

  // persona sola o in due: come prima, basta che lo eviti uno
  assert.deepEqual([...dislikeConsensus([persona('a', { dislikedMeals: ['x'] })]).excludedMealIds], ['x']);
  assert.deepEqual([...dislikeConsensus([persona('a', { dislikedMeals: ['x'] }), persona('b')]).excludedMealIds], ['x']);
  assert.equal(dislikeConsensus([]).excludedMealIds.size, 0);
});

test('gusti: chi non gradisce un piatto ha un\'alternativa, ma solo per gli ingredienti principali', () => {
  const melanzane = piatto('parmigiana', ['Melanzane', 'Pomodoro', 'Mozzarella']);
  const soffritto = piatto('pasta', ['Spaghetti', 'Pomodoro', 'Basilico', 'Cipolla']);
  const luca = persona('luca', { dislikedIngredients: ['Melanzane', 'Cipolla'] });
  const anna = persona('anna');
  assert.equal(dislikesDish(melanzane, luca), true);
  assert.equal(dislikesDish(soffritto, luca), false, 'la cipolla è solo il soffritto: nessuna alternativa');
  assert.equal(happyWith(melanzane, anna), true);
  assert.deepEqual(membersNeedingAlternative([melanzane], [luca, anna]).map((m) => m.id), ['luca']);
  assert.deepEqual(membersNeedingAlternative([soffritto], [luca, anna]), []);
  const alt = pickAlternatives({ mains: [melanzane], members: [luca, anna], pool: [melanzane, soffritto, piatto('pesce', ['Branzino'])], random: () => 0 });
  assert.equal(alt.luca, 'pesce', 'tra le alternative si evita ciò che non gradisce, anche il soffritto (la pasta ha la cipolla)');
  const piattoNonGradito = persona('gino', { dislikedMeals: ['pasta'] });
  assert.equal(dislikesDish(soffritto, piattoNonGradito), true);
});

test('assaggi: i piatti proposti esistono, sono unici e ci sono piatti semplici per tutti', () => {
  const ids = new Set(INITIAL_RECIPES.map((r) => r.id));
  assert.equal(new Set(FAMOUS_DISH_IDS).size, FAMOUS_DISH_IDS.length);
  for (const id of FAMOUS_DISH_IDS) assert.ok(ids.has(id), `piatto conosciuto mancante: ${id}`);
  assert.equal(new Set(NEUTRAL_DISH_IDS).size, NEUTRAL_DISH_IDS.length);
  for (const id of NEUTRAL_DISH_IDS) assert.ok(ids.has(id), `piatto semplice mancante: ${id}`);
});

test('assaggi: solo piatti che la persona può mangiare, non già valutati, alternando i tipi', () => {
  const vegana = persona('giulia', { dietaryRestrictions: ['vegan'], likedMeals: ['meal-5'] });
  const proposti = pickTastingDishes({ recipes: INITIAL_RECIPES, member: vegana, count: 8, random: () => 0 });
  assert.ok(proposti.length > 0 && proposti.length <= 8);
  for (const r of proposti) {
    assert.equal(fitsMember(r, vegana), true, `${r.title} non è adatto a una persona vegana`);
    assert.notEqual(r.id, 'meal-5', 'già valutato');
  }
  assert.equal(new Set(proposti.map((r) => r.id)).size, proposti.length);

  const onnivoro = persona('marco');
  const misti = pickTastingDishes({ recipes: INITIAL_RECIPES, member: onnivoro, count: 12, random: () => 0 });
  assert.equal(misti.length, 12);
  assert.ok(new Set(misti.map((r) => r.proteinType)).size >= 4, 'servono tipi diversi di piatto');
  const allergico = persona('sara', { allergies: ['Pesce'] });
  for (const r of pickTastingDishes({ recipes: INITIAL_RECIPES, member: allergico, random: () => 0 })) assert.equal(fitsMember(r, allergico), true);
});

test('assaggi: la risposta è esclusiva (piace o non piace) e "salta" non cambia nulla', () => {
  const m = persona('luca', { likedMeals: ['a'], dislikedMeals: ['b'] });
  assert.deepEqual(verdictPatch(m, 'b', 'like'), { likedMeals: ['a', 'b'], dislikedMeals: [] });
  assert.deepEqual(verdictPatch(m, 'a', 'dislike'), { dislikedMeals: ['b', 'a'], likedMeals: [] });
  assert.deepEqual(verdictPatch(m, 'a', 'like'), { likedMeals: ['a'], dislikedMeals: ['b'] });
  assert.deepEqual(verdictPatch(m, 'z', 'skip'), {});
});

test('assaggi: dopo tre piatti non graditi con lo stesso ingrediente si propone di evitarlo', () => {
  const ricette = [
    piatto('p1', ['Melanzane', 'Pasta']),
    piatto('p2', ['Melanzane', 'Riso']),
    piatto('p3', ['Melanzane', 'Patate']),
    piatto('p4', ['Pollo', 'Patate']),
    piatto('p5', ['Pollo', 'Riso']),
    piatto('p6', ['Pollo', 'Pasta']),
  ];
  const scarta = persona('luca', { dislikedMeals: ['p1', 'p2', 'p3'] });
  const s = suggestIngredients({ member: scarta, recipes: ricette });
  assert.deepEqual(s.map((x) => [x.ingredient, x.kind]), [['Melanzane', 'dislike']]);
  assert.equal(s[0].dishes.length, 3);
  // due soli piatti non bastano
  assert.deepEqual(suggestIngredients({ member: persona('l', { dislikedMeals: ['p1', 'p2'] }), recipes: ricette }), []);
  // se ha scelto un piatto con quell\'ingrediente, niente proposta
  assert.deepEqual(suggestIngredients({ member: persona('l', { dislikedMeals: ['p1', 'p2', 'p3'], likedMeals: ['p1x'] }), recipes: [...ricette, piatto('p1x', ['Melanzane'])] }), []);
  // già indicato: nessuna proposta ripetuta
  assert.deepEqual(suggestIngredients({ member: persona('l', { dislikedMeals: ['p1', 'p2', 'p3'], dislikedIngredients: ['melanzane'] }), recipes: ricette }), []);
  // ingredienti amati
  const ama = persona('anna', { likedMeals: ['p4', 'p5', 'p6'] });
  assert.deepEqual(suggestIngredients({ member: ama, recipes: ricette }).map((x) => [x.ingredient, x.kind]), [['Pollo', 'like']]);
});

test('tutti insieme: se c\'è un piatto che va bene a ognuno si sceglie quello, il più amato', () => {
  const luca = persona('luca', { dislikedIngredients: ['Melanzane'], likedMeals: ['lasagne'] });
  const anna = persona('anna', { dietaryRestrictions: ['vegan'], likedMeals: ['lasagne'] });
  const adatto = recipe('lasagne', ['vegan'], { ingredients: [{ name: 'Pasta', amount: 1, unit: 'g' }] });
  const altro = recipe('zuppa', ['vegan'], { ingredients: [{ name: 'Ceci', amount: 1, unit: 'g' }] });
  const carne = recipe('carne', []);
  const r = planTogetherSlot({ pool: [carne, adatto, altro], members: [luca, anna], random: () => 0 });
  assert.ok(r);
  assert.deepEqual(r!.ids, ['lasagne']);
  assert.deepEqual(r!.alt, {});
  assert.deepEqual(r!.info, { mode: 'all', fits: 2, total: 2 });
});

test('tutti insieme: senza un piatto per tutti sceglie un piatto semplice e prepara l\'alternativa', () => {
  const anna = persona('anna', { dislikedMeals: ['meal-19'] });
  const luca = persona('luca', { dislikedMeals: ['strano'] });
  const sara = persona('sara', { dislikedMeals: ['meal-19'] });
  const gino = persona('gino', { dislikedMeals: ['meal-115'] });
  // nessun piatto piace a tutti e quattro: i piatti semplici sono meal-19 e meal-115
  const sugo = recipe('meal-19', []);
  const pizza = recipe('meal-115', []);
  const strano = recipe('strano', []);
  const r = planTogetherSlot({ pool: [sugo, pizza, strano], members: [anna, luca, sara, gino], random: () => 0 });
  assert.ok(r);
  assert.equal(r!.info.mode, 'neutral');
  assert.equal(r!.ids[0], 'meal-115', 'la pizza dispiace a uno solo, il sugo a due');
  assert.equal(r!.info.fits, 3);
  assert.deepEqual(Object.keys(r!.alt), ['gino'], 'solo chi non lo gradisce ha un\'alternativa');
});

test('tutti insieme: la dieta e le allergie contano più dei gusti', () => {
  const celiaco = persona('c', { dietaryRestrictions: ['gluten-free'] });
  const altri = [persona('a', { likedMeals: ['pizza-x'] }), persona('b', { likedMeals: ['pizza-x'] })];
  const pizza = recipe('pizza-x', []);
  const risotto = recipe('risotto', ['gluten-free']);
  const r = planTogetherSlot({ pool: [pizza, risotto], members: [celiaco, ...altri], random: () => 0 });
  assert.ok(r);
  assert.deepEqual(r!.ids, ['risotto']);
  assert.deepEqual(r!.alt, {});
  assert.equal(r!.info.mode, 'all');
  assert.equal(r!.info.total, 3);
});

test('tutti insieme: niente persone o niente piatti vuol dire nessun risultato; i piatti già nel menù si evitano', () => {
  assert.equal(planTogetherSlot({ pool: [recipe('a', [])], members: [] }), null);
  assert.equal(planTogetherSlot({ pool: [], members: [persona('x')] }), null);
  const a = recipe('a', []);
  const b = recipe('b', []);
  const r = planTogetherSlot({ pool: [a, b], members: [persona('x'), persona('y')], exclude: new Set(['a']), random: () => 0 });
  assert.deepEqual(r!.ids, ['b']);
  assert.equal(planTogetherSlot({ pool: [a], members: [persona('x')], exclude: new Set(['a']) }), null);
});

test('ricostruzione: un pasto cambiato non resta segnato come "tutti insieme"', () => {
  const celiaci = { dietaryRestrictions: ['gluten-free' as const], excludedIngredients: [] };
  const plan: WeeklyPlan = {
    id: 'current',
    startDate: '2026-01-01',
    days: { Monday: { lunchIds: ['carne'], dinnerIds: ['pesce'], lunchTogether: { mode: 'all', fits: 2, total: 2 }, dinnerTogether: { mode: 'all', fits: 2, total: 2 } } },
  };
  const issues = findPlanIssues({ plan, recipes: tutte, rules: celiaci, members: [] });
  const out = rebuildAffectedMeals({ plan, issues, recipes: tutte, pool: tutte.filter((r) => (r.tags || []).includes('gluten-free')), members: [], random: () => 0 });
  assert.equal(out.plan.days.Monday.lunchTogether, undefined);
  assert.deepEqual(out.plan.days.Monday.dinnerTogether, { mode: 'all', fits: 2, total: 2 }, 'il pasto non toccato resta com\'era');
});


// ---- Link ai familiari ---------------------------------------------------------------

const invitesLib = createRequire(import.meta.url)('../../functions/invites.js') as {
  INVITE_DISHES: { id: string; title: string; ingredients: string[] }[];
  mergeAnswers: (a: unknown, b: unknown) => unknown;
};

test('link ai familiari: i piatti proposti sono ricette vere dell\'app, con lo stesso titolo', () => {
  const byId = new Map(INITIAL_RECIPES.map((r) => [r.id, r]));
  for (const dish of invitesLib.INVITE_DISHES) {
    const recipe = byId.get(dish.id);
    assert.ok(recipe, `piatto dell'invito senza ricetta: ${dish.id}`);
    assert.equal(recipe!.title, dish.title, `titolo diverso per ${dish.id}`);
  }
});

test('link ai familiari: la pagina pubblica è riservata, chiede il consenso e parla con le funzioni giuste', () => {
  const page = readFileSync('landing/invito.html', 'utf8');
  assert.ok(page.includes('name="robots" content="noindex, nofollow"'), 'la pagina non deve finire su Google');
  assert.ok(page.includes('location.hash'), 'il codice sta dopo il # (non finisce nei registri dei server)');
  assert.ok(!page.includes('location.search'), 'il codice non va letto dall\'indirizzo normale');
  assert.ok(page.includes('type="checkbox" id="consent"') && page.includes('disabled'), 'serve il consenso prima di inviare');
  assert.ok(page.includes('allergie e intolleranze'), 'il consenso nomina le allergie');
  assert.ok(page.includes('europe-west1-gen-lang-client-0532460534.cloudfunctions.net'));
  const functions = readFileSync('functions/index.js', 'utf8');
  for (const name of ['getMemberInvite', 'submitMemberInvite']) {
    assert.ok(page.includes(`'${name}'`), `la pagina non chiama ${name}`);
    assert.ok(functions.includes(`exports.${name} = onRequest`), `funzione mancante: ${name}`);
  }
  // stesse allergie dell'app
  const appAllergens = /const ALLERGEN_OPTIONS = \[([^\]]+)\]/.exec(readFileSync('src/components/FamilySettings.tsx', 'utf8'))![1];
  const pageAllergens = /var ALLERGENS = \[([^\]]+)\]/.exec(page)![1];
  assert.equal(pageAllergens.replace(/\s/g, ''), appAllergens.replace(/\s/g, ''), 'le allergie della pagina devono essere quelle dell\'app');
  // il token non si mette mai nel nome di un file né si stampa
  assert.ok(!/console\.log\(.*token/.test(page));
});

test('link ai familiari: non indicizzato, nessun accesso diretto al database, funzioni protette', () => {
  assert.ok(readFileSync('landing/robots.txt', 'utf8').includes('Disallow: /invito'));
  assert.ok(!readFileSync('landing/sitemap.xml', 'utf8').includes('invito'));
  const hosting = JSON.parse(readFileSync('firebase.landing.json', 'utf8')).hosting.headers as { source: string; headers: { key: string; value: string }[] }[];
  const invito = hosting.find((h) => h.source === '/invito');
  assert.ok(invito, 'intestazioni mancanti per /invito');
  assert.ok(invito!.headers.some((h) => h.key === 'Cache-Control' && h.value === 'no-store'));
  assert.ok(invito!.headers.some((h) => h.key === 'Referrer-Policy' && h.value === 'no-referrer'));
  const rules = readFileSync('firestore.rules', 'utf8');
  assert.ok(rules.includes('match /{document=**} {\n      allow read, write: if false;'), 'serve il blocco di default');
  assert.ok(!rules.includes('/invites'), 'gli inviti si toccano solo dal server');
  const functions = readFileSync('functions/index.js', 'utf8');
  assert.ok(functions.includes("exports.createMemberInvite = onCall") && functions.includes("exports.revokeMemberInvite = onCall"));
  assert.ok(/createMemberInvite[\s\S]{0,200}requireAuth/.test(functions), 'creare un invito richiede l\'accesso');
  assert.ok(functions.includes("db.collection('invites').where('uid', '==', targetUid)"), 'eliminando un account spariscono anche gli inviti');
  assert.ok(readFileSync('landing/privacy.html', 'utf8').includes('Inviti ai familiari'), 'l\'informativa spiega gli inviti');
});

test('link ai familiari: la scheda mostra lo stato dell\'invito', () => {
  const now = new Date('2026-10-12T10:00:00Z').getTime();
  const base = persona('luca');
  assert.equal(inviteLabel(base, now), null);
  assert.match(inviteLabel({ ...base, inviteStatus: 'sent', inviteExpiresAt: now + 86_400_000 }, now)!, /^Link inviato, valido fino al /);
  assert.equal(inviteLabel({ ...base, inviteStatus: 'sent', inviteExpiresAt: now - 1 }, now), 'Il link è scaduto');
  assert.match(inviteLabel({ ...base, inviteStatus: 'answered', inviteAnsweredAt: now }, now)!, /^Ha risposto il /);
  assert.equal(inviteLabel({ ...base, inviteStatus: 'revoked' }, now), 'Link annullato');
});

test('link ai familiari: le risposte unite alla scheda restano coerenti con le preferenze dell\'app', () => {
  // la scheda dopo l'unione deve essere usabile dalle altre funzioni: liste, nessun doppione, nessun conflitto
  const merged = invitesLib.mergeAnswers(
    { likedMeals: ['meal-101'], dislikedMeals: [], allergies: [] },
    { allergies: ['Arachidi'], dietaryRestrictions: ['vegan'], likedIngredients: [], dislikedIngredients: ['Melanzane'], likedMeals: [], dislikedMeals: ['meal-101'] },
  ) as FamilyMember;
  const member = persona('luca', merged);
  assert.equal(member.likedMeals!.includes('meal-101'), false);
  assert.deepEqual(member.dislikedMeals, ['meal-101']);
  assert.equal(fitsMember(INITIAL_RECIPES.find((r) => r.id === 'meal-4')!, member), false, 'allergia e dieta vegana arrivate dal link vengono rispettate');
});

test('pagamenti: il client Stripe si crea solo dopo aver controllato che la chiave sia quella segreta', () => {
  const functions = readFileSync('functions/index.js', 'utf8');
  assert.equal((functions.match(/new Stripe\(/g) || []).length, 1, 'ogni uso di Stripe passa da getStripe()');
  assert.ok(functions.includes('isStripeSecretKey(key)'));
  assert.ok(functions.includes("throw stripeFailure(err, 'apertura del pagamento')"), 'gli errori del pagamento sono leggibili');
  const workflow = readFileSync('.github/workflows/deploy-firebase.yml', 'utf8');
  assert.ok(workflow.includes('sk_live_*|sk_test_*|rk_live_*|rk_test_*'), 'il deploy rifiuta chiavi che non sono segrete');
  assert.ok(workflow.includes('whsec_*'));
});

test('iPhone: l\'istruzione per aggiungere l\'app alla Home compare solo in Safari, non già installata', () => {
  const safari = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
  const chrome = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0 Mobile/15E148 Safari/604.1';
  const android = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36';
  const ipadMac = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15';
  assert.equal(shouldShowIosInstallHint({ userAgent: safari }), true);
  assert.equal(shouldShowIosInstallHint({ userAgent: safari, standalone: true }), false, 'già installata');
  assert.equal(shouldShowIosInstallHint({ userAgent: safari, native: true }), false);
  assert.equal(shouldShowIosInstallHint({ userAgent: chrome }), false, 'da Chrome su iPhone non si può installare');
  assert.equal(shouldShowIosInstallHint({ userAgent: android }), false);
  assert.equal(shouldShowIosInstallHint({ userAgent: ipadMac, maxTouchPoints: 5 }), true, 'iPad');
  assert.equal(shouldShowIosInstallHint({ userAgent: ipadMac, maxTouchPoints: 0 }), false, 'Mac vero');
});

test('sito: la pagina spiega l\'installazione su iPhone e le domande frequenti non dicono più il contrario', () => {
  const page = readFileSync('landing/index.html', 'utf8');
  assert.ok(page.includes('id="iphone"') && page.includes('Aggiungi alla schermata Home'));
  assert.ok(!page.includes("L'app da installare è per Android. Da iPhone"), 'testo vecchio rimasto');
  assert.ok(page.includes('href="#iphone"'));
});

// ---- Menù scritto a mano ------------------------------------------------------------

test('menù scritto a mano: si compone giorno per giorno e si corregge', () => {
  let days = emptyManualDays();
  assert.deepEqual(Object.keys(days), WEEK_DAYS);
  assert.equal(countManualMeals(days), 0);
  days = addToSlot(days, 'Lunedì', 'lunch', 'a');
  days = addToSlot(days, 'Lunedì', 'lunch', 'b');
  days = addToSlot(days, 'Lunedì', 'dinner', 'c');
  assert.deepEqual(days['Lunedì'], { lunchIds: ['a', 'b'], dinnerIds: ['c'] });
  assert.equal(countManualMeals(days), 2, 'conta i pasti, non i piatti');
  days = removeFromSlot(days, 'Lunedì', 'lunch', 0);
  assert.deepEqual(days['Lunedì'].lunchIds, ['b']);
  assert.deepEqual(emptyManualDays()['Lunedì'], { lunchIds: [], dinnerIds: [] }, 'la settimana vuota non viene modificata');
});

test('menù scritto a mano: diventa un normale menù, con i piatti scelti e senza cambiarli', () => {
  const luca = persona('luca', { dislikedMeals: ['meal-x'] });
  const p1 = recipe('p1', []);
  const p2 = recipe('p2', ['gluten-free']);
  const p3 = recipe('p3', ['gluten-free']);
  let days = emptyManualDays();
  days = addToSlot(days, 'Martedì', 'lunch', 'p1');
  days = addToSlot(days, 'Martedì', 'dinner', 'p2');
  const plan = buildManualPlan({ days, recipes: [p1, p2, p3], members: [luca], pool: [p1, p2, p3], now: new Date('2026-01-05T10:00:00Z'), random: () => 0 });
  assert.equal(plan.manual, true);
  assert.equal(plan.id, 'current');
  assert.deepEqual(plan.days['Martedì'].lunchIds, ['p1']);
  assert.deepEqual(plan.days['Martedì'].dinnerIds, ['p2']);
  assert.deepEqual(plan.days['Lunedì'], { lunchIds: [], dinnerIds: [] });
  assert.equal(plan.days['Martedì'].lunchAlt, undefined, 'un gusto non crea alternative: i piatti li ha scelti l\'utente');
  // la spesa funziona come per ogni menù
  assert.deepEqual(planMeals(plan, 2).map((m) => m.recipeId).sort(), ['p1', 'p2']);
});

test('menù scritto a mano: chi ha una dieta o allergia che il piatto non rispetta ha la sua alternativa', () => {
  const celiaca = persona('sara', { dietaryRestrictions: ['gluten-free'] });
  const pasta = recipe('pasta', []);
  const riso = recipe('riso', ['gluten-free']);
  const plan = buildManualPlan({ days: addToSlot(emptyManualDays(), 'Lunedì', 'lunch', 'pasta'), recipes: [pasta, riso], members: [celiaca], pool: [pasta, riso], random: () => 0 });
  assert.deepEqual(plan.days['Lunedì'].lunchIds, ['pasta'], 'il piatto scelto resta');
  assert.deepEqual(plan.days['Lunedì'].lunchAlt, { sara: 'riso' });
  // e il controllo di compatibilità non trova problemi
  assert.deepEqual(findPlanIssues({ plan, recipes: [pasta, riso], rules: null, members: [celiaca] }), []);
});

test('menù scritto a mano: si riparte dal menù attuale per modificarlo', () => {
  const plan: WeeklyPlan = { id: 'current', startDate: '2026-01-01', manual: true, days: { Lunedì: { lunchIds: ['a'], dinnerIds: ['b'] } } };
  const days = manualDaysFromPlan(plan);
  assert.deepEqual(days['Lunedì'], { lunchIds: ['a'], dinnerIds: ['b'] });
  assert.deepEqual(days['Domenica'], { lunchIds: [], dinnerIds: [] });
  days['Lunedì'].lunchIds.push('z');
  assert.deepEqual(plan.days['Lunedì'].lunchIds, ['a'], 'il menù originale non cambia finché non si salva');
  assert.deepEqual(manualDaysFromPlan(null), emptyManualDays());
});

// ---- Menù condiviso e promemoria ----------------------------------------------------

const settimanaCondivisa: WeeklyPlan = {
  id: 'current',
  startDate: '2026-10-12T08:00:00Z',
  days: {
    Lunedì: { lunchIds: ['p1'], dinnerIds: ['p2', 'p3'] },
    Martedì: { lunchIds: [], dinnerIds: ['p2'] },
    Mercoledì: { lunchIds: ['sparito'], dinnerIds: [] },
  },
};
const ricetteCondivise = [piatto('p1', ['Pasta']), piatto('p2', ['Pollo']), piatto('p3', ['Insalata'])].map((r, i) => ({ ...r, title: ['Pasta al sugo', 'Pollo al limone', 'Insalata'][i] }));

test('menù condiviso: vista del giorno e della settimana, con pranzo e cena', () => {
  const lunedi = dayMenu(settimanaCondivisa, ricetteCondivise, 'Lunedì');
  assert.deepEqual(lunedi.lunch.map((r) => r.title), ['Pasta al sugo']);
  assert.deepEqual(lunedi.dinner.map((r) => r.title), ['Pollo al limone', 'Insalata']);
  const settimana = weekMenu(settimanaCondivisa, ricetteCondivise);
  assert.deepEqual(settimana.map((d) => d.day), WEEK_DAYS);
  assert.equal(settimana[6].lunch.length + settimana[6].dinner.length, 0, 'giorno senza piatti');
  assert.deepEqual(dayMenu(settimanaCondivisa, ricetteCondivise, 'Mercoledì').lunch, [], 'un piatto non più disponibile si salta');
});

test('menù condiviso: assenza di menù e giorni della settimana', () => {
  assert.equal(hasMenu(null), false);
  assert.equal(hasMenu(undefined), false);
  assert.equal(hasMenu({ id: 'c', startDate: 'x', days: {} }), false);
  assert.equal(hasMenu({ id: 'c', startDate: 'x', days: { Lunedì: { lunchIds: [], dinnerIds: [] } } }), false);
  assert.equal(hasMenu(settimanaCondivisa), true);
  assert.deepEqual(weekMenu(null, []).map((d) => d.lunch.length + d.dinner.length), [0, 0, 0, 0, 0, 0, 0]);
  assert.equal(dayNameOf(new Date(2026, 9, 12)), 'Lunedì');
  assert.equal(dayNameOf(new Date(2026, 9, 18)), 'Domenica');
  assert.equal(dayNameOf(new Date(2026, 9, 14)), 'Mercoledì');
});

test('promemoria giornaliero: un avviso per ogni giorno con il suo menù, all\'orario scelto', () => {
  assert.equal(reminderText(dayMenu(settimanaCondivisa, ricetteCondivise, 'Lunedì')), 'Pranzo: Pasta al sugo · Cena: Pollo al limone + Insalata');
  assert.equal(reminderText(dayMenu(settimanaCondivisa, ricetteCondivise, 'Martedì')), 'Cena: Pollo al limone');
  assert.equal(reminderText(dayMenu(settimanaCondivisa, ricetteCondivise, 'Domenica')), '');
  const now = new Date(2026, 9, 12, 9, 0); // lunedì 12 ottobre, ore 9
  const list = buildDailyReminders({ plan: settimanaCondivisa, recipes: ricetteCondivise, hour: 18, minute: 30, now });
  assert.deepEqual(list.map((r) => dayNameOf(r.at)), ['Lunedì', 'Martedì'], 'solo i giorni con un menù');
  assert.equal(list[0].at.getHours(), 18);
  assert.equal(list[0].at.getMinutes(), 30);
  assert.match(list[0].body, /^Pranzo: Pasta al sugo/);
  assert.equal(new Set(list.map((r) => r.id)).size, list.length, 'ogni avviso ha un suo codice');
  assert.ok(list.every((r) => r.id > 2000 && r.id <= 2007), 'codici riservati ai promemoria del menù');
});

test('promemoria giornaliero: oggi si salta se l\'orario è già passato; senza menù nessun avviso', () => {
  const sera = new Date(2026, 9, 12, 19, 0);
  const list = buildDailyReminders({ plan: settimanaCondivisa, recipes: ricetteCondivise, hour: 18, minute: 0, now: sera });
  assert.deepEqual(list.map((r) => dayNameOf(r.at)), ['Martedì']);
  assert.deepEqual(buildDailyReminders({ plan: null, recipes: [], hour: 18, minute: 0, now: sera }), []);
  assert.deepEqual(buildDailyReminders({ plan: { id: 'c', startDate: 'x', days: {} }, recipes: [], hour: 8, minute: 0 }), []);
});

test('promemoria: orario scelto valido o predefinito', () => {
  assert.deepEqual(parseReminderTime('07:05'), { hour: 7, minute: 5 });
  assert.deepEqual(parseReminderTime('23:59'), { hour: 23, minute: 59 });
  for (const bad of ['', '24:00', '12:60', 'ab:cd', '7', null, undefined]) assert.deepEqual(parseReminderTime(bad as string), { hour: 18, minute: 0 });
  assert.equal(formatReminderTime({ hour: 7, minute: 5 }), '07:05');
});

test('condivisione: link e messaggio contengono il codice dopo il # e il codice per l\'app', () => {
  assert.equal(shareUrl('https://che-cucino-oggi.web.app/', 'ABCD-EFGH-JKMN'), 'https://che-cucino-oggi.web.app/menu#ABCD-EFGH-JKMN');
  const message = shareMessage('https://che-cucino-oggi.web.app', 'ABCD-EFGH-JKMN');
  assert.ok(message.includes('https://che-cucino-oggi.web.app/menu#ABCD-EFGH-JKMN'));
  assert.ok(message.includes('il codice è ABCD-EFGH-JKMN'));
  const link = new URL(shareUrl('https://che-cucino-oggi.web.app', 'ABCD-EFGH-JKMN'));
  assert.equal(link.search, '');
  assert.equal(link.hash, '#ABCD-EFGH-JKMN', 'il codice non va mai nella parte del link che arriva ai server');
});

test('condivisione: il codice scritto a mano ha le stesse regole nell\'app e sul server', () => {
  const server = createRequire(import.meta.url)('../../functions/familyShare.js');
  const inputs = [
    'ABCD-EFGH-JKMN', 'abcd-efgh-jkmn', 'abcd efgh jkmn', 'ABCDEFGHJKMN', '  ABCD-EFGH-JKMN  ',
    'https://che-cucino-oggi.web.app/menu#ABCD-EFGH-JKMN', 'ABCD-EFGH-JKM', 'ABCD-EFGH-JKMNP', 'ABCD-EFGH-JKM0', 'ABCD-EFGH-JKMO',
    'ABCD-EFGH-JKM1', 'ABCD-EFGH-JKML', 'ABCD-EFGH-JKM!', '', 'non-un-codice',
  ];
  for (const input of inputs) assert.equal(normalizeShareCode(input), server.normalizeCode(input), `diverso per «${input}»`);
  assert.equal(normalizeShareCode('abcd efgh jkmn'), 'ABCD-EFGH-JKMN');
  assert.equal(normalizeShareCode('ABCD-EFGH-JKM0'), null, 'lo zero si confonde con la O: non ammesso');
  const code = server.newShareCode();
  assert.equal(normalizeShareCode(code), code);
});

test('pagina pubblica del menù: ricette ridotte all\'essenziale e tutti i piatti del menù si trovano', () => {
  const list = publicRecipes(INITIAL_RECIPES);
  assert.equal(Object.keys(list).length, INITIAL_RECIPES.length);
  const first = list[INITIAL_RECIPES[0].id];
  assert.deepEqual(Object.keys(first).sort(), ['ingredients', 'instructions', 'servings', 'timeMin', 'title']);
  assert.ok(first.title && first.ingredients.length > 0 && first.instructions.length > 0);
  // i piatti che l'app propone nel menù (anche per i familiari) devono esistere nell'elenco della pagina
  const cacheFile = JSON.stringify(list);
  for (const id of ['meal-spaghetti-gamberi', ...NEUTRAL_DISH_IDS]) assert.ok(cacheFile.includes(JSON.stringify(id)) || id in list, `manca ${id}`);
  assert.ok(!cacheFile.includes('proteinType') && !cacheFile.includes('nutrients'), 'niente dati non necessari');
});

test('pagina pubblica del menù: riservata, senza account, con tutti gli stati e senza HTML dai dati', () => {
  const page = readFileSync('landing/menu.html', 'utf8');
  assert.ok(page.includes('name="robots" content="noindex, nofollow"') && page.includes('name="referrer" content="no-referrer"'));
  assert.ok(page.includes('location.hash') && !page.includes('location.search'), 'il codice sta dopo il # e non va ai server');
  assert.ok(page.includes("'getSharedMenu'") && page.includes('europe-west1-gen-lang-client-0532460534.cloudfunctions.net'));
  assert.ok(page.includes("fetch('/recipes.json')"), 'le ricette dell\'app vengono dal sito');
  // stati: caricamento, link incompleto, errore di rete con riprova, nessun menù, link annullato/scaduto (il messaggio arriva dal server)
  for (const needle of ['id="loading"', 'Questo link non è completo', 'Non riesco a collegarmi', 'id="retry-btn"', "Il menù non c'è ancora", 'j.error']) {
    assert.ok(page.includes(needle), `manca: ${needle}`);
  }
  // il testo che arriva dal server si inserisce solo come testo, mai come HTML
  assert.ok(!/innerHTML\s*=\s*[^'";\s]/.test(page.replace(/innerHTML\s*=\s*''/g, '')), 'niente innerHTML con dati');
  assert.ok(!/outerHTML|insertAdjacentHTML|document\.write/.test(page));
  assert.ok(page.includes('visibilitychange'), 'il menù si rilegge quando si riapre la pagina');
  assert.ok(!/console\.log\(.*code/.test(page));
  const robots = readFileSync('landing/robots.txt', 'utf8');
  assert.ok(robots.includes('Disallow: /menu') && !readFileSync('landing/sitemap.xml', 'utf8').includes('/menu'));
  const hosting = JSON.parse(readFileSync('firebase.landing.json', 'utf8')).hosting.headers as { source: string; headers: { key: string; value: string }[] }[];
  const menu = hosting.find((h) => h.source === '/menu');
  assert.ok(menu?.headers.some((h) => h.key === 'Cache-Control' && h.value === 'no-store'));
  assert.ok(menu?.headers.some((h) => h.key === 'Referrer-Policy' && h.value === 'no-referrer'));
  assert.ok(menu?.headers.some((h) => h.key === 'X-Robots-Tag'));
  assert.ok(readFileSync('scripts/build-landing.ts', 'utf8').includes("'recipes.json'"), 'il sito deve pubblicare recipes.json');
  assert.ok(readFileSync('landing/privacy.html', 'utf8').includes('Menù condiviso'), 'l\'informativa spiega la condivisione');
});

test('menù condiviso: sicurezza lato server — regole, funzioni e collegamento protetti', () => {
  const rules = readFileSync('firestore.rules', 'utf8');
  assert.ok(/protectedFields\(\)[\s\S]{0,900}'familyId'/.test(rules), 'familyId lo scrive solo il server');
  assert.ok(rules.includes('match /viewers/{viewerUid}') && /match \/viewers[\s\S]{0,260}allow write: if false/.test(rules));
  assert.ok(/match \/familyShare[\s\S]{0,200}allow write: if false/.test(rules));
  assert.ok(!rules.includes('/shares') && !rules.includes('/invites'), 'link e inviti si toccano solo dal server');
  // chi è collegato legge soltanto menù e ricette: nessuna altra sottocartella ha la regola dei collegati
  assert.equal((rules.match(/isViewerOf\(userId\)/g) || []).length, 2);
  const functions = readFileSync('functions/index.js', 'utf8');
  for (const name of ['createFamilyShare', 'revokeFamilyShare', 'joinFamily', 'leaveFamily', 'removeFamilyViewer']) {
    assert.ok(new RegExp(`exports\\.${name} = onCall[\\s\\S]{0,160}requireAuth`).test(functions), `${name} richiede l'accesso`);
  }
  assert.ok(functions.includes('exports.getSharedMenu = onRequest') && functions.includes("res.set('Cache-Control', 'no-store')"));
  assert.ok(functions.includes("db.collection('shares').where('uid', '==', targetUid)"), 'eliminando un account spariscono anche i link');
  assert.ok(!functions.includes('console.log(code') && !/console\.(log|error)\([^)]*\bcode\b/.test(functions.slice(functions.indexOf('createFamilyShare'), functions.indexOf('Amministratori'))), 'il codice non va nei registri');
});

test('menù condiviso nell\'app: voce "Menù di casa" per chi è collegato, promemoria per telefono, entrata dall\'invito', () => {
  const app = readFileSync('src/App.tsx', 'utf8');
  assert.ok(app.includes("profile?.familyId ? [{ id: 'shared'") && app.includes('<SharedMenu familyId={profile.familyId} />'));
  assert.ok(app.includes('<MenuReminderSync userId={user.uid} familyId={profile?.familyId} />'));
  const shared = readFileSync('src/components/SharedMenu.tsx', 'utf8');
  for (const needle of ['Carico il menù', "Il menù non c'è ancora", 'Non vedi più questo menù', 'Non riesco a caricare il menù', 'Riprova', 'MenuNotificationsCard']) {
    assert.ok(shared.includes(needle), `SharedMenu: manca ${needle}`);
  }
  assert.ok(!/setDoc|updateDoc|addDoc|deleteDoc/.test(shared), 'chi consulta il menù non scrive nulla');
  const share = readFileSync('src/components/FamilyShare.tsx', 'utf8');
  for (const needle of ['createFamilyShare', 'revokeFamilyShare', 'removeFamilyViewer', 'WhatsApp', 'Il link è scaduto', 'Annulla il link']) {
    assert.ok(share.includes(needle), `FamilyShare: manca ${needle}`);
  }
  assert.ok(readFileSync('src/components/MealPlanner.tsx', 'utf8').includes('Condividi menu'));
  assert.ok(readFileSync('src/components/FamilySettings.tsx', 'utf8').includes('<FamilyShare userId={userId} />'));
  assert.ok(readFileSync('src/components/AccountSettings.tsx', 'utf8').includes('<MenuNotificationsCard />'));
  assert.ok(readFileSync('src/components/WelcomeTour.tsx', 'utf8').includes('Ho ricevuto un invito da un familiare'));
  // le scelte sulle notifiche stanno sul telefono: nessuna scrittura sul database
  const reminders = readFileSync('src/lib/reminders.ts', 'utf8');
  assert.ok(reminders.includes("'daily_menu_reminder'") && !/firebase\/firestore/.test(reminders));
});

test('novità: ogni voce ha un identificativo unico, un titolo e testi leggibili', () => {
  assert.ok(CHANGELOG.length >= 2);
  assert.equal(new Set(CHANGELOG.map((e) => e.id)).size, CHANGELOG.length, 'identificativi doppi');
  assert.equal(LATEST_NEWS_ID, CHANGELOG[0].id, 'la voce più recente sta in cima');
  for (const entry of CHANGELOG) {
    assert.ok(entry.title.length > 5 && entry.date.length > 5 && entry.items.length > 0, entry.id);
    for (const item of entry.items) assert.ok(item.emoji && item.title.length > 3 && item.text.length > 20, `${entry.id}: ${item.title}`);
  }
});

test('novità: si mostra una volta sola dopo l\'aggiornamento, e non a chi è nuovo', () => {
  const [nuova, media, vecchia] = CHANGELOG;
  assert.deepEqual(pendingNews(CHANGELOG, nuova.id, true), [], 'già vista: niente');
  assert.deepEqual(pendingNews(CHANGELOG, media.id, true).map((e) => e.id), [nuova.id], 'solo ciò che è uscito dopo');
  assert.deepEqual(pendingNews(CHANGELOG, vecchia.id, true).map((e) => e.id), [nuova.id, media.id]);
  assert.deepEqual(pendingNews(CHANGELOG, null, false), [], 'chi installa adesso ha già la guida iniziale');
  assert.deepEqual(pendingNews(CHANGELOG, null, true).map((e) => e.id), CHANGELOG.slice(0, 3).map((e) => e.id), 'chi usa già l\'app vede le ultime');
  assert.deepEqual(pendingNews(CHANGELOG, 'versione-sconosciuta', true).map((e) => e.id), CHANGELOG.slice(0, 3).map((e) => e.id));
  assert.equal(pendingNews(CHANGELOG, null, true, 1).length, 1, 'si può limitare quante mostrarne');
  assert.deepEqual(pendingNews([], null, true), []);
});

test('novità: la schermata è nell\'app e si rivede dall\'account', () => {
  assert.ok(readFileSync('src/App.tsx', 'utf8').includes('<WhatsNew userId={user.uid} profile={profile} />'));
  const account = readFileSync('src/components/AccountSettings.tsx', 'utf8');
  assert.ok(account.includes('Novità dell’app') && account.includes('OPEN_WHATS_NEW_EVENT'));
  const screen = readFileSync('src/components/WhatsNew.tsx', 'utf8');
  assert.ok(screen.includes('Ho capito') && screen.includes('writeSeen(LATEST_NEWS_ID)'));
});

test('famiglia: ogni persona ha una scheda a tutto schermo, non più una riga da espandere', () => {
  const page = readFileSync('src/components/FamilySettings.tsx', 'utf8');
  assert.ok(!page.includes('aria-expanded') && !page.includes('ChevronDown'), 'niente più fisarmonica');
  assert.ok(page.includes('Apri la scheda di') && page.includes('Gusti <ChevronRight'), 'la riga dice che si apre');
  for (const needle of ['Torna alla famiglia', 'Cambia il nome di', 'Rimuovere ${person.name} dalla famiglia?', 'role="dialog"']) {
    assert.ok(page.includes(needle), `scheda: manca ${needle}`);
  }
  assert.ok(page.includes("e.key === 'Escape' && closeMember()") && page.includes("document.body.style.overflow = 'hidden'"));
  // la guida iniziale continua a usare la stessa scheda, senza fisarmonica
  assert.ok(page.includes('onlyMemberId') && readFileSync('src/components/WelcomeTour.tsx', 'utf8').includes('onlyMemberId'));
});

test('modifica piatto: i passaggi si scrivono uno per riga, senza numeri né righe vuote', () => {
  assert.deepEqual(parseSteps('1. Bollire l\'acqua\n\n2) Cuocere la pasta\n- Servire  \n'), ['Bollire l\'acqua', 'Cuocere la pasta', 'Servire']);
  assert.deepEqual(parseSteps(''), []);
});

test('modifica piatto: si parte dal piatto di prima e si ricalcola ciò che dipende dagli ingredienti', () => {
  const base = INITIAL_RECIPES.find((r) => r.id === 'meal-spaghetti-gamberi')!;
  const edited = editedDish(
    base,
    {
      title: '  Spaghetti ai gamberi di nonna ',
      ingredients: [{ name: ' Spaghetti ', amount: 200, unit: 'g' }, { name: '', amount: 1, unit: 'g' }, { name: 'Gamberi', amount: 250, unit: 'g' }],
      category: 'dinner',
      difficulty: 'medium',
      timeMin: 35,
      steps: ['Cuocere.'],
    },
    inferDishInfo([{ name: 'Spaghetti' }, { name: 'Gamberi' }], 'Spaghetti ai gamberi di nonna'),
  );
  assert.equal(edited.title, 'Spaghetti ai gamberi di nonna');
  assert.deepEqual(edited.ingredients.map((i) => i.name), ['Spaghetti', 'Gamberi'], 'niente ingredienti vuoti, nomi puliti');
  assert.equal(edited.ingredients[0].amount, 200);
  assert.deepEqual(edited.instructions, ['Cuocere.']);
  assert.equal(edited.category, 'dinner');
  assert.equal(edited.timeMin, 35);
  assert.equal(edited.season, base.season, 'il resto del piatto resta com\'era');
  assert.equal(edited.servings, base.servings || 2);
  assert.ok(!('id' in edited) && !('nutrients' in edited), 'niente id (ne serve uno nuovo) né valori nutrizionali vecchi');
  assert.equal(edited.proteinType, 'fish');
  assert.ok(!edited.tags.includes('gluten-free'), 'gli spaghetti hanno glutine');
  // il piatto originale non cambia
  assert.equal(base.title, 'Spaghetti ai gamberi');
  assert.ok(base.ingredients.some((i) => i.amount === 160));
  // correggendo un ingrediente cambia l'adattabilità alle diete
  const vegan = editedDish(base, { title: 'Spaghetti al pomodoro', ingredients: [{ name: 'Spaghetti di riso', amount: 160, unit: 'g' }, { name: 'Pomodoro', amount: 200, unit: 'g' }], category: 'lunch', difficulty: 'easy', timeMin: 15, steps: [] }, inferDishInfo([{ name: 'Spaghetti di riso' }, { name: 'Pomodoro' }], 'Spaghetti al pomodoro'));
  assert.ok(vegan.tags.includes('vegan'));
});

test('modifica piatto: nel menù si cambia solo la posizione scelta', () => {
  let days = emptyManualDays();
  days = addToSlot(days, 'Lunedì', 'lunch', 'a');
  days = addToSlot(days, 'Lunedì', 'lunch', 'b');
  days = addToSlot(days, 'Martedì', 'lunch', 'a');
  const next = replaceInSlot(days, 'Lunedì', 'lunch', 0, 'copia-di-a');
  assert.deepEqual(next.Lunedì.lunchIds, ['copia-di-a', 'b']);
  assert.deepEqual(next.Martedì.lunchIds, ['a'], 'gli altri giorni restano uguali');
  assert.deepEqual(days.Lunedì.lunchIds, ['a', 'b'], 'l\'originale non viene toccato');
});

test('modifica piatto: dall\'editor del menù si corregge un piatto tuo o dell\'app', () => {
  const editor = readFileSync('src/components/ManualPlanEditor.tsx', 'utf8');
  for (const needle of ['Modifica ${byId.get(rid)!.title}', 'Modifica ${r.title} prima di aggiungerlo', 'onEditDish(recipe, edited)', 'originale resta com', 'initial={fixing.recipe}']) {
    assert.ok(editor.includes(needle), `editor: manca ${needle}`);
  }
  const planner = readFileSync('src/components/MealPlanner.tsx', 'utf8');
  assert.ok(planner.includes('if (!customIds.has(original.id)) return createManualDish(edited)'), 'un piatto dell\'app non si sovrascrive: se ne crea una copia');
  assert.ok(planner.includes('setDoc(doc(db, path, original.id), edited)'), 'un piatto tuo si aggiorna sullo stesso identificativo');
  const modal = readFileSync('src/components/QuickDishModal.tsx', 'utf8');
  assert.ok(modal.includes('Modifica il piatto') && modal.includes('Salva le modifiche') && modal.includes('editedDish('));
});

test('versione: l\'app dice se quella installata è l\'ultima, più vecchia o di prova', () => {
  assert.equal(compareBuilds(42, 42), 'latest');
  assert.equal(compareBuilds(43, 42), 'outdated');
  assert.equal(compareBuilds(41, 42), 'ahead');
  assert.equal(compareBuilds(0, 42), 'unknown');
  assert.equal(compareBuilds(Number.NaN, 42), 'unknown');
  const card = readFileSync('src/components/AppVersionCard.tsx', 'utf8');
  for (const needle of ['Hai l’ultima versione', 'Quella che hai non è l’ultima', 'Scarica e installa', 'Controlla aggiornamenti', 'Non riesco a controllare ora', '__APP_VERSION__']) {
    assert.ok(card.includes(needle), `scheda versione: manca ${needle}`);
  }
  assert.ok(readFileSync('src/components/AccountSettings.tsx', 'utf8').includes('<AppVersionCard />'));
  assert.ok(readFileSync('src/components/WhatsNew.tsx', 'utf8').includes('versione installata {__APP_VERSION__}'));
  assert.ok(readFileSync('firebase.landing.json', 'utf8').includes('"/version.json"'), 'il sito pubblica sempre un version.json senza cache');
});

test('aggiornamento app: la pagina si chiede sempre prima alla rete, mai la vecchia dalla cache', () => {
  const sw = readFileSync('public/sw.js', 'utf8');
  assert.ok(!sw.includes('che-cucino-oggi-v1'), 'la cache della versione che mostrava la pagina vecchia va cambiata');
  assert.ok(sw.includes("const CACHE_NAME = 'che-cucino-oggi-v2'"));
  // solo i file con la versione nel nome (/assets/) escono dalla cache per primi
  assert.ok(/pathname\.startsWith\('\/assets\/'\)/.test(sw));
  const afterAssets = sw.slice(sw.indexOf('Tutto il resto'));
  assert.ok(/fetch\(request\)\s*\.then/.test(afterAssets) && afterAssets.indexOf('fetch(request)') < afterAssets.indexOf('caches.match(request)'), 'rete prima, cache solo senza connessione');
  assert.ok(!sw.includes("'/index.html',\n  '/manifest.json'"), 'niente elenco di pagine messe in cache all\'installazione');
  // chi arriva dalla versione vecchia viene ricaricato una volta, subito
  assert.ok(sw.includes('hadOldVersion') && sw.includes('client.navigate(client.url)') && sw.includes('self.clients.claim()') && sw.includes('self.skipWaiting()'));
  // vite pubblica i file con l'impronta nel nome
  assert.ok(readFileSync('vite.config.ts', 'utf8').length > 0);
});

test('calorie: la divisione della giornata fa 100% e a 2000 kcal dà 300/100/800/100/700', () => {
  assert.equal(Object.values(MEAL_SHARES).reduce((a, b) => a + b, 0), 1);
  assert.deepEqual(mealBudgets(2000), { breakfast: 300, snackAm: 100, lunch: 800, snackPm: 100, dinner: 700 });
  const b = mealBudgets(1800);
  assert.equal(b.breakfast + b.snackAm + b.lunch + b.snackPm + b.dinner, 1800);
  assert.equal(reservedKcal(2000), 500, 'colazione e due merende');
  assert.equal(clampKcal(500), 1200);
  assert.equal(clampKcal(9000), 4000);
  assert.equal(clampKcal(2012), 2000);
  assert.equal(clampKcal(Number.NaN), 2000);
});

test('calorie: il limite è attivo solo se scelto, e rientra nei valori sensati', () => {
  assert.equal(dailyKcalTarget(null), null);
  assert.equal(dailyKcalTarget({}), null);
  assert.equal(dailyKcalTarget({ dailyKcalTarget: 0 }), null);
  assert.equal(dailyKcalTarget({ dailyKcalTarget: 2000 }), 2000);
  assert.equal(dailyKcalTarget({ dailyKcalTarget: 100 }), 1200);
});

test('calorie: le stime dagli ingredienti sono credibili per i piatti dell\'app', () => {
  const gamberi = INITIAL_RECIPES.find((r) => r.id === 'meal-spaghetti-gamberi')!;
  const kcal = recipeKcal(gamberi).perServing;
  assert.ok(kcal >= 380 && kcal <= 560, `spaghetti ai gamberi: ${kcal}`);
  // 100 g di pasta a crudo valgono circa 355 kcal; l'olio 884 per 100 g
  assert.equal(Math.round(estimateIngredients([{ name: 'Spaghetti', amount: 100, unit: 'g' }]).total), 355);
  assert.equal(Math.round(estimateIngredients([{ name: 'Olio EVO', amount: 10, unit: 'ml' }]).total), 88);
  assert.equal(Math.round(estimateIngredients([{ name: 'Uova', amount: 2, unit: '' }]).total), 157, 'due uova');
  assert.equal(estimateIngredients([{ name: 'Sale', amount: 1, unit: 'q.b.' }]).total, 0);
  assert.ok(estimateIngredients([{ name: 'Olio extravergine d\'oliva', amount: 500, unit: 'ml' }]).total < 1200, 'l\'olio per friggere non finisce tutto nel piatto');
  // quasi tutti gli ingredienti vengono riconosciuti, e nessun piatto da pranzo o cena ha valori assurdi
  const poor = INITIAL_RECIPES.filter((r) => recipeKcal(r).coverage < 0.6);
  assert.ok(poor.length <= 3, `ricette con pochi ingredienti riconosciuti: ${poor.map((r) => r.title).join(', ')}`);
  for (const r of INITIAL_RECIPES) {
    const k = recipeKcal(r).perServing;
    assert.ok(k >= 30 && k <= 1800, `${r.title}: ${k} kcal`);
  }
  const mains = INITIAL_RECIPES.filter((r) => r.category === 'lunch' || r.category === 'dinner').map((r) => recipeKcal(r).perServing).sort((a, b) => a - b);
  const median = mains[Math.floor(mains.length / 2)];
  assert.ok(median >= 200 && median <= 600, `mediana di pranzi e cene: ${median}`);
});

test('calorie: i piatti candidati restano nei limiti del pasto, e se nessuno ci sta si prendono i più leggeri', () => {
  const lunches = INITIAL_RECIPES.filter((r) => r.category === 'lunch');
  const fitting = capPool(lunches, 600);
  assert.ok(fitting.length > 20 && fitting.length < lunches.length);
  assert.ok(fitting.every((r) => recipeKcal(r).perServing <= 600));
  const none = capPool(lunches, 50);
  assert.equal(none.length, 8, 'meglio un piatto un po\' sopra che nessun piatto');
  const lightest = Math.min(...lunches.map((r) => recipeKcal(r).perServing));
  assert.ok(none.some((r) => recipeKcal(r).perServing === lightest));
  // con un limite di 1500 kcal al giorno (pranzo 600, cena 525) ogni giorno possibile resta dentro 1500 + riservate
  for (const target of [1500, 1800, 2000, 2500]) {
    const b = mealBudgets(target);
    const l = capPool(INITIAL_RECIPES.filter((r) => r.category === 'lunch'), b.lunch);
    const d = capPool(INITIAL_RECIPES.filter((r) => r.category === 'dinner'), b.dinner);
    assert.ok(Math.max(...l.map((r) => recipeKcal(r).perServing)) <= b.lunch, `pranzo a ${target}`);
    assert.ok(Math.max(...d.map((r) => recipeKcal(r).perServing)) <= b.dinner, `cena a ${target}`);
  }
});

test('calorie: se piatto e contorni superano il pasto si tolgono i contorni più pesanti, mai il piatto', () => {
  const mk = (id: string, grams: number) => ({ id, title: id, category: 'side', servings: 1, ingredients: [{ name: 'Olio', amount: grams, unit: 'g' }] }) as unknown as Recipe;
  const byId = new Map<string, Recipe>([['main', mk('main', 50)], ['a', mk('a', 10)], ['b', mk('b', 30)]]);
  const total = kcalOfIds(['main', 'a', 'b'], byId);
  assert.ok(total > 0);
  assert.deepEqual(fitMeal(['main', 'a', 'b'], total + 1, byId), ['main', 'a', 'b'], 'ci sta già');
  assert.deepEqual(fitMeal(['main', 'a', 'b'], total - 1, byId), ['main', 'a'], 'via il contorno più pesante');
  assert.deepEqual(fitMeal(['main', 'a', 'b'], 1, byId), ['main'], 'il piatto principale resta');
  assert.deepEqual(fitMeal([], 100, byId), []);
});

test('calorie: il totale del giorno somma i pasti che ci sono', () => {
  const byId = new Map<string, Recipe>(INITIAL_RECIPES.map((r) => [r.id, r] as [string, Recipe]));
  const day = { lunchIds: ['meal-spaghetti-gamberi'], dinnerIds: [] as string[] };
  const k = dayKcal(day, byId);
  assert.equal(k.byMeal.lunch, recipeKcal(byId.get('meal-spaghetti-gamberi')!).perServing);
  assert.equal(k.byMeal.dinner, undefined);
  assert.equal(k.total, k.byMeal.lunch);
  assert.equal(dayKcal(undefined, byId).total, 0);
});

test('calorie: nell\'app il limite è scelto in Famiglia, rispettato dal menù e mostrato nel giorno', () => {
  const planner = readFileSync('src/components/MealPlanner.tsx', 'utf8');
  for (const needle of ['dailyKcalTarget(profile)', 'withinBudget(lunchPool, budgets?.lunch)', 'withinBudget(dinnerPool, budgets?.dinner)', 'fitToBudget(completeMeal(lunchMain', '<DayKcalCard']) {
    assert.ok(planner.includes(needle), `MealPlanner: manca ${needle}`);
  }
  assert.ok(readFileSync('src/components/FamilySettings.tsx', 'utf8').includes('<KcalGoalCard'));
  const card = readFileSync('src/components/KcalGoalCard.tsx', 'utf8');
  assert.ok(card.includes('role="switch"') && card.includes('non sostituiscono il parere di un medico'));
  assert.ok(readFileSync('src/components/DayKcalCard.tsx', 'utf8').includes('supera il tuo limite'));
  assert.ok(readFileSync('src/components/ManualPlanEditor.tsx', 'utf8').includes('<DayKcalCard'));
});
