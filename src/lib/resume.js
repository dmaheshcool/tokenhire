import { driveDocuments } from "./library.js";
import { resumeDataUrl, resumeName } from "./helpers.js";

export const RESUME_MAX_BYTES = 5 * 1024 * 1024;
export const RESUME_EXTS = ["pdf", "doc", "docx"];
const TYPE_EXT = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};

export function indianPhone(v) {
  const d = String(v ?? "").replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, "");
  return /^[6-9]\d{9}$/.test(d) ? d : "";
}

export function emailOk(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
}

export function resumeExt(name = "", type = "") {
  const fromType = TYPE_EXT[String(type || "").split(";")[0].trim().toLowerCase()];
  if (fromType) return fromType;
  const m = String(name || "").toLowerCase().match(/\.([a-z0-9]+)$/);
  const ext = m?.[1] || "";
  return RESUME_EXTS.includes(ext) ? ext : "";
}

/** Digital resume upload is required when the drive says so, or a required document is a resume. */
export function resumeIsRequired(drive) {
  if (typeof drive?.resumeRequired === "boolean") return drive.resumeRequired;
  return driveDocuments(drive).some((d) => /resume/i.test(d.label || "") && d.required);
}

export function checkResumeFile(file) {
  if (!file) return { error: "missing" };
  if (file.size > RESUME_MAX_BYTES) return { error: "size" };
  const ext = resumeExt(file.name, file.type);
  if (!ext) return { error: "type" };
  return { ext };
}

export function resumeZipPath(token, fullName, ext) {
  const tok = String(token || "token").replace(/[^\w-]+/g, "_") || "token";
  const name = String(fullName || "candidate").replace(/[^\w]+/g, "_").replace(/^_+|_+$/g, "") || "candidate";
  const safeExt = RESUME_EXTS.includes(String(ext || "").toLowerCase()) ? String(ext).toLowerCase() : "pdf";
  return `resumes/${tok}_${name}.${safeExt}`;
}

export function decodeDataUrl(url) {
  const raw = String(url || "");
  const m = /^data:([^;,]+)?(;base64)?,([\s\S]*)$/.exec(raw);
  if (!m) return null;
  const type = m[1] || "application/octet-stream";
  const body = m[3] || "";
  if (m[2]) {
    const bin = atob(body);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return { type, bytes };
  }
  return { type, bytes: new TextEncoder().encode(decodeURIComponent(body)) };
}

export function resumeBytes(resume) {
  const url = resumeDataUrl(resume);
  if (!url) return null;
  return decodeDataUrl(url);
}

export function resumeHasFile(resume) {
  return !!(resumeBytes(resume) || (typeof resume === "object" && resume?.stored));
}

export function publicResume(resume) {
  if (!resume || typeof resume !== "object") return resume || "";
  const next = { ...resume };
  delete next.data;
  return next;
}

export { resumeName, resumeDataUrl };
