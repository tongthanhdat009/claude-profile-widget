use std::path::PathBuf;
use tauri::command;
use tauri::Manager;

use crate::models::backup::Backup;
use crate::services::{backup_service, settings_service};

fn backups_dir(app: &tauri::AppHandle) -> PathBuf {
    app.path()
        .resource_dir()
        .unwrap_or_else(|_| PathBuf::from("."))
        .join("backups")
}

/// Lists all available backups (newest first).
#[command]
pub async fn list_backups(app: tauri::AppHandle) -> Result<Vec<Backup>, String> {
    let dir = backups_dir(&app);
    backup_service::list_backups(&dir).map_err(|e| e.to_string())
}

/// Restores a backup by its ID.
#[command]
pub async fn restore_backup(app: tauri::AppHandle, backup_id: String) -> Result<(), String> {
    let dir = backups_dir(&app);
    let backup_path = backup_service::find_backup_by_id(&dir, &backup_id)
        .map_err(|e| e.to_string())?;
    let settings_path =
        settings_service::resolve_settings_path().map_err(|e| e.to_string())?;

    // Back up current settings before restoring
    if settings_path.exists() {
        backup_service::create_backup(&settings_path, &dir, None, Some("pre-restore"))
            .map_err(|e| format!("Pre-restore backup failed: {}", e))?;
    }

    backup_service::restore_backup(&backup_path, &settings_path).map_err(|e| e.to_string())
}

/// Deletes a backup by its ID.
#[command]
pub async fn delete_backup(app: tauri::AppHandle, backup_id: String) -> Result<(), String> {
    let dir = backups_dir(&app);
    let backup_path = backup_service::find_backup_by_id(&dir, &backup_id)
        .map_err(|e| e.to_string())?;
    backup_service::delete_backup(&backup_path).map_err(|e| e.to_string())
}

/// Creates a manual backup of the current settings.
#[command]
pub async fn create_backup(
    app: tauri::AppHandle,
    label: Option<String>,
) -> Result<Backup, String> {
    let settings_path =
        settings_service::resolve_settings_path().map_err(|e| e.to_string())?;
    if !settings_path.exists() {
        return Err("Settings file does not exist; nothing to back up.".to_string());
    }
    let dir = backups_dir(&app);
    backup_service::create_backup(&settings_path, &dir, None, label.as_deref())
        .map_err(|e| e.to_string())
}
