import { config } from "dotenv";
config({ path: ".env", quiet: true });

import { closeDb, ensureDatabase } from "../src/lib/db/client";

async function main(): Promise<void> {
  await ensureDatabase();
  const mode = process.env.TURSO_DATABASE_URL?.trim() ? "Turso (remote)" : "local SQLite";
  console.log(`Database schema is ready (${mode}).`);
}

main()
  .catch((error: unknown) => {
    console.error("Migration failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDb();
  });
