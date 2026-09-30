import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus, Trash2, X } from "lucide-react";
import { Btn, STROKE, useToast } from "../../components/ds.jsx";
import Creatable, { TagSelect } from "../../components/Creatable.jsx";
import WhenFields from "../../components/WhenFields.jsx";
import { PageHead, useConsole } from "../../layouts/ConsoleLayout.jsx";
import { useMeta } from "../../hooks/useMeta.js";
import { useLibrary } from "../../hooks/useLibrary.js";
import { HERO_CITIES, PAY_TYPES, expLabel, payText } from "../../lib/listing.js";
import { hoursLabel, datesLabel, istDate, utcWindowFields } from "../../lib/status.js";
import { formatIST } from "../../lib/time.js";
import {
  BRAND_COLORS, DEFAULT_ROOMS, DEFAULT_ROUNDS, code, driveSlotsLeft, newGate, newHost,
} from "../../lib/helpers.js";
import {
  FIELD_TYPES, ROLE_TAG_STARTER, activeItems, addItem, driveDocuments, driveRoles, findItem, roleCode, rolesMirror, uid, withNewItems,
} from "../../lib/library.js";
import { t, tl } from "../../i18n/strings.js";
import { resumeIsRequired } from "../../lib/resume.js";
import { formatInr, parseInr, whenFieldErrors } from "../../lib/when.js";

const CITIES = [...HERO_CITIES, "Noida", "Gurgaon", "Kolkata", "Ahmedabad", "Kochi", "Jaipur", "Coimbatore", "Indore"];
const num = (v) => (v === "" || v == null ? "" : Number(v));
const LAST = 4;

function roundsFrom(rounds, rooms) {
  const first = rounds[0]?.id;
  return rounds.map((r) => ({
    id: r.id,
    libId: r.libId || "",
    name: r.name,
    roleIds: r.roleIds || [],
    pass: r.pass || "",
    rooms: rooms.filter((rm) => (rm.roundId || first) === r.id).map((rm) => ({ id: rm.id, name: rm.name, interviewer: rm.interviewer || "" })),
  }));
}

// Placeholder from, placeholder to, and input step for each pay type.
const PAY_HINTS = {
  month: ["18000", "25000", 500],
  day: ["700", "900", 50],
  hour: ["120", "180", 10],
  task: ["30", "45", 1],
  year: ["300000", "450000", 10000],
  fixed: ["15000", "18000", 500],
};

const blankRole = () => ({ id: uid("dr"), roleId: "", title: "", openings: 10, expMin: 0, expMax: 2, payType: "month", payMin: "", payMax: "", notes: "", fresherWelcome: false });

/** Token codes follow the titles, and stay unique within the drive. */
function withCodes(roles) {
  const taken = [];
  return roles.map((r) => {
    const c = roleCode(r.title, taken);
    taken.push(c);
    return { ...r, code: c };
  });
}

function blank() {
  return {
    processId: "", processName: "", roleTags: [], branchId: "",
    city: "", venue: "", area: "", landmark: "",
    date: istDate(1), endDate: istDate(1), startTime: "10:00", endTime: "16:00",
    doorsOpenTime: "09:30", lastEntryTime: "15:30",
    multiDay: false, doorsTouched: false, lastTouched: false,
    roles: [blankRole()],
    jd: "", summary: "", duties: [""], eligibility: [""], perks: [], languages: [],
    fresherWelcome: false, locationCheck: true, locationRadius: 300, requireLocation: false,
    venueLat: "", venueLng: "", documents: [],
    fields: [], visibility: "public", resumeRequired: true,
    rounds: roundsFrom(DEFAULT_ROUNDS, DEFAULT_ROOMS),
  };
}

function fromDrive(d) {
  const tags = (d.roleTags || (d.roleType ? [d.roleType] : [])).filter(Boolean);
  return {
    processId: d.clientId || "", processName: d.clientName || "", roleTags: tags, branchId: d.branchId || "",
    city: d.city || "", venue: d.venue || "", area: d.area || "", landmark: d.landmark || "",
    date: d.date || "", endDate: d.endDate || d.date || "", startTime: d.startTime || "10:00", endTime: d.endTime || "16:00",
    doorsOpenTime: d.doorsOpenTime || d.startTime || "10:00", lastEntryTime: d.lastEntryTime || d.endTime || "16:00",
    multiDay: !!(d.endDate && d.endDate !== d.date), doorsTouched: true, lastTouched: true,
    roles: driveRoles(d).map((r) => ({ ...blankRole(), ...r, id: r.id === "main" ? uid("dr") : r.id, payMin: r.payMin ?? "", payMax: r.payMax ?? "", openings: r.openings ?? "" })),
    jd: d.jd || d.summary || "", summary: d.summary || String(d.jd || "").slice(0, 280),
    duties: d.duties?.length ? d.duties : [""], eligibility: d.eligibility?.length ? d.eligibility : [""],
    perks: d.perks || [], languages: d.languages || [],
    fresherWelcome: !!d.fresherWelcome, locationCheck: d.locationCheck !== false,
    locationRadius: d.locationRadius || 300, requireLocation: !!d.requireLocation,
    venueLat: d.venueLat ?? "", venueLng: d.venueLng ?? "",
    documents: driveDocuments(d).map((x) => ({ ...x })),
    fields: (d.fields || []).map((x) => ({ ...x, optionsText: (x.options || []).join(", ") })),
    visibility: d.visibility || "public", resumeRequired: resumeIsRequired(d),
    rounds: roundsFrom(d.rounds || [], d.rooms || []),
  };
}

