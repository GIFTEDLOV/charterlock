# CharterLock Phase 3 frontend provenance

- Project: CharterLock Protocol
- Schema: `BINARY_EVENT_V1`
- Contract source SHA-256: `7cbf394642bfc4a4d626888b0601c12c7d53568f99e51244a14632869083c0b1`
- Current phase: pre-deployment / controlled proof
- Network target: Studio-dev
- Chain ID: `61997`
- GenLayer Python family: `genlayer-py 0.19.0rc2`
- GenLayer CLI: `0.40.0-rc.3`
- GenVM: `v0.6.0-rc2`
- GenLayer JS: `genlayer-js 1.1.8`
- React: `19.3.0`
- Vite: `8.3.1`
- TypeScript: `5.9.3` (selected because the pinned typescript-eslint release does not support TypeScript 7)
- Vitest: `5.0.2`
- Playwright: `1.55.1` (pinned; the direct CLI is used because the wrapper resolved duplicate test instances in this Windows/pnpm environment)
- Deployment address: not deployed
- Deployment transaction: not deployed
- Live qualification: not performed

The frontend has two adapters behind one protocol interface. The live adapter
uses the actual public method names and `genlayer-js` schema-driven calldata.
The controlled adapter persists fixture state under an explicit local-storage
namespace and is labeled `CONTROLLED DEMO / TEST MODE` in the application.
