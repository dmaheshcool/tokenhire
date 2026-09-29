import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // GitHub Pages project site needs a subpath, e.g. /tokenhire/
  base: process.env.VITE_BASE || "/",
  plugins: [react()],
  server: {
    allowedHosts: true,
    proxy: {
      "/api": "http://127.0.0.1:8787",
    },
  },
});
