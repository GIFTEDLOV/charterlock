import { Link } from "react-router-dom";
import { docLinks } from "../docData";
import { config } from "../../config";
import { Hash } from "../components";

const sections = [
  ["intro", "Introduction", "CharterLock is semantic settlement infrastructure for decisions that need their rules, evidence, and outcomes to remain inspectable."],
  ["trust", "Trust model", "The protocol separates authority, transport, identity, validator facts, and deterministic state. No prose result is authoritative."],
  ["charter", "Resolution charter", "A charter freezes the question, allowed outcomes, temporal semantics, authority policy, evidence policy, and challenge constitution."],
  ["authority", "Authority", "Authority is bound by identity, hostname, and path policy. A source is not admissible merely because it responds over HTTPS."],
  ["evidence", "Evidence", "Every evidence record preserves URL identity, exact byte length, SHA-256, observation timing, and its evidence generation."],
  ["schema", "Semantic schema", "BINARY_EVENT_V1 carries a bounded vector: event, timing, authority, corroboration, conflict, sufficiency, and selected outcome."],
  ["adjudication", "Adjudication", "Validators independently retrieve and interpret evidence. The contract compares the bounded result and derives the canonical technical state."],
  ["challenges", "Challenges", "Challenges are bounded and append-only. A valid challenge creates a new generation without erasing prior resolutions."],
  ["finalization", "Finalization", "Final is terminal. The contract does not reopen a finalized case or replace its resolution history."],
  ["transactions", "Transaction lifecycle", "Read the precondition, prepare the exact call, broadcast once, persist the hash, reconcile it, inspect execution, then read the canonical postcondition."],
  ["security", "Security model", "Authorization, malformed identifiers, URL ambiguity, replay, prompt injection, state transitions, semantic schema, and result-shopping are tested as explicit invariants."],
] as const;

export function DocsRoute() {
  return <div className="docs-page"><div className="docs-layout"><aside className="docs-navigation"><div className="eyebrow">DOCUMENTATION</div>{docLinks.map(([label, href]) => href.startsWith("#") ? <a href={href} key={label}>{label}</a> : <Link to={href} key={label}>{label}</Link>)}</aside><article className="docs-article"><div className="docs-article-header"><span className="eyebrow">CHARTERLOCK / DOCS</span><h1>Protocol reference.</h1><p>A practical model for building applications where interpretation must remain bound to a frozen constitution.</p></div>{sections.map(([id, title, body], index) => <section className="docs-section" id={id} key={id}><span className="docs-number">{String(index + 1).padStart(2, "0")}</span><div><h2>{title}</h2><p>{body}</p>{id === "transactions" && <ol className="docs-steps"><li>Precondition read</li><li>Prepare the exact call</li><li>Broadcast once and persist the hash</li><li>Reconcile the same hash</li><li>Verify execution and canonical readback</li></ol>}</div></section>)}</article><aside className="docs-outline"><span className="eyebrow">ON THIS PAGE</span><a href="#intro">Protocol reference</a><a href="#trust">Trust model</a><a href="#evidence">Evidence identity</a><a href="#transactions">Transaction lifecycle</a><a href="#security">Security model</a><div className="docs-runtime"><span className="eyebrow">LIVE RUNTIME</span><strong>Studio-dev · 61997</strong><Hash value={config.contractAddress ?? "CONTROLLED_DEMO_NO_ADDRESS"} label="Contract" /></div></aside></div></div>;
}
