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
  return <span className={`status-pill ${tone}`} data-status={value} aria-label={`Status: ${value.replaceAll("_", " ")}`}><span className="status-glyph" aria-hidden="true">{tone === "positive" ? "✓" : tone === "negative" ? "!" : tone === "caution" ? "·" : "—"}</span>{value.replaceAll("_", " ")}</span>;
}

export function Hash({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (!value) return;
    await navigator.clipboard?.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };
  return <div className="hash-wrap"><span className="hash-label">{label}</span><code title={value}>{value || "—"}</code>{value && <button className="copy-button" onClick={() => void copy()} aria-label={`Copy ${label ?? "hash"}`}>{copied ? "Copied" : "Copy"}</button>}</div>;
}

export function EmptyState({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return <div className="empty-state"><div className="empty-icon" aria-hidden="true">◇</div><h3>{title}</h3><p>{children}</p>{action}</div>;
}

export function StateMessage({ loading, error, children }: { loading: boolean; error?: string; children: ReactNode }) {
  if (loading) return <div className="skeleton-stack" aria-label="Loading canonical state"><span className="skeleton-line wide"></span><span className="skeleton-line"></span><span className="skeleton-block"></span></div>;
  if (error) return <div className="state-message error-state"><span className="state-icon" aria-hidden="true">!</span><div><strong>Canonical read failed</strong><span>{error}</span><small>The UI has not substituted local or guessed protocol state.</small></div></div>;
  return <>{children}</>;
}

export function Stat({ label, value, detail, tone }: { label: string; value: ReactNode; detail?: string; tone?: string }) {
  return <div className={`stat ${tone ?? ""}`}><div className="stat-label">{label}</div><div className="stat-value">{value}</div>{detail && <div className="stat-detail">{detail}</div>}</div>;
}

export function TransactionButton({ action, label, entityId, postcondition, disabled, onConfirmed }: { action: ProtocolAction; label: string; entityId?: string; postcondition: string; disabled?: boolean; onConfirmed?: () => void }) {
  const [phase, setPhase] = useState<TransactionPhase | null>(null);
  const [error, setError] = useState<string | null>(null);
  const run = async () => {
    setError(null);
    try {
      await executeTransaction(adapter, action, postcondition, entityId, (event: TransactionEvent) => setPhase(event.phase));
      setPhase("CONFIRMED");
      onConfirmed?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaction failed");
    }
  };
  const busy = phase && !["CONFIRMED", "WALLET_REJECTED", "BROADCAST_FAILED", "HASH_UNKNOWN", "RPC_TIMEOUT", "FINALIZED_EXECUTION_FAILED", "CANONICAL_POSTCONDITION_FAILED", "NETWORK_MISMATCH"].includes(phase);
  return <div className="tx-action"><button className="button primary" onClick={() => void run()} disabled={disabled || Boolean(busy)}>{busy ? <><span className="spinner small"></span>{phase.replaceAll("_", " ")}</> : label}</button>{phase === "CONFIRMED" && <span className="tx-success">Canonical readback confirmed</span>}{error && <span className="tx-error" role="alert">{error.replaceAll("_", " ")}</span>}</div>;
}

export function LiveWalletDiagnostic() {
  const [wallet, setWallet] = useState<{ available: boolean; account: string | null; chainId: number | null; error?: string }>(() => {
    const ethereum = typeof window !== "undefined" ? (window as Window & { ethereum?: unknown }).ethereum : undefined;
    return ethereum ? { available: true, account: null, chainId: null } : { available: false, account: null, chainId: null, error: "No injected wallet detected in this browser session." };
  });

  useEffect(() => {
    if (config.mode !== "live") return;
    const ethereum = (window as Window & { ethereum?: { request(args: { method: string }): Promise<unknown> } }).ethereum;
    if (!ethereum) return;
    void Promise.all([ethereum.request({ method: "eth_accounts" }), ethereum.request({ method: "eth_chainId" })]).then(([accounts, chain]) => {
      const list = Array.isArray(accounts) ? accounts : [];
      const chainId = typeof chain === "string" ? Number.parseInt(chain, 16) : null;
      setWallet({ available: true, account: typeof list[0] === "string" ? list[0] : null, chainId });
    }).catch(() => setWallet({ available: true, account: null, chainId: null, error: "Wallet read failed; no approval was requested." }));
  }, []);

  const networkMatch = wallet.chainId === config.chainId && Boolean(config.contractAddress);
  const rows = [
    ["Wallet connected", wallet.account ? "YES" : wallet.available ? "NO ACCOUNT" : "NOT DETECTED", wallet.account ?? "No address read; connect manually to begin."],
    ["Network", networkMatch ? "MATCHED" : wallet.chainId ? "MISMATCH" : "NOT READ", "Studio-dev"],
    ["Chain", wallet.chainId ? String(wallet.chainId) : "NOT READ", `Expected ${config.chainId}`],
    ["Contract", config.contractAddress ?? "NOT CONFIGURED", "Locked deployment target"],
    ["Precondition", "PENDING MANUAL", "Canonical count read before signing"],
    ["Write action", "create_charter", "BROWSER WALLET QUALIFICATION"],
    ["Wallet approval", "PENDING MANUAL", "No approval requested by this diagnostic"],
    ["Submitted hash", "NOT YET OBSERVED", "Capture the exact hash after approval"],
    ["Hash persisted", "NOT YET OBSERVED", "Persist before prolonged polling"],
    ["Reconciliation", "PENDING MANUAL", "Reconcile the same hash only"],
    ["Finality", "PENDING MANUAL", "Require finalized lifecycle status"],
    ["Execution result", "PENDING MANUAL", "Require successful GenLayer execution"],
    ["Canonical readback", "PENDING MANUAL", "Confirm the created charter from chain state"],
  ];
  return <Panel eyebrow="Reviewer / operator diagnostic" title="LIVE wallet qualification path" className="wallet-diagnostic-panel"><p className="muted">Read-only wallet discovery only. The page never requests approval automatically; use the manual qualification guide for the single bounded write.</p>{wallet.error && <div className="state-message error-state wallet-diagnostic-error"><span className="state-icon" aria-hidden="true">!</span><div><strong>Wallet session unavailable</strong><span>{wallet.error}</span></div></div>}<div className="wallet-diagnostic-grid" data-testid="live-wallet-diagnostic">{rows.map(([label, value, detail]) => <div className="wallet-diagnostic-row" key={label}><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>)}</div></Panel>;
}

export function LifecycleRail({ caseRecord }: { caseRecord: CaseRecord }) {
  const states = ["Opened", "Evidence", "Sealed", "Adjudicated", "Challenge", "Final"];
  const index = caseRecord.state === "OPEN" ? 1 : caseRecord.state === "EVIDENCE_SEALED" ? 2 : caseRecord.state === "CHALLENGEABLE" ? 4 : caseRecord.state === "CHALLENGED" || caseRecord.state === "READJUDICATED" ? 4 : caseRecord.state === "FINAL" ? 5 : 0;
  return <div className="lifecycle" aria-label="Case lifecycle">{states.map((state, i) => <div className={`lifecycle-step ${i <= index ? "complete" : ""} ${i === index ? "current" : ""}`} key={state}><span className="lifecycle-dot">{i < index ? "✓" : String(i + 1).padStart(2, "0")}</span><span>{state}</span></div>)}</div>;
}

export function FactVector({ semantic }: { semantic: SemanticResult }) {
  const values: [keyof SemanticResult, string, string][] = [
    ["selected_outcome", "Selected outcome", "semantic"],
    ["event_occurred", "Event occurred", "event"],
    ["event_before_deadline", "Before event deadline", "time"],
    ["confirmation_before_deadline", "Before confirmation deadline", "time"],
    ["authority_requirement_met", "Authority satisfied", "evidence"],
    ["corroboration_requirement_met", "Corroboration satisfied", "evidence"],
    ["evidence_conflict", "Evidence conflict", "risk"],
    ["evidence_sufficient", "Evidence sufficient", "evidence"],
  ];
  return <div className="fact-matrix"><div className="fact-matrix-head"><span>Fact</span><span>Value</span><span>Effect</span></div>{values.map(([key, label, group]) => { const value = semantic[key]; const truth = value === true || value === "YES"; const falsehood = value === false || value === "NO"; return <div className="fact-row" key={key}><span><i className={`fact-mark ${group}`} aria-hidden="true"></i>{label}</span><strong className={truth ? "fact-true" : falsehood ? "fact-false" : "fact-neutral"}>{String(value)}</strong><small>{key === "selected_outcome" ? "Validator selection" : truth ? "Supports derivation" : falsehood ? "Does not support derivation" : "No business conclusion"}</small></div>; })}</div>;
}

export function ResolutionSummary({ resolution, charter }: { resolution: Resolution; charter: Charter }) {
  const outcome = resolution.business_outcome || resolution.canonical_state;
  return <div className="resolution-summary"><div className="resolution-primary"><div className="eyebrow">Canonical state</div><div className={`outcome outcome-${outcome.toLowerCase()}`}>{outcome}</div><p className="muted">Derived from bounded validator facts under <strong>{charter.temporal_semantics}</strong>. Model prose is not authoritative state.</p></div><div className="resolution-meta"><div><span>Generation</span><strong>{resolution.generation + 1}</strong></div><div><span>Status</span><StatusPill value={resolution.status} /></div><div><span>Business result</span><strong>{resolution.business_outcome || "Not produced"}</strong></div><div><span>Evidence root</span><code>{resolution.evidence_root.slice(0, 18)}…</code></div></div></div>;
}

export function TemporalNote({ charter }: { charter: Charter }) {
  return <div className="temporal-note"><div className="eyebrow">Frozen temporal rule</div><strong>{charter.temporal_semantics.replaceAll("_", " ")}</strong><p>{TEMPORAL_DESCRIPTIONS[charter.temporal_semantics]}</p></div>;
}

export function LoadLink({ href, children }: { href: string; children: ReactNode }) { return <Link className="text-link" to={href}>{children} <span aria-hidden="true">↗</span></Link>; }

function routeLabel(pathname: string, title: string) {
  if (pathname === "/" || pathname === "/app") return "Overview";
  if (pathname.startsWith("/charters/new")) return "Charters / New charter";
  if (pathname.startsWith("/charters/")) return `Charters / ${pathname.split("/")[2]}`;
  if (pathname === "/charters") return "Charters";
  if (pathname.startsWith("/cases/")) return `Cases / ${pathname.split("/")[2]}${pathname.split("/")[3] ? ` / ${pathname.split("/")[3]}` : ""}`;
  return title;
}
