// Saved walk-ins live in this browser only. The shape is versioned so a later
// account sync can merge it without guessing: { v: 1, items: [{ id, at }] }.
export const SAVED_KEY = "th_saved_v1";
const LEGACY_KEY = "th_saved_drives";
const EVENT = "th:saved";

function parse(raw) {
  try {
    const data = JSON.parse(raw || "null");
    if (data?.v === 1 && Array.isArray(data.items)) return data.items.filter((x) => x && typeof x.id === "string");
  } catch { /* corrupt, start over */ }
  return null;
}

export function readSaved() {
  try {
    const items = parse(localStorage.getItem(SAVED_KEY));
    if (items) return items;
    const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) || "[]");
    if (Array.isArray(legacy) && legacy.length) {
      const moved = legacy.filter((id) => typeof id === "string").map((id) => ({ id, at: Date.now() }));
      localStorage.setItem(SAVED_KEY, JSON.stringify({ v: 1, items: moved }));
      localStorage.removeItem(LEGACY_KEY);
      return moved;
    }
  } catch { /* private mode */ }
  return [];
}

// A sync adapter gets every change. The default does nothing; an account-backed
// adapter can push to the server and call `mergeSaved` with what it pulls back.
let adapter = { push: () => {} };
export function setSavedSync(next) {
  adapter = next && typeof next.push === "function" ? next : { push: () => {} };
}

export function writeSaved(items) {
  const clean = items.filter((x, i) => items.findIndex((y) => y.id === x.id) === i);
  try { localStorage.setItem(SAVED_KEY, JSON.stringify({ v: 1, items: clean })); } catch { /* private mode */ }
  window.dispatchEvent(new CustomEvent(EVENT));
  try { adapter.push(clean); } catch { /* sync is best effort */ }
  return clean;
}

export function toggleSaved(id, now = Date.now()) {
  const items = readSaved();
  return writeSaved(items.some((x) => x.id === id) ? items.filter((x) => x.id !== id) : [...items, { id, at: now }]);
}

export function removeSaved(ids) {
  const drop = new Set(ids);
  return writeSaved(readSaved().filter((x) => !drop.has(x.id)));
}

/** Union of this device and another source, keeping the earliest save time. */
export function mergeSaved(incoming) {
  const byId = new Map(readSaved().map((x) => [x.id, x]));
  for (const x of incoming || []) {
    if (!x?.id) continue;
    const had = byId.get(x.id);
    byId.set(x.id, had ? { ...had, at: Math.min(had.at || Infinity, x.at || Infinity) } : x);
  }
  return writeSaved([...byId.values()]);
}

export function onSavedChange(fn) {
  const onStorage = (e) => { if (e.key === SAVED_KEY || e.key === null) fn(); };
  window.addEventListener(EVENT, fn);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, fn);
    window.removeEventListener("storage", onStorage);
  };
}
