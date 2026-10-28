import { randomUUID } from "node:crypto";
import { ensureDatabase, getDb } from "@/lib/db/client";
import { clampLimit, likePattern } from "@/lib/db/query";
import { rowToEvent } from "@/lib/db/rows";
import type { SecurityEvent, Severity } from "@/types";

export interface EventInput {
  source: string;
  eventType: string;
  severity: Severity;
  message: string;
  assetId: string | null;
  occurredAt: string;
}

export interface EventFilters {
  search?: string;
  severity?: Severity;
  source?: string;
  assetId?: string;
  limit?: number;
}

export async function listEvents(filters: EventFilters = {}): Promise<SecurityEvent[]> {
  await ensureDatabase();
  const conditions: string[] = [];
  const args: string[] = [];

  if (filters.severity) {
    conditions.push("e.severity = ?");
    args.push(filters.severity);
  }
  if (filters.source) {
    conditions.push("e.source = ?");
    args.push(filters.source);
  }
  if (filters.assetId) {
    conditions.push("e.asset_id = ?");
    args.push(filters.assetId);
  }
  if (filters.search?.trim()) {
    const pattern = likePattern(filters.search);
    conditions.push(
      "(e.message LIKE ? ESCAPE '\\' OR e.event_type LIKE ? ESCAPE '\\' OR e.source LIKE ? ESCAPE '\\')",
    );
    args.push(pattern, pattern, pattern);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const limit = clampLimit(filters.limit, 50, 200);
  const result = await getDb().execute({
    sql: `SELECT e.*, a.name AS asset_name
          FROM events e
          LEFT JOIN assets a ON a.id = e.asset_id
          ${where}
          ORDER BY e.occurred_at DESC
          LIMIT ?`,
    args: [...args, limit],
  });
  return result.rows.map(rowToEvent);
}

export async function createEvents(inputs: EventInput[]): Promise<number> {
  if (inputs.length === 0) return 0;
  await ensureDatabase();
  const now = new Date().toISOString();
  await getDb().batch(
    inputs.map((input) => ({
      sql: `INSERT INTO events (id, source, event_type, severity, message, asset_id, occurred_at, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        randomUUID(),
        input.source,
        input.eventType,
        input.severity,
        input.message,
        input.assetId,
        input.occurredAt,
        now,
      ],
    })),
    "write",
  );
  return inputs.length;
}

export async function countEventsSince(iso: string): Promise<number> {
  await ensureDatabase();
  const result = await getDb().execute({
    sql: "SELECT COUNT(*) AS count FROM events WHERE occurred_at >= ?",
    args: [iso],
  });
  return Number(result.rows[0]?.count ?? 0);
}

export async function getEventsForAsset(assetId: string, limit = 6): Promise<SecurityEvent[]> {
  return listEvents({ assetId, limit });
}

export async function countEvents(): Promise<number> {
  await ensureDatabase();
  const result = await getDb().execute("SELECT COUNT(*) AS count FROM events");
  return Number(result.rows[0]?.count ?? 0);
}
