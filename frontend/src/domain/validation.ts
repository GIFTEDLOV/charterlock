import type { AuthorityDraft, CharterDraft, EvidenceDraft, SemanticResult, TemporalSemantics } from "./types";
import { TEMPORAL_VALUES } from "./types";

const HOSTNAME = /^(?=.{1,253}$)(?!-)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;
const SHA256 = /^(?:0x)?[a-f0-9]{64}$/i;
const AUTHORITY_CLASSES = new Set(["OFFICIAL", "PRIMARY", "SECONDARY", "PUBLIC_RECORD", "REGULATOR"]);

export function validateCharter(draft: CharterDraft): string[] {
  const errors: string[] = [];
  if (draft.schema_version !== "BINARY_EVENT_V1") errors.push("Only BINARY_EVENT_V1 is currently supported.");
  if (!draft.domain.trim()) errors.push("Domain is required.");
  if (new TextEncoder().encode(draft.domain).length > 128) errors.push("Domain exceeds the 128-byte limit.");
  if (!draft.question.trim()) errors.push("Question is required.");
  if (new TextEncoder().encode(draft.question).length > 4096) errors.push("Question exceeds the 4096-byte limit.");
  const outcomes = draft.allowed_outcomes.split(",").map((value) => value.trim());
  if (outcomes.length !== 2 || new Set(outcomes).size !== 2 || !outcomes.includes("YES") || !outcomes.includes("NO")) errors.push("Allowed outcomes must be exactly YES,NO.");
  if (draft.event_deadline <= 0 || draft.evidence_deadline <= draft.event_deadline) errors.push("Evidence deadline must be after event deadline.");
  if (!TEMPORAL_VALUES.includes(draft.temporal_semantics)) errors.push("Select a supported temporal rule.");
  if (draft.authority_policy !== "REGISTERED_AUTHORITY_REQUIRED") errors.push("Authority policy must be REGISTERED_AUTHORITY_REQUIRED.");
  if (draft.source_policy !== "BOUND_HOSTNAME_AND_PATH") errors.push("Source policy must be BOUND_HOSTNAME_AND_PATH.");
  if (draft.min_corroboration < 1 || draft.min_corroboration > 32) errors.push("Minimum corroboration must be between 1 and 32.");
  if (!["CONFLICT_INCONCLUSIVE", "CONFLICT_FAIL_CLOSED"].includes(draft.conflict_policy)) errors.push("Select a supported conflict policy.");
  if (!["UNAVAILABLE_RETRY", "UNAVAILABLE_INCONCLUSIVE"].includes(draft.unavailable_source_policy)) errors.push("Select a supported unavailable-source policy.");
  if (draft.challenge_window_seconds < 1 || draft.challenge_window_seconds > 2_592_000) errors.push("Challenge window must be between 1 second and 30 days.");
  if (draft.max_challenge_generations < 0 || draft.max_challenge_generations > 8) errors.push("Challenge generations must be between 0 and 8.");
  return errors;
}

export function validateAuthority(draft: AuthorityDraft): string[] {
  const errors: string[] = [];
  if (!draft.authority_id.trim()) errors.push("Authority ID is required.");
  if (new TextEncoder().encode(draft.authority_id).length > 64) errors.push("Authority ID exceeds the 64-byte limit.");
  if (!AUTHORITY_CLASSES.has(draft.authority_class)) errors.push("Select a supported authority class.");
  if (!HOSTNAME.test(draft.hostname.trim().toLowerCase())) errors.push("Hostname must be a normalized DNS hostname.");
  if (!draft.hostname.includes(".")) errors.push("Hostname must include a domain suffix.");
  if (draft.hostname.includes("@") || draft.hostname.includes("/") || draft.hostname.includes(" ")) errors.push("Hostname cannot contain credentials, paths, or spaces.");
  if (!draft.path_prefix.startsWith("/")) errors.push("Path restriction must start with '/'.");
  if (draft.path_prefix.length > 128 || /[\\%]|\/\/|(^|\/)\.\.?($|\/)/.test(draft.path_prefix)) errors.push("Path restriction contains ambiguous transport syntax.");
  if (!draft.subject.trim()) errors.push("Subject/scope is required.");
  if (new TextEncoder().encode(draft.subject).length > 256) errors.push("Subject exceeds the 256-byte limit.");
  if (draft.priority < 0 || draft.priority > 255) errors.push("Priority must be between 0 and 255.");
  return errors;
}

