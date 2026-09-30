import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, ShieldCheck, FileText, Check } from "lucide-react";
import { bdy, dsp, typ, k, box, input, solidTeal, outlineSm, ghostSm, iconBtn } from "../../theme.js";
import { HallBrand, TokenChip, tokenDigits } from "../../components/brand.jsx";
import { AudienceStrip } from "../../components/SiteChrome.jsx";
import { Blank, Field, Pill, SectionLabel, TopBar } from "../../components/ui.jsx";
import { DrivePosting } from "../../components/DrivePosting.jsx";
import { KeepTokenLink } from "../../components/KeepTokenLink.jsx";
import { useQueueAlert } from "../../hooks/useQueueAlert.js";
import { rememberTicket, readTickets, api } from "../../lib/api.js";
import { readDeviceId } from "../../lib/device.js";
import { clearProof, readProof, writeProof } from "../../lib/proof.js";
import { t } from "../../i18n/strings.js";
import { driveRoles, fieldAnswerOk } from "../../lib/library.js";
import { checkResumeFile, emailOk, indianPhone, resumeIsRequired } from "../../lib/resume.js";
import { isPrereg, makePrereg, preregOf, promotePrereg } from "../../lib/prereg.js";
import { DEFAULT_ROUNDS, firstRoundIdx, boundToday, code, driveStatus, tokensOpen, currentServingToken, dupOf, hallChrome, inARound, isTerminal, joinBlockedReason, listingHost, liveDesk, livePass, listingPlace, queueAhead, resumeName, readResumeFile, roomName, roundLabel, scanEnabled, todayStr, tokenPath, trackerCurrent, venueProofOf, bare6, clientOf, hallLogo, hallName, orgColor } from "../../lib/helpers.js";

