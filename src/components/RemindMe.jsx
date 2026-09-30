import { useEffect, useId, useRef, useState } from "react";
import { Bell, BellRing, X } from "lucide-react";
import { Btn, STROKE, useToast } from "./ds.jsx";
import { useStore } from "../context/Store.jsx";
import { api, readReminders, writeReminders } from "../lib/api.js";
import { t } from "../i18n/strings.js";

const spaced = (p) => `${p.slice(0, 5)} ${p.slice(5)}`;

function useReminder(driveId) {
  const find = () => readReminders().find((r) => r.driveId === driveId) || null;
  const [rec, setRec] = useState(find);
  useEffect(() => {
    const on = () => setRec(readReminders().find((r) => r.driveId === driveId) || null);
    window.addEventListener("th:reminders", on);
    return () => window.removeEventListener("th:reminders", on);
  }, [driveId]);
  return rec;
}

function Dialog({ drive, onClose }) {
  const id = useId();
  const toast = useToast();
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const box = useRef(null);

  useEffect(() => {
    const prev = document.activeElement;
    box.current?.querySelector("input")?.focus();
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); prev?.focus?.(); };
  }, [onClose]);
  useEffect(() => { box.current?.querySelector("input")?.focus(); }, [step]);

  const run = async (fn) => {
    setBusy(true);
    setError("");
    try { await fn(); } catch (e) { setError(e.message || t("remind.failed")); } finally { setBusy(false); }
  };
  const send = (e) => {
    e?.preventDefault();
    run(async () => {
      const r = await api.remindStart({ phone, driveId: drive.id });
      setSent(r);
      setCode("");
      setStep("code");
    });
  };
  const verify = (e) => {
    e.preventDefault();
    run(async () => {
      await api.remindVerify({ phone: sent.phone, code, driveId: drive.id });
      writeReminders([...readReminders().filter((r) => r.driveId !== drive.id), { driveId: drive.id, phone: sent.phone, at: Date.now() }]);
      toast(t("remind.done", { phone: spaced(sent.phone) }));
      onClose();
    });
  };

  return (
    <div className="modal" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={box} className="modal-card stack gap-16" role="dialog" aria-modal="true" aria-labelledby={`${id}-t`}>
        <div className="row between gap-12" style={{ alignItems: "flex-start" }}>
          <div className="stack gap-4">
            <h2 id={`${id}-t`} className="h-3">{t("remind.title")}</h2>
            <p className="small muted" style={{ margin: 0 }}>{drive.role} · {drive.company}</p>
          </div>
          <button type="button" className="btn btn-ghost btn-icon" aria-label={t("remind.close")} onClick={onClose}><X size={20} strokeWidth={STROKE} /></button>
        </div>
        {step === "phone" ? (
          <form className="stack gap-12" onSubmit={send} noValidate>
            <p className="body" style={{ margin: 0 }}>{t("remind.body")}</p>
            <label className="stack gap-6" htmlFor={`${id}-p`}>
              <span className="label">{t("remind.phone")}</span>
              <span className="phone-field">
                <span aria-hidden="true">+91</span>
                <input id={`${id}-p`} className="input" type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={11}
                  value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^\d ]/g, ""))} placeholder="98765 43210"
                  aria-invalid={!!error} aria-describedby={error ? `${id}-e` : undefined} />
              </span>
            </label>
            {error && <p id={`${id}-e`} className="small field-error" role="alert" style={{ margin: 0 }}>{error}</p>}
            <p className="tiny muted" style={{ margin: 0 }}>{t("remind.privacy")}</p>
            <Btn type="submit" block disabled={busy || phone.replace(/\D/g, "").length < 10}>{busy ? t("remind.sending") : t("remind.send")}</Btn>
          </form>
        ) : (
          <form className="stack gap-12" onSubmit={verify} noValidate>
            <p className="body" style={{ margin: 0 }}>{t("remind.codeSent", { phone: `+91 ${spaced(sent.phone)}` })}</p>
            {sent.demo && <p className="panel small" style={{ margin: 0, padding: 12 }}>{t("remind.demo", { code: sent.demoCode })}</p>}
            <label className="stack gap-6" htmlFor={`${id}-c`}>
              <span className="label">{t("remind.codeLabel")}</span>
              <input id={`${id}-c`} className="input mono" inputMode="numeric" autoComplete="one-time-code" maxLength={6}
                value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} style={{ letterSpacing: "0.3em", fontSize: 20 }}
                aria-invalid={!!error} aria-describedby={error ? `${id}-e` : undefined} />
            </label>
            {error && <p id={`${id}-e`} className="small field-error" role="alert" style={{ margin: 0 }}>{error}</p>}
            <Btn type="submit" block disabled={busy || code.length !== 6}>{t("remind.verify")}</Btn>
            <div className="row between gap-12" style={{ flexWrap: "wrap" }}>
              <button type="button" className="link small" onClick={() => { setStep("phone"); setError(""); }}>{t("remind.change")}</button>
              <button type="button" className="link small" onClick={send} disabled={busy}>{t("remind.resend")}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/** "Remind me" for a walk-in that hasn't opened yet. Needs the API to check the code. */
export default function RemindMe({ drive, size, block }) {
  const { apiOk } = useStore();
  const toast = useToast();
  const rec = useReminder(drive.id);
  const [open, setOpen] = useState(false);
  if (!apiOk) return null;
  if (rec) {
    const stop = async () => {
      try { await api.remindStop({ phone: rec.phone, driveId: drive.id }); } catch { /* removed locally either way */ }
      writeReminders(readReminders().filter((r) => r.driveId !== drive.id));
      toast(t("remind.stopped"));
    };
    return (
      <div className="stack gap-4" style={block ? { width: "100%" } : undefined}>
        <span className="small row gap-6" style={{ color: "var(--success-ink)", fontWeight: 600 }}><BellRing size={16} strokeWidth={STROKE} aria-hidden="true" />{t("remind.on")}</span>
        <button type="button" className="link tiny" style={{ alignSelf: "flex-start" }} onClick={stop}>{t("remind.stop")}</button>
      </div>
    );
  }
  return (
    <>
      <Btn variant="secondary" size={size} block={block} icon={Bell} onClick={() => setOpen(true)} style={{ position: "relative", zIndex: 1 }}>{t("remind.button")}</Btn>
      {open && <Dialog drive={drive} onClose={() => setOpen(false)} />}
    </>
  );
}
