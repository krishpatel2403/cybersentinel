"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { findingSchema, findingStatusSchema } from "@/lib/validation/schemas";
import { errorState, successState, validationFailure } from "@/lib/validation/utils";
import { getCurrentUser } from "@/lib/security/session";
import {
  createFinding,
  deleteFinding,
  getFindingById,
  updateFinding,
  updateFindingStatus,
} from "@/lib/repositories/findings";
import { getAssetById } from "@/lib/repositories/assets";
import { writeAuditLog } from "@/lib/repositories/audit";
import { RateLimiter } from "@/lib/security/rate-limit";
import { generateRemediationPlan } from "@/lib/ai/provider";
import { logger } from "@/lib/logger";
import type { ActionState } from "@/types/actions";
import type { CopilotAnswer } from "@/types";

const idSchema = z.string().uuid("Invalid finding identifier");
const remediationLimiter = new RateLimiter(10, 5 * 60_000);

function parseFindingForm(formData: FormData) {
  return findingSchema.safeParse({
    assetId: String(formData.get("assetId") ?? ""),
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    severity: String(formData.get("severity") ?? ""),
    cvss: String(formData.get("cvss") ?? ""),
    cveId: String(formData.get("cveId") ?? ""),
    status: String(formData.get("status") ?? "open"),
    remediation: String(formData.get("remediation") ?? ""),
    dueDate: String(formData.get("dueDate") ?? ""),
  });
}

function revalidateFindingViews(assetId: string, findingId?: string): void {
  revalidatePath("/findings");
  revalidatePath("/dashboard");
  revalidatePath("/assets");
  revalidatePath(`/assets/${assetId}`);
  if (findingId) revalidatePath(`/findings/${findingId}`);
}

