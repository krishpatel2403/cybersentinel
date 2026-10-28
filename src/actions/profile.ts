"use server";

import { revalidatePath } from "next/cache";
import { changePasswordSchema, profileSchema } from "@/lib/validation/schemas";
import { errorState, successState, validationFailure } from "@/lib/validation/utils";
import { getCurrentUser, issueSession, revokeAllSessions } from "@/lib/security/session";
import {
  getUserByEmail,
  updateUserLastLogin,
  updateUserName,
  updateUserPassword,
} from "@/lib/repositories/users";
import { writeAuditLog } from "@/lib/repositories/audit";
import { hashPassword, verifyPassword } from "@/lib/security/password";
import { logger } from "@/lib/logger";
import type { ActionState } from "@/types/actions";

export async function updateProfileAction(
  _previousState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return errorState("Your session expired. Sign in again.");

  const parsed = profileSchema.safeParse({ name: String(formData.get("name") ?? "") });
  if (!parsed.success) return validationFailure(parsed.error);

  try {
    await updateUserName(user.id, parsed.data.name);
    await writeAuditLog({
      actor: user,
      action: "profile.updated",
      entityType: "user",
      entityId: user.id,
    });
    revalidatePath("/settings");
    revalidatePath("/", "layout");
    return successState("Profile updated.");
  } catch (error) {
    logger.error("profile.update_failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return errorState("Your profile could not be updated. Please try again.");
  }
}

export async function changePasswordAction(
  _previousState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return errorState("Your session expired. Sign in again.");

  const parsed = changePasswordSchema.safeParse({
    currentPassword: String(formData.get("currentPassword") ?? ""),
    newPassword: String(formData.get("newPassword") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });
  if (!parsed.success) return validationFailure(parsed.error);

  try {
    const userWithPassword = await getUserByEmail(user.email);
    if (!userWithPassword) return errorState("Your account could not be found.");

    const valid = await verifyPassword(parsed.data.currentPassword, userWithPassword.passwordHash);
    if (!valid) {
      return errorState("Your current password is incorrect.", {
        currentPassword: ["Current password is incorrect."],
      });
    }

    const passwordHash = await hashPassword(parsed.data.newPassword);
    await updateUserPassword(user.id, passwordHash);
    await revokeAllSessions(user.id);
    await updateUserLastLogin(user.id);
    await issueSession(user.id);
    await writeAuditLog({
      actor: user,
      action: "auth.password_changed",
      entityType: "user",
      entityId: user.id,
      details: { otherSessionsRevoked: true },
    });
    revalidatePath("/settings");
    logger.info("auth.password_changed", { userId: user.id });
    return successState("Password updated. Other sessions were signed out.");
  } catch (error) {
    logger.error("auth.password_change_failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return errorState("Your password could not be changed. Please try again.");
  }
}
