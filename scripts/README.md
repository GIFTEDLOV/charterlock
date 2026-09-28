# Protocol scripts

Phase 2 keeps this directory reserved for deterministic test, schema,
provenance, and release-check scripts. No deployment or live-write script is
included in this checkpoint.
# CharterLock scripts

`deploy_preflight.py --dry-run` is the only deployment-related command in
this checkpoint. It verifies the current contract hash, the checked-in schema,
and the read-only Studio-dev chain ID (`61997`). It has no signer, private key,
nonce submission, transaction broadcast, or rebroadcast path. Any future
deployment implementation must preserve the same-hash persistence and
canonical-readback discipline documented in the protocol release audit.
