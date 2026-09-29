import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, ShieldCheck, FileText, BadgeCheck } from "lucide-react";
import { bdy, dsp, typ, k, box, input, solidTeal, outlineSm, ghostSm, iconBtn } from "../../theme.js";
import { HallBrand, TokenChip, tokenDigits } from "../../components/brand.jsx";
import { Blank, Field, Pill, SectionLabel, TopBar } from "../../components/ui.jsx";
import { DrivePosting } from "../../components/DrivePosting.jsx";
import { KeepTokenLink } from "../../components/KeepTokenLink.jsx";
import { useQueueAlert } from "../../hooks/useQueueAlert.js";
import { rememberTicket, readTickets } from "../../lib/api.js";
import { gateCodeFrom, startQrScan } from "../../lib/scanner.js";
import { DEFAULT_ROUNDS, boundToday, code, driveStatus, currentServingToken, dupOf, hallChrome, inARound, isTerminal, joinBlockedReason, listingHost, liveDesk, livePass, listingPlace, queueAhead, resumeName, readResumeFile, roomName, roundLabel, scanEnabled, todayStr, tokenPath, trackerCurrent, venueProofOf, bare6, clientOf, hallLogo, hallName, orgColor } from "../../lib/helpers.js";

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
  const wantedDrive = params.get("drive");
  const [remote, setRemote] = useState(false);
  const autoRef = useRef(false);

  function markArrived(driveId, candId) {
    setDrives((prev) => prev.map((x) => x.id !== driveId ? x : {
      ...x,
      candidates: x.candidates.map((c) => (c.id === candId && !c.checkedIn ? { ...c, checkedIn: true, arrivedAt: Date.now() } : c)),
    }));
  }

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
    const blocked = !already && !scanEnabled(hostOrg)
      ? "This walk-in is not taking scans yet."
      : (!already ? joinBlockedReason(hostOrg, live.candidates.length) : "");
    setJoinErr(blocked);
    if (via === "remote") {
      if (already) { showDupSlip(live, already); return; }
      setMatched(live);
      setProven(true);
      setRemote(true);
      return;
    }
    setRemote(false);
    if (via === "desk" || via === "pass") {
      if (via === "pass") consumePass(live.id);
      if (already) { markArrived(live.id, already.id); showDupSlip(live, already); return; }
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
    const live = drives.filter((d) => driveStatus(d) === "live");
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

  // "Get my token" on a listing lands here as ?drive=<id>. That books a place before
  // the person reaches the venue; the lobby scan later marks them as arrived.
  useEffect(() => {
    if (autoRef.current || !profile || !wantedDrive) return;
    const hit = drives.find((d) => d.id === wantedDrive);
    if (!hit) return;
    autoRef.current = true;
    setParams({}, { replace: true });
    if (driveStatus(hit) !== "live") { setJoinErr("This walk-in is not giving out tokens right now."); setTab("join"); return; }
    setTab("join");
    handleMatch(hit, "remote");
  }, [drives, profile, wantedDrive]);

  function tryProve(codeStr) {
    if (!matched) return "No walk-in selected.";
    const live = drives.find((x) => x.id === matched.id) || matched;
    const raw = (codeStr || "").trim().toUpperCase();
    if (raw.startsWith("HOST") || raw.startsWith("GATE")) {
      return "Scan the lobby display, or type the code shown on it.";
    }
    const kind = venueProofOf(live, codeStr);
    if (!kind) return "Expired or wrong code. Check the screen, or ask the desk.";
    if (kind === "pass") consumePass(live.id);
    const already = dupOf(live, profile);
    if (already) { markArrived(live.id, already.id); showDupSlip(live, already); return ""; }
    setProven(true);
    return "";
  }

  function join(d) {
    if (!proven) return;
    const live = drives.find((x) => x.id === d.id) || d;
    const dup = dupOf(live, profile);
    if (dup) { showDupSlip(live, dup); return; }
    const hostOrg = orgs.find((o) => o.id === live.orgId);
    const blocked = !scanEnabled(hostOrg) ? "This walk-in is not taking scans yet." : joinBlockedReason(hostOrg, live.candidates.length);
    if (blocked) {
      setJoinErr(blocked);
      return;
    }
    setJoinErr("");
    const seq = live.seq + 1, token = `W-${String(seq).padStart(3, "0")}`;
    const now = Date.now();
    const cand = { id: token, token, claim: code(6), name: profile.name, phone: profile.phone, email: profile.email, resume: profile.resume, room: null, state: "wait", at: now, pinged: false, calledAt: null, decidedAt: null, roundIdx: 0, roundAssigned: false, notes: {}, checkedIn: !remote, arrivedAt: remote ? null : now };
    setDrives((prev) => prev.map((x) => x.id === live.id ? { ...x, seq, candidates: [...x.candidates, cand] } : x));
    profile.applications.push(live.id);
    bindDevice(live.id);
    setMatched(null);
    setProven(false);
    setRemote(false);
    openTicket(live, cand);
  }

  function resetJoin() { setResult(null); setMatched(null); setProven(false); }

  return (
    <div style={{ minHeight: "100vh", background: k.cream2, fontFamily: bdy, color: k.ink }}>
      <TopBar back={back} title="Your token" accent={k.teal} tabs={profile ? [["profile", "My profile"], ["join", "Get my token"], ["history", "My applications"]] : null} tab={tab} setTab={setTab} />
      <div className="pagepad" style={{ maxWidth: 720, margin: "0 auto", padding: 26 }}>
        {!profile ? <BuildProfile onDone={setProfile} />
          : result ? <Slip r={result} drives={drives} onAgain={resetJoin} />
            : matched ? <ReviewJoin matched={drives.find((x) => x.id === matched.id) || matched} p={profile} setP={setProfile} proven={proven} left={left} onProve={tryProve} onBack={() => { setMatched(null); setProven(false); setJoinErr(""); }} onConfirm={() => join(matched)} joinErr={joinErr} remote={remote} />
              : tab === "profile" ? <MyProfile p={profile} setP={setProfile} />
                : tab === "join" ? <JoinDrive drives={drives} left={left} onMatch={handleMatch} />
                  : <History p={profile} drives={drives} />}
      </div>
    </div>
  );
}

