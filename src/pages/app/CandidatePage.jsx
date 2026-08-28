import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Mail, Linkedin, Check, ShieldCheck, FileText, User, Download, BadgeCheck, Phone, MessageCircle, Search, QrCode } from "lucide-react";
import { bdy, dsp, typ, k, R, box, input, solid, solidTeal, solidSm, outline, outlineSm, ghostSm, iconBtn } from "../../theme.js";
import { HallBrand, TokenChip, TokenTile } from "../../components/brand.jsx";
import { Blank, CitySelect, Field, Pill, SectionLabel, StatusPill, TopBar, fmtDate } from "../../components/ui.jsx";
import { DrivePosting } from "../../components/DrivePosting.jsx";
import { KeepTokenLink } from "../../components/KeepTokenLink.jsx";
import { rememberTicket, readTickets } from "../../lib/api.js";
import { gateCodeFrom, startQrScan } from "../../lib/scanner.js";
import { DEFAULT_ROUNDS, DEMO_OTP, EXP_BANDS, QUALIFICATIONS, boundToday, code, dupOf, hallChrome, hashAadhaar, inARound, isTerminal, listingHost, liveDesk, livePass, listingPlace, mask, planLimits, roundLabel, tat, todayStr, tokenPath, trackerCurrent, venueProofOf, bare6, clientOf, hallLogo, hallName, orgColor } from "../../lib/helpers.js";

export function Candidate({ store, back }) {
  const nav = useNavigate();
  const { profile, setProfile, drives, setDrives, left, orgs } = store;
  const [tab, setTab] = useState("profile");
  const [matched, setMatched] = useState(null);
  const [proven, setProven] = useState(false);
  const [result, setResult] = useState(null);
  const [joinErr, setJoinErr] = useState("");
  const [params, setParams] = useSearchParams();
  const scannedGate = params.get("g");
  const scannedDesk = params.get("d");
  const autoRef = useRef(false);

  function bindDevice(driveId) {
    setProfile((p) => ({ ...p, bound: { ...(p.bound || {}), [driveId]: todayStr() } }));
  }

  function consumePass(driveId) {
    setDrives((prev) => prev.map((x) => {
      if (x.id !== driveId) return x;
      const p = livePass(x);
      return p ? { ...x, gatePass: { ...p, used: true } } : x;
    }));
  }

  function openTicket(drive, cand) {
    rememberTicket({ driveId: drive.id, token: cand.token, claim: cand.claim, role: drive.role });
    nav(tokenPath(drive.id, cand.token, cand.claim));
  }

  function showDupSlip(d, dup) {
    bindDevice(d.id);
    setMatched(null);
    setProven(false);
    openTicket(d, dup);
  }

  function handleMatch(drive, via) {
    const live = drives.find((x) => x.id === drive.id) || drive;
    const already = dupOf(live, profile);
    const hostOrg = orgs.find((o) => o.id === live.orgId);
    const cap = planLimits(hostOrg).candidates;
    const full = !already && live.candidates.length >= cap;
    setJoinErr(full ? `This walk-in is full (${cap} candidates on this plan).` : "");
    if (via === "desk" || via === "pass") {
      if (via === "pass") consumePass(live.id);
      if (already) { showDupSlip(live, already); return; }
      setMatched(live);
      setProven(true);
      return;
    }
    if (already && boundToday(profile, live.id)) { showDupSlip(live, already); return; }
    setMatched(live);
    setProven(false);
  }

  // A scan lands here as ?g=<gate>&d=<desk>. When the screen supplied a live desk code
  // the candidate is already proven to be in the room, so the whole flow collapses to
  // one confirm tap. Waits for a profile and for drives to hydrate before deciding.
  useEffect(() => {
    if (autoRef.current || !profile || !scannedGate) return;
    const live = drives.filter((d) => d.status === "live");
    const byDesk = scannedDesk ? live.find((d) => liveDesk(d) === bare6(scannedDesk)) : null;
    const byGate = live.find((d) => bare6(d.gate) === bare6(scannedGate));
    const hit = byDesk || byGate;
    if (!hit) return;
    autoRef.current = true;
    setTab("join");
    handleMatch(hit, byDesk ? "desk" : "gate");
    // Clear the codes so a reload or back-navigation can't silently re-run check-in.
    setParams({}, { replace: true });
  }, [drives, profile, scannedGate, scannedDesk]);

  function tryProve(codeStr) {
    if (!matched) return "No walk-in selected.";
    const live = drives.find((x) => x.id === matched.id) || matched;
    const raw = (codeStr || "").trim().toUpperCase();
    if (raw.startsWith("HOST") || raw.startsWith("GATE")) {
      return "Scan the waiting-room screen, or type the code shown on it.";
    }
    const kind = venueProofOf(live, codeStr);
    if (!kind) return "Expired or wrong code. Check the screen, or ask the desk.";
    if (kind === "pass") consumePass(live.id);
    const already = dupOf(live, profile);
    if (already) { showDupSlip(live, already); return ""; }
    setProven(true);
    return "";
  }

  function join(d) {
    if (!proven) return;
    const live = drives.find((x) => x.id === d.id) || d;
    const dup = dupOf(live, profile);
    if (dup) { showDupSlip(live, dup); return; }
    const hostOrg = orgs.find((o) => o.id === live.orgId);
    const cap = planLimits(hostOrg).candidates;
    if (live.candidates.length >= cap) {
      setJoinErr(`This walk-in is full (${cap} candidates on this plan).`);
      return;
    }
    setJoinErr("");
    const seq = live.seq + 1, token = `W-${String(seq).padStart(3, "0")}`;
    const cand = { id: token, token, claim: code(6), name: profile.name, phone: profile.phone, whatsapp: profile.whatsapp || profile.phone, email: profile.email, exp: profile.exp, linkedin: profile.linkedin, resume: profile.resume, expBand: profile.expBand || "Fresher", qual: profile.qual || "", room: null, aadhaarHash: profile.aadhaarHash || null, aadhaarLast4: profile.aadhaarLast4 || null, state: "wait", at: Date.now(), pinged: false, calledAt: null, decidedAt: null, roundIdx: 0, roundAssigned: false, notes: {} };
    setDrives((prev) => prev.map((x) => x.id === live.id ? { ...x, seq, candidates: [...x.candidates, cand] } : x));
    profile.applications.push(live.id);
    bindDevice(live.id);
    setMatched(null);
    setProven(false);
    openTicket(live, cand);
  }

  function resetJoin() { setResult(null); setMatched(null); setProven(false); }

  return (
    <div style={{ minHeight: "100vh", background: k.cream2, fontFamily: bdy, color: k.ink }}>
      <TopBar back={back} title="Your walk-in" accent={k.teal} tabs={profile ? [["profile", "My profile"], ["join", "Join a walk-in"], ["history", "My applications"]] : null} tab={tab} setTab={setTab} />
      <div className="pagepad" style={{ maxWidth: 720, margin: "0 auto", padding: 26 }}>
        {!profile ? <BuildProfile onDone={setProfile} />
          : result ? <Slip r={result} drives={drives} onAgain={resetJoin} />
            : matched ? <ReviewJoin matched={drives.find((x) => x.id === matched.id) || matched} p={profile} setP={setProfile} proven={proven} left={left} onProve={tryProve} onBack={() => { setMatched(null); setProven(false); setJoinErr(""); }} onConfirm={() => join(matched)} joinErr={joinErr} nudges={planLimits(orgs.find((o) => o.id === matched.orgId)).notify !== false} />
              : tab === "profile" ? <MyProfile p={profile} setP={setProfile} />
                : tab === "join" ? <JoinDrive drives={drives} left={left} onMatch={handleMatch} />
                  : <History p={profile} drives={drives} />}
      </div>
    </div>
  );
}

