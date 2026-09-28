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

For the authorized candidate, the committed file contains 1,386 LF line
feeds and zero CRLF pairs. The raw/LF deployment hash and the Git-blob-byte
hash are both
`70ca83b07e5c646d90d61d97f2a8828c4541dc955f0758eea0252e0905a1757a`.
The diagnostic all-CRLF conversion hashes to
`65662e279230537bbab340c54e0c1cd0024df9f30192a25ef67f27b90b7e6e4c`, proving
that the authorized hash is not a line-ending-normalization alias.

## Historical discrepancy rule

A previously reported hash is not authoritative unless it can be reproduced
from Git or an explicitly preserved byte artifact. Line-ending, BOM, trailing
newline, and encoding explanations must be demonstrated byte-for-byte; they
must not be assumed.
