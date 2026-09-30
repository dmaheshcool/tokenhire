import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus, Trash2, X } from "lucide-react";
import { Btn, STROKE, useToast } from "../../components/ds.jsx";
import Creatable from "../../components/Creatable.jsx";
import { PageHead, useConsole } from "../../layouts/ConsoleLayout.jsx";
import { useMeta } from "../../hooks/useMeta.js";
import { useLibrary } from "../../hooks/useLibrary.js";
import { ROLE_TYPES } from "../../data/board.js";
import { HERO_CITIES, PAY_TYPES, expLabel, payText } from "../../lib/listing.js";
import { hoursLabel, datesLabel, istDate, utcWindowFields } from "../../lib/status.js";
import {
  BRAND_COLORS, DEFAULT_ROOMS, DEFAULT_ROUNDS, code, driveSlotsLeft, newGate, newHost,
} from "../../lib/helpers.js";
import {
  FIELD_TYPES, activeItems, addItem, driveDocuments, driveRoles, findItem, roleCode, rolesMirror, uid, withNewItems,
} from "../../lib/library.js";
import { t, tl } from "../../i18n/strings.js";
import { resumeIsRequired } from "../../lib/resume.js";

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

const blankRole = () => ({ id: uid("dr"), roleId: "", title: "", openings: 10, expMin: 0, expMax: 2, payType: "month", payMin: "", payMax: "", notes: "" });

/** Token codes follow the titles, and stay unique within the drive. */
function withCodes(roles) {
  const taken = [];
  return roles.map((r) => {
    const c = roleCode(r.title, taken);
    taken.push(c);
    return { ...r, code: c };
  });
}

function blank(org, lib) {
  const branch = (org.branches || [])[0];
  const docs = activeItems(lib, "documents").slice(0, 2);
  return {
    processId: "", processName: "", roleType: ROLE_TYPES[0], branchId: branch?.id || "",
    city: branch?.city || "", venue: branch?.address || "", area: branch?.area || "", landmark: branch?.landmark || "",
    date: istDate(1), endDate: istDate(1), startTime: "10:00", endTime: "16:00",
    roles: [blankRole()],
    jd: "", documents: docs.map((d) => ({ id: uid("dd"), docId: d.id, label: d.label, required: false })),
    fields: [], visibility: "public", resumeRequired: true,
    rounds: roundsFrom(DEFAULT_ROUNDS, DEFAULT_ROOMS),
  };
}

function fromDrive(d) {
  return {
    processId: d.clientId || "", processName: d.clientName || "", roleType: d.roleType || ROLE_TYPES[0], branchId: d.branchId || "",
    city: d.city || "", venue: d.venue || "", area: d.area || "", landmark: d.landmark || "",
    date: d.date || "", endDate: d.endDate || d.date || "", startTime: d.startTime || "10:00", endTime: d.endTime || "16:00",
    roles: driveRoles(d).map((r) => ({ ...blankRole(), ...r, id: r.id === "main" ? uid("dr") : r.id, payMin: r.payMin ?? "", payMax: r.payMax ?? "", openings: r.openings ?? "" })),
    jd: d.jd || "", documents: driveDocuments(d).map((x) => ({ ...x })),
    fields: (d.fields || []).map((x) => ({ ...x, optionsText: (x.options || []).join(", ") })),
    visibility: d.visibility || "public", resumeRequired: resumeIsRequired(d),
    rounds: roundsFrom(d.rounds || [], d.rooms || []),
  };
}

const optionsOf = (text) => [...new Set(String(text || "").split(",").map((s) => s.trim()).filter(Boolean))].slice(0, 20);

const STEP_FIELDS = [
  ["city", "venue", "date", "endDate", "startTime"],
  ["roles", "jd"],
  ["rounds"],
  ["fields"],
  [],
];

