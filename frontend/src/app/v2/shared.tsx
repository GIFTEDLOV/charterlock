import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import type { CaseRecord, Charter, Resolution, SemanticResult } from "../../domain/types";
import { config } from "../../config";
import { adapter } from "../../contract";
import { Hash, StateMessage, StatusPill, TransactionButton } from "../components";
import { useData } from "../hooks";
import { display, formatTimestamp } from "./helpers";

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  const location = useLocation();
  const parts = location.pathname.split("/").filter(Boolean);
  const trail = parts.length > 1 ? parts.map((part) => part.replaceAll("-", " ")).join(" / ") : undefined;
  return <div className="page-header"><div className="page-header-copy">{trail && <div className="page-context">{trail}</div>}{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{actions && <div className="page-header-actions">{actions}</div>}</div>;
}

export function SectionHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="section-heading"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h2>{title}</h2>{description && <p>{description}</p>}</div>{action}</div>;
}

export function PropertyRows({ rows }: { rows: Array<[string, ReactNode, ReactNode?]> }) {
  return <dl className="property-rows">{rows.map(([label, value, detail]) => <div className="property-line" key={label}><dt>{label}</dt><dd>{value}{detail && <small>{detail}</small>}</dd></div>)}</dl>;
}

export function Surface({ children, className = "" }: { children: ReactNode; className?: string }) { return <section className={`surface ${className}`}>{children}</section>; }

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) { return <div className="empty-state"><span className="empty-kicker">NO CANONICAL OBJECTS</span><h3>{title}</h3><p>{description}</p>{action}</div>; }

export function HashValue({ value, label = "Value" }: { value?: string; label?: string }) { return <Hash value={value ?? ""} label={label} />; }

export function StatusLine({ value, label }: { value: string; label?: string }) { return <span className="status-line"><i className="status-dot" data-tone={value === "YES" || value === "FINAL" || value === "FROZEN" ? "positive" : value === "NO" ? "negative" : "neutral"}></i>{label ?? display(value)}</span>; }

export function ContextualWriteNote({ children }: { children: ReactNode }) { return <div className="contextual-write-note"><span aria-hidden="true">!</span><div>{children}</div></div>; }

export function LifecycleRail({ caseRecord }: { caseRecord: CaseRecord }) {
  const labels = ["OPEN", "EVIDENCE", "SEALED", "ADJUDICATED", "CHALLENGE", "FINAL"];
  const index = caseRecord.state === "OPEN" ? 0 : caseRecord.state === "EVIDENCE_SEALED" ? 2 : caseRecord.state === "CHALLENGEABLE" || caseRecord.state === "CHALLENGED" || caseRecord.state === "READJUDICATED" ? 4 : caseRecord.state === "FINAL" ? 5 : 0;
  return <div className="lifecycle-rail" aria-label="Case lifecycle">{labels.map((label, itemIndex) => <div className={`lifecycle-item ${itemIndex <= index ? "complete" : ""} ${itemIndex === index ? "current" : ""}`} key={label}><span>{itemIndex < index ? "✓" : String(itemIndex + 1).padStart(2, "0")}</span><small>{label}</small></div>)}</div>;
}

const semanticRows: Array<[keyof SemanticResult, string, string]> = [
  ["event_occurred", "Event occurred", "Event condition"],
  ["event_before_deadline", "Before deadline", "Temporal event condition"],
  ["confirmation_before_deadline", "Confirmation before deadline", "Temporal confirmation"],
  ["authority_requirement_met", "Authority met", "Registered authority"],
  ["corroboration_requirement_met", "Corroboration met", "Evidence count"],
  ["evidence_conflict", "Evidence conflict", "Conflict policy"],
  ["evidence_sufficient", "Evidence sufficient", "Technical admissibility"],
];

export function SemanticMatrix({ semantic }: { semantic: SemanticResult }) {
  const boolText = (value: boolean) => value ? "TRUE" : "FALSE";
  return <div className="semantic-matrix"><div className="semantic-row semantic-head"><span>FACT</span><span>VALUE</span><span>POLICY EFFECT</span></div>{semanticRows.map(([key, label, effect]) => <div className="semantic-row" key={key}><span>{label}</span><strong className={semantic[key] === true ? "fact-positive" : "fact-neutral"}>{boolText(semantic[key] === true)}</strong><small>{effect}</small></div>)}<div className="semantic-row semantic-derived"><span>CANONICAL DERIVATION</span><strong>{semantic.selected_outcome}</strong><small>{semantic.evidence_sufficient ? "Business state may be derived by frozen policy." : "Business outcome intentionally not produced."}</small></div></div>;
}

