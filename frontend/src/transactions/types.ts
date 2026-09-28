export type TransactionPhase =
  | "PRECONDITION_READ" | "AWAITING_WALLET" | "BROADCAST" | "HASH_PERSISTED"
  | "RECONCILING" | "FINALIZED" | "EXECUTION_CHECK" | "CANONICAL_READBACK" | "CONFIRMED"
  | "WALLET_REJECTED" | "BROADCAST_FAILED" | "HASH_UNKNOWN" | "RPC_TIMEOUT"
  | "FINALIZED_EXECUTION_FAILED" | "CANONICAL_POSTCONDITION_FAILED" | "NETWORK_MISMATCH";

export interface PendingTransaction {
  hash: string;
  actionType: string;
  entityId?: string;
  expectedPostcondition: string;
  createdAt: number;
  chainId: number;
  contractAddress?: string;
  phase: TransactionPhase;
}

export const TERMINAL_TRANSACTION_PHASES: TransactionPhase[] = [
  "CONFIRMED", "WALLET_REJECTED", "BROADCAST_FAILED", "HASH_UNKNOWN", "RPC_TIMEOUT",
  "FINALIZED_EXECUTION_FAILED", "CANONICAL_POSTCONDITION_FAILED", "NETWORK_MISMATCH",
];
