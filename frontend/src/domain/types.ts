export const SCHEMA_VERSION = "BINARY_EVENT_V1" as const;
export const CHAIN_ID = 61997 as const;
export const CONTRACT_SOURCE_SHA256 = "7cbf394642bfc4a4d626888b0601c12c7d53568f99e51244a14632869083c0b1" as const;

export type TemporalSemantics =
  | "OCCURRENCE_BY_DEADLINE"
  | "PUBLIC_CONFIRMATION_BY_DEADLINE"
  | "OFFICIAL_CONFIRMATION_BY_DEADLINE"
  | "OCCURRENCE_AND_CONFIRMATION_BY_DEADLINE";
export type CharterState = "DRAFT" | "FROZEN";
export type CaseState = "OPEN" | "EVIDENCE_SEALED" | "CHALLENGEABLE" | "CHALLENGED" | "READJUDICATED" | "FINAL";
export type Outcome = "YES" | "NO" | "INCONCLUSIVE";
export type ChallengeGround = "NEW_ADMISSIBLE_EVIDENCE" | "PROCEDURAL_VIOLATION";
export type InfrastructureState =
  | "SOURCE_UNAVAILABLE"
  | "FETCH_TIMEOUT"
  | "INVALID_RESPONSE"
  | "CONTENT_TOO_LARGE"
  | "DIGEST_MISMATCH"
  | "BYTE_LENGTH_MISMATCH"
  | "AUTHORITY_MISMATCH"
  | "MALFORMED_CONTENT"
  | "INSUFFICIENT_EVIDENCE"
  | "EVIDENCE_CONFLICT";

export interface AuthorityRule {
  authority_key: string;
  charter_id: string;
  authority_id: string;
  authority_class: string;
  hostname: string;
  path_prefix: string;
  subject: string;
  priority: number;
  active_at_freeze: boolean;
}

export interface Charter {
  charter_id: string;
  creator: string;
  schema_version: string;
  domain: string;
  question: string;
  allowed_outcomes: string[];
  event_deadline: number;
  evidence_deadline: number;
  temporal_semantics: TemporalSemantics;
  authority_policy: string;
  source_policy: string;
  min_corroboration: number;
  conflict_policy: string;
  unavailable_source_policy: string;
  challenge_window_seconds: number;
  max_challenge_generations: number;
  state: CharterState;
  authority_ids: string[];
  authority_snapshot?: AuthorityRule[];
  charter_hash: string;
}

export interface CaseRecord {
  case_id: string;
  charter_id: string;
  charter_hash: string;
  creator: string;
  state: CaseState;
  evidence_deadline: number;
  evidence_root: string;
  evidence_count: number;
  generation: number;
  challenge_count: number;
  active_resolution_id: string;
  challenge_deadline: number;
  last_resolution_at: number;
  pending_evidence_root: string;
  pending_challenge_id: string;
  terminal: boolean;
}

export interface EvidenceRecord {
  evidence_id: string;
  case_id: string;
  authority_id: string;
  authority_key: string;
  source_url: string;
  normalized_url: string;
  normalized_hostname: string;
  content_sha256: string;
  content_byte_length: number;
  observed_at: number;
  published_at: number;
  evidence_generation: number;
  admissibility_state: string;
  fingerprint: string;
}

export interface SemanticResult {
  selected_outcome: Outcome;
  event_occurred: boolean;
  event_before_deadline: boolean;
  confirmation_before_deadline: boolean;
  authority_requirement_met: boolean;
  corroboration_requirement_met: boolean;
  evidence_conflict: boolean;
  evidence_sufficient: boolean;
}

export interface Resolution {
  resolution_id: string;
  case_id: string;
  generation: number;
  charter_hash: string;
  schema_version: string;
  evidence_root: string;
  evidence_ids: string[];
  adjudication_key: string;
  semantic_result: SemanticResult;
  failure_causes: string[];
  canonical_state: string;
  business_outcome: string;
  previous_resolution_id: string;
  challenge_id: string;
  status: "ACTIVE" | "SUPERSEDED" | "FINAL";
  resolved_at: number;
  challenge_deadline: number;
}

export interface ContractInfo {
  protocol: string;
  version: string;
  phase: string;
  semantic_adjudication_ready: boolean;
  business_outcomes: string[];
  technical_states: string[];
  override_functions: string[];
  custody_functions: string[];
}

