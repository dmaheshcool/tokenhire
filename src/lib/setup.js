import { libraryOf } from "./library.js";

const SKIP_KEY = (orgId) => `th-setup-skip-${orgId}`;

export function setupFlags(org, drives = []) {
  const lib = libraryOf(org, drives);
  return {
    team: (org?.members || []).length >= 1,
    hiringTeams: (lib.processes || []).some((p) => p.active !== false),
    venues: (org?.branches || []).length >= 1,
    roles: (lib.roles || []).some((r) => r.active !== false),
  };
}

export function setupProgress(org, drives = []) {
  const flags = setupFlags(org, drives);
  const team = { id: "team", done: flags.team, to: "/app/team", titleKey: "console.setup.items.team" };
  const hiringTeams = {
    id: "hiringTeams",
    done: flags.hiringTeams,
    to: "/app/hiring-teams",
    titleKey: org?.kind === "agency" ? "console.setup.items.client" : "console.setup.items.hiringTeams",
  };
  const venues = { id: "venues", done: flags.venues, to: "/app/venues", titleKey: "console.setup.items.venues" };
  const roles = { id: "roles", done: flags.roles, to: "/app/library", titleKey: "console.setup.items.roles" };
  const items = org?.kind === "agency" ? [hiringTeams, team, venues, roles] : [team, hiringTeams, venues, roles];
  const done = items.filter((x) => x.done).length;
  return { items, done, total: 4, complete: done === 4, flags };
}

export function setupSkipped(orgId) {
  try { return localStorage.getItem(SKIP_KEY(orgId)) === "1"; } catch { return false; }
}

export function skipSetup(orgId) {
  try { localStorage.setItem(SKIP_KEY(orgId), "1"); } catch { /* ignore */ }
}
