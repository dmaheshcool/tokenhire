import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { formatIST, fromIST, istNow, toIST } from "./time.js";
import { driveStatus, hoursLabel, utcWindowFields } from "./status.js";

const tenAmUtc = Date.parse("2026-10-05T04:30:00Z");

test("fromIST stores UTC for an IST wall time", () => {
  assert.equal(new Date(fromIST("2026-10-05", "10:00")).toISOString(), "2026-10-05T04:30:00.000Z");
  assert.deepEqual(toIST(tenAmUtc), { date: "2026-10-05", time: "10:00" });
  assert.deepEqual(istNow(tenAmUtc), { date: "2026-10-05", minutes: 600 });
});

test("formatIST shows the same IST clock for a UTC instant", () => {
  const shown = formatIST(tenAmUtc, { date: true, time: true });
  assert.match(shown, /5 Oct/);
  assert.match(shown, /10:00 AM IST/);
});

test("hours and status stay IST after a picker is saved as UTC", () => {
  const civil = { role: "Picker", date: "2026-10-05", startTime: "10:00", endTime: "16:00" };
  const stored = { ...civil, ...utcWindowFields(civil) };
  assert.equal(stored.startsAt, "2026-10-05T04:30:00.000Z");
  assert.equal(stored.endsAt, "2026-10-05T10:30:00.000Z");
  assert.equal(hoursLabel(stored), "10:00 AM to 4:00 PM IST");
  assert.equal(driveStatus(stored, tenAmUtc), "live");
  assert.equal(driveStatus(stored, Date.parse("2026-10-05T03:30:00Z")), "scheduled");
  assert.equal(driveStatus({ ...stored, date: "2026-08-01", startsAt: "2026-08-01T03:30:00.000Z", endsAt: "2026-08-01T12:30:00.000Z" }, tenAmUtc), "wrapped");
});

test("the same IST time is shown when the process zone is not India", () => {
  const here = fileURLToPath(new URL("./time.tzcheck.mjs", import.meta.url));
  const out = execFileSync(process.execPath, [here], { env: { ...process.env, TZ: "America/New_York" }, encoding: "utf8" }).trim();
  assert.equal(out, "2026-10-05T04:30:00.000Z|5 Oct, 10:00 AM IST|10:00 AM to 4:00 PM IST");
});