export interface CharterDraft {
  schema_version: string;
  domain: string;
  question: string;
  allowed_outcomes: string;
  event_deadline: number;
  evidence_deadline: number;
  temporal_semantics: TemporalSemantics;
  authority_policy: string;
  source_policy: string;
  min_corroboration: number;
  conflict_policy: string;
  unavailable_source_policy: string;
  challenge_window_seconds: number;
  max_challenge_generations: number;
}

export interface AuthorityDraft {
  authority_id: string;
  authority_class: string;
  hostname: string;
  path_prefix: string;
  subject: string;
  priority: number;
}

export interface EvidenceDraft {
  authority_id: string;
  source_url: string;
  content_sha256: string;
  content_byte_length: number;
  observed_at: number;
  published_at: number;
}

export interface ResolutionLineage {
  resolution: Resolution;
  previous?: Resolution;
  challengeGround?: ChallengeGround;
}

export interface ProtocolAdapter {
  readonly mode: "live" | "demo";
  readonly label: string;
  listCharterIds(): Promise<string[]>;
  getCharterCount(): Promise<number>;
  getCharter(id: string): Promise<Charter>;
  getCharterIds(): Promise<string[]>;
  getCaseCount(): Promise<number>;
  getCaseIds(): Promise<string[]>;
  getCase(id: string): Promise<CaseRecord>;
  getEvidenceIds(caseId: string): Promise<string[]>;
  getEvidence(id: string): Promise<EvidenceRecord>;
  getResolution(id: string): Promise<Resolution>;
  getResolutionHistory(caseId: string): Promise<Resolution[]>;
  getContractInfo(): Promise<ContractInfo>;
  submit(action: ProtocolAction): Promise<SubmittedTransaction>;
  reconcile(hash: string): Promise<ReconciliationResult>;
  precondition(action: ProtocolAction): Promise<unknown>;
  verifyPostcondition(action: ProtocolAction, precondition?: unknown): Promise<boolean>;
  network(): Promise<NetworkStatus>;
}

export type ProtocolAction =
  | { type: "create_charter"; payload: CharterDraft }
  | { type: "add_authority_rule"; charterId: string; payload: AuthorityDraft }
  | { type: "freeze_charter"; charterId: string }
  | { type: "open_case"; charterId: string }
  | { type: "add_evidence"; caseId: string; payload: EvidenceDraft }
  | { type: "seal_evidence"; caseId: string }
  | { type: "adjudicate"; caseId: string }
  | { type: "challenge"; caseId: string; ground: ChallengeGround; evidenceId: string }
  | { type: "readjudicate"; caseId: string }
  | { type: "finalize_case"; caseId: string };

export interface SubmittedTransaction { hash: string; action: ProtocolAction; createdAt: number; }
export interface ReconciliationResult { hash: string; finalized: boolean; executionSucceeded: boolean; status: string; }
export interface NetworkStatus { chainId: number; expectedChainId: number; contractAddress?: string; configured: boolean; match: boolean; }

export const TEMPORAL_DESCRIPTIONS: Record<TemporalSemantics, string> = {
  OCCURRENCE_BY_DEADLINE: "The event itself must occur on or before the frozen event deadline.",
  PUBLIC_CONFIRMATION_BY_DEADLINE: "A public, non-authoritative confirmation must exist by the deadline.",
  OFFICIAL_CONFIRMATION_BY_DEADLINE: "A permitted authority must confirm the event by the deadline.",
  OCCURRENCE_AND_CONFIRMATION_BY_DEADLINE: "Both occurrence and permitted confirmation must exist by the deadline.",
};

export const FAILURE_LABELS: Record<string, string> = {
  SOURCE_UNAVAILABLE: "Source unavailable",
  FETCH_TIMEOUT: "Fetch timeout",
  INVALID_RESPONSE: "Invalid response",
  CONTENT_TOO_LARGE: "Content too large",
  DIGEST_MISMATCH: "Digest mismatch",
  BYTE_LENGTH_MISMATCH: "Byte length mismatch",
  AUTHORITY_MISMATCH: "Authority mismatch",
  MALFORMED_CONTENT: "Malformed content",
  INSUFFICIENT_EVIDENCE: "Insufficient evidence",
  EVIDENCE_CONFLICT: "Evidence conflict",
};

export const TEMPORAL_VALUES: TemporalSemantics[] = [
  "OCCURRENCE_BY_DEADLINE",
  "PUBLIC_CONFIRMATION_BY_DEADLINE",
  "OFFICIAL_CONFIRMATION_BY_DEADLINE",
  "OCCURRENCE_AND_CONFIRMATION_BY_DEADLINE",
];
