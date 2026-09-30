import { useState } from "react";
import { ArrowRight, CircleCheck, FileSpreadsheet, FileStack, KeyRound, LayoutGrid, Megaphone, Ticket, Users } from "lucide-react";
import { EmployerTicks, MiniBoard } from "../components/EmployerCard.jsx";
import { Btn, Reveal, STROKE } from "../components/ds.jsx";
import { useMeta } from "../hooks/useMeta.js";
import { api } from "../lib/api.js";
import { isWorkEmail } from "../lib/helpers.js";
import { t, tl } from "../i18n/strings.js";

const PROBLEM_ICONS = [Users, FileStack, Megaphone];
const SOLUTION_ICONS = [Ticket, LayoutGrid, KeyRound, FileSpreadsheet];

function Block({ id, title, items, icons, dark }) {
  return (
    <section className={`section${dark ? " band-dark" : ""}`} style={dark ? undefined : { paddingTop: 0 }} aria-labelledby={id}>
      <div className="wrap">
        <h2 id={id} className="h-1" style={{ margin: "0 0 40px" }}>{title}</h2>
        <div className={items.length === 4 ? "cards-4" : "cards-3"}>
          {items.map((it, i) => {
            const Icon = icons[i];
            return (
              <Reveal key={it.t} delay={(i % 4) * 80} className="card card-pad stack gap-12"
                style={dark ? { background: "rgba(255,255,255,.04)", borderColor: "rgba(255,255,255,.08)" } : undefined}>
                <span className={`step-icon${dark ? " company" : ""}`}><Icon size={24} strokeWidth={STROKE} aria-hidden="true" /></span>
                <h3 className="h-3">{it.t}</h3>
                <p className="body" style={{ margin: 0, color: dark ? "#A9B4CC" : "var(--muted)" }}>{it.d}</p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const EMPTY = { name: "", email: "", phone: "", company: "", city: "", roles: "", size: "", notes: "" };
const REQUIRED = ["name", "email", "company"];

function PilotForm() {
  const [f, setF] = useState(EMPTY);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const email = t("footer.email");

  async function submit(e) {
    e.preventDefault();
    if (REQUIRED.some((k) => !f[k].trim())) { setErr(t("forCo.pilot.errRequired")); return; }
    if (!isWorkEmail(f.email)) { setErr(t("forCo.pilot.errWork")); document.getElementById("pl-email")?.focus(); return; }
    setErr("");
    setBusy(true);
    try {
      await api.pilot(f);
      setSent(true);
      setF(EMPTY);
    } catch (x) {
      setErr(x.status === 400 || x.status === 429 ? x.message : t("forCo.pilot.errNetwork"));
    } finally {
      setBusy(false);
    }
  }

  const field = (k, props = {}, span = 6) => (
    <div className={`field span-${span}`}>
      <label className="label" htmlFor={`pl-${k}`}>{t(`forCo.pilot.${k}`)}{REQUIRED.includes(k) ? "" : <span className="faint"> {t("forCo.pilot.optional")}</span>}</label>
      <input id={`pl-${k}`} className="input" value={f[k]} onChange={set(k)} {...props} />
    </div>
  );

  return (
    <section id="pilot" className="section" style={{ scrollMarginTop: 80 }} aria-labelledby="fc-pilot">
      <div className="wrap grid-12" style={{ alignItems: "start", rowGap: 32 }}>
        <div className="span-5 stack gap-16">
          <h2 id="fc-pilot" className="h-1">{t("forCo.pilot.title")}</h2>
          <p className="lede">{t("forCo.pilot.body")}</p>
          <p className="body">{t("forCo.pilot.orWrite").split("{{email}}")[0]}<a className="link" href={`mailto:${email}`}>{email}</a></p>
        </div>
        <div className="span-7">
          {sent ? (
            <div className="card card-pad stack gap-12" role="status">
              <CircleCheck size={32} strokeWidth={STROKE} aria-hidden="true" style={{ color: "var(--success)" }} />
              <h3 className="h-3">{t("forCo.pilot.sent")}</h3>
              <div><Btn variant="secondary" onClick={() => setSent(false)}>{t("forCo.pilot.again")}</Btn></div>
            </div>
          ) : (
            <form className="card card-pad grid-12" style={{ rowGap: 16 }} onSubmit={submit} noValidate>
              {field("name", { autoComplete: "name", required: true })}
              {field("email", { type: "email", autoComplete: "email", required: true, "aria-invalid": err === t("forCo.pilot.errWork") })}
              {field("phone", { type: "tel", autoComplete: "tel", inputMode: "tel" })}
              {field("company", { autoComplete: "organization", required: true })}
              {field("city")}
              {field("roles")}
              {field("size", { inputMode: "numeric" }, 12)}
              <div className="field span-12">
                <label className="label" htmlFor="pl-notes">{t("forCo.pilot.notes")}<span className="faint"> {t("forCo.pilot.optional")}</span></label>
                <textarea id="pl-notes" className="textarea" rows={4} value={f.notes} onChange={set("notes")} placeholder={t("forCo.pilot.notesPlaceholder")} />
              </div>
              {err && <p className="small span-12" role="alert" style={{ color: "var(--danger)", margin: 0 }}>{err}</p>}
              <div className="span-12"><Btn type="submit" size="lg" disabled={busy}>{busy ? t("forCo.pilot.sending") : t("forCo.pilot.submit")}</Btn></div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export default function ForCompaniesPage() {
  useMeta({ title: t("forCo.meta.title"), description: t("forCo.meta.description") });
  return (
    <>
      <section className="mesh">
        <div className="wrap" style={{ paddingTop: 64, paddingBottom: 80 }}>
          <p className="eyebrow">{t("forCo.eyebrow")}</p>
          <h1 className="h-display hero-title" style={{ marginTop: 14 }}>{t("forCo.title")}</h1>
          <div className="grid-12" style={{ alignItems: "center", marginTop: 28, rowGap: 32 }}>
            <div className="span-6 stack gap-24">
              <p className="lede" style={{ fontSize: "clamp(18px, 1.9vw, 22px)" }}>{t("forCo.sub")}</p>
              <div className="row gap-12" style={{ flexWrap: "wrap" }}>
                <Btn to="/register" size="lg" iconRight={ArrowRight}>{t("nav.startHiring")}</Btn>
                <Btn href="#pilot" variant="secondary" size="lg">{t("nav.bookPilot")}</Btn>
              </div>
            </div>
            <div className="span-6"><MiniBoard /></div>
          </div>
        </div>
      </section>
      <Block id="fc-problem" title={t("forCo.problem.title")} items={tl("forCo.problem.items")} icons={PROBLEM_ICONS} />
      <Block id="fc-solution" title={t("forCo.solution.title")} items={tl("forCo.solution.items")} icons={SOLUTION_ICONS} dark />
      <EmployerTicks />
      <PilotForm />
    </>
  );
}
