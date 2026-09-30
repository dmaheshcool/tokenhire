import { createHmac } from "node:crypto";
import {
  formatLobbyCode, lookalikeHint, metresBetween, normalizeLobbyInput, sixFromDigest,
  windowIndex, windowRemaining,
} from "../src/lib/lobby.js";
import { driveStatus, formatIST, tokensOpen, windowUtc } from "../src/lib/status.js";

export function lobbySecret() {
  return process.env.LOBBY_SECRET || process.env.TOKENHIRE_SECRET || "dev-lobby-secret-not-for-prod";
}

export function deriveLobbyCode(driveId, win, secret = lobbySecret()) {
  const digest = createHmac("sha256", secret).update(`${driveId}${win}`).digest();
  return sixFromDigest(digest);
}

export function lobbyPayload(drive, origin, now = Date.now(), secret = lobbySecret()) {
  const win = windowIndex(now);
  const code = deriveLobbyCode(drive.id, win, secret);
  const left = windowRemaining(now);
  const expiresAt = now + left;
  const display = formatLobbyCode(code);
  const base = String(origin || "").replace(/\/+$/, "");
  const qrUrl = `${base}/check-in/${encodeURIComponent(drive.id)}?k=${encodeURIComponent(display)}`;
  return { driveId: drive.id, code, display, expiresAt, secondsLeft: Math.ceil(left / 1000), qrUrl, serverNow: now };
}

export function codeMatches(driveId, six, now, secret = lobbySecret()) {
  const win = windowIndex(now);
  for (const offset of [0, -1, 1]) {
    if (deriveLobbyCode(driveId, win + offset, secret) === six) return offset;
  }
  return null;
}

export function findDriveForCode(drives, six, now, secret = lobbySecret(), { openOnly = true } = {}) {
  const hits = [];
  for (const d of drives || []) {
    if (d.listingOnly) continue;
    if (openOnly && !tokensOpen(d, now)) continue;
    const off = codeMatches(d.id, six, now, secret);
    if (off != null) hits.push({ drive: d, offset: off });
  }
  if (hits.length === 1) return hits[0];
  return null;
}

export function validateLobbyCode({ drive, drives, input, now = Date.now(), secret = lobbySecret() }) {
  const raw = String(input || "");
  if (lookalikeHint(raw)) {
    return { ok: false, reason: "lookalike", error: "We couldn't read that code. Letters O and I aren't used." };
  }
  const six = normalizeLobbyInput(raw);
  if (six.length < 6) {
    return { ok: false, reason: "unreadable", error: "We couldn't read that code. Letters O and I aren't used." };
  }

  const st = driveStatus(drive, now);
  if (st === "scheduled" || st === "draft") {
    const { doorsAt } = windowUtc(drive);
    const opens = Number.isNaN(doorsAt) ? "" : formatIST(doorsAt, { time: true });
    return { ok: false, reason: "not_open", error: `Check-in isn't open yet. It opens at ${opens}.`, opens };
  }
  if (st === "closing" || st === "wrapped" || st === "cancelled") {
    return { ok: false, reason: "closed", error: "Check-in has closed for this walk-in." };
  }

  const other = findDriveForCode(drives, six, now, secret, { openOnly: false });
  const off = codeMatches(drive.id, six, now, secret);
  if (off == null) {
    if (other && other.drive.id !== drive.id) {
      return {
        ok: false,
        reason: "wrong_drive",
        error: `That code is for another walk-in (${other.drive.role}). Check you're on the right one.`,
        drive_name: other.drive.role,
        windowOffset: other.offset,
      };
    }
    return { ok: false, reason: "expired", error: "That code has expired. Enter the code on the screen now.", windowOffset: null };
  }
  if (!tokensOpen(drive, now)) {
    return { ok: false, reason: "closed", error: "Check-in has closed for this walk-in.", windowOffset: off };
  }
  return { ok: true, reason: "ok", windowOffset: off, code: six };
}

export function locationResult(drive, geo) {
  if (drive?.locationCheck === false) return { location_verified: "unknown" };
  const radius = Math.min(500, Math.max(150, Number(drive?.locationRadius) || 300));
  if (!geo || geo.lat == null || geo.lng == null) return { location_verified: "unknown" };
  const acc = Number(geo.accuracy);
  if (!Number.isFinite(acc) || acc > 150) return { location_verified: "unknown" };
  if (drive.venueLat == null || drive.venueLng == null) return { location_verified: "unknown" };
  const m = metresBetween({ lat: drive.venueLat, lng: drive.venueLng }, { lat: geo.lat, lng: geo.lng });
  if (m == null) return { location_verified: "unknown" };
  return { location_verified: m <= radius };
}

export function logLobbyFail(entry) {
  console.info("lobby_check_fail", JSON.stringify({
    drive: entry.driveId, reason: entry.reason, windowOffset: entry.windowOffset ?? null, at: Date.now(),
  }));
}
