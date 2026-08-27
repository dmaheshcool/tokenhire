import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Field } from "../../components/ui.jsx";
import { useStore } from "../../context/Store.jsx";
import { api, readSavedProfile } from "../../lib/api.js";
import { AuthShell } from "../../layouts/AuthShell.jsx";
import { DEMO_OTP } from "../../lib/helpers.js";
import { input, k, solid, textLink } from "../../theme.js";

export default function CandidateLoginPage() {
  const { setProfile } = useStore();
  const nav = useNavigate();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    if (otp && otp !== DEMO_OTP.sms) {
      setBusy(false);
      setErr(`Demo SMS code is ${DEMO_OTP.sms}.`);
      return;
    }
    try {
      const r = await api.candidate(phone.trim());
      setProfile(r.profile);
      nav("/app/join", { replace: true });
    } catch {
      const local = readSavedProfile();
      if (local?.phone === phone.trim()) {
        setProfile(local);
        nav("/app/join", { replace: true });
      } else setErr("No profile for that phone. Create one to join a walk-in.");
    }
    setBusy(false);
  }

  return (
    <AuthShell title="Candidate sign in" sub="Open the profile tied to your phone. New here? Create a profile instead.">
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        <Field label="Phone"><input value={phone} onChange={(e) => setPhone(e.target.value)} style={input} placeholder="10-digit mobile" /></Field>
        <Field label="SMS code (demo)"><input value={otp} onChange={(e) => setOtp(e.target.value)} style={input} placeholder={DEMO_OTP.sms} /></Field>
        {err && <div style={{ fontSize: 12.5, color: k.red }}>{err}</div>}
        <button type="submit" disabled={busy} style={{ ...solid, justifyContent: "center", padding: 12 }}>{busy ? "Opening…" : "Open my profile"}</button>
        <Link to="/app/join" style={textLink}>Create a new profile</Link>
      </form>
    </AuthShell>
  );
}