export function ReviewJoin({ matched, p, setP, onBack, onConfirm, proven, onProve, left, joinErr, nudges }) {
  const [deskIn, setDeskIn] = useState("");
  const [proveErr, setProveErr] = useState("");
  function uploadResume(e) {
    const file = e.target.files?.[0];
    if (file) setP({ ...p, resume: file.name });
  }
  function submitProof() {
    const err = onProve(deskIn);
    if (err) setProveErr(err);
  }
  return (
    <div style={{ maxWidth: 480 }}>
      <button onClick={onBack} style={{ ...iconBtn, display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, marginBottom: 18 }}><ArrowLeft size={14} /> Back</button>
      <div style={{ marginBottom: 16 }}><HallBrand name={hallName(matched)} color={orgColor(null, matched)} logo={hallLogo(matched)} sub={clientOf(matched) || null} size={32} /></div>
      <h1 style={{ fontFamily: dsp, fontSize: 21, fontWeight: 700, letterSpacing: -0.4, margin: "0 0 4px" }}>{matched.role}</h1>
      <p style={{ fontSize: 13, color: k.mid, margin: "0 0 16px" }}>{listingPlace(matched)}</p>
      {(matched.jd || (matched.docs || []).length > 0) && (
        <div style={{ ...box, padding: 16, marginBottom: 16 }}>
          <DrivePosting d={matched} flush />
        </div>
      )}

      {joinErr && <div style={{ fontSize: 13.5, color: k.red, margin: "0 0 16px", lineHeight: 1.5 }}>{joinErr}</div>}
      {!proven && !joinErr && (
        <div style={{ ...box, padding: 18, marginBottom: 18, borderLeft: `3px solid ${k.coral}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: .8, textTransform: "uppercase", color: k.coral, marginBottom: 8 }}>You're at the right walk-in</div>
          <p style={{ fontSize: 13.5, color: k.ink, lineHeight: 1.55, margin: "0 0 12px" }}>
            Scanning the screen does this automatically.
          </p>
          <div style={{ fontSize: 12, color: k.mid, fontWeight: 600, marginBottom: 8 }}>Enter the code from the waiting-room screen</div>
          <div style={{ display: "flex", gap: 9 }}>
            <input value={deskIn} onChange={(e) => { setDeskIn(e.target.value.toUpperCase()); setProveErr(""); }} onKeyDown={(e) => e.key === "Enter" && submitProof()} placeholder="DESK-XXXXXX" style={{ ...input, fontFamily: typ, letterSpacing: 2, flex: 1, textTransform: "uppercase" }} maxLength={11} />
            <button onClick={submitProof} style={solidTeal}>Check in</button>
          </div>
          {proveErr ? <div style={{ fontSize: 12.5, color: k.red, marginTop: 10, lineHeight: 1.5 }}>{proveErr}</div>
            : <div style={{ fontSize: 11.5, color: k.faint, marginTop: 9, lineHeight: 1.5 }}>That code rotates in {left}s. Front desk can also admit you with a one-time PASS.</div>}
        </div>
      )}

      {proven && (
        <>
          <div style={{ ...box, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10, background: k.tealDim }}>
            <ShieldCheck size={16} color={k.teal} />
            <div style={{ fontSize: 12.5, color: k.teal, fontWeight: 600 }}>Venue confirmed — you're in the building.</div>
          </div>
          <div style={{ ...box, overflow: "hidden", marginBottom: 18 }}>
            <div style={{ padding: "10px 16px", borderBottom: `2px solid ${k.ink}`, fontFamily: typ, fontSize: 10.5, letterSpacing: 1.2, color: k.ink2 }}>THIS IS WHAT WE'LL SEND</div>
            <DataRow label="Name" value={p.name} />
            <DataRow label="Phone" value={p.phone} mono />
            <DataRow label="Email" value={p.email || "—"} />
            <DataRow label="Experience" value={p.exp || "—"} />
            <DataRow label="LinkedIn" value={p.linkedin || "Not provided"} link={p.linkedin} />
            <DataRow label="Resume" value={p.resume || "Not attached"} tone={p.resume ? "teal" : "gold"}
              action={p.resume ? (
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 13, color: k.teal, fontWeight: 600 }}>{p.resume}</span>
                  <label style={{ fontSize: 12, color: k.mid, fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}>
                    Replace<input type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={uploadResume} />
                  </label>
                </span>
              ) : (
                <label style={{ ...ghostSm, cursor: "pointer" }}>
                  Attach<input type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={uploadResume} />
                </label>
              )} last />
          </div>
          {joinErr && <div style={{ fontSize: 13, color: k.red, margin: "0 0 10px", textAlign: "center" }}>{joinErr}</div>}
          <button onClick={onConfirm} disabled={!!joinErr} style={{ ...solidTeal, width: "100%", justifyContent: "center", padding: 12, fontSize: 14, opacity: joinErr ? 0.5 : 1 }}>{joinErr ? "Walk-in is full" : <>Confirm & join queue <ArrowRight size={15} /></>}</button>
          {nudges !== false
            ? <div style={{ fontSize: 11.5, color: k.faint, marginTop: 10, textAlign: "center" }}>You’ll get a page with your token link. Save it — that’s how you see your turn if you close this tab. WhatsApp is extra on paid plans.</div>
            : <div style={{ fontSize: 11.5, color: k.faint, marginTop: 10, textAlign: "center" }}>You’ll get a page with your token link. Save it so you can reopen your place in line.</div>}
        </>
      )}
    </div>
  );
}

export function OtpChannel({ icon: I, title, dest, code, verified, onVerified }) {
  const [sent, setSent] = useState(false);
  const [val, setVal] = useState("");
  const [err, setErr] = useState("");
  if (verified) {
    return (
      <div style={{ ...box, padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
        <I size={18} color={k.teal} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{title}</div>
          <div style={{ fontSize: 12, color: k.mid, fontFamily: typ, marginTop: 2 }}>{dest}</div>
        </div>
        <Pill tone="teal">Verified</Pill>
      </div>
    );
  }
  return (
    <div style={{ ...box, padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: sent ? 12 : 0 }}>
        <I size={18} color={k.coral} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{title}</div>
          <div style={{ fontSize: 12, color: k.mid, marginTop: 2 }}>{dest}</div>
        </div>
        {!sent && <button type="button" onClick={() => { setSent(true); setErr(""); }} style={ghostSm}>Send OTP</button>}
      </div>
      {sent && (
        <>
          <div style={{ fontSize: 12, color: k.ink2, lineHeight: 1.5, marginBottom: 8 }}>
            Code sent. In this demo, enter <b style={{ fontFamily: typ }}>{code}</b>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={val} onChange={(e) => { setVal(e.target.value.replace(/\D/g, "").slice(0, 6)); setErr(""); }} placeholder="6-digit OTP" inputMode="numeric" style={{ ...input, fontFamily: typ, letterSpacing: 3, flex: 1 }} />
            <button type="button" onClick={() => { if (val === code) onVerified(); else setErr("That code doesn't match."); }} style={solidTeal}>Verify</button>
          </div>
          {err && <div style={{ fontSize: 12, color: k.red, marginTop: 8 }}>{err}</div>}
        </>
      )}
    </div>
  );
}

export function BuildProfile({ onDone }) {
  const [step, setStep] = useState("details");
  const [f, setF] = useState({ name: "", phone: "", email: "", whatsapp: "", exp: "", expBand: "", linkedin: "", aadhaar: "", qual: "", consent: false });
  const [ok, setOk] = useState({ sms: false, wa: false, email: false });
  const [busy, setBusy] = useState(false);
  const fillSample = () => onDone({
    name: "Ananya Rao", phone: "9959001122", email: "ananya.rao@gmail.com", whatsapp: "9959001122",
    exp: "1–3 yrs", expBand: "1–3 yrs", linkedin: "https://linkedin.com/in/ananyarao", qual: "Graduate", consent: true,
    verified: { phone: true, whatsapp: true, email: true },
    aadhaarHash: null, aadhaarLast4: null, id: `c_${Date.now()}`, resume: null, applications: [], bound: {},
  });

  function goVerify(e) {
    e.preventDefault();
    if (!f.name.trim() || f.phone.trim().length !== 10) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) return;
    setF((p) => ({ ...p, whatsapp: p.whatsapp || p.phone }));
    setStep("verify");
  }

  async function submit(e) {
    e.preventDefault();
    if (!f.consent) return;
    if (f.aadhaar && f.aadhaar.length !== 12) return;
    setBusy(true);
    const aadhaarHash = f.aadhaar ? await hashAadhaar(f.aadhaar) : null;
    const aadhaarLast4 = f.aadhaar ? f.aadhaar.slice(-4) : null;
    const { aadhaar, ...rest } = f;
    onDone({
      ...rest, whatsapp: rest.whatsapp || rest.phone, aadhaarHash, aadhaarLast4,
      verified: { phone: true, whatsapp: true, email: true },
      id: `c_${Date.now()}`, resume: null, applications: [], bound: {},
    });
  }

  const allVerified = ok.sms && ok.wa && ok.email;

  return (
    <div style={{ maxWidth: 460 }}>
      <h1 style={{ fontFamily: dsp, fontSize: 24, fontWeight: 700, letterSpacing: -0.5, margin: "0 0 5px" }}>Create your profile</h1>
      <p style={{ fontSize: 14, color: k.mid, margin: "0 0 18px", lineHeight: 1.55 }}>
        {step === "details" && "Phone, WhatsApp and email."}
        {step === "verify" && "Three one-time codes."}
        {step === "about" && "Experience and documents."}
      </p>
      <button type="button" onClick={fillSample} style={{ ...ghostSm, marginBottom: 16 }}>Fill sample data — skip OTP, just to look around</button>

      {step === "details" && (
        <form onSubmit={goVerify} style={{ ...box, padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Full name"><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} style={input} required /></Field>
          <Field label="Mobile number">
            <input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} style={input} placeholder="10 digits" inputMode="numeric" required />
          </Field>
          <Field label="WhatsApp number (if different)">
            <input value={f.whatsapp} onChange={(e) => setF({ ...f, whatsapp: e.target.value.replace(/\D/g, "").slice(0, 10) })} style={input} placeholder="Same as mobile unless you change it" inputMode="numeric" />
          </Field>
          <Field label="Email"><input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} style={input} required /></Field>
          <button type="submit" style={{ ...solidTeal, justifyContent: "center", padding: 12, fontSize: 14.5, marginTop: 4 }}>Send verification codes <ArrowRight size={15} /></button>
        </form>
      )}

      {step === "verify" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <OtpChannel key={`sms-${f.phone}`} icon={Phone} title="SMS to your phone" dest={f.phone} code={DEMO_OTP.sms} verified={ok.sms} onVerified={() => setOk({ ...ok, sms: true })} />
          <OtpChannel key={`wa-${f.whatsapp || f.phone}`} icon={MessageCircle} title="WhatsApp OTP" dest={f.whatsapp || f.phone} code={DEMO_OTP.wa} verified={ok.wa} onVerified={() => setOk({ ...ok, wa: true })} />
          <OtpChannel key={`em-${f.email}`} icon={Mail} title="Email OTP" dest={f.email} code={DEMO_OTP.email} verified={ok.email} onVerified={() => setOk({ ...ok, email: true })} />
          <button type="button" disabled={!allVerified} onClick={() => setStep("about")} style={{ ...solidTeal, justifyContent: "center", padding: 12, fontSize: 14.5, marginTop: 6, opacity: allVerified ? 1 : .45 }}>
            Continue {allVerified ? "" : "— verify all three first"}
          </button>
          <button type="button" onClick={() => { setStep("details"); setOk({ sms: false, wa: false, email: false }); }} style={{ ...ghostSm, alignSelf: "flex-start" }}>Change number or email</button>
        </div>
      )}

      {step === "about" && (
        <form onSubmit={submit} style={{ ...box, padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Aadhaar number (optional)">
            <input
              value={f.aadhaar}
              onChange={(e) => setF({ ...f, aadhaar: e.target.value.replace(/\D/g, "").slice(0, 12) })}
              style={{ ...input, fontFamily: typ, letterSpacing: 1.5 }}
              placeholder="12 digits"
              inputMode="numeric"
            />
            <div style={{ fontSize: 11.5, color: k.faint, marginTop: 6, lineHeight: 1.5 }}>
              Only used to stop the same person re-registering to a drive under a different phone. We never store the number — only an irreversible one-way hash of it, plus the last 4 digits for your own reference.
            </div>
          </Field>
          <Field label="Experience">
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {EXP_BANDS.map((b) => (
                <button type="button" key={b} onClick={() => setF({ ...f, expBand: b, exp: b })} style={{
                  padding: "8px 14px", borderRadius: R.pill, cursor: "pointer", fontFamily: bdy, fontSize: 13,
                  border: `1.5px solid ${f.expBand === b ? k.coral : k.line}`,
                  background: f.expBand === b ? k.coralDim : "#fff", color: f.expBand === b ? k.coral : k.ink2, fontWeight: f.expBand === b ? 600 : 500,
                }}>{b}</button>
              ))}
            </div>
          </Field>
          <Field label="Highest qualification">
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {QUALIFICATIONS.map((q) => (
                <button type="button" key={q} onClick={() => setF({ ...f, qual: q })} style={{
                  padding: "8px 14px", borderRadius: R.pill, cursor: "pointer", fontFamily: bdy, fontSize: 13,
                  border: `1.5px solid ${f.qual === q ? k.coral : k.line}`,
                  background: f.qual === q ? k.coralDim : "#fff", color: f.qual === q ? k.coral : k.ink2, fontWeight: f.qual === q ? 600 : 500,
                }}>{q}</button>
              ))}
            </div>
          </Field>
          <Field label="LinkedIn (optional)"><input value={f.linkedin} onChange={(e) => setF({ ...f, linkedin: e.target.value })} style={input} /></Field>
          <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer", padding: "12px 14px", background: k.cream2, borderRadius: 10 }}>
            <input type="checkbox" checked={f.consent} onChange={(e) => setF({ ...f, consent: e.target.checked })} style={{ marginTop: 2, width: 16, height: 16, accentColor: k.coral, cursor: "pointer" }} />
            <span style={{ fontSize: 12.5, color: k.ink2, lineHeight: 1.55 }}>I agree to share these details with the company running this walk-in, and to receive one WhatsApp message about 15 minutes before my turn. No other texts.</span>
          </label>
          <button type="submit" disabled={busy || !f.consent} style={{ ...solidTeal, justifyContent: "center", padding: 12, fontSize: 14.5, marginTop: 4, opacity: busy || !f.consent ? .7 : 1 }}>{busy ? "Securing your details…" : "Create profile"}</button>
        </form>
      )}
    </div>
  );
}

export function MyProfile({ p, setP }) {
  const done = [p.resume].filter(Boolean).length;
  const v = p.verified || {};
  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, gap: 16, flexWrap: "wrap" }}>
        <div><h1 style={{ fontFamily: dsp, fontSize: 23, fontWeight: 700, letterSpacing: -0.5, margin: "0 0 3px" }}>{p.name}</h1><div style={{ fontSize: 13, color: k.mid, fontFamily: typ }}>{p.phone}{p.email ? ` · ${p.email}` : ""}</div></div>
        <Pill tone={done === 1 ? "teal" : "gold"}>{done}/1 COMPLETE</Pill>
      </div>
      <SectionLabel>Verified contacts</SectionLabel>
      <div style={{ ...box, overflow: "hidden", marginBottom: 24 }}>
        {[
          ["Phone (SMS)", p.phone, v.phone],
          ["WhatsApp", p.whatsapp || p.phone, v.whatsapp],
          ["Email", p.email, v.email],
        ].map(([label, dest, yes], i, arr) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: i === arr.length - 1 ? "none" : `1px solid ${k.line}` }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{label}</div>
              <div style={{ fontSize: 12, color: k.mid, fontFamily: typ, marginTop: 2 }}>{dest || "—"}</div>
            </div>
            <Pill tone={yes ? "teal" : "gold"}>{yes ? "Verified" : "Needed"}</Pill>
          </div>
        ))}
      </div>
      <SectionLabel>Documents</SectionLabel>
      <div style={{ ...box, overflow: "hidden", marginBottom: 24 }}>
        <DocRow icon={FileText} title="Resume" sub={p.resume ? p.resume : "Recruiters download this instead of you carrying printouts"} done={!!p.resume} last
          action={p.resume ? <label style={ghostSm}>Replace<input type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={(e) => e.target.files?.[0] && setP({ ...p, resume: e.target.files[0].name })} /></label>
            : <label style={{ ...solidTeal, padding: "7px 13px", fontSize: 12.5, cursor: "pointer" }}>Upload<input type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={(e) => e.target.files?.[0] && setP({ ...p, resume: e.target.files[0].name })} /></label>} />
      </div>
      <div style={{ ...box, padding: 16, borderLeft: `3px solid ${k.teal}`, fontSize: 13, color: k.ink2, lineHeight: 1.6 }}>
        {p.aadhaarLast4
          ? <>Aadhaar on file: <b style={{ fontFamily: typ }}>XXXX XXXX {p.aadhaarLast4}</b> — only a one-way hash and these last 4 digits are stored, never the full number.</>
          : "No Aadhaar on file. It's optional — only used to stop the same person re-registering to a drive under a different phone number."}
      </div>
    </div>
  );
}

export function DataRow({ label, value, mono, link, tone, last, action }) {
  const toneColor = tone === "teal" ? k.teal : tone === "gold" ? k.gold : k.ink;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 16px", borderBottom: last ? "none" : `1px solid ${k.line}`, gap: 12 }}>
      <span style={{ fontSize: 12.5, color: k.mid, flexShrink: 0 }}>{label}</span>
      {action ? action : link ? (
        <a href={link} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: k.teal, textDecoration: "none", fontWeight: 600 }}>View profile</a>
      ) : (
        <span style={{ fontSize: 13, color: toneColor, fontWeight: 600, fontFamily: mono ? typ : bdy, textAlign: "right" }}>{value}</span>
      )}
    </div>
  );
}

export function DocRow({ icon: I, title, sub, done, action, last }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderBottom: last ? "none" : `1px solid ${k.line}` }}>
      <I size={18} color={done ? k.teal : k.faint} style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 7 }}>{title}{done && <BadgeCheck size={14} color={k.teal} />}</div>
        <div style={{ fontSize: 12.5, color: done ? k.teal : k.mid, marginTop: 2 }}>{sub}</div>
      </div>
      {action}
    </div>
  );
}

export function JoinDrive({ drives, left, onMatch }) {
  const nav = useNavigate();
  const tickets = readTickets();
  const [entered, setEntered] = useState("");
  const [err, setErr] = useState("");
  const [scan, setScan] = useState("idle"); // idle | starting | scanning | denied | unsupported
  const videoRef = useRef(null);
  const stopRef = useRef(null);
  const abortRef = useRef(false);

  function resolve(codeStr) {
    setErr("");
    const raw = codeStr.trim().toUpperCase();
    if (raw.startsWith("HOST")) {
      setErr("That is a staff code. Scan the waiting-room screen instead.");
      return;
    }
    const kind = raw.startsWith("PASS") ? "pass" : raw.startsWith("DESK") ? "desk" : raw.startsWith("GATE") ? "gate" : null;
    const v = bare6(raw);
    const live = drives.filter((d) => d.status === "live");
    const byGate = live.find((d) => bare6(d.gate) === v);
    const byDesk = live.find((d) => liveDesk(d) === v);
    const byPass = live.find((d) => livePass(d)?.code === v);

    if (kind === "desk") {
      if (v.length < 6) { setErr("Enter the full code from the screen."); return; }
      if (!byDesk) { setErr("That code has expired. Check the screen again."); return; }
      onMatch(byDesk, "desk");
      return;
    }
    if (kind === "pass") {
      if (!byPass) { setErr("That pass has expired. Ask the desk for a new one."); return; }
      onMatch(byPass, "pass");
      return;
    }
    if (kind === "gate") {
      if (v.length < 6) { setErr("Enter the full code."); return; }
      if (byGate) { onMatch(byGate, "gate"); return; }
      const later = drives.find((d) => d.status === "upcoming" && bare6(d.gate) === v);
      if (later) { setErr("This walk-in has not opened yet."); return; }
      setErr("No walk-in matches that code.");
      return;
    }
    if (v.length <= 4 && byPass) { onMatch(byPass, "pass"); return; }
    if (v.length < 6) { setErr("Enter the full code from the screen."); return; }
    if (byGate) { onMatch(byGate, "gate"); return; }
    if (byDesk) { onMatch(byDesk, "desk"); return; }
    const later = drives.find((d) => d.status === "upcoming" && bare6(d.gate) === v);
    if (later) { setErr("This walk-in has not opened yet."); return; }
    setErr("No walk-in matches that code.");
  }

  async function startScan() {
    setErr("");
    setScan("starting");
    abortRef.current = false;
    const stop = await startQrScan(
      videoRef.current,
      (raw) => {
        const found = gateCodeFrom(raw);
        setScan("idle");
        if (!found) { setErr("Not a TokenHire code."); return; }
        // A screen QR carries the live desk code as well, so presence is already proven
        // and there is nothing left to ask for.
        if (found.desk) {
          const byDesk = drives.find((d) => d.status === "live" && liveDesk(d) === found.desk);
          if (byDesk) { onMatch(byDesk, "desk"); return; }
        }
        setEntered(`GATE-${found.gate}`);
        resolve(`GATE-${found.gate}`);
      },
      (reason) => {
        setScan(reason === "denied" ? "denied" : "unsupported");
      },
    );
    // The camera can take a second to open; honour a stop pressed in the meantime so
    // the torch and preview don't stay on behind a closed panel.
    if (abortRef.current) { stop(); return; }
    stopRef.current = stop;
    // startQrScan only reports failures, so a silent return means frames are flowing.
    setScan((s) => (s === "starting" ? "scanning" : s));
  }
  function stopScan() {
    abortRef.current = true;
    stopRef.current?.();
    stopRef.current = null;
    setScan("idle");
  }
  useEffect(() => () => { abortRef.current = true; stopRef.current?.(); }, []);

  return (
    <div style={{ maxWidth: 520 }}>
      <h1 style={{ fontFamily: dsp, fontSize: 23, fontWeight: 700, letterSpacing: -0.5, margin: "0 0 5px" }}>Join a walk-in</h1>
      <p style={{ fontSize: 13.5, color: k.mid, margin: "0 0 20px", lineHeight: 1.55 }}>Scan the waiting-room screen. That’s it.</p>
      {!!tickets.length && (
        <div style={{ ...box, padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: k.faint, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 }}>Your tokens</div>
          {tickets.slice(0, 4).map((t) => (
            <button key={t.driveId + t.token} type="button" onClick={() => nav(tokenPath(t.driveId, t.token, t.claim))} style={{ ...ghostSm, marginRight: 8, marginBottom: 6 }}>
              {t.token}{t.role ? ` · ${t.role}` : ""}
            </button>
          ))}
        </div>
      )}

      <div style={{ ...box, padding: 20, marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: k.mid, fontWeight: 600, marginBottom: 9 }}>Scan the waiting-room screen</div>
        {/* iOS will not start playback on a hidden element, so keep it mounted while starting. */}
        <div style={{ position: "relative", borderRadius: 6, overflow: "hidden", background: "#000", display: scan === "scanning" || scan === "starting" ? "block" : "none" }}>
          <video ref={videoRef} muted playsInline style={{ width: "100%", display: "block", maxHeight: 260, objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 28, border: `2px solid ${k.teal}`, borderRadius: 8, pointerEvents: "none" }} />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "7px 10px", background: "rgba(0,0,0,.55)", color: "#fff", fontSize: 11.5, textAlign: "center" }}>
            Point at the screen — it scans by itself
          </div>
        </div>
        {scan === "scanning" || scan === "starting" ? (
          <button onClick={stopScan} style={{ ...ghostSm, marginTop: 10 }}>
            {scan === "starting" ? "Opening camera…" : "Stop scanning"}
          </button>
        ) : (
          <>
            <button onClick={startScan} style={{ ...solidTeal, width: "100%", justifyContent: "center", padding: 11 }}>Open camera to scan</button>
            {scan === "denied" && <div style={{ fontSize: 12, color: k.gold, marginTop: 9, lineHeight: 1.5 }}>Camera blocked. Type the code below instead.</div>}
            {scan === "unsupported" && <div style={{ fontSize: 12, color: k.gold, marginTop: 9, lineHeight: 1.5 }}>No camera available on this device — enter the code below instead.</div>}
          </>
        )}
      </div>

      <div style={{ ...box, padding: 20 }}>
        <div style={{ fontSize: 12, color: k.mid, fontWeight: 600, marginBottom: 9 }}>No camera? Type the code from the screen</div>
        <div style={{ display: "flex", gap: 9 }}>
          <input value={entered} onChange={(e) => { setEntered(e.target.value.toUpperCase()); setErr(""); }} onKeyDown={(e) => e.key === "Enter" && resolve(entered)} placeholder="DESK-XXXXXX" style={{ ...input, fontFamily: typ, letterSpacing: 2, flex: 1, textTransform: "uppercase" }} maxLength={11} />
          <button onClick={() => resolve(entered)} style={solidTeal}>Find</button>
        </div>
        {err ? <div style={{ fontSize: 12.5, color: k.red, marginTop: 10, lineHeight: 1.5 }}>{err}</div> : <div style={{ fontSize: 11.5, color: k.faint, marginTop: 9, lineHeight: 1.5 }}>The code on the screen changes every 45 seconds, so type it in the next {left}s.</div>}
      </div>
    </div>
  );
}

const QUEUE_STATE_COPY = {
  calling: "You're being called right now — head to the desk.",
  interviewing: "You're in with a recruiter right now.",
  selected: "You've been selected to move forward. HR will contact you — offers aren't made at the walk-in.",
  rejected: "This round didn't go through. Thanks for coming in.",
  onhold: "You're on hold after this round. We'll be in touch.",
  absent: "You were marked absent when called. Speak to the desk if that's wrong.",
};
export function QueueStatusPill({ state }) {
  const map = {
    wait: [k.mid, "Waiting"], calling: [k.coral, "Being called now"], interviewing: [k.coral, "In interview"],
    selected: [k.teal, "Selected"], rejected: [k.red, "Not selected"], onhold: [k.gold, "On hold"],
    absent: [k.mid, "Marked absent"],
  };
  const [color, label] = map[state] || [k.mid, "Checked in"];
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: color }} />{label}</span>;
}

export function Slip({ r, onAgain, drives, keep }) {
  const live = (drives || []).find((d) => d.id === r.drive.id);
  const rounds = live?.rounds || r.drive.rounds || DEFAULT_ROUNDS;
  const cand = (live?.candidates || []).find((c) => c.token === r.token || c.id === r.token) || r.cand || { state: "wait", roundIdx: 0 };
  const isDup = r.dup;
  const waiting = (live?.candidates || r.drive.candidates || []).filter((x) => x.state === "wait").sort((a, b) => a.at - b.at);
  const pos = cand.state === "wait" ? waiting.findIndex((x) => x.id === cand.id) + 1 : r.pos;
  const eta = cand.state === "wait" && pos > 0 ? (pos - 1) * (live ? tat(live) : r.avgTat || 8) : r.eta;
  return (
    <div style={{ maxWidth: 440 }}>
      <div style={{ border: `1px solid ${k.line}`, borderRadius: 14, overflow: "hidden", background: "#fff", boxShadow: "0 14px 34px -24px rgba(27,24,21,.35)" }}>
        <div style={{ background: isDup ? k.gold : k.ink, color: "#fff", padding: "9px 18px", fontFamily: typ, fontSize: 11, letterSpacing: 1.4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{isDup ? "ALREADY CHECKED IN" : "ADMISSION SLIP"}</span>
          <span style={{ fontSize: 9.5, opacity: .75, letterSpacing: .5 }}>{hallChrome(r.drive)}</span>
        </div>
        <div style={{ padding: "24px 22px 22px" }}>
          {isDup && r.sameAadhaarDiffPhone && (
            <div style={{ background: k.goldDim, borderRadius: 10, padding: "10px 14px", fontSize: 12.5, color: k.gold, marginBottom: 16, lineHeight: 1.5 }}>
              This matches an Aadhaar number already checked in to this drive under a different phone number. Showing that existing check-in below.
            </div>
          )}
          <div style={{ fontSize: 12, color: k.mid }}>{hallChrome(r.drive)} · {r.drive.role}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "14px 0 20px" }}>
            <TokenTile token={r.token} size={64} />
            <div style={{ minWidth: 0 }}>
              {cand.name && <div style={{ fontWeight: 700, fontSize: 18, lineHeight: 1.2 }}>{cand.name}</div>}
              <div style={{ fontSize: 12, color: k.mid, marginTop: cand.name ? 3 : 0 }}>Walk-in number {r.token}</div>
            </div>
          </div>

          {cand.state === "wait" ? (
            <div style={{ textAlign: "center", background: k.coralDim, borderRadius: 14, padding: "22px 16px", marginBottom: 22 }}>
              <div style={{ fontFamily: dsp, fontSize: 46, fontWeight: 800, color: k.coral, letterSpacing: -1.5, lineHeight: 1 }}>{Math.max(0, (pos || 1) - 1)}</div>
              <div style={{ fontSize: 13.5, color: k.ink2, fontWeight: 600, marginTop: 4 }}>
                {(pos || 1) - 1 === 0 ? "You're next" : `people ahead of you`}
              </div>
              <div style={{ fontSize: 12, color: k.mid, marginTop: 6 }}>~{eta ?? r.eta} min estimated · updates as the queue moves</div>
              {inARound(cand) && <div style={{ fontSize: 12, fontWeight: 700, color: k.coral, marginTop: 8 }}>{roundLabel(rounds, cand)}</div>}
            </div>
          ) : (
            <div style={{ marginBottom: 22 }}>
              <QueueStatusPill state={cand.state} />
              <div style={{ fontSize: 13, color: k.ink2, marginTop: 10, lineHeight: 1.6 }}>{QUEUE_STATE_COPY[cand.state] || "Check back on the desk screen for the latest."}</div>
              {["calling", "interviewing"].includes(cand.state) && (
                <div style={{ fontSize: 12.5, fontWeight: 700, color: k.coral, marginTop: 8 }}>{roundLabel(rounds, cand)}</div>
              )}
              {cand.room && ["calling", "interviewing"].includes(cand.state) && (
                <div style={{ background: k.coralDim, borderRadius: 12, padding: "14px 16px", marginTop: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: k.coral, letterSpacing: .7, textTransform: "uppercase", marginBottom: 5 }}>Go to</div>
                  <div style={{ fontFamily: dsp, fontSize: 22, fontWeight: 800, color: k.ink }}>{cand.room.name}</div>
                  <div style={{ fontSize: 13, color: k.ink2, marginTop: 2 }}>Interviewer: {cand.room.interviewer}</div>
                </div>
              )}
            </div>
          )}

          <RoundTracker rounds={rounds} cand={cand} />

          <div style={{ fontSize: 11.5, color: k.faint, marginTop: 18, paddingTop: 14, borderTop: `1px solid ${k.line}`, lineHeight: 1.5 }}>
            {isDup
              ? `Drive average right now: ~${live ? tat(live) : r.avgTat} min per candidate · ${waiting.length} still waiting.`
              : "Safe to close this tab — your place is held."}
          </div>
        </div>
      </div>
      <KeepTokenLink driveId={r.drive.id} token={r.token} claim={cand.claim} />
      <button onClick={onAgain} style={{ ...ghostSm, marginTop: 16 }}>{keep ? "Back to join" : "Back"}</button>
    </div>
  );
}

export function RoundTracker({ rounds, cand, roundIdx, state }) {
  const c = cand || { roundIdx: roundIdx || 0, state: state || "wait" };
  const stages = ["Checked in", ...rounds.map((r) => r.name), "Decision"];
  const terminal = isTerminal(c.state);
  const current = trackerCurrent(rounds, c);
  return (
    <div>
      <div style={{ position: "relative", height: 4, background: k.cream2, borderRadius: 2, margin: "0 8px 12px" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(current / (stages.length - 1)) * 100}%`, background: k.coral, borderRadius: 2, transition: "width .5s ease" }} />
        {stages.map((_, i) => (
          <div key={i} style={{
            position: "absolute", top: "50%", left: `${(i / (stages.length - 1)) * 100}%`, transform: "translate(-50%,-50%)",
            width: i === current ? 15 : 9, height: i === current ? 15 : 9, borderRadius: "50%",
            background: i <= current ? k.coral : "#fff", border: `2px solid ${i <= current ? k.coral : k.line}`,
            transition: "all .4s ease", boxShadow: i === current && !terminal ? `0 0 0 5px ${k.coralDim}` : "none",
            animation: i === current && !terminal ? "blink 1.8s infinite" : "none",
          }} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 4 }}>
        {stages.map((s, i) => (
          <div key={i} style={{
            fontSize: 10, textAlign: i === 0 ? "left" : i === stages.length - 1 ? "right" : "center", flex: 1,
            color: i === current ? k.coral : i < current ? k.ink2 : k.faint, fontWeight: i === current ? 700 : 500,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{s}</div>
        ))}
      </div>
    </div>
  );
}

export function History({ p, drives }) {
  const nav = useNavigate();
  const mine = drives.flatMap((d) => d.candidates.filter((c) => c.phone === p.phone).map((c) => ({ ...c, drive: d })));
  const label = { wait: ["grey", "Waiting"], calling: ["teal", "Being called"], interviewing: ["teal", "In interview"], selected: ["teal", "Selected"], rejected: ["red", "Rejected"], onhold: ["gold", "On hold"], absent: ["grey", "Missed turn"] };
  return (
    <div style={{ maxWidth: 560 }}>
      <h1 style={{ fontFamily: dsp, fontSize: 23, fontWeight: 700, letterSpacing: -0.5, margin: "0 0 8px" }}>My applications</h1>
      <p style={{ fontSize: 13, color: k.mid, margin: "0 0 18px" }}>Open a token to see live wait — even if you closed the check-in page.</p>
      {!mine.length ? <Blank text="You haven't joined a drive yet." /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {mine.map((c) => (
            <button key={c.drive.id + c.token} type="button" onClick={() => nav(tokenPath(c.drive.id, c.token, c.claim))} style={{ ...box, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, cursor: "pointer", textAlign: "left", fontFamily: bdy, width: "100%" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14.5 }}>{c.drive.role}</div>
                <div style={{ marginTop: 8 }}><TokenChip token={c.token} name={listingHost(c.drive)} size={28} muted /></div>
              </div>
              <Pill tone={label[c.state]?.[0]}>{label[c.state]?.[1]}</Pill>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
