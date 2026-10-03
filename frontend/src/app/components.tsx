import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import type { CaseRecord, Charter, ProtocolAction, Resolution, SemanticResult } from "../domain/types";
import { TEMPORAL_DESCRIPTIONS } from "../domain/types";
import type { TransactionPhase } from "../transactions/types";
import { adapter } from "../contract";
import { config } from "../config";
import { executeTransaction, type TransactionEvent } from "../transactions/engine";

export function Page({ eyebrow, title, description, actions, children }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode; children: ReactNode }) {
  const location = useLocation();
  return <div className="page"><div className="location-trail"><span>CharterLock</span><span aria-hidden="true">/</span><strong>{routeLabel(location.pathname, title)}</strong></div><div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{description && <p className="page-description">{description}</p>}</div>{actions && <div className="page-actions">{actions}</div>}</div>{children}</div>;
}

export function Panel({ title, eyebrow, children, className = "" }: { title?: string; eyebrow?: string; children: ReactNode; className?: string }) {
  return <section className={`panel ${className}`}>{(title || eyebrow) && <div className="panel-heading">{eyebrow && <div className="eyebrow">{eyebrow}</div>}{title && <h2>{title}</h2>}</div>}{children}</section>;
}

export function StatusPill({ value }: { value: string }) {
  const tone = value === "FINAL" || value === "FROZEN" || value === "ADMISSIBLE" || value === "YES" || value === "ACTIVE" ? "positive" : value === "INCONCLUSIVE" || value === "EVIDENCE_CONFLICT" || value === "SOURCE_UNAVAILABLE" || value === "CHALLENGEABLE" ? "caution" : value === "NO" || value === "FAILED" ? "negative" : "neutral";
  return <span className={`status-pill ${tone}`} data-status={value} aria-label={`Status: ${value.replaceAll("_", " ")}`}><span className="status-glyph" aria-hidden="true">●</span>{value.replaceAll("_", " ")}</span>;
}

