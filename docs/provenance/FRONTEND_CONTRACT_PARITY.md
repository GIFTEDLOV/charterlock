# Frontend / Contract Parity Matrix

Status: Phase 4 pre-deployment / controlled proof.

The live adapter calls only the methods in the generated schema artifact. The
controlled adapter implements the same domain interface for local UI and E2E
tests and is always labeled as demo/test mode.

| Public method | Frontend surface | User action / read purpose | Canonical readback | Test | Status |
| --- | --- | --- | --- | --- | --- |
| `create_charter` | `/charters/new` | Submit reviewed charter | Charter count and new charter | charter builder + adapter tests | PASS |
| `add_authority_rule` | `/charters/new` | Add pre-freeze authority | Charter authority snapshot | builder + adapter tests | PASS |
| `freeze_charter` | Charter detail / builder | Freeze constitution | `state=FROZEN`, hash | transaction engine tests | PASS |
| `open_case` | `/cases`, charter detail | Open case from frozen charter | Case count and case record | case workflow tests | PASS |
| `add_evidence` | Evidence ledger | Register committed evidence metadata | Evidence count and record | evidence tests | PASS |
| `seal_evidence` | Evidence ledger | Seal append-only snapshot | Evidence root | evidence tests | PASS |
| `adjudicate` | Case command center | Start one-shot base generation | Active resolution ID | resolution tests | PASS |
| `challenge` | Challenge workflow | Submit bounded challenge ground | `state=CHALLENGED` | challenge tests | PASS |
| `readjudicate` | Challenge workflow | Run next legal generation | New active resolution and lineage | lineage tests | PASS |
| `finalize_case` | Challenge/resolution view | Finalize after window | `terminal=true`, resolution `FINAL` | finality tests | PASS |
| `get_charter` | Charter detail | Read constitution | Direct read | adapter tests | PASS |
| `get_charter_ids` | Charter explorer | List charter identities | Direct read | explorer tests | PASS |
| `get_charter_count` | Dashboard / transaction precondition | Count creation postcondition | Direct read | transaction tests | PASS |
| `get_case` | Case command center | Read lifecycle state | Direct read | case tests | PASS |
| `get_case_ids` | Case explorer | List case identities | Direct read | explorer tests | PASS |
| `get_case_count` | Dashboard / transaction precondition | Count creation postcondition | Direct read | transaction tests | PASS |
| `get_evidence` | Evidence ledger | Read evidence identity/provenance | Direct read | evidence tests | PASS |
| `get_evidence_ids` | Evidence ledger | List append-only evidence | Direct read | evidence tests | PASS |
| `get_resolution` | Resolution / proof | Read a generation | Direct read | lineage tests | PASS |
| `get_resolution_history` | Activity / lineage | Read append-only history | Direct read | lineage tests | PASS |
| `contract_info` | Proof / integration / docs | Read protocol metadata and policy | Direct read | adapter tests | PASS |

The contract `challenge` method has four arguments, including the bounded
`procedural_reason` code. The UI exposes only
`SEMANTIC_BOUNDARY_VIOLATION` for its procedural path; arbitrary disagreement
prose is not a protocol action.
