import type { Metadata } from "next";
import { Bot, Cpu, ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/security/session";
import { getPostureSnapshot } from "@/lib/services/analytics";
import { isAiConfigured } from "@/lib/env";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badges";
import { CopilotChat } from "@/components/copilot/copilot-chat";

export const metadata: Metadata = { title: "Copilot" };

export default async function CopilotPage() {
  await requireUser();
  const [snapshot, aiConfigured] = await Promise.all([
    getPostureSnapshot(),
    Promise.resolve(isAiConfigured()),
  ]);

  const postureSummary = `Current posture is ${snapshot.score.securityScore}/100 (grade ${snapshot.score.grade}) with ${snapshot.stats.openFindings} active findings across ${snapshot.stats.totalAssets} assets, including ${snapshot.severityCounts.critical} critical and ${snapshot.severityCounts.high} high.`;

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="AI-assisted analysis"
        title="Copilot"
        description="Ask questions about the posture data already in this dashboard. Answers are grounded in the current aggregates and cite the pages they come from."
      >
        <Badge
          className={
            aiConfigured
              ? "border-indigo-400/25 bg-indigo-400/10 text-indigo-200"
              : "border-cyan-400/25 bg-cyan-400/10 text-cyan-200"
          }
        >
          {aiConfigured ? (
            <Cpu className="size-3" aria-hidden="true" />
          ) : (
            <Bot className="size-3" aria-hidden="true" />
          )}
          {aiConfigured ? "External AI enabled" : "Local analyst engine"}
        </Badge>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-2.5 py-1 text-[10px] text-emerald-200">
          <ShieldCheck className="size-3" aria-hidden="true" />
          Read-only
        </span>
      </PageHeader>

      <CopilotChat aiConfigured={aiConfigured} postureSummary={postureSummary} />
    </div>
  );
}
