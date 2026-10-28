import { NextResponse } from "next/server";
import { ensureDatabase, getDb } from "@/lib/db/client";
import { getDatabaseMode } from "@/lib/env";
import { APP_NAME, APP_VERSION } from "@/lib/constants";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    await ensureDatabase();
    await getDb().execute("SELECT 1");

    return NextResponse.json(
      {
        status: "ok",
        service: APP_NAME,
        version: APP_VERSION,
        timestamp: new Date().toISOString(),
        database: getDatabaseMode(),
        checks: { database: "ok" },
      },
      {
        headers: {
          "Cache-Control": "no-store",
          "X-Robots-Tag": "noindex",
        },
      },
    );
  } catch (error) {
    logger.error("health.check_failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        status: "error",
        service: APP_NAME,
        version: APP_VERSION,
        timestamp: new Date().toISOString(),
        database: getDatabaseMode(),
        checks: { database: "failed" },
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
          "X-Robots-Tag": "noindex",
        },
      },
    );
  }
}
