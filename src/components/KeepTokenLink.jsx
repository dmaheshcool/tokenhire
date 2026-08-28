import { useState } from "react";
import { Copy, Check, Share2, Bookmark } from "lucide-react";
import { box, ghostSm, k, solidSm, typ } from "../theme.js";
import { tokenHref } from "../lib/helpers.js";

export function KeepTokenLink({ driveId, token, claim }) {
  const href = tokenHref(driveId, token, claim);
  const [copied, setCopied] = useState(false);
  const ios = typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);

  async function copy() {
    try {
      await navigator.clipboard.writeText(href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy your token link", href);
    }
  }

  async function share() {
    if (navigator.share) {
      try { await navigator.share({ title: `TokenHire ${token}`, text: `My walk-in token ${token}. Open this to see when I'm up.`, url: href }); return; } catch { /* cancelled */ }
    }
    copy();
  }

  return (
    <div style={{ ...box, padding: 16, marginTop: 14, background: k.cream2 }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}><Bookmark size={14} /> Save your token</div>
      <p style={{ fontSize: 12.5, color: k.ink2, lineHeight: 1.5, margin: "0 0 10px" }}>
        Open this link any time to see your place in line.
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" onClick={copy} style={solidSm}>{copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy link</>}</button>
        <button type="button" onClick={share} style={ghostSm}><Share2 size={14} /> Send to myself</button>
      </div>
      <div style={{ fontSize: 11.5, color: k.faint, marginTop: 10, lineHeight: 1.5 }}>
        {ios ? "Safari: Share → Add to Home Screen" : "Chrome: menu → Add to Home screen"}
      </div>
    </div>
  );
}
