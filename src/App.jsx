import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { StoreProvider } from "./context/Store.jsx";
import { SiteLayout } from "./layouts/SiteLayout.jsx";
import HomePage from "./pages/HomePage.jsx";
import JoinPage from "./pages/JoinPage.jsx";
import TokenPage from "./pages/TokenPage.jsx";
import GateRedirect from "./pages/GateRedirect.jsx";
import AppPickPage from "./pages/AppPickPage.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import { RouteFallback } from "./components/ui.jsx";
import { ToastProvider } from "./components/ds.jsx";
import { HIDE_PRICING } from "./lib/flags.js";

// Candidates arrive on hall wi-fi, so the join and token screens stay in the first
// chunk. Everything a recruiter or visitor reaches from a desk is loaded on demand —
// the console alone pulls in the whole charting library.
const ForCompaniesPage = lazy(() => import("./pages/ForCompaniesPage.jsx"));
const HowItWorksPage = lazy(() => import("./pages/HowItWorksPage.jsx"));
const GuidesPage = lazy(() => import("./pages/GuidesPage.jsx"));
const WalkInsPage = lazy(() => import("./pages/WalkInsPage.jsx"));
const SavedPage = lazy(() => import("./pages/SavedPage.jsx"));
const ListWalkInPage = lazy(() => import("./pages/ListWalkInPage.jsx"));
const ConfirmWalkInPage = lazy(() => import("./pages/ListWalkInPage.jsx").then((m) => ({ default: m.ConfirmWalkInPage })));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage.jsx"));
const TermsPage = lazy(() => import("./pages/TermsPage.jsx"));
const LegalHubPage = lazy(() => import("./pages/LegalHubPage.jsx"));
const WatchPage = lazy(() => import("./pages/WatchPage.jsx"));
const TvScreenPage = lazy(() => import("./pages/TvScreenPage.jsx"));
const SignupPage = lazy(() => import("./pages/auth/SignupPage.jsx"));
const ForgotPage = lazy(() => import("./pages/auth/ForgotPage.jsx"));
const ResetPage = lazy(() => import("./pages/auth/ResetPage.jsx"));
const VerifyPage = lazy(() => import("./pages/auth/VerifyPage.jsx"));
const InvitePage = lazy(() => import("./pages/auth/InvitePage.jsx"));
const LogoutPage = lazy(() => import("./pages/auth/LogoutPage.jsx"));
const CandidateLoginPage = lazy(() => import("./pages/auth/CandidateLoginPage.jsx"));
const OrgBillingPage = lazy(() => import("./pages/org/OrgBillingPage.jsx"));
const ConsoleLayout = lazy(() => import("./layouts/ConsoleLayout.jsx").then((m) => ({ default: m.ConsoleLayout })));
const TodayPage = lazy(() => import("./pages/console/TodayPage.jsx"));
const DrivesPage = lazy(() => import("./pages/console/DrivesPage.jsx"));
const DriveFormPage = lazy(() => import("./pages/console/DriveFormPage.jsx"));
const DrivePage = lazy(() => import("./pages/console/DrivePage.jsx"));
const DeskPage = lazy(() => import("./pages/console/DeskPage.jsx"));
const orgPage = (name) => lazy(() => import("./pages/console/OrgPages.jsx").then((m) => ({ default: m[name] })));
const VenuesPage = orgPage("VenuesPage");
const LibraryPage = orgPage("LibraryPage");
const TalentPage = orgPage("TalentPage");
const TeamPage = orgPage("TeamPage");
const SettingsPage = orgPage("SettingsPage");
const StatusPage = lazy(() => import("./pages/StatusPage.jsx"));
const DevelopersPage = lazy(() => import("./pages/DevelopersPage.jsx"));

function OldGuide() {
  const { slug } = useParams();
  return <Navigate to={`/guides/${slug}`} replace />;
}

