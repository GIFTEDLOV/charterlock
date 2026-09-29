# CharterLock live qualification

This is the factual live qualification record for the deployed contract at
`0xa79C6437Aad95F5A487373d5e1673DC5bC301be8` on Studio-dev chain `61997`.
Every listed write was broadcast once, persisted immediately, reconciled by
the same hash, checked for successful execution, and followed by canonical
readback. No result-shopping retry was made.

## Fixture and semantic scope

The committed fixture identity is in [LIVE_FIXTURE.md](LIVE_FIXTURE.md). It
uses two distinct commit-pinned official GenLayer Labs raw GitHub documents:

| Fixture | SHA-256 | Bytes |
| --- | --- | ---: |
| `genlayer-studio` README at commit `c94072951e483510329670aa427fba3fa6944f45` | `d2496077087a1a272c53852c5834a32e33472d58be8a7a80cce6487ad5fe884d` | 3,689 |
| `genlayer-js` README at commit `1b7f50a3a3f2963ea857941b0fb386081dd5c326` | `51b6b9ec267e8f09d5378c5ca066c6a9e1e586744299746e1d6705e9aeead3eb` | 14,760 |

The question was whether an official GenLayer Labs repository published
documentation describing a GenLayer developer artifact by the event deadline.
The charter used `BINARY_EVENT_V1`, official-confirmation-by-deadline temporal
semantics, registered authority, hostname/path binding, one corroborating
source, a 3,600-second challenge window, and one maximum challenge generation.

## Happy-path lifecycle

Qualification charter: `CHR-00000001`<br>
Qualification case: `CASE-00000001`

| Operation | Transaction hash | Readback |
| --- | --- | --- |
| `create_charter` | `0x632fa5a35ab95a1a3ce7043b547f977f84d0d9c2330ce9fc50eb7e3ff9f25b17` | charter created in `DRAFT` |
| `add_authority_rule` / official-studio | `0x6bda084ba2b94799e62cd92d1c36627d4351413a97d837f6fc887a0414abbe18` | authority admitted |
| `add_authority_rule` / official-js | `0x8ded5829ad4ba2dee0c5f3304cd29af8535b9629ee6ae113423b174c704ac797` | authority admitted |
| `freeze_charter` | `0xd5bd90d452ef0a754133c5963ebfa939964a7fe826413cc6811a2902896daa62` | charter `FROZEN`; authority, temporal, deadline, and challenge policy snapshots fixed |
| `open_case` | `0x566095ab35436468b92ade516065b9c5c7eecea0fc0f027c6690cc239c15cfb7` | case opened |
| `add_evidence` / fixture 1 | `0xbe449ca8471462947a68e11efcd2d768c2969ddbf83546803492dee0d4de5af2` | `EVID-00000001`, exact digest/length identity read back, `ADMISSIBLE` |
| `seal_evidence` | `0x3c3ddca882183e876313b1f60ed9c45a4eaac5b9f0bca47d85db21f5c2a06305` | evidence sealed; root `0x3dbf34ebd0fcd0feded66ef9d7d7e89aebe6feea809beb70bfd19054f638da5e` |
| `adjudicate` / generation 0 | `0x506205c01234c729c4ed926659f4d9d0a64119a67e5d0f09f45082839ec7a28b` | `RES-00000001`, `SOURCE_UNAVAILABLE` / `INCONCLUSIVE` |

The generation-0 semantic vector was:

```json
{
  "selected_outcome": "INCONCLUSIVE",
  "event_occurred": false,
  "event_before_deadline": false,
  "confirmation_before_deadline": false,
  "authority_requirement_met": false,
  "corroboration_requirement_met": false,
  "evidence_conflict": false,
  "evidence_sufficient": false
}
```

The validator outcome was a typed technical state, not business `NO`. This is
the live failure-separation proof: `SOURCE_UNAVAILABLE` remained distinct from
`NO`, and no semantic retry was performed.

## Genuine challenge and readjudication

The second fixture was materially new, had a different fingerprint, satisfied
the frozen authority policy, and changed the evidence snapshot. It was added
once before the genuine challenge:

