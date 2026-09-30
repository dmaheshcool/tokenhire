import { useNavigate } from "react-router-dom";
import { Pick } from "./app/PickPage.jsx";
import { useStore } from "../context/Store.jsx";
import { readSession } from "../lib/api.js";

export default function AppPickPage() {
  const nav = useNavigate();
  const { profile, drives } = useStore();
  return (
    <Pick
      go={(side) => nav(side === "employer" ? (readSession()?.orgId ? "/app/today" : "/company/start") : "/app/join")}
      back={() => nav("/")}
      hasProfile={!!profile}
      driveCount={drives.length}
    />
  );
}
