import { createHmac } from "node:crypto";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";
import { getSessionSecret } from "@/lib/env";
import { logger } from "@/lib/logger";
import { getUserById } from "@/lib/repositories/users";
import {
  createSessionRecord,
  deleteSession,
  deleteUserSessions,
  findSession,
  purgeExpiredSessions,
  sha256,
} from "@/lib/repositories/sessions";
import { SESSION_COOKIE_NAME, SESSION_TTL_HOURS } from "@/lib/constants";
import type { User } from "@/types";

export interface SessionMeta {
  userAgent?: string | null;
  ip?: string | null;
}

export function hashSessionToken(token: string): string {
  return createHmac("sha256", getSessionSecret()).update(token).digest("hex");
}

async function requestMeta(): Promise<Required<SessionMeta>> {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || headerStore.get("x-real-ip") || "unknown";
  const userAgent = headerStore.get("user-agent")?.slice(0, 300) ?? "unknown";
  return { ip, userAgent };
}

export async function issueSession(userId: string, meta?: SessionMeta): Promise<void> {
  await purgeExpiredSessions();
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000);
  const request = await requestMeta();

  await createSessionRecord({
    tokenHash,
    userId,
    expiresAt: expiresAt.toISOString(),
    userAgent: meta?.userAgent ?? request.userAgent,
    ip: meta?.ip ?? request.ip,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export const getCurrentUser = cache(async (): Promise<User | null> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const session = await findSession(hashSessionToken(token));
    if (!session) return null;

    return await getUserById(session.userId);
  } catch (error) {
    // Next.js uses a special thrown error to mark a route dynamic. Let it propagate
    // so the framework can classify the route instead of logging a fake session error.
    if (
      typeof error === "object" &&
      error !== null &&
      "digest" in error &&
      (error as { digest?: unknown }).digest === "DYNAMIC_SERVER_USAGE"
    ) {
      throw error;
    }
    logger.error("session.read_failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return null;
  }
});

export async function destroyCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    await deleteSession(hashSessionToken(token));
  }
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function revokeAllSessions(userId: string): Promise<void> {
  await deleteUserSessions(userId);
}

/** Used by tests to derive the same hash the cookie layer uses. */
export const debugSessionHash = sha256;

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/dashboard");
  return user;
}
