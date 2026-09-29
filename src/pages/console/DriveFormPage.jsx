import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Plus, X } from "lucide-react";
import { Btn, useToast } from "../../components/ds.jsx";
import { PageHead, useConsole } from "../../layouts/ConsoleLayout.jsx";
import { useMeta } from "../../hooks/useMeta.js";
import { ROLE_TYPES } from "../../data/board.js";
import { HERO_CITIES } from "../../lib/listing.js";
import { istDate } from "../../lib/status.js";
import {
  BRAND_COLORS, DEFAULT_ROOMS, DEFAULT_ROUNDS, DOC_OPTIONS, code, docNameOf, driveSlotsLeft, newGate, newHost,
} from "../../lib/helpers.js";
import { t } from "../../i18n/strings.js";

const CITIES = [...HERO_CITIES, "Noida", "Gurgaon", "Kolkata", "Ahmedabad", "Kochi", "Jaipur", "Coimbatore", "Indore"];
const num = (v) => (v === "" || v == null ? "" : Number(v));

function blank(org) {
  const branch = (org.branches || [])[0];
  return {
    role: "", roleType: ROLE_TYPES[0], clientId: "", branchId: branch?.id || "",
    city: branch?.city || "", venue: branch?.address || "", area: branch?.area || "", landmark: branch?.landmark || "",
    date: istDate(1), endDate: istDate(1), startTime: "10:00", endTime: "16:00",
    payMin: "", payMax: "", expMin: 0, expMax: 2, openings: 10,
    jd: "", docs: [DOC_OPTIONS[0], DOC_OPTIONS[1]], visibility: "public",
  };
}

function fromDrive(d) {
  return {
    role: d.role || "", roleType: d.roleType || ROLE_TYPES[0], clientId: d.clientId || "", branchId: d.branchId || "",
    city: d.city || "", venue: d.venue || "", area: d.area || "", landmark: d.landmark || "",
    date: d.date || "", endDate: d.endDate || d.date || "", startTime: d.startTime || "10:00", endTime: d.endTime || "16:00",
    payMin: d.payMin ?? "", payMax: d.payMax ?? "", expMin: d.expMin ?? 0, expMax: d.expMax ?? 2, openings: d.openings ?? "",
    jd: d.jd || "", docs: Array.isArray(d.docs) ? d.docs : [], visibility: d.visibility || "public",
  };
}

