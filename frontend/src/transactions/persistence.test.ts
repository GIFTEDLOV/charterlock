import { describe, expect, it } from "vitest";
import { clearPendingTransactions, loadPendingTransactions, persistPendingTransaction, removePendingTransaction, updatePendingTransaction } from "./persistence";
import type { PendingTransaction } from "./types";

const tx: PendingTransaction = { hash: "0xabc", action: { type: "freeze_charter", charterId: "CHR-1" }, actionType: "freeze_charter", entityId: "CHR-1", expectedPostcondition: "FROZEN", precondition: { state: "DRAFT" }, createdAt: 1, chainId: 61997, contractAddress: undefined, phase: "HASH_PERSISTED" };
describe("crash-safe transaction persistence", () => {
  it("persists the exact hash", () => { persistPendingTransaction(tx); expect(loadPendingTransactions()[0].hash).toBe("0xabc"); });
  it("updates a same-hash reconciliation phase", () => { persistPendingTransaction(tx); updatePendingTransaction("0xabc", { phase: "RECONCILING" }); expect(loadPendingTransactions()[0].phase).toBe("RECONCILING"); });
  it("does not create a replacement on repeated persistence", () => { persistPendingTransaction(tx); persistPendingTransaction({ ...tx, phase: "RECONCILING" }); expect(loadPendingTransactions()).toHaveLength(1); });
  it("recovers after a refresh-equivalent read", () => { persistPendingTransaction(tx); const recovered = loadPendingTransactions(); expect(recovered[0].expectedPostcondition).toBe("FROZEN"); });
  it("removes only the reconciled hash", () => { persistPendingTransaction(tx); persistPendingTransaction({ ...tx, hash: "0xdef" }); removePendingTransaction("0xabc"); expect(loadPendingTransactions().map((item) => item.hash)).toEqual(["0xdef"]); });
  it("bounds persisted transaction volume", () => { for (let i = 0; i < 40; i++) persistPendingTransaction({ ...tx, hash: `0x${i}` }); expect(loadPendingTransactions().length).toBeLessThanOrEqual(24); });
  it("clears pending state explicitly", () => { persistPendingTransaction(tx); clearPendingTransactions(); expect(loadPendingTransactions()).toEqual([]); });
});
