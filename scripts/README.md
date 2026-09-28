# Protocol scripts

These scripts support deterministic test, schema, provenance, and release
qualification work. The live-write helpers are one-shot qualification tools:
they persist a prepared state before invoking the exact CLI call, persist the
returned hash immediately, and never retry or rebroadcast. They are not a
general deployment command and are not a substitute for the release protocol.
# CharterLock scripts

`deploy_preflight.py --dry-run` is the only deployment-related command in
this checkpoint. It verifies the current contract hash, the checked-in schema,
and the read-only Studio-dev chain ID (`61997`). It has no signer, private key,
nonce submission, transaction broadcast, or rebroadcast path. Any future
deployment implementation must preserve the same-hash persistence and
canonical-readback discipline documented in the protocol release audit.
