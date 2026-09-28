import type { PendingTransaction } from "./types";

const STORAGE_KEY = "charterlock.pending-transactions.v1";
const MAX_PENDING = 24;

export function loadPendingTransactions(storage: Storage = localStorage): PendingTransaction[] {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.slice(-MAX_PENDING) as PendingTransaction[] : [];
  } catch { return []; }
}

export function persistPendingTransaction(tx: PendingTransaction, storage: Storage = localStorage): void {
  const next = loadPendingTransactions(storage).filter((item) => item.hash !== tx.hash);
  next.push(tx);
  storage.setItem(STORAGE_KEY, JSON.stringify(next.slice(-MAX_PENDING)));
}

export function updatePendingTransaction(hash: string, patch: Partial<PendingTransaction>, storage: Storage = localStorage): PendingTransaction | undefined {
  const items = loadPendingTransactions(storage);
  const index = items.findIndex((item) => item.hash === hash);
  if (index < 0) return undefined;
  items[index] = { ...items[index], ...patch };
  storage.setItem(STORAGE_KEY, JSON.stringify(items));
  return items[index];
}

export function removePendingTransaction(hash: string, storage: Storage = localStorage): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(loadPendingTransactions(storage).filter((item) => item.hash !== hash)));
}

export function clearPendingTransactions(storage: Storage = localStorage): void { storage.removeItem(STORAGE_KEY); }
