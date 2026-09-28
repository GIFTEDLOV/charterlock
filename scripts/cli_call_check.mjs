import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawn } from "node:child_process";

const [contractAddress, method, argsPath] = process.argv.slice(2);
if (!contractAddress || !method || !argsPath) throw new Error("usage: cli_call_check.mjs <address> <method> <args-file>");
const args = JSON.parse(readFileSync(argsPath, "utf8"));
const childArgs = [resolve(process.cwd(), "scripts", "cli_compat_runner.mjs"), "call", contractAddress, method, "--rpc", "https://studio-dev.genlayer.com/api", "--args", ...args.map((value) => typeof value === "string" ? `str:${value}` : JSON.stringify(value))];
const child = spawn(process.execPath, childArgs, { cwd: resolve(process.cwd()), env: process.env, stdio: ["inherit", "pipe", "pipe"] });
child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);
child.on("close", (code) => { process.exitCode = code ?? 1; });
