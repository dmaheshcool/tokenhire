import { test } from "node:test";
import assert from "node:assert/strict";
import { seedBoardDrives } from "../data/board.js";
import { driveStatus, driveWhen } from "./status.js";
import { payLabel, queueStats } from "./listing.js";

const tenAm = Date.parse("2026-09-29T04:30:00Z");
const late = Date.parse("2026-09-29T19:51:00Z");

test("a hundred listings with unique descriptions", () => {
  const list = seedBoardDrives(tenAm);
  assert.equal(list.length, 100);
  assert.equal(new Set(list.map((d) => d.id)).size, 100);
  assert.equal(new Set(list.map((d) => d.jd)).size, 100);
});

test("the same ids and copy whatever the time", () => {
  const a = seedBoardDrives(tenAm), b = seedBoardDrives(late);
  assert.deepEqual(a.map((d) => [d.id, d.company, d.role, d.jd]), b.map((d) => [d.id, d.company, d.role, d.jd]));
});

test("the four big cities carry most of the board", () => {
  const list = seedBoardDrives(tenAm);
  const count = (c) => list.filter((d) => d.city === c).length;
  const big = ["Hyderabad", "Bengaluru", "Pune", "Mumbai"].map(count);
  assert.ok(big.every((n) => n >= 14));
  assert.ok(big.reduce((a, b) => a + b, 0) >= 60);
});

test("some drives are live at any hour, and none in the past are", () => {
  for (const t of [tenAm, late]) {
    const list = seedBoardDrives(t);
    const live = list.filter((d) => driveStatus(d, t) === "live");
    assert.ok(live.length >= 15, `only ${live.length} live`);
    assert.ok(live.every((d) => queueStats(d).waiting > 0));
    assert.ok(list.filter((d) => driveWhen(d, t).key === "ended").every((d) => driveStatus(d, t) === "wrapped"));
  }
});

test("pay is shown per month", () => {
  const list = seedBoardDrives(tenAm);
  assert.ok(list.every((d) => /^₹[\d,]+ to ₹[\d,]+$/.test(payLabel(d))));
});
