import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { memberEmail, memberRole, scrubDrive, ROTATE } from "../lib/helpers.js";
import { applyDueWraps, migrateRoleContent, migrateUnresolvedWrapped } from "../lib/wrap.js";
import { boardOrgs, seedBoardDrives, seedDrive, seedExtraDrives, seedMegaDrive, seedOrgs, seedPlanDemoDrives } from "../data/seed.js";
import { api, readSavedProfile, readSession, writeSavedProfile, writeSession } from "../lib/api.js";
import { readDeviceId } from "../lib/device.js";

const StoreContext = createContext(null);

function finalizeDrives(list) {
  const mig = migrateUnresolvedWrapped((list || []).map((d) => migrateRoleContent(scrubDrive(d))));
  if (mig.report.length) {
    console.info("Wrapped-up drives: marked leftover tokens Not seen", mig.report.map((r) => ({
      driveId: r.driveId, role: r.role, changed: r.changed, tokens: r.tokens.map((x) => x.token),
    })));
  }
  return applyDueWraps(mig.drives);
}

function localSeed() {
  return {
    orgs: [...seedOrgs(), ...boardOrgs()],
    drives: finalizeDrives([seedMegaDrive(), seedDrive(), ...seedExtraDrives(), ...seedPlanDemoDrives(), ...seedBoardDrives()]),
  };
}

