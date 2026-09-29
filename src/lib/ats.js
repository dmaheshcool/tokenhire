import { downloadFile, roundLabel } from "./helpers.js";
import { xlsxBlob } from "./xlsx.js";

// These are the spreadsheets each system already knows how to import.
// TokenHire does not sign in to the tenant — the company's HR uploads the file,
// or connects the tenant API on their side.
export const ATS_TARGETS = [
  {
    id: "standard",
    label: "Any ATS (standard columns)",
    hint: "One row per candidate with plain column names: token, name, phone, email, experience, status, round results and notes.",
  },
  {
    id: "workday",
    label: "Workday",
    hint: "Candidate spreadsheet for Workday Recruiting. Upload it with the candidate import (EIB), and map Job Requisition to the open req if that column is still the role name.",
  },
  {
    id: "greenhouse",
    label: "Greenhouse",
    hint: "Candidate CSV for Greenhouse bulk import: first name, last name, email, phone, job, source, and notes.",
  },
  {
    id: "lever",
    label: "Lever",
    hint: "Candidate CSV for Lever’s import: full name, email, phone, posting, origin, and notes.",
  },
  {
    id: "darwinbox",
    label: "Darwinbox",
    hint: "Candidate sheet for Darwinbox Hire bulk upload. Map the job title to the opening after import.",
  },
  {
    id: "keka",
    label: "Keka Hire",
    hint: "Candidate sheet for Keka Hire bulk upload.",
  },
];

const STAGE = {
  workday: { wait: "Review", calling: "Interview", interviewing: "Interview", selected: "Selected", onhold: "On Hold", rejected: "Declined", absent: "No Show" },
  greenhouse: { wait: "Application Review", calling: "Interview", interviewing: "Interview", selected: "Selected", onhold: "On Hold", rejected: "Rejected", absent: "No Show" },
  lever: { wait: "New applicant", calling: "Interview", interviewing: "Interview", selected: "Selected", onhold: "On hold", rejected: "Rejected", absent: "No show" },
  darwinbox: { wait: "In Process", calling: "Interview", interviewing: "Interview", selected: "Selected", onhold: "On Hold", rejected: "Rejected", absent: "No Show" },
  keka: { wait: "Applied", calling: "Interview", interviewing: "Interview", selected: "Selected", onhold: "On Hold", rejected: "Rejected", absent: "No Show" },
};

function cell(v) {
  return `"${String(v ?? "").replace(/"/g, "\"\"")}"`;
}

function csv(rows) {
  return `\uFEFF${rows.map((r) => r.map(cell).join(",")).join("\n")}`;
}

function splitName(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { first: "", last: "" };
  if (parts.length === 1) return { first: parts[0], last: "." };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

function stageOf(target, state) {
  return STAGE[target]?.[state] || "Review";
}

function notesOf(drive, c) {
  const rounds = drive.rounds || [];
  const bits = [];
  const exp = c.expBand || c.exp;
  if (exp) bits.push(`Experience: ${exp}`);
  const token = c.token || "";
  if (token) bits.push(`Token ${token}`);
  bits.push(`Walk-in status: ${roundLabel(rounds, c)}`);
  for (const r of rounds) {
    const outcome = c.roundOutcomes?.[r.id];
    const note = c.notes?.[r.id];
    if (!outcome && !note) continue;
    bits.push(`${r.name}: ${[outcome, note].filter(Boolean).join(" — ")}`);
  }
  return bits.join(" | ");
}

const STANDARD_STATUS = { wait: "Waiting", calling: "Called", interviewing: "In interview", selected: "Selected", onhold: "On hold", rejected: "Not selected", absent: "No-show" };

function rowsFor(drive, target) {
  const people = (drive.candidates || []).filter((c) => !c.released);
  if (target === "standard") {
    const rounds = drive.rounds || [];
    return people.map((c) => [
      c.token || "", c.name || "", c.phone || "", c.email || "", c.expBand || c.exp || "",
      drive.role || "", drive.company || "", drive.city || "", [drive.venue, drive.area].filter(Boolean).join(", "), drive.date || "",
      c.checkedIn === false ? "No" : "Yes", roundLabel(rounds, c), STANDARD_STATUS[c.state] || c.state || "",
      rounds.map((r) => (c.roundOutcomes?.[r.id] ? `${r.name}: ${c.roundOutcomes[r.id]}` : "")).filter(Boolean).join("; "),
      rounds.map((r) => (c.notes?.[r.id] ? `${r.name}: ${c.notes[r.id]}` : "")).filter(Boolean).join(" | "),
    ]);
  }
  const role = drive.role || "";
  const place = [drive.city, drive.venue].filter(Boolean).join(", ");
  return people.map((c) => {
    const { first, last } = splitName(c.name);
    const notes = notesOf(drive, c);
    const stage = stageOf(target, c.state);
    const phone = c.phone || "";
    const email = c.email || "";
    if (target === "workday") {
      return ["India", first, last, email, phone, role, "TokenHire walk-in", stage, c.expBand || c.exp || "", notes];
    }
    if (target === "greenhouse") {
      return [first, last, email, phone, drive.company || "", role, "TokenHire walk-in", role, stage, notes];
    }
    if (target === "lever") {
      return [c.name || `${first} ${last}`.trim(), email, phone, drive.company || "", role, place, "TokenHire walk-in", stage, notes];
    }
    if (target === "darwinbox") {
      return [c.name || "", email, phone, c.expBand || c.exp || "", drive.city || "", "TokenHire walk-in", role, stage, notes];
    }
    return [first, last, email, phone, c.expBand || c.exp || "", drive.city || "", "TokenHire walk-in", role, stage, notes];
  });
}

const HEADERS = {
  standard: ["Token", "Full name", "Phone", "Email", "Experience", "Role", "Company", "City", "Venue", "Drive date", "Checked in", "Current round", "Status", "Round results", "Interview notes"],
  workday: ["Country", "First Name", "Last Name", "Email", "Phone", "Job Requisition", "Source", "Stage", "Experience", "Notes"],
  greenhouse: ["First Name", "Last Name", "Email", "Phone", "Company", "Title", "Source", "Job", "Stage", "Notes"],
  lever: ["Full Name", "Email", "Phone", "Company", "Position", "Location", "Origin", "Stage", "Notes"],
  darwinbox: ["Candidate Name", "Email", "Contact Number", "Experience", "Current Location", "Source", "Job Title", "Status", "Notes"],
  keka: ["First Name", "Last Name", "Email", "Mobile", "Experience", "Current Location", "Source", "Job Title", "Stage", "Notes"],
};

const targetId = (target) => (ATS_TARGETS.some((t) => t.id === target) ? target : "standard");

/** Header row plus one row per candidate, for the chosen ATS. */
export function atsRows(drive, target) {
  const id = targetId(target);
  return [HEADERS[id], ...rowsFor(drive, id)];
}

export function buildAts(drive, target) {
  return csv(atsRows(drive, target));
}

function fileBase(drive, id) {
  const slug = String(drive?.company || "walkin").replace(/[^\w]+/g, "_");
  return `${slug}_${drive?.date || "drive"}_${id}`;
}

export function downloadAts(drive, target, format = "csv") {
  const id = targetId(target);
  if (format === "xlsx") {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(xlsxBlob(atsRows(drive, id)));
    a.download = `${fileBase(drive, id)}.xlsx`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 500);
    return;
  }
  downloadFile(`${fileBase(drive, id)}.csv`, buildAts(drive, id), "text/csv");
}