export function Candidate({ store, back, initialTab }) {
  const nav = useNavigate();
  const { profile, setProfile, drives, setDrives, left, orgs } = store;
  const [tab, setTab] = useState(initialTab || "profile");
  const [matched, setMatched] = useState(null);
  const [proven, setProven] = useState(false);
  const [result, setResult] = useState(null);
  const [joinErr, setJoinErr] = useState("");
  const [params, setParams] = useSearchParams();
  const scannedGate = params.get("g");
  const scannedDesk = params.get("d");
  const wantedDrive = params.get("drive");
  const registerOnly = params.get("register") === "1";
  const [remote, setRemote] = useState(false);
  const autoRef = useRef(false);
  const proofRef = useRef(readProof());

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
    const queueLen = live.candidates.filter((c) => !isPrereg(c)).length;
    const blocked = !already && !scanEnabled(hostOrg)
      ? "This walk-in is not taking scans yet."
      : (!already || isPrereg(already) ? joinBlockedReason(hostOrg, queueLen) : "");
    setJoinErr(blocked);
    if (via === "remote") {
      if (already && !isPrereg(already) && already.token) { showDupSlip(live, already); return; }
      setMatched(live);
      setProven(true);
      setRemote(true);
      return;
    }
    setRemote(false);
    if (via === "desk" || via === "pass") {
      if (via === "pass") consumePass(live.id);
      if (already && !isPrereg(already) && already.token) { markArrived(live.id, already.id); showDupSlip(live, already); return; }
      setMatched(live);
      setProven(true);
      return;
    }
    if (already && !isPrereg(already) && boundToday(profile, live.id)) { showDupSlip(live, already); return; }
    setMatched(live);
    setProven(false);
  }

  // A scan lands here as ?g=<gate>&d=<desk>. When the screen supplied a live desk code
  // the candidate is already proven to be in the room, so the whole flow collapses to
  // one confirm tap. Waits for a profile and for drives to hydrate before deciding.
  useEffect(() => {
    if (autoRef.current || !profile || !scannedGate) return;
    const live = drives.filter((d) => tokensOpen(d));
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

  // "Get my token" on a listing lands here as ?drive=<id>. Tokens are only given at the
  // venue, so this opens the drive and still asks for the code on the lobby display.
  useEffect(() => {
    if (autoRef.current || !profile || !wantedDrive) return;
    const hit = drives.find((d) => d.id === wantedDrive);
    if (!hit) return;
    autoRef.current = true;
    setParams({}, { replace: true });
    const proof = readProof();
    if (proof?.driveId === hit.id) {
      proofRef.current = proof;
      setTab("join");
      handleMatch(hit, proof.method === "desk_pass" ? "pass" : "desk");
      return;
    }
    if (registerOnly || !tokensOpen(hit)) {
      setTab("join");
      handleMatch(hit, "remote");
      if (!tokensOpen(hit) && !registerOnly) setJoinErr(t("empty.checkinClosed"));
      return;
    }
    setTab("join");
    handleMatch(hit, "gate");
  }, [drives, profile, wantedDrive]);

  async function tryProve(codeStr) {
    if (!matched) return "No walk-in selected.";
    const live = drives.find((x) => x.id === matched.id) || matched;
    try {
      const r = await api.lobbyCheck({ driveId: live.id, code: codeStr, method: "typed_code", deviceId: readDeviceId() });
      writeProof({ driveId: r.driveId || live.id, method: r.method, location_verified: r.location_verified, at: Date.now() });
      proofRef.current = r;
      const already = dupOf(live, profile);
      if (already && !isPrereg(already) && already.token) { markArrived(live.id, already.id); showDupSlip(live, already); return ""; }
      setProven(true);
      return "";
    } catch (e) {
      return e.message || t("scan.fail");
    }
  }

  function join(d, extra = {}) {
    const live = drives.find((x) => x.id === d.id) || d;
    const dup = dupOf(live, profile);
    const hostOrg = orgs.find((o) => o.id === live.orgId);

    if (remote) {
      if (dup && !isPrereg(dup) && dup.token) { showDupSlip(live, dup); return; }
      if (dup && isPrereg(dup)) { setMatched(null); setProven(false); setRemote(false); nav(`/walk-ins/${encodeURIComponent(live.id)}`); return; }
      const cand = makePrereg({ ...profile, deviceId: profile.deviceId || readDeviceId() }, { consentAt: extra.consentAt, roleId: extra.roleId, answers: extra.answers });
      setDrives((prev) => prev.map((x) => x.id === live.id ? { ...x, candidates: [...x.candidates, cand] } : x));
      if (!profile.applications.includes(live.id)) profile.applications.push(live.id);
      setProfile({ ...profile, applications: profile.applications });
      setMatched(null);
      setProven(false);
      setRemote(false);
      nav(`/walk-ins/${encodeURIComponent(live.id)}`);
      return;
    }

    if (!proven) return;
    const blocked = !scanEnabled(hostOrg) ? "This walk-in is not taking scans yet." : joinBlockedReason(hostOrg, live.candidates.filter((c) => !isPrereg(c)).length);
    if (blocked) {
      setJoinErr(blocked);
      return;
    }
    setJoinErr("");
    const proof = readProof() || proofRef.current || {};

    if (dup && isPrereg(dup)) {
      const seq = live.seq + 1;
      const cand = promotePrereg(dup, seq, proof);
      setDrives((prev) => prev.map((x) => x.id === live.id ? {
        ...x, seq, candidates: x.candidates.map((c) => (c.id === dup.id ? cand : c)),
      } : x));
      bindDevice(live.id);
      clearProof();
      setMatched(null);
      setProven(false);
      openTicket(live, cand);
      return;
    }
    if (dup) { showDupSlip(live, dup); return; }

    const seq = live.seq + 1;
    const token = `W-${String(seq).padStart(3, "0")}`;
    const now = Date.now();
    const role = driveRoles(live).find((r) => r.id === extra.roleId);
    const answers = Object.fromEntries((live.fields || []).map((f) => [f.id, String(extra.answers?.[f.id] ?? "").trim()]).filter(([, v]) => v));
    const cand = {
      id: token, token, claim: code(6), name: profile.name, phone: profile.phone, email: profile.email, resume: profile.resume, deviceId: profile.deviceId || readDeviceId(), room: null, state: "wait", at: now, pinged: false, calledAt: null, decidedAt: null,
      roundIdx: firstRoundIdx(live.rounds, role?.id), roundAssigned: false, notes: {}, checkedIn: true, arrivedAt: now,
      checkin_method: proof.method || "typed_code",
      location_verified: proof.location_verified ?? "unknown",
      checkin_at: proof.at || now,
      ...(role ? { roleId: role.id, roleCode: role.code } : {}), ...(Object.keys(answers).length ? { answers } : {}),
      consentAt: extra.consentAt || now,
    };
    setDrives((prev) => prev.map((x) => x.id === live.id ? { ...x, seq, candidates: [...x.candidates, cand] } : x));
    if (!profile.applications.includes(live.id)) profile.applications.push(live.id);
    bindDevice(live.id);
    clearProof();
    setMatched(null);
    setProven(false);
    setRemote(false);
    openTicket(live, cand);
  }

  function resetJoin() { setResult(null); setMatched(null); setProven(false); }

  return (
    <div style={{ minHeight: "100vh", background: k.cream2, fontFamily: bdy, color: k.ink }}>
      <TopBar back={back} title="Your token" accent={k.teal} tabs={profile ? [["profile", t("candidate.tabs.details")], ["join", t("candidate.tabs.checkIn")], ["history", t("candidate.tabs.tokens")]] : null} tab={tab} setTab={setTab} />
      <div className="pagepad" style={{ maxWidth: 720, margin: "0 auto", padding: 26 }}>
        {!profile ? <BuildProfile onDone={setProfile} />
          : result ? <Slip r={result} drives={drives} onAgain={resetJoin} />
            : matched ? <ReviewJoin matched={drives.find((x) => x.id === matched.id) || matched} p={profile} setP={setProfile} proven={proven} left={left} onProve={tryProve} onBack={() => { setMatched(null); setProven(false); setJoinErr(""); }} onConfirm={(extra) => join(matched, extra)} joinErr={joinErr} remote={remote} />
              : tab === "profile" ? <MyProfile p={profile} setP={setProfile} />
                : tab === "join" ? <JoinDrive drives={drives} left={left} onMatch={handleMatch} />
                  : <History p={profile} drives={drives} />}
      </div>
      <AudienceStrip kind="candidate" />
    </div>
  );
}

function CheckinQuestions({ drive, roleId, setRoleId, answers, setAnswers, err }) {
  const roles = driveRoles(drive);
  const fields = drive.fields || [];
  if (roles.length < 2 && !fields.length) return null;
  const set = (id, v) => setAnswers({ ...answers, [id]: v });
  const label = { display: "block", fontSize: 12.5, color: k.ink2, fontWeight: 600, marginBottom: 6 };
  const optionBtn = (on) => ({ ...outlineSm, borderColor: on ? k.teal : k.line, background: on ? k.tealDim : "#fff", color: on ? k.teal : k.ink, fontWeight: 600 });
  return (
    <div style={{ ...box, padding: 18, marginBottom: 16, display: "flex", flexDirection: "column", gap: 16 }}>
      {roles.length > 1 && (
        <div role="radiogroup" aria-label={t("checkin.roleTitle")}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>{t("checkin.roleTitle")}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {roles.map((r) => (
              <button key={r.id} type="button" role="radio" aria-checked={roleId === r.id} onClick={() => setRoleId(r.id)}
                style={{ ...optionBtn(roleId === r.id), justifyContent: "flex-start", textAlign: "left", padding: "10px 12px", display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontFamily: typ, fontSize: 11.5, letterSpacing: 0.6, padding: "3px 6px", borderRadius: 6, background: k.cream2, color: k.ink2 }}>{r.code}</span>
                <span>{r.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {fields.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{t("checkin.questions", { company: hallName(drive) })}</div>
          {fields.map((f) => {
            const id = `cq-${f.id}`;
            const v = answers[f.id] ?? "";
            const head = <>{f.label} <span style={{ color: k.faint, fontWeight: 500 }}>· {f.required ? t("checkin.required") : t("checkin.optional")}</span></>;
            if (f.type === "yesno") {
              return (
                <div key={f.id} role="radiogroup" aria-label={f.label}>
                  <span style={label}>{head}</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["yes", "no"].map((x) => <button key={x} type="button" role="radio" aria-checked={v === x} onClick={() => set(f.id, x)} style={optionBtn(v === x)}>{t(`checkin.${x}`)}</button>)}
                  </div>
                </div>
              );
            }
            return (
              <div key={f.id}>
                <label htmlFor={id} style={label}>{head}</label>
                {f.type === "dropdown" ? (
                  <select id={id} value={v} onChange={(e) => set(f.id, e.target.value)} style={input}>
                    <option value="">{t("checkin.choose")}</option>
                    {(f.options || []).map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input id={id} value={v} onChange={(e) => set(f.id, f.type === "number" ? e.target.value.replace(/[^\d.]/g, "") : e.target.value)}
                    inputMode={f.type === "number" ? "decimal" : undefined} maxLength={200} style={input} />
                )}
              </div>
            );
          })}
        </div>
      )}
      {err && <div role="alert" style={{ fontSize: 13, color: k.red, lineHeight: 1.5 }}>{err}</div>}
    </div>
  );
}

export function ReviewJoin({ matched, p, setP, onBack, onConfirm, proven, onProve, left, joinErr, remote }) {
  const [deskIn, setDeskIn] = useState("");
  const [proveErr, setProveErr] = useState("");
  const roles = driveRoles(matched);
  const [roleId, setRoleId] = useState(roles.length === 1 ? roles[0].id : "");
  const [answers, setAnswers] = useState({});
  const [formErr, setFormErr] = useState("");
  const [consent, setConsent] = useState(false);
  const [edit, setEdit] = useState(false);
  const pre = preregOf(matched, p);
  const oneTap = proven && !remote && !!pre && p?.name && p?.phone && !edit;
  const company = hallName(matched);
  function confirm() {
    if (!emailOk(p.email)) { setFormErr(t("checkin.emailErr")); return; }
    if (!indianPhone(p.phone)) { setFormErr(t("checkin.phoneErr")); return; }
    if (resumeIsRequired(matched) && !resumeName(p.resume)) { setFormErr(t("checkin.resumeNeed")); return; }
    if (roles.length > 1 && !roles.some((r) => r.id === roleId)) { setFormErr(t("checkin.roleErr")); return; }
    if ((matched.fields || []).some((f) => !fieldAnswerOk(f, answers[f.id]))) { setFormErr(t("checkin.answerErr")); return; }
    if (!consent) { setFormErr(t("checkin.consentErr")); return; }
    setFormErr("");
    onConfirm({ roleId: roles.length > 1 ? roleId : "", answers, consentAt: Date.now() });
  }
  async function uploadResume(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const bad = checkResumeFile(file);
    if (bad.error === "size") { setFormErr(t("checkin.resumeSize")); return; }
    if (bad.error === "type" || bad.error === "missing") { setFormErr(t("checkin.resumeType")); return; }
    setFormErr("");
    setP({ ...p, resume: await readResumeFile(file) });
  }
  function submitProof() {
    onProve(deskIn).then((err) => { if (err) setProveErr(err); });
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
            <input value={deskIn} onChange={(e) => { setDeskIn(e.target.value.toUpperCase()); setProveErr(""); }} onKeyDown={(e) => e.key === "Enter" && submitProof()} placeholder={t("scan.placeholder")} style={{ ...input, fontFamily: typ, letterSpacing: 2, flex: 1, textTransform: "uppercase" }} maxLength={8} />
            <button onClick={submitProof} style={solidTeal}>{t("buttons.checkIn")}</button>
          </div>
          {proveErr ? <div style={{ fontSize: 12.5, color: k.red, marginTop: 10, lineHeight: 1.5 }}>{proveErr}</div>
            : <div style={{ fontSize: 11.5, color: k.faint, marginTop: 9 }}>{t("scan.deskHint")}</div>}
        </div>
      )}

      {proven && (
        <>
          {oneTap ? (
            <div style={{ ...box, padding: 18, marginBottom: 18 }}>
              <p style={{ fontSize: 16, fontWeight: 700, margin: "0 0 8px" }}>{t("checkin.asName", { name: p.name })}</p>
              <p className="small muted" style={{ margin: "0 0 14px" }}>{p.name} · {p.phone}</p>
              <button type="button" onClick={() => onConfirm({ roleId: roles.length === 1 ? roles[0].id : roleId, answers, consentAt: pre?.consentAt || Date.now() })} style={{ ...solidTeal, width: "100%", justifyContent: "center", padding: 12, fontSize: 14 }}>{t("checkin.confirm")}</button>
              <button type="button" onClick={() => setEdit(true)} style={{ ...ghostSm, marginTop: 10 }}>{t("checkin.notYou")}</button>
            </div>
          ) : (
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
          <CheckinQuestions drive={matched} roleId={roleId} setRoleId={(v) => { setRoleId(v); setFormErr(""); }} answers={answers} setAnswers={(v) => { setAnswers(v); setFormErr(""); }} err={null} />
          {formErr && <div role="alert" style={{ fontSize: 13, color: k.red, lineHeight: 1.5, marginBottom: 12 }}>{formErr}</div>}
          <label className="check" style={{ alignItems: "flex-start", marginBottom: 14 }}>
            <input type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); setFormErr(""); }} />
            <span style={{ fontSize: 13, lineHeight: 1.45 }}>{t("checkin.consent", { company })}</span>
          </label>
          {joinErr && <div style={{ fontSize: 13, color: k.red, margin: "0 0 10px", textAlign: "center" }}>{joinErr}</div>}
          <button onClick={confirm} disabled={!!joinErr} style={{ ...solidTeal, width: "100%", justifyContent: "center", padding: 12, fontSize: 14, opacity: joinErr ? 0.5 : 1 }}>{joinErr ? "Walk-in is full" : remote ? t("buttons.registerWalkIn") : <>Get my token <ArrowRight size={15} /></>}</button>
          <div style={{ fontSize: 11.5, color: k.faint, marginTop: 10, textAlign: "center" }}>{remote ? t("detail.noTokenYet") : "Save the token page. That’s your place in line."}</div>
          </>
          )}
        </>
      )}
    </div>
  );
}

export function BuildProfile({ onDone }) {
  const [f, setF] = useState({ name: "", phone: "", email: "", resume: null });
  const fillSample = () => onDone({
    name: "Ananya Rao", phone: "9959001122", email: "ananya.rao@gmail.com",
    id: `c_${Date.now()}`, deviceId: readDeviceId(), resume: { name: "ananya_rao.pdf" }, applications: [], bound: {},
  });

  async function attachResume(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (checkResumeFile(file).error) return;
    const resume = await readResumeFile(file);
    setF((p) => ({ ...p, resume }));
  }

  function submit(e) {
    e.preventDefault();
    if (!f.name.trim() || !indianPhone(f.phone)) return;
    if (!emailOk(f.email.trim())) return;
    onDone({
      name: f.name.trim(), phone: indianPhone(f.phone), email: f.email.trim(), resume: f.resume,
      id: `c_${Date.now()}`, deviceId: readDeviceId(), applications: [], bound: {},
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
    if (checkResumeFile(file).error) return;
    setP({ ...p, resume: await readResumeFile(file) });
  }
  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, gap: 16, flexWrap: "wrap" }}>
        <div><h1 style={{ fontFamily: dsp, fontSize: 23, fontWeight: 700, letterSpacing: -0.5, margin: "0 0 3px" }}>{p.name}</h1><div style={{ fontSize: 13, color: k.mid, fontFamily: typ }}>{p.phone}{p.email ? ` · ${p.email}` : ""}</div></div>
        <Pill tone={p.resume ? "teal" : "gold"}>{p.resume ? t("candidate.resumeOnFile") : t("candidate.addResume")}</Pill>
      </div>
      <p style={{ fontSize: 13, color: k.mid, margin: "0 0 18px" }}>{t("candidate.device")}</p>
      <SectionLabel>Contact</SectionLabel>
      <div style={{ ...box, overflow: "hidden", marginBottom: 24 }}>
        <DataRow label={t("candidate.name")} value={p.name} />
        <DataRow label={t("candidate.phone")} value={p.phone} mono />
        <DataRow label={t("candidate.email")} value={p.email || "—"} last />
      </div>
      <SectionLabel>{t("candidate.resume")}</SectionLabel>
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
        <div style={{ fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 7 }}>{title}{done && <Check size={14} color={k.teal} />}</div>
        <div style={{ fontSize: 12.5, color: done ? k.teal : k.mid, marginTop: 2 }}>{sub}</div>
      </div>
      {action}
    </div>
  );
}

