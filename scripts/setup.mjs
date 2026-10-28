import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

function run(script) {
  const result = spawnSync(npmCommand, ["run", script], {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function ensureEnv() {
  if (existsSync(".env")) {
    console.log(".env already exists — leaving it untouched.");
    return;
  }

  const example = readFileSync(".env.example", "utf8");
  const secret = randomBytes(48).toString("base64url");
  const env = example.replace(/^SESSION_SECRET=.*$/m, `SESSION_SECRET=${secret}`);
  writeFileSync(".env", env, "utf8");
  console.log("Created .env with a generated SESSION_SECRET.");
}

console.log("CyberSentinel setup");
console.log("-------------------");
ensureEnv();
console.log("Applying database schema...");
run("db:migrate");
console.log("Seeding sample data...");
run("db:seed");
console.log("");
console.log("Setup complete.");
console.log("Start the app with: npm run dev");
console.log("Demo credentials are in .env (SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD).");
