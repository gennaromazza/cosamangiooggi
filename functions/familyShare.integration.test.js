// Prova le funzioni del menù condiviso contro l'emulatore Firestore, con le funzioni vere (non copie).
// Si lancia con `npm run test:rules` insieme alle regole; senza emulatore i test vengono saltati.
const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

const emulator = process.env.FIRESTORE_EMULATOR_HOST;
const skip = emulator ? false : 'emulatore Firestore non avviato (usa npm run test:rules)';

let fns;
let db;
let server;
let base;
const MOM = 'mom';
const AUNT = 'aunt';
const STRANGER = 'stranger';
const asUser = (uid, name) => ({ auth: { uid, token: { name: name || uid, email: `${uid}@example.com` } }, data: {} });
const call = (fn, uid, data = {}, name) => fn.run({ ...asUser(uid, name), data });

async function open(code) {
  const res = await fetch(`${base}/getSharedMenu`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) });
  return { status: res.status, body: await res.json() };
}

before(async () => {
  if (skip) return;
  process.env.GCLOUD_PROJECT = 'demo-rules';
  fns = require('./index.js');
  db = require('firebase-admin/firestore').getFirestore('ai-studio-93a2a041-9b02-4ff7-b496-5f2ada58f953');
  // Le funzioni pubbliche girano su Express, come sul server vero
  const express = require('express');
  const app = express();
  app.use(express.json());
  app.post('/getSharedMenu', (req, res) => fns.getSharedMenu(req, res));
  server = http.createServer(app);
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  if (server) await new Promise((r) => server.close(r));
  // senza questo il collegamento al database resta aperto e il processo non termina
  if (db) await db.terminate();
});

async function clear() {
  for (const name of ['users', 'shares', 'invites']) await db.recursiveDelete(db.collection(name));
}

beforeEach(async () => {
  if (skip) return;
  await clear();
  await db.doc(`users/${MOM}`).set({ name: 'Famiglia Rossi', email: 'mamma@example.com', excludedIngredients: ['Arachidi'] });
  await db.doc(`users/${MOM}/familyMembers/m1`).set({ name: 'Luca', allergies: ['Glutine'], dislikedIngredients: ['Cipolla'] });
  await db.doc(`users/${MOM}/customRecipes/torta`).set({
    title: 'Torta della nonna', timeMin: 50, servings: 8, category: 'dessert', tags: ['segreto-di-famiglia'],
    ingredients: [{ name: 'Farina', amount: 300, unit: 'g' }], instructions: ['Impastare.', 'Cuocere.'], proteinType: 'eggs',
  });
  await db.doc(`users/${AUNT}`).set({ name: 'Zia' });
  await db.doc(`users/${STRANGER}`).set({ name: 'Estraneo' });
});

const planWith = (extra = {}) => ({
  id: 'current',
  startDate: '2026-10-12',
  days: {
    Lunedì: { lunchIds: ['meal-spaghetti-gamberi'], dinnerIds: ['torta'], lunchAlt: { m1: 'meal-senza-glutine' }, dinnerTogether: { m1: true }, ...extra },
  },
});

