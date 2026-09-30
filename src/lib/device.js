const KEY = "th_device_id";

export function readDeviceId() {
  try {
    let id = localStorage.getItem(KEY);
    if (!id || String(id).length < 8) {
      id = (typeof crypto !== "undefined" && crypto.randomUUID)
        ? crypto.randomUUID()
        : `dev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return "anon";
  }
}
