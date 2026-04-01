import { invokeBrowserPreview } from "./browserPreview";

declare global {
  interface Window {
    __TAURI_INTERNALS__?: unknown;
  }
}

export function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && window.__TAURI_INTERNALS__ !== undefined;
}

export async function invokeCommand<T>(
  command: string,
  args: Record<string, unknown> = {}
): Promise<T> {
  if (isTauriRuntime()) {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<T>(command, args);
  }

  return invokeBrowserPreview<T>(command, args);
}
