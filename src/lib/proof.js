const KEY = "tokenhire.lobbyProof";

export function readProof() {
  try { return JSON.parse(sessionStorage.getItem(KEY) || "null"); } catch { return null; }
}

export function writeProof(p) {
  if (!p) sessionStorage.removeItem(KEY);
  else sessionStorage.setItem(KEY, JSON.stringify(p));
}

export function clearProof() {
  sessionStorage.removeItem(KEY);
}

export async function readGeo() {
  if (!navigator.geolocation) return null;
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
    );
  });
}
