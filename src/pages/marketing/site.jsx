import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, Mail, Linkedin, Phone, ChevronDown, Menu, X, Play, Pause, Search, MapPin, Users2, QrCode, Check, ListChecks, ShieldCheck, FileText, HeartHandshake, Send, BadgeCheck } from "lucide-react";
import { bdy, dsp, typ, k, R, solid, solidSm, outline, outlineSm, iconBtn, navBtn, box, input, ghostSm, textLink } from "../../theme.js";
import { HallBrand, OrgLogo, TokenChip, Wordmark } from "../../components/brand.jsx";
import { Link } from "react-router-dom";
import { pc, PLANS, PLAN_ROWS, PUBLIC_PLANS, planPrice, listingHost, listingPlace, EXP_BANDS, DEFAULT_ROUNDS } from "../../lib/helpers.js";
import { HIDE_PRICING } from "../../lib/flags.js";
import { readSession } from "../../lib/api.js";
import { pathFor } from "../../lib/routes.js";
import { Pill, fmtDate, CitySelect, Blank, DropPanel, Field, Select, StatusPill } from "../../components/ui.jsx";

export const PAGES = [["home", "Home"], ["services", "Products"], ["drives", "Upcoming walk-ins"], ["about", "About us"], ["contact", "Contact us"]];

export const NAV = [
  {
    label: "Solutions", menu: [
      ["sol:bpo", "BPO & customer support", "High-volume voice and non-voice drives, one shared queue"],
      ["sol:retail", "Retail & delivery", "The same walk-in in every store, with today’s numbers at head office"],
      ["sol:campus", "Campus hiring", "A full campus batch through in one morning, with a report for the college"],
      ["sol:agency", "Staffing agencies", "Your hall and your clients — they never see each other’s files"],
    ],
  },
  ...(!HIDE_PRICING ? [{ id: "pricing", label: "Pricing" }] : []),
  { id: "drives", label: "Upcoming walk-ins" },
  { id: "about", label: "About us" },
];

const heroH1 = {
  fontFamily: dsp, fontSize: "clamp(34px,4.8vw,52px)", fontWeight: 600, letterSpacing: -1.6,
  margin: "0 0 12px", lineHeight: 1.08, color: k.ink,
};
const heroP = { fontSize: 16, color: k.mid, lineHeight: 1.55, margin: "0 auto", maxWidth: 520 };

function PageHero({ children, maxWidth = 720, bottom = 52 }) {
  return (
    <div style={{ background: k.cream2, borderBottom: `1px solid ${k.line}` }}>
      <div style={{ maxWidth, margin: "0 auto", padding: `56px 26px ${bottom}px`, textAlign: "center" }}>
        {children}
      </div>
    </div>
  );
}

export function SiteNav({ page, go, onLaunch }) {
  const [open, setOpen] = useState(null);
  const [menu, setMenu] = useState(false);
  const solRef = useRef(null);
  const signedIn = !!readSession()?.orgId;
  return (
    <div className="chrome-wrap" style={{ position: "sticky", top: 0, zIndex: 50, background: "#fff", borderBottom: `1px solid ${k.line}`, padding: "0 26px" }}>
      <div className="chrome-inner" style={{ maxWidth: 1140, margin: "0 auto", padding: "14px 0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <Link to="/" style={{ background: "none", border: "none", cursor: "pointer", padding: 0, marginRight: 4, textDecoration: "none" }}><Wordmark size={20} /></Link>
        <button className="nav-burger" type="button" aria-label="Menu" onClick={() => setMenu((m) => !m)} style={{ ...iconBtn, padding: 8, display: "none", alignItems: "center" }}>
          {menu ? <X size={22} /> : <Menu size={22} />}
        </button>
        <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: 26, flexWrap: "wrap" }}>
          {NAV.map((n, i) => n.menu ? (
            <div key={i} style={{ position: "relative" }}>
              <button
                ref={solRef}
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                onMouseEnter={() => setOpen(i)}
                style={{ ...navBtn, color: open === i ? k.ink : k.ink2, display: "flex", alignItems: "center", gap: 5 }}>
                {n.label} <ChevronDown size={15} style={{ transform: open === i ? "rotate(180deg)" : "none", transition: "transform .18s" }} />
              </button>
              <DropPanel
                anchorRef={solRef}
                open={open === i}
                onClose={() => setOpen(null)}
                minWidth={310}
                align="center"
                style={{ padding: 10, boxShadow: "0 22px 50px -20px rgba(11,16,32,.22)", borderRadius: R.card }}
              >
                {n.menu.map(([target, label, desc]) => (
                  <Link key={label} to={pathFor(target)} onClick={() => { setOpen(null); setMenu(false); }} style={{
                    display: "block", width: "100%", textAlign: "left", textDecoration: "none",
                    padding: "11px 13px", borderRadius: 12, fontFamily: bdy,
                  }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = k.cream2)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "none")}>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: k.ink }}>{label}</div>
                    <div style={{ fontSize: 12.5, color: k.mid, marginTop: 3 }}>{desc}</div>
                  </Link>
                ))}
              </DropPanel>
            </div>
          ) : (
            <Link key={n.id} to={pathFor(n.id)} className="navitem" style={{ ...navBtn, textDecoration: "none", color: page === n.id ? k.ink : k.ink2, fontWeight: page === n.id ? 600 : 500 }}>{n.label}</Link>
          ))}
        </div>
        <div className="nav-ctas" style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          {/* Three audiences, three destinations. "Sign in" and "I'm hiring" both
              landed on /login when signed out, which is what made this ambiguous. */}
          <Link to="/app/join" style={{ ...textLink, textDecoration: "none" }}>Candidate check-in</Link>
          {signedIn ? (
            <button onClick={() => onLaunch("employer")} style={solidSm}>Go to console <ArrowRight size={15} /></button>
          ) : (
            <>
              <Link to="/login" style={{ ...outlineSm, textDecoration: "none" }}>Sign in</Link>
              <Link to="/signup" style={{ ...solidSm, textDecoration: "none" }}>Start free <ArrowRight size={15} /></Link>
            </>
          )}
        </div>
      </div>
      {menu && (
        <div style={{ background: "#fff", borderBottom: `1px solid ${k.line}`, padding: "8px 16px 18px" }}>
          {NAV.flatMap((n) => n.menu ? n.menu.map(([target, label]) => [target, label]) : [[n.id, n.label]]).map(([id, label]) => (
            <Link key={label} to={pathFor(id)} onClick={() => setMenu(false)} style={{ display: "block", width: "100%", textAlign: "left", padding: "14px 4px", textDecoration: "none", borderBottom: `1px solid ${k.line}`, fontFamily: bdy, fontSize: 16, fontWeight: 600, color: k.ink }}>{label}</Link>
          ))}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
            {signedIn ? (
              <button onClick={() => { setMenu(false); onLaunch("employer"); }} style={{ ...solid, justifyContent: "center", width: "100%" }}>Go to console</button>
            ) : (
              <>
                <Link to="/signup" onClick={() => setMenu(false)} style={{ ...solid, justifyContent: "center", width: "100%", textDecoration: "none" }}>Start free</Link>
                <Link to="/login" onClick={() => setMenu(false)} style={{ ...outline, justifyContent: "center", width: "100%", textDecoration: "none" }}>Sign in</Link>
              </>
            )}
            <Link to="/app/join" onClick={() => setMenu(false)} style={{ ...outline, justifyContent: "center", width: "100%", textDecoration: "none" }}>Candidate check-in</Link>
          </div>
        </div>
      )}
    </div>
  );
}

