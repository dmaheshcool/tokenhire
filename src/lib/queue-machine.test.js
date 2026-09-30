import assert from "node:assert/strict";
import test from "node:test";
import { applyQueueAction, canAct, invariants, nextCall, publicName } from "./queue-machine.js";

const OWNER = { kind: "owner", email: "owner@vistaar.com" };
const REC_A = { kind: "recruiter", email: "priya@vistaar.com", rooms: ["rm1"] };
const REC_B = { kind: "recruiter", email: "arun@vistaar.com", rooms: ["rm2"] };
const DESK = { kind: "desk", email: "desk" };

function drive() {
  const t0 = 1_000_000;
  return {
    id: "d1",
    orgId: "o1",
    requireRejectReason: true,
    rounds: [
      { id: "r1", name: "HR" },
      { id: "r2", name: "Ops" },
      { id: "r3", name: "Final" },
    ],
    rooms: [
      { id: "rm1", name: "Room A", roundId: "r1", interviewerEmail: "priya@vistaar.com" },
      { id: "rm2", name: "Room B", roundId: "r1", interviewerEmail: "arun@vistaar.com" },
    ],
    candidates: [
      { id: "W-001", token: "W-001", name: "Kavya Menon", state: "wait", at: t0, checkedIn: true, roundIdx: 0 },
      { id: "W-002", token: "W-002", name: "Ravi Teja", state: "wait", at: t0 + 1, checkedIn: true, roundIdx: 0 },
      { id: "W-003", token: "W-003", name: "Zoya Khan", state: "wait", at: t0 + 2, checkedIn: true, roundIdx: 0 },
    ],
    log: [],
  };
}

test("call next picks the oldest waiting token for that room's round", () => {
  const pick = nextCall(drive(), "rm1");
  assert.equal(pick.cand.token, "W-001");
  assert.equal(pick.room.id, "rm1");
});

test("two concurrent call_next never share a token", () => {
  const d = drive();
  const a = applyQueueAction(d, { type: "call_next", roomId: "rm1" }, { actor: REC_A, now: 10 });
  const b = applyQueueAction(a.drive, { type: "call_next", roomId: "rm2" }, { actor: REC_B, now: 10 });
  assert.equal(a.ok, true);
  assert.equal(b.ok, true);
  assert.notEqual(a.cand.id, b.cand.id);
  assert.equal(invariants(b.drive).ok, true);
});

test("calling the same token twice is idempotent", () => {
  const d = drive();
  const a = applyQueueAction(d, { type: "call", candId: "W-001", roomId: "rm1" }, { actor: REC_A, now: 10 });
  const b = applyQueueAction(a.drive, { type: "call", candId: "W-001", roomId: "rm1" }, { actor: REC_A, now: 11 });
  assert.equal(b.ok, true);
  assert.equal(b.already, true);
  assert.equal(b.code, "already_called");
  assert.match(b.error, /Already called/);
});

test("desk scan is idempotent; uncalled tokens warn", () => {
  const d = drive();
  const warn = applyQueueAction(d, { type: "desk_scan", candId: "W-001" }, { actor: DESK, now: 10 });
  assert.equal(warn.code, "not_called");
  const called = applyQueueAction(d, { type: "call", candId: "W-001", roomId: "rm1" }, { actor: REC_A, now: 10 });
  const scan = applyQueueAction(called.drive, { type: "desk_scan", candId: "W-001" }, { actor: DESK, now: 11 });
  assert.equal(scan.cand.state, "at_desk");
  const again = applyQueueAction(scan.drive, { type: "desk_scan", candId: "W-001" }, { actor: DESK, now: 12 });
  assert.equal(again.already, true);
});

test("desk cannot record a decision", () => {
  const d = drive();
  const called = applyQueueAction(d, { type: "call_next", roomId: "rm1" }, { actor: REC_A, now: 10 });
  const r = applyQueueAction(called.drive, { type: "decide", candId: "W-001", outcome: "selected" }, { actor: DESK, now: 11 });
  assert.equal(r.ok, false);
  assert.match(r.error, /Desk staff/);
});

test("a recruiter cannot decide a candidate in the other room", () => {
  const d = drive();
  const a = applyQueueAction(d, { type: "call", candId: "W-001", roomId: "rm1" }, { actor: REC_A, now: 10 });
  const r = applyQueueAction(a.drive, { type: "decide", candId: "W-001", outcome: "selected", roomId: "rm2" }, { actor: REC_B, now: 11 });
  assert.equal(r.ok, false);
});

