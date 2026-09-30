import { Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useStore } from "../../context/Store.jsx";
import { api } from "../../lib/api.js";
import { AuthShell } from "../../layouts/AuthShell.jsx";
import { t } from "../../i18n/strings.js";
import { k, textLink } from "../../theme.js";

export default function HireForPage() {
  const { activeOrgId, orgs, setOrgs } = useStore();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const org = orgs.find((o) => o.id === activeOrgId);

  if (!activeOrgId || !org) return <Navigate to="/company/start" replace />;
  if (org.verified === false) return <Navigate to="/company/start" replace />;
  if (org.hireForAsked !== false) return <Navigate to="/app/today" replace />;

  async function choose(kind) {
    setBusy(true);
    const agency = kind === "agency";
    const patch = {
      kind,
      hireForAsked: true,
      color: agency ? "#0F8A6B" : "#341C8A",
      logo: agency ? "bars" : "ring",
      wash: agency ? "#E6F5F0" : "#EEE8F8",
      clients: agency ? [] : [{ id: "cl_own", name: "Own hiring" }],
    };
    try {
      const r = await api.patchOrg(patch);
      const next = r.org || { ...org, ...patch };
      setOrgs((p) => p.map((o) => (o.id === org.id ? { ...o, ...next } : o)));
    } catch {
      setOrgs((p) => p.map((o) => (o.id === org.id ? { ...o, ...patch } : o)));
    }
    nav("/app/today", { replace: true });
  }

  async function skip() {
    setBusy(true);
    const patch = { hireForAsked: true };
    try {
      const r = await api.patchOrg(patch);
      const next = r.org || { ...org, ...patch };
      setOrgs((p) => p.map((o) => (o.id === org.id ? { ...o, ...next } : o)));
    } catch {
      setOrgs((p) => p.map((o) => (o.id === org.id ? { ...o, ...patch } : o)));
    }
    nav("/app/today", { replace: true });
  }

  const pick = (id) => ({
    textAlign: "left", padding: 14, borderRadius: 10, cursor: busy ? "wait" : "pointer", fontFamily: "inherit",
    border: `1px solid ${k.line}`, background: "#fff", width: "100%",
  });

  return (
    <AuthShell title={t("auth.hiringFor")} audience={null}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button type="button" disabled={busy} onClick={() => choose("captive")} style={pick("captive")}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{t("auth.ownCompany")}</div>
          <div style={{ fontSize: 12.5, color: k.mid, marginTop: 4 }}>{t("auth.ownCompanyHelp")}</div>
        </button>
        <button type="button" disabled={busy} onClick={() => choose("agency")} style={pick("agency")}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{t("auth.hireClients")}</div>
          <div style={{ fontSize: 12.5, color: k.mid, marginTop: 4 }}>{t("auth.hireClientsHelp")}</div>
        </button>
        <button type="button" disabled={busy} onClick={skip} style={{ ...textLink, background: "none", border: 0, padding: "8px 0", cursor: "pointer", textAlign: "left" }}>
          {t("console.setup.skip")}
        </button>
      </div>
    </AuthShell>
  );
}
