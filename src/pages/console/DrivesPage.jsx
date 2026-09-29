import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Pencil, Play } from "lucide-react";
import { Btn, EmptyState, StatusChip } from "../../components/ds.jsx";
import { PageHead, useConsole } from "../../layouts/ConsoleLayout.jsx";
import { QueueSummary } from "./TodayPage.jsx";
import { useMeta } from "../../hooks/useMeta.js";
import { downloadAts } from "../../lib/ats.js";
import { venueLine } from "../../lib/listing.js";
import { datesLabel, driveStatus, hoursLabel } from "../../lib/status.js";
import { t } from "../../i18n/strings.js";

const FILTERS = ["all", "live", "scheduled", "draft", "wrapped"];
const ORDER = { live: 0, scheduled: 1, draft: 2, wrapped: 3 };

export default function DrivesPage() {
  const { mine, desk } = useConsole();
  const nav = useNavigate();
  const [f, setF] = useState("all");
  useMeta({ title: t("console.drives.title") });
  const sorted = useMemo(() => [...mine].sort((a, b) => {
    const sa = driveStatus(a), sb = driveStatus(b);
    if (ORDER[sa] !== ORDER[sb]) return ORDER[sa] - ORDER[sb];
    return sa === "wrapped" ? String(b.date).localeCompare(String(a.date)) : String(a.date).localeCompare(String(b.date));
  }), [mine]);
  const counts = Object.fromEntries(FILTERS.map((k) => [k, k === "all" ? sorted.length : sorted.filter((d) => driveStatus(d) === k).length]));
  const list = f === "all" ? sorted : sorted.filter((d) => driveStatus(d) === f);
  return (
    <>
      <PageHead title={t("console.drives.title")} lede={t("console.drives.lede")} />
      <div className="chips-scroll" role="group" aria-label="Filter drives" style={{ marginBottom: 18 }}>
        {FILTERS.map((k) => (
          <button key={k} type="button" className="chip" aria-pressed={f === k} onClick={() => setF(k)}>
            {k === "all" ? t("console.drives.all") : t(`status.${k}`)} <span className="mono" style={{ opacity: 0.7 }}>{counts[k]}</span>
          </button>
        ))}
      </div>
      {!list.length ? <EmptyState title={t("console.drives.empty")} /> : (
        <div className="stack gap-10" style={{ gap: 10 }}>
          {list.map((d) => {
            const s = driveStatus(d);
            return (
              <article key={d.id} className="card drive-row">
                <div className="stack gap-6" style={{ minWidth: 0 }}>
                  <div className="row gap-8"><StatusChip drive={d} /><span className="small muted">{datesLabel(d)} · {hoursLabel(d)}</span></div>
                  <h2 className="h-4">{d.role}</h2>
                  <p className="small muted" style={{ margin: 0 }}>{venueLine(d) || d.venue}{d.clientName ? ` · ${d.clientName}` : ""}</p>
                </div>
                <div style={{ minWidth: 0 }}><QueueSummary drive={d} /></div>
                <div className="row gap-6 drive-row-actions">
                  {s === "live"
                    ? <Btn size="sm" icon={Play} onClick={() => nav(`/app/drives/${d.id}`)}>{t("console.drives.run")}</Btn>
                    : <Btn size="sm" variant="secondary" onClick={() => nav(`/app/drives/${d.id}`)}>{t("console.drives.queue")}</Btn>}
                  {!desk && <Btn size="sm" variant="ghost" icon={Pencil} onClick={() => nav(`/app/drives/${d.id}/edit`)}>{t("console.drives.edit")}</Btn>}
                  {!desk && <Btn size="sm" variant="ghost" icon={Download} onClick={() => downloadAts(d, "standard", "csv")}>{t("console.drives.export")}</Btn>}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