export function ResolutionBlock({ resolution, charter }: { resolution: Resolution; charter: Charter }) {
  const technical = resolution.canonical_state;
  return <div className="resolution-block"><div className="resolution-state"><span className="eyebrow">TECHNICAL RESULT</span><strong className={`technical-result result-${technical.toLowerCase()}`}>{technical}</strong><span>Business result</span><b>{resolution.business_outcome || "NOT PRODUCED"}</b></div><div className="resolution-facts"><PropertyRows rows={[["Generation", resolution.generation + 1], ["Status", <StatusPill value={resolution.status} />], ["Temporal rule", display(charter.temporal_semantics)], ["Evidence root", <HashValue value={resolution.evidence_root} label="Root" />]]} /></div></div>;
}

export function EvidenceLedger({ ids, expandedId, onExpand }: { ids: string[]; expandedId?: string; onExpand?: (id: string) => void }) {
  if (!ids.length) return <EmptyState title="Evidence ledger is empty" description="Evidence appears after identity, authority, and transport have been committed canonically." />;
  return <div className="evidence-ledger"><div className="evidence-grid evidence-grid-head"><span>ID</span><span>AUTHORITY</span><span>ORIGIN</span><span>BYTES</span><span>SHA</span><span>STATUS</span></div>{ids.map((id) => <EvidenceLedgerRow key={id} id={id} expanded={expandedId === id} onExpand={onExpand} />)}</div>;
}

function EvidenceLedgerRow({ id, expanded, onExpand }: { id: string; expanded: boolean; onExpand?: (id: string) => void }) {
  const data = useData(() => adapter.getEvidence(id), [id]); const evidence = data.data;
  return <div className={`evidence-record ${expanded ? "expanded" : ""}`}><button className="evidence-grid evidence-record-button" type="button" aria-expanded={expanded} onClick={() => onExpand?.(id)}><span className="mono">{id}</span><span>{evidence?.authority_id ?? "Reading…"}</span><span className="muted">{evidence?.normalized_hostname ?? "Reading…"}</span><span>{evidence?.content_byte_length ?? "—"}</span><span className="mono">{evidence?.content_sha256 ? `${evidence.content_sha256.slice(0, 10)}…` : "—"}</span><StatusLine value={evidence?.admissibility_state ?? "PENDING"} /></button>{expanded && evidence && <div className="evidence-record-inspector"><div><span className="eyebrow">IDENTITY</span><strong>Exact committed bytes and SHA-256</strong><code>{evidence.content_sha256}</code><span>{evidence.content_byte_length} bytes</span></div><div><span className="eyebrow">AUTHORITY</span><strong>{evidence.authority_id}</strong><code>{evidence.normalized_hostname}</code><span className="muted">Authority binding is checked canonically.</span></div><div><span className="eyebrow">TRANSPORT / TIMING</span><strong>{evidence.normalized_url}</strong><span>Observed {formatTimestamp(evidence.observed_at)} · Published {formatTimestamp(evidence.published_at)}</span></div><div><span className="eyebrow">VERIFICATION</span><strong>{evidence.admissibility_state}</strong><span>Generation {evidence.evidence_generation + 1} · fingerprint {evidence.fingerprint.slice(0, 14)}…</span></div></div>}</div>;
}

export function LineageTimeline({ history }: { history: Resolution[] }) {
  if (!history.length) return <EmptyState title="No resolution lineage" description="The append-only history appears after the first adjudication." />;
  return <div className="lineage-timeline">{history.map((resolution, index) => <div className="lineage-entry" key={resolution.resolution_id}><div className="lineage-marker"><span>{String(index).padStart(2, "0")}</span>{index < history.length - 1 && <i />}</div><div className="lineage-entry-body"><div className="lineage-entry-head"><strong>Generation {resolution.generation + 1}</strong><StatusPill value={resolution.status} /></div><HashValue value={resolution.resolution_id} label="Resolution" /><PropertyRows rows={[["Evidence root", <HashValue value={resolution.evidence_root} label="Root" />], ["Technical state", resolution.canonical_state], ["Outcome", resolution.business_outcome || "Not produced"], ["Resolved", formatTimestamp(resolution.resolved_at)]]} />{index < history.length - 1 && <span className="lineage-transition">Superseded by next generation</span>}</div></div>)}</div>;
}

export function WalletDiagnosticLink() { return config.mode === "live" ? <span className="context-status">Wallet qualification available in a real browser session</span> : <span className="context-status">Controlled mode · no wallet write requested</span>; }

export function TransactionProgress({ action, label, entityId, postcondition, disabled, onConfirmed }: { action: Parameters<typeof TransactionButton>[0]["action"]; label: string; entityId?: string; postcondition: string; disabled?: boolean; onConfirmed?: () => void }) {
  return <TransactionButton action={action} label={label} entityId={entityId} postcondition={postcondition} disabled={disabled} onConfirmed={onConfirmed} />;
}

export { StateMessage };
