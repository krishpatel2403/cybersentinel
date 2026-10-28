"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assetSchema } from "@/lib/validation/schemas";
import { validationFailure, errorState, successState } from "@/lib/validation/utils";
import { getCurrentUser } from "@/lib/security/session";
import { createAsset, deleteAsset, getAssetById, updateAsset } from "@/lib/repositories/assets";
import { countFindingsByAsset } from "@/lib/repositories/findings";
import { writeAuditLog } from "@/lib/repositories/audit";
import { isUniqueConstraintError } from "@/lib/db/client";
import { parseTags } from "@/lib/utils";
import { logger } from "@/lib/logger";
import type { ActionState } from "@/types/actions";
import type { Criticality } from "@/types";

const idSchema = z.string().uuid("Invalid asset identifier");

function revalidateAssetViews(id?: string): void {
  revalidatePath("/assets");
  revalidatePath("/dashboard");
  if (id) revalidatePath(`/assets/${id}`);
}

function parseAssetForm(formData: FormData) {
  return assetSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    hostname: String(formData.get("hostname") ?? ""),
    ipAddress: String(formData.get("ipAddress") ?? ""),
    type: String(formData.get("type") ?? ""),
    criticality: String(formData.get("criticality") ?? ""),
    exposure: String(formData.get("exposure") ?? ""),
    owner: String(formData.get("owner") ?? ""),
    os: String(formData.get("os") ?? ""),
    tags: String(formData.get("tags") ?? ""),
  });
}

export async function createAssetAction(
  _previousState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return errorState("Your session expired. Sign in again.");

  const parsed = parseAssetForm(formData);
  if (!parsed.success) return validationFailure(parsed.error);

  try {
    const asset = await createAsset({
      ...parsed.data,
      criticality: parsed.data.criticality as Criticality,
      ipAddress: parsed.data.ipAddress,
      tags: parseTags(parsed.data.tags),
    });
    await writeAuditLog({
      actor: user,
      action: "asset.created",
      entityType: "asset",
      entityId: asset.id,
      details: { hostname: asset.hostname, exposure: asset.exposure },
    });
    revalidateAssetViews(asset.id);
    logger.info("asset.created", { assetId: asset.id, userId: user.id });
    return successState(`${asset.name} was added to the inventory.`);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return errorState("An asset with that hostname already exists.", {
        hostname: ["Hostname must be unique."],
      });
    }
    logger.error("asset.create_failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return errorState("The asset could not be created. Please try again.");
  }
}

export async function updateAssetAction(
  _previousState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return errorState("Your session expired. Sign in again.");

  const idParsed = idSchema.safeParse(String(formData.get("id") ?? ""));
  if (!idParsed.success) return errorState("Invalid asset identifier.");
  const id = idParsed.data;

  const parsed = parseAssetForm(formData);
  if (!parsed.success) return validationFailure(parsed.error);

  try {
    const existing = await getAssetById(id);
    if (!existing) return errorState("That asset no longer exists.");

    const updated = await updateAsset(id, {
      ...parsed.data,
      criticality: parsed.data.criticality as Criticality,
      tags: parseTags(parsed.data.tags),
    });
    if (!updated) return errorState("The asset could not be updated.");

    await writeAuditLog({
      actor: user,
      action: "asset.updated",
      entityType: "asset",
      entityId: id,
      details: { hostname: parsed.data.hostname, exposure: parsed.data.exposure },
    });
    revalidateAssetViews(id);
    return successState("Asset updated.");
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return errorState("An asset with that hostname already exists.", {
        hostname: ["Hostname must be unique."],
      });
    }
    logger.error("asset.update_failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return errorState("The asset could not be updated. Please try again.");
  }
}

export async function deleteAssetAction(id: string): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return errorState("Your session expired. Sign in again.");
  if (user.role !== "admin") return errorState("Only administrators can delete assets.");

  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return errorState("Invalid asset identifier.");

  try {
    const existing = await getAssetById(parsed.data);
    if (!existing) return errorState("That asset no longer exists.");

    const findingCount = await countFindingsByAsset(parsed.data);
    if (findingCount > 0) {
      return errorState(
        `This asset has ${findingCount} finding${findingCount === 1 ? "" : "s"}. Delete or resolve those findings before removing the asset.`,
      );
    }

    const deleted = await deleteAsset(parsed.data);
    if (!deleted) return errorState("The asset could not be deleted.");

    await writeAuditLog({
      actor: user,
      action: "asset.deleted",
      entityType: "asset",
      entityId: parsed.data,
      details: { name: existing.name, hostname: existing.hostname },
    });
    revalidateAssetViews();
    return successState("Asset deleted.");
  } catch (error) {
    logger.error("asset.delete_failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return errorState("The asset could not be deleted. It may be referenced by other records.");
  }
}
