import { useCallback, useEffect, useState } from "react";
import type { Backup } from "../types/backup";
import { listBackups } from "../services/backupService";

export interface UseBackupsResult {
  backups: Backup[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useBackups(): UseBackupsResult {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listBackups();
      setBackups(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { backups, isLoading, error, refresh };
}
