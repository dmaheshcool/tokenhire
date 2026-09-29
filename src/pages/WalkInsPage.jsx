import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Bookmark, BookmarkCheck, CalendarDays, Check, ChevronRight, Clock, ExternalLink, FileText, IndianRupee, Landmark, ListOrdered, MapPin, Search, Share2, SlidersHorizontal, X } from "lucide-react";
import { useStore } from "../context/Store.jsx";
import { Btn, CardSkeleton, DriveCard, EmptyState, LiveDot, Monogram, QueueLine, STROKE, WhenChip, joinPath, useSaved, useToast } from "../components/ds.jsx";
import { EXP_FILTERS, cityFromSlug, cityPath, expLabel, expRange, mapsUrl, payLabel, publicDrives, queueStats, sortForBoard, venueLine, waitLabel } from "../lib/listing.js";
import { driveStatus, driveWhen, hoursLabel, datesLabel, driveSchedule, fromMinutes } from "../lib/status.js";
import { ROLE_TYPES } from "../data/board.js";
import { useMeta } from "../hooks/useMeta.js";
import { t } from "../i18n/strings.js";

const DATE_KEYS = ["any", "today", "tomorrow", "week"];
const EXP_KEYS = ["any", "fresher", "1-3", "3-6", "6+"];
const PAY_KEYS = ["any", "15", "25", "40", "60"];

function matchesQuery(d, q) {
  if (!q) return true;
  const hay = [d.role, d.company, d.city, d.area, d.venue, d.roleType, d.branch].filter(Boolean).join(" ").toLowerCase();
  return q.toLowerCase().split(/\s+/).filter(Boolean).every((w) => hay.includes(w));
}

function matchesDate(d, key, now) {
  if (key === "any") return true;
  const w = driveWhen(d, now).key;
  if (key === "week") return ["today", "tomorrow", "week"].includes(w);
  return w === key;
}

