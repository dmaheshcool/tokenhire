/**
 * Recruiter queue state machine.
 * Stored names keep the existing app strings; the brief's names are aliases.
 *
 * Brief → stored
 *   checked_in / waiting → wait
 *   called → calling
 *   at_desk → at_desk
 *   in_round → interviewing
 *   on_hold → onhold
 *   no_show → absent
 *   done → done (last-round selected)
 *   expired → expired (never checked in)
 *   cancelled → cancelled
 */

import {
  nextRoundIdx, roundIndexOfRoom, waitingRoundIdx,
  withRoundEnd, withRoundStart,
} from "./helpers.js";

export const CALL_TIMEOUT_MS = 5 * 60 * 1000;
export const UNDO_MS = 8_000;

export const ALIAS = {
  checked_in: "wait",
  waiting: "wait",
  called: "calling",
  in_round: "interviewing",
  on_hold: "onhold",
  no_show: "absent",
};

export function canon(state) {
  return ALIAS[state] || state;
}

export const IN_ROOM = new Set(["calling", "at_desk", "interviewing"]);
export const BLOCK_CALL = new Set([
  "calling", "at_desk", "interviewing", "done", "cancelled", "expired", "prereg",
  "selected", "rejected", "onhold", "absent", "not_seen", "carried", "undecided",
]);
export const TERMINAL = new Set(["selected", "rejected", "onhold", "absent", "done", "cancelled", "expired", "not_seen"]);

export const DESK_ACTIONS = new Set(["desk_scan", "issue_pass", "send_back"]);
export const RECRUITER_ACTIONS = new Set([
  "call_next", "call", "call_again", "skip", "no_show", "arrive_desk", "start_round",
  "decide", "undo", "resume_hold", "move_room", "pause_room", "release",
]);
export const OWNER_ONLY = new Set(["undo_late", "wrap", "export", "reassign"]);

export function occupantOf(drive, roomId) {
  return (drive?.candidates || []).find((x) => IN_ROOM.has(canon(x.state)) && x.room?.id === roomId);
}

export function callTimeoutMs(drive) {
  const m = Number(drive?.callTimeoutMin);
  return (Number.isFinite(m) && m > 0 ? m : 5) * 60_000;
}

export function calledOverdue(c, drive, now = Date.now()) {
  return canon(c?.state) === "calling" && c.calledAt && now - c.calledAt >= callTimeoutMs(drive);
}

