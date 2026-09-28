# Phase 4 Hostile Red-Team and Release Audit

Status: pre-deployment controlled proof. No deployment, live write, GitHub
push, or Vercel deployment occurred.

## Threat table

| Attack | Precondition | Target | Expected defense | Actual defense | Test coverage | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Mutate frozen charter | Frozen charter exists | Charter record | Creator/state guard and immutable hash | `CHARTER_ALREADY_FROZEN` / state guard | state-machine tests | FIXED/KILLED |
| Add arbitrary authority | Draft charter | Authority binding | Strict hostname/class/path validation | Normalized hostname, bounded class, path policy | red-team URL tests | FIXED/KILLED |
| Trusted substring confusion | Evidence URL supplied | URL parser | Parsed HTTPS authority, no credentials/port/fragment | `urlsplit`, normalized host, unambiguous path | URL matrix | FIXED/KILLED |
| Path traversal/encoding | Bound path prefix | URL transport | Reject ambiguous path encodings | Reject `%`, `//`, backslash, `.` and `..` segments | URL matrix | FIXED/KILLED |
| Official mode with primary source | Official temporal mode | Policy derivation | Official authority class required | `OFFICIAL`/`REGULATOR` check | official-mode test | FIXED/KILLED |
| Reuse same bytes as new challenge | Challenge window open | Evidence identity | Fingerprint stable across transport metadata | case + authority + digest + exact byte length | evidence identity tests | FIXED/KILLED |
| Late evidence registration | Challengeable case | Snapshot | Window check before registration | challenge deadline enforced | late-evidence test | FIXED/KILLED |
| Malformed semantic result | Nondeterministic executor | Fact vector | Exact keys/types/enums/cross-field checks | `_validate_semantic_vector` and host mirror | semantic/adversarial tests | PASS |
| Prompt injection | Hostile evidence body | Semantic prompt | Evidence DATA delimiter and immutable task | Explicit hostile-data prompt boundary | prompt tests/audit | PASS |
| Result shopping | Same frozen tuple | Resolution history | One adjudication key per generation | `_adjudication_key` history scan | one-shot tests | PASS |
| Generic procedural disagreement | Challenge window | Challenge path | Bounded reason codes | `PROCEDURAL_REASON_CODES` | challenge tests | FIXED/KILLED |
| Final-case resurrection | Terminal case | Lifecycle | Terminal state is terminal | `CASE_FINAL` and terminal guards | finality tests | PASS |
| Recovery after finalized write | Persisted hash | Frontend engine | Same-hash reconcile and canonical readback | persisted action/precondition + readback | transaction tests | FIXED/KILLED |
| Wrong network write | Browser chain mismatch | Frontend write | Block before wallet/signing | Studio-dev chain guard | hostile-state tests | PASS |

## Residual observations

- `genlayer-js 1.1.8` does not export a built-in Studio-dev chain object. The
  frontend creates a narrowly scoped chain clone from its pinned `studionet`
  metadata with chain ID `61997` and the Studio-dev RPC URL.
- The contract receives decoded JSON objects from the v0.6 nondeterministic
  API. Host-side serialized-input tests reject duplicate keys and non-standard
  constants; live qualification must confirm the runtime’s decoder behavior.
- There is no deployed address or live validator proof in this checkpoint.

## Mutation result

The focused mutation runner created temporary source copies and exercised
security probes without modifying repository sources:

| Metric | Result |
| --- | ---: |
| Mutants total | 20 |
| Mutants killed | 20 |
| Mutants survived | 0 |

The two frontend mutants are static source-guard probes for canonical
postcondition verification and wrong-network write blocking; the 18 contract
mutants execute through the direct GenVM harness.
