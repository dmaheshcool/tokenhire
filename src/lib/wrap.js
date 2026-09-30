import { queueStats } from "./listing.js";
import { canWrapDrive, driveStatus, windowUtc } from "./status.js";

export const OPEN_STATES = ["wait", "calling", "at_desk", "interviewing"];
export const FINAL_STATES = ["selected", "rejected", "onhold", "undecided", "absent", "not_seen", "carried", "cancelled", "done"];

const AUTO_WRAP_MS = 24 * 60 * 60 * 1000;
const REMIND_MS = 6 * 60 * 60 * 1000;

export function wrapGroups(drive) {
  const cands = drive?.candidates || [];
  return {
    queue: cands.filter((c) => c.state === "wait"),
    called: cands.filter((c) => c.state === "calling"),
    inRound: cands.filter((c) => c.state === "interviewing" || c.state === "at_desk"),
    open: cands.filter((c) => OPEN_STATES.includes(c.state)),
  };
}

export function wrapCounts(drive) {
  const q = queueStats(drive);
  return {
    registered: q.registered,
    queue: q.waiting,
    inside: q.inside,
    seen: q.seen,
    shortlisted: q.shortlisted,
    onhold: q.onhold,
    rejected: q.rejected,
    notSeen: q.notSeen,
    noShow: q.noShow,
    carried: q.carried,
    undecided: q.undecided,
  };
}

export function wrapInvariantOk(drive) {
  const q = queueStats(drive);
  return q.waiting === 0 && q.inRound === 0;
}

export function assertWrappedQueue(drive) {
  if (!wrapInvariantOk(drive)) {
    throw new Error("a wrapped-up drive has waiting = 0 and in_round = 0");
  }
  return true;
}

function patchCand(c, state, extra = {}) {
  return { ...c, state, decidedAt: extra.decidedAt ?? Date.now(), ...extra };
}

/** Resolve leftover tokens the way auto-wrap and the one-time migration do. */
export function resolveOpenTokens(candidates, now = Date.now()) {
  const report = [];
  const next = (candidates || []).map((c) => {
    if (c.state === "wait") {
      report.push({ id: c.id, token: c.token, from: c.state, to: "not_seen" });
      return patchCand(c, "not_seen", { decidedAt: now, wrapReason: "not_seen" });
    }
    if (c.state === "calling") {
      report.push({ id: c.id, token: c.token, from: c.state, to: "absent" });
      return patchCand(c, "absent", { decidedAt: now, wrapReason: "no_show" });
    }
    if (c.state === "at_desk" || c.state === "interviewing") {
      report.push({ id: c.id, token: c.token, from: c.state, to: "undecided" });
      return patchCand(c, "undecided", { decidedAt: now, wrapReason: "undecided" });
    }
    return c;
  });
  return { candidates: next, report };
}

export function applyResolutions(drive, { queue = "not_seen", called = "absent", inRound = "undecided", leave = {}, now = Date.now() } = {}) {
  const groups = wrapGroups(drive);
  const next = (drive.candidates || []).map((c) => {
    if (leave.queue && c.state === "wait") return c;
    if (leave.called && c.state === "calling") return c;
    if (leave.inRound && (c.state === "interviewing" || c.state === "at_desk")) return c;
    if (c.state === "wait") return patchCand(c, queue === "carried" ? "carried" : "not_seen", { decidedAt: now, wrapReason: queue });
    if (c.state === "calling") return patchCand(c, called === "recall" ? "wait" : "absent", { decidedAt: called === "recall" ? undefined : now, wrapReason: called });
    if (c.state === "interviewing" || c.state === "at_desk") return patchCand(c, inRound, { decidedAt: now, wrapReason: inRound });
    return c;
  });
  return { ...drive, candidates: next, wrapOpen: { queue: groups.queue.length, called: groups.called.length, inRound: groups.inRound.length } };
}

