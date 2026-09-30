import { test } from "node:test";
import assert from "node:assert/strict";
import { driveStatus, driveWhen, istNow, startNowPatch, windowAround } from "./status.js";

// 2026-09-29 10:00 IST is 04:30 UTC.
const at = (iso) => Date.parse(iso);
const tenAm = at("2026-09-29T04:30:00Z");
const base = { role: "Store Associate", date: "2026-09-29", startTime: "09:30", endTime: "17:00" };

test("reads the clock in IST", () => {
  assert.deepEqual(istNow(tenAm), { date: "2026-09-29", minutes: 600 });
  assert.equal(istNow(at("2026-09-29T19:00:00Z")).date, "2026-09-30");
});

test("check-in open after doors and before start", () => {
  assert.equal(driveStatus({ ...base, doorsOpenTime: "09:00", startTime: "11:00" }, tenAm), "checkin");
});

test("scheduled before the doors open and on a later day", () => {
  assert.equal(driveStatus({ ...base, startTime: "11:00", doorsOpenTime: "11:00" }, tenAm), "scheduled");
  assert.equal(driveStatus({ ...base, date: "2026-10-02" }, tenAm), "scheduled");
});

test("a saved draft stays a draft inside its hours until published", () => {
  assert.equal(driveStatus({ ...base, draft: true }, tenAm), "draft");
  assert.equal(driveStatus({ ...base, draft: false }, tenAm), "live");
});

test("closing after last entry, not wrapped from the clock", () => {
  assert.equal(driveStatus({ ...base, endTime: "09:45", lastEntryTime: "09:45" }, tenAm), "closing");
});

test("a drive dated in the past is never live, whatever it stored", () => {
  const old = { ...base, date: "2026-08-27", status: "live", startTime: "00:00", endTime: "23:59" };
  assert.equal(driveStatus(old, tenAm), "wrapped");
});

test("a stored live flag does not open a future drive", () => {
  assert.equal(driveStatus({ ...base, date: "2026-10-05", status: "live" }, tenAm), "scheduled");
});

test("multi-day drives are scheduled between days and live during each day's hours", () => {
  const multi = { ...base, date: "2026-09-28", endDate: "2026-09-30" };
  assert.equal(driveStatus(multi, tenAm), "live");
  assert.equal(driveStatus(multi, at("2026-09-29T13:00:00Z")), "scheduled");
  assert.equal(driveStatus(multi, at("2026-09-30T12:00:00Z")), "closing");
});

test("overnight hours run past midnight", () => {
  const night = { ...base, startTime: "22:00", endTime: "04:00" };
  assert.equal(driveStatus(night, at("2026-09-29T18:00:00Z")), "live");
  assert.equal(driveStatus(night, at("2026-09-29T21:00:00Z")), "live");
  assert.equal(driveStatus(night, at("2026-09-29T23:00:00Z")), "closing");
});

test("draft until it has a role and a date", () => {
  assert.equal(driveStatus({ ...base, role: "" }, tenAm), "draft");
  assert.equal(driveStatus({ ...base, date: "" }, tenAm), "draft");
});

test("wrapping up early ends it", () => {
  assert.equal(driveStatus({ ...base, wrappedAt: tenAm - 1000 }, tenAm), "wrapped");
});

test("start now opens it by moving the hours", () => {
  const later = { ...base, startTime: "13:00" };
  const opened = { ...later, ...startNowPatch(later, tenAm) };
  assert.equal(driveStatus(opened, tenAm), "live");
});

test("a window placed around now is live, even across midnight", () => {
  const late = at("2026-09-29T19:51:00Z"); // 01:21 IST on the 30th
  for (const t of [tenAm, late]) {
    const d = { ...base, ...windowAround(t, -120, 480) };
    assert.equal(driveStatus(d, t), "live");
    assert.equal(driveWhen(d, t).key, "today");
  }
  const soon = { ...base, ...windowAround(tenAm, 90, 360) };
  assert.equal(driveStatus(soon, tenAm), "scheduled");
  assert.equal(driveWhen(soon, tenAm).key, "today");
});

test("candidate date labels", () => {
  assert.equal(driveWhen(base, tenAm).key, "today");
  assert.equal(driveWhen({ ...base, date: "2026-09-30" }, tenAm).key, "tomorrow");
  assert.equal(driveWhen({ ...base, date: "2026-10-03" }, tenAm).key, "week");
  assert.equal(driveWhen({ ...base, date: "2026-10-20" }, tenAm).key, "later");
  assert.equal(driveWhen({ ...base, date: "2026-09-01" }, tenAm).key, "ended");
});
