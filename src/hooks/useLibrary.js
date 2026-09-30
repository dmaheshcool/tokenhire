import { useCallback, useMemo } from "react";
import { useConsole } from "../layouts/ConsoleLayout.jsx";
import { addItem, libraryOf, orgWithLibrary, withNewItems } from "../lib/library.js";

/** The signed-in company's library, and a way to change it without losing a concurrent edit. */
export function useLibrary() {
  const { org, setOrgs, drives, setDrives } = useConsole();
  const lib = useMemo(() => libraryOf(org, drives), [org, drives]);
  const orgId = org?.id;

  const update = useCallback((fn) => {
    setOrgs((p) => p.map((o) => (o.id === orgId ? orgWithLibrary(o, fn(libraryOf(o, drives))) : o)));
  }, [orgId, setOrgs, drives]);

  /** Adds right away and returns the item, so a combobox can link to its id. */
  const add = useCallback((kind, text, extra) => {
    const r = addItem(lib, kind, text, extra);
    if (r.item && r.lib !== lib) update((cur) => withNewItems(cur, r.lib));
    return r.item;
  }, [lib, update]);

  return { lib, update, add, drives, setDrives, orgId };
}
