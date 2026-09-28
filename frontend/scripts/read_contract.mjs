/* global process, console */
import { readFileSync } from "node:fs";
import { createClient } from "genlayer-js";
import { studioDevnet } from "genlayer-js/chains";

const [address, functionName, argsPath] = process.argv.slice(2);
if (!address || !functionName || !argsPath) throw new Error("usage: read_contract.mjs <address> <method> <args-file>");
const args = JSON.parse(readFileSync(argsPath, "utf8"));
const client = createClient({ chain: studioDevnet, endpoint: "https://studio-dev.genlayer.com/api" });
const result = await client.readContract({ address, functionName, args });
console.log(JSON.stringify(result, (_key, value) => typeof value === "bigint" ? value.toString() : value, 2));
