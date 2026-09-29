# CharterLock Protocol

CharterLock is GenLayer-native semantic adjudication infrastructure. Its first
schema is `BINARY_EVENT_V1`, demonstrated with real-world event resolution
without implementing betting, custody, odds, trading, liquidity, or tokens.

The canonical workspace is `C:\Users\DELL\CharterLock`. The project keeps
deterministic charter, authority, evidence, lifecycle, semantic, and
provenance boundaries explicit. The frozen Studio-dev deployment is served by
the production frontend at https://charterlock.vercel.app.

See `ARCHITECTURE_LOCK.md`, `THREAT_MODEL.md`, `BUILD_PLAN.md`, and
`frontend/README.md`. The Phase 4 frontend exposes the full reviewer-facing
workflow behind a live adapter and a clearly labeled controlled adapter;
because no contract has been deployed, the default remains controlled proof.

Phase 2 now includes the real GenLayer semantic boundary: authenticated
evidence retrieval, an exact eight-field fact vector, custom semantic
equivalence, deterministic temporal outcome derivation, typed infrastructure
failures, one-shot resolution keys, and append-only challenge lineage.

## Local verification

```powershell
$env:GENVM_VERSION = "v0.6.0-rc2"
C:\Users\DELL\.beacon-v8-v06-rc2\Scripts\python.exe -m pytest tests
C:\Users\DELL\.beacon-v8-v06-rc2\Scripts\genvm-lint.exe lint contracts\charter_lock.py
C:\Users\DELL\.beacon-v8-v06-rc2\Scripts\genvm-lint.exe schema contracts\charter_lock.py
```

Phase 4 hardens the protocol and frontend through hostile red-team tests,
state-machine checks, mutation checks, provenance audits, and Studio-dev
qualification. The live contract is fixed at
`0xa79C6437Aad95F5A487373d5e1673DC5bC301be8` on Studio-dev chain `61997`.
The live validators reached consensus for the qualification case but returned
typed `SOURCE_UNAVAILABLE`; no business `YES` or `NO` is claimed.
