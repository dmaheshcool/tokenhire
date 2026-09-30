import { useEffect, useRef, useState } from "react";
import { Clock, DoorOpen, ScanLine, Users } from "lucide-react";
import { CountUp, STROKE } from "./ds.jsx";
import { api } from "../lib/api.js";
import { waitAvgLabel } from "../lib/live-stats.js";
import { t } from "../i18n/strings.js";

export function useLiveStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let timer = 0;
    let cancelled = false;
    const pull = async () => {
      try {
        const r = await api.liveStats();
        if (cancelled || r?.open == null) return;
        setStats({
          open: r.open,
          queue: r.queue,
          today: r.today,
          waitMin: r.waitMin ?? null,
          cities: r.cities || {},
          at: Date.now(),
        });
      } catch {
        /* keep last known */
      }
    };
    const tick = () => {
      if (document.visibilityState === "hidden") return;
      pull();
    };
    tick();
    timer = window.setInterval(tick, 15_000);
    const onVis = () => { if (document.visibilityState === "visible") tick(); };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return stats;
}

function useAgo(at) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  if (!at) return "";
  const ago = Math.max(0, Math.round((now - at) / 1000));
  return ago < 3 ? t("live.updatedNow") : t("live.updatedAgo", { n: ago });
}

export function LivePill() {
  return (
    <span className="live-pulse-pill">
      <span className="live-pulse-dot" />
      <span className="live-pulse-text">{t("live.pillLive")}</span>
    </span>
  );
}

export function LiveOpenPill({ size = "sm" }) {
  const stats = useLiveStats();
  if (!stats) return null;
  return (
    <span className={`live-open-pill live-open-pill-${size}`} role="status" aria-label={t("live.pillAria", { n: stats.open })}>
      <span className="live-pulse-dot" />
      <span className="live-pulse-text">{t("live.pillLive")}</span>
      <span className="tabular"><CountUp value={stats.open} /> {t("live.pillOpen")}</span>
    </span>
  );
}

export function LiveHeroRow() {
  const stats = useLiveStats();
  const updated = useAgo(stats?.at);
  const items = [
    { key: "open", label: t("live.statOpenShort") },
    { key: "queue", label: t("live.statQueueShort") },
    { key: "today", label: t("live.today") },
  ];
  return (
    <div className="live-bar" aria-label={t("live.rightNow")}>
      <div className="live-bar-head">
        <LivePill />
        <p className="live-bar-updated">{updated}</p>
      </div>
      <span className="live-bar-rule live-bar-rule-after-pill" aria-hidden="true" />
      <div className="live-bar-stats">
        {items.map(({ key, label }, i) => (
          <div key={key} className="live-bar-stat">
            {i > 0 && <span className="live-bar-rule" aria-hidden="true" />}
            <span className="live-bar-n tabular">{stats ? <CountUp value={stats[key]} /> : "\u2014"}</span>
            <span className="live-bar-l">{label}</span>
          </div>
        ))}
      </div>
      <p className="live-bar-updated live-bar-updated-end">{updated}</p>
    </div>
  );
}

export function LiveBrowsePanel({ stats, openNow, queueSort, onOpen, onQueue }) {
  const updated = useAgo(stats?.at);
  const wait = waitAvgLabel(stats?.waitMin);
  const panel = useRef(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const el = panel.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting), { threshold: 0, rootMargin: "-80px 0px 0px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const tiles = [
    { key: "open", icon: DoorOpen, tone: "green", n: stats?.open, label: t("live.tileOpen"), pressed: openNow, onClick: onOpen },
    { key: "queue", icon: Users, tone: "blue", n: stats?.queue, label: t("live.tileQueue"), pressed: queueSort, onClick: onQueue },
    wait ? { key: "wait", icon: Clock, tone: "amber", text: wait, label: t("live.tileWait") } : null,
    { key: "today", icon: ScanLine, tone: "slate", n: stats?.today, label: t("live.tileToday") },
  ].filter(Boolean);

  return (
    <>
      <div ref={panel} className="live-panel">
        <div className="live-panel-head">
          <LivePill />
          <p className="live-bar-updated">{updated}</p>
        </div>
        <div className="live-tiles">
          {tiles.map((tile) => {
            const Icon = tile.icon;
            const inner = (
              <>
                <span className={`live-tile-icon ${tile.tone}`} aria-hidden="true">
                  <Icon size={18} strokeWidth={STROKE} />
                </span>
                <p className="live-tile-n tabular">{tile.text ?? (tile.n == null ? "\u2014" : <CountUp value={tile.n} />)}</p>
                <p className="live-tile-l">{tile.label}</p>
              </>
            );
            if (tile.onClick) {
              return (
                <button
                  key={tile.key}
                  type="button"
                  className={`live-tile${tile.pressed ? " on" : ""}`}
                  role="button"
                  aria-pressed={!!tile.pressed}
                  onClick={tile.onClick}
                >
                  {inner}
                </button>
              );
            }
            return <div key={tile.key} className="live-tile">{inner}</div>;
          })}
        </div>
      </div>
      {stats && (
        <div className={`live-sticky${stuck ? " on" : ""}`} aria-hidden={!stuck}>
          <span className="live-pulse-dot" />
          <span className="live-sticky-live">{t("live.pillLive")}</span>
          <span className="live-sticky-full">{t("live.sticky", { open: stats.open, queue: stats.queue })}</span>
          <span className="live-sticky-short">{t("live.stickyShort", { open: stats.open, queue: stats.queue })}</span>
        </div>
      )}
    </>
  );
}
