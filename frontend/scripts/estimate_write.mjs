/* global process, console */
import { readFileSync, writeFileSync } from "node:fs";
import { createClient } from "genlayer-js";
import { studioDevnet } from "genlayer-js/chains";

const [address, functionName, argsPath, outputPath, sender] = process.argv.slice(2);
if (!address || !functionName || !argsPath || !outputPath) throw new Error("usage: estimate_write.mjs <address> <method> <args-file> <estimate-file> [sender]");
const args = JSON.parse(readFileSync(argsPath, "utf8"));
const client = createClient({ chain: studioDevnet, endpoint: "https://studio-dev.genlayer.com/api" });
const account = sender ? { address: sender, type: "json-rpc" } : undefined;
const estimate = await client.estimateTransactionFeesForWrite({ address, functionName, args, account });
const json = JSON.stringify(estimate, (_key, value) => typeof value === "bigint" ? value.toString() : value, 2);
writeFileSync(outputPath, `${json}\n`, "utf8");
console.log(json);
