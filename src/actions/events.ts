"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/security/session";
import { listAssets } from "@/lib/repositories/assets";
import { createEvents } from "@/lib/repositories/events";
import { writeAuditLog } from "@/lib/repositories/audit";
import { generateSampleEvents } from "@/lib/simulator";
import { RateLimiter } from "@/lib/security/rate-limit";
import { errorState, successState } from "@/lib/validation/utils";
import { logger } from "@/lib/logger";
import type { ActionState } from "@/types/actions";

const simulateLimiter = new RateLimiter(6, 5 * 60_000);

export async function simulateEventsAction(): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return errorState("Your session expired. Sign in again.");
  if (user.role !== "admin")
    return errorState("Only administrators can generate sample telemetry.");

  const limit = simulateLimiter.check(`user:${user.id}`);
  if (!limit.allowed) {
    return errorState("Simulation is limited to 6 runs per five minutes. Try again shortly.");
  }

  try {
    const assets = await listAssets();
    const events = generateSampleEvents(assets, 6);
    const count = await createEvents(events);
    await writeAuditLog({
      actor: user,
      action: "events.simulated",
      entityType: "event",
      details: { count },
    });
    revalidatePath("/events");
    revalidatePath("/dashboard");
    logger.info("events.simulated", { count, userId: user.id });
    return successState(`${count} sample events generated. They are labeled as simulator data.`);
  } catch (error) {
    logger.error("events.simulate_failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return errorState("Sample events could not be generated. Please try again.");
  }
}
