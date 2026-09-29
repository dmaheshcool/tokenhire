import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { Download, Handshake, MapPin, Plus, Search, Trash2, UserRound, Users } from "lucide-react";
import { Btn, EmptyState, Monogram, STROKE, useToast } from "../../components/ds.jsx";
import { PageHead, useConsole } from "../../layouts/ConsoleLayout.jsx";
import { useMeta } from "../../hooks/useMeta.js";
import { BrandPanel } from "../app/EmployerPage.jsx";
import { atSeatCap, downloadFile, isWorkEmail, memberEmail, memberName, memberRole, planLimits } from "../../lib/helpers.js";
import { shortDate } from "../../lib/status.js";
import { t } from "../../i18n/strings.js";

function useOrgPatch() {
  const { org, setOrgs } = useConsole();
  return (next) => setOrgs((p) => p.map((o) => (o.id === org.id ? { ...o, ...next } : o)));
}

function RecruiterOnly({ children }) {
  const { desk } = useConsole();
  return desk ? <Navigate to="/app/today" replace /> : children;
}

function Row({ children }) {
  return <div className="card row between gap-12" style={{ padding: "14px 18px", flexWrap: "wrap" }}>{children}</div>;
}

/* ---------- Venues ---------- */
function VenuesInner() {
  const { org, mine } = useConsole();
  const patch = useOrgPatch();
  const toast = useToast();
  const branches = org.branches || [];
  const [f, setF] = useState({ name: "", city: "", area: "", address: "", landmark: "" });
  const [err, setErr] = useState("");
  const lim = planLimits(org);
  useMeta({ title: t("console.nav.venues") });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  function add(e) {
    e.preventDefault();
    setErr("");
    if (!f.name.trim() || !f.city.trim()) { setErr("Add a venue name and city."); return; }
    if (branches.length >= lim.sites) { setErr(`This account includes ${lim.sites} venue${lim.sites === 1 ? "" : "s"}.`); return; }
    patch({ branches: [...branches, { id: `br_${Date.now()}`, ...Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v.trim()])) }] });
    setF({ name: "", city: "", area: "", address: "", landmark: "" });
    toast("Venue saved.");
  }
  const remove = (id) => patch({ branches: branches.filter((b) => b.id !== id) });
  const uses = (b) => mine.filter((d) => d.branchId === b.id).length;

  return (
    <>
      <PageHead title={t("console.nav.venues")} lede="Addresses you run drives at. Pick one when you create a drive." />
      <div className="grid-12" style={{ alignItems: "start", rowGap: 24 }}>
        <div className="span-7 stack gap-8">
          {branches.length ? branches.map((b) => (
            <Row key={b.id}>
              <div className="row gap-12" style={{ minWidth: 0 }}>
                <span className="step-icon" style={{ width: 40, height: 40 }}><MapPin size={18} strokeWidth={STROKE} aria-hidden="true" /></span>
                <div style={{ minWidth: 0 }}>
                  <p className="strong" style={{ margin: 0 }}>{b.name}</p>
                  <p className="small muted" style={{ margin: 0 }}>{[b.address, b.area, b.city].filter(Boolean).join(", ")}</p>
                  {b.landmark && <p className="tiny faint" style={{ margin: 0 }}>{b.landmark}</p>}
                </div>
              </div>
              <div className="row gap-8">
                <span className="tiny muted">{uses(b)} drive{uses(b) === 1 ? "" : "s"}</span>
                <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={() => remove(b.id)} aria-label={`Remove ${b.name}`}><Trash2 size={16} strokeWidth={STROKE} /></button>
              </div>
            </Row>
          )) : <EmptyState icon={MapPin} title="No venues yet." body="Add the offices or campuses you hire at." />}
        </div>
        <form className="card card-pad stack gap-12 span-5" onSubmit={add} noValidate>
          <h2 className="h-4">Add a venue</h2>
          {[["name", "Venue name", "Tower B, 4th floor"], ["city", "City", "Hyderabad"], ["area", "Area", "Hitech City"], ["address", "Address", "Plot 12, Road No. 2"], ["landmark", "Landmark", "Next to the metro exit"]].map(([k, l, ph]) => (
            <div key={k} className="field">
              <label className="label" htmlFor={`v-${k}`}>{l}</label>
              <input id={`v-${k}`} className="input" value={f[k]} onChange={set(k)} placeholder={ph} />
            </div>
          ))}
          {err && <p className="tiny" role="alert" style={{ color: "var(--danger)", margin: 0 }}>{err}</p>}
          <Btn type="submit" icon={Plus}>Save venue</Btn>
        </form>
      </div>
    </>
  );
}
export function VenuesPage() { return <RecruiterOnly><VenuesInner /></RecruiterOnly>; }

