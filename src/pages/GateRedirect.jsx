import { Navigate, useSearchParams } from "react-router-dom";

export default function GateRedirect() {
  const [params] = useSearchParams();
  const g = params.get("g");
  // `d` only rides along on QRs rendered by a waiting-room screen; it is what lets the
  // join page check someone in from a single scan instead of asking for a second code.
  const d = params.get("d");
  if (!g) return <Navigate to="/app/join" replace />;
  const q = new URLSearchParams({ g });
  if (d) q.set("d", d);
  return <Navigate to={`/app/join?${q}`} replace />;
}