const optionsOf = (text) => [...new Set(String(text || "").split(",").map((s) => s.trim()).filter(Boolean))].slice(0, 20);

const STEP_FIELDS = [
  ["processName", "roles", "city", "venue", "date", "endDate", "startTime", "endTime", "doorsOpenTime", "lastEntryTime"],
  ["summary"],
  ["rounds"],
  ["fields"],
  [],
];

function check(f) {
  const e = whenFieldErrors(f);
  if (!f.processName.trim()) e.processName = t("console.form.err.hiringTeam");
  if (!f.city.trim()) e.city = t("console.form.err.city");
  if (f.venue.trim().length < 5) e.venue = t("console.form.err.venue");
  f.roles.some((r, i) => {
    const msg = r.title.trim().length < 3 ? t("console.form.err.role")
      : r.payMin !== "" && r.payMax !== "" && Number(r.payMax) < Number(r.payMin) ? t("console.form.err.payMax")
        : Number(r.expMax) < Number(r.expMin) ? t("console.form.err.expMax") : "";
    if (msg) e.roles = f.roles.length > 1 ? t("console.form.err.roleN", { n: i + 1, msg }) : msg;
    return !!msg;
  });
  const summary = (f.summary || f.jd || "").trim();
  if (summary.length < 20 || summary.length > 280) e.summary = t("console.form.err.jd");
  if (!f.rounds.some((r) => r.name.trim() && r.rooms.some((rm) => rm.name.trim()))) e.rounds = t("console.form.err.rounds");
  if (f.fields.some((x) => !x.label.trim() || (x.type === "dropdown" && optionsOf(x.optionsText).length < 2))) e.fields = t("console.form.err.fields");
  return e;
}

function F({ id, label, error, hint, children, span = 6 }) {
  return (
    <div className={`field span-${span}`}>
      <label className="label" htmlFor={id}>{label}</label>
      {children}
      {error ? <p className="tiny" role="alert" style={{ color: "var(--danger)", margin: 0 }}>{error}</p>
        : hint ? <p className="tiny muted" id={`${id}-hint`} style={{ margin: 0 }}>{hint}</p> : null}
    </div>
  );
}

function BulletList({ id, label, rows, onChange, optional }) {
  const set = (i, v) => onChange(rows.map((x, n) => (n === i ? v : x)));
  const add = () => onChange([...rows, ""]);
  const drop = (i) => onChange(rows.filter((_, n) => n !== i));
  return (
    <F id={id} label={label} span={12}>
      <div className="stack gap-8">
        {rows.map((row, i) => (
          <div key={`${id}-${i}`} className="row gap-8">
            <input className="input grow" value={row} placeholder={t("console.form.bulletPh")} onChange={(e) => set(i, e.target.value)} />
            {rows.length > 1 && <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={() => drop(i)} aria-label={t("console.form.removeField")}><X size={16} strokeWidth={STROKE} /></button>}
          </div>
        ))}
        <Btn variant="ghost" size="sm" icon={Plus} onClick={add}>{t("console.form.bulletAdd")}</Btn>
        {optional && <p className="tiny muted" style={{ margin: 0 }}>{t("console.form.perks")}</p>}
      </div>
    </F>
  );
}

function Stepper({ step, onPick, errors }) {
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
          <button type="button" className="chip" aria-current={i === step ? "step" : undefined} aria-pressed={i === step} onClick={() => onPick(i)}>
            <span className="mono" style={{ opacity: 0.6, marginRight: 6 }}>{i + 1}</span>{label}
            {STEP_FIELDS[i]?.some((k) => errors[k]) ? <span className="step-err" aria-label={t("console.form.err.role")} /> : null}
          </button>
        </li>
      ))}
    </ol>
  );
}

