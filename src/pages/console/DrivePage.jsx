import { useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { ChevronLeft, Copy, ExternalLink, MonitorPlay, Pencil, Play, Send, Square } from "lucide-react";
import { Btn, StatusChip, STROKE, useToast } from "../../components/ds.jsx";
import { useConsole } from "../../layouts/ConsoleLayout.jsx";
import { useDriveActions } from "../../hooks/useDriveActions.js";
import { useMeta } from "../../hooks/useMeta.js";
import QueueBoard from "./QueueBoard.jsx";
import ReportTab from "./ReportTab.jsx";
import { QueueSummary } from "./TodayPage.jsx";
import { Queue, RoomsTab, RoundsTab } from "../app/EmployerPage.jsx";
import { tat } from "../../lib/helpers.js";
import { drivePath, venueLine } from "../../lib/listing.js";
import { datesLabel, driveStatus, hoursLabel, startNowPatch, wrapUpPatch } from "../../lib/status.js";
import { t } from "../../i18n/strings.js";

const TABS = ["queue", "rooms", "candidates", "report"];

function DeskPin({ drive }) {
  const toast = useToast();
  const pin = String(drive.host || "").replace(/^HOST-/, "");
  const copy = async () => {
    const url = `${window.location.origin}${import.meta.env.BASE_URL}desk?pin=${pin}`;
    try { await navigator.clipboard.writeText(url); toast("Desk link copied."); } catch { toast(`Desk PIN: ${pin}`); }
  };
  return (
    <button type="button" className="btn btn-secondary" onClick={copy} title="Copy the desk link">
      <span className="tiny muted" style={{ fontWeight: 600 }}>{t("console.queue.deskPin")}</span>
      <span className="mono strong" style={{ letterSpacing: "0.08em" }}>{pin}</span>
      <Copy size={15} strokeWidth={STROKE} aria-hidden="true" />
    </button>
  );
}

export default function DrivePage() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const toast = useToast();
  const { org, desk, drives, setDrives, setOrgs } = useConsole();
  const drive = drives.find((d) => d.id === id && d.orgId === org.id);
  const act = useDriveActions(drive, setDrives);
  const [confirmWrap, setConfirmWrap] = useState(false);
  useMeta({ title: drive ? drive.role : "Drive" });
  if (!drive) return <Navigate to="/app/drives" replace />;

  const tabs = desk ? ["queue"] : TABS;
  const tab = tabs.includes(params.get("tab")) ? params.get("tab") : "queue";
  const setTab = (k) => setParams(k === "queue" ? {} : { tab: k }, { replace: true });
  const status = driveStatus(drive);

  const wait = drive.candidates.filter((x) => x.state === "wait");
  const minutes = tat(drive);
  const eta = (c) => {
    const peers = wait.filter((x) => (x.roundIdx || 0) === (c.roundIdx || 0)).sort((a, b) => a.at - b.at);
    const i = peers.findIndex((x) => x.id === c.id);
    return i < 0 ? 0 : i * minutes;
  };

  const startNow = () => { act.patch({ ...startNowPatch(drive), draft: false }); toast("Drive is live. Candidates can get tokens."); };
  const wrapUp = () => { act.patch(wrapUpPatch()); setConfirmWrap(false); toast("Drive wrapped up."); };

  return (
    <>
      <Link to={desk ? "/app/today" : "/app/drives"} className="link small row gap-4" style={{ display: "inline-flex", marginBottom: 12 }}>
        <ChevronLeft size={16} strokeWidth={STROKE} aria-hidden="true" />{desk ? t("console.nav.today") : t("console.nav.drives")}
      </Link>
      <div className="drive-head">
        <div className="stack gap-8" style={{ minWidth: 0 }}>
          <div className="row gap-8" style={{ flexWrap: "wrap" }}>
            <StatusChip drive={drive} />
            <span className="small muted">{datesLabel(drive)} · {hoursLabel(drive)}</span>
          </div>
          <h1 className="h-2">{drive.role}</h1>
          <p className="small muted" style={{ margin: 0 }}>{venueLine(drive) || drive.venue}{drive.clientName ? ` · ${drive.clientName}` : ""}</p>
        </div>
        <div className="row gap-8" style={{ flexWrap: "wrap" }}>
          {!desk && status === "draft" && <Btn icon={Send} onClick={() => { act.patch({ draft: false }); toast("Drive published."); }}>Publish</Btn>}
          {!desk && status === "scheduled" && <Btn icon={Play} onClick={startNow}>{t("console.queue.startNow")}</Btn>}
          {!desk && status === "live" && (confirmWrap
            ? <><Btn variant="danger" icon={Square} onClick={wrapUp}>Wrap up now</Btn><Btn variant="ghost" onClick={() => setConfirmWrap(false)}>Keep running</Btn></>
            : <Btn variant="secondary" icon={Square} onClick={() => setConfirmWrap(true)}>{t("console.queue.wrapUp")}</Btn>)}
          <Btn variant="secondary" icon={MonitorPlay} to={`/tv/${drive.id}`} target="_blank" rel="noopener">{t("console.queue.lobby")}</Btn>
          {!desk && <DeskPin drive={drive} />}
          {!desk && <Btn variant="ghost" icon={Pencil} to={`/app/drives/${drive.id}/edit`}>Edit</Btn>}
          {!desk && drive.visibility !== "private" && status !== "draft" && <Btn variant="ghost" icon={ExternalLink} to={drivePath(drive)} className="hide-mobile">Public page</Btn>}
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 20 }}><QueueSummary drive={drive} /></div>

      {tabs.length > 1 && (
        <div className="tabs" role="tablist" aria-label="Drive" style={{ marginBottom: 20 }}>
          {tabs.map((k) => (
            <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{t(`console.tabs.${k}`)}</button>
          ))}
        </div>
      )}

      <div role="tabpanel">
        {tab === "queue" && (
          <>
            {status !== "live" && (
              <div className="panel small" role="status" style={{ marginBottom: 16 }}>
                {status === "wrapped" ? "This drive has wrapped up. The board is read-only." : "The queue opens when the drive starts."}
              </div>
            )}
            <QueueBoard drive={drive} act={act} disabled={status === "wrapped"} deskMode={desk} />
          </>
        )}
        {tab === "rooms" && (
          <div className="stack gap-24 legacy-panel">
            <RoundsTab rounds={drive.rounds} setRounds={act.setRounds} />
            <RoomsTab rooms={drive.rooms || []} setRooms={act.setRooms} org={org} setOrgs={setOrgs} drive={drive} />
          </div>
        )}
        {tab === "candidates" && (
          <div className="legacy-panel">
            <Queue rows={drive.candidates} eta={eta} move={act.move} decide={act.decide} rounds={drive.rounds} rooms={drive.rooms || []} saveNote={act.saveNote} callTo={act.callTo} />
          </div>
        )}
        {tab === "report" && <ReportTab drive={drive} />}
      </div>
    </>
  );
}
