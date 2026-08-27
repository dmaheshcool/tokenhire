import { ArrowLeft, ArrowRight, User, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Wordmark } from "../../components/brand.jsx";
import { bdy, dsp, box, iconBtn, k, textLink } from "../../theme.js";

export function Pick({ go, back, hasProfile, driveCount }) {
  return (
    <div style={{ minHeight: "100vh", background: k.cream2, fontFamily: bdy, color: k.ink, display: "flex", alignItems: "center", justifyContent: "center", padding: 26 }}>
      <div style={{ maxWidth: 640, width: "100%" }}>
        <button onClick={back} style={{ ...iconBtn, display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, marginBottom: 22 }}><ArrowLeft size={14} /> Back to site</button>
        <div style={{ marginBottom: 8 }}><Wordmark size={20} /></div>
        <p style={{ color: k.mid, fontSize: 14, margin: "0 0 26px" }}>One profile for candidates. One live queue for employers.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <button onClick={() => go("candidate")} style={{ ...box, padding: 24, textAlign: "left", cursor: "pointer", fontFamily: bdy, borderLeft: `3px solid ${k.teal}` }}>
            <User size={20} color={k.teal} />
            <div style={{ fontFamily: dsp, fontSize: 17, fontWeight: 700, margin: "12px 0 6px" }}>I'm a candidate</div>
            <div style={{ fontSize: 13.5, color: k.ink2, lineHeight: 1.55 }}>Build your profile once, verify phone, WhatsApp and email, then join a drive by scanning GATE and the live DESK code in the room.</div>
            <div style={{ marginTop: 12, fontSize: 12.5, color: k.teal, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>{hasProfile ? "Open my profile" : "Create my profile"} <ArrowRight size={13} /></div>
          </button>
          <button onClick={() => go("employer")} style={{ ...box, padding: 24, textAlign: "left", cursor: "pointer", fontFamily: bdy, borderLeft: `3px solid ${k.coral}` }}>
            <Building2 size={20} color={k.coral} />
            <div style={{ fontFamily: dsp, fontSize: 17, fontWeight: 700, margin: "12px 0 6px" }}>I'm hiring</div>
            <div style={{ fontSize: 13.5, color: k.ink2, lineHeight: 1.55 }}>Set up a walk-in, run the queue, and get a report at the end of the day.</div>
            <div style={{ marginTop: 12, fontSize: 12.5, color: k.coral, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>{driveCount ? "Open console" : "Set up a walk-in"} <ArrowRight size={13} /></div>
          </button>
        </div>
        <div style={{ marginTop: 18, fontSize: 12, color: k.faint, display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Link to="/login" style={textLink}>Employer sign in</Link>
          <Link to="/signup" style={textLink}>New company</Link>
          <Link to="/candidate/login" style={textLink}>Candidate sign in</Link>
        </div>
      </div>
    </div>
  );
}
