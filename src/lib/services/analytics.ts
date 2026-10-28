import { listAssets, type AssetFilters } from "@/lib/repositories/assets";
import { listActiveFindings, getTimelineFindings } from "@/lib/repositories/findings";
import { countEventsSince, listEvents } from "@/lib/repositories/events";
import {
  buildScoreTimeline,
  computeAssetRisk,
  computePostureScore,
  meanTimeToResolveDays,
  type PostureScore,
  type ScorePoint,
  type TimelineFinding,
} from "@/lib/risk";
import {
  SEVERITIES,
  type AssetWithStats,
  type FindingWithAsset,
  type SecurityEvent,
  type Severity,
} from "@/types";

export interface PostureSnapshot {
  generatedAt: string;
  score: PostureScore;
  assets: AssetWithStats[];
  topAssets: AssetWithStats[];
  priorityFindings: FindingWithAsset[];
  activeFindings: FindingWithAsset[];
  severityCounts: Record<Severity, number>;
  recentEvents: SecurityEvent[];
  timeline: ScorePoint[];
  scoreDelta: number;
  mttrDays: number | null;
  stats: {
    totalAssets: number;
    totalFindings: number;
    openFindings: number;
    criticalHigh: number;
    internetExposed: number;
    exposedAtRisk: number;
    criticalAssets: number;
    overdueFindings: number;
    newFindings7d: number;
    resolved7d: number;
    events24h: number;
  };
}

function emptySeverityCounts(): Record<Severity, number> {
  return Object.fromEntries(SEVERITIES.map((severity) => [severity, 0])) as Record<
    Severity,
    number
  >;
}

export async function getPostureSnapshot(): Promise<PostureSnapshot> {
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 86_400_000).toISOString();
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000).toISOString();

  const [assets, activeFindings, recentEvents, timelineFindings, events24h] = await Promise.all([
    listAssets(),
    listActiveFindings(500),
    listEvents({ limit: 8 }),
    getTimelineFindings(),
    countEventsSince(dayAgo),
  ]);

  const findingsByAsset = new Map<string, FindingWithAsset[]>();
  for (const finding of activeFindings) {
    const existing = findingsByAsset.get(finding.assetId) ?? [];
    existing.push(finding);
    findingsByAsset.set(finding.assetId, existing);
  }

  const assetsWithStats: AssetWithStats[] = assets
    .map((asset) => {
      const findings = findingsByAsset.get(asset.id) ?? [];
      return {
        ...asset,
        openFindings: findings.length,
        criticalFindings: findings.filter((finding) => finding.severity === "critical").length,
        riskScore: computeAssetRisk(findings, asset),
      };
    })
    .sort((a, b) => b.riskScore - a.riskScore || a.name.localeCompare(b.name));

  const severityCounts = emptySeverityCounts();
  for (const finding of activeFindings) {
    severityCounts[finding.severity] += 1;
  }

  const score = computePostureScore(activeFindings, assets);
  const timeline = buildScoreTimeline(timelineFindings, assets, 14, now);
  const sevenDaysAgo =
    timeline[Math.max(0, timeline.length - 8)]?.securityScore ?? score.securityScore;
  const scoreDelta = score.securityScore - sevenDaysAgo;

  const todayIso = now.toISOString().slice(0, 10);
  const overdueFindings = activeFindings.filter(
    (finding) => finding.dueDate !== null && finding.dueDate < todayIso,
  ).length;
  const newFindings7d = timelineFindings.filter((finding) => finding.createdAt >= weekAgo).length;
  const resolved7d = timelineFindings.filter(
    (finding) => finding.resolvedAt !== null && finding.resolvedAt >= weekAgo,
  ).length;

  const exposedAssets = assetsWithStats.filter((asset) => asset.exposure === "internet");
  const criticalHigh = activeFindings.filter(
    (finding) => finding.severity === "critical" || finding.severity === "high",
  ).length;

  return {
    generatedAt: now.toISOString(),
    score,
    assets: assetsWithStats,
    topAssets: assetsWithStats.slice(0, 5),
    priorityFindings: activeFindings.slice(0, 6),
    activeFindings,
    severityCounts,
    recentEvents,
    timeline,
    scoreDelta,
    mttrDays: meanTimeToResolveDays(timelineFindings),
    stats: {
      totalAssets: assets.length,
      totalFindings: timelineFindings.length,
      openFindings: activeFindings.length,
      criticalHigh,
      internetExposed: exposedAssets.length,
      exposedAtRisk: exposedAssets.filter((asset) => asset.riskScore >= 50).length,
      criticalAssets: assetsWithStats.filter((asset) => asset.riskScore >= 70).length,
      overdueFindings,
      newFindings7d,
      resolved7d,
      events24h,
    },
  };
}

export async function getAssetListWithStats(filters: AssetFilters = {}): Promise<AssetWithStats[]> {
  const [assets, activeFindings] = await Promise.all([
    listAssets(filters),
    listActiveFindings(500),
  ]);

  const findingsByAsset = new Map<string, FindingWithAsset[]>();
  for (const finding of activeFindings) {
    const existing = findingsByAsset.get(finding.assetId) ?? [];
    existing.push(finding);
    findingsByAsset.set(finding.assetId, existing);
  }

  return assets
    .map((asset) => {
      const findings = findingsByAsset.get(asset.id) ?? [];
      return {
        ...asset,
        openFindings: findings.length,
        criticalFindings: findings.filter((finding) => finding.severity === "critical").length,
        riskScore: computeAssetRisk(findings, asset),
      };
    })
    .sort((a, b) => b.riskScore - a.riskScore || a.name.localeCompare(b.name));
}

export type { TimelineFinding };
