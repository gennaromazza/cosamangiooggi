const { test } = require('node:test');
const assert = require('node:assert/strict');
const { cleanReceipt, cleanStore, cleanDate, cleanTotal, ReceiptError } = require('./receipts');

const today = new Date(2026, 9, 14);

test('scontrino letto bene: negozio, data e totale puliti', () => {
  assert.deepEqual(cleanReceipt({ isReceipt: true, store: 'ESSELUNGA S.P.A.', date: '2026-10-12', total: 54.3 }, today), { store: 'Esselunga S.P.A.', date: '2026-10-12', total: 54.3 });
  assert.equal(cleanStore('  Conad   City  '), 'Conad City');
  assert.equal(cleanStore(''), 'Supermercato');
  assert.equal(cleanStore('<script>Lidl</script>'), 'scriptLidlscript');
  assert.equal(cleanStore('x'.repeat(100)).length, 60);
});

test('totale: numeri, virgola italiana e valori assurdi', () => {
  assert.equal(cleanTotal(12.345), 12.35);
  assert.equal(cleanTotal('54,30 €'), 54.3);
  assert.equal(cleanTotal(0), null);
  assert.equal(cleanTotal(-3), null);
  assert.equal(cleanTotal(99999), null);
  assert.equal(cleanTotal('boh'), null);
});

test('data: se manca, è nel futuro o è troppo vecchia vale oggi', () => {
  assert.equal(cleanDate('2026-10-01', today), '2026-10-01');
  assert.equal(cleanDate('', today), '2026-10-14');
  assert.equal(cleanDate('12/10/2026', today), '2026-10-14');
  assert.equal(cleanDate('2026-02-30', today), '2026-10-14');
  assert.equal(cleanDate('2026-12-01', today), '2026-10-14');
  assert.equal(cleanDate('2024-01-01', today), '2026-10-14');
});

test('non è uno scontrino o il totale non si legge: messaggio chiaro', () => {
  assert.throws(() => cleanReceipt({ isReceipt: false, total: 10 }, today), ReceiptError);
  assert.throws(() => cleanReceipt(null, today), ReceiptError);
  assert.throws(() => cleanReceipt({ isReceipt: true, store: 'Coop', total: 0 }, today), /totale/);
});
