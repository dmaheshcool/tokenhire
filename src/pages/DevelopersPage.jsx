import { useEffect, useState } from "react";
import { AuthShell } from "../layouts/AuthShell.jsx";
import { api } from "../lib/api.js";
import { k, typ } from "../theme.js";

export default function DevelopersPage() {
  const [data, setData] = useState(null);
  useEffect(() => { api.routes().then(setData).catch(() => setData({ pages: [], api: ["Start the API to list routes"] })); }, []);
  return (
    <AuthShell title="API & pages" sub="Every auth, org, and server route in this build." backTo="/status">
      {data && (
        <>
          <div style={{ fontSize: 12, fontWeight: 700, color: k.faint, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 8 }}>Pages</div>
          {(data.pages || []).map((p) => <div key={p} style={{ fontFamily: typ, fontSize: 13, padding: "4px 0" }}>{p}</div>)}
          <div style={{ fontSize: 12, fontWeight: 700, color: k.faint, letterSpacing: 0.6, textTransform: "uppercase", margin: "18px 0 8px" }}>HTTP</div>
          {(data.api || []).map((p) => <div key={p} style={{ fontFamily: typ, fontSize: 12.5, padding: "4px 0", color: k.ink2 }}>{p}</div>)}
        </>
      )}
    </AuthShell>
  );
}
