import { useOutletContext } from "react-router-dom";
import { Home } from "./marketing/site.jsx";
import { useStore } from "../context/Store.jsx";

export default function HomePage() {
  const { go, onLaunch } = useOutletContext();
  const { drives } = useStore();
  return <Home go={go} onLaunch={onLaunch} drives={drives} />;
}