function OldDrive() {
  const { driveId } = useParams();
  return <Navigate to={`/app/drives/${driveId}`} replace />;
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "") || undefined}>
      <StoreProvider>
        <ToastProvider>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route element={<SiteLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/for-companies" element={<ForCompaniesPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/guides" element={<GuidesPage />} />
              <Route path="/guides/:slug" element={<GuidesPage />} />
              <Route path="/walk-ins" element={<WalkInsPage />} />
              <Route path="/walk-ins/list" element={<ListWalkInPage />} />
              <Route path="/walk-ins/confirm" element={<ConfirmWalkInPage />} />
              <Route path="/walk-ins/:slug" element={<WalkInsPage />} />
              <Route path="/saved" element={<SavedPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/legal" element={<LegalHubPage />} />
            </Route>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPage />} />
            <Route path="/reset-password" element={<ResetPage />} />
            <Route path="/verify" element={<VerifyPage />} />
            <Route path="/invite" element={<InvitePage />} />
            <Route path="/logout" element={<LogoutPage />} />
            <Route path="/candidate/login" element={<CandidateLoginPage />} />
            <Route element={<ConsoleLayout />}>
              <Route path="/app/today" element={<TodayPage />} />
              <Route path="/app/drives" element={<DrivesPage />} />
              <Route path="/app/drives/new" element={<DriveFormPage />} />
              <Route path="/app/drives/:id" element={<DrivePage />} />
              <Route path="/app/drives/:id/edit" element={<DriveFormPage />} />
              <Route path="/app/venues" element={<VenuesPage />} />
              <Route path="/app/teams" element={<Navigate to="/app/settings/library" replace />} />
              <Route path="/app/settings/library" element={<LibraryPage />} />
              <Route path="/app/talent" element={<TalentPage />} />
              <Route path="/app/team" element={<TeamPage />} />
              <Route path="/app/settings" element={<SettingsPage />} />
              <Route path="/app/billing" element={HIDE_PRICING ? <Navigate to="/app/today" replace /> : <OrgBillingPage />} />
            </Route>
            <Route path="/desk" element={<DeskPage />} />
            <Route path="/products" element={<Navigate to="/for-companies" replace />} />
            <Route path="/solutions/*" element={<Navigate to="/for-companies" replace />} />
            <Route path="/pricing" element={<Navigate to={HIDE_PRICING ? "/for-companies" : { pathname: "/for-companies", hash: "#pricing" }} replace />} />
            <Route path="/contact" element={<Navigate to={{ pathname: "/for-companies", hash: "#pilot" }} replace />} />
            <Route path="/about" element={<Navigate to="/how-it-works" replace />} />
            <Route path="/blog" element={<Navigate to="/guides" replace />} />
            <Route path="/blog/:slug" element={<OldGuide />} />
            <Route path="/app/hiring" element={<Navigate to="/app/today" replace />} />
            <Route path="/app/hiring/:driveId" element={<OldDrive />} />
            <Route path="/org" element={<Navigate to="/app/today" replace />} />
            <Route path="/org/team" element={<Navigate to="/app/team" replace />} />
            <Route path="/org/sites" element={<Navigate to="/app/venues" replace />} />
            <Route path="/org/billing" element={<Navigate to="/app/billing" replace />} />
            <Route path="/org/*" element={<Navigate to="/app/settings" replace />} />
            <Route path="/status" element={<StatusPage />} />
            <Route path="/developers" element={<DevelopersPage />} />
            <Route path="/watch" element={<WatchPage />} />
            <Route path="/app" element={<AppPickPage />} />
            <Route path="/app/join" element={<JoinPage />} />
            <Route path="/t/:driveId/:token" element={<TokenPage />} />
            <Route path="/tv/:driveId" element={<TvScreenPage />} />
            <Route path="/tv" element={<TvScreenPage />} />
            <Route path="/j" element={<GateRedirect />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        </ToastProvider>
      </StoreProvider>
    </BrowserRouter>
  );
}
