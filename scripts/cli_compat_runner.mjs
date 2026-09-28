import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawn } from "node:child_process";

// genlayer 0.40.0-rc.3 documents a `str:` argument form but its bundled
// parser does not implement it. This runner keeps the exact installed CLI
// bundle and restores only that documented argument boundary in a sibling
// temporary bundle. No transaction retry logic is added here.
const cli = resolve(process.env.APPDATA ?? "", "npm", "node_modules", "genlayer", "dist", "index.js");
const source = readFileSync(cli, "utf8");
const needle = `function parseArg(value, previous = []) {\n  try {\n    const parsed = JSON.parse(value);\n    if (typeof parsed === "object" || Array.isArray(parsed)) {\n      return [...previous, coerceValue(parsed)];\n    }\n  } catch {\n  }\n  return [...previous, parseScalar(value)];\n}`;
const replacement = `function parseArg(value, previous = []) {\n  if (value.startsWith("str:")) return [...previous, value.slice(4)];\n  try {\n    const parsed = JSON.parse(value);\n    if (typeof parsed === "object" || Array.isArray(parsed)) {\n      return [...previous, coerceValue(parsed)];\n    }\n  } catch {\n  }\n  return [...previous, parseScalar(value)];\n}`;
if (!source.includes(needle)) throw new Error("expected genlayer 0.40.0-rc.3 parser was not found; refusing to run compatibility path");
const compat = resolve(dirname(cli), ".charterlock-cli-compat.mjs");
writeFileSync(compat, source.replace(needle, replacement), "utf8");

const child = spawn(process.execPath, [compat, ...process.argv.slice(2)], {
  cwd: process.cwd(),
  env: process.env,
  stdio: ["inherit", "pipe", "pipe"],
});
child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);
child.on("close", (code, signal) => { process.exitCode = code ?? (signal ? 1 : 0); });
