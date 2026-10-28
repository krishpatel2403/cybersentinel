import type { AnalystContext } from "@/lib/ai/context";
import { GRADE_LABELS, SEVERITY_LABELS } from "@/lib/constants";
import { formatRelativeTime, truncate } from "@/lib/utils";
import type { CopilotCitation } from "@/types";

export interface LocalAnalystResult {
  answer: string;
  citations: CopilotCitation[];
}

function severityLine(context: AnalystContext): string {
  const parts = (["critical", "high", "medium", "low", "info"] as const)
    .filter((severity) => context.severityCounts[severity] > 0)
    .map(
      (severity) =>
        `${context.severityCounts[severity]} ${SEVERITY_LABELS[severity].toLowerCase()}`,
    );
  return parts.length > 0 ? parts.join(", ") : "no active findings";
}

function deltaText(context: AnalystContext): string {
  if (context.scoreDelta === 0) return "unchanged over the last 7 days";
  const direction = context.scoreDelta > 0 ? "up" : "down";
  return `${direction} ${Math.abs(context.scoreDelta)} points over the last 7 days`;
}

function firstStep(remediation: string, cveId: string | null): string {
  if (remediation.trim()) return truncate(remediation.trim().replace(/\s+/g, " "), 180);
  if (cveId) {
    return `Apply the vendor patch or upgrade for ${cveId}, validate in staging, then deploy.`;
  }
  return "Confirm the affected service and owner, then apply the documented hardening or patching step.";
}

function citationForFinding(id: string, title: string): CopilotCitation {
  return { label: truncate(title, 38), href: `/findings/${id}` };
}