| Operation | Transaction hash | Readback |
| --- | --- | --- |
| `add_evidence` / fixture 2 | `0x6e5599278fea3164753a5fd090919571d71c3540cf54e14ac3523909788293e7` | `EVID-00000002`, generation 1, `ADMISSIBLE` |
| `challenge` | `0xcd000af1eb4b12159b9146b66ff1bbef351e63536c39c246fb07fc7ecf0c3905` | `CHAL-00000001`; pending root changed to `0x4447dafda6993c57f71ec6a5de23d651a65d785097bc7ec5f57d16901388ee66` |
| `readjudicate` | `0x521bed9bebe88f7a557fc64e4daa30696a57ec9da1d1db61970187c43688243a` | `RES-00000002`, generation 1, active |

Canonical lineage readback verified:

- `RES-00000001` remains readable and is `SUPERSEDED`.
- `RES-00000002` is active and references `RES-00000001` and
  `CHAL-00000001`.
- The evidence root differs between generations.
- Both evidence IDs are linked from the new resolution.
- The new generation independently returned
  `SOURCE_UNAVAILABLE` / `INCONCLUSIVE` with the same bounded all-false fact
  vector; no business `YES` or `NO` is claimed.

`LIVE_CHALLENGE_PROOF=COMPLETED` and
`RESOLUTION_LINEAGE_VERIFIED=YES`.

## Result-shopping guard

A read-only simulation/call of duplicate `adjudicate` after readjudication was
rejected with `CHARTERLOCK:INVALID_CASE_TRANSITION`. It produced no broadcast,
no transaction hash, and no fee spend. This proves the already-adjudicated
case cannot be used for a second authoritative result without a valid
challenge.

## Finalization status

`finalize_case` was not attempted because the current case was still inside the
active challenge window at qualification time. The canonical final observed
state is `CHALLENGEABLE`, non-terminal. This is not presented as a terminal
finalization proof.

## Frontend live adapter

The local frontend is configured with the official `studioDevnet` export, chain
`61997`, and the actual deployed address when run with Vite mode
`studio-dev`. Live reads verified contract info, charter/case counts, the
frozen charter, the qualification case, two evidence objects, and resolution
generations `[0, 1]`; the persisted readback is
`live-frontend-readback.json`.

The Playwright live smoke verified the LIVE label, Studio-dev label, case ID,
active resolution ID, typed failure display, zero console errors, and no core
page horizontal overflow. The repository’s controlled demo mode remains
separate and its 12 Playwright tests still pass.

No browser-wallet live write was attempted. The direct SDK write path was also
not used for a live write because Studio-dev returned `eth_sendTransaction
Method not found`; no frontend write broadcast occurred. The transaction
state-machine and network-guard behavior remain covered by the frontend test
suite.

## Phase 6B final live qualification closure

Captured 2026-09-29 against the frozen contract
`0xa79C6437Aad95F5A487373d5e1673DC5bC301be8` on Studio-dev chain `61997`.
The contract source was not changed; the local source hash remained
`70ca83b07e5c646d90d61d97f2a8828c4541dc955f0758eea0252e0905a1757a`.

### Existing case reconciliation

`CHR-00000001` / `CASE-00000001` was read canonically before any new write.
It remained `CHALLENGEABLE`, generation `1`, with active resolution
`RES-00000002`. `finalize_case` was not attempted: the contract precondition
simulation rejected the action with `CHARTERLOCK:CHALLENGE_WINDOW_OPEN`.
There was no finalization broadcast and no terminal-state claim.
The required fresh post-qualification read/simulation produced the same
non-eligible `CHALLENGEABLE` state and rejected the read-only finalization
attempt; no finalization write was authorized by the canonical precondition.

### New controlled live business-verdict qualification

The single new fixture is documented in
`LIVE_BUSINESS_VERDICT_FIXTURE.md`:

- question: `Did IANA publish by the charter deadline that example.com and example.org are maintained for documentation purposes?`
- authority: `iana-example-domains`, `OFFICIAL`, `www.iana.org`, `/help/example-domains`
- URL/effective URL: `https://www.iana.org/help/example-domains`
- HTTP status: `200`
- exact bytes: `6661`
- SHA-256: `9adb74216b75a090d7b8764453146efc9480942bedc0616c5406a009a5a9c43e`
- temporal mode: `OFFICIAL_CONFIRMATION_BY_DEADLINE`

The charter/case sequence was completed exactly once per write, with immediate
hash persistence, same-hash reconciliation, successful execution verification,
and canonical readback:

