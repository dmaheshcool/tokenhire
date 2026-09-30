import crypto from "node:crypto";
import { ATS_TEMPLATES, atsBytes } from "../src/lib/ats.js";
import { resumeHasFile } from "../src/lib/resume.js";
import { code } from "../src/lib/helpers.js";
import { driveWithResumes, getState } from "./db.js";

const SECRET = process.env.RESUME_SIGN_SECRET || "tokenhire-demo-resume-sign";
const WEEK = 7 * 24 * 60 * 60 * 1000;
const JOB_TTL = 60 * 60 * 1000;
const jobs = new Map();

export function signResume(driveId, candId, exp = Date.now() + WEEK) {
  const payload = `${driveId}|${candId}|${exp}`;
  const sig = crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}

export function readResumeSign(token) {
  try {
    const raw = Buffer.from(String(token || ""), "base64url").toString("utf8");
    const cut = raw.lastIndexOf(".");
    if (cut < 0) return null;
    const payload = raw.slice(0, cut);
    const sig = raw.slice(cut + 1);
    const expect = crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
    if (sig.length !== expect.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expect))) return null;
    const [driveId, candId, exp] = payload.split("|");
    if (!driveId || !candId || Number(exp) < Date.now()) return null;
    return { driveId, candId, exp: Number(exp) };
  } catch {
    return null;
  }
}

function publicJob(job) {
  if (!job) return null;
  return { id: job.id, status: job.status, progress: job.progress, error: job.error || "", filename: job.filename || "", download: job.status === "ready" ? `/api/exports/${job.id}/file` : "" };
}

function sweep() {
  const now = Date.now();
  for (const [id, job] of jobs) if (now - job.at > JOB_TTL) jobs.delete(id);
}

function run(job) {
  job.status = "running";
  job.progress = 40;
  try {
    const drive = driveWithResumes((getState().drives || []).find((d) => d.id === job.driveId));
    if (!drive) throw new Error("That drive is not on this company.");
    job.progress = 70;
    const origin = job.origin.replace(/\/$/, "");
    const file = atsBytes(drive, job.template, job.format, {
      resumeUrl: (c) => (resumeHasFile(c.resume) ? `${origin}/api/files/${signResume(drive.id, c.id)}` : ""),
    });
    job.bytes = file.bytes;
    job.mime = file.mime;
    job.filename = file.filename;
    job.progress = 100;
    job.status = "ready";
  } catch (err) {
    job.status = "failed";
    job.error = err.message || "Export failed.";
  }
}

export function startExport({ driveId, template, format, origin, orgId }) {
  sweep();
  const drive = (getState().drives || []).find((d) => d.id === driveId);
  if (!drive || drive.orgId !== orgId) return { ok: false, error: "That drive is not on this company." };
  const tmpl = ATS_TEMPLATES.some((x) => x.id === template) ? template : "generic";
  const fmt = ["csv", "xlsx", "zip"].includes(format) ? format : "xlsx";
  const job = {
    id: `ex_${code(8)}`, status: "queued", progress: 8, orgId, driveId, template: tmpl, format: fmt,
    origin: origin || "", at: Date.now(),
  };
  jobs.set(job.id, job);
  setTimeout(() => run(job), 40);
  return { ok: true, ...publicJob(job) };
}

export function exportStatus(id, orgId) {
  const job = jobs.get(id);
  if (!job || job.orgId !== orgId) return null;
  return publicJob(job);
}

export function exportFile(id, orgId) {
  const job = jobs.get(id);
  if (!job || job.orgId !== orgId) return null;
  if (job.status !== "ready" || !job.bytes) return { pending: true };
  return job;
}
