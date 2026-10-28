export function likePattern(search: string): string {
  const escaped = search.trim().replace(/[\\%_]/g, (character) => `\\${character}`);
  return `%${escaped}%`;
}

export function clampLimit(limit: number | undefined, fallback = 100, max = 500): number {
  if (!limit || !Number.isFinite(limit)) return fallback;
  return Math.min(Math.max(Math.trunc(limit), 1), max);
}
