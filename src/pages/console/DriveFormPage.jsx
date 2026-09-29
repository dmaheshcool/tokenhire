import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus, Trash2, X } from "lucide-react";
import { Btn, STROKE, useToast } from "../../components/ds.jsx";
import { PageHead, useConsole } from "../../layouts/ConsoleLayout.jsx";
import { useMeta } from "../../hooks/useMeta.js";
import { ROLE_TYPES } from "../../data/board.js";
import { HERO_CITIES, expLabel, payLabel } from "../../lib/listing.js";
import { hoursLabel, datesLabel, istDate } from "../../lib/status.js";
import {
  BRAND_COLORS, DEFAULT_ROOMS, DEFAULT_ROUNDS, DOC_OPTIONS, code, docNameOf, driveSlotsLeft, newGate, newHost,
} from "../../lib/helpers.js";
import { t, tl } from "../../i18n/strings.js";

const CITIES = [...HERO_CITIES, "Noida", "Gurgaon", "Kolkata", "Ahmedabad", "Kochi", "Jaipur", "Coimbatore", "Indore"];
const num = (v) => (v === "" || v == null ? "" : Number(v));
const uid = (p) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

function roundsFrom(rounds, rooms) {
  const first = rounds[0]?.id;
  return rounds.map((r) => ({
    id: r.id,
    name: r.name,
    rooms: rooms.filter((rm) => (rm.roundId || first) === r.id).map((rm) => ({ id: rm.id, name: rm.name, interviewer: rm.interviewer || "" })),
  }));
}

function blank(org) {
  const branch = (org.branches || [])[0];
  return {
    role: "", roleType: ROLE_TYPES[0], clientId: "", branchId: branch?.id || "",
    city: branch?.city || "", venue: branch?.address || "", area: branch?.area || "", landmark: branch?.landmark || "",
    date: istDate(1), endDate: istDate(1), startTime: "10:00", endTime: "16:00",
    payMin: "", payMax: "", expMin: 0, expMax: 2, openings: 10,
    jd: "", docs: [DOC_OPTIONS[0], DOC_OPTIONS[1]], visibility: "public",
    rounds: roundsFrom(DEFAULT_ROUNDS, DEFAULT_ROOMS),
  };
}

function fromDrive(d) {
  return {
    role: d.role || "", roleType: d.roleType || ROLE_TYPES[0], clientId: d.clientId || "", branchId: d.branchId || "",
    city: d.city || "", venue: d.venue || "", area: d.area || "", landmark: d.landmark || "",
    date: d.date || "", endDate: d.endDate || d.date || "", startTime: d.startTime || "10:00", endTime: d.endTime || "16:00",
    payMin: d.payMin ?? "", payMax: d.payMax ?? "", expMin: d.expMin ?? 0, expMax: d.expMax ?? 2, openings: d.openings ?? "",
    jd: d.jd || "", docs: Array.isArray(d.docs) ? d.docs : [], visibility: d.visibility || "public",
    rounds: roundsFrom(d.rounds || [], d.rooms || []),
  };
}

const STEP_FIELDS = [
  ["role", "city", "venue", "date", "endDate", "startTime"],
  ["payMax", "expMax", "jd"],
  ["rounds"],
  [],
  [],
];

function check(f) {
  const e = {};
  if (f.role.trim().length < 3) e.role = t("console.form.err.role");
  if (!f.city.trim()) e.city = t("console.form.err.city");
  if (f.venue.trim().length < 5) e.venue = t("console.form.err.venue");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(f.date)) e.date = t("console.form.err.date");
  if (f.endDate && f.endDate < f.date) e.endDate = t("console.form.err.endDate");
  if (!f.startTime || !f.endTime) e.startTime = t("console.form.err.time");
  if (f.payMin !== "" && f.payMax !== "" && Number(f.payMax) < Number(f.payMin)) e.payMax = t("console.form.err.payMax");
  if (Number(f.expMax) < Number(f.expMin)) e.expMax = t("console.form.err.expMax");
  if (f.jd.trim().length < 60) e.jd = t("console.form.err.jd");
  if (!f.rounds.some((r) => r.name.trim() && r.rooms.some((rm) => rm.name.trim()))) e.rounds = t("console.form.err.rounds");
  return e;
}

