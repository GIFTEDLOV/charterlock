import { beforeEach, describe, expect, it } from "vitest";
import type { ProtocolAction, ProtocolAdapter, ReconciliationResult, SubmittedTransaction } from "../domain/types";
import { executeTransaction, reconcilePersisted } from "./engine";
import { persistPendingTransaction, loadPendingTransactions } from "./persistence";

const action: ProtocolAction = { type: "finalize_case", caseId: "CASE-00000001" };
const submitted: SubmittedTransaction = { hash: "0xsame", action, createdAt: 1 };
const success: ReconciliationResult = { hash: submitted.hash, finalized: true, executionSucceeded: true, status: "FINALIZED" };

function fake(overrides: Partial<ProtocolAdapter> = {}): ProtocolAdapter {
  const base: ProtocolAdapter = {
    mode: "demo", label: "TEST", listCharterIds: async () => [], getCharterCount: async () => 0, getCharter: async () => { throw new Error("unused"); }, getCharterIds: async () => [], getCaseCount: async () => 0, getCaseIds: async () => [], getCase: async () => { throw new Error("unused"); }, getEvidenceIds: async () => [], getEvidence: async () => { throw new Error("unused"); }, getResolution: async () => { throw new Error("unused"); }, getResolutionHistory: async () => [], getContractInfo: async () => ({ protocol: "", version: "", phase: "", semantic_adjudication_ready: true, business_outcomes: [], technical_states: [], override_functions: [], custody_functions: [] }), submit: async () => submitted, reconcile: async () => success, precondition: async () => ({}), verifyPostcondition: async () => true, network: async () => ({ chainId: 61997, expectedChainId: 61997, configured: false, match: false }),
  };
  return { ...base, ...overrides };
}

describe("transaction state machine", () => {
  beforeEach(() => localStorage.clear());
  it("blocks live writes on network mismatch before submit", async () => { let submittedCount = 0; const adapter = fake({ mode: "live", submit: async () => { submittedCount += 1; return submitted; } }); await expect(executeTransaction(adapter, action, "terminal", action.caseId)).rejects.toThrow("NETWORK_MISMATCH"); expect(submittedCount).toBe(0); });
  it("distinguishes finalized execution failure", async () => { const adapter = fake({ reconcile: async () => ({ ...success, executionSucceeded: false, status: "FINISHED_WITH_ERROR" }) }); await expect(executeTransaction(adapter, action, "terminal", action.caseId)).rejects.toThrow("FINALIZED_EXECUTION_FAILED"); expect(loadPendingTransactions()[0].phase).toBe("FINALIZED_EXECUTION_FAILED"); });
  it("distinguishes canonical postcondition mismatch", async () => { const adapter = fake({ verifyPostcondition: async () => false }); await expect(executeTransaction(adapter, action, "terminal", action.caseId)).rejects.toThrow("CANONICAL_POSTCONDITION_FAILED"); expect(loadPendingTransactions()[0].phase).toBe("CANONICAL_POSTCONDITION_FAILED"); });
  it("reconciles a persisted hash without calling submit", async () => { persistPendingTransaction({ hash: submitted.hash, actionType: action.type, entityId: action.caseId, expectedPostcondition: "terminal", createdAt: 1, chainId: 61997, phase: "HASH_PERSISTED" }); let submitCalled = false; const adapter = fake({ submit: async () => { submitCalled = true; return submitted; } }); await reconcilePersisted(adapter); expect(submitCalled).toBe(false); expect(loadPendingTransactions()).toEqual([]); });
  it("maps wallet rejection to a typed failure", async () => { const adapter = fake({ submit: async () => { throw new Error("WALLET_REJECTED"); } }); await expect(executeTransaction(adapter, action, "terminal", action.caseId)).rejects.toThrow("WALLET_REJECTED"); });
});
