import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useStore } from "../context/Store.jsx";
import { Slip } from "./app/CandidatePage.jsx";
import { bdy, k } from "../theme.js";
import { Wordmark } from "../components/brand.jsx";

export default function TokenPage() {
  const { driveId, token } = useParams();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const { drives, hydrated } = useStore();
  const kCode = params.get("k") || "";
  const drive = drives.find((d) => d.id === driveId);
  const cand = drive?.candidates.find((c) => c.token === token || c.id === token);

  // Until the live queue has been fetched once, the only data on hand is local seed
  // data — telling a candidate their token doesn't exist would be wrong and alarming.
  if (!cand && !hydrated) {
    return wrap(
      <p style={{ fontSize: 14, color: k.mid, lineHeight: 1.55 }}>Looking up token {token}…</p>
    );
  }
  if (!drive) {
    return wrap(
      <p style={{ fontSize: 14, color: k.mid, lineHeight: 1.55 }}>That walk-in isn’t on this device’s live queue yet. Open the same link again in a moment, or check in at the desk.</p>
    );
  }
  if (!cand) {
    return wrap(
      <p style={{ fontSize: 14, color: k.mid, lineHeight: 1.55 }}>No token {token} on this drive. Ask the desk to look you up, or join again with GATE + DESK.</p>
    );
  }
  if (cand.claim && kCode && cand.claim !== kCode) {
    return wrap(
      <p style={{ fontSize: 14, color: k.mid, lineHeight: 1.55 }}>This isn’t the link from your admission slip. Open the copied or bookmarked URL.</p>
    );
  }

  const r = { dup: false, token: cand.token, drive, cand };
  return (
    <div style={{ minHeight: "100vh", background: k.cream2, fontFamily: bdy, color: k.ink, padding: "22px 18px 40px" }}>
      <div style={{ maxWidth: 440, margin: "0 auto" }}>
        <div style={{ marginBottom: 16 }}><Wordmark size={18} /></div>
        <Slip r={r} drives={drives} onAgain={() => nav("/app/join")} keep />
        <div style={{ marginTop: 14, fontSize: 12.5 }}>
          <Link to="/app/join" style={{ color: k.coral, fontWeight: 600 }}>Join another walk-in</Link>
        </div>
      </div>
    </div>
  );
}

function wrap(inner) {
  return (
    <div style={{ minHeight: "100vh", background: k.cream2, fontFamily: bdy, color: k.ink, padding: 26, maxWidth: 440, margin: "0 auto" }}>
      <Wordmark size={18} />
      <div style={{ marginTop: 18 }}>{inner}</div>
      <Link to="/app/join" style={{ color: k.coral, fontWeight: 600, fontSize: 13, display: "inline-block", marginTop: 16 }}>Back to join</Link>
    </div>
  );
}
