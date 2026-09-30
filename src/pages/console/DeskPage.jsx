import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { KeyRound, LogOut, MonitorPlay } from "lucide-react";
import { Btn, StatusChip, STROKE, useToast } from "../../components/ds.jsx";
import { Logo } from "../../components/SiteChrome.jsx";
import { useStore } from "../../context/Store.jsx";
import { useDriveActions } from "../../hooks/useDriveActions.js";
import { useMeta } from "../../hooks/useMeta.js";
import QueueBoard from "./QueueBoard.jsx";
import { QueueSummary } from "./TodayPage.jsx";
import { venueLine } from "../../lib/listing.js";
import { driveStatus, hoursLabel, deskOpen } from "../../lib/status.js";
import { api } from "../../lib/api.js";
import { t } from "../../i18n/strings.js";

const bare = (v) => String(v || "").toUpperCase().replace(/^HOST-?/, "").replace(/[^A-Z0-9]/g, "");

export function findByPin(drives, pin) {
  const p = bare(pin);
  if (p.length < 4) return null;
  return drives.find((d) => d.host && bare(d.host) === p && driveStatus(d) !== "wrapped") || null;
}

function Desk({ drive, onLeave, setDrives, pin }) {
  const act = useDriveActions(drive, setDrives);
  const live = deskOpen(drive);
  const toast = useToast();
  const [pass, setPass] = useState("");
  async function issue() {
    try {
      const r = await api.deskPass({ driveId: drive.id, pin });
      setPass(r.code);
      toast(t("console.queue.passIssued", { code: r.code }));
    } catch (e) { toast(e.message || t("desk.wrong"), "err"); }
  }
  return (
    <>
      <div className="drive-head">
        <div className="stack gap-8" style={{ minWidth: 0 }}>
          <div className="row gap-8"><StatusChip drive={drive} /><span className="small muted">{hoursLabel(drive)}</span></div>
          <h1 className="h-2">{drive.role}</h1>
          <p className="small muted" style={{ margin: 0 }}>{drive.company} · {venueLine(drive) || drive.venue}</p>
        </div>
        <div className="row gap-8" style={{ flexWrap: "wrap" }}>
          <Btn variant="secondary" onClick={issue}>{t("console.queue.issuePass")}</Btn>
          <Btn variant="secondary" icon={MonitorPlay} to={`/tv/${drive.id}`} target="_blank" rel="noopener">{t("console.queue.lobby")}</Btn>
          <Btn variant="ghost" icon={LogOut} onClick={onLeave}>Leave desk</Btn>
        </div>
      </div>
      <div className="card card-pad" style={{ marginBottom: 20 }}><QueueSummary drive={drive} /></div>
      {pass && <div className="panel small" role="status" style={{ marginBottom: 16 }}>{t("console.queue.passIssued", { code: pass })}</div>}
      {!live && <div className="panel small" role="status" style={{ marginBottom: 16 }}>The queue opens when the drive starts.</div>}
      <QueueBoard drive={drive} act={act} deskMode />
    </>
  );
}

export default function DeskPage() {
  const { drives, setDrives } = useStore();
  const [params, setParams] = useSearchParams();
  const [pin, setPin] = useState(params.get("pin") || "");
  const [err, setErr] = useState("");
  const drive = findByPin(drives, params.get("pin"));
  useMeta({ title: drive ? `Desk · ${drive.role}` : t("desk.title") });

  function open(e) {
    e.preventDefault();
    if (!findByPin(drives, pin)) { setErr(t("desk.wrong")); return; }
    setErr("");
    setParams({ pin: bare(pin) }, { replace: true });
  }

  return (
    <div className="ds" data-theme="light" style={{ minHeight: "100vh", background: "var(--canvas)" }}>
      <header className="console-top" style={{ position: "static" }}>
        <Link to="/" aria-label="TokenHire home" style={{ textDecoration: "none" }}><Logo size={26} /></Link>
        <span className="small muted">{t("desk.title")}</span>
      </header>
      <main className="console-body" style={{ margin: "0 auto" }}>
        {drive ? <Desk drive={drive} setDrives={setDrives} pin={params.get("pin")} onLeave={() => { setParams({}, { replace: true }); setPin(""); }} /> : (
          <form className="card card-pad stack gap-16" onSubmit={open} noValidate style={{ maxWidth: 420, margin: "8vh auto 0" }}>
            <span className="step-icon"><KeyRound size={22} strokeWidth={STROKE} aria-hidden="true" /></span>
            <div className="stack gap-4">
              <h1 className="h-3">{t("desk.title")}</h1>
              <p className="small muted">{t("desk.lede")}</p>
            </div>
            <div className="field">
              <label className="label" htmlFor="desk-pin">{t("desk.pin")}</label>
              <input id="desk-pin" className="input mono" style={{ letterSpacing: "0.12em", textTransform: "uppercase" }} autoComplete="off" autoCapitalize="characters"
                value={pin} onChange={(e) => { setPin(e.target.value); setErr(""); }} placeholder="7K3QXM" aria-invalid={!!err} aria-describedby={err ? "desk-err" : undefined} />
              {err && <p id="desk-err" className="tiny" role="alert" style={{ color: "var(--danger)", margin: 0 }}>{err}</p>}
            </div>
            <Btn type="submit" size="lg" block>{t("desk.open")}</Btn>
          </form>
        )}
      </main>
    </div>
  );
}
