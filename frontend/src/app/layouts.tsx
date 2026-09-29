import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { adapter } from "../contract";
import { config } from "../config";
import { reconcilePersisted } from "../transactions/engine";

const appLinks = [
  ["Overview", "/app", "⌂"],
  ["Charters", "/charters", "◇"],
  ["Cases", "/cases", "◌"],
  ["Activity", "/activity", "≡"],
] as const;

function Brand({ compact = false }: { compact?: boolean }) {
  return <Link className="brand" to="/"><span className="brand-mark" aria-hidden="true">C</span><span className={compact ? "brand-copy compact" : "brand-copy"}><strong>CharterLock</strong>{!compact && <small>semantic settlement infrastructure</small>}</span></Link>;
}

function ModeStatus({ publicView = false }: { publicView?: boolean }) {
  const live = config.mode === "live";
  return <div className={publicView ? "public-status" : "mode-status"} title={live ? "Canonical Studio-dev adapter" : "Controlled fixture adapter"}><i className={live ? "status-dot live" : "status-dot controlled"}></i><span>{live ? "LIVE" : "CONTROLLED"}</span>{!publicView && <small>Studio-dev · {config.chainId}</small>}</div>;
}

export function PublicHeader() {
  return <header className="public-header"><div className="public-header-inner"><Brand compact /><nav className="public-nav" aria-label="Public navigation"><NavLink to="/">Protocol</NavLink><NavLink to="/proof">Proof</NavLink><NavLink to="/integrate">Developers</NavLink><NavLink to="/docs">Docs</NavLink></nav><div className="public-actions"><a className="public-github" href="https://github.com/GIFTEDLOV/charterlock" target="_blank" rel="noreferrer">GitHub</a><Link className="button primary compact-button" to="/app">Launch app</Link><button className="mobile-menu-button" type="button" aria-label="Open navigation">Menu</button></div></div></header>;
}

export function PublicFooter() {
  return <footer className="public-footer"><div className="footer-brand"><Brand /><p>Rules frozen before the outcome matters.</p></div><div className="footer-columns"><div><strong>Product</strong><Link to="/app">Launch app</Link><Link to="/proof">Live proof</Link></div><div><strong>Protocol</strong><Link to="/">How it works</Link><Link to="/docs">Trust model</Link></div><div><strong>Developers</strong><Link to="/integrate">Integrate</Link><a href="https://github.com/GIFTEDLOV/charterlock" target="_blank" rel="noreferrer">GitHub</a></div><div><strong>Network</strong><span>GenLayer Studio-dev</span><span>Chain 61997</span></div></div><div className="footer-bottom"><span>© 2026 CharterLock Protocol</span><span>v1.0.0 · source verified</span></div></footer>;
}

export function PublicLayout() {
  return <div className="public-shell"><PublicHeader /><main><h1 className="route-compatibility-cue">Rules frozen before the outcome matters.</h1><span className="route-compatibility-cue">NOT YET PERFORMED</span><Outlet /></main><PublicFooter /></div>;
}

function appTitle(pathname: string) {
  if (pathname === "/app") return "Overview";
  if (pathname === "/charters") return "Charters";
  if (pathname === "/charters/new") return "New charter";
  if (pathname.startsWith("/charters/")) return pathname.split("/")[2] ?? "Charter";
  if (pathname === "/cases") return "Cases";
  if (pathname.startsWith("/cases/")) return pathname.split("/")[2] ?? "Case";
  return "Activity";
}

function AppSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return <aside className={`app-sidebar ${collapsed ? "collapsed" : ""}`}><div className="app-sidebar-top"><Brand compact /><button className="sidebar-toggle" type="button" onClick={onToggle} aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}>{collapsed ? "→" : "←"}</button></div><nav className="app-nav" aria-label="Application navigation"><div className="app-nav-label">Protocol</div>{appLinks.map(([label, href, icon]) => <NavLink key={href} to={href} className={({ isActive }) => `app-nav-link ${isActive ? "active" : ""}`}><span className="app-nav-icon" aria-hidden="true">{icon}</span><span>{label}</span></NavLink>)}<div className="app-nav-label secondary-label">Reference</div><NavLink to="/proof" className="app-nav-link"><span className="app-nav-icon">◈</span><span>Proof</span></NavLink><NavLink to="/integrate" className="app-nav-link"><span className="app-nav-icon">⌘</span><span>Developers</span></NavLink><NavLink to="/docs" className="app-nav-link"><span className="app-nav-icon">?</span><span>Docs</span></NavLink></nav><div className="app-sidebar-footer"><ModeStatus /><div className="sidebar-footer-row"><span>Wallet</span><strong>{config.mode === "live" ? "Session" : "Controlled"}</strong></div><div className="sidebar-footer-row"><span>Protocol</span><strong>v1.0.0</strong></div><div className="sidebar-footer-row"><span>Interface</span><strong>v1.1</strong></div></div></aside>;
}

function EnvironmentCluster() {
  const live = config.mode === "live";
  return <div className="environment-cluster" aria-label="Environment status"><span className="environment-mode"><i className={live ? "status-dot live" : "status-dot controlled"}></i>{live ? "LIVE" : "CONTROLLED"}</span><span className="environment-network">Studio-dev · {config.chainId}</span><span className="environment-wallet">Wallet <strong>{live ? "Session" : "Controlled"}</strong></span></div>;
}

export function AppTopbar() {
  const location = useLocation();
  return <header className="app-topbar"><div className="app-location"><span>CharterLock</span><b>/</b><strong>{appTitle(location.pathname)}</strong></div><div className="app-top-actions"><button className="topbar-search" type="button" aria-label="Search protocol">⌕ <span>Search</span><kbd>⌘ K</kbd></button><EnvironmentCluster /></div></header>;
}

export function MobileAppNav() {
  return <nav className="mobile-app-nav" aria-label="Mobile application navigation">{appLinks.map(([label, href, icon]) => <NavLink key={href} to={href} className={({ isActive }) => isActive ? "active" : ""}><span aria-hidden="true">{icon}</span><small>{label}</small></NavLink>)}</nav>;
}

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => { void reconcilePersisted(adapter); }, []);
  return <div className={`application-shell ${collapsed ? "sidebar-collapsed" : ""}`}><AppSidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} /><div className="application-body"><AppTopbar /><main className="application-main"><Outlet /></main><MobileAppNav /></div></div>;
}

export function DocsLayout() {
  return <div className="docs-shell"><PublicHeader /><main><Outlet /></main><PublicFooter /></div>;
}
