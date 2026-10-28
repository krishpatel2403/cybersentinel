import { describe, expect, it } from "vitest";
import { answerLocally } from "@/lib/ai/local-analyst";
import type { AnalystContext } from "@/lib/ai/context";

const context: AnalystContext = {
  securityScore: 68,
  grade: "D",
  scoreDelta: -4,
  weightedRisk: 102.3,
  severityCounts: { critical: 2, high: 3, medium: 4, low: 2, info: 0 },
  openFindings: 11,
  criticalHigh: 5,
  totalAssets: 6,
  internetExposed: 3,
  exposedAtRisk: 2,
  mttrDays: 6.5,
  events24h: 9,
  topAssets: [
    {
      name: "Edge Gateway",
      hostname: "edge-01",
      exposure: "internet",
      criticality: 5,
      riskScore: 84,
      openFindings: 3,
      criticalFindings: 1,
    },
  ],
  exposedAssets: [
    {
      name: "Edge Gateway",
      hostname: "edge-01",
      exposure: "internet",
      criticality: 5,
      riskScore: 84,
      openFindings: 3,
      criticalFindings: 1,
    },
    {
      name: "Customer Portal",
      hostname: "portal-01",
      exposure: "internet",
      criticality: 4,
      riskScore: 61,
      openFindings: 2,
      criticalFindings: 0,
    },
  ],
  topFindings: [
    {
      id: "finding-1",
      title: "PAN-OS command injection",
      severity: "critical",
      status: "open",
      cveId: "CVE-2024-3400",
      assetName: "Edge Gateway",
      assetHostname: "edge-01",
      exposure: "internet",
      remediation: "Upgrade PAN-OS and restrict management access.",
    },
  ],
  criticalFindings: [
    {
      id: "finding-1",
      title: "PAN-OS command injection",
      severity: "critical",
      status: "open",
      cveId: "CVE-2024-3400",
      assetName: "Edge Gateway",
      assetHostname: "edge-01",
      exposure: "internet",
      remediation: "Upgrade PAN-OS and restrict management access.",
    },
    {
      id: "finding-2",
      title: "Exposed administrative interface",
      severity: "critical",
      status: "open",
      cveId: null,
      assetName: "Customer Portal",
      assetHostname: "portal-01",
      exposure: "internet",
      remediation: "",
    },
  ],
  recentEvents: [
    {
      source: "WAF",
      eventType: "Blocked exploit attempt",
      severity: "high",
      message: "Blocked a path traversal attempt against the customer portal.",
      occurredAt: "2026-03-15T10:00:00.000Z",
      assetName: "Customer Portal",
    },
  ],
};

describe("local analyst", () => {
  it("provides a posture briefing with score, grade, and citations", () => {
    const result = answerLocally(
      "Give me a security posture briefing.",
      context,
      Date.parse("2026-03-15T12:00:00Z"),
    );
    expect(result.answer).toContain("68/100");
    expect(result.answer).toContain("grade D");
    expect(result.answer).toContain("down 4 points");
    expect(result.citations.map((citation) => citation.href)).toContain("/dashboard");
  });

  it("lists critical findings when asked", () => {
    const result = answerLocally("Do we have any critical findings?", context);
    expect(result.answer).toContain("2 active critical findings");
    expect(result.answer).toContain("PAN-OS command injection");
    expect(result.answer).toContain("CVE-2024-3400");
    expect(result.citations[0]?.href).toBe("/findings?severity=critical");
  });

  it("summarizes internet exposure", () => {
    const result = answerLocally("Which internet-facing assets are most at risk?", context);
    expect(result.answer).toContain("3 of 6 assets are marked internet-facing");
    expect(result.answer).toContain("Edge Gateway");
    expect(result.citations[0]?.href).toBe("/assets?exposure=internet");
  });

  it("summarizes recent activity and labels simulator data", () => {
    const result = answerLocally(
      "Summarize activity from the last 24 hours.",
      context,
      Date.parse("2026-03-15T12:00:00Z"),
    );
    expect(result.answer).toContain("9 events were recorded");
    expect(result.answer).toContain("Blocked exploit attempt");
    expect(result.answer).toContain("simulator or seeded sample data");
    expect(result.citations[0]?.href).toBe("/events");
  });

  it("prioritizes remediation with concrete first steps", () => {
    const result = answerLocally("What should we remediate first?", context);
    expect(result.answer).toContain("Recommended remediation order");
    expect(result.answer).toContain("Upgrade PAN-OS");
    expect(result.citations.some((citation) => citation.href === "/findings/finding-1")).toBe(true);
  });

  it("handles an empty environment gracefully", () => {
    const empty: AnalystContext = {
      ...context,
      securityScore: 100,
      grade: "A",
      scoreDelta: 0,
      weightedRisk: 0,
      severityCounts: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
      openFindings: 0,
      criticalHigh: 0,
      totalAssets: 0,
      internetExposed: 0,
      exposedAtRisk: 0,
      mttrDays: null,
      events24h: 0,
      topAssets: [],
      exposedAssets: [],
      topFindings: [],
      criticalFindings: [],
      recentEvents: [],
    };

    expect(answerLocally("What should we fix first?", empty).answer).toContain(
      "no active findings",
    );
    expect(answerLocally("Do we have critical findings?", empty).answer).toContain(
      "no active critical findings",
    );
    expect(answerLocally("Do we have internet exposure?", empty).answer).toContain("No assets");
    expect(answerLocally("Any recent events?", empty).answer).toContain("No security events");
  });

  it("falls back to a capability summary for unrelated questions", () => {
    const result = answerLocally("What is the weather like?", context);
    expect(result.answer).toContain("I can answer questions about posture");
    expect(result.citations).toHaveLength(2);
  });
});
