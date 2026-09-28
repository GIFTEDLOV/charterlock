import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import type { CaseRecord, Charter, ProtocolAction, Resolution, SemanticResult } from "../domain/types";
import { TEMPORAL_DESCRIPTIONS } from "../domain/types";
import type { TransactionPhase } from "../transactions/types";
import { adapter } from "../contract";
import { executeTransaction, type TransactionEvent } from "../transactions/engine";

export function Page({ eyebrow, title, description, actions, children }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode; children: ReactNode }) {
  return <div className="page"><div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{description && <p className="page-description">{description}</p>}</div>{actions && <div className="page-actions">{actions}</div>}</div>{children}</div>;
}

export function Panel({ title, eyebrow, children, className = "" }: { title?: string; eyebrow?: string; children: ReactNode; className?: string }) {
  return <section className={`panel ${className}`}>{(title || eyebrow) && <div className="panel-heading">{eyebrow && <div className="eyebrow">{eyebrow}</div>}{title && <h2>{title}</h2>}</div>}{children}</section>;
}

export function StatusPill({ value }: { value: string }) { const tone = value === "FINAL" || value === "FROZEN" || value === "ADMISSIBLE" || value === "YES" ? "positive" : value === "INCONCLUSIVE" || value === "EVIDENCE_CONFLICT" || value === "SOURCE_UNAVAILABLE" ? "caution" : value === "NO" ? "negative" : "neutral"; return <span className={`status-pill ${tone}`}>{value.replaceAll("_", " ")}</span>; }
export function Hash({ value, label }: { value: string; label?: string }) { return <div className="hash-wrap"><span className="hash-label">{label}</span><code title={value}>{value || "—"}</code>{value && <button className="copy-button" onClick={() => void navigator.clipboard?.writeText(value)} aria-label={`Copy ${label ?? "hash"}`}>Copy</button>}</div>; }
export function EmptyState({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) { return <div className="empty-state"><div className="empty-icon">◇</div><h3>{title}</h3><p>{children}</p>{action}</div>; }
export function StateMessage({ loading, error, children }: { loading: boolean; error?: string; children: ReactNode }) { if (loading) return <div className="state-message"><span className="spinner"></span>Loading canonical state…</div>; if (error) return <div className="state-message error-state"><strong>Read failed.</strong><span>{error}</span><small>The UI has not substituted local or guessed protocol state.</small></div>; return <>{children}</>; }

export function Stat({ label, value, detail, tone }: { label: string; value: ReactNode; detail?: string; tone?: string }) { return <div className={`stat ${tone ?? ""}`}><div className="stat-label">{label}</div><div className="stat-value">{value}</div>{detail && <div className="stat-detail">{detail}</div>}</div>; }

export function TransactionButton({ action, label, entityId, postcondition, disabled, onConfirmed }: { action: ProtocolAction; label: string; entityId?: string; postcondition: string; disabled?: boolean; onConfirmed?: () => void }) {
  const [phase, setPhase] = useState<TransactionPhase | null>(null); const [error, setError] = useState<string | null>(null);
  const run = async () => { setError(null); try { await executeTransaction(adapter, action, postcondition, entityId, (event: TransactionEvent) => setPhase(event.phase)); setPhase("CONFIRMED"); onConfirmed?.(); } catch (err) { setError(err instanceof Error ? err.message : "Transaction failed"); } };
  const busy = phase && !["CONFIRMED", "WALLET_REJECTED", "BROADCAST_FAILED", "HASH_UNKNOWN", "RPC_TIMEOUT", "FINALIZED_EXECUTION_FAILED", "CANONICAL_POSTCONDITION_FAILED", "NETWORK_MISMATCH"].includes(phase);
  return <div className="tx-action"><button className="button primary" onClick={() => void run()} disabled={disabled || Boolean(busy)}>{busy ? <><span className="spinner small"></span>{phase.replaceAll("_", " ")}</> : label}</button>{phase === "CONFIRMED" && <span className="tx-success">Canonical readback confirmed</span>}{error && <span className="tx-error">{error.replaceAll("_", " ")}</span>}</div>;
}

export function LifecycleRail({ caseRecord }: { caseRecord: CaseRecord }) { const states = ["Charter frozen", "Case open", "Evidence sealed", "Adjudication", "Challenge window", "Final"]; const index = caseRecord.state === "OPEN" ? 1 : caseRecord.state === "EVIDENCE_SEALED" ? 2 : caseRecord.state === "CHALLENGEABLE" ? 4 : caseRecord.state === "CHALLENGED" || caseRecord.state === "READJUDICATED" ? 4 : caseRecord.state === "FINAL" ? 5 : 0; return <div className="lifecycle">{states.map((state, i) => <div className={`lifecycle-step ${i <= index ? "complete" : ""} ${i === index ? "current" : ""}`} key={state}><span className="lifecycle-dot">{i < index ? "✓" : i + 1}</span><span>{state}</span></div>)}</div>; }

export function FactVector({ semantic }: { semantic: SemanticResult }) { const values: [keyof SemanticResult, string][] = [["selected_outcome", "Selected outcome"], ["event_occurred", "Event occurred"], ["event_before_deadline", "Event before deadline"], ["confirmation_before_deadline", "Confirmation before deadline"], ["authority_requirement_met", "Authority requirement met"], ["corroboration_requirement_met", "Corroboration requirement met"], ["evidence_conflict", "Evidence conflict"], ["evidence_sufficient", "Evidence sufficient"]]; return <div className="fact-grid">{values.map(([key, label]) => <div className="fact-row" key={key}><span>{label}</span><strong className={semantic[key] === true || semantic[key] === "YES" ? "fact-true" : semantic[key] === false || semantic[key] === "NO" ? "fact-false" : ""}>{String(semantic[key])}</strong></div>)}</div>; }

export function ResolutionSummary({ resolution, charter }: { resolution: Resolution; charter: Charter }) { return <div className="resolution-summary"><div><div className="eyebrow">Canonical outcome</div><div className={`outcome outcome-${resolution.business_outcome || resolution.canonical_state.toLowerCase()}`}>{resolution.business_outcome || resolution.canonical_state}</div><p className="muted">Derived from bounded validator facts under <strong>{charter.temporal_semantics}</strong>. Model prose is not authoritative state.</p></div><div className="resolution-meta"><div><span>Generation</span><strong>{resolution.generation + 1}</strong></div><div><span>Status</span><StatusPill value={resolution.status} /></div><div><span>Evidence root</span><code>{resolution.evidence_root.slice(0, 18)}…</code></div></div></div>; }

export function TemporalNote({ charter }: { charter: Charter }) { return <div className="temporal-note"><div className="eyebrow">Frozen temporal rule</div><strong>{charter.temporal_semantics.replaceAll("_", " ")}</strong><p>{TEMPORAL_DESCRIPTIONS[charter.temporal_semantics]}</p></div>; }

export function LoadLink({ href, children }: { href: string; children: ReactNode }) { return <Link className="text-link" to={href}>{children} ↗</Link>; }
