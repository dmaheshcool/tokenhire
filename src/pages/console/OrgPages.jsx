import { useMemo, useState } from "react";
import { Navigate, NavLink } from "react-router-dom";
import { Archive, ArchiveRestore, BookOpen, Download, MapPin, Merge, Pencil, Plus, Search, Trash2, UserRound, Users } from "lucide-react";
import { Btn, EmptyState, Monogram, STROKE, useToast } from "../../components/ds.jsx";
import { PageHead, useConsole } from "../../layouts/ConsoleLayout.jsx";
import { useMeta } from "../../hooks/useMeta.js";
import { useLibrary } from "../../hooks/useLibrary.js";
import { LIBRARY_KINDS, addItem, mergeItems, nameOf, relinkDrives, renameItem, setActive, usesOf, withNewItems } from "../../lib/library.js";
import { payText } from "../../lib/listing.js";
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

/* ---------- Settings > Library ---------- */
function SettingsTabs() {
  return (
    <nav className="tabs settings-tabs" aria-label={t("console.nav.settings")}>
      <NavLink to="/app/settings" end className={({ isActive }) => (isActive ? "active" : "")}>{t("settings.tabs.company")}</NavLink>
      <NavLink to="/app/settings/library" className={({ isActive }) => (isActive ? "active" : "")}>{t("settings.tabs.library")}</NavLink>
    </nav>
  );
}

function LibraryRow({ kind, item, uses, others, hint, onRename, onMerge, onArchive }) {
  const [mode, setMode] = useState("");
  const [text, setText] = useState(nameOf(kind, item));
  const [into, setInto] = useState("");
  const [err, setErr] = useState("");
  const name = nameOf(kind, item);
  const archived = item.active === false;
  const rename = (e) => {
    e.preventDefault();
    const error = onRename(text);
    if (error) setErr(error);
    else { setMode(""); setErr(""); }
  };
  return (
    <div className={`lib-row${archived ? " archived" : ""}`}>
      {mode === "rename" ? (
        <form className="row gap-8 grow" onSubmit={rename} style={{ flexWrap: "wrap" }}>
          <label className="sr-only" htmlFor={`ren-${item.id}`}>{t("library.renameLabel", { name })}</label>
          <input id={`ren-${item.id}`} className="input grow" style={{ minWidth: 180 }} value={text} onChange={(e) => { setText(e.target.value); setErr(""); }} autoFocus aria-invalid={!!err} />
          <Btn type="submit" size="sm">{t("library.save")}</Btn>
          <Btn size="sm" variant="ghost" onClick={() => { setMode(""); setText(name); setErr(""); }}>{t("buttons.cancel")}</Btn>
          {err && <p className="tiny span-12" role="alert" style={{ color: "var(--danger)", margin: 0, flexBasis: "100%" }}>{err}</p>}
        </form>
      ) : mode === "merge" ? (
        <div className="row gap-8 grow" style={{ flexWrap: "wrap" }}>
          <label className="small strong" htmlFor={`mrg-${item.id}`}>{t("library.mergeLabel", { name })}</label>
          <select id={`mrg-${item.id}`} className="select" style={{ width: "auto", minWidth: 180 }} value={into} onChange={(e) => setInto(e.target.value)}>
            <option value="">{t("library.mergePick")}</option>
            {others.map((o) => <option key={o.id} value={o.id}>{nameOf(kind, o)}</option>)}
          </select>
          <Btn size="sm" disabled={!into} onClick={() => { onMerge(into); setMode(""); }}>{t("library.mergeGo")}</Btn>
          <Btn size="sm" variant="ghost" onClick={() => setMode("")}>{t("buttons.cancel")}</Btn>
        </div>
      ) : (
        <>
          <div className="lib-name">
            {name}
            {archived && <span className="tag" style={{ marginLeft: 8 }}>{t("library.archived")}</span>}
            {hint && <p className="tiny muted" style={{ margin: "2px 0 0", fontWeight: 400 }}>{hint}</p>}
          </div>
          <span className="tiny muted">{uses === 1 ? t("library.usesOne") : t("library.uses", { n: uses })}</span>
          <div className="lib-actions">
            {!archived && <Btn size="sm" variant="ghost" icon={Pencil} onClick={() => setMode("rename")}>{t("library.rename")}</Btn>}
            {!archived && others.length > 0 && <Btn size="sm" variant="ghost" icon={Merge} onClick={() => setMode("merge")}>{t("library.merge")}</Btn>}
            <Btn size="sm" variant="ghost" icon={archived ? ArchiveRestore : Archive} onClick={() => onArchive(archived)}>{archived ? t("library.restore") : t("library.archive")}</Btn>
          </div>
        </>
      )}
    </div>
  );
}