/* ---------- Hiring teams ---------- */
function TeamsInner() {
  const { org, mine } = useConsole();
  const patch = useOrgPatch();
  const clients = org.clients || [];
  const [name, setName] = useState("");
  useMeta({ title: t("console.nav.teams") });
  function add(e) {
    e.preventDefault();
    const v = name.trim();
    if (!v || clients.some((c) => c.name.toLowerCase() === v.toLowerCase())) return;
    patch({ clients: [...clients, { id: `cl_${Date.now()}`, name: v }] });
    setName("");
  }
  const count = (c) => mine.filter((d) => d.clientId === c.id).length;
  return (
    <>
      <PageHead title={t("console.nav.teams")} lede="The teams or client companies you hire for. Pick one on each drive." />
      <div className="grid-12" style={{ alignItems: "start", rowGap: 24 }}>
        <div className="span-7 stack gap-8">
          {clients.length ? clients.map((c) => (
            <Row key={c.id}>
              <div className="row gap-12"><Monogram name={c.name} size={36} /><span className="strong">{c.name}</span></div>
              <div className="row gap-8">
                <span className="tiny muted">{count(c)} drive{count(c) === 1 ? "" : "s"}</span>
                <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={() => patch({ clients: clients.filter((x) => x.id !== c.id) })} aria-label={`Remove ${c.name}`}><Trash2 size={16} strokeWidth={STROKE} /></button>
              </div>
            </Row>
          )) : <EmptyState icon={Handshake} title="No hiring teams yet." body="Add one for each business unit or client you run drives for." />}
        </div>
        <form className="card card-pad stack gap-12 span-5" onSubmit={add}>
          <h2 className="h-4">Add a hiring team</h2>
          <div className="field">
            <label className="label" htmlFor="ht-name">Team or client name</label>
            <input id="ht-name" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Inbound voice support" />
          </div>
          <Btn type="submit" icon={Plus}>Add team</Btn>
        </form>
      </div>
    </>
  );
}
export function HiringTeamsPage() { return <RecruiterOnly><TeamsInner /></RecruiterOnly>; }

/* ---------- Team ---------- */
const ROLES = [["recruiter", "Recruiter"], ["frontdesk", "Front desk"]];

