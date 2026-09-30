import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bookmark, BookmarkCheck, CalendarDays, CircleAlert, CircleCheck, Clock, IndianRupee, MapPin, SearchX } from "lucide-react";
import { driveStatus, driveWhen, hoursLabel, datesLabel, shortDate, tokensOpen } from "../lib/status.js";
import { checkinStatusLine, drivePath, expLabel, hasPay, monogram, payText, queueStats, venueLine, waitLabel } from "../lib/listing.js";
import { onSavedChange, readSaved, removeSaved, toggleSaved } from "../lib/saved.js";
import { t } from "../i18n/strings.js";
import { formatNumber } from "../lib/time.js";

export const STROKE = 1.75;

export function Btn({ to, href, onClick, variant = "primary", size, block, icon: Icon, iconRight: IconRight, children, className = "", type = "button", ...rest }) {
  const cls = ["btn", `btn-${variant}`, size && `btn-${size}`, block && "btn-block", className].filter(Boolean).join(" ");
  const inner = (
    <>
      {Icon && <Icon size={size === "sm" ? 16 : 18} strokeWidth={STROKE} aria-hidden="true" />}
      {children}
      {IconRight && <IconRight size={size === "sm" ? 16 : 18} strokeWidth={STROKE} aria-hidden="true" />}
    </>
  );
  if (to) return <Link to={to} className={cls} onClick={onClick} {...rest}>{inner}</Link>;
  if (href) return <a href={href} className={cls} onClick={onClick} {...rest}>{inner}</a>;
  return <button type={type} className={cls} onClick={onClick} {...rest}>{inner}</button>;
}

export function LiveDot({ lime, label }) {
  return <span className={`live-dot${lime ? " lime" : ""}`} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : "true"} />;
}

/** Today / Tomorrow / This week / Ended, as a candidate sees it. */
export function WhenChip({ drive, now }) {
  const w = driveWhen(drive, now);
  const label = w.key === "later" ? w.label : t(`status.${w.key}`);
  return <span className={`status status-${w.key}`}>{label}</span>;
}

/** Draft / Scheduled / Live / Wrapped up, as the company sees it. */
export function StatusChip({ drive, now }) {
  const s = driveStatus(drive, now);
  return <span className={`status status-${s}`}>{t(`status.${s}`)}</span>;
}

