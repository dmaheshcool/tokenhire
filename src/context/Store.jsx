import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ROTATE, code } from "../lib/helpers.js";
import { seedDrive, seedExtraDrives, seedMegaDrive, seedOrgs, seedPlanDemoDrives } from "../data/seed.js";

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [drives, setDrives] = useState(() => [seedMegaDrive(), seedDrive(), ...seedExtraDrives(), ...seedPlanDemoDrives()]);
  const [orgs, setOrgs] = useState(() => seedOrgs());
  const [activeOrgId, setActiveOrgId] = useState(null);
  const [staffRole, setStaffRole] = useState("recruiter");
  const [profile, setProfile] = useState(null);
  const [left, setLeft] = useState(ROTATE);
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    const i = setInterval(() => setLeft((s) => {
      if (s <= 1) { setDrives((p) => p.map((d) => ({ ...d, desk: code(6) }))); return ROTATE; }
      return s - 1;
    }), 1000);
    return () => clearInterval(i);
  }, []);
  useEffect(() => { const i = setInterval(() => setBeat((b) => b + 1), 4000); return () => clearInterval(i); }, []);

  const value = useMemo(() => ({
    drives, setDrives, orgs, setOrgs, activeOrgId, setActiveOrgId, staffRole, setStaffRole, profile, setProfile, left, beat,
  }), [drives, orgs, activeOrgId, staffRole, profile, left, beat]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
