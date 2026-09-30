import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { bdy, dsp, k, box, input, solid, outline, textLink } from "../theme.js";
import { CitySelect, DocPicker, Field } from "../components/ui.jsx";
import { useStore } from "../context/Store.jsx";
import { api } from "../lib/api.js";
import { t } from "../i18n/strings.js";
import { EXP_BANDS, isWorkEmail, todayStr } from "../lib/helpers.js";

const empty = {
  role: "",
  city: "",
  venue: "",
  date: todayStr(),
  endDate: todayStr(),
  jd: "",
  expNeeded: [],
  docs: ["Updated resume (print + PDF)"],
};

export default function ListWalkInPage() {
  const { drives, setDrives, orgs, activeOrgId, staffEmail } = useStore();
  const account = orgs.find((o) => o.id === activeOrgId);
  const [form, setForm] = useState(empty);
  const [listCode, setListCode] = useState("");
  const [saved, setSaved] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const workEmail = isWorkEmail(staffEmail);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function fill(listing) {
    const start = listing.date || todayStr();
    setForm({
      role: listing.role || "",
      city: listing.city || "",
      venue: listing.venue || "",
      date: start,
      endDate: listing.endDate || start,
      jd: listing.jd || "",
      expNeeded: listing.expNeeded || [],
      docs: listing.docs || [],
    });
  }

  function toggle(key, value) {
    setForm((f) => {
      const has = f[key].includes(value);
      return { ...f, [key]: has ? f[key].filter((x) => x !== value) : [...f[key], value] };
    });
  }

  async function loadCode() {
    const codeIn = listCode.trim().toUpperCase();
    if (!codeIn) return;
    setError("");
    setBusy(true);
    try {
      const r = await api.publishListing({ lookup: true, listCode: codeIn });
      fill(r.listing);
      setListCode(codeIn);
      setSaved("");
    } catch (e) {
      if (e.status) {
        setError(e.message);
      } else {
        const local = drives.find((d) => d.listingOnly && d.listCode === codeIn);
        if (!local) setError("No listing with that code in this browser.");
        else {
          fill(local);
          setListCode(codeIn);
          setSaved("");
        }
      }
    } finally {
      setBusy(false);
    }
  }

  function remember(drive) {
    setDrives((prev) => [drive, ...prev.filter((d) => d.id !== drive.id)]);
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!account || !workEmail) {
      setError("Sign in to the company account before listing a walk-in.");
      return;
    }
    const endDate = form.endDate || form.date;
    if (!form.role.trim() || !form.city || !form.venue.trim() || !form.date || !endDate) {
      setError("Fill in role, city, venue, and both dates.");
      return;
    }
    if (endDate < form.date) {
      setError("The end date is before the start date.");
      return;
    }
    if (endDate < todayStr()) {
      setError("That walk-in has already ended.");
      return;
    }
    const payload = { ...form, endDate, company: account.name, email: staffEmail, listCode: listCode.trim().toUpperCase() };
    setBusy(true);
    try {
      const r = await api.publishListing(payload);
      setSaved(r.listCode);
      setListCode(r.listCode);
      if (r.drive) remember(r.drive);
    } catch (err) {
      setError(err.status ? err.message : "The listing server is not reachable, so this was not published.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ background: k.cream2, minHeight: "70vh" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 26px 72px" }}>
        <Link to="/walk-ins" style={{ ...textLink, textDecoration: "none" }}>← Walk-ins</Link>
        <h1 style={{ fontFamily: dsp, fontWeight: 700, letterSpacing: -1.2, fontSize: "clamp(32px, 4vw, 44px)", margin: "14px 0 10px" }}>
          List your next walk-in.
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.55, color: k.ink2, margin: "0 0 22px", maxWidth: 560 }}>
          Post the next date. You do not have to run the queue on TokenHire.
        </p>

        {!account ? (
          <div style={{ ...box, padding: 22 }}>
            <div style={{ fontFamily: dsp, fontSize: 20, fontWeight: 700, marginBottom: 14 }}>Sign in to list a walk-in.</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link to="/company/start" state={{ from: "/walk-ins/list" }} style={{ ...solid, textDecoration: "none" }}>{t("nav.employerSignIn")}</Link>
              <Link to="/register" style={{ ...outline, textDecoration: "none" }}>{t("nav.startHiring")}</Link>
            </div>
          </div>
        ) : !workEmail ? (
          <div style={{ ...box, padding: 22 }}>
            <div style={{ fontFamily: dsp, fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Use a work email.</div>
            <p style={{ fontSize: 14.5, color: k.ink2, lineHeight: 1.55, margin: 0 }}>
              {staffEmail || "This sign-in"} cannot list a walk-in.
            </p>
          </div>
        ) : (
        <>
        <div style={{ ...box, padding: 18, marginBottom: 14 }}>
          <div style={{ fontSize: 13, color: k.ink2, marginBottom: 12 }}>
            Posting as <b>{account.name}</b> · {staffEmail}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
            <Field label="Already listed? Update with your code">
              <input value={listCode} onChange={(e) => setListCode(e.target.value.toUpperCase())} placeholder="Update code" style={{ ...input, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1, maxWidth: 220 }} />
            </Field>
            <button type="button" onClick={loadCode} disabled={busy} style={outline}>Load</button>
          </div>
        </div>

        {saved ? (
          <div style={{ ...box, padding: 22, marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 650, color: k.mid, marginBottom: 6 }}>On the board under {account.name}. Keep this code to change it later.</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 28, fontWeight: 700, letterSpacing: 2, color: k.ink }}>{saved}</div>
            <Link to="/walk-ins" style={{ ...solid, textDecoration: "none", marginTop: 16 }}>See it on the board</Link>
          </div>
        ) : null}

        <form onSubmit={submit} style={{ ...box, padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Role"><input value={form.role} onChange={(e) => set("role", e.target.value)} placeholder="Customer Support Executive" style={input} /></Field>
          <Field label="City"><CitySelect value={form.city} onChange={(city) => set("city", city)} placeholder="Type a city" /></Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="g2">
            <Field label="Starts">
              <input type="date" value={form.date} onChange={(e) => {
                const date = e.target.value;
                setForm((f) => ({ ...f, date, endDate: !f.endDate || f.endDate < date ? date : f.endDate }));
              }} style={input} />
            </Field>
            <Field label="Ends">
              <input type="date" value={form.endDate || form.date} min={form.date} onChange={(e) => set("endDate", e.target.value)} style={input} />
            </Field>
          </div>
          <div style={{ fontSize: 12.5, color: k.mid, marginTop: -6 }}>One day: leave both dates the same. It leaves the board after the end date.</div>
          <Field label="Venue"><input value={form.venue} onChange={(e) => set("venue", e.target.value)} placeholder="Building, gate, floor" style={input} /></Field>
          <Field label="Who should come">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {EXP_BANDS.map((b) => {
                const on = form.expNeeded.includes(b);
                return (
                  <button key={b} type="button" onClick={() => toggle("expNeeded", b)} style={{
                    border: `1px solid ${on ? k.coral : k.line}`,
                    background: on ? k.coralDim : "#fff",
                    color: on ? k.coral : k.ink2,
                    borderRadius: 999, padding: "7px 12px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: bdy,
                  }}>{b}</button>
                );
              })}
            </div>
          </Field>
          <div>
            <div style={{ fontSize: 12, color: k.mid, fontWeight: 600, marginBottom: 8 }}>What to carry</div>
            <DocPicker docs={form.docs} onChange={(docs) => set("docs", docs)} />
          </div>
          <Field label="Note for candidates">
            <textarea value={form.jd} onChange={(e) => set("jd", e.target.value)} rows={4} placeholder="Shift, language, who they will meet" style={{ ...input, resize: "vertical", fontFamily: bdy }} />
          </Field>
          {error && <div style={{ fontSize: 13.5, color: k.red }}>{error}</div>}
          <button type="submit" disabled={busy} style={{ ...solid, alignSelf: "flex-start" }}>{listCode.trim() ? "Update the listing" : "Publish the listing"}</button>
        </form>
        </>
        )}
      </div>
    </div>
  );
}

