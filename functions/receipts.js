// Scontrini della spesa: cosa si chiede a Gemini e come si ripulisce la risposta prima di darla all'app.
// Modulo senza dipendenze da Firebase: si prova con `node --test functions/receipts.test.js`.

const RECEIPT_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_TOTAL = 5000;

class ReceiptError extends Error {}

const RECEIPT_PROMPT = [
  'Questa è la foto di uno scontrino (o di una ricevuta) di una spesa fatta in Italia.',
  'Leggi: il nome del negozio o del supermercato (solo il nome, senza indirizzo né partita IVA),',
  'la data dell\'acquisto nel formato AAAA-MM-GG e il TOTALE pagato in euro (quello finale, dopo sconti e buoni; non il resto né il contante dato).',
  'Se l\'immagine non è uno scontrino o il totale non si legge, metti isReceipt a false.',
].join(' ');

const pad = (n) => String(n).padStart(2, '0');
const isoDay = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function cleanStore(value) {
  const text = String(value || '')
    .replace(/\s+/g, ' ')
    .replace(/[^\p{L}\p{N} '&.\-]/gu, '')
    .trim()
    .slice(0, 60);
  if (!text) return 'Supermercato';
  // "ESSELUNGA SPA" → "Esselunga Spa": gli scontrini sono tutti in maiuscolo
  return text === text.toUpperCase() ? text.toLowerCase().replace(/(^|[\s'.\-])(\p{L})/gu, (_, sep, c) => sep + c.toUpperCase()) : text;
}

// La data dello scontrino; se manca, non si capisce o è assurda (nel futuro, più di un anno fa) vale oggi
function cleanDate(value, today) {
  const todayIso = isoDay(today);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || '').trim());
  if (!match) return todayIso;
  const [, y, m, d] = match.map(Number);
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return todayIso;
  const iso = isoDay(date);
  const yearAgo = new Date(today);
  yearAgo.setFullYear(today.getFullYear() - 1);
  if (iso > todayIso || iso < isoDay(yearAgo)) return todayIso;
  return iso;
}

function cleanTotal(value) {
  const n = typeof value === 'number' ? value : Number(String(value || '').replace(/[^\d,.-]/g, '').replace(',', '.'));
  if (!Number.isFinite(n) || n <= 0 || n > MAX_TOTAL) return null;
  return Math.round(n * 100) / 100;
}

/** Risposta di Gemini → scontrino pulito. Se non è uno scontrino leggibile, ReceiptError con un messaggio per l'utente. */
function cleanReceipt(raw, today = new Date()) {
  if (!raw || raw.isReceipt === false) throw new ReceiptError('Non sembra uno scontrino: rifai la foto con lo scontrino ben disteso e tutto nell\'inquadratura.');
  const total = cleanTotal(raw.total);
  if (total === null) throw new ReceiptError('Non riesco a leggere il totale: rifai la foto più da vicino, oppure aggiungi la spesa a mano.');
  return { store: cleanStore(raw.store), date: cleanDate(raw.date, today), total };
}

module.exports = { RECEIPT_MIME_TYPES, RECEIPT_PROMPT, ReceiptError, cleanReceipt, cleanStore, cleanDate, cleanTotal };
