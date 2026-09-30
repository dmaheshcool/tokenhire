const WINDOW_MS = 60_000;
const MAX = 5;
const COOL_MS = 60_000;

const lobbyFails = new Map();

export function lobbyCooling(key, now = Date.now()) {
  const rec = lobbyFails.get(key);
  return !!(rec && rec.cool && now < rec.cool);
}

export function lobbyFail(key, now = Date.now()) {
  let rec = lobbyFails.get(key);
  if (!rec || now - rec.t0 > WINDOW_MS) rec = { t0: now, n: 0, cool: 0 };
  rec.n += 1;
  if (rec.n >= MAX) rec.cool = now + COOL_MS;
  lobbyFails.set(key, rec);
  return rec;
}

export function lobbyRateKeys(ip, deviceId) {
  return [`ip:${ip || "anon"}`, `dev:${deviceId || "anon"}`];
}

export function resetLobbyFails() {
  lobbyFails.clear();
}
