import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { StoreProvider } from "./context/Store.jsx";
import { SiteLayout } from "./layouts/SiteLayout.jsx";
import { OrgLayout } from "./layouts/OrgLayout.jsx";
import HomePage from "./pages/HomePage.jsx";
import JoinPage from "./pages/JoinPage.jsx";
import TokenPage from "./pages/TokenPage.jsx";
import GateRedirect from "./pages/GateRedirect.jsx";
import AppPickPage from "./pages/AppPickPage.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import { RouteFallback } from "./components/ui.jsx";

// Candidates arrive on hall wi-fi, so the join and token screens stay in the first
// chunk. Everything a recruiter or visitor reaches from a desk is loaded on demand —
// the console alone pulls in the whole charting library.
const ProductsPage = lazy(() => import("./pages/ProductsPage.jsx"));
const PricingPage = lazy(() => import("./pages/PricingPage.jsx"));
const WalkInsPage = lazy(() => import("./pages/WalkInsPage.jsx"));
const AboutPage = lazy(() => import("./pages/AboutPage.jsx"));
const ContactPage = lazy(() => import("./pages/ContactPage.jsx"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage.jsx"));
const TermsPage = lazy(() => import("./pages/TermsPage.jsx"));
const LegalHubPage = lazy(() => import("./pages/LegalHubPage.jsx"));
const SolutionPage = lazy(() => import("./pages/SolutionPage.jsx"));
const WatchPage = lazy(() => import("./pages/WatchPage.jsx"));
const HiringPage = lazy(() => import("./pages/HiringPage.jsx"));
const TvScreenPage = lazy(() => import("./pages/TvScreenPage.jsx"));
const SignupPage = lazy(() => import("./pages/auth/SignupPage.jsx"));
const ForgotPage = lazy(() => import("./pages/auth/ForgotPage.jsx"));
const ResetPage = lazy(() => import("./pages/auth/ResetPage.jsx"));
const VerifyPage = lazy(() => import("./pages/auth/VerifyPage.jsx"));
const InvitePage = lazy(() => import("./pages/auth/InvitePage.jsx"));
const LogoutPage = lazy(() => import("./pages/auth/LogoutPage.jsx"));
const CandidateLoginPage = lazy(() => import("./pages/auth/CandidateLoginPage.jsx"));
const OrgHomePage = lazy(() => import("./pages/org/OrgHomePage.jsx"));
const OrgTeamPage = lazy(() => import("./pages/org/OrgTeamPage.jsx"));
const OrgSitesPage = lazy(() => import("./pages/org/OrgSitesPage.jsx"));
const OrgBrandPage = lazy(() => import("./pages/org/OrgBrandPage.jsx"));
const OrgBillingPage = lazy(() => import("./pages/org/OrgBillingPage.jsx"));
const OrgSettingsPage = lazy(() => import("./pages/org/OrgSettingsPage.jsx"));
const OrgSecurityPage = lazy(() => import("./pages/org/OrgSecurityPage.jsx"));
const StatusPage = lazy(() => import("./pages/StatusPage.jsx"));
const DevelopersPage = lazy(() => import("./pages/DevelopersPage.jsx"));

export default function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route element={<SiteLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/walk-ins" element={<WalkInsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/legal" element={<LegalHubPage />} />
              <Route path="/solutions/:id" element={<SolutionPage />} />
            </Route>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPage />} />
            <Route path="/reset-password" element={<ResetPage />} />
            <Route path="/verify" element={<VerifyPage />} />
            <Route path="/invite" element={<InvitePage />} />
            <Route path="/logout" element={<LogoutPage />} />
            <Route path="/candidate/login" element={<CandidateLoginPage />} />
            <Route path="/org" element={<OrgLayout />}>
              <Route index element={<OrgHomePage />} />
              <Route path="team" element={<OrgTeamPage />} />
              <Route path="sites" element={<OrgSitesPage />} />
              <Route path="brand" element={<OrgBrandPage />} />
              <Route path="billing" element={<OrgBillingPage />} />
              <Route path="settings" element={<OrgSettingsPage />} />
              <Route path="security" element={<OrgSecurityPage />} />
            </Route>
            <Route path="/status" element={<StatusPage />} />
            <Route path="/developers" element={<DevelopersPage />} />
            <Route path="/watch" element={<WatchPage />} />
            <Route path="/app" element={<AppPickPage />} />
            <Route path="/app/join" element={<JoinPage />} />
            <Route path="/t/:driveId/:token" element={<TokenPage />} />
            <Route path="/tv/:driveId" element={<TvScreenPage />} />
            <Route path="/tv" element={<TvScreenPage />} />
            <Route path="/app/hiring" element={<HiringPage />} />
            <Route path="/app/hiring/:driveId" element={<HiringPage />} />
            <Route path="/j" element={<GateRedirect />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </StoreProvider>
    </BrowserRouter>
  );
}
