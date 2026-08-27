import { useParams, useOutletContext } from "react-router-dom";
import { SolutionPage } from "./marketing/site.jsx";

export default function SolutionRoute() {
  const { id } = useParams();
  const { go, onLaunch } = useOutletContext();
  return <SolutionPage id={id} go={go} onLaunch={onLaunch} />;
}
