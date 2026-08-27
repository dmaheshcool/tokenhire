import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, Mail, Linkedin, Phone, ChevronDown, Menu, X, Play, Pause, RotateCcw, Maximize2, Minimize2, Search, MapPin, Users2, QrCode, Check, ListChecks } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts";
import { bdy, dsp, typ, k, R, solid, solidSm, outline, outlineSm, iconBtn, navBtn, chromeStrip, chromeBox, box, input, ghostSm, textLink } from "../../theme.js";
import { HallBrand, OrgLogo, TokenChip, TokenMark, Wordmark } from "../../components/brand.jsx";
import { pc, PUBLIC_PLANS, listingHost, listingPlace, EXP_BANDS, DEFAULT_ROUNDS } from "../../lib/helpers.js";
import { Pill, fmtDate, CitySelect, Blank, StatusPill } from "../../components/ui.jsx";

export const PAGES = [["home", "Home"], ["services", "Products"], ["drives", "Upcoming walk-ins"], ["about", "About us"], ["contact", "Contact us"]];

export const NAV = [
  { id: "home", label: "Home" },
  {
    label: "Solutions", menu: [
      ["sol:bpo", "BPO & customer support", "500-a-day drives without the shouting"],
      ["sol:retail", "Retail & delivery", "Store-by-store hiring, one dashboard"],
      ["sol:campus", "Campus hiring", "A whole batch through in one morning"],
      ["sol:agency", "Staffing agencies", "Your hall. Their clients."],
    ],
  },
  { id: "pricing", label: "Pricing" },
  { id: "drives", label: "Upcoming walk-ins" },
  { id: "about", label: "About us" },
];