export function publicName(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

function replaceCand(drive, id, fn) {
  return { ...drive, candidates: (drive.candidates || []).map((c) => (c.id === id ? fn(c) : c)) };
}

function log(drive, entry) {
  return { ...drive, log: [...(drive.log || []), entry].slice(-400) };
}

function actorLabel(actor) {
  return actor?.email || actor?.name || actor?.kind || "staff";
}

function roomOf(drive, roomId) {
  return (drive.rooms || []).find((r) => r.id === roomId);
}

function roleOk(room, cand) {
  const ids = room?.roleIds || [];
  if (!ids.length) return true;
  return ids.includes(cand.roleId);
}

export function canAct(actor, type, drive, extra = {}) {
  if (!actor) return { ok: false, error: "Sign in required." };
  if (actor.kind === "desk") {
    if (!DESK_ACTIONS.has(type)) return { ok: false, error: "Desk staff can scan and issue passes only." };
    return { ok: true };
  }
  if (actor.kind !== "owner" && actor.kind !== "recruiter") {
    return { ok: false, error: "Not allowed." };
  }
  if (OWNER_ONLY.has(type) && actor.kind !== "owner") {
    return { ok: false, error: "Only the drive owner can do that." };
  }
  if (actor.kind === "recruiter" && extra.roomId) {
    const room = roomOf(drive, extra.roomId);
    const mine = (actor.rooms || []).length
      ? actor.rooms.includes(extra.roomId)
      : !room?.interviewerEmail || room.interviewerEmail === actor.email;
    if (room && !mine) return { ok: false, error: "That room is assigned to someone else." };
  }
  if (extra.cand && extra.cand.room?.id && extra.roomId && extra.cand.room.id !== extra.roomId && type === "decide") {
    return { ok: false, error: "This candidate is in another room." };
  }
  return { ok: true };
}

export function nextCall(drive, roomId, now = Date.now()) {
  void now;
  const rooms = (drive.rooms || []).filter((r) => (roomId ? r.id === roomId : true) && !r.paused && !occupantOf(drive, r.id));
  const waiting = (drive.candidates || [])
    .filter((c) => canon(c.state) === "wait")
    .sort((a, b) => (Number(b.priority || 0) - Number(a.priority || 0))
      || (Number(b.checkedIn !== false) - Number(a.checkedIn !== false))
      || (a.at - b.at)
      || String(a.token).localeCompare(String(b.token)));
  for (const room of rooms) {
    const ri = roundIndexOfRoom(drive.rounds, room);
    const cand = waiting.find((c) => {
      if (!roleOk(room, c)) return false;
      if (ri >= 0 && waitingRoundIdx(drive.rounds, c) !== ri) return false;
      return true;
    });
    if (cand) return { cand, room };
  }
  return null;
}

function fail(error, extra = {}) {
  return { ok: false, error, ...extra };
}

function ok(drive, extra = {}) {
  return { ok: true, drive, ...extra };
}

function startCall(drive, cand, room, now, actor) {
  const idx = waitingRoundIdx(drive.rounds, cand);
  const rid = (drive.rounds || [])[idx]?.id;
  const next = withRoundStart({
    ...cand,
    state: "calling",
    calledAt: now,
    calledBy: actorLabel(actor),
    room,
    roundAssigned: true,
    roundIdx: idx,
  }, rid, room, now);
  let d = replaceCand(drive, cand.id, () => next);
  d = log(d, { at: now, by: actorLabel(actor), action: "call", token: cand.token, room: room.id });
  return ok(d, { cand: next, room });
}

function applyDecide(drive, cand, outcome, now, actor, extra) {
  const mapped = outcome === "passed" || outcome === "select" || outcome === "selected" ? "selected"
    : outcome === "hold" ? "onhold"
      : outcome === "no_show" || outcome === "noshow" ? "absent"
        : outcome;
  if (!["selected", "rejected", "onhold", "absent"].includes(mapped)) {
    return fail("Unknown decision.");
  }
  if (TERMINAL.has(canon(cand.state)) && canon(cand.state) !== "onhold") {
    return fail("A decision is already on file for this round.", { existing: cand.roundOutcomes, code: "already_decided" });
  }
  const rid = (drive.rounds || [])[cand.roundIdx || 0]?.id;
  if (rid && cand.roundOutcomes?.[rid] && extra?.force !== true) {
    return fail("A decision is already on file for this round.", { existing: cand.roundOutcomes[rid], code: "already_decided" });
  }
  if (mapped === "rejected" && drive.requireRejectReason && !String(extra?.reason || extra?.note || "").trim()) {
    return fail("Add a reason for this rejection.");
  }
  const before = { ...cand };
  const nextIdx = nextRoundIdx(drive.rounds, cand);
  const last = nextIdx < 0;
  const roundOutcomes = { ...(cand.roundOutcomes || {}), [rid]: mapped === "absent" ? "absent" : mapped };
  const base = withRoundEnd({
    ...cand,
    roundOutcomes,
    decidedAt: now,
    decidedBy: actorLabel(actor),
    decisionNote: extra?.note || cand.decisionNote,
    decisionReason: extra?.reason || "",
    room: null,
  }, rid, now);

  let next;
  if (mapped === "rejected") next = { ...base, state: "rejected" };
  else if (mapped === "onhold") next = { ...base, state: "onhold" };
  else if (mapped === "absent") next = { ...base, state: "absent" };
  else if (last) next = { ...base, state: "done" };
  else {
    const peers = (drive.candidates || []).filter((p) => p.id !== cand.id && canon(p.state) === "wait" && (p.roundIdx || 0) === nextIdx);
    const at = peers.length ? Math.min(...peers.map((p) => p.at)) - 1 : now;
    next = { ...base, roundIdx: nextIdx, state: "wait", calledAt: null, at, pinged: false, roundAssigned: true };
  }

  let d = replaceCand(drive, cand.id, () => next);
  d = {
    ...d,
    undo: { candId: cand.id, before, until: now + UNDO_MS, by: actorLabel(actor) },
  };
  d = log(d, { at: now, by: actorLabel(actor), action: "decide", token: cand.token, outcome: mapped, round: rid });
  return ok(d, { cand: next, outcome: mapped });
}

export function applyQueueAction(drive, action = {}, ctx = {}) {
  const now = ctx.now || Date.now();
  const actor = ctx.actor || { kind: "owner", email: "owner@local" };
  const type = action.type;
  const cand = action.candId ? (drive.candidates || []).find((c) => c.id === action.candId || c.token === action.candId) : null;

  const gate = canAct(actor, type, drive, { roomId: action.roomId || cand?.room?.id, cand });
  if (!gate.ok) return fail(gate.error);

  if (type === "call_next") {
    const pick = nextCall(drive, action.roomId, now);
    if (!pick) return fail("No one is waiting for a free room.");
    return startCall(drive, pick.cand, pick.room, now, actor);
  }

  if (type === "call") {
    if (!cand) return fail("No candidate.");
    if (BLOCK_CALL.has(canon(cand.state)) && canon(cand.state) !== "calling") {
      return fail("That token cannot be called.");
    }
    if (canon(cand.state) === "calling") {
      return ok(drive, {
        cand,
        already: true,
        code: "already_called",
        error: `Already called by ${cand.calledBy || "another recruiter"}.`,
      });
    }
    const room = roomOf(drive, action.roomId);
    if (!room) return fail("Pick a room.");
    if (room.paused) return fail("That room is paused.");
    const taken = occupantOf(drive, room.id);
    if (taken && taken.id !== cand.id) return fail("That room is busy.");
    return startCall(drive, cand, room, now, actor);
  }

  if (type === "call_again") {
    if (!cand || canon(cand.state) !== "calling") return fail("That token is not being called.");
    const next = { ...cand, calledAt: now, calledBy: actorLabel(actor) };
    return ok(log(replaceCand(drive, cand.id, () => next), { at: now, by: actorLabel(actor), action: "call_again", token: cand.token }), { cand: next });
  }

  if (type === "skip") {
    if (!cand) return fail("No candidate.");
    const next = { ...cand, state: "wait", at: now, calledAt: null, room: null, skipped: (cand.skipped || 0) + 1 };
    return ok(log(replaceCand(drive, cand.id, () => next), { at: now, by: actorLabel(actor), action: "skip", token: cand.token }), { cand: next });
  }

  if (type === "no_show") {
    if (!cand) return fail("No candidate.");
    const next = { ...cand, state: "absent", room: null, decidedAt: now, decidedBy: actorLabel(actor) };
    return ok(log(replaceCand(drive, cand.id, () => next), { at: now, by: actorLabel(actor), action: "no_show", token: cand.token }), { cand: next });
  }

  if (type === "desk_scan") {
    if (!cand) return fail("No candidate.");
    if (canon(cand.state) === "at_desk") {
      return ok(drive, { cand, already: true, code: "already_at_desk" });
    }
    const warned = canon(cand.state) !== "calling" && action.force !== true;
    if (warned) {
      return fail("This token was not called yet.", { code: "not_called", cand, allowForce: true });
    }
    const next = { ...cand, state: "at_desk", atDeskAt: cand.atDeskAt || now, checkedIn: true };
    return ok(log(replaceCand(drive, cand.id, () => next), { at: now, by: actorLabel(actor), action: "desk_scan", token: cand.token }), { cand: next });
  }

  if (type === "send_back") {
    if (!cand) return fail("No candidate.");
    const next = { ...cand, state: "wait", room: null, calledAt: null, at: now };
    return ok(replaceCand(drive, cand.id, () => next), { cand: next });
  }

  if (type === "start_round" || type === "arrive_desk") {
    if (!cand) return fail("No candidate.");
    if (canon(cand.state) === "calling") {
      const next = { ...cand, state: "at_desk", atDeskAt: now };
      return ok(replaceCand(drive, cand.id, () => next), { cand: next });
    }
    if (canon(cand.state) === "at_desk") {
      const next = { ...cand, state: "interviewing" };
      return ok(replaceCand(drive, cand.id, () => next), { cand: next });
    }
    if (canon(cand.state) === "interviewing") return ok(drive, { cand, already: true });
    return fail("Bring them to the desk first.");
  }

  if (type === "decide") {
    if (!cand) return fail("No candidate.");
    if (action.roomId && cand.room?.id && cand.room.id !== action.roomId) {
      return fail("This candidate is in another room.");
    }
    return applyDecide(drive, cand, action.outcome, now, actor, action);
  }

  if (type === "undo" || type === "undo_late") {
    const snap = drive.undo;
    if (!snap || snap.candId !== (action.candId || snap.candId)) return fail("Nothing to undo.");
    if (type === "undo" && now > snap.until && actor.kind !== "owner") {
      return fail("The undo window has closed.");
    }
    let d = replaceCand(drive, snap.candId, () => snap.before);
    d = { ...d, undo: null };
    d = log(d, { at: now, by: actorLabel(actor), action: "undo", token: snap.before.token });
    return ok(d);
  }

  if (type === "resume_hold") {
    if (!cand || canon(cand.state) !== "onhold") return fail("That person is not on hold.");
    const next = { ...cand, state: "wait", at: now, room: null, calledAt: null };
    return ok(replaceCand(drive, cand.id, () => next), { cand: next });
  }

  if (type === "move_room") {
    if (!cand) return fail("No candidate.");
    if (!String(action.reason || "").trim()) return fail("Add a reason for the move.");
    const room = roomOf(drive, action.roomId);
    if (!room) return fail("Pick a room.");
    const taken = occupantOf(drive, room.id);
    if (taken && taken.id !== cand.id) return fail("That room is busy.");
    const next = { ...cand, room, roundIdx: roundIndexOfRoom(drive.rounds, room) >= 0 ? roundIndexOfRoom(drive.rounds, room) : cand.roundIdx };
    let d = replaceCand(drive, cand.id, () => next);
    d = log(d, { at: now, by: actorLabel(actor), action: "move_room", token: cand.token, room: room.id, reason: action.reason || "" });
    return ok(d, { cand: next });
  }

  if (type === "pause_room") {
    const room = roomOf(drive, action.roomId);
    if (!room) return fail("No room.");
    const rooms = drive.rooms.map((r) => (r.id === room.id ? { ...r, paused: !r.paused } : r));
    return ok({ ...drive, rooms });
  }

  if (type === "release") {
    if (!cand) return fail("No candidate.");
    const next = { ...cand, state: "wait", room: null, calledAt: null, at: now };
    return ok(replaceCand(drive, cand.id, () => next), { cand: next });
  }

  return fail("Unknown action.");
}

export function applyMany(drive, actions, ctx) {
  let cur = drive;
  const results = [];
  for (const a of actions) {
    const r = applyQueueAction(cur, a, ctx);
    results.push(r);
    if (r.ok) cur = r.drive;
  }
  return { drive: cur, results };
}

export function invariants(drive) {
  const rooms = {};
  const decisions = {};
  const problems = [];
  for (const c of drive.candidates || []) {
    if (IN_ROOM.has(canon(c.state)) && c.room?.id) {
      if (rooms[c.room.id]) problems.push(`two people in ${c.room.id}`);
      rooms[c.room.id] = c.id;
    }
    const rid = (drive.rounds || [])[c.roundIdx || 0]?.id;
    if (rid && c.roundOutcomes?.[rid]) {
      const key = `${c.id}:${rid}`;
      if (decisions[key]) problems.push(`duplicate decision ${key}`);
      decisions[key] = c.roundOutcomes[rid];
    }
  }
  return { ok: problems.length === 0, problems };
}
