import { spawn } from "node:child_process";

const api = spawn("node", ["--env-file-if-exists=.env", "server/index.js"], { stdio: "inherit" });
const web = spawn("npx", ["vite"], { stdio: "inherit", shell: true });

function stop() {
  api.kill();
  web.kill();
  process.exit();
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
