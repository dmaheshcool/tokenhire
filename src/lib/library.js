import { DEFAULT_ROUNDS, docNameOf, firstRoundIdx, nextRoundIdx, roundApplies } from "./helpers.js";
import { utcWindowFields } from "./status.js";
import { addDays } from "./time.js";
import { payType } from "./listing.js";
import { tl } from "../i18n/strings.js";

// A company's own reusable lists. Processes are what used to be "Hiring teams / Clients"
// and keep the same ids, so drives that already carry a clientId stay linked.
export const LIBRARY_KINDS = ["processes", "roles", "documents", "rounds", "fields", "reasons"];
export const LIBRARY_PAGE_KINDS = ["roles", "rounds", "documents", "fields", "reasons"];
const NAME = { processes: "name", roles: "title", documents: "label", rounds: "name", fields: "label", reasons: "label" };
const PREFIX = { processes: "pr", roles: "jr", documents: "doc", rounds: "rd", fields: "fld", reasons: "rsn" };
export const ROLE_TAG_STARTER = ["Customer support", "Sales", "Operations", "Delivery", "Finance", "IT", "Admin"];

export const FIELD_TYPES = ["text", "number", "yesno", "dropdown"];

const norm = (s) => String(s ?? "").trim().replace(/\s+/g, " ");
const keyOf = (s) => norm(s).toLowerCase();
export const uid = (p) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const nameOf = (kind, item) => item?.[NAME[kind]] || "";

export function libraryOf(org, drives = []) {
  const lib = org?.library;
  if (lib?.v === 1) {
    return {
      v: 1,
      processes: lib.processes || [],
      roles: lib.roles || [],
      documents: lib.documents || [],
      rounds: lib.rounds || [],
      fields: lib.fields || [],
      reasons: lib.reasons || [],
    };
  }
  const titles = [];
  for (const d of drives) {
    if (d.orgId !== org?.id) continue;
    for (const r of driveRoles(d)) if (r.title && !titles.some((x) => keyOf(x) === keyOf(r.title))) titles.push(r.title);
  }
  return {
    v: 1,
    processes: (org?.clients || []).map((c) => ({ id: c.id, name: c.name, active: true })),
    roles: titles.map((title, i) => ({ id: `jr_s${i + 1}`, title, processId: "", active: true })),
    documents: tl("library.starterDocs").map((label, i) => ({ id: `doc_s${i + 1}`, label, active: true })),
    rounds: DEFAULT_ROUNDS.map((r, i) => ({ id: `rd_s${i + 1}`, name: r.name, active: true })),
    fields: [],
    reasons: [],
  };
}

export const activeItems = (lib, kind) => (lib[kind] || []).filter((x) => x.active !== false);

export function findItem(lib, kind, text) {
  const k = keyOf(text);
  return k ? (lib[kind] || []).find((x) => keyOf(nameOf(kind, x)) === k) || null : null;
}

/** Adds an item, or returns the one with the same name (bringing it back if archived). */
export function addItem(lib, kind, text, extra = {}) {
  const name = kind === "documents" ? docNameOf(text) : norm(text).slice(0, 80);
  if (!name) return { lib, item: null };
  const hit = findItem(lib, kind, name);
  if (hit) {
    if (hit.active !== false) return { lib, item: hit };
    const item = { ...hit, active: true };
    return { lib: { ...lib, [kind]: lib[kind].map((x) => (x.id === hit.id ? item : x)) }, item };
  }
  const item = { id: uid(PREFIX[kind]), [NAME[kind]]: name, active: true, ...extra };
  return { lib: { ...lib, [kind]: [...(lib[kind] || []), item] }, item };
}

export function renameItem(lib, kind, id, text) {
  const name = kind === "documents" ? docNameOf(text) : norm(text).slice(0, 80);
  if (!name) return { lib, error: "empty" };
  const clash = findItem(lib, kind, name);
  if (clash && clash.id !== id) return { lib, error: "taken" };
  return { lib: { ...lib, [kind]: lib[kind].map((x) => (x.id === id ? { ...x, [NAME[kind]]: name } : x)) }, name };
}

