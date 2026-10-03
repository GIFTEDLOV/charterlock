import { createClient } from "genlayer-js";
import { ExecutionResult } from "genlayer-js/types";
import type { Address } from "viem";
import { config } from "../config";
import type { Charter, CaseRecord, ContractInfo, EvidenceRecord, NetworkStatus, ProtocolAction, ProtocolAdapter, ReconciliationResult, Resolution } from "../domain/types";
import { normalizeAllowedOutcomes, normalizeSha256 } from "../domain/normalization";
import { requestBrowserAccount, readBrowserChainId, charterLockStudio, networkGuard } from "./chain";

type RawClient = ReturnType<typeof createClient>;
const address = () => {
  if (!config.contractAddress) throw new Error("CONTRACT_NOT_CONFIGURED");
  return config.contractAddress as Address;
};

function browserProvider(): unknown {
  return (window as Window & { ethereum?: unknown }).ethereum;
}

export class LiveGenLayerAdapter implements ProtocolAdapter {
  readonly mode = "live" as const;
  readonly label = "LIVE STUDIO-DEV ADAPTER";
  private client(account?: string): RawClient {
    return createClient({ chain: charterLockStudio as never, endpoint: config.rpcUrl, account: account as Address | undefined, provider: browserProvider() as never });
  }
  private async read(functionName: string, args: unknown[] = []): Promise<unknown> {
    return this.client().readContract({ address: address(), functionName, args: args as any });
  }
  async listCharterIds(): Promise<string[]> { return this.getCharterIds(); }
  async getCharterCount(): Promise<number> { return Number(await this.read("get_charter_count")); }
  async getCharter(id: string): Promise<Charter> { return await this.read("get_charter", [id]) as Charter; }
  async getCharterIds(): Promise<string[]> { return await this.read("get_charter_ids") as string[]; }
  async getCaseCount(): Promise<number> { return Number(await this.read("get_case_count")); }
  async getCaseIds(): Promise<string[]> { return await this.read("get_case_ids") as string[]; }
  async getCase(id: string): Promise<CaseRecord> { return await this.read("get_case", [id]) as CaseRecord; }
  async getEvidenceIds(caseId: string): Promise<string[]> { return await this.read("get_evidence_ids", [caseId]) as string[]; }
  async getEvidence(id: string): Promise<EvidenceRecord> { return await this.read("get_evidence", [id]) as EvidenceRecord; }
  async getResolution(id: string): Promise<Resolution> { return await this.read("get_resolution", [id]) as Resolution; }
  async getResolutionHistory(caseId: string): Promise<Resolution[]> { return await this.read("get_resolution_history", [caseId]) as Resolution[]; }
  async getContractInfo(): Promise<ContractInfo> { return await this.read("contract_info") as ContractInfo; }
  async network(): Promise<NetworkStatus> {
    if (!config.contractAddress) return networkGuard(CHAIN_ID_FALLBACK, undefined);
    try { return networkGuard(await readBrowserChainId(), config.contractAddress); }
    catch { return networkGuard(-1, config.contractAddress); }
  }
  async submit(action: ProtocolAction): Promise<{ hash: string; action: ProtocolAction; createdAt: number }> {
    if (!config.contractAddress) throw new Error("CONTRACT_NOT_CONFIGURED");
    const chain = await this.network();
    if (!chain.match) throw new Error("NETWORK_MISMATCH");
    const args = buildActionArgs(action);
    let account: string;
    try { account = await requestBrowserAccount(); } catch (error) { throw new Error(error instanceof Error ? error.message : "WALLET_REJECTED", { cause: error }); }
    const hash = await this.client(account).writeContract({ address: address(), functionName: action.type, args: args as any, value: 0n });
    return { hash: String(hash), action, createdAt: Date.now() };
  }
  async reconcile(hash: string): Promise<ReconciliationResult> {
    const transaction = await this.client().waitForFinalization({ hash: hash as any, fullTransaction: true });
    const executionSucceeded = transaction.txExecutionResultName === ExecutionResult.FINISHED_WITH_RETURN;
    return { hash, finalized: true, executionSucceeded, status: transaction.txExecutionResultName ?? transaction.statusName ?? String(transaction.status) };
  }
  async precondition(action: ProtocolAction): Promise<unknown> {
    if (action.type === "create_charter") return { ids: await this.getCharterIds() };
    if (action.type === "open_case") return { ids: await this.getCaseIds() };
    if (action.type === "add_evidence") return { case: await this.getCase(action.caseId), ids: await this.getEvidenceIds(action.caseId) };
    if ("charterId" in action) return await this.getCharter(action.charterId);
    if ("caseId" in action) return await this.getCase(action.caseId);
    return undefined;
  }
  async verifyPostcondition(action: ProtocolAction, precondition?: unknown): Promise<boolean> {
    try {
      switch (action.type) {
        case "create_charter": return (await this.getCharterIds()).length > snapshotIds(precondition).length;
        case "add_authority_rule": return (await this.getCharter(action.charterId)).authority_ids.length > (precondition as Charter).authority_ids.length;
        case "freeze_charter": return (await this.getCharter(action.charterId)).state === "FROZEN";
        case "open_case": return (await this.getCaseIds()).length > snapshotIds(precondition).length;
        case "add_evidence": return (await this.getCase(action.caseId)).evidence_count > ((precondition as { case: CaseRecord }).case).evidence_count;
        case "seal_evidence": return Boolean((await this.getCase(action.caseId)).evidence_root);
        case "adjudicate": case "readjudicate": return (await this.getCase(action.caseId)).active_resolution_id !== (precondition as CaseRecord).active_resolution_id;
        case "challenge": return (await this.getCase(action.caseId)).state === "CHALLENGED";
        case "finalize_case": return (await this.getCase(action.caseId)).terminal;
      }
    } catch { return false; }
  }
  async resolveCanonicalId(action: ProtocolAction, precondition?: unknown): Promise<string | undefined> {
    const before = snapshotIds(precondition);
    if (action.type === "create_charter") return uniqueNewId(before, await this.getCharterIds(), "CHARTER");
    if (action.type === "open_case") {
      const candidates = await uniqueNewId(before, await this.getCaseIds(), "CASE");
      const record = await this.getCase(candidates);
      if (record.charter_id !== action.charterId) throw new Error("CANONICAL_CASE_CHARTER_MISMATCH");
      return candidates;
    }
    if (action.type === "add_evidence") {
      const candidates = await uniqueNewId(snapshotIds(precondition), await this.getEvidenceIds(action.caseId), "EVIDENCE");
      const record = await this.getEvidence(candidates);
      if (record.case_id !== action.caseId) throw new Error("CANONICAL_EVIDENCE_CASE_MISMATCH");
      return candidates;
    }
    return undefined;
  }
}

