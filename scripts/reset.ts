import { config } from "dotenv";
config({ path: ".env", quiet: true });

import { seedDatabase } from "./seed-lib";
import { closeDb } from "../src/lib/db/client";

async function main(): Promise<void> {
  const remote = Boolean(process.env.TURSO_DATABASE_URL?.trim());
  const production = process.env.NODE_ENV === "production";

  if (remote && process.env.ALLOW_REMOTE_RESET !== "yes") {
    throw new Error(
      "Refusing to reset a remote Turso database. Set ALLOW_REMOTE_RESET=yes only if you are certain.",
    );
  }
  if (production && process.env.ALLOW_PRODUCTION_RESET !== "yes") {
    throw new Error(
      "Refusing to reset while NODE_ENV=production. Set ALLOW_PRODUCTION_RESET=yes only for a disposable demo.",
    );
  }

  console.log(
    "Resetting all application tables (users, sessions, assets, findings, events, audit logs)...",
  );
  const result = await seedDatabase({ reset: true });
  if (!result.seeded) throw new Error("Reset did not seed the database.");

  console.log("Database reset and reseeded.");
  console.log(`Admin:   ${result.adminEmail}`);
  console.log(`Analyst: ${result.analystEmail}`);
  if (result.demoPasswords) {
    console.log("Passwords: see SEED_ADMIN_PASSWORD / SEED_ANALYST_PASSWORD in .env");
  }
}

main()
  .catch((error: unknown) => {
    console.error("Reset failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDb();
  });