function F({ id, label, error, hint, children, span = 6 }) {
  return (
    <div className={`field span-${span}`}>
      <label className="label" htmlFor={id}>{label}</label>
      {children}
      {error ? <p className="tiny" role="alert" style={{ color: "var(--danger)", margin: 0 }}>{error}</p>
        : hint ? <p className="tiny muted" style={{ margin: 0 }}>{hint}</p> : null}
    </div>
  );
}

function Stepper({ step, onPick, maxStep }) {
  const steps = tl("console.form.steps");
  const list = useRef(null);
  useEffect(() => {
    const el = list.current?.querySelector("[aria-current]");
    if (!el) return;
    const box = list.current;
    box.scrollTo({ left: box.scrollLeft + el.getBoundingClientRect().left - box.getBoundingClientRect().left, behavior: "smooth" });
  }, [step]);
  return (
    <ol ref={list} className="row gap-8" style={{ listStyle: "none", margin: "0 0 20px", padding: 0, flexWrap: "nowrap", overflowX: "auto", scrollbarWidth: "none" }} aria-label={t("console.form.stepOf", { n: step + 1, total: steps.length })}>
      {steps.map((label, i) => (
        <li key={label} style={{ flexShrink: 0 }}>
          <button type="button" className="chip" aria-current={i === step ? "step" : undefined} aria-pressed={i === step} disabled={i > maxStep} onClick={() => onPick(i)}>
            <span className="mono" style={{ opacity: 0.6, marginRight: 6 }}>{i + 1}</span>{label}
          </button>
        </li>
      ))}
    </ol>
  );
}

function RoundsEditor({ rounds, setRounds, error }) {
  const upd = (ri, patch) => setRounds(rounds.map((r, i) => (i === ri ? { ...r, ...patch } : r)));
  const updRoom = (ri, mi, patch) => upd(ri, { rooms: rounds[ri].rooms.map((m, j) => (j === mi ? { ...m, ...patch } : m)) });
  return (
    <div className="stack gap-16">
      {rounds.map((r, ri) => (
        <div key={r.id} className="panel stack gap-12" style={{ padding: 18 }}>
          <div className="row gap-8" style={{ alignItems: "flex-end" }}>
            <div className="field grow">
              <label className="label" htmlFor={`r-${r.id}`}>{t("console.form.roundN", { n: ri + 1 })} · {t("console.form.roundName")}</label>
              <input id={`r-${r.id}`} className="input" value={r.name} onChange={(e) => upd(ri, { name: e.target.value })} />
            </div>
            {rounds.length > 1 && (
              <button type="button" className="btn btn-ghost btn-icon" aria-label={t("console.form.removeRound")} onClick={() => setRounds(rounds.filter((_, i) => i !== ri))}>
                <Trash2 size={18} strokeWidth={STROKE} />
              </button>
            )}
          </div>
          {r.rooms.map((m, mi) => (
            <div key={m.id} className="row gap-8" style={{ alignItems: "flex-end", flexWrap: "wrap" }}>
              <div className="field" style={{ flex: "1 1 140px" }}>
                <label className="label" htmlFor={`m-${m.id}`}>{t("console.form.room")}</label>
                <input id={`m-${m.id}`} className="input" value={m.name} onChange={(e) => updRoom(ri, mi, { name: e.target.value })} />
              </div>
              <div className="field" style={{ flex: "2 1 200px" }}>
                <label className="label" htmlFor={`i-${m.id}`}>{t("console.form.recruiters")}</label>
                <input id={`i-${m.id}`} className="input" value={m.interviewer} placeholder={t("console.form.recruitersPlaceholder")} onChange={(e) => updRoom(ri, mi, { interviewer: e.target.value })} />
              </div>
              {r.rooms.length > 1 && (
                <button type="button" className="btn btn-ghost btn-icon" aria-label={t("console.form.removeRoom")} onClick={() => upd(ri, { rooms: r.rooms.filter((_, j) => j !== mi) })}>
                  <X size={18} strokeWidth={STROKE} />
                </button>
              )}
            </div>
          ))}
          <div><Btn size="sm" variant="ghost" icon={Plus} onClick={() => upd(ri, { rooms: [...r.rooms, { id: uid("rm"), name: "", interviewer: "" }] })}>{t("console.form.addRoom")}</Btn></div>
        </div>
      ))}
      {error && <p className="small" role="alert" style={{ color: "var(--danger)", margin: 0 }}>{error}</p>}
      <div><Btn variant="secondary" icon={Plus} onClick={() => setRounds([...rounds, { id: uid("r"), name: "", rooms: [{ id: uid("rm"), name: "", interviewer: "" }] }])}>{t("console.form.addRound")}</Btn></div>
    </div>
  );
}

