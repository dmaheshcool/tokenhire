import { driveSchedule, driveStatus, driveWhen, fromMinutes, hoursLabel, datesLabel } from "./status.js";
import { tat } from "./helpers.js";
import { t } from "../i18n/strings.js";

export const HERO_CITIES = ["Hyderabad", "Bengaluru", "Pune", "Mumbai", "Chennai", "Delhi"];

export function citySlug(city) {
  return String(city || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function cityFromSlug(slug, drives) {
  const s = String(slug || "").toLowerCase();
  const hit = (drives || []).find((d) => citySlug(d.city) === s);
  return hit ? hit.city : null;
}

export const drivePath = (drive) => `/walk-ins/${encodeURIComponent(drive.id)}`;
export const cityPath = (city) => `/walk-ins/${citySlug(city)}`;

const rupees = (n) => Math.round(n).toLocaleString("en-IN");

function payRange(drive) {
  const lo = Number(drive?.payMin) || 0;
  const hi = Number(drive?.payMax) || 0;
  if (!lo && !hi) return null;
  if (lo && hi && hi !== lo) return { min: rupees(lo), max: rupees(hi) };
  return { min: rupees(lo || hi) };
}

/** "₹16,000 to ₹24,000", for tight spots. */
export function payLabel(drive) {
  const r = payRange(drive);
  if (!r) return "";
  return r.max ? t("card.payShort", r) : t("card.payShortOne", r);
}

/** "Pay: ₹16,000 to ₹24,000 per month", as on a listing card. */
export function payText(drive) {
  const r = payRange(drive);
  if (!r) return "";
  return r.max ? t("card.pay", r) : t("card.payOne", r);
}

export function isFresherFriendly(drive) {
  return expRange(drive)[0] === 0;
}

export function expLabel(drive) {
  if (drive?.expMin == null && drive?.expMax == null && !(drive?.expNeeded || []).length) return t("card.exp.any");
  const [lo, hi] = expRange(drive);
  if (hi >= 15) return lo ? t("card.exp.plus", { lo }) : t("card.exp.any");
  if (!lo && !hi) return t("card.exp.fresher");
  if (!lo) return t("card.exp.upTo", { hi });
  if (lo === hi) return t(lo === 1 ? "card.exp.one" : "card.exp.many", { n: lo });
  return t("card.exp.range", { lo, hi });
}

const BAND_RANGE = { Fresher: [0, 0], "0–1 yr": [0, 1], "1–3 yrs": [1, 3], "3–5 yrs": [3, 5], "5+ yrs": [5, 15] };

/** Years of experience a drive accepts, as [min, max]. */
export function expRange(drive) {
  if (drive?.expMin != null || drive?.expMax != null) return [Number(drive.expMin) || 0, Number(drive.expMax ?? drive.expMin) || 0];
  const bands = (drive?.expNeeded || []).map((b) => BAND_RANGE[b]).filter(Boolean);
  if (!bands.length) return [0, 15];
  return [Math.min(...bands.map((b) => b[0])), Math.max(...bands.map((b) => b[1]))];
}

export const EXP_FILTERS = {
  fresher: ([lo]) => lo === 0,
  "0-1": ([lo]) => lo <= 1,
  "1-3": ([lo, hi]) => lo <= 3 && hi >= 1,
  "3-5": ([lo, hi]) => lo <= 5 && hi >= 3,
  "5+": ([, hi]) => hi >= 5,
};

export function venueLine(drive) {
  return [drive?.area || drive?.branch, drive?.city].filter(Boolean).join(", ");
}

export function whenLine(drive) {
  return `${datesLabel(drive)} · ${hoursLabel(drive)}`;
}

export function mapsUrl(drive) {
  const q = [drive?.venue, drive?.area, drive?.city].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

export function monogram(name) {
  const words = String(name || "?").replace(/[^\p{L}\s]/gu, " ").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "?";
  return (words.length === 1 ? words[0].slice(0, 2) : words[0][0] + words[1][0]).toUpperCase();
}

function roomsForFirstRound(drive) {
  const first = drive?.rounds?.[0]?.id;
  const rooms = (drive?.rooms || []).filter((r) => !first || !r.roundId || r.roundId === first);
  return Math.max(1, rooms.length);
}

/** Queue numbers for a card or the Today screen. */
export function queueStats(drive) {
  const cands = drive?.candidates || [];
  const waiting = cands.filter((c) => c.state === "wait").length;
  const inRound = cands.filter((c) => c.state === "calling" || c.state === "interviewing").length;
  const seen = cands.filter((c) => ["selected", "rejected", "onhold"].includes(c.state)).length;
  const noShow = cands.filter((c) => c.state === "absent").length;
  const minutesEach = tat(drive || {});
  const estMin = Math.round((waiting * minutesEach) / roomsForFirstRound(drive));
  return { waiting, inRound, seen, noShow, total: cands.length, estMin, minutesEach };
}

export function waitLabel(min) {
  if (min <= 0) return "no wait";
  if (min < 10) return "under 10 min";
  if (min < 55) return `${Math.round(min / 5) * 5} min`;
  const h = Math.round((min / 60) * 2) / 2;
  return `${h % 1 ? h.toFixed(1) : h}h`;
}

export function aheadWait(drive, ahead) {
  const { minutesEach } = queueStats(drive);
  return Math.round((ahead * minutesEach) / roomsForFirstRound(drive));
}

export function tokenNumber(token) {
  const m = String(token || "").match(/(\d+)\s*$/);
  return m ? `#${m[1].padStart(3, "0")}` : String(token || "");
}

function gcalStamp(date, minutes) {
  return `${date.replace(/-/g, "")}T${fromMinutes(minutes).replace(":", "")}00`;
}

export function calendarUrl(drive, token) {
  const { start, open, close, overnight } = driveSchedule(drive);
  const endDate = overnight ? new Date(Date.parse(`${start}T00:00:00Z`) + 864e5).toISOString().slice(0, 10) : start;
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: `Walk-in: ${drive.role} at ${drive.company}${token ? ` (token ${tokenNumber(token)})` : ""}`,
    dates: `${gcalStamp(start, open)}/${gcalStamp(endDate, close)}`,
    ctz: "Asia/Kolkata",
    location: [drive.venue, drive.area, drive.city].filter(Boolean).join(", "),
    details: `Carry: ${(drive.docs || []).join("; ")}. Scan the lobby display when you arrive.`,
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

export const isPublic = (d) => d && d.visibility !== "private" && !d.listingPending && !String(d.id).startsWith("d_plan_") && driveStatus(d) !== "draft";

export function publicDrives(drives) {
  return (drives || []).filter(isPublic);
}

export function boardStats(drives, now = Date.now()) {
  const pub = publicDrives(drives);
  const today = pub.filter((d) => driveWhen(d, now).key === "today");
  const live = pub.filter((d) => driveStatus(d, now) === "live");
  const inQueue = live.reduce((s, d) => s + queueStats(d).waiting, 0);
  const cities = new Set(pub.filter((d) => driveStatus(d, now) !== "wrapped").map((d) => d.city).filter(Boolean));
  return { today: today.length, live: live.length, inQueue, cities: cities.size };
}

export function sortForBoard(list, now = Date.now()) {
  const rank = { live: 0, scheduled: 1, wrapped: 2, draft: 3 };
  return [...list].sort((a, b) => {
    const sa = driveStatus(a, now), sb = driveStatus(b, now);
    if (rank[sa] !== rank[sb]) return rank[sa] - rank[sb];
    if (sa === "wrapped") return String(b.date).localeCompare(String(a.date));
    return String(a.date).localeCompare(String(b.date)) || String(a.startTime || "").localeCompare(String(b.startTime || ""));
  });
}
