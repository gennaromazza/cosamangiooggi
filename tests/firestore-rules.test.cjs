// Prova le regole di Firestore contro l'emulatore: chi può vedere il menù condiviso e chi no.
// Si lancia con `npm run test:rules` (avvia l'emulatore da solo); senza emulatore i test vengono saltati.
const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { initializeTestEnvironment, assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');
const { doc, getDoc, setDoc, updateDoc, deleteDoc, getDocs, collection, query, where, setLogLevel } = require('firebase/firestore');

// I rifiuti delle regole sono il risultato atteso: niente rumore nel log
setLogLevel('silent');

const emulator = process.env.FIRESTORE_EMULATOR_HOST;
const skip = emulator ? false : 'emulatore Firestore non avviato (usa npm run test:rules)';

let env;
const MOM = 'mom';
const AUNT = 'aunt'; // si è collegata alla famiglia di mamma
const STRANGER = 'stranger'; // non c'entra nulla
const OTHER_OWNER = 'other-owner'; // un'altra famiglia, con una sua zia collegata
const OTHER_AUNT = 'other-aunt';

before(async () => {
  if (skip) return;
  const [host, port] = emulator.split(':');
  env = await initializeTestEnvironment({
    projectId: 'demo-rules',
    firestore: { rules: readFileSync(process.env.RULES_FILE || 'firestore.rules', 'utf8'), host, port: Number(port) },
  });
});
after(async () => {
  if (env) await env.cleanup();
});

beforeEach(async () => {
  if (skip) return;
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, `users/${MOM}`), { name: 'Mamma', email: 'mamma@example.com', excludedIngredients: ['Arachidi'] });
    await setDoc(doc(db, `users/${MOM}/mealPlans/current`), { id: 'current', days: { Lunedì: { lunchIds: ['r1'], dinnerIds: [] } } });
    await setDoc(doc(db, `users/${MOM}/customRecipes/r1`), { title: 'Torta della nonna' });
    await setDoc(doc(db, `users/${MOM}/familyMembers/m1`), { name: 'Luca', allergies: ['Glutine'] });
    await setDoc(doc(db, `users/${MOM}/pantry/p1`), { name: 'Farina' });
    await setDoc(doc(db, `users/${MOM}/shoppingList/s1`), { name: 'Latte' });
    await setDoc(doc(db, `users/${MOM}/familyShare/current`), { code: 'ABCD-EFGH-JKMN', revoked: false });
    await setDoc(doc(db, `users/${MOM}/viewers/${AUNT}`), { name: 'Zia', joinedAt: 1 });
    await setDoc(doc(db, `users/${AUNT}`), { name: 'Zia', familyId: MOM });
    await setDoc(doc(db, `users/${OTHER_OWNER}/mealPlans/current`), { id: 'current', days: {} });
    await setDoc(doc(db, `users/${OTHER_OWNER}/viewers/${OTHER_AUNT}`), { name: 'Altra zia', joinedAt: 1 });
    await setDoc(doc(db, `shares/hash1`), { uid: MOM, revoked: false, expiresAt: 9e15 });
    await setDoc(doc(db, `invites/hash2`), { uid: MOM, memberId: 'm1' });
  });
});

const as = (uid) => env.authenticatedContext(uid).firestore();

test('chi gestisce la famiglia legge e modifica il proprio menù e le proprie ricette', { skip }, async () => {
  const db = as(MOM);
  await assertSucceeds(getDoc(doc(db, `users/${MOM}/mealPlans/current`)));
  await assertSucceeds(setDoc(doc(db, `users/${MOM}/mealPlans/current`), { id: 'current', days: {} }));
  await assertSucceeds(setDoc(doc(db, `users/${MOM}/customRecipes/r2`), { title: 'Nuova' }));
});

test('chi si è collegato vede menù e ricette della famiglia', { skip }, async () => {
  const db = as(AUNT);
  await assertSucceeds(getDoc(doc(db, `users/${MOM}/mealPlans/current`)));
  await assertSucceeds(getDocs(collection(db, `users/${MOM}/customRecipes`)));
});

test('chi si è collegato non può modificare nulla', { skip }, async () => {
  const db = as(AUNT);
  await assertFails(setDoc(doc(db, `users/${MOM}/mealPlans/current`), { id: 'current', days: {} }));
  await assertFails(updateDoc(doc(db, `users/${MOM}/mealPlans/current`), { id: 'x' }));
  await assertFails(deleteDoc(doc(db, `users/${MOM}/mealPlans/current`)));
  await assertFails(setDoc(doc(db, `users/${MOM}/customRecipes/r9`), { title: 'Intruso' }));
  await assertFails(deleteDoc(doc(db, `users/${MOM}/customRecipes/r1`)));
});