export function ReviewJoin({ matched, p, setP, onBack, onConfirm, proven, onProve, left, joinErr, remote }) {
  const [deskIn, setDeskIn] = useState("");
  const [proveErr, setProveErr] = useState("");
  async function uploadResume(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setP({ ...p, resume: await readResumeFile(file) });
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
        <div style={{ ...box, padding: 18, marginBottom: 18 }}>
          <div style={{ fontSize: 12, color: k.mid, fontWeight: 600, marginBottom: 8 }}>Code on the lobby display</div>
          <div style={{ display: "flex", gap: 9 }}>
            <input value={deskIn} onChange={(e) => { setDeskIn(e.target.value.toUpperCase()); setProveErr(""); }} onKeyDown={(e) => e.key === "Enter" && submitProof()} placeholder="DESK-XXXXXX" style={{ ...input, fontFamily: typ, letterSpacing: 2, flex: 1, textTransform: "uppercase" }} maxLength={11} />
            <button onClick={submitProof} style={solidTeal}>Get my token</button>
          </div>
          {proveErr ? <div style={{ fontSize: 12.5, color: k.red, marginTop: 10, lineHeight: 1.5 }}>{proveErr}</div>
            : <div style={{ fontSize: 11.5, color: k.faint, marginTop: 9 }}>Rotates in {left}s. Desk can issue a pass.</div>}
        </div>
      )}

      {proven && (
        <>
          <div style={{ ...box, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10, background: k.tealDim }}>
            <ShieldCheck size={16} color={k.teal} />
            <div style={{ fontSize: 12.5, color: k.teal, fontWeight: 600 }}>{remote ? "You’ll get a token number and see how many people are ahead of you. Scan the lobby display when you arrive." : "You’re at the venue."}</div>
          </div>
          <div style={{ ...box, overflow: "hidden", marginBottom: 18 }}>
            <div style={{ padding: "10px 16px", borderBottom: `2px solid ${k.ink}`, fontFamily: typ, fontSize: 10.5, letterSpacing: 1.2, color: k.ink2 }}>THIS IS WHAT WE'LL SEND</div>
            <DataRow label="Name" value={p.name} />
            <DataRow label="Phone" value={p.phone} mono />
            <DataRow label="Email" value={p.email || "—"} />
            <DataRow label="Resume" value={resumeName(p.resume) || "Not attached"} tone={p.resume ? "teal" : "gold"}
              action={p.resume ? (
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 13, color: k.teal, fontWeight: 600 }}>{resumeName(p.resume)}</span>
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
          <button onClick={onConfirm} disabled={!!joinErr} style={{ ...solidTeal, width: "100%", justifyContent: "center", padding: 12, fontSize: 14, opacity: joinErr ? 0.5 : 1 }}>{joinErr ? "Walk-in is full" : <>Get my token <ArrowRight size={15} /></>}</button>
          <div style={{ fontSize: 11.5, color: k.faint, marginTop: 10, textAlign: "center" }}>Save the token page. That’s your place in line.</div>
        </>
      )}
    </div>
  );
}