export function QueueBar({ value, max, lime, label }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div className={`qbar${lime ? " lime" : ""}`} role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-label={label}>
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Monogram({ name, color, size = 44 }) {
  return (
    <span className="monogram" aria-hidden="true" style={{ background: color || "var(--primary)", width: size, height: size, fontSize: Math.round(size * 0.38), borderRadius: Math.round(size * 0.28) }}>
      {monogram(name)}
    </span>
  );
}

export function Skeleton({ h = 16, w = "100%", r, style }) {
  return <span className="skeleton" aria-hidden="true" style={{ display: "block", height: h, width: w, borderRadius: r, ...style }} />;
}

export function CardSkeleton() {
  return (
    <div className="card wcard" aria-hidden="true">
      <div className="row gap-12"><Skeleton h={44} w={44} r={12} /><div className="stack gap-8 grow"><Skeleton h={16} w="70%" /><Skeleton h={12} w="40%" /></div></div>
      <Skeleton h={12} w="85%" /><Skeleton h={12} w="60%" /><Skeleton h={12} w="50%" />
      <div className="wcard-foot"><Skeleton h={12} w="40%" /><Skeleton h={36} w={120} r={999} /></div>
    </div>
  );
}

export function EmptyState({ icon: Icon = SearchX, title, body, action }) {
  return (
    <div className="empty card">
      <Icon size={36} strokeWidth={STROKE} aria-hidden="true" />
      <p className="h-3">{title}</p>
      {body && <p className="body muted" style={{ maxWidth: 420 }}>{body}</p>}
      {action}
    </div>
  );
}

const ToastCtx = createContext(() => {});

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((text, kind = "ok", extra = {}) => {
    const id = Math.random().toString(36).slice(2);
    const hold = extra.undo ? 8000 : 3200;
    setItems((p) => [...p.slice(-2), { id, text, kind, undo: extra.undo }]);
    setTimeout(() => setItems((p) => p.filter((x) => x.id !== id)), hold);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {items.map((x) => (
          <div key={x.id} className={`toast ${x.kind}`}>
            {x.kind === "err" ? <CircleAlert size={18} strokeWidth={STROKE} /> : <CircleCheck size={18} strokeWidth={STROKE} />}
            <span>{x.text}</span>
            {x.undo && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => { x.undo(); setItems((p) => p.filter((i) => i.id !== x.id)); }}>
                {t("buttons.undo")}
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);

const reduced = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function Reveal({ as: Tag = "div", delay = 0, className = "", children, ...rest }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(reduced);
  useEffect(() => {
    if (shown || !ref.current || typeof IntersectionObserver === "undefined") { setShown(true); return undefined; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }, { rootMargin: "0px 0px -8% 0px" });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [shown]);
  return <Tag ref={ref} className={`reveal${shown ? " in" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }} {...rest}>{children}</Tag>;
}

export function CountUp({ value, format = (n) => formatNumber(n) }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    if (reduced() || from.current === value) { from.current = value; setShown(value); return undefined; }
    const start = performance.now();
    const a = from.current;
    let raf;
    const step = (now) => {
      const p = Math.min(1, (now - start) / 700);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(a + (value - a) * eased));
      if (p < 1) raf = requestAnimationFrame(step);
      else from.current = value;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{format(shown)}</>;
}

/** Saved drives live on the device only. Every mounted copy stays in step. */
export function useSaved() {
  const [items, setItems] = useState(readSaved);
  useEffect(() => onSavedChange(() => setItems(readSaved())), []);
  const toggle = useCallback((id) => { toggleSaved(id); }, []);
  const remove = useCallback((ids) => { removeSaved(ids); }, []);
  return useMemo(() => {
    const ids = items.map((x) => x.id);
    return { items, ids, count: ids.length, has: (id) => ids.includes(id), toggle, remove };
  }, [items, toggle, remove]);
}

export function joinPath(drive) {
  return `/check-in/${encodeURIComponent(drive.id)}`;
}

export function registerPath(drive) {
  return `/app/join?drive=${encodeURIComponent(drive.id)}&register=1`;
}

export function QueueLine({ drive }) {
  const q = queueStats(drive);
  if (!tokensOpen(drive)) return null;
  if (!q.waiting) return <span className="small muted row gap-8"><LiveDot /> {t("card.noQueue")}</span>;
  const wait = waitLabel(q.estMin);
  return (
    <span className="row gap-10" style={{ gap: 10 }}>
      <LiveDot />
      <span className="stack" style={{ lineHeight: 1.3 }}>
        <b className="small" style={{ color: "var(--ink)" }}>{t("card.inQueue", { n: q.waiting })}</b>
        {wait ? <span className="tiny muted">{t("card.wait", { w: wait })}</span> : null}
      </span>
    </span>
  );
}

/** "Today, 10:00 AM to 4:00 PM IST" or "12 Oct, 10:00 AM to 4:00 PM IST". */
export function whenText(drive) {
  const w = driveWhen(drive);
  return t("time.when", { day: w.key === "today" || w.key === "tomorrow" ? w.label : datesLabel(drive), hours: hoursLabel(drive) });
}

export function DriveRow({ drive, saved }) {
  const pay = payText(drive);
  return (
    <article className="drive-row">
      <Monogram name={drive.company} color={drive.brand?.color} size={40} />
      <div className="drive-row-main grow">
        <div className="row gap-8" style={{ alignItems: "baseline", flexWrap: "wrap" }}>
          <h3 className="drive-row-title clamp-1" style={{ margin: 0 }}>
            <Link to={drivePath(drive)} className="cover-link">{drive.role}</Link>
          </h3>
          <span className="small muted">{drive.company}</span>
        </div>
        <p className="tiny muted" style={{ margin: "2px 0 0" }}>{venueLine(drive)} · {whenText(drive)}</p>
        <div className="row gap-8 wrap-row" style={{ marginTop: 6 }}>
          {hasPay(drive) ? <span className="small strong">{pay}</span> : <span className="tiny muted">{pay}</span>}
          <span className="tag">{expLabel(drive)}</span>
          <span className="tiny muted">{checkinStatusLine(drive)}</span>
        </div>
      </div>
      <Btn size="sm" variant="secondary" to={drivePath(drive)} className="drive-row-cta">{t("card.viewDetails")}</Btn>
    </article>
  );
}

export function DriveCard({ drive, saved }) {
  const nav = useNavigate();
  const live = tokensOpen(drive);
  const ended = driveStatus(drive) === "wrapped";
  const pay = payText(drive);
  return (
    <article className="card card-lift wcard" style={{ position: "relative" }}>
      <div className="row gap-12" style={{ alignItems: "flex-start" }}>
        <Monogram name={drive.company} color={drive.brand?.color} />
        <div className="grow">
          <h3 className="wcard-title clamp-2">
            <Link to={drivePath(drive)} style={{ textDecoration: "none" }} className="cover-link">{drive.role}</Link>
          </h3>
          <p className="small muted" style={{ margin: "4px 0 0" }}>{drive.company}</p>
        </div>
      </div>
      <div className="wrap-row gap-6">
        <WhenChip drive={drive} />
        <span className="tag">{expLabel(drive)}</span>
        {drive.roleType && <span className="tag hide-mobile">{drive.roleType}</span>}
        {!import.meta.env.PROD && drive.board && <span className="tag" title={t("card.demoHint")}>{t("card.demo")}</span>}
      </div>
      <div className="wcard-meta">
        <MapPin size={16} strokeWidth={STROKE} aria-hidden="true" /><span>{venueLine(drive)}</span>
        <CalendarDays size={16} strokeWidth={STROKE} aria-hidden="true" /><span>{whenText(drive)}</span>
        <IndianRupee size={16} strokeWidth={STROKE} aria-hidden="true" />
        {hasPay(drive) ? <span className="strong" style={{ fontWeight: 600 }}>{pay}</span> : <span className="muted">{pay}</span>}
      </div>
      <div className="wcard-foot">
        <div className="grow">
          {live ? <QueueLine drive={drive} /> : <span className="small muted row gap-8"><Clock size={15} strokeWidth={STROKE} aria-hidden="true" />{ended ? t("card.ended") : t("card.opensLater", { when: shortDate(drive.date) })}</span>}
        </div>
        <Btn size="sm" onClick={() => nav(drivePath(drive))} style={{ position: "relative", zIndex: 1 }}>{t("card.viewDetails")}</Btn>
      </div>
    </article>
  );
}

export function TokenTicket({ number, label = t("token.yourToken"), company, role, hot, called, top, children, size = 112 }) {
  return (
    <div className={`ticket${hot ? " hot" : ""}${called ? " called" : ""}`}>
      <div className="ticket-top">
        {top || (
          <div className="row between gap-12">
            <div className="grow">
              <p className="tiny strong" style={{ margin: 0, color: called ? "#0B1020" : "var(--muted)", fontWeight: 600 }}>{company}</p>
              <p className="h-4 clamp-2" style={{ margin: "2px 0 0", color: called ? "#0B1020" : undefined }}>{role}</p>
            </div>
          </div>
        )}
      </div>
      <div className="ticket-tear" />
      <div className="ticket-body">
        <p className="tiny" style={{ margin: 0, fontWeight: 600, color: called ? "#0B1020" : "var(--muted)", textTransform: "uppercase", letterSpacing: ".08em" }}>{label}</p>
        <p className="ticket-num" style={{ fontSize: size, margin: "8px 0 0" }}>{number}</p>
        {children}
      </div>
    </div>
  );
}
