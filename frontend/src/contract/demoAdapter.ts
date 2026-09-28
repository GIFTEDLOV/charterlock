import type {
  AuthorityRule, CaseRecord, Charter, ContractInfo, EvidenceRecord,
  NetworkStatus, ProtocolAction, ProtocolAdapter, ReconciliationResult, Resolution, SemanticResult,
} from "../domain/types";
import { CHAIN_ID, SCHEMA_VERSION } from "../domain/types";

const DEMO_CREATOR = "0xcontrolled-demo-account";
const DEMO_CONTRACT = "CONTROLLED_DEMO_NO_ADDRESS";
const STORAGE_KEY = "charterlock.controlled-demo.v1";

interface DemoState {
  charters: Record<string, Charter>;
  cases: Record<string, CaseRecord>;
  evidence: Record<string, EvidenceRecord>;
  resolutions: Record<string, Resolution>;
  history: Record<string, string[]>;
  next: { charter: number; case: number; evidence: number; resolution: number; challenge: number };
}

const semanticYes: SemanticResult = {
  selected_outcome: "YES", event_occurred: true, event_before_deadline: true,
  confirmation_before_deadline: true, authority_requirement_met: true,
  corroboration_requirement_met: true, evidence_conflict: false, evidence_sufficient: true,
};

function initialState(): DemoState {
  const demoChallengeDeadline = Math.floor(Date.now() / 1000) + 86_400;
  const charter: Charter = {
    charter_id: "CHR-00000001", creator: DEMO_CREATOR, schema_version: SCHEMA_VERSION,
    domain: "Event contract resolution", question: "Did the named public event occur before the event deadline?",
    allowed_outcomes: ["YES", "NO"], event_deadline: 1_735_689_600, evidence_deadline: 1_735_776_000,
    temporal_semantics: "OFFICIAL_CONFIRMATION_BY_DEADLINE", authority_policy: "REGISTERED_AUTHORITY_REQUIRED",
    source_policy: "BOUND_HOSTNAME_AND_PATH", min_corroboration: 2, conflict_policy: "CONFLICT_INCONCLUSIVE",
    unavailable_source_policy: "UNAVAILABLE_INCONCLUSIVE", challenge_window_seconds: 86_400,
    max_challenge_generations: 2, state: "FROZEN", authority_ids: ["official-record", "public-wire"],
    charter_hash: "0x" + "a".repeat(64),
    authority_snapshot: [
      { authority_key: "CHR-00000001::official-record", charter_id: "CHR-00000001", authority_id: "official-record", authority_class: "OFFICIAL", hostname: "records.example.gov", path_prefix: "/events/", subject: "Official event record", priority: 10, active_at_freeze: true },
      { authority_key: "CHR-00000001::public-wire", charter_id: "CHR-00000001", authority_id: "public-wire", authority_class: "SECONDARY", hostname: "wire.example.org", path_prefix: "/bulletins/", subject: "Public corroboration", priority: 20, active_at_freeze: true },
    ],
  };
  const evidence1: EvidenceRecord = {
    evidence_id: "EVID-00000001", case_id: "CASE-00000001", authority_id: "official-record", authority_key: "CHR-00000001::official-record",
    source_url: "https://records.example.gov/events/alpha", normalized_url: "https://records.example.gov/events/alpha",
    normalized_hostname: "records.example.gov", content_sha256: "0x" + "1".repeat(64), content_byte_length: 18420,
    observed_at: 1_735_600_000, published_at: 1_735_590_000, evidence_generation: 0, admissibility_state: "ADMISSIBLE", fingerprint: "0x" + "b".repeat(64),
  };
  const evidence2: EvidenceRecord = {
    evidence_id: "EVID-00000002", case_id: "CASE-00000001", authority_id: "public-wire", authority_key: "CHR-00000001::public-wire",
    source_url: "https://wire.example.org/bulletins/alpha", normalized_url: "https://wire.example.org/bulletins/alpha",
    normalized_hostname: "wire.example.org", content_sha256: "0x" + "2".repeat(64), content_byte_length: 9200,
    observed_at: 1_735_605_000, published_at: 1_735_600_500, evidence_generation: 1, admissibility_state: "ADMISSIBLE", fingerprint: "0x" + "c".repeat(64),
  };
  const caseOne: CaseRecord = {
    case_id: "CASE-00000001", charter_id: charter.charter_id, charter_hash: charter.charter_hash, creator: DEMO_CREATOR,
    state: "CHALLENGEABLE", evidence_deadline: charter.evidence_deadline, evidence_root: "0x" + "d".repeat(64), evidence_count: 2,
    generation: 0, challenge_count: 0, active_resolution_id: "RES-00000001", challenge_deadline: demoChallengeDeadline,
    last_resolution_at: 1_735_700_000, pending_evidence_root: "", pending_challenge_id: "", terminal: false,
  };
  const resolution: Resolution = {
    resolution_id: "RES-00000001", case_id: caseOne.case_id, generation: 0, charter_hash: charter.charter_hash,
    schema_version: SCHEMA_VERSION, evidence_root: caseOne.evidence_root, evidence_ids: [evidence1.evidence_id],
    adjudication_key: "0x" + "e".repeat(64), semantic_result: semanticYes, failure_causes: [],
    canonical_state: "CHALLENGEABLE", business_outcome: "YES", previous_resolution_id: "", challenge_id: "",
    status: "ACTIVE", resolved_at: caseOne.last_resolution_at, challenge_deadline: caseOne.challenge_deadline,
  };
  return {
    charters: { [charter.charter_id]: charter },
    cases: { [caseOne.case_id]: caseOne },
    evidence: { [evidence1.evidence_id]: evidence1, [evidence2.evidence_id]: evidence2 },
    resolutions: { [resolution.resolution_id]: resolution }, history: { [caseOne.case_id]: [resolution.resolution_id] },
    next: { charter: 2, case: 2, evidence: 3, resolution: 2, challenge: 1 },
  };
}