const CHAIN_ID_FALLBACK = 0;
export function buildActionArgs(action: ProtocolAction): unknown[] {
  switch (action.type) {
    case "create_charter": return [action.payload.schema_version, action.payload.domain, action.payload.question, normalizeAllowedOutcomes(action.payload.allowed_outcomes), action.payload.event_deadline, action.payload.evidence_deadline, action.payload.temporal_semantics, action.payload.authority_policy, action.payload.source_policy, action.payload.min_corroboration, action.payload.conflict_policy, action.payload.unavailable_source_policy, action.payload.challenge_window_seconds, action.payload.max_challenge_generations];
    case "add_authority_rule": return [action.charterId, action.payload.authority_id, action.payload.authority_class, action.payload.hostname, action.payload.path_prefix, action.payload.subject, action.payload.priority];
    case "freeze_charter": case "open_case": return [action.charterId];
    case "seal_evidence": case "adjudicate": case "readjudicate": case "finalize_case": return [action.caseId];
    case "add_evidence": return [action.caseId, action.payload.authority_id, action.payload.source_url, normalizeSha256(action.payload.content_sha256), action.payload.content_byte_length, action.payload.observed_at, action.payload.published_at];
    case "challenge": return [action.caseId, action.ground, action.evidenceId, action.proceduralReason];
  }
}

function snapshotIds(value: unknown): string[] {
  if (typeof value === "number") return [];
  if (!value || typeof value !== "object") return [];
  const ids = (value as { ids?: unknown }).ids;
  return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === "string") : [];
}

async function uniqueNewId(before: string[], after: string[], label: string): Promise<string> {
  const candidates = after.filter((id) => !before.includes(id));
  if (candidates.length !== 1) throw new Error(candidates.length === 0 ? `${label}_READBACK_PENDING` : `AMBIGUOUS_${label}_READBACK`);
  return candidates[0];
}

export const liveAdapter = new LiveGenLayerAdapter();
