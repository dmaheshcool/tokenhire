import { useOutletContext } from "react-router-dom";
import { PricingPage } from "./marketing/site.jsx";

export default function Pricing() {
  const { go, onLaunch } = useOutletContext();
  return <PricingPage go={go} onLaunch={onLaunch} />;
}
