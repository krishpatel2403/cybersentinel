import fs from "node:fs";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import { SCHEMA_SQL } from "./schema";
import { logger } from "@/lib/logger";

interface DbGlobals {
  __cybersentinelDb?: Client;
  __cybersentinelReady?: Promise<void>;
}

const globalForDb = globalThis as unknown as DbGlobals;

function resolveLocalFile(): string {
  return process.env.DATABASE_FILE?.trim() || path.join("data", "cybersentinel.db");
}

function createDbClient(): Client {
  const remoteUrl = process.env.TURSO_DATABASE_URL?.trim();
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim();

  if (remoteUrl) {
    if (!authToken) {
      throw new Error("TURSO_AUTH_TOKEN is required when TURSO_DATABASE_URL is set.");
    }
    return createClient({ url: remoteUrl, authToken });
  }

  const file = resolveLocalFile();
  const directory = path.dirname(file);
  if (directory && directory !== ".") {
    fs.mkdirSync(directory, { recursive: true });
  }
  const normalized = file.replaceAll("\\", "/");
  return createClient({ url: `file:${normalized}` });
}

export function getDb(): Client {
  if (!globalForDb.__cybersentinelDb) {
    globalForDb.__cybersentinelDb = createDbClient();
  }
  return globalForDb.__cybersentinelDb;
}

/**
 * Creates tables and indexes if they do not exist. Safe to call concurrently;
 * the promise is memoized per process.
 */
export function ensureDatabase(): Promise<void> {
  if (!globalForDb.__cybersentinelReady) {
    globalForDb.__cybersentinelReady = (async () => {
      const db = getDb();
      await db.executeMultiple(SCHEMA_SQL);
      await db.execute("PRAGMA foreign_keys = ON");
      logger.info("db.ready", {
        mode: process.env.TURSO_DATABASE_URL?.trim() ? "turso" : "local",
      });
    })().catch((error: unknown) => {
      globalForDb.__cybersentinelReady = undefined;
      logger.error("db.initialization_failed", {
        message: error instanceof Error ? error.message : "Unknown database error",
      });
      throw error;
    });
  }
  return globalForDb.__cybersentinelReady;
}

/** Used by CLI scripts and tests. */
export async function closeDb(): Promise<void> {
  if (globalForDb.__cybersentinelDb) {
    globalForDb.__cybersentinelDb.close();
    globalForDb.__cybersentinelDb = undefined;
  }
  globalForDb.__cybersentinelReady = undefined;
}

export function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Error && /UNIQUE constraint failed/i.test(error.message);
}
