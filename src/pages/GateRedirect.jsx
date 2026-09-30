import { Navigate, useSearchParams } from "react-router-dom";

export default function GateRedirect() {
  const [params] = useSearchParams();
  const g = params.get("g");
  const d = params.get("d") || params.get("k");
  if (d && !g) return <Navigate to={`/check-in?k=${encodeURIComponent(d)}`} replace />;
  if (!g) return <Navigate to="/check-in" replace />;
  const q = new URLSearchParams();
  if (d) q.set("k", d);
  q.set("g", g);
  return <Navigate to={`/check-in?${q}`} replace />;
}
