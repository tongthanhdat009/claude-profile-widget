use anyhow::Result;
use chrono::Utc;
use std::path::{Path, PathBuf};
use uuid::Uuid;

use crate::models::backup::Backup;
use crate::services::file_service;

/// Returns the size of a file in bytes.
fn file_size(path: &Path) -> u64 {
    std::fs::metadata(path).map(|m| m.len()).unwrap_or(0)
}

/// Parses backup metadata from a file name.
///
/// File name format: `backup_<profile-slug>_<timestamp>_<short-id>.json`
/// Timestamp format in filename: `YYYY-MM-DD--HH-MM-SS`
///   (double-dash separates date and time; single-dashes replace colons in time)
/// Example: `backup_default_2024-01-15--10-30-00_a1b2c3d4.json`
///
/// The timestamp is reconstructed to a display string for listing purposes;
/// the authoritative `created_at` ISO 8601 time is stored in the `Backup` struct
/// returned by `create_backup`.
fn parse_backup_meta(path: &Path) -> Option<Backup> {
    let file_name = path.file_name()?.to_string_lossy().to_string();
    if !file_name.starts_with("backup_") || !file_name.ends_with(".json") {
        return None;
    }
    let inner = file_name
        .strip_prefix("backup_")?
        .strip_suffix(".json")?;
    // Split into exactly 3 parts: profile, timestamp, id
    let parts: Vec<&str> = inner.splitn(3, '_').collect();
    let (profile_raw, timestamp, id) = match parts.as_slice() {
        [p, t, i] => (*p, *t, *i),
        _ => return None,
    };

    let profile_name = if profile_raw == "unknown" {
        None
    } else {
        Some(profile_raw.to_string())
    };

    // Convert filename timestamp `YYYY-MM-DD--HH-MM-SS` → `YYYY-MM-DDTHH:MM:SS`
    // by replacing the double-dash separator with 'T' and remaining dashes with ':'
    let created_at = timestamp.replacen("--", "T", 1).replace('-', ":");

    Some(Backup {
        id: id.to_string(),
        file_name: file_name.clone(),
        file_path: path.to_string_lossy().to_string(),
        created_at,
        profile_name,
        size_bytes: file_size(path),
    })
}

/// Lists all backups in `backups_dir` sorted newest first.
pub fn list_backups(backups_dir: &Path) -> Result<Vec<Backup>> {
    let files = file_service::list_files_with_ext(backups_dir, "json")?;
    let mut backups: Vec<Backup> = files
        .iter()
        .filter_map(|p| parse_backup_meta(p))
        .collect();
    // Sort newest first
    backups.sort_by(|a, b| b.created_at.cmp(&a.created_at));
    Ok(backups)
}

/// Creates a backup of `settings_path` in `backups_dir`.
/// Returns the created `Backup`.
pub fn create_backup(
    settings_path: &Path,
    backups_dir: &Path,
    profile_name: Option<&str>,
    label: Option<&str>,
) -> Result<Backup> {
    let now = Utc::now();
    let timestamp = now.format("%Y-%m-%d--%H-%M-%S").to_string();
    let profile_slug = label
        .or(profile_name)
        .unwrap_or("unknown")
        .replace(' ', "-");
    let id = Uuid::new_v4()
        .to_string()
        .split('-')
        .next()
        .unwrap_or("xxxx")
        .to_string();
    let file_name = format!("backup_{profile_slug}_{timestamp}_{id}.json");
    let dst = backups_dir.join(&file_name);

    let size_bytes = file_service::copy_file(settings_path, &dst)?;

    Ok(Backup {
        id,
        file_name,
        file_path: dst.to_string_lossy().to_string(),
        created_at: now.to_rfc3339(),
        profile_name: profile_name.map(String::from),
        size_bytes,
    })
}

/// Restores a backup to `settings_path`.
pub fn restore_backup(backup_path: &Path, settings_path: &Path) -> Result<()> {
    file_service::copy_file(backup_path, settings_path)?;
    Ok(())
}

/// Deletes a backup file.
pub fn delete_backup(backup_path: &Path) -> Result<()> {
    file_service::delete_file(backup_path)
}

/// Finds a backup by its ID in `backups_dir`.
pub fn find_backup_by_id(backups_dir: &Path, id: &str) -> Result<PathBuf> {
    let files = file_service::list_files_with_ext(backups_dir, "json")?;
    for path in &files {
        if let Some(file_name) = path.file_name() {
            let name = file_name.to_string_lossy();
            if name.contains(id) {
                return Ok(path.clone());
            }
        }
    }
    anyhow::bail!("Backup with ID '{}' not found", id)
}

/// Prunes old backups, keeping only the newest `max_count` backups.
pub fn prune_backups(backups_dir: &Path, max_count: usize) -> Result<()> {
    let mut backups = list_backups(backups_dir)?;
    if backups.len() <= max_count {
        return Ok(());
    }
    // Remove oldest backups (they are sorted newest-first, so drain from the end)
    backups.drain(..max_count);
    for backup in backups {
        let path = PathBuf::from(&backup.file_path);
        file_service::delete_file(&path).ok();
    }
    Ok(())
}
