import { randomUUID } from "node:crypto";
import { ensureDatabase, getDb } from "@/lib/db/client";
import { rowToAsset } from "@/lib/db/rows";
import { likePattern } from "@/lib/db/query";
import type { Asset, AssetType, Criticality, Exposure } from "@/types";

export interface AssetInput {
  name: string;
  hostname: string;
  ipAddress: string | null;
  type: AssetType;
  criticality: Criticality;
  exposure: Exposure;
  owner: string;
  os: string;
  tags: string[];
}

export interface AssetFilters {
  search?: string;
  type?: AssetType;
  exposure?: Exposure;
}

export async function listAssets(filters: AssetFilters = {}): Promise<Asset[]> {
  await ensureDatabase();
  const conditions: string[] = [];
  const args: string[] = [];

  if (filters.search?.trim()) {
    const pattern = likePattern(filters.search);
    conditions.push(
      "(a.name LIKE ? ESCAPE '\\' OR a.hostname LIKE ? ESCAPE '\\' OR a.ip_address LIKE ? ESCAPE '\\' OR a.owner LIKE ? ESCAPE '\\')",
    );
    args.push(pattern, pattern, pattern, pattern);
  }
  if (filters.type) {
    conditions.push("a.type = ?");
    args.push(filters.type);
  }
  if (filters.exposure) {
    conditions.push("a.exposure = ?");
    args.push(filters.exposure);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const result = await getDb().execute({
    sql: `SELECT a.* FROM assets a ${where} ORDER BY a.name COLLATE NOCASE ASC`,
    args,
  });
  return result.rows.map(rowToAsset);
}

export async function getAssetById(id: string): Promise<Asset | null> {
  await ensureDatabase();
  const result = await getDb().execute({
    sql: "SELECT * FROM assets WHERE id = ? LIMIT 1",
    args: [id],
  });
  const row = result.rows[0];
  return row ? rowToAsset(row) : null;
}

export async function createAsset(input: AssetInput): Promise<Asset> {
  await ensureDatabase();
  const now = new Date().toISOString();
  const id = randomUUID();
  await getDb().execute({
    sql: `INSERT INTO assets (id, name, hostname, ip_address, type, criticality, exposure, owner, os, tags, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      input.name.trim(),
      input.hostname.trim(),
      input.ipAddress,
      input.type,
      input.criticality,
      input.exposure,
      input.owner.trim(),
      input.os.trim(),
      JSON.stringify(input.tags),
      now,
      now,
    ],
  });
  return {
    id,
    ...input,
    name: input.name.trim(),
    hostname: input.hostname.trim(),
    owner: input.owner.trim(),
    os: input.os.trim(),
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateAsset(id: string, input: AssetInput): Promise<boolean> {
  await ensureDatabase();
  const result = await getDb().execute({
    sql: `UPDATE assets
          SET name = ?, hostname = ?, ip_address = ?, type = ?, criticality = ?, exposure = ?,
              owner = ?, os = ?, tags = ?, updated_at = ?
          WHERE id = ?`,
    args: [
      input.name.trim(),
      input.hostname.trim(),
      input.ipAddress,
      input.type,
      input.criticality,
      input.exposure,
      input.owner.trim(),
      input.os.trim(),
      JSON.stringify(input.tags),
      new Date().toISOString(),
      id,
    ],
  });
  return result.rowsAffected > 0;
}

export async function deleteAsset(id: string): Promise<boolean> {
  await ensureDatabase();
  const result = await getDb().execute({
    sql: "DELETE FROM assets WHERE id = ?",
    args: [id],
  });
  return result.rowsAffected > 0;
}

export async function countAssets(): Promise<number> {
  await ensureDatabase();
  const result = await getDb().execute("SELECT COUNT(*) AS count FROM assets");
  return Number(result.rows[0]?.count ?? 0);
}
