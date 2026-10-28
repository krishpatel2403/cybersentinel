import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/security/session";
import { listFindings } from "@/lib/repositories/findings";
import { parseSeverity, parseStatus } from "@/lib/validation/filters";
import { toCsv } from "@/lib/csv";
import { logger } from "@/lib/logger";
import { SEVERITY_LABELS, STATUS_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const HEADERS = [
  "Finding ID",
  "Title",
  "Severity",
  "Status",
  "CVSS",
  "CVE",
  "Asset",
  "Hostname",
  "Exposure",
  "Asset criticality",
  "Due date",
  "Created at",
  "Resolved at",
  "Description",
  "Remediation notes",
];

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const params = request.nextUrl.searchParams;
  const search = (params.get("search") ?? "").trim();
  const severity = parseSeverity(params.get("severity") ?? "");
  const status = parseStatus(params.get("status") ?? "");
  const assetId = params.get("assetId") ?? undefined;

  try {
    const findings = await listFindings({
      search: search || undefined,
      severity,
      status,
      assetId,
      limit: 500,
    });

    const rows = findings.map((finding) => [
      finding.id,
      finding.title,
      `${SEVERITY_LABELS[finding.severity]} (${finding.severity})`,
      STATUS_LABELS[finding.status],
      finding.cvss,
      finding.cveId,
      finding.assetName,
      finding.assetHostname,
      finding.assetExposure,
      finding.assetCriticality,
      finding.dueDate,
      finding.createdAt,
      finding.resolvedAt,
      finding.description,
      finding.remediation,
    ]);

    const csv = toCsv(HEADERS, rows);
    const filename = `cybersentinel-findings-${new Date().toISOString().slice(0, 10)}.csv`;

    logger.info("findings.exported", {
      userId: user.id,
      count: findings.length,
      filtered: Boolean(search || severity || status || assetId),
    });

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noindex",
      },
    });
  } catch (error) {
    logger.error("findings.export_failed", {
      userId: user.id,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "The export could not be generated." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