function id(prefix: string, value: number): string { return `${prefix}-${String(value).padStart(8, "0")}`; }
function rootFor(caseId: string, generation: number, count: number): string { return `0x${(caseId.length + generation + count).toString(16).padStart(2, "0")}${"f".repeat(62)}`; }
function loadState(): DemoState {
  try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) return JSON.parse(raw) as DemoState; } catch { /* reset controlled fixture */ }
  return initialState();
}
function saveState(state: DemoState): void { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function getOrThrow<T>(value: T | undefined, label: string): T { if (!value) throw new Error(`${label}_NOT_FOUND`); return value; }

export class ControlledDemoAdapter implements ProtocolAdapter {
  readonly mode = "demo" as const;
  readonly label = "CONTROLLED DEMO / TEST MODE";
  private state = loadState();

  private save(): void { saveState(this.state); }
  async listCharterIds(): Promise<string[]> { return this.getCharterIds(); }
  async getCharterCount(): Promise<number> { return Object.keys(this.state.charters).length; }
  async getCharter(idValue: string): Promise<Charter> { return getOrThrow(this.state.charters[idValue], "CHARTER"); }
  async getCharterIds(): Promise<string[]> { return Object.keys(this.state.charters); }
  async getCaseCount(): Promise<number> { return Object.keys(this.state.cases).length; }
  async getCaseIds(): Promise<string[]> { return Object.keys(this.state.cases); }
  async getCase(idValue: string): Promise<CaseRecord> { return getOrThrow(this.state.cases[idValue], "CASE"); }
  async getEvidenceIds(caseId: string): Promise<string[]> { return Object.values(this.state.evidence).filter((item) => item.case_id === caseId).map((item) => item.evidence_id); }
  async getEvidence(idValue: string): Promise<EvidenceRecord> { return getOrThrow(this.state.evidence[idValue], "EVIDENCE"); }
  async getResolution(idValue: string): Promise<Resolution> { return getOrThrow(this.state.resolutions[idValue], "RESOLUTION"); }
  async getResolutionHistory(caseId: string): Promise<Resolution[]> { return (this.state.history[caseId] ?? []).map((item) => getOrThrow(this.state.resolutions[item], "RESOLUTION")); }
  async getContractInfo(): Promise<ContractInfo> {
    return { protocol: "CharterLock Protocol", protocol_version: "0.2.0-phase2", first_schema: SCHEMA_VERSION,
      phase: "PHASE_2_SEMANTIC_ADJUDICATION", semantic_adjudicator_ready: true,
      business_outcomes: ["YES", "NO"], technical_states: ["INCONCLUSIVE", "INSUFFICIENT_EVIDENCE", "SOURCE_UNAVAILABLE", "EVIDENCE_CONFLICT"],
      procedural_challenge_reason_codes: ["SEMANTIC_BOUNDARY_VIOLATION", "EVIDENCE_ROOT_MISMATCH", "AUTHORITY_BINDING_VIOLATION", "INVALID_STATE_TRANSITION"],
      no_privileged_override: true, no_custody_or_betting: true, charter_count: Object.keys(this.state.charters).length,
      case_count: Object.keys(this.state.cases).length, evidence_count: Object.keys(this.state.evidence).length };
  }
  async network(): Promise<NetworkStatus> { return { chainId: CHAIN_ID, expectedChainId: CHAIN_ID, contractAddress: DEMO_CONTRACT, configured: false, match: false }; }
  async reconcile(hash: string): Promise<ReconciliationResult> { return { hash, finalized: true, executionSucceeded: true, status: "CONTROLLED_DEMO_CONFIRMED" }; }
  async precondition(action: ProtocolAction): Promise<unknown> {
    if (action.type === "create_charter") return await this.getCharterCount();
    if (action.type === "open_case") return await this.getCaseCount();
    if ("charterId" in action) return await this.getCharter(action.charterId);
    if ("caseId" in action) return await this.getCase(action.caseId);
    return undefined;
  }
  async verifyPostcondition(): Promise<boolean> { return true; }

  async submit(action: ProtocolAction): Promise<{ hash: string; action: ProtocolAction; createdAt: number }> {
    const now = Date.now();
    let suffix = "00000000";
    if (action.type === "create_charter") {
      const charterId = id("CHR", this.state.next.charter++);
      this.state.charters[charterId] = { ...action.payload, allowed_outcomes: action.payload.allowed_outcomes.split(",").map((value) => value.trim()), charter_id: charterId, creator: DEMO_CREATOR, state: "DRAFT", authority_ids: [], charter_hash: "" };
      suffix = charterId.slice(-8);
    } else if (action.type === "add_authority_rule") {
      const charter = getOrThrow(this.state.charters[action.charterId], "CHARTER");
      if (charter.state !== "DRAFT") throw new Error("CHARTER_ALREADY_FROZEN");
      const authority: AuthorityRule = { authority_key: `${charter.charter_id}::${action.payload.authority_id}`, charter_id: charter.charter_id, ...action.payload, active_at_freeze: true };
      charter.authority_ids = [...charter.authority_ids, authority.authority_id];
      charter.authority_snapshot = [...(charter.authority_snapshot ?? []), authority];
      suffix = action.charterId.slice(-8);
    } else if (action.type === "freeze_charter") {
      const charter = getOrThrow(this.state.charters[action.charterId], "CHARTER");
      if (!charter.authority_ids.length) throw new Error("AUTHORITY_REQUIRED_BEFORE_FREEZE");
      charter.state = "FROZEN"; charter.charter_hash = `0x${"a".repeat(63)}${charter.charter_id.slice(-1)}`; suffix = action.charterId.slice(-8);
    } else if (action.type === "open_case") {
      const charter = getOrThrow(this.state.charters[action.charterId], "CHARTER");
      if (charter.state !== "FROZEN") throw new Error("CHARTER_MUST_BE_FROZEN");
      const caseId = id("CASE", this.state.next.case++);
      this.state.cases[caseId] = { case_id: caseId, charter_id: charter.charter_id, charter_hash: charter.charter_hash, creator: DEMO_CREATOR,
        state: "OPEN", evidence_deadline: charter.evidence_deadline, evidence_root: "", evidence_count: 0, generation: 0, challenge_count: 0,
        active_resolution_id: "", challenge_deadline: 0, last_resolution_at: 0, pending_evidence_root: "", pending_challenge_id: "", terminal: false };
      this.state.history[caseId] = []; suffix = caseId.slice(-8);
    } else if (action.type === "add_evidence") {
      const caseValue = getOrThrow(this.state.cases[action.caseId], "CASE");
      if (caseValue.state !== "OPEN" && caseValue.state !== "CHALLENGEABLE") throw new Error("INVALID_CASE_TRANSITION");
      const evidenceId = id("EVID", this.state.next.evidence++);
      this.state.evidence[evidenceId] = { ...action.payload, evidence_id: evidenceId, case_id: action.caseId, authority_key: `${caseValue.charter_id}::${action.payload.authority_id}`,
        normalized_url: action.payload.source_url, normalized_hostname: new URL(action.payload.source_url).hostname, evidence_generation: caseValue.state === "OPEN" ? 0 : caseValue.generation + 1,
        admissibility_state: "ADMISSIBLE", fingerprint: `0x${"b".repeat(63)}${evidenceId.slice(-1)}` };
      caseValue.evidence_count += 1; suffix = evidenceId.slice(-8);
    } else if (action.type === "seal_evidence") {
      const caseValue = getOrThrow(this.state.cases[action.caseId], "CASE"); caseValue.evidence_root = rootFor(action.caseId, caseValue.generation, caseValue.evidence_count); caseValue.state = "EVIDENCE_SEALED"; suffix = action.caseId.slice(-8);
    } else if (action.type === "adjudicate") {
      this.resolve(action.caseId, 0, "", ""); suffix = action.caseId.slice(-8);
    } else if (action.type === "challenge") {
      const caseValue = getOrThrow(this.state.cases[action.caseId], "CASE"); if (caseValue.state !== "CHALLENGEABLE") throw new Error("CHALLENGE_NOT_ELIGIBLE");
      if (action.ground === "PROCEDURAL_VIOLATION" && action.proceduralReason !== "SEMANTIC_BOUNDARY_VIOLATION") throw new Error("INVALID_PROCEDURAL_REASON");
      const challengeId = id("CHAL", this.state.next.challenge++); caseValue.state = "CHALLENGED"; caseValue.pending_challenge_id = challengeId;
      caseValue.pending_evidence_root = rootFor(action.caseId, caseValue.generation + 1, caseValue.evidence_count); suffix = challengeId.slice(-8);
    } else if (action.type === "readjudicate") {
      const caseValue = getOrThrow(this.state.cases[action.caseId], "CASE"); if (caseValue.state !== "CHALLENGED") throw new Error("READJUDICATION_NOT_ELIGIBLE");
      this.resolve(action.caseId, caseValue.generation + 1, caseValue.pending_evidence_root, caseValue.pending_challenge_id); suffix = action.caseId.slice(-8);
    } else if (action.type === "finalize_case") {
      const caseValue = getOrThrow(this.state.cases[action.caseId], "CASE"); if (!caseValue.active_resolution_id) throw new Error("CASE_NOT_FINALIZABLE");
      caseValue.state = "FINAL"; caseValue.terminal = true; const resolution = this.state.resolutions[caseValue.active_resolution_id]; if (resolution) { resolution.status = "FINAL"; }
      suffix = action.caseId.slice(-8);
    }
    this.save();
    return { hash: `demo:${action.type}:${suffix}:${now}`, action, createdAt: now };
  }

  private resolve(caseId: string, generation: number, root: string, challengeId: string): void {
    const caseValue = getOrThrow(this.state.cases[caseId], "CASE");
    const previous = caseValue.active_resolution_id;
    const resolutionId = id("RES", this.state.next.resolution++);
    const evidenceIds = Object.values(this.state.evidence).filter((item) => item.case_id === caseId).map((item) => item.evidence_id);
    const resolution: Resolution = { resolution_id: resolutionId, case_id: caseId, generation, charter_hash: caseValue.charter_hash, schema_version: SCHEMA_VERSION,
      evidence_root: root || caseValue.evidence_root, evidence_ids: evidenceIds, adjudication_key: `0x${"e".repeat(64)}`, semantic_result: semanticYes,
      failure_causes: [], canonical_state: "CHALLENGEABLE", business_outcome: "YES", previous_resolution_id: previous, challenge_id: challengeId,
      status: "ACTIVE", resolved_at: Math.floor(Date.now() / 1000), challenge_deadline: Math.floor(Date.now() / 1000) + 86_400 };
    if (previous && this.state.resolutions[previous]) this.state.resolutions[previous].status = "SUPERSEDED";
    this.state.resolutions[resolutionId] = resolution; this.state.history[caseId] = [...(this.state.history[caseId] ?? []), resolutionId];
    caseValue.active_resolution_id = resolutionId; caseValue.generation = generation; caseValue.state = "CHALLENGEABLE"; caseValue.challenge_deadline = resolution.challenge_deadline; caseValue.last_resolution_at = resolution.resolved_at; caseValue.evidence_root = resolution.evidence_root; caseValue.pending_challenge_id = ""; caseValue.pending_evidence_root = "";
  }
}

export const demoAdapter = new ControlledDemoAdapter();