test("selected on an earlier round returns to wait", () => {
  const d = drive();
  let cur = applyQueueAction(d, { type: "call", candId: "W-001", roomId: "rm1" }, { actor: REC_A, now: 10 }).drive;
  cur = applyQueueAction(cur, { type: "start_round", candId: "W-001" }, { actor: REC_A, now: 11 }).drive;
  cur = applyQueueAction(cur, { type: "start_round", candId: "W-001" }, { actor: REC_A, now: 12 }).drive;
  const pass = applyQueueAction(cur, { type: "decide", candId: "W-001", outcome: "selected" }, { actor: REC_A, now: 13 });
  assert.equal(pass.ok, true);
  assert.equal(pass.cand.state, "wait");
  assert.equal(pass.cand.roundIdx, 1);
});

test("a second decision on the same round is rejected", () => {
  const d = drive();
  let cur = applyQueueAction(d, { type: "call", candId: "W-001", roomId: "rm1" }, { actor: REC_A, now: 10 }).drive;
  cur = applyQueueAction(cur, { type: "start_round", candId: "W-001" }, { actor: REC_A }).drive;
  cur = applyQueueAction(cur, { type: "start_round", candId: "W-001" }, { actor: REC_A }).drive;
  const hold = applyQueueAction(cur, { type: "decide", candId: "W-001", outcome: "onhold" }, { actor: REC_A, now: 14 });
  assert.equal(hold.ok, true);
  const twice = applyQueueAction(hold.drive, { type: "decide", candId: "W-001", outcome: "rejected", reason: "skill" }, { actor: REC_A, now: 15 });
  assert.equal(twice.ok, false);
  assert.equal(twice.code, "already_decided");
});

test("selected on the last round becomes done", () => {
  const d = drive();
  const cand = d.candidates[0];
  cand.roundIdx = 2;
  cand.state = "interviewing";
  cand.roundAssigned = true;
  cand.room = d.rooms[0];
  const pass = applyQueueAction(d, { type: "decide", candId: "W-001", outcome: "selected" }, { actor: REC_A, now: 13 });
  assert.equal(pass.cand.state, "done");
});

test("reject without a reason fails when the drive requires it", () => {
  const d = drive();
  let cur = applyQueueAction(d, { type: "call", candId: "W-001", roomId: "rm1" }, { actor: REC_A, now: 10 }).drive;
  cur = applyQueueAction(cur, { type: "start_round", candId: "W-001" }, { actor: REC_A }).drive;
  cur = applyQueueAction(cur, { type: "start_round", candId: "W-001" }, { actor: REC_A }).drive;
  const r = applyQueueAction(cur, { type: "decide", candId: "W-001", outcome: "rejected" }, { actor: REC_A, now: 20 });
  assert.equal(r.ok, false);
});

test("undo restores the candidate within 8 seconds", () => {
  const d = drive();
  let cur = applyQueueAction(d, { type: "call", candId: "W-001", roomId: "rm1" }, { actor: REC_A, now: 10 }).drive;
  cur = applyQueueAction(cur, { type: "start_round", candId: "W-001" }, { actor: REC_A }).drive;
  cur = applyQueueAction(cur, { type: "start_round", candId: "W-001" }, { actor: REC_A }).drive;
  const dec = applyQueueAction(cur, { type: "decide", candId: "W-001", outcome: "onhold" }, { actor: REC_A, now: 100 });
  const tooLate = applyQueueAction(dec.drive, { type: "undo", candId: "W-001" }, { actor: REC_A, now: 100 + 9000 });
  assert.equal(tooLate.ok, false);
  const owner = applyQueueAction(dec.drive, { type: "undo_late", candId: "W-001" }, { actor: OWNER, now: 100 + 9000 });
  assert.equal(owner.ok, true);
  assert.equal(owner.drive.candidates.find((c) => c.id === "W-001").state, "interviewing");
});

test("busy room cannot call another token", () => {
  const d = drive();
  const a = applyQueueAction(d, { type: "call_next", roomId: "rm1" }, { actor: REC_A, now: 10 });
  const b = applyQueueAction(a.drive, { type: "call_next", roomId: "rm1" }, { actor: REC_A, now: 11 });
  assert.equal(b.ok, false);
});

test("permissions: recruiter of room A is blocked from room B", () => {
  const d = drive();
  const r = canAct(REC_A, "call", d, { roomId: "rm2" });
  assert.equal(r.ok, false);
});

test("lobby name is first name and last initial only", () => {
  assert.equal(publicName("Kavya Menon"), "Kavya M.");
});