export function SiteFooter() {
  const cols = [
    ["Company", [["services", "Products"], ...(!HIDE_PRICING ? [["pricing", "Pricing"]] : []), ["contact", "Contact us"]]],
    ["Legal", [["privacy", "Privacy"], ["terms", "Terms of use"]]],
    ["See it", [["demo", "Watch a walk-in"]]],
  ];
  return (
    <footer style={{ background: "#fff", borderTop: `1px solid ${k.line}`, marginTop: 0 }}>
      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "56px 26px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr) 1.1fr", gap: 30 }} className="g3">
          {cols.map(([title, links]) => (
            <div key={title}>
              {title === "Legal"
                ? <Link to="/legal" style={{ fontFamily: dsp, fontSize: 17, fontWeight: 700, marginBottom: 16, display: "block", color: k.ink, textDecoration: "none" }}>Legal</Link>
                : <div style={{ fontFamily: dsp, fontSize: 17, fontWeight: 700, marginBottom: 16 }}>{title}</div>}
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {links.map(([target, label]) => (
                  <Link key={target} to={pathFor(target)} style={{ color: k.ink2, fontSize: 14.5, fontFamily: bdy, textDecoration: "none" }}>{label}</Link>
                ))}
              </div>
            </div>
          ))}
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              {[Linkedin, Mail, Phone].map((I, i) => (
                <div key={i} style={{ width: 38, height: 38, borderRadius: "50%", background: k.cream2, border: `1px solid ${k.line}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <I size={17} color={k.ink} />
                </div>
              ))}
            </div>
            <div style={{ fontSize: 14.5, color: k.ink2, lineHeight: 1.7 }}>
              Gachibowli<br />Hyderabad, Telangana 500032
            </div>
            <div style={{ fontSize: 14.5, color: k.ink2, marginTop: 14 }}>hello@tokenhire.app</div>
          </div>
        </div>
        <div style={{ borderTop: `1px solid ${k.line}`, marginTop: 44, padding: "22px 0 30px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontSize: 13.5, color: k.mid }}>Copyright 2026 ©. All rights reserved.</span>
          <Wordmark size={15} />
        </div>
      </div>
    </footer>
  );
}

export { WalkInDemo } from "./WalkInDemo.jsx";

function SplitHero() {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(true);
  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  };
  return (
    <div style={{ maxWidth: 1040, margin: "0 auto", padding: "0 26px" }}>
      <div style={{
        position: "relative", borderRadius: 24, overflow: "hidden",
        background: "#111318", boxShadow: "0 32px 64px -28px rgba(17,19,24,.45)",
      }}>
        <video
          ref={ref}
          src="/demo/walk-in.mp4?v=3"
          poster="/demo/stills/01-hall.png"
          autoPlay
          muted
          loop
          playsInline
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          style={{ width: "100%", display: "block", aspectRatio: "16 / 9", objectFit: "cover", background: "#111318" }}
        />
        <div style={{
          position: "absolute", left: 0, right: 0, bottom: 0,
          padding: "16px 18px",
          background: "linear-gradient(180deg, transparent, rgba(17,19,24,.55))",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <button onClick={toggle} aria-label={playing ? "Pause" : "Play"} style={{
            width: 36, height: 36, borderRadius: "50%", border: "none",
            background: "#fff", color: k.ink, display: "inline-flex",
            alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
          }}>
            {playing ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" style={{ marginLeft: 2 }} />}
          </button>
          <Link to="/watch" style={{
            color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none",
            display: "inline-flex", alignItems: "center", gap: 6, marginLeft: "auto",
          }}>
            Product walk-through <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function PlanCards({ onChoose, go, cycle = "month" }) {
  const byId = Object.fromEntries(PLANS.map((p) => [p.id, p]));
  return (
    <div className="plans" style={{ display: "grid", gap: 12, alignItems: "stretch" }}>
      {PUBLIC_PLANS.map((p) => {
        const cost = planPrice(p, cycle);
        return (
        <div key={p.id} style={{
          border: `1px solid ${p.best ? k.coral : k.line}`,
          borderRadius: 16,
          padding: "28px 22px 24px",
          background: p.best ? k.coralDim : "#fff",
          color: k.ink,
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}>
          {p.best && (
            <div style={{ position: "absolute", top: 16, right: 16, fontFamily: typ, fontSize: 10, fontWeight: 700, letterSpacing: 1.2, color: k.coral }}>MOST USED</div>
          )}
          <div style={{ fontSize: 13, fontWeight: 600, color: k.mid, marginBottom: 18 }}>{p.name}</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
            <span style={{ fontFamily: dsp, fontSize: 32, fontWeight: 700, letterSpacing: -1.2, lineHeight: 1 }}>{cost.label}</span>
            <span style={{ fontSize: 13, color: k.mid }}>{cost.unit}</span>
          </div>
          {cost.billed ? <div style={{ fontSize: 12, color: k.faint, marginBottom: 8 }}>{cost.billed}</div> : null}
          <div style={{ fontSize: 13, color: k.ink2, marginBottom: 22, minHeight: 20 }}>{p.blurb}</div>
          <button onClick={() => (p.talk && go ? go("contact") : onChoose(p))} style={{ ...(p.best ? solid : outline), width: "100%", justifyContent: "center", padding: 11, marginBottom: 22 }}>{p.cta}</button>
          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 7 }}>
            {p.builds && (
              <div style={{ fontSize: 12.5, color: k.mid, marginBottom: 2 }}>
                {byId[p.builds]?.name}, plus
              </div>
            )}
            {(p.highlights || []).map((f) => (
              <div key={f} style={{ fontSize: 13.5, lineHeight: 1.4, color: k.ink }}>{f}</div>
            ))}
          </div>
        </div>
        );
      })}
    </div>
  );
}

function PlanTable() {
  // Rows that are false on every public plan are a wall of dashes — hide them.
  const rows = PLAN_ROWS.filter((row) => PUBLIC_PLANS.some((p) => row.get(p.limits, p) !== false));
  const pad = { padding: "14px 12px" };
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="plan-table" style={{ borderCollapse: "collapse", width: "100%", minWidth: 560 }}>
        <thead>
          <tr>
            <th style={{ ...pad, textAlign: "left", fontSize: 12, fontWeight: 500, color: k.faint, borderBottom: `1px solid ${k.line}` }} />
            {PUBLIC_PLANS.map((p) => (
              <th key={p.id} style={{
                ...pad,
                fontFamily: dsp,
                fontSize: 13,
                fontWeight: 600,
                color: p.best ? k.coral : k.ink,
                textAlign: "center",
                borderBottom: `1px solid ${p.best ? k.coral : k.line}`,
                background: p.best ? k.coralDim : "transparent",
                borderRadius: p.best ? "10px 10px 0 0" : 0,
              }}>{p.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.label}>
              <td style={{ ...pad, textAlign: "left", fontSize: 13.5, color: k.mid, borderBottom: i === rows.length - 1 ? "none" : `1px solid ${k.line}` }}>{row.label}</td>
              {PUBLIC_PLANS.map((p) => {
                const v = row.get(p.limits, p);
                const last = i === rows.length - 1;
                return (
                  <td key={p.id} style={{
                    ...pad,
                    textAlign: "center",
                    fontFamily: typ,
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: k.ink,
                    background: p.best ? k.coralDim : "transparent",
                    borderBottom: last ? "none" : `1px solid ${p.best ? "rgba(44,107,245,.16)" : k.line}`,
                    borderRadius: last && p.best ? "0 0 10px 10px" : 0,
                  }}>
                    {v === true ? <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: 99, background: k.coral }} />
                      : v === false ? ""
                      : v}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Home({ go, onLaunch }) {
  return (
    <>
      <div style={{ background: k.cream2, padding: "56px 0 0", boxSizing: "border-box", borderBottom: `1px solid ${k.line}` }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 26px 40px", textAlign: "center" }}>
          <h1 style={{ fontFamily: dsp, fontSize: "clamp(20px, 2.4vw, 24px)", lineHeight: 1.35, letterSpacing: -0.2, margin: "0 auto 10px", color: k.ink, fontWeight: 600, maxWidth: 480 }}>
            Walk-in hiring with a full candidate file, not a paper list.
          </h1>
          <p style={{ fontSize: 15, color: k.mid, lineHeight: 1.55, margin: "0 auto 28px", maxWidth: 500 }}>
            Candidates upload a resume and their details when they join. You run one queue on the day, and leave with digital copies ready to send to your ATS — not a register of who showed up.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <button onClick={() => onLaunch("employer")} style={solid}>Set up a walk-in <ArrowRight size={16} /></button>
            <Link to="/watch" style={{ ...outline, textDecoration: "none" }}><Play size={14} fill="currentColor" /> Watch a walk-in</Link>
          </div>
        </div>
        <div style={{ padding: "0 0 48px" }}>
          <SplitHero />
        </div>
      </div>

      <div style={{ background: k.cream2, padding: "72px 0 80px" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", padding: "0 26px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: k.mid, marginBottom: 16 }}>Who this is for</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }} className="g2">
            {[
              ["bpo", "BPO & customer support", "Voice and non-voice drives of a few hundred. One queue, so six recruiters are not working six lists."],
              ["retail", "Retail & delivery", "The same walk-in in every store. Head office sees today’s numbers, not last Monday’s spreadsheet."],
              ["campus", "Campus hiring", "A full batch through in one morning. Students get a time. The placement cell gets a report."],
              ["agency", "Staffing agencies", "Your hall, your name, your clients. They never see each other’s books."],
            ].map(([id, h, d]) => (
              <button key={id} onClick={() => go(`sol:${id}`)} className="quiet-tile" style={{
                background: "#fff", border: `1px solid ${k.line}`, borderRadius: R.card, padding: "26px 24px 22px",
                textAlign: "left", cursor: "pointer", fontFamily: bdy,
              }}>
                <div style={{ fontFamily: dsp, fontSize: 18, fontWeight: 650, letterSpacing: -0.3 }}>{h}</div>
                <div style={{ fontSize: 14.5, color: k.ink2, lineHeight: 1.55, marginTop: 8 }}>{d}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: k.coral, marginTop: 16 }}>See how it runs →</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: k.cream2, padding: "0 0 48px" }}>
        <CtaBand onLaunch={onLaunch} variant="home" flush />
      </div>
    </>
  );
}

const CTA_COPY = {
  home: { head: ["Set up tomorrow’s walk-in."], sub: "Registration, the queue, the rooms, and a candidate file you can send to your ATS — ready before people arrive.", btn: "Set up a walk-in" },
  products: { head: ["See the product on a real walk-in."], sub: "Check-in, the shared queue, interview rooms, resumes, and the ATS extract.", btn: "Start free" },
  about: { head: ["Talk to us about a walk-in"], sub: "Tell us the hall, the volume, and how you hand files to HR today.", btn: "Contact" },
  solution: { head: ["Set up your next walk-in"], sub: "You can be live in a few minutes. Candidates bring their own resume and details.", btn: "Set up a walk-in" },
};
export function CtaBand({ onLaunch, variant = "home", onContact, flush }) {
  const c = CTA_COPY[variant] || CTA_COPY.home;
  return (
    <div style={{ maxWidth: 1140, margin: flush ? "0 auto" : "70px auto 0", padding: "0 26px" }}>
      <div style={{ ...box, borderRadius: 20, padding: "48px 36px", textAlign: "center", background: "#fff" }}>
        <h2 style={{ fontFamily: dsp, fontSize: "clamp(26px,3.4vw,38px)", fontWeight: 600, letterSpacing: -1, margin: "0 0 10px", color: k.ink }}>
          {c.head[0]}{c.head[1] ? <b style={{ fontWeight: 700 }}>{c.head[1]}</b> : null}
        </h2>
        {c.sub ? <p style={{ fontSize: 16, color: k.mid, margin: "0 auto 26px", maxWidth: 400, lineHeight: 1.5 }}>{c.sub}</p> : <div style={{ height: 18 }} />}
        <button onClick={() => (variant === "about" && onContact ? onContact() : onLaunch("employer"))} style={solid}>{c.btn} <ArrowRight size={16} /></button>
      </div>
    </div>
  );
}

function LiveBoard() {
  const [n, setN] = useState({ waiting: 7, calling: 1, interviewing: 2, completed: 4 });
  useEffect(() => {
    const iv = setInterval(() => {
      setN((p) => {
        const move = Math.random();
        if (move < 0.4 && p.waiting > 0) return { ...p, waiting: p.waiting - 1, calling: p.calling + 1 };
        if (move < 0.65 && p.calling > 0) return { ...p, calling: Math.max(0, p.calling - 1), interviewing: p.interviewing + 1 };
        if (move < 0.9 && p.interviewing > 0) return { ...p, interviewing: Math.max(0, p.interviewing - 1), completed: p.completed + 1 };
        return { ...p, waiting: p.waiting + 2 };
      });
    }, 2000);
    return () => clearInterval(iv);
  }, []);
  const rows = [
    ["Waiting", n.waiting, k.mid],
    ["Calling", n.calling, k.coral],
    ["Interviewing", n.interviewing, "#5C7DE0"],
    ["Completed", n.completed, k.teal],
  ];
  const max = Math.max(1, ...rows.map((r) => r[1]));
  const [filled, setFilled] = useState(false);
  const [spot, setSpot] = useState(0);
  useEffect(() => { const t = setTimeout(() => setFilled(true), 120); return () => clearTimeout(t); }, []);
  useEffect(() => { const iv = setInterval(() => setSpot((s) => (s + 1) % rows.length), 1700); return () => clearInterval(iv); }, [rows.length]);

  return (
    <div style={{ ...box, padding: "26px 28px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: k.ink2 }}>What a drive looks like, minute to minute</span>
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: k.teal, fontFamily: typ, fontWeight: 600 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: k.coral, animation: "blink 1.6s infinite" }} />EXAMPLE
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
        {rows.map(([label, val, color], i) => (
          <div key={label} style={{
            display: "flex", alignItems: "center", gap: 14, padding: "6px 8px", marginLeft: -8, marginRight: -8, borderRadius: 8,
            background: spot === i ? k.cream2 : "transparent", transition: "background 0.5s ease",
          }}>
            <span style={{ fontSize: 13, color: k.ink2, width: 100, flexShrink: 0 }}>{label}</span>
            <div style={{ flex: 1, height: 8, background: k.cream2, borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: filled ? `${(val / max) * 100}%` : 0, background: color, borderRadius: 4, transition: `width 0.8s ease ${i * 0.08}s` }} />
            </div>
            <span style={{ fontFamily: typ, fontSize: 15, fontWeight: 700, color: k.ink, width: 24, textAlign: "right", flexShrink: 0 }}>{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --- About --- */
export function AboutPage({ go, onLaunch }) {
  const principles = [
    [ShieldCheck, "The waiting room stays private", "The wall shows a token and a masked name. Full name, phone, and resume stay with signed-in recruiters."],
    [FileText, "We keep what HR actually needs", "Name, phone, email, experience, LinkedIn, and the resume file. Aadhaar is optional, stored only as a one-way hash — never the number."],
    [HeartHandshake, "Built for walk-in days, not as another ATS", "We run the hall and hand you a file. Offers and joining stay in the system you already use."],
  ];
  return (
    <>
      <PageHero bottom={64}>
        <h1 style={{ ...heroH1, margin: "0 0 16px" }}>People should not wait all day without knowing when they will be seen.</h1>
        <p style={{ ...heroP, fontSize: 17, maxWidth: 480 }}>That is why TokenHire exists — and why Monday should start with files, not a paper register.</p>
      </PageHero>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "70px 26px 0" }}>
        <p style={{ fontSize: 18, color: k.ink, lineHeight: 1.7, margin: "0 0 18px", fontWeight: 500 }}>
          A thousand people can pass through a walk-in in a weekend. By Monday, most teams have a paper register and a guess.
        </p>
        <p style={{ fontSize: 16, color: k.ink2, lineHeight: 1.7, margin: 0 }}>
          Candidates register with a resume and their details. They scan the waiting-room screen to join one queue. At the end of the day you export the files to your ATS.
        </p>
      </div>

      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "60px 26px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }} className="g3">
          {principles.map(([I, t2, d]) => (
            <div key={t2}>
              <I size={22} color={k.coral} />
              <div style={{ fontFamily: dsp, fontSize: 18, fontWeight: 700, margin: "14px 0 8px" }}>{t2}</div>
              <div style={{ fontSize: 14.5, color: k.ink2, lineHeight: 1.65 }}>{d}</div>
            </div>
          ))}
        </div>
      </div>

      <CtaBand onLaunch={onLaunch} variant="about" onContact={() => go("contact")} />
    </>
  );
}

/* --- Services --- */
export function Services({ go, onLaunch }) {
  const blocks = [
    { h: "Candidates upload a resume and their details", d: "Name, phone, email, experience, and a PDF or Word file. Recruiters open the file from the queue — they do not collect printouts at the door.", art: <ArtReport /> },
    { h: "Scan the waiting-room screen to join", d: "One scan issues a token and puts them in line. No second code to type, no paper slip to lose.", art: <ArtCode /> },
    { h: "Every recruiter works from the same queue", d: "Call, pass, and room assignment happen on one list, so the same person is not called twice.", art: <ArtQueue /> },
    { h: "WhatsApp when they are about 15 minutes away", d: "One message: be near the waiting area. We do not spam them when they are called or decided.", art: <ArtNudge /> },
    { h: "The public screen hides full names", d: "The wall shows a token and a masked name. Phone, resume, and the real name stay with signed-in recruiters.", art: <ArtMasked /> },
    { h: "Export the full file to your ATS", d: "At close of day you send contact details, the resume, and round outcomes. Offers stay in your ATS. This is not a headcount of who attended.", art: <ArtPace /> },
  ];

  return (
    <>
      <PageHero bottom={64}>
        <h1 style={{ ...heroH1, margin: "0 0 14px" }}>The queue on the day. The candidate file on Monday.</h1>
        <p style={{ ...heroP, fontSize: 17, maxWidth: 500 }}>Registration, check-in, rooms, resumes, and an extract you can send to the ATS you already use.</p>
      </PageHero>

      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "70px 26px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }} className="g2">
          {blocks.map((b) => (
            <div key={b.h} style={{ background: "#fff", border: `1px solid ${k.line}`, borderRadius: 22, padding: 30, display: "flex", flexDirection: "column" }}>
              <h3 style={{ fontFamily: dsp, fontSize: 21, fontWeight: 700, letterSpacing: -0.5, margin: "0 0 10px" }}>{b.h}</h3>
              <p style={{ fontSize: 14.5, color: k.ink2, lineHeight: 1.7, margin: "0 0 24px", flex: 1 }}>{b.d}</p>
              <div style={{ background: k.cream2, borderRadius: 16, padding: 24, display: "flex", justifyContent: "center" }}>{b.art}</div>
            </div>
          ))}
        </div>
      </div>

      <CtaBand onLaunch={onLaunch} variant="products" />
    </>
  );
}

/* --- small illustrative mockups for the Services page, built from our own UI language --- */
function ArtFrame({ children }) {
  return <div style={{ background: "#fff", borderRadius: 16, padding: 22, width: "100%", maxWidth: 340, boxShadow: "0 10px 26px -18px rgba(11,16,32,.28)" }}>{children}</div>;
}
function ArtCode() {
  return (
    <ArtFrame>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 92, height: 92, borderRadius: 12, background: k.cream2, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
          <QrCode size={48} color={k.ink} />
        </div>
        <div style={{ fontFamily: typ, fontSize: 10.5, color: k.coral, fontWeight: 700, letterSpacing: 1 }}>ON THE WAITING-ROOM SCREEN</div>
        <div style={{ fontFamily: typ, fontSize: 10.5, color: k.mid, marginTop: 6 }}>REFRESHES IN 45s</div>
      </div>
    </ArtFrame>
  );
}
function ArtSlip() {
  return (
    <ArtFrame>
      <div style={{ background: k.ink, color: k.cream, padding: "6px 12px", fontFamily: typ, fontSize: 9.5, letterSpacing: 1.2, borderRadius: "6px 6px 0 0", margin: "-22px -22px 16px" }}>ADMISSION SLIP</div>
      <div style={{ marginBottom: 14 }}>
        <TokenChip token="W-014" name="Priya Nair" size={48} />
      </div>
      <div style={{ display: "flex", gap: 20, paddingTop: 10, borderTop: `1px solid ${k.line}` }}>
        <div><div style={{ fontSize: 10.5, color: k.mid }}>Position</div><div style={{ fontFamily: typ, fontWeight: 700, fontSize: 14 }}>4</div></div>
        <div><div style={{ fontSize: 10.5, color: k.mid }}>Roughly</div><div style={{ fontFamily: typ, fontWeight: 700, fontSize: 14 }}>28 min</div></div>
      </div>
    </ArtFrame>
  );
}
function ArtQueue() {
  const rows = [["W-011", "Lakshmi Prasad", "Being called", k.coral], ["W-012", "Sandeep Kumar", "Waiting", k.mid], ["W-013", "Meera Joshi", "Waiting", k.mid]];
  return (
    <ArtFrame>
      <div style={{ fontSize: 10.5, color: k.mid, fontWeight: 700, letterSpacing: .6, marginBottom: 10, textTransform: "uppercase" }}>Live queue</div>
      {rows.map(([tok, name, st, c], i) => (
        <div key={tok} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "9px 0", borderTop: i ? `1px solid ${k.line}` : "none" }}>
          <TokenChip token={tok} name={name} size={32} pulse={st === "Being called"} />
          <span style={{ fontSize: 11.5, fontWeight: 700, color: c, whiteSpace: "nowrap" }}>{st}</span>
        </div>
      ))}
    </ArtFrame>
  );
}
function ArtMasked() {
  return (
    <ArtFrame>
      <div style={{ fontSize: 10.5, color: k.mid, fontWeight: 700, letterSpacing: .6, marginBottom: 10, textTransform: "uppercase" }}>Waiting screen</div>
      {[["W-014", "R···l"], ["W-015", "P···a"], ["W-016", "M···d"]].map(([tok, nm], i) => (
        <div key={tok} style={{ display: "flex", alignItems: "center", padding: "9px 0", borderTop: i ? `1px solid ${k.line}` : "none" }}>
          <TokenChip token={tok} name={nm} size={28} muted />
        </div>
      ))}
    </ArtFrame>
  );
}
function ArtNudge() {
  return (
    <ArtFrame>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <div style={{ width: 26, height: 26, borderRadius: "50%", background: k.tealDim, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Send size={12} color={k.teal} />
        </div>
        <div style={{ background: k.cream2, borderRadius: 10, padding: "10px 13px", fontSize: 12.5, color: k.ink2, lineHeight: 1.5 }}>
          Hi Rahul, you're up in about 15 minutes — number W-014. Please be near the waiting area.
        </div>
      </div>
      <div style={{ textAlign: "right", fontSize: 10.5, color: k.faint, marginTop: 8 }}>WhatsApp · now</div>
    </ArtFrame>
  );
}
function ArtPace() {
  const rows = [["Waiting", 68, k.faint], ["Interviewing", 40, k.coral], ["Selected", 22, k.teal]];
  return (
    <ArtFrame>
      {rows.map(([l, pct, c], i) => (
        <div key={l} style={{ marginBottom: i < rows.length - 1 ? 14 : 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}><span style={{ color: k.ink2 }}>{l}</span></div>
          <div style={{ height: 6, background: k.cream2, borderRadius: 3, overflow: "hidden" }}><div style={{ height: "100%", width: `${pct}%`, background: c, borderRadius: 3 }} /></div>
        </div>
      ))}
    </ArtFrame>
  );
}
function ArtReport() {
  const rows = [
    ["Phone", "98480 11223"],
    ["Email", "priya.nair@email.com"],
    ["Experience", "1–3 years"],
    ["Resume", "priya_nair_cv.pdf"],
  ];
  return (
    <ArtFrame>
      <div style={{ marginBottom: 12 }}><TokenChip token="014" name="Priya Nair" size={36} /></div>
      {rows.map(([l, v]) => (
        <div key={l} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "7px 0", borderTop: `1px solid ${k.line}`, fontSize: 12.5 }}>
          <span style={{ color: k.mid }}>{l}</span>
          <span style={{ fontWeight: 600, color: k.ink }}>{v}</span>
        </div>
      ))}
    </ArtFrame>
  );
}

/* --- Solutions: a real page per industry --- */
const SOLUTIONS = {
  bpo: {
    eyebrow: "BPO & customer support",
    head: ["Five hundred walk-ins, ", "one shared queue."],
    sub: "Voice and non-voice drives run at volumes nothing else in hiring touches. The bottleneck is not sourcing — it is the four hours between arriving and being seen, and the empty file on Monday.",
    pains: [
      ["The room holds 80. The queue is 400.", "Nobody knows who is next, so nobody leaves."],
      ["Six recruiters, six lists.", "The same name gets called twice, or never."],
      ["Monday has a register, not a file.", "Each candidate already uploaded a resume and details. You export that to your ATS, with round outcomes."],
    ],
    stat: ["500+", "candidates in a single day's drive"],
  },
  retail: {
    eyebrow: "Retail & delivery",
    head: ["The same walk-in ", "in every store."],
    sub: "Every store keeps its own notebook. Head office finds out a week later, and the resumes never leave the shop floor.",
    pains: [
      ["Every store does it differently.", "One registration flow. Numbers you can actually compare."],
      ["Head office is flying blind.", "Live counts today — not a spreadsheet next Monday."],
      ["Walk-ins clash with the shop floor.", "They wait outside and get one WhatsApp when it is nearly their turn."],
    ],
    stat: ["40+", "store drives running the same week"],
  },
  campus: {
    eyebrow: "Campus hiring",
    head: ["A full campus batch, ", "through in one morning."],
    sub: "Three hundred students. Eight minutes each. The maths never works if the placement cell is still the queue.",
    pains: [
      ["Everyone arrives at 9am.", "Students register in advance with a resume. They get a place in line, not a scrum at the door."],
      ["The placement cell is the queue.", "Two coordinators. Three hundred students. One list."],
      ["No record for the college.", "A report with names, files, and outcomes — not a headcount."],
    ],
    stat: ["300", "students, one morning, one queue"],
  },
  agency: {
    eyebrow: "Staffing agencies",
    head: ["You hire for the client. ", "The hall and the files stay yours."],
    sub: "Candidates join your walk-in, under your name. Rival agencies never see your books — or the resumes.",
    pains: [
      ["Your space. Not a shared list.", "Only your drives. Clients are tags, not extra logins."],
      ["The hall shows your name.", "Your mark on every screen. The client is a label on the extract."],
      ["One login. Many halls.", "Tag the drive. The candidate files and ATS extract follow that tag."],
    ],
    stat: ["1", "agency login, many clients and cities"],
  },
};

export function SolutionPage({ id, go, onLaunch }) {
  const s = SOLUTIONS[id];
  if (!s) return null;
  return (
    <>
      <PageHero maxWidth={860} bottom={68}>
        <div style={{ fontSize: 13, color: k.coral, fontWeight: 600, marginBottom: 14 }}>{s.eyebrow}</div>
        <h1 style={{ ...heroH1, fontSize: "clamp(34px,5vw,56px)", margin: "0 0 16px" }}>
          {s.head[0]}<b style={{ fontWeight: 700 }}>{s.head[1]}</b>
        </h1>
        <p style={{ ...heroP, fontSize: 17, maxWidth: 440, margin: "0 auto 28px" }}>{s.sub}</p>
        <button onClick={() => onLaunch("employer")} style={solid}>Set up a walk-in <ArrowRight size={16} /></button>
      </PageHero>

      <div style={{ maxWidth: 1140, margin: "-38px auto 0", padding: "0 26px" }}>
        <div style={{ background: "#fff", border: `1px solid ${k.line}`, borderRadius: 26, padding: "34px 40px", boxShadow: "0 30px 60px -40px rgba(11,16,32,.25)", textAlign: "center" }}>
          <span style={{ fontFamily: dsp, fontSize: 42, fontWeight: 800, color: k.coral, letterSpacing: -1.5 }}>{s.stat[0]}</span>
          <span style={{ fontSize: 16, color: k.ink2, marginLeft: 14 }}>{s.stat[1]}</span>
        </div>
      </div>

      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "64px 26px 0" }}>
        <h2 style={{ fontFamily: dsp, fontSize: "clamp(26px,3.6vw,38px)", fontWeight: 600, letterSpacing: -1, margin: "0 0 40px", textAlign: "center" }}>What goes wrong</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {s.pains.map(([h, d], i) => (
            <div key={h} style={{ display: "grid", gridTemplateColumns: "56px 1fr", gap: 22, background: k.cream2, borderRadius: R.card, padding: "28px 32px" }}>
              <div style={{ fontFamily: dsp, fontSize: 26, fontWeight: 800, color: k.coral, opacity: .55 }}>{String(i + 1).padStart(2, "0")}</div>
              <div>
                <div style={{ fontFamily: dsp, fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{h}</div>
                <div style={{ fontSize: 15, color: k.ink2, lineHeight: 1.7 }}>{d}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 34 }}>
          <button onClick={() => go("services")} style={outline}>See the full product <ArrowRight size={15} /></button>
        </div>
      </div>

      <CtaBand onLaunch={onLaunch} variant="solution" />
    </>
  );
}

/* --- Upcoming drives (public) --- */
export function PublicDrives({ drives, onLaunch }) {
  const listed = drives.filter((d) => d.visibility !== "private");
  const [city, setCity] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState("All");
  const [role, setRole] = useState("All roles");
  const [exp, setExp] = useState("");
  const [openId, setOpenId] = useState(null);
  const roles = ["All roles", ...Array.from(new Set(listed.map((d) => d.role))).sort((a, b) => a.localeCompare(b))];
  const companies = Array.from(new Set(listed.map((d) => listingHost(d)).filter(Boolean))).sort((a, b) => a.localeCompare(b));

  const visible = listed
    .filter((d) => d.status !== "closed")
    .filter((d) => !city || d.city === city)
    .filter((d) => !company || listingHost(d) === company)
    .filter((d) => status === "All" || d.status === status)
    .filter((d) => role === "All roles" || d.role === role)
    .filter((d) => !exp || !(d.expNeeded || []).length || d.expNeeded.includes(exp))
    .sort((a, b) => {
      const byCo = listingHost(a).localeCompare(listingHost(b));
      return byCo || a.date.localeCompare(b.date);
    });

  const liveCount = listed.filter((d) => d.status === "live").length;
  const upcomingCount = listed.filter((d) => d.status === "upcoming").length;

  return (
    <>
      <div style={{ background: k.cream2, borderBottom: `1px solid ${k.line}` }}>
        <div style={{ maxWidth: 780, margin: "0 auto", padding: "56px 26px 36px", textAlign: "center" }}>
          <h1 style={{ ...heroH1, fontSize: "clamp(34px,4.8vw,54px)" }}>Walk-in drives you can join</h1>
          <p style={{ ...heroP, margin: "0 auto 26px", maxWidth: 480 }}>Register with your details and resume, then scan the waiting-room screen when you arrive. You have to be there to join the queue.</p>
          <button onClick={() => onLaunch("candidate")} style={solid}>Check in as a candidate <ArrowRight size={16} /></button>
        </div>
        <div style={{ maxWidth: 1140, margin: "0 auto", padding: "0 26px 46px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }} className="g3">
            <QuickStat n={liveCount} label="drives open today" />
            <QuickStat n={upcomingCount} label="drives coming up" />
            <QuickStat n={new Set(listed.map((d) => d.city).filter(Boolean)).size} label="cities represented" />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "50px 26px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 34 }} className="g2">
          <div>
            <div style={{ marginBottom: 26 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: k.faint, letterSpacing: .6, textTransform: "uppercase", marginBottom: 8 }}>City</div>
              <CitySelect value={city} onChange={setCity} allowAll />
            </div>
            <div style={{ marginBottom: 26 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: k.faint, letterSpacing: .6, textTransform: "uppercase", marginBottom: 8 }}>Company</div>
              <Select
                value={company}
                onChange={setCompany}
                searchable
                placeholder="All companies"
                aria-label="Filter by company"
                options={[{ value: "", label: "All companies" }, ...companies.map((c) => ({ value: c, label: c }))]}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 26 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: k.faint, letterSpacing: .6, textTransform: "uppercase", marginBottom: 8 }}>Status</div>
              {["All", "live", "upcoming"].map((s) => (
                <button key={s} onClick={() => setStatus(s)} style={{
                  textAlign: "left", padding: "10px 14px", borderRadius: R.pill, border: "none", cursor: "pointer", fontFamily: bdy, fontSize: 14,
                  background: status === s ? k.coralDim : "transparent", color: status === s ? k.coral : k.ink2, fontWeight: status === s ? 600 : 500,
                }}>{s === "All" ? "All" : s === "live" ? "Open today" : "Upcoming"}</button>
              ))}
            </div>
            <div style={{ marginBottom: 26 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: k.faint, letterSpacing: .6, textTransform: "uppercase", marginBottom: 8 }}>Experience</div>
              <Select
                value={exp}
                onChange={setExp}
                placeholder="All levels"
                options={[{ value: "", label: "All levels" }, ...EXP_BANDS.map((b) => ({ value: b, label: b }))]}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: k.faint, letterSpacing: .6, textTransform: "uppercase", marginBottom: 8 }}>Role</div>
              <Select
                value={role}
                onChange={setRole}
                options={roles.map((r) => ({ value: r, label: r }))}
                style={{ fontSize: 13.5 }}
              />
            </div>
          </div>

          <div>
            {!visible.length ? <Blank text="No walk-ins match that filter right now." /> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {visible.map((d) => {
                  const open = openId === d.id;
                  return (
                  <div key={d.id} style={{ background: "#fff", border: `1px solid ${k.line}`, borderRadius: R.card, padding: "22px 26px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }} className="driverow2">
                    <div style={{ flex: 1, minWidth: 220 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <div style={{ fontFamily: dsp, fontWeight: 700, fontSize: 18 }}>{d.role}</div>
                        <StatusPill status={d.status} />
                      </div>
                      <div style={{ fontSize: 14, color: k.mid }}>{listingHost(d)} · {listingPlace(d)}</div>
                      <div style={{ display: "flex", gap: 14, marginTop: 10, fontSize: 12.5, color: k.ink2, flexWrap: "wrap" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}><ListChecks size={13} color={k.faint} />{(d.rounds || DEFAULT_ROUNDS).length} rounds</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Users2 size={13} color={k.faint} />{d.candidates.length} checked in so far</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: d.status === "live" ? k.coral : k.gold, marginBottom: 4 }}>{d.status === "live" ? "Open today" : fmtDate(d.date)}</div>
                      <div style={{ fontSize: 12, color: k.ink2, fontWeight: 600 }}>{expLabel(d.expNeeded)}</div>
                      <button onClick={() => setOpenId(open ? null : d.id)} style={{ ...textLink, marginTop: 8, display: "inline-flex", alignItems: "center", gap: 4 }}>
                        {open ? "Hide details" : "Job details"} <ChevronDown size={14} style={{ transform: open ? "rotate(180deg)" : "none" }} />
                      </button>
                    </div>
                    </div>
                    {open && <DrivePosting d={d} />}
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function expLabel(bands) {
  if (!bands || !bands.length) return "All experience levels";
  return bands.join(" · ");
}
function DrivePosting({ d, flush }) {
  const docs = d.docs || [];
  return (
    <div style={{ marginTop: flush ? 0 : 18, paddingTop: flush ? 0 : 18, borderTop: flush ? "none" : `1px solid ${k.line}`, display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 22 }} className="g2">
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: k.faint, letterSpacing: .7, textTransform: "uppercase", marginBottom: 8 }}>Job description</div>
        <p style={{ fontSize: 14, color: k.ink2, lineHeight: 1.65, margin: 0 }}>{d.jd || "The recruiter hasn't added a description yet."}</p>
        <div style={{ fontSize: 11, fontWeight: 700, color: k.faint, letterSpacing: .7, textTransform: "uppercase", margin: "16px 0 8px" }}>Experience needed</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(d.expNeeded && d.expNeeded.length ? d.expNeeded : ["All levels"]).map((b) => <Pill key={b} tone="coral">{b}</Pill>)}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: k.faint, letterSpacing: .7, textTransform: "uppercase", marginBottom: 8 }}>Bring these documents</div>
        {docs.length ? docs.map((doc) => (
          <div key={doc} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13.5, color: k.ink2, marginBottom: 8 }}>
            <Check size={14} color={k.teal} style={{ flexShrink: 0, marginTop: 3 }} />{doc}
          </div>
        )) : <div style={{ fontSize: 13.5, color: k.mid }}>No document list posted — carry a resume and ID to be safe.</div>}
      </div>
    </div>
  );
}
function QuickStat({ n, label }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${k.line}`, borderRadius: R.card, padding: "20px 22px", textAlign: "center" }}>
      <div style={{ fontFamily: dsp, fontSize: 34, fontWeight: 700, color: k.ink, letterSpacing: -1 }}>{n}</div>
      <div style={{ fontSize: 13, color: k.mid, marginTop: 4 }}>{label}</div>
    </div>
  );
}

/* --- Pricing --- */
export function PricingPage({ onLaunch, go }) {
  const [cycle, setCycle] = useState("month");
  return (
    <>
      <PageHero>
        <h1 style={heroH1}>A plan for the hall.</h1>
        <p style={{ ...heroP, margin: "0 auto 22px" }}>
          You pay for seats and halls — not a pile of unused tokens. GST extra.
        </p>
        <div style={{ display: "inline-flex", padding: 4, borderRadius: 999, background: "#fff", border: `1px solid ${k.line}`, gap: 4 }}>
          {[["month", "Monthly"], ["year", "Yearly · 2 months free"]].map(([id, lab]) => (
            <button key={id} type="button" onClick={() => setCycle(id)} style={{
              border: "none", borderRadius: 999, padding: "8px 16px", cursor: "pointer", fontFamily: bdy, fontSize: 13.5, fontWeight: 600,
              background: cycle === id ? k.ink : "transparent", color: cycle === id ? "#fff" : k.mid,
            }}>{lab}</button>
          ))}
        </div>
      </PageHero>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "48px 26px 0" }}>
        <PlanCards onChoose={() => onLaunch("employer")} go={go} cycle={cycle} />
      </div>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "56px 26px 0" }}>
        <PlanTable />
      </div>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "36px 26px 80px", textAlign: "center" }}>
        <button type="button" onClick={() => go("contact")} style={{ ...textLink, fontSize: 14 }}>
          Need more halls or SSO? Talk to us
        </button>
      </div>
    </>
  );
}

