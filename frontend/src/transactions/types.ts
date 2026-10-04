import type { ProtocolAction } from "../domain/types";

export type TransactionPhase =
  | "PRECONDITION_READ" | "AWAITING_WALLET" | "BROADCAST" | "HASH_PERSISTED"
  | "RECONCILING" | "FINALIZED" | "EXECUTION_CHECK" | "CANONICAL_READBACK" | "CONFIRMED"
  | "WALLET_REJECTED" | "BROADCAST_FAILED" | "HASH_UNKNOWN" | "RPC_TIMEOUT"
  | "FINALIZED_EXECUTION_FAILED" | "CANONICAL_POSTCONDITION_FAILED" | "CANONICAL_READBACK_PENDING" | "NETWORK_MISMATCH";

export interface PendingTransaction {
  hash: string;
  action: ProtocolAction;
  actionType: string;
  entityId?: string;
  expectedPostcondition: string;
  precondition?: unknown;
  createdAt: number;
  chainId: number;
  contractAddress?: string;
  phase: TransactionPhase;
}

export const TERMINAL_TRANSACTION_PHASES: TransactionPhase[] = [
  "CONFIRMED", "WALLET_REJECTED", "BROADCAST_FAILED", "HASH_UNKNOWN", "RPC_TIMEOUT",
  "FINALIZED_EXECUTION_FAILED", "CANONICAL_POSTCONDITION_FAILED", "NETWORK_MISMATCH",
];
