import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Btn, STROKE } from "./ds.jsx";
import { t } from "../i18n/strings.js";
import { clock, istDate } from "../lib/status.js";
import {
  TIME_PRESETS, applyInterviewTimes, isOvernight, monthCells, monthTitle, parseClock, shortWindowWarning,
  timeOptions, weekStartDow, weekdayDate, whenLiveLines,
} from "../lib/when.js";

function DateChips({ value, onPick, pickOpen, onPickOpen }) {
  const today = istDate(0);
  const tomorrow = istDate(1);
  return (
    <div className="chip-scroll" role="group" aria-label={t("console.form.whenDate")}>
      <button type="button" className="chip" aria-pressed={value === today} onClick={() => onPick(today)}>{t("console.form.chipToday")}</button>
      <button type="button" className="chip" aria-pressed={value === tomorrow} onClick={() => onPick(tomorrow)}>{t("console.form.chipTomorrow")}</button>
      <button type="button" className="chip" aria-pressed={!!pickOpen && value !== today && value !== tomorrow} onClick={onPickOpen}>{t("console.form.chipPickDate")}</button>
    </div>
  );
}

function Calendar({ value, min, onPick }) {
  const seed = value || istDate(0);
  const [y, m] = seed.split("-").map(Number);
  const [cursor, setCursor] = useState({ y, m });
  const today = istDate(0);
  const cells = monthCells(cursor.y, cursor.m, min || today);
  const labels = weekStartDow() === 1
    ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const title = monthTitle(cursor.y, cursor.m);
  const prev = () => setCursor((c) => (c.m === 1 ? { y: c.y - 1, m: 12 } : { y: c.y, m: c.m - 1 }));
  const next = () => setCursor((c) => (c.m === 12 ? { y: c.y + 1, m: 1 } : { y: c.y, m: c.m + 1 }));
  return (
    <div className="cal">
      <div className="row between" style={{ marginBottom: 8 }}>
        <button type="button" className="btn btn-ghost btn-icon btn-sm" aria-label={t("console.form.calPrev")} onClick={prev}><ChevronLeft size={18} strokeWidth={STROKE} /></button>
        <span className="strong">{title}</span>
        <button type="button" className="btn btn-ghost btn-icon btn-sm" aria-label={t("console.form.calNext")} onClick={next}><ChevronRight size={18} strokeWidth={STROKE} /></button>
      </div>
      <div className="cal-grid">
        {labels.map((d) => <span key={d} className="cal-dow">{d}</span>)}
        {cells.map((c, i) => (c ? (
          <button key={c.iso} type="button" className="cal-day" disabled={c.past} aria-pressed={c.iso === value} onClick={() => onPick(c.iso)}>{c.label}</button>
        ) : <span key={`e${i}`} />))}
      </div>
    </div>
  );
}

function TimeCombo({ id, label, value, onChange, error, plusDay, onTouch }) {
  const [text, setText] = useState(clock(value));
  const [open, setOpen] = useState(false);
  const wrap = useRef(null);
  const opts = useMemo(() => timeOptions(), []);
  const sheet = typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches;

  useEffect(() => { setText(clock(value)); }, [value]);
  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => { if (!wrap.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  const commit = (raw) => {
    const parsed = parseClock(raw) || parseClock(text);
    if (parsed) onChange(parsed);
    else setText(clock(value));
    onTouch?.();
    setOpen(false);
  };

  const list = (
    <div className={sheet ? "time-sheet-list" : "time-list"} role="listbox">
      {opts.map((hhmm) => (
        <button key={hhmm} type="button" role="option" className="time-opt" aria-selected={hhmm === value} onClick={() => commit(hhmm)}>
          {clock(hhmm)}
        </button>
      ))}
    </div>
  );

  return (
    <div className="field grow time-combo" ref={wrap}>
      <label className="label" htmlFor={id}>{label}</label>
      <div className="row gap-8">
        <input id={id} className="input" role="combobox" aria-expanded={open} aria-invalid={!!error}
          value={text} onChange={(e) => setText(e.target.value)} onFocus={() => setOpen(true)}
          onBlur={() => { const p = parseClock(text); if (p) onChange(p); }}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commit(text); } }} />
        {plusDay && <span className="chip chip-sm">{t("console.form.plusDay")}</span>}
      </div>
      {error && <p className="tiny" role="alert" style={{ color: "var(--danger)", margin: 0 }}>{error}</p>}
      {open && (sheet
        ? <div className="time-sheet" role="dialog" aria-label={label}><div className="time-sheet-inner">{list}<Btn block onClick={() => setOpen(false)}>{t("buttons.done")}</Btn></div></div>
        : list)}
    </div>
  );
}

