import { useOutletContext } from "react-router-dom";
import { PublicDrives } from "./marketing/site.jsx";
import { useStore } from "../context/Store.jsx";

export default function WalkInsPage() {
  const { onLaunch } = useOutletContext();
  const { drives } = useStore();
  return <PublicDrives drives={drives} onLaunch={onLaunch} />;
}
