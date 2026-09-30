import { lazy, Suspense, type ReactNode } from "react";
import { Route, Routes } from "react-router-dom";
import { AppLayout, DocsLayout, PublicLayout } from "./layouts";

const LandingRoute = lazy(() => import("./v2/public").then((module) => ({ default: module.LandingRoute })));
const ProofRoute = lazy(() => import("./v2/public").then((module) => ({ default: module.ProofRoute })));
const IntegrateRoute = lazy(() => import("./v2/public").then((module) => ({ default: module.IntegrateRoute })));
const DocsRoute = lazy(() => import("./v2/docs").then((module) => ({ default: module.DocsRoute })));
const OverviewRoute = lazy(() => import("./v2/overview").then((module) => ({ default: module.OverviewRoute })));
const ChartersRoute = lazy(() => import("./v2/charters-fixed").then((module) => ({ default: module.ChartersRoute })));
const CharterNewRoute = lazy(() => import("./v2/charters-fixed").then((module) => ({ default: module.CharterNewRoute })));
const CharterDetailRoute = lazy(() => import("./v2/charters-fixed").then((module) => ({ default: module.CharterDetailRoute })));
const CasesRoute = lazy(() => import("./v2/cases").then((module) => ({ default: module.CasesRoute })));
const CaseCenterRoute = lazy(() => import("./v2/cases").then((module) => ({ default: module.CaseCenterRoute })));
const CaseEvidenceRoute = lazy(() => import("./v2/cases").then((module) => ({ default: module.CaseEvidenceRoute })));
const CaseResolutionRoute = lazy(() => import("./v2/cases").then((module) => ({ default: module.CaseResolutionRoute })));
const CaseChallengeRoute = lazy(() => import("./v2/cases").then((module) => ({ default: module.CaseChallengeRoute })));
const ActivityRoute = lazy(() => import("./v2/activity").then((module) => ({ default: module.ActivityRoute })));

function RouteFallback() { return <div className="route-fallback" role="status"><span className="skeleton-line wide"></span><span className="skeleton-line"></span><span className="skeleton-block"></span></div>; }
function Lazy({ children }: { children: ReactNode }) { return <Suspense fallback={<RouteFallback />}>{children}</Suspense>; }

export default function App() {
  return <Routes>
    <Route element={<PublicLayout />}>
      <Route path="/" element={<Lazy><LandingRoute /></Lazy>} />
      <Route path="/proof" element={<Lazy><ProofRoute /></Lazy>} />
      <Route path="/integrate" element={<Lazy><IntegrateRoute /></Lazy>} />
    </Route>
    <Route element={<DocsLayout />}><Route path="/docs" element={<Lazy><DocsRoute /></Lazy>} /></Route>
    <Route element={<AppLayout />}>
      <Route path="/app" element={<Lazy><OverviewRoute /></Lazy>} />
      <Route path="/charters" element={<Lazy><ChartersRoute /></Lazy>} />
      <Route path="/charters/new" element={<Lazy><CharterNewRoute /></Lazy>} />
      <Route path="/charters/:id" element={<Lazy><CharterDetailRoute /></Lazy>} />
      <Route path="/cases" element={<Lazy><CasesRoute /></Lazy>} />
      <Route path="/cases/:id" element={<Lazy><CaseCenterRoute /></Lazy>} />
      <Route path="/cases/:id/evidence" element={<Lazy><CaseEvidenceRoute /></Lazy>} />
      <Route path="/cases/:id/resolution" element={<Lazy><CaseResolutionRoute /></Lazy>} />
      <Route path="/cases/:id/challenge" element={<Lazy><CaseChallengeRoute /></Lazy>} />
      <Route path="/activity" element={<Lazy><ActivityRoute /></Lazy>} />
    </Route>
  </Routes>;
}
