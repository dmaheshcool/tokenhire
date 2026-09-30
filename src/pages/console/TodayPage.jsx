import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarPlus, Check, Play } from "lucide-react";
import { Btn, EmptyState, QueueBar, StatusChip } from "../../components/ds.jsx";
import { PageHead, useConsole } from "../../layouts/ConsoleLayout.jsx";
import { useMeta } from "../../hooks/useMeta.js";
import { downloadAts } from "../../lib/ats.js";
import { wrapCounts } from "../../lib/wrap.js";
import { setupProgress, setupSkipped, skipSetup } from "../../lib/setup.js";
import { datesLabel, driveStatus, driveWhen, hoursLabel, startNowPatch, whenLine, windowUtc } from "../../lib/status.js";
import { formatIST } from "../../lib/time.js";
import { t } from "../../i18n/strings.js";
import { venueLine } from "../../lib/listing.js";

export function QueueSummary({ drive, big }) {
  const status = driveStatus(drive);
  const q = wrapCounts(drive);
  if (status === "wrapped" || status === "cancelled") {
    return (
      <p className="small" style={{ margin: 0, color: "var(--ink-2)" }}>
        {t("console.today.cardWrapped", { seen: q.seen, shortlisted: q.shortlisted, not_seen: q.notSeen })}
      </p>
    );
  }
  if (status === "scheduled") {
    const { doorsAt } = windowUtc(drive);
    return (
      <p className="small" style={{ margin: 0, color: "var(--ink-2)" }}>
        {t("console.today.cardScheduled", { registered: q.registered })}
        {doorsAt ? ` · ${t("console.today.untilDoors", { time: formatIST(doorsAt, { time: true }).replace(" IST", "") })}` : ""}
      </p>
    );
  }
  const total = q.registered || 1;
  return (
    <div className="stack gap-8">
      {big && (
        <p style={{ margin: 0 }}>
          <span className="mono" style={{ fontSize: 48, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1 }}>{q.queue}</span>
          <span className="body muted"> {t("detail.inQueue")}</span>
        </p>
      )}
      <p className="small" style={{ margin: 0, color: "var(--ink-2)" }} title={t("console.today.cardLive", { registered: q.registered, queue: q.queue, inside: q.inside, seen: q.seen })}>
        {t("console.today.cardLive", { registered: q.registered, queue: q.queue, inside: q.inside, seen: q.seen })}
      </p>
      <QueueBar value={q.seen} max={total} label={t("console.today.done", { done: q.seen, total: q.registered })} />
    </div>
  );
}

function SetupCard({ org, mine }) {
  const [hide, setHide] = useState(() => setupSkipped(org.id));
  const setup = setupProgress(org, mine);
  if (hide || setup.complete) return null;
  return (
    <section className="card card-pad stack gap-12" style={{ marginBottom: 24 }}>
      <div className="row between gap-8">
        <div>
          <h2 className="h-3" style={{ margin: 0 }}>{t("console.setup.title")}</h2>
          <p className="small muted" style={{ margin: "4px 0 0" }}>{t("console.setup.subtitle")}</p>
        </div>
        <Btn variant="ghost" size="sm" onClick={() => { skipSetup(org.id); setHide(true); }}>{t("console.setup.skip")}</Btn>
      </div>
      <ul className="stack gap-8" style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {setup.items.map((item) => (
          <li key={item.id}>
            <Link to={item.to} className="row gap-8" style={{ textDecoration: "none", color: "inherit" }}>
              <span className="step-icon" style={{ width: 28, height: 28 }}>{item.done ? <Check size={16} /> : null}</span>
              <span className={item.done ? "muted" : "strong"}>{t(item.titleKey)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function TodayCard({ drive, setDrives }) {
  const nav = useNavigate();
  const status = driveStatus(drive);
  const open = () => nav(`/app/drives/${drive.id}`);
  const startNow = () => setDrives((p) => p.map((d) => (d.id === drive.id ? { ...d, ...startNowPatch(d) } : d)));
  const wrapped = status === "wrapped" || status === "cancelled";
  return (
    <article className="card card-pad stack gap-16">
      <div className="row between gap-8">
        <StatusChip drive={drive} />
        <span className="small muted">{whenLine(drive)}</span>
      </div>
      <div>
        <h2 className="h-3">{drive.role}</h2>
        <p className="small muted" style={{ margin: "4px 0 0" }}>{venueLine(drive) || drive.venue}{drive.clientName ? ` · ${drive.clientName}` : ""}</p>
      </div>
      <QueueSummary drive={drive} big={!wrapped} />
      <div className="row gap-8" style={{ marginTop: "auto", flexWrap: "wrap" }}>
        {wrapped ? (
          <>
            <Btn variant="secondary" onClick={open}>{t("console.today.viewRecords")}</Btn>
            <Btn variant="ghost" onClick={() => nav(`/app/drives/${drive.id}?tab=report`)}>{t("console.today.report")}</Btn>
            <Btn variant="ghost" onClick={() => downloadAts(drive, "generic", "csv")}>{t("console.today.export")}</Btn>
          </>
        ) : status === "live" || status === "checkin" || status === "closing"
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
  const { mine, setDrives, desk, org } = useConsole();
  useMeta({ title: t("console.today.title") });
  const { now, next } = useMemo(() => {
    const run = new Set(["live", "checkin", "closing"]);
    const active = mine.filter((d) => run.has(driveStatus(d)) || (driveWhen(d).key === "today" && driveStatus(d) === "scheduled"));
    const rank = (d) => ({ live: 0, checkin: 1, closing: 2, scheduled: 3 }[driveStatus(d)] ?? 4);
    const later = mine.filter((d) => driveStatus(d) === "scheduled" && driveWhen(d).key !== "today")
      .sort((a, b) => String(a.date).localeCompare(String(b.date))).slice(0, 3);
    return { now: active.sort((a, b) => rank(a) - rank(b)), next: later };
  }, [mine]);
  return (
    <>
      <PageHead title={t("console.today.title")} />
      {!desk && <SetupCard org={org} mine={mine} />}
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