function RoleCard({ r, i, count, lib, processId, showAll, onChange, onRemove, onCreate }) {
  const set = (k) => (e) => onChange({ [k]: e.target.value });
  const procName = (id) => lib.processes.find((p) => p.id === id)?.name || "";
  const pool = activeItems(lib, "roles").filter((x) => showAll || !processId || !x.processId || x.processId === processId);
  const options = pool.map((x) => ({ id: x.id, label: x.title, hint: procName(x.processId), item: x }));
  const pick = (o) => {
    const x = o.item;
    const fresh = r.payMin === "" && r.payMax === "";
    onChange({
      roleId: x.id, title: x.title,
      ...(fresh && x.payType ? { payType: x.payType, payMin: x.payMin ?? "", payMax: x.payMax ?? "" } : {}),
      ...(fresh && x.expMax != null ? { expMin: x.expMin ?? 0, expMax: x.expMax } : {}),
    });
  };
  const p = `r${i}`;
  return (
    <div className="role-card grid-12" style={{ rowGap: 14 }}>
      <div className="span-12 row between gap-8">
        <span className="strong">{t("console.form.roleN", { n: i + 1 })}</span>
        {count > 1 && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={onRemove}>{t("console.form.removeRole")}</button>
        )}
      </div>
      <F id={`${p}-title`} label={t("console.form.role")} span={12} hint={t("console.form.roleHelp")}>
              <Creatable id={`${p}-title`} value={r.title} options={options} placeholder={t("console.form.rolePlaceholder")}
          onChange={(title) => onChange({ title, roleId: "" })} onPick={pick}
          onCreate={(text) => { const item = onCreate(text); if (item) onChange({ roleId: item.id, title: item.title }); }}
          describedBy={`${p}-title-hint`} />
      </F>
      <F id={`${p}-openings`} label={t("console.form.openings")} span={4}>
        <div className="stepper">
          <button type="button" className="btn btn-secondary btn-icon btn-sm" onClick={() => onChange({ openings: Math.max(1, (Number(r.openings) || 1) - 1) })}>−</button>
          <input id={`${p}-openings`} className="input input-no-spin" inputMode="numeric" value={r.openings}
            onChange={(e) => onChange({ openings: e.target.value.replace(/\D/g, "") })} />
          <button type="button" className="btn btn-secondary btn-icon btn-sm" onClick={() => onChange({ openings: (Number(r.openings) || 0) + 1 })}>+</button>
        </div>
      </F>
      <F id={`${p}-expMin`} label={t("console.form.expMin")} span={4}>
        <input id={`${p}-expMin`} className="input input-no-spin" inputMode="numeric" min="0" max="30" value={r.expMin} onChange={set("expMin")} />
      </F>
      <F id={`${p}-expMax`} label={t("console.form.expMax")} span={4}>
        <input id={`${p}-expMax`} className="input input-no-spin" inputMode="numeric" min="0" max="30" value={r.expMax} onChange={set("expMax")} />
      </F>
      <label className="check-inline span-12">
        <input type="checkbox" checked={!!r.fresherWelcome}
          onChange={(e) => onChange({ fresherWelcome: e.target.checked, ...(e.target.checked ? { expMin: 0 } : {}) })} />
        {t("console.form.fresher")}
        {r.fresherWelcome && <span className="chip chip-sm" style={{ marginLeft: 8 }}>{t("console.form.fresher")}</span>}
      </label>
      <div className="span-12 stack gap-4">
        <p className="label" style={{ margin: 0 }}>{t("console.form.pay")}</p>
        {i === 0 && <p className="small muted" style={{ margin: 0 }}>{t("console.form.payHelp")}</p>}
      </div>
      <F id={`${p}-payType`} label={t("console.form.payType")} span={4}>
        <select id={`${p}-payType`} className="select" value={r.payType} onChange={set("payType")}>
          {PAY_TYPES.map((k) => <option key={k} value={k}>{t(`console.form.payTypes.${k}`)}</option>)}
        </select>
      </F>
      <F id={`${p}-payMin`} label={t("console.form.payMin")} span={4}>
        <div className="inr-field">
          <span>₹</span>
          <input id={`${p}-payMin`} className="input" inputMode="numeric" value={formatInr(r.payMin)}
            onChange={(e) => onChange({ payMin: parseInr(e.target.value) })} placeholder={formatInr(PAY_HINTS[r.payType][0]) || "18,000"} />
        </div>
      </F>
      <F id={`${p}-payMax`} label={t("console.form.payMax")} span={4}>
        <div className="inr-field">
          <span>₹</span>
          <input id={`${p}-payMax`} className="input" inputMode="numeric" value={formatInr(r.payMax)}
            onChange={(e) => onChange({ payMax: parseInr(e.target.value) })} placeholder={formatInr(PAY_HINTS[r.payType][1]) || "25,000"} />
        </div>
      </F>
      <F id={`${p}-notes`} label={t("console.form.roleNotes")} span={12}>
        <input id={`${p}-notes`} className="input" value={r.notes} onChange={set("notes")} placeholder={t("console.form.roleNotesPlaceholder")} maxLength={140} />
      </F>
    </div>
  );
}

