// Controlli sui valori di configurazione di Stripe: un errore qui rende i pagamenti inutilizzabili
// e Stripe risponde con messaggi poco chiari. Logica pura, provata con i test.

/** La chiave segreta inizia con sk_ (o rk_ se è una chiave limitata). pk_ è la chiave pubblicabile: non funziona sul server. */
const isStripeSecretKey = (value) => typeof value === 'string' && /^(sk|rk)_(live|test)_[A-Za-z0-9]{20,}$/.test(value.trim());

/** Il segreto del webhook inizia con whsec_. */
const isWebhookSecret = (value) => typeof value === 'string' && /^whsec_[A-Za-z0-9]{16,}$/.test(value.trim());

/** Spiega cosa non va in una chiave, senza mai mostrarla: solo il tipo (le prime lettere). */
function describeStripeKey(value) {
  const v = typeof value === 'string' ? value.trim() : '';
  if (!v) return 'vuota';
  if (isStripeSecretKey(v)) return v.startsWith('rk_') ? 'chiave limitata (rk_)' : 'chiave segreta (sk_)';
  if (v.startsWith('pk_')) return 'chiave PUBBLICABILE (pk_): serve quella segreta, che inizia con sk_';
  if (v.startsWith('whsec_')) return 'segreto del webhook (whsec_): serve la chiave segreta, che inizia con sk_';
  return 'formato non riconosciuto (deve iniziare con sk_live_ o sk_test_)';
}

module.exports = { isStripeSecretKey, isWebhookSecret, describeStripeKey };