export function StoreProvider({ children }) {
  const seed = useMemo(localSeed, []);
  const [drives, setDrivesState] = useState(seed.drives);
  const [orgs, setOrgsState] = useState(seed.orgs);
  const [activeOrgId, setActiveOrgId] = useState(() => readSession()?.orgId || null);
  const [staffRole, setStaffRole] = useState(() => readSession()?.role || "recruiter");
  const [staffEmail, setStaffEmail] = useState(() => readSession()?.email || "");
  const [profile, setProfile] = useState(() => {
    const p = readSavedProfile();
    if (!p) return p;
    return { ...p, deviceId: p.deviceId || readDeviceId() };
  });
  const [left, setLeft] = useState(ROTATE);
  const [beat, setBeat] = useState(0);
  const [apiOk, setApiOk] = useState(false);
  // Screens that look up a single token must not answer "no such token" from seed data
  // while the real queue is still in flight.
  const [hydrated, setHydrated] = useState(false);
  const versionRef = useRef(0);
  const skipPoll = useRef(false);
  // TV / marketing tabs were echoing an older snapshot back and wiping room assignments.
  const persistFromUi = useRef(false);
  const setDrives = useCallback((next) => { persistFromUi.current = true; setDrivesState(next); }, []);
  const setOrgs = useCallback((next) => { persistFromUi.current = true; setOrgsState(next); }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const snap = await api.snapshot();
        if (cancelled) return;
        if (!snap?.orgs) return;
        setOrgsState(snap.orgs);
        setDrivesState(finalizeDrives(snap.drives || []));
        setLeft(snap.deskLeft || ROTATE);
        versionRef.current = snap.version || 0;
        setApiOk(true);
        const sess = readSession();
        try {
          const me = await api.me();
          if (!cancelled && me.orgId) {
            setActiveOrgId(me.orgId);
            setStaffRole(me.role);
            setStaffEmail(me.email);
            writeSession({ orgId: me.orgId, role: me.role, email: me.email });
          }
        } catch {
          if (sess?.orgId) {
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
      const i = setInterval(() => setLeft((s) => (s <= 1 ? 60 : s - 1)), 1000);
      return () => clearInterval(i);
    }
    const i = setInterval(async () => {
      try {
        const snap = await api.snapshot();
        setLeft(snap.deskLeft || 60);
        if (skipPoll.current) return;
        if ((snap.version || 0) > versionRef.current) {
          versionRef.current = snap.version;
          setOrgsState(snap.orgs);
          setDrivesState(finalizeDrives(snap.drives || []));
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
    if (!apiOk || !persistFromUi.current) return;
    skipPoll.current = true;
    const t = setTimeout(() => {
      persistFromUi.current = false;
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

  function applySession(r) {
    if (!r?.orgId) return;
    if (r.org) {
      setOrgs((p) => p.some((o) => o.id === r.org.id)
        ? p.map((o) => (o.id === r.org.id ? { ...o, ...r.org } : o))
        : [...p, r.org]);
    }
    writeSession({ orgId: r.orgId, role: r.role, email: r.email });
    signInLocal(r.orgId, r.role, r.email);
  }

  async function signInWithPassword(email, password) {
    const em = email.trim();
    try {
      const r = await api.login({ email: em, password });
      applySession(r);
      return { ok: true, org: r.org };
    } catch (e) {
      if (e.data?.status === "unverified") return { ok: false, status: "unverified", error: e.message };
      const org = orgs.find((o) => o.email?.toLowerCase() === em.toLowerCase() || (o.members || []).some((m) => memberEmail(m).toLowerCase() === em.toLowerCase()));
      if (!org) return { ok: false, error: e.message || "Incorrect email or password." };
      if (org.verified === false) return { ok: false, status: "unverified" };
      if (org.password !== password) return { ok: false, error: "Incorrect email or password." };
      const mem = org.members.find((m) => memberEmail(m).toLowerCase() === em.toLowerCase());
      writeSession({ orgId: org.id, role: mem ? memberRole(mem) : "recruiter", email: em });
      signInLocal(org.id, mem ? memberRole(mem) : "recruiter", em);
      return { ok: true, org, offline: true };
    }
  }

  async function signUpOrg({ companyName, email, password, kind = "captive" }) {
    try {
      const r = await api.signup({ companyName, email, password, kind });
      if (r.org) setOrgs((p) => [...p.filter((o) => o.id !== r.org.id), r.org]);
      return { ok: true, verify: true, verifyToken: r.verifyToken, org: r.org };
    } catch (e) {
      if (orgs.some((o) => o.email.toLowerCase() === email.trim().toLowerCase())) {
        return { ok: false, error: "An account with that email already exists — sign in instead." };
      }
      if (e.status && e.status !== 0 && e.message && !String(e.message).includes("fetch")) {
        return { ok: false, error: e.message };
      }
      const id = `org_${Date.now()}`;
      const name = companyName.trim();
      const agency = kind === "agency";
      const org = {
        id, name, short: name.split(" ")[0], kind: agency ? "agency" : "captive", hireForAsked: true, color: agency ? "#0F8A6B" : "#341C8A",
        logo: agency ? "bars" : "ring", wash: agency ? "#E6F5F0" : "#EEE8F8",
        email: email.trim(), password, plan: "single", billingCycle: "drive", verified: false,
        members: [{ email: email.trim(), role: "recruiter" }],
        clients: agency ? [] : [{ id: "cl_own", name: "Own hiring" }],
        branches: [],
      };
      setOrgs((p) => [...p, org]);
      return { ok: true, verify: true, offline: true, org };
    }
  }

  async function signOut() {
    try { await api.logout(); } catch { /* ignore */ }
    writeSession(null);
    setActiveOrgId(null);
    setStaffRole("recruiter");
    setStaffEmail("");
  }

  async function signOutAll() {
    try { await api.logoutAll(); } catch { await signOut(); return; }
    writeSession(null);
    setActiveOrgId(null);
    setStaffRole("recruiter");
    setStaffEmail("");
  }

  const value = useMemo(() => ({
    drives, setDrives, orgs, setOrgs, activeOrgId, setActiveOrgId, staffRole, setStaffRole, staffEmail,
    profile, setProfile, left, beat, apiOk, hydrated, signInWithPassword, signUpOrg, signOut, signOutAll, signInLocal, applySession,
  }), [drives, orgs, activeOrgId, staffRole, staffEmail, profile, left, beat, apiOk, hydrated]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