function RoundsEditor({ rounds, setRounds, roles, lib, onCreate, error }) {
  const upd = (ri, patch) => setRounds(rounds.map((r, i) => (i === ri ? { ...r, ...patch } : r)));
  const updRoom = (ri, mi, patch) => upd(ri, { rooms: rounds[ri].rooms.map((m, j) => (j === mi ? { ...m, ...patch } : m)) });
  const options = activeItems(lib, "rounds").map((x) => ({ id: x.id, label: x.name }));
  const named = roles.filter((r) => r.title.trim());
  const toggleRole = (ri, roleId) => {
    const cur = rounds[ri].roleIds || [];
    upd(ri, { roleIds: cur.includes(roleId) ? cur.filter((x) => x !== roleId) : [...cur, roleId] });
  };
  return (
    <div className="stack gap-16">
      {rounds.map((r, ri) => (
        <div key={r.id} className="panel stack gap-12" style={{ padding: 18 }}>
          <div className="row gap-8" style={{ alignItems: "flex-end" }}>
            <div className="field grow">
              <label className="label" htmlFor={`r-${r.id}`}>{t("console.form.roundN", { n: ri + 1 })} · {t("console.form.roundName")}</label>
              <Creatable id={`r-${r.id}`} value={r.name} options={options}
                onChange={(name) => upd(ri, { name, libId: "" })} onPick={(o) => upd(ri, { name: o.label, libId: o.id })}
                onCreate={(text) => { const item = onCreate(text); if (item) upd(ri, { name: item.name, libId: item.id }); }} />
            </div>
            {rounds.length > 1 && (
              <button type="button" className="btn btn-ghost btn-icon" aria-label={t("console.form.removeRound")} onClick={() => setRounds(rounds.filter((_, i) => i !== ri))}>
                <Trash2 size={18} strokeWidth={STROKE} />
              </button>
            )}
          </div>
          {named.length > 1 && (
            <fieldset className="stack gap-8" style={{ border: 0, padding: 0, margin: 0 }}>
              <legend className="label" style={{ marginBottom: 8 }}>{t("console.form.appliesTo")}</legend>
              <div className="wrap-row gap-8">
                <button type="button" className="chip" aria-pressed={!(r.roleIds || []).length} onClick={() => upd(ri, { roleIds: [] })}>{t("console.form.appliesAll")}</button>
                {named.map((role) => (
                  <button key={role.id} type="button" className="chip" aria-pressed={(r.roleIds || []).includes(role.id)} onClick={() => toggleRole(ri, role.id)}>{role.title}</button>
                ))}
              </div>
            </fieldset>
          )}
          <div className="field">
            <label className="label" htmlFor={`rp-${r.id}`}>{t("console.form.passCriteria")}</label>
            <input id={`rp-${r.id}`} className="input" value={r.pass} maxLength={140} placeholder={t("console.form.passPlaceholder")} onChange={(e) => upd(ri, { pass: e.target.value })} />
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
      <div><Btn variant="secondary" icon={Plus} onClick={() => setRounds([...rounds, { id: uid("r"), libId: "", name: "", roleIds: [], pass: "", rooms: [{ id: uid("rm"), name: "", interviewer: "" }] }])}>{t("console.form.addRound")}</Btn></div>
    </div>
  );
}

function DocumentsEditor({ documents, setDocuments, lib, onCreate, toast }) {
  const [text, setText] = useState("");
  const chosen = new Set(documents.map((d) => d.label.toLowerCase()));
  const free = activeItems(lib, "documents").filter((d) => !chosen.has(d.label.toLowerCase()));
  const addRow = (item) => {
    if (chosen.has(item.label.toLowerCase())) return;
    setDocuments([...documents, { id: uid("dd"), docId: item.id, label: item.label, required: false }]);
    setText("");
  };
  return (
    <div className="stack gap-12">
      {documents.length ? (
        <div className="card" style={{ padding: 0 }}>
          {documents.map((d) => (
            <div key={d.id} className="lib-row">
              <span className="lib-name">{d.label}</span>
              <label className="check-inline">
                <input type="checkbox" checked={!!d.required} onChange={(e) => setDocuments(documents.map((x) => (x.id === d.id ? { ...x, required: e.target.checked } : x)))} />
                {d.required ? t("console.form.docRequired") : t("console.form.docHave")}
              </label>
              <button type="button" className="btn btn-ghost btn-icon btn-sm" aria-label={t("console.form.docRemove", { label: d.label })} onClick={() => setDocuments(documents.filter((x) => x.id !== d.id))}>
                <X size={16} strokeWidth={STROKE} />
              </button>
            </div>
          ))}
        </div>
      ) : <p className="small muted" style={{ margin: 0 }}>{t("console.form.docNone")}</p>}
      <div className="field" style={{ maxWidth: 480 }}>
        <label className="label" htmlFor="f-doc">{t("console.form.docAddLabel")}</label>
        <Creatable id="f-doc" value={text} onChange={setText} options={free.map((d) => ({ id: d.id, label: d.label, item: d }))}
          onPick={(o) => addRow(o.item)} placeholder={t("console.form.docCustom")}
          onCreate={(raw) => { const item = onCreate(raw); if (item) addRow(item); else toast(t("console.form.docBad"), "err"); }} />
      </div>
      {free.length > 0 && (
        <div className="wrap-row gap-8" aria-label={t("console.form.docSuggest")}>
          {free.slice(0, 8).map((d) => (
            <button key={d.id} type="button" className="chip" onClick={() => addRow(d)}><Plus size={14} strokeWidth={STROKE} aria-hidden="true" />{d.label}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function FieldsEditor({ fields, setFields, error }) {
  const upd = (id, patch) => setFields(fields.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  return (
    <div className="stack gap-12">
      {fields.map((x) => (
        <div key={x.id} className="panel grid-12" style={{ padding: 16, rowGap: 12 }}>
          <F id={`q-${x.id}`} label={t("console.form.fieldLabel")} span={6}>
            <input id={`q-${x.id}`} className="input" value={x.label} maxLength={60} placeholder={t("console.form.fieldLabelPlaceholder")} onChange={(e) => upd(x.id, { label: e.target.value })} />
          </F>
          <F id={`qt-${x.id}`} label={t("console.form.fieldType")} span={4}>
            <select id={`qt-${x.id}`} className="select" value={x.type} onChange={(e) => upd(x.id, { type: e.target.value })}>
              {FIELD_TYPES.map((k) => <option key={k} value={k}>{t(`console.form.fieldTypes.${k}`)}</option>)}
            </select>
          </F>
          <div className="span-2 row gap-4" style={{ alignItems: "flex-end", justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-ghost btn-icon" aria-label={t("console.form.removeField")} onClick={() => setFields(fields.filter((f) => f.id !== x.id))}>
              <Trash2 size={18} strokeWidth={STROKE} />
            </button>
          </div>
          {x.type === "dropdown" && (
            <F id={`qo-${x.id}`} label={t("console.form.fieldOptions")} span={12}>
              <input id={`qo-${x.id}`} className="input" value={x.optionsText || ""} placeholder={t("console.form.fieldOptionsPlaceholder")} onChange={(e) => upd(x.id, { optionsText: e.target.value })} />
            </F>
          )}
          <label className="check-inline span-12">
            <input type="checkbox" checked={!!x.required} onChange={(e) => upd(x.id, { required: e.target.checked })} />
            {t("console.form.fieldRequired")}
          </label>
        </div>
      ))}
      {error && <p className="small" role="alert" style={{ color: "var(--danger)", margin: 0 }}>{error}</p>}
      <div><Btn variant="secondary" icon={Plus} onClick={() => setFields([...fields, { id: uid("cf"), label: "", type: "text", optionsText: "", required: false }])}>{t("console.form.addField")}</Btn></div>
    </div>
  );
}

export default function DriveFormPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const { org, desk, drives, setDrives, setOrgs } = useConsole();
  const { lib, update, add } = useLibrary();
  const drive = id ? drives.find((d) => d.id === id && d.orgId === org.id) : null;
  const [f, setF] = useState(() => (drive ? fromDrive(drive) : blank()));
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(0);
  const [showAllRoles, setShowAllRoles] = useState(false);
  const [venueOpen, setVenueOpen] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [draftId, setDraftId] = useState(drive?.id || "");
  const tagHints = useMemo(() => [...new Set([...ROLE_TAG_STARTER, ...drives.filter((d) => d.orgId === org.id).flatMap((d) => d.roleTags || (d.roleType ? [d.roleType] : []))])], [drives, org.id]);
  useMeta({ title: drive ? t("console.form.titleEdit") : t("console.form.titleNew") });

  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const branches = org.branches || [];
  const noSlots = !drive && driveSlotsLeft(org, drives) <= 0;
  const steps = tl("console.form.steps");
  const deskPin = drive ? String(drive.host || "").replace(/^HOST-/, "") : "";
  const coded = withCodes(f.roles);

  function pickBranch(id) {
    const b = branches.find((x) => x.id === id);
    setF((p) => ({ ...p, branchId: id, ...(b ? { city: b.city || p.city, venue: b.address || p.venue, area: b.area || p.area, landmark: b.landmark || p.landmark } : {}) }));
    setVenueOpen(false);
  }
  const setRole = (rid, patch) => setF((p) => ({ ...p, roles: p.roles.map((r) => (r.id === rid ? { ...r, ...patch } : r)) }));
  const removeRole = (rid) => setF((p) => ({ ...p, roles: p.roles.filter((r) => r.id !== rid), rounds: p.rounds.map((r) => ({ ...r, roleIds: (r.roleIds || []).filter((x) => x !== rid) })) }));
  const processId = f.processId || findItem(lib, "processes", f.processName)?.id || "";
  const touch = (k) => {
    setErrors((e) => ({ ...e, [k]: check(f)[k] }));
  };

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
    window.scrollTo(0, 0);
  }

  // Anything typed but not picked from the library is added to it now, so it can be reused.
  function linkLibrary() {
    let l = lib;
    const put = (kind, text, extra) => { const r = addItem(l, kind, text, extra); l = r.lib; return r.item; };
    const proc = f.processName.trim() ? put("processes", f.processName) : null;
    const roles = withCodes(f.roles.filter((r) => r.title.trim())).map((r) => {
      const item = put("roles", r.title, { processId: proc?.id || "" });
      if (item && item.payType === undefined && (r.payMin !== "" || r.payMax !== "")) {
        const defaults = { payType: r.payType, payMin: num(r.payMin), payMax: num(r.payMax), expMin: Number(r.expMin) || 0, expMax: Number(r.expMax) || 0 };
        l = { ...l, roles: l.roles.map((x) => (x.id === item.id ? { ...x, ...defaults } : x)) };
      }
      return { ...r, title: r.title.trim(), roleId: item?.id || r.roleId, openings: num(r.openings), expMin: Number(r.expMin) || 0, expMax: Number(r.expMax) || 0, payMin: num(r.payMin), payMax: num(r.payMax), notes: r.notes.trim() };
    });
    const rounds = f.rounds.filter((r) => r.name.trim()).map((r) => ({ ...r, name: r.name.trim(), libId: put("rounds", r.name)?.id || r.libId }));
    const documents = f.documents.map((d) => ({ ...d, docId: put("documents", d.label)?.id || d.docId }));
    if (l !== lib) update((cur) => withNewItems(cur, l));
    return { proc, roles, rounds, documents };
  }

  function save(asDraft, silent) {
    const e = asDraft ? (f.processName.trim() && f.roles.some((r) => r.title.trim()) ? {} : { ...(f.processName.trim() ? {} : { processName: t("console.form.err.hiringTeam") }), ...(f.roles.some((r) => r.title.trim()) ? {} : { roles: t("console.form.err.role") }) }) : check(f);
    if (Object.keys(e).length) {
      if (!silent) {
        setErrors(e);
        const bad = STEP_FIELDS.findIndex((keys) => keys.some((k) => e[k]));
        setStep(bad < 0 ? 0 : bad);
      }
      return;
    }
    setErrors({});
    const branch = branches.find((b) => b.id === f.branchId);
    const { proc, roles, rounds: kept, documents } = linkLibrary();
    const roleIds = new Set(roles.map((r) => r.id));
    const rounds = kept.map((r) => ({ id: r.id, libId: r.libId, name: r.name, roleIds: (r.roleIds || []).filter((x) => roleIds.has(x)), pass: r.pass.trim() }));
    const rooms = kept.flatMap((r) => r.rooms.filter((m) => m.name.trim()).map((m) => ({ id: m.id, name: m.name.trim(), interviewer: m.interviewer.trim(), roundId: r.id })));
    const rest = { ...f };
    delete rest.processId;
    delete rest.processName;
    delete rest.multiDay;
    delete rest.doorsTouched;
    delete rest.lastTouched;
    const fields = {
      ...rest, ...rolesMirror(roles), roles,
      summary: (f.summary || f.jd).trim().slice(0, 280), jd: (f.summary || f.jd).trim(),
      duties: (f.duties || []).map((x) => x.trim()).filter(Boolean),
      eligibility: (f.eligibility || []).map((x) => x.trim()).filter(Boolean),
      perks: (f.perks || []).map((x) => x.trim()).filter(Boolean),
      languages: f.languages || [], fresherWelcome: !!f.fresherWelcome,
      locationCheck: f.locationCheck !== false, locationRadius: Math.min(500, Math.max(150, Number(f.locationRadius) || 300)),
      requireLocation: !!f.requireLocation,
      venueLat: f.venueLat === "" ? null : Number(f.venueLat),
      venueLng: f.venueLng === "" ? null : Number(f.venueLng),
      aboutCompany: org.about || "", companyWebsite: org.website || "", hiringTeamName: org.hiringTeamName || "",
      endDate: f.endDate || f.date,
      roleTags: f.roleTags || [], roleType: (f.roleTags || [])[0] || "",
      clientId: proc?.id || "", clientName: proc?.name || "", branch: branch?.name || "",
      documents, docs: documents.map((d) => d.label),
      fields: f.fields.map(({ optionsText, ...x }) => ({ ...x, label: x.label.trim(), options: x.type === "dropdown" ? optionsOf(optionsText) : [] })),
      rounds: rounds.length ? rounds : DEFAULT_ROUNDS.map((r) => ({ ...r })),
      rooms: rooms.length ? rooms : DEFAULT_ROOMS.map((r) => ({ ...r })),
      draft: asDraft,
      ...utcWindowFields({
        date: f.date, endDate: f.endDate || f.date, startTime: f.startTime, endTime: f.endTime,
        doorsOpenTime: f.doorsOpenTime, lastEntryTime: f.lastEntryTime,
      }),
    };
    const existing = drive || (draftId && drives.find((d) => d.id === draftId));
    if (existing) {
      setDrives((p) => p.map((d) => (d.id !== existing.id ? d : {
        ...d, ...fields,
        candidates: (d.candidates || []).map((c) => (c.room ? { ...c, room: fields.rooms.find((r) => r.id === c.room.id) || c.room } : c)),
      })));
      setSavedAt(Date.now());
      if (!silent) { toast(t("console.form.saved")); nav(`/app/drives/${existing.id}`); }
      return;
    }
    const nid = `d_${Date.now()}`;
    setDraftId(nid);
    setDrives((p) => [...p, {
      id: nid, orgId: org.id, host: newHost(), gate: newGate(), desk: code(6), company: org.name, ...fields,
      candidates: [], msgs: [], seq: 0,
      brand: { name: org.short || org.name, color: org.color || BRAND_COLORS[0].hex, logo: org.logo || "letter" },
    }]);
    setSavedAt(Date.now());
    if (!silent) {
      toast(asDraft ? t("console.form.draftSaved") : t("console.form.created"));
      nav(`/app/drives/${nid}`);
    }
  }

  const roleName = (rid) => coded.find((r) => r.id === rid)?.title;
  const review = [
    [steps[0], [f.processName, (f.roleTags || []).join(", "), [f.venue, f.area, f.city].filter(Boolean).join(", "), `${datesLabel(f)} · ${hoursLabel(f)}`].filter(Boolean)],
    [steps[1], coded.filter((r) => r.title.trim()).map((r) => [`${r.code} · ${r.title}`, expLabel(r), payText(r), r.openings ? t("detail.openings", { n: r.openings }) : ""].filter(Boolean).join(" · "))],
    [steps[2], f.rounds.filter((r) => r.name.trim()).map((r) => [r.name, r.rooms.map((m) => m.name).filter(Boolean).join(", "), (r.roleIds || []).length ? r.roleIds.map(roleName).filter(Boolean).join(", ") : ""].filter(Boolean).join(" · "))],
    [steps[3], [
      ...f.documents.map((d) => (d.required ? `${d.label} (${t("console.form.docRequiredTag")})` : d.label)),
      ...f.fields.filter((x) => x.label.trim()).map((x) => `${t("console.form.fieldReview")}: ${x.label}${x.required ? ` (${t("console.form.docRequiredTag")})` : ""}`),
      f.resumeRequired ? t("console.form.resumeRequired") : "",
    ].filter(Boolean)],
  ];

  useEffect(() => {
    const snap = JSON.stringify(f);
    const tmr = setTimeout(() => { save(true, true); }, 1400);
    return () => clearTimeout(tmr);
    // Autosave when the form text changes, not when save() is recreated.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(f)]);

  if (desk || (id && !drive && !draftId)) return <Navigate to="/app/drives" replace />;

  const pickedVenue = branches.find((b) => b.id === f.branchId);
  const processes = activeItems(lib, "processes");

  return (
    <div style={{ maxWidth: 880 }}>
      <PageHead title={drive ? t("console.form.titleEdit") : t("console.form.titleNew")} lede={t("console.form.stepOf", { n: step + 1, total: steps.length })} />
      {savedAt && <p className="tiny muted" style={{ margin: "-12px 0 16px" }}>{t("console.form.draftSavedAt", { time: formatIST(savedAt, { time: true }).replace(" IST", "") })}</p>}
      {noSlots && <div className="panel small" role="status" style={{ marginBottom: 20 }}>{t("console.form.noSlots")}</div>}
      <Stepper step={step} errors={errors} onPick={(i) => go(i)} />
      <form noValidate onSubmit={(e) => { e.preventDefault(); if (step < LAST) go(step + 1); else save(false); }} className="stack gap-24">
        <fieldset className="card card-pad grid-12" style={{ border: "1px solid var(--line)", rowGap: 16 }}>
          <h2 className="h-4 span-12 form-card-title">{steps[step]}</h2>

          {step === 0 && <>
            <F id="f-process" label={t("console.form.hiringTeam")} span={12} hint={t("console.form.hiringTeamHelp")} error={errors.processName}>
              <Creatable id="f-process" value={f.processName} describedBy="f-process-hint" invalid={!!errors.processName}
                options={processes.map((x) => ({ id: x.id, label: x.name }))}
                placeholder={processes.length ? t("console.form.processPlaceholder") : t("console.form.hiringTeamFirst")}
                onChange={(processName) => setF((p) => ({ ...p, processName, processId: "" }))}
                onPick={(o) => setF((p) => ({ ...p, processName: o.label, processId: o.id }))}
                onCreate={(text) => { const item = add("processes", text); if (item) setF((p) => ({ ...p, processName: item.name, processId: item.id })); }} />
            </F>
            <WhenFields f={f} setF={setF} errors={errors} onTouch={touch} />
            <F id="f-branch" label={t("console.form.venue")} span={12} hint={t("console.form.venueHelp")} error={errors.venue}>
              <Creatable id="f-branch" value={pickedVenue?.name || f.venue} options={branches.map((b) => ({ id: b.id, label: b.name, item: b }))}
                placeholder={t("console.form.createVenue")}
                onChange={(venue) => setF((p) => ({ ...p, venue, branchId: "" }))}
                onPick={(o) => pickBranch(o.id)}
                onCreate={() => setVenueOpen(true)} />
            </F>
            {pickedVenue && !venueOpen && (
              <div className="span-12 panel" style={{ padding: 14 }}>
                <p className="small" style={{ margin: 0 }}>{[pickedVenue.address, pickedVenue.area, pickedVenue.city, pickedVenue.landmark].filter(Boolean).join(" · ")}</p>
                <p className="tiny muted" style={{ margin: "4px 0 0" }}>{t("console.form.venueSummary")}</p>
                <Btn size="sm" variant="ghost" onClick={() => setVenueOpen(true)}>{t("console.form.editVenue")}</Btn>
              </div>
            )}
            {(venueOpen || !pickedVenue) && (
              <>
                <F id="f-venue" label={t("console.form.address")} error={errors.venue} span={12}>
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
                {venueOpen && (
                  <div className="span-12">
                    <Btn size="sm" onClick={() => {
                      const name = (pickedVenue?.name || f.venue || f.city).trim();
                      if (!name || !f.city.trim()) return;
                      const row = { id: `br_${Date.now()}`, name, city: f.city.trim(), area: f.area.trim(), address: f.venue.trim(), landmark: f.landmark.trim() };
                      setOrgs((p) => p.map((o) => o.id === org.id ? { ...o, branches: [...(o.branches || []).filter((b) => b.id !== f.branchId), row] } : o));
                      setF((p) => ({ ...p, branchId: row.id }));
                      setVenueOpen(false);
                    }}>{t("console.form.createVenue")}</Btn>
                  </div>
                )}
              </>
            )}
            <p className="body muted span-12" style={{ margin: 0 }}>{t("console.form.rolesHelp")}</p>
            <div className="span-12">
              <label className="check-inline"><input type="checkbox" checked={showAllRoles} onChange={(e) => setShowAllRoles(e.target.checked)} />{t("console.form.showAllRoles")}</label>
            </div>
            <div className="span-12 stack gap-16">
              {f.roles.map((r, i) => (
                <RoleCard key={r.id} r={r} i={i} count={f.roles.length} lib={lib}
                  processId={processId} showAll={showAllRoles}
                  onChange={(patch) => setRole(r.id, patch)} onRemove={() => removeRole(r.id)}
                  onCreate={(text) => add("roles", text, { processId })} />
              ))}
              {errors.roles && <p className="small" role="alert" style={{ color: "var(--danger)", margin: 0 }}>{errors.roles}</p>}
              <div><Btn variant="ghost" className="btn-dashed" icon={Plus} onClick={() => setF((p) => ({ ...p, roles: [...p.roles, blankRole()] }))}>{t("console.form.addRole")}</Btn></div>
            </div>
            <F id="f-tags" label={t("console.form.roleCategory")} span={12} hint={t("console.form.roleCategoryHelp")}>
              <TagSelect id="f-tags" tags={f.roleTags || []} suggestions={tagHints}
                onAdd={(tag) => setF((p) => ({ ...p, roleTags: [...new Set([...(p.roleTags || []), tag])] }))}
                onRemove={(tag) => setF((p) => ({ ...p, roleTags: (p.roleTags || []).filter((x) => x !== tag) }))}
                placeholder={t("console.form.roleCategory")} />
            </F>
            <label className="check span-12" style={{ alignItems: "flex-start" }}>
              <input type="checkbox" checked={f.visibility !== "private"} onChange={(e) => setF((p) => ({ ...p, visibility: e.target.checked ? "public" : "private" }))} />
              <span><span className="strong">{t("console.form.public")}</span><br /><span className="small muted">{t("console.form.publicHelp")}</span></span>
            </label>
          </>}

          {step === 1 && (
            <>
              <F id="f-summary" label={t("console.form.summary")} error={errors.summary} span={12} hint={t("console.form.aboutHelp")}>
                <textarea id="f-summary" className="textarea" rows={3} maxLength={280} value={f.summary} onChange={(e) => setF((p) => ({ ...p, summary: e.target.value, jd: e.target.value }))} aria-invalid={!!errors.summary} />
                <p className="tiny muted" style={{ margin: "6px 0 0" }}>{(f.summary || "").length}/280</p>
              </F>
              <BulletList id="f-duties" label={t("console.form.duties")} rows={f.duties} onChange={(duties) => setF((p) => ({ ...p, duties }))} />
              <BulletList id="f-elig" label={t("console.form.eligibility")} rows={f.eligibility} onChange={(eligibility) => setF((p) => ({ ...p, eligibility }))} />
              <BulletList id="f-perks" label={t("console.form.perks")} rows={f.perks.length ? f.perks : [""]} onChange={(perks) => setF((p) => ({ ...p, perks }))} />
              <F id="f-lang" label={t("console.form.languages")} span={12}>
                <TagSelect id="f-lang" tags={f.languages} suggestions={["English", "Hindi", "Telugu", "Tamil", "Kannada", "Marathi"]}
                  onAdd={(tag) => setF((p) => ({ ...p, languages: [...p.languages, tag] }))}
                  onRemove={(tag) => setF((p) => ({ ...p, languages: p.languages.filter((x) => x !== tag) }))}
                  placeholder={t("console.form.languagePh")} />
              </F>
              <label className="check span-6">
                <input type="checkbox" checked={!!f.fresherWelcome} onChange={(e) => setF((p) => ({ ...p, fresherWelcome: e.target.checked }))} />
                <span>{t("console.form.fresher")}</span>
              </label>
              <label className="check span-6">
                <input type="checkbox" checked={f.locationCheck !== false} onChange={(e) => setF((p) => ({ ...p, locationCheck: e.target.checked }))} />
                <span>{t("console.form.locationCheck")}</span>
              </label>
              <F id="f-radius" label={t("console.form.locationRadius")} span={4}>
                <input id="f-radius" className="input" type="number" min="150" max="500" value={f.locationRadius} onChange={set("locationRadius")} />
              </F>
              <label className="check span-8">
                <input type="checkbox" checked={!!f.requireLocation} onChange={(e) => setF((p) => ({ ...p, requireLocation: e.target.checked }))} />
                <span>{t("console.form.requireLocation")}</span>
              </label>
              <F id="f-lat" label={t("console.form.venueLat")} span={6}>
                <input id="f-lat" className="input" value={f.venueLat} onChange={set("venueLat")} />
              </F>
              <F id="f-lng" label={t("console.form.venueLng")} span={6}>
                <input id="f-lng" className="input" value={f.venueLng} onChange={set("venueLng")} />
              </F>
            </>
          )}

          {step === 2 && (
            <div className="span-12">
              <RoundsEditor rounds={f.rounds} roles={f.roles} lib={lib} error={errors.rounds}
                setRounds={(rounds) => setF((p) => ({ ...p, rounds }))} onCreate={(text) => add("rounds", text)} />
            </div>
          )}

          {step === 3 && (
            <div className="span-12 stack gap-24">
              <section className="stack gap-12">
                <div className="stack gap-4">
                  <h3 className="h-4">{t("console.form.docs")}</h3>
                  <p className="small muted" style={{ margin: 0 }}>{t("console.form.docsHelp")}</p>
                </div>
                <DocumentsEditor documents={f.documents} setDocuments={(documents) => setF((p) => ({ ...p, documents }))} lib={lib} toast={toast}
                  onCreate={(text) => add("documents", text)} />
              </section>
              <section className="stack gap-12">
                <div className="stack gap-4">
                  <h3 className="h-4">{t("console.form.fieldsTitle")}</h3>
                  <p className="small muted" style={{ margin: 0 }}>{t("console.form.fieldsHelp")}</p>
                </div>
                <FieldsEditor fields={f.fields} setFields={(fields) => setF((p) => ({ ...p, fields }))} error={errors.fields} />
              </section>
              <label className="check" style={{ alignItems: "flex-start" }}>
                <input type="checkbox" checked={!!f.resumeRequired} onChange={(e) => setF((p) => ({ ...p, resumeRequired: e.target.checked }))} />
                <span><span className="strong">{t("console.form.resumeRequired")}</span><br /><span className="small muted">{t("console.form.resumeRequiredHelp")}</span></span>
              </label>
            </div>
          )}

          {step === LAST && (
            <div className="span-12 stack gap-16">
              <p className="body muted" style={{ margin: 0 }}>{t("console.form.review")}</p>
              {review.map(([title, lines], i) => (
                <div key={title} className="panel row between gap-12" style={{ padding: 16, alignItems: "flex-start" }}>
                  <div className="stack gap-4" style={{ minWidth: 0 }}>
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
          {step < LAST
            ? <Btn type="submit" size="lg" iconRight={ChevronRight}>{t("buttons.next")}</Btn>
            : <Btn type="submit" size="lg" disabled={noSlots}>{drive ? t("console.form.save") : t("console.form.publish")}</Btn>}
          <Btn variant="ghost" size="lg" onClick={() => save(true)} disabled={noSlots}>{t("console.form.saveDraft")}</Btn>
          <Btn variant="ghost" size="lg" icon={X} onClick={() => nav(drive ? `/app/drives/${drive.id}` : "/app/drives")}>{t("buttons.cancel")}</Btn>
        </div>
      </form>
    </div>
  );
}
