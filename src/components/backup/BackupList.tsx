import type { Backup } from "../../types/backup";
import { EmptyState } from "../ui/EmptyState";
import { formatTimestamp } from "../../utils/timestamp";

interface BackupListProps {
  backups: Backup[];
  isLoading: boolean;
  error: string | null;
  onRestore: (backup: Backup) => void;
  onDelete: (backup: Backup) => void;
}

export function BackupList({
  backups,
  isLoading,
  error,
  onRestore,
  onDelete,
}: BackupListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <span className="text-sm text-gray-500 animate-pulse">
          Loading backups…
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon="⚠️"
        title="Failed to load backups"
        description={error}
      />
    );
  }

  if (backups.length === 0) {
    return (
      <EmptyState
        icon="🗂️"
        title="No backups yet"
        description="Backups are created automatically when you apply a profile."
      />
    );
  }

  return (
    <div className="flex flex-col gap-2 p-3">
      {backups.map((backup) => (
        <div
          key={backup.id}
          className="card flex items-start justify-between gap-2"
        >
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-200 truncate">
              {backup.fileName}
            </p>
            {backup.profileName && (
              <p className="text-xs text-gray-500 mt-0.5">
                Profile: {backup.profileName}
              </p>
            )}
            <p className="text-xs text-gray-600 mt-0.5">
              {formatTimestamp(backup.createdAt)} &middot;{" "}
              {(backup.sizeBytes / 1024).toFixed(1)} KB
            </p>
          </div>
          <div className="flex gap-1 shrink-0">
            <button
              className="btn-secondary text-xs px-2 py-1"
              onClick={() => onRestore(backup)}
              title="Restore this backup"
            >
              Restore
            </button>
            <button
              className="btn-danger text-xs px-2 py-1"
              onClick={() => onDelete(backup)}
              title="Delete this backup"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
