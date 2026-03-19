/**
 * Safely parses a JSON string and returns a typed result.
 */
export function safeParse<T = unknown>(
  json: string
): { ok: true; value: T } | { ok: false; error: string } {
  try {
    const value = JSON.parse(json) as T;
    return { ok: true, value };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  }
}

/**
 * Safely stringifies a value and returns a result.
 */
export function safeStringify(
  value: unknown
): { ok: true; value: string } | { ok: false; error: string } {
  try {
    const result = JSON.stringify(value, null, 2);
    return { ok: true, value: result };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  }
}
