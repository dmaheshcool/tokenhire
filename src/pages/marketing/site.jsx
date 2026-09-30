import React, { useState, useEffect, useMemo, useRef } from "react";
import { ArrowLeft, ArrowRight, Mail, Linkedin, Phone, ChevronDown, Menu, X, Search, MapPin, Users2, QrCode, Check, BadgeCheck } from "lucide-react";
import { bdy, dsp, typ, k, R, solid, solidSm, outline, outlineSm, iconBtn, navBtn, box, input, ghostSm, textLink } from "../../theme.js";
import { HallBrand, OrgLogo, TokenChip, Wordmark } from "../../components/brand.jsx";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { pc, PLANS, PLAN_ROWS, PUBLIC_PLANS, planPrice, listingHost, listingPlace, EXP_BANDS, citiesMatching, cityQueryHits, docsOf, driveEnded, driveOpenToday, driveWindow, todayStr } from "../../lib/helpers.js";
import { readSession } from "../../lib/api.js";
import { pathFor } from "../../lib/routes.js";
import { Pill, fmtDate, CitySelect, DropPanel, Field, Select } from "../../components/ui.jsx";

export const PAGES = [["home", "Home"], ["services", "Products"], ["drives", "Walk-ins"], ["about", "About us"], ["contact", "Contact us"]];

export const NAV = [
  { id: "home", label: "Home" },
  { id: "drives", label: "Walk-ins" },
  { id: "blog", label: "Blog" },
  { id: "contact", label: "Contact" },
];

const heroH1 = {
  fontFamily: dsp, fontSize: "clamp(34px,4.8vw,52px)", fontWeight: 600, letterSpacing: -1.6,
  margin: "0 0 12px", lineHeight: 1.08, color: k.ink,
};
const heroP = { fontSize: 16, color: k.mid, lineHeight: 1.55, margin: "0 auto", maxWidth: 520 };

function PageHero({ children, maxWidth = 720, bottom = 52 }) {
  return (
    <div style={{ background: k.cream2, borderBottom: `1px solid ${k.line}` }}>
      <div style={{ maxWidth, margin: "0 auto", padding: `56px 26px ${bottom}px`, textAlign: "center" }}>
        {children}
      </div>
    </div>
  );
}

