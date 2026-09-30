import { t } from "../i18n/strings.js";
import { ISO_DATE, addDays, formatIST, fromIST, istNow, istDate } from "./time.js";

export { istNow, istDate, addDays, formatIST, fromIST };
export const IST_OFFSET_MIN = 330;
export const DEFAULT_START = "09:00";
export const DEFAULT_END = "17:00";

export function toMinutes(hhmm, fallback) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm || ""));
  if (!m) return fallback;
  const h = Number(m[1]), min = Number(m[2]);
  if (h > 23 || min > 59) return fallback;
  return h * 60 + min;
}

export function fromMinutes(total) {
  const t = ((Math.round(total) % 1440) + 1440) % 1440;
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}

function daysBetween(a, b) {
  return Math.round((fromIST(b, "12:00") - fromIST(a, "12:00")) / 86400000);
}

/** The dates and the daily hours a drive runs. An end time at or before the start runs past midnight. */
export function driveSchedule(drive) {
  const start = String(drive?.date || "");
  const endRaw = String(drive?.endDate || start);
  const end = ISO_DATE.test(endRaw) && endRaw >= start ? endRaw : start;
  const open = toMinutes(drive?.startTime, toMinutes(DEFAULT_START, 540));
  const close = toMinutes(drive?.endTime, toMinutes(DEFAULT_END, 1020));
  return { start, end, open, close, overnight: close <= open };
}

/** First open and last close as UTC ms. Prefer stored startsAt/endsAt when present. */
export function windowUtc(drive) {
  const { start, end, open, close, overnight } = driveSchedule(drive);
  const lastCloseDate = overnight ? addDays(end, 1) : end;
  const fromOpen = fromIST(start, fromMinutes(open));
  const fromClose = fromIST(lastCloseDate, fromMinutes(close));
  const storedStart = drive?.startsAt ? Date.parse(drive.startsAt) : NaN;
  const storedEnd = drive?.endsAt ? Date.parse(drive.endsAt) : NaN;
  return {
    startsAt: Number.isNaN(storedStart) ? fromOpen : storedStart,
    endsAt: Number.isNaN(storedEnd) ? fromClose : storedEnd,
  };
}

export function utcWindowFields(drive) {
  const { startsAt, endsAt } = windowUtc(drive);
  if (Number.isNaN(startsAt) || Number.isNaN(endsAt)) return {};
  return { startsAt: new Date(startsAt).toISOString(), endsAt: new Date(endsAt).toISOString() };
}

/**
 * Draft, scheduled, live, or wrapped — worked out from the dates and hours every time it
 * is read. Nothing stored can make a drive live, so a drive dated in the past never is.
 */
export function driveStatus(drive, now = Date.now()) {
  if (!drive) return "wrapped";
  const { start, end, open, close, overnight } = driveSchedule(drive);
  if (!ISO_DATE.test(start) || !String(drive.role || "").trim() || drive.listingPending || drive.draft) return "draft";
  const { date: today, minutes } = istNow(now);
  const { endsAt } = windowUtc(drive);
  if (!Number.isNaN(endsAt) && now >= endsAt) return "wrapped";
  const lastClose = overnight ? { date: addDays(end, 1), minutes: close } : { date: end, minutes: close };
  if (today > lastClose.date || (today === lastClose.date && minutes >= lastClose.minutes)) return "wrapped";
  if (drive.status === "closed") return "wrapped";
  if (drive.wrappedAt && drive.wrappedAt <= now) return "wrapped";
  if (today < start) return "scheduled";
  const inWindow = (date, min) => {
    if (date < start || date > end) return false;
    return overnight ? min >= open : min >= open && min < close;
  };
  if (inWindow(today, minutes)) return "live";
  if (overnight && minutes < close && inWindow(addDays(today, -1), open)) return "live";
  return "scheduled";
}

export const STATUS_LABEL = { draft: "Draft", scheduled: "Scheduled", live: "Live", wrapped: "Wrapped up" };

export function isLive(drive, now = Date.now()) { return driveStatus(drive, now) === "live"; }
export function isWrapped(drive, now = Date.now()) { return driveStatus(drive, now) === "wrapped"; }

/** How a candidate sees the date: today, tomorrow, this week, ended, or the date itself. */
export function driveWhen(drive, now = Date.now()) {
  const status = driveStatus(drive, now);
  if (status === "wrapped") return { key: "ended", label: t("status.ended") };
  if (status === "live") return { key: "today", label: t("status.today") };
  const { start, end } = driveSchedule(drive);
  if (!ISO_DATE.test(start)) return { key: "later", label: t("status.dateTbd") };
  const today = istNow(now).date;
  if (start <= today && today <= end) return { key: "today", label: t("status.today") };
  const ahead = daysBetween(today, start);
  if (ahead === 1) return { key: "tomorrow", label: t("status.tomorrow") };
  if (ahead > 1 && ahead < 7) return { key: "week", label: t("status.week") };
  return { key: "later", label: shortDate(start) };
}

export function shortDate(iso) {
  if (!ISO_DATE.test(String(iso || ""))) return "";
  return formatIST(iso, { date: true });
}

export function clock(hhmm) {
  const m = toMinutes(hhmm, null);
  if (m == null) return "";
  const h = Math.floor(m / 60), min = m % 60;
  const suffix = t(h < 12 ? "time.am" : "time.pm");
  return `${h % 12 || 12}:${String(min).padStart(2, "0")} ${suffix}`;
}

export function hoursLabel(drive) {
  const { open, close } = driveSchedule(drive);
  return t("time.range", { from: clock(fromMinutes(open)), to: clock(fromMinutes(close)) });
}

export function datesLabel(drive) {
  const { start, end } = driveSchedule(drive);
  if (!ISO_DATE.test(start)) return "";
  return end !== start ? `${shortDate(start)} – ${shortDate(end)}` : shortDate(start);
}

/** Setting the hours so the drive opens now, today. The status then follows from the times. */
export function startNowPatch(drive, now = Date.now()) {
  const { date, minutes } = istNow(now);
  const { end, close, overnight } = driveSchedule(drive);
  const patch = { date, startTime: fromMinutes(minutes), wrappedAt: null };
  if (!end || end < date) patch.endDate = date;
  if (!overnight && close <= minutes) patch.endTime = fromMinutes(Math.min(minutes + 240, 23 * 60 + 59));
  return { ...patch, ...utcWindowFields({ ...drive, ...patch }) };
}

/**
 * Hours placed around the current IST time: opening `fromMin` minutes from now (negative
 * is already open) and running `lengthMin`. Used for demo drives that must be live
 * whenever someone looks. A window that crosses midnight is dated on the day it opens.
 */
export function windowAround(now = Date.now(), fromMin = -120, lengthMin = 480, extraDays = 0) {
  const { date, minutes } = istNow(now);
  const openAt = Math.floor((minutes + fromMin) / 30) * 30;
  const openDay = Math.floor(openAt / 1440);
  const start = addDays(date, openDay);
  const openMin = openAt - openDay * 1440;
  return {
    date: start,
    endDate: addDays(start, extraDays),
    startTime: fromMinutes(openMin),
    endTime: fromMinutes(openMin + lengthMin),
  };
}

export function wrapUpPatch(now = Date.now()) {
  return { wrappedAt: now };
}
