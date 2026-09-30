import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Bookmark, BookmarkCheck, CalendarDays, Check, ChevronLeft, ChevronRight, Clock, ExternalLink, FileText, IndianRupee, Landmark, Lightbulb, ListOrdered, Search, Share2, SlidersHorizontal, X } from "lucide-react";
import { useStore } from "../context/Store.jsx";
import { Btn, CardSkeleton, DriveCard, EmptyState, Monogram, QueueLine, STROKE, WhenChip, joinPath, useSaved, useToast, whenText } from "../components/ds.jsx";
import { EXP_FILTERS, matchesQuery, cityFromSlug, cityPath, expLabel, expRange, hasPay, mapsUrl, monthlyPay, payText, payType, publicDrives, queueStats, sortForBoard, venueLine, waitLabel } from "../lib/listing.js";
import { clock, driveStatus, driveWhen, hoursLabel, datesLabel, driveSchedule, fromMinutes, istDate, shortDate } from "../lib/status.js";
import { ROLE_TYPES } from "../data/board.js";
import { driveRoles } from "../lib/library.js";
import { shareDrive } from "../lib/share.js";
import RemindMe from "../components/RemindMe.jsx";
import { useMeta } from "../hooks/useMeta.js";
import { t, tl } from "../i18n/strings.js";

const DATE_KEYS = ["any", "today", "tomorrow", "week", "month"];
const EXP_KEYS = ["any", "fresher", "0-1", "1-3", "3-5", "5+"];
const PAY_KEYS = ["any", "15", "25", "40", "60"];
const SORT_KEYS = ["soonest", "pay", "queue"];
const PAGE_SIZE = 20;

function matchesDate(d, key, now) {
  if (key === "any") return true;
  if (key === "month") return driveStatus(d, now) !== "wrapped" && String(d.date) <= istDate(30, now);
  const w = driveWhen(d, now).key;
  if (key === "week") return ["today", "tomorrow", "week"].includes(w);
  return w === key;
}

function matchesPay(d, key, includeNone) {
  if (key === "any") return true;
  const m = monthlyPay(d);
  return m == null ? includeNone : m >= Number(key) * 1000;
}

function applyFilters(list, f, now, skip) {
  return list.filter((d) =>
    (skip === "city" || !f.city || d.city === f.city)
    && (skip === "type" || !f.type || d.roleType === f.type)
    && (skip === "exp" || f.exp === "any" || EXP_FILTERS[f.exp]?.(expRange(d)))
    && (skip === "date" || matchesDate(d, f.date, now))
    && (skip === "pay" || matchesPay(d, f.pay, f.payNone))
    && matchesQuery(d, f.q));
}

function sortList(list, key, now) {
  const base = sortForBoard(list, now);
  if (key === "pay") return [...base].sort((a, b) => (monthlyPay(b) ?? -1) - (monthlyPay(a) ?? -1));
  if (key === "queue") {
    const q = (d) => (driveStatus(d, now) === "live" ? queueStats(d).waiting : Infinity);
    return [...base].sort((a, b) => q(a) - q(b));
  }
  return base;
}

