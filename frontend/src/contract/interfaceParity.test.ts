import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { PUBLIC_METHODS } from "./abi";
import { buildActionArgs } from "./liveAdapter";
import type { ProtocolAction } from "../domain/types";

const workspaceRoot = existsSync(resolve(process.cwd(), "docs/provenance/charterlock.schema.json")) ? process.cwd() : resolve(process.cwd(), "..");
const schema = JSON.parse(readFileSync(resolve(workspaceRoot, "docs/provenance/charterlock.schema.json"), "utf8")) as {
  methods: Record<string, { params: [string, string][]; readonly: boolean; payable?: boolean; ret: unknown }>;
};

const actions: Array<{ action: ProtocolAction; method: string; expected: unknown[] }> = [
  {
    method: "create_charter",
    action: { type: "create_charter", payload: { schema_version: "BINARY_EVENT_V1", domain: "events", question: "Did it happen?", allowed_outcomes: " YES, NO ", event_deadline: 100, evidence_deadline: 200, temporal_semantics: "OCCURRENCE_BY_DEADLINE", authority_policy: "REGISTERED_AUTHORITY_REQUIRED", source_policy: "BOUND_HOSTNAME_AND_PATH", min_corroboration: 1, conflict_policy: "CONFLICT_INCONCLUSIVE", unavailable_source_policy: "UNAVAILABLE_INCONCLUSIVE", challenge_window_seconds: 100, max_challenge_generations: 2 } },
    expected: ["BINARY_EVENT_V1", "events", "Did it happen?", '["YES","NO"]', 100, 200, "OCCURRENCE_BY_DEADLINE", "REGISTERED_AUTHORITY_REQUIRED", "BOUND_HOSTNAME_AND_PATH", 1, "CONFLICT_INCONCLUSIVE", "UNAVAILABLE_INCONCLUSIVE", 100, 2],
  },
  { method: "open_case", action: { type: "open_case", charterId: "CHR-00000009" }, expected: ["CHR-00000009"] },
  {
    method: "add_evidence",
    action: { type: "add_evidence", caseId: "CASE-00000009", payload: { authority_id: "official-record", source_url: "https://www.iana.org/help/example-domains", content_sha256: `0X${"A".repeat(64)}`, content_byte_length: 10, observed_at: 100, published_at: 90 } },
    expected: ["CASE-00000009", "official-record", "https://www.iana.org/help/example-domains", "a".repeat(64), 10, 100, 90],
  },
];

const expectedParams: Record<string, [string, string][]> = {
  create_charter: [["schema_version", "string"], ["domain", "string"], ["question", "string"], ["allowed_outcomes", "string"], ["event_deadline", "int"], ["evidence_deadline", "int"], ["temporal_semantics", "string"], ["authority_policy", "string"], ["source_policy", "string"], ["min_corroboration", "int"], ["conflict_policy", "string"], ["unavailable_source_policy", "string"], ["challenge_window_seconds", "int"], ["max_challenge_generations", "int"]],
  open_case: [["charter_id", "string"]],
  add_evidence: [["case_id", "string"], ["authority_id", "string"], ["source_url", "string"], ["content_sha256", "string"], ["content_byte_length", "int"], ["observed_at", "int"], ["published_at", "int"]],
};

describe("submitted contract interface parity", () => {
  it("binds the public method list to the current schema", () => {
    expect([...PUBLIC_METHODS].sort()).toEqual(Object.keys(schema.methods).sort());
  });

  it.each(actions)("serializes $method with the schema argument order", ({ action, method, expected }) => {
    const definition = schema.methods[method];
    expect(definition).toBeDefined();
    expect(definition.params).toEqual(expectedParams[method]);
    expect(definition.readonly).toBe(false);
    expect(definition.payable ?? false).toBe(false);
    expect(definition.params.length).toBe(expected.length);
    expect(buildActionArgs(action)).toEqual(expected);
  });

  it("keeps the write return assumptions from the schema", () => {
    expect(schema.methods.create_charter.ret).toBe("string");
    expect(schema.methods.open_case.ret).toBe("string");
    expect(schema.methods.add_evidence.ret).toBe("string");
  });
});