function LibraryInner() {
  const toast = useToast();
  const { lib, update, drives, setDrives, orgId } = useLibrary();
  const [kind, setKind] = useState("processes");
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  useMeta({ title: t("library.title") });

  const items = lib[kind] || [];
  const active = items.filter((x) => x.active !== false);
  const archived = items.filter((x) => x.active === false);
  const procName = (id) => lib.processes.find((p) => p.id === id)?.name || "";
  const hintFor = (x) => {
    if (kind !== "roles") return "";
    const bits = [procName(x.processId)];
    if (x.payType && (x.payMin !== "" || x.payMax !== "")) bits.push(payText(x));
    return bits.filter(Boolean).join(" · ");
  };

  function add(e) {
    e.preventDefault();
    const r = addItem(lib, kind, text);
    if (!r.item) { setErr(t(kind === "documents" ? "console.form.docBad" : "library.empty")); return; }
    update((cur) => withNewItems(cur, r.lib));
    setText("");
    setErr("");
    toast(t("library.added"));
  }
  function rename(item, value) {
    const r = renameItem(lib, kind, item.id, value);
    if (r.error) return t(r.error === "taken" ? "library.taken" : kind === "documents" ? "console.form.docBad" : "library.empty");
    update((cur) => renameItem(cur, kind, item.id, value).lib);
    setDrives((p) => relinkDrives(p, orgId, kind, item.id, { ...item, [kind === "roles" ? "title" : kind === "documents" ? "label" : "name"]: r.name }));
    toast(t("library.renamed"));
    return "";
  }
  function merge(item, intoId) {
    const into = items.find((x) => x.id === intoId);
    if (!into) return;
    update((cur) => mergeItems(cur, kind, item.id, intoId));
    setDrives((p) => relinkDrives(p, orgId, kind, item.id, into));
    toast(t("library.merged", { from: nameOf(kind, item), into: nameOf(kind, into) }));
  }
  function archive(item, restore) {
    update((cur) => setActive(cur, kind, item.id, restore));
    toast(t(restore ? "library.restored" : "library.archivedToast"));
  }

  const row = (x) => (
    <LibraryRow key={x.id} kind={kind} item={x} uses={usesOf(drives, orgId, kind, x)} hint={hintFor(x)}
      others={active.filter((o) => o.id !== x.id)}
      onRename={(v) => rename(x, v)} onMerge={(into) => merge(x, into)} onArchive={(restore) => archive(x, restore)} />
  );

  return (
    <>
      <PageHead title={t("console.nav.settings")} lede={t("library.lede")} />
      <SettingsTabs />
      <div className="chips-scroll" role="tablist" aria-label={t("library.title")} style={{ marginBottom: 16 }}>
        {LIBRARY_KINDS.map((k) => (
          <button key={k} type="button" role="tab" className="chip" aria-selected={kind === k} aria-pressed={kind === k}
            onClick={() => { setKind(k); setText(""); setErr(""); setShowArchived(false); }}>
            {t(`library.kinds.${k}`)} <span className="mono" style={{ opacity: 0.6, marginLeft: 4 }}>{(lib[k] || []).filter((x) => x.active !== false).length}</span>
          </button>
        ))}
      </div>
      <div className="grid-12" style={{ alignItems: "start", rowGap: 24 }}>
        <div className="span-7 stack gap-12" role="tabpanel">
          <p className="small muted" style={{ margin: 0 }}>{t(`library.help.${kind}`)}</p>
          {active.length ? <div className="card" style={{ padding: 0 }}>{active.map(row)}</div>
            : <EmptyState icon={BookOpen} title={t("library.none")} body={t("library.noneBody")} />}
          {archived.length > 0 && (
            <div className="stack gap-8">
              <button type="button" className="link small" style={{ alignSelf: "flex-start" }} aria-expanded={showArchived} onClick={() => setShowArchived((s) => !s)}>
                {t(showArchived ? "library.hideArchived" : "library.showArchived", { n: archived.length })}
              </button>
              {showArchived && <div className="card" style={{ padding: 0 }}>{archived.map(row)}</div>}
            </div>
          )}
        </div>
        <form className="card card-pad stack gap-12 span-5" onSubmit={add} noValidate>
          <h2 className="h-4">{t(`library.addTitle.${kind}`)}</h2>
          <div className="field">
            <label className="label" htmlFor="lib-add">{t("library.name")}</label>
            <input id="lib-add" className="input" value={text} onChange={(e) => { setText(e.target.value); setErr(""); }} placeholder={t(`library.placeholder.${kind}`)} aria-invalid={!!err} />
            {err && <p className="tiny" role="alert" style={{ color: "var(--danger)", margin: 0 }}>{err}</p>}
          </div>
          <Btn type="submit" icon={Plus}>{t("library.add")}</Btn>
        </form>
      </div>
    </>
  );
}
export function LibraryPage() { return <RecruiterOnly><LibraryInner /></RecruiterOnly>; }

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
      <PageHead title={t("console.nav.settings")} lede="Company details and how your drives look on the lobby display." />
      <SettingsTabs />
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
