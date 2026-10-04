import type { ProtocolAction, ProtocolAdapter, SubmittedTransaction } from "../domain/types";
import { config } from "../config";
import { loadPendingTransactions, persistPendingTransaction, removePendingTransaction, updatePendingTransaction } from "./persistence";
import type { PendingTransaction, TransactionPhase } from "./types";

export interface TransactionEvent { phase: TransactionPhase; hash?: string; message?: string; entityId?: string; action?: ProtocolAction; }

export async function executeTransaction(
  adapter: ProtocolAdapter,
  action: ProtocolAction,
  expectedPostcondition: string,
  entityId: string | undefined,
  onEvent: (event: TransactionEvent) => void = () => undefined,
): Promise<SubmittedTransaction> {
  onEvent({ phase: "PRECONDITION_READ" });
  const network = await adapter.network();
  if (adapter.mode === "live" && !network.match) { onEvent({ phase: "NETWORK_MISMATCH", message: "Write blocked: chain or contract configuration does not match." }); throw new Error("NETWORK_MISMATCH"); }
  const precondition = await adapter.precondition(action);
  onEvent({ phase: "AWAITING_WALLET" });
  let submitted: SubmittedTransaction;
  try { submitted = await adapter.submit(action); }
  catch (error) {
    const message = error instanceof Error ? error.message : "BROADCAST_FAILED";
    const phase: TransactionPhase = message.includes("REJECT") ? "WALLET_REJECTED" : message === "NETWORK_MISMATCH" ? "NETWORK_MISMATCH" : "BROADCAST_FAILED";
    onEvent({ phase, message }); throw new Error(message, { cause: error });
  }
  onEvent({ phase: "BROADCAST", hash: submitted.hash });
  const pending: PendingTransaction = { hash: submitted.hash, action, actionType: action.type, entityId, expectedPostcondition, precondition, createdAt: submitted.createdAt, chainId: config.chainId, contractAddress: config.contractAddress, phase: "HASH_PERSISTED" };
  persistPendingTransaction(pending);
  onEvent({ phase: "HASH_PERSISTED", hash: submitted.hash });
  onEvent({ phase: "RECONCILING", hash: submitted.hash });
  let result;
  try { result = await adapter.reconcile(submitted.hash); }
  catch (error) { updatePendingTransaction(submitted.hash, { phase: "RPC_TIMEOUT" }); onEvent({ phase: "RPC_TIMEOUT", hash: submitted.hash, message: error instanceof Error ? error.message : "RPC timeout" }); throw error; }
  if (!result.finalized) { updatePendingTransaction(submitted.hash, { phase: "HASH_UNKNOWN" }); onEvent({ phase: "HASH_UNKNOWN", hash: submitted.hash }); throw new Error("HASH_UNKNOWN"); }
  onEvent({ phase: "FINALIZED", hash: submitted.hash });
  onEvent({ phase: "EXECUTION_CHECK", hash: submitted.hash });
  if (!result.executionSucceeded) { updatePendingTransaction(submitted.hash, { phase: "FINALIZED_EXECUTION_FAILED" }); onEvent({ phase: "FINALIZED_EXECUTION_FAILED", hash: submitted.hash }); throw new Error("FINALIZED_EXECUTION_FAILED"); }
  onEvent({ phase: "CANONICAL_READBACK", hash: submitted.hash, action });
  if (!await adapter.verifyPostcondition(action, precondition)) { updatePendingTransaction(submitted.hash, { phase: "CANONICAL_POSTCONDITION_FAILED" }); onEvent({ phase: "CANONICAL_POSTCONDITION_FAILED", hash: submitted.hash }); throw new Error("CANONICAL_POSTCONDITION_FAILED"); }
  let canonicalId: string | undefined;
  try { canonicalId = await resolveCanonicalReadback(adapter, action, precondition); }
  catch (error) {
    updatePendingTransaction(submitted.hash, { phase: "CANONICAL_READBACK_PENDING" });
    onEvent({ phase: "CANONICAL_READBACK_PENDING", hash: submitted.hash, action, message: "Transaction finalized; waiting for canonical case state" });
    throw new Error("Transaction finalized; waiting for canonical case state", { cause: error });
  }
  updatePendingTransaction(submitted.hash, { phase: "CONFIRMED" });
  removePendingTransaction(submitted.hash);
  onEvent({ phase: "CONFIRMED", hash: submitted.hash, action, entityId: canonicalId });
  return { ...submitted, canonicalId };
}

export async function reconcilePersisted(adapter: ProtocolAdapter, onEvent: (event: TransactionEvent) => void = () => undefined): Promise<void> {
  if (adapter.mode === "live") {
    const network = await adapter.network();
    if (!network.match) {
      for (const pending of loadPendingTransactions()) updatePendingTransaction(pending.hash, { phase: "NETWORK_MISMATCH" });
      onEvent({ phase: "NETWORK_MISMATCH", message: "Persisted writes are held until the configured Studio-dev network matches." });
      return;
    }
  }
  for (const pending of loadPendingTransactions()) {
    onEvent({ phase: "RECONCILING", hash: pending.hash });
    let result;
    try { result = await adapter.reconcile(pending.hash); }
    catch (error) { updatePendingTransaction(pending.hash, { phase: "RPC_TIMEOUT" }); onEvent({ phase: "RPC_TIMEOUT", hash: pending.hash, action: pending.action, message: error instanceof Error ? error.message : "RPC timeout" }); continue; }
    if (!result.finalized) continue;
    if (!result.executionSucceeded) { updatePendingTransaction(pending.hash, { phase: "FINALIZED_EXECUTION_FAILED" }); onEvent({ phase: "FINALIZED_EXECUTION_FAILED", hash: pending.hash }); continue; }
    onEvent({ phase: "CANONICAL_READBACK", hash: pending.hash, action: pending.action });
    if (!await adapter.verifyPostcondition(pending.action, pending.precondition)) { updatePendingTransaction(pending.hash, { phase: "CANONICAL_POSTCONDITION_FAILED" }); onEvent({ phase: "CANONICAL_POSTCONDITION_FAILED", hash: pending.hash }); continue; }
    let canonicalId: string | undefined;
    try { canonicalId = await resolveCanonicalReadback(adapter, pending.action, pending.precondition); }
    catch { updatePendingTransaction(pending.hash, { phase: "CANONICAL_READBACK_PENDING" }); onEvent({ phase: "CANONICAL_READBACK_PENDING", hash: pending.hash, action: pending.action, message: "Transaction finalized; waiting for canonical case state" }); continue; }
    removePendingTransaction(pending.hash); onEvent({ phase: "CONFIRMED", hash: pending.hash, action: pending.action, entityId: canonicalId });
  }
}

async function resolveCanonicalReadback(adapter: ProtocolAdapter, action: ProtocolAction, precondition: unknown): Promise<string | undefined> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try { return await adapter.resolveCanonicalId(action, precondition); }
    catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, 25 * (attempt + 1)));
    }
  }
  throw lastError instanceof Error ? lastError : new Error("CANONICAL_READBACK_PENDING");
}
