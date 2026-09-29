import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarPlus, Play } from "lucide-react";
import { Btn, EmptyState, QueueBar, StatusChip, whenText } from "../../components/ds.jsx";
import { PageHead, useConsole } from "../../layouts/ConsoleLayout.jsx";
import { useMeta } from "../../hooks/useMeta.js";
import { queueStats, venueLine } from "../../lib/listing.js";
import { clock, datesLabel, driveStatus, driveWhen, hoursLabel, startNowPatch } from "../../lib/status.js";
import { t } from "../../i18n/strings.js";

export function QueueSummary({ drive, big }) {
  const q = queueStats(drive);
  const done = q.seen + q.noShow;
  const total = q.waiting + q.inRound + done;
  return (
    <div className="stack gap-8">
      {big && (
        <p style={{ margin: 0 }}>
          <span className="mono" style={{ fontSize: 48, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1 }}>{q.waiting}</span>
          <span className="body muted"> {t("detail.inQueue")}</span>
        </p>
      )}
      <p className="small" style={{ margin: 0, color: "var(--ink-2)" }}>
        {t("console.today.inQueue", { n: q.waiting })} · {t("console.today.inRound", { n: q.inRound })} · {t("console.today.seen", { n: q.seen })}
      </p>
      <QueueBar value={done} max={total} label={t("console.today.done", { done, total })} />
    </div>
  );
}

function TodayCard({ drive, setDrives }) {
  const nav = useNavigate();
  const status = driveStatus(drive);
  const open = () => nav(`/app/drives/${drive.id}`);
  const startNow = () => setDrives((p) => p.map((d) => (d.id === drive.id ? { ...d, ...startNowPatch(d) } : d)));
  return (
    <article className="card card-pad stack gap-16">
      <div className="row between gap-8">
        <StatusChip drive={drive} />
        <span className="small muted">{status === "live" ? hoursLabel(drive) : driveWhen(drive).key === "today" ? t("console.today.startsAt", { time: clock(drive.startTime) }) : whenText(drive)}</span>
      </div>
      <div>
        <h2 className="h-3">{drive.role}</h2>
        <p className="small muted" style={{ margin: "4px 0 0" }}>{venueLine(drive) || drive.venue}{drive.clientName ? ` · ${drive.clientName}` : ""}</p>
      </div>
      <QueueSummary drive={drive} big />
      <div className="row gap-8" style={{ marginTop: "auto", flexWrap: "wrap" }}>
        {status === "live"
          ? <Btn icon={Play} onClick={open}>{t("console.today.run")}</Btn>
          : <>
            <Btn variant="secondary" onClick={startNow}>{t("console.today.startNow")}</Btn>
            <Btn variant="ghost" onClick={open}>{t("console.today.viewQueue")}</Btn>
          </>}
      </div>
    </article>
  );
}

export default function TodayPage() {
  const { mine, setDrives, desk } = useConsole();
  useMeta({ title: t("console.today.title") });
  const { now, next } = useMemo(() => {
    const active = mine.filter((d) => driveStatus(d) === "live" || (driveWhen(d).key === "today" && driveStatus(d) === "scheduled"));
    const rank = (d) => (driveStatus(d) === "live" ? 0 : 1);
    const later = mine.filter((d) => driveStatus(d) === "scheduled" && driveWhen(d).key !== "today")
      .sort((a, b) => String(a.date).localeCompare(String(b.date))).slice(0, 3);
    return { now: active.sort((a, b) => rank(a) - rank(b)), next: later };
  }, [mine]);
  return (
    <>
      <PageHead title={t("console.today.title")} />
      {now.length ? (
        <div className="cards-3">{now.map((d) => <TodayCard key={d.id} drive={d} setDrives={setDrives} />)}</div>
      ) : (
        <EmptyState icon={CalendarPlus} title={t("console.today.empty")}
          action={desk ? null : <Btn to="/app/drives/new">{t("buttons.createDrive")}</Btn>} />
      )}
      {next.length > 0 && (
        <section style={{ marginTop: 40 }}>
          <h2 className="h-3" style={{ marginBottom: 14 }}>{t("console.today.next")}</h2>
          <div className="stack gap-8">
            {next.map((d) => (
              <div key={d.id} className="card row between gap-12" style={{ padding: "14px 18px", flexWrap: "wrap" }}>
                <div className="row gap-12" style={{ minWidth: 0 }}>
                  <StatusChip drive={d} />
                  <span className="strong" style={{ fontWeight: 600 }}>{d.role}</span>
                  <span className="small muted hide-mobile">{venueLine(d) || d.venue}</span>
                </div>
                <span className="small muted">{datesLabel(d)} · {hoursLabel(d)}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
