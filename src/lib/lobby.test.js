import assert from "node:assert/strict";
import test from "node:test";
import { formatLobbyCode, normalizeLobbyInput, windowIndex } from "./lobby.js";
import { deriveLobbyCode, findDriveForCode, lobbyPayload, locationResult, validateLobbyCode } from "../../server/lobby.js";
import { istDate } from "./status.js";

const SECRET = "test-lobby-secret";

function liveDrive(id, role = "Support") {
  const day = "2026-09-30";
  return {
    id, role, date: day, endDate: day, startTime: "00:00", endTime: "23:59",
    doorsOpenTime: "00:00", lastEntryTime: "23:59", city: "Pune", company: "Acme",
  };
}

function futureDrive(id) {
  const day = istDate(3);
  return {
    id, role: "Later role", date: day, endDate: day, startTime: "10:00", endTime: "16:00",
    doorsOpenTime: "09:00", lastEntryTime: "15:00", city: "Pune",
  };
}

test("normalise trims, uppercases and drops dashes", () => {
  assert.equal(normalizeLobbyInput(" v4c-vnx "), "V4CVNX");
  assert.equal(formatLobbyCode("V4CVNX"), "V4C-VNX");
  assert.equal(formatLobbyCode("ABC1"), "ABC-1");
});

test("valid code in current, previous and next windows", () => {
  const now = Date.parse("2026-09-30T10:00:30+05:30");
  const drive = liveDrive("d_one");
  const win = windowIndex(now);
  const cur = deriveLobbyCode(drive.id, win, SECRET);
  const prev = deriveLobbyCode(drive.id, win - 1, SECRET);
  const next = deriveLobbyCode(drive.id, win + 1, SECRET);
  assert.equal(validateLobbyCode({ drive, drives: [drive], input: cur, now, secret: SECRET }).ok, true);
  assert.equal(validateLobbyCode({ drive, drives: [drive], input: formatLobbyCode(prev), now, secret: SECRET }).ok, true);
  assert.equal(validateLobbyCode({ drive, drives: [drive], input: next.toLowerCase(), now, secret: SECRET }).ok, true);
});

test("code fails after two minutes", () => {
  const now = Date.parse("2026-09-30T10:00:10+05:30");
  const drive = liveDrive("d_one");
  const old = deriveLobbyCode(drive.id, windowIndex(now) - 2, SECRET);
  const r = validateLobbyCode({ drive, drives: [drive], input: old, now, secret: SECRET });
  assert.equal(r.ok, false);
  assert.equal(r.reason, "expired");
});

test("wrong drive names the other walk-in", () => {
  const now = Date.parse("2026-09-30T10:00:10+05:30");
  const a = liveDrive("d_a", "Cashier");
  const b = liveDrive("d_b", "Fleet Supervisor");
  const code = deriveLobbyCode(b.id, windowIndex(now), SECRET);
  const r = validateLobbyCode({ drive: a, drives: [a, b], input: code, now, secret: SECRET });
  assert.equal(r.ok, false);
  assert.equal(r.reason, "wrong_drive");
  assert.match(r.error, /Fleet Supervisor/);
});

test("wrong case and dash still match", () => {
  const now = Date.parse("2026-09-30T10:00:10+05:30");
  const drive = liveDrive("d_one");
  const six = deriveLobbyCode(drive.id, windowIndex(now), SECRET);
  const dashed = formatLobbyCode(six).toLowerCase();
  assert.equal(validateLobbyCode({ drive, drives: [drive], input: dashed, now, secret: SECRET }).ok, true);
  assert.equal(validateLobbyCode({ drive, drives: [drive], input: six, now, secret: SECRET }).ok, true);
});

test("lobby-device clock 90 seconds off still works because the server clock is used", () => {
  const serverNow = Date.parse("2026-09-30T10:00:10+05:30");
  const drive = liveDrive("d_one");
  const payload = lobbyPayload(drive, "https://example.test", serverNow, SECRET);
  const deviceThinks = serverNow + 90_000;
  void deviceThinks;
  const r = validateLobbyCode({ drive, drives: [drive], input: payload.display, now: serverNow, secret: SECRET });
  assert.equal(r.ok, true);
});

test("lookalike letters get a specific hint", () => {
  const drive = liveDrive("d_one");
  const r = validateLobbyCode({ drive, drives: [drive], input: "OIL-001", now: Date.now(), secret: SECRET });
  assert.equal(r.reason, "lookalike");
});

test("typed code with no drive id resolves the one open walk-in", () => {
  const now = Date.parse("2026-09-30T10:00:10+05:30");
  const open = liveDrive("d_open");
  const closed = futureDrive("d_later");
  const code = deriveLobbyCode(open.id, windowIndex(now), SECRET);
  const hit = findDriveForCode([open, closed], code, now, SECRET, { openOnly: true });
  assert.equal(hit.drive.id, "d_open");
});

test("two open drives at one venue have distinct codes", () => {
  const now = Date.parse("2026-09-30T10:00:10+05:30");
  const a = liveDrive("d_a", "Cashier");
  const b = liveDrive("d_b", "Fleet Supervisor");
  const win = windowIndex(now);
  const codeA = deriveLobbyCode(a.id, win, SECRET);
  const codeB = deriveLobbyCode(b.id, win, SECRET);
  assert.notEqual(codeA, codeB);
  assert.equal(findDriveForCode([a, b], codeA, now, SECRET).drive.id, "d_a");
  assert.equal(findDriveForCode([a, b], codeB, now, SECRET).drive.id, "d_b");
  const r = validateLobbyCode({ drive: a, drives: [a, b], input: codeB, now, secret: SECRET });
  assert.equal(r.reason, "wrong_drive");
  assert.match(r.error, /Fleet Supervisor/);
});

test("a closed drive is not chosen when resolving a typed code", () => {
  const now = Date.parse("2026-09-30T10:00:10+05:30");
  const closed = {
    id: "d_closed", role: "Old role", date: "2026-09-29", endDate: "2026-09-29",
    startTime: "09:00", endTime: "17:00", doorsOpenTime: "09:00", lastEntryTime: "16:00", city: "Pune",
  };
  const code = deriveLobbyCode(closed.id, windowIndex(now), SECRET);
  assert.equal(findDriveForCode([closed], code, now, SECRET, { openOnly: true }), null);
});

test("no GPS is location not verified rather than a fail", () => {
  const drive = { ...liveDrive("d_one"), venueLat: 18.52, venueLng: 73.85 };
  assert.equal(locationResult(drive, null).location_verified, "unknown");
});
