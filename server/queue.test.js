import assert from "node:assert/strict";
import http from "node:http";
import test from "node:test";
import app from "./app.js";
import { createSession, findOrgByEmail, getState, ready } from "./db.js";

let server;
let port;
let cookie;
let driveId;
let pin;

async function post(path, body, extra = {}) {
  const headers = { "Content-Type": "application/json", ...(extra.headers || {}) };
  if (extra.cookie !== false && cookie) headers.Cookie = extra.cookie || cookie;
  const res = await fetch(`http://127.0.0.1:${port}${path}`, {
    method: extra.method || "POST",
    headers,
    body: extra.method === "GET" ? undefined : JSON.stringify(body || {}),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

function driveOf() {
  return getState().drives.find((d) => d.id === driveId);
}

test.before(async () => {
  await ready();
  server = http.createServer(app);
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  port = server.address().port;
  const org = findOrgByEmail("demo@vistaar.com");
  assert.ok(org, "demo org missing");
  const token = createSession(org, "demo@vistaar.com", "admin");
  cookie = `th_session=${token}`;
  driveId = `qtest_${Date.now()}`;
  pin = "QTEST9";
  const t0 = Date.now();
  getState().drives.unshift({
    id: driveId,
    orgId: org.id,
    host: pin,
    requireRejectReason: true,
    rounds: [{ id: "r1", name: "HR" }, { id: "r2", name: "Tech" }, { id: "r3", name: "Final" }],
    rooms: [
      { id: "rm1", name: "Room A", roundId: "r1", interviewerEmail: "priya@vistaar.com" },
      { id: "rm2", name: "Room B", roundId: "r1", interviewerEmail: "arun@vistaar.com" },
    ],
    candidates: [1, 2, 3, 4, 5, 6].map((i) => ({
      id: `T-${i}`,
      token: `T-${i}`,
      name: `Person ${i}`,
      state: "wait",
      at: t0 + i,
      checkedIn: true,
      roundIdx: 0,
    })),
    log: [],
  });
});

test.after(async () => {
  const s = getState();
  s.drives = s.drives.filter((d) => d.id !== driveId);
  await new Promise((r) => server.close(r));
});

test("unauthenticated queue action is rejected", async () => {
  const r = await post(`/api/queue/${driveId}`, { type: "call_next", roomId: "rm1" }, { cookie: false });
  assert.equal(r.status, 401);
});

test("desk PIN cannot record a decision", async () => {
  const r = await post(`/api/queue/${driveId}`, { type: "decide", candId: "T-1", outcome: "selected", pin }, { cookie: false });
  assert.equal(r.status, 400);
  assert.match(String(r.data.error), /Desk staff/);
});

test("two Call next on the same room never share a token", async () => {
  const [a, b] = await Promise.all([
    post(`/api/queue/${driveId}`, { type: "call_next", roomId: "rm1" }),
    post(`/api/queue/${driveId}`, { type: "call_next", roomId: "rm1" }),
  ]);
  const oks = [a, b].filter((x) => x.data.ok);
  assert.equal(oks.length, 1);
  const busy = [a, b].find((x) => !x.data.ok);
  assert.ok(busy);
});

test("Call next on the other room picks a different token", async () => {
  const r = await post(`/api/queue/${driveId}`, { type: "call_next", roomId: "rm2" });
  assert.equal(r.status, 200);
  const calling = driveOf().candidates.filter((c) => c.state === "calling");
  const ids = new Set(calling.map((c) => c.id));
  assert.equal(ids.size, calling.length);
  assert.ok(calling.length >= 2);
});

test("calling the same token twice is idempotent", async () => {
  const called = driveOf().candidates.find((c) => c.state === "calling" && c.room?.id === "rm2");
  const r = await post(`/api/queue/${driveId}`, { type: "call", candId: called.id, roomId: "rm2" });
  assert.equal(r.status, 200);
  assert.equal(r.data.already, true);
  assert.equal(r.data.code, "already_called");
});

test("desk scan is idempotent; uncalled tokens warn", async () => {
  const waiting = driveOf().candidates.find((c) => c.state === "wait");
  const warn = await post(`/api/queue/${driveId}`, { type: "desk_scan", candId: waiting.id, pin }, { cookie: false });
  assert.equal(warn.data.code, "not_called");
  const called = driveOf().candidates.find((c) => c.state === "calling");
  const scan = await post(`/api/queue/${driveId}`, { type: "desk_scan", candId: called.id, pin }, { cookie: false });
  assert.equal(scan.status, 200);
  const again = await post(`/api/queue/${driveId}`, { type: "desk_scan", candId: called.id, pin }, { cookie: false });
  assert.equal(again.data.already, true);
});

test("a second decision on the same round is rejected", async () => {
  let cand = driveOf().candidates.find((c) => c.state === "at_desk") || driveOf().candidates.find((c) => c.state === "calling");
  await post(`/api/queue/${driveId}`, { type: "start_round", candId: cand.id });
  cand = driveOf().candidates.find((c) => c.id === cand.id);
  await post(`/api/queue/${driveId}`, { type: "start_round", candId: cand.id });
  cand = driveOf().candidates.find((c) => c.id === cand.id);
  const hold = await post(`/api/queue/${driveId}`, { type: "decide", candId: cand.id, outcome: "onhold" });
  assert.equal(hold.status, 200);
  const twice = await post(`/api/queue/${driveId}`, { type: "decide", candId: cand.id, outcome: "rejected", reason: "skill" });
  assert.equal(twice.status, 400);
  assert.equal(twice.data.code, "already_decided");
});

test("unauthenticated snapshot cannot rewrite decisions", async () => {
  const snap = await post("/api/snapshot", {}, { method: "GET", cookie: false });
  const drive = (snap.data.drives || []).find((d) => d.id === driveId);
  if (!drive) return;
  const tampered = {
    ...drive,
    candidates: drive.candidates.map((c) => ({ ...c, state: "selected" })),
  };
  await post("/api/snapshot", { drives: [tampered] }, { method: "PUT", cookie: false });
  const after = driveOf().candidates;
  assert.ok(after.some((c) => c.state !== "selected"));
});
