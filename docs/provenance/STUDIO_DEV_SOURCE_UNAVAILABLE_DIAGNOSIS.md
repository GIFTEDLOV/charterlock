# Studio-dev `SOURCE_UNAVAILABLE` diagnosis

Audit date: 2026-09-29. This is a read-only diagnosis against the frozen
deployment at `0xa79C6437Aad95F5A487373d5e1673DC5bC301be8` on Studio-dev
chain `61997`. No signer was accessed and no transaction was broadcast in
this diagnosis.

## Observed result

Two independently frozen public HTTPS fixtures reached GenLayer consensus but
both resolved to the typed technical state `SOURCE_UNAVAILABLE` and semantic
`INCONCLUSIVE`:

| Fixture | Evidence identity | Adjudication | Consensus | Canonical state |
|---|---|---|---|---|
| Pinned official GenLayer raw content | committed SHA/length in `LIVE_FIXTURE.md` | `0x506205c01234c729c4ed926659f4d9d0a64119a67e5d0f09f45082839ec7a28b` | `MAJORITY_AGREE`, `FINISHED_WITH_RETURN` | `SOURCE_UNAVAILABLE` |
| IANA Example Domains | SHA `9adb74216b75a090d7b8764453146efc9480942bedc0616c5406a009a5a9c43e`, 6661 bytes | `0x8241ac0f4cd256c0605d04f34faa93ced3010bf2e4e61d8865feeedd1a7b80bb` | `MAJORITY_AGREE`, `FINISHED_WITH_RETURN` | `SOURCE_UNAVAILABLE` |

The IANA response was independently fetched from the operator environment as
HTTP 200 with the committed byte identity. That proves evidence identity and
admission; it does not prove validator-side web availability.

## Receipt and validator observations

The GenLayer transaction receipts expose finality, execution, consensus
result, vote counts, processing time, and the bounded result payload. The
adjudication receipts showed five committed/revealed votes, three agreeing
validator results, and two idle validators cancelled after quorum with
`CONSENSUS_VALIDATOR_QUORUM_REACHED`. Agreeing receipts had empty stdout and
stderr, no error code or description, and no nondeterministic disagreement.

The SDK debug endpoint `gen_dbg_traceTransaction` was queried read-only and
returned `Method not found`. Studio-dev therefore did not expose a lower-level
web request trace, DNS/TLS record, browser/WebDriver log, or validator HTTP
response for these transactions.

## Contract boundary

The deployed contract calls `gl.nondet.web.get(normalized_url, sign=True)` in
`_retrieve_one_evidence`. It separately validates redirects, status, body
bytes, byte length, maximum size, SHA-256, UTF-8, authority binding, and
freshness. The frozen implementation catches a GenVM `UserError` and generic
exception at this retrieval boundary and canonicalizes either to
`SOURCE_UNAVAILABLE`; the public resolution schema intentionally does not
store the underlying exception text.

Consequently, the exact subcause is not observable from the available RPC
surface. The evidence does not establish DNS, outbound network, TLS,
redirect, WebDriver, status-code, digest, byte-length, or validator
disagreement as the cause. The observable failure boundary is the contract's
`gl.nondet.web.get` retrieval path, with the target validator environment as
the unresolved operational boundary.

## Classification

| Question | Finding |
|---|---|
| Contract defect found? | **NO observable contract defect.** Local security gates pass; evidence identity/admission and typed failure separation are preserved. |
| Studio-dev limitation found? | **YES, operationally supported.** Validators reached consensus but could not expose or complete public web retrieval for either admissible fixture. |
| Exact DNS/TLS/provider subcause | **UNRESOLVED / NOT EXPOSED** by Studio-dev RPC. |
| Live consensus | **PASS** — consensus executed and canonical resolution was read back. |
| Live business YES/NO | **NOT PROVEN** — validators could not retrieve the otherwise admissible evidence. |

This is a target-environment limitation, not a business verdict and not a
reason to retry adjudication or create another qualification case.