export function answerLocally(
  question: string,
  context: AnalystContext,
  now = Date.now(),
): LocalAnalystResult {
  const normalized = question.toLowerCase();
  const postureCitation: CopilotCitation = { label: "Security dashboard", href: "/dashboard" };
  const findingsCitation: CopilotCitation = { label: "All findings", href: "/findings" };
  const assetsCitation: CopilotCitation = { label: "Asset inventory", href: "/assets" };
  const eventsCitation: CopilotCitation = { label: "Security events", href: "/events" };

  if (
    /remediat|fix|patch|priorit|first|next step|what should (we|i)|how do (we|i)/i.test(
      normalized,
    ) ||
    normalized.includes("address")
  ) {
    const targets = context.topFindings.slice(0, 5);
    if (targets.length === 0) {
      return {
        answer:
          "There are no active findings to remediate. Keep the current patch cadence, review new telemetry weekly, and re-run your scanner after infrastructure changes.",
        citations: [postureCitation, findingsCitation],
      };
    }

    const lines = targets.map(
      (finding, index) =>
        `${index + 1}. [${SEVERITY_LABELS[finding.severity]}] ${finding.title} — ${finding.assetName} (${finding.assetHostname}, ${finding.exposure}).\n   First step: ${firstStep(finding.remediation, finding.cveId)}`,
    );

    return {
      answer: [
        `Recommended remediation order (${context.openFindings} active findings total):`,
        ...lines,
        "",
        "Why this order: severity, internet exposure, and asset criticality are weighted into the risk score. Patch internet-facing critical and high findings first, then contain anything that cannot be patched immediately.",
      ].join("\n"),
      citations: [
        { label: "Priority findings", href: "/findings" },
        ...targets.slice(0, 2).map((finding) => citationForFinding(finding.id, finding.title)),
      ],
    };
  }

  if (/critical|severe|urgent|emergency/i.test(normalized)) {
    if (context.criticalFindings.length === 0) {
      return {
        answer: `There are no active critical findings. You still have ${context.criticalHigh} critical/high findings combined and ${context.openFindings} active findings overall. Review the high-severity queue next and confirm due dates are realistic.`,
        citations: [findingsCitation, postureCitation],
      };
    }

    return {
      answer: [
        `There ${context.criticalFindings.length === 1 ? "is" : "are"} ${context.criticalFindings.length} active critical ${context.criticalFindings.length === 1 ? "finding" : "findings"}:`,
        ...context.criticalFindings.map(
          (finding, index) =>
            `${index + 1}. ${finding.title} — ${finding.assetName} (${finding.assetHostname}, ${finding.exposure})${finding.cveId ? `, ${finding.cveId}` : ""}.\n   First step: ${firstStep(finding.remediation, finding.cveId)}`,
        ),
        "",
        "Contain first if patching will take time: restrict network access, disable the vulnerable feature, or rotate exposed credentials. Record the decision in the finding's status.",
      ].join("\n"),
      citations: [
        { label: "Critical findings", href: "/findings?severity=critical" },
        ...context.criticalFindings
          .slice(0, 2)
          .map((finding) => citationForFinding(finding.id, finding.title)),
      ],
    };
  }

  if (/expos|internet|attack surface|public|external/i.test(normalized)) {
    if (context.exposedAssets.length === 0) {
      return {
        answer:
          "No assets are currently marked as internet-facing in the inventory. Verify that exposure labels are accurate — incomplete inventory data is a common cause of false comfort.",
        citations: [assetsCitation],
      };
    }

    return {
      answer: [
        `${context.internetExposed} of ${context.totalAssets} assets are marked internet-facing; ${context.exposedAtRisk} of those have a risk score of 50 or higher.`,
        ...context.exposedAssets.map(
          (asset, index) =>
            `${index + 1}. ${asset.name} (${asset.hostname}) — risk ${asset.riskScore}/100, ${asset.openFindings} active findings, criticality ${asset.criticality}/5.`,
        ),
        "",
        "Internet exposure multiplies finding weight in this scoring model. Validate that each public service is intentional, patched, and monitored.",
      ].join("\n"),
      citations: [
        { label: "Internet-facing assets", href: "/assets?exposure=internet" },
        { label: "Findings", href: "/findings" },
      ],
    };
  }

  if (/event|activit|log|incident|last 24|recent|telemetry/i.test(normalized)) {
    const events = context.recentEvents.slice(0, 6);
    if (events.length === 0) {
      return {
        answer:
          "No security events have been recorded yet. Generate sample telemetry from the Events page, or connect a real log source in a later milestone.",
        citations: [eventsCitation],
      };
    }

    return {
      answer: [
        `${context.events24h} events were recorded in the last 24 hours. The latest notable events:`,
        ...events.map(
          (event) =>
            `• [${SEVERITY_LABELS[event.severity]}] ${event.source} — ${event.eventType}: ${truncate(event.message, 140)}${event.assetName ? ` (${event.assetName})` : ""} — ${formatRelativeTime(event.occurredAt, now)}.`,
        ),
        "",
        "Events in this demo come from the simulator or seeded sample data unless you connect a real source. They are not evidence of a live intrusion.",
      ].join("\n"),
      citations: [eventsCitation],
    };
  }

  if (/asset|inventor|host|endpoint|server|device/i.test(normalized)) {
    const byExposure = context.exposedAssets.length;
    return {
      answer: [
        `The inventory contains ${context.totalAssets} assets. ${byExposure} are internet-facing and ${context.exposedAtRisk} of those are elevated risk.`,
        ...context.topAssets.map(
          (asset, index) =>
            `${index + 1}. ${asset.name} (${asset.hostname}) — risk ${asset.riskScore}/100, ${asset.openFindings} open findings, exposure: ${asset.exposure}.`,
        ),
        "",
        "Risk scores update automatically when findings are added, resolved, or accepted.",
      ].join("\n"),
      citations: [assetsCitation, postureCitation],
    };
  }

  if (
    /posture|score|overall|health|risk|brief|summary|status/i.test(normalized) ||
    normalized.length < 12
  ) {
    const top = context.topAssets.slice(0, 3);
    return {
      answer: [
        `Security posture: ${context.securityScore}/100 (grade ${context.grade} — ${GRADE_LABELS[context.grade as keyof typeof GRADE_LABELS] ?? "Unknown"}). The score is ${deltaText(context)}.`,
        `${context.openFindings} active findings across ${context.totalAssets} assets: ${severityLine(context)}. ${context.criticalHigh} are critical or high.`,
        top.length > 0
          ? `Highest-risk assets:\n${top.map((asset, index) => `${index + 1}. ${asset.name} (${asset.hostname}) — risk ${asset.riskScore}/100, ${asset.openFindings} open findings.`).join("\n")}`
          : "No assets have been inventoried yet.",
        context.mttrDays !== null
          ? `Mean time to resolve recorded findings: ${context.mttrDays} days.`
          : "No findings have been resolved yet, so mean time to resolve is not available.",
        context.criticalHigh > 0
          ? "Next step: work the critical/high queue by internet exposure first. Ask me to prioritize remediation for a concrete plan."
          : "Next step: maintain patch cadence and review recent events for anomalies.",
      ].join("\n\n"),
      citations: [postureCitation, findingsCitation, assetsCitation],
    };
  }

  return {
    answer: [
      `Security posture: ${context.securityScore}/100 (grade ${context.grade}). ${context.openFindings} active findings, ${context.criticalHigh} critical/high, ${context.internetExposed} internet-facing assets.`,
      "I can answer questions about posture, critical findings, internet exposure, asset inventory, recent events, or remediation priorities. The built-in analyst currently uses the local dataset and deterministic rules; it is not a live threat feed.",
      "Try: “What should we remediate first?” or “Which internet-facing assets are most at risk?”",
    ].join("\n\n"),
    citations: [postureCitation, findingsCitation],
  };
}
