# CharterLock Protocol — Build Plan

## Completed checkpoint: Phase 0 + Phase 1.5 + Phase 2

- captured the local runtime/toolchain baseline
- selected the cached Studio-dev v0.6 family (`v0.6.0-rc2`)
- froze architecture, threat model, storage layout, and state transitions
- implemented charter creation, authority registration, validation, and freeze
- implemented deterministic case/evidence registration and evidence snapshot
- implemented strict bounds, URL binding, SHA-256 checks, duplicate checks,
  append-only IDs, and canonical read APIs
- added explicit fail-closed adjudication/readjudication boundaries
- added challenge and resolution lineage storage scaffolding
- added direct GenLayer tests and semantic-output test fixtures
- isolated the canonical repository from the preserved predecessor workspace
- implemented bounded authenticated retrieval and typed infrastructure failures
- implemented strict `BINARY_EVENT_V1` semantic validation and temporal derivation
- implemented custom `run_nondet` equivalence with validator-independent retrieval
- implemented one-shot adjudication keys, challenge generation, and lineage
- added controlled direct-mode disagreement and prompt-injection tests

## Phase 2 implementation notes

The Phase 2 boundary is implemented in `contracts/charter_lock.py`. The
semantic helper in `src/charterlock/semantic.py` mirrors the consensus-critical
schema for host-side tests and documentation; it is not an authority source.
The previously fail-closed `adjudicate` and `readjudicate` boundaries now
return canonical resolution IDs; the reviewer workflow and read APIs remain
stable, and the checked-in schema records the return-type change.

## Phase 3 — verification and frontend (operator review required)

- add 30+ direct, 20+ adversarial, 8+ state-machine/invariant tests and
  mutation targets
- exercise local simulator and, separately, a reviewer-approved Studio-dev
  integration using transaction discipline
- build the React/TypeScript routes only after canonical contract reads/writes
  exist
- add proof/provenance readback, source/config parity, and release checks

## Phase 4 — release (explicit authorization required)

Freeze source SHA-256, exact Git HEAD, network/chain ID, runner/toolchain,
deployment hash/address, schema, deployed-source parity, CI, clean worktree,
secret scan, frontend configuration, and proof package. No deployment or live
write is part of this checkpoint.

