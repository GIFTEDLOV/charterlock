# CharterLock source hash policy

This policy removes ambiguity between a checked-out deployment artifact and a
Git object.

## Canonical deployment hash

`CONTRACT_SHA256_DEPLOY_BYTES` is the SHA-256 of the exact raw bytes of
`contracts/charter_lock.py` as materialized from a clean checkout of the
release-candidate commit. The repository attribute for this file enforces LF
line endings. The file is UTF-8 without a BOM and retains its committed final
newline. No normalization is performed while hashing.

This is the hash that must be recorded for a future deployment.

## Diagnostic Git hash

`CONTRACT_SHA256_GIT_BLOB` is the SHA-256 of the exact raw bytes returned by
`git cat-file blob HEAD:contracts/charter_lock.py`. It is recorded separately
from Git's SHA-1 blob object ID. It is diagnostic and does not replace the
deployment-byte hash.

Both values must be calculated from the committed state. A clean worktree
reproduction must produce the same deployment-byte hash before any release
authorization.

## Historical discrepancy rule

A previously reported hash is not authoritative unless it can be reproduced
from Git or an explicitly preserved byte artifact. Line-ending, BOM, trailing
newline, and encoding explanations must be demonstrated byte-for-byte; they
must not be assumed.
