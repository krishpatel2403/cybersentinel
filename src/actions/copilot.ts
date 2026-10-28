"use server";

import { copilotQuestionSchema } from "@/lib/validation/schemas";
import { getCurrentUser } from "@/lib/security/session";
import { getPostureSnapshot } from "@/lib/services/analytics";
import { buildAnalystContext } from "@/lib/ai/context";
import { generateCopilotAnswer } from "@/lib/ai/provider";
import { writeAuditLog } from "@/lib/repositories/audit";
import { RateLimiter } from "@/lib/security/rate-limit";
import { logger } from "@/lib/logger";
import type { CopilotAnswer } from "@/types";

const copilotLimiter = new RateLimiter(15, 5 * 60_000);

export async function askCopilotAction(question: string): Promise<CopilotAnswer> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      ok: false,
      answer: "",
      mode: "local",
      citations: [],
      message: "Your session expired. Sign in again.",
    };
  }

  const limit = copilotLimiter.check(`user:${user.id}`);
  if (!limit.allowed) {
    return {
      ok: false,
      answer: "",
      mode: "local",
      citations: [],
      message:
        "You have reached the question limit (15 per five minutes). Please wait a few minutes.",
    };
  }

  const parsed = copilotQuestionSchema.safeParse(question);
  if (!parsed.success) {
    return {
      ok: false,
      answer: "",
      mode: "local",
      citations: [],
      message: parsed.error.issues[0]?.message ?? "Ask a valid question.",
    };
  }

  try {
    const snapshot = await getPostureSnapshot();
    const context = buildAnalystContext(snapshot);
    const result = await generateCopilotAnswer(parsed.data, context);

    await writeAuditLog({
      actor: user,
      action: "copilot.question_answered",
      entityType: "copilot",
      details: { mode: result.mode, questionLength: parsed.data.length },
    });
    return result;
  } catch (error) {
    logger.error("copilot.failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return {
      ok: false,
      answer: "",
      mode: "local",
      citations: [],
      message: "The analyst could not answer right now. Please try again.",
    };
  }
}
