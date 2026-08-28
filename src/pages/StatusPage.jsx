import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthShell } from "../layouts/AuthShell.jsx";
import { api } from "../lib/api.js";
import { box, k, solidSm } from "../theme.js";

export default function StatusPage() {
  const [h, setH] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    api.live().then((x) => { if (x) setH(x); else setErr("API is not running. Start it with npm run dev (client + server)."); }).catch((e) => setErr(e.message));
  }, []);

  return (
    <AuthShell title="Server status" sub="Health of the TokenHire API used for auth, org data, and the live DESK rotation.">
      {err && <div style={{ fontSize: 13.5, color: k.red, marginBottom: 12 }}>{err}</div>}
      {h && (
        <div style={{ display: "grid", gap: 10, fontSize: 13.5 }}>
          {[["Service", h.service], ["Version", h.version], ["Uptime", `${h.uptimeSec}s`], ["Orgs", h.orgs], ["Drives", h.drives], ["Sessions", h.sessions], ["DESK rotates in", `${h.deskLeft}s`], ["Storage", h.storage === "postgres" ? "Postgres (durable)" : "Local file (demo only)"]].map(([l, v]) => (
            <div key={l} style={{ ...box, padding: "10px 12px", display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: k.mid }}>{l}</span><b>{v}</b>
            </div>
          ))}
        </div>
      )}
      {h?.storage === "file" && (
        <div style={{ marginTop: 12, background: k.goldDim, color: k.gold, borderRadius: 10, padding: "10px 12px", fontSize: 12.5, lineHeight: 1.5 }}>
          Queues are held in a local file. On a serverless host this is erased between requests — set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before a real drive.
        </div>
      )}
      <div style={{ marginTop: 16 }}>
        <Link to="/developers" style={{ ...solidSm, textDecoration: "none" }}>API routes</Link>
      </div>
    </AuthShell>
  );
}
