let warnedAboutDevSecret = false;

export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET?.trim();

  if (secret && secret.length >= 32) return secret;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET must be set to at least 32 characters in production. See .env.example.",
    );
  }

  if (!warnedAboutDevSecret) {
    warnedAboutDevSecret = true;
    console.warn(
      "[cybersentinel:warn] SESSION_SECRET is missing or too short. Using an insecure development fallback. Run `npm run setup` to generate one.",
    );
  }

  return "dev-only-insecure-session-secret-do-not-use-in-production-2026";
}

export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}

export function getDatabaseMode(): "local" | "turso" {
  return process.env.TURSO_DATABASE_URL?.trim() ? "turso" : "local";
}

export interface AiConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export function getAiConfig(): AiConfig | null {
  const baseUrl = process.env.AI_BASE_URL?.trim();
  const apiKey = process.env.AI_API_KEY?.trim();
  const model = process.env.AI_MODEL?.trim();
  if (!baseUrl || !apiKey || !model) return null;
  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey, model };
}

export function isAiConfigured(): boolean {
  return getAiConfig() !== null;
}

export function getAppUrl(): string {
  return process.env.APP_URL?.trim() || "http://localhost:3000";
}
