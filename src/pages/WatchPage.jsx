import { useNavigate } from "react-router-dom";
import { bdy, k } from "../theme.js";
import { pathFor } from "../lib/routes.js";
import { WalkInDemo } from "./marketing/site.jsx";
import { useLaunch } from "../layouts/useLaunch.js";

export default function WatchPage() {
  const nav = useNavigate();
  const onLaunch = useLaunch();
  const go = (id) => nav(pathFor(id));
  return (
    <div style={{ background: k.cream, color: k.ink, fontFamily: bdy, minHeight: "100vh" }}>
      <WalkInDemo go={go} onLaunch={onLaunch} />
    </div>
  );
}
