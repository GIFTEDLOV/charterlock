import type { AuthorityDraft, CharterDraft, EvidenceDraft, SemanticResult, TemporalSemantics } from "./types";
import { TEMPORAL_VALUES } from "./types";

const HOSTNAME = /^(?=.{1,253}$)(?!-)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;
const SHA256 = /^(?:0x)?[a-f0-9]{64}$/i;

export function validateCharter(draft: CharterDraft): string[] {
  const errors: string[] = [];
  if (draft.schema_version !== "BINARY_EVENT_V1") errors.push("Only BINARY_EVENT_V1 is currently supported.");
  if (!draft.domain.trim()) errors.push("Domain is required.");
  if (!draft.question.trim()) errors.push("Question is required.");
  if (new TextEncoder().encode(draft.question).length > 2048) errors.push("Question exceeds the 2048-byte limit.");
  if (draft.event_deadline <= 0 || draft.evidence_deadline <= draft.event_deadline) errors.push("Evidence deadline must be after event deadline.");
  if (!TEMPORAL_VALUES.includes(draft.temporal_semantics)) errors.push("Select a supported temporal rule.");
  if (draft.min_corroboration < 1) errors.push("Minimum corroboration must be at least 1.");
  if (draft.challenge_window_seconds < 1) errors.push("Challenge window must be positive.");
  if (draft.max_challenge_generations < 0) errors.push("Challenge generations cannot be negative.");
  return errors;
}

export function validateAuthority(draft: AuthorityDraft): string[] {
  const errors: string[] = [];
  if (!draft.authority_id.trim()) errors.push("Authority ID is required.");
  if (!HOSTNAME.test(draft.hostname.trim().toLowerCase())) errors.push("Hostname must be a normalized DNS hostname.");
  if (!draft.hostname.includes(".")) errors.push("Hostname must include a domain suffix.");
  if (draft.hostname.includes("@") || draft.hostname.includes("/") || draft.hostname.includes(" ")) errors.push("Hostname cannot contain credentials, paths, or spaces.");
  if (!draft.path_prefix.startsWith("/")) errors.push("Path restriction must start with '/'.");
  if (!draft.subject.trim()) errors.push("Subject/scope is required.");
  if (draft.priority < 0 || draft.priority > 255) errors.push("Priority must be between 0 and 255.");
  return errors;
}

export function validateEvidence(draft: EvidenceDraft): string[] {
  const errors: string[] = [];
  try {
    const url = new URL(draft.source_url);
    if (url.protocol !== "https:") errors.push("Evidence transport must use HTTPS.");
    if (url.username || url.password) errors.push("Embedded URL credentials are not permitted.");
    if (url.hash) errors.push("URL fragments are not permitted.");
    if ([...draft.source_url].some((character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127)) errors.push("Control characters are not permitted in URLs.");
  } catch { errors.push("Enter a valid HTTPS evidence URL."); }
  if (!SHA256.test(draft.content_sha256)) errors.push("Content SHA-256 must be exactly 64 hexadecimal bytes.");
  if (draft.content_byte_length < 1 || draft.content_byte_length > 1_000_000) errors.push("Content byte length must be between 1 and 1,000,000.");
  if (draft.published_at < 0 || (draft.published_at !== 0 && draft.published_at > draft.observed_at)) errors.push("Published time must be before observed time.");
  return errors;
}

const SEMANTIC_KEYS = ["selected_outcome", "event_occurred", "event_before_deadline", "confirmation_before_deadline", "authority_requirement_met", "corroboration_requirement_met", "evidence_conflict", "evidence_sufficient"] as const;
export function validateSemanticResult(value: unknown, maxBytes = 2048): { ok: true; value: SemanticResult } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  const raw = typeof value === "string" ? parseJson(value, errors) : value;
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) return { ok: false, errors: ["Semantic output must be a JSON object."] };
  if (new TextEncoder().encode(JSON.stringify(raw)).length > maxBytes) errors.push("Semantic output exceeds the bounded output size.");
  const keys = Object.keys(raw as object).sort();
  if (keys.join("|") !== [...SEMANTIC_KEYS].sort().join("|")) errors.push("Semantic output keys must exactly match the fixed schema.");
  const record = raw as Record<string, unknown>;
  if (record.selected_outcome !== "YES" && record.selected_outcome !== "NO" && record.selected_outcome !== "INCONCLUSIVE") errors.push("Unknown selected_outcome.");
  for (const key of SEMANTIC_KEYS.slice(1)) if (typeof record[key] !== "boolean") errors.push(`${key} must be boolean.`);
  if (record.selected_outcome === "YES" && record.evidence_sufficient === false) errors.push("YES requires sufficient evidence.");
  if (record.selected_outcome === "YES" && record.event_occurred === false) errors.push("YES requires event_occurred=true.");
  if (record.event_before_deadline === true && record.event_occurred === false) errors.push("event_before_deadline requires event_occurred=true.");
  if (record.confirmation_before_deadline === true && record.authority_requirement_met === false) errors.push("Confirmation before deadline requires authority requirement.");
  return errors.length ? { ok: false, errors } : { ok: true, value: record as unknown as SemanticResult };
}

function parseJson(value: string, errors: string[]): unknown {
  try { return JSON.parse(value); } catch { errors.push("Semantic output is not valid JSON."); return null; }
}

export function deriveOutcome(semantic: SemanticResult, temporal: TemporalSemantics, minCorroboration: number): string {
  if (!semantic.evidence_sufficient || semantic.evidence_conflict || !semantic.corroboration_requirement_met || semantic.corroboration_requirement_met && minCorroboration < 1) return "INCONCLUSIVE";
  const temporalSatisfied = temporal === "OCCURRENCE_BY_DEADLINE"
    ? semantic.event_occurred && semantic.event_before_deadline
    : temporal === "PUBLIC_CONFIRMATION_BY_DEADLINE"
      ? semantic.confirmation_before_deadline
      : temporal === "OFFICIAL_CONFIRMATION_BY_DEADLINE"
        ? semantic.confirmation_before_deadline && semantic.authority_requirement_met
        : semantic.event_occurred && semantic.event_before_deadline && semantic.confirmation_before_deadline && semantic.authority_requirement_met;
  if (!temporalSatisfied) return "NO";
  return semantic.selected_outcome === "YES" ? "YES" : semantic.selected_outcome === "NO" ? "NO" : "INCONCLUSIVE";
}

export function normalizeHost(hostname: string): string { return hostname.trim().toLowerCase().replace(/\.$/, ""); }
