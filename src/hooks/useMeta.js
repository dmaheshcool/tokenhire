import { useEffect } from "react";

const DEFAULT_TITLE = "TokenHire · Walk-in hiring, without the queue";

function setMeta(name, content, attr = "name") {
  let el = document.head.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/** Per-page title, description and optional JSON-LD. */
export function useMeta({ title, description, jsonLd } = {}) {
  const ld = jsonLd ? JSON.stringify(jsonLd) : "";
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title ? `${title} · TokenHire` : DEFAULT_TITLE;
    if (description) {
      setMeta("description", description);
      setMeta("og:description", description, "property");
    }
    setMeta("og:title", document.title, "property");
    let script;
    if (ld) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.dataset.page = "1";
      script.textContent = ld;
      document.head.appendChild(script);
    }
    return () => {
      document.title = prevTitle;
      if (script) script.remove();
    };
  }, [title, description, ld]);
}
