import { readFileSync, writeFileSync } from "node:fs";
import { createClient } from "genlayer-js";
import { studioDevnet } from "genlayer-js/chains";

const [statePath, hash] = process.argv.slice(2);
if (!statePath || !hash) throw new Error("usage: reconcile_live_tx.mjs <state-json> <hash>");

const client = createClient({ chain: studioDevnet, endpoint: "https://studio-dev.genlayer.com/api" });
const tx = await client.waitForFinalization({ hash, fullTransaction: true });
const execution = tx.txExecutionResultName ?? tx.execution_result ?? tx.result_name ?? null;
const finalStatus = tx.statusName ?? tx.consensusStatus ?? tx.lifecycle?.state ?? null;
const returnValue = tx.value ?? tx.return_value ?? tx.data?.return_value ?? tx.result ?? null;
const summary = {
  transaction_hash: hash,
  status: finalStatus,
  execution_result: execution,
  return_value: typeof returnValue === "bigint" ? returnValue.toString() : returnValue,
  contract_address: tx.data?.contract_address ?? tx.contract_address ?? null,
  fee_value: tx.data?.fee_value ?? tx.fee_value ?? tx.fees?.deposit ?? null,
  fees: tx.fees ?? null,
};
const old = JSON.parse(readFileSync(statePath, "utf8"));
const next = {
  ...old,
  status: finalStatus ?? old.status,
  final_status: finalStatus,
  execution_result: execution,
  return_value: summary.return_value,
  fee_consumed: tx.fees?.consumed ?? tx.fees?.consumed_total ?? old.fee_consumed ?? null,
  reconciled_same_hash: true,
  reconciliation_timestamp: new Date().toISOString(),
};
writeFileSync(statePath, `${JSON.stringify(next, (_key, value) => typeof value === "bigint" ? value.toString() : value, 2)}\n`, "utf8");
console.log(JSON.stringify(summary, (_key, value) => typeof value === "bigint" ? value.toString() : value, 2));