export function SiteNav({ page, go, onLaunch }) {
  const [open, setOpen] = useState(null);
  const [menu, setMenu] = useState(false);
  const solRef = useRef(null);
  const signedIn = !!readSession()?.orgId;
  return (
    <div className="chrome-wrap" style={{ position: "sticky", top: 0, zIndex: 50, background: "#fff", borderBottom: `1px solid ${k.line}`, padding: "0 26px" }}>
      <div className="chrome-inner" style={{ maxWidth: 1140, margin: "0 auto", padding: "12px 0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "nowrap" }}>
        <Link to="/" style={{ background: "none", border: "none", cursor: "pointer", padding: 0, marginRight: 8, textDecoration: "none" }}><Wordmark size={18} /></Link>
        <button className="nav-burger" type="button" aria-label="Menu" onClick={() => setMenu((m) => !m)} style={{ ...iconBtn, color: k.ink, padding: 8, display: "none", alignItems: "center" }}>
          {menu ? <X size={22} /> : <Menu size={22} />}
        </button>
        <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: 26, flexWrap: "wrap" }}>
          {NAV.map((n, i) => n.menu ? (
            <div key={i} style={{ position: "relative" }}>
              <button
                ref={solRef}
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                onMouseEnter={() => setOpen(i)}
                style={{ ...navBtn, color: "#fff", display: "flex", alignItems: "center", gap: 5 }}>
                {n.label} <ChevronDown size={15} style={{ transform: open === i ? "rotate(180deg)" : "none", transition: "transform .18s" }} />
              </button>
              <DropPanel
                anchorRef={solRef}
                open={open === i}
                onClose={() => setOpen(null)}
                minWidth={310}
                align="center"
                style={{ padding: 10, boxShadow: "0 22px 50px -20px rgba(11,16,32,.22)", borderRadius: R.card }}
              >
                {n.menu.map(([target, label, desc]) => (
                  <Link key={label} to={pathFor(target)} onClick={() => { setOpen(null); setMenu(false); }} style={{
                    display: "block", width: "100%", textAlign: "left", textDecoration: "none",
                    padding: "11px 13px", borderRadius: 12, fontFamily: bdy,
                  }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = k.cream2)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "none")}>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: k.ink }}>{label}</div>
                    <div style={{ fontSize: 12.5, color: k.mid, marginTop: 3 }}>{desc}</div>
                  </Link>
                ))}
              </DropPanel>
            </div>
          ) : (
            <Link key={n.id} to={pathFor(n.id)} className="navitem" style={{ ...navBtn, textDecoration: "none", color: page === n.id ? k.coral : k.ink2, fontWeight: page === n.id ? 700 : 500 }}>{n.label}</Link>
          ))}
        </div>
        <div className="nav-ctas" style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "nowrap" }}>
          {signedIn ? (
            <button onClick={() => onLaunch("employer")} style={solidSm}>Open console</button>
          ) : (
            <>
              <Link to="/login" style={{ ...navBtn, color: k.ink, textDecoration: "none" }}>Sign in</Link>
              <Link to="/signup" style={{ ...solidSm, textDecoration: "none" }}>Register</Link>
            </>
          )}
        </div>
      </div>
      {menu && (
        <div style={{ background: "#fff", borderBottom: `1px solid ${k.line}`, padding: "8px 16px 18px" }}>
          {NAV.flatMap((n) => n.menu ? n.menu.map(([target, label]) => [target, label]) : [[n.id, n.label]]).map(([id, label]) => (
            <Link key={label} to={pathFor(id)} onClick={() => setMenu(false)} style={{ display: "block", width: "100%", textAlign: "left", padding: "14px 4px", textDecoration: "none", borderBottom: `1px solid ${k.line}`, fontFamily: bdy, fontSize: 16, fontWeight: 600, color: k.ink }}>{label}</Link>
          ))}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
            {signedIn ? (
              <button onClick={() => { setMenu(false); onLaunch("employer"); }} style={{ ...solid, justifyContent: "center", width: "100%" }}>Go to console</button>
            ) : (
              <>
                <Link to="/signup" onClick={() => setMenu(false)} style={{ ...solid, justifyContent: "center", width: "100%", textDecoration: "none" }}>Register</Link>
                <Link to="/login" onClick={() => setMenu(false)} style={{ ...outline, justifyContent: "center", width: "100%", textDecoration: "none" }}>Sign in</Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const FOOT_CITIES = ["Hyderabad", "Bengaluru", "Mumbai", "Pune", "Chennai", "Delhi", "Kolkata", "Ahmedabad"];

export function SiteFooter() {
  const colTitle = { fontSize: 15, fontWeight: 700, margin: "0 0 14px", color: k.ink };
  const colLink = { color: k.ink2, fontSize: 14, fontFamily: bdy, textDecoration: "none", lineHeight: 1.9 };
  return (
    <footer style={{ background: k.cream2, borderTop: `1px solid ${k.line}`, marginTop: 0 }}>
      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "48px 26px 0" }}>
        <div className="portal-foot">
          <div>
            <div style={colTitle}>Walk-ins by city</div>
            {FOOT_CITIES.map((city) => (
              <div key={city}><Link to={`/walk-ins?city=${encodeURIComponent(city)}`} style={colLink}>{city}</Link></div>
            ))}
          </div>
          <div>
            <div style={colTitle}>For companies</div>
            <div><Link to="/login" style={colLink}>Sign in</Link></div>
            <div><Link to="/walk-ins/list" style={colLink}>Create a drive</Link></div>
            <div><Link to="/for-companies#pilot" style={colLink}>Contact</Link></div>
          </div>
          <div>
            <div style={colTitle}>For candidates</div>
            <div><Link to="/walk-ins" style={colLink}>Browse walk-ins</Link></div>
            <div><Link to="/app/join" style={colLink}>Check in</Link></div>
            <div><Link to="/guides" style={colLink}>Guides</Link></div>
            <div><Link to="/how-it-works" style={colLink}>How it works</Link></div>
          </div>
          <div>
            <div style={colTitle}>Legal</div>
            <div><Link to="/privacy" style={colLink}>Privacy</Link></div>
            <div><Link to="/terms" style={colLink}>Terms of use</Link></div>
            <div style={{ ...colLink, display: "block", marginTop: 10 }}>hello@tokenhire.app</div>
          </div>
        </div>
        <div style={{ borderTop: `1px solid ${k.line}`, marginTop: 36, padding: "18px 0 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, color: k.mid }}>© 2026 TokenHire</span>
          <Wordmark size={15} />
        </div>
      </div>
    </footer>
  );
}

export { WalkInDemo } from "./WalkInDemo.jsx";

function PlanCards({ onChoose, go }) {
  const byId = Object.fromEntries(PLANS.map((p) => [p.id, p]));
  return (
    <div className="plans" style={{ display: "grid", gap: 12, alignItems: "stretch" }}>
      {PUBLIC_PLANS.map((p) => {
        const cost = planPrice(p);
        return (
        <div key={p.id} style={{
          border: `1px solid ${p.best ? k.coral : k.line}`,
          borderRadius: 16,
          padding: "28px 22px 24px",
          background: p.best ? k.coralDim : "#fff",
          color: k.ink,
          position: "relative",
        display: "grid",
          gridTemplateRows: "auto 52px 36px 42px auto 1fr",
          alignItems: "start",
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: k.mid, marginBottom: 14, paddingRight: p.best ? 84 : 0 }}>
            {p.name}
            {p.best && (
              <span style={{ position: "absolute", top: 16, right: 16, fontFamily: typ, fontSize: 10, fontWeight: 700, letterSpacing: 1.2, color: k.coral }}>{p.ribbon || "MOST POPULAR"}</span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, minHeight: 52, flexWrap: "wrap" }}>
            <span style={{ fontFamily: dsp, fontSize: 26, fontWeight: 700, letterSpacing: -1.2, lineHeight: 1 }}>{cost.label}</span>
            <span style={{ fontSize: 13, color: k.mid }}>{cost.unit}</span>
          </div>
          <div style={{ fontSize: 12, color: k.faint, minHeight: 18, lineHeight: "18px" }}>{cost.billed || "\u00a0"}</div>
          <div style={{ fontSize: 13, color: k.ink2, minHeight: 42, lineHeight: 1.4 }}>{p.blurb}</div>
          <button onClick={() => (p.talk && go ? go("contact") : onChoose(p))} style={{ ...(p.best ? solid : outline), width: "100%", justifyContent: "center", padding: 11, margin: "18px 0 22px", boxSizing: "border-box", minHeight: 44 }}>{p.cta}</button>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {p.builds && (
              <div style={{ fontSize: 12.5, color: k.mid, marginBottom: 2 }}>
                {byId[p.builds]?.name}, plus
              </div>
            )}
            {(p.highlights || []).map((f) => (
              <div key={f} style={{ fontSize: 13.5, lineHeight: 1.4, color: k.ink }}>{f}</div>
            ))}
          </div>
        </div>
        );
      })}
    </div>
  );
}

function PlanTable() {
  // Rows that are false on every public plan are a wall of dashes — hide them.
  const rows = PLAN_ROWS.filter((row) => PUBLIC_PLANS.some((p) => row.get(p.limits, p) !== false));
  const pad = { padding: "14px 12px" };
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="plan-table" style={{ borderCollapse: "collapse", width: "100%", minWidth: 560 }}>
        <thead>
          <tr>
            <th style={{ ...pad, textAlign: "left", fontSize: 12, fontWeight: 500, color: k.faint, borderBottom: `1px solid ${k.line}` }} />
            {PUBLIC_PLANS.map((p) => (
              <th key={p.id} style={{
                ...pad,
                fontFamily: dsp,
                fontSize: 13,
                fontWeight: 600,
                color: p.best ? k.coral : k.ink,
                textAlign: "center",
                borderBottom: `1px solid ${p.best ? k.coral : k.line}`,
                background: p.best ? k.coralDim : "transparent",
                borderRadius: p.best ? "10px 10px 0 0" : 0,
              }}>{p.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.label}>
              <td style={{ ...pad, textAlign: "left", fontSize: 13.5, color: k.mid, borderBottom: i === rows.length - 1 ? "none" : `1px solid ${k.line}` }}>{row.label}</td>
              {PUBLIC_PLANS.map((p) => {
                const v = row.get(p.limits, p);
                const last = i === rows.length - 1;
                return (
                  <td key={p.id} style={{
                    ...pad,
                    textAlign: "center",
                    fontFamily: typ,
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: k.ink,
                    background: p.best ? k.coralDim : "transparent",
                    borderBottom: last ? "none" : `1px solid ${p.best ? "rgba(44,107,245,.16)" : k.line}`,
                    borderRadius: last && p.best ? "0 0 10px 10px" : 0,
                  }}>
                    {v === true ? <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: 99, background: k.coral }} />
                      : v === false ? ""
                      : v}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const HOME_STEPS = [
  ["01", "Scan once, take a token", "The lobby display shows a code, and one scan puts the person on the list. Their phone shows how many people are ahead, who is being called, and which room to go to, and it alerts them when it is their turn."],
  ["02", "Every recruiter uses that list", "Recruiters call the next token, send the person to a room, and mark the result. They share one list, so the same person is not called twice and nobody is skipped."],
  ["03", "The resume opens with them", "People add their name, phone number, experience, and a resume. When a recruiter calls the token, that file is already open, and they write the interview on the same page. The public screen shows the token and a shortened name. The phone number and the resume stay with the recruiters."],
  ["04", "The day ends as a file", "When you close, you download a file with names, contact details, notes, and what each round decided. Workday, Greenhouse, Lever, Darwinbox, and Keka can import it. The offer still goes out from the system you already use."],
];

const HOME_FOR = [
  ["A company", "Post the date, the city, and what people should bring. Set the rooms, have your recruiters call from the list, and download a report you can export to your ATS."],
  ["An agency", "Run the walk-in under your name for a client. The client is a label on the file, and other agencies cannot see your list or the resumes."],
  ["Someone at the venue", "Open walk-ins are on one public list. Scan the screen, take a token, and wait on your phone until you are called."],
];

export function Home({ go, onLaunch, drives = [] }) {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const listed = drives.filter((d) => d.visibility !== "private" && !d.listingPending && !driveEnded(d));
  const latest = mixByRole(listed).slice(0, 6);
  function search(e) {
    e.preventDefault();
    const query = q.trim();
    nav(query ? `/walk-ins?q=${encodeURIComponent(query)}` : "/walk-ins");
  }
  return (
    <>
      <section style={{ background: k.cream2, borderBottom: `1px solid ${k.line}` }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", padding: "48px 26px 28px" }}>
          <h1 className="one-line" style={{ fontFamily: dsp, fontWeight: 750, letterSpacing: -1.2, fontSize: "clamp(28px, 3.4vw, 40px)", margin: "0 0 18px", color: k.ink }}>
            Find a walk{"\u2011"}in. Or run one.
          </h1>
          <form onSubmit={search} style={{ display: "flex", gap: 8, maxWidth: 640 }}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Role, company, or city"
              aria-label="Search walk-ins"
              style={{ ...input, fontSize: 15, padding: "12px 14px" }}
            />
            <button type="submit" style={{ ...solid, padding: "0 18px" }} aria-label="Search"><Search size={18} /></button>
          </form>
        </div>
        <div style={{ maxWidth: 1140, margin: "0 auto", padding: "0 26px 36px" }}>
          <div className="portal-split">
            <div style={{ ...box, padding: "28px 26px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.6, color: k.coral, marginBottom: 10 }}>LOOKING FOR A WALK-IN</div>
              <h2 className="one-line" style={{ fontFamily: dsp, fontSize: "clamp(22px, 2.2vw, 28px)", fontWeight: 750, letterSpacing: -0.5, margin: "0 0 12px", lineHeight: 1.15, color: k.ink }}>Browse the list, then scan.</h2>
              <p style={{ fontSize: 15.5, lineHeight: 1.55, margin: "0 0 20px", color: k.ink2 }}>One list for the day. Your phone shows the token, how many people are ahead, and which room to walk to.</p>
              <button type="button" onClick={() => go("drives")} style={solid}>Browse walk-ins</button>
            </div>
            <div style={{ ...box, padding: "28px 26px", background: k.band, color: "#fff", borderColor: k.band }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.6, color: "rgba(255,255,255,.7)", marginBottom: 10 }}>COMPANIES</div>
              <h2 className="one-line" style={{ fontFamily: dsp, fontSize: "clamp(22px, 2.2vw, 28px)", fontWeight: 750, letterSpacing: -0.5, margin: "0 0 12px", lineHeight: 1.15 }}>Post the walk-in. Call from one list.</h2>
              <p style={{ fontSize: 15.5, lineHeight: 1.55, margin: "0 0 20px", color: "rgba(255,255,255,.82)" }}>Create the account and the drive first. The scan on the lobby display turns on after the walk-in is paid.</p>
              <button type="button" onClick={() => onLaunch("employer")} style={solid}>Create a drive</button>
            </div>
          </div>
        </div>
      </section>

      <section style={{ background: "#fff" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", padding: "48px 26px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
            <h2 style={{ fontFamily: dsp, fontSize: 28, fontWeight: 750, letterSpacing: -0.5, margin: 0 }}>Latest walk-ins</h2>
            <button type="button" onClick={() => go("drives")} style={{ ...textLink, fontSize: 14, color: k.coral }}>View all</button>
          </div>
          {latest.length ? (
            <div className="portal-jobs">
              {latest.map((d) => (
                <Link key={d.id} to={`/walk-ins?q=${encodeURIComponent(d.role || "")}`} style={{ ...box, padding: "16px 16px 14px", textDecoration: "none", color: "inherit" }}>
                  <div style={{ fontFamily: dsp, fontWeight: 700, fontSize: 16, letterSpacing: -0.2, color: k.ink }}>{d.role}</div>
                  <div style={{ fontSize: 13.5, color: k.ink2, marginTop: 4 }}>{d.company}</div>
                  <div style={{ fontSize: 13, color: k.mid, marginTop: 6 }}>{d.city}</div>
                  {driveOpenToday(d) && <span style={{ display: "inline-block", marginTop: 10, background: k.coralDim, color: k.coral, fontSize: 12, fontWeight: 700, borderRadius: 4, padding: "3px 8px" }}>Open today</span>}
                </Link>
              ))}
            </div>
          ) : (
            <p style={{ color: k.mid, margin: 0 }}>No walk-ins are open right now.</p>
          )}
        </div>
      </section>

      <section style={{ background: k.cream2, borderTop: `1px solid ${k.line}`, padding: "48px 26px 64px" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>
          <h2 style={{ fontFamily: dsp, fontSize: 28, fontWeight: 750, letterSpacing: -0.5, margin: "0 0 18px", color: k.ink }}>How it works</h2>
          <div className="how-grid">
            {[
              ["1", "Post the walk-in", "A company account posts the role, the city, the dates, and what to carry."],
              ["2", "People scan once", "They find it on the list, come to the venue, and take a token from the screen."],
              ["3", "Call from one list", "The resume opens with the person. At the end of the day, download a report you can export to your ATS."],
            ].map(([n, h, d]) => (
              <div key={n} style={{ ...box, padding: "20px 18px" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: k.coralDim, color: k.coral, display: "grid", placeItems: "center", fontWeight: 800, fontSize: 13, marginBottom: 12 }}>{n}</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: k.ink }}>{h}</div>
                <div style={{ fontSize: 14, color: k.ink2, lineHeight: 1.5, marginTop: 6 }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

const CTA_COPY = {
  home: { head: ["Set up tomorrow’s walk-in."], sub: "Registration, the queue, the rooms, and a candidate file you can send to your ATS — ready before people arrive.", btn: "Set up a walk-in" },
  products: { head: ["See the product on a real walk-in."], sub: "Check-in, the shared queue, interview rooms, resumes, and the ATS extract.", btn: "Run a drive" },
  about: { head: ["Talk to us about a walk-in"], sub: "Tell us the site, the volume, and how you hand files to HR today.", btn: "Contact" },
  solution: { head: ["Set up your next walk-in"], sub: "You can be live in a few minutes. Candidates bring their own resume and details.", btn: "Set up a walk-in" },
};
export function CtaBand({ onLaunch, variant = "home", onContact, flush }) {
  const c = CTA_COPY[variant] || CTA_COPY.home;
  return (
    <div style={{ maxWidth: 860, margin: flush ? "0 auto" : "70px auto 0", padding: "0 26px" }}>
      <div style={{ padding: "48px 8px", textAlign: "center", borderTop: `1px solid ${k.line}` }}>
        <h2 style={{ fontFamily: dsp, fontSize: "clamp(26px,3.4vw,38px)", fontWeight: 650, letterSpacing: -1, margin: "0 0 10px", color: k.ink }}>
          {c.head[0]}{c.head[1] ? <b style={{ fontWeight: 700 }}>{c.head[1]}</b> : null}
        </h2>
        {c.sub ? <p style={{ fontSize: 16, color: k.mid, margin: "0 auto 26px", maxWidth: 720, lineHeight: 1.5 }}>{c.sub}</p> : <div style={{ height: 18 }} />}
        <button onClick={() => (variant === "about" && onContact ? onContact() : onLaunch("employer"))} style={solid}>{c.btn} <ArrowRight size={16} /></button>
      </div>
    </div>
  );
}

function LiveBoard() {
  const [n, setN] = useState({ waiting: 7, calling: 1, interviewing: 2, completed: 4 });
  useEffect(() => {
    const iv = setInterval(() => {
      setN((p) => {
        const move = Math.random();
        if (move < 0.4 && p.waiting > 0) return { ...p, waiting: p.waiting - 1, calling: p.calling + 1 };
        if (move < 0.65 && p.calling > 0) return { ...p, calling: Math.max(0, p.calling - 1), interviewing: p.interviewing + 1 };
        if (move < 0.9 && p.interviewing > 0) return { ...p, interviewing: Math.max(0, p.interviewing - 1), completed: p.completed + 1 };
        return { ...p, waiting: p.waiting + 2 };
      });
    }, 2000);
    return () => clearInterval(iv);
  }, []);
  const rows = [
    ["Waiting", n.waiting, k.mid],
    ["Calling", n.calling, k.coral],
    ["Interviewing", n.interviewing, "#5C7DE0"],
    ["Completed", n.completed, k.teal],
  ];
  const max = Math.max(1, ...rows.map((r) => r[1]));
  const [filled, setFilled] = useState(false);
  const [spot, setSpot] = useState(0);
  useEffect(() => { const t = setTimeout(() => setFilled(true), 120); return () => clearTimeout(t); }, []);
  useEffect(() => { const iv = setInterval(() => setSpot((s) => (s + 1) % rows.length), 1700); return () => clearInterval(iv); }, [rows.length]);

  return (
    <div style={{ ...box, padding: "26px 28px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: k.ink2 }}>What a drive looks like, minute to minute</span>
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: k.teal, fontFamily: typ, fontWeight: 600 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: k.coral, animation: "blink 1.6s infinite" }} />EXAMPLE
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
        {rows.map(([label, val, color], i) => (
          <div key={label} style={{
            display: "flex", alignItems: "center", gap: 14, padding: "6px 8px", marginLeft: -8, marginRight: -8, borderRadius: 8,
            background: spot === i ? k.cream2 : "transparent", transition: "background 0.5s ease",
          }}>
            <span style={{ fontSize: 13, color: k.ink2, width: 100, flexShrink: 0 }}>{label}</span>
            <div style={{ flex: 1, height: 8, background: k.cream2, borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: filled ? `${(val / max) * 100}%` : 0, background: color, borderRadius: 4, transition: `width 0.8s ease ${i * 0.08}s` }} />
            </div>
            <span style={{ fontFamily: typ, fontSize: 15, fontWeight: 700, color: k.ink, width: 24, textAlign: "right", flexShrink: 0 }}>{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --- About --- */
export function AboutPage() {
  return (
    <article>
      <section style={{ background: k.cream2, borderBottom: `1px solid ${k.line}` }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "88px 32px 72px" }}>
          <h1 className="one-line" style={{
            fontFamily: dsp, fontWeight: 700, letterSpacing: -1.4, lineHeight: 1.05,
            fontSize: "clamp(32px, 3.4vw, 44px)", margin: "0 0 22px", color: k.ink,
          }}>
            We build the list for walk{"\u2011"}in day.
          </h1>
          <p className="one-line" style={{ fontSize: 20, lineHeight: 1.5, color: k.ink2, margin: 0 }}>
            A hiring team uses it when a room fills up and a few recruiters have to see everyone.
          </p>
        </div>
      </section>
      <section style={{ background: "#fff" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "64px 32px 28px" }}>
          <p style={{ fontSize: 18, lineHeight: 1.7, color: k.ink, margin: "0 0 18px", maxWidth: 740 }}>
            A lot of roles in India are still filled by walk-in. People show up, wait, and talk to a recruiter. The list for that day is usually a notebook, or a different list in every recruiter’s hand. We replace that with one list.
          </p>
          <p style={{ fontSize: 18, lineHeight: 1.7, color: k.ink, margin: "0 0 18px", maxWidth: 740 }}>
            Someone scans the screen at the venue and takes a token. Every recruiter calls from that list. The resume they brought opens with them, and the interview is written on the same page. The screen in the room shows a token, not a phone number. When the day ends, the company downloads the file — names, contact details, notes, and what each round decided.
          </p>
          <p style={{ fontSize: 18, lineHeight: 1.7, color: k.ink, margin: 0, maxWidth: 740 }}>
            A company uses TokenHire for its own hiring. An agency uses it for a client’s hiring, under the agency’s name. We do not decide who gets the job. The people in the room do.
          </p>
        </div>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "48px 32px 80px" }}>
          <div style={{ paddingTop: 22, borderTop: `1px solid ${k.line}`, maxWidth: 740 }}>
            <a href="mailto:hello@tokenhire.app" style={{ fontSize: 16, fontWeight: 650, color: k.ink, textDecoration: "none" }}>hello@tokenhire.app</a>
          </div>
        </div>
      </section>
    </article>
  );
}

/* --- Services --- */
export function Services({ go, onLaunch }) {
  const blocks = [
    { h: "Candidates upload a resume and their details", d: "Name, phone, email, experience, and a PDF or Word file. Recruiters open the file from the queue — they do not collect printouts at the door.", art: <ArtReport /> },
    { h: "Scan the lobby display to join", d: "One scan issues a token and puts them in line. No second code to type, no paper slip to lose.", art: <ArtCode /> },
    { h: "Every recruiter works from the same queue", d: "Call, pass, and room assignment happen on one list, so the same person is not called twice.", art: <ArtQueue /> },
    { h: "A live token page on their phone", d: "After check-in they keep one page open. It shows who is being served, how many are ahead, and which room to walk to. Sound and vibration when it is their turn.", art: <ArtNudge /> },
    { h: "The public screen hides full names", d: "The wall shows a token and a masked name. Phone, resume, and the real name stay with signed-in recruiters.", art: <ArtMasked /> },
    { h: "Export the full file to your ATS", d: "At close of day you download a file Workday, Greenhouse, Lever, Darwinbox, or Keka can import — contact details, the resume notes, and round outcomes. Offers stay in that system.", art: <ArtPace /> },
  ];

  return (
    <>
      <PageHero bottom={64}>
        <h1 style={{ ...heroH1, margin: "0 0 14px" }}>The queue on the day. The candidate file on Monday.</h1>
        <p style={{ ...heroP, fontSize: 17, maxWidth: 500 }}>Registration, check-in, rooms, resumes, and an extract you can send to the ATS you already use.</p>
      </PageHero>

      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "70px 26px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }} className="g2">
          {blocks.map((b) => (
            <div key={b.h} style={{ background: "#fff", border: `1px solid ${k.line}`, borderRadius: 22, padding: 30, display: "flex", flexDirection: "column" }}>
              <h3 style={{ fontFamily: dsp, fontSize: 21, fontWeight: 700, letterSpacing: -0.5, margin: "0 0 10px" }}>{b.h}</h3>
              <p style={{ fontSize: 14.5, color: k.ink2, lineHeight: 1.7, margin: "0 0 24px", flex: 1 }}>{b.d}</p>
              <div style={{ background: k.cream2, borderRadius: 16, padding: 24, display: "flex", justifyContent: "center" }}>{b.art}</div>
            </div>
          ))}
        </div>
      </div>

      <CtaBand onLaunch={onLaunch} variant="products" />
    </>
  );
}

/* --- small illustrative mockups for the Services page, built from our own UI language --- */
function ArtFrame({ children }) {
  return <div style={{ background: "#fff", borderRadius: 16, padding: 22, width: "100%", maxWidth: 340, boxShadow: "0 10px 26px -18px rgba(11,16,32,.28)" }}>{children}</div>;
}
function ArtCode() {
  return (
    <ArtFrame>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 92, height: 92, borderRadius: 12, background: k.cream2, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
          <QrCode size={48} color={k.ink} />
        </div>
        <div style={{ fontFamily: typ, fontSize: 10.5, color: k.coral, fontWeight: 700, letterSpacing: 1 }}>ON THE LOBBY DISPLAY</div>
        <div style={{ fontFamily: typ, fontSize: 10.5, color: k.mid, marginTop: 6 }}>REFRESHES IN 45s</div>
      </div>
    </ArtFrame>
  );
}
function ArtSlip() {
  return (
    <ArtFrame>
      <div style={{ background: k.ink, color: k.cream, padding: "6px 12px", fontFamily: typ, fontSize: 9.5, letterSpacing: 1.2, borderRadius: "6px 6px 0 0", margin: "-22px -22px 16px" }}>ADMISSION SLIP</div>
      <div style={{ marginBottom: 14 }}>
        <TokenChip token="W-014" name="Priya Nair" size={48} />
      </div>
      <div style={{ display: "flex", gap: 20, paddingTop: 10, borderTop: `1px solid ${k.line}` }}>
        <div><div style={{ fontSize: 10.5, color: k.mid }}>Position</div><div style={{ fontFamily: typ, fontWeight: 700, fontSize: 14 }}>4</div></div>
        <div><div style={{ fontSize: 10.5, color: k.mid }}>Roughly</div><div style={{ fontFamily: typ, fontWeight: 700, fontSize: 14 }}>28 min</div></div>
      </div>
    </ArtFrame>
  );
}
function ArtQueue() {
  const rows = [["W-011", "Lakshmi Prasad", "Being called", k.coral], ["W-012", "Sandeep Kumar", "Waiting", k.mid], ["W-013", "Meera Joshi", "Waiting", k.mid]];
  return (
    <ArtFrame>
      <div style={{ fontSize: 10.5, color: k.mid, fontWeight: 700, letterSpacing: .6, marginBottom: 10, textTransform: "uppercase" }}>Live queue</div>
      {rows.map(([tok, name, st, c], i) => (
        <div key={tok} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "9px 0", borderTop: i ? `1px solid ${k.line}` : "none" }}>
          <TokenChip token={tok} name={name} size={32} pulse={st === "Being called"} />
          <span style={{ fontSize: 11.5, fontWeight: 700, color: c, whiteSpace: "nowrap" }}>{st}</span>
        </div>
      ))}
    </ArtFrame>
  );
}
function ArtMasked() {
  return (
    <ArtFrame>
      <div style={{ fontSize: 10.5, color: k.mid, fontWeight: 700, letterSpacing: .6, marginBottom: 10, textTransform: "uppercase" }}>Lobby display</div>
      {[["W-014", "R···l"], ["W-015", "P···a"], ["W-016", "M···d"]].map(([tok, nm], i) => (
        <div key={tok} style={{ display: "flex", alignItems: "center", padding: "9px 0", borderTop: i ? `1px solid ${k.line}` : "none" }}>
          <TokenChip token={tok} name={nm} size={28} muted />
        </div>
      ))}
    </ArtFrame>
  );
}
function ArtNudge() {
  return (
    <ArtFrame>
      <div style={{ fontFamily: typ, fontSize: 10.5, letterSpacing: 1.4, fontWeight: 700, color: k.mid, marginBottom: 8 }}>TOKEN 038</div>
      <div style={{ fontFamily: dsp, fontSize: 28, fontWeight: 800, letterSpacing: -1, lineHeight: 1, marginBottom: 10 }}>038</div>
      <div style={{ fontSize: 12.5, color: k.mid }}>Current token: <b style={{ fontFamily: typ, color: k.ink }}>037</b></div>
      <div style={{ marginTop: 12, background: k.coralDim, borderRadius: 10, padding: "12px 14px" }}>
        <div style={{ fontFamily: dsp, fontSize: 16, fontWeight: 800, color: k.coral }}>You’re next</div>
        <div style={{ fontSize: 12.5, color: k.ink2, marginTop: 4 }}>Please proceed to Room 2</div>
      </div>
    </ArtFrame>
  );
}
function ArtPace() {
  const rows = [["Waiting", 68, k.faint], ["Interviewing", 40, k.coral], ["Selected", 22, k.teal]];
  return (
    <ArtFrame>
      {rows.map(([l, pct, c], i) => (
        <div key={l} style={{ marginBottom: i < rows.length - 1 ? 14 : 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}><span style={{ color: k.ink2 }}>{l}</span></div>
          <div style={{ height: 6, background: k.cream2, borderRadius: 3, overflow: "hidden" }}><div style={{ height: "100%", width: `${pct}%`, background: c, borderRadius: 3 }} /></div>
        </div>
      ))}
    </ArtFrame>
  );
}
function ArtReport() {
  const rows = [
    ["Phone", "98480 11223"],
    ["Email", "priya.nair@email.com"],
    ["Experience", "1–3 years"],
    ["Resume", "priya_nair_cv.pdf"],
  ];
  return (
    <ArtFrame>
      <div style={{ marginBottom: 12 }}><TokenChip token="014" name="Priya Nair" size={36} /></div>
      {rows.map(([l, v]) => (
        <div key={l} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "7px 0", borderTop: `1px solid ${k.line}`, fontSize: 12.5 }}>
          <span style={{ color: k.mid }}>{l}</span>
          <span style={{ fontWeight: 600, color: k.ink }}>{v}</span>
        </div>
      ))}
    </ArtFrame>
  );
}

/* --- Solutions: a real page per industry --- */
const SOLUTIONS = {
  bpo: {
    eyebrow: "BPO & customer support",
    head: ["Five hundred walk-ins, ", "one shared queue."],
    sub: "Voice and non-voice drives run at volumes nothing else in hiring touches. The bottleneck is not sourcing — it is the four hours between arriving and being seen, and the empty file on Monday.",
    pains: [
      ["The room holds 80. The queue is 400.", "Nobody knows who is next, so nobody leaves."],
      ["Six recruiters, six lists.", "The same name gets called twice, or never."],
      ["Monday has a register, not a file.", "Each candidate already uploaded a resume and details. You export that to your ATS, with round outcomes."],
    ],
    stat: ["500+", "candidates in a single day's drive"],
  },
  retail: {
    eyebrow: "Retail & delivery",
    head: ["The same walk-in ", "in every store."],
    sub: "Every store keeps its own notebook. Head office finds out a week later, and the resumes never leave the shop floor.",
    pains: [
      ["Every store does it differently.", "One registration flow. Numbers you can actually compare."],
      ["Head office is flying blind.", "Live counts today — not a spreadsheet next Monday."],
      ["Walk-ins clash with the shop floor.", "They wait outside and watch the token page — or the lobby display — until it is their turn."],
    ],
    stat: ["40+", "store drives running the same week"],
  },
  campus: {
    eyebrow: "Campus hiring",
    head: ["A full campus batch, ", "through in one morning."],
    sub: "Three hundred students. Eight minutes each. The maths never works if the placement cell is still the queue.",
    pains: [
      ["Everyone arrives at 9am.", "Students register in advance with a resume. They get a place in line, not a scrum at the door."],
      ["The placement cell is the queue.", "Two coordinators. Three hundred students. One list."],
      ["No record for the college.", "A report with names, files, and outcomes — not a headcount."],
    ],
    stat: ["300", "students, one morning, one queue"],
  },
  agency: {
    eyebrow: "Staffing agencies",
    head: ["You hire for the client. ", "The walk-in and the files stay yours."],
    sub: "Candidates join your walk-in, under your name. Rival agencies never see your books — or the resumes.",
    pains: [
      ["Your space. Not a shared list.", "Only your drives. Clients are tags, not extra logins."],
      ["The walk-in shows your name.", "Your mark on every screen. The client is a label on the extract."],
      ["One login. Many sites.", "Tag the drive. The candidate files and ATS extract follow that tag."],
    ],
    stat: ["1", "agency login, many clients and cities"],
  },
};

export function SolutionPage({ id, go, onLaunch }) {
  const s = SOLUTIONS[id];
  if (!s) return null;
  return (
    <>
      <PageHero maxWidth={860} bottom={68}>
        <div style={{ fontSize: 13, color: k.coral, fontWeight: 600, marginBottom: 14 }}>{s.eyebrow}</div>
        <h1 style={{ ...heroH1, fontSize: "clamp(34px,5vw,56px)", margin: "0 0 16px" }}>
          {s.head[0]}<b style={{ fontWeight: 700 }}>{s.head[1]}</b>
        </h1>
        <p style={{ ...heroP, fontSize: 17, maxWidth: 440, margin: "0 auto 28px" }}>{s.sub}</p>
        <button onClick={() => onLaunch("employer")} style={solid}>Set up a walk-in <ArrowRight size={16} /></button>
      </PageHero>

      <div style={{ maxWidth: 1140, margin: "-38px auto 0", padding: "0 26px" }}>
        <div style={{ background: "#fff", border: `1px solid ${k.line}`, borderRadius: 26, padding: "34px 40px", boxShadow: "0 30px 60px -40px rgba(11,16,32,.25)", textAlign: "center" }}>
          <span style={{ fontFamily: dsp, fontSize: 42, fontWeight: 800, color: k.coral, letterSpacing: -1.5 }}>{s.stat[0]}</span>
          <span style={{ fontSize: 16, color: k.ink2, marginLeft: 14 }}>{s.stat[1]}</span>
        </div>
      </div>

      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "64px 26px 0" }}>
        <h2 style={{ fontFamily: dsp, fontSize: "clamp(26px,3.6vw,38px)", fontWeight: 600, letterSpacing: -1, margin: "0 0 40px", textAlign: "center" }}>What goes wrong</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {s.pains.map(([h, d], i) => (
            <div key={h} style={{ display: "grid", gridTemplateColumns: "56px 1fr", gap: 22, background: k.cream2, borderRadius: R.card, padding: "28px 32px" }}>
              <div style={{ fontFamily: dsp, fontSize: 26, fontWeight: 800, color: k.coral, opacity: .55 }}>{String(i + 1).padStart(2, "0")}</div>
              <div>
                <div style={{ fontFamily: dsp, fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{h}</div>
                <div style={{ fontSize: 15, color: k.ink2, lineHeight: 1.7 }}>{d}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 34 }}>
          <button onClick={() => go("services")} style={outline}>See the full product <ArrowRight size={15} /></button>
        </div>
      </div>

      <CtaBand onLaunch={onLaunch} variant="solution" />
    </>
  );
}

/* --- Walk-ins across India (public) --- */
function Combo({ label, value, onChange, options, total, placeholder }) {
  const [open, setOpen] = useState(false);
  const ready = value.trim().length >= 2;
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, position: "relative", minWidth: 0 }}>
      <span style={{ fontSize: 12, fontWeight: 650, color: k.mid }}>{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        aria-label={label}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 160)}
        style={{ ...input, fontSize: 14.5, background: "#fff" }}
      />
      {open && value.trim() && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 30, background: "#fff", border: `1px solid ${k.line}`, borderRadius: 12, marginTop: 4, boxShadow: "0 16px 36px -18px rgba(11,16,32,.4)", overflow: "auto", maxHeight: 240 }}>
          {!ready && <div style={{ padding: "10px 12px", fontSize: 13, color: k.mid }}>Type at least 2 letters</div>}
          {ready && options.map((o) => (
            <button
              key={o}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); onChange(o); setOpen(false); }}
              style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 12px", border: "none", background: "transparent", fontFamily: bdy, fontSize: 14, cursor: "pointer", color: k.ink }}
            >{o}</button>
          ))}
          {ready && !options.length && <div style={{ padding: "10px 12px", fontSize: 13, color: k.mid }}>No matches</div>}
          {ready && total > options.length && <div style={{ padding: "8px 12px", fontSize: 12, color: k.faint }}>{total} matches. Keep typing.</div>}
        </div>
      )}
    </label>
  );
}

function mixByRole(list) {
  const groups = new Map();
  for (const d of list) {
    const key = d.role || "";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(d);
  }
  const buckets = [...groups.values()].map((bucket, i) => {
    const shift = bucket.length ? i % bucket.length : 0;
    return shift ? bucket.slice(shift).concat(bucket.slice(0, shift)) : bucket;
  });
  const out = [];
  for (let i = 0; out.length < list.length; i++) {
    let added = false;
    for (const bucket of buckets) {
      if (bucket[i]) { out.push(bucket[i]); added = true; }
    }
    if (!added) break;
  }
  return out;
}

const PAGE = 24;

export function PublicDrives({ drives, onLaunch }) {
  const [params, setParams] = useSearchParams();
  const listed = drives.filter((d) => d.visibility !== "private" && !d.listingPending && !driveEnded(d));
  const [q, setQ] = useState(params.get("q") || "");
  const [city, setCity] = useState(params.get("city") || "");
  useEffect(() => {
    setQ(params.get("q") || "");
    setCity(params.get("city") || "");
  }, [params]);
  const [company, setCompany] = useState("");
  const [when, setWhen] = useState("all");
  const [exp, setExp] = useState("");
  const [openId, setOpenId] = useState(null);
  const [limit, setLimit] = useState(PAGE);

  const companies = useMemo(() => Array.from(new Set(listed.map((d) => d.company || listingHost(d)).filter(Boolean))).sort((a, b) => a.localeCompare(b)), [drives]);
  const driveCities = useMemo(() => Array.from(new Set(listed.map((d) => d.city).filter(Boolean))), [drives]);
  const cityHits = city.trim().length >= 2 ? Array.from(new Set([...citiesMatching(city), ...driveCities.filter((c) => cityQueryHits(c, city))])) : [];
  const companyHits = company.trim().length >= 2 ? companies.filter((c) => c.toLowerCase().includes(company.trim().toLowerCase())) : [];

  const query = q.trim().toLowerCase();
  const companyQ = company.trim().toLowerCase();
  const visible = listed
    .filter((d) => !city.trim() || d.city === city || cityQueryHits(d.city, city))
    .filter((d) => companyQ.length < 2 || (d.company || listingHost(d) || "").toLowerCase().includes(companyQ))
    .filter((d) => when === "all" || (when === "today" ? driveOpenToday(d) : driveWindow(d).start > todayStr()))
    .filter((d) => !exp || !(d.expNeeded || []).length || d.expNeeded.includes(exp))
    .filter((d) => {
      if (!query) return true;
      const blob = [d.role, d.company, d.venue, d.branch, listingHost(d), listingPlace(d)].filter(Boolean).join(" ").toLowerCase();
      return blob.includes(query) || cityQueryHits(d.city, query);
    })
    .sort((a, b) => Number(driveOpenToday(b)) - Number(driveOpenToday(a)) || driveWindow(a).start.localeCompare(driveWindow(b).start));
  const mixed = mixByRole(visible);

  const liveCount = listed.filter((d) => driveOpenToday(d)).length;
  const upcomingCount = listed.filter((d) => driveWindow(d).start > todayStr()).length;
  const filtering = !!(query || city.trim() || company.trim() || when !== "all" || exp);
  const page = mixed.slice(0, limit);
  const cityCounts = useMemo(() => {
    const map = new Map();
    listed.forEach((d) => { if (d.city) map.set(d.city, (map.get(d.city) || 0) + 1); });
    return [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [listed]);

  function pickCity(name) {
    setCity(name);
    setLimit(PAGE);
    const next = new URLSearchParams(params);
    if (q.trim()) next.set("q", q.trim()); else next.delete("q");
    if (name) next.set("city", name); else next.delete("city");
    setParams(next, { replace: true });
  }
  function clearFilters() {
    setQ("");
    setCity("");
    setCompany("");
    setWhen("all");
    setExp("");
    setLimit(PAGE);
    setParams({}, { replace: true });
  }

  const sideLink = (on, label, count, click) => (
    <button type="button" onClick={click} style={{ display: "flex", justifyContent: "space-between", width: "100%", background: "none", border: "none", padding: "7px 0", cursor: "pointer", fontFamily: bdy, fontSize: 14, color: on ? k.coral : k.ink2, fontWeight: on ? 700 : 500, textAlign: "left" }}>
      <span>{label}</span>{count != null && <span style={{ color: k.faint }}>{count}</span>}
    </button>
  );

  return (
    <>
      <div style={{ background: k.cream2, borderBottom: `1px solid ${k.line}` }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", padding: "28px 26px 24px" }}>
          <div className="walkin-head">
            <h1 className="one-line" style={{ fontFamily: dsp, fontWeight: 750, letterSpacing: -0.8, fontSize: "clamp(28px, 3vw, 36px)", margin: 0, color: k.ink }}>
              {liveCount} open today · {upcomingCount} coming up
            </h1>
            <div className="walkin-head-actions">
              <Link to="/walk-ins/list" style={{ ...outline, textDecoration: "none" }}>Create a drive</Link>
              <button onClick={() => onLaunch("candidate")} style={solid}>Check in</button>
            </div>
          </div>
          <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", gap: 8, marginTop: 16, maxWidth: 560 }}>
            <input value={q} onChange={(e) => { setQ(e.target.value); setLimit(PAGE); }} placeholder="Role, company, or city" aria-label="Search walk-ins" style={{ ...input, fontSize: 15 }} />
            <span style={{ ...solid, padding: "0 16px" }}><Search size={18} /></span>
          </form>
        </div>
      </div>

      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "22px 26px 56px" }}>
        <div className="portal-board">
          <aside style={{ background: k.cream2, borderRadius: 12, padding: "16px 16px 8px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>City</div>
            {sideLink(!city, "All cities", listed.length, () => pickCity(""))}
            {cityCounts.slice(0, 12).map(([name, count]) => (
              <div key={name}>{sideLink(city === name, name, count, () => pickCity(name))}</div>
            ))}
            <div style={{ fontSize: 13, fontWeight: 700, margin: "14px 0 6px" }}>Experience</div>
            {sideLink(!exp, "Any", null, () => { setExp(""); setLimit(PAGE); })}
            {EXP_BANDS.map((b) => <div key={b}>{sideLink(exp === b, b, null, () => { setExp(exp === b ? "" : b); setLimit(PAGE); })}</div>)}
            <div style={{ fontSize: 13, fontWeight: 700, margin: "14px 0 6px" }}>When</div>
            {[["all", "Any day"], ["today", "Today"], ["soon", "Coming up"]].map(([id, label]) => (
              <div key={id}>{sideLink(when === id, label, null, () => { setWhen(id); setLimit(PAGE); })}</div>
            ))}
            {filtering && <button type="button" onClick={clearFilters} style={{ ...textLink, margin: "10px 0 12px", color: k.coral }}>Clear filters</button>}
          </aside>

          <div>
            <div style={{ fontSize: 13.5, color: k.mid, marginBottom: 12 }}>
              Showing {page.length ? `1–${page.length}` : "0"} of {visible.length}
              {city.trim() ? ` in ${city.trim()}` : ""}
            </div>
            {!visible.length ? (
              <div style={{ padding: "48px 8px", textAlign: "center" }}>
                <div style={{ fontFamily: dsp, fontSize: 22, fontWeight: 700, marginBottom: 8 }}>No walk-ins match that.</div>
                <button type="button" onClick={clearFilters} style={outline}>Clear filters</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {page.map((d) => {
                  const open = openId === d.id;
                  const host = d.company || listingHost(d);
                  return (
                    <div key={d.id} style={{ background: "#fff", border: `1px solid ${k.line}`, borderRadius: 14, padding: "16px 18px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start" }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontFamily: dsp, fontWeight: 750, fontSize: 18, letterSpacing: -0.2 }}>{d.role}</div>
                          <div style={{ fontSize: 14, color: k.ink2, marginTop: 3 }}>{host}</div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8, flexWrap: "wrap" }}>
                            {driveOpenToday(d) && <span style={{ background: k.coralDim, color: k.coral, fontSize: 12, fontWeight: 700, borderRadius: 4, padding: "3px 8px" }}>Open today</span>}
                            <span style={{ fontSize: 13, color: k.mid }}>{listingPlace(d)} · {walkWhen(d)}</span>
                          </div>
                          {d.jd && <p style={{ fontSize: 13.5, color: k.ink2, lineHeight: 1.5, margin: "10px 0 0", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{d.jd}</p>}
                        </div>
                        <button onClick={() => setOpenId(open ? null : d.id)} style={{ ...outlineSm, flexShrink: 0 }}>{open ? "Hide" : "View details"}</button>
                      </div>
                      {open && <DrivePosting d={d} />}
                    </div>
                  );
                })}
                {mixed.length > page.length && (
                  <button type="button" onClick={() => setLimit((n) => n + PAGE)} style={{ ...outline, alignSelf: "center", marginTop: 8 }}>Show more</button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function walkWhen(d) {
  const { start, end } = driveWindow(d);
  if (start && end && end !== start) return `${fmtDate(start)} – ${fmtDate(end)}`;
  return fmtDate(start);
}
function expLabel(bands) {
  if (!bands || !bands.length) return "All experience levels";
  return bands.join(" · ");
}
function DrivePosting({ d, flush }) {
  const docs = docsOf(d.docs);
  return (
    <div style={{ marginTop: flush ? 0 : 18, paddingTop: flush ? 0 : 18, borderTop: flush ? "none" : `1px solid ${k.line}`, display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 22 }} className="g2">
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: k.faint, letterSpacing: .7, textTransform: "uppercase", marginBottom: 8 }}>Job description</div>
        <p style={{ fontSize: 14, color: k.ink2, lineHeight: 1.65, margin: 0 }}>{d.jd || "The recruiter hasn't added a description yet."}</p>
        <div style={{ fontSize: 11, fontWeight: 700, color: k.faint, letterSpacing: .7, textTransform: "uppercase", margin: "16px 0 8px" }}>Experience needed</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(d.expNeeded && d.expNeeded.length ? d.expNeeded : ["All levels"]).map((b) => <Pill key={b} tone="coral">{b}</Pill>)}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: k.faint, letterSpacing: .7, textTransform: "uppercase", marginBottom: 8 }}>Bring these documents</div>
        {docs.length ? docs.map((doc) => (
          <div key={doc} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13.5, color: k.ink2, marginBottom: 8 }}>
            <Check size={14} color={k.teal} style={{ flexShrink: 0, marginTop: 3 }} />{doc}
          </div>
        )) : <div style={{ fontSize: 13.5, color: k.mid }}>No document list posted — carry a resume and ID to be safe.</div>}
      </div>
    </div>
  );
}

/* --- Pricing --- */
export function PricingPage({ onLaunch, go }) {
  return (
    <>
      <PageHero maxWidth={640}>
        <h1 style={heroH1}>Simple pricing for hiring teams</h1>
        <p style={{ ...heroP, margin: "0 auto 8px" }}>Pay once for a drive, or pay monthly if you run drives regularly.</p>
        <p style={{ ...heroP, margin: "0 auto", fontSize: 14 }}>No per-candidate charges. GST extra.</p>
      </PageHero>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "48px 26px 0" }}>
        <PlanCards onChoose={() => onLaunch("employer")} go={go} />
      </div>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "28px 26px 80px", textAlign: "center" }}>
        <p style={{ fontSize: 13.5, color: k.mid, lineHeight: 1.55, margin: "0 0 12px" }}>
          Live token page and lobby display are included.
        </p>
        <button type="button" onClick={() => go("contact")} style={{ ...textLink, fontSize: 14 }}>
          Recruitment agency or high volume? Talk to us
        </button>
      </div>
    </>
  );
}

/* --- Contact --- */
const LEGAL = {
  privacy: {
    title: "Privacy Policy",
    updated: "Last updated: August 2026",
    sections: [
      ["What we collect", "From candidates: name, phone number, email, and resume file. From hosts: work email, company name, and the drives they create."],
      ["Why we collect it", "To run the walk-in queue you signed up for: issuing your token, estimating your wait, letting a recruiter see your profile, and showing your turn on a live token page. Status when you are called, selected, or rejected lives on that page — we do not send a paid message for every queue movement."],
      ["Who can see it", "Only recruiters signed in to the specific drive you joined. On the public lobby display, everyone else sees a token and a masked name — never your phone number, resume, or full name."],
      ["How long we keep it", "Candidate profiles stay in your account so you can join future drives without re-entering everything. You can ask us to delete your data at any time by writing to hello@tokenhire.app."],
      ["Where it's stored", "Resumes are stored encrypted. Every resume download by a recruiter is logged."],
      ["Your rights", "Under India's Digital Personal Data Protection Act, you can request a copy of your data, ask us to correct it, or ask us to delete it. Write to hello@tokenhire.app and we'll respond within a reasonable time."],
    ],
  },
  terms: {
    title: "Terms of Use",
    updated: "Last updated: August 2026",
    sections: [
      ["What TokenHire is", "A queue and check-in system for walk-in hiring drives. We are not a staffing agency, a recruiter, or a party to any employment decision — we provide the software; the hiring company makes the calls."],
      ["Accounts", "A company account belongs to the business that creates it. Anyone invited to that account can see and manage every drive under it. It's the company's responsibility to manage who has access."],
      ["Candidate use", "Creating a candidate profile is free and always will be. You're responsible for the accuracy of what you submit — a false experience claim or fabricated verification status can get an application rejected by the hiring company, not by us."],
      ["Fair use of check-in codes", "Joining a queue requires the live code shown on the lobby display, which refreshes every 45 seconds, or a one-time pass issued by front desk. HOST codes are for recruiters only. Sharing or forwarding a check-in code so that someone who is not at the venue can join the queue is a violation of these terms and may result in account suspension."],
      ["Fair use", "Paid plans do not advertise a candidate cap. TokenHire may apply reasonable usage limits for unusually large events so the live queue stays reliable for everyone on the day."],
      ["No guarantee of hiring outcomes", "TokenHire manages the queue and the record-keeping. We don't guarantee interviews, offers, or job placement — those decisions rest entirely with the hiring company running the drive."],
      ["Changes", "We may update these terms as the product changes. Material changes will be reflected here with an updated date."],
    ],
  },
};

export function LegalPage({ kind }) {
  if (kind === "all") {
    return (
      <div>
        <LegalPage kind="privacy" />
        <div style={{ height: 1, background: k.line, maxWidth: 720, margin: "0 auto" }} />
        <LegalPage kind="terms" />
      </div>
    );
  }
  const l = LEGAL[kind];
  if (!l) return null;
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 26px 80px" }}>
      <div style={{ fontSize: 15, color: k.coral, fontWeight: 500, marginBottom: 10 }}>{l.updated}</div>
      <h1 style={{ fontFamily: dsp, fontSize: "clamp(28px,4vw,40px)", fontWeight: 700, letterSpacing: -1, margin: "0 0 36px" }}>{l.title}</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
        {l.sections.map(([h, d]) => (
          <div key={h}>
            <div style={{ fontFamily: dsp, fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{h}</div>
            <div style={{ fontSize: 15, color: k.ink2, lineHeight: 1.75 }}>{d}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 40, padding: "16px 20px", background: k.cream2, borderRadius: 12, fontSize: 12.5, color: k.mid, lineHeight: 1.6 }}>
        This is a plain-language summary, not a substitute for legal advice. Questions about either document — write to hello@tokenhire.app.
      </div>
    </div>
  );
}

export function Contact() {
  const [f, setF] = useState({ role: "company", name: "", email: "", org: "", city: "", msg: "" });
  const [sent, setSent] = useState(false);
  const roleCopy = {
    company: { org: "Company name", msgPh: "Tell us about your walk-in drives — roles, volume, cities…" },
    agency: { org: "Agency name", msgPh: "Tell us how many client companies you run drives for…" },
    candidate: { org: "Which company's drive?", msgPh: "What's the issue — a code not working, a status question…" },
    other: { org: "Organisation (optional)", msgPh: "What can we help with?" },
  };
  const rc = roleCopy[f.role];
  return (
    <div style={{ maxWidth: 1040, margin: "0 auto", padding: "54px 26px 70px" }}>
      <div style={{ fontSize: 15, color: k.coral, fontWeight: 500, marginBottom: 16 }}>Contact</div>
      <h1 style={{ fontFamily: dsp, fontSize: "clamp(32px,4.4vw,48px)", fontWeight: 400, letterSpacing: -1.4, margin: "0 0 36px", lineHeight: 1.1 }}>
        Talk to us about a <b style={{ fontWeight: 800 }}>pilot</b>
      </h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 40 }} className="g2">
        <div>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 20 }}><Mail size={17} color={k.teal} style={{ marginTop: 2 }} /><div><div style={{ fontSize: 13, fontWeight: 600 }}>Email</div><div style={{ fontSize: 13.5, color: k.mid, fontFamily: typ }}>hello@tokenhire.app</div></div></div>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}><Phone size={17} color={k.teal} style={{ marginTop: 2 }} /><div><div style={{ fontSize: 13, fontWeight: 600 }}>Phone</div><div style={{ fontSize: 13.5, color: k.mid, fontFamily: typ }}>+91 90000 00000</div></div></div>
        </div>
        <div style={{ ...box, padding: 26 }}>
          {sent ? (
            <div><BadgeCheck size={22} color={k.teal} /><div style={{ fontFamily: dsp, fontSize: 16, fontWeight: 700, margin: "10px 0 5px" }}>Message received</div><div style={{ fontSize: 13.5, color: k.ink2 }}>We'll get back to you shortly.</div></div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); if (!f.name.trim() || !f.email.trim()) return; setSent(true); }} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              <Field label="I am a…">
                <Select
                  value={f.role}
                  onChange={(role) => setF({ ...f, role })}
                  options={[
                    { value: "company", label: "Company looking to hire" },
                    { value: "agency", label: "Staffing / recruitment agency" },
                    { value: "candidate", label: "Candidate" },
                    { value: "other", label: "Something else" },
                  ]}
                />
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="g2">
                <Field label="Name"><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} style={input} /></Field>
                <Field label="Email"><input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} style={input} /></Field>
              </div>
              <Field label={rc.org + (f.role !== "candidate" ? " (optional)" : "")}>
                <input value={f.org} onChange={(e) => setF({ ...f, org: e.target.value })} style={input} />
              </Field>
              <Field label="City">
                <CitySelect value={f.city || ""} onChange={(city) => setF({ ...f, city })} allowAll={false} placeholder="Select a city" />
              </Field>
              <Field label="Message"><textarea value={f.msg} onChange={(e) => setF({ ...f, msg: e.target.value })} rows={4} placeholder={rc.msgPh} style={{ ...input, resize: "vertical", fontFamily: bdy }} /></Field>
              <button type="submit" style={{ ...solid, justifyContent: "center", padding: 11, marginTop: 4 }}>Send</button>
              <div style={{ fontSize: 11.5, color: k.faint, lineHeight: 1.5 }}>Or write hello@tokenhire.app</div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function PageEnd() { return null; } // no longer used — nav already carries the primary CTA on every page
