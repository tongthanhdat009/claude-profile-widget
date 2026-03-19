import { invoke } from "@tauri-apps/api/core";
import type { Backup } from "../types/backup";

/**
 * Lists all available backups sorted by creation time (newest first).
 */
export async function listBackups(): Promise<Backup[]> {
  return invoke<Backup[]>("list_backups");
}

/**
 * Restores a backup by its ID, overwriting the current Claude Code settings.json.
 */
export async function restoreBackup(backupId: string): Promise<void> {
  return invoke<void>("restore_backup", { backupId });
}

/**
 * Deletes a specific backup by its ID.
 */
export async function deleteBackup(backupId: string): Promise<void> {
  return invoke<void>("delete_backup", { backupId });
}

/**
 * Creates a manual backup of the current Claude Code settings.json.
 */
export async function createBackup(label?: string): Promise<Backup> {
  return invoke<Backup>("create_backup", { label: label ?? null });
}
