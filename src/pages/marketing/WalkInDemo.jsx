import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, FileText, Maximize2, Minimize2, Pause, Play, RotateCcw, X } from "lucide-react";
import { bdy, dsp, typ, k, solid, outline } from "../../theme.js";
import { TokenChip, TokenMark, TokenTile, Wordmark } from "../../components/brand.jsx";

const STORY_SCENES = [
  { id: "title", ms: 2800, kicker: "TokenHire", line: "A walk-in day with digital candidate files." },
  { id: "chaos", ms: 3200, kicker: "Without TokenHire", line: "Paper lists. Photocopies. Nobody knows who is next." },
  { id: "gate", ms: 3800, kicker: "Check-in", line: "She scans the waiting-room screen and joins the queue." },
  { id: "prove", ms: 3800, kicker: "At the door", line: "A forwarded photo of the code expires in 45 seconds." },
  { id: "checkin", ms: 4200, kicker: "Her file", line: "Token 014. Resume and details are already on file." },
  { id: "nudge", ms: 3600, kicker: "WhatsApp", line: "One message: be near the door in about 15 minutes." },
  { id: "floor", ms: 4000, kicker: "The desk", line: "The recruiter calls her to Room 2." },
  { id: "end", ms: 6200, kicker: "End of day", line: "The full file is ready to send to your ATS." },
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

  const filmBtn = {
    width: 38, height: 38, borderRadius: "50%", border: "1px solid rgba(255,255,255,.16)",
    background: "rgba(255,255,255,.06)", color: "#E8EBF5", display: "inline-flex",
    alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
  };

  return (
    <div className="storypage" style={{
      position: "fixed", inset: 0, zIndex: 80,
      // A dark house makes the lit scene panels read as a stage rather than a slide.
      background: "radial-gradient(120% 80% at 50% 8%, #1B2340 0%, #0C1020 55%, #070A14 100%)",
      display: "flex", flexDirection: "column", fontFamily: bdy, color: "#E8EBF5", overflow: "hidden",
    }}>
      <div className="storybar" style={{ width: "100%", padding: "14px 26px 0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <Wordmark size={16} light />
          <span className="storykicker" style={{ fontSize: 12, color: "#8A93AE", fontWeight: 600, whiteSpace: "nowrap" }}>
            Scene {String(i + 1).padStart(2, "0")} of {String(STORY_SCENES.length).padStart(2, "0")}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={toggleFull} style={filmBtn} aria-label={full ? "Exit fullscreen" : "Enter fullscreen"}>{full ? <Minimize2 size={15} /> : <Maximize2 size={15} />}</button>
          <button onClick={() => go("home")} style={filmBtn} aria-label="Close demo"><X size={15} /></button>
        </div>
      </div>

      <div style={{ width: "100%", padding: "12px 26px 0", display: "flex", gap: 4, flexShrink: 0 }}>
        {STORY_SCENES.map((s, idx) => (
          <button key={s.id} onClick={() => jump(idx)} aria-label={`Scene ${idx + 1}: ${s.kicker || s.line}`} style={{
            flex: 1, height: 14, padding: "5px 0", border: "none", background: "transparent", cursor: "pointer",
          }}>
            <div style={{ height: 3, borderRadius: 99, background: "rgba(255,255,255,.14)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: idx < i ? "100%" : idx === i ? `${fill * 100}%` : "0%", background: k.coral, borderRadius: 99 }} />
            </div>
          </button>
        ))}
      </div>

      {/* The stage owns all remaining height and scales its contents down on short
          screens, so a scene can never push the caption or controls off-screen. */}
      <div className="storyviewport" style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "14px 20px 0", overflow: "hidden" }}>
        <div key={scene.id} className="storyscale" style={{ animation: "storyIn .5s ease, storyKen 11s ease-out forwards" }}>
          <StoryFrame id={scene.id} fill={fill} onLaunch={onLaunch} replay={replay} />
        </div>
      </div>

      <div style={{ flexShrink: 0, textAlign: "center", padding: "16px 24px 0", minHeight: 78 }}>
        {scene.id !== "title" && scene.kicker ? (
          <div style={{ fontFamily: typ, fontSize: 10.5, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: k.coral, marginBottom: 6 }}>{scene.kicker}</div>
        ) : null}
        {scene.id !== "title" && scene.line ? (
          <div style={{ fontFamily: dsp, fontSize: "clamp(18px, 2.4vw, 30px)", fontWeight: 700, letterSpacing: -0.6, lineHeight: 1.15, color: "#fff" }}>{scene.line}</div>
        ) : null}
      </div>

      <div style={{ width: "100%", padding: "16px 26px 20px", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexShrink: 0, position: "relative" }}>
        <button onClick={() => jump(i - 1)} style={{ ...filmBtn, opacity: i === 0 ? .3 : 1 }} aria-label="Previous scene" disabled={i === 0}><ArrowLeft size={15} /></button>
        <button onClick={toggle} style={{ ...filmBtn, width: 54, height: 54, background: k.coral, color: "#fff", border: "none", boxShadow: "0 8px 26px -10px rgba(255,107,74,.9)" }} aria-label={playing ? "Pause" : "Play"}>
          {playing ? <Pause size={19} fill="currentColor" /> : <Play size={19} fill="currentColor" style={{ marginLeft: 2 }} />}
        </button>
        <button onClick={() => jump(i + 1)} style={{ ...filmBtn, opacity: last ? .3 : 1 }} aria-label="Next scene" disabled={last}><ArrowRight size={15} /></button>
        <button onClick={replay} className="storyreplay" style={{ ...filmBtn, width: "auto", padding: "0 15px", gap: 7, borderRadius: 99, fontSize: 12.5, fontWeight: 600, fontFamily: bdy, position: "absolute", right: 26 }}>
          <RotateCcw size={13} /> Replay
        </button>
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
      width: "min(1120px, 100%)", minHeight: 460, background: bg, borderRadius: 26,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 40, padding: "40px 36px",
      boxSizing: "border-box",
      // Lifts the lit panel off the dark backdrop.
      boxShadow: "0 40px 90px -40px rgba(0,0,0,.85), 0 0 0 1px rgba(255,255,255,.05)",
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
        <div style={{ fontFamily: dsp, fontSize: 26, fontWeight: 700, letterSpacing: -0.6, marginTop: 18, maxWidth: 420, marginLeft: "auto", marginRight: "auto", lineHeight: 1.25 }}>A walk-in day with digital candidate files.</div>
        <div style={{ fontSize: 14, color: k.mid, fontWeight: 600, marginTop: 14 }}>Vistaar Services · Voice Process Associate · HITEC City</div>
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
      <StoryTv>
        <div style={{ padding: "14px 20px", borderBottom: `2px solid ${k.ink}`, fontFamily: typ, fontSize: 12, letterSpacing: 1.5, color: k.ink2, display: "flex", justifyContent: "space-between" }}>
          <span>WAITING ROOM</span><span style={{ color: k.coral, fontWeight: 700 }}>LIVE</span>
        </div>
        <div style={{ padding: "26px 22px 24px", textAlign: "center", background: k.cream2 }}>
          <div style={{ fontFamily: typ, fontSize: 11.5, letterSpacing: 1.8, color: k.coral, fontWeight: 700, marginBottom: 14 }}>SCAN TO GET YOUR TOKEN</div>
          <div style={{ display: "flex", justifyContent: "center" }}><DemoQr seed="GATE-VISTA1-K7P2N9" size={168} /></div>
          <div style={{ fontSize: 13, color: k.mid, marginTop: 14 }}>Scan here to join the queue. No codes to type.</div>
        </div>
      </StoryTv>
      <StoryPhone glow>
        <div style={{ background: "#0B1020", height: 460, position: "relative", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "20px 16px 8px", color: "rgba(255,255,255,.72)", fontSize: 13, fontWeight: 600, textAlign: "center" }}>Point at the screen</div>
          <div style={{ flex: 1, margin: "10px 22px 36px", borderRadius: 18, overflow: "hidden", position: "relative", background: "#1a2238", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <DemoQr seed="GATE-VISTA1-K7P2N9" size={140} />
            <div style={{ position: "absolute", inset: 18, border: `2px solid ${k.coral}`, borderRadius: 14, pointerEvents: "none" }} />
            <div style={{ position: "absolute", left: 24, right: 24, height: 2, background: k.coral, animation: "scanSweep 1.8s ease-in-out infinite alternate", pointerEvents: "none" }} />
          </div>
          <div style={{ padding: "0 16px 24px", textAlign: "center", color: "#fff", fontSize: 13.5 }}>It scans by itself</div>
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
        <div style={{ padding: "30px 22px 26px", textAlign: "center", background: k.cream2 }}>
          <div style={{ display: "flex", justifyContent: "center", opacity: .9 }}><DemoQr seed={`ROT-${Math.ceil(left / 5)}`} size={150} /></div>
          <div style={{ fontSize: 14, color: k.coral, fontFamily: typ, marginTop: 14, fontWeight: 700 }}>REFRESHES IN {String(left).padStart(2, "0")}s</div>
        </div>
        <div style={{ padding: "16px 20px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: k.mid }}>
          <span>Now calling</span>
          <TokenChip token="W-013" name="M···a" size={32} muted />
        </div>
      </StoryTv>
      <StoryPhone glow>
        <div style={{ padding: "30px 22px 24px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: .9, textTransform: "uppercase", color: k.mid, marginBottom: 14 }}>Screenshot sent to a friend</div>
          <div style={{ border: `1px solid ${k.line}`, borderRadius: 14, padding: 16, marginBottom: 18, textAlign: "center", background: k.cream2 }}>
            <div style={{ opacity: .3, display: "flex", justifyContent: "center" }}><DemoQr seed="ROT-old" size={104} /></div>
          </div>
          <div style={{ background: k.redDim, border: `1px solid ${k.red}33`, borderRadius: 12, padding: "14px 15px" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: k.red, marginBottom: 4 }}>This code has expired</div>
            <div style={{ fontSize: 13, color: k.ink2, lineHeight: 1.45 }}>Scan the screen in the waiting room.</div>
          </div>
        </div>
      </StoryPhone>
    </StorySet>
  );
}

function StoryCheckin() {
  const rows = [
    ["Phone", "98480 11223"],
    ["Email", "priya.nair@email.com"],
    ["Experience", "1–3 years"],
    ["Resume", "priya_nair_cv.pdf"],
  ];
  return (
    <StorySet>
      <StoryPhone glow>
        <div style={{ background: k.ink, color: "#fff", padding: "14px 20px", fontFamily: typ, fontSize: 12, letterSpacing: 1.4, display: "flex", justifyContent: "space-between" }}>
          <span>YOUR FILE</span><span style={{ opacity: .7 }}>Vistaar</span>
        </div>
        <div style={{ padding: "22px 20px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <TokenTile token="014" size={56} pulse />
            <div>
              <div style={{ fontWeight: 700, fontSize: 20, lineHeight: 1.15, letterSpacing: -0.4 }}>Priya Nair</div>
              <div style={{ fontSize: 13, color: k.mid, marginTop: 4 }}>Token 014 · Voice Process Associate</div>
            </div>
          </div>
          {rows.map(([l, v]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "9px 0", borderTop: `1px solid ${k.line}`, fontSize: 13 }}>
              <span style={{ color: k.mid }}>{l}</span>
              <span style={{ fontWeight: 600, color: k.ink, display: "inline-flex", alignItems: "center", gap: 6 }}>
                {l === "Resume" ? <FileText size={13} color={k.coral} /> : null}
                {v}
              </span>
            </div>
          ))}
          <div style={{ marginTop: 14, background: k.cream2, borderRadius: 12, padding: "12px 14px", fontSize: 13.5, fontWeight: 600, color: k.ink2 }}>
            3 people ahead · about 24 minutes
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
  const rows = [
    ["Phone", "98480 11223"],
    ["Email", "priya.nair@email.com"],
    ["Experience", "1–3 years"],
    ["Resume", "priya_nair_cv.pdf"],
    ["HR screening", "Passed"],
    ["Operations", "Passed"],
  ];
  return (
    <StorySet>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, width: "min(420px, 100%)" }}>
        <div style={{
          width: "100%", background: "#fff", border: `1px solid ${k.line}`, borderRadius: 24, padding: "26px 26px 22px",
          boxShadow: "0 24px 50px -24px rgba(11,16,32,.28)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <TokenChip token="014" name="Priya Nair" size={48} />
            <div style={{ background: k.coralDim, color: k.coral, fontSize: 13, fontWeight: 700, padding: "6px 10px", borderRadius: 8 }}>Selected</div>
          </div>
          {rows.map(([l, v]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "8px 0", borderTop: `1px solid ${k.line}`, fontSize: 13.5 }}>
              <span style={{ color: k.mid }}>{l}</span>
              <span style={{ fontWeight: 600, color: k.ink, display: "inline-flex", alignItems: "center", gap: 6 }}>
                {l === "Resume" ? <FileText size={13} color={k.coral} /> : null}
                {v}
              </span>
            </div>
          ))}
          <div style={{ ...solid, width: "100%", justifyContent: "center", marginTop: 16, pointerEvents: "none" }}>Send this file to your ATS</div>
        </div>
        <div style={{ fontSize: 14, color: k.mid, fontWeight: 600, textAlign: "center", lineHeight: 1.45 }}>
          Name, contact details, resume, and round outcomes — not a list of who attended.
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          <button onClick={() => onLaunch("employer")} style={solid}>Set up a walk-in <ArrowRight size={16} /></button>
          <button onClick={replay} style={outline}><RotateCcw size={14} /> Replay</button>
        </div>
      </div>
    </StorySet>
  );
}

