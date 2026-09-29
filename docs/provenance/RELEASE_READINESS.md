# CharterLock release readiness

This document records the Phase 7 release checkpoint for the frozen
Studio-dev deployment. It is factual: a green software gate does not turn
`SOURCE_UNAVAILABLE` into a business verdict, and a Vercel deployment does not
prove a browser-wallet write.

| Gate | Status | Evidence / exact limitation | Next action |
|---|---|---|---|
| Contract security | PASS | 106/106 Python tests; 20/20 security mutants killed; frozen source SHA `70ca83b07e5c646d90d61d97f2a8828c4541dc955f0758eea0252e0905a1757a`. | Preserve the source freeze. |
| Source parity | PASS | Deployment, committed blob, clean worktree, and local bytes agree; deployed-source parity is verified. | Recalculate after every future checkout. |
| Deployment | PASS | Deployment `0x6a2f52cb7eb781b2e74fcc9cd73031e4633bffb591532d3f573ce960d305b721` finalized with `FINISHED_WITH_RETURN` at `0xa79C6437Aad95F5A487373d5e1673DC5bC301be8`. | None. |
| Live consensus | PASS | Existing adjudication/readjudication and the single business-verdict attempt reached GenLayer consensus with successful execution. | Keep consensus separate from business verdict. |
| Failure separation | PASS | `SOURCE_UNAVAILABLE` remains distinct from business `NO`; duplicate adjudication simulation was rejected. | None. |
| Challenge / lineage | PASS | Generations 0/1, supersession, evidence-root change, and bounded challenge proof are recorded. | None. |
| Finalization | PENDING TIME WINDOW | `CASE-00000001` remains `CHALLENGEABLE`; canonical simulation returns `CHARTERLOCK:CHALLENGE_WINDOW_OPEN`, so no finalization write was attempted. | Reconcile only when the contract precondition permits. |
| Validator web availability | PARTIAL / TARGET-ENVIRONMENT LIMITATION | Two admissible public HTTPS fixtures reached consensus but returned typed `SOURCE_UNAVAILABLE`; Studio-dev does not expose the lower-level web cause. | Retain the limitation; do not create another case. |
| Business YES/NO | NOT PROVEN | The authorized business-verdict case returned `SOURCE_UNAVAILABLE` / `INCONCLUSIVE`; no retry or result-shopping occurred. | Do not relabel the technical state. |
| Frontend live reads | PASS | Production candidate reads the deployed contract in LIVE mode using official `studioDevnet`; 56 route HTTP checks passed and targeted live browser checks had zero errors/overflow. | Re-run on final main deployment. |
| Browser-wallet live write | PENDING MANUAL | No injected wallet surface is available in this Codex browser environment; the UI diagnostic and manual guide remain ready. | Operator performs one bounded qualification write if desired. |
| GitHub repository | PASS | Public canonical repository: https://github.com/GIFTEDLOV/charterlock; default branch `main`. | Complete protected PR/release flow. |
| Exact-head GitHub CI | PASS | Required six jobs passed at exact SHA `db7eed5d9d676b40d3ef7b7da07cb973c2d769df`; run `36563243348`. Native v0.6 runner typecheck remains explicitly unavailable because the CI cache artifact is missing. | Repeat on final release branch and merged main SHA. |
| Protected release | PARTIAL | `main` has strict required checks, force pushes/deletions disabled, admin enforcement, linear history, and conversation resolution; no release tag/release exists yet. | Open and merge the release PR without bypassing protection. |
| Vercel candidate | PASS | Project `charterlock`; candidate deployment `dpl_5juTW4pV4aRAKxXymRfntqwNpY8r` is `READY`; stable URL https://charterlock.vercel.app. | Deploy exact final main SHA after merge. |
| Production browser | PARTIAL | Candidate HTTP route checks passed at all four widths; targeted proof/case browser checks passed with zero runtime errors and zero overflow. The broad first sweep hit the Studio-dev RPC rate limit, so final smoke must be rate-limit-aware. | Repeat against final deployment. |
| Submission freeze | NOT YET DONE | Repository and candidate app URL now exist, but final main SHA, release tag, GitHub Release, and final Vercel deployment are not frozen. | Create final evidence package after final deployment. |

## Release sequence remaining

1. Commit the factual Phase 7 provenance/UI corrections on
   `release/charterlock-v1` and rerun required exact-SHA CI.
2. Open and merge the protected release PR into `main`.
3. Run exact-head CI on the merged `main` SHA.
4. Deploy that exact SHA to Vercel production and verify `READY` plus production
   browser smoke.
5. Record any manual browser-wallet qualification, without claiming it if it
   does not occur.
6. Create the annotated release tag, GitHub Release, and external release
   evidence package. Do not modify an external submission portal.

## Known limitations

- Studio-dev validators could not retrieve either otherwise admissible public
  fixture, so live business `YES`/`NO` remains unproven.
- `CASE-00000001` remains challengeable while the deployed contract reports an
  open challenge window; terminal finalization is not claimed.
- Browser-wallet live write remains pending manual qualification.
- Native GenVM v0.6 typecheck is not available in the GitHub runner because the
  exact runner/cache artifact is unavailable; the workflow records this as a
  limitation rather than a false pass.