export function JoinDrive({ drives, onMatch }) {
  const nav = useNavigate();
  const tickets = readTickets();
  const live = drives.filter((d) => tokensOpen(d));
  return (
    <div style={{ maxWidth: 520 }}>
      <h1 style={{ fontFamily: dsp, fontSize: 23, fontWeight: 700, letterSpacing: -0.5, margin: "0 0 5px" }}>{t("nav.scanCheckIn")}</h1>
      <p style={{ fontSize: 13.5, color: k.mid, margin: "0 0 20px", lineHeight: 1.55 }}>{t("scan.lede")}</p>
      <button onClick={() => nav("/check-in")} style={{ ...solidTeal, width: "100%", justifyContent: "center", padding: 12, marginBottom: 16 }}>{t("scan.openCamera")}</button>
      {!!tickets.length && (
        <div style={{ ...box, padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: k.faint, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 }}>{t("candidate.tabs.tokens")}</div>
          {tickets.slice(0, 4).map((tk) => (
            <button key={tk.driveId + tk.token} type="button" onClick={() => nav(tokenPath(tk.driveId, tk.token, tk.claim))} style={{ ...ghostSm, marginRight: 8, marginBottom: 6 }}>
              {tk.token}{tk.role ? ` · ${tk.role}` : ""}
            </button>
          ))}
        </div>
      )}
      {live.map((d) => (
        <button key={d.id} type="button" onClick={() => onMatch(d, "gate")} style={{ ...box, display: "block", width: "100%", textAlign: "left", padding: 14, marginBottom: 8, cursor: "pointer" }}>
          <div style={{ fontWeight: 700 }}>{d.role}</div>
          <div style={{ fontSize: 13, color: k.mid }}>{d.company}</div>
        </button>
      ))}
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
  const mine = drives.flatMap((d) => d.candidates.filter((c) => c.phone === p.phone && c.token).map((c) => ({ ...c, drive: d })));
  const active = ["wait", "calling", "interviewing"];
  mine.sort((a, b) => (active.includes(b.state) ? 1 : 0) - (active.includes(a.state) ? 1 : 0) || (b.at || 0) - (a.at || 0));
  const label = { wait: ["grey", "Waiting"], calling: ["teal", "Being called"], interviewing: ["teal", "In interview"], selected: ["teal", "Selected"], rejected: ["red", "Rejected"], onhold: ["gold", "On hold"], absent: ["grey", "Missed turn"] };
  return (
    <div style={{ maxWidth: 560 }}>
      <h1 style={{ fontFamily: dsp, fontSize: 23, fontWeight: 700, letterSpacing: -0.5, margin: "0 0 8px" }}>{t("candidate.tokensTitle")}</h1>
      <p style={{ fontSize: 13, color: k.mid, margin: "0 0 18px" }}>{t("candidate.tokensSub")}</p>
      {!mine.length ? (
        <div>
          <p style={{ fontSize: 14, color: k.mid }}>{t("candidate.emptyTokens")}</p>
          <button type="button" onClick={() => nav("/walk-ins")} style={{ ...solidTeal, marginTop: 12 }}>{t("buttons.browse")}</button>
          <button type="button" onClick={() => nav("/check-in")} style={{ ...ghostSm, marginTop: 8 }}>{t("nav.scanCheckIn")}</button>
        </div>
      ) : (
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
