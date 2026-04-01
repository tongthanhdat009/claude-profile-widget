use anyhow::{Context, Result};
use std::path::{Path, PathBuf};

use crate::models::settings::ClaudeSettings;
use crate::services::file_service;

const MAX_BACKUPS: usize = 20;

/// Returns the path to the Claude Code settings.json file.
/// All platforms: `~/.claude/settings.json`
pub fn resolve_settings_path() -> Result<PathBuf> {
    let home = dirs::home_dir().context("Could not determine home directory")?;
    Ok(home.join(".claude").join("settings.json"))
}

/// Reads and parses the Claude Code settings.json.
pub fn read_settings(settings_path: &Path) -> Result<ClaudeSettings> {
    if !settings_path.exists() {
        return Ok(ClaudeSettings::default());
    }
    let content = file_service::read_file(settings_path)?;
    serde_json::from_str(&content)
        .with_context(|| format!("Failed to parse settings: {}", settings_path.display()))
}

/// Writes settings to the Claude Code settings.json.
pub fn write_settings(settings_path: &Path, settings: &ClaudeSettings) -> Result<()> {
    let content = serde_json::to_string_pretty(settings)
        .context("Failed to serialize settings")?;
    file_service::write_file(settings_path, &content)
}

/// Returns the allowed backup count.
pub fn max_backups() -> usize {
    MAX_BACKUPS
}
