import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ROTATE, code, memberEmail, memberRole } from "../src/lib/helpers.js";
import { seedDrive, seedExtraDrives, seedMegaDrive, seedOrgs, seedPlanDemoDrives } from "../src/data/seed.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = join(__dirname, "..", "data", "store.json");

function fresh() {
  return {
    version: 1,
    startedAt: Date.now(),
    deskLeft: ROTATE,
    orgs: seedOrgs(),
    drives: [seedMegaDrive(), seedDrive(), ...seedExtraDrives(), ...seedPlanDemoDrives()],
    sessions: {},
    resets: {},
    candidates: {},
  };
}

function load() {
  try {
    const raw = JSON.parse(readFileSync(DATA, "utf8"));
    return { ...fresh(), ...raw, sessions: raw.sessions || {}, resets: raw.resets || {}, candidates: raw.candidates || {} };
  } catch {
    return fresh();
  }
}

let state = load();

function save() {
  try {
    mkdirSync(dirname(DATA), { recursive: true });
    writeFileSync(DATA, JSON.stringify(state, null, 2));
  } catch {
    /* ephemeral on serverless */
  }
}

export function getState() {
  return state;
}

export function setSnapshot({ orgs, drives, candidates }) {
  if (Array.isArray(orgs)) state.orgs = orgs;
  if (Array.isArray(drives)) state.drives = drives;
  if (candidates && typeof candidates === "object") state.candidates = candidates;
  state.version += 1;
  save();
  return publicSnapshot();
}

export function publicSnapshot() {
  return {
    ok: true,
    version: state.version,
    startedAt: state.startedAt,
    deskLeft: state.deskLeft,
    orgs: state.orgs,
    drives: state.drives,
    now: Date.now(),
  };
}

export function tickDesk() {
  state.deskLeft -= 1;
  if (state.deskLeft <= 0) {
    state.deskLeft = ROTATE;
    state.drives = state.drives.map((d) => ({ ...d, desk: code(6) }));
    state.version += 1;
    save();
  }
}

export function findOrgByEmail(email) {
  const em = (email || "").trim().toLowerCase();
  if (!em) return null;
  return state.orgs.find((o) => (o.email || "").toLowerCase() === em || (o.members || []).some((m) => memberEmail(m).toLowerCase() === em)) || null;
}

export function roleFor(org, email) {
  const em = (email || "").trim().toLowerCase();
  const mem = (org.members || []).find((m) => memberEmail(m).toLowerCase() === em);
  return mem ? memberRole(mem) : "recruiter";
}

export function createSession(org, email, role) {
  const token = `th_${code(8)}${code(8)}`;
  state.sessions[token] = { orgId: org.id, email, role, at: Date.now() };
  save();
  return token;
}

export function sessionOf(token) {
  if (!token) return null;
  const s = state.sessions[token];
  if (!s) return null;
  const org = state.orgs.find((o) => o.id === s.orgId);
  if (!org) return null;
  return { ...s, org };
}

export function dropSession(token) {
  if (token && state.sessions[token]) {
    delete state.sessions[token];
    save();
  }
}

export function upsertOrg(org) {
  const i = state.orgs.findIndex((o) => o.id === org.id);
  if (i >= 0) state.orgs[i] = org;
  else state.orgs.push(org);
  state.version += 1;
  save();
  return org;
}

export function setReset(email, codeStr) {
  state.resets[email.trim().toLowerCase()] = { code: codeStr, exp: Date.now() + 15 * 60 * 1000 };
  save();
  return state.resets[email.trim().toLowerCase()];
}

export function consumeReset(email, codeStr) {
  const rec = state.resets[(email || "").trim().toLowerCase()];
  if (!rec || rec.exp < Date.now() || rec.code !== codeStr) return false;
  delete state.resets[email.trim().toLowerCase()];
  save();
  return true;
}

export function saveCandidate(profile) {
  if (!profile?.phone) return profile;
  state.candidates[profile.phone] = profile;
  save();
  return profile;
}

export function candidateByPhone(phone) {
  return state.candidates[phone] || null;
}

export const DEMO_RESET = "482911";
