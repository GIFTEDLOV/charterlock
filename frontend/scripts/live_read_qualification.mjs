/* global process, console */
import { writeFileSync } from "node:fs";
import { createClient } from "genlayer-js";
import { studioDevnet } from "genlayer-js/chains";

const [address, charterId, caseId, outputPath] = process.argv.slice(2);
if (!address || !charterId || !caseId || !outputPath) throw new Error("usage: live_read_qualification.mjs <address> <charter-id> <case-id> <output-json>");
if (studioDevnet.id !== 61997 || studioDevnet.rpcUrls.default.http[0] !== "https://studio-dev.genlayer.com/api") throw new Error("OFFICIAL_STUDIO_DEVNET_MISMATCH");
const client = createClient({ chain: studioDevnet, endpoint: "https://studio-dev.genlayer.com/api" });
const read = (functionName, args = []) => client.readContract({ address, functionName, args });
const charter = await read("get_charter", [charterId]);
const item = await read("get_case", [caseId]);
const evidenceIds = await read("get_evidence_ids", [caseId]);
const evidence = [];
for (const id of evidenceIds) evidence.push(await read("get_evidence", [id]));
const history = await read("get_resolution_history", [caseId]);
const result = {
  official_studio_devnet: { id: studioDevnet.id, rpc: studioDevnet.rpcUrls.default.http[0] },
  contract_address: address,
  contract_info: await read("contract_info"),
  charter_count: await read("get_charter_count"),
  case_count: await read("get_case_count"),
  charter,
  case: item,
  evidence,
  resolution_history: history,
};
writeFileSync(outputPath, `${JSON.stringify(result, (_key, value) => typeof value === "bigint" ? value.toString() : value, 2)}\n`, "utf8");
console.log(JSON.stringify({
  official_studio_devnet: result.official_studio_devnet,
  contract_address: address,
  charter_count: result.charter_count,
  case_count: result.case_count,
  charter_state: charter.state,
  case_state: item.state,
  evidence_count: evidence.length,
  resolution_generations: history.map((entry) => entry.generation),
  output: outputPath,
}, null, 2));
