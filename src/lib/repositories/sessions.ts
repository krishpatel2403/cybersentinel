import { createHash } from "node:crypto";
import { ensureDatabase, getDb } from "@/lib/db/client";
import { logger } from "@/lib/logger";

export async function createSessionRecord(input: {
  tokenHash: string;
  userId: string;
  expiresAt: string;
  userAgent: string | null;
  ip: string | null;
}): Promise<void> {
  await ensureDatabase();
  await getDb().execute({
    sql: `INSERT INTO sessions (token_hash, user_id, expires_at, created_at, user_agent, ip)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [
      input.tokenHash,
      input.userId,
      input.expiresAt,
      new Date().toISOString(),
      input.userAgent,
      input.ip,
    ],
  });
}

export async function findSession(
  tokenHash: string,
  now = new Date().toISOString(),
): Promise<{ userId: string; expiresAt: string } | null> {
  await ensureDatabase();
  const result = await getDb().execute({
    sql: "SELECT user_id, expires_at FROM sessions WHERE token_hash = ? AND expires_at > ? LIMIT 1",
    args: [tokenHash, now],
  });
  const row = result.rows[0];
  if (!row) return null;
  return { userId: String(row.user_id), expiresAt: String(row.expires_at) };
}

export async function deleteSession(tokenHash: string): Promise<void> {
  await ensureDatabase();
  await getDb().execute({
    sql: "DELETE FROM sessions WHERE token_hash = ?",
    args: [tokenHash],
  });
}

export async function deleteUserSessions(userId: string): Promise<void> {
  await ensureDatabase();
  await getDb().execute({
    sql: "DELETE FROM sessions WHERE user_id = ?",
    args: [userId],
  });
}

export async function countUserSessions(userId: string): Promise<number> {
  await ensureDatabase();
  const result = await getDb().execute({
    sql: "SELECT COUNT(*) AS count FROM sessions WHERE user_id = ? AND expires_at > ?",
    args: [userId, new Date().toISOString()],
  });
  return Number(result.rows[0]?.count ?? 0);
}

export async function purgeExpiredSessions(): Promise<void> {
  await ensureDatabase();
  try {
    await getDb().execute({
      sql: "DELETE FROM sessions WHERE expires_at <= ?",
      args: [new Date().toISOString()],
    });
  } catch (error) {
    logger.warn("session.purge_failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/** Only a hash is persisted, so a database leak cannot be replayed as a session. */
export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
