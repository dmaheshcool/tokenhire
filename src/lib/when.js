import { t } from "../i18n/strings.js";
import { clock, fromMinutes, toMinutes, windowUtc } from "./status.js";
import { ISO_DATE, addDays, formatNumber, fromIST, istDate } from "./time.js";

export const TIME_PRESETS = [
  { key: "morning", start: "09:00", end: "13:00" },
  { key: "day", start: "10:00", end: "16:00" },
  { key: "evening", start: "14:00", end: "20:00" },
  { key: "night", start: "18:00", end: "02:00" },
];

export function timeOptions() {
  const out = [];
  for (let m = 0; m < 1440; m += 15) out.push(fromMinutes(m));
  return out;
}

/** "930", "9.30 am", "21:30" → "09:30" / "21:30". */
export function parseClock(raw) {
  const s = String(raw || "").trim().toLowerCase();
  if (!s) return "";
  let ampm = "";
  let body = s.replace(/\s*(a\.?m\.?|p\.?m\.?)\s*$/i, (_, ap) => {
    ampm = ap[0].toLowerCase();
    return "";
  }).trim().replace(/\./g, ":").replace(/\s+/g, "");
  let h;
  let min = 0;
  if (/^\d{1,2}:\d{2}$/.test(body)) {
    const [hh, mm] = body.split(":");
    h = Number(hh);
    min = Number(mm);
  } else if (/^\d{3,4}$/.test(body)) {
    const pad = body.padStart(4, "0");
    h = Number(pad.slice(0, 2));
    min = Number(pad.slice(2));
  } else if (/^\d{1,2}$/.test(body)) {
    h = Number(body);
  } else return "";
  if (ampm === "a") {
    if (h === 12) h = 0;
  } else if (ampm === "p" && h < 12) h += 12;
  if (h > 23 || min > 59) return "";
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

export function offsetTime(hhmm, deltaMin) {
  return fromMinutes(toMinutes(hhmm, 0) + deltaMin);
}

export function isOvernight(start, end) {
  const a = toMinutes(start, null);
  const b = toMinutes(end, null);
  if (a == null || b == null) return false;
  return b < a;
}

export function interviewMinutes(start, end) {
  const a = toMinutes(start, null);
  const b = toMinutes(end, null);
  if (a == null || b == null) return 0;
  if (a === b) return 0;
  return b < a ? 1440 - a + b : b - a;
}

function dateParts(iso) {
  const ms = fromIST(iso, "12:00");
  if (Number.isNaN(ms)) return null;
  const map = {};
  const fmt = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  for (const p of fmt.formatToParts(new Date(ms))) if (p.type !== "literal") map[p.type] = p.value;
  return map;
}

export function weekdayDate(iso) {
  const p = dateParts(iso);
  if (!p) return "";
  return `${p.weekday}, ${p.day} ${p.month} ${p.year}`;
}

export function weekdayDateShort(iso) {
  const p = dateParts(iso);
  if (!p) return "";
  return `${p.weekday}, ${p.day} ${p.month}`;
}

export function monthTitle(year, month) {
  const p = dateParts(`${year}-${String(month).padStart(2, "0")}-01`);
  return p ? `${p.month} ${p.year}` : "";
}

export function weekStartDow() {
  try {
    const loc = new Intl.Locale("en-IN");
    const n = loc.getWeekInfo?.().firstDay ?? loc.weekInfo?.firstDay;
    if (n === 7) return 0;
    if (n === 1) return 1;
  } catch { /* older engines */ }
  return 0;
}

export function monthCells(year, month, todayIso = istDate(0)) {
  const first = `${year}-${String(month).padStart(2, "0")}-01`;
  const wd = dateParts(first)?.weekday;
  const map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const startPad = ((map[wd] ?? 0) - weekStartDow() + 7) % 7;
  const daysIn = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells = [];
  for (let i = 0; i < startPad; i += 1) cells.push(null);
  for (let d = 1; d <= daysIn; d += 1) {
    const iso = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ iso, past: iso < todayIso, label: String(d) });
  }
  while (cells.length % 7) cells.push(null);
  return cells;
}

export function applyInterviewTimes(prev, patch) {
  const next = { ...prev, ...patch };
  if (!next.doorsTouched) next.doorsOpenTime = offsetTime(next.startTime, -30);
  if (!next.lastTouched) next.lastEntryTime = offsetTime(next.endTime, -30);
  if (!next.multiDay) next.endDate = next.date;
  return next;
}

export function whenLiveLines(f) {
  const overnight = isOvernight(f.startTime, f.endTime);
  const multi = !!f.multiDay && f.endDate && f.endDate !== f.date;
  const startC = clock(f.startTime);
  const endC = clock(f.endTime);
  let when = "";
  if (overnight && !multi) {
    when = t("console.form.whenOvernight", {
      startDay: weekdayDateShort(f.date),
      start: startC,
      endDay: weekdayDateShort(addDays(f.date, 1)),
      end: endC,
    });
  } else if (multi) {
    when = t("console.form.whenMulti", { from: weekdayDateShort(f.date), to: weekdayDate(f.endDate) });
  } else {
    when = t("console.form.whenSingle", { day: weekdayDate(f.date), hours: t("time.range", { from: startC, to: endC }) });
  }
  const auto = !f.doorsTouched && !f.lastTouched;
  const check = t(auto ? "console.form.checkinSummaryAuto" : "console.form.checkinSummary", {
    open: clock(f.doorsOpenTime),
    close: clock(f.lastEntryTime),
  });
  return { when, check, overnight };
}

export function whenFieldErrors(f, now = Date.now()) {
  const e = {};
  const today = istDate(0, now);
  if (!ISO_DATE.test(String(f.date || ""))) e.date = t("console.form.err.date");
  else if (f.date < today) e.date = t("console.form.err.datePast");
  if (f.multiDay && f.endDate && f.endDate < f.date) e.endDate = t("console.form.err.endDate");
  const a = toMinutes(f.startTime, null);
  const b = toMinutes(f.endTime, null);
  if (a == null || b == null) e.startTime = t("console.form.err.time");
  else if (a === b) e.endTime = t("console.form.err.endEquals");
  if (a != null && b != null && a !== b) {
    const { doorsAt, startsAt, lastEntryAt, endsAt } = windowUtc(f);
    if (doorsAt > startsAt) e.doorsOpenTime = t("console.form.err.checkinAfterStart");
    if (lastEntryAt > endsAt) e.lastEntryTime = t("console.form.err.lastAfterEnd");
  }
  return e;
}

export function shortWindowWarning(f) {
  return interviewMinutes(f.startTime, f.endTime) > 0 && interviewMinutes(f.startTime, f.endTime) < 60
    ? t("console.form.warn.shortWindow")
    : "";
}

export function formatInr(raw) {
  const digits = String(raw ?? "").replace(/\D/g, "");
  if (!digits) return "";
  return formatNumber(Number(digits));
}

export function parseInr(raw) {
  const digits = String(raw ?? "").replace(/\D/g, "");
  return digits === "" ? "" : Number(digits);
}
