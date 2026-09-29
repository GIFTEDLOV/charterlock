# Browser-wallet qualification guide

This is a manual, bounded qualification of the existing CharterLock frontend.
It is not a deployment and it is not part of the canonical evidence cases.
The operator must perform the wallet approval in a normal browser session.
The application must never receive a private key, mnemonic, seed phrase, or
wallet password.

## Locked target

- Mode: `LIVE`
- Network: `Studio-dev`
- Chain ID: `61997`
- Contract: `0xa79C6437Aad95F5A487373d5e1673DC5bC301be8`
- SDK: `genlayer-js 2.0.0-rc.1`
- Chain definition: official `studioDevnet`
- Write: one `create_charter`, labelled `BROWSER WALLET QUALIFICATION`

## Operator procedure

1. Open the local frontend in a normal browser with the Studio-dev live
   environment loaded.
2. Connect the browser wallet. Approve only the account connection if the
   wallet asks; do not disclose wallet secrets.
3. Verify in the wallet and in the LIVE diagnostic panel that the network is
   Studio-dev and the chain is `61997`.
4. Verify the displayed contract address matches the locked target above.
5. Open `Charters / New charter` and use a clearly labelled qualification
   question/domain such as `BROWSER WALLET QUALIFICATION`. Do not use the
   existing `CHR-00000001` or `CHR-00000002` cases.
6. Confirm the application has completed its canonical precondition read,
   then activate the single `create_charter` action.
7. Approve that one wallet transaction. Do not approve a replacement or a
   duplicate if the browser pauses.
8. Capture the exact submitted transaction hash from the diagnostic panel and
   browser wallet.
9. Confirm that the hash is persisted before waiting for finalization. If the
   browser or RPC pauses, reconcile that same hash; never rebroadcast.
10. Wait for a finalized lifecycle status, then confirm the GenLayer execution
    result is successful. `FINALIZED` without successful execution is not
    success.
11. Confirm canonical readback of the newly created charter, including its
    returned charter ID and frozen source/network context.
12. Record the account, chain, contract, hash, final status, execution result,
    charter ID, readback timestamp, and any limitation in the release
    provenance. Do not record secrets.

## Required progress evidence

The frontend transaction engine must show this sequence for the same hash:

`PRECONDITION_READ` → `AWAITING_WALLET` → `BROADCAST` → `HASH_PERSISTED` →
`RECONCILING` → `FINALIZED` → `EXECUTION_CHECK` → `CANONICAL_READBACK` →
`CONFIRMED`

If no injected wallet is available, record
`BROWSER_WALLET_WRITE_STATUS=BLOCKED` with the exact environment reason. A
controlled Playwright run or an SDK/CLI write is not browser-wallet proof.
