import { dsp, bdy, k } from "../theme.js";

export function TokenMark({ size = 28, light }) {
  const face = light ? "#fff" : k.coral;
  const fig = light ? k.coral : "#fff";
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0, display: "block" }} aria-hidden="true">
      <rect x="1.75" y="1.75" width="44.5" height="44.5" rx="13" fill={face} />
      <g fill={fig}>
        <circle cx="12.35" cy="21.15" r="3.85" />
        <path d="M8.55 39.4V28.55c0-2.05 1.7-3.7 3.8-3.7s3.8 1.65 3.8 3.7V39.4Z" />
        <circle cx="22.15" cy="19.55" r="4.2" />
        <path d="M17.85 39.4V27.05c0-2.3 1.92-4.15 4.3-4.15s4.3 1.85 4.3 4.15V39.4Z" />
        <circle cx="32.35" cy="18.15" r="4.55" />
        <path d="M27.6 39.4V25.65c0-2.5 2.12-4.5 4.75-4.5s4.75 2 4.75 4.5V39.4Z" />
      </g>
      <rect x="36.2" y="23.35" width="7.4" height="10.15" rx="1.65" fill={fig} stroke={face} strokeWidth="1.4" />
      <circle cx="39.9" cy="26.55" r="1.28" fill={face} />
      <path d="M37.35 30.85h5.1" stroke={face} strokeWidth="1.15" strokeLinecap="round" />
    </svg>
  );
}

export function Wordmark({ size = 18, light, bare = false }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: size * 0.38, fontFamily: dsp, fontSize: size * 1.22, letterSpacing: -0.55, color: light ? "#fff" : k.ink }}>
      {!bare && <TokenMark size={Math.round(size * 1.78)} light={light} />}
      <span style={{ lineHeight: 1 }}>
        <b style={{ fontWeight: 800 }}>Token</b>
        <span style={{ fontWeight: 700, color: light ? "rgba(255,255,255,.9)" : k.coral }}>Hire</span>
      </span>
    </span>
  );
}

export function OrgLogo({ name, color, logo = "letter", size = 34 }) {
  const n = ((name || "?").trim() || "?")[0].toUpperCase();
  const c = color || k.coral;
  const r = Math.round(size * (logo === "ring" || logo === "diamond" ? 0.5 : logo === "tile" ? 0.18 : 0.28));
  const fs = Math.round(size * 0.42);
  const base = { width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: dsp, fontWeight: 800, color: "#fff", flexShrink: 0, fontSize: fs, letterSpacing: -0.4, position: "relative", overflow: "hidden" };
  if (logo === "ring") {
    return (
      <div style={{ ...base, borderRadius: "50%", background: "transparent", border: `${Math.max(2, Math.round(size * 0.08))}px solid ${c}`, color: c }}>{n}</div>
    );
  }
  if (logo === "diamond") {
    return (
      <div style={{ width: size, height: size, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ ...base, width: size * 0.78, height: size * 0.78, borderRadius: 6, background: c, transform: "rotate(45deg)" }}>
          <span style={{ transform: "rotate(-45deg)", display: "block" }}>{n}</span>
        </div>
      </div>
    );
  }
  if (logo === "bars") {
    return (
      <div style={{ ...base, borderRadius: r, background: c }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: "22%", height: "10%", background: "rgba(255,255,255,.28)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: "68%", height: "10%", background: "rgba(255,255,255,.18)" }} />
        <span style={{ position: "relative" }}>{n}</span>
      </div>
    );
  }
  if (logo === "tile") {
    return <div style={{ ...base, borderRadius: r, background: c, boxShadow: `inset 0 0 0 ${Math.max(2, Math.round(size * 0.07))}px rgba(255,255,255,.35)` }}>{n}</div>;
  }
  if (logo === "split") {
    return (
      <div style={{ ...base, borderRadius: r, background: c }}>
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${c} 50%, rgba(0,0,0,.22) 50%)` }} />
        <span style={{ position: "relative" }}>{n}</span>
      </div>
    );
  }
  return <div style={{ ...base, borderRadius: r, background: c }}>{n}</div>;
}

export function OrgMark({ name, color, size = 34, logo }) {
  return <OrgLogo name={name} color={color} size={size} logo={logo} />;
}

export function HallBrand({ name, color, light, powered = true, credit, sub, logo, size = 26 }) {
  const title = sub ? `${name} · ${sub}` : name;
  const mark = credit || (powered === false ? "off" : powered === "tiny" ? "tiny" : "on");
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
      <OrgLogo name={name} color={color} size={size} logo={logo} />
      <span style={{ fontFamily: dsp, fontWeight: 700, fontSize: 16, color: light ? "#fff" : k.ink }}>{title}</span>
      {mark === "on" && <span style={{ fontSize: 11, fontWeight: 600, color: light ? "rgba(255,255,255,.7)" : k.coral, marginLeft: 2 }}>Powered by TokenHire</span>}
      {mark === "tiny" && <span style={{ fontSize: 9, color: light ? "rgba(255,255,255,.32)" : k.faint, marginLeft: 2 }}>TokenHire</span>}
    </div>
  );
}

/* Physical walk-in token: same rounded-square face as TokenMark, number instead of the queue. */
export function tokenDigits(token = "") {
  const s = String(token);
  const m = s.match(/(\d+)\s*$/);
  return m ? m[1] : s.replace(/^W-/i, "") || s;
}

export function TokenTile({ token, size = 36, color = k.coral, light = false, pulse = false }) {
  const face = light ? "#fff" : (color || k.coral);
  const ink = light ? (color || k.coral) : "#fff";
  const n = tokenDigits(token);
  const fs = n.length > 3 ? size * 0.30 : size * 0.36;
  return (
    <span
      role="img"
      aria-label={String(token)}
      title={String(token)}
      style={{
        width: size, height: size, minWidth: size, minHeight: size, maxWidth: size, maxHeight: size,
        borderRadius: Math.round(size * 0.25), boxSizing: "border-box",
        background: face, color: ink, display: "inline-flex", alignItems: "center", justifyContent: "center",
        fontFamily: dsp, fontWeight: 800, fontSize: Math.max(10, Math.round(fs)),
        letterSpacing: n.length > 2 ? -0.6 : 0, flexShrink: 0, lineHeight: 1,
        animation: pulse ? "blink 1.8s infinite" : "none",
      }}
    >{n}</span>
  );
}

export function TokenChip({ token, name, size = 36, color, light, pulse, muted, nameSize }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: Math.max(8, Math.round(size * 0.28)), minWidth: 0 }}>
      <TokenTile token={token} size={size} color={color} light={light} pulse={pulse} />
      {name != null && name !== "" && (
        <span style={{
          fontFamily: bdy, fontWeight: 600, fontSize: nameSize || Math.max(13, Math.round(size * 0.38)),
          color: light ? "#fff" : muted ? k.mid : k.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.25,
        }}>{name}</span>
      )}
    </span>
  );
}
