const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const s = require('./familyShare');

test('codice: formato leggibile, lungo e diverso a ogni volta', () => {
  const seen = new Set();
  for (let i = 0; i < 200; i++) {
    const code = s.newShareCode();
    assert.match(code, /^[A-HJKMNP-Z2-9]{4}-[A-HJKMNP-Z2-9]{4}-[A-HJKMNP-Z2-9]{4}$/);
    assert.ok(!/[01OIL]/.test(code), 'niente caratteri che si confondono');
    seen.add(code);
  }
  assert.equal(seen.size, 200);
});

test('codice: si accetta scritto a mano, in minuscolo, con spazi, o come link intero', () => {
  const code = 'ABCD-EFGH-JKMN';
  assert.equal(s.normalizeCode(code), code);
  assert.equal(s.normalizeCode('abcd efgh jkmn'), code);
  assert.equal(s.normalizeCode('ABCDEFGHJKMN'), code);
  assert.equal(s.normalizeCode(`https://che-cucino-oggi.web.app/menu#${code}`), code);
  assert.equal(s.normalizeCode(`  ${code}\n`), code);
  for (const bad of ['', 'ABCD-EFGH', 'ABCD-EFGH-JKM0', 'ABCD-EFGH-JKMNP', 'https://x.it/menu', 'https://x.it/menu#', null, undefined, 12, {}]) {
    assert.equal(s.normalizeCode(bad), null, `accettato per errore: ${String(bad)}`);
  }
});

test('codice: nel database resta solo l\'impronta, uguale per lo stesso codice', () => {
  const code = s.newShareCode();
  assert.equal(s.hashCode(code), s.hashCode(code));
  assert.notEqual(s.hashCode(code), s.hashCode(s.newShareCode()));
  assert.equal(s.hashCode(code).length, 64);
  assert.ok(!s.hashCode(code).includes(code.replace(/-/g, '')));
});

test('link: scaduto, annullato o inesistente non si usa', () => {
  const now = 5_000_000;
  assert.equal(s.shareState(null, now), 'missing');
  assert.equal(s.shareState({ revoked: false, expiresAt: now + 1 }, now), 'ok');
  assert.equal(s.shareState({ revoked: true, expiresAt: now + 1 }, now), 'revoked');
  assert.equal(s.shareState({ revoked: false, expiresAt: now - 1 }, now), 'expired');
  assert.equal(s.shareState({ revoked: true, expiresAt: now - 1 }, now), 'revoked');
  assert.ok(s.SHARE_DAYS >= 30 && s.MAX_VIEWERS >= 5);
});

const piano = {
  id: 'current',
  startDate: '2026-10-12T08:00:00.000Z',
  manual: true,
  generatedWithoutFamily: false,
  secretNote: 'non deve uscire',
  days: {
    Lunedì: {
      lunchIds: ['meal-1', 'custom-9'],
      dinnerIds: ['meal-2'],
      lunchAlt: { 'id-persona-celiaca': 'meal-riso' },
      dinnerAlt: { 'id-persona-vegana': 'meal-tofu' },
      lunchTogether: { mode: 'majority', fits: 3, total: 4 },
      extra: 'no',
    },
    Martedì: { lunchIds: [], dinnerIds: ['meal-3'] },
  },
};
const ricette = {
  'custom-9': {
    id: 'custom-9',
    title: 'Pasta della nonna',
    timeMin: 25,
    servings: 4,
    ingredients: [{ name: 'Pasta', amount: 320, unit: 'g' }, { name: '<b>Pomodoro</b>', amount: 2, unit: 'pz' }],
    instructions: ['Cuoci la pasta.', 'Condisci.'],
    tags: ['vegan'],
    ownerNotes: 'privato',
  },
  'altra-ricetta': { id: 'altra-ricetta', title: 'Non nel menù', ingredients: [], instructions: [] },
};

test('vista pubblica: solo pasti e ricette del menù, senza alternative, persone o campi extra', () => {
  const v = s.publicMenuView(piano, ricette);
  assert.deepEqual(Object.keys(v).sort(), ['customRecipes', 'days', 'startDate']);
  assert.deepEqual(v.days['Lunedì'], { lunch: ['meal-1', 'custom-9'], dinner: ['meal-2'] });
  assert.deepEqual(v.days['Martedì'], { lunch: [], dinner: ['meal-3'] });
  assert.deepEqual(v.days['Domenica'], { lunch: [], dinner: [] });
  const json = JSON.stringify(v);
  for (const secret of ['id-persona-celiaca', 'id-persona-vegana', 'meal-riso', 'meal-tofu', 'secretNote', 'majority', 'ownerNotes', 'Non nel menù', 'extra', 'generatedWithoutFamily', 'vegan']) {
    assert.ok(!json.includes(secret), `dato riservato nella vista pubblica: ${secret}`);
  }
  assert.deepEqual(Object.keys(v.customRecipes), ['custom-9']);
  assert.ok(!JSON.stringify(v.customRecipes).includes('<'), 'niente codice nei testi');
});

test('vista pubblica: nessun menù (o vuoto) vuol dire niente da mostrare', () => {
  assert.equal(s.publicMenuView(null, {}), null);
  assert.equal(s.publicMenuView({}, {}), null);
  assert.equal(s.publicMenuView({ days: {} }, {}), null);
  assert.equal(s.publicMenuView({ days: { Lunedì: { lunchIds: [], dinnerIds: [] } } }, {}), null);
  assert.equal(s.publicMenuView('x', {}), null);
});

test('vista pubblica: liste e testi non crescono senza limite', () => {
  const grandi = { days: { Lunedì: { lunchIds: Array.from({ length: 50 }, (_, i) => `r${i}`), dinnerIds: [] } } };
  const v = s.publicMenuView(grandi, {});
  assert.ok(v.days['Lunedì'].lunch.length <= 6);
  const lunga = s.publicMenuView({ days: { Lunedì: { lunchIds: ['c'], dinnerIds: [] } } }, { c: { title: 'x'.repeat(500), ingredients: Array.from({ length: 200 }, () => ({ name: 'a', amount: 1, unit: 'g' })), instructions: ['y'.repeat(5000)] } });
  assert.ok(lunga.customRecipes.c.title.length <= 120);
  assert.ok(lunga.customRecipes.c.ingredients.length <= 60);
  assert.ok(lunga.customRecipes.c.instructions[0].length <= 600);
});

test('giorni della settimana: gli stessi dell\'app', () => {
  const planner = fs.readFileSync(__dirname + '/../src/lib/manualPlan.ts', 'utf8');
  const fromApp = /WEEK_DAYS = \[([^\]]+)\]/.exec(planner)[1].replace(/['\s]/g, '').split(',');
  assert.deepEqual(s.WEEK_DAYS, fromApp);
});
