#!/usr/bin/env node
/** Seed a drive and fire concurrent recruiter actions, then assert invariants. */
import assert from "node:assert/strict";
import { applyQueueAction, invariants } from "../src/lib/queue-machine.js";

function seed() {
  const now = Date.now();
  const candidates = [];
  for (let i = 1; i <= 40; i++) {
    candidates.push({
      id: `W-${String(i).padStart(3, "0")}`,
      token: `W-${String(i).padStart(3, "0")}`,
      name: `Person ${i}`,
      state: "wait",
      at: now + i,
      checkedIn: true,
      roundIdx: 0,
    });
  }
  return {
    id: "sim",
    rounds: [{ id: "r1", name: "HR" }, { id: "r2", name: "Tech" }, { id: "r3", name: "Final" }],
    rooms: [
      { id: "rm1", name: "Room A", roundId: "r1", interviewerEmail: "a@x.com" },
      { id: "rm2", name: "Room B", roundId: "r1", interviewerEmail: "b@x.com" },
    ],
    candidates,
    log: [],
  };
}

const actors = [
  { kind: "recruiter", email: "a@x.com", rooms: ["rm1"] },
  { kind: "recruiter", email: "b@x.com", rooms: ["rm2"] },
  { kind: "recruiter", email: "c@x.com", rooms: ["rm1"] },
  { kind: "desk", email: "desk" },
];

function randomAction(drive) {
  const waiting = drive.candidates.filter((c) => c.state === "wait");
  const called = drive.candidates.filter((c) => c.state === "calling");
  const inside = drive.candidates.filter((c) => c.state === "at_desk" || c.state === "interviewing");
  const n = Math.random();
  if (n < 0.35) return { type: "call_next", roomId: Math.random() < 0.5 ? "rm1" : "rm2" };
  if (n < 0.5 && called[0]) return { type: "desk_scan", candId: called[0].id, force: true };
  if (n < 0.65 && inside[0]) return { type: "decide", candId: inside[0].id, outcome: Math.random() < 0.5 ? "selected" : "onhold" };
  if (n < 0.8 && called[0]) return { type: "start_round", candId: called[0].id };
  if (n < 0.9 && waiting[0]) return { type: "skip", candId: waiting[0].id };
  if (called[0]) return { type: "no_show", candId: called[0].id };
  return { type: "call_next", roomId: "rm1" };
}

let drive = seed();
const chain = [];
for (let i = 0; i < 220; i++) {
  const actor = actors[i % actors.length];
  const action = randomAction(drive);
  chain.push({ actor, action });
}

let lock = Promise.resolve();
function withLock(fn) {
  const next = lock.then(fn, fn);
  lock = next.catch(() => {});
  return next;
}

await Promise.all(chain.map((step) => withLock(() => {
  const r = applyQueueAction(drive, step.action, { actor: step.actor, now: Date.now() });
  if (r.ok) drive = r.drive;
})));

const inv = invariants(drive);
assert.equal(inv.ok, true, inv.problems.join("; "));
const stuck = drive.candidates.filter((c) => c.state === "calling" && Date.now() - c.calledAt > 10 * 60 * 1000);
assert.equal(stuck.length, 0);
const counts = drive.candidates.reduce((m, c) => ({ ...m, [c.state]: (m[c.state] || 0) + 1 }), {});
const sum = Object.values(counts).reduce((a, b) => a + b, 0);
assert.equal(sum, 40);
console.log("simulate-drive ok", counts);
