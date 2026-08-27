import { useNavigate } from "react-router-dom";
import { Pick } from "./app/PickPage.jsx";
import { useStore } from "../context/Store.jsx";

export default function AppPickPage() {
  const nav = useNavigate();
  const { profile, drives } = useStore();
  return (
    <Pick
      go={(side) => nav(side === "employer" ? "/app/hiring" : "/app/join")}
      back={() => nav("/")}
      hasProfile={!!profile}
      driveCount={drives.length}
    />
  );
}