export function ConfirmWalkInPage() {
  const [params] = useSearchParams();
  const token = params.get("t") || "";
  const { setDrives } = useStore();
  const [state, setState] = useState(token ? "working" : "bad");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    let gone = false;
    api.confirmListing({ token }).then((r) => {
      if (gone) return;
      if (r.drive) setDrives((prev) => [r.drive, ...prev.filter((d) => d.id !== r.drive.id)]);
      setState("ok");
    }).catch((e) => {
      if (gone) return;
      setError(e.message || "That confirmation link is not valid.");
      setState("bad");
    });
    return () => { gone = true; };
  }, [token, setDrives]);

  return (
    <div style={{ background: k.cream2, minHeight: "70vh" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "64px 26px" }}>
        <h1 style={{ fontFamily: dsp, fontWeight: 700, letterSpacing: -1, fontSize: 36, margin: "0 0 12px" }}>
          {state === "ok" ? "This walk-in is on the board." : state === "working" ? "Confirming…" : "This link is not valid."}
        </h1>
        <p style={{ fontSize: 16, color: k.ink2, lineHeight: 1.55, margin: "0 0 18px" }}>
          {state === "ok"
            ? "The work inbox opened the link, so candidates can see the date."
            : error || "Open the confirmation from the company email."}
        </p>
        <Link to="/walk-ins" style={{ ...solid, textDecoration: "none" }}>Walk-ins</Link>
      </div>
    </div>
  );
}
