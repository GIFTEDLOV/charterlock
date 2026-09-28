# CharterLock Protocol frontend

This is the reviewer-facing React/Vite application for CharterLock Protocol.
It exposes the canonical lifecycle:

`create charter → bind authorities → freeze → open case → commit evidence → seal → adjudicate → challenge → readjudicate → finalize → prove`

The default build uses `VITE_CHARTERLOCK_MODE=demo`, a clearly labeled,
stateful controlled adapter for local review and Playwright. It does not invent
a wallet, deployed address, live transaction hash, or Studio-dev state. Set
`VITE_CHARTERLOCK_MODE=live` and provide an explicit
`VITE_CHARTERLOCK_CONTRACT_ADDRESS` only after a deployment is authorized.

## Commands

```text
pnpm dev
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm e2e
```

The live adapter uses the inspected and pinned `genlayer-js 1.1.8` API. The
SDK's built-in `studionet` is chain 61999, so CharterLock creates an explicit
61997 Studio-dev chain configuration and blocks writes on any mismatch.

The transaction engine persists the exact hash immediately after broadcast,
reconciles that same hash after refresh or RPC delay, checks execution result,
and confirms only after canonical postcondition readback. It never rebroadcasts
because polling timed out.

Routes include landing, dashboard, charter builder/detail, case explorer,
command center, evidence ledger, resolution proof, challenge workflow, activity,
provenance, integration, and documentation.
