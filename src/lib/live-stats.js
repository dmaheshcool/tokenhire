import { tokensOpen } from "./status.js";
import { queueStats } from "./listing.js";
import { istNow } from "./time.js";

const IN_QUEUE = new Set(["wait", "calling"]);

function istMidnight(now = Date.now()) {
  return Date.parse(`${istNow(now).date}T00:00:00+05:30`);
}

function isListed(d) {
  return d && d.visibility !== "private" && !d.listingPending && !String(d.id || "").startsWith("d_plan_");
}

/** Average wait label for the walk-ins live panel. Empty when there is no estimate. */
export function waitAvgLabel(min) {
  const n = Number(min);
  if (!Number.isFinite(n) || n <= 0) return "";
  if (n < 10) return "~10 min";
  if (n < 55) return `~${Math.round(n / 5) * 5} min`;
  const h = Math.round((n / 60) * 2) / 2;
  return `~${h % 1 ? h.toFixed(1) : h}h`;
}

/** Public live strip: open check-in windows, people still waiting, tokens issued since 00:00 IST. */
export function computeLiveStats(drives, now = Date.now()) {
  let open = 0;
  let queue = 0;
  let today = 0;
  const waits = [];
  const cities = {};
  const start = istMidnight(now);
  for (const d of drives || []) {
    if (!isListed(d)) continue;
    const city = d.city || "";
    if (city) {
      cities[city] = cities[city] || { total: 0, open: 0 };
      cities[city].total += 1;
    }
    const isOpen = tokensOpen(d, now);
    if (isOpen) {
      open += 1;
      if (city) cities[city].open += 1;
      const est = queueStats(d).estMin;
      if (est > 0) waits.push(est);
    }
    for (const c of d.candidates || []) {
      if (c.state === "prereg") continue;
      if (IN_QUEUE.has(c.state)) queue += 1;
      if (c.state !== "cancelled" && Number(c.at) >= start) today += 1;
    }
  }
  const waitMin = waits.length ? Math.round(waits.reduce((s, n) => s + n, 0) / waits.length) : null;
  return { open, queue, today, waitMin, cities };
}
