import { useOutletContext } from "react-router-dom";
import { AboutPage } from "./marketing/site.jsx";

export default function About() {
  const { go, onLaunch } = useOutletContext();
  return <AboutPage go={go} onLaunch={onLaunch} />;
}
