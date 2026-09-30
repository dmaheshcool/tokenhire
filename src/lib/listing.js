import { driveSchedule, driveStatus, driveWhen, fromMinutes, hoursLabel, datesLabel, tokensOpen, windowUtc } from "./status.js";
import { tat } from "./helpers.js";
import { t } from "../i18n/strings.js";
import { addDays, formatIST, formatNumber } from "./time.js";

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
export const cityFilterPath = (city) => `/walk-ins?city=${encodeURIComponent(city)}`;

const rupees = (n) => formatNumber(Math.round(n));

export const PAY_TYPES = ["month", "day", "hour", "task", "year", "fixed"];

// Rough monthly equivalents so the pay filter and sort can compare across types:
// 26 working days, 8-hour days. Per-task pay has no fair monthly figure.
const PER_MONTH = { month: 1, day: 26, hour: 26 * 8, year: 1 / 12, fixed: 1 };

export const payType = (drive) => (PAY_TYPES.includes(drive?.payType) ? drive.payType : "month");

function payAmount(drive) {
  const lo = Number(drive?.payMin) || 0;
  const hi = Number(drive?.payMax) || 0;
  if (!lo && !hi) return "";
  if (lo && hi && hi !== lo) return t("card.payRange", { min: rupees(lo), max: rupees(hi) });
  return t("card.payOne", { min: rupees(lo || hi) });
}

export const hasPay = (drive) => Boolean(payAmount(drive));

/** Top of the range as ₹ per month, or null when pay isn't listed or can't be compared. */
export function monthlyPay(drive) {
  const top = Number(drive?.payMax) || Number(drive?.payMin) || 0;
  const k = PER_MONTH[payType(drive)];
  return top && k ? Math.round(top * k) : null;
}

/** "₹700 to ₹900 per day", for tight spots. Empty when pay isn't listed. */
export function payLabel(drive) {
  const amount = payAmount(drive);
  return amount ? t("card.payShort", { amount, unit: t(`card.payUnit.${payType(drive)}`) }) : "";
}

/** "Pay: ₹16,000 to ₹24,000 per month", or "Pay discussed at interview". */
export function payText(drive) {
  const amount = payAmount(drive);
  return amount ? t("card.pay", { amount, unit: t(`card.payUnit.${payType(drive)}`) }) : t("card.payNone");
}

export function isFresherFriendly(drive) {
  return expRange(drive)[0] === 0;
}

export function expLabel(drive) {
  if (drive?.fresherWelcome) return t("card.exp.fresher");
  if (drive?.expMin == null && drive?.expMax == null && !(drive?.expNeeded || []).length) return t("card.exp.any");
  const [lo, hi] = expRange(drive);
  if (!lo && !hi) return t("card.exp.fresher");
  if (hi >= 15) return lo ? t("card.exp.plus", { lo }) : t("card.exp.any");
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
  const calling = cands.filter((c) => c.state === "calling").length;
  const interviewing = cands.filter((c) => c.state === "interviewing").length;
  const inRound = calling + interviewing;
  const inside = inRound;
  const shortlisted = cands.filter((c) => c.state === "selected").length;
  const onhold = cands.filter((c) => c.state === "onhold").length;
  const rejected = cands.filter((c) => c.state === "rejected").length;
  const undecided = cands.filter((c) => c.state === "undecided").length;
  const seen = shortlisted + onhold + rejected + undecided;
  const noShow = cands.filter((c) => c.state === "absent").length;
  const notSeen = cands.filter((c) => c.state === "not_seen").length;
  const carried = cands.filter((c) => c.state === "carried").length;
  const registered = cands.filter((c) => c.state !== "cancelled" && c.state !== "prereg").length;
  const minutesEach = tat(drive || {});
  const estMin = Math.round((waiting * minutesEach) / roomsForFirstRound(drive));
  return {
    waiting, inRound, inside, seen, noShow, notSeen, carried, shortlisted, onhold, rejected, undecided,
    registered, total: cands.length, estMin, minutesEach,
  };
}