function FilterGroup({ title, options, value, onPick }) {
  return (
    <div>
      <h3>{title}</h3>
      <div className="filter-list" role="group" aria-label={title}>
        {options.map((o) => (
          <button key={o.key} type="button" className="filter-opt" aria-pressed={value === o.key} onClick={() => onPick(o.key)}>
            <span>{o.label}</span>
            {o.count != null && <span className="count">{o.count}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function Filters({ open, pool, f, set, cityLocked, now }) {
  const count = (skip, pred) => applyFilters(pool, f, now, skip).filter(pred).length;
  const cities = useMemo(() => {
    const m = new Map();
    for (const d of applyFilters(pool, f, now, "city")) m.set(d.city, (m.get(d.city) || 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [pool, f, now]);
  return (
    <div className="filters" aria-label={t("browse.filters")}>
      {!cityLocked && (
        <FilterGroup title={t("browse.city")} value={f.city || ""} onPick={(v) => set({ city: v })}
          options={[{ key: "", label: t("browse.allCities") }, ...cities.slice(0, open ? 30 : 10).map(([c, n]) => ({ key: c, label: c, count: n }))]} />
      )}
      <FilterGroup title={t("browse.roleType")} value={f.type || ""} onPick={(v) => set({ type: v })}
        options={[{ key: "", label: t("browse.any") }, ...[...new Set([...ROLE_TYPES, ...pool.map((d) => d.roleType).filter(Boolean)])].map((rt) => ({ key: rt, label: rt, count: count("type", (d) => d.roleType === rt) })).filter((o) => o.count)]} />
      <FilterGroup title={t("browse.experience")} value={f.exp} onPick={(v) => set({ exp: v })}
        options={EXP_KEYS.map((k) => ({ key: k, label: t(`browse.exp.${k}`), count: k === "any" ? null : count("exp", (d) => EXP_FILTERS[k](expRange(d))) }))} />
      <FilterGroup title={t("browse.date")} value={f.date} onPick={(v) => set({ date: v })}
        options={DATE_KEYS.map((k) => ({ key: k, label: t(`browse.dates.${k}`), count: k === "any" ? null : count("date", (d) => matchesDate(d, k, now)) }))} />
      <div>
        <FilterGroup title={t("browse.pay")} value={f.pay} onPick={(v) => set({ pay: v })}
          options={PAY_KEYS.map((k) => ({ key: k, label: t(`browse.payOpts.${k}`), count: k === "any" ? null : count("pay", (d) => matchesPay(d, k, f.payNone)) }))} />
        {f.pay !== "any" && (
          <>
            <label className="filter-check">
              <input type="checkbox" checked={f.payNone} onChange={(e) => set({ nopay: e.target.checked ? "" : "0" })} />
              <span>{t("browse.payIncludeNone")}</span>
            </label>
            <p className="small muted" style={{ margin: "6px 0 0" }}>{t("browse.payHint")}</p>
          </>
        )}
      </div>
    </div>
  );
}

function Browse({ city }) {
  const { drives, hydrated, apiOk } = useStore();
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const [sheet, setSheet] = useState(false);
  const [qDraft, setQDraft] = useState(params.get("q") || "");
  const saved = useSaved();
  const now = Date.now();
  const f = {
    q: params.get("q") || "",
    city: city || params.get("city") || "",
    type: params.get("type") || "",
    exp: EXP_KEYS.includes(params.get("exp")) ? params.get("exp") : "any",
    date: DATE_KEYS.includes(params.get("date")) ? params.get("date") : "any",
    pay: PAY_KEYS.includes(params.get("pay")) ? params.get("pay") : "any",
    payNone: params.get("nopay") !== "0",
  };
  const sort = SORT_KEYS.includes(params.get("sort")) ? params.get("sort") : "soonest";
  const page = Math.max(1, Number(params.get("page")) || 1);
  useEffect(() => { setQDraft(params.get("q") || ""); }, [params]);

  const set = (patch) => {
    if ("city" in patch) {
      const rest = new URLSearchParams(params);
      rest.delete("city");
      rest.delete("page");
      const qs = rest.toString();
      nav(patch.city ? `${cityPath(patch.city)}${qs ? `?${qs}` : ""}` : `/walk-ins${qs ? `?${qs}` : ""}`);
      return;
    }
    const next = new URLSearchParams(params);
    if (!("page" in patch)) next.delete("page");
    for (const [key, v] of Object.entries(patch)) {
      if (!v || v === "any" || (key === "sort" && v === "soonest") || (key === "page" && v === 1)) next.delete(key);
      else next.set(key, String(v));
    }
    setParams(next, { replace: key0(patch) !== "page" });
  };
  const clear = () => nav(city ? cityPath(city) : "/walk-ins");

  const pool = useMemo(() => publicDrives(drives), [drives]);
  const hits = applyFilters(pool, f, now, null);
  const open = sortList(hits.filter((d) => driveStatus(d, now) !== "wrapped"), sort, now);
  const ended = sortForBoard(hits.filter((d) => driveStatus(d, now) === "wrapped"), now).slice(0, 6);
  const pages = Math.max(1, Math.ceil(open.length / PAGE_SIZE));
  const pageNo = Math.min(page, pages);
  const shown = open.slice((pageNo - 1) * PAGE_SIZE, pageNo * PAGE_SIZE);
  const activeCount = [f.type, f.exp !== "any", f.date !== "any", f.pay !== "any", !city && f.city].filter(Boolean).length;
  const loading = !hydrated && apiOk !== false && !pool.length;

  const cityPool = pool.filter((d) => !city || d.city === city);
  const todayCount = cityPool.filter((d) => driveWhen(d, now).key === "today" && driveStatus(d, now) !== "wrapped").length;
  const upcomingCount = cityPool.filter((d) => driveStatus(d, now) === "scheduled" && driveWhen(d, now).key !== "today").length;
  const companiesThisMonth = new Set(cityPool.filter((d) => matchesDate(d, "month", now)).map((d) => d.company)).size;

  useMeta(city
    ? { title: t("browse.meta.cityTitle", { city }), description: t("browse.meta.cityDescription", { city, count: open.length }) }
    : { title: t("browse.meta.title"), description: t("browse.meta.description", { count: open.length }) });

  const submitQ = (e) => { e.preventDefault(); set({ q: qDraft.trim() }); };
  const empty = city && !activeCount && !f.q ? "noCity" : "noResults";

  return (
    <>
      <section className="mesh" style={{ borderBottom: "1px solid var(--line)" }}>
        <div className="wrap" style={{ padding: "48px 24px 36px" }}>
          {city && (
            <nav aria-label={t("browse.breadcrumb")} className="small muted row gap-6" style={{ marginBottom: 14 }}>
              <Link to="/walk-ins" className="link" style={{ fontWeight: 600 }}>{t("nav.walkIns")}</Link>
              <ChevronRight size={14} strokeWidth={STROKE} aria-hidden="true" />
              <span>{city}</span>
            </nav>
          )}
          <h1 className="h-1 one-line">{city ? t("browse.cityTitle", { city }) : t("browse.title", { today_count: todayCount, upcoming_count: upcomingCount })}</h1>
          <p className="lede" style={{ marginTop: 12 }}>{city ? t("browse.cityIntro", { city, count: companiesThisMonth }) : t("browse.lede")}</p>
          <form className="search" role="search" onSubmit={submitQ} style={{ maxWidth: 640, marginTop: 24 }}>
            <Search size={20} strokeWidth={STROKE} aria-hidden="true" style={{ color: "var(--muted)", flexShrink: 0 }} />
            <label htmlFor="browse-q" className="sr-only">{t("home.hero.searchPlaceholder")}</label>
            <input id="browse-q" value={qDraft} onChange={(e) => setQDraft(e.target.value)} placeholder={t("home.hero.searchPlaceholder")} autoComplete="off" />
            {qDraft && <button type="button" className="btn btn-ghost btn-icon" aria-label={t("buttons.clear")} onClick={() => { setQDraft(""); set({ q: "" }); }}><X size={18} strokeWidth={STROKE} /></button>}
            <button type="submit" className="btn btn-primary">{t("home.hero.search")}</button>
          </form>
        </div>
      </section>
      <section className="wrap" style={{ padding: "32px 24px 96px" }}>
        <div className="browse">
          <aside className="hide-mobile-sheet">
            <Filters pool={pool} f={f} set={set} cityLocked={!!city} now={now} />
          </aside>
          <div className="stack gap-16">
            <div className="row between gap-12" style={{ flexWrap: "wrap" }}>
              <p className="small" style={{ margin: 0, color: "var(--ink-2)" }} aria-live="polite">
                {open.length
                  ? t("browse.results", { from: (pageNo - 1) * PAGE_SIZE + 1, to: (pageNo - 1) * PAGE_SIZE + shown.length, total: open.length })
                  : t("browse.resultsNone")}
              </p>
              <div className="row gap-8" style={{ flexWrap: "wrap" }}>
                <Link to="/saved" className="chip">
                  {saved.count ? t("browse.savedCount", { n: saved.count }) : t("browse.saved")}
                </Link>
                <label className="sr-only" htmlFor="browse-sort">{t("browse.sort")}</label>
                <select id="browse-sort" className="select" style={{ width: "auto", minHeight: 36 }} value={sort} onChange={(e) => set({ sort: e.target.value })}>
                  {SORT_KEYS.map((k) => <option key={k} value={k}>{t(`browse.sorts.${k}`)}</option>)}
                </select>
                {activeCount > 0 && <button type="button" className="btn btn-ghost btn-sm" onClick={clear}>{t("browse.clear")}</button>}
                <button type="button" className="btn btn-secondary btn-sm show-filters" onClick={() => setSheet(true)}>
                  <SlidersHorizontal size={16} strokeWidth={STROKE} aria-hidden="true" /> {t("browse.filters")}{activeCount ? ` · ${activeCount}` : ""}
                </button>
              </div>
            </div>
            {loading ? (
              <div className="cards-2" aria-label={t("browse.loading")}>{Array.from({ length: 4 }, (_, i) => <CardSkeleton key={i} />)}</div>
            ) : shown.length ? (
              <div className="cards-2">{shown.map((d) => <DriveCard key={d.id} drive={d} saved={saved} />)}</div>
            ) : (
              <EmptyState title={t(`empty.${empty}.t`, { city })} body={t(`empty.${empty}.d`)}
                action={<Btn variant="secondary" onClick={empty === "noResults" ? clear : () => nav("/walk-ins")}>{t(`empty.${empty}.cta`)}</Btn>} />
            )}
            {pages > 1 && (
              <nav className="row between gap-12" aria-label={t("browse.page", { n: pageNo, total: pages })}>
                <Btn variant="secondary" size="sm" icon={ChevronLeft} disabled={pageNo <= 1} onClick={() => { set({ page: pageNo - 1 }); window.scrollTo(0, 0); }}>{t("browse.prev")}</Btn>
                <span className="small muted">{t("browse.page", { n: pageNo, total: pages })}</span>
                <Btn variant="secondary" size="sm" iconRight={ChevronRight} disabled={pageNo >= pages} onClick={() => { set({ page: pageNo + 1 }); window.scrollTo(0, 0); }}>{t("browse.next")}</Btn>
              </nav>
            )}
            {ended.length > 0 && (
              <div style={{ marginTop: 40 }}>
                <h2 className="h-3" style={{ marginBottom: 16 }}>{t("browse.ended")}</h2>
                <div className="cards-2" style={{ opacity: 0.85 }}>{ended.map((d) => <DriveCard key={d.id} drive={d} />)}</div>
              </div>
            )}
            {!city && (
              <div style={{ marginTop: 40 }}>
                <h2 className="h-3" style={{ marginBottom: 12 }}>{t("browse.byCity")}</h2>
                <div className="wrap-row gap-8">
                  {[...new Set(pool.map((d) => d.city))].sort().map((c) => <Link key={c} to={cityPath(c)} className="chip">{c}</Link>)}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      {sheet && (
        <div className="filter-sheet" role="dialog" aria-modal="true" aria-label={t("browse.filters")} onClick={(e) => { if (e.target === e.currentTarget) setSheet(false); }}>
          <div>
            <div className="row between" style={{ marginBottom: 18 }}>
              <h2 className="h-3">{t("browse.filters")}</h2>
              <button type="button" className="btn btn-ghost btn-icon" aria-label={t("browse.closeFilters")} onClick={() => setSheet(false)}><X size={22} strokeWidth={STROKE} /></button>
            </div>
            <Filters open pool={pool} f={f} set={set} cityLocked={!!city} now={now} />
            <div className="row gap-8" style={{ marginTop: 24, position: "sticky", bottom: 0 }}>
              <Btn variant="secondary" onClick={clear}>{t("browse.clear")}</Btn>
              <Btn block onClick={() => setSheet(false)}>{t("browse.show", { n: open.length })}</Btn>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const key0 = (patch) => Object.keys(patch)[0];

function jobPosting(d) {
  const { end, close } = driveSchedule(d);
  const ld = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: d.role,
    description: d.jd || d.role,
    datePosted: d.date,
    validThrough: `${end}T${fromMinutes(close)}:00+05:30`,
    employmentType: "FULL_TIME",
    hiringOrganization: { "@type": "Organization", name: d.company },
    jobLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", streetAddress: [d.venue, d.area].filter(Boolean).join(", "), addressLocality: d.city, addressCountry: "IN" },
    },
  };
  const unitText = { month: "MONTH", fixed: "MONTH", day: "DAY", hour: "HOUR", year: "YEAR" }[payType(d)];
  if (hasPay(d) && unitText) {
    ld.baseSalary = { "@type": "MonetaryAmount", currency: "INR", value: { "@type": "QuantitativeValue", minValue: d.payMin || d.payMax, maxValue: d.payMax || d.payMin, unitText } };
  }
  const [lo] = expRange(d);
  ld.experienceRequirements = lo === 0 ? "No experience needed" : { "@type": "OccupationalExperienceRequirements", monthsOfExperience: lo * 12 };
  return ld;
}

function Section({ icon: Icon, title, children }) {
  return (
    <section className="card card-pad">
      <h2 className="row gap-10" style={{ gap: 10 }}><Icon size={20} strokeWidth={STROKE} aria-hidden="true" style={{ color: "var(--primary)" }} />{title}</h2>
      {children}
    </section>
  );
}

function Detail({ drive }) {
  const { drives } = useStore();
  const nav = useNavigate();
  const toast = useToast();
  const saved = useSaved();
  const status = driveStatus(drive);
  const live = status === "live";
  const ended = status === "wrapped";
  const q = queueStats(drive);
  const pay = payText(drive);
  const isSaved = saved.has(drive.id);
  const similar = useMemo(() => sortForBoard(publicDrives(drives).filter((d) => d.city === drive.city && d.id !== drive.id && driveStatus(d) !== "wrapped")).slice(0, 3), [drives, drive]);
  const closedLine = t("detail.closed", { date: shortDate(drive.date), time: clock(fromMinutes(driveSchedule(drive).open)) });

  useMeta({
    title: t("detail.meta.title", { role: drive.role, company: drive.company, place: venueLine(drive) }),
    description: t("detail.meta.description", { company: drive.company, role: drive.role, city: drive.city, dates: datesLabel(drive), hours: hoursLabel(drive) }),
    jsonLd: jobPosting(drive),
  });

  const toggleSave = () => { toast(t(isSaved ? "toast.unsaved" : "toast.saved")); saved.toggle(drive.id); };
  const share = () => shareDrive(drive, toast);
  const saveBtn = (props) => <Btn variant="secondary" icon={isSaved ? BookmarkCheck : Bookmark} aria-pressed={isSaved} onClick={toggleSave} {...props}>{isSaved ? t("buttons.saved") : t("buttons.save")}</Btn>;
  const primary = live
    ? <Btn size="lg" block onClick={() => nav(joinPath(drive))}>{t("buttons.getToken")}</Btn>
    : !ended ? saveBtn({ size: "lg", block: true }) : null;

  const rounds = drive.rounds || [];
  const docs = drive.docs || [];
  const roles = driveRoles(drive);
  return (
    <div className="has-sticky-cta">
      <div className="wrap" style={{ padding: "28px 24px 0" }}>
        <nav aria-label={t("browse.breadcrumb")} className="small muted row gap-6" style={{ flexWrap: "wrap" }}>
          <Link to="/walk-ins" className="link" style={{ fontWeight: 600 }}>{t("nav.walkIns")}</Link>
          <ChevronRight size={14} strokeWidth={STROKE} aria-hidden="true" />
          {drive.city && <><Link to={cityPath(drive.city)} className="link" style={{ fontWeight: 600 }}>{drive.city}</Link><ChevronRight size={14} strokeWidth={STROKE} aria-hidden="true" /></>}
          <span>{drive.role}</span>
        </nav>
      </div>
      <header className="wrap" style={{ padding: "24px 24px 32px" }}>
        <div className="row gap-16" style={{ alignItems: "flex-start" }}>
          <Monogram name={drive.company} color={drive.brand?.color} size={56} />
          <div className="grow stack gap-8">
            <h1 className="h-1">{drive.role}</h1>
            <p className="lede" style={{ fontSize: 18 }}>{drive.company} · {venueLine(drive)}</p>
            <div className="wrap-row gap-6" style={{ marginTop: 4 }}>
              <WhenChip drive={drive} />
              <span className="tag">{expLabel(drive)}</span>
              {drive.roleType && <span className="tag">{drive.roleType}</span>}
              {drive.openings ? <span className="tag">{t("detail.openings", { n: drive.openings })}</span> : null}
              {drive.board && <span className="tag" title={t("card.demoHint")}>{t("card.demo")}</span>}
            </div>
          </div>
        </div>
      </header>
      <div className="wrap" style={{ paddingBottom: 96 }}>
        <div className="detail">
          <div className="stack gap-16">
            <Section icon={FileText} title={t("detail.about")}>
              <p className="body" style={{ maxWidth: "68ch" }}>{drive.jd}</p>
            </Section>
            <div className="cards-2">
              <Section icon={CalendarDays} title={t("detail.when")}>
                <p className="strong" style={{ margin: 0 }}>{whenText(drive)}</p>
                <p className="body" style={{ marginTop: 12, marginBottom: 0 }}>{drive.venue}</p>
                <p className="body muted" style={{ marginTop: 4 }}>{venueLine(drive)}</p>
                {drive.landmark && <p className="small row gap-8" style={{ marginTop: 8, alignItems: "flex-start" }}><Landmark size={16} strokeWidth={STROKE} aria-hidden="true" style={{ color: "var(--muted)", marginTop: 2, flexShrink: 0 }} /><span><span className="muted">{t("detail.landmark")}:</span> {drive.landmark}</span></p>}
                <div style={{ marginTop: 14 }}><Btn href={mapsUrl(drive)} target="_blank" rel="noreferrer" variant="secondary" size="sm" iconRight={ExternalLink}>{t("detail.map")}</Btn></div>
              </Section>
              <Section icon={IndianRupee} title={t("detail.pay")}>
                {roles.length > 1 ? (
                  <ul className="stack gap-12" style={{ listStyle: "none", margin: 0, padding: 0 }}>
                    {roles.map((r) => (
                      <li key={r.id}>
                        <p className="strong" style={{ margin: 0 }}>{r.title}</p>
                        <p className={hasPay(r) ? "body" : "body muted"} style={{ margin: "2px 0 0" }}>{payText(r)}</p>
                        <p className="small muted" style={{ margin: "2px 0 0" }}>{[expLabel(r), r.openings ? t("detail.openings", { n: r.openings }) : "", r.notes].filter(Boolean).join(" · ")}</p>
                      </li>
                    ))}
                  </ul>
                ) : <>
                  <p className={hasPay(drive) ? "strong" : "muted"} style={{ margin: 0, fontSize: 18 }}>{pay}</p>
                  <p className="body muted" style={{ marginTop: 4 }}>{t("detail.experience")}: {expLabel(drive)}</p>
                  {drive.openings ? <p className="small muted" style={{ marginTop: 12 }}>{t("detail.openings", { n: drive.openings })}</p> : null}
                </>}
              </Section>
            </div>
            {docs.length > 0 && (
              <Section icon={Check} title={t("detail.carry")}>
                <ul className="checklist">{docs.map((d) => <li key={d}><Check size={18} strokeWidth={2.25} aria-hidden="true" />{d}</li>)}</ul>
              </Section>
            )}
            {rounds.length > 0 && (
              <Section icon={ListOrdered} title={t("detail.day")}>
                <p className="small muted" style={{ marginTop: 0 }}>{rounds.length === 1 ? t("detail.dayOne") : t("detail.dayRounds", { n: rounds.length })}</p>
                <div className="rounds">
                  {rounds.map((r, i) => (
                    <span key={r.id} className="row gap-8">
                      <span className="round-step"><b>{i + 1}</b>{r.name}</span>
                      {i < rounds.length - 1 && <ChevronRight size={16} strokeWidth={STROKE} aria-hidden="true" style={{ color: "var(--faint)" }} />}
                    </span>
                  ))}
                </div>
              </Section>
            )}
            <Section icon={Lightbulb} title={t("detail.before.title")}>
              <ol className="stack gap-8" style={{ margin: 0, paddingLeft: 20 }}>
                {tl("detail.before.tips").map((tip) => <li key={tip} className="body">{tip}</li>)}
              </ol>
            </Section>
          </div>
          <aside className="detail-aside">
            <div className="card card-pad stack gap-16">
              <p className={hasPay(drive) ? "h-3" : "body muted"} style={{ margin: 0 }}>{pay}</p>
              <div className="row gap-8"><WhenChip drive={drive} /><span className="small muted">{hoursLabel(drive)}</span></div>
              {live && (
                <div className="panel" style={{ padding: 16 }}>
                  <p className="tiny muted" style={{ margin: 0, fontWeight: 600 }}>{t("detail.queueNow")}</p>
                  <div className="row gap-16" style={{ marginTop: 8 }}>
                    <div><span className="mono strong" style={{ fontSize: 28, fontWeight: 800 }}>{q.waiting}</span><span className="small muted"> {t("detail.inQueue")}</span></div>
                    <div className="small muted row gap-6"><Clock size={16} strokeWidth={STROKE} aria-hidden="true" />{waitLabel(q.estMin)}</div>
                  </div>
                </div>
              )}
              {primary}
              {live && <p className="small muted" style={{ margin: 0 }}>{t("detail.live")}</p>}
              {!live && !ended && <p className="small muted" style={{ margin: 0 }}>{closedLine}</p>}
              {status === "scheduled" && <RemindMe drive={drive} block />}
              {ended && <p className="small muted" style={{ margin: 0 }}><Link to={cityPath(drive.city)} className="link">{t("detail.ended", { city: drive.city })}</Link></p>}
              <Btn variant="ghost" size="sm" icon={Share2} onClick={share}>{t("buttons.share")}</Btn>
            </div>
          </aside>
        </div>
        {similar.length > 0 && (
          <section style={{ marginTop: 64 }}>
            <div className="row between" style={{ marginBottom: 20 }}>
              <h2 className="h-2">{t("detail.similar", { city: drive.city })}</h2>
              <Link to={cityPath(drive.city)} className="link hide-mobile">{t("detail.seeAll")}</Link>
            </div>
            <div className="cards-3">{similar.map((d) => <DriveCard key={d.id} drive={d} saved={saved} />)}</div>
          </section>
        )}
      </div>
      {!ended && (
        <div className="sticky-cta">
          <div className="grow" style={{ minWidth: 0 }}>
            <p className="strong small clamp-1" style={{ margin: 0 }}>{t("detail.sticky", { company: drive.company, role: drive.role })}</p>
            {live ? <QueueLine drive={drive} /> : <p className="tiny muted" style={{ margin: 0 }}>{whenText(drive)}</p>}
          </div>
          {live ? <Btn onClick={() => nav(joinPath(drive))}>{t("buttons.getToken")}</Btn> : saveBtn({})}
        </div>
      )}
    </div>
  );
}

function NotFound() {
  useMeta({ title: t("detail.notFound.t") });
  return (
    <div className="wrap" style={{ padding: "80px 24px" }}>
      <EmptyState title={t("detail.notFound.t")} body={t("detail.notFound.d")} action={<Btn to="/walk-ins" icon={ArrowLeft}>{t("detail.notFound.cta")}</Btn>} />
    </div>
  );
}

export default function WalkInsPage() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const { drives, hydrated } = useStore();
  if (!slug && params.get("saved") === "1") return <Navigate to="/saved" replace />;
  if (!slug) return <Browse />;
  const drive = drives.find((d) => d.id === slug && d.visibility !== "private" && !d.listingPending);
  if (drive) return <Detail drive={drive} />;
  const city = cityFromSlug(slug, publicDrives(drives));
  if (city) return <Browse city={city} />;
  if (!hydrated) return <div className="wrap" style={{ padding: "48px 24px" }}><div className="cards-2"><CardSkeleton /><CardSkeleton /></div></div>;
  return <NotFound />;
}
