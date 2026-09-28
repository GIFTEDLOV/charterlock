# CharterLock frontend boundary

The React/TypeScript frontend is intentionally deferred until the protocol
read/write surface is canonical. It must use CharterLock contract state and
must not invent live protocol state or bypass the charter/evidence lifecycle.

Reserved route families are documented in `ARCHITECTURE_LOCK.md` and
`BUILD_PLAN.md`.