function TeamInner() {
  const { org, staffEmail } = useConsole();
  const patch = useOrgPatch();
  const toast = useToast();
  const members = org.members || [];
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("recruiter");
  const [err, setErr] = useState("");
  useMeta({ title: t("console.nav.team") });
  const full = atSeatCap(org);

  function invite(e) {
    e.preventDefault();
    setErr("");
    const v = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) { setErr("Enter an email address."); return; }
    if (!isWorkEmail(v)) { setErr("Use a work email."); return; }
    if (members.some((m) => memberEmail(m).toLowerCase() === v)) { setErr("Already on the team."); return; }
    if (full) return;
    patch({ members: [...members, { email: v, role }] });
    setEmail("");
    toast(`Invited ${v}.`);
  }
  const setMemberRole = (em, r) => patch({ members: members.map((m) => (memberEmail(m) === em ? { ...(typeof m === "string" ? {} : m), email: em, role: r } : m)) });
  const remove = (em) => patch({ members: members.filter((m) => memberEmail(m) !== em) });

  return (
    <>
      <PageHead title={t("console.nav.team")} lede="Recruiters run drives and see resumes. Front desk only runs the queue." />
      <div className="grid-12" style={{ alignItems: "start", rowGap: 24 }}>
        <div className="span-7 stack gap-8">
          {members.map((m) => {
            const em = memberEmail(m);
            const me = em.toLowerCase() === String(staffEmail || "").toLowerCase();
            return (
              <Row key={em}>
                <div className="row gap-12" style={{ minWidth: 0 }}>
                  <Monogram name={memberName(m)} size={36} />
                  <div style={{ minWidth: 0 }}>
                    <p className="strong" style={{ margin: 0 }}>{memberName(m)}{me && <span className="tag" style={{ marginLeft: 8 }}>You</span>}</p>
                    <p className="small muted" style={{ margin: 0, overflow: "hidden", textOverflow: "ellipsis" }}>{em}</p>
                  </div>
                </div>
                <div className="row gap-8">
                  <label className="sr-only" htmlFor={`role-${em}`}>Role for {em}</label>
                  <select id={`role-${em}`} className="select" style={{ width: "auto", height: 38 }} value={memberRole(m)} disabled={me} onChange={(e) => setMemberRole(em, e.target.value)}>
                    {ROLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                  {!me && <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={() => remove(em)} aria-label={`Remove ${em}`}><Trash2 size={16} strokeWidth={STROKE} /></button>}
                </div>
              </Row>
            );
          })}
          {!members.length && <EmptyState icon={Users} title="Just you so far." body="Invite the recruiters and front desk staff for drive day." />}
        </div>
        <form className="card card-pad stack gap-12 span-5" onSubmit={invite} noValidate>
          <h2 className="h-4">Invite someone</h2>
          <div className="field">
            <label className="label" htmlFor="tm-email">Work email</label>
            <input id="tm-email" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@yourcompany.com" aria-invalid={!!err} />
          </div>
          <div className="field">
            <label className="label" htmlFor="tm-role">Role</label>
            <select id="tm-role" className="select" value={role} onChange={(e) => setRole(e.target.value)}>{ROLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          </div>
          {err && <p className="tiny" role="alert" style={{ color: "var(--danger)", margin: 0 }}>{err}</p>}
          {full && <p className="tiny muted" style={{ margin: 0 }}>Every seat on this account is taken.</p>}
          <Btn type="submit" icon={Plus} disabled={full}>Send invite</Btn>
        </form>
      </div>
    </>
  );
}
export function TeamPage() { return <RecruiterOnly><TeamInner /></RecruiterOnly>; }

/* ---------- Settings ---------- */
function SettingsInner() {
  const { org, setOrgs, setDrives } = useConsole();
  const patch = useOrgPatch();
  const toast = useToast();
  const [name, setName] = useState(org.name || "");
  const [email, setEmail] = useState(org.email || "");
  const [err, setErr] = useState("");
  useMeta({ title: "Settings" });
  function save(e) {
    e.preventDefault();
    if (email.trim() && !isWorkEmail(email.trim())) { setErr("Use a work email."); return; }
    setErr("");
    patch({ name: name.trim() || org.name, email: email.trim() || org.email });
    toast("Settings saved.");
  }
  return (
    <>
      <PageHead title="Settings" lede="Company details and how your drives look on the lobby display." />
      <div className="grid-12" style={{ alignItems: "start", rowGap: 24 }}>
        <form className="card card-pad stack gap-12 span-5" onSubmit={save} noValidate>
          <h2 className="h-4">Company</h2>
          <div className="field">
            <label className="label" htmlFor="st-name">Company name</label>
            <input id="st-name" className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field">
            <label className="label" htmlFor="st-email">Owner email</label>
            <input id="st-email" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!err} />
            {err && <p className="tiny" role="alert" style={{ color: "var(--danger)", margin: 0 }}>{err}</p>}
          </div>
          <div className="row gap-8" style={{ flexWrap: "wrap" }}>
            <Btn type="submit">Save</Btn>
            <Btn variant="ghost" to="/forgot-password">Reset password</Btn>
          </div>
        </form>
        <section className="card card-pad span-7 legacy-panel" aria-label="Lobby display brand">
          <BrandPanel org={org} setOrgs={setOrgs} setDrives={setDrives} embedded />
        </section>
      </div>
    </>
  );
}
export function SettingsPage() { return <RecruiterOnly><SettingsInner /></RecruiterOnly>; }