export function Hash({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => { if (!value) return; await navigator.clipboard?.writeText(value); setCopied(true); window.setTimeout(() => setCopied(false), 1400); };
  return <div className="hash-wrap"><span className="hash-label">{label}</span><code title={value}>{value || "—"}</code>{value && <button className="copy-button" type="button" onClick={() => void copy()} aria-label={`Copy ${label ?? "hash"}`}>{copied ? "Copied" : "Copy"}</button>}</div>;
}

export function EmptyState({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return <div className="empty-state"><span className="empty-kicker">EMPTY STATE</span><h3>{title}</h3><p>{children}</p>{action}</div>;
}

export function StateMessage({ loading, error, children }: { loading: boolean; error?: string; children: ReactNode }) {
  if (loading) return <div className="skeleton-stack" aria-label="Loading canonical state"><span className="skeleton-line wide"></span><span className="skeleton-line"></span><span className="skeleton-block"></span></div>;
  if (error) return <div className="state-message error-state"><span className="state-icon" aria-hidden="true">!</span><div><strong>Canonical read failed</strong><span>{error}</span><small>The UI has not substituted local or guessed protocol state.</small></div></div>;
  return <>{children}</>;
}

export function Stat({ label, value, detail, tone }: { label: string; value: ReactNode; detail?: string; tone?: string }) {
  return <div className={`stat ${tone ?? ""}`}><div className="stat-label">{label}</div><div className="stat-value">{value}</div>{detail && <div className="stat-detail">{detail}</div>}</div>;
}

export function PropertyList({ rows }: { rows: Array<[string, ReactNode, ReactNode?]> }) {
  return <dl className="property-list">{rows.map(([label, value, detail]) => <div className="property-row" key={label}><dt>{label}</dt><dd>{value}{detail && <small>{detail}</small>}</dd></div>)}</dl>;
}

export function TransactionButton({ action, label, entityId, postcondition, disabled, onConfirmed }: { action: ProtocolAction; label: string; entityId?: string; postcondition: string; disabled?: boolean; onConfirmed?: (transaction: Awaited<ReturnType<typeof executeTransaction>>) => void }) {
  const [phase, setPhase] = useState<TransactionPhase | null>(null); const [error, setError] = useState<string | null>(null); const [hash, setHash] = useState<string | null>(null);
  const run = async () => { setError(null); try { const transaction = await executeTransaction(adapter, action, postcondition, entityId, (event: TransactionEvent) => { setPhase(event.phase); if (event.hash) setHash(event.hash); }); setPhase("CONFIRMED"); onConfirmed?.(transaction); } catch (err) { setError(err instanceof Error ? err.message : "Transaction failed"); } };
  const terminal = ["CONFIRMED", "WALLET_REJECTED", "BROADCAST_FAILED", "HASH_UNKNOWN", "RPC_TIMEOUT", "FINALIZED_EXECUTION_FAILED", "CANONICAL_POSTCONDITION_FAILED", "NETWORK_MISMATCH"];
  const busy = phase && !terminal.includes(phase);
  return <div className="tx-action"><button className="button primary" type="button" onClick={() => void run()} disabled={disabled || Boolean(busy)}>{busy ? <><span className="spinner small"></span>{phase.replaceAll("_", " ")}</> : label}</button>{hash && phase !== "CONFIRMED" && <code className="tx-hash">{hash.slice(0, 18)}…</code>}{phase === "CONFIRMED" && <span className="tx-success">Canonical readback confirmed</span>}{error && <span className="tx-error" role="alert">{error.replaceAll("_", " ")}</span>}</div>;
}

export function LiveWalletDiagnostic() {
  const [wallet, setWallet] = useState<{ available: boolean; account: string | null; chainId: number | null; error?: string }>(() => { const ethereum = typeof window !== "undefined" ? (window as Window & { ethereum?: unknown }).ethereum : undefined; return ethereum ? { available: true, account: null, chainId: null } : { available: false, account: null, chainId: null, error: "No injected wallet detected in this browser session." }; });
  useEffect(() => { if (config.mode !== "live") return; const ethereum = (window as Window & { ethereum?: { request(args: { method: string }): Promise<unknown> } }).ethereum; if (!ethereum) return; void Promise.all([ethereum.request({ method: "eth_accounts" }), ethereum.request({ method: "eth_chainId" })]).then(([accounts, chain]) => { const list = Array.isArray(accounts) ? accounts : []; const chainId = typeof chain === "string" ? Number.parseInt(chain, 16) : null; setWallet({ available: true, account: typeof list[0] === "string" ? list[0] : null, chainId }); }).catch(() => setWallet({ available: true, account: null, chainId: null, error: "Wallet read failed; no approval was requested." })); }, []);
  const networkMatch = wallet.chainId === config.chainId && Boolean(config.contractAddress);
  const rows = [["Wallet connected", wallet.account ? "YES" : wallet.available ? "NO ACCOUNT" : "NOT DETECTED", wallet.account ?? "No address read; connect manually to begin."], ["Network", networkMatch ? "MATCHED" : wallet.chainId ? "MISMATCH" : "NOT READ", "Studio-dev"], ["Chain", wallet.chainId ? String(wallet.chainId) : "NOT READ", `Expected ${config.chainId}`], ["Contract", config.contractAddress ?? "NOT CONFIGURED", "Locked deployment target"], ["Production app", config.productionUrl, "Current release target"], ["Repository", config.repositoryUrl, "Canonical source"], ["Precondition", "PENDING MANUAL", "Canonical count read before signing"], ["Write action", "create_charter", "BROWSER WALLET QUALIFICATION"], ["Wallet approval", "PENDING MANUAL", "No approval requested by this diagnostic"], ["Submitted hash", "NOT YET OBSERVED", "Capture the exact hash after approval"], ["Hash persisted", "NOT YET OBSERVED", "Persist before prolonged polling"], ["Reconciliation", "PENDING MANUAL", "Reconcile the same hash only"], ["Finality", "PENDING MANUAL", "Require finalized lifecycle status"], ["Execution result", "PENDING MANUAL", "Require successful GenLayer execution"], ["Canonical readback", "PENDING MANUAL", "Confirm the created charter from chain state"]];
  return <Panel eyebrow="Operator diagnostic" title="LIVE wallet qualification path" className="wallet-diagnostic-panel"><p className="muted">Read-only wallet discovery. Approval is never requested automatically; use the manual qualification guide for the single bounded write.</p>{wallet.error && <div className="state-message error-state wallet-diagnostic-error"><span className="state-icon" aria-hidden="true">!</span><div><strong>Wallet session unavailable</strong><span>{wallet.error}</span></div></div>}<div className="wallet-diagnostic-grid" data-testid="live-wallet-diagnostic">{rows.map(([label, value, detail]) => <div className="wallet-diagnostic-row" key={label}><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>)}</div></Panel>;
}

export function LifecycleRail({ caseRecord }: { caseRecord: CaseRecord }) {
  const states = ["Opened", "Evidence", "Sealed", "Adjudicated", "Challenge", "Final"];
  const index = caseRecord.state === "OPEN" ? 1 : caseRecord.state === "EVIDENCE_SEALED" ? 2 : caseRecord.state === "CHALLENGEABLE" ? 4 : caseRecord.state === "CHALLENGED" || caseRecord.state === "READJUDICATED" ? 4 : caseRecord.state === "FINAL" ? 5 : 0;
  return <div className="lifecycle" aria-label="Case lifecycle">{states.map((state, i) => <div className={`lifecycle-step ${i <= index ? "complete" : ""} ${i === index ? "current" : ""}`} key={state}><span className="lifecycle-dot">{i < index ? "✓" : String(i + 1).padStart(2, "0")}</span><span>{state}</span></div>)}</div>;
}

export function FactVector({ semantic }: { semantic: SemanticResult }) {
  const values: [keyof SemanticResult, string, string][] = [["event_occurred", "Event occurred", "Does the event exist?"], ["event_before_deadline", "Before deadline", "Temporal event condition"], ["confirmation_before_deadline", "Confirmation before deadline", "Temporal confirmation condition"], ["authority_requirement_met", "Authority satisfied", "Registered authority condition"], ["corroboration_requirement_met", "Corroboration satisfied", "Evidence count condition"], ["evidence_conflict", "Evidence conflict", "Conflict policy condition"], ["evidence_sufficient", "Evidence sufficient", "Technical admissibility condition"]];
  return <div className="fact-matrix"><div className="fact-matrix-head"><span>Fact</span><span>Value</span><span>Policy effect</span></div>{values.map(([key, label, effect]) => { const value = semantic[key]; const truth = value === true || value === "YES"; const falsehood = value === false || value === "NO"; return <div className="fact-row" key={key}><span><i className={`fact-mark ${truth ? "true" : falsehood ? "false" : "neutral"}`} aria-hidden="true"></i>{label}</span><strong className={truth ? "fact-true" : falsehood ? "fact-false" : "fact-neutral"}>{String(value)}</strong><small>{effect}</small></div>; })}<div className="fact-derived"><span>Canonical derivation</span><strong>{semantic.selected_outcome === "INCONCLUSIVE" || !semantic.evidence_sufficient ? "Technical state — business outcome not produced" : semantic.selected_outcome}</strong></div></div>;
}

export function ResolutionSummary({ resolution, charter }: { resolution: Resolution; charter: Charter }) {
  const outcome = resolution.business_outcome || resolution.canonical_state;
  return <div className="resolution-summary"><div className="resolution-primary"><div className="eyebrow">Technical resolution</div><div className={`outcome outcome-${outcome.toLowerCase()}`}>{outcome}</div><p className="muted">Business outcome <strong>{resolution.business_outcome || "Not produced"}</strong></p></div><div className="resolution-meta"><div><span>Generation</span><strong>{resolution.generation + 1}</strong></div><div><span>Status</span><StatusPill value={resolution.status} /></div><div><span>Temporal rule</span><strong>{charter.temporal_semantics.replaceAll("_", " ")}</strong></div><div><span>Evidence root</span><Hash value={resolution.evidence_root} /></div></div></div>;
}

export function TemporalNote({ charter }: { charter: Charter }) { return <div className="temporal-note"><div className="eyebrow">Frozen temporal rule</div><strong>{charter.temporal_semantics.replaceAll("_", " ")}</strong><p>{TEMPORAL_DESCRIPTIONS[charter.temporal_semantics]}</p></div>; }
export function LoadLink({ href, children }: { href: string; children: ReactNode }) { return <Link className="text-link" to={href}>{children} <span aria-hidden="true">↗</span></Link>; }

function routeLabel(pathname: string, title: string) { if (pathname === "/" || pathname === "/app") return "Overview"; if (pathname.startsWith("/charters/new")) return "Charters / New charter"; if (pathname.startsWith("/charters/")) return `Charters / ${pathname.split("/")[2]}`; if (pathname === "/charters") return "Charters"; if (pathname.startsWith("/cases/")) return `Cases / ${pathname.split("/")[2]}${pathname.split("/")[3] ? ` / ${pathname.split("/")[3]}` : ""}`; return title; }
