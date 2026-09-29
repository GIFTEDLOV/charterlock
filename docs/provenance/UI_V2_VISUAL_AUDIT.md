# CharterLock UI V2 Visual Audit

Date: 2026-09-29  
Branch: `ui/charterlock-v1.1`  
Release scope: frontend-only, based on frozen CharterLock v1.0.0

## Design direction

The interface was rebuilt as a dark institutional adjudication console. The primary reference was the current Linear application’s hierarchy, density, and subdued navigation. Vercel Dashboard informed deployment/proof metadata layouts, while Stripe Dashboard informed form hierarchy, validation affordances, and dense operational tables. No proprietary logos, artwork, or copy were used.

The new system uses a quiet graphite shell, a 224px desktop sidebar, 48px location bar, restrained borders, monospace identity values, compact status text, and semantic colors only for protocol state. The case command center, evidence ledger, semantic fact matrix, resolution lineage, and proof console are structured data views rather than generic card grids.

## Coverage

Routes captured in each pass:

`/`, `/app`, `/charters`, `/charters/new`, `/charters/CHR-00000001`, `/cases`, `/cases/CASE-00000001`, `/cases/CASE-00000001/evidence`, `/cases/CASE-00000001/resolution`, `/cases/CASE-00000001/challenge`, `/activity`, `/proof`, `/integrate`, `/docs`

Viewports captured for every route:

`1440x1000`, `768x1000`, `430x932`, `390x844`

Each pass contains 56 screenshots. Generated screenshots and the machine-readable browser summary were preserved outside Git at:

`C:\Users\DELL\CharterLock-ui-v2-audit\first-pass`  
`C:\Users\DELL\CharterLock-ui-v2-audit\second-pass`

The capture runner also wrote the latest local summary to `artifacts/ui-audit/ui-audit-results.json` during verification. The artifact is not release source and is not used as canonical protocol state.

## First pass

The first pass found three objective issues:

1. The controlled create/freeze/case flow did not navigate after canonical transaction confirmation, so the existing browser contract could not continue through the fixture workflow.
2. The controlled evidence and challenge pages did not expose the explicit postcondition labels used by the existing E2E contract (`EVID-00000003`, `Sealed`, `Challenge accepted for readjudication`, `Readjudication complete`, and `Final resolution`).
3. The `/integrate` property inspector produced a small desktop document overflow from a long hash value.

## Fixes

The flow now navigates only from `TransactionButton` confirmation callbacks, keeps the transaction engine unchanged, and exposes explicit controlled confirmation states. The integration inspector now clips long identity values within its property column, while the document viewport remains stable. The shell also hides sidebar intrinsic overflow on narrow screens without changing the table’s internal data inspection behavior.

## Second pass

The second pass was rerun after the fixes.

| Check | Result |
| --- | --- |
| Screenshots | 56 / 56 routes and viewports |
| Console errors | 0 |
| Runtime errors | 0 |
| Document-level horizontal overflow | 0 |
| Unlabeled inputs/selects/textareas | 0 |
| Existing controlled Playwright suite | 12 / 12 |
| Frontend unit tests | 57 / 57 |
| TypeScript | PASS |
| ESLint | PASS |
| Production build | PASS |

The browser probe reports some intentionally scrollable internal elements (data tables, code samples, and long monospace values). These do not increase document `scrollWidth`; they are contained inspection surfaces with truncation/copy affordances.

## Accessibility and interaction review

- Visible `:focus-visible` treatment is defined for links, controls, and form fields.
- Labels are attached to all form controls in the audited routes; the automated capture found zero unlabeled controls.
- Status is conveyed with text and not color alone.
- Reduced-motion preferences disable transitions and animations.
- Tables preserve semantic headers and rows on desktop; dense data surfaces remain contained on narrow screens.
- Transaction actions expose progress through the existing state-machine engine and only show success after canonical readback.
- Controlled mode remains explicitly labeled and is not presented as live protocol truth.

## Remaining visual issues

No release-blocking visual issues remained after the second pass. The intentionally compact mobile navigation uses a narrow persistent rail; this is the compact-navigation variant of the design rather than a separate bottom bar. Long hashes remain internally scrollable/truncated with copy affordances by design.

## Performance note

The production build remains a single primary application chunk because the current route module is intentionally shared. The rebuilt bundle is smaller than the v1 baseline, but route-level lazy loading was not introduced: splitting this one large module without first separating page modules would add risk without a reliable material improvement. This is an explicit v1.1 follow-up candidate, not a protocol or UI correctness defect.