function applyFilters(list, f, now, skip) {
  return list.filter((d) =>
    (skip === "city" || !f.city || d.city === f.city)
    && (skip === "type" || !f.type || d.roleType === f.type)
    && (skip === "exp" || f.exp === "any" || EXP_FILTERS[f.exp]?.(expRange(d)))
    && (skip === "date" || matchesDate(d, f.date, now))
    && (skip === "pay" || f.pay === "any" || (Number(d.payMax) || 0) >= Number(f.pay) * 1000)
    && matchesQuery(d, f.q));
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
      <FilterGroup title={t("browse.date")} value={f.date} onPick={(v) => set({ date: v })}
        options={DATE_KEYS.map((k) => ({ key: k, label: t(`browse.dates.${k}`), count: k === "any" ? null : count("date", (d) => matchesDate(d, k, now)) }))} />
      <FilterGroup title={t("browse.roleType")} value={f.type || ""} onPick={(v) => set({ type: v })}
        options={[{ key: "", label: t("browse.any") }, ...ROLE_TYPES.map((rt) => ({ key: rt, label: rt, count: count("type", (d) => d.roleType === rt) })).filter((o) => o.count)]} />
      <FilterGroup title={t("browse.experience")} value={f.exp} onPick={(v) => set({ exp: v })}
        options={EXP_KEYS.map((k) => ({ key: k, label: t(`browse.exp.${k}`), count: k === "any" ? null : count("exp", (d) => EXP_FILTERS[k](expRange(d))) }))} />
      <FilterGroup title={t("browse.salary")} value={f.pay} onPick={(v) => set({ pay: v })}
        options={PAY_KEYS.map((k) => ({ key: k, label: t(`browse.pay.${k}`), count: k === "any" ? null : count("pay", (d) => (Number(d.payMax) || 0) >= Number(k) * 1000) }))} />
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
  };
  useEffect(() => { setQDraft(params.get("q") || ""); }, [params]);

  const set = (patch) => {
    if ("city" in patch) {
      const rest = new URLSearchParams(params);
      rest.delete("city");
      const qs = rest.toString();
      nav(patch.city ? `${cityPath(patch.city)}${qs ? `?${qs}` : ""}` : `/walk-ins${qs ? `?${qs}` : ""}`);
      return;
    }
    const next = new URLSearchParams(params);
    for (const [key, v] of Object.entries(patch)) {
      if (!v || v === "any") next.delete(key);
      else next.set(key, v);
    }
    setParams(next, { replace: true });
  };
  const clear = () => nav(city ? cityPath(city) : "/walk-ins");

  const pool = useMemo(() => publicDrives(drives), [drives]);
  const hits = applyFilters(pool, f, now);
  const open = sortForBoard(hits.filter((d) => driveStatus(d, now) !== "wrapped"), now);
  const ended = sortForBoard(hits.filter((d) => driveStatus(d, now) === "wrapped"), now).slice(0, 6);
  const liveCount = open.filter((d) => driveStatus(d, now) === "live").length;
  const activeCount = [f.type, f.exp !== "any", f.date !== "any", f.pay !== "any", !city && f.city].filter(Boolean).length;
  const loading = !hydrated && apiOk !== false && !pool.length;

  useMeta({
    title: city ? `Walk-in interviews in ${city}` : "Walk-in interviews near you",
    description: city
      ? `${open.length} walk-in drives in ${city} with timing, venue, pay and a live queue. Get a digital token and walk in when it’s your turn.`
      : `${open.length} walk-in drives across India with timing, venue, pay and a live queue. Filter by city, role, experience, date and salary.`,
  });

  const submitQ = (e) => { e.preventDefault(); set({ q: qDraft.trim() }); };

  return (
    <>
      <section className="mesh" style={{ borderBottom: "1px solid var(--line)" }}>
        <div className="wrap" style={{ padding: "48px 24px 36px" }}>
          {city && (
            <nav aria-label="Breadcrumb" className="small muted row gap-6" style={{ marginBottom: 14 }}>
              <Link to="/walk-ins" className="link" style={{ fontWeight: 600 }}>{t("nav.walkIns")}</Link>
              <ChevronRight size={14} strokeWidth={STROKE} aria-hidden="true" />
              <span>{city}</span>
            </nav>
          )}
          <h1 className="h-1 one-line">{city ? t("browse.titleCity", { city }) : t("browse.title")}</h1>
          <p className="lede" style={{ marginTop: 12 }}>{city ? t("browse.ledeCity", { city }) : t("browse.lede")}</p>
          <form className="search" role="search" onSubmit={submitQ} style={{ maxWidth: 640, marginTop: 24 }}>
            <Search size={20} strokeWidth={STROKE} aria-hidden="true" style={{ color: "var(--muted)", flexShrink: 0 }} />
            <label htmlFor="browse-q" className="sr-only">{t("home.searchPlaceholder")}</label>
            <input id="browse-q" value={qDraft} onChange={(e) => setQDraft(e.target.value)} placeholder={t("home.searchPlaceholder")} autoComplete="off" />
            {qDraft && <button type="button" className="btn btn-ghost btn-icon" aria-label="Clear search" onClick={() => { setQDraft(""); set({ q: "" }); }}><X size={18} strokeWidth={STROKE} /></button>}
            <button type="submit" className="btn btn-primary">{t("home.search")}</button>
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
              <p className="small" style={{ margin: 0, color: "var(--ink-2)" }}>
                <b className="mono" style={{ color: "var(--ink)" }}>{open.length}</b> {open.length === 1 ? "drive" : "drives"}
                {liveCount > 0 && <> · <span className="row gap-6" style={{ display: "inline-flex" }}><LiveDot /> <b className="mono">{liveCount}</b> live now</span></>}
              </p>
              <div className="row gap-8">
                {activeCount > 0 && <button type="button" className="btn btn-ghost btn-sm" onClick={clear}>{t("browse.clear")}</button>}
                <button type="button" className="btn btn-secondary btn-sm show-filters" onClick={() => setSheet(true)}>
                  <SlidersHorizontal size={16} strokeWidth={STROKE} aria-hidden="true" /> {t("browse.filters")}{activeCount ? ` · ${activeCount}` : ""}
                </button>
              </div>
            </div>
            {loading ? (
              <div className="cards-2">{Array.from({ length: 4 }, (_, i) => <CardSkeleton key={i} />)}</div>
            ) : open.length ? (
              <div className="cards-2">{open.map((d) => <DriveCard key={d.id} drive={d} saved={saved} />)}</div>
            ) : (
              <EmptyState title={t("browse.empty.t")} body={t("browse.empty.d")} action={<Btn variant="secondary" onClick={clear}>{t("browse.empty.cta")}</Btn>} />
            )}
            {ended.length > 0 && (
              <div style={{ marginTop: 40 }}>
                <h2 className="h-3" style={{ marginBottom: 16 }}>{t("browse.ended")}</h2>
                <div className="cards-2" style={{ opacity: 0.85 }}>{ended.map((d) => <DriveCard key={d.id} drive={d} />)}</div>
              </div>
            )}
            {!city && (
              <div style={{ marginTop: 40 }}>
                <h2 className="h-3" style={{ marginBottom: 12 }}>Walk-ins by city</h2>
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
              <button type="button" className="btn btn-ghost btn-icon" aria-label="Close filters" onClick={() => setSheet(false)}><X size={22} strokeWidth={STROKE} /></button>
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

function jobPosting(d) {
  const { end, close } = driveSchedule(d);
  const ld = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: d.role,
    description: d.jd || `${d.company} is hiring a ${d.role} in ${d.city}.`,
    datePosted: d.date,
    validThrough: `${end}T${fromMinutes(close)}:00+05:30`,
    employmentType: "FULL_TIME",
    hiringOrganization: { "@type": "Organization", name: d.company },
    jobLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", streetAddress: [d.venue, d.area].filter(Boolean).join(", "), addressLocality: d.city, addressCountry: "IN" },
    },
  };
  if (d.payMin || d.payMax) {
    ld.baseSalary = { "@type": "MonetaryAmount", currency: "INR", value: { "@type": "QuantitativeValue", minValue: d.payMin || d.payMax, maxValue: d.payMax || d.payMin, unitText: "MONTH" } };
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
  const pay = payLabel(drive);
  const isSaved = saved.has(drive.id);
  const similar = useMemo(() => sortForBoard(publicDrives(drives).filter((d) => d.city === drive.city && d.id !== drive.id && driveStatus(d) !== "wrapped")).slice(0, 3), [drives, drive]);

  useMeta({
    title: `${drive.role} walk-in at ${drive.company}, ${drive.area ? `${drive.area}, ` : ""}${drive.city}`,
    description: `${drive.company} walk-in for ${drive.role} in ${drive.city} on ${datesLabel(drive)}, ${hoursLabel(drive)}.${pay ? ` Pay ${pay}.` : ""} Get a digital token and see your place in the queue.`,
    jsonLd: jobPosting(drive),
  });

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: `${drive.role} · ${drive.company}`, url });
      else { await navigator.clipboard.writeText(url); toast(t("detail.copied")); }
    } catch { /* dismissed */ }
  };
  const primary = live
    ? <Btn size="lg" block onClick={() => nav(joinPath(drive))}>{t("detail.getToken")}</Btn>
    : !ended
      ? <Btn size="lg" block variant="secondary" icon={isSaved ? BookmarkCheck : Bookmark} aria-pressed={isSaved} onClick={() => saved.toggle(drive.id)}>{isSaved ? t("detail.saved") : t("detail.save")}</Btn>
      : null;

  const rounds = drive.rounds || [];
  const docs = drive.docs || [];
  return (
    <div className="has-sticky-cta">
      <div className="wrap" style={{ padding: "28px 24px 0" }}>
        <nav aria-label="Breadcrumb" className="small muted row gap-6" style={{ flexWrap: "wrap" }}>
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
              {drive.openings ? <span className="tag">{drive.openings} openings</span> : null}
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
              <Section icon={CalendarDays} title={t("detail.timing")}>
                <p className="strong" style={{ margin: 0 }}>{datesLabel(drive)}</p>
                <p className="body muted" style={{ marginTop: 4 }}>{hoursLabel(drive)}</p>
                <p className="small muted" style={{ marginTop: 12 }}>{live ? "Open now. Tokens are being given out." : ended ? t("detail.ended") : t("detail.notOpen")}</p>
              </Section>
              <Section icon={IndianRupee} title={t("detail.salary")}>
                <p className="strong" style={{ margin: 0, fontSize: 20 }}>{pay || "Discussed at the interview"}</p>
                <p className="body muted" style={{ marginTop: 4 }}>{t("detail.experience")}: {expLabel(drive)}</p>
                {drive.openings ? <p className="small muted" style={{ marginTop: 12 }}>{drive.openings} {t("detail.openings").toLowerCase()}</p> : null}
              </Section>
            </div>
            <Section icon={MapPin} title={t("detail.venue")}>
              <p className="strong" style={{ margin: 0 }}>{drive.venue}</p>
              <p className="body muted" style={{ marginTop: 4 }}>{venueLine(drive)}</p>
              {drive.landmark && <p className="body row gap-8" style={{ marginTop: 12, alignItems: "flex-start" }}><Landmark size={18} strokeWidth={STROKE} aria-hidden="true" style={{ color: "var(--muted)", marginTop: 3, flexShrink: 0 }} /><span><span className="muted">{t("detail.landmark")}:</span> {drive.landmark}</span></p>}
              <div style={{ marginTop: 16 }}><Btn href={mapsUrl(drive)} target="_blank" rel="noreferrer" variant="secondary" size="sm" iconRight={ExternalLink}>{t("detail.map")}</Btn></div>
            </Section>
            {docs.length > 0 && (
              <Section icon={Check} title={t("detail.documents")}>
                <ul className="checklist">{docs.map((d) => <li key={d}><Check size={18} strokeWidth={2.25} aria-hidden="true" />{d}</li>)}</ul>
              </Section>
            )}
            {rounds.length > 0 && (
              <Section icon={ListOrdered} title={t("detail.rounds")}>
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
          </div>
          <aside className="detail-aside">
            <div className="card card-pad stack gap-16">
              {pay && <div><p className="tiny muted" style={{ margin: 0, fontWeight: 600 }}>{t("detail.salary")}</p><p className="h-2 nowrap" style={{ marginTop: 4, fontSize: 28 }}>{pay}</p></div>}
              <div className="row gap-8"><WhenChip drive={drive} /><span className="small muted">{hoursLabel(drive)}</span></div>
              {live && (
                <div className="panel" style={{ padding: 16 }}>
                  <p className="tiny muted" style={{ margin: 0, fontWeight: 600 }}>{t("detail.queueNow")}</p>
                  <div className="row gap-16" style={{ marginTop: 8 }}>
                    <div><span className="mono strong" style={{ fontSize: 28, fontWeight: 800 }}>{q.waiting}</span><span className="small muted"> in queue</span></div>
                    <div className="small muted row gap-6"><Clock size={16} strokeWidth={STROKE} aria-hidden="true" />{waitLabel(q.estMin)}</div>
                  </div>
                </div>
              )}
              {primary}
              {!live && !ended && <p className="small muted" style={{ margin: 0 }}>{t("detail.notOpen")}</p>}
              {ended && <p className="small muted" style={{ margin: 0 }}>{t("detail.ended")}</p>}
              <Btn variant="ghost" size="sm" icon={Share2} onClick={share}>{t("detail.share")}</Btn>
            </div>
          </aside>
        </div>
        {similar.length > 0 && (
          <section style={{ marginTop: 64 }}>
            <div className="row between" style={{ marginBottom: 20 }}>
              <h2 className="h-2">{t("detail.similar", { city: drive.city })}</h2>
              <Link to={cityPath(drive.city)} className="link hide-mobile">See all</Link>
            </div>
            <div className="cards-3">{similar.map((d) => <DriveCard key={d.id} drive={d} saved={saved} />)}</div>
          </section>
        )}
      </div>
      {(live || !ended) && (
        <div className="sticky-cta">
          <div className="grow">
            <p className="strong small" style={{ margin: 0 }}>{pay || drive.company}</p>
            {live ? <QueueLine drive={drive} /> : <p className="tiny muted" style={{ margin: 0 }}>{driveWhen(drive).label} · {hoursLabel(drive)}</p>}
          </div>
          {live ? <Btn onClick={() => nav(joinPath(drive))}>{t("detail.getToken")}</Btn>
            : <Btn variant="secondary" icon={isSaved ? BookmarkCheck : Bookmark} aria-pressed={isSaved} onClick={() => saved.toggle(drive.id)}>{isSaved ? t("detail.saved") : t("card.save")}</Btn>}
        </div>
      )}
    </div>
  );
}

function NotFound() {
  useMeta({ title: "Drive not found" });
  return (
    <div className="wrap" style={{ padding: "80px 24px" }}>
      <EmptyState title={t("detail.notFound.t")} body={t("detail.notFound.d")} action={<Btn to="/walk-ins" icon={ArrowLeft}>{t("detail.notFound.cta")}</Btn>} />
    </div>
  );
}

export default function WalkInsPage() {
  const { slug } = useParams();
  const { drives, hydrated } = useStore();
  if (!slug) return <Browse />;
  const drive = drives.find((d) => d.id === slug && d.visibility !== "private" && !d.listingPending);
  if (drive) return <Detail drive={drive} />;
  const city = cityFromSlug(slug, publicDrives(drives));
  if (city) return <Browse city={city} />;
  if (!hydrated) return <div className="wrap" style={{ padding: "48px 24px" }}><div className="cards-2"><CardSkeleton /><CardSkeleton /></div></div>;
  return <NotFound />;
}

