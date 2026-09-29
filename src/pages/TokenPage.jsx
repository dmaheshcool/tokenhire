import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Bell, BellRing, CalendarPlus, Check, Copy, DoorOpen, MapPin, ScanLine, TicketX } from "lucide-react";
import { useStore } from "../context/Store.jsx";
import { Btn, EmptyState, LiveDot, QueueBar, STROKE, TokenTicket, useToast } from "../components/ds.jsx";
import { Logo } from "../components/SiteChrome.jsx";
import { useQueueAlert } from "../hooks/useQueueAlert.js";
import { useMeta } from "../hooks/useMeta.js";
import { queueAhead, roomName, servingNow, tokenHref } from "../lib/helpers.js";
import { aheadWait, calendarUrl, drivePath, mapsUrl, tokenNumber, venueLine, waitLabel } from "../lib/listing.js";
import { driveStatus, hoursLabel, datesLabel } from "../lib/status.js";
import { t } from "../i18n/strings.js";

const DECISION = {
  selected: ["Selected for the next step", "HR will contact you. Offers are not made at the walk-in."],
  rejected: ["Not selected this time", "Thanks for coming in. Other drives are open today."],
  onhold: ["On hold", "The team will be in touch after the drive."],
  absent: ["Marked as not present", "You were called and weren’t there. Speak to the desk if that’s wrong."],
};

function stageOf(cand) {
  if (cand.released) return -1;
  if (cand.state === "wait") return (cand.roundIdx || 0) > 0 ? 3 : 1;
  if (cand.state === "calling") return 2;
  if (cand.state === "interviewing") return 3;
  return 4;
}

