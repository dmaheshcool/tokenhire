const SESSION_KEY = "tokenhire.session";
const PROFILE_KEY = "tokenhire.candidate";
const TICKETS_KEY = "tokenhire.tickets";

export function readTickets() {
  try { return JSON.parse(localStorage.getItem(TICKETS_KEY) || "[]"); } catch { return []; }
}
export function rememberTicket(t) {
  if (!t?.driveId || !t?.token) return;
  const next = [t, ...readTickets().filter((x) => !(x.driveId === t.driveId && x.token === t.token))].slice(0, 12);
  localStorage.setItem(TICKETS_KEY, JSON.stringify(next));
}
export function readSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); } catch { return null; }
}
export function writeSession(s) {
  if (!s) localStorage.removeItem(SESSION_KEY);
  else localStorage.setItem(SESSION_KEY, JSON.stringify({ orgId: s.orgId, role: s.role, email: s.email }));
}
function cleanProfile(p) {
  if (!p || typeof p !== "object") return p;
  const next = { ...p };
  delete next.aadhaarHash;
  delete next.aadhaarLast4;
  delete next.whatsapp;
  return next;
}
export function readSavedProfile() {
  try { return cleanProfile(JSON.parse(localStorage.getItem(PROFILE_KEY) || "null")); } catch { return null; }
}
export function writeSavedProfile(p) {
  if (!p) localStorage.removeItem(PROFILE_KEY);
  else localStorage.setItem(PROFILE_KEY, JSON.stringify(cleanProfile(p)));
}

async function req(path, opts = {}) {
  const headers = { "Content-Type": "application/json", ...(opts.headers || {}) };
  const res = await fetch(path, { ...opts, credentials: "include", headers, body: opts.body ? JSON.stringify(opts.body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  live: async () => {
    try {
      const h = await req("/api/health");
      return h;
    } catch {
      return null;
    }
  },
  snapshot: () => req("/api/snapshot"),
  publishListing: (body) => req("/api/listings", { method: "POST", body }),
  confirmListing: (body) => req("/api/listings/confirm", { method: "POST", body }),
  pilot: (body) => req("/api/pilot", { method: "POST", body }),
  putSnapshot: (body) => req("/api/snapshot", { method: "PUT", body }),
  login: (body) => req("/api/auth/login", { method: "POST", body }),
  lookup: (body) => req("/api/auth/lookup", { method: "POST", body }),
  signup: (body) => req("/api/auth/signup", { method: "POST", body }),
  forgot: (body) => req("/api/auth/forgot", { method: "POST", body }),
  reset: (body) => req("/api/auth/reset", { method: "POST", body }),
  verify: (body) => req("/api/auth/verify", { method: "POST", body }),
  verifyResend: (body) => req("/api/auth/verify-resend", { method: "POST", body }),
  verifyLink: (body) => req("/api/auth/verify-link", { method: "POST", body }),
  magicStart: (body) => req("/api/auth/magic-start", { method: "POST", body }),
  magicConsume: (body) => req("/api/auth/magic-consume", { method: "POST", body }),
  me: () => req("/api/auth/me"),
  logout: () => req("/api/auth/logout", { method: "POST", body: {} }),
  logoutAll: () => req("/api/auth/logout-all", { method: "POST", body: {} }),
  acceptInvite: (body) => req("/api/auth/invite/accept", { method: "POST", body }),
  patchOrg: (body) => req("/api/org", { method: "PATCH", body }),
  candidate: (phone) => req(`/api/candidate/${encodeURIComponent(phone)}`),
  putCandidate: (body) => req("/api/candidate", { method: "PUT", body }),
  routes: () => req("/api/routes"),
  remindStart: (body) => req("/api/reminders/start", { method: "POST", body }),
  remindStop: (body) => req("/api/reminders/stop", { method: "POST", body }),
  exportStart: (body) => req("/api/exports", { method: "POST", body }),
  exportStatus: (id) => req(`/api/exports/${encodeURIComponent(id)}`),
  lobby: (driveId) => req(`/api/lobby/${encodeURIComponent(driveId)}`),
  lobbyCheck: (body) => req("/api/lobby/check", { method: "POST", body }),
  deskPass: (body) => req("/api/desk-pass", { method: "POST", body }),
  queueAction: (driveId, body) => req(`/api/queue/${encodeURIComponent(driveId)}`, { method: "POST", body }),
  liveStats: () => req("/api/stats/live"),
};

// Which walk-ins this phone has asked to be reminded about: { v: 1, items: [{ driveId, phone }] }.
const REMINDERS_KEY = "th_reminders_v1";
export function readReminders() {
  try {
    const data = JSON.parse(localStorage.getItem(REMINDERS_KEY) || "null");
    return data?.v === 1 && Array.isArray(data.items) ? data.items : [];
  } catch { return []; }
}
export function writeReminders(items) {
  try { localStorage.setItem(REMINDERS_KEY, JSON.stringify({ v: 1, items })); } catch { /* private mode */ }
  window.dispatchEvent(new CustomEvent("th:reminders"));
}
