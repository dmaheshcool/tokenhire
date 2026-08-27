import { useNavigate } from "react-router-dom";
import { readSession } from "../lib/api.js";

export function useLaunch() {
  const nav = useNavigate();
  return (target) => {
    if (target === "employer") nav(readSession()?.orgId ? "/app/hiring" : "/login");
    else if (target === "candidate") nav("/app/join");
    else nav("/app");
  };
}