| Action | Canonical identity | Transaction hash |
|---|---|---|
| create_charter | `CHR-00000002` | `0xa965ab7092edcc53788b04f600aa66b6fb965a0f92e320f0db8f5dbb2566c265` |
| add_authority_rule | `iana-example-domains` | `0x254d6db27f29680510a174eec2e37ae69b62a9985e451053bab51052e366c415` |
| freeze_charter | charter hash `0x9a10d41cbfec00045a8fb811e723db7fe77ac6530d58adf9018d94d1f5bc1418` | `0x23edda912b7703c0b2f56024889cfabd4fa15ef5303355c51cfd2708a8f2c8a8` |
| open_case | `CASE-00000002` | `0x1de42fd3ee2a6321840ecd26d259fa360268977f55de5d3d47229d141536d31a` |
| add_evidence | `EVID-00000003`, digest `9adb…9c43e`, 6661 bytes | `0xdfda7e3ad1923af825bfe4a98255352b4b253e71dc2092434c043a9715971144` |
| seal_evidence | root `0x3f7198700334227f9d92bdf6d60bfc7eead1dc2035ee840c7e0acfbdbdf3fbbb` | `0x1ebb86fa49b71ec65a095e39d4ae6da807a34a7bf3fad536106c461c9a22f935` |
| adjudicate | `RES-00000003`, generation `0` | `0x8241ac0f4cd256c0605d04f34faa93ced3010bf2e4e61d8865feeedd1a7b80bb` |

All seven transactions finalized with `FINISHED_WITH_RETURN`. The live
adjudication reached GenLayer consensus, but the canonical resolution is:

- semantic vector: `selected_outcome=INCONCLUSIVE`, `event_occurred=false`,
  `event_before_deadline=false`, `confirmation_before_deadline=false`,
  `authority_requirement_met=false`, `corroboration_requirement_met=false`,
  `evidence_conflict=false`, `evidence_sufficient=false`
- typed state: `SOURCE_UNAVAILABLE`
- business outcome: none

This is live consensus execution, not a business YES/NO proof. The single
authorized business-verdict attempt therefore remains `NOT_PROVEN`. No second
case and no retry was made. A read-only duplicate-adjudication simulation was
rejected with `REJECTED_PRECONDITION`; no duplicate transaction was broadcast.

### Browser-wallet status

The browser-wallet path was unavailable in this environment: no Chrome/browser
surface was exposed and `genlayer wallet status` reported no active wallet
session. No browser approval, wallet write, or wallet transaction hash exists.
The seven qualification writes used the previously verified keystore/CLI path,
not browser-wallet proof. This limitation remains visible in the proof UI.
## Phase 6C closure and validator-web diagnosis

Fresh canonical reads reconfirmed `CASE-00000001` as `CHALLENGEABLE` at
generation `1`, with active resolution `RES-00000002`, evidence root
`0x4447dafda6993c57f71ec6a5de23d651a65d785097bc7ec5f57d16901388ee66`, and
challenge deadline `1790638365`. A read-only fee/simulation path returned a
receipt result decoding to `CHARTERLOCK:CHALLENGE_WINDOW_OPEN`; finalization
was not broadcast. The state remains non-terminal and the terminal proof is
pending the contract's own eligibility condition.

The two independent live fixtures remain historical evidence, not business
verdicts. Their adjudication receipts reached `MAJORITY_AGREE` and
`FINISHED_WITH_RETURN` with five committed/revealed votes, while their
canonical resolutions were typed `SOURCE_UNAVAILABLE` / `INCONCLUSIVE`.
Studio-dev's `gen_dbg_traceTransaction` endpoint returned `Method not found`,
so no DNS, TLS, browser/WebDriver, HTTP response, or provider-level cause is
observable through the available RPC. The exact web subcause is therefore
`UNRESOLVED_NOT_EXPOSED`; the evidence supports a validator/Studio-dev web
availability limitation and does not identify a CharterLock contract defect.

The required distinction is now explicit:

- `LIVE CONSENSUS`: `PASS`.
- `LIVE EVIDENCE IDENTITY / ADMISSION`: `PASS`.
- `FAILURE SEPARATION`: `PASS`.
- `LIVE VALIDATOR WEB AVAILABILITY`: `PARTIAL / BLOCKED BY TARGET ENVIRONMENT`.
- `LIVE BUSINESS YES/NO`: `NOT PROVEN`.
- Browser-wallet write: `PENDING MANUAL QUALIFICATION`.

No new case or adjudication retry was performed. The operator-facing,
read-only wallet diagnostic and the single bounded manual qualification guide
are in `frontend/src/app/components.tsx` and
`docs/provenance/BROWSER_WALLET_QUALIFICATION.md`.
