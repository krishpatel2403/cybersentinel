import { config } from "dotenv";
config({ path: ".env", quiet: true });

import { seedDatabase } from "./seed-lib";
import { closeDb } from "../src/lib/db/client";

async function main(): Promise<void> {
  const result = await seedDatabase();

  if (!result.seeded) {
    console.log(`Seed skipped: ${result.reason ?? "database already seeded"}`);
    return;
  }

  console.log("Sample data seeded successfully.");
  console.log(`Admin:   ${result.adminEmail}`);
  console.log(`Analyst: ${result.analystEmail}`);
  if (result.demoPasswords) {
    console.log("Passwords: see SEED_ADMIN_PASSWORD / SEED_ANALYST_PASSWORD in .env");
    console.log("Demo mode is ON — never use these defaults for a public production deployment.");
  }
}

main()
  .catch((error: unknown) => {
    console.error("Seed failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDb();
  });