/* --- Contact --- */
const LEGAL = {
  privacy: {
    title: "Privacy Policy",
    updated: "Last updated: August 2026",
    sections: [
      ["What we collect", "From candidates: name, phone number, email, experience level, LinkedIn URL, and resume file. Aadhaar is optional and used only to stop the same person re-registering to a drive under a different phone number — we run it through a one-way cryptographic hash before it ever reaches our database, so the number itself is never stored, only the last 4 digits and the hash. From hosts: work email, company name, and the drives they create."],
      ["Why we collect it", "To run the walk-in queue you signed up for: issuing your token, estimating your wait, letting a recruiter see your profile, and sending one WhatsApp nudge about 15 minutes before your turn. We do not text you when you are called, selected, or rejected — that status lives on your phone in the app."],
      ["Who can see it", "Only recruiters signed in to the specific drive you joined. On the public waiting-room screen, everyone else sees a token and a masked name — never your phone number, resume, or full name."],
      ["How long we keep it", "Candidate profiles stay in your account so you can join future drives without re-entering everything. You can ask us to delete your data at any time by writing to hello@tokenhire.app."],
      ["Where it's stored", "Resumes and identity-verification results are stored encrypted. Every resume download by a recruiter is logged."],
      ["Your rights", "Under India's Digital Personal Data Protection Act, you can request a copy of your data, ask us to correct it, or ask us to delete it. Write to hello@tokenhire.app and we'll respond within a reasonable time."],
    ],
  },
  terms: {
    title: "Terms of Use",
    updated: "Last updated: August 2026",
    sections: [
      ["What TokenHire is", "A queue and check-in system for walk-in hiring drives. We are not a staffing agency, a recruiter, or a party to any employment decision — we provide the software; the hiring company makes the calls."],
      ["Accounts", "A company account belongs to the business that creates it. Anyone invited to that account can see and manage every drive under it. It's the company's responsibility to manage who has access."],
      ["Candidate use", "Creating a candidate profile is free and always will be. You're responsible for the accuracy of what you submit — a false experience claim or fabricated verification status can get an application rejected by the hiring company, not by us."],
      ["Fair use of check-in codes", "Joining a queue requires the live code shown on the waiting-room screen, which refreshes every 45 seconds, or a one-time pass issued by front desk. HOST codes are for recruiters only. Sharing or forwarding a check-in code so that someone who is not at the venue can join the queue is a violation of these terms and may result in account suspension."],
      ["No guarantee of hiring outcomes", "TokenHire manages the queue and the record-keeping. We don't guarantee interviews, offers, or job placement — those decisions rest entirely with the hiring company running the drive."],
      ["Changes", "We may update these terms as the product changes. Material changes will be reflected here with an updated date."],
    ],
  },
};