export async function createFindingAction(
  _previousState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return errorState("Your session expired. Sign in again.");

  const parsed = parseFindingForm(formData);
  if (!parsed.success) return validationFailure(parsed.error);
  if (parsed.data.status === "accepted_risk" && user.role !== "admin") {
    return errorState("Only administrators can accept risk.");
  }

  try {
    const asset = await getAssetById(parsed.data.assetId);
    if (!asset) return errorState("The selected asset no longer exists.");

    const finding = await createFinding(parsed.data, user.id);
    await writeAuditLog({
      actor: user,
      action: "finding.created",
      entityType: "finding",
      entityId: finding.id,
      details: {
        severity: finding.severity,
        assetId: finding.assetId,
        cveId: finding.cveId,
      },
    });
    revalidateFindingViews(finding.assetId, finding.id);
    logger.info("finding.created", { findingId: finding.id, userId: user.id });
    return successState("Finding recorded.");
  } catch (error) {
    logger.error("finding.create_failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return errorState("The finding could not be created. Please try again.");
  }
}

export async function updateFindingAction(
  _previousState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return errorState("Your session expired. Sign in again.");

  const idParsed = idSchema.safeParse(String(formData.get("id") ?? ""));
  if (!idParsed.success) return errorState("Invalid finding identifier.");

  const parsed = parseFindingForm(formData);
  if (!parsed.success) return validationFailure(parsed.error);

  try {
    const existing = await getFindingById(idParsed.data);
    if (!existing) return errorState("That finding no longer exists.");
    if (
      parsed.data.status === "accepted_risk" &&
      existing.status !== "accepted_risk" &&
      user.role !== "admin"
    ) {
      return errorState("Only administrators can accept risk.");
    }
    if (!(await getAssetById(parsed.data.assetId))) {
      return errorState("The selected asset no longer exists.");
    }

    const updated = await updateFinding(idParsed.data, parsed.data);
    if (!updated) return errorState("The finding could not be updated.");

    await writeAuditLog({
      actor: user,
      action: "finding.updated",
      entityType: "finding",
      entityId: idParsed.data,
      details: {
        severity: parsed.data.severity,
        status: parsed.data.status,
        assetId: parsed.data.assetId,
      },
    });
    revalidateFindingViews(parsed.data.assetId, idParsed.data);
    return successState("Finding updated.");
  } catch (error) {
    logger.error("finding.update_failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return errorState("The finding could not be updated. Please try again.");
  }
}

export async function updateFindingStatusAction(id: string, status: string): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return errorState("Your session expired. Sign in again.");

  const idParsed = idSchema.safeParse(id);
  const statusParsed = findingStatusSchema.safeParse(status);
  if (!idParsed.success || !statusParsed.success) return errorState("Invalid status update.");

  try {
    const existing = await getFindingById(idParsed.data);
    if (!existing) return errorState("That finding no longer exists.");
    if (
      statusParsed.data === "accepted_risk" &&
      existing.status !== "accepted_risk" &&
      user.role !== "admin"
    ) {
      return errorState("Only administrators can accept risk.");
    }

    const updated = await updateFindingStatus(idParsed.data, statusParsed.data);
    if (!updated) return errorState("The status could not be updated.");

    await writeAuditLog({
      actor: user,
      action: "finding.status_changed",
      entityType: "finding",
      entityId: idParsed.data,
      details: { from: existing.status, to: statusParsed.data },
    });
    revalidateFindingViews(existing.assetId, idParsed.data);
    return successState("Status updated.");
  } catch (error) {
    logger.error("finding.status_failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return errorState("The status could not be updated. Please try again.");
  }
}

export async function deleteFindingAction(id: string): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return errorState("Your session expired. Sign in again.");
  if (user.role !== "admin") return errorState("Only administrators can delete findings.");

  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return errorState("Invalid finding identifier.");

  try {
    const existing = await getFindingById(parsed.data);
    if (!existing) return errorState("That finding no longer exists.");

    const deleted = await deleteFinding(parsed.data);
    if (!deleted) return errorState("The finding could not be deleted.");

    await writeAuditLog({
      actor: user,
      action: "finding.deleted",
      entityType: "finding",
      entityId: parsed.data,
      details: { title: existing.title.slice(0, 120) },
    });
    revalidateFindingViews(existing.assetId);
    return successState("Finding deleted.");
  } catch (error) {
    logger.error("finding.delete_failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return errorState("The finding could not be deleted. Please try again.");
  }
}

export async function generateRemediationAction(findingId: string): Promise<CopilotAnswer> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      ok: false,
      answer: "",
      mode: "local",
      citations: [],
      message: "Your session expired. Sign in again.",
    };
  }

  const limit = remediationLimiter.check(`user:${user.id}`);
  if (!limit.allowed) {
    return {
      ok: false,
      answer: "",
      mode: "local",
      citations: [],
      message: "Remediation plans are limited to 10 per five minutes. Please wait and try again.",
    };
  }

  const parsed = idSchema.safeParse(findingId);
  if (!parsed.success) {
    return { ok: false, answer: "", mode: "local", citations: [], message: "Invalid finding." };
  }

  try {
    const finding = await getFindingById(parsed.data);
    if (!finding) {
      return {
        ok: false,
        answer: "",
        mode: "local",
        citations: [],
        message: "That finding no longer exists.",
      };
    }
    const asset = await getAssetById(finding.assetId);
    if (!asset) {
      return {
        ok: false,
        answer: "",
        mode: "local",
        citations: [],
        message: "The related asset no longer exists.",
      };
    }

    const result = await generateRemediationPlan({
      finding: {
        id: finding.id,
        title: finding.title,
        description: finding.description,
        severity: finding.severity,
        cvss: finding.cvss,
        cveId: finding.cveId,
        remediation: finding.remediation,
      },
      asset: {
        name: asset.name,
        hostname: asset.hostname,
        type: asset.type,
        exposure: asset.exposure,
        criticality: asset.criticality,
        owner: asset.owner,
        os: asset.os,
      },
    });

    await writeAuditLog({
      actor: user,
      action: "finding.remediation_generated",
      entityType: "finding",
      entityId: finding.id,
      details: { mode: result.mode },
    });
    return result;
  } catch (error) {
    logger.error("finding.remediation_failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return {
      ok: false,
      answer: "",
      mode: "local",
      citations: [],
      message: "The remediation plan could not be generated. Please try again.",
    };
  }
}
