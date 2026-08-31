import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutGrid, MonitorSmartphone, ListChecks, Send, PieChart, ArrowRight, Plus, ArrowLeft, Mail, ShieldCheck, FileText, Building2, Download, Users2, Building, HeartHandshake, Globe, Lock, Palette, MoreHorizontal, Search, Linkedin, Check } from "lucide-react";
import { bdy, dsp, typ, k, R, box, input, solid, solidSm, outline, outlineSm, ghostSm, iconBtn, link, cell, textLink } from "../../theme.js";
import { BarChart, Bar, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { HallBrand, OrgLogo, TokenChip, TokenTile, Wordmark } from "../../components/brand.jsx";
import { Blank, Btn, CitySelect, DropPanel, Field, Head, Pill, Select, StatusPill, TopBar, fmtDate } from "../../components/ui.jsx";
import { useNarrow } from "../../hooks/useNarrow.js";
import {
  BRAND_COLORS, CITIES, DEFAULT_ROOMS, DEFAULT_ROUNDS, DOC_OPTIONS, EXP_BANDS, LOGO_PRESETS, PASS_TTL,
  bare6, clientOf, code, driveCapCopy, driveSlotsLeft, hallChrome, hallLogo, hallName, inARound, inNudgeWindow,
  isAgencyOrg, isTerminal, listingPlace, livePass, memberEmail, memberName, memberRole, newGate, newHost, newPass,
  nudgeText, occupantOf, orgColor, orgCities, passLabel, planLimits, planOf, recruitersOf, roundLabel, siteOf, tat, todayStr, downloadFile,
  gateUrl, mask, pc, roomsForRound, roomRoundLabel, roundIndexOfRoom, roundOutcomeOf, waitingRoundIdx, bindRoomsToRounds,
} from "../../lib/helpers.js";
import { HIDE_PRICING } from "../../lib/flags.js";
import QrCode from "../../components/QrCode.jsx";
import DriveSetup from "./DriveSetup.jsx";

const TABS = [["today", "Today", LayoutGrid], ["live", "Live queue", ListChecks], ["screen", "Waiting screen", MonitorSmartphone], ["queue", "All candidates", Users2], ["rounds", "Rounds", Building2], ["rooms", "Rooms", Building], ["branding", "Branding", ShieldCheck], ["msgs", "Messages", Send], ["result", "Reports", PieChart]];
const DESK_TABS = [["live", "Live queue", ListChecks], ["screen", "Waiting screen", MonitorSmartphone]];
export function staffTabs(org) {
  const lim = planLimits(org);
  return TABS.filter(([id]) => {
    if (id === "result" && lim.reports === false) return false;
    if (id === "rooms" && lim.rooms === false) return false;
    if (id === "msgs" && lim.notify === false) return false;
    return true;
  });
}
const PRIMARY_TAB_IDS = new Set(["today", "live", "queue", "screen"]);

export function AppTabs({ tabs, tab, setTab, accent, msgCount, layout }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const primary = tabs.filter(([id]) => PRIMARY_TAB_IDS.has(id));
  const extra = tabs.filter(([id]) => !PRIMARY_TAB_IDS.has(id));
  const extraOn = extra.some(([id]) => id === tab);
  function pick(id) { setTab(id); setMoreOpen(false); }
  const short = (lab) => (lab === "Live queue" ? "Live" : lab === "Waiting screen" ? "TV" : lab === "All candidates" ? "Queue" : lab);

  if (layout === "side") {
    return (
      <nav style={{ display: "flex", flexDirection: "column", gap: 2, padding: "8px 10px 16px" }}>
        {tabs.map(([tid, lab, I]) => {
          const on = tab === tid;
          return (
            <button key={tid} type="button" onClick={() => pick(tid)} style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px",
              border: "none", borderRadius: 10, cursor: "pointer", textAlign: "left",
              background: on ? `${accent}18` : "transparent", color: on ? accent : k.ink2,
              fontWeight: on ? 700 : 500, fontSize: 13.5, fontFamily: bdy,
            }}>
              <I size={16} />
              <span style={{ flex: 1 }}>{lab}</span>
              {tid === "msgs" && msgCount > 0 && <Pill tone="grey">{msgCount}</Pill>}
            </button>
          );
        })}
      </nav>
    );
  }

  return (
    <>
      {moreOpen && extra.length > 0 && (
        <div onClick={() => setMoreOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(11,16,32,.4)", zIndex: 90, display: "flex", alignItems: "flex-end" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", width: "100%", borderRadius: "18px 18px 0 0", padding: "10px 12px calc(16px + env(safe-area-inset-bottom))" }}>
            <div style={{ width: 36, height: 4, borderRadius: 4, background: k.line, margin: "4px auto 14px" }} />
            {extra.map(([tid, lab, I]) => (
              <button key={tid} type="button" onClick={() => pick(tid)} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "14px 12px", border: "none", background: tab === tid ? k.cream2 : "none", borderRadius: 12, fontFamily: bdy, fontSize: 16, fontWeight: 600, color: k.ink, cursor: "pointer" }}>
                <I size={18} color={accent} /> {lab}{tid === "msgs" && msgCount > 0 ? ` (${msgCount})` : ""}
              </button>
            ))}
          </div>
        </div>
      )}
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 80, background: "#fff",
        borderTop: `1px solid ${k.line}`, padding: "4px 4px calc(6px + env(safe-area-inset-bottom))",
        display: "flex", justifyContent: "space-around", alignItems: "stretch",
      }}>
        {(primary.length ? primary : tabs).map(([tid, lab, I]) => {
          const on = tab === tid;
          return (
            <button key={tid} type="button" onClick={() => pick(tid)} style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 4, padding: "8px 4px 6px", minHeight: 56, border: "none", background: "none", cursor: "pointer", flex: 1,
              fontSize: 10.5, fontWeight: on ? 700 : 500, color: on ? accent : k.mid, fontFamily: bdy,
            }}>
              <I size={20} />{short(lab)}
            </button>
          );
        })}
        {extra.length > 0 && (
          <button type="button" onClick={() => setMoreOpen(true)} style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
            padding: "8px 4px 6px", minHeight: 56, border: "none", background: "none", cursor: "pointer", flex: 1,
            fontSize: 10.5, fontWeight: extraOn ? 700 : 500, color: extraOn ? accent : k.mid, fontFamily: bdy,
          }}>
            <MoreHorizontal size={20} /> More
          </button>
        )}
      </nav>
    </>
  );
}