export function LegalPage({ kind }) {
  if (kind === "all") {
    return (
      <div>
        <LegalPage kind="privacy" />
        <div style={{ height: 1, background: k.line, maxWidth: 720, margin: "0 auto" }} />
        <LegalPage kind="terms" />
      </div>
    );
  }
  const l = LEGAL[kind];
  if (!l) return null;
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 26px 80px" }}>
      <div style={{ fontSize: 15, color: k.coral, fontWeight: 500, marginBottom: 10 }}>{l.updated}</div>
      <h1 style={{ fontFamily: dsp, fontSize: "clamp(28px,4vw,40px)", fontWeight: 700, letterSpacing: -1, margin: "0 0 36px" }}>{l.title}</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
        {l.sections.map(([h, d]) => (
          <div key={h}>
            <div style={{ fontFamily: dsp, fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{h}</div>
            <div style={{ fontSize: 15, color: k.ink2, lineHeight: 1.75 }}>{d}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 40, padding: "16px 20px", background: k.cream2, borderRadius: 12, fontSize: 12.5, color: k.mid, lineHeight: 1.6 }}>
        This is a plain-language summary, not a substitute for legal advice. Questions about either document — write to hello@tokenhire.app.
      </div>
    </div>
  );
}

export function Contact() {
  const [f, setF] = useState({ role: "company", name: "", email: "", org: "", city: "", msg: "" });
  const [sent, setSent] = useState(false);
  const roleCopy = {
    company: { org: "Company name", msgPh: "Tell us about your walk-in drives — roles, volume, cities…" },
    agency: { org: "Agency name", msgPh: "Tell us how many client companies you run drives for…" },
    candidate: { org: "Which company's drive?", msgPh: "What's the issue — a code not working, a status question…" },
    other: { org: "Organization (optional)", msgPh: "What can we help with?" },
  };
  const rc = roleCopy[f.role];
  return (
    <div style={{ maxWidth: 1040, margin: "0 auto", padding: "54px 26px 70px" }}>
      <div style={{ fontSize: 15, color: k.coral, fontWeight: 500, marginBottom: 16 }}>Contact</div>
      <h1 style={{ fontFamily: dsp, fontSize: "clamp(32px,4.4vw,48px)", fontWeight: 400, letterSpacing: -1.4, margin: "0 0 36px", lineHeight: 1.1 }}>
        Talk to us about a <b style={{ fontWeight: 800 }}>pilot</b>
      </h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 40 }} className="g2">
        <div>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 20 }}><Mail size={17} color={k.teal} style={{ marginTop: 2 }} /><div><div style={{ fontSize: 13, fontWeight: 600 }}>Email</div><div style={{ fontSize: 13.5, color: k.mid, fontFamily: typ }}>hello@tokenhire.app</div></div></div>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 20 }}><Phone size={17} color={k.teal} style={{ marginTop: 2 }} /><div><div style={{ fontSize: 13, fontWeight: 600 }}>Phone</div><div style={{ fontSize: 13.5, color: k.mid, fontFamily: typ }}>+91 90000 00000</div></div></div>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}><MapPin size={17} color={k.teal} style={{ marginTop: 2 }} /><div><div style={{ fontSize: 13, fontWeight: 600 }}>Based in</div><div style={{ fontSize: 13.5, color: k.mid }}>Hyderabad, India</div></div></div>
        </div>
        <div style={{ ...box, padding: 26 }}>
          {sent ? (
            <div><BadgeCheck size={22} color={k.teal} /><div style={{ fontFamily: dsp, fontSize: 16, fontWeight: 700, margin: "10px 0 5px" }}>Message received</div><div style={{ fontSize: 13.5, color: k.ink2 }}>We'll get back to you shortly.</div></div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); if (!f.name.trim() || !f.email.trim()) return; setSent(true); }} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              <Field label="I am a…">
                <Select
                  value={f.role}
                  onChange={(role) => setF({ ...f, role })}
                  options={[
                    { value: "company", label: "Company looking to hire" },
                    { value: "agency", label: "Staffing / recruitment agency" },
                    { value: "candidate", label: "Candidate" },
                    { value: "other", label: "Something else" },
                  ]}
                />
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="g2">
                <Field label="Name"><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} style={input} /></Field>
                <Field label="Email"><input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} style={input} /></Field>
              </div>
              <Field label={rc.org + (f.role !== "candidate" ? " (optional)" : "")}>
                <input value={f.org} onChange={(e) => setF({ ...f, org: e.target.value })} style={input} />
              </Field>
              <Field label="City">
                <CitySelect value={f.city || ""} onChange={(city) => setF({ ...f, city })} allowAll={false} placeholder="Select a city" />
              </Field>
              <Field label="Message"><textarea value={f.msg} onChange={(e) => setF({ ...f, msg: e.target.value })} rows={4} placeholder={rc.msgPh} style={{ ...input, resize: "vertical", fontFamily: bdy }} /></Field>
              <button type="submit" style={{ ...solid, justifyContent: "center", padding: 11, marginTop: 4 }}>Send</button>
              <div style={{ fontSize: 11.5, color: k.faint, lineHeight: 1.5 }}>Or write hello@tokenhire.app</div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function PageEnd() { return null; } // no longer used — nav already carries the primary CTA on every page
