import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { httpsCallable } from 'firebase/functions';
import { addDoc, collection, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { Camera, ChevronLeft, ChevronRight, FileUp, Loader2, Pencil, Plus, Receipt as ReceiptIcon, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import { db, functions } from '../lib/firebase';
import { prepareUpload } from '../lib/imageUpload';
import {
  cleanStoreName,
  dayLabel,
  findDuplicate,
  formatEuro,
  monthLabel,
  monthOf,
  monthReport,
  monthsTrend,
  parseEuro,
  receiptProblem,
  shiftMonth,
  todayIso,
  type Receipt,
  type ReceiptInput,
} from '../lib/receipts';

interface Props {
  userId: string;
}

const isLocalUser = (uid: string) => uid === 'demo-family-user' || uid.startsWith('local-');
const errorText = (e: any, fallback: string) => e?.message?.replace(/^.*?: /, '') || fallback;

/** Modulo per aggiungere a mano o correggere uno scontrino */
function ReceiptForm({ initial, onSave, onCancel, saveLabel }: { initial: ReceiptInput; onSave: (r: ReceiptInput) => void; onCancel: () => void; saveLabel: string }) {
  const [store, setStore] = useState(initial.store);
  const [date, setDate] = useState(initial.date);
  const [total, setTotal] = useState(initial.total ? initial.total.toFixed(2).replace('.', ',') : '');
  const [problem, setProblem] = useState<string | null>(null);
  const submit = () => {
    const issue = receiptProblem({ store, date, total });
    if (issue) return setProblem(issue);
    onSave({ store: cleanStoreName(store), date, total: parseEuro(total)! });
  };
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <label className="col-span-2 text-sm text-slate-700">
          Negozio
          <input value={store} onChange={(e) => setStore(e.target.value)} maxLength={60} placeholder="Supermercato" className="mt-1 w-full h-11 px-3 rounded-xl border border-slate-200 bg-white" />
        </label>
        <label className="text-sm text-slate-700">
          Data
          <input type="date" value={date} max={todayIso()} onChange={(e) => setDate(e.target.value)} className="mt-1 w-full h-11 px-3 rounded-xl border border-slate-200 bg-white" />
        </label>
        <label className="text-sm text-slate-700">
          Totale (€)
          <input value={total} onChange={(e) => setTotal(e.target.value)} inputMode="decimal" placeholder="54,30" className="mt-1 w-full h-11 px-3 rounded-xl border border-slate-200 bg-white" />
        </label>
      </div>
      {problem && <p role="alert" className="text-sm text-amber-800">{problem}</p>}
      <div className="flex gap-2">
        <button onClick={submit} className="h-11 px-4 rounded-xl bg-indigo-600 text-white font-bold">{saveLabel}</button>
        <button onClick={onCancel} className="h-11 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold">Annulla</button>
      </div>
    </div>
  );
}

/**
 * Scontrini: si fa la foto, il server legge negozio, data e totale, e ogni mese si vede quanto si è speso.
 * Per tutti i piani. La foto non si conserva.
 */
export default function Receipts({ userId }: Props) {
  const local = isLocalUser(userId);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [month, setMonth] = useState(() => monthOf(todayIso()));
  const [reading, setReading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState<Receipt | null>(null);
  const [duplicate, setDuplicate] = useState<{ input: ReceiptInput; source: Receipt['source']; existing: Receipt } | null>(null);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const storageKey = `receipts_${userId}`;

  useEffect(() => {
    if (local) {
      try {
        setReceipts(JSON.parse(localStorage.getItem(storageKey) || '[]'));
      } catch {
        setReceipts([]);
      }
      return;
    }
    return onSnapshot(
      collection(db, `users/${userId}/receipts`),
      (snap) => setReceipts(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Receipt, 'id'>) }))),
      () => setError('Non riesco a caricare gli scontrini. Controlla la connessione.'),
    );
  }, [userId, local, storageKey]);

  const saveLocal = (list: Receipt[]) => {
    setReceipts(list);
    try {
      localStorage.setItem(storageKey, JSON.stringify(list));
    } catch {
      /* spazio esaurito: resta in memoria */
    }
  };

  const store = async (input: ReceiptInput, source: Receipt['source']) => {
    const data = { ...input, createdAt: Date.now(), source };
    let saved: Receipt;
    if (local) {
      saved = { id: `r-${data.createdAt}`, ...data };
      saveLocal([...receipts, saved]);
    } else {
      const ref = await addDoc(collection(db, `users/${userId}/receipts`), data);
      saved = { id: ref.id, ...data };
    }
    setJustAdded(saved);
    setMonth(monthOf(saved.date));
  };

  // Prima di salvare: se lo stesso scontrino c'è già, si chiede
  const add = async (input: ReceiptInput, source: Receipt['source']) => {
    setError(null);
    const existing = findDuplicate(receipts, input);
    if (existing) {
      setDuplicate({ input, source, existing });
      return;
    }
    try {
      await store(input, source);
    } catch (e) {
      setError(errorText(e, 'Non sono riuscito a salvare lo scontrino. Riprova.'));
    }
  };

  const update = async (id: string, input: ReceiptInput) => {
    setError(null);
    try {
      if (local) saveLocal(receipts.map((r) => (r.id === id ? { ...r, ...input } : r)));
      else await updateDoc(doc(db, `users/${userId}/receipts/${id}`), { ...input });
      setEditingId(null);
      if (justAdded?.id === id) setJustAdded({ ...justAdded, ...input });
      setMonth(monthOf(input.date));
    } catch (e) {
      setError(errorText(e, 'Non sono riuscito a salvare la correzione. Riprova.'));
    }
  };

  const remove = async (r: Receipt, ask = true) => {
    if (ask && !window.confirm(`Eliminare lo scontrino di ${r.store} del ${dayLabel(r.date)} (${formatEuro(r.total)})?`)) return;
    try {
      if (local) saveLocal(receipts.filter((x) => x.id !== r.id));
      else await deleteDoc(doc(db, `users/${userId}/receipts/${r.id}`));
      if (justAdded?.id === r.id) setJustAdded(null);
    } catch (e) {
      setError(errorText(e, 'Non sono riuscito a eliminare lo scontrino. Riprova.'));
    }
  };

  // Foto scelta o scattata: si legge subito, senza altri passaggi
  const onPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setReading(true);
    setError(null);
    setJustAdded(null);
    setDuplicate(null);
    try {
      const upload = await prepareUpload(file);
      const result = await httpsCallable<{ data: string; mimeType: string }, { receipt: ReceiptInput; remaining: number }>(functions, 'analyzeReceipt')(upload);
      await add(result.data.receipt, 'photo');
    } catch (err) {
      setError(errorText(err, 'Non sono riuscito a leggere lo scontrino. Riprova o aggiungi la spesa a mano.'));
    } finally {
      setReading(false);
    }
  };

  const report = useMemo(() => monthReport(receipts, month), [receipts, month]);
  const trend = useMemo(() => monthsTrend(receipts, month), [receipts, month]);
  const trendMax = Math.max(...trend.map((t) => t.total), 1);
  const isCurrentMonth = month === monthOf(todayIso());

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h2 className="text-3xl font-semibold text-slate-900">Scontrini e spese</h2>
        <p className="text-slate-600 mt-1">Fai una foto allo scontrino: leggiamo negozio, data e totale, e ogni mese vedi quanto spendi per la spesa.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
        <input ref={cameraInput} type="file" accept="image/*" capture="environment" className="hidden" onChange={onPhoto} />
        <input ref={fileInput} type="file" accept="image/*,application/pdf" className="hidden" onChange={onPhoto} />
        {reading ? (
          <div className="h-14 flex items-center justify-center gap-2 text-indigo-700 font-semibold">
            <Loader2 className="w-5 h-5 animate-spin" /> Leggo lo scontrino…
          </div>
        ) : local ? (
          <p className="text-sm text-slate-600">Per leggere le foto degli scontrini serve un account (entra con Google o con la tua email). Intanto puoi aggiungere le spese a mano.</p>
        ) : (
          <>
            <button onClick={() => cameraInput.current?.click()} className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg flex items-center justify-center gap-2">
              <Camera className="w-5 h-5" /> Fotografa lo scontrino
            </button>
            <button onClick={() => fileInput.current?.click()} className="w-full h-11 rounded-xl border border-slate-200 text-slate-700 font-semibold flex items-center justify-center gap-2">
              <FileUp className="w-4 h-4" /> Scegli una foto o un PDF
            </button>
          </>
        )}
        {!reading && !adding && (
          <button onClick={() => { setAdding(true); setJustAdded(null); }} className="text-sm font-semibold text-indigo-700 underline underline-offset-4 flex items-center gap-1">
            <Plus className="w-4 h-4" /> Aggiungi una spesa a mano
          </button>
        )}
        {adding && (
          <ReceiptForm
            initial={{ store: '', date: todayIso(), total: 0 }}
            saveLabel="Aggiungi"
            onCancel={() => setAdding(false)}
            onSave={(input) => {
              setAdding(false);
              add(input, 'manual');
            }}
          />
        )}
        <p className="text-xs text-slate-500">La foto serve solo per leggere lo scontrino e non viene conservata: salviamo negozio, data e totale.</p>
      </div>

      {duplicate && (
        <div role="alert" className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
          <p className="text-sm text-amber-900">
            Questo scontrino sembra già caricato: <strong>{duplicate.existing.store}</strong>, {dayLabel(duplicate.existing.date)}, {formatEuro(duplicate.existing.total)}.
          </p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                const d = duplicate;
                setDuplicate(null);
                try {
                  await store(d.input, d.source);
                } catch (e) {
                  setError(errorText(e, 'Non sono riuscito a salvare lo scontrino. Riprova.'));
                }
              }}
              className="h-10 px-3 rounded-xl bg-amber-600 text-white font-bold text-sm"
            >
              Aggiungilo comunque
            </button>
            <button onClick={() => setDuplicate(null)} className="h-10 px-3 rounded-xl border border-amber-300 text-amber-900 font-semibold text-sm">Non aggiungere</button>
          </div>
        </div>
      )}

      {justAdded && editingId !== justAdded.id && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2">
          <p className="text-emerald-900">
            Aggiunto: <strong>{justAdded.store}</strong> · {dayLabel(justAdded.date)} · <strong>{formatEuro(justAdded.total)}</strong>
          </p>
          <p className="text-xs text-emerald-800">Controlla che il totale sia giusto: se qualcosa non torna, correggilo.</p>
          <div className="flex gap-4 text-sm font-semibold">
            <button onClick={() => setEditingId(justAdded.id)} className="text-emerald-800 underline underline-offset-4">Correggi</button>
            <button onClick={() => remove(justAdded, false)} className="text-emerald-800 underline underline-offset-4">Annulla</button>
          </div>
        </div>
      )}
      {justAdded && editingId === justAdded.id && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <ReceiptForm initial={justAdded} saveLabel="Salva" onCancel={() => setEditingId(null)} onSave={(input) => update(justAdded.id, input)} />
        </div>
      )}

      {error && <p role="alert" className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">{error}</p>}

      {/* Resoconto del mese */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={() => setMonth(shiftMonth(month, -1))} aria-label="Mese prima" className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <p className="font-semibold text-slate-900 capitalize">{monthLabel(month)}</p>
          <button onClick={() => setMonth(shiftMonth(month, 1))} disabled={isCurrentMonth} aria-label="Mese dopo" className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center disabled:opacity-30">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center">
          <p className="text-4xl font-black text-slate-900">{formatEuro(report.total)}</p>
          <p className="text-sm text-slate-600 mt-1">
            {report.count === 0
              ? isCurrentMonth ? 'Nessuno scontrino ancora questo mese' : 'Nessuno scontrino in questo mese'
              : `${report.count} ${report.count === 1 ? 'spesa' : 'spese'} · in media ${formatEuro(report.average)} a spesa`}
          </p>
          {/* Il mese in corso non è finito: confrontarlo in percentuale con un mese intero ingannerebbe */}
          {isCurrentMonth && report.previousTotal !== null && (
            <p className="text-sm text-slate-500 mt-1">{monthLabel(shiftMonth(month, -1))}, in tutto il mese: {formatEuro(report.previousTotal)}</p>
          )}
          {!isCurrentMonth && report.changePercent !== null && (
            <p className={`text-sm font-semibold mt-1 flex items-center justify-center gap-1 ${report.changePercent > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
              {report.changePercent > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {report.changePercent === 0 ? 'Come' : `${report.changePercent > 0 ? '+' : ''}${report.changePercent}% rispetto a`} {monthLabel(shiftMonth(month, -1))} ({formatEuro(report.previousTotal!)})
            </p>
          )}
        </div>

        {/* Ultimi sei mesi */}
        <div className="flex items-end gap-2 h-24" aria-label="Spesa degli ultimi sei mesi">
          {trend.map((t) => (
            <button key={t.month} onClick={() => setMonth(t.month)} className="flex-1 flex flex-col items-center gap-1 h-full justify-end" title={`${monthLabel(t.month)}: ${formatEuro(t.total)}`}>
              <div className={`w-full rounded-t-md ${t.month === month ? 'bg-indigo-600' : 'bg-indigo-200'}`} style={{ height: `${Math.max(4, (t.total / trendMax) * 72)}px` }} />
              <span className={`text-[11px] ${t.month === month ? 'text-indigo-700 font-bold' : 'text-slate-500'}`}>{monthLabel(t.month).slice(0, 3)}</span>
            </button>
          ))}
        </div>

        {report.byStore.length > 1 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-800">Dove</p>
            {report.byStore.map((s) => (
              <div key={s.store} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-700 truncate">{s.store} <span className="text-slate-400">· {s.count}</span></span>
                  <span className="font-semibold text-slate-900">{formatEuro(s.total)}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(s.total / report.total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {report.receipts.length > 0 && (
          <ul className="divide-y divide-slate-100 border-t border-slate-100">
            {report.receipts.map((r) =>
              editingId === r.id && justAdded?.id !== r.id ? (
                <li key={r.id} className="py-3">
                  <ReceiptForm initial={r} saveLabel="Salva" onCancel={() => setEditingId(null)} onSave={(input) => update(r.id, input)} />
                </li>
              ) : (
                <li key={r.id} className="py-3 flex items-center gap-3">
                  <span className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                    <ReceiptIcon className="w-4 h-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 truncate">{r.store}</p>
                    <p className="text-xs text-slate-500">{dayLabel(r.date)}{r.source === 'manual' ? ' · a mano' : ''}</p>
                  </div>
                  <span className="font-bold text-slate-900">{formatEuro(r.total)}</span>
                  <button onClick={() => setEditingId(r.id)} aria-label={`Correggi ${r.store} del ${dayLabel(r.date)}`} className="w-9 h-9 rounded-lg border border-slate-200 text-slate-600 flex items-center justify-center">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => remove(r)} aria-label={`Elimina ${r.store} del ${dayLabel(r.date)}`} className="w-9 h-9 rounded-lg border border-slate-200 text-slate-600 flex items-center justify-center">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ),
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
