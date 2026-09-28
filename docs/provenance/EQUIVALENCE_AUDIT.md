# CharterLock Equivalence Audit

Status: Phase 4 pre-deployment audit, controlled proof only.

## Consensus boundary

`CharterLock._perform_adjudication` gives both the leader and validator the
same frozen charter record and the same evidence-record snapshot. Each side
executes `_semantic_evaluate` independently. That evaluation independently
retrieves each normalized, authority-bound URL, verifies the frozen hostname
and path policy, exact byte length, SHA-256 digest, UTF-8 decoding, and typed
retrieval status before semantic evaluation.

The validator does not accept leader-fetched bytes, leader-selected URLs, or a
leader explanation. It computes its own bounded result and applies
`_semantic_equivalent`.

## Compared fields

The equivalence relation compares exactly these eight fields, in the order
defined by `SEMANTIC_KEYS`:

| Field | Why consensus-critical |
| --- | --- |
| `selected_outcome` | Bounded semantic selection before deterministic state derivation. |
| `event_occurred` | Fact required by all temporal interpretations. |
| `event_before_deadline` | Fact used by occurrence-based temporal semantics. |
| `confirmation_before_deadline` | Fact used by confirmation-based temporal semantics. |
| `authority_requirement_met` | Must agree with the frozen authority policy. |
| `corroboration_requirement_met` | Must agree with deterministic distinct-authority counting. |
| `evidence_conflict` | A conflict is a non-business state under the frozen policy. |
| `evidence_sufficient` | Prevents an ordinary business outcome from insufficient evidence. |

It also compares the canonicalized set of typed `failure_causes`. Duplicate
failure labels and ordering are irrelevant; adding, removing, or changing a
failure cause is not.

## Differences that must reject

- Any difference in one of the eight fact fields.
- Any difference in typed retrieval failure causes.
- Any disagreement about authority/path, byte length, digest, UTF-8 validity,
  or redirect destination during independent retrieval.
- Any malformed, extra-key, missing-key, wrong-type, unknown-enum, oversized,
  or cross-field-inconsistent semantic result.

## Differences that must not matter

- Explanations, because no prose is consensus state.
- JSON key ordering and whitespace after the runtime’s bounded object decode.
- Evidence presentation order when the same frozen evidence snapshot is used.
- URL transport formatting that is rejected before semantic evaluation.
- Duplicate failure labels or failure-cause ordering after canonicalization.
- Model confidence, style, formatting, or any field outside the fixed schema.

The runtime API supplies `response_format="json"` to the nondeterministic
executor, so the contract boundary receives a decoded object. Host-side
semantic validation additionally rejects duplicate JSON keys and non-standard
JSON constants before accepting serialized test inputs. The contract then
applies exact key-set and type validation to the decoded consensus object.

## Controlled proof scope

The direct GenVM harness captures the validator closure and is used to test
agreement, disagreement, malformed results, and infrastructure failures. This
proves the adapter and equivalence behavior under controlled inputs; it is not
a claim of live Studio-dev validator behavior. Live qualification remains a
separate post-deployment gate.