export function validateEvidence(draft: EvidenceDraft): string[] {
  const errors: string[] = [];
  try {
    const url = new URL(draft.source_url);
    if (url.protocol !== "https:") errors.push("Evidence transport must use HTTPS.");
    if (url.username || url.password) errors.push("Embedded URL credentials are not permitted.");
    if (url.port) errors.push("Explicit URL ports are not permitted.");
    if (url.hash) errors.push("URL fragments are not permitted.");
    if (new TextEncoder().encode(draft.source_url).length > 2048 || new TextEncoder().encode(url.pathname).length > 512 || new TextEncoder().encode(url.search.slice(1)).length > 512) errors.push("URL exceeds a bounded component limit.");
    if (/[\\%]|\/\/|(^|\/)\.\.?($|\/)/.test(url.pathname)) errors.push("URL path contains ambiguous transport syntax.");
    if ([...draft.source_url].some((character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127)) errors.push("Control characters are not permitted in URLs.");
  } catch { errors.push("Enter a valid HTTPS evidence URL."); }
  if (!SHA256.test(draft.content_sha256)) errors.push("Content SHA-256 must be exactly 64 hexadecimal bytes.");
  if (draft.content_byte_length < 1 || draft.content_byte_length > 2_000_000) errors.push("Content byte length must be between 1 and 2,000,000.");
  if (draft.published_at < 0 || (draft.published_at !== 0 && draft.published_at > draft.observed_at)) errors.push("Published time must be before observed time.");
  return errors;
}

const SEMANTIC_KEYS = ["selected_outcome", "event_occurred", "event_before_deadline", "confirmation_before_deadline", "authority_requirement_met", "corroboration_requirement_met", "evidence_conflict", "evidence_sufficient"] as const;
export function validateSemanticResult(value: unknown, maxBytes = 4096): { ok: true; value: SemanticResult } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  const raw = typeof value === "string" ? parseJson(value, errors) : value;
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) return { ok: false, errors: ["Semantic output must be a JSON object."] };
  if (new TextEncoder().encode(JSON.stringify(raw)).length > maxBytes) errors.push("Semantic output exceeds the bounded output size.");
  const keys = Object.keys(raw as object).sort();
  if (keys.join("|") !== [...SEMANTIC_KEYS].sort().join("|")) errors.push("Semantic output keys must exactly match the fixed schema.");
  const record = raw as Record<string, unknown>;
  if (record.selected_outcome !== "YES" && record.selected_outcome !== "NO" && record.selected_outcome !== "INCONCLUSIVE") errors.push("Unknown selected_outcome.");
  for (const key of SEMANTIC_KEYS.slice(1)) if (typeof record[key] !== "boolean") errors.push(`${key} must be boolean.`);
  if ((record.selected_outcome === "YES" || record.selected_outcome === "NO") && record.evidence_sufficient !== true) errors.push("Business outcomes require sufficient evidence.");
  if ((record.selected_outcome === "YES" || record.selected_outcome === "NO") && record.evidence_conflict === true) errors.push("Business outcomes cannot contain evidence conflict.");
  if ((record.selected_outcome === "YES" || record.selected_outcome === "NO") && record.authority_requirement_met !== true) errors.push("Business outcomes require the frozen authority policy.");
  if ((record.selected_outcome === "YES" || record.selected_outcome === "NO") && record.corroboration_requirement_met !== true) errors.push("Business outcomes require corroboration.");
  if (record.selected_outcome === "YES" && record.event_occurred === false) errors.push("YES requires event_occurred=true.");
  if (record.event_before_deadline === true && record.event_occurred === false) errors.push("event_before_deadline requires event_occurred=true.");
  if (record.confirmation_before_deadline === true && record.authority_requirement_met === false) errors.push("Confirmation before deadline requires authority requirement.");
  if (record.selected_outcome === "INCONCLUSIVE" && record.evidence_sufficient === true && record.evidence_conflict === false && record.authority_requirement_met === true && record.corroboration_requirement_met === true) errors.push("INCONCLUSIVE cannot replace a determinate, conflict-free fact vector.");
  return errors.length ? { ok: false, errors } : { ok: true, value: record as unknown as SemanticResult };
}

function parseJson(value: string, errors: string[]): unknown {
  try { return JSON.parse(value); } catch { errors.push("Semantic output is not valid JSON."); return null; }
}

export function deriveOutcome(semantic: SemanticResult, temporal: TemporalSemantics, minCorroboration: number): string {
  if (minCorroboration < 1 || !semantic.evidence_sufficient || semantic.evidence_conflict || !semantic.authority_requirement_met || !semantic.corroboration_requirement_met) return "INCONCLUSIVE";
  const temporalSatisfied = temporal === "OCCURRENCE_BY_DEADLINE"
    ? semantic.event_occurred && semantic.event_before_deadline
    : temporal === "PUBLIC_CONFIRMATION_BY_DEADLINE"
      ? semantic.event_occurred && semantic.confirmation_before_deadline
      : temporal === "OFFICIAL_CONFIRMATION_BY_DEADLINE"
        ? semantic.event_occurred && semantic.confirmation_before_deadline && semantic.authority_requirement_met
        : semantic.event_occurred && semantic.event_before_deadline && semantic.confirmation_before_deadline && semantic.authority_requirement_met;
  return temporalSatisfied ? "YES" : "NO";
}

export function normalizeHost(hostname: string): string { return hostname.trim().toLowerCase().replace(/\.$/, ""); }