function check(f) {
  const e = {};
  if (f.role.trim().length < 3) e.role = "Add the role you are hiring for.";
  if (!f.city.trim()) e.city = "Pick a city.";
  if (f.venue.trim().length < 5) e.venue = "Add the venue address.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(f.date)) e.date = "Pick a start date.";
  if (f.endDate && f.endDate < f.date) e.endDate = "End date can’t be before the start date.";
  if (!f.startTime || !f.endTime) e.startTime = "Add walk-in hours.";
  if (f.payMin !== "" && f.payMax !== "" && Number(f.payMax) < Number(f.payMin)) e.payMax = "Max pay is below min pay.";
  if (Number(f.expMax) < Number(f.expMin)) e.expMax = "Max experience is below min.";
  if (f.jd.trim().length < 60) e.jd = "Write at least two sentences about the job.";
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

export default function DriveFormPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const { org, desk, drives, setDrives } = useConsole();
  const drive = id ? drives.find((d) => d.id === id && d.orgId === org.id) : null;
  const [f, setF] = useState(() => (drive ? fromDrive(drive) : blank(org)));
  const [errors, setErrors] = useState({});
  const [extraDoc, setExtraDoc] = useState("");
  useMeta({ title: drive ? `Edit ${drive.role}` : t("console.createDrive") });
  if (desk || (id && !drive)) return <Navigate to="/app/drives" replace />;

  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const clients = org.clients || [];
  const branches = org.branches || [];
  const noSlots = !drive && driveSlotsLeft(org, drives) <= 0;

  function pickBranch(e) {
    const b = branches.find((x) => x.id === e.target.value);
    setF((p) => ({ ...p, branchId: e.target.value, ...(b ? { city: b.city || p.city, venue: b.address || p.venue, area: b.area || p.area, landmark: b.landmark || p.landmark } : {}) }));
  }
  function toggleDoc(doc) {
    setF((p) => ({ ...p, docs: p.docs.includes(doc) ? p.docs.filter((x) => x !== doc) : [...p.docs, doc] }));
  }
  function addDoc() {
    const name = docNameOf(extraDoc);
    if (!name) { toast("That document name isn’t allowed.", "err"); return; }
    if (!f.docs.includes(name)) setF((p) => ({ ...p, docs: [...p.docs, name] }));
    setExtraDoc("");
  }

  function save(asDraft) {
    const e = asDraft ? (f.role.trim() ? {} : { role: "Add the role you are hiring for." }) : check(f);
    setErrors(e);
    if (Object.keys(e).length) { document.getElementById(`f-${Object.keys(e)[0]}`)?.focus(); return; }
    const client = clients.find((c) => c.id === f.clientId);
    const branch = branches.find((b) => b.id === f.branchId);
    const fields = {
      ...f, role: f.role.trim(), jd: f.jd.trim(), endDate: f.endDate || f.date,
      payMin: num(f.payMin), payMax: num(f.payMax), expMin: Number(f.expMin), expMax: Number(f.expMax), openings: num(f.openings),
      expNeeded: Number(f.expMin) > 0, clientName: client?.name || "", branch: branch?.name || "",
      draft: asDraft,
    };
    if (drive) {
      setDrives((p) => p.map((d) => (d.id === drive.id ? { ...d, ...fields } : d)));
      toast("Drive saved.");
      nav(`/app/drives/${drive.id}`);
      return;
    }
    const nid = `d_${Date.now()}`;
    setDrives((p) => [...p, {
      id: nid, orgId: org.id, host: newHost(), gate: newGate(), desk: code(6), company: org.name, ...fields,
      candidates: [], msgs: [], seq: 0,
      rounds: DEFAULT_ROUNDS.map((r) => ({ ...r })), rooms: DEFAULT_ROOMS.map((r) => ({ ...r })),
      brand: { name: org.short || org.name, color: org.color || BRAND_COLORS[0].hex, logo: org.logo || "letter" },
    }]);
    toast(asDraft ? "Draft saved." : "Drive created.");
    nav(`/app/drives/${nid}?tab=rooms`);
  }

  return (
    <div style={{ maxWidth: 880 }}>
      <PageHead title={drive ? "Edit drive" : t("console.createDrive")} lede={drive ? drive.role : "Candidates see this on the walk-in page."} />
      {noSlots && <div className="panel small" role="status" style={{ marginBottom: 20 }}>This account can’t create more drives right now. Wrap up or delete an older drive first.</div>}
      <form noValidate onSubmit={(e) => { e.preventDefault(); save(false); }} className="stack gap-24">
        <fieldset className="card card-pad grid-12" style={{ border: "1px solid var(--line)", rowGap: 16 }}>
          <legend className="h-4 span-12 form-legend">The job</legend>
          <F id="f-role" label="Role" error={errors.role} span={8}>
            <input id="f-role" className="input" value={f.role} onChange={set("role")} placeholder="Customer support associate (voice)" aria-invalid={!!errors.role} />
          </F>
          <F id="f-roleType" label="Role type" span={4}>
            <select id="f-roleType" className="select" value={f.roleType} onChange={set("roleType")}>{ROLE_TYPES.map((r) => <option key={r}>{r}</option>)}</select>
          </F>
          {clients.length > 0 && (
            <F id="f-client" label="Hiring team" span={12} hint="The team or client this drive hires for.">
              <select id="f-client" className="select" value={f.clientId} onChange={set("clientId")}>
                <option value="">No specific team</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </F>
          )}
          <F id="f-payMin" label="Pay from (₹/month)" error={errors.payMin} span={4}>
            <input id="f-payMin" className="input" type="number" inputMode="numeric" min="0" step="500" value={f.payMin} onChange={set("payMin")} placeholder="18000" />
          </F>
          <F id="f-payMax" label="Pay up to (₹/month)" error={errors.payMax} span={4}>
            <input id="f-payMax" className="input" type="number" inputMode="numeric" min="0" step="500" value={f.payMax} onChange={set("payMax")} placeholder="25000" />
          </F>
          <F id="f-openings" label="Openings" span={4}>
            <input id="f-openings" className="input" type="number" min="1" value={f.openings} onChange={set("openings")} />
          </F>
          <F id="f-expMin" label="Min experience (years)" span={4}>
            <input id="f-expMin" className="input" type="number" min="0" max="30" value={f.expMin} onChange={set("expMin")} />
          </F>
          <F id="f-expMax" label="Max experience (years)" error={errors.expMax} span={4}>
            <input id="f-expMax" className="input" type="number" min="0" max="30" value={f.expMax} onChange={set("expMax")} />
          </F>
          <F id="f-jd" label="About the job" error={errors.jd} span={12} hint="What the work is, the shift, and who should come. Plain words.">
            <textarea id="f-jd" className="textarea" rows={5} value={f.jd} onChange={set("jd")} aria-invalid={!!errors.jd} />
          </F>
        </fieldset>

        <fieldset className="card card-pad grid-12" style={{ border: "1px solid var(--line)", rowGap: 16 }}>
          <legend className="h-4 span-12 form-legend">Where and when</legend>
          {branches.length > 0 && (
            <F id="f-branch" label="Venue" span={12} hint="Saved venues fill in the address for you.">
              <select id="f-branch" className="select" value={f.branchId} onChange={pickBranch}>
                <option value="">Another address</option>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </F>
          )}
          <F id="f-city" label="City" error={errors.city} span={4}>
            <input id="f-city" className="input" list="f-cities" value={f.city} onChange={set("city")} aria-invalid={!!errors.city} />
            <datalist id="f-cities">{CITIES.map((c) => <option key={c} value={c} />)}</datalist>
          </F>
          <F id="f-area" label="Area" span={4}>
            <input id="f-area" className="input" value={f.area} onChange={set("area")} placeholder="Hitech City" />
          </F>
          <F id="f-landmark" label="Landmark" span={4}>
            <input id="f-landmark" className="input" value={f.landmark} onChange={set("landmark")} placeholder="Opposite the metro exit" />
          </F>
          <F id="f-venue" label="Address" error={errors.venue} span={12}>
            <input id="f-venue" className="input" value={f.venue} onChange={set("venue")} placeholder="Building, floor, street" aria-invalid={!!errors.venue} />
          </F>
          <F id="f-date" label="Starts" error={errors.date} span={3}>
            <input id="f-date" className="input" type="date" value={f.date} onChange={(e) => setF((p) => ({ ...p, date: e.target.value, endDate: p.endDate < e.target.value ? e.target.value : p.endDate }))} />
          </F>
          <F id="f-endDate" label="Ends" error={errors.endDate} span={3}>
            <input id="f-endDate" className="input" type="date" min={f.date} value={f.endDate} onChange={set("endDate")} />
          </F>
          <F id="f-startTime" label="Doors open" error={errors.startTime} span={3}>
            <input id="f-startTime" className="input" type="time" value={f.startTime} onChange={set("startTime")} />
          </F>
          <F id="f-endTime" label="Last entry" span={3}>
            <input id="f-endTime" className="input" type="time" value={f.endTime} onChange={set("endTime")} />
          </F>
        </fieldset>

        <fieldset className="card card-pad stack gap-12" style={{ border: "1px solid var(--line)" }}>
          <legend className="h-4 span-12 form-legend">What to bring</legend>
          <div className="wrap-row gap-8">
            {[...new Set([...DOC_OPTIONS, ...f.docs])].map((doc) => (
              <label key={doc} className="filter-opt check" style={{ border: "1px solid var(--line)", borderRadius: 999, padding: "8px 14px" }}>
                <input type="checkbox" checked={f.docs.includes(doc)} onChange={() => toggleDoc(doc)} /> {doc}
              </label>
            ))}
          </div>
          <div className="row gap-8" style={{ maxWidth: 480 }}>
            <label className="sr-only" htmlFor="f-extraDoc">Another document</label>
            <input id="f-extraDoc" className="input" value={extraDoc} onChange={(e) => setExtraDoc(e.target.value)} placeholder="Another document" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addDoc(); } }} />
            <Btn variant="secondary" icon={Plus} onClick={addDoc}>Add</Btn>
          </div>
        </fieldset>

        <fieldset className="card card-pad stack gap-12" style={{ border: "1px solid var(--line)" }}>
          <legend className="h-4 span-12 form-legend">Who can find it</legend>
          {[["public", "Listed on TokenHire", "Anyone can find it under Walk-ins and get a token."], ["private", "Link only", "Only people with your link can get a token."]].map(([v, l, d]) => (
            <label key={v} className="check" style={{ alignItems: "flex-start" }}>
              <input type="radio" name="visibility" value={v} checked={f.visibility === v} onChange={set("visibility")} />
              <span><span className="strong">{l}</span><br /><span className="small muted">{d}</span></span>
            </label>
          ))}
        </fieldset>

        <div className="row gap-8" style={{ flexWrap: "wrap" }}>
          <Btn type="submit" size="lg" disabled={noSlots}>{drive ? "Save drive" : t("console.createDrive")}</Btn>
          <Btn variant="secondary" size="lg" onClick={() => save(true)} disabled={noSlots}>Save as draft</Btn>
          <Btn variant="ghost" size="lg" icon={X} onClick={() => nav(drive ? `/app/drives/${drive.id}` : "/app/drives")}>Cancel</Btn>
        </div>
      </form>
    </div>
  );
}
