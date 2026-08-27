import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { StoreProvider } from "./context/Store.jsx";
import { SiteLayout } from "./layouts/SiteLayout.jsx";
import { OrgLayout } from "./layouts/OrgLayout.jsx";
import HomePage from "./pages/HomePage.jsx";
import ProductsPage from "./pages/ProductsPage.jsx";
import PricingPage from "./pages/PricingPage.jsx";
import WalkInsPage from "./pages/WalkInsPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import PrivacyPage from "./pages/PrivacyPage.jsx";
import TermsPage from "./pages/TermsPage.jsx";
import SolutionPage from "./pages/SolutionPage.jsx";
import WatchPage from "./pages/WatchPage.jsx";
import AppPickPage from "./pages/AppPickPage.jsx";
import JoinPage from "./pages/JoinPage.jsx";
import HiringPage from "./pages/HiringPage.jsx";
import GateRedirect from "./pages/GateRedirect.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import SignupPage from "./pages/auth/SignupPage.jsx";
import ForgotPage from "./pages/auth/ForgotPage.jsx";
import ResetPage from "./pages/auth/ResetPage.jsx";
import VerifyPage from "./pages/auth/VerifyPage.jsx";
import InvitePage from "./pages/auth/InvitePage.jsx";
import LogoutPage from "./pages/auth/LogoutPage.jsx";
import CandidateLoginPage from "./pages/auth/CandidateLoginPage.jsx";
import OrgHomePage from "./pages/org/OrgHomePage.jsx";
import OrgTeamPage from "./pages/org/OrgTeamPage.jsx";
import OrgSitesPage from "./pages/org/OrgSitesPage.jsx";
import OrgBrandPage from "./pages/org/OrgBrandPage.jsx";
import OrgBillingPage from "./pages/org/OrgBillingPage.jsx";
import OrgSettingsPage from "./pages/org/OrgSettingsPage.jsx";
import OrgSecurityPage from "./pages/org/OrgSecurityPage.jsx";
import StatusPage from "./pages/StatusPage.jsx";
import DevelopersPage from "./pages/DevelopersPage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
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
          <Route path="/app/hiring" element={<HiringPage />} />
          <Route path="/app/hiring/:driveId" element={<HiringPage />} />
          <Route path="/j" element={<GateRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </StoreProvider>
    </BrowserRouter>
  );
}