export default function WhenFields({ f, setF, errors, onTouch }) {
  const [pickStart, setPickStart] = useState(false);
  const [pickEnd, setPickEnd] = useState(false);
  const [checkOpen, setCheckOpen] = useState(false);
  const lines = whenLiveLines(f);
  const warn = shortWindowWarning(f);
  const setDate = (date) => {
    setF((p) => applyInterviewTimes(p, { date, endDate: p.multiDay ? (p.endDate < date ? date : p.endDate) : date }));
    onTouch("date");
    setPickStart(false);
  };
  const setEnd = (endDate) => {
    setF((p) => ({ ...p, endDate }));
    onTouch("endDate");
    setPickEnd(false);
  };
  return (
    <div className="span-12 stack gap-16">
      <div className="stack gap-4">
        <h3 className="h-4" style={{ margin: 0 }}>{t("console.form.whenTitle")}</h3>
        <p className="small muted" style={{ margin: 0 }}>{t("console.form.whenHelp")}</p>
      </div>

      <div className="stack gap-8">
        <span className="label">{t("console.form.whenDate")}</span>
        <DateChips value={f.date} onPick={setDate} pickOpen={pickStart} onPickOpen={() => setPickStart((v) => !v)} />
        <p className="body" style={{ margin: 0 }}>{weekdayDate(f.date)}</p>
        {errors.date && <p className="tiny" role="alert" style={{ color: "var(--danger)", margin: 0 }}>{errors.date}</p>}
        {pickStart && <Calendar value={f.date} onPick={setDate} />}
        <label className="check-inline">
          <input type="checkbox" checked={!!f.multiDay} onChange={(e) => setF((p) => applyInterviewTimes({ ...p, multiDay: e.target.checked }, {}))} />
          {t("console.form.multiDay")}
        </label>
        {f.multiDay && (
          <div className="stack gap-8">
            <span className="label">{t("console.form.lastDay")}</span>
            <DateChips value={f.endDate} onPick={setEnd} pickOpen={pickEnd} onPickOpen={() => setPickEnd((v) => !v)} />
            <p className="body" style={{ margin: 0 }}>{weekdayDate(f.endDate || f.date)}</p>
            {errors.endDate && <p className="tiny" role="alert" style={{ color: "var(--danger)", margin: 0 }}>{errors.endDate}</p>}
            {pickEnd && <Calendar value={f.endDate || f.date} min={f.date} onPick={setEnd} />}
          </div>
        )}
      </div>

      <div className="stack gap-8">
        <span className="label">{t("console.form.timings")}</span>
        <div className="chip-scroll" role="group" aria-label={t("console.form.timings")}>
          {TIME_PRESETS.map((p) => (
            <button key={p.key} type="button" className="chip" aria-pressed={f.startTime === p.start && f.endTime === p.end}
              onClick={() => { setF((cur) => applyInterviewTimes(cur, { startTime: p.start, endTime: p.end })); onTouch("startTime"); }}>
              {t(`console.form.presets.${p.key}`)}
            </button>
          ))}
        </div>
        <div className="when-times">
          <TimeCombo id="f-startTime" label={t("console.form.startsIst")} value={f.startTime} error={errors.startTime}
            onChange={(startTime) => setF((p) => applyInterviewTimes(p, { startTime }))} onTouch={() => onTouch("startTime")} />
          <TimeCombo id="f-endTime" label={t("console.form.endsIst")} value={f.endTime} error={errors.endTime}
            plusDay={isOvernight(f.startTime, f.endTime)}
            onChange={(endTime) => setF((p) => applyInterviewTimes(p, { endTime }))} onTouch={() => onTouch("endTime")} />
        </div>
        {warn && <p className="small" style={{ color: "var(--warning-ink)", margin: 0 }}>{warn}</p>}
      </div>

      <div className="stack gap-8">
        {!checkOpen ? (
          <p className="small" style={{ margin: 0 }}>
            {lines.check}{" "}
            <button type="button" className="link" onClick={() => setCheckOpen(true)}>{t("console.form.edit")}</button>
          </p>
        ) : (
          <div className="when-times">
            <TimeCombo id="f-doors" label={t("console.form.doorsOpen")} value={f.doorsOpenTime} error={errors.doorsOpenTime}
              onChange={(doorsOpenTime) => setF((p) => ({ ...p, doorsOpenTime, doorsTouched: true }))} onTouch={() => onTouch("doorsOpenTime")} />
            <TimeCombo id="f-last" label={t("console.form.lastEntry")} value={f.lastEntryTime} error={errors.lastEntryTime}
              onChange={(lastEntryTime) => setF((p) => ({ ...p, lastEntryTime, lastTouched: true }))} onTouch={() => onTouch("lastEntryTime")} />
          </div>
        )}
      </div>

      <div className="when-summary">
        <p className="strong" style={{ margin: 0 }}>{lines.when}</p>
        <p className="small muted" style={{ margin: "4px 0 0" }}>{lines.check}</p>
      </div>
    </div>
  );
}
