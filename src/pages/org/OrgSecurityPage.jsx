import { Link } from "react-router-dom";
import { useStore } from "../../context/Store.jsx";
import { box, dsp, k, outlineSm } from "../../theme.js";

export default function OrgSecurityPage() {
  const { staffEmail, staffRole, apiOk } = useStore();
  return (
    <div>
      <h1 style={{ fontFamily: dsp, fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>Security</h1>
      <p style={{ fontSize: 14, color: k.mid, margin: "0 0 18px" }}>Session and API status for this browser.</p>
      <div style={{ ...box, padding: 18, display: "flex", flexDirection: "column", gap: 10, fontSize: 13.5 }}>
        <div><b>Signed in as</b> {staffEmail || "—"}</div>
        <div><b>Role</b> {staffRole}</div>
        <div><b>API</b> {apiOk ? "Connected to TokenHire server" : "Local demo (API offline)"}</div>
        <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
          <Link to="/forgot-password" style={{ ...outlineSm, textDecoration: "none" }}>Reset password</Link>
          <Link to="/logout" style={{ ...outlineSm, textDecoration: "none" }}>Sign out</Link>
        </div>
      </div>
    </div>
  );
}
