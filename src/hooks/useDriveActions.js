import { useCallback, useMemo } from "react";
import { api } from "../lib/api.js";
import { applyQueueAction } from "../lib/queue-machine.js";
import { inARound, roundIndexOfRoom, waitingRoundIdx } from "../lib/helpers.js";

function actorOf(opts, drive) {
  if (opts?.actor) return opts.actor;
  if (opts?.pin && !opts?.staffEmail) return { kind: "desk", email: "desk" };
  const email = opts?.staffEmail || "console";
  const kind = opts?.staffRole === "frontdesk" ? "desk"
    : (opts?.staffRole === "owner" || opts?.staffRole === "admin") ? "owner"
      : "recruiter";
  const assigned = (drive?.rooms || [])
    .filter((r) => r.interviewerEmail && String(r.interviewerEmail).toLowerCase() === String(email).toLowerCase())
    .map((r) => r.id);
  return { kind, email, ...(assigned.length ? { rooms: assigned } : {}) };
}

/** Queue moves for one drive: call, skip, no-show, desk scan, decide, notes, rooms. */
export function useDriveActions(drive, setDrives, opts = {}) {
  const id = drive?.id;
  const upd = useCallback((fn) => {
    if (!id) return;
    setDrives((p) => p.map((d) => (d.id === id ? fn(d) : d)));
  }, [id, setDrives]);
  const applyRemote = opts.applyRemote;
  const mapCand = useCallback((cid, fn) => upd((d) => ({ ...d, candidates: d.candidates.map((x) => (x.id === cid ? fn(x, d) : x)) })), [upd]);

  const run = useCallback(async (action) => {
    if (!drive) return { ok: false, error: "No drive." };
    const actor = actorOf(opts, drive);
    const r = applyQueueAction(drive, action, { actor });
    if (!r.ok) return r;
    const prev = drive;
    const offline = opts.apiOk === false;
    if (offline || !applyRemote) upd(() => r.drive);
    else applyRemote(r.drive, { silent: true });
    if (offline) return r;
    try {
      const data = await api.queueAction(drive.id, { ...action, pin: opts.pin || undefined });
      if (data.drive) {
        if (applyRemote) applyRemote(data.drive, { version: data.version, silent: true });
        else upd(() => data.drive);
      }
      return { ...r, ...data, ok: true };
    } catch (e) {
      if (applyRemote && !offline) applyRemote(prev, { silent: true });
      else upd(() => prev);
      return { ok: false, error: e.data?.error || e.message, code: e.data?.code, existing: e.data?.existing, already: e.data?.already };
    }
  }, [drive, upd, applyRemote, opts]);

  return useMemo(() => ({
    patch: (fields) => upd((d) => ({ ...d, ...fields })),
    run,

    callTo(cid, roomId) {
      return run({ type: "call", candId: cid, roomId });
    },

    callNext: (roomId) => run({ type: "call_next", roomId: roomId || undefined }),

    callAgain: (cid) => run({ type: "call_again", candId: cid }),

    skip: (cid) => run({ type: "skip", candId: cid }),

    noShow: (cid) => run({ type: "no_show", candId: cid }),

    recall(cid) {
      return run({ type: "release", candId: cid });
    },

    deskScan: (cid, force) => run({ type: "desk_scan", candId: cid, force: !!force }),

    sendBack: (cid) => run({ type: "send_back", candId: cid }),

    arrived: (cid) => mapCand(cid, (x) => ({ ...x, checkedIn: true, arrivedAt: x.arrivedAt || Date.now() })),

    async move(cid, state) {
      if (state === "interviewing" || state === "at_desk") {
        const r = await run({ type: "start_round", candId: cid });
        if (r.ok && state === "interviewing" && r.cand?.state === "at_desk") await run({ type: "start_round", candId: cid });
        return r;
      }
      mapCand(cid, (x, d) => {
        const next = { ...x, state };
        if (state === "calling" && !x.calledAt) next.calledAt = Date.now();
        if (state === "calling" || state === "interviewing") {
          next.roundAssigned = true;
          if (!inARound(x)) next.roundIdx = waitingRoundIdx(d.rounds, x);
          if (x.room) {
            const ri = roundIndexOfRoom(d.rounds, x.room);
            if (ri >= 0) next.roundIdx = ri;
          }
        }
        if (state === "wait" || state === "absent") { next.room = null; next.calledAt = state === "wait" ? null : x.calledAt; }
        return next;
      });
      return { ok: true };
    },

    decide(cid, outcome, extra = {}) {
      const mapped = outcome === "passed" ? "selected" : outcome;
      return run({ type: "decide", candId: cid, outcome: mapped, reason: extra.reason || "", note: extra.note || "" });
    },

    undo: (cid) => run({ type: "undo", candId: cid }),

    resumeHold: (cid) => run({ type: "resume_hold", candId: cid }),

    moveRoom: (cid, roomId, reason) => run({ type: "move_room", candId: cid, roomId, reason }),

    saveNote: (cid, roundId, text) => mapCand(cid, (x) => ({ ...x, notes: { ...(x.notes || {}), [roundId]: text } })),

    setRounds: (rounds) => upd((d) => ({ ...d, rounds })),

    setRooms: (rooms) => upd((d) => ({
      ...d,
      rooms,
      candidates: d.candidates.map((c) => {
        if (!c.room) return c;
        const next = rooms.find((r) => r.id === c.room.id);
        return next ? { ...c, room: next } : c;
      }),
    })),
  }), [drive, upd, mapCand, run]);
}
