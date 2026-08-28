import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ROTATE, code, memberEmail, memberRole } from "../lib/helpers.js";
import { seedDrive, seedExtraDrives, seedMegaDrive, seedOrgs, seedPlanDemoDrives } from "../data/seed.js";
import { api, readSavedProfile, readSession, writeSavedProfile, writeSession } from "../lib/api.js";

const StoreContext = createContext(null);

function localSeed() {
  return {
    orgs: seedOrgs(),
    drives: [seedMegaDrive(), seedDrive(), ...seedExtraDrives(), ...seedPlanDemoDrives()],
  };
}

export function StoreProvider({ children }) {
  const seed = useMemo(localSeed, []);
  const [drives, setDrives] = useState(seed.drives);
  const [orgs, setOrgs] = useState(seed.orgs);
  const [activeOrgId, setActiveOrgId] = useState(() => readSession()?.orgId || null);
  const [staffRole, setStaffRole] = useState(() => readSession()?.role || "recruiter");
  const [staffEmail, setStaffEmail] = useState(() => readSession()?.email || "");
  const [profile, setProfile] = useState(() => readSavedProfile());
  const [left, setLeft] = useState(ROTATE);
  const [beat, setBeat] = useState(0);
  const [apiOk, setApiOk] = useState(false);
  // Screens that look up a single token must not answer "no such token" from seed data
  // while the real queue is still in flight.
  const [hydrated, setHydrated] = useState(false);
  const versionRef = useRef(0);
  const skipPoll = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const snap = await api.snapshot();
        if (cancelled) return;
        if (!snap?.orgs) return;
        setOrgs(snap.orgs);
        setDrives(snap.drives);
        setLeft(snap.deskLeft || ROTATE);
        versionRef.current = snap.version || 0;
        setApiOk(true);
        const sess = readSession();
        if (sess?.token) {
          try {
            const me = await api.me();
            if (!cancelled && me.orgId) {
              setActiveOrgId(me.orgId);
              setStaffRole(me.role);
              setStaffEmail(me.email);
              writeSession({ token: sess.token, orgId: me.orgId, role: me.role, email: me.email });
            }
          } catch {
            writeSession(null);
            setActiveOrgId(null);
          }
        }
      } catch {
        setApiOk(false);
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!apiOk) {
      const i = setInterval(() => setLeft((s) => {
        if (s <= 1) { setDrives((p) => p.map((d) => ({ ...d, desk: code(6) }))); return ROTATE; }
        return s - 1;
      }), 1000);
      return () => clearInterval(i);
    }
    const i = setInterval(async () => {
      try {
        const snap = await api.snapshot();
        setLeft(snap.deskLeft || ROTATE);
        if (skipPoll.current) return;
        if ((snap.version || 0) > versionRef.current) {
          versionRef.current = snap.version;
          setOrgs(snap.orgs);
          setDrives(snap.drives);
        }
      } catch { /* keep local */ }
    }, 2000);
    return () => clearInterval(i);
  }, [apiOk]);

  useEffect(() => { const i = setInterval(() => setBeat((b) => b + 1), 4000); return () => clearInterval(i); }, []);

  useEffect(() => {
    writeSavedProfile(profile);
    if (profile?.phone && apiOk) api.putCandidate(profile).catch(() => {});
  }, [profile, apiOk]);

  useEffect(() => {
    if (!apiOk) return;
    skipPoll.current = true;
    const t = setTimeout(() => {
      api.putSnapshot({ orgs, drives }).then((snap) => {
        if (snap?.version) versionRef.current = snap.version;
      }).catch(() => {}).finally(() => { skipPoll.current = false; });
    }, 450);
    return () => clearTimeout(t);
  }, [orgs, drives, apiOk]);

  function signInLocal(orgId, role, email) {
    setActiveOrgId(orgId);
    setStaffRole(role || "recruiter");
    setStaffEmail(email || "");
  }

  async function signInWithPassword(email, password) {
    const em = email.trim();
    try {
      const r = await api.login({ email: em, password });
      writeSession({ token: r.token, orgId: r.orgId, role: r.role, email: r.email });
      if (r.org) setOrgs((p) => p.some((o) => o.id === r.org.id) ? p.map((o) => o.id === r.org.id ? { ...o, ...r.org, password: o.password || password } : o) : [...p, { ...r.org, password }]);
      signInLocal(r.orgId, r.role, r.email);
      return { ok: true };
    } catch (e) {
      const org = orgs.find((o) => o.email?.toLowerCase() === em.toLowerCase() || (o.members || []).some((m) => memberEmail(m).toLowerCase() === em.toLowerCase()));
      if (!org) return { ok: false, error: e.message || "No company account found with that email." };
      if (org.password !== password) return { ok: false, error: "Incorrect password." };
      const mem = org.members.find((m) => memberEmail(m).toLowerCase() === em.toLowerCase());
      writeSession({ token: "", orgId: org.id, role: mem ? memberRole(mem) : "recruiter", email: em });
      signInLocal(org.id, mem ? memberRole(mem) : "recruiter", em);
      return { ok: true, offline: true };
    }
  }

  async function signUpOrg({ companyName, email, password, kind }) {
    try {
      const r = await api.signup({ companyName, email, password, kind });
      writeSession({ token: r.token, orgId: r.orgId, role: r.role, email: r.email });
      const org = { ...r.org, password, plan: "trial" };
      setOrgs((p) => [...p.filter((o) => o.id !== org.id), org]);
      signInLocal(r.orgId, r.role, r.email);
      return { ok: true, verify: true };
    } catch (e) {
      if (orgs.some((o) => o.email.toLowerCase() === email.trim().toLowerCase())) {
        return { ok: false, error: "An account with that email already exists — sign in instead." };
      }
      if (e.status && e.status !== 0 && e.message && !String(e.message).includes("fetch")) {
        return { ok: false, error: e.message };
      }
      const id = `org_${Date.now()}`;
      const agency = kind === "agency";
      const name = companyName.trim();
      const org = {
        id, name, short: name.split(" ")[0], kind, color: agency ? "#0F8A6B" : "#341C8A",
        logo: agency ? "bars" : "ring", wash: agency ? "#E6F5F0" : "#EEE8F8",
        email: email.trim(), password, plan: "trial", verified: false,
        members: [{ email: email.trim(), role: "recruiter" }],
        clients: agency ? [] : [{ id: "cl_own", name: "Own hiring" }],
        branches: [],
      };
      setOrgs((p) => [...p, org]);
      writeSession({ token: "", orgId: id, role: "recruiter", email: email.trim() });
      signInLocal(id, "recruiter", email.trim());
      return { ok: true, verify: true, offline: true };
    }
  }

  async function signOut() {
    try { await api.logout(); } catch { /* ignore */ }
    writeSession(null);
    setActiveOrgId(null);
    setStaffRole("recruiter");
    setStaffEmail("");
  }

  const value = useMemo(() => ({
    drives, setDrives, orgs, setOrgs, activeOrgId, setActiveOrgId, staffRole, setStaffRole, staffEmail,
    profile, setProfile, left, beat, apiOk, hydrated, signInWithPassword, signUpOrg, signOut, signInLocal,
  }), [drives, orgs, activeOrgId, staffRole, staffEmail, profile, left, beat, apiOk, hydrated]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
