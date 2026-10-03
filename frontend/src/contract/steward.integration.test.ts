import { beforeEach, describe, expect, it } from "vitest";
import { ControlledDemoAdapter } from "./demoAdapter";
import { buildActionArgs } from "./liveAdapter";
import type { ProtocolAction } from "../domain/types";
import { executeTransaction } from "../transactions/engine";

describe("steward cross-component contract workflow", () => {
  beforeEach(() => localStorage.clear());

  it("creates a charter, opens its canonical case, and submits evidence to that case", async () => {
    const state = new ControlledDemoAdapter();
    const calls: Array<{ method: string; args: unknown[] }> = [];
    const write = async (action: ProtocolAction, method: string) => {
      const args = buildActionArgs(action);
      calls.push({ method, args });
      return executeTransaction(state, action, method, undefined);
    };

    const charterAction: ProtocolAction = { type: "create_charter", payload: { schema_version: "BINARY_EVENT_V1", domain: "events", question: "Did the event happen?", allowed_outcomes: " APPROVED, REJECTED ".replace("APPROVED, REJECTED", "YES, NO"), event_deadline: 1_800_000_000, evidence_deadline: 1_800_100_000, temporal_semantics: "OCCURRENCE_BY_DEADLINE", authority_policy: "REGISTERED_AUTHORITY_REQUIRED", source_policy: "BOUND_HOSTNAME_AND_PATH", min_corroboration: 1, conflict_policy: "CONFLICT_INCONCLUSIVE", unavailable_source_policy: "UNAVAILABLE_INCONCLUSIVE", challenge_window_seconds: 100, max_challenge_generations: 2 } };
    const charterTx = await write(charterAction, "create_charter");
    expect(calls[0]).toEqual({ method: "create_charter", args: ["BINARY_EVENT_V1", "events", "Did the event happen?", '["YES","NO"]', 1_800_000_000, 1_800_100_000, "OCCURRENCE_BY_DEADLINE", "REGISTERED_AUTHORITY_REQUIRED", "BOUND_HOSTNAME_AND_PATH", 1, "CONFLICT_INCONCLUSIVE", "UNAVAILABLE_INCONCLUSIVE", 100, 2] });
    expect(charterTx.canonicalId).toBeTruthy();
    const charterId = charterTx.canonicalId!;
    expect((await state.getCharter(charterId)).allowed_outcomes).toEqual(["YES", "NO"]);

    await write({ type: "add_authority_rule", charterId, payload: { authority_id: "official-record", authority_class: "OFFICIAL", hostname: "www.iana.org", path_prefix: "/help/", subject: "Authoritative public record", priority: 10 } }, "add_authority_rule");
    await write({ type: "freeze_charter", charterId }, "freeze_charter");
    const caseTx = await write({ type: "open_case", charterId }, "open_case");
    const caseId = caseTx.canonicalId!;
    expect(caseId).toMatch(/^CASE-/);
    expect(`/cases/${caseId}`).toBe(`/cases/${(await state.getCase(caseId)).case_id}`);
    expect((await state.getCase(caseId)).charter_id).toBe(charterId);

    const evidenceAction: ProtocolAction = { type: "add_evidence", caseId, payload: { authority_id: "official-record", source_url: "https://www.iana.org/help/example-domains", content_sha256: `0x${"A".repeat(64)}`, content_byte_length: 10, observed_at: 100, published_at: 90 } };
    const evidenceTx = await write(evidenceAction, "add_evidence");
    const evidenceCall = calls.find((call) => call.method === "add_evidence");
    expect(evidenceCall?.args[0]).toBe(caseId);
    expect(evidenceCall?.args[3]).toBe("a".repeat(64));
    expect(evidenceCall?.args[3]).not.toContain("0x");
    expect(evidenceTx.canonicalId).toBe((await state.getEvidenceIds(caseId))[0]);
    expect((await state.getEvidence(evidenceTx.canonicalId!)).case_id).toBe(caseId);
  });
});
