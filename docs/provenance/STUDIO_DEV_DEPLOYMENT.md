# CharterLock Studio-dev deployment

This record describes the single authorized deployment of the frozen
CharterLock release candidate. No second deployment was attempted.

## Release identity

- Git commit: `6d2a823e834e953bf42fba102aeb9487a9728d5c`
- Contract: `contracts/charter_lock.py`
- Contract SHA-256: `70ca83b07e5c646d90d61d97f2a8828c4541dc955f0758eea0252e0905a1757a`
- Deployment bytes: 55,739 UTF-8 bytes, LF checkout, no BOM
- Network: Studio-dev
- Chain ID: `61997`
- RPC: `https://studio-dev.genlayer.com/api`

## Toolchain

- GenLayer CLI: `0.40.0-rc.3`
- `genlayer-py`: `0.19.0rc2`
- `genlayer-test`: `0.30.0rc2`
- GenVM target: `v0.6.0-rc2`
- `genlayer-js`: `2.0.0-rc.1`
- JavaScript chain configuration: official `studioDevnet` export
- Python executable: `C:\Users\DELL\CharterLock\.venv\Scripts\python.exe`

## Network and fee preflight

The read-only preflight resolved Studio-dev and chain `61997`. The configured
deployer address was read without exposing wallet material:
`0x61f10cc252ed98ce7596c73fc557cca4cc600c82`.

Before deployment, the balance was `0.216017678799992758 GEN`; latest and
pending nonce were both `68`. The v0.6 fee policy was enabled with leader
allocation `100`, validator allocation `200`, appeal rounds `0`, execution
budget `25000000000000000`, message fees `0`, rotations `[3]`, maximum GEN
price `2`, and storage/receipt caps `300000000`.

The deployment estimate produced protocol `feeValue=100000000000010352` and
contract value `0`. The estimate was not hand-invented. The finalized
deployment consumed `79066250001058` and refunded `99920933750009294`.

## Deployment transaction

- Broadcast count: `1`
- Transaction: `0x6a2f52cb7eb781b2e74fcc9cd73031e4633bffb591532d3f573ce960d305b721`
- Final lifecycle status: `FINALIZED`
- Execution result: `FINISHED_WITH_RETURN`
- Contract address: `0xa79C6437Aad95F5A487373d5e1673DC5bC301be8`
- Hash persistence: the exact hash was recovered from a read-only transaction
  lookup after the CLI wrapper failed to print its label; no rebroadcast was
  made.

The deployed code readback was 55,739 bytes and hashed to the authorized
contract SHA-256. Source parity is therefore `VERIFIED`.

## Initial canonical readback

- `contract_info`: works
- `get_charter_count`: `0`
- `get_case_count`: `0`
- deployed public methods: `21` (`11` views, `10` writes)

One earlier parser-incompatible create attempt was finalized with
`FINISHED_WITH_ERROR` / `INVALID_SCHEMA_VERSION` before any charter existed.
It was recorded and not retried blindly. The successful qualification began
with the separate, correctly encoded create transaction documented in
`LIVE_QUALIFICATION.md`.
