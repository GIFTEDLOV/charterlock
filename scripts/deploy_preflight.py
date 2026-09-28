"""Read-only CharterLock deployment preflight.

This command intentionally has no broadcast implementation. A non-dry-run
invocation fails closed so the release audit cannot accidentally become a live
deployment.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import sys
import urllib.request
from pathlib import Path


EXPECTED_CHAIN_ID = 61997
EXPECTED_SOURCE_SHA256 = "323fcf4a694d8b4070b043078b316055f090a643a6fdfb987afa5b9f2f7d3e45"
EXPECTED_METHODS = {
    "add_authority_rule",
    "add_evidence",
    "adjudicate",
    "challenge",
    "contract_info",
    "create_charter",
    "finalize_case",
    "freeze_charter",
    "get_case",
    "get_case_count",
    "get_case_ids",
    "get_charter",
    "get_charter_count",
    "get_charter_ids",
    "get_evidence",
    "get_evidence_ids",
    "get_resolution",
    "get_resolution_history",
    "open_case",
    "readjudicate",
    "seal_evidence",
}


def rpc_chain_id(rpc_url: str) -> int:
    request = urllib.request.Request(
        rpc_url,
        data=json.dumps(
            {"jsonrpc": "2.0", "id": 1, "method": "eth_chainId", "params": []}
        ).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "User-Agent": "CharterLock-preflight/0.1",
        },
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=15) as response:
        payload = json.load(response)
    if payload.get("error") is not None or not isinstance(payload.get("result"), str):
        raise RuntimeError(f"chain-id RPC failed: {payload}")
    return int(payload["result"], 16)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true", help="required; never broadcasts")
    parser.add_argument("--rpc-url", default="https://studio-dev.genlayer.com/api")
    parser.add_argument("--source", type=Path, default=Path("contracts/charter_lock.py"))
    parser.add_argument(
        "--schema", type=Path, default=Path("docs/provenance/charterlock.schema.json")
    )
    args = parser.parse_args()
    if not args.dry_run:
        print("REFUSED: only --dry-run is implemented; broadcast is not available.")
        return 2

    source_bytes = args.source.read_bytes()
    source_sha = hashlib.sha256(source_bytes).hexdigest()
    if source_sha != EXPECTED_SOURCE_SHA256:
        print(f"FAIL source_sha256={source_sha} expected={EXPECTED_SOURCE_SHA256}")
        return 1
    schema = json.loads(args.schema.read_text(encoding="utf-8"))
    methods = set(schema.get("methods", {}))
    if methods != EXPECTED_METHODS:
        print(f"FAIL schema_methods={len(methods)} expected={len(EXPECTED_METHODS)}")
        return 1
    chain_id = rpc_chain_id(args.rpc_url)
    if chain_id != EXPECTED_CHAIN_ID:
        print(f"FAIL chain_id={chain_id} expected={EXPECTED_CHAIN_ID}")
        return 1

    try:
        head = subprocess.check_output(
            ["git", "rev-parse", "HEAD"], text=True, stderr=subprocess.STDOUT
        ).strip()
    except subprocess.CalledProcessError as exc:
        print(f"FAIL git_head={exc.output.strip()}")
        return 1

    print("DRY_RUN=PASS")
    print(f"SOURCE_SHA256={source_sha}")
    print(f"SCHEMA_METHOD_COUNT={len(methods)}")
    print(f"CHAIN_ID={chain_id}")
    print(f"GIT_HEAD={head}")
    print("DEPLOYER_READBACK=NOT PERFORMED (no deployer configured)")
    print("BALANCE_PREFLIGHT=NOT PERFORMED (no deployer configured)")
    print("NONCE_PREFLIGHT=NOT PERFORMED (no deployer configured)")
    print("FEE_PREFLIGHT=NOT PERFORMED (no deployer configured)")
    print("BROADCAST=NOT ATTEMPTED")
    print("HASH_PERSISTENCE=NOT ENTERED")
    print("FINALITY=NOT ENTERED")
    print("EXECUTION_RESULT=NOT ENTERED")
    print("CONTRACT_ADDRESS=NOT DEPLOYED")
    print("SCHEMA_READBACK=LOCAL ARTIFACT ONLY")
    print("CONTRACT_INFO_READBACK=NOT ENTERED")
    print("SOURCE_PARITY=NOT ENTERED")
    return 0


if __name__ == "__main__":
    sys.exit(main())