export default function DriveFormPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const { org, desk, drives, setDrives } = useConsole();
  const drive = id ? drives.find((d) => d.id === id && d.orgId === org.id) : null;
  const [f, setF] = useState(() => (drive ? fromDrive(drive) : blank(org)));
  const [errors, setErrors] = useState({});
  const [extraDoc, setExtraDoc] = useState("");
  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(drive ? 4 : 0);
  useMeta({ title: drive ? t("console.form.titleEdit") : t("console.form.titleNew") });
  if (desk || (id && !drive)) return <Navigate to="/app/drives" replace />;

  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const clients = org.clients || [];
  const branches = org.branches || [];
  const noSlots = !drive && driveSlotsLeft(org, drives) <= 0;
  const steps = tl("console.form.steps");
  const deskPin = drive ? String(drive.host || "").replace(/^HOST-/, "") : "";

  function pickBranch(e) {
    const b = branches.find((x) => x.id === e.target.value);
    setF((p) => ({ ...p, branchId: e.target.value, ...(b ? { city: b.city || p.city, venue: b.address || p.venue, area: b.area || p.area, landmark: b.landmark || p.landmark } : {}) }));
  }
  function toggleDoc(doc) {
    setF((p) => ({ ...p, docs: p.docs.includes(doc) ? p.docs.filter((x) => x !== doc) : [...p.docs, doc] }));
  }
  function addDoc() {
    const name = docNameOf(extraDoc);
    if (!name) { toast(t("console.form.docBad"), "err"); return; }
    if (!f.docs.includes(name)) setF((p) => ({ ...p, docs: [...p.docs, name] }));
    setExtraDoc("");
  }

  function go(next) {
    if (next > step) {
      const all = check(f);
      const e = Object.fromEntries(STEP_FIELDS.slice(0, next).flat().filter((k) => all[k]).map((k) => [k, all[k]]));
      setErrors(e);
      if (Object.keys(e).length) {
        const firstBad = STEP_FIELDS.findIndex((keys) => keys.some((k) => e[k]));
        if (firstBad !== step) setStep(firstBad);
        return;
      }
    }
    setStep(next);
    setMaxStep((m) => Math.max(m, next));
    window.scrollTo(0, 0);
  }

  function save(asDraft) {
    const e = asDraft ? (f.role.trim() ? {} : { role: t("console.form.err.role") }) : check(f);
    setErrors(e);
    if (Object.keys(e).length) {
      const bad = STEP_FIELDS.findIndex((keys) => keys.some((k) => e[k]));
      setStep(bad < 0 ? 0 : bad);
      return;
    }
    const client = clients.find((c) => c.id === f.clientId);
    const branch = branches.find((b) => b.id === f.branchId);
    const kept = f.rounds.filter((r) => r.name.trim());
    const rounds = kept.map((r) => ({ id: r.id, name: r.name.trim() }));
    const rooms = kept.flatMap((r) => r.rooms.filter((m) => m.name.trim()).map((m) => ({ id: m.id, name: m.name.trim(), interviewer: m.interviewer.trim(), roundId: r.id })));
    const fields = {
      ...f, role: f.role.trim(), jd: f.jd.trim(), endDate: f.endDate || f.date,
      payMin: num(f.payMin), payMax: num(f.payMax), expMin: Number(f.expMin), expMax: Number(f.expMax), openings: num(f.openings),
      expNeeded: Number(f.expMin) > 0, clientName: client?.name || "", branch: branch?.name || "",
      rounds: rounds.length ? rounds : DEFAULT_ROUNDS.map((r) => ({ ...r })),
      rooms: rooms.length ? rooms : DEFAULT_ROOMS.map((r) => ({ ...r })),
      draft: asDraft,
    };
    if (drive) {
      setDrives((p) => p.map((d) => (d.id !== drive.id ? d : {
        ...d, ...fields,
        candidates: d.candidates.map((c) => (c.room ? { ...c, room: fields.rooms.find((r) => r.id === c.room.id) || c.room } : c)),
      })));
      toast(t("console.form.saved"));
      nav(`/app/drives/${drive.id}`);
      return;
    }
    const nid = `d_${Date.now()}`;
    setDrives((p) => [...p, {
      id: nid, orgId: org.id, host: newHost(), gate: newGate(), desk: code(6), company: org.name, ...fields,
      candidates: [], msgs: [], seq: 0,
      brand: { name: org.short || org.name, color: org.color || BRAND_COLORS[0].hex, logo: org.logo || "letter" },
    }]);
    toast(asDraft ? t("console.form.draftSaved") : t("console.form.created"));
    nav(`/app/drives/${nid}`);
  }

  const review = [
    [steps[0], [f.role, f.roleType, [f.venue, f.area, f.city].filter(Boolean).join(", "), `${datesLabel(f)} · ${hoursLabel(f)}`].filter(Boolean)],
    [steps[1], [expLabel(f), payLabel(f), f.openings ? t("detail.openings", { n: f.openings }) : ""].filter(Boolean)],
    [steps[2], f.rounds.filter((r) => r.name.trim()).map((r) => `${r.name} · ${r.rooms.map((m) => m.name).filter(Boolean).join(", ")}`)],
    [steps[3], f.docs],
  ];

  return (
    <div style={{ maxWidth: 880 }}>
      <PageHead title={drive ? t("console.form.titleEdit") : t("console.form.titleNew")} lede={t("console.form.stepOf", { n: step + 1, total: steps.length })} />
      {noSlots && <div className="panel small" role="status" style={{ marginBottom: 20 }}>{t("console.form.noSlots")}</div>}
      <Stepper step={step} maxStep={maxStep} onPick={(i) => (i < step ? setStep(i) : go(i))} />
      <form noValidate onSubmit={(e) => { e.preventDefault(); if (step < 4) go(step + 1); else save(false); }} className="stack gap-24">
        <fieldset className="card card-pad grid-12" style={{ border: "1px solid var(--line)", rowGap: 16 }}>
          <legend className="h-4 span-12 form-legend">{steps[step]}</legend>

          {step === 0 && <>
            <F id="f-role" label={t("console.form.role")} error={errors.role} span={8}>
              <input id="f-role" className="input" value={f.role} onChange={set("role")} placeholder={t("console.form.rolePlaceholder")} aria-invalid={!!errors.role} />
            </F>
            <F id="f-roleType" label={t("console.form.roleType")} span={4}>
              <select id="f-roleType" className="select" value={f.roleType} onChange={set("roleType")}>{ROLE_TYPES.map((r) => <option key={r}>{r}</option>)}</select>
            </F>
            <F id="f-client" label={t("console.form.team")} span={12} hint={t("console.form.teamHelp")}>
              <select id="f-client" className="select" value={f.clientId} onChange={set("clientId")}>
                <option value="">{t("console.form.teamNone")}</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </F>
            {branches.length > 0 && (
              <F id="f-branch" label={t("console.form.venue")} span={12} hint={t("console.form.venueHelp")}>
                <select id="f-branch" className="select" value={f.branchId} onChange={pickBranch}>
                  <option value="">{t("console.form.venueOther")}</option>
                  {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </F>
            )}
            <F id="f-venue" label={branches.length ? t("console.form.address") : t("console.form.venue")} error={errors.venue} span={12} hint={branches.length ? null : t("console.form.venueHelp")}>
              <input id="f-venue" className="input" value={f.venue} onChange={set("venue")} placeholder={t("console.form.addressPlaceholder")} aria-invalid={!!errors.venue} />
            </F>
            <F id="f-city" label={t("console.form.city")} error={errors.city} span={4}>
              <input id="f-city" className="input" list="f-cities" value={f.city} onChange={set("city")} aria-invalid={!!errors.city} />
              <datalist id="f-cities">{CITIES.map((c) => <option key={c} value={c} />)}</datalist>
            </F>
            <F id="f-area" label={t("console.form.area")} span={4}>
              <input id="f-area" className="input" value={f.area} onChange={set("area")} placeholder={t("console.form.areaPlaceholder")} />
            </F>
            <F id="f-landmark" label={t("console.form.landmark")} span={4}>
              <input id="f-landmark" className="input" value={f.landmark} onChange={set("landmark")} placeholder={t("console.form.landmarkPlaceholder")} />
            </F>
            <p className="label span-12" style={{ margin: "8px 0 0" }}>{t("console.form.dateTime")}</p>
            <F id="f-date" label={t("console.form.starts")} error={errors.date} span={3}>
              <input id="f-date" className="input" type="date" value={f.date} onChange={(e) => setF((p) => ({ ...p, date: e.target.value, endDate: p.endDate < e.target.value ? e.target.value : p.endDate }))} />
            </F>
            <F id="f-endDate" label={t("console.form.ends")} error={errors.endDate} span={3}>
              <input id="f-endDate" className="input" type="date" min={f.date} value={f.endDate} onChange={set("endDate")} />
            </F>
            <F id="f-startTime" label={t("console.form.open")} error={errors.startTime} span={3}>
              <input id="f-startTime" className="input" type="time" value={f.startTime} onChange={set("startTime")} />
            </F>
            <F id="f-endTime" label={t("console.form.close")} span={3}>
              <input id="f-endTime" className="input" type="time" value={f.endTime} onChange={set("endTime")} />
            </F>
          </>}

          {step === 1 && <>
            <p className="label span-12" style={{ margin: 0 }}>{t("console.form.experience")}</p>
            <F id="f-expMin" label={t("console.form.expMin")} span={6}>
              <input id="f-expMin" className="input" type="number" min="0" max="30" value={f.expMin} onChange={set("expMin")} />
            </F>
            <F id="f-expMax" label={t("console.form.expMax")} error={errors.expMax} span={6}>
              <input id="f-expMax" className="input" type="number" min="0" max="30" value={f.expMax} onChange={set("expMax")} />
            </F>
            <p className="label span-12" style={{ margin: "8px 0 0" }}>{t("console.form.pay")}</p>
            <F id="f-payMin" label={t("console.form.payMin")} span={6}>
              <input id="f-payMin" className="input" type="number" inputMode="numeric" min="0" step="500" value={f.payMin} onChange={set("payMin")} placeholder="18000" />
            </F>
            <F id="f-payMax" label={t("console.form.payMax")} error={errors.payMax} span={6}>
              <input id="f-payMax" className="input" type="number" inputMode="numeric" min="0" step="500" value={f.payMax} onChange={set("payMax")} placeholder="25000" />
            </F>
            <F id="f-openings" label={t("console.form.openings")} span={6}>
              <input id="f-openings" className="input" type="number" min="1" value={f.openings} onChange={set("openings")} />
            </F>
            <F id="f-jd" label={t("console.form.about")} error={errors.jd} span={12} hint={t("console.form.aboutHelp")}>
              <textarea id="f-jd" className="textarea" rows={5} value={f.jd} onChange={set("jd")} aria-invalid={!!errors.jd} />
            </F>
          </>}

          {step === 2 && (
            <div className="span-12">
              <RoundsEditor rounds={f.rounds} setRounds={(rounds) => setF((p) => ({ ...p, rounds }))} error={errors.rounds} />
            </div>
          )}

          {step === 3 && (
            <div className="span-12 stack gap-12">
              <div className="wrap-row gap-8">
                {[...new Set([...DOC_OPTIONS, ...f.docs])].map((doc) => (
                  <label key={doc} className="filter-opt check" style={{ border: "1px solid var(--line)", borderRadius: 999, padding: "8px 14px" }}>
                    <input type="checkbox" checked={f.docs.includes(doc)} onChange={() => toggleDoc(doc)} /> {doc}
                  </label>
                ))}
              </div>
              <div className="row gap-8" style={{ maxWidth: 480 }}>
                <label className="sr-only" htmlFor="f-extraDoc">{t("console.form.docCustom")}</label>
                <input id="f-extraDoc" className="input" value={extraDoc} onChange={(e) => setExtraDoc(e.target.value)} placeholder={t("console.form.docCustom")} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addDoc(); } }} />
                <Btn variant="secondary" icon={Plus} onClick={addDoc}>{t("console.form.docAdd")}</Btn>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="span-12 stack gap-16">
              <p className="body muted" style={{ margin: 0 }}>{t("console.form.review")}</p>
              {review.map(([title, lines], i) => (
                <div key={title} className="panel row between gap-12" style={{ padding: 16, alignItems: "flex-start" }}>
                  <div className="stack gap-4">
                    <span className="strong">{title}</span>
                    {lines.map((l) => <span key={l} className="small muted">{l}</span>)}
                  </div>
                  <Btn size="sm" variant="ghost" onClick={() => setStep(i)}>{t("console.form.edit")}</Btn>
                </div>
              ))}
              <label className="check" style={{ alignItems: "flex-start" }}>
                <input type="checkbox" checked={f.visibility !== "private"} onChange={(e) => setF((p) => ({ ...p, visibility: e.target.checked ? "public" : "private" }))} />
                <span><span className="strong">{t("console.form.public")}</span><br /><span className="small muted">{t("console.form.publicHelp")}</span></span>
              </label>
              <div className="stack gap-4">
                <span className="strong">{t("console.form.deskPin")}{deskPin && <span className="mono" style={{ marginLeft: 10, letterSpacing: "0.08em" }}>{deskPin}</span>}</span>
                <span className="small muted">{deskPin ? t("console.form.deskPinHelp") : `${t("console.form.deskPinHelp")} ${t("console.form.deskPinLater")}`}</span>
              </div>
            </div>
          )}
        </fieldset>

        <div className="row gap-8" style={{ flexWrap: "wrap" }}>
          {step > 0 && <Btn variant="secondary" size="lg" icon={ChevronLeft} onClick={() => setStep(step - 1)}>{t("buttons.back")}</Btn>}
          {step < 4
            ? <Btn type="submit" size="lg" iconRight={ChevronRight}>{t("buttons.next")}</Btn>
            : <Btn type="submit" size="lg" disabled={noSlots}>{drive ? t("console.form.save") : t("console.form.publish")}</Btn>}
          <Btn variant="ghost" size="lg" onClick={() => save(true)} disabled={noSlots}>{t("console.form.saveDraft")}</Btn>
          <Btn variant="ghost" size="lg" icon={X} onClick={() => nav(drive ? `/app/drives/${drive.id}` : "/app/drives")}>{t("buttons.cancel")}</Btn>
        </div>
      </form>
    </div>
  );
}
