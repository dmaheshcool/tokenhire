import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

// The rules that matter most here are no-undef and react/jsx-no-undef. A component or
// helper that is used but never imported still builds cleanly and only crashes when its
// branch happens to render, which is how a blank check-in screen reached a demo.
// Both are needed: no-undef does not see JSX element names, and jsx-no-undef only sees
// those.
export default [
  {
    files: ["src/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser, React: "readonly" },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { react, "react-hooks": reactHooks },
    settings: { react: { version: "detect" } },
    rules: {
      "no-undef": "error",
      "react/jsx-no-undef": "error",
      // Counts JSX element names as variable usage, without which every component
      // import looks unused.
      "react/jsx-uses-vars": "error",
      "react/jsx-uses-react": "error",
      "no-unused-vars": ["warn", { args: "none", varsIgnorePattern: "^React$" }],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "no-restricted-syntax": ["error",
        { selector: "CallExpression[callee.property.name='toLocaleDateString']", message: "Use formatIST from src/lib/time.js." },
        { selector: "CallExpression[callee.property.name='toLocaleTimeString']", message: "Use formatIST from src/lib/time.js." },
        { selector: "CallExpression[callee.property.name='toLocaleString']", message: "For dates use formatIST. For numbers use formatNumber." },
        { selector: "CallExpression[callee.property.name='getHours']", message: "Device-local hour. Use formatIST or istNow." },
        { selector: "CallExpression[callee.property.name='getMinutes']", message: "Device-local minute. Use formatIST or istNow." },
      ],
    },
  },
  {
    files: ["src/lib/time.js"],
    rules: { "no-restricted-syntax": "off" },
  },
  {
    files: ["src/**/*.test.js"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["server/**/*.js", "scripts/**/*.mjs", "api/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.node,
    },
    rules: {
      "no-undef": "error",
      "no-unused-vars": ["warn", { args: "none" }],
    },
  },
];
