/* global process, console */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "genlayer-js";
import { studioDevnet } from "genlayer-js/chains";

const [label, address, method, argsPath, feePath, sender] = process.argv.slice(2);
if (!label || !address || !method || !argsPath || !feePath || !sender) {
  throw new Error("usage: live_write_sdk_once.mjs <label> <address> <method> <args-file> <fee-file> <sender>");
}
const args = JSON.parse(readFileSync(argsPath, "utf8"));
const fees = JSON.parse(readFileSync(feePath, "utf8"));
const root = resolve(process.cwd(), "docs", "provenance", "live-transactions");
mkdirSync(root, { recursive: true });
const statePath = resolve(root, `${label}.json`);
const base = { label, network: "studio-dev", chain_id: 61997, rpc: "https://studio-dev.genlayer.com/api", contract_address: address, method, args, fee_estimate: fees, sender, status: "PREPARED", broadcast_count: 0 };
writeFileSync(statePath, `${JSON.stringify(base, null, 2)}\n`, "utf8");

const client = createClient({
  chain: studioDevnet,
  endpoint: "https://studio-dev.genlayer.com/api",
  account: { address: sender, type: "json-rpc" },
});
const hash = await client.writeContract({
  account: { address: sender, type: "json-rpc" },
  address,
  functionName: method,
  args,
  fees: { distribution: fees.distribution, feeValue: fees.feeValue },
});
const state = { ...base, status: "PENDING", broadcast_count: 1, transaction_hash: hash, broadcast_timestamp: new Date().toISOString(), persisted_immediately: true };
writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
console.log(`PERSISTED_TX_HASH=${hash}`);
console.log(`PERSISTED_STATE=${statePath}`);