export function Employer({ store, back, initialDriveId }) {
  const nav = useNavigate();
  const { drives, setDrives, left, beat, orgs, setOrgs, activeOrgId, staffRole, signOut } = store;
  const phone = useNarrow();
  const desk = staffRole === "frontdesk";
  const tabs = desk ? DESK_TABS : staffTabs(orgs.find((o) => o.id === activeOrgId) || orgs[0]);
  const [id, setId] = useState(initialDriveId || null);
  const [tab, setTab] = useState(desk ? "live" : "today");
  const [findQ, setFindQ] = useState("");
  useEffect(() => { if (initialDriveId) setId(initialDriveId); }, [initialDriveId]);
  function openDrive(did) {
    setId(did);
    setTab(desk ? "live" : "today");
    nav(`/app/hiring/${did}`);
  }
  function closeDrive() {
    setId(null);
    nav("/app/hiring");
  }
  useEffect(() => {
    const ids = tabs.map(([tid]) => tid);
    if (ids.length && !ids.includes(tab)) setTab(ids[0]);
  }, [desk, activeOrgId, tab]);
  const drive = drives.find((d) => d.id === id && (!activeOrgId || d.orgId === activeOrgId));
  const upd = useCallback((did, fn) => setDrives((p) => p.map((d) => (d.id === did ? fn(d) : d))), [setDrives]);
  const say = useCallback((did, ch, to, name, text) => upd(did, (d) => ({ ...d, msgs: [{ id: Math.random(), at: Date.now(), ch, to, name, text }, ...d.msgs] })), [upd]);

  // Call a recruiter for the round they are already on. Pass is what leaves the round.
  function callTo(cid, roomId) {
    if (!drive) return;
    const cand = drive.candidates.find((x) => x.id === cid);
    const room = (drive.rooms || []).find((r) => r.id === roomId);
    if (!cand || !room) return;
    const taken = occupantOf(drive, roomId);
    if (taken && taken.id !== cid) return;
    const idx = waitingRoundIdx(drive.rounds, cand);
    upd(drive.id, (d) => ({ ...d, candidates: d.candidates.map((x) => (x.id === cid ? {
      ...x,
      state: "calling",
      calledAt: Date.now(),
      room,
      roundAssigned: true,
      roundIdx: idx,
    } : x)) }));
  }

  // Send someone to the back of the line without losing them (they stepped out, missed the call)
  function skip(cid) {
    if (!drive) return;
    upd(drive.id, (d) => ({ ...d, candidates: d.candidates.map((x) => (x.id === cid ? { ...x, state: "wait", at: Date.now(), calledAt: null, room: null, skipped: (x.skipped || 0) + 1 } : x)) }));
  }

  // Bring a skipped/absent candidate back to the front
  function recall(cid) {
    if (!drive) return;
    const wait = drive.candidates.filter((x) => x.state === "wait");
    const earliest = wait.length ? Math.min(...wait.map((x) => x.at)) : Date.now();
    upd(drive.id, (d) => ({ ...d, candidates: d.candidates.map((x) => (x.id === cid ? { ...x, state: "wait", at: earliest - 1000 } : x)) }));
  }

  function move(cid, state) {
    if (!drive) return;
    upd(drive.id, (d) => ({ ...d, candidates: d.candidates.map((x) => {
      if (x.id !== cid) return x;
      const next = { ...x, state };
      if (state === "calling" && !x.calledAt) next.calledAt = Date.now();
      if (state === "calling" || state === "interviewing") {
        next.roundAssigned = true;
        if (!inARound(x)) next.roundIdx = waitingRoundIdx(drive.rounds, x);
        if (x.room) {
          const ri = roundIndexOfRoom(drive.rounds, x.room);
          if (ri >= 0) next.roundIdx = ri;
        }
      }
      if (state === "wait" || state === "absent") { next.room = null; next.calledAt = state === "wait" ? null : x.calledAt; }
      return next;
    }) }));
  }

  function decide(cid, outcome) {
    if (!drive) return;
    upd(drive.id, (d) => {
      const c = d.candidates.find((x) => x.id === cid);
      if (!c) return d;
      const rid = (d.rounds || [])[c.roundIdx || 0]?.id;
      const last = (c.roundIdx || 0) >= (d.rounds || []).length - 1;
      return {
        ...d,
        candidates: d.candidates.map((x) => {
          if (x.id !== cid) return x;
          const roundOutcomes = { ...(x.roundOutcomes || {}), [rid]: outcome };
          if (outcome === "rejected") return { ...x, state: "rejected", decidedAt: Date.now(), roundOutcomes, room: null };
          if (outcome === "onhold") return { ...x, state: "onhold", decidedAt: Date.now(), roundOutcomes, room: null };
          if (last) return { ...x, state: "selected", decidedAt: Date.now(), roundOutcomes, room: null };
          const nextIdx = (x.roundIdx || 0) + 1;
          const peers = d.candidates.filter((p) => p.id !== cid && p.state === "wait" && (p.roundIdx || 0) === nextIdx);
          const at = peers.length ? Math.min(...peers.map((p) => p.at)) - 1 : Date.now();
          return { ...x, roundIdx: nextIdx, state: "wait", calledAt: null, at, pinged: false, roundOutcomes, decidedAt: Date.now(), room: null, roundAssigned: true };
        }),
      };
    });
  }

  function advance(cid) { decide(cid, "selected"); }

  function saveNote(cid, roundId, text) {
    if (!drive) return;
    upd(drive.id, (d) => ({ ...d, candidates: d.candidates.map((x) => (x.id === cid ? { ...x, notes: { ...x.notes, [roundId]: text } } : x)) }));
  }

  function setRounds(rounds) {
    if (!drive) return;
    upd(drive.id, (d) => ({ ...d, rounds }));
  }

  function setRooms(rooms) {
    if (!drive) return;
    upd(drive.id, (d) => ({
      ...d,
      rooms,
      candidates: d.candidates.map((c) => {
        if (!c.room) return c;
        const next = rooms.find((r) => r.id === c.room.id);
        return next ? { ...c, room: next } : c;
      }),
    }));
  }

  function setBrand(brand) {
    if (!drive || !org) return;
    setDrives((p) => p.map((d) => (d.orgId === org.id ? { ...d, brand: { ...(d.brand || {}), ...brand } } : d)));
    setOrgs((p) => p.map((o) => (o.id === org.id ? { ...o, short: brand.name || o.short, color: brand.color || o.color, logo: brand.logo || o.logo, wash: o.wash } : o)));
  }

  useEffect(() => {
    if (!drive) return;
    const o = orgs.find((x) => x.id === drive.orgId);
    if (!o || planLimits(o).notify === false || planLimits(o).wa <= 0) return;
    const wait = drive.candidates.filter((x) => x.state === "wait").sort((a, b) => ((a.roundIdx || 0) - (b.roundIdx || 0)) || (a.at - b.at));
    const t = tat(drive);
    wait.forEach((c) => {
      const peers = wait.filter((x) => (x.roundIdx || 0) === (c.roundIdx || 0));
      const etaMin = Math.max(0, peers.findIndex((x) => x.id === c.id)) * t;
      if (inNudgeWindow(etaMin) && !c.pinged) {
        upd(drive.id, (d) => ({ ...d, candidates: d.candidates.map((x) => x.id === c.id ? { ...x, pinged: true } : x) }));
        say(drive.id, "WhatsApp", c.whatsapp || c.phone, c.name, nudgeText(c));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beat, drive?.candidates.length]);

  const org = orgs.find((o) => o.id === activeOrgId);
  if (!org) return null;

  const mine = drives.filter((d) => d.orgId === org.id);
  const face = { name: hallName(drive, org), color: orgColor(org, drive), logo: hallLogo(drive, org) };

  if (!drive) return <Lobby drives={mine} org={org} desk={desk} setOrgs={setOrgs} setDrives={setDrives} onSignOut={() => { setId(null); signOut(); }}
    open={openDrive}
    create={desk ? null : (f) => {
      if (driveSlotsLeft(org, drives) <= 0) return;
      const nid = `d_${Date.now()}`;
      const client = (org.clients || []).find((c) => c.id === f.clientId);
      const br = (org.branches || []).find((b) => b.id === f.branchId);
      const agency = isAgencyOrg(org) && planLimits(org).clients;
      const clientName = agency ? (client?.name || f.clientName || "") : "";
      const lim = planLimits(org);
      setDrives((p) => [...p, {
        id: nid, orgId: org.id, host: newHost(), gate: newGate(), desk: code(6), visibility: f.visibility || "public",
        company: org.name, role: f.role, venue: f.venue, city: f.city, date: f.date, endDate: f.endDate, status: f.status,
        jd: f.jd, expNeeded: f.expNeeded, docs: f.docs,
        clientId: f.clientId || "", clientName, branchId: f.branchId || "", branch: br?.name || f.branch || "",
        candidates: [], msgs: [], seq: 0, rounds: DEFAULT_ROUNDS.map((r) => ({ ...r })),
        brand: { name: org.short || org.name, color: org.color || BRAND_COLORS[0].hex, logo: org.logo || "letter" },
        rooms: lim.rooms === false ? [{ ...DEFAULT_ROOMS[0] }] : DEFAULT_ROOMS.map((r) => ({ ...r })),
        // The rounds and rooms above are only placeholders until the host walks the
        // setup steps, which is where the real panel and room assignments come from.
        setupDone: false,
      }]);
      setId(nid); setTab("today"); nav(`/app/hiring/${nid}`);
    }}
    back={back} />;

  // Front desk staff run an already-configured hall, so only a host sees the setup steps.
  if (!desk && drive.setupDone === false) {
    return (
      <div style={{ minHeight: "100vh", background: k.cream2, fontFamily: bdy, color: k.ink }}>
        <TopBar back={closeDrive} title={hallName(drive, org)} accent={face.color} />
        <div className="pagepad" style={{ padding: 26 }}>
          <DriveSetup
            drive={drive}
            maxRooms={planLimits(org).rooms === false ? 1 : planLimits(org).tvsPerSite * 4}
            onCancel={closeDrive}
            onDone={({ rounds, rooms }) => upd(drive.id, (d) => ({ ...d, rounds, rooms, setupDone: true }))}
          />
        </div>
      </div>
    );
  }

  const wait = drive.candidates.filter((x) => x.state === "wait").sort((a, b) => ((a.roundIdx || 0) - (b.roundIdx || 0)) || (a.at - b.at));
  const callingNow = drive.candidates.filter((x) => x.state === "calling");
  const interviewing = drive.candidates.filter((x) => x.state === "interviewing");
  const active = [...callingNow, ...interviewing];
  const t = tat(drive);
  const eta = (c) => {
    const peers = wait.filter((x) => (x.roundIdx || 0) === (c.roundIdx || 0));
    const i = peers.findIndex((x) => x.id === c.id);
    return i < 0 ? 0 : i * t;
  };
  const s = {
    all: drive.candidates.length, wait: wait.length, active: active.length,
    seen: drive.candidates.filter((x) => ["interviewing", "selected", "rejected", "onhold"].includes(x.state) || x.decidedAt).length,
    selected: drive.candidates.filter((x) => x.state === "selected").length,
    rejected: drive.candidates.filter((x) => x.state === "rejected").length,
    onhold: drive.candidates.filter((x) => x.state === "onhold").length,
    absent: drive.candidates.filter((x) => x.state === "absent").length,
  };

  const panel = (
    <>
      {tab === "today" && !desk && <Today s={s} wait={wait} active={active} setTab={setTab} drive={drive} lim={planLimits(org)} callTo={callTo} onFind={(c) => { setFindQ(c.token); setTab("queue"); }} />}
      {tab === "live" && <LiveQueue drive={drive} wait={wait} active={active} s={s} eta={eta} callTo={callTo} skip={skip} recall={recall} move={move} decide={decide} deskMode={desk} issuePass={() => upd(drive.id, (d) => ({ ...d, gatePass: { code: newPass(), exp: Date.now() + PASS_TTL, used: false } }))} />}
      {tab === "screen" && <Screen driveId={drive.id} gate={drive.gate} desk={drive.desk || drive.code} left={left} active={callingNow} wait={wait} eta={eta} rounds={drive.rounds} brand={face} clientName={clientOf(drive)} branch={siteOf(drive)} role={drive.role} credit={planLimits(org).credit} />}
      {tab === "queue" && !desk && <Queue rows={drive.candidates} eta={eta} move={move} decide={decide} rounds={drive.rounds} rooms={drive.rooms || []} saveNote={saveNote} callTo={callTo} initialQ={findQ} />}
      {tab === "rounds" && !desk && <RoundsTab rounds={drive.rounds} setRounds={setRounds} />}
      {tab === "rooms" && !desk && <RoomsTab rooms={drive.rooms || []} setRooms={setRooms} org={org} setOrgs={setOrgs} drive={drive} />}
      {tab === "branding" && !desk && <BrandingTab brand={drive.brand || { name: org.short || org.name, color: org.color, logo: org.logo }} setBrand={setBrand} drive={drive} org={org} />}
      {tab === "msgs" && !desk && <Msgs msgs={drive.msgs} />}
      {tab === "result" && !desk && <Result s={s} drive={drive} />}
    </>
  );

  if (!phone) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", background: k.cream2, fontFamily: bdy, color: k.ink }} className="shell">
        <aside className="shell-side" style={{ width: 232, flexShrink: 0, background: "#fff", borderRight: `1px solid ${k.line}`, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "16px 14px 10px", display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={closeDrive} style={{ ...iconBtn, display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600 }}><ArrowLeft size={15} /> {isAgencyOrg(org) ? "HQ" : "Campus"}</button>
          </div>
          <div style={{ padding: "4px 14px 12px", display: "flex", alignItems: "center", gap: 10 }}>
            <OrgLogo name={face.name} color={face.color} logo={face.logo} size={36} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: dsp, fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>{hallChrome(drive, org)}</div>
              <div style={{ fontSize: 12, color: k.mid, marginTop: 2 }}>{drive.role}</div>
            </div>
          </div>
          <AppTabs tabs={tabs} tab={tab} setTab={setTab} accent={face.color} msgCount={drive.msgs.length} layout="side" />
        </aside>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px 22px", background: "#fff", borderBottom: `1px solid ${k.line}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <StatusPill status={drive.status} />
              {desk && <Pill tone="grey">FRONT DESK</Pill>}
              {!desk && <button onClick={() => upd(drive.id, (d) => ({ ...d, visibility: d.visibility === "private" ? "public" : "private" }))} style={{ ...ghostSm, padding: "4px 10px", fontSize: 11 }}>{drive.visibility === "private" ? "Private" : "Public"}</button>}
              <span style={{ fontSize: 13, color: k.mid }}>{listingPlace(drive)} · {fmtDate(drive.date)}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <TokenFind
                candidates={drive.candidates}
                compact
                onPick={(c) => { setFindQ(c.token); setTab("queue"); }}
              />
              <span style={{ fontSize: 12.5, color: k.mid, fontFamily: typ, whiteSpace: "nowrap" }}>
                <b style={{ color: k.ink }}>{s.all}</b> in · <b style={{ color: k.coral }}>{t}m</b>
              </span>
            </div>
          </div>
          {drive.status === "upcoming" && (
            <div style={{ background: k.goldDim, padding: "10px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12.5, color: k.gold }}>Listed for candidates but not accepting check-ins yet.</span>
              <button onClick={() => upd(drive.id, (d) => ({ ...d, status: "live" }))} style={solidSm}>Open for check-in now</button>
            </div>
          )}
          <div className="pagepad" style={{ flex: 1, overflow: "auto", padding: 26, maxWidth: 1120 }}>{panel}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: k.cream2, fontFamily: bdy, color: k.ink }}>
      <div style={{ position: "sticky", top: 0, zIndex: 40, background: face.color, color: "#fff", padding: "10px 14px calc(12px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={closeDrive} style={{ background: "none", border: "none", color: "#fff", padding: 4, cursor: "pointer" }}><ArrowLeft size={20} /></button>
          <OrgLogo name={face.name} color={face.color} logo={face.logo} size={28} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: dsp, fontWeight: 800, fontSize: 16, lineHeight: 1.15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{hallChrome(drive, org)}</div>
            <div style={{ fontSize: 12, opacity: .85, marginTop: 2 }}>{drive.role} · {s.all} in</div>
          </div>
          {desk && <Pill tone="grey">DESK</Pill>}
        </div>
        <div style={{ marginTop: 10 }}>
          <TokenFind candidates={drive.candidates} compact onPick={(c) => { setFindQ(c.token); setTab("queue"); }} />
        </div>
      </div>
      {drive.status === "upcoming" && (
        <div style={{ background: k.goldDim, padding: "10px 14px" }}>
          <span style={{ fontSize: 12.5, color: k.gold }}>Not accepting check-ins yet. </span>
          <button onClick={() => upd(drive.id, (d) => ({ ...d, status: "live" }))} style={{ ...solidSm, marginTop: 8 }}>Open now</button>
        </div>
      )}
      <div style={{ padding: "16px 14px 96px" }}>{panel}</div>
      <AppTabs tabs={tabs} tab={tab} setTab={setTab} accent={face.color} msgCount={drive.msgs.length} layout="bottom" />
    </div>
  );
}

export function OrgAuth({ orgs, setOrgs, onSignedIn, back }) {
  const [mode, setMode] = useState("signin"); // signin | create
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [kind, setKind] = useState("captive");
  const [err, setErr] = useState("");

  function signIn(e) {
    e.preventDefault();
    setErr("");
    const em = email.trim().toLowerCase();
    const org = orgs.find((o) => o.email.toLowerCase() === em || o.members.some((m) => memberEmail(m).toLowerCase() === em));
    if (!org) { setErr("No company account found with that email."); return; }
    if (org.password !== password) { setErr("Incorrect password."); return; }
    const mem = org.members.find((m) => memberEmail(m).toLowerCase() === em);
    onSignedIn(org.id, mem ? memberRole(mem) : "recruiter");
  }

  function createOrg(e) {
    e.preventDefault();
    setErr("");
    if (!companyName.trim() || !email.trim() || !password.trim()) { setErr("Fill in all fields."); return; }
    if (orgs.some((o) => o.email.toLowerCase() === email.trim().toLowerCase())) { setErr("An account with that email already exists — sign in instead."); return; }
    const id = `org_${Date.now()}`;
    const agency = kind === "agency";
    const name = companyName.trim();
    setOrgs((p) => [...p, {
      id, name, short: name.split(" ")[0], kind, color: agency ? "#0F8A6B" : "#341C8A",
      logo: agency ? "bars" : "ring", wash: agency ? "#E6F5F0" : "#EEE8F8",
      email: email.trim(), password, plan: "trial", billingCycle: "month",
      members: [{ email: email.trim(), role: "recruiter" }],
      clients: agency ? [] : [{ id: "cl_own", name: "Own hiring" }],
      branches: [],
    }]);
    onSignedIn(id, "recruiter");
  }

  return (
    <div style={{ minHeight: "100vh", background: k.cream2, fontFamily: bdy, color: k.ink, display: "flex", alignItems: "center", justifyContent: "center", padding: 26 }}>
      <div style={{ maxWidth: 420, width: "100%" }}>
        <button onClick={back} style={{ ...iconBtn, display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, marginBottom: 22 }}><ArrowLeft size={14} /> Back to site</button>
        <div style={{ marginBottom: 8 }}><Wordmark size={20} /></div>
        <p style={{ color: k.mid, fontSize: 14, margin: "0 0 24px" }}>Marketing is TokenHire. After sign-in you land in your company or agency space — only that org’s drives.</p>

        <div style={{ display: "flex", gap: 4, background: k.cream2, borderRadius: R.pill, padding: 4, marginBottom: 20 }}>
          <button onClick={() => { setMode("signin"); setErr(""); }} style={{ flex: 1, padding: "9px 0", borderRadius: R.pill, border: "none", cursor: "pointer", fontFamily: bdy, fontSize: 13.5, fontWeight: 600, background: mode === "signin" ? "#fff" : "transparent", color: mode === "signin" ? k.ink : k.mid }}>Sign in</button>
          <button onClick={() => { setMode("create"); setErr(""); }} style={{ flex: 1, padding: "9px 0", borderRadius: R.pill, border: "none", cursor: "pointer", fontFamily: bdy, fontSize: 13.5, fontWeight: 600, background: mode === "create" ? "#fff" : "transparent", color: mode === "create" ? k.ink : k.mid }}>New company</button>
        </div>

        {mode === "signin" ? (
          <form onSubmit={signIn} style={{ ...box, padding: 24, display: "flex", flexDirection: "column", gap: 13 }}>
            <Field label="Work email"><input value={email} onChange={(e) => setEmail(e.target.value)} style={input} placeholder="hr@yourcompany.com" /></Field>
            <Field label="Password"><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={input} /></Field>
            {err && <div style={{ fontSize: 12.5, color: k.red }}>{err}</div>}
            <button type="submit" style={{ ...solid, justifyContent: "center", padding: 12, marginTop: 4 }}>Sign in</button>
            <div style={{ fontSize: 11.5, color: k.faint, lineHeight: 1.7, marginTop: 4 }}>
              Password for every demo: <b style={{ fontFamily: typ }}>demo1234</b><br />
              {HIDE_PRICING
                ? <>Recruiter: <b style={{ fontFamily: typ }}>demo@vistaar.com</b>. Front desk: <b style={{ fontFamily: typ }}>desk@vistaar.com</b>.</>
                : <>Plans — <b style={{ fontFamily: typ }}>trial@tokenhire.demo</b> (Free) · <b style={{ fontFamily: typ }}>single@tokenhire.demo</b> (Basic) · <b style={{ fontFamily: typ }}>monthly@tokenhire.demo</b> (Pro) · <b style={{ fontFamily: typ }}>pack10@tokenhire.demo</b> (Platinum) · <b style={{ fontFamily: typ }}>enterprise@tokenhire.demo</b><br />
              Agency floor: <b style={{ fontFamily: typ }}>demo@vistaar.com</b> / <b style={{ fontFamily: typ }}>hr@quesscorp.com</b>. Campus: <b style={{ fontFamily: typ }}>hr@wipro.com</b>. Front desk: <b style={{ fontFamily: typ }}>desk@vistaar.com</b>.</>}
            </div>
          </form>
        ) : (
          <form onSubmit={createOrg} style={{ ...box, padding: 24, display: "flex", flexDirection: "column", gap: 13 }}>
            <Field label="Company or agency name"><input value={companyName} onChange={(e) => setCompanyName(e.target.value)} style={input} placeholder="Vistaar Services, or Quess Corp" /></Field>
            <div>
              <div style={{ fontSize: 12, color: k.mid, fontWeight: 600, marginBottom: 8 }}>How you hire</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={() => setKind("captive")} style={{ flex: 1, textAlign: "left", padding: 12, borderRadius: 10, cursor: "pointer", fontFamily: bdy, border: `1px solid ${kind === "captive" ? k.coral : k.line}`, background: kind === "captive" ? k.coralDim : "#fff" }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>Enterprise / captive</div>
                  <div style={{ fontSize: 11.5, color: k.mid, marginTop: 3 }}>Wipro or Genpact — hire for yourselves. No client layer.</div>
                </button>
                <button type="button" onClick={() => setKind("agency")} style={{ flex: 1, textAlign: "left", padding: 12, borderRadius: 10, cursor: "pointer", fontFamily: bdy, border: `1px solid ${kind === "agency" ? k.coral : k.line}`, background: kind === "agency" ? k.coralDim : "#fff" }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>Staffing agency</div>
                  <div style={{ fontSize: 11.5, color: k.mid, marginTop: 3 }}>Quess or Vistaar — walk-ins for clients, branded as you.</div>
                </button>
              </div>
            </div>
            <Field label="Work email"><input value={email} onChange={(e) => setEmail(e.target.value)} style={input} placeholder="hr@yourcompany.com" /></Field>
            <Field label="Password"><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={input} /></Field>
            {err && <div style={{ fontSize: 12.5, color: k.red }}>{err}</div>}
            <button type="submit" style={{ ...solid, justifyContent: "center", padding: 12, marginTop: 4 }}>Create company account</button>
            <div style={{ fontSize: 11.5, color: k.faint, lineHeight: 1.5, marginTop: 4 }}>This becomes your company's account — invite teammates from Team settings once you're in.</div>
          </form>
        )}
      </div>
    </div>
  );
}

export function Lobby({ drives, org, onSignOut, open, create, back, desk, setOrgs, setDrives }) {
  const nav = useNavigate();
  const agency = isAgencyOrg(org);
  const clients = org.clients || [];
  const branches = org.branches || [];
  const accent = org.color || k.coral;
  const [making, setMaking] = useState(false);
  const [filterClient, setFilterClient] = useState("all");
  const [filterCity, setFilterCity] = useState("all");
  const [f, setF] = useState({
    company: org.name, role: "", venue: branches[0]?.name || "", city: branches[0]?.city || (CITIES.includes("Hyderabad") ? "Hyderabad" : CITIES[0]),
    date: todayStr(), status: "live", visibility: "public", jd: "", expNeeded: [], docs: DOC_OPTIONS.slice(0, 4),
    clientId: agency ? (clients[0]?.id || "") : "", branchId: branches[0]?.id || "",
  });
  const [host, setHost] = useState("");
  const [hostErr, setHostErr] = useState("");
  function openByHost() {
    setHostErr("");
    const v = host.trim().toUpperCase();
    if (!v) return;
    if (v.startsWith("GATE") || v.startsWith("DESK")) { setHostErr("That's a candidate code. Staff use HOST-XXXXXX."); return; }
    const hit = drives.find((d) => d.host.toUpperCase() === v || d.host.toUpperCase() === `HOST-${v}` || (v.startsWith("HOST") && bare6(d.host) === bare6(v)));
    if (!hit) { setHostErr("No walk-in in this space has that HOST code."); return; }
    open(hit.id);
  }
  const cities = Array.from(new Set([...(org.branches || []).map((b) => b.city), ...drives.map((d) => d.city)])).filter(Boolean);
  const spec = planOf(org);
  const lim = spec.limits;
  const multiDay = spec.multiDay;
  const slots = driveSlotsLeft(org, drives);
  const canClients = agency && lim.clients;
  const lockedCity = lim.cities === 1 ? (orgCities(org)[0] || null) : null;
  const shown = drives.filter((d) => (filterClient === "all" || d.clientId === filterClient) && (filterCity === "all" || d.city === filterCity));
  const grouped = cities.filter((c) => shown.some((d) => d.city === c));
  function pickBranch(branchId) {
    const br = branches.find((b) => b.id === branchId);
    setF({ ...f, branchId, city: br?.city || f.city, venue: br?.name || f.venue, branch: br?.name || "" });
  }
  return (
    <div style={{ minHeight: "100vh", background: k.cream2, fontFamily: bdy, color: k.ink }}>
      <div style={{ background: "#fff", borderBottom: `1px solid ${k.line}`, padding: "16px 26px" }}>
        <div style={{ maxWidth: 920, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <button onClick={back} style={{ ...iconBtn, display: "flex", gap: 6, alignItems: "center", fontSize: 13, fontWeight: 600 }}><ArrowLeft size={15} /> Back</button>
            <OrgLogo name={org.short || org.name} color={accent} logo={org.logo} size={36} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: dsp, fontWeight: 700, fontSize: 17, letterSpacing: -0.3, lineHeight: 1.15 }}>{org.name}</div>
              <div style={{ fontSize: 12.5, color: k.mid, marginTop: 2 }}>{agency ? "Clients and sites" : "Walk-ins"}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {!desk && (
              <>
                <button onClick={() => nav("/org/sites")} style={ghostSm}>{agency && planLimits(org).clients ? "Clients" : "Sites"}</button>
                <button onClick={() => nav("/org/team")} style={ghostSm}>Team</button>
                {!HIDE_PRICING && <button onClick={() => nav("/org/billing")} style={ghostSm}>Plan</button>}
              </>
            )}
            <button onClick={onSignOut} style={ghostSm}>Sign out</button>
          </div>
        </div>
      </div>
      <div className="pagepad" style={{ maxWidth: 920, margin: "0 auto", padding: "22px 26px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: canClients ? "1.1fr 1fr" : "1fr", gap: 12, marginBottom: 20 }} className={canClients ? "g2" : undefined}>
          {canClients && (
            <div style={{ ...box, padding: 16 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: k.faint, letterSpacing: .6, textTransform: "uppercase", marginBottom: 10 }}>Clients</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {clients.map((c) => {
                  const n = drives.filter((d) => d.clientId === c.id).length;
                  const on = filterClient === c.id;
                  return (
                    <button key={c.id} type="button" onClick={() => setFilterClient(on ? "all" : c.id)} style={{
                      padding: "8px 12px", borderRadius: 12, cursor: "pointer", fontFamily: bdy, textAlign: "left",
                      border: `1px solid ${on ? accent : k.line}`, background: on ? `${accent}18` : "#fff",
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: on ? accent : k.ink }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: k.mid, marginTop: 2 }}>{n} {n === 1 ? "drive" : "drives"}</div>
                    </button>
                  );
                })}
                {!clients.length && <div style={{ fontSize: 13, color: k.mid }}>Add clients to tag drives.</div>}
              </div>
            </div>
          )}
          <div style={{ ...box, padding: 16 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: k.faint, letterSpacing: .6, textTransform: "uppercase", marginBottom: 10 }}>{canClients ? "Branches / cities" : "Sites"}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {(branches.length ? branches : cities.map((c) => ({ id: c, name: c, city: c }))).map((b) => {
                const on = filterCity === b.city;
                return (
                  <button key={b.id} type="button" onClick={() => setFilterCity(on ? "all" : b.city)} style={{
                    padding: "8px 12px", borderRadius: 12, cursor: "pointer", fontFamily: bdy,
                    border: `1px solid ${on ? k.ink : k.line}`, background: on ? k.ink : "#fff", color: on ? "#fff" : k.ink,
                    fontSize: 13, fontWeight: 600,
                  }}>{b.city}{b.name && b.name !== b.city ? ` · ${b.name}` : ""}</button>
                );
              })}
            </div>
          </div>
        </div>

        {!making ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, gap: 12, flexWrap: "wrap" }}>
            <div>
              <h1 style={{ fontFamily: dsp, fontSize: 23, fontWeight: 700, letterSpacing: -0.5, margin: 0 }}>{desk ? "Walk-ins today" : "Walk-ins"}</h1>
              {!desk && !HIDE_PRICING && lim.drives < 999 && slots > 0 && <div style={{ fontSize: 12.5, color: k.mid, marginTop: 4 }}>{slots} left{multiDay ? " this month" : ""}</div>}
            </div>
              {!desk && create && slots > 0 && <button onClick={() => setMaking(true)} style={{ ...solid, background: accent }}><Plus size={15} /> New walk-in</button>}
            </div>
            {!desk && create && slots <= 0 && <div style={{ ...box, padding: 14, marginBottom: 14, fontSize: 13.5, color: k.ink2, lineHeight: 1.5 }}>{driveCapCopy(org)} Contact us if you need more.</div>}
            <div style={{ display: "flex", gap: 9, marginBottom: 18 }}>
              <input value={host} onChange={(e) => { setHost(e.target.value.toUpperCase()); setHostErr(""); }} onKeyDown={(e) => e.key === "Enter" && openByHost()} placeholder="Staff code" style={{ ...input, fontFamily: typ, letterSpacing: 1.5, flex: 1 }} />
              <button onClick={openByHost} style={outline}>Open</button>
            </div>
            {hostErr && <div style={{ fontSize: 12.5, color: k.red, margin: "-8px 0 14px" }}>{hostErr}</div>}
            {!shown.length && <Blank text={drives.length ? "No drives match that filter." : (slots <= 0 ? driveCapCopy(org) : `No walk-ins yet for ${org.name}. Create your first one.`)} />}
            {(grouped.length ? grouped : [""]).map((city) => (
              <div key={city || "all"} style={{ marginBottom: 16 }}>
                {city ? <div style={{ fontSize: 11.5, fontWeight: 700, color: k.faint, letterSpacing: .6, textTransform: "uppercase", margin: "4px 0 8px" }}>{city} {branches.filter((b) => b.city === city).map((b) => b.name).join(" · ")}</div> : null}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {shown.filter((d) => !city || d.city === city).map((d) => (
                    <div key={d.id} style={{ ...box, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2, flexWrap: "wrap" }}>
                          <span style={{ fontFamily: dsp, fontWeight: 700, fontSize: 15 }}>{d.role}</span>
                          <StatusPill status={d.status} />
                          {d.visibility === "private" ? <Pill tone="grey">PRIVATE</Pill> : <Pill tone="teal">PUBLIC</Pill>}
                          {clientOf(d) ? <Pill tone="coral">{d.clientName}</Pill> : null}
                        </div>
                        <div style={{ fontSize: 12.5, color: k.mid, marginTop: 3 }}>{listingPlace(d)} · {d.endDate && d.endDate !== d.date ? `${fmtDate(d.date)} – ${fmtDate(d.endDate)}` : fmtDate(d.date)}</div>
                        <div style={{ fontFamily: typ, fontSize: 13, color: k.ink, marginTop: 6 }}>{d.candidates.filter((c) => c.state === "wait").length} waiting · {d.candidates.length} in</div>
                      </div>
                      <button onClick={() => open(d.id)} style={outline}>Open <ArrowRight size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        ) : (
          <div style={{ ...box, padding: 26, maxWidth: 540 }}>
            <h2 style={{ fontFamily: dsp, fontSize: 19, fontWeight: 700, margin: "0 0 5px" }}>New walk-in</h2>
            <p style={{ fontSize: 13, color: k.mid, margin: "0 0 20px" }}>
              {canClients ? "Client, role, place." : multiDay ? "Role, place, dates." : "Role, place, date."}
            </p>
            <form onSubmit={(e) => { e.preventDefault(); if (driveSlotsLeft(org, drives) <= 0) return; if (!f.role.trim() || !f.venue.trim() || !(lockedCity || f.city.trim())) return; create({ ...f, city: lockedCity || f.city }); setMaking(false); }} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              {canClients && (
                <Field label="Client company">
                  <Select
                    value={f.clientId || ""}
                    onChange={(clientId) => setF({ ...f, clientId })}
                    placeholder="Select client…"
                    options={[{ value: "", label: "Select client…" }, ...clients.map((c) => ({ value: c.id, label: c.name }))]}
                  />
                  <div style={{ fontSize: 11.5, color: k.faint, marginTop: 6 }}>Candidates see {org.short || org.name} for this client.</div>
                </Field>
              )}
              {!!branches.length && (
                <Field label="Branch / site">
                  <Select
                    value={f.branchId || ""}
                    onChange={pickBranch}
                    placeholder="City + venue below"
                    options={[{ value: "", label: "City + venue below" }, ...branches.map((b) => ({ value: b.id, label: `${b.city} · ${b.name}` }))]}
                  />
                </Field>
              )}
              <Field label="Role"><input value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} style={input} placeholder="Customer Support Executive" /></Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="g2">
                <Field label="City">{lockedCity ? <div style={{ ...input }}>{lockedCity}</div> : <CitySelect value={f.city} onChange={(city) => setF({ ...f, city })} />}</Field>
                <Field label={multiDay ? "Start date" : "Date"}><input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} style={input} /></Field>
              </div>
              {multiDay ? (
                <Field label="End date">
                  <input type="date" value={f.endDate || f.date} min={f.date} onChange={(e) => setF({ ...f, endDate: e.target.value })} style={input} />
                  <div style={{ fontSize: 11.5, color: k.faint, marginTop: 6 }}>Same queue carries over each morning.</div>
                </Field>
              ) : null}
              <Field label="Venue"><input value={f.venue} onChange={(e) => setF({ ...f, venue: e.target.value })} style={input} placeholder="Gachibowli campus, Gate 1" /></Field>

              <Field label="Job description">
                <textarea value={f.jd} onChange={(e) => setF({ ...f, jd: e.target.value })} rows={4} placeholder="What they'll do, shift, language, anything a candidate should know before they show up." style={{ ...input, resize: "vertical", fontFamily: bdy, lineHeight: 1.55 }} />
              </Field>

              <div>
                <div style={{ fontSize: 12, color: k.mid, fontWeight: 600, marginBottom: 8 }}>Experience needed</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {EXP_BANDS.map((b) => {
                    const on = f.expNeeded.includes(b);
                    return (
                      <button type="button" key={b} onClick={() => setF({ ...f, expNeeded: on ? f.expNeeded.filter((x) => x !== b) : [...f.expNeeded, b] })} style={{
                        padding: "7px 12px", borderRadius: R.pill, cursor: "pointer", fontFamily: bdy, fontSize: 12.5, fontWeight: 600,
                        border: `1px solid ${on ? k.coral : k.line}`, background: on ? k.coralDim : "#fff", color: on ? k.coral : k.ink2,
                      }}>{b}</button>
                    );
                  })}
                </div>
                <div style={{ fontSize: 11.5, color: k.faint, marginTop: 6 }}>Leave empty for any experience.</div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: k.mid, fontWeight: 600, marginBottom: 8 }}>Required documents</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {DOC_OPTIONS.map((doc) => {
                    const on = f.docs.includes(doc);
                    return (
                      <label key={doc} style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 13, color: k.ink2, cursor: "pointer" }}>
                        <input type="checkbox" checked={on} onChange={() => setF({ ...f, docs: on ? f.docs.filter((x) => x !== doc) : [...f.docs, doc] })} style={{ marginTop: 2 }} />
                        {doc}
                      </label>
                    );
                  })}
                </div>
                <div style={{ fontSize: 11.5, color: k.faint, marginTop: 6 }}>Shown on the public listing.</div>
              </div>

              <div style={{ fontSize: 12, color: k.mid, fontWeight: 600, marginTop: 4 }}>Check-in</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={() => setF({ ...f, status: "live" })} style={{
                  flex: 1, textAlign: "left", padding: 12, borderRadius: 10, cursor: "pointer", fontFamily: bdy,
                  border: `1px solid ${f.status === "live" ? k.ink : k.line}`, background: f.status === "live" ? k.ink : "#fff", color: f.status === "live" ? "#fff" : k.ink,
                }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>Open now</div>
                  <div style={{ fontSize: 11.5, opacity: .7, marginTop: 2 }}>Scan the screen and join</div>
                </button>
                <button type="button" onClick={() => setF({ ...f, status: "upcoming" })} style={{
                  flex: 1, textAlign: "left", padding: 12, borderRadius: 10, cursor: "pointer", fontFamily: bdy,
                  border: `1px solid ${f.status === "upcoming" ? k.ink : k.line}`, background: f.status === "upcoming" ? k.ink : "#fff", color: f.status === "upcoming" ? "#fff" : k.ink,
                }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>List first</div>
                  <div style={{ fontSize: 11.5, opacity: .7, marginTop: 2 }}>Open the door when you arrive</div>
                </button>
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, borderRadius: 10, border: `1px solid ${k.line}`, background: "#fff", cursor: "pointer" }}>
                <input type="checkbox" checked={f.visibility === "public"} onChange={(e) => setF({ ...f, visibility: e.target.checked ? "public" : "private" })} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>{f.visibility === "public" ? <Globe size={14} /> : <Lock size={14} />} {f.visibility === "public" ? "Listed on Upcoming walk-ins" : "Unlisted"}</div>
                </div>
              </label>

              <div style={{ display: "flex", gap: 9, marginTop: 6 }}>
                <button type="button" onClick={() => setMaking(false)} style={outline}>Cancel</button>
                <button type="submit" style={{ ...solid, flex: 1, justifyContent: "center", padding: 11 }}>Create drive</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export function ClientsPanel({ org, setOrgs, onClose, embedded }) {
  const [name, setName] = useState("");
  const [branch, setBranch] = useState("");
  const [city, setCity] = useState((org.branches || [])[0]?.city || (CITIES.includes("Hyderabad") ? "Hyderabad" : CITIES[0]));
  const [err, setErr] = useState("");
  const clients = org.clients || [];
  const branches = org.branches || [];
  const lim = planLimits(org);
  const canClients = isAgencyOrg(org) && lim.clients;
  const lockedCity = lim.cities === 1 ? (orgCities(org)[0] || city) : null;
  function patch(next) {
    setOrgs((p) => p.map((o) => (o.id === org.id ? { ...o, ...next } : o)));
  }
  function addClient() {
    if (!canClients) return;
    const v = name.trim();
    if (!v || clients.some((c) => c.name.toLowerCase() === v.toLowerCase())) return;
    patch({ clients: [...clients, { id: `cl_${Date.now()}`, name: v }] });
    setName("");
  }
  function addBranch() {
    setErr("");
    const v = branch.trim();
    if (!v) return;
    if (branches.length >= lim.sites) { setErr(`This plan includes ${lim.sites} site${lim.sites === 1 ? "" : "s"}.`); return; }
    const nextCity = lockedCity || city;
    const nextCities = new Set([...orgCities(org), nextCity]);
    if (nextCities.size > lim.cities) { setErr(`This plan includes ${lim.cities} ${lim.cities === 1 ? "city" : "cities"}.`); return; }
    patch({ branches: [...branches, { id: `br_${Date.now()}`, name: v, city: nextCity }] });
    setBranch("");
  }
  const card = (
      <div style={{ background: embedded ? "transparent" : "#fff", borderRadius: embedded ? 0 : 18, padding: embedded ? 0 : 28, maxWidth: 560, width: "100%", maxHeight: embedded ? "none" : "90vh", overflow: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div>
            <div style={{ fontFamily: dsp, fontSize: 19, fontWeight: 700 }}>{org.name} — {canClients ? "Clients & sites" : "Sites"}</div>
            <div style={{ fontSize: 12.5, color: k.mid, marginTop: 3, lineHeight: 1.5 }}>
              {canClients
                ? "Clients are companies you staff (HDFC, Amazon) or your own bench. Sites are branches. Other agencies never see this list."
                : "Sites are campuses or branches for this company. Other orgs never see this list."}
            </div>
          </div>
          {!embedded && <button onClick={onClose} style={{ ...ghostSm, padding: "6px 12px" }}>Close</button>}
        </div>
        {canClients && (
          <>
            <div style={{ fontSize: 12, fontWeight: 700, color: k.faint, letterSpacing: .5, textTransform: "uppercase", margin: "16px 0 8px" }}>Clients</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
              {clients.map((c) => (
                <div key={c.id} style={{ padding: "9px 12px", background: k.cream2, borderRadius: 10, fontSize: 13.5, fontWeight: 600 }}>{c.name}</div>
              ))}
              {!clients.length && <div style={{ fontSize: 13, color: k.mid }}>No clients yet.</div>}
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
              <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addClient()} placeholder="e.g. HDFC sales" style={{ ...input, flex: 1 }} />
              <button onClick={addClient} style={solidSm}>Add client</button>
            </div>
          </>
        )}
        <div style={{ fontSize: 12, fontWeight: 700, color: k.faint, letterSpacing: .5, textTransform: "uppercase", margin: "16px 0 8px" }}>Sites</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
          {branches.map((b) => (
            <div key={b.id} style={{ padding: "9px 12px", background: k.cream2, borderRadius: 10, fontSize: 13.5 }}><b>{b.name}</b><span style={{ color: k.mid }}> · {b.city}</span></div>
          ))}
          {!branches.length && <div style={{ fontSize: 13, color: k.mid }}>No sites yet — city + venue on each drive still works.</div>}
        </div>
        {err && <div style={{ fontSize: 12.5, color: k.red, marginBottom: 10 }}>{err}</div>}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input value={branch} onChange={(e) => setBranch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addBranch()} placeholder="Site name — e.g. HITEC Tower B" style={{ ...input, flex: "1 1 160px" }} />
          {lockedCity ? <div style={{ ...input, width: "auto", display: "flex", alignItems: "center" }}>{lockedCity}</div> : <CitySelect value={city} onChange={setCity} />}
          <button onClick={addBranch} style={outlineSm} disabled={branches.length >= lim.sites}>Add site</button>
        </div>
      </div>
  );
  if (embedded) return card;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(11,16,32,.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()}>{card}</div>
    </div>
  );
}

export function BrandPanel({ org, setOrgs, setDrives, onClose, embedded }) {
  const [name, setName] = useState(org.short || org.name);
  const [color, setColor] = useState(org.color || k.coral);
  const [logo, setLogo] = useState(org.logo || "letter");
  function save() {
    const short = name.trim() || org.short;
    setOrgs((p) => p.map((o) => (o.id === org.id ? { ...o, short, color, logo } : o)));
    if (setDrives) setDrives((p) => p.map((d) => (d.orgId === org.id ? { ...d, brand: { ...(d.brand || {}), name: short, color, logo } } : d)));
    if (onClose) onClose();
  }
  const card = (
      <div style={{ background: embedded ? "transparent" : "#fff", borderRadius: embedded ? 0 : 18, padding: embedded ? 0 : 28, maxWidth: 460, width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ fontFamily: dsp, fontSize: 19, fontWeight: 700 }}>Location brand</div>
          {!embedded && <button onClick={onClose} style={{ ...ghostSm, padding: "6px 12px" }}>Close</button>}
        </div>
        <p style={{ fontSize: 13, color: k.mid, margin: "0 0 16px", lineHeight: 1.5 }}>
          TV, slip, and check-in.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <OrgLogo name={name} color={color} logo={logo} size={48} />
          <HallBrand name={name} color={color} logo={logo} credit={planLimits(org).credit} sub={isAgencyOrg(org) && planLimits(org).clients ? ((org.clients || [])[0]?.name || "Client") : null} />
        </div>
        <Field label="Display name"><input value={name} onChange={(e) => setName(e.target.value)} style={input} /></Field>
        <div style={{ height: 12 }} />
        <div style={{ fontSize: 12, color: k.mid, fontWeight: 600, marginBottom: 8 }}>Logo</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          {LOGO_PRESETS.map((p) => (
            <button key={p.id} type="button" onClick={() => setLogo(p.id)} style={{ padding: 6, borderRadius: 10, border: `2px solid ${logo === p.id ? color : k.line}`, background: "#fff", cursor: "pointer" }}>
              <OrgLogo name={name} color={color} logo={p.id} size={32} />
            </button>
          ))}
        </div>
        <div style={{ fontSize: 12, color: k.mid, fontWeight: 600, marginBottom: 8 }}>Primary color</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
          {BRAND_COLORS.map((c) => (
            <button key={c.hex} type="button" onClick={() => setColor(c.hex)} title={c.name} style={{
              width: 30, height: 30, borderRadius: "50%", background: c.hex, cursor: "pointer",
              border: color === c.hex ? `3px solid ${k.ink}` : "3px solid transparent",
            }} />
          ))}
        </div>
        <button onClick={save} style={{ ...solid, background: color, width: "100%", justifyContent: "center" }}>Apply to this space</button>
      </div>
  );
  if (embedded) return card;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(11,16,32,.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()}>{card}</div>
    </div>
  );
}

export function TeamPanel({ org, setOrgs, onClose, embedded }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("recruiter");
  const members = org.members || [];
  function commit(next) {
    if (setOrgs) setOrgs((p) => p.map((o) => (o.id === org.id ? { ...o, members: next } : o)));
    else org.members = next;
  }
  function invite() {
    const v = email.trim();
    if (!v || members.some((m) => memberEmail(m).toLowerCase() === v.toLowerCase())) return;
    if (members.length >= planLimits(org).seats) return;
    commit([...members, { email: v, role }]);
    setEmail("");
  }
  function setMemberRole(em, r) {
    commit(members.map((m) => (memberEmail(m) === em ? { ...(typeof m === "string" ? { email: em } : m), email: em, role: r } : m)));
  }
  const card = (
      <div style={{ background: embedded ? "transparent" : "#fff", borderRadius: embedded ? 0 : 18, padding: embedded ? 0 : 28, maxWidth: 560, width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <div>
            <div style={{ fontFamily: dsp, fontSize: 19, fontWeight: 700 }}>{org.name} — Team</div>
            <div style={{ fontSize: 12.5, color: k.mid, marginTop: 3 }}>Add recruiters, then map them to rooms on a drive. Front desk only runs the live queue and waiting screen.</div>
          </div>
          {!embedded && <button onClick={onClose} style={{ ...ghostSm, padding: "6px 12px" }}>Close</button>}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, margin: "18px 0" }}>
          {members.map((m) => (
            <div key={memberEmail(m)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: k.cream2, borderRadius: 10 }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: k.coral, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff" }}>{memberName(m)[0].toUpperCase()}</div>
              <span style={{ fontSize: 13.5, flex: 1, minWidth: 0 }}>
                <div>{memberName(m)}</div>
                <div style={{ fontSize: 11.5, color: k.faint, overflow: "hidden", textOverflow: "ellipsis" }}>{memberEmail(m)}</div>
              </span>
              <Select
                value={memberRole(m)}
                onChange={(v) => setMemberRole(memberEmail(m), v)}
                options={[{ value: "recruiter", label: "Recruiter" }, { value: "frontdesk", label: "Front desk" }]}
                style={{ width: "auto", padding: "6px 10px", fontSize: 12 }}
              />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && invite()} placeholder="colleague@yourcompany.com" style={{ ...input, flex: 1, minWidth: 160 }} />
          <Select
            value={role}
            onChange={setRole}
            options={[{ value: "recruiter", label: "Recruiter" }, { value: "frontdesk", label: "Front desk" }]}
            style={{ width: 130, padding: "11px 10px" }}
          />
          <button onClick={invite} style={solidSm} disabled={members.length >= planLimits(org).seats}>Invite</button>
        </div>
        <div style={{ fontSize: 11, color: k.faint, marginTop: 10, lineHeight: 1.5 }}>
          {members.length >= planLimits(org).seats
            ? `This plan includes ${planLimits(org).seats} team seat${planLimits(org).seats === 1 ? "" : "s"}.`
            : "Front desk never sees who is in an interview room, resumes, or round decisions. Map recruiters to rooms on the drive’s Rooms tab."}
        </div>
      </div>
  );
  if (embedded) return card;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(11,16,32,.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()}>{card}</div>
    </div>
  );
}


export function OutcomeBtns({ cand, rounds, decide }) {
  return (
    <>
      <Btn onClick={() => decide(cand.id, "selected")}>{passLabel(rounds, cand)}</Btn>
      <Btn q onClick={() => decide(cand.id, "onhold")}>Hold</Btn>
      <Btn q onClick={() => decide(cand.id, "rejected")}>Reject</Btn>
    </>
  );
}

function waitersByRound(wait, rounds, laterFirst = false) {
  const groups = (rounds || []).map((r, i) => ({
    id: r.id,
    name: r.name,
    list: wait.filter((c) => (c.roundIdx || 0) === i),
  })).filter((g) => g.list.length);
  return laterFirst ? groups.slice().reverse() : groups;
}
function justMoved(c) {
  return c.state === "wait" && (c.roundIdx || 0) > 0 && c.decidedAt && Date.now() - c.decidedAt < 180000;
}

function RecruiterPick({ rooms, rounds, cand, drive, onPick, onCancel, dark }) {
  const list = roomsForRound(rooms, rounds, cand);
  const waitName = (rounds || [])[waitingRoundIdx(rounds, cand)]?.name;
  const ink = dark ? "#fff" : k.ink;
  const mute = dark ? "rgba(255,255,255,.55)" : k.mid;
  return (
    <div>
      {waitName ? <div style={{ fontSize: 11.5, fontWeight: 700, color: mute, marginBottom: 8 }}>{waitName}</div> : null}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {list.map((r) => {
          const busy = occupantOf(drive, r.id);
          return (
            <button
              key={r.id}
              type="button"
              disabled={!!busy}
              onClick={() => { if (!busy) onPick(r.id); }}
              style={{
                padding: "10px 14px", borderRadius: 10, cursor: busy ? "default" : "pointer", fontFamily: bdy, textAlign: "left",
                border: dark ? "1px solid rgba(255,255,255,.16)" : `1px solid ${k.line}`,
                background: dark ? "rgba(255,255,255,.08)" : "#fff",
                color: ink, opacity: busy ? .45 : 1,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700 }}>{r.interviewer || "Open desk"}</div>
              <div style={{ fontSize: 11.5, color: mute }}>{r.name}{busy ? ` · ${busy.token}` : ""}</div>
            </button>
          );
        })}
        {!list.length && <div style={{ fontSize: 12.5, color: mute }}>No recruiter for this round.</div>}
      </div>
      {onCancel ? <button type="button" onClick={onCancel} style={{ ...ghostSm, marginTop: 10, background: dark ? "transparent" : "#fff", color: dark ? "#fff" : k.ink2, borderColor: dark ? "rgba(255,255,255,.2)" : k.line }}>Cancel</button> : null}
    </div>
  );
}

function RoundPips({ rounds, cand, light }) {
  return (
    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0 }}>
      {(rounds || []).map((r, i) => {
        const o = roundOutcomeOf(cand, r, i);
        const on = inARound(cand) && i === (cand.roundIdx || 0) && !isTerminal(cand.state);
        const color = o === "rejected" ? k.red : o === "onhold" ? k.gold : (o === "selected" || o === "passed") ? (light ? "#8BE0C2" : k.teal) : on ? (light ? "#fff" : k.coral) : (light ? "rgba(255,255,255,.38)" : k.faint);
        const mark = o === "rejected" ? "out" : o === "onhold" ? "hold" : (o === "selected" || o === "passed") ? "done" : "";
        return (
          <span key={r.id} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            {i > 0 && <span style={{ width: 10, height: 1, background: light ? "rgba(255,255,255,.2)" : k.line, margin: "0 6px" }} />}
            <span style={{ fontSize: 11.5, fontWeight: on || o ? 700 : 500, color, whiteSpace: "nowrap" }}>
              {r.name}{mark ? ` · ${mark}` : ""}
            </span>
          </span>
        );
      })}
    </div>
  );
}

export function LiveQueue({ drive, wait, active, s, eta, callTo, skip, recall, move, decide, deskMode, issuePass }) {
  const rooms = bindRoomsToRounds(drive.rooms || [], drive.rounds || []);
  const rounds = drive.rounds || [];
  const groups = waitersByRound(wait, rounds);
  const later = waitersByRound(wait, rounds, true);
  const [pickFor, setPickFor] = useState(null);
  const [lineRound, setLineRound] = useState("all");
  const shown = lineRound === "all" ? later : later.filter((g) => g.id === lineRound);
  const heads = later.map((g) => ({ ...g, cand: g.list[0] })).filter((g) => g.cand);
  const absent = drive.candidates.filter((x) => x.state === "absent");
  const pass = livePass(drive);
  const passLeft = pass ? Math.max(0, Math.ceil((pass.exp - Date.now()) / 1000)) : 0;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, marginBottom: 18, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
          <TallyStat label="In" v={s.all} color={k.ink} />
          <TallyStat label="Waiting" v={s.wait} color={k.coral} />
          {!deskMode && <TallyStat label="In room" v={s.active} color={k.ink} />}
          {!deskMode && <TallyStat label="Selected" v={s.selected} color={k.teal} />}
          {deskMode && <TallyStat label="Calling" v={active.filter((x) => x.state === "calling").length} color={k.coral} />}
        </div>
        <div style={{ ...box, padding: "10px 14px", display: "flex", alignItems: "center", gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700 }}>Door pass</div>
            <div style={{ fontSize: 11, color: k.mid }}>2 min · once</div>
          </div>
          {pass && passLeft > 0 ? (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: typ, fontSize: 16, fontWeight: 700, letterSpacing: 1, color: k.coral }}>PASS-{pass.code}</div>
              <div style={{ fontSize: 10.5, color: k.faint, fontFamily: typ }}>{passLeft}s</div>
            </div>
          ) : (
            issuePass && <button onClick={issuePass} style={solidSm}>Issue</button>
          )}
        </div>
      </div>

      {!!rooms.length && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: k.mid, letterSpacing: .8, textTransform: "uppercase", marginBottom: 10 }}>Rooms · interviewers</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
            {rooms.map((r) => {
              const who = occupantOf(drive, r.id);
              return (
                <div key={r.id} style={{ ...box, padding: "12px 14px", background: who ? k.ink : "#fff", color: who ? "#fff" : k.ink }}>
                  <div style={{ fontSize: 12, color: who ? "rgba(255,255,255,.55)" : k.mid }}>{roomRoundLabel(drive.rounds, r)}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 6, fontFamily: typ }}>{who ? who.token : "Free"}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: deskMode ? "1fr" : "1fr 1.1fr", gap: 18 }} className="g2">
        {!deskMode && (
        <div style={{ ...box, padding: 22 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: k.mid, letterSpacing: .8, textTransform: "uppercase", marginBottom: 14 }}>In interview now</div>
          {!active.length ? <Blank text="Nobody is with a recruiter yet." /> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {active.map((x) => (
                <div key={x.id} style={{ background: k.coralDim, borderRadius: 14, padding: "16px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <TokenChip token={x.token} name={x.name} size={44} pulse={x.state === "calling"} />
                      <div style={{ marginTop: 8 }}><RoundPips rounds={rounds} cand={x} /></div>
                      <div style={{ fontSize: 12.5, color: k.ink2, marginTop: 8 }}>
                        {x.room ? roomRoundLabel(rounds, x.room) : "No room"}
                        {x.room?.interviewer ? ` · ${x.room.interviewer}` : ""}
                        {x.calledAt && <> · <Elapsed since={x.calledAt} /></>}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                      {x.state === "calling" && <Btn onClick={() => move(x.id, "interviewing")}>Started</Btn>}
                      {x.state === "interviewing" && <OutcomeBtns cand={x} rounds={rounds} decide={decide} />}
                      <Btn q onClick={() => skip(x.id)}>Skip</Btn>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        )}

        <div style={{ ...box, padding: 22 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: k.faint, marginBottom: 14 }}>Up next — each round</div>
          {!heads.length ? <div style={{ color: k.faint, fontSize: 13.5 }}>Queue is empty.</div> : heads.map((g, i) => (
            <div key={g.id} style={{ padding: i ? "14px 0 0" : 0, marginTop: i ? 14 : 0, borderTop: i ? `1px solid ${k.line}` : "none", background: justMoved(g.cand) ? k.coralDim : "transparent", borderRadius: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: k.faint, letterSpacing: .6, textTransform: "uppercase", marginBottom: 8 }}>{g.name}</div>
              <TokenChip token={g.cand.token} name={g.cand.name} size={44} />
              {justMoved(g.cand) ? <div style={{ marginTop: 8 }}><Pill tone="teal">Just passed</Pill></div> : null}
              <div style={{ marginTop: 8 }}><RoundPips rounds={rounds} cand={g.cand} /></div>
              {pickFor === g.cand.id ? (
                <div style={{ marginTop: 12 }}>
                  <RecruiterPick rooms={rooms} rounds={rounds} cand={g.cand} drive={drive} onPick={(id) => { callTo(g.cand.id, id); setPickFor(null); }} onCancel={() => setPickFor(null)} />
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                  <button onClick={() => setPickFor(g.cand.id)} style={{ ...solid, flex: 1, justifyContent: "center", padding: 11 }}>
                    Call {g.cand.token} <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* THE LINE */}
      <div style={{ ...box, marginTop: 18, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${k.line}` }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: k.mid, letterSpacing: .8, textTransform: "uppercase", marginBottom: groups.length > 1 ? 10 : 0 }}>The line — {wait.length} waiting</div>
          {groups.length > 1 ? (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button type="button" onClick={() => setLineRound("all")} style={{
                border: `1px solid ${lineRound === "all" ? k.ink : k.line}`, borderRadius: 999, padding: "6px 12px", cursor: "pointer",
                fontFamily: bdy, fontSize: 12.5, fontWeight: 600, background: lineRound === "all" ? k.ink : "#fff", color: lineRound === "all" ? "#fff" : k.ink,
              }}>All</button>
              {groups.map((g) => (
                <button key={g.id} type="button" onClick={() => setLineRound(g.id)} style={{
                  border: `1px solid ${lineRound === g.id ? k.ink : k.line}`, borderRadius: 999, padding: "6px 12px", cursor: "pointer",
                  fontFamily: bdy, fontSize: 12.5, fontWeight: 600, background: lineRound === g.id ? k.ink : "#fff", color: lineRound === g.id ? "#fff" : k.ink,
                }}>{g.name} · {g.list.length}</button>
              ))}
            </div>
          ) : null}
        </div>
        {!wait.length ? <Blank text="Nobody waiting." /> : shown.map((g) => (
          <div key={g.id}>
            <div style={{ padding: "10px 20px", fontSize: 11.5, fontWeight: 700, color: k.faint, letterSpacing: .6, textTransform: "uppercase", background: k.cream2, borderTop: `1px solid ${k.line}` }}>
              {g.name} · {g.list.length}
            </div>
            {g.list.map((x) => (
              <div key={x.id} style={{ display: "grid", gridTemplateColumns: deskMode ? "minmax(180px,1.4fr) 90px 1fr" : "minmax(160px,1.2fr) 90px 110px 1fr", gap: 12, alignItems: "center", padding: "13px 20px", borderTop: `1px solid ${k.line}`, background: justMoved(x) ? k.coralDim : "transparent" }} className="driverow">
                <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  <TokenChip token={x.token} name={x.name} size={34} />
                  {justMoved(x) ? <Pill tone="teal">Next round</Pill> : null}
                  {x.skipped ? <Pill tone="gold">SKIPPED {x.skipped}×</Pill> : null}
                </span>
                <span style={{ fontSize: 12.5, color: k.mid, fontFamily: typ }}>~{eta(x)}m</span>
                {!deskMode && (
                  <span style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                    {clientOf(drive) ? <Pill tone="coral">{clientOf(drive)}</Pill> : null}
                    <RoundPips rounds={rounds} cand={x} />
                  </span>
                )}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end", alignItems: "center" }}>
                  {pickFor === x.id ? (
                    <RecruiterPick rooms={rooms} rounds={rounds} cand={x} drive={drive} onPick={(id) => { callTo(x.id, id); setPickFor(null); }} onCancel={() => setPickFor(null)} />
                  ) : (
                    <>
                      <Btn onClick={() => setPickFor(x.id)}>Call</Btn>
                      <Btn q onClick={() => move(x.id, "absent")}>Absent</Btn>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* RECALL ABSENT */}
      {absent.length > 0 && (
        <div style={{ ...box, marginTop: 18, padding: 20 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: k.mid, letterSpacing: .8, textTransform: "uppercase", marginBottom: 12 }}>Marked absent — {absent.length}</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {absent.map((x) => (
              <div key={x.id} style={{ display: "flex", alignItems: "center", gap: 10, background: k.cream2, borderRadius: 10, padding: "9px 13px" }}>
                <TokenChip token={x.token} name={x.name} size={28} />
                <Btn q onClick={() => recall(x.id)}>Recall</Btn>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function BigStat({ n, label, color }) {
  return (
    <div style={{ ...box, padding: "18px 22px", flex: 1, minWidth: 130 }}>
      <div style={{ fontFamily: dsp, fontSize: 32, fontWeight: 800, color: color || k.ink, letterSpacing: -1.2 }}>{n}</div>
      <div style={{ fontSize: 12.5, color: k.mid, marginTop: 2 }}>{label}</div>
    </div>
  );
}

export function Elapsed({ since }) {
  const [, tick] = useState(0);
  useEffect(() => { const iv = setInterval(() => tick((t) => t + 1), 10000); return () => clearInterval(iv); }, []);
  const m = Math.floor((Date.now() - since) / 60000);
  return <span style={{ fontFamily: typ }}>{m}m elapsed</span>;
}

export function TokenFind({ candidates = [], onPick, compact }) {
  const [q, setQ] = useState("");
  const wrapRef = useRef(null);
  const needle = q.trim().toLowerCase();
  const hits = needle
    ? candidates.filter((x) => [x.token, x.name, x.phone].some((v) => String(v || "").toLowerCase().includes(needle))).slice(0, 6)
    : [];
  return (
    <div ref={wrapRef} style={{ position: "relative", flex: compact ? "0 1 240px" : "1 1 220px", minWidth: compact ? 180 : 200 }}>
      <Search size={14} color={k.faint} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Find W-014"
        style={{ ...input, padding: compact ? "8px 12px 8px 34px" : "11px 14px 11px 36px", fontFamily: typ }}
      />
      <DropPanel anchorRef={wrapRef} open={hits.length > 0} onClose={() => setQ("")}>
        {hits.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => { onPick?.(c); setQ(""); }}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, width: "100%", padding: "10px 12px", border: "none", background: "#fff", cursor: "pointer", fontFamily: bdy, textAlign: "left", borderRadius: 8 }}
          >
            <TokenChip token={c.token} name={c.name} size={28} />
            <span style={{ fontSize: 11.5, color: k.mid, fontWeight: 600 }}>{c.state === "wait" ? "Waiting" : c.state === "calling" ? "Calling" : c.state === "interviewing" ? "In room" : c.state}</span>
          </button>
        ))}
      </DropPanel>
    </div>
  );
}

export function Today({ s, wait, active, setTab, drive, lim, callTo, onFind }) {
  const rooms = bindRoomsToRounds(drive?.rooms || [], drive?.rounds || []);
  const rounds = drive?.rounds || [];
  const next = wait[0];
  const callDesks = roomsForRound(rooms, rounds, next);
  const canRooms = lim?.rooms !== false;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, marginBottom: 22, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
          <TallyStat label="Waiting" v={s.wait} color={k.ink} />
          <TallyStat label="In room" v={s.active} color={k.coral} />
          <TallyStat label="Selected" v={s.selected} color={k.teal} />
          <TallyStat label="Hold" v={s.onhold} color={k.gold} />
          <TallyStat label="Out" v={s.rejected} color={k.red} />
        </div>
        <TokenFind candidates={drive?.candidates || []} onPick={onFind} />
      </div>

      {next && (
        <div style={{ ...box, padding: "24px 26px", marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: k.faint, marginBottom: 12 }}>Up next</div>
            <TokenChip token={next.token} name={next.name} size={52} />
            <div style={{ marginTop: 10 }}><RoundPips rounds={rounds} cand={next} /></div>
            {next.expBand ? <div style={{ fontSize: 12.5, color: k.mid, marginTop: 8 }}>{next.expBand}</div> : null}
          </div>
          <div>
            {callDesks.length ? (
              <RecruiterPick rooms={rooms} rounds={rounds} cand={next} drive={drive} onPick={(id) => callTo?.(next.id, id)} />
            ) : (
              <button onClick={() => setTab("live")} style={solid}>Live queue <ArrowRight size={14} /></button>
            )}
          </div>
        </div>
      )}

      {!!rooms.length && (
        <div style={{ marginBottom: 18 }}>
          <Head title="Rooms" action={canRooms ? <button onClick={() => setTab("rooms")} style={link}>Edit <ArrowRight size={12} /></button> : null} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8 }}>
            {rooms.map((r) => {
              const who = occupantOf(drive, r.id);
              return (
                <div key={r.id} style={{ ...box, padding: "12px 14px", background: who ? k.ink : "#fff", color: who ? "#fff" : k.ink }}>
                  <div style={{ fontSize: 12, color: who ? "rgba(255,255,255,.55)" : k.mid }}>{roomRoundLabel(rounds, r)} · {r.interviewer || "—"}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, marginTop: 6, fontFamily: typ, letterSpacing: -0.4 }}>
                    {who ? who.token : "Free"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ ...box, padding: 20 }}>
        <Head title="Floor" action={<button onClick={() => setTab("live")} style={link}>Live <ArrowRight size={12} /></button>} />
        {!active.length && !wait.length ? <Blank text="Waiting for the first check-in." /> : (
          <div>
            {active.map((x) => (
              <div key={x.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", gap: 10, borderBottom: `1px solid ${k.line}` }}>
                <TokenChip token={x.token} name={x.name} size={34} pulse={x.state === "calling"} />
                <span style={{ fontSize: 12.5, color: k.coral, fontWeight: 600 }}>{x.room?.name || "—"}</span>
              </div>
            ))}
            {waitersByRound(wait, rounds, true).map((g) => (
              <div key={g.id} style={{ padding: "8px 0 2px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: k.faint, letterSpacing: .6, textTransform: "uppercase", margin: "8px 0 4px" }}>{g.name}</div>
                {g.list.slice(0, 4).map((x, i) => (
                  <div key={x.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${k.line}`, background: justMoved(x) ? k.coralDim : "transparent" }}>
                    <TokenChip token={x.token} name={x.name} size={28} />
                    <span style={{ fontSize: 12, color: justMoved(x) ? k.coral : k.faint, fontFamily: typ, fontWeight: justMoved(x) ? 700 : 500 }}>{justMoved(x) ? "Just passed" : (i === 0 ? "Next" : `#${i + 1}`)}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function TallyStat({ label, v, color }) {
  return (
    <div style={{ minWidth: 72 }}>
      <div style={{ fontSize: 11.5, color: k.mid, fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: typ, fontSize: 26, fontWeight: 700, color, letterSpacing: -0.6 }}>{v}</div>
    </div>
  );
}

export function Screen({ driveId, gate, desk, left, active, wait, eta, rounds, brand, clientName, branch, role, credit = "on" }) {
  const name = (brand?.name || "").trim() || "Walk-in";
  const accent = brand?.color || k.coral;
  const logo = brand?.logo || "letter";
  return (
    <div>
      <div style={{ marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <HallBrand name={name} color={accent} logo={logo} sub={clientName || null} size={32} credit={credit} />
        {driveId && (
          <a href={`/tv/${encodeURIComponent(driveId)}`} target="_blank" rel="noreferrer" style={{ ...solidSm, textDecoration: "none" }}>
            <MonitorSmartphone size={15} /> Open on the hall TV
          </a>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 30 }} className="g2">
        <div>
          <div style={{ ...box, padding: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, border: `2px solid ${accent}` }}>
            <OrgLogo name={name} color={accent} logo={logo} size={40} />
            <div style={{ fontFamily: dsp, fontWeight: 800, fontSize: 16, textAlign: "center", lineHeight: 1.25 }}>{clientName ? `${name} · ${clientName}` : name}</div>
            {role ? <div style={{ fontSize: 12, color: k.mid, textAlign: "center" }}>{role}</div> : null}
            {branch ? <div style={{ fontSize: 11.5, color: k.faint }}>{branch}</div> : null}
            <div style={{ fontSize: 10.5, color: accent, fontFamily: typ, letterSpacing: 1, fontWeight: 700, marginTop: 4 }}>PRINT</div>
            <QrCode value={gateUrl(gate)} size={165} alt="Printed poster QR — identifies the walk-in" />
            <div style={{ fontFamily: typ, fontSize: 16, fontWeight: 700, letterSpacing: 1.5 }}>{gate}</div>
            <div style={{ fontSize: 11, color: k.mid, textAlign: "center", lineHeight: 1.45 }}>Poster. Finds the walk-in.</div>
            {credit === "on" && <div style={{ fontSize: 11, fontWeight: 700, color: k.coral }}>Powered by TokenHire</div>}
            {credit === "tiny" && <div style={{ fontSize: 9, color: k.faint }}>TokenHire</div>}
          </div>
          <div style={{ ...box, marginTop: 10, padding: "12px 10px", textAlign: "center", background: `${accent}14` }}>
            <div style={{ fontSize: 10.5, color: k.mid, fontFamily: typ, letterSpacing: 1, marginBottom: 4 }}>ON THE TV</div>
            <div style={{ fontFamily: typ, fontSize: 22, fontWeight: 700, letterSpacing: 3, color: k.ink }}>DESK-{desk}</div>
            <div style={{ fontSize: 11, color: k.faint, fontFamily: typ, marginTop: 4 }}>ROTATES IN {left}s</div>
          </div>
          <div style={{ fontSize: 11.5, color: k.faint, marginTop: 14, lineHeight: 1.5, textAlign: "center" }}>Names stay masked on the wall.</div>
        </div>
        <div style={{ ...box, overflow: "hidden" }}>
          <div style={{ padding: "12px 18px", borderBottom: `2px solid ${accent}`, fontFamily: typ, fontSize: 11, letterSpacing: 1.2, color: accent, fontWeight: 700 }}>NOW CALLING</div>
          {!active.length ? <Blank text="Nobody is being called yet." /> : active.map((x) => (
            <div key={x.id} style={{ padding: 18, display: "flex", alignItems: "center", gap: 16, background: `${accent}18`, borderBottom: `1px solid ${k.line}` }}>
              <TokenChip token={x.token} name={mask(x.name)} size={52} color={accent} pulse />
            </div>
          ))}
          {waitersByRound(wait, rounds).map((g) => (
            <div key={g.id}>
              <div style={{ padding: "12px 18px", borderTop: `1px solid ${k.line}`, borderBottom: `1px solid ${k.line}`, fontFamily: typ, fontSize: 11, letterSpacing: 1.2, color: k.ink2, background: k.cream2 }}>
                {g.name.toUpperCase()} — {g.list.length} WAITING
              </div>
              {g.list.slice(0, 5).map((x, i) => (
                <div key={x.id} style={{ display: "grid", gridTemplateColumns: "1fr 80px", padding: "11px 18px", borderBottom: `1px solid ${k.line}`, alignItems: "center" }}>
                  <TokenChip token={x.token} name={mask(x.name)} size={32} color={accent} muted />
                  <span style={{ fontFamily: typ, fontSize: 12.5, color: i === 0 ? accent : k.faint, textAlign: "right" }}>~{eta(x)}m</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Queue({ rows, eta, move, decide, rounds, saveNote, rooms: rawRooms = [], callTo, initialQ = "" }) {
  const rooms = bindRoomsToRounds(rawRooms, rounds);
  const phone = useNarrow();
  const [q, setQ] = useState(initialQ);
  useEffect(() => { if (initialQ) setQ(initialQ); }, [initialQ]);
  const [fExp, setFExp] = useState("All");
  const [fRound, setFRound] = useState("All");
  const [fState, setFState] = useState("All");
  const [noteFor, setNoteFor] = useState(null);
  const [pickFor, setPickFor] = useState(null);
  const label = { wait: ["grey", "Waiting"], calling: ["coral", "Calling"], interviewing: ["coral", "In interview"], selected: ["teal", "Selected"], rejected: ["red", "Rejected"], onhold: ["gold", "On hold"], absent: ["grey", "Absent"] };
  const stateName = (v) => ({ All: "All", wait: "Waiting", calling: "Calling", interviewing: "In interview", selected: "Selected", rejected: "Rejected", onhold: "On hold", absent: "Absent" }[v] || v);
  const needle = q.trim().toLowerCase();
  const list = rows.slice()
    .filter((x) => !needle || [x.name, x.token, x.phone, x.email].some((v) => String(v || "").toLowerCase().includes(needle)))
    .filter((x) => fExp === "All" || x.expBand === fExp)
    .filter((x) => fRound === "All" || String(x.roundIdx) === fRound)
    .filter((x) => fState === "All" || x.state === fState)
    .sort((a, b) => a.at - b.at);
  const filtered = !!needle || fExp !== "All" || fRound !== "All" || fState !== "All";
  const quickStates = [["All", "All"], ["wait", "Waiting"], ["interviewing", "In interview"], ["selected", "Selected"]];

  return (
    <div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10, alignItems: "flex-end" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 5, flex: "1 1 220px", minWidth: 200, maxWidth: 340 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: k.faint, textTransform: "uppercase", letterSpacing: .5 }}>Search</span>
          <span style={{ position: "relative", display: "block" }}>
            <Search size={15} color={k.faint} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Name, token, or phone"
              style={{ ...input, padding: "9px 12px 9px 36px" }}
            />
          </span>
        </label>
        <FilterSelect label="Experience" value={fExp} setValue={setFExp} options={["All", ...EXP_BANDS]} />
        <FilterSelect label="Round" value={fRound} setValue={setFRound} options={["All", ...rounds.map((r, i) => String(i))]} render={(v) => (v === "All" ? "All" : rounds[Number(v)]?.name)} />
        <FilterSelect label="Status" value={fState} setValue={setFState} options={["All", "wait", "calling", "interviewing", "selected", "rejected", "onhold", "absent"]} render={stateName} />
        <span style={{ fontSize: 13, color: k.mid, marginLeft: "auto", paddingBottom: 10, whiteSpace: "nowrap" }}>
          {list.length} of {rows.length} shown
          {filtered && <button type="button" onClick={() => { setQ(""); setFExp("All"); setFRound("All"); setFState("All"); }} style={{ ...textLink, marginLeft: 10 }}>Clear</button>}
        </span>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14, alignItems: "center" }}>
        {quickStates.map(([v, lab]) => (
          <button key={v} type="button" onClick={() => setFState(v)} style={{
            padding: "6px 13px", borderRadius: R.pill, cursor: "pointer", fontFamily: bdy, fontSize: 12.5,
            border: `1px solid ${fState === v ? k.coral : k.line}`,
            background: fState === v ? k.coralDim : "#fff", color: fState === v ? k.coral : k.ink2, fontWeight: fState === v ? 600 : 500,
          }}>{lab}</button>
        ))}
      </div>

      {phone ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {!list.length && <Blank text="Nobody matches these filters." />}
          {list.map((x) => {
            const noteCount = Object.values(x.notes || {}).filter(Boolean).length;
            return (
              <div key={x.id} style={{ ...box, padding: 14 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <TokenTile token={x.token} size={40} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{x.name}</div>
                    <div style={{ fontSize: 12, color: k.mid, marginTop: 2, fontFamily: typ }}>{x.phone}</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                      <Pill tone={label[x.state]?.[0]}>{label[x.state]?.[1]}</Pill>
                      <RoundPips rounds={rounds} cand={x} />
                      {x.expBand && <Pill tone={x.expBand === "Fresher" ? "grey" : "coral"}>{x.expBand}</Pill>}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
                  {x.state === "wait" && (pickFor === x.id
                    ? <RecruiterPick rooms={rooms} rounds={rounds} cand={x} drive={{ candidates: rows }} onPick={(id) => { callTo(x.id, id); setPickFor(null); }} onCancel={() => setPickFor(null)} />
                    : <Btn onClick={() => setPickFor(x.id)}>Call</Btn>)}
                  {x.state === "calling" && <><Btn onClick={() => move(x.id, "interviewing")}>Start</Btn><Btn q onClick={() => move(x.id, "absent")}>Absent</Btn></>}
                  {x.state === "interviewing" && <OutcomeBtns cand={x} rounds={rounds} decide={decide} />}
                  {x.state === "onhold" && <Btn onClick={() => move(x.id, "wait")}>Back to queue</Btn>}
                  <Btn q onClick={() => setNoteFor(x)}>Notes{noteCount ? ` (${noteCount})` : ""}</Btn>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
      <div style={{ ...box, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, minWidth: 1000 }}>
          <thead><tr style={{ background: k.cream2 }}>{["No.", "Candidate", "Experience", "Round", "Status", "Actions"].map((h) => <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, letterSpacing: .6, color: k.mid, fontWeight: 700, textTransform: "uppercase", borderBottom: `1px solid ${k.line}` }}>{h}</th>)}</tr></thead>
          <tbody>
            {!list.length && <tr><td colSpan={7}><Blank text="Nobody matches these filters." /></td></tr>}
            {list.map((x) => {
              const noteCount = Object.values(x.notes || {}).filter(Boolean).length;
              return (
                <tr key={x.id} style={{ borderBottom: `1px solid ${k.line}` }}>
                  <td style={cell}><TokenTile token={x.token} size={32} /></td>
                  <td style={cell}>
                    <div style={{ fontWeight: 600 }}>{x.name}</div>
                    <div style={{ fontSize: 12, color: k.faint, display: "flex", gap: 12, marginTop: 3, flexWrap: "wrap" }}>
                      <span style={{ fontFamily: typ }}>{x.phone}</span>
                      {x.linkedin && <a href={x.linkedin} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 4, color: k.coral, textDecoration: "none" }}><Linkedin size={11} />Profile</a>}
                    </div>
                    {x.resume && <button onClick={() => alert(`In production: downloads ${x.name}'s resume from encrypted storage. The download is logged.`)} style={{ ...ghostSm, marginTop: 7, fontSize: 11.5, padding: "5px 10px" }}><Download size={11} />{x.resume}</button>}
                  </td>
                  <td style={cell}><Pill tone={x.expBand === "Fresher" ? "grey" : "coral"}>{x.expBand || "—"}</Pill></td>
                  <td style={cell}>
                    <RoundPips rounds={rounds} cand={x} />
                  </td>
                  <td style={cell}><Pill tone={label[x.state]?.[0]}>{label[x.state]?.[1]}</Pill></td>
                  <td style={{ ...cell }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                      {x.state === "wait" && (pickFor === x.id
                        ? <RecruiterPick rooms={rooms} rounds={rounds} cand={x} drive={{ candidates: rows }} onPick={(id) => { callTo(x.id, id); setPickFor(null); }} onCancel={() => setPickFor(null)} />
                        : <Btn onClick={() => setPickFor(x.id)}>Call</Btn>)}
                      {x.state === "calling" && <><Btn onClick={() => move(x.id, "interviewing")}>Start</Btn><Btn q onClick={() => move(x.id, "absent")}>Absent</Btn></>}
                      {x.state === "interviewing" && <OutcomeBtns cand={x} rounds={rounds} decide={decide} />}
                      {x.state === "onhold" && <Btn onClick={() => move(x.id, "wait")}>Back to queue</Btn>}
                      <Btn q onClick={() => setNoteFor(x)}>Notes{noteCount ? ` (${noteCount})` : ""}</Btn>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}

      {noteFor && <NotesPanel cand={rows.find((r) => r.id === noteFor.id) || noteFor} rounds={rounds} onClose={() => setNoteFor(null)} saveNote={saveNote} />}
    </div>
  );
}

export function FilterSelect({ label, value, setValue, options, render }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: 148 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: k.faint, textTransform: "uppercase", letterSpacing: .5 }}>{label}</span>
      <Select
        value={value}
        onChange={setValue}
        options={options.map((o) => ({ value: o, label: render ? render(o) : o }))}
        style={{ padding: "9px 12px", fontSize: 13, width: "auto", minWidth: 148 }}
      />
    </label>
  );
}

export function NotesPanel({ cand, rounds, onClose, saveNote }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(11,16,32,.45)", zIndex: 200, display: "flex", justifyContent: "flex-end" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 460, maxWidth: "100%", background: "#fff", height: "100%", overflowY: "auto", padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <div>
            <div style={{ fontFamily: dsp, fontSize: 21, fontWeight: 700 }}>{cand.name}</div>
            <div style={{ marginTop: 8 }}><TokenChip token={cand.token} name={`${cand.expBand || ""} · ${cand.phone}`} size={28} muted /></div>
          </div>
          <button onClick={onClose} style={{ ...ghostSm, padding: "6px 12px" }}>Close</button>
        </div>
        <div style={{ background: k.coralDim, borderRadius: 12, padding: "10px 14px", fontSize: 12.5, color: k.coral, margin: "18px 0 22px" }}>
          Private to your team. Candidates never see these notes.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {rounds.map((r, i) => {
            const o = roundOutcomeOf(cand, r, i);
            const current = inARound(cand) && i === (cand.roundIdx || 0) && !isTerminal(cand.state);
            const done = o === "selected" || o === "passed";
            return (
              <div key={r.id}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    background: done ? k.coral : current ? "#fff" : k.cream2, border: `2px solid ${done || current ? k.coral : k.line}`,
                  }}>
                    {done && <Check size={12} color="#fff" />}
                  </div>
                  <span style={{ fontFamily: dsp, fontSize: 15.5, fontWeight: 700, color: done || current ? k.ink : k.faint }}>{r.name}</span>
                  {current && <Pill tone="coral">NOW</Pill>}
                  {o === "rejected" && <Pill tone="red">Out</Pill>}
                  {o === "onhold" && <Pill tone="gold">Hold</Pill>}
                  {done && <Pill tone="teal">Done</Pill>}
                </div>
                <textarea
                  value={cand.notes?.[r.id] || ""}
                  onChange={(e) => saveNote(cand.id, r.id, e.target.value)}
                  placeholder={`Notes from ${r.name.toLowerCase()}…`}
                  rows={3}
                  style={{ ...input, resize: "vertical", fontFamily: bdy, fontSize: 13.5, background: i > cand.roundIdx ? k.cream2 : "#fff" }} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function BrandingTab({ brand, setBrand, drive, org }) {
  const hall = (brand.name || "").trim() || org?.short || org?.name || drive.company;
  const accent = brand.color || org?.color || k.coral;
  const logo = brand.logo || org?.logo || "letter";
  const patch = (partial) => setBrand({ name: hall, color: accent, logo, ...brand, ...partial });
  return (
    <div style={{ maxWidth: 760 }}>
      <h1 style={{ fontFamily: dsp, fontSize: 23, fontWeight: 700, margin: "0 0 5px" }}>Hall mark</h1>
      <p style={{ fontSize: 13.5, color: k.mid, margin: "0 0 22px", lineHeight: 1.6 }}>
        TV, slip, and check-in.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30 }} className="g2">
        <div>
          <div style={{ ...box, padding: 22, marginBottom: 18 }}>
            <Field label="Display name">
              <input value={brand.name || ""} onChange={(e) => patch({ name: e.target.value })} style={input} placeholder={org?.short || org?.name} />
            </Field>
            <div style={{ height: 14 }} />
            <div style={{ fontSize: 12, color: k.mid, fontWeight: 600, marginBottom: 8 }}>Logo</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
              {LOGO_PRESETS.map((p) => (
                <button key={p.id} type="button" onClick={() => patch({ logo: p.id })} style={{ padding: 6, borderRadius: 10, border: `2px solid ${logo === p.id ? accent : k.line}`, background: "#fff", cursor: "pointer" }}>
                  <OrgLogo name={hall} color={accent} logo={p.id} size={32} />
                </button>
              ))}
            </div>
            <div style={{ fontSize: 12, color: k.mid, fontWeight: 600, marginBottom: 9 }}>Primary color</div>
            <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
              {BRAND_COLORS.map((c) => (
                <button key={c.hex} onClick={() => patch({ color: c.hex })} title={c.name} style={{
                  width: 34, height: 34, borderRadius: "50%", background: c.hex, cursor: "pointer",
                  border: accent === c.hex ? `3px solid ${k.ink}` : "3px solid transparent",
                }} />
              ))}
            </div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: k.faint, letterSpacing: .5, textTransform: "uppercase", marginBottom: 10 }}>Waiting TV</div>
          <div style={{ background: "#0F1116", borderRadius: 14, padding: 22 }}>
            <HallBrand name={hall} color={accent} logo={logo} light sub={clientOf(drive) || null} credit={planLimits(org).credit} />
            <div style={{ background: "#fff", borderRadius: 10, padding: 16, marginTop: 16 }}>
              <TokenChip token="W-014" name="R···l" size={40} color={accent} />
              <div style={{ fontSize: 11.5, color: k.mid, marginTop: 8 }}>{drive.role}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RoundsTab({ rounds, setRounds }) {
  const [name, setName] = useState("");
  const add = () => { if (!name.trim()) return; setRounds([...rounds, { id: `r${Date.now()}`, name: name.trim() }]); setName(""); };
  const remove = (id) => setRounds(rounds.filter((r) => r.id !== id));
  const rename = (id, v) => setRounds(rounds.map((r) => (r.id === id ? { ...r, name: v } : r)));
  const swap = (i, j) => { if (j < 0 || j >= rounds.length) return; const n = [...rounds]; [n[i], n[j]] = [n[j], n[i]]; setRounds(n); };
  return (
    <div style={{ maxWidth: 620 }}>
      <h1 style={{ fontFamily: dsp, fontSize: 23, fontWeight: 700, margin: "0 0 5px" }}>Interview rounds</h1>
      <p style={{ fontSize: 13.5, color: k.mid, margin: "0 0 22px", lineHeight: 1.55 }}>Each room runs one round. Call puts them in that room and that round. Pass records it and they wait for the next.</p>
      <div style={{ ...box, overflow: "hidden", marginBottom: 18 }}>
        {rounds.map((r, i) => (
          <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderTop: i ? `1px solid ${k.line}` : "none" }}>
            <span style={{ fontFamily: typ, fontSize: 13, color: k.faint, width: 22 }}>{i + 1}</span>
            <input value={r.name} onChange={(e) => rename(r.id, e.target.value)} style={{ ...input, flex: 1 }} />
            <button onClick={() => swap(i, i - 1)} disabled={i === 0} style={{ ...ghostSm, opacity: i === 0 ? .35 : 1, padding: "7px 11px" }}>↑</button>
            <button onClick={() => swap(i, i + 1)} disabled={i === rounds.length - 1} style={{ ...ghostSm, opacity: i === rounds.length - 1 ? .35 : 1, padding: "7px 11px" }}>↓</button>
            <button onClick={() => remove(r.id)} disabled={rounds.length <= 1} style={{ ...ghostSm, opacity: rounds.length <= 1 ? .35 : 1, padding: "7px 11px", color: k.red }}>Remove</button>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 9 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Add a round — e.g. Versant test" style={{ ...input, flex: 1 }} />
        <button onClick={add} style={solidSm}><Plus size={15} /> Add</button>
      </div>
    </div>
  );
}

export function RoomsTab({ rooms, setRooms, org, setOrgs, drive }) {
  const [name, setName] = useState("");
  const [recruiterEmail, setRecruiterEmail] = useState("");
  const [invite, setInvite] = useState("");
  const recruiters = recruitersOf(org);
  const pickName = (email) => {
    const m = (org.members || []).find((x) => memberEmail(x).toLowerCase() === email.toLowerCase());
    return m ? memberName(m) : email.split("@")[0];
  };
  const add = () => {
    if (!name.trim() || planLimits(org).rooms === false) return;
    const email = recruiterEmail;
    setRooms([...rooms, { id: `rm${Date.now()}`, name: name.trim(), interviewer: email ? pickName(email) : "", recruiterEmail: email || null, roundId: (drive.rounds || [])[0]?.id || "" }]);
    setName("");
  };
  const remove = (id) => setRooms(rooms.filter((r) => r.id !== id));
  const rename = (id, v) => setRooms(rooms.map((r) => (r.id === id ? { ...r, name: v } : r)));
  const setRound = (id, roundId) => setRooms(rooms.map((r) => (r.id === id ? { ...r, roundId } : r)));
  const assign = (id, email) => setRooms(rooms.map((r) => (r.id === id ? { ...r, recruiterEmail: email || null, interviewer: email ? pickName(email) : "" } : r)));
  function inviteRecruiter() {
    const v = invite.trim();
    if (!v || !setOrgs) return;
    if ((org.members || []).length >= planLimits(org).seats) { setInvite(""); return; }
    if ((org.members || []).some((m) => memberEmail(m).toLowerCase() === v.toLowerCase())) { setInvite(""); return; }
    setOrgs((p) => p.map((o) => (o.id === org.id ? { ...o, members: [...(o.members || []), { email: v, role: "recruiter" }] } : o)));
    setInvite("");
    setRecruiterEmail(v);
  }
  const busy = (roomId) => occupantOf(drive, roomId);
  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{ fontFamily: dsp, fontSize: 23, fontWeight: 700, margin: "0 0 5px" }}>Rooms and interviewers</h1>
      <p style={{ fontSize: 13.5, color: k.mid, margin: "0 0 22px", lineHeight: 1.55 }}>Several recruiters can run the same round. Call asks which one takes the person.</p>
      <div style={{ ...box, overflow: "hidden", marginBottom: 18 }}>
        {!rooms.length && <Blank text="No rooms yet. Add one below." />}
        {rooms.map((r, i) => {
          const who = busy(r.id);
          return (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderTop: i ? `1px solid ${k.line}` : "none", flexWrap: "wrap" }}>
              <span style={{ fontFamily: typ, fontSize: 13, color: k.faint, width: 22 }}>{i + 1}</span>
              <input value={r.name} onChange={(e) => rename(r.id, e.target.value)} style={{ ...input, flex: "1 1 140px", minWidth: 120 }} />
              <Select
                value={r.recruiterEmail || ""}
                onChange={(v) => assign(r.id, v)}
                placeholder="Unassigned"
                options={[{ value: "", label: "Unassigned" }, ...recruiters.map((m) => ({ value: memberEmail(m), label: `${memberName(m)} · ${memberEmail(m)}` }))]}
                style={{ flex: "1 1 180px", minWidth: 160 }}
              />
              {/* Without this the room drops out of the round-scoped call pickers. */}
              <Select
                value={r.roundId || ""}
                onChange={(v) => setRound(r.id, v)}
                placeholder="Any round"
                options={[{ value: "", label: "Any round" }, ...(drive.rounds || []).map((rd) => ({ value: rd.id, label: rd.name }))]}
                style={{ flex: "1 1 150px", minWidth: 130 }}
              />
              {who ? <Pill tone="coral">{who.token}</Pill> : <Pill tone="grey">FREE</Pill>}
              <button onClick={() => remove(r.id)} style={{ ...ghostSm, padding: "7px 11px", color: k.red }}>Remove</button>
            </div>
          );
        })}
      </div>
      {planLimits(org).rooms !== false && (
      <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginBottom: 18 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Room name — e.g. Room 6" style={{ ...input, flex: "1 1 160px" }} />
        <Select
          value={recruiterEmail}
          onChange={setRecruiterEmail}
          placeholder="Assign recruiter…"
          options={[{ value: "", label: "Assign recruiter…" }, ...recruiters.map((m) => ({ value: memberEmail(m), label: memberName(m) }))]}
          style={{ flex: "1 1 180px" }}
        />
        <button onClick={add} style={solidSm}><Plus size={15} /> Add room</button>
      </div>
      )}
      <div style={{ ...box, padding: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Add a recruiter to the team</div>
        <div style={{ fontSize: 12.5, color: k.mid, marginBottom: 10, lineHeight: 1.5 }}>They can sign in with this email (same company password) and appear in the room assignment list.</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input value={invite} onChange={(e) => setInvite(e.target.value)} onKeyDown={(e) => e.key === "Enter" && inviteRecruiter()} placeholder="recruiter@yourcompany.com" style={{ ...input, flex: 1, minWidth: 180 }} />
          <button onClick={inviteRecruiter} style={outlineSm}>Add recruiter</button>
        </div>
      </div>
    </div>
  );
}

export function Msgs({ msgs }) {
  return (
    <div style={{ maxWidth: 560 }}>
      <p style={{ fontSize: 13.5, color: k.mid, margin: "0 0 16px" }}>Only the 15-minute “you’re up soon” WhatsApp. No extra message types — not called, selected, or rejected.</p>
      {!msgs.length && <Blank text="No 15-minute nudges sent yet." />}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {msgs.map((m) => (
          <div key={m.id} style={{ ...box, padding: 14, borderLeft: `3px solid ${m.ch === "WhatsApp" ? k.teal : k.mid}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12.5 }}><Pill tone={m.ch === "WhatsApp" ? "teal" : "grey"}>{m.ch}</Pill><span style={{ color: k.ink2 }}>{m.name}</span><span style={{ fontFamily: typ, color: k.faint, fontSize: 11.5 }}>{m.to}</span></span>
              <span style={{ fontFamily: typ, fontSize: 11.5, color: k.faint }}>{new Date(m.at).toLocaleTimeString()}</span>
            </div>
            <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>{m.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Result({ s, drive }) {
  const cs = drive?.candidates || [];
  const waited = cs.filter((x) => x.calledAt && x.at).map((x) => (x.calledAt - x.at) / 60000);
  const interviewed = cs.filter((x) => x.calledAt && x.decidedAt).map((x) => (x.decidedAt - x.calledAt) / 60000);
  const avg = (a) => (a.length ? Math.round(a.reduce((p, n) => p + n, 0) / a.length) : 0);
  const avgWait = avg(waited), avgInt = avg(interviewed);
  const data = [{ n: "Walked in", v: s.all }, { n: "Interviewed", v: s.seen }, { n: "Selected", v: s.selected }, { n: "On hold", v: s.onhold }, { n: "Rejected", v: s.rejected }];
  const cols = [k.faint, k.mid, k.teal, k.gold, k.red];

  function extractCsv() {
    const rounds = drive.rounds || [];
    const header = ["token", "name", "phone", "email", "experience", "current_round", "status", ...rounds.map((r) => `round_${r.name.replace(/\s+/g, "_")}`), "notes"];
    const lines = cs.map((x) => {
      const outcomes = rounds.map((r) => x.roundOutcomes?.[r.id] || "");
      const notes = Object.values(x.notes || {}).filter(Boolean).join(" | ");
      return [x.token, x.name, x.phone, x.email || "", x.expBand || x.exp || "", roundLabel(rounds, x), x.state, ...outcomes, notes].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",");
    });
    downloadFile(`${drive.company.replace(/\s+/g, "_")}_walkin_extract.csv`, [header.join(","), ...lines].join("\n"), "text/csv");
  }
  function sendAts() {
    const payload = {
      drive: { id: drive.id, company: drive.company, role: drive.role, city: drive.city, venue: drive.venue, date: drive.date },
      exportedAt: new Date().toISOString(),
      candidates: cs.map((x) => ({
        token: x.token, name: x.name, phone: x.phone, email: x.email || "", experience: x.expBand || x.exp, linkedin: x.linkedin || "", resume: x.resume || "",
        status: x.state,
        rounds: (drive.rounds || []).map((r, i) => ({ name: r.name, outcome: x.roundOutcomes?.[r.id] || (i < x.roundIdx ? "selected" : ""), notes: x.notes?.[r.id] || "" })),
      })),
    };
    downloadFile(`${drive.company.replace(/\s+/g, "_")}_ats_handoff.json`, JSON.stringify(payload, null, 2), "application/json");
    alert("Extract ready. In production this posts to Greenhouse, Lever, or your ATS — round-by-round selected / rejected / on hold, with notes. Offers stay in the ATS, not at the walk-in desk.");
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 8 }}>
        <div>
          <h1 style={{ fontFamily: dsp, fontSize: 22, fontWeight: 700, letterSpacing: -0.4, margin: "0 0 5px" }}>Day-end report</h1>
          <p style={{ color: k.mid, fontSize: 13.5, margin: 0 }}>This is the full candidate file — name, phone, email, experience, resume, and round outcomes — ready to send to your ATS. Offers and joining stay there. It is not a list of who attended.</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={extractCsv} style={outline}><Download size={14} /> CSV extract</button>
          <button onClick={sendAts} style={solid}><Send size={14} /> Send to ATS</button>
        </div>
      </div>
      <div style={{ ...box, padding: 22, margin: "18px 0" }}>
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 4, right: 22 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="n" width={92} tick={{ fill: k.ink2, fontSize: 12.5, fontFamily: bdy }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: "rgba(20,23,28,.03)" }} contentStyle={{ border: `1px solid ${k.line}`, borderRadius: 6, fontSize: 12.5, fontFamily: bdy }} />
              <Bar dataKey="v" radius={[0, 3, 3, 0]} barSize={20}>{data.map((_, i) => <Cell key={i} fill={cols[i]} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 16 }}>
        <RateCard label="Walked in → interviewed" v={`${pc(s.seen, s.all)}%`} />
        <RateCard label="Interviewed → selected" v={`${pc(s.selected, s.seen)}%`} />
        <RateCard label="On hold" v={`${pc(s.onhold, s.all)}%`} />
        <RateCard label="Rejected" v={`${pc(s.rejected, s.all)}%`} />
        <RateCard label="Absent when called" v={`${pc(s.absent, s.all)}%`} />
        <RateCard label="Average wait" v={`${avgWait} min`} />
        <RateCard label="Average interview" v={`${avgInt} min`} />
      </div>
    </div>
  );
}
export function RateCard({ label, v, color }) {
  return (
    <div style={{ ...box, padding: "14px 18px", flex: 1, minWidth: 150 }}>
      <div style={{ fontSize: 11.5, color: k.mid, marginBottom: 6, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 21, fontWeight: 700, color: color || k.ink, fontFamily: typ }}>{v}</div>
    </div>
  );
}

/* ---- shared primitives ---- */
