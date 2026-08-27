import { useOutletContext } from "react-router-dom";
import { Services } from "./marketing/site.jsx";

export default function ProductsPage() {
  const { go, onLaunch } = useOutletContext();
  return <Services go={go} onLaunch={onLaunch} />;
}
