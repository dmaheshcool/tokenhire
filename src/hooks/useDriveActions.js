import { useCallback, useMemo } from "react";
import { inARound, nextRoundIdx, occupantOf, roundIndexOfRoom, waitingRoundIdx } from "../lib/helpers.js";

/** Queue moves for one drive: call, skip, no-show, back to queue, decide, notes, rooms and rounds. */
export function useDriveActions(drive, setDrives) {
  const id = drive?.id;
  const upd = useCallback((fn) => {
    if (!id) return;
    setDrives((p) => p.map((d) => (d.id === id ? fn(d) : d)));
  }, [id, setDrives]);
  const mapCand = useCallback((cid, fn) => upd((d) => ({ ...d, candidates: d.candidates.map((x) => (x.id === cid ? fn(x, d) : x)) })), [upd]);

  return useMemo(() => ({
    patch: (fields) => upd((d) => ({ ...d, ...fields })),

    /** Call someone into a room for the round they are waiting on. Returns false if the room is busy. */
    callTo(cid, roomId) {
      if (!drive) return false;
      const cand = drive.candidates.find((x) => x.id === cid);
      const room = (drive.rooms || []).find((r) => r.id === roomId);
      if (!cand || !room) return false;
      const taken = occupantOf(drive, roomId);
      if (taken && taken.id !== cid) return false;
      const idx = waitingRoundIdx(drive.rounds, cand);
      mapCand(cid, (x) => ({ ...x, state: "calling", calledAt: Date.now(), room, roundAssigned: true, roundIdx: idx }));
      return true;
    },

    skip: (cid) => mapCand(cid, (x) => ({ ...x, state: "wait", at: Date.now(), calledAt: null, room: null, skipped: (x.skipped || 0) + 1 })),

    noShow: (cid) => mapCand(cid, (x) => ({ ...x, state: "absent", room: null, decidedAt: Date.now() })),

    recall(cid) {
      if (!drive) return;
      const wait = drive.candidates.filter((x) => x.state === "wait");
      const earliest = wait.length ? Math.min(...wait.map((x) => x.at)) : Date.now();
      mapCand(cid, (x) => ({ ...x, state: "wait", at: earliest - 1000, room: null, calledAt: null, released: false }));
    },

    arrived: (cid) => mapCand(cid, (x) => ({ ...x, checkedIn: true, arrivedAt: x.arrivedAt || Date.now() })),

    move(cid, state) {
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
    },

    decide(cid, outcome) {
      upd((d) => {
        const c = d.candidates.find((x) => x.id === cid);
        if (!c) return d;
        const rid = (d.rounds || [])[c.roundIdx || 0]?.id;
        const nextIdx = nextRoundIdx(d.rounds, c);
        const last = nextIdx < 0;
        return {
          ...d,
          candidates: d.candidates.map((x) => {
            if (x.id !== cid) return x;
            const roundOutcomes = { ...(x.roundOutcomes || {}), [rid]: outcome };
            if (outcome === "rejected") return { ...x, state: "rejected", decidedAt: Date.now(), roundOutcomes, room: null };
            if (outcome === "onhold") return { ...x, state: "onhold", decidedAt: Date.now(), roundOutcomes, room: null };
            if (last) return { ...x, state: "selected", decidedAt: Date.now(), roundOutcomes, room: null };
            const peers = d.candidates.filter((p) => p.id !== cid && p.state === "wait" && (p.roundIdx || 0) === nextIdx);
            const at = peers.length ? Math.min(...peers.map((p) => p.at)) - 1 : Date.now();
            return { ...x, roundIdx: nextIdx, state: "wait", calledAt: null, at, pinged: false, roundOutcomes, decidedAt: Date.now(), room: null, roundAssigned: true };
          }),
        };
      });
    },

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
  }), [drive, upd, mapCand]);
}
