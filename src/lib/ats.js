import { downloadFile, listingPlace, resumeName } from "./helpers.js";
import { roleOf } from "./library.js";
import { resumeBytes, resumeExt, resumeHasFile, resumeZipPath } from "./resume.js";
import { t } from "../i18n/strings.js";
import { formatIST } from "./time.js";
import { formulaSafe } from "./export-safe.js";
import { XLSX_MIME, ZIP_MIME, xlsxBytes, zipBytes } from "./xlsx.js";

// Templates only rename or reorder the Generic columns. They do not add or drop fields.
export const ATS_TEMPLATES = [
  { id: "generic", labelKey: "ats.templates.generic", hintKey: "ats.hints.generic" },
  { id: "workday", labelKey: "ats.templates.workday", hintKey: "ats.hints.workday",
    rename: { "Drive ID": "Job Requisition ID", "Drive name": "Job Requisition", "Role applied": "Job Profile", "Full name": "Legal Name", "Final status": "Stage" } },
  { id: "greenhouse", labelKey: "ats.templates.greenhouse", hintKey: "ats.hints.greenhouse",
    rename: { "Full name": "Candidate Name", "Role applied": "Job", "Final status": "Application Status", "Resume file name": "Resume" } },
  { id: "lever", labelKey: "ats.templates.lever", hintKey: "ats.hints.lever",
    rename: { "Full name": "Full Name", "Role applied": "Posting", "Final status": "Stage" } },
  { id: "zoho", labelKey: "ats.templates.zoho", hintKey: "ats.hints.zoho",
    rename: { "Full name": "Candidate Name", "Role applied": "Job Opening", "Phone": "Mobile", "Final status": "Candidate Status" } },
  { id: "successfactors", labelKey: "ats.templates.successfactors", hintKey: "ats.hints.successfactors",
    rename: { "Drive ID": "Requisition ID", "Role applied": "Job Requisition", "Full name": "Candidate Full Name", "Final status": "Status" } },
];

export const ATS_TARGETS = ATS_TEMPLATES.map((x) => ({ id: x.id, label: t(x.labelKey), hint: t(x.hintKey) }));

const ROUND_PARTS = ["name", "room", "interviewer", "start", "end", "decision", "score", "notes"];
const FINAL = { wait: "In queue", calling: "Called", at_desk: "At desk", interviewing: "In a round", selected: "Shortlisted", rejected: "Not selected", onhold: "On hold", absent: "No-show", done: "Done", cancelled: "Cancelled", expired: "Expired", prereg: "Pre-registered" };

const CORE = [
  "Drive ID", "Drive name", "Date (IST)", "Venue", "Process", "Token", "Full name", "Phone", "Email",
  "Role applied", "Experience", "Current company", "Notice period", "Check-in time (IST)",
  "Check-in method", "Location verified", "Pre-registered",
  "Resume file name", "Resume link", "Final status", "Final decision reason",
];

function templateOf(id) {
  return ATS_TEMPLATES.find((x) => x.id === id) || ATS_TEMPLATES[0];
}

function cell(v) {
  return `"${formulaSafe(v).replace(/"/g, "\"\"")}"`;
}

export function csvText(rows) {
  return `\uFEFF${rows.map((r) => r.map(cell).join(",")).join("\n")}`;
}

function peopleOf(drive) {
  return (drive?.candidates || []).filter((c) => !c.released);
}

function stamp(value, withTime) {
  if (!value && value !== 0) return "";
  return withTime ? formatIST(value, { date: true, time: true }) : formatIST(value, { date: true, year: true });
}

function fieldBy(drive, cand, re, fallback) {
  if (fallback) return fallback;
  for (const f of drive.fields || []) {
    if (re.test(f.label || "")) return String(cand.answers?.[f.id] ?? "").trim();
  }
  return "";
}

function roundHeader(n, part) {
  if (part === "start") return `Round ${n} start (IST)`;
  if (part === "end") return `Round ${n} end (IST)`;
  return `Round ${n} ${part}`;
}

function lastOutcomeIdx(drive, cand) {
  const rounds = drive.rounds || [];
  for (let i = rounds.length - 1; i >= 0; i--) if (cand.roundOutcomes?.[rounds[i].id]) return i;
  return -1;
}

