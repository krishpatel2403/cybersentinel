"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { loginSchema } from "@/lib/validation/schemas";
import { validationFailure, errorState } from "@/lib/validation/utils";
import { DUMMY_PASSWORD_HASH, verifyPassword } from "@/lib/security/password";
import { getCurrentUser, destroyCurrentSession, issueSession } from "@/lib/security/session";
import { getUserByEmail, updateUserLastLogin } from "@/lib/repositories/users";
import { sha256 } from "@/lib/repositories/sessions";
import { writeAuditLog } from "@/lib/repositories/audit";
import { RateLimiter } from "@/lib/security/rate-limit";
import { logger } from "@/lib/logger";
import type { ActionState } from "@/types/actions";

const emailLimiter = new RateLimiter(5, 10 * 60_000);
const ipLimiter = new RateLimiter(25, 10 * 60_000);

async function clientIp(): Promise<string> {
  const headerStore = await headers();
  return (
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerStore.get("x-real-ip") ||
    "unknown"
  );
}

export async function loginAction(
  _previousState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const rawEmail = String(formData.get("email") ?? "");
  const normalizedEmail = rawEmail.trim().toLowerCase();
  const ip = await clientIp();
  const emailKey = `email:${sha256(normalizedEmail || "empty")}`;
  const ipKey = `ip:${ip}`;

  const emailLimit = emailLimiter.check(emailKey);
  const ipLimit = ipLimiter.check(ipKey);
  if (!emailLimit.allowed || !ipLimit.allowed) {
    const retryMinutes = Math.ceil(
      Math.max(emailLimit.retryAfterSeconds, ipLimit.retryAfterSeconds) / 60,
    );
    logger.warn("auth.login_rate_limited", { ip });
    return errorState(
      `Too many sign-in attempts. Try again in about ${retryMinutes} minute${retryMinutes === 1 ? "" : "s"}.`,
    );
  }

  const parsed = loginSchema.safeParse({
    email: rawEmail,
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) {
    return validationFailure(parsed.error);
  }

  const { email, password } = parsed.data;

  try {
    const user = await getUserByEmail(email);
    const passwordHash = user?.passwordHash ?? DUMMY_PASSWORD_HASH;
    const valid = await verifyPassword(password, passwordHash);

    if (!user || !valid) {
      logger.warn("auth.login_failed", { ip });
      return errorState("Invalid email or password.");
    }

    await updateUserLastLogin(user.id);
    await issueSession(user.id);
    await writeAuditLog({
      actor: user,
      action: "auth.login",
      entityType: "session",
      details: { role: user.role },
    });
    logger.info("auth.login_succeeded", { userId: user.id, role: user.role });
  } catch (error) {
    logger.error("auth.login_error", {
      message: error instanceof Error ? error.message : "Unknown login error",
    });
    return errorState("Sign-in failed because of a server error. Please try again.");
  }

  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  const user = await getCurrentUser();
  if (user) {
    await writeAuditLog({
      actor: user,
      action: "auth.logout",
      entityType: "session",
    });
  }
  await destroyCurrentSession();
  redirect("/login");
}
