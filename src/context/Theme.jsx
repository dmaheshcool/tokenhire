import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { readTheme, writeTheme } from "../lib/theme-pref.js";

const ThemeContext = createContext({ theme: "light", toggle: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readTheme);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    writeTheme(theme);
  }, [theme]);
  const value = useMemo(() => ({
    theme,
    toggle: () => setTheme((cur) => (cur === "dark" ? "light" : "dark")),
  }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