test('chi si è collegato non vede persone, preferenze, dispensa, spesa né profilo', { skip }, async () => {
  const db = as(AUNT);
  await assertFails(getDoc(doc(db, `users/${MOM}`)));
  await assertFails(getDocs(collection(db, `users/${MOM}/familyMembers`)));
  await assertFails(getDoc(doc(db, `users/${MOM}/familyMembers/m1`)));
  await assertFails(getDocs(collection(db, `users/${MOM}/pantry`)));
  await assertFails(getDocs(collection(db, `users/${MOM}/shoppingList`)));
  await assertFails(getDoc(doc(db, `users/${MOM}/familyShare/current`)));
});

test('un estraneo non vede nulla della famiglia', { skip }, async () => {
  const db = as(STRANGER);
  await assertFails(getDoc(doc(db, `users/${MOM}/mealPlans/current`)));
  await assertFails(getDocs(collection(db, `users/${MOM}/customRecipes`)));
  await assertFails(getDoc(doc(db, `users/${MOM}`)));
  await assertFails(getDocs(collection(db, `users/${MOM}/viewers`)));
});

test('senza account non si legge nulla', { skip }, async () => {
  const db = env.unauthenticatedContext().firestore();
  await assertFails(getDoc(doc(db, `users/${MOM}/mealPlans/current`)));
  await assertFails(getDoc(doc(db, `users/${MOM}/familyShare/current`)));
});

test("chi è collegato a una famiglia non vede quella di un'altra", { skip }, async () => {
  const db = as(AUNT);
  await assertFails(getDoc(doc(db, `users/${OTHER_OWNER}/mealPlans/current`)));
  const other = as(OTHER_AUNT);
  await assertFails(getDoc(doc(other, `users/${MOM}/mealPlans/current`)));
});

test('il codice di condivisione lo legge solo chi gestisce la famiglia', { skip }, async () => {
  await assertSucceeds(getDoc(doc(as(MOM), `users/${MOM}/familyShare/current`)));
  await assertFails(getDoc(doc(as(AUNT), `users/${MOM}/familyShare/current`)));
  await assertFails(getDoc(doc(as(STRANGER), `users/${MOM}/familyShare/current`)));
});

test('nessuno può scrivere codici, collegamenti o link dal client', { skip }, async () => {
  const mom = as(MOM);
  await assertFails(setDoc(doc(mom, `users/${MOM}/familyShare/current`), { code: 'ZZZZ-ZZZZ-ZZZZ', revoked: false }));
  await assertFails(setDoc(doc(mom, `users/${MOM}/viewers/${STRANGER}`), { name: 'Intruso' }));
  const stranger = as(STRANGER);
  // Non ci si può collegare da soli, nemmeno scrivendo il proprio documento
  await assertFails(setDoc(doc(stranger, `users/${MOM}/viewers/${STRANGER}`), { name: 'Intruso' }));
  await assertFails(setDoc(doc(stranger, `users/${STRANGER}`), { name: 'X', familyId: MOM }));
  await env.withSecurityRulesDisabled(async (ctx) => setDoc(doc(ctx.firestore(), `users/${STRANGER}`), { name: 'X' }));
  await assertFails(updateDoc(doc(stranger, `users/${STRANGER}`), { familyId: MOM }));
  await assertFails(setDoc(doc(mom, 'shares/nuovo'), { uid: MOM, revoked: false, expiresAt: 9e15 }));
});

test('ognuno vede solo il proprio collegamento, chi gestisce li vede tutti', { skip }, async () => {
  await assertSucceeds(getDoc(doc(as(AUNT), `users/${MOM}/viewers/${AUNT}`)));
  await assertFails(getDoc(doc(as(STRANGER), `users/${MOM}/viewers/${AUNT}`)));
  await assertSucceeds(getDocs(collection(as(MOM), `users/${MOM}/viewers`)));
  await assertFails(getDocs(collection(as(AUNT), `users/${MOM}/viewers`)));
});

test('link e inviti sono leggibili solo dal server', { skip }, async () => {
  for (const uid of [MOM, AUNT, STRANGER]) {
    const db = as(uid);
    await assertFails(getDoc(doc(db, 'shares/hash1')));
    await assertFails(getDoc(doc(db, 'invites/hash2')));
    await assertFails(getDocs(query(collection(db, 'shares'), where('uid', '==', uid))));
  }
});

test("se il server scollega una persona, perde subito l'accesso", { skip }, async () => {
  const db = as(AUNT);
  await assertSucceeds(getDoc(doc(db, `users/${MOM}/mealPlans/current`)));
  await env.withSecurityRulesDisabled(async (ctx) => deleteDoc(doc(ctx.firestore(), `users/${MOM}/viewers/${AUNT}`)));
  await assertFails(getDoc(doc(db, `users/${MOM}/mealPlans/current`)));
  await assertFails(getDocs(collection(db, `users/${MOM}/customRecipes`)));
});

test('un amministratore finto (senza claim) non guadagna nulla', { skip }, async () => {
  const db = env.authenticatedContext('fake-admin', { admin: false }).firestore();
  await assertFails(getDoc(doc(db, `users/${MOM}/mealPlans/current`)));
});

test('senza emulatore il file non sbaglia', () => {
  assert.ok(true);
});
