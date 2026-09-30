import { test } from "node:test";
import assert from "node:assert/strict";
import { seedBoardDrives } from "../data/board.js";
import { seedExtraDrives } from "../data/seed.js";
import { driveRoles } from "./library.js";
import { driveStatus, driveWhen } from "./status.js";
import { PAY_TYPES, hasPay, monthlyPay, payLabel, payText, payType, queueStats } from "./listing.js";

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

test("a sample drive can hire for more than one role", () => {
  const d = seedExtraDrives().find((x) => x.id === "d_vistaar_bfsi");
  assert.deepEqual(driveRoles(d).map((r) => [r.title, r.code]), [["Collections Officer", "CO"], ["Collections Team Lead", "CTL"]]);
  assert.equal((d.fields || []).length, 2);
});

test("pay comes in several types, and some listings leave it out", () => {
  const list = seedBoardDrives(tenAm);
  const types = new Set(list.filter(hasPay).map(payType));
  for (const k of PAY_TYPES) assert.ok(types.has(k), `no ${k} pay in the seed`);
  const none = list.filter((d) => !hasPay(d));
  assert.ok(none.length >= 5 && none.length <= 15, `${none.length} without pay`);
  assert.ok(none.every((d) => payText(d) === "Pay discussed at interview"));
  assert.ok(list.filter(hasPay).every((d) => /^₹[\d,]+( to ₹[\d,]+)? per /.test(payLabel(d))));
});

test("pay labels and monthly figures by type", () => {
  const d = (payType, payMin, payMax) => ({ payType, payMin, payMax });
  assert.equal(payText(d("month", 16000, 24000)), "Pay: ₹16,000 to ₹24,000 per month");
  assert.equal(payText(d(undefined, 16000, 16000)), "Pay: ₹16,000 per month");
  assert.equal(payText(d("day", 700, 900)), "Pay: ₹700 to ₹900 per day");
  assert.equal(payText(d("year", 300000, 450000)), "Pay: ₹3,00,000 to ₹4,50,000 per year (CTC)");
  assert.equal(payText(d("fixed", 15000, null)), "Pay: ₹15,000 per month + incentive");
  assert.equal(payText(d("task", null, null)), "Pay discussed at interview");
  assert.equal(monthlyPay(d("month", 16000, 24000)), 24000);
  assert.equal(monthlyPay(d("day", 700, 900)), 23400);
  assert.equal(monthlyPay(d("hour", 100, 150)), 31200);
  assert.equal(monthlyPay(d("year", 300000, 480000)), 40000);
  assert.equal(monthlyPay(d("task", 30, 45)), null);
  assert.equal(monthlyPay(d("month", null, null)), null);
});
