import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Field } from "../../components/ui.jsx";
import { useStore } from "../../context/Store.jsx";
import { api, readSavedProfile } from "../../lib/api.js";
import { AuthShell } from "../../layouts/AuthShell.jsx";
import { input, k, solid, textLink } from "../../theme.js";

export default function CandidateLoginPage() {
  const { setProfile } = useStore();
  const nav = useNavigate();
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const mobile = phone.replace(/\D/g, "").slice(0, 10);
    if (mobile.length !== 10) {
      setBusy(false);
      setErr("Enter a 10-digit mobile number.");
      return;
    }
    try {
      const r = await api.candidate(mobile);
      setProfile(r.profile);
      nav("/app/join", { replace: true });
    } catch {
      const local = readSavedProfile();
      if (local?.phone === mobile) {
        setProfile(local);
        nav("/app/join", { replace: true });
      } else setErr("No profile for that phone. Create one to join a walk-in.");
    }
    setBusy(false);
  }

  return (
    <AuthShell title="Candidate sign in" sub="Enter the mobile number on your profile. No code, no verification.">
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        <Field label="Mobile number">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            style={input}
            placeholder="10-digit mobile"
            inputMode="numeric"
          />
        </Field>
        {err && <div style={{ fontSize: 12.5, color: k.red }}>{err}</div>}
        <button type="submit" disabled={busy} style={{ ...solid, justifyContent: "center", padding: 12 }}>{busy ? "Opening…" : "Open my profile"}</button>
        <Link to="/app/join" style={textLink}>Create a new profile</Link>
      </form>
    </AuthShell>
  );
}
