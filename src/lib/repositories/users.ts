import { randomUUID } from "node:crypto";
import { ensureDatabase, getDb } from "@/lib/db/client";
import { rowToUser } from "@/lib/db/rows";
import type { Role, User } from "@/types";

export interface UserWithPassword extends User {
  passwordHash: string;
}

export interface CreateUserInput {
  email: string;
  name: string;
  role: Role;
  passwordHash: string;
}

export async function getUserByEmail(email: string): Promise<UserWithPassword | null> {
  await ensureDatabase();
  const result = await getDb().execute({
    sql: "SELECT * FROM users WHERE email = ? COLLATE NOCASE LIMIT 1",
    args: [email.trim().toLowerCase()],
  });
  const row = result.rows[0];
  if (!row) return null;
  return { ...rowToUser(row), passwordHash: String(row.password_hash) };
}

export async function getUserById(id: string): Promise<User | null> {
  await ensureDatabase();
  const result = await getDb().execute({
    sql: "SELECT * FROM users WHERE id = ? LIMIT 1",
    args: [id],
  });
  const row = result.rows[0];
  return row ? rowToUser(row) : null;
}

export async function createUser(input: CreateUserInput): Promise<User> {
  await ensureDatabase();
  const now = new Date().toISOString();
  const id = randomUUID();
  await getDb().execute({
    sql: `INSERT INTO users (id, email, name, role, password_hash, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      input.email.trim().toLowerCase(),
      input.name.trim(),
      input.role,
      input.passwordHash,
      now,
      now,
    ],
  });
  return {
    id,
    email: input.email.trim().toLowerCase(),
    name: input.name.trim(),
    role: input.role,
    createdAt: now,
    lastLoginAt: null,
  };
}

export async function updateUserLastLogin(
  id: string,
  at = new Date().toISOString(),
): Promise<void> {
  await ensureDatabase();
  await getDb().execute({
    sql: "UPDATE users SET last_login_at = ?, updated_at = ? WHERE id = ?",
    args: [at, at, id],
  });
}

export async function updateUserName(id: string, name: string): Promise<void> {
  await ensureDatabase();
  await getDb().execute({
    sql: "UPDATE users SET name = ?, updated_at = ? WHERE id = ?",
    args: [name.trim(), new Date().toISOString(), id],
  });
}

export async function updateUserPassword(id: string, passwordHash: string): Promise<void> {
  await ensureDatabase();
  await getDb().execute({
    sql: "UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?",
    args: [passwordHash, new Date().toISOString(), id],
  });
}

export async function countUsers(): Promise<number> {
  await ensureDatabase();
  const result = await getDb().execute("SELECT COUNT(*) AS count FROM users");
  return Number(result.rows[0]?.count ?? 0);
}
