# Phase 4/5A–5M release reconciliation

Status: local, pre-deployment reconciliation. No signer access, blockchain
write, GitHub push, or Vercel deployment occurred in this phase.

The prior Phase 4 record reported source SHA-256
`323fcf4a694d8b4070b043078b316055f090a643a6fdfb987afa5b9f2f7d3e45` and a
clean worktree at commit `da9d95d53c3a2dc0c5445032064a79642ea09d4b`. Forensic
inspection found that commit's contract blob SHA-256 was
`61f8a689408adec228d23bd4614e5e019b62c78e7fdd037a42e6cf848875c5da`, while
the preserved dirty working-tree bytes were a different candidate.

The reported hash was not reproduced by LF/CRLF conversion, BOM insertion,
trailing-newline variants, alternate UTF-8/UTF-16 encodings, reachable Git
history, reflog entries, or the unreachable Git object found by read-only
object inspection. The hardened dirty candidate was preserved and selected
only after its implementation and tests were inspected.

The selected candidate retains the Phase 4 security model and adds stricter
typed handling for redirect authority failures plus exact consensus-result
envelope validation. The final committed hash values and gate results are
recorded in the release-candidate commit and the source hash policy. Before
the commit, the selected LF-normalized deployment bytes and staged Git blob
both hash to `70ca83b07e5c646d90d61d97f2a8828c4541dc955f0758eea0252e0905a1757a`
and are 55,739 bytes. The frontend is pinned to the published
`genlayer-js@2.0.0-rc.1` package and its official `studioDevnet` chain export.
