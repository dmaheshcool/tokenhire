import { test } from "node:test";
import assert from "node:assert/strict";
import { wrapUpDrive, migrateUnresolvedWrapped, wrapInvariantOk, assertWrappedQueue } from "./wrap.js";
import { driveStatus, canWrapDrive } from "./status.js";
import { queueStats } from "./listing.js";

const tenAm = Date.parse("2026-09-29T04:30:00Z");
const base = {
  role: "Store Associate", date: "2026-09-29", startTime: "09:30", endTime: "17:00",
  candidates: [
    { id: "1", token: "A1", state: "wait" },
    { id: "2", token: "A2", state: "calling" },
    { id: "3", token: "A3", state: "interviewing" },
    { id: "4", token: "A4", state: "selected" },
  ],
};

test("cannot wrap before doors open", () => {
  const future = { ...base, date: "2026-10-10" };
  assert.equal(canWrapDrive(future, tenAm), false);
  const r = wrapUpDrive(future, { now: tenAm });
  assert.equal(r.error, "too_early");
});

test("wrap-up clears the queue", () => {
  const { drive } = wrapUpDrive(base, { now: tenAm, by: "Ada" });
  assert.equal(driveStatus(drive, tenAm), "wrapped");
  assert.equal(drive.wrappedBy, "Ada");
  assert.equal(queueStats(drive).waiting, 0);
  assert.equal(queueStats(drive).inRound, 0);
  assert.ok(wrapInvariantOk(drive));
  assert.ok(assertWrappedQueue(drive));
});

test("migration marks leftover tokens on already wrapped drives", () => {
  const wrapped = { ...base, wrappedAt: tenAm - 1000 };
  const { drives, report } = migrateUnresolvedWrapped([wrapped], tenAm);
  assert.equal(report.length, 1);
  assert.equal(report[0].changed, 3);
  assert.equal(queueStats(drives[0]).waiting, 0);
  assert.equal(queueStats(drives[0]).inRound, 0);
});
