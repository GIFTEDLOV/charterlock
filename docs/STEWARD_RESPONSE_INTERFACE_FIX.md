# CharterLock steward response — interface remediation

Status: local candidate only. No push, merge, publication, contract redeployment, Vercel update, or Portal resubmission was performed.

## Exact steward feedback

> The live workflow sends comma-separated allowed outcomes even though the contract requires a JSON array string, permits 0x-prefixed SHA-256 values even though the contract requires exactly 64 unprefixed hexadecimal characters, and routes every opened case to a fixed ID. Please normalize those arguments, route to the newly created case ID from contract state, and add cross-component tests showing charter creation, case opening, and evidence submission against the submitted contract interface.

## Contract-interface forensics

The submitted source is `contracts/charter_lock.py`, and the checked-in schema is `docs/provenance/charterlock.schema.json`. The frozen interface has 21 public methods (11 views, 10 writes).

The relevant submitted methods are:

| Method | Exact parameters, in order | Return | Canonical state behavior |
|---|---|---|---|
| `create_charter` | `schema_version: string`, `domain: string`, `question: string`, `allowed_outcomes: string`, `event_deadline: int`, `evidence_deadline: int`, `temporal_semantics: string`, `authority_policy: string`, `source_policy: string`, `min_corroboration: int`, `conflict_policy: string`, `unavailable_source_policy: string`, `challenge_window_seconds: int`, `max_challenge_generations: int` | `string` | Parses `allowed_outcomes` as JSON, requires exactly `YES` and `NO`, creates `CHR-########`, increments `charter_count`, stores the record, appends `charter_ids`. |
| `open_case` | `charter_id: string` | `string` | Requires a frozen charter, derives the next `CASE-########` from `case_count`, increments `case_count`, stores the case, appends `case_ids`, and returns the case ID. |
| `add_evidence` | `case_id: string`, `authority_id: string`, `source_url: string`, `content_sha256: string`, `content_byte_length: int`, `observed_at: int`, `published_at: int` | `string` | Validates the digest as exactly 64 lowercase/uppercase hexadecimal characters after lowercase comparison, stores the canonical lowercase digest, appends the evidence ID for the case. |
| `get_case` | `case_id: string` | `dict` | Reads the canonical case record. |
| `get_case_count` | none | `int` | Reads the canonical case count. |
| `get_case_ids` | none | `string[]` | Reads the canonical appended case-ID enumeration. |
| `get_charter` | `charter_id: string` | `dict` | Reads the canonical charter record. |
| `get_evidence` | `evidence_id: string` | `dict` | Reads the canonical evidence record. |
| `get_evidence_ids` | `case_id: string` | `string[]` | Reads the canonical evidence-ID enumeration for a case. |

The authoritative new-case source is `get_case_ids`, not a frontend constant and not a guessed `count + 1` route. The adapter snapshots IDs before the write, broadcasts once, reconciles the same transaction hash, reads IDs after finality, diffs the arrays, fetches the candidate with `get_case`, and verifies its `charter_id` before navigation.

## Root causes and fixes

### 1. Allowed outcomes

Root cause: the draft stored the human-facing comma-separated field directly in `actionArgs`, so the live call could send `YES, NO` instead of the contract’s JSON-array string.

Fix: `frontend/src/domain/normalization.ts` provides `normalizeAllowedOutcomes`. It trims input, parses comma-separated or JSON-array input, rejects malformed/empty/unsupported/duplicate values, and emits exact JSON with `JSON.stringify`. `buildActionArgs` sends that output before wallet approval or broadcast. The submitted contract’s supported set is exactly `YES` and `NO`, so a single outcome is rejected.

Canonical serialization: `["YES","NO"]`.

### 2. SHA-256

Root cause: the frontend validator accepted an optional `0x` prefix and the adapter passed the raw field through to `add_evidence`, while the submitted contract accepts exactly 64 unprefixed hexadecimal characters.

Fix: `normalizeSha256` trims edges, removes exactly one `0x` or `0X`, lowercases, then requires `^[0-9a-f]{64}$`. It rejects multiple prefixes, non-hex input, short/long values, padding, and truncation. The helper is used by frontend validation, live `add_evidence` calldata construction, and the controlled adapter’s submitted-evidence path.

Canonical format: exactly 64 lowercase hexadecimal characters, with no prefix.

### 3. Fixed case routing

Root cause: the live charter detail route used `/cases/CASE-00000002` after a successful `open_case` transaction. The old controlled flow also used fixture IDs in confirmation paths.

Fix: transaction completion now returns an optional canonical entity ID. For `open_case`, the live and controlled adapters use before/after canonical ID differentials and verify the fetched case points to the requested charter. The active charter detail route navigates only to `/cases/${transaction.canonicalId}`. Charter and evidence confirmation paths use the same canonical readback pattern.

## Transaction recovery and truthful failure handling

Open-case pending records persist the original hash, action (`charterId`), operation type, pre-write ID snapshot, chain, and contract address immediately after broadcast. `reconcilePersisted` reconciles that same hash after refresh and never calls `submit`. Canonical ID readback retries transient failures; if state remains unavailable, the pending record is retained with `CANONICAL_READBACK_PENDING` and the UI reports:

> Transaction finalized; waiting for canonical case state

No placeholder or fixture ID is invented, and routing does not occur until the canonical record is present and charter-matched.

## Test evidence

- Frontend unit/integration: `78` passing tests across `10` files.
- New normalization coverage: allowed-outcome JSON exactness, whitespace, empty/malformed values, contract-supported outcome cardinality, all required SHA-256 forms and rejection cases.
- Contract-interface parity: current checked-in schema drives method existence, exact parameter names/types/order/count, non-payable write expectations, serialization, and string return assumptions for `create_charter`, `open_case`, and `add_evidence`.
- Cross-component steward workflow: `frontend/src/contract/steward.integration.test.ts` creates a charter from form-shaped input, verifies canonical charter state, opens a case, reads the canonical case ID, verifies charter linkage and route target, submits evidence to that ID with a prefixed SHA, and verifies canonical evidence readback.
- Transaction recovery: same-hash reconciliation, delayed canonical readback, refresh recovery, and no duplicate broadcast are covered in `frontend/src/transactions/engine.test.ts`.
- Python contract/security regression: `106/106` passing.
- Mutation/security audit: `20/20` killed, `0` survived.
- Browser E2E: `15/15` passing across desktop, 430px mobile, and 390px mobile. The steward path covers human-form outcomes, prefixed SHA input, unprefixed SHA input, dynamic case navigation, evidence visibility, console errors, and overflow.
- Production bundle smoke: local Vite preview returned HTTP 200 and served the root application.

## Contract and deployment decision

| Item | Before | After |
|---|---|---|
| Submitted contract SHA-256 | `70ca83b07e5c646d90d61d97f2a8828c4541dc955f0758eea0252e0905a1757a` | `70ca83b07e5c646d90d61d97f2a8828c4541dc955f0758eea0252e0905a1757a` |
| Deployed contract | `0xa79C6437Aad95F5A487373d5e1673DC5bC301be8` | unchanged |
| Deployment transaction | `0x6a2f52cb7eb781b2e74fcc9cd73031e4633bffb591532d3f573ce960d305b721` | unchanged |
| Schema method count | 21 | 21 |

`CONTRACT_CHANGED = NO` and `CONTRACT_REDEPLOY_REQUIRED = NO`. The steward findings are fully remediated in the frontend adapter, transaction recovery, routes, and tests; no submitted-contract defect prevents integration.

This document records a local candidate and does not claim live publication.
