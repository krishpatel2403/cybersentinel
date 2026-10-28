type Level = "info" | "warn" | "error";

function write(level: Level, event: string, data?: Record<string, unknown>): void {
  const record = {
    ts: new Date().toISOString(),
    level,
    event,
    ...data,
  };

  if (process.env.NODE_ENV === "production") {
    const line = JSON.stringify(record);
    if (level === "error") console.error(line);
    else if (level === "warn") console.warn(line);
    else console.info(line);
    return;
  }

  const label = `[cybersentinel:${level}]`;
  if (level === "error") console.error(label, event, data ?? "");
  else if (level === "warn") console.warn(label, event, data ?? "");
  else console.info(label, event, data ?? "");
}

/**
 * Structured logger. Never pass passwords, session tokens, API keys, or full
 * request bodies containing personal data.
 */
export const logger = {
  info: (event: string, data?: Record<string, unknown>) => write("info", event, data),
  warn: (event: string, data?: Record<string, unknown>) => write("warn", event, data),
  error: (event: string, data?: Record<string, unknown>) => write("error", event, data),
};