export function setActive(lib, kind, id, active) {
  return { ...lib, [kind]: lib[kind].map((x) => (x.id === id ? { ...x, active } : x)) };
}

export function deleteItem(lib, kind, id) {
  return { ...lib, [kind]: (lib[kind] || []).filter((x) => x.id !== id) };
}

/** Folds `fromId` into `intoId`. The merged-away item is removed from the library. */
export function mergeItems(lib, kind, fromId, intoId) {
  if (fromId === intoId) return lib;
  const next = { ...lib, [kind]: lib[kind].filter((x) => x.id !== fromId) };
  if (kind === "processes") next.roles = (lib.roles || []).map((r) => (r.processId === fromId ? { ...r, processId: intoId } : r));
  return next;
}

/** Points a company's drives at `into` wherever they used `fromId`. Used for rename and merge. */
export function relinkDrives(drives, orgId, kind, fromId, into) {
  const label = nameOf(kind, into);
  return drives.map((d) => {
    if (d.orgId !== orgId) return d;
    if (kind === "processes") return d.clientId === fromId ? { ...d, clientId: into.id, clientName: label } : d;
    if (kind === "roles") {
      if (!(d.roles || []).some((r) => r.roleId === fromId)) return d;
      const roles = d.roles.map((r) => (r.roleId === fromId ? { ...r, roleId: into.id, title: label } : r));
      return { ...d, roles, role: rolesMirror(roles).role };
    }
    if (kind === "documents") {
      if (!(d.documents || []).some((x) => x.docId === fromId)) return d;
      const documents = [];
      for (const x of d.documents) {
        const y = x.docId === fromId ? { ...x, docId: into.id, label } : { ...x };
        const prev = documents.find((z) => z.label.toLowerCase() === y.label.toLowerCase());
        if (prev) prev.required = prev.required || y.required;
        else documents.push(y);
      }
      return { ...d, documents, docs: documents.map((x) => x.label) };
    }
    if (kind === "rounds") {
      if (!(d.rounds || []).some((r) => r.libId === fromId)) return d;
      return { ...d, rounds: d.rounds.map((r) => (r.libId === fromId ? { ...r, libId: into.id, name: label } : r)) };
    }
    return d;
  });
}

export function usesOf(drives, orgId, kind, item) {
  const mine = drives.filter((d) => d.orgId === orgId);
  const k = keyOf(nameOf(kind, item));
  if (kind === "processes") return mine.filter((d) => d.clientId === item.id).length;
  if (kind === "roles") return mine.filter((d) => driveRoles(d).some((r) => r.roleId === item.id || keyOf(r.title) === k)).length;
  if (kind === "documents") return mine.filter((d) => driveDocuments(d).some((x) => x.docId === item.id || keyOf(x.label) === k)).length;
  if (kind === "fields") return mine.filter((d) => (d.fields || []).some((x) => x.fieldId === item.id || keyOf(x.label) === k)).length;
  if (kind === "reasons") return mine.filter((d) => (d.candidates || []).some((c) => keyOf(c.reason) === k)).length;
  return mine.filter((d) => (d.rounds || []).some((r) => r.libId === item.id || keyOf(r.name) === k)).length;
}

/** Carries items created in `next` over to `cur`, which may have changed in the meantime. */
export function withNewItems(cur, next) {
  const out = { ...cur };
  for (const kind of LIBRARY_KINDS) {
    const have = new Set((cur[kind] || []).map((x) => x.id));
    const added = (next[kind] || []).filter((x) => !have.has(x.id) && !findItem(cur, kind, nameOf(kind, x)));
    const changed = new Map((next[kind] || []).filter((x) => have.has(x.id)).map((x) => [x.id, x]));
    out[kind] = [...(cur[kind] || []).map((x) => changed.get(x.id) || x), ...added];
  }
  return out;
}

