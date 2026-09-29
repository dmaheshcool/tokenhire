import { useNavigate } from "react-router-dom";
import { readSession } from "../lib/api.js";

export function useLaunch() {
  const nav = useNavigate();
  return (target) => {
    if (target === "employer") nav(readSession()?.orgId ? "/app/today" : "/signup");
    else if (target === "candidate") nav("/app/join");
    else nav("/app");
  };
}
