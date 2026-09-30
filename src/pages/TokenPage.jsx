import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Bell, BellRing, CalendarPlus, Check, Copy, DoorOpen, MapPin, TicketX } from "lucide-react";
import { useStore } from "../context/Store.jsx";
import { Btn, EmptyState, LiveDot, QueueBar, STROKE, TokenTicket, useToast } from "../components/ds.jsx";
import { Logo } from "../components/SiteChrome.jsx";
import { useQueueAlert } from "../hooks/useQueueAlert.js";
import { useMeta } from "../hooks/useMeta.js";
import { queueAhead, roomName, servingNow, tokenHref } from "../lib/helpers.js";
import { aheadWait, calendarUrl, drivePath, mapsUrl, tokenNumber, venueLine } from "../lib/listing.js";
import { driveStatus, hoursLabel, datesLabel } from "../lib/status.js";
import { formatIST } from "../lib/time.js";
import { t } from "../i18n/strings.js";

export const GRACE_MINUTES = 10;

const digits = (token) => tokenNumber(token).replace(/^#/, "");

function istClock(ms) {
  return formatIST(ms, { time: true });
}

function stageOf(cand) {
  if (cand.released) return -1;
  if (cand.state === "wait") return (cand.roundIdx || 0) > 0 ? 3 : 1;
  if (cand.state === "calling") return 2;
  if (cand.state === "interviewing") return 3;
  return 4;
}

function Timeline({ cand, rounds }) {
  const stage = stageOf(cand);
  const n = (cand.roundIdx || 0) + 1;
  const name = rounds?.[cand.roundIdx || 0]?.name;
  const steps = [
    t("token.timeline.registered"),
    t("token.timeline.queue"),
    t("token.timeline.called"),
    name ? t("token.timeline.roundNamed", { n, name }) : t("token.timeline.round", { n }),
    t("token.timeline.decision"),
  ];
  return (
    <ol className="timeline">
      {steps.map((label, i) => {
        const cls = i < stage || (i === 4 && stage === 4) ? "done" : i === stage ? "now" : "";
        return (
          <li key={label} className={cls} aria-current={i === stage ? "step" : undefined}>
            <span className="tl-dot">{cls === "done" && <Check size={12} strokeWidth={3} aria-hidden="true" />}</span>
            <span style={{ paddingTop: 1 }}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

function Shell({ children }) {
  return (
    <div className="ds" style={{ minHeight: "100vh" }}>
      <header className="wrap row between" style={{ maxWidth: 520, padding: "18px 20px" }}>
        <Link to="/" aria-label={t("nav.home")} style={{ textDecoration: "none" }}><Logo size={26} /></Link>
        <span className="tiny muted row gap-8"><LiveDot /> {t("token.refresh")}</span>
      </header>
      <main className="wrap" style={{ maxWidth: 520, padding: "0 20px 48px" }}>{children}</main>
    </div>
  );
}

/** Full-screen, high-contrast "go now" panel. */
function CalledScreen({ drive, cand, room }) {
  return (
    <div role="alert" style={{ position: "fixed", inset: 0, zIndex: 50, background: "var(--lime)", color: "#0B1020", display: "grid", placeItems: "center", padding: 24, textAlign: "center" }}>
      <div className="stack gap-16" style={{ maxWidth: 440 }}>
        <p className="h-display" style={{ margin: 0, color: "#0B1020" }}>{t("token.called.title")}</p>
        <p className="ticket-num" style={{ fontSize: 96, margin: 0, color: "#0B1020" }}>{t("token.number", { token: digits(cand.token) })}</p>
        <p className="h-3" style={{ margin: 0, color: "#0B1020" }}>
          {room ? t("token.called.body", { room, token: digits(cand.token) }) : t("token.called.bodyNoRoom", { token: digits(cand.token) })}
        </p>
        <p className="small" style={{ margin: 0, color: "#0B1020", opacity: 0.75 }}>{drive.company} · {drive.role}</p>
      </div>
    </div>
  );
}

function Ticket({ drive, cand, setDrives }) {
  const toast = useToast();
  const [confirm, setConfirm] = useState(false);
  const pool = drive.candidates || [];
  const ahead = queueAhead(pool, cand);
  const round = cand.roundIdx || 0;
  const sameRound = pool.filter((x) => (x.roundIdx || 0) === round);
  const served = sameRound.filter((x) => x.at < cand.at && x.state !== "wait").length;
  const serving = servingNow(pool).filter((x) => (x.roundIdx || 0) === round && x.room)[0];
  const { armed, arm } = useQueueAlert({ state: cand.state, ahead });
  const status = driveStatus(drive);
  const waiting = cand.state === "wait" && !cand.released;
  const called = cand.state === "calling";
  const inRound = cand.state === "interviewing";
  const hot = waiting && ahead <= 5;
  const room = roomName(cand.room) || roomName(serving?.room);
  const missed = cand.state === "absent" && !cand.released && cand.calledAt;
  const inGrace = missed && Date.now() - (cand.decidedAt || cand.calledAt) < GRACE_MINUTES * 60000;
  const decision = ["selected", "rejected", "onhold"].includes(cand.state) ? cand.state : null;
  const num = digits(cand.token);

  useMeta({ title: t("token.metaTitle", { token: num }), description: `${drive.role} · ${drive.company}` });

  const release = () => {
    setDrives((prev) => prev.map((d) => d.id !== drive.id ? d : {
      ...d,
      candidates: d.candidates.map((c) => (c.id === cand.id ? { ...c, state: "absent", released: true, decidedAt: Date.now() } : c)),
    }));
    setConfirm(false);
    toast(t("token.released"));
  };
  const copy = async () => {
    const href = tokenHref(drive.id, cand.token, cand.claim);
    try { await navigator.clipboard.writeText(href); toast(t("token.linkCopied")); } catch { window.prompt(t("token.copyPrompt"), href); }
  };

  return (
    <div className="stack gap-16">
      {called && <CalledScreen drive={drive} cand={cand} room={roomName(cand.room)} />}
      <TokenTicket number={t("token.number", { token: num })} company={drive.company} role={drive.role} hot={hot} called={called}
        label={called ? t("token.called.title") : t("token.yourToken")}>
        {waiting && (
          <div className="stack gap-12" style={{ marginTop: 16 }} aria-live="polite">
            <p className="h-3" style={{ margin: 0 }}>
              {ahead === 0 ? t("token.next") : ahead === 1 ? t("token.aheadOne") : t("token.ahead", { ahead })}
            </p>
            <p className="small muted" style={{ margin: 0 }}>
              {ahead === 0 ? t("token.anyMinute") : t("token.minutes", { minutes: Math.max(5, aheadWait(drive, ahead)) })}
            </p>
            <QueueBar value={served} max={served + ahead} lime={hot} label={t("token.progress")} />
            {hot && ahead > 0 && <p className="small" style={{ margin: 0, fontWeight: 600 }}>{t("token.almost")}</p>}
          </div>
        )}
        {inRound && room && <p className="h-3" style={{ marginTop: 16 }}>{t("token.inRound", { room })}</p>}
        {decision && (
          <div className="stack gap-8" style={{ marginTop: 16 }}>
            <p className="h-3" style={{ margin: 0 }}>{t(`token.decision.${decision}`)}</p>
            <p className="body muted">{t("token.thanks", { company: drive.company })}</p>
          </div>
        )}
        {missed && (
          <p className="body" style={{ marginTop: 16 }}>
            {t(inGrace ? "token.missed" : "token.missedLate", { token: num, time: istClock(cand.calledAt), grace_minutes: GRACE_MINUTES })}
          </p>
        )}
        {cand.released && <p className="body muted" style={{ marginTop: 16 }}>{t("token.released")}</p>}
      </TokenTicket>

      {waiting && (
        <div className="card card-pad row between" style={{ padding: 20 }}>
          <span className="small muted">{t("token.nowCalling")}</span>
          <span className="strong row gap-8">{serving
            ? <><span className="token-pill">{tokenNumber(serving.token)}</span>{roomName(serving.room)}</>
            : t("token.firstCall")}</span>
        </div>
      )}

      <div className="card card-pad">
        <Timeline cand={cand} rounds={drive.rounds} />
      </div>

      <div className="card card-pad stack gap-8" style={{ padding: 20 }}>
        <p className="strong" style={{ margin: 0 }}>{drive.venue || venueLine(drive)}</p>
        <p className="small muted" style={{ margin: 0 }}>{venueLine(drive)} · {datesLabel(drive)}, {hoursLabel(drive)}</p>
        {drive.landmark && <p className="small muted" style={{ margin: 0 }}>{drive.landmark}</p>}
        <div className="wrap-row gap-8" style={{ marginTop: 8 }}>
          <Btn href={calendarUrl(drive, cand.token)} target="_blank" rel="noreferrer" size="sm" variant="secondary" icon={CalendarPlus}>{t("token.calendar")}</Btn>
          <Btn href={mapsUrl(drive)} target="_blank" rel="noreferrer" size="sm" variant="secondary" icon={MapPin}>{t("buttons.directions")}</Btn>
          <Btn size="sm" variant="secondary" icon={Copy} onClick={copy}>{t("buttons.copyLink")}</Btn>
        </div>
      </div>

      {waiting && (
        <div className="stack gap-8">
          <Btn variant="secondary" icon={armed ? BellRing : Bell} onClick={arm} aria-pressed={armed}>{armed ? t("token.alertOn") : t("token.alertOff")}</Btn>
          {!confirm
            ? <Btn variant="ghost" icon={TicketX} onClick={() => setConfirm(true)}>{t("token.cant")}</Btn>
            : (
              <div className="card card-pad stack gap-12" role="alertdialog" aria-label={t("token.cant")} style={{ padding: 20 }}>
                <p className="body" style={{ color: "var(--ink)" }}>{t("token.cancelConfirm")}</p>
                <div className="row gap-8">
                  <Btn variant="danger" onClick={release}>{t("token.cancelYes")}</Btn>
                  <Btn variant="ghost" onClick={() => setConfirm(false)}>{t("token.cancelNo")}</Btn>
                </div>
              </div>
            )}
        </div>
      )}

      {status === "wrapped" && !decision && <p className="small muted center">{t("token.wrapped")}</p>}
      <div className="row between small" style={{ marginTop: 8 }}>
        <Link to={drivePath(drive)} className="link">{t("token.details")}</Link>
        <Link to="/walk-ins" className="link row gap-6"><DoorOpen size={16} strokeWidth={STROKE} aria-hidden="true" />{t("token.others")}</Link>
      </div>
    </div>
  );
}

export default function TokenPage() {
  const { driveId, token } = useParams();
  const [params] = useSearchParams();
  const { drives, setDrives, hydrated } = useStore();
  const claim = params.get("k") || "";
  const drive = drives.find((d) => d.id === driveId);
  const cand = drive?.candidates.find((c) => c.token === token || c.id === token);

  if (!cand && !hydrated) {
    return (
      <Shell>
        <div className="ticket" style={{ padding: 24 }} aria-busy="true">
          <span className="skeleton" style={{ display: "block", height: 14, width: "50%" }} />
          <span className="skeleton" style={{ display: "block", height: 96, width: "70%", marginTop: 80 }} />
        </div>
      </Shell>
    );
  }
  if (!drive || !cand || (cand.claim && claim && cand.claim !== claim)) {
    return (
      <Shell>
        <EmptyState title={t("token.notFound.t")} body={t("token.notFound.d")} action={<Btn to="/walk-ins">{t("token.notFound.cta")}</Btn>} />
      </Shell>
    );
  }
  return (
    <Shell>
      <Ticket drive={drive} cand={cand} setDrives={setDrives} />
    </Shell>
  );
}