function check(f) {
  const e = {};
  if (!f.city.trim()) e.city = t("console.form.err.city");
  if (f.venue.trim().length < 5) e.venue = t("console.form.err.venue");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(f.date)) e.date = t("console.form.err.date");
  if (f.endDate && f.endDate < f.date) e.endDate = t("console.form.err.endDate");
  if (!f.startTime || !f.endTime) e.startTime = t("console.form.err.time");
  f.roles.some((r, i) => {
    const msg = r.title.trim().length < 3 ? t("console.form.err.role")
      : r.payMin !== "" && r.payMax !== "" && Number(r.payMax) < Number(r.payMin) ? t("console.form.err.payMax")
        : Number(r.expMax) < Number(r.expMin) ? t("console.form.err.expMax") : "";
    if (msg) e.roles = f.roles.length > 1 ? t("console.form.err.roleN", { n: i + 1, msg }) : msg;
    return !!msg;
  });
  if (f.jd.trim().length < 60) e.jd = t("console.form.err.jd");
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

function RoleCard({ r, i, count, codeOf, lib, onChange, onRemove, onCreate }) {
  const set = (k) => (e) => onChange({ [k]: e.target.value });
  const procName = (id) => lib.processes.find((p) => p.id === id)?.name || "";
  const options = activeItems(lib, "roles").map((x) => ({ id: x.id, label: x.title, hint: procName(x.processId), item: x }));
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
        <div className="row gap-8">
          <span className="role-code" title={t("console.form.roleCodeHelp")}>{codeOf}</span>
          <span className="strong">{t("console.form.roleN", { n: i + 1 })}</span>
        </div>
        {count > 1 && (
          <button type="button" className="btn btn-ghost btn-icon btn-sm" aria-label={t("console.form.removeRole")} onClick={onRemove}>
            <Trash2 size={17} strokeWidth={STROKE} />
          </button>
        )}
      </div>
      <F id={`${p}-title`} label={t("console.form.role")} span={12} hint={i === 0 ? t("console.form.roleHelp") : null}>
        <Creatable id={`${p}-title`} value={r.title} options={options} placeholder={t("console.form.rolePlaceholder")}
          onChange={(title) => onChange({ title, roleId: "" })} onPick={pick}
          onCreate={(text) => { const item = onCreate(text); if (item) onChange({ roleId: item.id, title: item.title }); }}
          describedBy={i === 0 ? `${p}-title-hint` : undefined} />
      </F>
      <F id={`${p}-openings`} label={t("console.form.openings")} span={4}>
        <input id={`${p}-openings`} className="input" type="number" min="1" inputMode="numeric" value={r.openings} onChange={set("openings")} />
      </F>
      <F id={`${p}-expMin`} label={t("console.form.expMin")} span={4}>
        <input id={`${p}-expMin`} className="input" type="number" min="0" max="30" inputMode="numeric" value={r.expMin} onChange={set("expMin")} />
      </F>
      <F id={`${p}-expMax`} label={t("console.form.expMax")} span={4}>
        <input id={`${p}-expMax`} className="input" type="number" min="0" max="30" inputMode="numeric" value={r.expMax} onChange={set("expMax")} />
      </F>
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
        <input id={`${p}-payMin`} className="input" type="number" inputMode="numeric" min="0" step={PAY_HINTS[r.payType][2]} value={r.payMin} onChange={set("payMin")} placeholder={PAY_HINTS[r.payType][0]} />
      </F>
      <F id={`${p}-payMax`} label={t("console.form.payMax")} span={4}>
        <input id={`${p}-payMax`} className="input" type="number" inputMode="numeric" min="0" step={PAY_HINTS[r.payType][2]} value={r.payMax} onChange={set("payMax")} placeholder={PAY_HINTS[r.payType][1]} />
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
                {t("console.form.docRequired")}
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
  const { org, desk, drives, setDrives } = useConsole();
  const { lib, update, add } = useLibrary();
  const drive = id ? drives.find((d) => d.id === id && d.orgId === org.id) : null;
  const [f, setF] = useState(() => (drive ? fromDrive(drive) : blank(org, lib)));
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(drive ? LAST : 0);
  const roleTypes = useMemo(() => [...new Set([...ROLE_TYPES, ...drives.filter((d) => d.orgId === org.id && d.roleType).map((d) => d.roleType)])], [drives, org.id]);
  useMeta({ title: drive ? t("console.form.titleEdit") : t("console.form.titleNew") });
  if (desk || (id && !drive)) return <Navigate to="/app/drives" replace />;

  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const branches = org.branches || [];
  const noSlots = !drive && driveSlotsLeft(org, drives) <= 0;
  const steps = tl("console.form.steps");
  const deskPin = drive ? String(drive.host || "").replace(/^HOST-/, "") : "";
  const coded = withCodes(f.roles);

  function pickBranch(e) {
    const b = branches.find((x) => x.id === e.target.value);
    setF((p) => ({ ...p, branchId: e.target.value, ...(b ? { city: b.city || p.city, venue: b.address || p.venue, area: b.area || p.area, landmark: b.landmark || p.landmark } : {}) }));
  }
  const setRole = (rid, patch) => setF((p) => ({ ...p, roles: p.roles.map((r) => (r.id === rid ? { ...r, ...patch } : r)) }));
  const removeRole = (rid) => setF((p) => ({ ...p, roles: p.roles.filter((r) => r.id !== rid), rounds: p.rounds.map((r) => ({ ...r, roleIds: (r.roleIds || []).filter((x) => x !== rid) })) }));
  const processId = f.processId || findItem(lib, "processes", f.processName)?.id || "";

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

  function save(asDraft) {
    const e = asDraft ? (f.roles.some((r) => r.title.trim()) ? {} : { roles: t("console.form.err.role") }) : check(f);
    setErrors(e);
    if (Object.keys(e).length) {
      const bad = STEP_FIELDS.findIndex((keys) => keys.some((k) => e[k]));
      setStep(bad < 0 ? 0 : bad);
      return;
    }
    const branch = branches.find((b) => b.id === f.branchId);
    const { proc, roles, rounds: kept, documents } = linkLibrary();
    const roleIds = new Set(roles.map((r) => r.id));
    const rounds = kept.map((r) => ({ id: r.id, libId: r.libId, name: r.name, roleIds: (r.roleIds || []).filter((x) => roleIds.has(x)), pass: r.pass.trim() }));
    const rooms = kept.flatMap((r) => r.rooms.filter((m) => m.name.trim()).map((m) => ({ id: m.id, name: m.name.trim(), interviewer: m.interviewer.trim(), roundId: r.id })));
    const rest = { ...f };
    delete rest.processId;
    delete rest.processName;
    const fields = {
      ...rest, ...rolesMirror(roles), roles, jd: f.jd.trim(), endDate: f.endDate || f.date, roleType: f.roleType.trim() || ROLE_TYPES[0],
      clientId: proc?.id || "", clientName: proc?.name || "", branch: branch?.name || "",
      documents, docs: documents.map((d) => d.label),
      fields: f.fields.map(({ optionsText, ...x }) => ({ ...x, label: x.label.trim(), options: x.type === "dropdown" ? optionsOf(optionsText) : [] })),
      rounds: rounds.length ? rounds : DEFAULT_ROUNDS.map((r) => ({ ...r })),
      rooms: rooms.length ? rooms : DEFAULT_ROOMS.map((r) => ({ ...r })),
      draft: asDraft,
      ...utcWindowFields({ date: f.date, endDate: f.endDate || f.date, startTime: f.startTime, endTime: f.endTime }),
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

  const roleName = (rid) => coded.find((r) => r.id === rid)?.title;
  const review = [
    [steps[0], [f.processName, f.roleType, [f.venue, f.area, f.city].filter(Boolean).join(", "), `${datesLabel(f)} · ${hoursLabel(f)}`].filter(Boolean)],
    [steps[1], coded.filter((r) => r.title.trim()).map((r) => [`${r.code} · ${r.title}`, expLabel(r), payText(r), r.openings ? t("detail.openings", { n: r.openings }) : ""].filter(Boolean).join(" · "))],
    [steps[2], f.rounds.filter((r) => r.name.trim()).map((r) => [r.name, r.rooms.map((m) => m.name).filter(Boolean).join(", "), (r.roleIds || []).length ? r.roleIds.map(roleName).filter(Boolean).join(", ") : ""].filter(Boolean).join(" · "))],
    [steps[3], [
      ...f.documents.map((d) => (d.required ? `${d.label} (${t("console.form.docRequiredTag")})` : d.label)),
      ...f.fields.filter((x) => x.label.trim()).map((x) => `${t("console.form.fieldReview")}: ${x.label}${x.required ? ` (${t("console.form.docRequiredTag")})` : ""}`),
      f.resumeRequired ? t("console.form.resumeRequired") : "",
    ].filter(Boolean)],
  ];

  return (
    <div style={{ maxWidth: 880 }}>
      <PageHead title={drive ? t("console.form.titleEdit") : t("console.form.titleNew")} lede={t("console.form.stepOf", { n: step + 1, total: steps.length })} />
      {noSlots && <div className="panel small" role="status" style={{ marginBottom: 20 }}>{t("console.form.noSlots")}</div>}
      <Stepper step={step} maxStep={maxStep} onPick={(i) => (i < step ? setStep(i) : go(i))} />
      <form noValidate onSubmit={(e) => { e.preventDefault(); if (step < LAST) go(step + 1); else save(false); }} className="stack gap-24">
        <fieldset className="card card-pad grid-12" style={{ border: "1px solid var(--line)", rowGap: 16 }}>
          <legend className="h-4 span-12 form-legend">{steps[step]}</legend>

          {step === 0 && <>
            <F id="f-process" label={t("console.form.process")} span={8} hint={t("console.form.processHelp")}>
              <Creatable id="f-process" value={f.processName} describedBy="f-process-hint"
                options={activeItems(lib, "processes").map((x) => ({ id: x.id, label: x.name }))} placeholder={t("console.form.processPlaceholder")}
                onChange={(processName) => setF((p) => ({ ...p, processName, processId: "" }))}
                onPick={(o) => setF((p) => ({ ...p, processName: o.label, processId: o.id }))}
                onCreate={(text) => { const item = add("processes", text); if (item) setF((p) => ({ ...p, processName: item.name, processId: item.id })); }} />
            </F>
            <F id="f-roleType" label={t("console.form.roleType")} span={4} hint={t("console.form.roleTypeHelp")}>
              <Creatable id="f-roleType" value={f.roleType} describedBy="f-roleType-hint"
                options={roleTypes.map((x) => ({ id: x, label: x }))}
                onChange={(roleType) => setF((p) => ({ ...p, roleType }))}
                onPick={(o) => setF((p) => ({ ...p, roleType: o.label }))}
                onCreate={(text) => setF((p) => ({ ...p, roleType: text.trim() }))} />
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
            <p className="body muted span-12" style={{ margin: 0 }}>{t("console.form.rolesHelp")}</p>
            <div className="span-12 stack gap-16">
              {f.roles.map((r, i) => (
                <RoleCard key={r.id} r={r} i={i} count={f.roles.length} codeOf={coded[i].code} lib={lib}
                  onChange={(patch) => setRole(r.id, patch)} onRemove={() => removeRole(r.id)}
                  onCreate={(text) => add("roles", text, { processId })} />
              ))}
              {errors.roles && <p className="small" role="alert" style={{ color: "var(--danger)", margin: 0 }}>{errors.roles}</p>}
              <div><Btn variant="secondary" icon={Plus} onClick={() => setF((p) => ({ ...p, roles: [...p.roles, blankRole()] }))}>{t("console.form.addRole")}</Btn></div>
            </div>
            <F id="f-jd" label={t("console.form.about")} error={errors.jd} span={12} hint={t("console.form.aboutHelp")}>
              <textarea id="f-jd" className="textarea" rows={5} value={f.jd} onChange={set("jd")} aria-invalid={!!errors.jd} />
            </F>
          </>}

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
