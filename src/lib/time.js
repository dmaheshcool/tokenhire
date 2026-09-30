import { t } from "../i18n/strings.js";

// Every clock the product shows is India Standard Time. Device timezone never wins.
export const TZ = "Asia/Kolkata";
export const IST_OFFSET = "+05:30";
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_TIME = /^(\d{1,2}):(\d{2})$/;
const DAY_MS = 86400000;

const istStamp = new Intl.DateTimeFormat("en-IN", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});
const istDateFmt = new Intl.DateTimeFormat("en-IN", { timeZone: TZ, day: "numeric", month: "short" });
const istDateYearFmt = new Intl.DateTimeFormat("en-IN", { timeZone: TZ, day: "numeric", month: "short", year: "numeric" });
const istTimeFmt = new Intl.DateTimeFormat("en-IN", { timeZone: TZ, hour: "numeric", minute: "2-digit", hour12: true });

function partsOf(ms) {
  const map = {};
  for (const p of istStamp.formatToParts(new Date(ms))) if (p.type !== "literal") map[p.type] = p.value;
  return map;
}

export function istParts(now = Date.now()) {
  const p = partsOf(now);
  return {
    date: `${p.year}-${p.month}-${p.day}`,
    hours: Number(p.hour),
    minutes: Number(p.minute),
  };
}

export function istNow(now = Date.now()) {
  const p = istParts(now);
  return { date: p.date, minutes: p.hours * 60 + p.minutes };
}

export function istDate(offsetDays = 0, now = Date.now()) {
  return istNow(now + offsetDays * DAY_MS).date;
}

/** UTC instant for an IST civil date and HH:MM. Device timezone is ignored. */
export function fromIST(dateStr, timeStr = "00:00") {
  if (!ISO_DATE.test(String(dateStr || ""))) return NaN;
  const m = ISO_TIME.exec(String(timeStr || "00:00"));
  if (!m) return NaN;
  const hh = String(Number(m[1])).padStart(2, "0");
  const mm = m[2];
  return Date.parse(`${dateStr}T${hh}:${mm}:00${IST_OFFSET}`);
}

export function toIST(ms) {
  const p = istParts(ms);
  return { date: p.date, time: `${String(p.hours).padStart(2, "0")}:${String(p.minutes).padStart(2, "0")}` };
}

export function addDays(iso, n) {
  const ms = fromIST(iso, "12:00");
  if (Number.isNaN(ms)) return "";
  return istParts(ms + n * DAY_MS).date;
}

function asMs(value) {
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;
  if (ISO_DATE.test(String(value || ""))) return fromIST(value, "12:00");
  const n = Date.parse(value);
  return Number.isNaN(n) ? NaN : n;
}

function timeLabel(ms) {
  const raw = istTimeFmt.format(new Date(ms));
  return raw.replace(/\s*(am|pm)\.?/i, (_, ap) => ` ${ap.toUpperCase()}`);
}

/**
 * Show a moment in IST. Pass a Date, a UTC ms, an ISO instant, or a YYYY-MM-DD
 * civil date (read as IST, not as the device's midnight).
 */
export function formatIST(value, { date = false, time = false, year = false } = {}) {
  const ms = asMs(value);
  if (Number.isNaN(ms)) return "";
  const bits = [];
  if (date) bits.push((year ? istDateYearFmt : istDateFmt).format(new Date(ms)));
  if (time) bits.push(`${timeLabel(ms)} ${t("time.zone")}`);
  return bits.join(", ");
}

export function formatNumber(n) {
  return Number(n || 0).toLocaleString("en-IN");
}

export { ISO_DATE, DAY_MS };
