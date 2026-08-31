import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { bdy, dsp, typ, input, k, iconBtn, chromeStrip } from "../theme.js";
import { CITIES } from "../lib/helpers.js";
import { Wordmark } from "./brand.jsx";

let closeOpenMenu = null;

function placeMenu(anchor, { minWidth, align = "start", maxHeight = 280 } = {}) {
  const r = anchor.getBoundingClientRect();
  const width = Math.min(Math.max(minWidth || r.width, r.width), window.innerWidth - 16);
  let left = r.left;
  if (align === "end") left = r.right - width;
  if (align === "center") left = r.left + r.width / 2 - width / 2;
  left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
  const spaceBelow = window.innerHeight - r.bottom - 8;
  const spaceAbove = r.top - 8;
  const openUp = spaceBelow < 160 && spaceAbove > spaceBelow;
  return {
    left,
    width,
    maxHeight: Math.min(maxHeight, Math.max(120, openUp ? spaceAbove : spaceBelow)),
    top: openUp ? undefined : r.bottom + 4,
    bottom: openUp ? window.innerHeight - r.top + 4 : undefined,
  };
}

/** Menu pinned to the trigger with fixed coords so overflow/transform parents cannot dump it at the page bottom. */
export function DropPanel({ anchorRef, open, onClose, children, minWidth, align = "start", maxHeight = 280, style }) {
  const [pos, setPos] = useState(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) { setPos(null); return; }
    const close = () => onCloseRef.current();
    const update = () => { if (anchorRef.current) setPos(placeMenu(anchorRef.current, { minWidth, align, maxHeight })); };
    update();
    if (closeOpenMenu && closeOpenMenu !== close) closeOpenMenu();
    closeOpenMenu = close;
    const onKey = (e) => { if (e.key === "Escape") close(); };
    const onDown = (e) => {
      if (e.target.closest?.("[data-drop-panel]")) return;
      if (anchorRef.current?.contains(e.target)) return;
      close();
    };
    const onScroll = (e) => {
      if (e.target?.closest?.("[data-drop-panel]")) return;
      const r = anchorRef.current?.getBoundingClientRect();
      if (!r || r.bottom < 0 || r.top > window.innerHeight) close();
      else update();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      if (closeOpenMenu === close) closeOpenMenu = null;
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, minWidth, align, maxHeight, anchorRef]);

  if (!open || !pos) return null;
  return createPortal(
    <div
      data-drop-panel
      style={{
        position: "fixed",
        zIndex: 400,
        left: pos.left,
        width: pos.width,
        maxHeight: pos.maxHeight,
        top: pos.top,
        bottom: pos.bottom,
        overflowY: "auto",
        background: "#fff",
        border: `1px solid ${k.line}`,
        borderRadius: 12,
        boxShadow: "0 18px 40px -20px rgba(17,19,24,.45)",
        padding: 6,
        ...style,
      }}
    >
      {children}
    </div>,
    document.body
  );
}

export function Select({ value, onChange, options, placeholder, style, disabled, searchable, "aria-label": ariaLabel }) {
  const btnRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const current = (options || []).find((o) => String(o.value) === String(value));
  const shown = (options || []).filter((o) => !searchable || !q.trim() || String(o.label).toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <>
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel || current?.label || placeholder}
        onClick={() => { setOpen((v) => !v); setQ(""); }}
        style={{
          ...input,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          textAlign: "left",
          cursor: disabled ? "default" : "pointer",
          ...style,
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: current ? k.ink : k.faint, flex: 1 }}>
          {current?.label || placeholder || "Select"}
        </span>
        <ChevronDown size={15} color={k.faint} style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "none" }} />
      </button>
      <DropPanel anchorRef={btnRef} open={open} onClose={() => { setOpen(false); setQ(""); }} minWidth={Math.max(180, (style && parseInt(style.minWidth, 10)) || 0)} maxHeight={searchable ? 360 : 280}>
        {searchable ? (
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Type to find a company"
            style={{ ...input, margin: "8px 8px 4px", width: "calc(100% - 16px)" }}
          />
        ) : null}
        {shown.map((o) => {
          const on = String(o.value) === String(value);
          return (
            <button
              key={String(o.value) + o.label}
              type="button"
              role="option"
              aria-selected={on}
              onClick={() => { onChange(o.value); setOpen(false); setQ(""); }}
              style={{
                display: "block", width: "100%", textAlign: "left", padding: "9px 11px", border: "none",
                borderRadius: 8, cursor: "pointer", fontFamily: bdy, fontSize: 13.5,
                background: on ? k.cream2 : "transparent", color: k.ink, fontWeight: on ? 600 : 500,
              }}
            >
              {o.label}
            </button>
          );
        })}
        {searchable && !shown.length ? (
          <div style={{ padding: "10px 12px", fontSize: 13, color: k.mid }}>No company matches that name.</div>
        ) : null}
      </DropPanel>
    </>
  );
}

