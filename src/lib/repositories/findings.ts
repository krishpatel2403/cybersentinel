import { randomUUID } from "node:crypto";
import { ensureDatabase, getDb } from "@/lib/db/client";
import { likePattern, clampLimit } from "@/lib/db/query";
import { rowToFindingWithAsset } from "@/lib/db/rows";
import type { FindingStatus, FindingWithAsset, Severity } from "@/types";
import type { TimelineFinding } from "@/lib/risk";

export interface FindingInput {
  assetId: string;
  title: string;
  description: string;
  severity: Severity;
  cvss: number | null;
  cveId: string | null;
  status: FindingStatus;
  remediation: string;
  dueDate: string | null;
}

export interface FindingFilters {
  search?: string;
  severity?: Severity;
  status?: FindingStatus;
  assetId?: string;
  activeOnly?: boolean;
  limit?: number;
}

const FINDING_SELECT = `
  SELECT f.*, a.name AS asset_name, a.hostname AS asset_hostname,
         a.exposure AS asset_exposure, a.criticality AS asset_criticality
  FROM findings f
  JOIN assets a ON a.id = f.asset_id
`;

function buildFindingWhere(filters: FindingFilters): { where: string; args: string[] } {
  const conditions: string[] = [];
  const args: string[] = [];

  if (filters.activeOnly) {
    conditions.push("f.status != 'resolved'");
  }
  if (filters.severity) {
    conditions.push("f.severity = ?");
    args.push(filters.severity);
  }
  if (filters.status) {
    conditions.push("f.status = ?");
    args.push(filters.status);
  }
  if (filters.assetId) {
    conditions.push("f.asset_id = ?");
    args.push(filters.assetId);
  }
  if (filters.search?.trim()) {
    const pattern = likePattern(filters.search);
    conditions.push(
      "(f.title LIKE ? ESCAPE '\\' OR f.description LIKE ? ESCAPE '\\' OR f.cve_id LIKE ? ESCAPE '\\')",
    );
    args.push(pattern, pattern, pattern);
  }

  return {
    where: conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "",
    args,
  };
}

export async function listFindings(filters: FindingFilters = {}): Promise<FindingWithAsset[]> {
  await ensureDatabase();
  const { where, args } = buildFindingWhere(filters);
  const limit = clampLimit(filters.limit, 100, 500);
  const result = await getDb().execute({
    sql: `${FINDING_SELECT} ${where}
          ORDER BY CASE f.severity
            WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2
            WHEN 'low' THEN 3 ELSE 4 END, f.created_at DESC
          LIMIT ?`,
    args: [...args, limit],
  });
  return result.rows.map(rowToFindingWithAsset);
}

export async function listActiveFindings(limit = 500): Promise<FindingWithAsset[]> {
  return listFindings({ activeOnly: true, limit });
}

export async function getFindingById(id: string): Promise<FindingWithAsset | null> {
  await ensureDatabase();
  const result = await getDb().execute({
    sql: `${FINDING_SELECT} WHERE f.id = ? LIMIT 1`,
    args: [id],
  });
  const row = result.rows[0];
  return row ? rowToFindingWithAsset(row) : null;
}

export async function createFinding(
  input: FindingInput,
  createdBy: string | null,
): Promise<FindingWithAsset> {
  await ensureDatabase();
  const id = randomUUID();
  const now = new Date().toISOString();
  const resolvedAt = input.status === "resolved" ? now : null;

  await getDb().execute({
    sql: `INSERT INTO findings
          (id, asset_id, title, description, severity, cvss, cve_id, status, source, remediation,
           due_date, created_at, updated_at, resolved_at, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'manual', ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      input.assetId,
      input.title.trim(),
      input.description.trim(),
      input.severity,
      input.cvss,
      input.cveId,
      input.status,
      input.remediation.trim(),
      input.dueDate,
      now,
      now,
      resolvedAt,
      createdBy,
    ],
  });

  const created = await getFindingById(id);
  if (!created) throw new Error("Finding was created but could not be read back.");
  return created;
}

export async function updateFinding(id: string, input: FindingInput): Promise<boolean> {
  await ensureDatabase();
  const existing = await getFindingById(id);
  if (!existing) return false;

  const now = new Date().toISOString();
  let resolvedAt = existing.resolvedAt;
  if (input.status === "resolved") {
    resolvedAt = existing.resolvedAt ?? now;
  } else {
    resolvedAt = null;
  }

  const result = await getDb().execute({
    sql: `UPDATE findings
          SET asset_id = ?, title = ?, description = ?, severity = ?, cvss = ?, cve_id = ?,
              status = ?, remediation = ?, due_date = ?, updated_at = ?, resolved_at = ?
          WHERE id = ?`,
    args: [
      input.assetId,
      input.title.trim(),
      input.description.trim(),
      input.severity,
      input.cvss,
      input.cveId,
      input.status,
      input.remediation.trim(),
      input.dueDate,
      now,
      resolvedAt,
      id,
    ],
  });
  return result.rowsAffected > 0;
}

export async function updateFindingStatus(id: string, status: FindingStatus): Promise<boolean> {
  await ensureDatabase();
  const existing = await getFindingById(id);
  if (!existing) return false;
  const now = new Date().toISOString();
  const resolvedAt = status === "resolved" ? (existing.resolvedAt ?? now) : null;
  const result = await getDb().execute({
    sql: "UPDATE findings SET status = ?, updated_at = ?, resolved_at = ? WHERE id = ?",
    args: [status, now, resolvedAt, id],
  });
  return result.rowsAffected > 0;
}

export async function deleteFinding(id: string): Promise<boolean> {
  await ensureDatabase();
  const result = await getDb().execute({
    sql: "DELETE FROM findings WHERE id = ?",
    args: [id],
  });
  return result.rowsAffected > 0;
}

export async function countFindingsByAsset(assetId: string): Promise<number> {
  await ensureDatabase();
  const result = await getDb().execute({
    sql: "SELECT COUNT(*) AS count FROM findings WHERE asset_id = ?",
    args: [assetId],
  });
  return Number(result.rows[0]?.count ?? 0);
}

export async function getTimelineFindings(): Promise<TimelineFinding[]> {
  await ensureDatabase();
  const result = await getDb().execute(
    `SELECT asset_id, severity, status, cvss, created_at, resolved_at
     FROM findings
     ORDER BY created_at ASC
     LIMIT 2000`,
  );
  return result.rows.map((row) => ({
    assetId: String(row.asset_id),
    severity: String(row.severity) as Severity,
    status: String(row.status) as FindingStatus,
    cvss: row.cvss === null || row.cvss === undefined ? null : Number(row.cvss),
    createdAt: String(row.created_at),
    resolvedAt:
      row.resolved_at === null || row.resolved_at === undefined ? null : String(row.resolved_at),
  }));
}

export async function getActiveCveCounts(): Promise<Record<string, number>> {
  await ensureDatabase();
  const result = await getDb().execute(
    `SELECT cve_id, COUNT(*) AS count
     FROM findings
     WHERE cve_id IS NOT NULL AND status != 'resolved'
     GROUP BY cve_id`,
  );
  const counts: Record<string, number> = {};
  for (const row of result.rows) {
    if (row.cve_id) counts[String(row.cve_id)] = Number(row.count ?? 0);
  }
  return counts;
}