export function BuildProfile({ onDone }) {
  const [f, setF] = useState({ name: "", phone: "", email: "", resume: null });
  const fillSample = () => onDone({
    name: "Ananya Rao", phone: "9959001122", email: "ananya.rao@gmail.com",
    id: `c_${Date.now()}`, resume: { name: "ananya_rao.pdf" }, applications: [], bound: {},
  });

  async function attachResume(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const resume = await readResumeFile(file);
    setF((p) => ({ ...p, resume }));
  }

  function submit(e) {
    e.preventDefault();
    if (!f.name.trim() || f.phone.trim().length !== 10) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) return;
    onDone({
      name: f.name.trim(), phone: f.phone, email: f.email.trim(), resume: f.resume,
      id: `c_${Date.now()}`, applications: [], bound: {},
    });
  }

  return (
    <div style={{ maxWidth: 460 }}>
      <h1 style={{ fontFamily: dsp, fontSize: 24, fontWeight: 700, letterSpacing: -0.5, margin: "0 0 5px" }}>Create your profile</h1>
      <p style={{ fontSize: 14, color: k.mid, margin: "0 0 18px", lineHeight: 1.55 }}>Name, mobile, email, and a resume. That’s all.</p>
      <button type="button" onClick={fillSample} style={{ ...ghostSm, marginBottom: 16 }}>Fill sample data</button>
      <form onSubmit={submit} style={{ ...box, padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="Full name"><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} style={input} required /></Field>
        <Field label="Mobile number">
          <input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} style={input} placeholder="10 digits" inputMode="numeric" required />
        </Field>
        <Field label="Email"><input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} style={input} required /></Field>
        <Field label="Resume">
          <label style={{ ...ghostSm, cursor: "pointer", alignSelf: "flex-start" }}>
            {f.resume ? "Replace file" : "Upload PDF or Word"}
            <input type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={attachResume} />
          </label>
          {f.resume ? <div style={{ fontSize: 12.5, color: k.teal, fontWeight: 600, marginTop: 8 }}>{resumeName(f.resume)}</div> : null}
        </Field>
        <button type="submit" style={{ ...solidTeal, justifyContent: "center", padding: 12, fontSize: 14.5, marginTop: 4 }}>Create profile</button>
      </form>
    </div>
  );
}

