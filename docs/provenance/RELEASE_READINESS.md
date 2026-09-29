# CharterLock release readiness

Audit head: `6f259e7c932bfc44e10cb1b0432828c7fdcb98c6`. Contract source is
frozen at SHA-256
`70ca83b07e5c646d90d61d97f2a8828c4541dc955f0758eea0252e0905a1757a`.

| Gate | Status | Evidence / exact limitation | Next action |
|---|---|---|---|
| Contract security | PASS | 106/106 Python tests, adversarial coverage, 20/20 security mutants killed, frozen source hash. | Preserve the source freeze. |
| Source parity | PASS | Deployment record and committed/clean-checkout bytes match; deployed source parity recorded as verified. | Recalculate after every checkout. |
| Deployment | PASS | Deployment finalized with successful execution and canonical address/readback. | None. |
| Live consensus | PASS | Existing adjudication and readjudication reached `MAJORITY_AGREE` / `FINISHED_WITH_RETURN`. | Keep consensus separate from business verdict. |
| Failure separation | PASS | `SOURCE_UNAVAILABLE` remains distinct from business `NO`; result-shopping simulation rejected. | None. |
| Challenge / lineage | PASS | Generation 0/1 lineage, supersession, evidence-root change, and bounded challenge proof are recorded. | None. |
| Finalization | PENDING TIME WINDOW | Fresh canonical read remains `CHALLENGEABLE`; read-only simulation returns `CHARTERLOCK:CHALLENGE_WINDOW_OPEN`, so no write was attempted. | Reconcile again only when the contract precondition permits. |
| Validator web availability | PARTIAL / TARGET-ENVIRONMENT LIMITATION | Two admissible public HTTPS fixtures reached consensus but both returned typed `SOURCE_UNAVAILABLE`; Studio-dev debug trace is not exposed. | Obtain target-environment web diagnostics or retain limitation. |
| Business YES/NO | NOT PROVEN | No retry or additional qualification case is permitted; available evidence did not produce a business verdict. | Do not relabel `INCONCLUSIVE`. |
| Frontend live read | PASS | Live canonical reads and network guard are qualified locally. | None. |
| Browser-wallet live write | PENDING MANUAL | No browser wallet surface was available during the Codex run. Manual guide and read-only diagnostic are prepared. | Operator performs the single bounded `create_charter` proof. |
| Local browser | PASS | Controlled Playwright and responsive visual checks are passing with zero observed console errors/overflow. | Repeat in release verification. |
| Exact-head GitHub CI | NOT YET RUN | No remote/push and no GitHub execution in this phase. | Push exact release head only after authorization. |
| Protected release | NOT YET DONE | No protected branch, tag, or GitHub release exists. | Configure and verify in release phase. |
| Vercel | NOT YET DONE | No production deployment or URL exists. | Deploy only after exact-head CI. |
| Production browser | NOT YET DONE | No production URL smoke or browser-wallet proof exists. | Run after READY deployment. |
| Submission freeze | NOT YET DONE | Production URL, release, and explorer consistency set remain open. | Freeze after production proof. |

## Prepared release sequence (not executed)

1. Push the exact release head.
2. Require contracts, security, frontend, integration, browser-e2e, and
   build/provenance jobs green at that exact head.
3. Verify remote `main` resolves to the reviewed commit.
4. Deploy Vercel production from that exact commit and require `READY`.
5. Verify the Vercel deployment commit linkage, HTTP routes, and production
   browser smoke.
6. Perform the manual browser-wallet qualification if still required.
7. Update factual proof, then create an annotated version tag and GitHub
   release only with separate authorization.
8. Complete the final provenance/submission consistency freeze.

No step in this sequence was executed during Phase 6C.

## Bundle follow-up

The pre-closure production bundle was approximately 944.67 kB minified /
229.57 kB gzip. The post-closure build is 947.38 kB minified / 230.37 kB
gzip, with the existing 2.83 kB ccip chunk and 31.15 kB CSS. The route
components currently share one `pages.tsx` module; a superficial lazy import
would not materially split it. No risky page decomposition was introduced in
this closure.
