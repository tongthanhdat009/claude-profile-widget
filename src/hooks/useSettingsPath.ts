import { useCallback, useEffect, useState } from "react";
import { getSettingsPath, readSettings } from "../services/settingsService";
import type { ClaudeSettings } from "../types/settings";

export interface UseSettingsPathResult {
  settingsPath: string;
  currentSettings: ClaudeSettings | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useSettingsPath(): UseSettingsPathResult {
  const [settingsPath, setSettingsPath] = useState("");
  const [currentSettings, setCurrentSettings] =
    useState<ClaudeSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [path, settings] = await Promise.all([
        getSettingsPath(),
        readSettings(),
      ]);
      setSettingsPath(path);
      setCurrentSettings(settings);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { settingsPath, currentSettings, isLoading, error, refresh };
}