export function MyProfile({ p, setP }) {
  async function attachResume(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setP({ ...p, resume: await readResumeFile(file) });
  }
  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, gap: 16, flexWrap: "wrap" }}>
        <div><h1 style={{ fontFamily: dsp, fontSize: 23, fontWeight: 700, letterSpacing: -0.5, margin: "0 0 3px" }}>{p.name}</h1><div style={{ fontSize: 13, color: k.mid, fontFamily: typ }}>{p.phone}{p.email ? ` · ${p.email}` : ""}</div></div>
        <Pill tone={p.resume ? "teal" : "gold"}>{p.resume ? "Resume on file" : "Add a resume"}</Pill>
      </div>
      <SectionLabel>Contact</SectionLabel>
      <div style={{ ...box, overflow: "hidden", marginBottom: 24 }}>
        <DataRow label="Mobile" value={p.phone} mono />
        <DataRow label="Email" value={p.email || "—"} last />
      </div>
      <SectionLabel>Resume</SectionLabel>
      <div style={{ ...box, overflow: "hidden" }}>
        <DocRow icon={FileText} title="Resume" sub={resumeName(p.resume) || "Recruiters see this when they call you"} done={!!p.resume} last
          action={p.resume
            ? <label style={ghostSm}>Replace<input type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={attachResume} /></label>
            : <label style={{ ...solidTeal, padding: "7px 13px", fontSize: 12.5, cursor: "pointer" }}>Upload<input type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={attachResume} /></label>} />
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
      setErr("That is a Desk PIN. Scan the lobby display instead.");
      return;
    }
    const kind = raw.startsWith("PASS") ? "pass" : raw.startsWith("DESK") ? "desk" : raw.startsWith("GATE") ? "gate" : null;
    const v = bare6(raw);
    const live = drives.filter((d) => driveStatus(d) === "live");
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
      const later = drives.find((d) => driveStatus(d) === "scheduled" && bare6(d.gate) === v);
      if (later) { setErr("This walk-in has not opened yet."); return; }
      setErr("No walk-in matches that code.");
      return;
    }
    if (v.length <= 4 && byPass) { onMatch(byPass, "pass"); return; }
    if (v.length < 6) { setErr("Enter the full code from the screen."); return; }
    if (byGate) { onMatch(byGate, "gate"); return; }
    if (byDesk) { onMatch(byDesk, "desk"); return; }
    const later = drives.find((d) => driveStatus(d) === "scheduled" && bare6(d.gate) === v);
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
          const byDesk = drives.find((d) => driveStatus(d) === "live" && liveDesk(d) === found.desk);
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
      <h1 style={{ fontFamily: dsp, fontSize: 23, fontWeight: 700, letterSpacing: -0.5, margin: "0 0 5px" }}>Get my token</h1>
      <p style={{ fontSize: 13.5, color: k.mid, margin: "0 0 20px", lineHeight: 1.55 }}>Scan the lobby display at the venue, or pick a walk-in from the list.</p>
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
        <div style={{ fontSize: 12, color: k.mid, fontWeight: 600, marginBottom: 9 }}>Scan the lobby display</div>
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
  const pool = live?.candidates || r.drive.candidates || [];
  const waiting = pool.filter((x) => x.state === "wait").sort((a, b) => a.at - b.at);
  const ahead = queueAhead(pool, cand);
  const current = currentServingToken(pool, cand);
  const goRoom = roomName(cand.room);
  const round = roundLabel(rounds, cand);
  const { armed, arm } = useQueueAlert({ state: cand.state, ahead });
  const next = cand.state === "wait" && ahead === 0;
  const proceed = cand.state === "calling";

  return (
    <div style={{ maxWidth: 440 }}>
      <div style={{
        border: `1px solid ${proceed ? k.coral : k.line}`,
        borderRadius: 14,
        overflow: "hidden",
        background: proceed ? k.coral : "#fff",
        color: proceed ? "#fff" : k.ink,
        boxShadow: "0 14px 34px -24px rgba(27,24,21,.35)",
        transition: "background .25s ease, border-color .25s ease",
      }}>
        <div style={{
          background: proceed ? "rgba(0,0,0,.18)" : (isDup ? k.gold : k.ink),
          color: "#fff", padding: "9px 18px", fontFamily: typ, fontSize: 11, letterSpacing: 1.4,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span>{proceed ? "PLEASE PROCEED" : isDup ? "ALREADY CHECKED IN" : "YOUR TOKEN"}</span>
          <span style={{ fontSize: 9.5, opacity: .75, letterSpacing: .5 }}>{hallChrome(r.drive)}</span>
        </div>
        <div style={{ padding: "24px 22px 22px" }}>
          <div style={{ fontFamily: typ, fontSize: 12, letterSpacing: 1.6, fontWeight: 700, color: proceed ? "rgba(255,255,255,.8)" : k.mid, marginBottom: 6 }}>TOKEN {tokenDigits(r.token)}</div>
          <div style={{ fontFamily: dsp, fontSize: proceed ? 42 : 36, fontWeight: 800, letterSpacing: -1.4, lineHeight: 1, marginBottom: 6 }}>{tokenDigits(r.token)}</div>
          {cand.name && <div style={{ fontSize: 15, fontWeight: 600, opacity: proceed ? .9 : 1, marginBottom: 18 }}>{cand.name}</div>}

          {proceed ? (
            <div>
              <div style={{ fontFamily: dsp, fontSize: 22, fontWeight: 800, lineHeight: 1.2, marginBottom: 14 }}>Please proceed</div>
              {goRoom ? <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.6 }}>{goRoom}</div> : null}
              {round ? <div style={{ fontSize: 15, marginTop: 6, opacity: .9 }}>{round}</div> : null}
            </div>
          ) : cand.state === "wait" ? (
            <div style={{ textAlign: "center", background: next ? k.coralDim : k.cream2, borderRadius: 14, padding: "22px 16px", marginBottom: 8 }}>
              {current ? (
                <div style={{ fontSize: 13, color: k.mid, marginBottom: 10 }}>Current token: <b style={{ fontFamily: typ, color: k.ink }}>{tokenDigits(current)}</b></div>
              ) : null}
              {next ? (
                <>
                  <div style={{ fontFamily: dsp, fontSize: 28, fontWeight: 800, color: k.coral, letterSpacing: -0.8, lineHeight: 1.1 }}>You’re next</div>
                  <div style={{ fontSize: 14, color: k.ink2, fontWeight: 600, marginTop: 10 }}>{goRoom ? `Please proceed to ${goRoom}` : "Please stay nearby"}</div>
                </>
              ) : (
                <>
                  <div style={{ fontFamily: dsp, fontSize: 46, fontWeight: 800, color: k.coral, letterSpacing: -1.5, lineHeight: 1 }}>{ahead}</div>
                  <div style={{ fontSize: 13.5, color: k.ink2, fontWeight: 600, marginTop: 4 }}>{ahead === 1 ? "candidate ahead of you" : "candidates ahead of you"}</div>
                  <div style={{ fontSize: 13, color: k.teal, fontWeight: 700, marginTop: 10 }}>Please stay nearby</div>
                </>
              )}
              {inARound(cand) && <div style={{ fontSize: 12, fontWeight: 700, color: k.coral, marginTop: 10 }}>{round}</div>}
            </div>
          ) : (
            <div style={{ marginBottom: 8 }}>
              <QueueStatusPill state={cand.state} />
              <div style={{ fontSize: 13, color: k.ink2, marginTop: 10, lineHeight: 1.6 }}>{QUEUE_STATE_COPY[cand.state] || "Check back on the desk screen for the latest."}</div>
              {["calling", "interviewing"].includes(cand.state) && round && (
                <div style={{ fontSize: 12.5, fontWeight: 700, color: k.coral, marginTop: 8 }}>{round}</div>
              )}
              {goRoom && ["calling", "interviewing"].includes(cand.state) && (
                <div style={{ background: k.coralDim, borderRadius: 12, padding: "14px 16px", marginTop: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: k.coral, letterSpacing: .7, textTransform: "uppercase", marginBottom: 5 }}>Go to</div>
                  <div style={{ fontFamily: dsp, fontSize: 22, fontWeight: 800, color: k.ink }}>{goRoom}</div>
                  {cand.room?.interviewer ? <div style={{ fontSize: 13, color: k.ink2, marginTop: 2 }}>Interviewer: {cand.room.interviewer}</div> : null}
                </div>
              )}
            </div>
          )}

          <div style={{ fontSize: 12.5, color: proceed ? "rgba(255,255,255,.85)" : k.ink2, lineHeight: 1.55, marginTop: 16 }}>
            Keep this page open to receive live turn updates.
          </div>
          <button type="button" onClick={arm} style={{
            ...outlineSm, marginTop: 10,
            borderColor: proceed ? "rgba(255,255,255,.55)" : k.line,
            color: proceed ? "#fff" : k.ink,
            background: proceed ? "rgba(255,255,255,.12)" : "#fff",
          }}>
            {armed ? "Sound and vibration on" : "Turn on sound and vibration"}
          </button>

          <div style={{ marginTop: 18 }}>
            <RoundTracker rounds={rounds} cand={cand} />
          </div>

          <div style={{ fontSize: 11.5, color: proceed ? "rgba(255,255,255,.55)" : k.faint, marginTop: 18, paddingTop: 14, borderTop: `1px solid ${proceed ? "rgba(255,255,255,.2)" : k.line}`, lineHeight: 1.5 }}>
            {isDup ? `${waiting.length} still waiting` : "Your place is held."}
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
      <p style={{ fontSize: 13, color: k.mid, margin: "0 0 18px" }}>Open a token to see your wait.</p>
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
