const { test } = require('node:test');
const assert = require('node:assert/strict');
const inv = require('./invites');

test('token: lungo, diverso a ogni volta, e nel database resta solo l\'impronta', () => {
  const a = inv.newToken();
  const b = inv.newToken();
  assert.notEqual(a, b);
  assert.equal(a.length, 32);
  assert.ok(inv.looksLikeToken(a));
  assert.equal(inv.hashToken(a), inv.hashToken(a));
  assert.notEqual(inv.hashToken(a), inv.hashToken(b));
  assert.equal(inv.hashToken(a).length, 64);
  assert.ok(!inv.hashToken(a).includes(a));
  for (const bad of ['', 'abc', 'a'.repeat(31), 'a'.repeat(33), 'a'.repeat(31) + '/', null, undefined, 42, {}]) {
    assert.equal(inv.looksLikeToken(bad), false, `token non valido accettato: ${String(bad)}`);
  }
});

test('invito: scaduto, annullato e pieno non si usano più', () => {
  const now = 1_000_000;
  assert.equal(inv.inviteState(null, now), 'missing');
  assert.equal(inv.inviteState({ revoked: false, expiresAt: now + 1, submissions: 0 }, now), 'ok');
  assert.equal(inv.inviteState({ revoked: true, expiresAt: now + 1 }, now), 'revoked');
  assert.equal(inv.inviteState({ revoked: false, expiresAt: now - 1 }, now), 'expired');
  assert.equal(inv.inviteState({ revoked: false, expiresAt: now + 1, submissions: inv.MAX_SUBMISSIONS }, now), 'full');
  // annullato vince su scaduto
  assert.equal(inv.inviteState({ revoked: true, expiresAt: now - 1 }, now), 'revoked');
});

test('risposte: senza consenso esplicito non si accetta nulla', () => {
  assert.equal(inv.sanitizeAnswers(null).ok, false);
  assert.equal(inv.sanitizeAnswers('x').ok, false);
  assert.equal(inv.sanitizeAnswers({}).ok, false);
  assert.equal(inv.sanitizeAnswers({ consent: 'true', allergies: ['Arachidi'] }).ok, false);
  assert.equal(inv.sanitizeAnswers({ consent: false }).ok, false);
  assert.equal(inv.sanitizeAnswers({ consent: true }).ok, true);
});

test('risposte: solo i campi previsti, liste corte, testi puliti e piatti tra quelli proposti', () => {
  const out = inv.sanitizeAnswers({
    consent: true,
    isAdmin: true,
    plan: 'pro',
    allergies: ['  arachidi ', 'ARACHIDI', 'x', '<script>alert(1)</script>', 'a'.repeat(200), 42, null, 'Frutta a guscio'],
    dietaryRestrictions: ['vegan', 'vegan', 'carnivoro', 'gluten-free'],
    likedIngredients: ['pollo', 'Pomodoro'],
    dislikedIngredients: ['Pomodoro', 'cipolla'],
    likedMeals: ['meal-101', 'meal-101', 'non-esiste'],
    dislikedMeals: ['meal-101', 'meal-115'],
  });
  assert.equal(out.ok, true);
  const a = out.answers;
  assert.deepEqual(Object.keys(a).sort(), ['allergies', 'dietaryRestrictions', 'dislikedIngredients', 'dislikedMeals', 'likedIngredients', 'likedMeals']);
  assert.ok(a.allergies.includes('Arachidi'));
  assert.equal(a.allergies.filter((x) => x.toLowerCase() === 'arachidi').length, 1, 'doppioni tolti');
  assert.ok(a.allergies.includes('Frutta a guscio'));
  assert.ok(!a.allergies.some((x) => x.includes('<') || x.includes('>')), 'niente codice');
  assert.ok(a.allergies.every((x) => x.length <= 40 && x.length >= 2));
  assert.deepEqual(a.dietaryRestrictions.sort(), ['gluten-free', 'vegan']);
  assert.deepEqual(a.likedMeals, ['meal-101'], 'solo piatti proposti, e un piatto o piace o no');
  assert.deepEqual(a.dislikedMeals, ['meal-115']);
  assert.deepEqual(a.dislikedIngredients, ['Cipolla'], 'un ingrediente non può piacere e non piacere');
  assert.ok(a.likedIngredients.includes('Pomodoro'));
});

test('risposte: le liste non crescono senza limite', () => {
  const many = Array.from({ length: 500 }, (_, i) => `cibo numero ${i}`);
  const out = inv.sanitizeAnswers({ consent: true, allergies: many, dislikedIngredients: many, likedIngredients: many });
  assert.ok(out.answers.allergies.length <= 30);
  assert.ok(out.answers.dislikedIngredients.length <= 30);
  assert.ok(out.answers.likedIngredients.length <= 30);
});

test('unione: allergie e diete si sommano sempre, sui gusti vince chi risponde', () => {
  const existing = {
    allergies: ['Glutine'],
    dietaryRestrictions: ['gluten-free'],
    likedIngredients: ['Pollo', 'Pesce'],
    dislikedIngredients: ['Cipolla'],
    likedMeals: ['meal-101'],
    dislikedMeals: ['meal-115'],
  };
  const answers = {
    allergies: ['arachidi', 'glutine'],
    dietaryRestrictions: [],
    likedIngredients: ['Cipolla'],
    dislikedIngredients: ['Pesce'],
    likedMeals: ['meal-115'],
    dislikedMeals: ['meal-101'],
  };
  const m = inv.mergeAnswers(existing, answers);
  assert.deepEqual(m.allergies, ['Glutine', 'arachidi'], 'niente doppioni, mai toglierne');
  assert.deepEqual(m.dietaryRestrictions, ['gluten-free'], 'la dieta già indicata non si toglie');
  assert.deepEqual(m.likedIngredients, ['Pollo', 'Cipolla']);
  assert.deepEqual(m.dislikedIngredients, ['Pesce']);
  assert.deepEqual(m.likedMeals, ['meal-115']);
  assert.deepEqual(m.dislikedMeals, ['meal-101']);
  // scheda vuota
  const fromScratch = inv.mergeAnswers(undefined, answers);
  assert.deepEqual(fromScratch.allergies, ['arachidi', 'glutine']);
});

test('piatti dell\'invito: id unici e ingredienti indicati', () => {
  const ids = inv.INVITE_DISHES.map((d) => d.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const d of inv.INVITE_DISHES) {
    assert.ok(d.title.length > 3);
    assert.ok(d.ingredients.length >= 1);
  }
});