function roundTimes(drive, cand, round, index) {
  const log = cand.roundLog?.[round.id] || {};
  const current = cand.roundIdx === index;
  const room = log.room || (current && cand.room?.name) || "";
  const interviewer = log.interviewer || (current && cand.room?.interviewer) || "";
  const start = log.start || (current && cand.calledAt) || "";
  const end = log.end || (lastOutcomeIdx(drive, cand) === index && cand.decidedAt) || "";
  return {
    name: round.name || "",
    room,
    interviewer,
    start: stamp(start, true),
    end: stamp(end, true),
    decision: cand.roundOutcomes?.[round.id] || "",
    score: log.score || cand.roundScores?.[round.id] || "",
    notes: cand.notes?.[round.id] || "",
  };
}

function resumeFileName(drive, cand) {
  const name = resumeName(cand.resume);
  if (!name && !resumeHasFile(cand.resume)) return "";
  const ext = resumeExt(name, cand.resume?.type) || (name.includes(".") ? name.split(".").pop() : "pdf");
  return resumeZipPath(cand.token, cand.name, ext).slice("resumes/".length);
}

function reasonOf(drive, cand) {
  const rounds = drive.rounds || [];
  for (let i = rounds.length - 1; i >= 0; i--) {
    const id = rounds[i].id;
    const note = cand.notes?.[id];
    if (note) return note;
    if (cand.roundOutcomes?.[id]) return cand.roundOutcomes[id];
  }
  return cand.reason || "";
}

function candidateRecord(drive, cand, resumeLink) {
  const role = roleOf(drive, cand);
  const file = resumeFileName(drive, cand);
  const rec = {
    "Drive ID": drive.id || "",
    "Drive name": drive.role || "",
    "Date (IST)": stamp(drive.startsAt || drive.date, false),
    "Venue": listingPlace(drive) || [drive.venue, drive.city].filter(Boolean).join(" · "),
    "Process": drive.clientName || "",
    "Token": cand.token || "",
    "Full name": cand.name || "",
    "Phone": cand.phone || "",
    "Email": cand.email || "",
    "Role applied": role?.title || drive.role || "",
    "Experience": cand.expBand || cand.exp || "",
    "Current company": fieldBy(drive, cand, /current company|employer/i, cand.company || cand.currentCompany || ""),
    "Notice period": fieldBy(drive, cand, /notice/i, cand.notice || ""),
    "Check-in time (IST)": cand.checkedIn === false ? "" : stamp(cand.arrivedAt || cand.checkin_at || cand.at, true),
    "Check-in method": cand.checkin_method || "",
    "Location verified": cand.location_verified === true ? "yes" : cand.location_verified === false ? "no" : "unknown",
    "Pre-registered": cand.state === "prereg" || cand.wasPrereg ? "yes" : "no",
    "Resume file name": file,
    "Resume link": resumeLink || "",
    "Final status": FINAL[cand.state] || cand.state || "",
    "Final decision reason": reasonOf(drive, cand),
  };
  (drive.rounds || []).forEach((round, i) => {
    const times = roundTimes(drive, cand, round, i);
    for (const part of ROUND_PARTS) rec[roundHeader(i + 1, part)] = times[part] || "";
  });
  for (const f of drive.fields || []) rec[f.label] = String(cand.answers?.[f.id] ?? "").trim();
  return rec;
}

function headersFor(drive) {
  const roundCols = (drive.rounds || []).flatMap((_, i) => ROUND_PARTS.map((p) => roundHeader(i + 1, p)));
  const custom = (drive.fields || []).map((f) => f.label).filter(Boolean);
  return [...CORE, ...roundCols, ...custom];
}

function applyTemplate(headers, records, template) {
  const rename = template.rename || {};
  const extras = headers.filter((h) => !(template.order || []).includes(h));
  const keys = template.order ? [...template.order, ...extras] : headers;
  const head = keys.map((k) => rename[k] || k);
  const rows = records.map((rec) => keys.map((k) => rec[k] ?? ""));
  return [head, ...rows];
}

function waitMins(cand) {
  if (!cand.calledAt || !cand.at || cand.calledAt < cand.at) return null;
  const m = (cand.calledAt - cand.at) / 60000;
  return m >= 0 && m < 12 * 60 ? m : null;
}

