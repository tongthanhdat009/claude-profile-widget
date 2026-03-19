/**
 * Returns a sortable ISO 8601 timestamp string.
 */
export function nowTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Formats a timestamp for display.
 */
export function formatTimestamp(iso: string): string {
  try {
    const date = new Date(iso);
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
}

/**
 * Returns a filename-safe timestamp string.
 */
export function fileTimestamp(): string {
  return new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .replace("T", "_")
    .slice(0, 19);
}
