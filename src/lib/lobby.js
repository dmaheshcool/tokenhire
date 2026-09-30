/** Lobby codes: alphabet, windows and input cleaning. HMAC lives on the server. */

export const LOBBY_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const LOBBY_WINDOW_MS = 60_000;
export const LOOKALIKE = /[OIL01]/;

export function windowIndex(now = Date.now()) {
  return Math.floor(Number(now) / LOBBY_WINDOW_MS);
}

export function windowRemaining(now = Date.now()) {
  const t = Number(now);
  return LOBBY_WINDOW_MS - (t % LOBBY_WINDOW_MS);
}

export function formatLobbyCode(six) {
  const s = String(six || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
  if (s.length <= 3) return s;
  return `${s.slice(0, 3)}-${s.slice(3)}`;
}

export function normalizeLobbyInput(raw) {
  return String(raw || "").trim().toUpperCase().replace(/[\s-]/g, "");
}

export function lookalikeHint(raw) {
  return LOOKALIKE.test(String(raw || "").toUpperCase());
}

export function sixFromDigest(bytes) {
  let out = "";
  const n = LOBBY_ALPHABET.length;
  for (let i = 0; i < 6; i++) out += LOBBY_ALPHABET[(bytes[i] ?? 0) % n];
  return out;
}

export function metresBetween(a, b) {
  if (!a || !b || a.lat == null || b.lat == null || a.lng == null || b.lng == null) return null;
  const R = 6371000;
  const toRad = (d) => (Number(d) * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}
