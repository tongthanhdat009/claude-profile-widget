use anyhow::Context;
use chrono::Utc;
use std::path::PathBuf;
use tauri::command;
use tauri::Manager;

use crate::models::profile::{Profile, ProfileWithMeta};
use crate::services::{file_service, settings_service};

/// Resolves the profiles directory relative to the executable (or current dir in dev).
fn profiles_dir(app: &tauri::AppHandle) -> PathBuf {
    app.path()
        .resource_dir()
        .unwrap_or_else(|_| PathBuf::from("."))
        .join("profiles")
}

/// Lists all profiles in the profiles/ directory.
#[command]
pub async fn list_profiles(app: tauri::AppHandle) -> Result<Vec<ProfileWithMeta>, String> {
    let dir = profiles_dir(&app);
    let files = file_service::list_files_with_ext(&dir, "json")
        .map_err(|e| e.to_string())?;

    let settings_path = settings_service::resolve_settings_path()
        .map_err(|e| e.to_string())?;
    let current = settings_service::read_settings(&settings_path)
        .unwrap_or_default();

    let now = Utc::now().to_rfc3339();

    let profiles: Vec<ProfileWithMeta> = files
        .into_iter()
        .filter_map(|path| {
            let content = file_service::read_file(&path).ok()?;
            let profile: Profile = serde_json::from_str(&content).ok()?;
            let file_name = path
                .file_name()
                .map(|n| n.to_string_lossy().to_string())
                .unwrap_or_default();

            // Determine if this profile is currently active by comparing settings
            let profile_json = serde_json::to_value(&profile.settings).ok()?;
            let current_json = serde_json::to_value(&current).ok()?;
            let is_active = profile_json == current_json;

            Some(ProfileWithMeta {
                profile,
                file_name,
                file_path: path.to_string_lossy().to_string(),
                is_active,
                loaded_at: now.clone(),
            })
        })
        .collect();

    Ok(profiles)
}

/// Returns a single profile by file name.
#[command]
pub async fn get_profile(
    app: tauri::AppHandle,
    file_name: String,
) -> Result<ProfileWithMeta, String> {
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
        is_active: profile_json == current_json,
        file_name,
        file_path: path.to_string_lossy().to_string(),
        loaded_at: Utc::now().to_rfc3339(),
        profile,
    })
}
