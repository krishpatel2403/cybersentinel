import Link from "next/link";
import { Activity, Bot, Globe2, ShieldAlert, TimerReset } from "lucide-react";
import type { Metadata } from "next";
import { requireUser } from "@/lib/security/session";
import { getPostureSnapshot } from "@/lib/services/analytics";
import { buildAnalystContext } from "@/lib/ai/context";
import { answerLocally } from "@/lib/ai/local-analyst";
import { formatRelativeTime } from "@/lib/utils";
import { buttonClasses } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { FindingDialog } from "@/components/findings/finding-dialog";
import { StatCard } from "@/components/dashboard/stat-card";
import { ScoreCard } from "@/components/dashboard/score-card";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { SeverityDistribution } from "@/components/dashboard/severity-distribution";
import { TopAssets } from "@/components/dashboard/top-assets";
import { RecentEvents } from "@/components/dashboard/recent-events";
import { PriorityFindings } from "@/components/dashboard/priority-findings";
import { AnalystBrief } from "@/components/dashboard/analyst-brief";

export const metadata: Metadata = { title: "Security overview" };

export default async function DashboardPage() {
  const user = await requireUser();
  const snapshot = await getPostureSnapshot();
  const brief = answerLocally(
    "Give me a security posture briefing.",
    buildAnalystContext(snapshot),
  ).answer;

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Overview"
        title="Security posture"
        description={`Weighted view of ${snapshot.stats.totalAssets} assets and ${snapshot.stats.openFindings} active findings. Updated ${formatRelativeTime(snapshot.generatedAt)}.`}
      >
        <Link href="/copilot" className={buttonClasses("secondary", "md")}>
          <Bot className="size-4" aria-hidden="true" />
          Ask copilot
        </Link>
        <FindingDialog assets={snapshot.assets} role={user.role} />
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Open findings"
          value={snapshot.stats.openFindings}
          sub={`${snapshot.severityCounts.critical} critical · ${snapshot.severityCounts.high} high`}
          icon={ShieldAlert}
          href="/findings"
          tone={snapshot.severityCounts.critical > 0 ? "critical" : "default"}
        />
        <StatCard
          label="Internet-facing assets"
          value={snapshot.stats.internetExposed}
          sub={`${snapshot.stats.exposedAtRisk} with elevated risk`}
          icon={Globe2}
          href="/assets?exposure=internet"
          tone={snapshot.stats.exposedAtRisk > 0 ? "warning" : "default"}
        />
        <StatCard
          label="Events · 24 hours"
          value={snapshot.stats.events24h}
          sub="Seeded or simulated telemetry"
          icon={Activity}
          href="/events"
          tone="info"
        />
        <StatCard
          label="Mean time to resolve"
          value={snapshot.mttrDays !== null ? `${snapshot.mttrDays}d` : "—"}
          sub={`${snapshot.stats.resolved7d} resolved in the last 7 days`}
          icon={TimerReset}
          href="/findings?status=resolved"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="min-w-0 xl:col-span-4">
          <ScoreCard
            score={snapshot.score}
            delta={snapshot.scoreDelta}
            criticalHigh={snapshot.stats.criticalHigh}
            criticalAssets={snapshot.stats.criticalAssets}
          />
        </div>
        <div className="min-w-0 xl:col-span-8">
          <TrendChart points={snapshot.timeline} />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="min-w-0 xl:col-span-7">
          <PriorityFindings findings={snapshot.priorityFindings} />
        </div>
        <div className="min-w-0 xl:col-span-5">
          <RecentEvents events={snapshot.recentEvents} />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="min-w-0 xl:col-span-4">
          <SeverityDistribution
            counts={snapshot.severityCounts}
            total={snapshot.stats.openFindings}
          />
        </div>
        <div className="min-w-0 xl:col-span-4">
          <TopAssets assets={snapshot.assets} />
        </div>
        <div className="min-w-0 xl:col-span-4">
          <AnalystBrief brief={brief} />
        </div>
      </div>

      <p className="px-1 pb-2 text-[10px] leading-5 text-slate-600">
        CyberSentinel is a portfolio demonstration. Findings, events, and threat intel are sample or
        public advisory data, not a live assessment of your environment. Scores are heuristic and do
        not replace a real scanner or professional security advice.
      </p>
    </div>
  );
}
