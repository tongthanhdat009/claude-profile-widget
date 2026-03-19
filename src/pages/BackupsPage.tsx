import { useState } from "react";
import { Header } from "../components/layout/Header";
import { BackupList } from "../components/backup/BackupList";
import { ActionBar } from "../components/ui/ActionBar";
import { useBackups } from "../hooks/useBackups";
import {
  restoreBackup,
  deleteBackup,
  createBackup,
} from "../services/backupService";
import type { Backup } from "../types/backup";

export function BackupsPage() {
  const { backups, isLoading, error, refresh } = useBackups();
  const [status, setStatus] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);

  const handleRestore = async (backup: Backup) => {
    if (!confirm(`Restore backup "${backup.fileName}"? This will overwrite your current settings.`)) {
      return;
    }
    setBusy(true);
    setStatus(null);
    try {
      await restoreBackup(backup.id);
      setStatus({ ok: true, message: "Backup restored successfully." });
      await refresh();
    } catch (err) {
      setStatus({
        ok: false,
        message: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (backup: Backup) => {
    if (!confirm(`Delete backup "${backup.fileName}"?`)) return;
    setBusy(true);
    setStatus(null);
    try {
      await deleteBackup(backup.id);
      setStatus({ ok: true, message: "Backup deleted." });
      await refresh();
    } catch (err) {
      setStatus({
        ok: false,
        message: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setBusy(false);
    }
  };

  const handleCreateBackup = async () => {
    setBusy(true);
    setStatus(null);
    try {
      const backup = await createBackup("manual");
      setStatus({ ok: true, message: `Backup created: ${backup.fileName}` });
      await refresh();
    } catch (err) {
      setStatus({
        ok: false,
        message: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Backups"
        subtitle={`${backups.length} backup${backups.length !== 1 ? "s" : ""} available`}
        actions={
          <button
            className="btn-secondary text-xs px-2 py-1"
            onClick={() => void refresh()}
            title="Refresh backups"
          >
            ↻
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto">
        <BackupList
          backups={backups}
          isLoading={isLoading}
          error={error}
          onRestore={(b) => void handleRestore(b)}
          onDelete={(b) => void handleDelete(b)}
        />
      </div>

      {status && (
        <div
          className={`mx-3 mb-2 p-2 rounded-lg text-xs ${
            status.ok
              ? "bg-green-900/40 text-green-400"
              : "bg-red-900/40 text-red-400"
          }`}
        >
          {status.message}
        </div>
      )}

      <ActionBar>
        <button
          className="btn-secondary text-sm flex-1"
          onClick={() => void handleCreateBackup()}
          disabled={busy}
        >
          {busy ? "Working…" : "Create Manual Backup"}
        </button>
      </ActionBar>
    </div>
  );
}