/* ---------- Talent pool ---------- */
const RANK = { selected: 5, onhold: 4, interviewing: 3, calling: 3, wait: 2, rejected: 1, absent: 0 };
const OUT = { selected: "Shortlisted", onhold: "On hold", rejected: "Not selected", absent: "No-show", wait: "Waiting", calling: "In round", interviewing: "In round" };

export function talentPool(drives) {
  const byPhone = new Map();
  for (const d of drives) {
    for (const c of d.candidates || []) {
      if (!c.phone || c.released) continue;
      const key = String(c.phone).replace(/\D/g, "").slice(-10);
      const seen = { driveId: d.id, role: d.role, date: d.date, state: c.state };
      const prev = byPhone.get(key);
      if (!prev) byPhone.set(key, { phone: key, name: c.name, email: c.email || "", exp: c.expBand || c.exp || "", drives: [seen], best: c.state, last: d.date });
      else {
        prev.drives.push(seen);
        if ((RANK[c.state] ?? -1) > (RANK[prev.best] ?? -1)) prev.best = c.state;
        if (String(d.date) > String(prev.last)) { prev.last = d.date; prev.name = c.name || prev.name; }
        if (!prev.email && c.email) prev.email = c.email;
      }
    }
  }
  return [...byPhone.values()].sort((a, b) => String(b.last).localeCompare(String(a.last)));
}

function TalentInner() {
  const { mine } = useConsole();
  const [q, setQ] = useState("");
  const [only, setOnly] = useState("all");
  useMeta({ title: t("console.nav.talent") });
  const pool = useMemo(() => talentPool(mine), [mine]);
  const needle = q.trim().toLowerCase();
  const list = pool.filter((p) => (only === "all" || p.best === only) && (!needle || p.name?.toLowerCase().includes(needle) || p.phone.includes(needle)));

  function exportCsv() {
    const cell = (v) => `"${String(v ?? "").replace(/"/g, "\"\"")}"`;
    const rows = [["Full name", "Phone", "Email", "Experience", "Best result", "Drives attended", "Last drive date", "Last role"],
      ...list.map((p) => [p.name, p.phone, p.email, p.exp, OUT[p.best] || p.best, p.drives.length, p.last, p.drives[p.drives.length - 1]?.role])];
    downloadFile("talent_pool.csv", `\uFEFF${rows.map((r) => r.map(cell).join(",")).join("\n")}`, "text/csv");
  }

  return (
    <>
      <PageHead title={t("console.nav.talent")} lede="Everyone who has walked in to your drives, one row per phone number."
        actions={<Btn variant="secondary" icon={Download} onClick={exportCsv} disabled={!list.length}>Export CSV</Btn>} />
      <div className="row gap-8" style={{ flexWrap: "wrap", marginBottom: 16 }}>
        <div className="search grow" style={{ minWidth: 220 }}>
          <Search size={17} strokeWidth={STROKE} aria-hidden="true" />
          <label className="sr-only" htmlFor="tp-q">Search name or phone</label>
          <input id="tp-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or phone" />
        </div>
        <div className="chips-scroll" role="group" aria-label="Filter by result">
          {[["all", "All"], ["selected", "Shortlisted"], ["onhold", "On hold"], ["rejected", "Not selected"], ["absent", "No-show"]].map(([k, l]) => (
            <button key={k} type="button" className="chip" aria-pressed={only === k} onClick={() => setOnly(k)}>{l}</button>
          ))}
        </div>
      </div>
      {list.length ? (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Name</th><th>Phone</th><th>Experience</th><th>Best result</th><th>Drives</th><th>Last drive</th></tr></thead>
            <tbody>
              {list.slice(0, 300).map((p) => (
                <tr key={p.phone}>
                  <td className="strong">{p.name}</td>
                  <td className="mono">{p.phone}</td>
                  <td>{p.exp || "—"}</td>
                  <td>{OUT[p.best] || p.best}</td>
                  <td className="mono">{p.drives.length}</td>
                  <td className="small">{shortDate(p.last)} · {p.drives[p.drives.length - 1]?.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <EmptyState icon={UserRound} title={pool.length ? "No one matches." : "No candidates yet."} body={pool.length ? "Try another name or filter." : "People appear here after your first drive."} />}
    </>
  );
}
export function TalentPage() { return <RecruiterOnly><TalentInner /></RecruiterOnly>; }
