import { Navigate, useSearchParams } from "react-router-dom";

export default function GateRedirect() {
  const [params] = useSearchParams();
  const g = params.get("g");
  return <Navigate to={g ? `/app/join?g=${encodeURIComponent(g)}` : "/app/join"} replace />;
}
