# CharterLock UI V2 architecture audit

Phase 8B replaces the Phase 8A single-shell composition with three explicit frontend environments:

| Environment | Routes | Result |
| --- | --- | --- |
| Public website | `/`, `/proof`, `/integrate` | `PublicLayout` with public header/footer and no application sidebar |
| Operational application | `/app`, `/charters*`, `/cases*`, `/activity` | `AppLayout` with compact protocol sidebar, top bar, and mobile navigation |
| Documentation | `/docs` | `DocsLayout` with public header, documentation navigation, article, and outline |

## Visual passes

The local Playwright capture harness was run three times against the dev server at all requested routes and widths. Captures are outside Git at:

- `C:\Users\DELL\CharterLock-ui-v2-8b\pass1`
- `C:\Users\DELL\CharterLock-ui-v2-8b\pass2`
- `C:\Users\DELL\CharterLock-ui-v2-8b\pass3`

Pass 1 established the shell separation and exposed mobile hash wrapping plus documentation/layout overflow diagnostics. Pass 2 fixed long-value sizing and responsive documentation navigation. Pass 3 re-ran the full matrix.

Final pass results: 14 routes × 5 viewports, zero console errors, zero runtime errors, zero document-level horizontal overflow, and zero unlabeled form controls in the capture audit. The visual set includes 1440×1000, 1024×900, 768×1024, 430×932, and 390×844.

The requested `agent-browser` executable was not available in the local environment. Playwright was used as the repository-native browser verification fallback; screenshots were visually inspected from the final pass.

## Rejection checks

- Public landing, proof, and integrate routes do not render `AppSidebar`.
- `/docs` does not render `AppSidebar` and uses a documentation shell.
- No permanent `NETWORK GUARD ACTIVE` or wallet mismatch banner is mounted.
- Wallet/network status is quiet in the application shell and contextual write messaging remains opt-in.
- Tables render directly on the application surface rather than inside a universal card wrapper.
- Public proof is structured as release transparency; docs is structured as an article; the case view is a command center.
- Mobile application navigation is a separate bottom navigation component; public mobile navigation has no sidebar.
- Controlled fixtures remain visibly controlled, and canonical adapter reads are not replaced by local UI state.

## Architecture and performance

Routing now selects `PublicLayout`, `AppLayout`, or `DocsLayout` explicitly. Route modules use `React.lazy` and separate public, overview, charter, case, activity, and docs chunks. The build still reports a vendor/runtime chunk warning from the pinned GenLayer/React dependency graph, but route code is split and the initial application entry is materially smaller than the Phase 8A monolith.

## Accessibility and interaction

The final capture matrix found no unlabeled inputs or selects. Buttons and links retain visible focus styling, semantic status is communicated by text in addition to color, long hashes truncate with copy affordances, and reduced-motion preferences are honored. Existing controlled transaction labels and canonical readback behavior remain intact; Playwright remains the behavioral gate.

## Remaining visual limitations

The local browser harness does not provide a real injected wallet session, so no browser-wallet write is claimed. Live Studio-dev validator web availability remains a protocol limitation documented by the frozen v1 proof. These are provenance limitations, not visual regressions.
