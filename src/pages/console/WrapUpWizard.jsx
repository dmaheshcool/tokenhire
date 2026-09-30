import { useMemo, useState } from "react";
import { Btn } from "../../components/ds.jsx";
import { wrapCounts, wrapGroups, wrapUpDrive, cancelDrive } from "../../lib/wrap.js";
import { activeItems } from "../../lib/library.js";
import { canWrapDrive, clock, fromMinutes, driveSchedule, wrapIsEarly, hoursLabel } from "../../lib/status.js";
import { t } from "../../i18n/strings.js";
import { downloadAts } from "../../lib/ats.js";

export default function WrapUpWizard({ drive, lib, by, onClose, onSave, mode = "wrap" }) {
  const [step, setStep] = useState(0);
  const [queueAct, setQueueAct] = useState("not_seen");
  const [calledAct, setCalledAct] = useState("absent");
  const [roundAct, setRoundAct] = useState("undecided");
  const [leave, setLeave] = useState({ queue: false, called: false, inRound: false });
  const [thanks, setThanks] = useState(true);
  const [ats, setAts] = useState(true);
  const [reason, setReason] = useState("");
  const groups = wrapGroups(drive);
  const counts = wrapCounts(drive);
  const reasons = activeItems(lib || { reasons: [] }, "reasons");
  const early = wrapIsEarly(drive);
  const endLabel = hoursLabel(drive).split(" to ").pop() || clock(fromMinutes(driveSchedule(drive).close));
  const canContinue = (groups.queue.length === 0 || leave.queue || queueAct)
    && (groups.called.length === 0 || leave.called || calledAct)
    && (groups.inRound.length === 0 || leave.inRound || roundAct);

  const confirm = () => {
    if (mode === "cancel") {
      onSave(cancelDrive(drive, { reason, by }));
      onClose();
      return;
    }
    const { drive: next } = wrapUpDrive(drive, {
      by,
      thanks,
      report: ats,
      resolutions: { queue: queueAct, called: calledAct, inRound: roundAct, leave },
    });
    onSave(next);
    if (ats) downloadAts(next, "generic", "csv");
    onClose();
  };

  const rows = useMemo(() => [
    { key: "queue", n: groups.queue.length, label: t("console.wrap.queue", { n: groups.queue.length }) },
    { key: "called", n: groups.called.length, label: t("console.wrap.called", { n: groups.called.length }) },
    { key: "inRound", n: groups.inRound.length, label: t("console.wrap.inRound", { n: groups.inRound.length }) },
    { key: "open", n: groups.open.length, label: t("console.wrap.open", { n: groups.open.length }) },
  ], [groups]);

  if (mode === "cancel") {
    return (
      <div className="card card-pad stack gap-16" role="dialog" style={{ marginBottom: 20 }}>
        <h2 className="h-3">{t("console.queue.cancelDrive")}</h2>
        <p className="body muted" style={{ margin: 0 }}>{t("console.wrap.blocked")}</p>
        <div className="field">
          <label className="label" htmlFor="cancel-reason">{t("console.wrap.cancelReason")}</label>
          <input id="cancel-reason" className="input" value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
        <div className="row gap-8">
          <Btn variant="danger" onClick={confirm} disabled={!reason.trim()}>{t("console.queue.cancelDrive")}</Btn>
          <Btn variant="ghost" onClick={onClose}>{t("buttons.cancel")}</Btn>
        </div>
      </div>
    );
  }

  if (!canWrapDrive(drive)) {
    return (
      <div className="card card-pad stack gap-12" role="dialog" style={{ marginBottom: 20 }}>
        <p className="body" style={{ margin: 0 }}>{t("console.wrap.blocked")}</p>
        <Btn variant="secondary" onClick={onClose}>{t("buttons.cancel")}</Btn>
      </div>
    );
  }

  return (
    <div className="card card-pad stack gap-16" role="dialog" aria-labelledby="wrap-title" style={{ marginBottom: 20 }}>
      <h2 id="wrap-title" className="h-3">{t("console.wrap.title", { drive: drive.role })}</h2>
      {early && step === 0 && <p className="small" role="status">{t("console.wrap.early", { end: endLabel.replace(" IST", "") })}</p>}
      {step === 0 && (
        <>
          <p className="body muted" style={{ margin: 0 }}>{t("console.wrap.step1")}</p>
          <ul className="stack gap-8" style={{ margin: 0, paddingLeft: 18 }}>
            {rows.map((r) => <li key={r.key}><a href="#queue">{r.label}</a></li>)}
          </ul>
          <div className="row gap-8">
            <Btn onClick={() => setStep(1)}>{t("buttons.next")}</Btn>
            <Btn variant="ghost" onClick={onClose}>{t("buttons.cancel")}</Btn>
          </div>
        </>
      )}
      {step === 1 && (
        <>
          {groups.queue.length > 0 && (
            <section className="stack gap-8">
              <p className="strong">{t("console.wrap.queue", { n: groups.queue.length })}</p>
              <div className="wrap-row gap-8">
                <Btn size="sm" variant={queueAct === "not_seen" ? "primary" : "secondary"} onClick={() => setQueueAct("not_seen")}>{t("console.wrap.markNotSeen")}</Btn>
                <Btn size="sm" variant={queueAct === "carried" ? "primary" : "secondary"} onClick={() => setQueueAct("carried")}>{t("console.wrap.carry")}</Btn>
                <Btn size="sm" variant="ghost" onClick={onClose}>{t("console.wrap.keepOpen")}</Btn>
                <label className="check-inline"><input type="checkbox" checked={leave.queue} onChange={(e) => setLeave((p) => ({ ...p, queue: e.target.checked }))} />{t("console.wrap.leave")}</label>
              </div>
            </section>
          )}
          {groups.called.length > 0 && (
            <section className="stack gap-8">
              <p className="strong">{t("console.wrap.called", { n: groups.called.length })}</p>
              <div className="wrap-row gap-8">
                <Btn size="sm" variant={calledAct === "absent" ? "primary" : "secondary"} onClick={() => setCalledAct("absent")}>{t("console.wrap.markNoShow")}</Btn>
                <Btn size="sm" variant={calledAct === "recall" ? "primary" : "secondary"} onClick={() => setCalledAct("recall")}>{t("console.wrap.recall")}</Btn>
                <label className="check-inline"><input type="checkbox" checked={leave.called} onChange={(e) => setLeave((p) => ({ ...p, called: e.target.checked }))} />{t("console.wrap.leave")}</label>
              </div>
            </section>
          )}
          {groups.inRound.length > 0 && (
            <section className="stack gap-8">
              <p className="strong">{t("console.wrap.inRound", { n: groups.inRound.length })}</p>
              <div className="wrap-row gap-8">
                {["selected", "onhold", "rejected", "undecided"].map((k) => (
                  <Btn key={k} size="sm" variant={roundAct === k ? "primary" : "secondary"} onClick={() => setRoundAct(k)}>
                    {t(`console.wrap.${k === "selected" ? "shortlisted" : k}`)}
                  </Btn>
                ))}
                {reasons[0] && <span className="tiny muted">{reasons[0].label}</span>}
                <label className="check-inline"><input type="checkbox" checked={leave.inRound} onChange={(e) => setLeave((p) => ({ ...p, inRound: e.target.checked }))} />{t("console.wrap.leave")}</label>
              </div>
            </section>
          )}
          <div className="row gap-8">
            <Btn onClick={() => setStep(2)} disabled={!canContinue}>{t("buttons.next")}</Btn>
            <Btn variant="ghost" onClick={() => setStep(0)}>{t("buttons.back")}</Btn>
          </div>
        </>
      )}
      {step === 2 && (
        <>
          <dl className="grid-12" style={{ margin: 0, rowGap: 8 }}>
            {[["registered", counts.registered], ["seen", counts.seen], ["shortlisted", counts.shortlisted], ["onhold", counts.onhold],
              ["rejected", counts.rejected], ["notSeen", counts.notSeen], ["noShow", counts.noShow], ["carried", counts.carried]].map(([k, n]) => (
              <div key={k} className="span-3">
                <dt className="tiny muted">{t(`console.wrap.summary.${k}`)}</dt>
                <dd className="strong" style={{ margin: 0 }}>{n}</dd>
              </div>
            ))}
          </dl>
          <label className="check"><input type="checkbox" checked={thanks} onChange={(e) => setThanks(e.target.checked)} />{t("console.wrap.thanks")}</label>
          <label className="check"><input type="checkbox" checked={ats} onChange={(e) => setAts(e.target.checked)} />{t("console.wrap.ats")}</label>
          <div className="row gap-8">
            <Btn variant="danger" onClick={confirm}>{t("console.wrap.confirm")}</Btn>
            <Btn variant="ghost" onClick={() => setStep(1)}>{t("buttons.back")}</Btn>
          </div>
        </>
      )}
    </div>
  );
}