export function SiteNav({ page, go, onLaunch }) {
  const [open, setOpen] = useState(null);
  const [menu, setMenu] = useState(false);
  const navigate = (t) => { setOpen(null); setMenu(false); go(t); };
  useEffect(() => {
    const close = () => setOpen(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);
  return (
    <div className="chrome-wrap" style={{ position: "sticky", top: 0, zIndex: 50, ...chromeStrip, padding: "10px 16px 12px" }}>
      <div className="chrome-inner" style={{ maxWidth: 1140, margin: "0 auto", ...chromeBox, padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <button onClick={() => navigate("home")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, marginRight: 4 }}><Wordmark size={20} /></button>
        <button className="nav-burger" type="button" aria-label="Menu" onClick={() => setMenu((m) => !m)} style={{ ...iconBtn, padding: 8, display: "none", alignItems: "center" }}>
          {menu ? <X size={22} /> : <Menu size={22} />}
        </button>
        <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: 26, flexWrap: "wrap" }}>
          {NAV.map((n, i) => n.menu ? (
            <div key={i} style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                onMouseEnter={() => setOpen(i)}
                style={{ ...navBtn, color: open === i ? k.ink : k.ink2, display: "flex", alignItems: "center", gap: 5 }}>
                {n.label} <ChevronDown size={15} style={{ transform: open === i ? "rotate(180deg)" : "none", transition: "transform .18s" }} />
              </button>
              {open === i && (
                <div
                  onMouseLeave={() => setOpen(null)}
                  style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", paddingTop: 12, zIndex: 60 }}>
                  <div style={{ background: "#fff", border: `1px solid ${k.line}`, borderRadius: R.card, boxShadow: "0 22px 50px -20px rgba(11,16,32,.22)", padding: 10, width: 310 }}>
                    {n.menu.map(([target, label, desc]) => (
                      <button key={label} onClick={() => navigate(target)} style={{
                        display: "block", width: "100%", textAlign: "left", background: "none", border: "none",
                        cursor: "pointer", padding: "11px 13px", borderRadius: 12, fontFamily: bdy,
                      }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = k.cream2)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}>
                        <div style={{ fontSize: 14.5, fontWeight: 600, color: k.ink }}>{label}</div>
                        <div style={{ fontSize: 12.5, color: k.mid, marginTop: 3 }}>{desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button key={n.id} className="navitem" onClick={() => navigate(n.id)} style={{ ...navBtn, color: page === n.id ? k.ink : k.ink2, fontWeight: page === n.id ? 600 : 500 }}>{n.label}</button>
          ))}
        </div>
        <div className="nav-ctas" style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <button onClick={() => navigate("login")} style={{ ...textLink, textDecoration: "none" }}>Sign in</button>
          <button onClick={() => onLaunch("employer")} style={solidSm}>I'm hiring <ArrowRight size={15} /></button>
          <button onClick={() => onLaunch("candidate")} style={outlineSm}>Joining a walk-in?</button>
        </div>
      </div>
      {menu && (
        <div style={{ background: "#fff", borderBottom: `1px solid ${k.line}`, padding: "8px 16px 18px" }}>
          {NAV.flatMap((n) => n.menu ? n.menu.map(([target, label]) => [target, label]) : [[n.id, n.label]]).map(([id, label]) => (
            <button key={label} type="button" onClick={() => navigate(id)} style={{ display: "block", width: "100%", textAlign: "left", padding: "14px 4px", border: "none", background: "none", borderBottom: `1px solid ${k.line}`, fontFamily: bdy, fontSize: 16, fontWeight: 600, color: k.ink, cursor: "pointer" }}>{label}</button>
          ))}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
            <button onClick={() => { setMenu(false); onLaunch("employer"); }} style={{ ...solid, justifyContent: "center", width: "100%" }}>I'm hiring</button>
            <button onClick={() => { setMenu(false); onLaunch("candidate"); }} style={{ ...outline, justifyContent: "center", width: "100%" }}>Joining a walk-in?</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function SiteFooter({ go, onLaunch }) {
  const cols = [
    ["Company", [["home", "Home"], ["services", "Products"], ["about", "About us"], ["contact", "Contact us"]]],
    ["Solutions", [["services", "Walk-in drives"], ["services", "Campus hiring"], ["drives", "Staffing agencies"], ["pricing", "Pricing"]]],
    ["Resources", [["demo", "Watch a walk-in"], ["drives", "Upcoming walk-ins"], ["login", "Sign in"], ["status", "Server status"], ["contact", "Contact us"], ["privacy", "Privacy"], ["terms", "Terms of use"]]],
  ];
  return (
    <footer style={{ background: "#fff", borderTop: `1px solid ${k.line}`, marginTop: 60 }}>
      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "56px 26px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr) 1.1fr", gap: 30 }} className="g3">
          {cols.map(([title, links]) => (
            <div key={title}>
              <div style={{ fontFamily: dsp, fontSize: 17, fontWeight: 700, marginBottom: 16 }}>{title}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {links.map(([target, label], i) => (
                  <button key={i} onClick={() => go(target)} style={{ background: "none", border: "none", color: k.ink2, fontSize: 14.5, cursor: "pointer", fontFamily: bdy, padding: 0, textAlign: "left" }}>{label}</button>
                ))}
              </div>
            </div>
          ))}
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              {[Linkedin, Mail, Phone].map((I, i) => (
                <div key={i} style={{ width: 38, height: 38, borderRadius: "50%", background: k.ink, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <I size={17} color="#fff" />
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

/* --- Cinematic walk-in story demo (in-product, not an MP4) --- */
const STORY_SCENES = [
  { id: "title", ms: 2400, kicker: "TokenHire", line: "A walk-in." },
  { id: "chaos", ms: 3000, kicker: "8:47am", line: "The usual." },
  { id: "gate", ms: 3600, kicker: "Gate", line: "Printed. It never rotates." },
  { id: "prove", ms: 3800, kicker: "Waiting room", line: "DESK on the TV. Forty-five seconds." },
  { id: "checkin", ms: 3400, kicker: "Checked in", line: "014 · Priya Nair" },
  { id: "nudge", ms: 3400, kicker: "WhatsApp", line: "Once. Fifteen minutes out." },
  { id: "floor", ms: 4000, kicker: "On the floor", line: "Call her to Room 2." },
  { id: "end", ms: 5200, kicker: "Same day", line: "Selected." },
];

export function WalkInDemo({ go, onLaunch }) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [fill, setFill] = useState(0);
  const [full, setFull] = useState(false);
  const elapsedRef = useRef(0);
  const iRef = useRef(0);
  const playingRef = useRef(true);
  iRef.current = i;
  playingRef.current = playing;
  const scene = STORY_SCENES[i];
  const last = i === STORY_SCENES.length - 1;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    if (!playing) return;
    let raf;
    const t0 = performance.now() - elapsedRef.current;
    const tick = (now) => {
      if (!playingRef.current) return;
      const t = now - t0;
      elapsedRef.current = t;
      const dur = STORY_SCENES[iRef.current].ms;
      setFill(Math.min(1, t / dur));
      if (t >= dur) {
        if (iRef.current < STORY_SCENES.length - 1) {
          elapsedRef.current = 0;
          setFill(0);
          setI(iRef.current + 1);
        } else {
          setPlaying(false);
          setFill(1);
        }
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, i]);

  const jump = (n) => {
    const next = Math.max(0, Math.min(STORY_SCENES.length - 1, n));
    elapsedRef.current = 0;
    setFill(0);
    setI(next);
  };
  const replay = () => { jump(0); setPlaying(true); };
  const toggle = () => {
    if (!playingRef.current && iRef.current === STORY_SCENES.length - 1 && elapsedRef.current >= STORY_SCENES[STORY_SCENES.length - 1].ms) {
      replay();
      return;
    }
    setPlaying((p) => !p);
  };
  const toggleRef = useRef(toggle);
  const jumpRef = useRef(jump);
  toggleRef.current = toggle;
  jumpRef.current = jump;

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === " " || e.code === "Space") { e.preventDefault(); toggleRef.current(); }
      if (e.key === "ArrowRight") jumpRef.current(iRef.current + 1);
      if (e.key === "ArrowLeft") jumpRef.current(iRef.current - 1);
      if (e.key === "Escape") go("home");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const toggleFull = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().then(() => setFull(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setFull(false)).catch(() => {});
    }
  };
  useEffect(() => {
    const onFs = () => setFull(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const filmBtn = { width: 40, height: 40, borderRadius: "50%", border: `1px solid ${k.line}`, background: "#fff", color: k.ink, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" };

  return (
    <div className="storypage" style={{
      position: "fixed", inset: 0, zIndex: 80, background: k.cream,
      display: "flex", flexDirection: "column", fontFamily: bdy, color: k.ink, overflow: "auto",
    }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", width: "100%", padding: "12px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Wordmark size={16} />
          <span style={{ fontSize: 12.5, color: k.mid, fontWeight: 600 }}>A walk-in · playable demo</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={toggleFull} style={filmBtn} aria-label={full ? "Exit fullscreen" : "Enter fullscreen"}>{full ? <Minimize2 size={16} /> : <Maximize2 size={16} />}</button>
          <button onClick={() => go("home")} style={filmBtn} aria-label="Close demo"><X size={16} /></button>
        </div>
      </div>

      <div style={{ maxWidth: 1240, margin: "10px auto 0", width: "100%", padding: "0 24px", display: "flex", gap: 5, flexShrink: 0 }}>
        {STORY_SCENES.map((s, idx) => (
          <button key={s.id} onClick={() => jump(idx)} aria-label={`Scene ${idx + 1}: ${s.kicker || s.line}`} style={{
            flex: 1, height: 12, padding: "4px 0", border: "none", borderRadius: 99, background: "transparent", cursor: "pointer", overflow: "hidden",
          }}>
            <div style={{ height: 3, borderRadius: 99, background: k.line, overflow: "hidden" }}>
              <div style={{ height: "100%", width: idx < i ? "100%" : idx === i ? `${fill * 100}%` : "0%", background: k.coral, borderRadius: 99 }} />
            </div>
          </button>
        ))}
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", minHeight: 0, padding: "8px 24px 0" }}>
        <div key={scene.id} style={{ animation: "storyIn .45s ease", flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div className="storystage" style={{
            flex: 1, display: "flex", justifyContent: "center", alignItems: "center", minHeight: 0,
            animation: "storyKen 10s ease-out forwards",
          }}>
            <StoryFrame id={scene.id} fill={fill} onLaunch={onLaunch} replay={replay} />
          </div>
          {scene.id !== "title" && (scene.kicker || scene.line) ? (
            <div style={{ textAlign: "center", padding: "8px 12px 4px", flexShrink: 0 }}>
              {scene.kicker ? <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.6, textTransform: "uppercase", color: k.coral, marginBottom: 3 }}>{scene.kicker}</div> : null}
              {scene.line ? <div style={{ fontFamily: dsp, fontSize: "clamp(17px, 2.2vw, 24px)", fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.2 }}>{scene.line}</div> : null}
            </div>
          ) : null}
        </div>
      </div>

      <div style={{ maxWidth: 1240, margin: "0 auto 14px", width: "100%", padding: "6px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => jump(i - 1)} style={{ ...filmBtn, opacity: i === 0 ? .35 : 1 }} aria-label="Previous scene" disabled={i === 0}><ArrowLeft size={16} /></button>
          <button onClick={toggle} style={{ ...filmBtn, width: 52, height: 52, background: k.coral, color: "#fff", border: "none" }} aria-label={playing ? "Pause" : "Play"}>
            {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" style={{ marginLeft: 2 }} />}
          </button>
          <button onClick={() => jump(i + 1)} style={{ ...filmBtn, opacity: last ? .35 : 1 }} aria-label="Next scene" disabled={last}><ArrowRight size={16} /></button>
          <span style={{ fontFamily: typ, fontSize: 12, fontWeight: 600, color: k.mid, marginLeft: 6 }}>{String(i + 1).padStart(2, "0")} / {String(STORY_SCENES.length).padStart(2, "0")}</span>
        </div>
        <button onClick={replay} style={{ ...ghostSm, gap: 6 }}><RotateCcw size={13} /> Replay</button>
      </div>
    </div>
  );
}

function StoryFrame({ id, fill, onLaunch, replay }) {
  if (id === "title") return <StoryTitle />;
  if (id === "chaos") return <StoryChaos />;
  if (id === "gate") return <StoryGate />;
  if (id === "prove") return <StoryProve fill={fill} />;
  if (id === "checkin") return <StoryCheckin />;
  if (id === "nudge") return <StoryNudge />;
  if (id === "floor") return <StoryFloor />;
  return <StoryOutcomes onLaunch={onLaunch} replay={replay} />;
}

function StorySet({ children, tone = "set" }) {
  const bg = tone === "chaos" ? "#F6EEDC" : tone === "night" ? "#EEF2FA" : k.cream2;
  return (
    <div className="storystage" style={{
      width: "min(1120px, 100%)", minHeight: 500, background: bg, borderRadius: 28,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 40, padding: "40px 36px",
      boxSizing: "border-box",
    }}>{children}</div>
  );
}
function DemoQr({ seed = "GATE", size = 176 }) {
  const n = 21, cell = size / n;
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  const on = (x, y) => {
    const finder = (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
    if (finder) {
      const dx = x >= n - 7 ? x - (n - 7) : x;
      const dy = y >= n - 7 ? y - (n - 7) : y;
      return dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4);
    }
    return ((Math.imul(h + x * 17 + y * 31, 1103515245) + 12345) >>> 24 & 1) === 1;
  };
  const cells = [];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (on(x, y)) cells.push(`${x},${y}`);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" style={{ display: "block", background: "#fff" }}>
      <rect width={size} height={size} fill="#fff" />
      {cells.map((p) => {
        const [x, y] = p.split(",").map(Number);
        return <rect key={p} x={x * cell} y={y * cell} width={cell} height={cell} fill={k.ink} />;
      })}
    </svg>
  );
}
function StoryPhone({ children, glow }) {
  return (
    <div className="storyphone" style={{
      width: 320, background: k.ink, borderRadius: 44, padding: "14px 11px 18px", flexShrink: 0,
      boxShadow: glow ? "0 36px 70px -18px rgba(44,107,245,.42)" : "0 36px 64px -20px rgba(11,16,32,.45)",
    }}>
      <div style={{ width: 96, height: 24, borderRadius: 16, background: "#000", margin: "0 auto 12px" }} />
      <div style={{ background: "#fff", borderRadius: 34, overflow: "hidden", minHeight: 460 }}>{children}</div>
    </div>
  );
}
function StoryDesk({ children, label, width = 520 }) {
  return (
    <div className="storydesk" style={{ width, flexShrink: 0 }}>
      <div style={{ background: k.ink, borderRadius: "18px 18px 10px 10px", padding: "14px 14px 0", boxShadow: "0 36px 64px -24px rgba(11,16,32,.42)" }}>
        <div style={{ background: "#fff", borderRadius: "12px 12px 0 0", overflow: "hidden", minHeight: 320 }}>
          <div style={{ padding: "12px 18px", background: k.cream2, borderBottom: `1px solid ${k.line}`, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ display: "flex", gap: 5 }}>
              {["#E8A0A0", "#E2D48A", "#A8D4B8"].map((c) => <span key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />)}
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: k.mid }}>{label}</span>
          </div>
          {children}
        </div>
      </div>
      <div style={{ height: 12, background: "#1a2033", borderRadius: "0 0 12px 12px" }} />
      <div style={{ height: 8, width: "42%", margin: "0 auto", background: "#2a3148", borderRadius: "0 0 8px 8px" }} />
    </div>
  );
}
function StoryTv({ children, width = 460 }) {
  return (
    <div className="storytv" style={{ width, flexShrink: 0 }}>
      <div style={{ background: k.ink, borderRadius: 18, padding: 12, boxShadow: "0 36px 64px -18px rgba(11,16,32,.45)" }}>
        <div style={{ background: "#fff", borderRadius: 10, overflow: "hidden", minHeight: 300 }}>{children}</div>
      </div>
      <div style={{ height: 10, width: 64, background: "#2a3148", borderRadius: 2, margin: "12px auto 0" }} />
      <div style={{ height: 8, width: 140, background: "#1a2033", borderRadius: 4, margin: "0 auto" }} />
    </div>
  );
}
function StoryPaper({ children, rot, width = 268, z = 1 }) {
  return (
    <div style={{
      width, background: k.goldDim, borderRadius: 3, padding: "20px 18px 22px", flexShrink: 0, zIndex: z,
      boxShadow: "0 22px 44px -20px rgba(11,16,32,.38)",
      border: "1px solid rgba(154,107,0,.2)",
      "--r": `${rot}deg`,
      animation: "paperSettle .7s ease both",
    }}>{children}</div>
  );
}

function StoryTitle() {
  return (
    <StorySet>
      <div style={{ textAlign: "center", padding: "8px 20px" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}><TokenMark size={96} /></div>
        <Wordmark size={24} />
        <div style={{ fontFamily: dsp, fontSize: 28, fontWeight: 700, letterSpacing: -0.8, marginTop: 18 }}>A walk-in.</div>
        <div style={{ fontSize: 14, color: k.mid, fontWeight: 600, marginTop: 14 }}>Vistaar Services · HITEC City, Tower B</div>
        <div style={{ fontFamily: typ, fontSize: 13, color: k.coral, fontWeight: 700, marginTop: 8, letterSpacing: 1.4 }}>LIVE · 8:47am</div>
      </div>
    </StorySet>
  );
}

function StoryChaos() {
  return (
    <StorySet tone="chaos">
      <StoryPaper rot={-7.5} width={270} z={1}>
        <div style={{ fontFamily: typ, fontSize: 10, letterSpacing: 1.2, color: k.gold, fontWeight: 700, marginBottom: 8 }}>CLIPBOARD · GATE 1</div>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Vistaar — 26 Aug</div>
        {[
          ["Rahul Menon", "Room 1??"],
          ["Sneha Iyer", "waiting"],
          ["Priya Nair", "which list"],
          ["Arjun Reddy", "SKIPPED"],
          ["Fatima S.", "called twice"],
        ].map(([n, st], i) => (
          <div key={n} style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "8px 0", borderTop: i ? "1px dashed rgba(154,107,0,.28)" : "none", fontSize: 14 }}>
            <span style={{ textDecoration: st === "SKIPPED" ? "line-through" : "none", color: st === "SKIPPED" ? k.red : k.ink }}>{i + 1}. {n}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: st === "SKIPPED" ? k.red : k.gold }}>{st}</span>
          </div>
        ))}
      </StoryPaper>
      <div style={{ marginLeft: -56, zIndex: 2 }}>
        <StoryPaper rot={4.2} width={250} z={2}>
          <div style={{ fontFamily: typ, fontSize: 10, letterSpacing: 1.2, color: k.gold, fontWeight: 700, marginBottom: 8 }}>FRONT DESK</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, letterSpacing: -0.4 }}>“Priya? Which list?”</div>
          <div style={{ fontSize: 14, color: k.ink2, lineHeight: 1.45, marginBottom: 16 }}>Notebook. Three photocopies. A WhatsApp group named Walk-in TODAY.</div>
          <div style={{ background: k.redDim, color: k.red, borderRadius: 8, padding: "12px 14px", fontSize: 13.5, fontWeight: 700 }}>40 at the gate · nobody next</div>
        </StoryPaper>
      </div>
    </StorySet>
  );
}

function StoryGate() {
  return (
    <StorySet>
      <div style={{
        width: 300, background: "#fff", borderRadius: 4, padding: "26px 22px 22px", textAlign: "center", flexShrink: 0,
        boxShadow: "0 28px 56px -20px rgba(11,16,32,.38)",
        outline: "1px dashed rgba(11,16,32,.16)", outlineOffset: 10,
        transform: "rotate(-1.2deg)",
      }}>
        <div style={{ fontFamily: typ, fontSize: 11, letterSpacing: 1.8, color: k.coral, fontWeight: 700, marginBottom: 8 }}>GATE · PRINT THIS</div>
        <div style={{ fontFamily: dsp, fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Vistaar Services</div>
        <div style={{ fontSize: 13, color: k.mid, marginBottom: 18 }}>Voice Process · HITEC City</div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}><DemoQr seed="GATE-VISTA1" size={188} /></div>
        <div style={{ fontFamily: typ, fontSize: 20, fontWeight: 700, letterSpacing: 2.2 }}>GATE-VISTA1</div>
        <div style={{ fontSize: 12.5, color: k.mid, marginTop: 8 }}>Tape at security. Does not rotate.</div>
      </div>
      <StoryPhone glow>
        <div style={{ background: "#0B1020", height: 460, position: "relative", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "20px 16px 8px", color: "rgba(255,255,255,.72)", fontSize: 13, fontWeight: 600, textAlign: "center" }}>Scan GATE QR</div>
          <div style={{ flex: 1, margin: "10px 22px 36px", borderRadius: 18, overflow: "hidden", position: "relative", background: "#1a2238", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <DemoQr seed="GATE-VISTA1" size={140} />
            <div style={{ position: "absolute", inset: 18, border: `2px solid ${k.coral}`, borderRadius: 14, pointerEvents: "none" }} />
            <div style={{ position: "absolute", left: 24, right: 24, height: 2, background: k.coral, animation: "scanSweep 1.8s ease-in-out infinite alternate", pointerEvents: "none" }} />
          </div>
          <div style={{ padding: "0 16px 24px", textAlign: "center", color: "#fff", fontSize: 13.5 }}>Hold over the printed poster</div>
        </div>
      </StoryPhone>
    </StorySet>
  );
}

function StoryProve({ fill = 0 }) {
  const left = Math.max(1, Math.round(45 * (1 - fill)));
  return (
    <StorySet tone="night">
      <StoryTv>
        <div style={{ padding: "14px 20px", borderBottom: `2px solid ${k.ink}`, fontFamily: typ, fontSize: 12, letterSpacing: 1.5, color: k.ink2, display: "flex", justifyContent: "space-between" }}>
          <span>WAITING ROOM</span><span style={{ color: k.coral, fontWeight: 700 }}>LIVE</span>
        </div>
        <div style={{ padding: "40px 22px 32px", textAlign: "center", background: k.cream2 }}>
          <div style={{ fontFamily: typ, fontSize: 12, letterSpacing: 1.8, color: k.mid, fontWeight: 700, marginBottom: 12 }}>DESK · TV ONLY</div>
          <div style={{ fontFamily: typ, fontSize: 36, fontWeight: 800, letterSpacing: 3.4, color: k.ink }}>DESK-K7P2N9</div>
          <div style={{ fontSize: 14, color: k.coral, fontFamily: typ, marginTop: 14, fontWeight: 700 }}>ROTATES IN {String(left).padStart(2, "0")}s</div>
        </div>
        <div style={{ padding: "16px 20px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: k.mid }}>
          <span>Now calling</span>
          <TokenChip token="W-013" name="M···a" size={32} muted />
        </div>
      </StoryTv>
      <StoryPhone glow>
        <div style={{ padding: "32px 22px 24px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: .9, textTransform: "uppercase", color: k.coral, marginBottom: 12 }}>You're at the right walk-in</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Vistaar Services</div>
          <div style={{ fontSize: 14, color: k.mid, lineHeight: 1.45, marginBottom: 28 }}>Voice Process · HITEC City</div>
          <div style={{ fontSize: 12.5, color: k.ink2, marginBottom: 8, fontWeight: 600 }}>DESK from the TV</div>
          <div style={{ fontFamily: typ, letterSpacing: 2.6, fontSize: 17, fontWeight: 700, border: `1.5px solid ${k.coral}`, borderRadius: 12, padding: "16px 14px", marginBottom: 18, textAlign: "center" }}>DESK-K7P2N9</div>
          <div style={{ ...solid, justifyContent: "center", padding: 13, fontSize: 15, width: "100%", boxSizing: "border-box" }}>Prove I'm here</div>
        </div>
      </StoryPhone>
    </StorySet>
  );
}

function StoryCheckin() {
  return (
    <StorySet>
      <StoryPhone glow>
        <div style={{ background: k.ink, color: "#fff", padding: "14px 20px", fontFamily: typ, fontSize: 12, letterSpacing: 1.8, display: "flex", justifyContent: "space-between" }}>
          <span>ADMISSION SLIP</span><span style={{ opacity: .7 }}>Vistaar</span>
        </div>
        <div style={{ padding: "32px 24px 26px" }}>
          <div style={{ fontSize: 13.5, color: k.mid, marginBottom: 20 }}>Vistaar Services · Voice Process</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 26 }}>
            <TokenTile token="W-014" size={84} pulse />
            <div>
              <div style={{ fontWeight: 700, fontSize: 24, lineHeight: 1.15, letterSpacing: -0.5 }}>Priya Nair</div>
              <div style={{ fontSize: 14, color: k.mid, marginTop: 5 }}>Walk-in 014</div>
            </div>
          </div>
          <div style={{ textAlign: "center", background: k.band, borderRadius: 20, padding: "30px 16px" }}>
            <div style={{ fontFamily: dsp, fontSize: 64, fontWeight: 800, color: k.coral, letterSpacing: -2.5, lineHeight: 1 }}>4</div>
            <div style={{ fontSize: 15, color: k.ink, fontWeight: 600, marginTop: 6 }}>ahead of you</div>
            <div style={{ fontSize: 13.5, color: k.ink2, marginTop: 8 }}>~28 min</div>
          </div>
        </div>
      </StoryPhone>
    </StorySet>
  );
}

function StoryNudge() {
  return (
    <StorySet>
      <StoryPhone glow>
        <div style={{ background: k.coral, color: "#fff", padding: "16px 18px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <TokenMark size={22} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>TokenHire</div>
            <div style={{ fontSize: 12, opacity: .88 }}>WhatsApp · now</div>
          </div>
        </div>
        <div style={{ background: k.cream2, minHeight: 380, padding: "28px 18px" }}>
          <div style={{ background: "#fff", borderRadius: "4px 18px 18px 18px", padding: "16px 18px", fontSize: 15.5, color: k.ink, lineHeight: 1.5, boxShadow: "0 1px 3px rgba(11,16,32,.06)" }}>
            Priya, you're up in about 15 minutes — 014. Please be near the waiting area.
          </div>
          <div style={{ fontSize: 12.5, color: k.mid, marginTop: 12 }}>11:02am · one message</div>
        </div>
      </StoryPhone>
    </StorySet>
  );
}

function StoryFloor() {
  return (
    <StorySet tone="night">
      <StoryDesk label="Recruiter · Arun · Room 2">
        <div style={{ padding: "18px 18px 20px" }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: k.mid, letterSpacing: .7, textTransform: "uppercase", marginBottom: 12 }}>Live queue</div>
          {[
            ["W-013", "Meera Joshi", "In interview", false],
            ["W-014", "Priya Nair", "Call · Room 2", true],
            ["W-015", "Sandeep Kumar", "Waiting", false],
          ].map(([tok, name, st, on]) => (
            <div key={tok} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "14px 12px", borderRadius: 12, background: on ? k.coralDim : "transparent", marginBottom: 4 }}>
              <TokenChip token={tok} name={name} size={44} pulse={on} />
              {on ? <span style={{ ...solid, padding: "8px 14px", fontSize: 13 }}>{st}</span> : <span style={{ fontSize: 13.5, color: k.mid, fontWeight: 600 }}>{st}</span>}
            </div>
          ))}
        </div>
      </StoryDesk>
      <StoryTv width={380}>
        <div style={{ padding: "14px 18px", borderBottom: `2px solid ${k.ink}`, fontFamily: typ, fontSize: 12, letterSpacing: 1.5, color: k.ink2, display: "flex", justifyContent: "space-between" }}>
          <span>NOW CALLING</span><span style={{ color: k.coral, fontWeight: 700 }}>LIVE</span>
        </div>
        <div style={{ padding: "32px 20px", background: k.band, display: "flex", justifyContent: "center" }}>
          <TokenChip token="W-014" name="P···a" size={64} pulse />
        </div>
        <div style={{ padding: "10px 18px", background: k.cream2, fontFamily: typ, fontSize: 11, letterSpacing: 1.3, color: k.mid }}>UP NEXT</div>
        {[["W-015", "S···r"], ["W-016", "A···a"]].map(([tok, nm]) => (
          <div key={tok} style={{ padding: "14px 18px", borderTop: `1px solid ${k.line}` }}>
            <TokenChip token={tok} name={nm} size={36} muted />
          </div>
        ))}
      </StoryTv>
    </StorySet>
  );
}

function StoryOutcomes({ onLaunch, replay }) {
  return (
    <StorySet>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
        <div style={{
          width: 340, background: "#fff", border: `1px solid ${k.line}`, borderRadius: 24, padding: "32px 32px 26px",
          boxShadow: "0 24px 50px -24px rgba(11,16,32,.28)",
        }}>
          <TokenChip token="W-014" name="Priya Nair" size={64} />
          <div style={{ background: k.coralDim, color: k.coral, fontSize: 14, fontWeight: 700, padding: "8px 12px", borderRadius: 8, display: "inline-block", marginTop: 18 }}>Selected</div>
        </div>
        <div style={{ fontFamily: typ, fontSize: 13.5, color: k.mid, fontWeight: 600 }}>50 walked in · 8 selected · 4 on hold · 7 rejected</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          <button onClick={() => onLaunch("employer")} style={solid}>Set up a walk-in <ArrowRight size={16} /></button>
          <button onClick={replay} style={outline}><RotateCcw size={14} /> Replay</button>
        </div>
      </div>
    </StorySet>
  );
}

function Highlight({ children }) {
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
      <span style={{ position: "absolute", left: -4, right: -4, bottom: 4, height: "0.32em", background: k.coralDim, borderRadius: 3, zIndex: 0 }} />
    </span>
  );
}

/* the signature hero: one queue, two honest views, shown side by side and physically linked */
function SplitHero() {
  const [tick, setTick] = useState(0);
  useEffect(() => { const iv = setInterval(() => setTick((t) => t + 1), 2800); return () => clearInterval(iv); }, []);
  const calling = tick % 3 === 1;
  const rows = [
    { tok: "W-013", name: "Meera Joshi", st: "In interview", tone: k.mid },
    { tok: "W-014", name: "Priya Nair", st: calling ? "Being called" : "Waiting", tone: calling ? k.coral : k.mid },
    { tok: "W-015", name: "Sandeep Kumar", st: "Waiting", tone: k.mid },
  ];
  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 26px" }}>
      <div style={{ ...box, overflow: "hidden", borderRadius: 24, boxShadow: "0 24px 50px -28px rgba(11,16,32,.28)" }}>
        <div style={{ padding: "14px 22px", background: k.cream2, borderBottom: `1px solid ${k.line}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontFamily: dsp, fontWeight: 700, fontSize: 14.5 }}>Vistaar Services · Voice Process Associate</div>
            <div style={{ fontSize: 12, color: k.mid, marginTop: 2 }}>HITEC City · live walk-in</div>
          </div>
          <Pill tone="teal">LIVE NOW</Pill>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }} className="g2">
          <div style={{ padding: "28px 28px 32px", borderRight: `1px solid ${k.line}`, background: "#fff" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: k.mid, letterSpacing: .7, textTransform: "uppercase", marginBottom: 16 }}>On their phone</div>
            <div style={{ fontSize: 12.5, color: k.ink2, margin: "0 0 14px" }}>Your walk-in number</div>
            <TokenChip token="W-014" name="Priya Nair" size={64} pulse={calling} />
            <div style={{ height: 6, background: k.cream2, borderRadius: 3, margin: "16px 0 12px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: calling ? "92%" : "58%", background: k.coral, borderRadius: 3, transition: "width 1s ease" }} />
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: calling ? k.coral : k.ink2 }}>
              {calling ? "You're being called — go to Room 2" : "3 people ahead · about 24 min"}
            </div>
          </div>
          <div style={{ padding: "28px 28px 32px", background: k.bandSoft }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: k.mid, letterSpacing: .7, textTransform: "uppercase", marginBottom: 16 }}>On the recruiter desk</div>
            <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${k.line}`, overflow: "hidden" }}>
              {rows.map((r, i) => (
                <div key={r.tok} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "12px 14px", borderTop: i ? `1px solid ${k.line}` : "none", background: r.st === "Being called" ? k.coralDim : "#fff" }}>
                  <TokenChip token={r.tok} name={r.name} size={36} pulse={r.st === "Being called"} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: r.tone, whiteSpace: "nowrap" }}>{r.st}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlanCards({ onChoose, go }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }} className="g3">
      {PUBLIC_PLANS.map((p) => (
        <div key={p.id} style={{ border: `1px solid ${p.best ? k.teal : k.line}`, borderRadius: 8, padding: 24, background: "#fff", position: "relative", boxShadow: p.best ? "0 14px 32px -22px rgba(31,111,92,.4)" : "none" }}>
          {p.ribbon && <div style={{ position: "absolute", top: -9, left: 22, background: p.best ? k.teal : k.ink, color: "#fff", fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: 3, fontFamily: typ, letterSpacing: .5 }}>{p.ribbon}</div>}
          <div style={{ fontFamily: dsp, fontSize: 16, fontWeight: 700 }}>{p.name}</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 7, margin: "12px 0 5px" }}>
            <span style={{ fontFamily: typ, fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>{p.price}</span>
            <span style={{ fontSize: 12.5, color: k.faint }}>{p.unit}</span>
          </div>
          {p.annual && <div style={{ fontSize: 12, color: k.mid, marginBottom: 8 }}>{p.annual}</div>}
          <div style={{ fontSize: 13, color: k.ink2, lineHeight: 1.55, minHeight: 44, marginBottom: 14 }}>{p.blurb}</div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: k.coralDim, color: k.coral, fontSize: 12, fontWeight: 600, padding: "5px 11px", borderRadius: R.pill, marginBottom: 18 }}>
            {p.validity}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 20 }}>{p.feats.map((f) => <div key={f} style={{ display: "flex", gap: 8, fontSize: 13, alignItems: "flex-start" }}><Check size={14} color={k.teal} style={{ flexShrink: 0, marginTop: 2 }} />{f}</div>)}</div>
          <button onClick={() => (p.talk && go ? go("contact") : onChoose(p))} style={{ ...(p.best ? solid : outline), width: "100%", justifyContent: "center", padding: 11 }}>{p.cta}</button>
        </div>
      ))}
    </div>
  );
}

export function Home({ go, onLaunch, drives }) {
  return (
    <>
      <div style={{ background: k.cream, minHeight: "100vh", padding: "0 0 48px", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", padding: "64px 26px 0", textAlign: "center" }}>
          <h1 style={{ fontFamily: dsp, fontSize: "clamp(36px, 5vw, 58px)", lineHeight: 1.12, letterSpacing: -1.4, margin: "0 auto 20px", color: k.ink, fontWeight: 700, maxWidth: 780 }}>
            One line. Two screens. <Highlight>Nobody's forgotten.</Highlight>
          </h1>
          <p style={{ fontSize: 17.5, color: k.ink2, lineHeight: 1.6, margin: "0 auto 34px", maxWidth: 520 }}>
            Candidates watch their own turn approach from their phone. Recruiters run the whole line from one screen. Same queue, two honest views.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 40 }}>
            <button onClick={() => onLaunch("employer")} style={solid}>Set up a walk-in <ArrowRight size={16} /></button>
            <button onClick={() => go("demo")} style={outline}><Play size={14} fill="currentColor" /> Watch a walk-in</button>
          </div>
        </div>
        <div style={{ marginTop: "auto", background: k.bandSoft, padding: "28px 0 36px" }}>
          <SplitHero />
        </div>
      </div>

      <div style={{ background: k.bandSoft, padding: "72px 0 88px" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", padding: "0 26px" }}>
          <h2 style={{ fontFamily: dsp, fontSize: "clamp(30px,4vw,44px)", fontWeight: 400, letterSpacing: -1, margin: "0 0 40px", textAlign: "center" }}>
            Built for <b style={{ fontWeight: 800 }}>how you hire</b>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }} className="g3">
            {[
              ["bpo", "BPO & support", "500-a-day drives"],
              ["retail", "Retail & delivery", "Store-by-store hiring"],
              ["campus", "Campus hiring", "A batch in one morning"],
              ["agency", "Staffing agencies", "Hire for clients, branded as you"],
            ].map(([id, h, d]) => (
              <button key={id} onClick={() => go(`sol:${id}`)} style={{
                background: "#fff", border: `1px solid ${k.line}`, borderRadius: R.card, padding: 26,
                textAlign: "left", cursor: "pointer", fontFamily: bdy,
              }}>
                <div style={{ fontFamily: dsp, fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{h}</div>
                <div style={{ fontSize: 14, color: k.mid, marginBottom: 16 }}>{d}</div>
                <span style={{ fontSize: 13.5, color: k.coral, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>Learn more <ArrowRight size={13} /></span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: "#fff", padding: "96px 0 32px" }}>
        <CtaBand onLaunch={onLaunch} variant="home" flush />
      </div>
    </>
  );
}

const CTA_COPY = {
  home: { head: ["The ", "chaos is over"], sub: "Your next walk-in can run without a clipboard.", btn: "Set up a walk-in" },
  products: { head: ["Built for ", "the front desk"], sub: "Every piece above works out of the box. Nothing to configure, nothing to install.", btn: "Try it on a real drive" },
  about: { head: ["Come ", "build it with us"], sub: "We're early, and we'd rather hear from ten real recruiters than guess at what they need.", btn: "Talk to us" },
  solution: { head: ["Run your next walk-in ", "this way"], sub: "Set it up in a few minutes. Plans start at a small one-day event.", btn: "Set up a walk-in" },
};
export function CtaBand({ onLaunch, variant = "home", onContact, flush }) {
  const c = CTA_COPY[variant] || CTA_COPY.home;
  return (
    <div style={{ maxWidth: 1140, margin: flush ? "0 auto" : "70px auto 0", padding: "0 26px" }}>
      <div style={{ background: k.band, borderRadius: 28, padding: "56px 40px", textAlign: "center" }}>
        <h2 style={{ fontFamily: dsp, fontSize: "clamp(28px,3.6vw,42px)", fontWeight: 400, letterSpacing: -1, margin: "0 0 14px" }}>
          {c.head[0]}<b style={{ fontWeight: 800 }}>{c.head[1]}</b>
        </h2>
        <p style={{ fontSize: 17, color: k.ink2, margin: "0 auto 30px", maxWidth: 460, lineHeight: 1.6 }}>{c.sub}</p>
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
    [ShieldCheck, "Privacy by default", "Public screens show a token and a masked name. Only recruiters signed in to that drive see anything more."],
    [FileText, "We store as little as possible", "Aadhaar is optional, and even then we keep a one-way hash — never the number."],
    [HeartHandshake, "One job, done properly", "Walk-in hiring drives. Not general queueing, not an ATS. That focus is the point."],
  ];
  return (
    <>
      <div style={{ background: k.band }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "76px 26px 80px", textAlign: "center" }}>
          <h1 style={{ fontFamily: dsp, fontSize: "clamp(34px,4.8vw,52px)", fontWeight: 700, letterSpacing: -1.5, margin: "0 0 22px", lineHeight: 1.12 }}>
            Nobody should wait all day <Highlight>without knowing why.</Highlight>
          </h1>
          <p style={{ fontSize: 18, color: k.ink2, lineHeight: 1.65, margin: "0 auto", maxWidth: 500 }}>
            That's the whole reason TokenHire exists.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 660, margin: "0 auto", padding: "70px 26px 0" }}>
        <p style={{ fontSize: 18, color: k.ink, lineHeight: 1.75, margin: "0 0 22px", fontWeight: 500 }}>
          A thousand people can pass through a walk-in drive in a weekend. By Monday, nothing's left but a paper register and a rough headcount.
        </p>
        <p style={{ fontSize: 16.5, color: k.ink2, lineHeight: 1.8, margin: "0 0 22px" }}>
          We watched it happen — candidates standing in corridors with no idea if they'd be seen, recruiters working off a shouted name and a clipboard, nobody able to say afterwards who was screened or why.
        </p>
        <p style={{ fontSize: 16.5, color: k.ink2, lineHeight: 1.8, margin: 0 }}>
          Every tool we found handled sourcing <i>before</i> the drive, or was queue software built for hospitals. Nothing sat at the actual front desk. So we built that: one place for a candidate to become known once, and one place for a recruiter to run the day without losing count of anyone in the room.
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
    { h: "A QR that can be printed", d: "Security holds a GATE QR that never changes — paper, a laminate, or a phone screenshot. That only identifies the walk-in. Check-in needs the rotating DESK code on the waiting-room TV, so a forwarded photo of the poster can't join the queue.", art: <ArtCode /> },
    { h: "One queue, many recruiters", d: "Every recruiter screening today works off the identical list. Nobody ever calls the same token twice, because there's only one source of truth.", art: <ArtQueue /> },
    { h: "A nudge 15 minutes before", d: "Candidates don't have to stand around watching a screen. WhatsApp tells them exactly when to come back, timed off your actual pace.", art: <ArtNudge /> },
    { h: "Names stay private in public", d: "The screen on the wall shows a token and a masked name — R···l, not Rahul. Only recruiters signed in to that drive see anything more.", art: <ArtMasked /> },
    { h: "Wait times from today's pace", d: "Estimates aren't set once at 9am and left stale. They recalculate continuously from how long your interviews are actually running.", art: <ArtPace /> },
    { h: "The report you never had", d: "Checked in, interviewed, selected, rejected, on hold — a real extract at the end of the day, ready to drop into your ATS. Offers stay off the walk-in floor.", art: <ArtReport /> },
  ];

  return (
    <>
      <div style={{ background: k.band }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "76px 26px 80px", textAlign: "center" }}>
          <h1 style={{ fontFamily: dsp, fontSize: "clamp(34px,4.8vw,52px)", fontWeight: 700, letterSpacing: -1.5, margin: "0 0 20px", lineHeight: 1.12 }}>
            One queue. <Highlight>One honest record.</Highlight>
          </h1>
          <p style={{ fontSize: 18, color: k.ink2, lineHeight: 1.65, margin: "0 auto", maxWidth: 480 }}>
            Everything that happens at the front desk of a walk-in drive — handled in one place.
          </p>
        </div>
      </div>

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
      <div style={{ display: "flex", gap: 14, alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: 10, background: k.cream2, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
            <QrCode size={36} color={k.ink} />
          </div>
          <div style={{ fontFamily: typ, fontSize: 10, color: k.coral, fontWeight: 700 }}>GATE · PRINT</div>
        </div>
        <div style={{ fontSize: 18, color: k.faint }}>+</div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: typ, fontSize: 16, fontWeight: 700, letterSpacing: 1.5, color: k.ink, marginBottom: 8 }}>K7P2N9</div>
          <div style={{ fontFamily: typ, fontSize: 10, color: k.mid }}>DESK · TV ONLY</div>
        </div>
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
  const rows = [["Walked in", 100, k.faint], ["Interviewed", 66, k.mid], ["Offered", 28, k.gold], ["Joined", 17, k.teal]];
  return (
    <ArtFrame>
      {rows.map(([l, pct, c]) => (
        <div key={l} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 11.5, color: k.mid, width: 76, flexShrink: 0 }}>{l}</span>
          <div style={{ flex: 1, height: 14, background: k.cream2, borderRadius: 3, overflow: "hidden" }}><div style={{ height: "100%", width: `${pct}%`, background: c, borderRadius: 3 }} /></div>
        </div>
      ))}
    </ArtFrame>
  );
}

/* --- Solutions: a real page per industry --- */
const SOLUTIONS = {
  bpo: {
    eyebrow: "BPO & customer support",
    head: ["Five hundred walk-ins. ", "One calm room."],
    sub: "Voice and non-voice drives run at volumes nothing else in hiring touches. The bottleneck isn't sourcing — it's the four hours between arriving and being seen.",
    pains: [
      ["The room holds 80. The queue is 400.", "Candidates spill into corridors and car parks because nobody knows who's next. Tokens and honest wait times let people leave and come back."],
      ["Six recruiters, six paper lists.", "Names get called twice, or never. One shared queue means every screener works off the same order."],
      ["Decisions stay in your ATS.", "The walk-in records selected, rejected, and on hold by round. Offers and joining happen later, in the system you already use."],
    ],
    stat: ["500+", "candidates in a single day's drive"],
  },
  retail: {
    eyebrow: "Retail & delivery",
    head: ["Hiring in ", "forty stores at once."],
    sub: "Store managers run their own walk-ins, usually with a notebook. Nothing rolls up, so head office finds out how it went a week later.",
    pains: [
      ["Every store does it differently.", "One store's register is a WhatsApp group, another's is paper. The same check-in flow everywhere makes the data comparable."],
      ["Head office is flying blind.", "Each drive posts its own numbers as it happens, instead of a spreadsheet emailed on Monday."],
      ["Walk-ins clash with the shop floor.", "Candidates waiting inside the store hurt trade. Send the 15-minute WhatsApp nudge so they can wait outside, and the aisle stays clear."],
    ],
    stat: ["40+", "store drives running the same week"],
  },
  campus: {
    eyebrow: "Campus hiring",
    head: ["A whole batch, ", "through by lunch."],
    sub: "Placement drives cram three hundred students into a corridor for a process that takes eight minutes each. The maths never works, and the students know it.",
    pains: [
      ["Everyone arrives at 9am.", "All of them, at once, because nobody's told them otherwise. Staggered wait times spread the same crowd across the day."],
      ["The placement cell is the queue.", "Two coordinators managing three hundred students by memory. The queue runs itself instead."],
      ["No record for the college.", "Placement officers need real numbers per drive. They get a report instead of a headcount."],
    ],
    stat: ["300", "students, one morning, one queue"],
  },
  agency: {
    eyebrow: "Staffing agencies",
    head: ["You hire for them. ", "The hall is yours."],
    sub: "Quess, TeamLease, Adecco — you staff banks, BPOs, and factories, and sometimes your own associate bench. Candidates join a Quess walk-in for HDFC, not a TokenHire event. Vistaar next door never sees your books.",
    pains: [
      ["One agency space — not a shared soup.", "Your recruiters and front desks only see Quess drives. Another agency (or a captive like Wipro) cannot open yours. Clients are tags inside your space, not logins that peek at each other."],
      ["The poster and the TV say Quess.", "GATE, waiting screen, and the admission slip carry your mark and the client name. A small Powered by TokenHire is all we keep."],
      ["Branches and clients in one login.", "Hyderabad HITEC vs Pune, HDFC sales vs Amazon warehouse vs bench. Tag the drive; the hall and the Monday extract follow."],
    ],
    stat: ["1", "agency login, many clients and cities"],
  },
};

export function SolutionPage({ id, go, onLaunch }) {
  const s = SOLUTIONS[id];
  if (!s) return null;
  return (
    <>
      <div style={{ background: k.band }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "72px 26px 76px", textAlign: "center" }}>
          <div style={{ fontSize: 15, color: k.coral, fontWeight: 500, marginBottom: 18 }}>{s.eyebrow}</div>
          <h1 style={{ fontFamily: dsp, fontSize: "clamp(34px,5vw,56px)", fontWeight: 400, letterSpacing: -1.6, margin: "0 0 22px", lineHeight: 1.08 }}>
            {s.head[0]}<b style={{ fontWeight: 800 }}>{s.head[1]}</b>
          </h1>
          <p style={{ fontSize: 18, color: k.ink2, lineHeight: 1.65, margin: "0 auto 32px", maxWidth: 560 }}>{s.sub}</p>
          <button onClick={() => onLaunch("employer")} style={solid}>Set up a walk-in <ArrowRight size={16} /></button>
        </div>
      </div>

      <div style={{ maxWidth: 1140, margin: "-38px auto 0", padding: "0 26px" }}>
        <div style={{ background: "#fff", border: `1px solid ${k.line}`, borderRadius: 26, padding: "34px 40px", boxShadow: "0 30px 60px -40px rgba(11,16,32,.25)", textAlign: "center" }}>
          <span style={{ fontFamily: dsp, fontSize: 42, fontWeight: 800, color: k.coral, letterSpacing: -1.5 }}>{s.stat[0]}</span>
          <span style={{ fontSize: 16, color: k.ink2, marginLeft: 14 }}>{s.stat[1]}</span>
        </div>
      </div>

      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "64px 26px 0" }}>
        <h2 style={{ fontFamily: dsp, fontSize: "clamp(26px,3.6vw,38px)", fontWeight: 700, letterSpacing: -1, margin: "0 0 40px", textAlign: "center" }}>What actually goes wrong</h2>
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
  const [status, setStatus] = useState("All");
  const [role, setRole] = useState("All roles");
  const [exp, setExp] = useState("");
  const [openId, setOpenId] = useState(null);
  const roles = ["All roles", ...Array.from(new Set(listed.map((d) => d.role))).sort()];

  const visible = listed
    .filter((d) => d.status !== "closed")
    .filter((d) => !city || d.city === city)
    .filter((d) => status === "All" || d.status === status)
    .filter((d) => role === "All roles" || d.role === role)
    .filter((d) => !exp || !(d.expNeeded || []).length || d.expNeeded.includes(exp))
    .sort((a, b) => a.date.localeCompare(b.date));

  const liveCount = listed.filter((d) => d.status === "live").length;
  const upcomingCount = listed.filter((d) => d.status === "upcoming").length;

  return (
    <>
      <div style={{ background: k.band }}>
        <div style={{ maxWidth: 780, margin: "0 auto", padding: "70px 26px 40px", textAlign: "center" }}>
          <div style={{ fontSize: 15, color: k.coral, fontWeight: 500, marginBottom: 16 }}>Upcoming drives</div>
          <h1 style={{ fontFamily: dsp, fontSize: "clamp(34px,4.8vw,54px)", fontWeight: 400, letterSpacing: -1.6, margin: "0 0 18px", lineHeight: 1.08 }}>
            Find a walk-in <b style={{ fontWeight: 800 }}>near you</b>
          </h1>
          <p style={{ fontSize: 18, color: k.ink2, lineHeight: 1.65, margin: "0 auto 30px", maxWidth: 500 }}>
            Sorted by date. Public walk-ins for the weekend show up here. Joining still means being at that venue: scan GATE, then enter the rotating DESK code from the TV.
          </p>
          <button onClick={() => onLaunch("candidate")} style={solid}>Set up my profile <ArrowRight size={16} /></button>
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
              <select value={exp} onChange={(e) => setExp(e.target.value)} style={{ ...input, appearance: "auto" }}>
                <option value="">All levels</option>
                {EXP_BANDS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: k.faint, letterSpacing: .6, textTransform: "uppercase", marginBottom: 8 }}>Role</div>
              <select value={role} onChange={(e) => setRole(e.target.value)} style={{ ...input, fontSize: 13.5 }}>
                {roles.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
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
    <div style={{ background: "#fff", borderRadius: R.card, padding: "20px 22px", textAlign: "center" }}>
      <div style={{ fontFamily: dsp, fontSize: 34, fontWeight: 800, color: k.coral, letterSpacing: -1 }}>{n}</div>
      <div style={{ fontSize: 13, color: k.ink2, marginTop: 4 }}>{label}</div>
    </div>
  );
}

/* --- Pricing --- */
export function PricingPage({ onLaunch, go }) {
  return (
    <>
      <div style={{ background: k.band }}>
        <div style={{ maxWidth: 780, margin: "0 auto", padding: "70px 26px 74px", textAlign: "center" }}>
          <div style={{ fontSize: 15, color: k.coral, fontWeight: 500, marginBottom: 18 }}>Pricing</div>
          <h1 style={{ fontFamily: dsp, fontSize: "clamp(32px,4.4vw,50px)", fontWeight: 400, letterSpacing: -1.6, margin: "0 0 18px", lineHeight: 1.1 }}>
            Instead of 300 people waiting, this <b style={{ fontWeight: 800 }}>runs the walk-in</b>.
          </h1>
          <p style={{ fontSize: 18, color: k.ink2, lineHeight: 1.65, margin: "0 auto", maxWidth: 520 }}>Register, QR check-in, token, live status, rooms, reports — one system. GST extra.</p>
        </div>
      </div>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "54px 26px 80px" }}>
        <PlanCards onChoose={() => onLaunch("employer")} go={go} />
        <p style={{ fontSize: 14, color: k.mid, marginTop: 28, textAlign: "center", lineHeight: 1.6 }}>
          Need more?{" "}
          <button type="button" onClick={() => go("contact")} style={{ background: "none", border: "none", padding: 0, color: k.coral, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: "inherit" }}>Contact us</button>.
        </p>
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
      ["Fair use of check-in codes", "GATE codes and the printed QR identify which walk-in you're at. They do not complete check-in. Joining the queue requires a live DESK code from the waiting-room screen (it rotates every 45 seconds) or a one-time pass issued by front desk. HOST codes are for recruiters only. Sharing or forwarding a GATE QR, DESK code, or gate pass so someone who isn't at the venue can check in is a violation of these terms and may result in account suspension."],
      ["No guarantee of hiring outcomes", "TokenHire manages the queue and the record-keeping. We don't guarantee interviews, offers, or job placement — those decisions rest entirely with the hiring company running the drive."],
      ["Changes", "We may update these terms as the product changes. Material changes will be reflected here with an updated date."],
    ],
  },
};

export function LegalPage({ kind }) {
  const l = LEGAL[kind];
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
                <select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} style={input}>
                  <option value="company">Company looking to hire</option>
                  <option value="agency">Staffing / recruitment agency</option>
                  <option value="candidate">Candidate</option>
                  <option value="other">Something else</option>
                </select>
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
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
              <div style={{ fontSize: 11.5, color: k.faint, lineHeight: 1.5 }}>This form isn't connected to an inbox yet — email us directly meanwhile.</div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function PageEnd() { return null; } // no longer used — nav already carries the primary CTA on every page
