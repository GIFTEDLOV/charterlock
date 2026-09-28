import { describe, expect, it } from "vitest";
import { deriveOutcome, validateAuthority, validateCharter, validateEvidence, validateSemanticResult } from "./validation";
import type { CharterDraft, EvidenceDraft, SemanticResult } from "./types";

const charter: CharterDraft = { schema_version: "BINARY_EVENT_V1", domain: "events", question: "Did it happen?", allowed_outcomes: "YES,NO", event_deadline: 100, evidence_deadline: 200, temporal_semantics: "OCCURRENCE_BY_DEADLINE", authority_policy: "FROZEN_AUTHORITY_SNAPSHOT", source_policy: "HTTPS_BOUND_TO_AUTHORITY", min_corroboration: 1, conflict_policy: "CONFLICT_IS_INCONCLUSIVE", unavailable_source_policy: "SOURCE_UNAVAILABLE_IS_NON_BUSINESS_STATE", challenge_window_seconds: 100, max_challenge_generations: 2 };
const evidence: EvidenceDraft = { authority_id: "official", source_url: "https://records.example.gov/events/1", content_sha256: "0x" + "a".repeat(64), content_byte_length: 100, observed_at: 100, published_at: 90 };
const yes: SemanticResult = { selected_outcome: "YES", event_occurred: true, event_before_deadline: true, confirmation_before_deadline: true, authority_requirement_met: true, corroboration_requirement_met: true, evidence_conflict: false, evidence_sufficient: true };

describe("CharterLock deterministic frontend validation", () => {
  it("accepts a valid charter", () => expect(validateCharter(charter)).toEqual([]));
  it("rejects an unknown schema", () => expect(validateCharter({ ...charter, schema_version: "OTHER" }).join(" ")).toContain("BINARY_EVENT_V1"));
  it("rejects empty questions", () => expect(validateCharter({ ...charter, question: " " })).toContain("Question is required."));
  it("rejects evidence deadlines before event deadlines", () => expect(validateCharter({ ...charter, evidence_deadline: 99 }).join(" ")).toContain("Evidence deadline"));
  it("enforces UTF-8 question byte bounds", () => expect(validateCharter({ ...charter, question: "é".repeat(1100) }).join(" ")).toContain("2048-byte"));
  it("accepts each explicit temporal mode", () => ["OCCURRENCE_BY_DEADLINE", "PUBLIC_CONFIRMATION_BY_DEADLINE", "OFFICIAL_CONFIRMATION_BY_DEADLINE", "OCCURRENCE_AND_CONFIRMATION_BY_DEADLINE"].forEach((temporal_semantics) => expect(validateCharter({ ...charter, temporal_semantics } as CharterDraft)).toEqual([])));
  it("rejects malformed authority hostnames", () => expect(validateAuthority({ authority_id: "x", authority_class: "OFFICIAL", hostname: "evil", path_prefix: "/", subject: "x", priority: 1 }).join(" ")).toContain("normalized DNS"));
  it("rejects embedded credentials and path confusion", () => expect(validateAuthority({ authority_id: "x", authority_class: "OFFICIAL", hostname: "user@evil.example", path_prefix: "events", subject: "x", priority: 1 }).length).toBeGreaterThan(1));
  it("accepts bounded evidence", () => expect(validateEvidence(evidence)).toEqual([]));
  it("rejects non-HTTPS evidence", () => expect(validateEvidence({ ...evidence, source_url: "http://records.example.gov/events/1" }).join(" ")).toContain("HTTPS"));
  it("rejects malformed SHA-256", () => expect(validateEvidence({ ...evidence, content_sha256: "bad" }).join(" ")).toContain("SHA-256"));
  it("rejects invalid publication ordering", () => expect(validateEvidence({ ...evidence, published_at: 101 }).join(" ")).toContain("Published time"));
  it("accepts a valid YES fact vector", () => expect(validateSemanticResult(yes).ok).toBe(true));
  it("accepts valid NO and INCONCLUSIVE enum values", () => { expect(validateSemanticResult({ ...yes, selected_outcome: "NO" }).ok).toBe(true); expect(validateSemanticResult({ ...yes, selected_outcome: "INCONCLUSIVE" }).ok).toBe(true); });
  it("rejects malformed JSON", () => { const result = validateSemanticResult("not-json"); expect(result.ok).toBe(false); if (!result.ok) expect(result.errors.join(" ")).toContain("JSON object"); });
  it("rejects missing keys", () => expect(validateSemanticResult({ ...yes, evidence_sufficient: undefined }).ok).toBe(false));
  it("rejects extra keys", () => expect(validateSemanticResult({ ...yes, confidence: 1 }).ok).toBe(false));
  it("rejects wrong semantic types", () => expect(validateSemanticResult({ ...yes, event_occurred: "true" }).ok).toBe(false));
  it("rejects unknown outcomes", () => expect(validateSemanticResult({ ...yes, selected_outcome: "MAYBE" }).ok).toBe(false));
  it("rejects inconsistent YES facts", () => expect(validateSemanticResult({ ...yes, event_occurred: false }).ok).toBe(false));
  it("rejects oversized semantic output", () => expect(validateSemanticResult({ ...yes, selected_outcome: "YES" }, 10).ok).toBe(false));
  it("derives occurrence-by-deadline YES", () => expect(deriveOutcome(yes, "OCCURRENCE_BY_DEADLINE", 1)).toBe("YES"));
  it("derives public confirmation by deadline", () => expect(deriveOutcome({ ...yes, event_before_deadline: false }, "PUBLIC_CONFIRMATION_BY_DEADLINE", 1)).toBe("YES"));
  it("derives official confirmation by deadline", () => expect(deriveOutcome({ ...yes, authority_requirement_met: false }, "OFFICIAL_CONFIRMATION_BY_DEADLINE", 1)).toBe("NO"));
  it("requires both facts for occurrence and confirmation", () => expect(deriveOutcome({ ...yes, confirmation_before_deadline: false }, "OCCURRENCE_AND_CONFIRMATION_BY_DEADLINE", 1)).toBe("NO"));
  it("fails closed for conflict and insufficient evidence", () => expect(deriveOutcome({ ...yes, evidence_conflict: true }, "OCCURRENCE_BY_DEADLINE", 1)).toBe("INCONCLUSIVE"));
});
