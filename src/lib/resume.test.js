import { test } from "node:test";
import assert from "node:assert/strict";
import { checkResumeFile, emailOk, indianPhone, resumeExt, resumeIsRequired, resumeZipPath, RESUME_MAX_BYTES } from "./resume.js";

test("Indian mobile numbers are 10 digits starting 6–9", () => {
  assert.equal(indianPhone("9959001122"), "9959001122");
  assert.equal(indianPhone("+91 99590 01122"), "9959001122");
  assert.equal(indianPhone("0959001122"), "");
  assert.equal(indianPhone("5959001122"), "");
  assert.ok(emailOk("ananya.rao@gmail.com"));
  assert.equal(emailOk("not-an-email"), false);
});

test("resumes are PDF or Word and at most 5 MB", () => {
  assert.equal(resumeExt("ananya.pdf", ""), "pdf");
  assert.equal(resumeExt("cv.DOCX", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"), "docx");
  assert.equal(checkResumeFile({ name: "cv.pdf", type: "application/pdf", size: 1200 }).ext, "pdf");
  assert.equal(checkResumeFile({ name: "cv.pdf", type: "application/pdf", size: RESUME_MAX_BYTES + 1 }).error, "size");
  assert.equal(checkResumeFile({ name: "photo.png", type: "image/png", size: 800 }).error, "type");
});

test("ZIP member path is /resumes/token_full_name.ext", () => {
  assert.equal(resumeZipPath("W-001", "Ananya Rao", "pdf"), "resumes/W-001_Ananya_Rao.pdf");
  assert.equal(resumeIsRequired({ resumeRequired: false }), false);
  assert.ok(resumeIsRequired({ documents: [{ label: "Updated resume (print + PDF)", required: true }] }));
  assert.equal(resumeIsRequired({ documents: [{ label: "PAN card", required: true }] }), false);
});
