import { ASSET_TYPES, EXPOSURES, FINDING_STATUSES, SEVERITIES } from "@/types";
import type { AssetType, Exposure, FindingStatus, Role, Severity } from "@/types";

function includes<T extends string>(values: readonly T[], value: string): value is T {
  return (values as readonly string[]).includes(value);
}

export function parseSeverity(value: string): Severity | undefined {
  return includes(SEVERITIES, value) ? value : undefined;
}

export function parseStatus(value: string): FindingStatus | undefined {
  return includes(FINDING_STATUSES, value) ? value : undefined;
}

export function parseAssetType(value: string): AssetType | undefined {
  return includes(ASSET_TYPES, value) ? value : undefined;
}

export function parseExposure(value: string): Exposure | undefined {
  return includes(EXPOSURES, value) ? value : undefined;
}

export function parseRole(value: string): Role | undefined {
  return value === "admin" || value === "analyst" ? value : undefined;
}