export function wrapUpDrive(drive, { by = "", now = Date.now(), thanks = true, report = true, resolutions } = {}) {
  if (!canWrapDrive(drive, now)) {
    return { error: "too_early", drive };
  }
  let next = drive;
  if (resolutions) next = applyResolutions(next, { ...resolutions, now });
  const resolved = resolveOpenTokens(next.candidates, now);
  next = {
    ...next,
    candidates: resolved.candidates,
    wrappedAt: now,
    wrappedBy: by || "Unknown",
    wrapThanks: !!thanks,
    wrapReport: !!report,
    closingAt: next.closingAt || now,
    log: [...(next.log || []), { at: now, by: by || "Unknown", action: "wrap" }],
  };
  assertWrappedQueue(next);
  return { drive: next, report: resolved.report };
}

export function cancelDrive(drive, { reason = "", by = "", now = Date.now() } = {}) {
  return {
    ...drive,
    cancelledAt: now,
    cancelReason: reason,
    candidates: (drive.candidates || []).map((c) => (
      OPEN_STATES.includes(c.state)
        ? { ...c, state: "cancelled", decidedAt: now, wrapReason: reason }
        : c
    )),
    log: [...(drive.log || []), { at: now, by: by || "Unknown", action: "cancel", reason }],
  };
}

export function reopenDrive(drive, { by = "", now = Date.now() } = {}) {
  if (!drive?.wrappedAt || now - drive.wrappedAt > AUTO_WRAP_MS) return { error: "closed", drive };
  return {
    drive: {
      ...drive,
      wrappedAt: null,
      wrappedBy: null,
      reopenedAt: now,
      log: [...(drive.log || []), { at: now, by: by || "Unknown", action: "reopen" }],
    },
  };
}

export function reminderDue(drive, now = Date.now()) {
  if (driveStatus(drive, now) !== "closing") return false;
  const { endsAt } = windowUtc(drive);
  if (Number.isNaN(endsAt) || now < endsAt + REMIND_MS) return false;
  return !drive.wrapRemindedAt;
}

export function autoWrapDue(drive, now = Date.now()) {
  if (drive?.wrappedAt || drive?.cancelledAt || drive?.draft) return false;
  const { endsAt } = windowUtc(drive);
  if (Number.isNaN(endsAt)) return false;
  return now >= endsAt + AUTO_WRAP_MS;
}

export function applyAutoWrap(drive, now = Date.now()) {
  if (!autoWrapDue(drive, now)) return drive;
  const { drive: next } = wrapUpDrive(drive, { by: "Auto wrapped up", now, thanks: false, report: true });
  return { ...next, autoWrapped: true, log: [...(next.log || []).slice(0, -1), { at: now, by: "Auto wrapped up", action: "auto_wrap" }] };
}

/** One-time pass: wrapped drives that still have people in the queue. */
export function migrateUnresolvedWrapped(drives, now = Date.now()) {
  const report = [];
  const next = drives.map((d) => {
    if (driveStatus(d, now) !== "wrapped") return d;
    const unresolved = (d.candidates || []).filter((c) => OPEN_STATES.includes(c.state));
    if (!unresolved.length) return d;
    const resolved = resolveOpenTokens(d.candidates, now);
    report.push({
      driveId: d.id,
      role: d.role,
      company: d.company,
      changed: resolved.report.length,
      tokens: resolved.report,
    });
    return {
      ...d,
      candidates: resolved.candidates,
      wrapMigratedAt: now,
      log: [...(d.log || []), { at: now, by: "migration", action: "not_seen_backfill", n: resolved.report.length }],
    };
  });
  return { drives: next, report };
}

export function migrateRoleContent(d) {
  if (!d || Array.isArray(d.duties) || d.summary != null) {
    if (!d) return d;
    return {
      ...d,
      summary: d.summary != null ? d.summary : String(d.jd || "").trim().slice(0, 280),
      duties: d.duties || [],
      eligibility: d.eligibility || [],
      perks: d.perks || [],
      languages: d.languages || [],
    };
  }
  return {
    ...d,
    summary: String(d.jd || "").trim().slice(0, 280),
    duties: [],
    eligibility: [],
    perks: [],
    languages: d.languages || [],
  };
}

export function applyDueWraps(drives, now = Date.now()) {
  return drives.map((d) => applyAutoWrap(d, now));
}

export { AUTO_WRAP_MS, REMIND_MS };
