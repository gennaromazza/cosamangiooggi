const { test } = require('node:test');
const assert = require('node:assert/strict');
const { isStripeSecretKey, isWebhookSecret, describeStripeKey } = require('./config-checks');

const body = 'a1B2c3D4e5F6g7H8i9J0k1L2';

test('chiave di Stripe: solo le chiavi segrete (sk_ / rk_) sono valide', () => {
  assert.equal(isStripeSecretKey(`sk_live_${body}`), true);
  assert.equal(isStripeSecretKey(`sk_test_${body}`), true);
  assert.equal(isStripeSecretKey(`rk_live_${body}`), true);
  assert.equal(isStripeSecretKey(`  sk_live_${body}\n`), true, 'spazi e a capo copiati per sbaglio non contano');
  assert.equal(isStripeSecretKey(`pk_live_${body}`), false, 'la chiave pubblicabile non funziona sul server');
  assert.equal(isStripeSecretKey(`pk_test_${body}`), false);
  assert.equal(isStripeSecretKey(`whsec_${body}`), false);
  for (const bad of ['', 'sk_live_', 'sk_live_corta', null, undefined, 42, {}]) assert.equal(isStripeSecretKey(bad), false);
});

test('segreto del webhook: deve iniziare con whsec_', () => {
  assert.equal(isWebhookSecret(`whsec_${body}`), true);
  assert.equal(isWebhookSecret(`sk_live_${body}`), false);
  assert.equal(isWebhookSecret(''), false);
});

test('descrizione dell\'errore: dice cosa non va senza mostrare la chiave', () => {
  assert.match(describeStripeKey(`pk_live_${body}`), /PUBBLICABILE/);
  assert.match(describeStripeKey(`whsec_${body}`), /webhook/);
  assert.match(describeStripeKey(''), /vuota/);
  assert.match(describeStripeKey(`sk_live_${body}`), /segreta/);
  assert.match(describeStripeKey('abc'), /non riconosciuto/);
  for (const k of [`pk_live_${body}`, `sk_live_${body}`, `whsec_${body}`]) assert.ok(!describeStripeKey(k).includes(body), 'la chiave non deve comparire nel messaggio');
});
