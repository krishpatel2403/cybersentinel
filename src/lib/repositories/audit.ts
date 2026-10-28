import { randomUUID } from "node:crypto";
import { ensureDatabase, getDb } from "@/lib/db/client";
import { rowToAuditEntry } from "@/lib/db/rows";
import type { AuditEntry, User } from "@/types";
import { logger } from "@/lib/logger";

export interface AuditInput {
  actor: Pick<User, "id" | "email">;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: Record<string, unknown> | null;
}

export async function writeAuditLog(input: AuditInput): Promise<void> {
  try {
    await ensureDatabase();
    await getDb().execute({
      sql: `INSERT INTO audit_logs (id, user_id, actor_email, action, entity_type, entity_id, details, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        randomUUID(),
        input.actor.id,
        input.actor.email,
        input.action,
        input.entityType,
        input.entityId ?? null,
        input.details ? JSON.stringify(input.details) : null,
        new Date().toISOString(),
      ],
    });
  } catch (error) {
    // Audit failures should be visible in logs but must not break the user's action.
    logger.error("audit.write_failed", {
      action: input.action,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function listAuditEntries(limit = 100): Promise<AuditEntry[]> {
  await ensureDatabase();
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 500);
  const result = await getDb().execute({
    sql: "SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?",
    args: [safeLimit],
  });
  return result.rows.map(rowToAuditEntry);
}
