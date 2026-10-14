/**
 * Scontrini della spesa e resoconto del mese. Si salvano solo negozio, data e totale: la foto no.
 */
export interface Receipt {
  id: string;
  store: string;
  /** AAAA-MM-GG */
  date: string;
  /** In euro */
  total: number;
  createdAt: number;
  source?: 'photo' | 'manual';
}

export type ReceiptInput = Pick<Receipt, 'store' | 'date' | 'total'>;

export interface StoreTotal {
  store: string;
  total: number;
  count: number;
}

export interface MonthReport {
  month: string;
  total: number;
  count: number;
  /** Spesa media per scontrino */
  average: number;
  byStore: StoreTotal[];
  /** Totale del mese prima; null se quel mese non c'è nessuno scontrino */
  previousTotal: number | null;
  /** Differenza in percentuale rispetto al mese prima (arrotondata) */
  changePercent: number | null;
  receipts: Receipt[];
}

const MONTHS = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
const pad = (n: number) => String(n).padStart(2, '0');

export const todayIso = (now = new Date()) => `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
export const monthOf = (date: string) => date.slice(0, 7);

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

export function monthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

export function dayLabel(date: string): string {
  const [, m, d] = date.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]}`;
}

export function formatEuro(value: number): string {
  return `${value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')} €`;
}

const round2 = (n: number) => Math.round(n * 100) / 100;
const sameStore = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** Totali del mese: quanto, quante volte, dove, e il confronto con il mese prima. */
export function monthReport(receipts: Receipt[], month: string): MonthReport {
  const inMonth = receipts.filter((r) => monthOf(r.date) === month).sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
  const total = round2(inMonth.reduce((s, r) => s + r.total, 0));
  const stores: StoreTotal[] = [];
  for (const r of inMonth) {
    const found = stores.find((s) => sameStore(s.store, r.store));
    if (found) {
      found.total = round2(found.total + r.total);
      found.count += 1;
      // Si mostra il nome scritto meglio: "Esselunga" piuttosto che "esselunga"
      if (found.store === found.store.toLowerCase() && r.store.trim() !== r.store.trim().toLowerCase()) found.store = r.store.trim();
    } else stores.push({ store: r.store.trim(), total: r.total, count: 1 });
  }
  stores.sort((a, b) => b.total - a.total);
  const previous = receipts.filter((r) => monthOf(r.date) === shiftMonth(month, -1));
  const previousTotal = previous.length ? round2(previous.reduce((s, r) => s + r.total, 0)) : null;
  return {
    month,
    total,
    count: inMonth.length,
    average: inMonth.length ? round2(total / inMonth.length) : 0,
    byStore: stores,
    previousTotal,
    changePercent: previousTotal && inMonth.length ? Math.round(((total - previousTotal) / previousTotal) * 100) : null,
    receipts: inMonth,
  };
}

/** Gli ultimi `count` mesi fino a `month` compreso, dal più vecchio: per il grafico. */
export function monthsTrend(receipts: Receipt[], month: string, count = 6): { month: string; total: number }[] {
  return Array.from({ length: count }, (_, i) => {
    const m = shiftMonth(month, i - count + 1);
    return { month: m, total: round2(receipts.filter((r) => monthOf(r.date) === m).reduce((s, r) => s + r.total, 0)) };
  });
}

/** Lo stesso scontrino caricato due volte: stesso giorno, stesso totale, stesso negozio. */
export function findDuplicate(receipts: Receipt[], input: ReceiptInput): Receipt | undefined {
  return receipts.find((r) => r.date === input.date && Math.abs(r.total - input.total) < 0.005 && sameStore(r.store, input.store));
}

/** "54,30" / "54.30" / "1.054,30 €" → 54.3; null se non è un importo valido. */
export function parseEuro(text: string): number | null {
  let t = text.replace(/[€\s]/g, '');
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(t)) return null;
  const n = Number(t);
  return n > 0 && n <= 5000 ? round2(n) : null;
}

/** Controlla quello che si scrive a mano (o si corregge): null se va bene, altrimenti cosa sistemare. */
export function receiptProblem(input: { store: string; date: string; total: string }, now = new Date()): string | null {
  if (parseEuro(input.total) === null) return 'Scrivi il totale in euro, per esempio 54,30.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) return 'Scegli la data della spesa.';
  if (input.date > todayIso(now)) return 'La data non può essere nel futuro.';
  if (input.store.trim().length > 60) return 'Il nome del negozio è troppo lungo.';
  return null;
}

export const cleanStoreName = (store: string) => store.replace(/\s+/g, ' ').trim().slice(0, 60) || 'Supermercato';
