# CharterLock Protocol

CharterLock is GenLayer-native semantic adjudication infrastructure. Its first
schema is `BINARY_EVENT_V1`, demonstrated with real-world event resolution
without implementing betting, custody, odds, trading, liquidity, or tokens.

The canonical workspace is `C:\Users\DELL\CharterLock`. The project keeps
deterministic charter, authority, evidence, lifecycle, semantic, and
provenance boundaries explicit. The frontend is deferred until the protocol
reads and writes are canonical.

See `ARCHITECTURE_LOCK.md`, `THREAT_MODEL.md`, and `BUILD_PLAN.md`.

## Local verification

```powershell
$env:GENVM_VERSION = "v0.6.0-rc2"
C:\Users\DELL\.beacon-v8-v06-rc2\Scripts\python.exe -m pytest tests
C:\Users\DELL\.beacon-v8-v06-rc2\Scripts\genvm-lint.exe lint contracts\charter_lock.py
```

No deployment, live blockchain write, GitHub push, or Vercel deployment is
performed by the Phase 1.5/Phase 2 checkpoint.
