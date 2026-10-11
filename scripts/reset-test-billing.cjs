// Passaggio da Stripe test a produzione: toglie dai profili i dati di abbonamento nati in modalità test
// (cliente, abbonamento, piano a pagamento, prova già usata, ricevute). Non tocca i piani regalati senza Stripe.
// Uso: GOOGLE_APPLICATION_CREDENTIALS=... node scripts/reset-test-billing.cjs [--apply]   (senza --apply è solo un'anteprima)
const path = require('node:path');
// firebase-admin è installato nella cartella delle funzioni
const fromFunctions = require('node:module').createRequire(path.join(__dirname, '..', 'functions', 'package.json'));
const { initializeApp } = fromFunctions('firebase-admin/app');
const { getFirestore, FieldValue } = fromFunctions('firebase-admin/firestore');

const FIRESTORE_DB_ID = 'ai-studio-93a2a041-9b02-4ff7-b496-5f2ada58f953';
const apply = process.argv.includes('--apply');

(async () => {
  initializeApp();
  const db = getFirestore(FIRESTORE_DB_ID);
  const snap = await db.collection('users').get();
  const touched = [];
  for (const doc of snap.docs) {
    const d = doc.data();
    const hasStripe = d.stripeCustomerId || d.stripeSubscriptionId || (d.paymentHistory || []).some((p) => p.paymentMethod === 'stripe');
    if (!hasStripe) continue;
    touched.push(doc.id);
    console.log(`${apply ? 'Ripulisco' : 'Da ripulire'}: ${doc.id.slice(0, 6)}… piano=${d.plan || 'free'} cliente=${d.stripeCustomerId ? 'sì' : 'no'} abbonamento=${d.stripeSubscriptionId ? 'sì' : 'no'}`);
    if (apply) {
      await doc.ref.update({
        plan: 'free',
        autoRenew: false,
        subscriptionStatus: null,
        stripeSubscriptionId: null,
        stripeCustomerId: FieldValue.delete(),
        hadSubscription: FieldValue.delete(),
        paymentHistory: (d.paymentHistory || []).filter((p) => p.paymentMethod !== 'stripe'),
      });
    }
  }
  console.log(`${touched.length} profili su ${snap.size} ${apply ? 'ripuliti' : 'interessati (anteprima, nessuna modifica)'}`);
})().catch((e) => { console.error(e); process.exit(1); });
