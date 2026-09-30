import assert from "node:assert/strict";
import test from "node:test";
import { isPrereg, makePrereg, preregCount, preregCsv, preregOf, promotePrereg } from "./prereg.js";

test("pre-registration is not a token and does not sit in the wait state", () => {
  const p = makePrereg({ name: "Asha", phone: "9876543210", email: "a@x.com", deviceId: "dev1" });
  assert.equal(isPrereg(p), true);
  assert.equal(p.token, null);
  assert.equal(p.state, "prereg");
  assert.equal(p.checkedIn, false);
});

test("promote issues the first token and marks arrived", () => {
  const p = makePrereg({ name: "Asha", phone: "9876543210", deviceId: "dev1" });
  const live = promotePrereg(p, 7, { method: "lobby_qr", location_verified: "unknown" });
  assert.equal(live.token, "W-007");
  assert.equal(live.state, "wait");
  assert.equal(live.checkedIn, true);
  assert.equal(live.checkin_method, "lobby_qr");
});

test("match by phone on the same drive", () => {
  const profile = { phone: "9876543210", deviceId: "other" };
  const drive = { candidates: [makePrereg({ name: "Asha", phone: "9876543210", deviceId: "dev1" })] };
  assert.equal(preregCount(drive), 1);
  assert.equal(preregOf(drive, profile).name, "Asha");
});

test("csv lists pre-registered people", () => {
  const drive = { id: "d1", candidates: [makePrereg({ name: "Asha", phone: "9876543210", email: "a@x.com", deviceId: "d" })] };
  const csv = preregCsv(drive);
  assert.match(csv, /Asha/);
  assert.match(csv, /9876543210/);
});
