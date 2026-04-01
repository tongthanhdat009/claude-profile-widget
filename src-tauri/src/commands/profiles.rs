use anyhow::Context;
use chrono::Utc;
use std::path::PathBuf;
use tauri::command;
use tauri::Manager;

use crate::models::profile::{Profile, ProfileWithMeta, ProfileSource};
use crate::services::{file_service, settings_service, profile_db_service};

/// Resolves the profiles directory relative to the executable (or current dir in dev).
fn profiles_dir(app: &tauri::AppHandle) -> PathBuf {
    app.path()
        .resource_dir()
        .unwrap_or_else(|_| PathBuf::from("."))
        .join("profiles")
}

/// Lists all profiles (both bundled JSON files and custom SQLite profiles).
#[command]
pub async fn list_profiles(app: tauri::AppHandle) -> Result<Vec<ProfileWithMeta>, String> {
    let dir = profiles_dir(&app);
    let settings_path = settings_service::resolve_settings_path()
        .map_err(|e| e.to_string())?;
    let current = settings_service::read_settings(&settings_path)
        .unwrap_or_default();
    let now = Utc::now().to_rfc3339();

    // Load bundled profiles from JSON files
    let bundled_profiles: Vec<ProfileWithMeta> = file_service::list_files_with_ext(&dir, "json")
        .map_err(|e| e.to_string())?
        .into_iter()
        .filter_map(|path| {
            let content = file_service::read_file(&path).ok()?;
            let profile: Profile = serde_json::from_str(&content).ok()?;
            let file_name = path
                .file_name()
                .map(|n| n.to_string_lossy().to_string())
                .unwrap_or_default();

            let profile_json = serde_json::to_value(&profile.settings).ok()?;
            let current_json = serde_json::to_value(&current).ok()?;
            let is_active = profile_json == current_json;

            Some(ProfileWithMeta {
                profile,
                id: None,
                file_name,
                file_path: path.to_string_lossy().to_string(),
                is_active,
                loaded_at: now.clone(),
                source: ProfileSource::Bundled,
            })
        })
        .collect();

    // Load custom profiles from SQLite
    let db_path = profile_db_service::db_path(&app).map_err(|e| e.to_string())?;
    let custom_profiles: Vec<ProfileWithMeta> = if let Ok(conn) = profile_db_service::init_db(&db_path) {
        profile_db_service::load_profiles_with_ids(&conn)
            .map_err(|e| e.to_string())?
            .into_iter()
            .map(|(id, profile)| {
                let profile_json = serde_json::to_value(&profile.settings).unwrap_or_default();
                let current_json = serde_json::to_value(&current).unwrap_or_default();
                let is_active = profile_json == current_json;

                ProfileWithMeta {
                    profile: profile.clone(),
                    id: Some(id.clone()),
                    file_name: format!("{}.json", profile.name),
                    file_path: format!("sqlite://{}", id),
                    is_active,
                    loaded_at: now.clone(),
                    source: ProfileSource::Custom,
                }
            })
            .collect()
    } else {
        Vec::new()
    };

    // Combine and return all profiles
    Ok(bundled_profiles.into_iter().chain(custom_profiles.into_iter()).collect())
}

/// Returns a single profile by file name (for bundled) or id (for custom).
#[command]
pub async fn get_profile(
    app: tauri::AppHandle,
    file_name: String,
) -> Result<ProfileWithMeta, String> {
    // Check if it's a custom profile (sqlite:// prefix or ends with custom identifier)
    if file_name.starts_with("sqlite://") {
        let id = file_name.replace("sqlite://", "");
        let db_path = profile_db_service::db_path(&app).map_err(|e| e.to_string())?;
        let conn = profile_db_service::init_db(&db_path).map_err(|e| e.to_string())?;

        let profile = profile_db_service::get_profile(&conn, &id)
            .map_err(|e| e.to_string())?
            .context("Profile not found")
            .map_err(|e| e.to_string())?;

        let settings_path = settings_service::resolve_settings_path().map_err(|e| e.to_string())?;
        let current = settings_service::read_settings(&settings_path).unwrap_or_default();
        let profile_json = serde_json::to_value(&profile.settings).unwrap_or_default();
        let current_json = serde_json::to_value(&current).unwrap_or_default();

        return Ok(ProfileWithMeta {
            id: Some(id.clone()),
            file_name: format!("{}.json", profile.name),
            file_path: format!("sqlite://{}", id),
            is_active: profile_json == current_json,
            loaded_at: Utc::now().to_rfc3339(),
            profile,
            source: ProfileSource::Custom,
        });
    }

    // Bundled profile from JSON file
    let path = profiles_dir(&app).join(&file_name);
    let content = file_service::read_file(&path)
        .with_context(|| format!("Profile not found: {}", file_name))
        .map_err(|e| e.to_string())?;
    let profile: Profile = serde_json::from_str(&content)
        .context("Failed to parse profile")
        .map_err(|e| e.to_string())?;

    let settings_path = settings_service::resolve_settings_path()
        .map_err(|e| e.to_string())?;
    let current = settings_service::read_settings(&settings_path)
        .unwrap_or_default();
    let profile_json = serde_json::to_value(&profile.settings).unwrap_or_default();
    let current_json = serde_json::to_value(&current).unwrap_or_default();

    Ok(ProfileWithMeta {
        id: None,
        is_active: profile_json == current_json,
        file_name,
        file_path: path.to_string_lossy().to_string(),
        loaded_at: Utc::now().to_rfc3339(),
        profile,
        source: ProfileSource::Bundled,
    })
}