function Timeline({ cand, rounds }) {
  const stage = stageOf(cand);
  const roundNo = (cand.roundIdx || 0) + 1;
  const roundName = rounds?.[cand.roundIdx || 0]?.name;
  const steps = [
    t("token.timeline.registered"),
    t("token.timeline.queue"),
    t("token.timeline.called"),
    roundName ? `In round ${roundNo} · ${roundName}` : `In round ${roundNo}`,
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
        <Link to="/" aria-label="TokenHire home" style={{ textDecoration: "none" }}><Logo size={26} /></Link>
        <span className="tiny muted row gap-8"><LiveDot /> {t("token.refresh")}</span>
      </header>
      <main className="wrap" style={{ maxWidth: 520, padding: "0 20px 48px" }}>{children}</main>
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
  const decision = !waiting && !called && !inRound && !cand.released ? DECISION[cand.state] : null;
  const num = tokenNumber(cand.token);

  useMeta({ title: `${t("token.yourToken")} ${num}`, description: `${drive.role} at ${drive.company}` });

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
    try { await navigator.clipboard.writeText(href); toast("Link copied. Open it on this phone any time."); } catch { window.prompt("Copy your token link", href); }
  };

  return (
    <div className="stack gap-16">
      <TokenTicket number={num} company={drive.company} role={drive.role} hot={hot} called={called}
        label={called ? t("token.calledTitle") : t("token.yourToken")}>
        {waiting && (
          <div className="stack gap-12" style={{ marginTop: 16 }}>
            <div className="row between" style={{ alignItems: "flex-end" }}>
              <div aria-live="polite">
                {ahead === 0
                  ? <p className="h-2" style={{ margin: 0 }}>{t("token.youreNext")}</p>
                  : <p style={{ margin: 0 }}><span className="mono" style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1 }}>{ahead}</span> <span className="body">{t("token.ahead")}</span></p>}
              </div>
              <div className="stack" style={{ textAlign: "right" }}>
                <span className="tiny muted">{t("token.wait")}</span>
                <span className="strong">{ahead === 0 ? "any minute" : `about ${waitLabel(aheadWait(drive, ahead))}`}</span>
              </div>
            </div>
            <QueueBar value={served} max={served + ahead} lime={hot} label="Your place in the queue" />
            {hot && ahead > 0 && <p className="small" style={{ margin: 0, fontWeight: 600 }}>{t("token.closeHint")}</p>}
          </div>
        )}
        {(called || inRound) && (
          <div className="stack gap-8" style={{ marginTop: 16 }}>
            <p className="h-2" style={{ margin: 0, color: called ? "#0B1020" : undefined }}>{room ? t("token.calledTo", { room }) : t("token.calledTitle")}</p>
            {cand.room?.interviewer && <p className="body" style={{ color: called ? "#0B1020" : undefined }}>Interviewer: {cand.room.interviewer}</p>}
          </div>
        )}
        {decision && (
          <div className="stack gap-8" style={{ marginTop: 16 }}>
            <p className="h-3" style={{ margin: 0 }}>{decision[0]}</p>
            <p className="body muted">{decision[1]}</p>
          </div>
        )}
        {cand.released && <p className="body muted" style={{ marginTop: 16 }}>{t("token.released")}</p>}
      </TokenTicket>

      {waiting && (
        <div className="card card-pad stack gap-12" style={{ padding: 20 }}>
          <div className="row between">
            <span className="small muted">{t("token.room")}</span>
            <span className="strong row gap-8">{serving ? <><span className="token-pill">{tokenNumber(serving.token)}</span> in {roomName(serving.room)}</> : "Waiting for the first call"}</span>
          </div>
          <div className="divider" />
          {cand.checkedIn
            ? <p className="small row gap-8" style={{ margin: 0, color: "var(--success-ink)", fontWeight: 600 }}><Check size={16} strokeWidth={2.5} aria-hidden="true" />{t("token.arrived")}</p>
            : (
              <div className="row between gap-12">
                <p className="small" style={{ margin: 0, color: "var(--ink-2)" }}>{t("token.notArrived")}</p>
                <Btn to="/app/join" size="sm" variant="secondary" icon={ScanLine}>Scan</Btn>
              </div>
            )}
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
          <Btn href={mapsUrl(drive)} target="_blank" rel="noreferrer" size="sm" variant="secondary" icon={MapPin}>Directions</Btn>
          <Btn size="sm" variant="secondary" icon={Copy} onClick={copy}>Copy link</Btn>
        </div>
      </div>

      {(waiting || called) && (
        <div className="stack gap-8">
          <Btn variant="secondary" icon={armed ? BellRing : Bell} onClick={arm} aria-pressed={armed}>{armed ? "Sound and vibration on" : "Alert me when I’m next"}</Btn>
          {!confirm
            ? <Btn variant="ghost" icon={TicketX} onClick={() => setConfirm(true)}>{t("token.cantMake")}</Btn>
            : (
              <div className="card card-pad stack gap-12" role="alertdialog" aria-label={t("token.cantMake")} style={{ padding: 20 }}>
                <p className="body" style={{ color: "var(--ink)" }}>{t("token.cantConfirm")}</p>
                <div className="row gap-8">
                  <Btn variant="danger" onClick={release}>Release my place</Btn>
                  <Btn variant="ghost" onClick={() => setConfirm(false)}>Keep it</Btn>
                </div>
              </div>
            )}
        </div>
      )}

      {status === "wrapped" && !decision && <p className="small muted center">{t("token.wrapped")}</p>}
      <div className="row between small" style={{ marginTop: 8 }}>
        <Link to={drivePath(drive)} className="link">Drive details</Link>
        <Link to="/walk-ins" className="link row gap-6"><DoorOpen size={16} strokeWidth={STROKE} aria-hidden="true" />Other walk-ins</Link>
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
        <EmptyState title={t("token.lost.t")} body={t("token.lost.d")} action={<Btn to="/walk-ins">{t("token.lost.cta")}</Btn>} />
      </Shell>
    );
  }
  return (
    <Shell>
      <Ticket drive={drive} cand={cand} setDrives={setDrives} />
    </Shell>
  );
}
