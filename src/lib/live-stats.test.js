import assert from "node:assert/strict";
import test from "node:test";
import { computeLiveStats } from "./live-stats.js";
import { windowAround } from "./status.js";

test("live stats count open windows, waiting tokens, and tokens issued today IST", () => {
  const now = Date.parse("2026-09-30T10:00:00+05:30");
  const openDrive = {
    id: "a",
    role: "Support",
    city: "Hyderabad",
    ...windowAround(now, -60, 480),
    candidates: [
      { state: "wait", at: now - 1000 },
      { state: "calling", at: now - 2000 },
      { state: "interviewing", at: now - 3000 },
      { state: "cancelled", at: now - 4000 },
      { state: "wait", at: Date.parse("2026-09-29T23:00:00+05:30") },
    ],
  };
  const later = {
    id: "b",
    role: "Later",
    city: "Pune",
    ...windowAround(now, 8 * 60, 240),
    candidates: [{ state: "wait", at: now }],
  };
  const s = computeLiveStats([openDrive, later], now);
  assert.equal(s.open, 1);
  assert.equal(s.queue, 4);
  assert.equal(s.today, 4);
  assert.ok(s.waitMin > 0);
  assert.equal(s.cities.Hyderabad?.open, 1);
  assert.equal(s.cities.Pune?.open, 0);
  assert.equal(s.cities.Pune?.total, 1);
});

test("pre-registered people are not in the live queue or today's token count", () => {
  const now = Date.parse("2026-09-30T10:00:00+05:30");
  const d = {
    id: "a",
    role: "Support",
    city: "Hyderabad",
    ...windowAround(now, -60, 480),
    candidates: [
      { state: "prereg", at: now },
      { state: "wait", at: now },
    ],
  };
  const s = computeLiveStats([d], now);
  assert.equal(s.queue, 1);
  assert.equal(s.today, 1);
});
