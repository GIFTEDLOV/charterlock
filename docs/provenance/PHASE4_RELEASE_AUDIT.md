# Phase 4 release audit record

This is a controlled proof / pre-deployment release record. It is not a live
deployment qualification and contains no contract address or transaction hash.
The source hash and toolchain values below are the previously reported Phase 4
record and are superseded by `PHASE45_RELEASE_RECONCILIATION.md`; they are not
the authoritative current release-candidate values.

| Item | Value |
| --- | --- |
| Project | CharterLock Protocol |
| Schema | `BINARY_EVENT_V1` |
| Contract source | `contracts/charter_lock.py` |
| Previously reported source SHA-256 (not reproducible) | `323fcf4a694d8b4070b043078b316055f090a643a6fdfb987afa5b9f2f7d3e45` |
| Previous verified Phase 3 SHA-256 | `7cbf394642bfc4a4d626888b0601c12c7d53568f99e51244a14632869083c0b1` |
| Target network | Studio-dev |
| Target chain ID | `61997` |
| GenLayer CLI | `0.40.0-rc.3` |
| Python SDK | `genlayer-py 0.19.0rc2` |
| Test harness | `genlayer-test 0.30.0rc2` |
| GenVM | `v0.6.0-rc2` |
| GenLayer JS | `genlayer-js 1.1.8` |
| Deployment address | NOT DEPLOYED |
| Deployment transaction | NOT DEPLOYED |
| Live qualification | NOT PERFORMED |
| Broadcast | NOT ATTEMPTED |

## Phase 4 evidence

- Python tests: 105 passed.
- Frontend unit tests: 57 passed.
- Playwright: 12 passed across desktop, 430px, and 390px projects.
- Mutation audit: 20 total, 20 killed, 0 survived.
- Contract compile, GenVM lint, typecheck, semantic validation, schema
  extraction, frontend typecheck/lint/build, and secret scan are release gates.
- Read-only GenLayer JS preflight initialized the custom Studio-dev chain,
  read chain ID `61997`, and read a block number. It did not sign or submit.
- `scripts/deploy_preflight.py --dry-run` verified source hash, 21-method
  schema, chain ID, and Git HEAD. It explicitly reported broadcast not
  attempted.

The Phase 4 contract changed only for audited security defects. The old SHA is
retained above as historical provenance; the frontend proof page and current
configuration use the new SHA.
