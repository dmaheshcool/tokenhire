import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { StoreProvider } from "./context/Store.jsx";
import { SiteLayout } from "./layouts/SiteLayout.jsx";
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
          <Route path="/watch" element={<WatchPage />} />
          <Route path="/app" element={<AppPickPage />} />
          <Route path="/app/join" element={<JoinPage />} />
          <Route path="/app/hiring" element={<HiringPage />} />
          <Route path="/j" element={<GateRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </StoreProvider>
    </BrowserRouter>
  );
}
