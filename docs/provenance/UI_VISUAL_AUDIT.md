# CharterLock UI visual audit

Date: 2026-09-29

## Phase 6B verification

The controlled visual capture was regenerated after the live-proof update at
all required widths: `1440x1000`, `768x1000`, `430x932`, and `390x844` across
14 routes. The capture reported `consoleErrorCount=0`, `runtimeErrorCount=0`,
`overflowCount=0`, and `unlabeledInputCount=0`. Scrollable table/code regions
remain intentionally contained; they did not create document-level overflow.
The screenshots and machine-readable result are in `artifacts/ui-audit/`.

## Scope

The interface was rebuilt around a calm, dense, dark-first product shell:

- 232px desktop navigation rail with subdued workspace and verification groups.
- Persistent location/context bar with network and LIVE/CONTROLLED posture.
- Dense tables, split panes, property lists, lifecycle rails, evidence ledgers,
  semantic fact matrices, resolution lineage, structured empty states, and
  purpose-built technical failure states.
- Responsive mobile navigation, stacked inspectors, readable fact matrices, and
  a six-state lifecycle grid that does not require horizontal scrolling.
- Controlled mode remains explicit and uses no live contract or wallet claim.

The primary visual reference was Linear's information architecture and density,
not its branding, copy, marks, or proprietary assets. CharterLock's visual
language uses graphite/navy surfaces, restrained borders, electric blue for
protocol emphasis, and reserved semantic colors for technical/business state.

## Captured routes and viewports

`frontend/scripts/capture_ui_audit.mjs` captured 14 routes at 1440x1000,
768x1000, 430x932, and 390x844: landing, dashboard, charter explorer, new charter,
charter detail, case explorer, case command center, evidence, resolution,
challenge, activity, proof, integrate, and docs.

The controlled capture produced 56 screenshots in `artifacts/ui-audit/` and
recorded zero console errors, zero runtime errors, zero document-level
horizontal overflow, and zero unlabeled inputs. Existing Playwright coverage
remains 12/12 across desktop, 430px, and 390px.

The live route sampling was intentionally read-only. It verified the live shell
and read-only proof/case surfaces, but broad sampling reached the Studio-dev
RPC's `30 requests per minute` limit. Those technical read failures are not
presented as UI defects or as live business verdicts. The prior targeted live
browser smoke remains the clean live proof: zero console errors and no core page
overflow. The `agent-browser` executable was unavailable, so the installed
Playwright runner was used as the browser verification fallback.

## Issues found and fixed

| Issue | Fix | Verification |
|---|---|---|
| Existing shell did not provide strong route orientation or a persistent product context. | Added location bar, navigation groups, network posture, live/controlled lockup, responsive bottom navigation, and collapsible desktop rail. | All captured routes expose a route label and mode/network context. |
| Generic card styling diluted protocol hierarchy. | Reworked surfaces into restrained panels, dense tables, inspectors, timelines, property rows, and structured empty/error states. | Visual inspection of landing, new charter, case command center, resolution, and proof screenshots. |
| Mobile lifecycle rail clipped challenge/final states. | Converted the six-step rail to a three-column mobile grid; retained horizontal overflow only for intentionally wide data tables. | 430px and 390px case command center screenshots; no document overflow. |
| Long hashes could force narrow layouts. | Added `overflow-wrap:anywhere` to code and retained copyable hash controls. | Charter/case screenshot inspection and overflow probe. |
| Controlled/live distinction could be missed. | Added explicit banner, sidebar mode lockup, network summary, and proof-page posture. | Controlled Playwright banner assertion and live smoke proof. |
| Loading/error UI was visually generic. | Added geometry-preserving skeletons and structured canonical-read failure messaging that states the UI did not substitute state. | Controlled route capture and existing component tests. |
| Semantic vector was presented as generic status content. | Added FACT / VALUE / EFFECT matrix with semantic markers and deterministic derivation explanation. | Resolution screenshot and component test coverage. |

## Accessibility and interaction checks

- Visible focus styles are defined for links, buttons, inputs, selects, and
  textareas.
- Form inputs are label-associated; the capture found zero unlabeled inputs.
- Navigation and actions use native links/buttons and remain keyboard reachable.
- Semantic states use text, glyphs, and color together; no state relies on color
  alone.
- Reduced-motion CSS disables transition/animation timing when requested.
- Copy controls provide explicit confirmation rather than silent clipboard use.
- Protocol actions do not optimistically claim success; confirmation occurs only
  after canonical readback through the existing transaction engine.

## Bundle review

Before the rebuild, the recorded production bundle was approximately:

- JavaScript: 941.01 kB minified.
- CSS: 23.54 kB minified.

The first production build after the rebuild measured:

- JavaScript: 944.40 kB minified, 229.46 kB gzip.
- CSS: 30.29 kB minified, 6.96 kB gzip.

The Vite warning about the single JavaScript chunk remains. No route-level
lazy loading was introduced in this closure pass because the existing routing
and live adapter behavior are stable and the visual rebuild is CSS/component
focused. A safe follow-up is to lazy-load documentation and integration routes,
then re-run the complete browser and transaction-state suite.

## Remaining visual limitations

- The controlled screenshot set is the clean, repeatable visual baseline;
  broad live screenshot sampling is rate-limited by Studio-dev.
- The flagship live case remains `CHALLENGEABLE`, so terminal-state UI is
  represented by controlled fixtures rather than fabricated live state.
## Phase 6C release-preparation pass

The controlled matrix was regenerated after the operator-facing LIVE wallet
diagnostic was added: 14 routes at 1440, 768, 430, and 390 pixels. The run
recorded zero console errors, zero runtime errors, zero document-level
horizontal overflow, and zero unlabeled inputs. A separate live `/proof` smoke
with a read-only injected-wallet stub confirmed the LIVE label, official
Studio-dev/61997 context, deployed address, and the diagnostic panel without
requesting approval.

The screenshot inspector found no new visual defect requiring a redesign. Hash
strings remain intentionally clipped/scrollable inside their field boundaries;
the document itself does not overflow. The command center and evidence views
retain dense mobile list geometry, while the proof view keeps the limitation
hierarchy visible.

Bundle follow-up: the pre-closure production bundle was approximately 944.67
kB minified / 229.57 kB gzip. The post-closure build is 947.38 kB minified /
230.37 kB gzip, plus the existing 2.83 kB ccip chunk and 31.15 kB CSS. A
route-level lazy import would not materially split the current single
`pages.tsx` module without a larger, riskier page decomposition, so no lazy
loading change was applied in this closure.
