import { Link, NavLink, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { adapter } from "../contract";
import { config } from "../config";
import { useEffect, useState } from "react";
import { ActivityPage, AppDashboard, CaseCenterPage, CaseChallengePage, CaseEvidencePage, CaseResolutionPage, CasesPage, CharterDetailPage, CharterNewPage, ChartersPage, DocsPage, IntegratePage, LandingPage, ProofPage } from "./pages";
import { reconcilePersisted } from "../transactions/engine";

const nav = [
  ["/app", "Dashboard", "⌂"], ["/charters", "Charters", "▣"], ["/cases", "Cases", "◈"], ["/activity", "Activity", "↗"],
] as const;

export default function App() {
  return <Routes>
    <Route element={<AppShell />}>
      <Route path="/" element={<LandingPage />} />
      <Route path="/app" element={<AppDashboard />} />
      <Route path="/charters" element={<ChartersPage />} />
      <Route path="/charters/new" element={<CharterNewPage />} />
      <Route path="/charters/:charterId" element={<CharterDetailPage />} />
      <Route path="/cases" element={<CasesPage />} />
      <Route path="/cases/:caseId" element={<CaseCenterPage />} />
      <Route path="/cases/:caseId/evidence" element={<CaseEvidencePage />} />
      <Route path="/cases/:caseId/resolution" element={<CaseResolutionPage />} />
      <Route path="/cases/:caseId/challenge" element={<CaseChallengePage />} />
      <Route path="/activity" element={<ActivityPage />} />
      <Route path="/proof" element={<ProofPage />} />
      <Route path="/integrate" element={<IntegratePage />} />
      <Route path="/docs" element={<DocsPage />} />
    </Route>
  </Routes>;
}

function AppShell() {
  const location = useLocation();
  const [network, setNetwork] = useState<{ chainId: number; match: boolean; configured: boolean } | null>(null);
  useEffect(() => { void reconcilePersisted(adapter); }, []);
  useEffect(() => { void adapter.network().then(setNetwork).catch(() => setNetwork(null)); }, [location.key]);
  return <div className="app-shell">
    <aside className="sidebar">
      <Link to="/" className="brand"><span className="brand-mark">C</span><span>CharterLock<small>adjudication protocol</small></span></Link>
      <div className="sidebar-label">Workspace</div>
      <nav className="main-nav" aria-label="Workspace navigation">{nav.map(([href, label, icon]) => <NavLink key={href} to={href} className={({ isActive }) => isActive ? "active" : ""}><span>{icon}</span>{label}</NavLink>)}</nav>
      <div className="sidebar-label">Protocol</div>
      <nav className="main-nav" aria-label="Protocol navigation"><NavLink to="/proof" className={({ isActive }) => isActive ? "active" : ""}><span>⌁</span>Proof & provenance</NavLink><NavLink to="/integrate" className={({ isActive }) => isActive ? "active" : ""}><span>⌘</span>Integrate</NavLink><NavLink to="/docs" className={({ isActive }) => isActive ? "active" : ""}><span>?</span>Documentation</NavLink></nav>
      <div className="sidebar-bottom"><div className="mini-label">Schema</div><div className="schema-chip">BINARY_EVENT_V1</div><div className="mini-label">Deployment</div><div className="muted">Not deployed · controlled proof</div></div>
    </aside>
    <main className="main-content">
      <div className="topbar"><div className="mobile-brand"><span className="brand-mark">C</span>CharterLock</div><div className="topbar-right"><span className={`network-dot ${network?.match ? "good" : ""}`}></span><span>{config.mode === "demo" ? "Controlled demo" : network?.match ? `Studio-dev · ${network.chainId}` : "Network not configured"}</span><Link className="topbar-link" to="/proof">Proof ↗</Link></div></div>
      {config.mode === "demo" && <div className="demo-banner"><span>CONTROLLED DEMO / TEST MODE</span> This interface uses a local adapter with persisted fixtures. No wallet, live contract, or blockchain write is being represented.</div>}
      {config.mode === "live" && !network?.configured && <div className="warning-banner"><strong>Live adapter not configured.</strong> Add an explicit Studio-dev contract address before enabling writes.</div>}
      {config.mode === "live" && network && !network.match && <div className="warning-banner"><strong>Network guard active.</strong> Writes are blocked until chain 61997 and a configured contract address are both present.</div>}
      <Outlet />
    </main>
  </div>;
}