export function waitLabel(min) {
  if (min <= 0) return "";
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
  const endDate = overnight ? addDays(start, 1) : start;
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
  const live = pub.filter((d) => tokensOpen(d, now));
  const inQueue = live.reduce((s, d) => s + queueStats(d).waiting, 0);
  const cities = new Set(pub.filter((d) => !["wrapped", "cancelled", "closing"].includes(driveStatus(d, now))).map((d) => d.city).filter(Boolean));
  return { today: today.length, live: live.length, inQueue, cities: cities.size };
}

export function matchesQuery(d, q) {
  if (!q) return true;
  const hay = [d.role, d.company, d.city, d.area, d.venue, d.roleType, d.branch].filter(Boolean).join(" ").toLowerCase();
  return q.toLowerCase().split(/\s+/).filter(Boolean).every((w) => hay.includes(w));
}

/** Drives worth showing to someone searching: public and not over yet. */
export function searchableDrives(drives, now = Date.now()) {
  const hide = new Set(["wrapped", "cancelled", "closing", "draft"]);
  return sortForBoard(publicDrives(drives).filter((d) => !hide.has(driveStatus(d, now))), now);
}

export function searchDrives(drives, q, now = Date.now()) {
  return searchableDrives(drives, now).filter((d) => matchesQuery(d, q.trim()));
}

/** Grouped suggestions for a partial query; prefix matches rank first. */
export function searchSuggestions(drives, q, now = Date.now(), perGroup = 6) {
  const needle = q.trim().toLowerCase();
  const groups = { roles: new Map(), companies: new Map(), cities: new Map() };
  if (!needle) return { roles: [], companies: [], cities: [] };
  for (const d of searchableDrives(drives, now)) {
    for (const [key, value] of [["roles", d.role], ["companies", d.company], ["cities", d.city]]) {
      const v = String(value || "").trim();
      if (!v || !v.toLowerCase().includes(needle)) continue;
      groups[key].set(v, (groups[key].get(v) || 0) + 1);
    }
  }
  const rank = (map) => [...map.entries()]
    .sort(([a, na], [b, nb]) => Number(b.toLowerCase().startsWith(needle)) - Number(a.toLowerCase().startsWith(needle)) || nb - na || a.localeCompare(b))
    .slice(0, perGroup)
    .map(([label, count]) => ({ label, count }));
  return { roles: rank(groups.roles), companies: rank(groups.companies), cities: rank(groups.cities) };
}

export function sortForBoard(list, now = Date.now()) {
  const rank = { live: 0, checkin: 1, scheduled: 2, closing: 3, wrapped: 4, cancelled: 5, draft: 6 };
  return [...list].sort((a, b) => {
    const sa = driveStatus(a, now), sb = driveStatus(b, now);
    if (rank[sa] !== rank[sb]) return rank[sa] - rank[sb];
    if (sa === "wrapped") return String(b.date).localeCompare(String(a.date));
    return String(a.date).localeCompare(String(b.date)) || String(a.startTime || "").localeCompare(String(b.startTime || ""));
  });
}

export function checkinStatusLine(drive, now = Date.now()) {
  const st = driveStatus(drive, now);
  if (st === "wrapped" || st === "cancelled") return t("card.statusEnded");
  if (st === "closing") {
    const { endsAt } = windowUtc(drive);
    if (!Number.isNaN(endsAt) && endsAt > now) {
      const wait = waitLabel((endsAt - now) / 60000);
      return wait ? t("card.endsIn", { w: wait }) : t("card.statusEnded");
    }
    return t("card.statusEnded");
  }
  if (tokensOpen(drive, now)) {
    const q = queueStats(drive);
    const bits = [t("card.checkinOpenNow")];
    if (q.waiting) {
      bits.push(t("card.inQueue", { n: q.waiting }));
      const wait = waitLabel(q.estMin);
      if (wait) bits.push(t("card.wait", { w: wait }));
    }
    return bits.join(" · ");
  }
  const { doorsAt } = windowUtc(drive);
  const time = formatIST(doorsAt, { time: true });
  return t("card.checkinOpens", { time });
}
