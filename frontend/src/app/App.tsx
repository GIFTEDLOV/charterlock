import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { adapter } from "../contract";
import { config } from "../config";
import { reconcilePersisted } from "../transactions/engine";
import {
  ActivityPage,
  AppDashboard,
  CaseCenterPage,
  CaseChallengePage,
  CaseEvidencePage,
  CaseResolutionPage,
  CasesPage,
  CharterDetailPage,
  CharterNewPage,
  ChartersPage,
  DocsPage,
  IntegratePage,
  LandingPage,
  ProofPage,
} from "./pages";

const workspaceNav = [
  ["/app", "Overview", "⌂"],
  ["/charters", "Charters", "◇"],
  ["/cases", "Cases", "◈"],
  ["/activity", "Activity", "↗"],
] as const;

const verificationNav = [
  ["/proof", "Proof", "✓"],
  ["/integrate", "Integrate", "⌘"],
  ["/docs", "Docs", "?"],
] as const;

export default function App() {
  return (
    <Routes>
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
    </Routes>
  );
}

function AppShell() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [network, setNetwork] = useState<{ chainId: number; match: boolean; configured: boolean } | null>(null);

  useEffect(() => {
    void reconcilePersisted(adapter);
  }, []);

  useEffect(() => {
    void adapter.network().then(setNetwork).catch(() => setNetwork(null));
  }, [location.key]);

  const live = config.mode === "live" && Boolean(config.contractAddress);
  const networkLabel = config.mode === "demo"
    ? "Controlled mode"
    : network?.match
      ? `Studio-dev · ${network.chainId}`
        : network?.chainId === -1 ? "Wallet not connected" : network?.chainId ? "Wallet network mismatch" : "Studio-dev configured";

  return (
    <div className={`app-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="sidebar-top">
          <Link to="/" className="brand" aria-label="CharterLock home">
            <span className="brand-mark">C</span>
            <span className="brand-copy">CharterLock<small>evidence protocol</small></span>
          </Link>
          <button className="sidebar-toggle" type="button" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? "Expand navigation" : "Collapse navigation"} aria-expanded={!collapsed}>
            <span>{collapsed ? "»" : "«"}</span>
          </button>
        </div>

        <nav className="nav-group" aria-label="Workspace">
          <div className="nav-heading">Workspace</div>
          {workspaceNav.map(([href, label, icon]) => <NavItem key={href} href={href} label={label} icon={icon} />)}
        </nav>
        <nav className="nav-group" aria-label="Verification">
          <div className="nav-heading">Verification</div>
          {verificationNav.map(([href, label, icon]) => <NavItem key={href} href={href} label={label} icon={icon} />)}
        </nav>

        <div className="sidebar-footer">
          <div className="network-summary">
            <span className={`network-dot ${network?.match ? "good" : config.mode === "demo" ? "controlled" : ""}`}></span>
            <span className="network-copy"><strong>{networkLabel}</strong><small>{live ? "Live canonical reads" : "Local fixtures only"}</small></span>
          </div>
          <div className="mode-lockup"><span className={`mode-dot ${live ? "live" : "controlled"}`}></span><span>{live ? "LIVE" : "CONTROLLED"}</span><code>{config.chainId}</code></div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="mobile-brand"><span className="brand-mark">C</span><span>CharterLock</span></div>
          <div className="topbar-location"><span className="topbar-kicker">Workspace</span><span className="topbar-separator">/</span><span>{locationLabel(location.pathname)}</span></div>
          <div className="topbar-right"><span className={`network-dot ${network?.match ? "good" : config.mode === "demo" ? "controlled" : ""}`}></span><span>{networkLabel}</span><Link className="topbar-link" to="/proof">Proof <span aria-hidden="true">↗</span></Link></div>
        </header>
        {config.mode === "demo" && <div className="mode-banner controlled-banner"><strong>CONTROLLED DEMO / TEST MODE</strong><span>Local fixtures only. No wallet, live contract, or blockchain write is represented.</span></div>}
        {config.mode === "live" && !network?.configured && <div className="mode-banner warning-banner"><strong>LIVE ADAPTER NOT CONFIGURED</strong><span>Add an explicit Studio-dev contract address before enabling writes.</span></div>}
          {config.mode === "live" && network && !network.match && <div className="mode-banner warning-banner"><strong>{network.chainId === -1 ? "WALLET CONNECTION REQUIRED" : "NETWORK GUARD ACTIVE"}</strong><span>{network.chainId === -1 ? "Read-only live state is available; connect a Studio-dev wallet before signing." : "Writes are blocked until chain 61997 and the configured contract match."}</span></div>}
        <Outlet />
      </main>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {workspaceNav.slice(0, 4).map(([href, label, icon]) => <NavItem key={href} href={href} label={label} icon={icon} />)}
      </nav>
    </div>
  );
}

function NavItem({ href, label, icon }: { href: string; label: string; icon: string }) {
  return <NavLink to={href} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}><span className="nav-icon" aria-hidden="true">{icon}</span><span className="nav-label">{label}</span></NavLink>;
}

function locationLabel(pathname: string) {
  if (pathname === "/" || pathname === "/app") return "Overview";
  if (pathname.startsWith("/charters/new")) return "Charters / New charter";
  if (pathname.startsWith("/charters/")) return `Charters / ${pathname.split("/")[2]}`;
  if (pathname === "/charters") return "Charters";
  if (pathname.startsWith("/cases/")) {
    const parts = pathname.split("/").filter(Boolean);
    return `Cases / ${parts[1]}${parts[2] ? ` / ${parts[2]}` : ""}`;
  }
  return pathname.slice(1).replaceAll("/", " / ") || "Overview";
}
