/* global process, console */
import { readFileSync } from "node:fs";
import { createClient } from "genlayer-js";
import { studioDevnet } from "genlayer-js/chains";

const [address, functionName, argsPath, feePath, sender] = process.argv.slice(2);
if (!address || !functionName || !argsPath || !feePath || !sender) throw new Error("usage: simulate_rejection.mjs <address> <method> <args-file> <fee-file> <sender>");
const args = JSON.parse(readFileSync(argsPath, "utf8"));
const estimate = JSON.parse(readFileSync(feePath, "utf8"));
const client = createClient({ chain: studioDevnet, endpoint: "https://studio-dev.genlayer.com/api" });
try {
  const result = await client.simulateWriteContract({
    address,
    functionName,
    args,
    account: { address: sender, type: "json-rpc" },
    includeReceipt: true,
    fees: { distribution: estimate.distribution, feeValue: estimate.feeValue },
  });
  console.log(JSON.stringify({ simulated: true, result: result.result ?? null, execution: result.txExecutionResultName ?? null }, null, 2));
  process.exitCode = 1;
} catch (error) {
  const text = error instanceof Error ? error.message : String(error);
  const code = text.match(/[A-Z][A-Z0-9_]{5,}/g)?.find((item) => /INVALID|ALREADY|ADJUDICATION|TRANSITION|FINAL/.test(item)) ?? null;
  console.log(JSON.stringify({ simulated: false, rejection_code: code, rejection_message: text.slice(0, 1000), broadcast: false }, null, 2));
}