export function Field({ label, children }) { return <label style={{ display: "flex", flexDirection: "column", gap: 5 }}><span style={{ fontSize: 12, color: k.mid, fontWeight: 600 }}>{label}</span>{children}</label>; }
export function CitySelect({ value, onChange, allowAll, placeholder = "Select a city" }) {
  const options = [
    ...(allowAll ? [{ value: "", label: "All cities" }] : []),
    ...(!allowAll && !value ? [{ value: "", label: placeholder }] : []),
    ...CITIES.map((c) => ({ value: c, label: c })),
  ];
  return <Select value={value} onChange={onChange} options={options} placeholder={placeholder} />;
}
export function SectionLabel({ children }) { return <div style={{ fontFamily: typ, fontSize: 10.5, letterSpacing: 1.2, color: k.mid, marginBottom: 9, fontWeight: 700 }}>{children.toString().toUpperCase()}</div>; }
export function Blank({ text }) { return <div style={{ color: k.faint, fontSize: 13.5, padding: "30px 16px", textAlign: "center", lineHeight: 1.5 }}>{text}</div>; }
export function RouteFallback() {
  return (
    <div style={{ minHeight: "60vh", display: "grid", placeItems: "center", fontFamily: bdy, color: k.faint, fontSize: 13.5 }}>
      Loading…
    </div>
  );
}
export function Head({ title, action }) { return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}><span style={{ fontFamily: dsp, fontSize: 15, fontWeight: 700 }}>{title}</span>{action}</div>; }
// Shared by the candidate and recruiter shells. It lives here rather than in the
// recruiter console so a candidate's phone doesn't download that whole bundle.
export function TopBar({ back, title, accent, tabs, tab, setTab }) {
  return (
    <div className="chrome-wrap" style={{ ...chromeStrip, padding: "0 16px" }}>
      <div className="chrome-inner" style={{ maxWidth: 720, margin: "0 auto", overflow: "hidden" }}>
        <div style={{ padding: "12px 18px", display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={back} style={{ ...iconBtn, display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600 }}><ArrowLeft size={15} /> Back</button>
          <span style={{ width: 1, height: 16, background: k.line }} />
          <Wordmark size={15} />
          <Pill tone={accent === k.teal ? "teal" : "coral"}>{title}</Pill>
        </div>
        {tabs && (
          <div className="tabscroll" style={{ padding: "0 10px", display: "flex", gap: 2, background: k.cream2, borderTop: `1px solid ${k.line}` }}>
            {tabs.map(([id, label]) => {
              const on = tab === id;
              return <button key={id} onClick={() => setTab(id)} style={{ padding: "12px 14px", minHeight: 44, border: "none", background: "none", cursor: "pointer", fontSize: 13.5, fontWeight: on ? 700 : 500, color: on ? accent : k.mid, borderBottom: `2px solid ${on ? accent : "transparent"}`, fontFamily: bdy, whiteSpace: "nowrap" }}>{label}</button>;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
export function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
export function StatusPill({ status }) {
  if (status === "live") return <Pill tone="teal">LIVE NOW</Pill>;
  if (status === "upcoming") return <Pill tone="gold">UPCOMING</Pill>;
  return <Pill tone="grey">CLOSED</Pill>;
}
export function Pill({ children, tone }) {
  const m = { grey: [k.cream2, k.mid], teal: [k.tealDim, k.teal], coral: [k.coralDim, k.coral], red: [k.redDim, k.red], gold: [k.goldDim, k.gold] }[tone] || [k.cream2, k.mid];
  return <span style={{ background: m[0], color: m[1], fontSize: 10.5, fontWeight: 700, padding: "3px 8px", borderRadius: 3, fontFamily: typ, letterSpacing: .3, whiteSpace: "nowrap" }}>{children}</span>;
}
export function Btn({ children, onClick, q }) {
  return <button onClick={onClick} style={{ padding: "6px 11px", borderRadius: 5, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: bdy, border: q ? `1px solid ${k.line}` : "none", background: q ? "#fff" : k.coral, color: q ? k.ink2 : "#fff", whiteSpace: "nowrap" }}>{children}</button>;
}
export function ActionSelect({ label, options, onPick }) {
  return (
    <Select
      value=""
      placeholder={label}
      onChange={(v) => { if (v) onPick(v); }}
      options={options || []}
      style={{ padding: "6px 10px", borderRadius: 5, fontSize: 12, fontWeight: 600, maxWidth: 160, width: "auto" }}
    />
  );
}
