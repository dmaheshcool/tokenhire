import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Maximize2, Volume2, VolumeX } from "lucide-react";
import { useStore } from "../context/Store.jsx";
import { dsp, typ, k } from "../theme.js";
import QrCode from "../components/QrCode.jsx";
import { bare6, gateUrl, hallName, liveDesk, mask, orgColor, tat } from "../lib/helpers.js";

const BG = "#080B14";
const PANEL = "#111629";
const LINE = "#232A44";

export default function TvScreenPage() {
  const { driveId } = useParams();
  const [params] = useSearchParams();
  const { drives, orgs, left } = useStore();
  const [speak, setSpeak] = useState(false);
  const spokenRef = useRef(new Set());
  const wrapRef = useRef(null);

  const drive = useMemo(
    () => drives.find((d) => d.id === driveId) || drives.find((d) => bare6(d.gate) === bare6(params.get("g") || "")),
    [drives, driveId, params],
  );

  const org = orgs.find((o) => o.id === drive?.orgId);
  const accent = orgColor(org, drive);
  const calling = (drive?.candidates || []).filter((c) => c.state === "calling");
  const waiting = useMemo(
    () => (drive?.candidates || []).filter((c) => c.state === "wait").sort((a, b) => a.at - b.at),
    [drive],
  );
  const avg = drive ? tat(drive) : 8;

  // Announce each token once, so a candidate who looked away still hears their number.
  useEffect(() => {
    if (!speak || !("speechSynthesis" in window)) return;
    for (const c of calling) {
      if (spokenRef.current.has(c.id)) continue;
      spokenRef.current.add(c.id);
      const room = c.room ? `, room ${c.room}` : "";
      const u = new SpeechSynthesisUtterance(`Token ${String(c.token).split("").join(" ")}${room}. Please proceed to the desk.`);
      u.rate = 0.85;
      u.lang = "en-IN";
      window.speechSynthesis.speak(u);
    }
  }, [calling, speak]);

  function enableSound() {
    setSpeak((s) => !s);
    // Prime the queue inside the click so iOS/Safari treats later speech as user-initiated.
    if (!speak && "speechSynthesis" in window) {
      window.speechSynthesis.speak(new SpeechSynthesisUtterance("Announcements on."));
      calling.forEach((c) => spokenRef.current.add(c.id));
    }
  }

  if (!drive) {
    return (
      <div style={{ minHeight: "100vh", background: BG, color: "#fff", display: "grid", placeItems: "center", fontFamily: dsp, padding: 30, textAlign: "center" }}>
        <div>
          <div style={{ fontSize: 30, fontWeight: 800, marginBottom: 10 }}>No live walk-in on this screen</div>
          <div style={{ color: "#8A93AE", fontSize: 16 }}>Open this screen from the recruiter console so it knows which drive to show.</div>
        </div>
      </div>
    );
  }

  const desk = liveDesk(drive);

  return (
    <div ref={wrapRef} style={{ minHeight: "100vh", background: BG, color: "#fff", fontFamily: dsp, padding: "clamp(14px, 2vw, 30px)", display: "flex", flexDirection: "column", gap: "clamp(12px, 1.6vw, 22px)" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: "clamp(20px, 2.4vw, 38px)", fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.1 }}>
            {hallName(drive, org)}
          </div>
          <div style={{ color: "#8A93AE", fontSize: "clamp(12px, 1.1vw, 17px)", marginTop: 4 }}>
            {drive.role || "Walk-in interviews"}{drive.city ? ` · ${drive.city}` : ""}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Clock />
          <button onClick={enableSound} title="Voice announcements" style={btn(accent, speak)}>
            {speak ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button onClick={() => wrapRef.current?.requestFullscreen?.()} title="Fullscreen" style={btn(accent, false)}>
            <Maximize2 size={16} />
          </button>
        </div>
      </header>

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "minmax(0, 2.1fr) minmax(240px, 1fr)", gap: "clamp(12px, 1.6vw, 22px)", alignItems: "stretch" }} className="tv-grid">
        <section style={{ display: "flex", flexDirection: "column", gap: "clamp(12px, 1.6vw, 22px)", minWidth: 0 }}>
          <div style={{ background: PANEL, border: `2px solid ${accent}`, borderRadius: 18, padding: "clamp(14px, 1.6vw, 26px)", flex: "0 0 auto" }}>
            <Label color={accent}>Now calling</Label>
            {!calling.length ? (
              <div style={{ color: "#6C7593", fontSize: "clamp(16px, 1.6vw, 26px)", padding: "18px 0", fontWeight: 600 }}>
                Nobody is being called yet.
              </div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(12px, 1.4vw, 26px)", marginTop: 12 }}>
                {calling.slice(0, 4).map((c) => (
                  <div key={c.id} style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: typ, fontWeight: 700, fontSize: "clamp(46px, 8vw, 132px)", lineHeight: 1, color: accent, letterSpacing: -2, animation: "tvpulse 1.6s ease-in-out infinite" }}>
                      {c.token}
                    </div>
                    <div style={{ color: "#C6CCE0", fontSize: "clamp(13px, 1.2vw, 20px)", marginTop: 8, fontWeight: 600 }}>
                      {mask(c.name)}{c.room ? ` · ${c.room}` : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: 18, overflow: "hidden", flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "clamp(10px, 1.1vw, 18px) clamp(14px, 1.6vw, 26px)", borderBottom: `1px solid ${LINE}`, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <Label color="#8A93AE">Up next</Label>
              <span style={{ fontFamily: typ, color: "#8A93AE", fontSize: "clamp(12px, 1.1vw, 17px)" }}>{waiting.length} waiting</span>
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              {!waiting.length ? (
                <div style={{ color: "#6C7593", padding: "clamp(14px, 1.6vw, 26px)", fontSize: "clamp(14px, 1.3vw, 20px)" }}>Queue is empty.</div>
              ) : waiting.slice(0, 8).map((c, i) => (
                <div key={c.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center", padding: "clamp(8px, 0.9vw, 15px) clamp(14px, 1.6vw, 26px)", borderBottom: `1px solid ${LINE}` }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 14, minWidth: 0 }}>
                    <span style={{ fontFamily: typ, fontWeight: 700, fontSize: "clamp(20px, 2.4vw, 40px)", color: i === 0 ? accent : "#E8EBF5", letterSpacing: -0.5 }}>{c.token}</span>
                    <span style={{ color: "#8A93AE", fontSize: "clamp(12px, 1.1vw, 18px)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{mask(c.name)}</span>
                  </div>
                  <span style={{ fontFamily: typ, fontSize: "clamp(12px, 1.2vw, 19px)", color: i === 0 ? accent : "#6C7593" }}>~{i * avg + avg}m</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside style={{ display: "flex", flexDirection: "column", gap: "clamp(12px, 1.6vw, 22px)" }}>
          <div style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: 18, padding: "clamp(14px, 1.4vw, 22px)", textAlign: "center" }}>
            <Label color="#8A93AE">Scan to join</Label>
            <div style={{ display: "grid", placeItems: "center", marginTop: 12 }}>
              <div style={{ background: "#fff", padding: 10, borderRadius: 12 }}>
                <QrCode value={gateUrl(drive.gate)} size={168} alt="Scan to join this walk-in" />
              </div>
            </div>
            <div style={{ fontFamily: typ, fontSize: "clamp(15px, 1.4vw, 22px)", fontWeight: 700, letterSpacing: 2, marginTop: 12 }}>{drive.gate}</div>
          </div>

          <div style={{ background: `${accent}1F`, border: `2px solid ${accent}`, borderRadius: 18, padding: "clamp(14px, 1.4vw, 22px)", textAlign: "center" }}>
            <Label color={accent}>Desk code</Label>
            <div style={{ fontFamily: typ, fontSize: "clamp(28px, 3.4vw, 56px)", fontWeight: 700, letterSpacing: 4, marginTop: 8, lineHeight: 1 }}>{desk}</div>
            <div style={{ color: "#8A93AE", fontFamily: typ, fontSize: "clamp(11px, 1vw, 15px)", marginTop: 10 }}>CHANGES IN {left}s</div>
            <div style={{ color: "#C6CCE0", fontSize: "clamp(11px, 1vw, 15px)", marginTop: 8, lineHeight: 1.45 }}>
              Type this on your phone to check in. It only works inside this room.
            </div>
          </div>

          <div style={{ marginTop: "auto", color: "#4E5675", fontSize: "clamp(10px, 0.9vw, 14px)", textAlign: "center", lineHeight: 1.5 }}>
            Names are hidden on this screen. Powered by TokenHire.
          </div>
        </aside>
      </div>

      <style>{`
        @keyframes tvpulse { 0%,100% { opacity: 1 } 50% { opacity: .45 } }
        @media (max-width: 820px) { .tv-grid { grid-template-columns: 1fr !important } }
      `}</style>
    </div>
  );
}

function Label({ children, color }) {
  return (
    <div style={{ fontFamily: typ, fontSize: "clamp(11px, 1vw, 15px)", letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, color }}>
      {children}
    </div>
  );
}

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000 * 20);
    return () => clearInterval(t);
  }, []);
  return (
    <span style={{ fontFamily: typ, fontSize: "clamp(14px, 1.4vw, 22px)", color: "#8A93AE" }}>
      {now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
    </span>
  );
}

function btn(accent, on) {
  return {
    display: "inline-flex", alignItems: "center", justifyContent: "center", width: 38, height: 38,
    borderRadius: 10, cursor: "pointer", color: on ? "#fff" : "#8A93AE",
    background: on ? accent : "transparent", border: `1px solid ${on ? accent : LINE}`,
  };
}
