import { useState, useEffect } from "react";

export function useNarrow() {
  const [n, setN] = useState(() => typeof window !== "undefined" && window.matchMedia("(max-width: 860px)").matches);
  useEffect(() => {
    const q = window.matchMedia("(max-width: 860px)");
    const fn = () => setN(q.matches);
    q.addEventListener("change", fn);
    return () => q.removeEventListener("change", fn);
  }, []);
  return n;
}