test('1 · la mamma genera il link e chi lo apre senza app vede il menù', { skip }, async () => {
  await db.doc(`users/${MOM}/mealPlans/current`).set(planWith());
  const share = await call(fns.createFamilyShare, MOM);
  assert.match(share.code, /^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  assert.ok(share.url.endsWith(`/menu#${share.code}`));
  const page = await open(share.code);
  assert.equal(page.status, 200);
  assert.deepEqual(page.body.menu.days.Lunedì, { lunch: ['meal-spaghetti-gamberi'], dinner: ['torta'] });
  assert.equal(page.body.menu.customRecipes.torta.title, 'Torta della nonna');
  // Si accetta anche il codice scritto in minuscolo e senza trattini
  const sloppy = await open(share.code.toLowerCase().replace(/-/g, ' '));
  assert.equal(sloppy.status, 200);
});

test('2 · la pagina pubblica non rivela nulla di personale', { skip }, async () => {
  await db.doc(`users/${MOM}/mealPlans/current`).set(planWith());
  const share = await call(fns.createFamilyShare, MOM);
  const page = await open(share.code);
  const text = JSON.stringify(page.body);
  for (const secret of ['Luca', 'Glutine', 'Cipolla', 'Arachidi', 'mamma@example.com', 'Famiglia Rossi', 'meal-senza-glutine', 'segreto-di-famiglia', MOM, 'm1']) {
    assert.ok(!text.includes(secret), `la pagina pubblica non deve contenere «${secret}»`);
  }
});

test('3 · il familiare con l’app si collega con il codice e passa a vedere il menù', { skip }, async () => {
  const { code } = await call(fns.createFamilyShare, MOM);
  const joined = await call(fns.joinFamily, AUNT, { code: code.toLowerCase() }, 'Zia Maria Rossi');
  assert.equal(joined.familyId, MOM);
  assert.equal((await db.doc(`users/${AUNT}`).get()).data().familyId, MOM);
  const viewer = (await db.doc(`users/${MOM}/viewers/${AUNT}`).get()).data();
  assert.equal(viewer.name, 'Zia');
  // collegarsi due volte non crea doppioni
  await call(fns.joinFamily, AUNT, { code }, 'Zia Maria Rossi');
  assert.equal((await db.collection(`users/${MOM}/viewers`).get()).size, 1);
});

test('4 · se la mamma cambia un piatto, il link mostra subito il nuovo menù', { skip }, async () => {
  await db.doc(`users/${MOM}/mealPlans/current`).set(planWith());
  const { code } = await call(fns.createFamilyShare, MOM);
  await db.doc(`users/${MOM}/mealPlans/current`).set(planWith({ dinnerIds: ['meal-spaghetti-gamberi'] }));
  const page = await open(code);
  assert.deepEqual(page.body.menu.days.Lunedì.dinner, ['meal-spaghetti-gamberi']);
});

test('6 · un link annullato, rigenerato o scaduto non apre più nulla', { skip }, async () => {
  await db.doc(`users/${MOM}/mealPlans/current`).set(planWith());
  const first = await call(fns.createFamilyShare, MOM);
  const second = await call(fns.createFamilyShare, MOM);
  assert.notEqual(first.code, second.code);
  assert.equal((await open(first.code)).status, 410, 'il vecchio link smette di funzionare');
  assert.equal((await open(second.code)).status, 200);
  await assert.rejects(call(fns.joinFamily, AUNT, { code: first.code }), /annullato/);

  await call(fns.revokeFamilyShare, MOM);
  const revoked = await open(second.code);
  assert.equal(revoked.status, 410);
  assert.match(revoked.body.error, /annullato/);
  assert.equal((await db.doc(`users/${MOM}/familyShare/current`).get()).data().revoked, true);

  const third = await call(fns.createFamilyShare, MOM);
  const { hashCode } = require('./familyShare');
  await db.doc(`shares/${hashCode(third.code)}`).update({ expiresAt: Date.now() - 1000 });
  const expired = await open(third.code);
  assert.equal(expired.status, 410);
  assert.match(expired.body.error, /scaduto/);
  await assert.rejects(call(fns.joinFamily, AUNT, { code: third.code }), /scaduto/);
});

test('7 · un estraneo non entra con codici inventati né scollega gli altri', { skip }, async () => {
  const { code } = await call(fns.createFamilyShare, MOM);
  await call(fns.joinFamily, AUNT, { code });
  assert.equal((await open('AAAA-AAAA-AAAA')).status, 404);
  assert.equal((await open('non-un-codice')).status, 404);
  assert.equal((await open(undefined)).status, 404);
  await assert.rejects(call(fns.joinFamily, STRANGER, { code: 'AAAA-AAAA-AAAA' }), /non è valido/);
  await assert.rejects(call(fns.joinFamily, STRANGER, { code: 'abc' }), /non è corretto/);
  // l'estraneo non può scollegare la zia: scollega solo chi è nella SUA famiglia
  await call(fns.removeFamilyViewer, STRANGER, { viewerUid: AUNT });
  assert.ok((await db.doc(`users/${MOM}/viewers/${AUNT}`).get()).exists);
  assert.equal((await db.doc(`users/${AUNT}`).get()).data().familyId, MOM);
  // senza account non si usa nessuna funzione riservata
  for (const fn of [fns.createFamilyShare, fns.revokeFamilyShare, fns.joinFamily, fns.leaveFamily, fns.removeFamilyViewer]) {
    await assert.rejects(fn.run({ auth: undefined, data: { code } }), /Accesso richiesto/);
  }
  // la propria famiglia non si "unisce"
  await assert.rejects(call(fns.joinFamily, MOM, { code }), /tua famiglia/);
});

test('8 · senza menù la pagina lo dice, e un link senza menù non dà errore', { skip }, async () => {
  const { code } = await call(fns.createFamilyShare, MOM);
  const none = await open(code);
  assert.equal(none.status, 200);
  assert.equal(none.body.menu, null);
  await db.doc(`users/${MOM}/mealPlans/current`).set({ id: 'current', days: { Lunedì: { lunchIds: [], dinnerIds: [] } } });
  assert.equal((await open(code)).body.menu, null);
});

test('chi gestisce scollega una persona e chi è collegato può uscire da solo', { skip }, async () => {
  const { code } = await call(fns.createFamilyShare, MOM);
  await call(fns.joinFamily, AUNT, { code });
  await call(fns.removeFamilyViewer, MOM, { viewerUid: AUNT });
  assert.ok(!(await db.doc(`users/${MOM}/viewers/${AUNT}`).get()).exists);
  assert.equal((await db.doc(`users/${AUNT}`).get()).data().familyId, undefined);

  await call(fns.joinFamily, AUNT, { code });
  const left = await call(fns.leaveFamily, AUNT);
  assert.equal(left.left, true);
  assert.ok(!(await db.doc(`users/${MOM}/viewers/${AUNT}`).get()).exists);
  assert.equal((await call(fns.leaveFamily, AUNT)).left, false);
});

test('cambiando famiglia si esce dalla precedente; il limite di persone è rispettato', { skip }, async () => {
  const { code } = await call(fns.createFamilyShare, MOM);
  await db.doc('users/dad').set({ name: 'Papà' });
  const dadShare = await call(fns.createFamilyShare, 'dad');
  await call(fns.joinFamily, AUNT, { code });
  await call(fns.joinFamily, AUNT, { code: dadShare.code });
  assert.ok(!(await db.doc(`users/${MOM}/viewers/${AUNT}`).get()).exists);
  assert.ok((await db.doc(`users/dad/viewers/${AUNT}`).get()).exists);
  assert.equal((await db.doc(`users/${AUNT}`).get()).data().familyId, 'dad');

  const { MAX_VIEWERS } = require('./familyShare');
  for (let i = 0; i < MAX_VIEWERS; i++) await db.doc(`users/${MOM}/viewers/v${i}`).set({ name: `V${i}`, joinedAt: 1 });
  await assert.rejects(call(fns.joinFamily, STRANGER, { code }), /numero massimo/);
});

test('eliminando l’account di chi gestisce, link e collegamenti spariscono', { skip }, async () => {
  const { code } = await call(fns.createFamilyShare, MOM);
  await call(fns.joinFamily, AUNT, { code });
  // Nei test non c'è il servizio degli accessi: i dati si cancellano comunque prima, e solo quell'ultimo passo non può riuscire
  await fns.deleteMyAccount.run(asUser(MOM)).catch((e) => {
    if (!/non l’accesso/.test(e.message)) throw e;
  });
  assert.equal((await open(code)).status, 404);
  assert.equal((await db.doc(`users/${AUNT}`).get()).data().familyId, undefined);
});
