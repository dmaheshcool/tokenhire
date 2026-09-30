import { useEffect, useMemo, useState } from "react";
import { Download, FileArchive, FileSpreadsheet } from "lucide-react";
import { Btn } from "../../components/ds.jsx";
import { ATS_TARGETS, downloadAts } from "../../lib/ats.js";
import { api, readSession } from "../../lib/api.js";
import { roundLabel } from "../../lib/helpers.js";
import { tokenNumber } from "../../lib/listing.js";
import { t, tl } from "../../i18n/strings.js";

const sane = (a) => a.filter((n) => n >= 0 && n < 12 * 60);
const avg = (a) => (sane(a).length ? Math.round(sane(a).reduce((p, n) => p + n, 0) / sane(a).length) : 0);
const dur = (m) => (m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60}m`);

export function reportNumbers(drive) {
  const cs = (drive.candidates || []).filter((c) => !c.released);
  const checkedIn = cs.filter((c) => c.checkedIn !== false);
  const interviewed = cs.filter((c) => c.calledAt && c.state !== "absent");
  const shortlisted = cs.filter((c) => c.state === "selected");
  return {
    cs,
    funnel: [
      ["registered", cs.length],
      ["checkedIn", checkedIn.length],
      ["interviewed", interviewed.length],
      ["shortlisted", shortlisted.length],
    ],
    avgWait: avg(cs.filter((c) => c.calledAt && c.at).map((c) => (c.calledAt - c.at) / 60000)),
    avgRound: avg(cs.filter((c) => c.calledAt && c.decidedAt && c.decidedAt > c.calledAt).map((c) => (c.decidedAt - c.calledAt) / 60000)),
    noShow: cs.filter((c) => c.state === "absent").length,
    onHold: cs.filter((c) => c.state === "onhold").length,
  };
}

async function pullFile(job) {
  const session = readSession();
  const res = await fetch(job.download, { headers: session?.token ? { Authorization: `Bearer ${session.token}` } : {} });
  if (!res.ok) throw new Error("download");
  const blob = await res.blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = job.filename || "export";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 500);
}

export default function ReportTab({ drive }) {
  const [target, setTarget] = useState("generic");
  const [job, setJob] = useState(null);
  const r = useMemo(() => reportNumbers(drive), [drive]);
  const top = Math.max(1, r.funnel[0][1]);
  const rows = [...r.cs].sort((a, b) => String(a.token).localeCompare(String(b.token), undefined, { numeric: true }));
  const chosen = ATS_TARGETS.find((x) => x.id === target) || ATS_TARGETS[0];

  useEffect(() => {
    if (!job?.id || job.status === "ready" || job.status === "failed") return undefined;
    let stop = false;
    const tick = async () => {
      try {
        const next = await api.exportStatus(job.id);
        if (stop) return;
        setJob(next);
        if (next.status === "ready" && next.download) {
          try { await pullFile(next); } catch { downloadAts(drive, target, job.format); }
        }
      } catch {
        if (!stop) setJob((p) => (p ? { ...p, status: "failed" } : p));
      }
    };
    const id = setInterval(tick, 400);
    tick();
    return () => { stop = true; clearInterval(id); };
  }, [job?.id, job?.status, job?.format, drive, target]);

  async function start(format) {
    setJob({ status: "starting", format, progress: 0 });
    try {
      const next = await api.exportStart({ driveId: drive.id, template: target, format });
      setJob({ ...next, format });
    } catch {
      downloadAts(drive, target, format);
      setJob(null);
    }
  }

  const busy = job && job.status !== "ready" && job.status !== "failed";
  return (
    <div className="stack gap-24">
      <section className="card card-pad stack gap-16" aria-labelledby="rp-export">
        <div className="row between gap-16" style={{ flexWrap: "wrap", alignItems: "flex-end" }}>
          <div className="stack gap-4">
            <h2 id="rp-export" className="h-3">{t("console.report.export")}</h2>
            <p className="small muted" style={{ maxWidth: 560 }}>{t("console.report.helper")}</p>
            {chosen.hint ? <p className="tiny muted" style={{ maxWidth: 560, margin: 0 }}>{chosen.hint}</p> : null}
          </div>
          <div className="row gap-8" style={{ flexWrap: "wrap" }}>
            <label className="sr-only" htmlFor="rp-target">{t("console.report.formatFor")}</label>
            <select id="rp-target" className="select" style={{ width: "auto" }} value={target} onChange={(e) => setTarget(e.target.value)} disabled={!!busy}>
              {ATS_TARGETS.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
            </select>
            <Btn icon={Download} disabled={!!busy} onClick={() => start("csv")}>{t("console.report.csv")}</Btn>
            <Btn variant="secondary" icon={FileSpreadsheet} disabled={!!busy} onClick={() => start("xlsx")}>{t("console.report.xlsx")}</Btn>
            <Btn variant="secondary" icon={FileArchive} disabled={!!busy} onClick={() => start("zip")}>{t("console.report.zip")}</Btn>
          </div>
        </div>
        {job && job.status !== "ready" && (
          <p className="small" role="status" style={{ margin: 0 }}>
            {job.status === "failed" ? t("console.report.failed")
              : job.status === "starting" ? t("console.report.starting")
                : t("console.report.progress", { n: job.progress || 0 })}
          </p>
        )}
      </section>

      <section className="card card-pad stack gap-16" aria-labelledby="rp-funnel">
        <h2 id="rp-funnel" className="h-3">{t("console.report.title")}</h2>
        <div className="funnel">
          {r.funnel.map(([key, n], i) => (
            <div key={key} className="funnel-row">
              <span className="small strong">{t(`console.report.funnel.${key}`)}</span>
              <div className="funnel-bar"><span style={{ width: `${Math.max(n ? 3 : 0, (n / top) * 100)}%`, opacity: 1 - i * 0.15 }} /></div>
              <span className="mono strong" style={{ textAlign: "right" }}>{n}{i > 0 && r.funnel[i - 1][1] ? <span className="tiny muted"> · {Math.round((n / r.funnel[i - 1][1]) * 100)}%</span> : null}</span>
            </div>
          ))}
        </div>
        <div className="cards-4" style={{ marginTop: 8 }}>
          {[[t("console.report.avgWait"), dur(r.avgWait)], [t("console.report.avgRound"), dur(r.avgRound)], [t("console.report.onHold"), r.onHold], [t("console.report.noShows"), r.noShow]].map(([l, v]) => (
            <div key={l} className="panel stack gap-4">
              <span className="tiny muted">{l}</span>
              <span className="mono strong" style={{ fontSize: 22 }}>{v}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="stack gap-12" aria-labelledby="rp-table">
        <h2 id="rp-table" className="h-4">{t("console.report.candidates")} <span className="muted mono">{rows.length}</span></h2>
        {rows.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead><tr>{tl("console.report.cols").map((h) => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id}>
                    <td className="mono">{tokenNumber(c.token)}</td>
                    <td className="strong">{c.name}</td>
                    <td className="mono">{c.phone}</td>
                    <td>{c.expBand || c.exp || "—"}</td>
                    <td>{roundLabel(drive.rounds, c)}</td>
                    <td>{t(`console.report.states.${c.state}`)}</td>
                    <td className="small muted" style={{ maxWidth: 260 }}>{Object.values(c.notes || {}).filter(Boolean).join(" · ") || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="small muted">{t("console.report.none")}</p>}
      </section>
    </div>
  );
}
