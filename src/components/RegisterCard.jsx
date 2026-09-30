import { useState } from "react";
import { CalendarPlus } from "lucide-react";
import { Btn } from "./ds.jsx";
import { useStore } from "../context/Store.jsx";
import { calendarUrl } from "../lib/listing.js";
import { makePrereg, preregOf } from "../lib/prereg.js";
import { checkResumeFile, emailOk, indianPhone, resumeIsRequired } from "../lib/resume.js";
import { readDeviceId } from "../lib/device.js";
import { readResumeFile, resumeName } from "../lib/helpers.js";
import { t } from "../i18n/strings.js";

export function RegisterCard({ drive, live, opens, checkIn, helper }) {
  const { profile, setProfile, setDrives } = useStore();
  const pre = preregOf(drive, profile);
  const registered = !!pre || !!(profile?.applications || []).includes(drive.id);
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState("");
  const [consent, setConsent] = useState(false);
  const [f, setF] = useState(() => ({
    name: profile?.name || "",
    phone: profile?.phone || "",
    email: profile?.email || "",
    resume: profile?.resume || null,
  }));

  async function attach(ev) {
    const file = ev.target.files?.[0];
    if (!file) return;
    const bad = checkResumeFile(file);
    if (bad.error === "size") { setErr(t("checkin.resumeSize")); return; }
    if (bad.error) { setErr(t("checkin.resumeType")); return; }
    setErr("");
    const resume = await readResumeFile(file);
    setF((p) => ({ ...p, resume }));
  }

  function save(e) {
    e.preventDefault();
    const phone = indianPhone(f.phone);
    if (!f.name.trim() || !phone) { setErr(t("checkin.phoneErr")); return; }
    if (!emailOk(f.email)) { setErr(t("checkin.emailErr")); return; }
    if (resumeIsRequired(drive) && !resumeName(f.resume)) { setErr(t("checkin.resumeNeed")); return; }
    if (!consent) { setErr(t("checkin.consentErr")); return; }
    const next = {
      ...(profile || {}),
      name: f.name.trim(),
      phone,
      email: f.email.trim(),
      resume: f.resume,
      id: profile?.id || `c_${Date.now()}`,
      deviceId: profile?.deviceId || readDeviceId(),
      applications: [...new Set([...(profile?.applications || []), drive.id])],
      bound: profile?.bound || {},
    };
    setProfile(next);
    const cand = makePrereg(next, { consentAt: Date.now() });
    setDrives((prev) => prev.map((d) => {
      if (d.id !== drive.id) return d;
      const rest = (d.candidates || []).filter((c) => !(c.state === "prereg" && (c.phone === next.phone || c.deviceId === next.deviceId)));
      return { ...d, candidates: [...rest, cand] };
    }));
    setOpen(false);
  }

  function cancel() {
    setDrives((prev) => prev.map((d) => d.id !== drive.id ? d : {
      ...d,
      candidates: (d.candidates || []).filter((c) => !(c.state === "prereg" && (c.phone === profile?.phone || c.deviceId === profile?.deviceId))),
    }));
    if (profile) setProfile({ ...profile, applications: (profile.applications || []).filter((id) => id !== drive.id) });
  }

  if (registered && !live) {
    return (
      <div className="stack gap-12">
        <p className="strong" style={{ margin: 0 }}>{t("detail.registeredTitle", { time: opens })}</p>
        <p className="small muted" style={{ margin: 0 }}>{t("detail.noTokenYet")}</p>
        <div className="row gap-8 wrap-row">
          <Btn variant="secondary" size="sm" icon={CalendarPlus} href={calendarUrl(drive)} target="_blank" rel="noreferrer">{t("token.calendar")}</Btn>
          <Btn variant="ghost" size="sm" onClick={cancel}>{t("detail.cancelReg")}</Btn>
        </div>
        <p className="tiny" style={{ margin: 0, fontWeight: 700 }}>{t("detail.nextTitle")}</p>
        <ol className="body" style={{ margin: 0, paddingLeft: 18 }}>
          <li>{t("detail.next1")}</li>
          <li>{t("detail.next2")}</li>
          <li>{t("detail.next3")}</li>
        </ol>
      </div>
    );
  }

  if (live) {
    return (
      <div className="stack gap-12">
        {checkIn}
        {helper && <p className="small muted" style={{ margin: 0 }}>{helper}</p>}
      </div>
    );
  }

  if (!open) {
    return (
      <div className="stack gap-12">
        <Btn size="lg" block onClick={() => setOpen(true)}>{t("buttons.registerWalkIn")}</Btn>
        {helper && <p className="small muted" style={{ margin: 0 }}>{helper}</p>}
        <p className="tiny muted" style={{ margin: 0 }}>{t("detail.noTokenYet")}</p>
      </div>
    );
  }

  return (
    <form className="stack gap-12" onSubmit={save}>
      <p className="strong" style={{ margin: 0 }}>{t("buttons.registerWalkIn")}</p>
      <label className="label" htmlFor="reg-name">{t("candidate.name")}</label>
      <input id="reg-name" className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required />
      <label className="label" htmlFor="reg-phone">{t("candidate.phone")}</label>
      <input id="reg-phone" className="input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} inputMode="numeric" required />
      <label className="label" htmlFor="reg-email">{t("candidate.email")}</label>
      <input id="reg-email" className="input" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required />
      {(resumeIsRequired(drive) || f.resume) && (
        <label className="label" htmlFor="reg-resume">
          {t("candidate.resume")}
          <input id="reg-resume" type="file" accept=".pdf,.doc,.docx" onChange={attach} style={{ display: "block", marginTop: 8 }} />
          {resumeName(f.resume) ? <span className="tiny muted">{resumeName(f.resume)}</span> : null}
        </label>
      )}
      <label className="check" style={{ alignItems: "flex-start" }}>
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span className="small">{t("checkin.consent", { company: drive.company })}</span>
      </label>
      {err && <p className="small" role="alert" style={{ color: "var(--danger)", margin: 0 }}>{err}</p>}
      <p className="tiny muted" style={{ margin: 0 }}>{t("detail.noTokenYet")}</p>
      <div className="row gap-8">
        <Btn type="submit">{t("buttons.registerWalkIn")}</Btn>
        <Btn type="button" variant="ghost" onClick={() => setOpen(false)}>{t("buttons.cancel")}</Btn>
      </div>
    </form>
  );
}