/// Creates a new custom profile in SQLite.
#[command]
pub async fn create_profile(
    app: tauri::AppHandle,
    profile: Profile,
) -> Result<String, String> {
    let db_path = profile_db_service::db_path(&app).map_err(|e| e.to_string())?;
    let conn = profile_db_service::init_db(&db_path).map_err(|e| e.to_string())?;

    profile_db_service::save_profile(&conn, &profile)
        .map_err(|e| e.to_string())
}

/// Updates an existing custom profile in SQLite.
#[command]
pub async fn update_profile(
    app: tauri::AppHandle,
    id: String,
    profile: Profile,
) -> Result<(), String> {
    let db_path = profile_db_service::db_path(&app).map_err(|e| e.to_string())?;
    let conn = profile_db_service::init_db(&db_path).map_err(|e| e.to_string())?;

    // Delete old and save new (simple approach for update)
    profile_db_service::delete_profile(&conn, &id)
        .map_err(|e| e.to_string())?;
    profile_db_service::save_profile(&conn, &profile)
        .map_err(|e| e.to_string())?;

    Ok(())
}

/// Deletes a custom profile from SQLite.
#[command]
pub async fn delete_custom_profile(
    app: tauri::AppHandle,
    id: String,
) -> Result<bool, String> {
    let db_path = profile_db_service::db_path(&app).map_err(|e| e.to_string())?;
    let conn = profile_db_service::init_db(&db_path).map_err(|e| e.to_string())?;

    profile_db_service::delete_profile(&conn, &id)
        .map_err(|e| e.to_string())
}

/// Applies a custom profile (from SQLite) to settings.json.
/// Only merges the env vars from the profile into existing settings.
#[command]
pub async fn apply_custom_profile(
    app: tauri::AppHandle,
    id: String,
) -> Result<String, String> {
    let db_path = profile_db_service::db_path(&app).map_err(|e| e.to_string())?;
    let conn = profile_db_service::init_db(&db_path).map_err(|e| e.to_string())?;

    let profile = profile_db_service::get_profile(&conn, &id)
        .map_err(|e| e.to_string())?
        .context("Profile not found")
        .map_err(|e| e.to_string())?;

    let settings_path = settings_service::resolve_settings_path().map_err(|e| e.to_string())?;

    // Backup current settings
    let backups_dir = app.path()
        .resource_dir()
        .unwrap_or_else(|_| PathBuf::from("."))
        .join("backups");

    let backup_path = if settings_path.exists() {
        use crate::services::backup_service;
        let backup = backup_service::create_backup(
            &settings_path,
            &backups_dir,
            Some(&profile.name),
            None,
        ).map_err(|e| format!("Backup failed: {}", e))?;
        backup.file_path
    } else {
        String::from("(no existing settings to back up)")
    };

    // Read current settings and merge env vars
    let mut current_settings = settings_service::read_settings(&settings_path)
        .unwrap_or_default();

    // Merge env vars from profile into current settings
    if let Some(ref mut current_env) = current_settings.env {
        for (key, value) in profile.settings.env.iter() {
            current_env.insert(key.clone(), value.clone());
        }
    } else {
        current_settings.env = Some(profile.settings.env.clone());
    }

    // Write merged settings to settings.json
    let settings_json = serde_json::to_string_pretty(&current_settings)
        .map_err(|e| format!("Failed to serialize settings: {}", e))?;

    file_service::write_file(&settings_path, &settings_json)
        .map_err(|e| format!("Failed to write settings: {}", e))?;

    Ok(backup_path)
}
