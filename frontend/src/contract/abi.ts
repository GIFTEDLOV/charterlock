// GenLayer calldata is schema-driven rather than ordinary Solidity ABI tuples.
// The adapter intentionally passes the public method name and positional values
// through genlayer-js; this list is the reviewer-facing contract surface.
export const PUBLIC_METHODS = [
  "add_authority_rule", "add_evidence", "adjudicate", "challenge", "contract_info",
  "create_charter", "finalize_case", "freeze_charter", "get_case", "get_case_count",
  "get_case_ids", "get_charter", "get_charter_count", "get_charter_ids", "get_evidence",
  "get_evidence_ids", "get_resolution", "get_resolution_history", "open_case", "readjudicate", "seal_evidence",
] as const;
