const KEY = "th-theme";

export function readTheme() {
  try {
    return localStorage.getItem(KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function writeTheme(theme) {
  try {
    localStorage.setItem(KEY, theme === "dark" ? "dark" : "light");
  } catch {
    /* ignore */
  }
}
