import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Field } from "../../components/ui.jsx";
import { useStore } from "../../context/Store.jsx";
import { AuthShell } from "../../layouts/AuthShell.jsx";
import { input, k, R, solid, textLink } from "../../theme.js";

export default function SignupPage() {
  const { activeOrgId, signUpOrg } = useStore();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [kind, setKind] = useState("captive");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  if (activeOrgId) return <Navigate to="/verify" replace />;

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    if (!companyName.trim() || !email.trim() || !password.trim()) {
      setBusy(false);
      setErr("Fill in all fields.");
      return;
    }
    const r = await signUpOrg({ companyName, email, password, kind });
    setBusy(false);
    if (!r.ok) { setErr(r.error); return; }
    nav("/verify", { replace: true });
  }

  return (
    <AuthShell title="Create a company" sub="This becomes your hiring space. Invite teammates after you are in.">
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        <Field label="Company or agency name"><input value={companyName} onChange={(e) => setCompanyName(e.target.value)} style={input} placeholder="Vistaar Services, or Quess Corp" /></Field>
        <div>
          <div style={{ fontSize: 12, color: k.mid, fontWeight: 600, marginBottom: 8 }}>How you hire</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={() => setKind("captive")} style={{ flex: 1, textAlign: "left", padding: 12, borderRadius: 10, cursor: "pointer", fontFamily: "inherit", border: `1px solid ${kind === "captive" ? k.coral : k.line}`, background: kind === "captive" ? k.coralDim : "#fff" }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Enterprise / captive</div>
              <div style={{ fontSize: 11.5, color: k.mid, marginTop: 3 }}>Hire for yourselves. No client layer.</div>
            </button>
            <button type="button" onClick={() => setKind("agency")} style={{ flex: 1, textAlign: "left", padding: 12, borderRadius: 10, cursor: "pointer", fontFamily: "inherit", border: `1px solid ${kind === "agency" ? k.coral : k.line}`, background: kind === "agency" ? k.coralDim : "#fff" }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Staffing agency</div>
              <div style={{ fontSize: 11.5, color: k.mid, marginTop: 3 }}>Walk-ins for clients, branded as you.</div>
            </button>
          </div>
        </div>
        <Field label="Work email"><input value={email} onChange={(e) => setEmail(e.target.value)} style={input} placeholder="hr@yourcompany.com" /></Field>
        <Field label="Password"><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={input} /></Field>
        {err && <div style={{ fontSize: 12.5, color: k.red }}>{err}</div>}
        <button type="submit" disabled={busy} style={{ ...solid, justifyContent: "center", padding: 12, borderRadius: R.pill }}>{busy ? "Creating…" : "Create company account"}</button>
        <Link to="/login" style={textLink}>Already have an account? Sign in</Link>
      </form>
    </AuthShell>
  );
}
