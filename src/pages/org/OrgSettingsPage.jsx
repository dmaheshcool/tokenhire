import { useState } from "react";
import { Field } from "../../components/ui.jsx";
import { useStore } from "../../context/Store.jsx";
import { input, k, solid } from "../../theme.js";
import { dsp } from "../../theme.js";

export default function OrgSettingsPage() {
  const { orgs, setOrgs, activeOrgId } = useStore();
  const org = orgs.find((o) => o.id === activeOrgId);
  const [name, setName] = useState(org?.name || "");
  const [email, setEmail] = useState(org?.email || "");
  const [saved, setSaved] = useState(false);
  if (!org) return null;

  function save(e) {
    e.preventDefault();
    setOrgs((p) => p.map((o) => o.id === org.id ? { ...o, name: name.trim() || o.name, email: email.trim() || o.email } : o));
    setSaved(true);
  }

  return (
    <div>
      <h1 style={{ fontFamily: dsp, fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>Company</h1>
      <p style={{ fontSize: 14, color: k.mid, margin: "0 0 18px" }}>Legal name and login email for this space.</p>
      <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: 13, maxWidth: 420 }}>
        <Field label="Company name"><input value={name} onChange={(e) => setName(e.target.value)} style={input} /></Field>
        <Field label="Owner email"><input value={email} onChange={(e) => setEmail(e.target.value)} style={input} /></Field>
        <Field label="Type"><div style={input}>{org.kind === "agency" ? "Staffing agency" : "Enterprise / captive"}</div></Field>
        {saved && <div style={{ fontSize: 12.5, color: k.teal }}>Saved in this space.</div>}
        <button type="submit" style={{ ...solid, justifyContent: "center", width: "fit-content" }}>Save</button>
      </form>
    </div>
  );
}
