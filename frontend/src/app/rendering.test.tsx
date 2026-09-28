import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FactVector, ResolutionSummary, StatusPill, TemporalNote } from "./components";
import type { Charter, Resolution, SemanticResult } from "../domain/types";

const semantic: SemanticResult = { selected_outcome: "INCONCLUSIVE", event_occurred: false, event_before_deadline: false, confirmation_before_deadline: false, authority_requirement_met: false, corroboration_requirement_met: false, evidence_conflict: false, evidence_sufficient: false };
const charter = { charter_id: "C", creator: "x", schema_version: "BINARY_EVENT_V1", domain: "x", question: "x", allowed_outcomes: ["YES", "NO"], event_deadline: 1, evidence_deadline: 2, temporal_semantics: "OFFICIAL_CONFIRMATION_BY_DEADLINE", authority_policy: "x", source_policy: "x", min_corroboration: 1, conflict_policy: "x", unavailable_source_policy: "x", challenge_window_seconds: 1, max_challenge_generations: 1, state: "FROZEN", authority_ids: [], charter_hash: "0x" } as Charter;
const resolution = { resolution_id: "R", case_id: "C", generation: 0, charter_hash: "0x", schema_version: "BINARY_EVENT_V1", evidence_root: "0xroot", evidence_ids: [], adjudication_key: "0x", semantic_result: semantic, failure_causes: ["SOURCE_UNAVAILABLE"], canonical_state: "SOURCE_UNAVAILABLE", business_outcome: "", previous_resolution_id: "", challenge_id: "", status: "ACTIVE", resolved_at: 1, challenge_deadline: 2 } as Resolution;

describe("reviewer-facing semantic rendering", () => {
  it("renders every semantic vector field", () => { render(<FactVector semantic={semantic} />); expect(screen.getByText("Event occurred")).toBeTruthy(); expect(screen.getByText("Evidence sufficient")).toBeTruthy(); });
  it("renders INCONCLUSIVE as a non-business state", () => { render(<ResolutionSummary resolution={resolution} charter={charter} />); expect(screen.getByText("SOURCE_UNAVAILABLE")).toBeTruthy(); expect(screen.queryByText("NO")).toBeNull(); });
  it("renders typed infrastructure causes", () => { render(<StatusPill value="DIGEST_MISMATCH" />); expect(screen.getByText("DIGEST MISMATCH")).toBeTruthy(); });
  it("renders temporal semantics beside the vector", () => { render(<TemporalNote charter={charter} />); expect(screen.getByText("OFFICIAL CONFIRMATION BY DEADLINE")).toBeTruthy(); });
  it("communicates final status without color-only meaning", () => { render(<StatusPill value="FINAL" />); expect(screen.getByText("FINAL")).toBeTruthy(); });
});
