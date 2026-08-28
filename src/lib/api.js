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
  else localStorage.setItem(SESSION_KEY, JSON.stringify(s));
}
export function readSavedProfile() {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || "null"); } catch { return null; }
}
export function writeSavedProfile(p) {
  if (!p) localStorage.removeItem(PROFILE_KEY);
  else localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}

async function req(path, opts = {}) {
  const session = readSession();
  const headers = { "Content-Type": "application/json", ...(opts.headers || {}) };
  if (session?.token) headers.Authorization = `Bearer ${session.token}`;
  const res = await fetch(path, { ...opts, headers, body: opts.body ? JSON.stringify(opts.body) : undefined });
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
  putSnapshot: (body) => req("/api/snapshot", { method: "PUT", body }),
  login: (body) => req("/api/auth/login", { method: "POST", body }),
  signup: (body) => req("/api/auth/signup", { method: "POST", body }),
  forgot: (body) => req("/api/auth/forgot", { method: "POST", body }),
  reset: (body) => req("/api/auth/reset", { method: "POST", body }),
  verify: (body) => req("/api/auth/verify", { method: "POST", body }),
  me: () => req("/api/auth/me"),
  logout: () => req("/api/auth/logout", { method: "POST", body: {} }),
  acceptInvite: (body) => req("/api/auth/invite/accept", { method: "POST", body }),
  patchOrg: (body) => req("/api/org", { method: "PATCH", body }),
  candidate: (phone) => req(`/api/candidate/${encodeURIComponent(phone)}`),
  putCandidate: (body) => req("/api/candidate", { method: "PUT", body }),
  routes: () => req("/api/routes"),
};
