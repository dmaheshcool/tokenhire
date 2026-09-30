const COMMON = new Set([
  "password", "password1", "password12", "password123", "passw0rd",
  "12345678", "123456789", "1234567890", "qwertyui", "qwerty123",
  "letmein1", "welcome1", "welcome12", "abc12345", "iloveyou",
  "admin123", "admin1234", "rootroot", "passpass", "changeme",
  "football", "baseball", "starwars", "dragon12", "monkey12",
  "master12", "login123", "trustno1", "sunshine", "princess",
  "qwerty12", "1q2w3e4r", "zaq12wsx", "password!", "p@ssw0rd",
]);

export function passwordIssue(plain) {
  const value = String(plain || "");
  if (value.length < 8) return "short";
  if (COMMON.has(value.toLowerCase())) return "common";
  return null;
}