function summaryRows(drive, people) {
  const rounds = drive.rounds || [];
  const checkedIn = people.filter((c) => c.checkedIn !== false).length;
  const shortlisted = people.filter((c) => c.state === "selected").length;
  const noShows = people.filter((c) => c.state === "absent").length;
  const waits = people.map(waitMins).filter((n) => n != null);
  const avgWait = waits.length ? `${Math.round(waits.reduce((a, b) => a + b, 0) / waits.length)} min` : "";
  const head = ["Drive ID", "Drive name", "Date (IST)", "Registered", "Checked in", ...rounds.map((r, i) => `Interviewed (round ${i + 1}: ${r.name})`), "Shortlisted", "No-shows", "Average wait"];
  const interviewed = rounds.map((r, i) => people.filter((c) => roundTimes(drive, c, r, i).start || c.roundOutcomes?.[r.id]).length);
  const row = [drive.id || "", drive.role || "", stamp(drive.startsAt || drive.date, false), people.length, checkedIn, ...interviewed, shortlisted, noShows, avgWait];
  return [head, row];
}

function roundsSheet(drive, people) {
  const head = ["Drive ID", "Token", "Round", "Round name", "Room", "Interviewer", "Start (IST)", "End (IST)", "Decision", "Score", "Notes"];
  const rows = [];
  for (const cand of people) {
    (drive.rounds || []).forEach((round, i) => {
      const x = roundTimes(drive, cand, round, i);
      if (!x.start && !x.end && !x.decision && !x.notes && !x.score) return;
      rows.push([drive.id || "", cand.token || "", i + 1, x.name, x.room, x.interviewer, x.start, x.end, x.decision, x.score, x.notes]);
    });
  }
  return [head, ...rows];
}

function packResumes(drive, people) {
  const files = [];
  for (const cand of people) {
    const decoded = resumeBytes(cand.resume);
    if (!decoded) continue;
    const ext = resumeExt(resumeName(cand.resume), cand.resume?.type || decoded.type) || "pdf";
    files.push({ name: resumeZipPath(cand.token, cand.name, ext), data: decoded.bytes });
  }
  return files;
}

/** Three sheets plus resume zip members. `resumeUrl(cand)` supplies the 7-day signed link. */
export function buildAtsReport(drive, target, { resumeUrl } = {}) {
  const tmpl = templateOf(target);
  const people = peopleOf(drive);
  const headers = headersFor(drive);
  const records = people.map((c) => candidateRecord(drive, c, resumeUrl ? resumeUrl(c) : ""));
  const candidates = applyTemplate(headers, records, tmpl);
  const rounds = roundsSheet(drive, people);
  const summary = summaryRows(drive, people);
  const resumes = packResumes(drive, people);
  return {
    template: tmpl.id,
    sheets: [
      { name: "Candidates", rows: candidates },
      { name: "Rounds", rows: rounds },
      { name: "Summary", rows: summary },
    ],
    resumes,
    people,
  };
}

export function atsRows(drive, target) {
  return buildAtsReport(drive, target).sheets[0].rows;
}

export function buildAts(drive, target) {
  return csvText(atsRows(drive, target));
}

export function fileBase(drive, id) {
  const slug = String(drive?.company || "walkin").replace(/[^\w]+/g, "_");
  return `${slug}_${drive?.date || "drive"}_${id}`;
}

export function atsBytes(drive, target, format, opts) {
  const report = buildAtsReport(drive, target, opts);
  const id = report.template;
  const base = fileBase(drive, id);
  if (format === "xlsx") {
    return { filename: `${base}.xlsx`, mime: XLSX_MIME, bytes: xlsxBytes(report.sheets) };
  }
  if (format === "zip") {
    const files = [
      { name: `${base}_candidates.csv`, data: csvText(report.sheets[0].rows) },
      { name: `${base}_rounds.csv`, data: csvText(report.sheets[1].rows) },
      { name: `${base}_summary.csv`, data: csvText(report.sheets[2].rows) },
      ...report.resumes,
    ];
    return { filename: `${base}_resumes.zip`, mime: ZIP_MIME, bytes: zipBytes(files) };
  }
  return { filename: `${base}.csv`, mime: "text/csv", bytes: new TextEncoder().encode(csvText(report.sheets[0].rows)) };
}

function saveBytes(filename, bytes, mime) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([bytes], { type: mime }));
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 500);
}

export function downloadAts(drive, target, format = "csv", opts) {
  const file = atsBytes(drive, target, format, opts);
  if (format === "csv") downloadFile(file.filename, csvText(buildAtsReport(drive, target, opts).sheets[0].rows), "text/csv");
  else saveBytes(file.filename, file.bytes, file.mime);
}
