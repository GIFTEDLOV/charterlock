import { spawnSync } from "node:child_process";
const value = "[\"YES\",\"NO\"]";
for (const candidate of [value, JSON.stringify(value), '"\\u005b\\u0022YES\\u0022,\\u0022NO\\u0022\\u005d"']) {
  const r = spawnSync(process.execPath, ["-e", "console.log(JSON.stringify(process.argv.slice(1)))", "--", candidate], { encoding: "utf8" });
  console.log(JSON.stringify({ candidate, child: r.stdout.trim() }));
}
