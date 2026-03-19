use std::path::PathBuf;
use tauri::command;
use tauri::Manager;

use crate::models::settings::ClaudeSettings;
use crate::models::profile::Profile;
use crate::services::{backup_service, file_service, settings_service};

fn backups_dir(app: &tauri::AppHandle) -> PathBuf {
    app.path()
        .resource_dir()
        .unwrap_or_else(|_| PathBuf::from("."))
        .join("backups")
}

fn profiles_dir(app: &tauri::AppHandle) -> PathBuf {
    app.path()
        .resource_dir()
        .unwrap_or_else(|_| PathBuf::from("."))
        .join("profiles")
}

/// Returns the resolved path to the Claude Code settings.json.
#[command]
pub async fn get_settings_path() -> Result<String, String> {
    settings_service::resolve_settings_path()
        .map(|p| p.to_string_lossy().to_string())
        .map_err(|e| e.to_string())
}

/// Reads the current Claude Code settings.
#[command]
pub async fn read_settings() -> Result<ClaudeSettings, String> {
    let path = settings_service::resolve_settings_path().map_err(|e| e.to_string())?;
    settings_service::read_settings(&path).map_err(|e| e.to_string())
}

/// Applies a profile: backs up current settings, then overwrites with the selected profile.
/// Returns the path of the backup file created.
#[command]
pub async fn apply_profile(
    app: tauri::AppHandle,
    profile_file_name: String,
) -> Result<String, String> {
    let settings_path =
        settings_service::resolve_settings_path().map_err(|e| e.to_string())?;
    let profiles_dir = profiles_dir(&app);
    let backups_dir = backups_dir(&app);

    // Load the profile to get its name
    let profile_path = profiles_dir.join(&profile_file_name);
    let content = file_service::read_file(&profile_path)
        .map_err(|e| format!("Cannot read profile '{}': {}", profile_file_name, e))?;
    let profile: Profile =
        serde_json::from_str(&content).map_err(|e| format!("Invalid profile JSON: {}", e))?;

    // Back up current settings if they exist
    let backup_path = if settings_path.exists() {
        let backup = backup_service::create_backup(
            &settings_path,
            &backups_dir,
            Some(&profile.name),
            None,
        )
        .map_err(|e| format!("Backup failed: {}", e))?;

        // Prune old backups
        backup_service::prune_backups(
            &backups_dir,
            settings_service::max_backups(),
        )
        .ok();

        backup.file_path
    } else {
        String::from("(no existing settings to back up)")
    };

    // Write the profile settings to the settings.json
    let settings_json = serde_json::to_string_pretty(&profile.settings)
        .map_err(|e| format!("Failed to serialize profile: {}", e))?;

    file_service::write_file(&settings_path, &settings_json)
        .map_err(|e| format!("Failed to write settings: {}", e))?;

    Ok(backup_path)
}

/// Utility: checks if a file exists.
#[command]
pub async fn file_exists(path: String) -> bool {
    std::path::Path::new(&path).exists()
}

/// Utility: reads a file and returns its content.
#[command]
pub async fn read_file(path: String) -> Result<String, String> {
    file_service::read_file(std::path::Path::new(&path)).map_err(|e| e.to_string())
}

/// Utility: writes content to a file.
#[command]
pub async fn write_file(path: String, content: String) -> Result<(), String> {
    file_service::write_file(std::path::Path::new(&path), &content)
        .map_err(|e| e.to_string())
}

/// Utility: lists files in a directory.
#[command]
pub async fn list_directory(dir_path: String) -> Result<Vec<String>, String> {
    let files = file_service::list_files(std::path::Path::new(&dir_path))
        .map_err(|e| e.to_string())?;
    Ok(files
        .into_iter()
        .map(|p| p.to_string_lossy().to_string())
        .collect())
}
