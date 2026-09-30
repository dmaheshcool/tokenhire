/** Pre-registration is optional and does not issue a token or queue place. */

import { formatIST } from "./time.js";

export const PREREG = "prereg";

export function isPrereg(c) {
  return c?.state === PREREG;
}

export function preregList(drive) {
  return (drive?.candidates || []).filter(isPrereg);
}

export function preregCount(drive) {
  return preregList(drive).length;
}

export function preregOf(drive, profile) {
  if (!profile) return null;
  return preregList(drive).find((c) =>
    (profile.phone && c.phone === profile.phone) || (profile.deviceId && c.deviceId === profile.deviceId));
}

export function makePrereg(profile, extra = {}) {
  const now = extra.at || Date.now();
  return {
    id: extra.id || `pre_${profile.deviceId || "dev"}_${now}`,
    token: null,
    claim: null,
    name: profile.name,
    phone: profile.phone,
    email: profile.email || "",
    resume: profile.resume || null,
    deviceId: profile.deviceId || extra.deviceId,
    state: PREREG,
    at: now,
    checkedIn: false,
    arrivedAt: null,
    consentAt: extra.consentAt || now,
    ...(extra.roleId ? { roleId: extra.roleId } : {}),
    ...(extra.answers ? { answers: extra.answers } : {}),
  };
}

export function promotePrereg(c, seq, proof = {}) {
  const token = `W-${String(seq).padStart(3, "0")}`;
  const now = Date.now();
  return {
    ...c,
    id: token,
    token,
    claim: c.claim || extraClaim(),
    state: "wait",
    checkedIn: true,
    arrivedAt: now,
    at: now,
    checkin_method: proof.method || "lobby_qr",
    location_verified: proof.location_verified ?? "unknown",
    wasPrereg: true,
    checkin_at: proof.at || now,
  };
}

function extraClaim() {
  const a = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let s = "";
  for (let i = 0; i < 6; i++) s += a[Math.floor(Math.random() * a.length)];
  return s;
}

export function preregCsv(drive) {
  const rows = [["Name", "Phone", "Email", "Registered at IST"]];
  for (const c of preregList(drive)) {
    const at = c.at ? formatIST(c.at, { date: true, time: true }) : "";
    rows.push([c.name || "", c.phone || "", c.email || "", at]);
  }
  return rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
}

export function downloadPreregCsv(drive) {
  const blob = new Blob([preregCsv(drive)], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `pre-registered-${drive.id}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}
