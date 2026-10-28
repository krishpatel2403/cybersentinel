import { describe, expect, it } from "vitest";
import {
  buildScoreTimeline,
  computeAssetRisk,
  computePostureScore,
  findingWeight,
  gradeFor,
  meanTimeToResolveDays,
  weightedFindingForAsset,
  type RiskAsset,
  type RiskFinding,
  type TimelineFinding,
} from "@/lib/risk";

const asset: RiskAsset = { id: "asset-1", criticality: 4, exposure: "internet" };
const finding: RiskFinding = {
  assetId: "asset-1",
  severity: "critical",
  status: "open",
  cvss: 9.8,
};

describe("risk engine", () => {
  it("gives an empty environment a perfect score", () => {
    const score = computePostureScore([], []);
    expect(score.securityScore).toBe(100);
    expect(score.grade).toBe("A");
    expect(score.exposureScore).toBe(0);
    expect(score.weightedRisk).toBe(0);
  });

  it("ignores findings whose asset is not in the inventory", () => {
    const score = computePostureScore([{ ...finding, assetId: "missing" }], [asset]);
    expect(score.weightedRisk).toBe(0);
    expect(score.securityScore).toBe(100);
  });

  it("weights critical findings above low findings", () => {
    const critical = computePostureScore([finding], [asset]);
    const low = computePostureScore([{ ...finding, severity: "low" }], [asset]);
    expect(critical.weightedRisk).toBeGreaterThan(low.weightedRisk);
    expect(critical.securityScore).toBeLessThan(low.securityScore);
  });

  it("reduces weight for in-progress and accepted findings", () => {
    const open = findingWeight(finding);
    const inProgress = findingWeight({ ...finding, status: "in_progress" });
    const accepted = findingWeight({ ...finding, status: "accepted_risk" });
    const resolved = findingWeight({ ...finding, status: "resolved" });

    expect(inProgress).toBeLessThan(open);
    expect(accepted).toBeLessThan(inProgress);
    expect(resolved).toBe(0);
  });

  it("applies CVSS, exposure, and criticality multipliers", () => {
    const noCvss = weightedFindingForAsset({ ...finding, cvss: null }, asset);
    const highCvss = weightedFindingForAsset(finding, asset);
    const isolated = weightedFindingForAsset(finding, { ...asset, exposure: "isolated" });
    const lowCriticality = weightedFindingForAsset(finding, { ...asset, criticality: 1 });

    expect(highCvss).toBeGreaterThan(noCvss);
    expect(isolated).toBeLessThan(highCvss);
    expect(lowCriticality).toBeLessThan(highCvss);
  });

  it("scores a single asset between 0 and 100", () => {
    expect(computeAssetRisk([], asset)).toBe(0);
    const rated = computeAssetRisk([finding], asset);
    expect(rated).toBeGreaterThan(0);
    expect(rated).toBeLessThanOrEqual(100);
  });

  it("maps score thresholds to grades", () => {
    expect(gradeFor(100)).toBe("A");
    expect(gradeFor(90)).toBe("A");
    expect(gradeFor(89)).toBe("B");
    expect(gradeFor(80)).toBe("B");
    expect(gradeFor(79)).toBe("C");
    expect(gradeFor(70)).toBe("C");
    expect(gradeFor(69)).toBe("D");
    expect(gradeFor(60)).toBe("D");
    expect(gradeFor(59)).toBe("F");
  });

  it("builds one timeline point per requested day", () => {
    const now = new Date("2026-03-15T12:00:00.000Z");
    const timeline = buildScoreTimeline([], [], 7, now);
    expect(timeline).toHaveLength(7);
    expect(timeline.at(-1)?.date.startsWith("2026-03-15")).toBe(true);
    expect(timeline[0]?.date.startsWith("2026-03-09")).toBe(true);
    expect(timeline.every((point) => point.securityScore === 100)).toBe(true);
  });

  it("counts a finding before it is created but not after it is resolved", () => {
    const timelineFinding: TimelineFinding = {
      assetId: "asset-1",
      severity: "critical",
      status: "resolved",
      cvss: 9.8,
      createdAt: "2026-03-10T00:00:00.000Z",
      resolvedAt: "2026-03-13T00:00:00.000Z",
    };
    const points = buildScoreTimeline(
      [timelineFinding],
      [asset],
      7,
      new Date("2026-03-15T12:00:00.000Z"),
    );

    const beforeCreation = points.find((point) => point.date.startsWith("2026-03-09"));
    const afterCreation = points.find((point) => point.date.startsWith("2026-03-11"));
    const afterResolution = points.find((point) => point.date.startsWith("2026-03-14"));

    expect(beforeCreation?.securityScore).toBe(100);
    expect(afterCreation?.securityScore).toBeLessThan(100);
    expect(afterResolution?.securityScore).toBe(100);
  });

  it("calculates mean time to resolve and skips invalid dates", () => {
    expect(meanTimeToResolveDays([])).toBeNull();
    expect(
      meanTimeToResolveDays([
        { createdAt: "2026-03-01T00:00:00.000Z", resolvedAt: "2026-03-03T00:00:00.000Z" },
        { createdAt: "2026-03-01T00:00:00.000Z", resolvedAt: "2026-03-05T00:00:00.000Z" },
        { createdAt: "2026-03-01T00:00:00.000Z", resolvedAt: "not-a-date" },
      ]),
    ).toBe(3);
  });
});
