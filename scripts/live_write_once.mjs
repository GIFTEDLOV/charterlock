import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { resolve } from "node:path";

// Intentionally performs one CLI invocation only. It never retries or
// substitutes a transaction after a timeout or an uncertain result.
const [label, contractAddress, method, argsPath, feePath] = process.argv.slice(2);
if (!label || !contractAddress || !method || !argsPath || !feePath) {
  throw new Error("usage: live_write_once.mjs <label> <address> <method> <args-file> <fee-file>");
}

const args = JSON.parse(readFileSync(argsPath, "utf8"));
const fees = JSON.parse(readFileSync(feePath, "utf8"));
if (!Array.isArray(args) || typeof fees !== "object" || fees === null) {
  throw new Error("invalid args or fee JSON");
}

const root = resolve(process.cwd(), "docs", "provenance", "live-transactions");
mkdirSync(root, { recursive: true });
const statePath = resolve(root, `${label}.json`);
const base = {
  label,
  network: "studio-dev",
  chain_id: 61997,
  rpc: "https://studio-dev.genlayer.com/api",
  contract_address: contractAddress,
  method,
  args,
  fee_estimate: fees,
  status: "PREPARED",
  broadcast_count: 0,
};
writeFileSync(statePath, `${JSON.stringify(base, null, 2)}\n`, "utf8");

const childArgs = [
  resolve(process.cwd(), "scripts", "cli_compat_runner.mjs"),
  "write",
  contractAddress,
  method,
  "--rpc",
  "https://studio-dev.genlayer.com/api",
  "--wallet",
  "keystore",
  "--fees",
  JSON.stringify(fees),
  "--args",
  ...args.map((value) => typeof value === "string" ? `str:${value}` : JSON.stringify(value)),
];

const child = spawn(process.execPath, childArgs, {
  cwd: resolve(process.cwd()),
  env: process.env,
  stdio: ["inherit", "pipe", "pipe"],
});

let buffer = "";
let persisted = false;
const consume = (chunk) => {
  const text = chunk.toString();
  process.stdout.write(text);
  buffer = `${buffer}${text}`.slice(-20000);
  if (!persisted) {
    const match = buffer.match(/(?:Write|Deployment)\s+Transaction\s+Hash\s*:\s*(0x[0-9a-fA-F]{64})/i);
    if (match) {
      const state = {
        ...base,
        status: "PENDING",
        broadcast_count: 1,
        transaction_hash: match[1],
        broadcast_timestamp: new Date().toISOString(),
        persisted_immediately: true,
      };
      writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
      persisted = true;
      process.stdout.write(`\nPERSISTED_TX_HASH=${match[1]}\nPERSISTED_STATE=${statePath}\n`);
    }
  }
};
child.stdout.on("data", consume);
child.stderr.on("data", consume);
child.on("error", (error) => { throw error; });
child.on("close", (code, signal) => {
  if (!persisted) {
    const state = { ...base, status: "HASH_NOT_OBSERVED", broadcast_count: 0 };
    writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
    process.stderr.write("TRANSACTION_HASH_NOT_OBSERVED; do not rebroadcast; reconcile externally\n");
    process.exitCode = 2;
    return;
  }
  process.exitCode = code ?? (signal ? 1 : 0);
});
