# CharterLock Protocol

CharterLock is GenLayer-native semantic adjudication infrastructure. Its first
schema is `BINARY_EVENT_V1`, demonstrated with real-world event resolution
without implementing betting, custody, odds, trading, liquidity, or tokens.

The canonical workspace is `C:\Users\DELL\CharterLock`. The project keeps
deterministic charter, authority, evidence, lifecycle, semantic, and
provenance boundaries explicit. The frontend is deferred until the protocol
reads and writes are canonical.

See `ARCHITECTURE_LOCK.md`, `THREAT_MODEL.md`, `BUILD_PLAN.md`, and
`frontend/README.md`. The Phase 3 frontend defaults to a clearly labeled
controlled adapter because no contract has been deployed.

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

No deployment, live blockchain write, GitHub push, or Vercel deployment is
performed by the Phase 3 checkpoint.