/** Keeps the older `clients` list in step for screens that still read it. */
export function orgWithLibrary(org, lib) {
  return { ...org, library: lib, clients: activeItems(lib, "processes").map((p) => ({ id: p.id, name: p.name })) };
}

/* ---------- Roles on a drive ---------- */

export function roleCode(title, taken = []) {
  const words = norm(title).replace(/\(.*?\)/g, " ").split(/[^A-Za-z0-9]+/).filter(Boolean);
  const base = (words.length > 1 ? words.slice(0, 3).map((w) => w[0]).join("") : (words[0] || "R").slice(0, 3)).toUpperCase();
  let out = base;
  for (let n = 2; taken.includes(out); n += 1) out = `${base}${n}`;
  return out;
}

export function driveRoles(d) {
  if (Array.isArray(d?.roles) && d.roles.length) return d.roles;
  if (!norm(d?.role)) return [];
  return [{
    id: "main", roleId: "", title: norm(d.role), code: roleCode(d.role),
    openings: d.openings ?? "", expMin: d.expMin ?? 0, expMax: d.expMax ?? 2,
    payType: payType(d), payMin: d.payMin ?? "", payMax: d.payMax ?? "", notes: "",
  }];
}

const hasAmount = (r) => (r.payMin !== "" && r.payMin != null) || (r.payMax !== "" && r.payMax != null);

/** Top-level fields the board, cards and search read. They mirror the drive's roles. */
export function rolesMirror(roles) {
  const list = roles.filter((r) => norm(r.title));
  if (!list.length) return { role: "" };
  const paid = list.find(hasAmount) || list[0];
  const open = list.map((r) => Number(r.openings)).filter((n) => n > 0);
  const expMin = Math.min(...list.map((r) => Number(r.expMin) || 0));
  const expMax = Math.max(...list.map((r) => Number(r.expMax) || 0));
  return {
    role: list.map((r) => norm(r.title)).join(", "),
    openings: open.length ? open.reduce((a, b) => a + b, 0) : "",
    expMin, expMax, expNeeded: expMin > 0,
    payType: paid.payType || "month", payMin: paid.payMin ?? "", payMax: paid.payMax ?? "",
  };
}

export const roleOf = (drive, cand) => driveRoles(drive).find((r) => r.id === cand?.roleId) || null;

export { firstRoundIdx, nextRoundIdx, roundApplies };

export const roundsForRole = (rounds = [], roleId) => rounds.filter((r) => roundApplies(r, roleId));

/* ---------- Documents and check-in fields ---------- */

export function driveDocuments(d) {
  if (Array.isArray(d?.documents)) return d.documents;
  return (d?.docs || []).map((label, i) => ({ id: `dd${i + 1}`, docId: "", label, required: false }));
}

export function fieldAnswerOk(field, value) {
  const v = typeof value === "string" ? value.trim() : value;
  if (v === "" || v == null) return !field.required;
  if (field.type === "number") return /^\d+(\.\d+)?$/.test(String(v));
  if (field.type === "yesno") return v === "yes" || v === "no";
  if (field.type === "dropdown") return (field.options || []).includes(v);
  return String(v).length <= 200;
}

/* ---------- Duplicate drive ---------- */

const DROP = ["gatePass", "wrappedAt", "status", "listCode", "listedEmail", "confirmToken", "listingPending", "listedBy", "listingOnly", "board", "demo"];

/** Everything except the people: no candidates, no queue, no messages. Opens as a draft. */
export function duplicateDrive(d, { id, host, gate, desk, today }) {
  const next = { ...d, id, host, gate, desk, candidates: [], msgs: [], seq: 0, draft: true };
  for (const k of DROP) delete next[k];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(d.date || "")) || d.date < today) {
    const span = d.endDate && d.date ? Math.max(0, Math.round((Date.parse(`${d.endDate}T00:00:00+05:30`) - Date.parse(`${d.date}T00:00:00+05:30`)) / 86400000)) : 0;
    next.date = addDays(today, 1);
    next.endDate = addDays(next.date, span);
  }
  Object.assign(next, utcWindowFields(next));
  return next;
}
