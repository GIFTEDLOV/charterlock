/* global process, console */
import { readFileSync } from "node:fs";
import { createClient } from "genlayer-js";
import { studioDevnet } from "genlayer-js/chains";

const [address, functionName, argsPath, feePath, sender] = process.argv.slice(2);
if (!address || !functionName || !argsPath || !feePath) throw new Error("usage: simulate_write.mjs <address> <method> <args-file> <fee-file> [sender]");
const args = JSON.parse(readFileSync(argsPath, "utf8"));
const estimate = JSON.parse(readFileSync(feePath, "utf8"));
const client = createClient({ chain: studioDevnet, endpoint: "https://studio-dev.genlayer.com/api" });
const result = await client.simulateWriteContract({
  address,
  functionName,
  args,
  account: sender ? { address: sender, type: "json-rpc" } : undefined,
  includeReceipt: true,
  fees: { distribution: estimate.distribution, feeValue: estimate.feeValue },
});
console.log(JSON.stringify(result, (_key, value) => typeof value === "bigint" ? value.toString() : value, 2));
