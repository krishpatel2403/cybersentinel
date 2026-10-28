import type { Exposure, FindingStatus, Severity } from "@/types";
import { clamp } from "@/lib/utils";

export type Grade = "A" | "B" | "C" | "D" | "F";

export interface RiskFinding {
  assetId: string;
  severity: Severity;
  status: FindingStatus;
  cvss: number | null;
}

export interface RiskAsset {
  id: string;
  criticality: number;
  exposure: Exposure;
}

export interface PostureScore {
  exposureScore: number;
  securityScore: number;
  grade: Grade;
  weightedRisk: number;
}

export interface ScorePoint {
  date: string;
  securityScore: number;
}

const SEVERITY_WEIGHTS: Record<Severity, number> = {
  critical: 10,
  high: 5.5,
  medium: 2.5,
  low: 0.8,
  info: 0.2,
};

const STATUS_FACTORS: Record<FindingStatus, number> = {
  open: 1,
  in_progress: 0.65,
  accepted_risk: 0.35,
  resolved: 0,
};

const EXPOSURE_FACTORS: Record<Exposure, number> = {
  internet: 1.35,
  internal: 1,
  isolated: 0.7,
};

/** Larger decay = more forgiving score. Tuned so a typical small-team backlog lands in the 60–80 range. */
const ORG_DECAY = 280;
const ASSET_DECAY = 18;

function cvssFactor(cvss: number | null): number {
  if (cvss === null) return 1;
  return 0.75 + (clamp(cvss, 0, 10) / 10) * 0.55;
}

function criticalityFactor(criticality: number): number {
  return 0.7 + clamp(criticality, 1, 5) * 0.1;
}

export function findingWeight(finding: RiskFinding): number {
  const severity = SEVERITY_WEIGHTS[finding.severity];
  const status = STATUS_FACTORS[finding.status];
  return severity * status * cvssFactor(finding.cvss);
}

export function computePostureScore(findings: RiskFinding[], assets: RiskAsset[]): PostureScore {
  const assetMap = new Map(assets.map((asset) => [asset.id, asset]));
  let weightedRisk = 0;

  for (const finding of findings) {
    const asset = assetMap.get(finding.assetId);
    if (!asset) continue;
    weightedRisk +=
      findingWeight(finding) *
      EXPOSURE_FACTORS[asset.exposure] *
      criticalityFactor(asset.criticality);
  }

  const securityScore = Math.round(100 * Math.exp(-weightedRisk / ORG_DECAY));
  return {
    exposureScore: 100 - securityScore,
    securityScore,
    grade: gradeFor(securityScore),
    weightedRisk: Math.round(weightedRisk * 10) / 10,
  };
}

export function weightedFindingForAsset(finding: RiskFinding, asset: RiskAsset): number {
  return (
    findingWeight(finding) * EXPOSURE_FACTORS[asset.exposure] * criticalityFactor(asset.criticality)
  );
}

export function computeAssetRisk(findings: RiskFinding[], asset: RiskAsset): number {
  const total = findings.reduce((sum, finding) => sum + weightedFindingForAsset(finding, asset), 0);
  return Math.round(100 * (1 - Math.exp(-total / ASSET_DECAY)));
}

export function gradeFor(securityScore: number): Grade {
  if (securityScore >= 90) return "A";
  if (securityScore >= 80) return "B";
  if (securityScore >= 70) return "C";
  if (securityScore >= 60) return "D";
  return "F";
}

export interface TimelineFinding extends RiskFinding {
  createdAt: string;
  resolvedAt: string | null;
}

/**
 * Reconstructs the org score at the end of each day. This is an approximation:
 * no historical audit trail exists for status changes, so current statuses are used
 * except that findings resolved after a given day still counted at that time.
 */
export function buildScoreTimeline(
  findings: TimelineFinding[],
  assets: RiskAsset[],
  days = 14,
  now = new Date(),
): ScorePoint[] {
  const safeDays = clamp(Math.round(days), 2, 90);
  const points: ScorePoint[] = [];
  const endOfToday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999),
  );

  for (let offset = safeDays - 1; offset >= 0; offset -= 1) {
    const endOfDay = new Date(endOfToday.getTime() - offset * 86_400_000);
    const iso = endOfDay.toISOString();
    const active = findings
      .filter((finding) => finding.createdAt <= iso)
      .filter((finding) => !finding.resolvedAt || finding.resolvedAt > iso)
      .map((finding) => ({
        ...finding,
        status: finding.status === "resolved" ? ("open" as FindingStatus) : finding.status,
      }));

    const score = computePostureScore(active, assets);
    points.push({ date: iso, securityScore: score.securityScore });
  }

  return points;
}

export function meanTimeToResolveDays(
  findings: Array<{ createdAt: string; resolvedAt: string | null }>,
): number | null {
  let totalMs = 0;
  let resolvedCount = 0;

  for (const finding of findings) {
    if (!finding.resolvedAt) continue;
    const created = new Date(finding.createdAt).getTime();
    const resolvedAt = new Date(finding.resolvedAt).getTime();
    if (Number.isNaN(created) || Number.isNaN(resolvedAt) || resolvedAt < created) continue;
    totalMs += resolvedAt - created;
    resolvedCount += 1;
  }

  if (resolvedCount === 0) return null;
  return Math.round((totalMs / resolvedCount / 86_400_000) * 10) / 10;
}
