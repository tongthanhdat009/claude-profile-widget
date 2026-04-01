use anyhow::{Context, Result};
use rusqlite::{Connection, params};
use std::path::PathBuf;
use std::fs;
use chrono::Utc;
use uuid::Uuid;
use tauri::Manager;

use crate::models::profile::{Profile, ProfileSettings, ProfilePermissions};

/// Returns the path to the SQLite database file.
pub fn db_path(app: &tauri::AppHandle) -> Result<PathBuf> {
    let app_data = app.path().app_data_dir()
        .context("Could not determine app data directory")?;
    Ok(app_data.join("profiles.db"))
}

/// Initializes the database and creates the profiles table.
pub fn init_db(db_path: &PathBuf) -> Result<Connection> {
    // Create parent directory if it doesn't exist
    if let Some(parent) = db_path.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent)
                .with_context(|| format!("Failed to create directory: {}", parent.display()))?;
        }
    }

    let conn = Connection::open(db_path)
        .with_context(|| format!("Failed to open database at {}", db_path.display()))?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS profiles (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            display_name TEXT NOT NULL,
            description TEXT,
            version TEXT DEFAULT '1.0.0',
            auto_updater_enabled INTEGER DEFAULT 1,
            include_co_authored_by INTEGER DEFAULT 1,
            preferred_notif_channel TEXT DEFAULT '',
            has_completed_onboarding INTEGER DEFAULT 0,
            theme TEXT DEFAULT '',
            verbose INTEGER DEFAULT 0,
            permissions_allow TEXT DEFAULT '[]',
            permissions_deny TEXT DEFAULT '[]',
            env_json TEXT DEFAULT '{}',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )",
        [],
    ).context("Failed to create profiles table")?;

    Ok(conn)
}

/// Saves a profile to the database (insert or update).
pub fn save_profile(conn: &Connection, profile: &Profile) -> Result<String> {
    let now = Utc::now().to_rfc3339();
    let id = Uuid::new_v4().to_string();

    // Serialize permissions
    let permissions_allow = serde_json::to_string(&profile.settings.permissions.allow)
        .context("Failed to serialize permissions.allow")?;
    let permissions_deny = serde_json::to_string(&profile.settings.permissions.deny)
        .context("Failed to serialize permissions.deny")?;
    let env_json = serde_json::to_string(&profile.settings.env)
        .context("Failed to serialize env")?;

    // Try insert first, update on conflict
    conn.execute(
        "INSERT INTO profiles (
            id, name, display_name, description, version,
            auto_updater_enabled, include_co_authored_by, preferred_notif_channel,
            has_completed_onboarding, theme, verbose,
            permissions_allow, permissions_deny, env_json,
            created_at, updated_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16)
        ON CONFLICT(name) DO UPDATE SET
            display_name = ?3,
            description = ?4,
            version = ?5,
            auto_updater_enabled = ?6,
            include_co_authored_by = ?7,
            preferred_notif_channel = ?8,
            has_completed_onboarding = ?9,
            theme = ?10,
            verbose = ?11,
            permissions_allow = ?12,
            permissions_deny = ?13,
            env_json = ?14,
            updated_at = ?16",
        params![
            id,
            profile.name,
            profile.display_name,
            profile.description,
            profile.version,
            profile.settings.auto_updater_enabled as i32,
            profile.settings.include_co_authored_by as i32,
            profile.settings.preferred_notif_channel,
            profile.settings.has_completed_onboarding as i32,
            profile.settings.theme,
            profile.settings.verbose as i32,
            permissions_allow,
            permissions_deny,
            env_json,
            now,
            now
        ],
    ).context("Failed to save profile")?;

    // Get the actual ID (either new or existing)
    let actual_id: String = conn.query_row(
        "SELECT id FROM profiles WHERE name = ?1",
        params![profile.name],
        |row| row.get(0)
    ).context("Failed to get profile ID")?;

    Ok(actual_id)
}

/// Loads all profiles from the database with their IDs.
pub fn load_profiles_with_ids(conn: &Connection) -> Result<Vec<(String, Profile)>> {
    let mut stmt = conn.prepare(
        "SELECT id, name, display_name, description, version,
                auto_updater_enabled, include_co_authored_by, preferred_notif_channel,
                has_completed_onboarding, theme, verbose,
                permissions_allow, permissions_deny, env_json
         FROM profiles ORDER BY created_at DESC"
    ).context("Failed to prepare profile query")?;

    let profiles = stmt.query_map([], |row| {
        let id: String = row.get(0)?;
        let name: String = row.get(1)?;
        let display_name: String = row.get(2)?;
        let description: String = row.get(3)?;
        let version: String = row.get(4)?;
        let auto_updater_enabled: i32 = row.get(5)?;
        let include_co_authored_by: i32 = row.get(6)?;
        let preferred_notif_channel: String = row.get(7)?;
        let has_completed_onboarding: i32 = row.get(8)?;
        let theme: String = row.get(9)?;
        let verbose: i32 = row.get(10)?;
        let permissions_allow_json: String = row.get(11)?;
        let permissions_deny_json: String = row.get(12)?;
        let env_json: String = row.get(13)?;

        let permissions_allow: Vec<String> = serde_json::from_str(&permissions_allow_json)
            .unwrap_or_default();
        let permissions_deny: Vec<String> = serde_json::from_str(&permissions_deny_json)
            .unwrap_or_default();
        let env: std::collections::HashMap<String, String> = serde_json::from_str(&env_json)
            .unwrap_or_default();

        Ok((id, Profile {
            name,
            display_name,
            description,
            version,
            settings: ProfileSettings {
                auto_updater_enabled: auto_updater_enabled != 0,
                include_co_authored_by: include_co_authored_by != 0,
                preferred_notif_channel,
                has_completed_onboarding: has_completed_onboarding != 0,
                theme,
                verbose: verbose != 0,
                permissions: ProfilePermissions {
                    allow: permissions_allow,
                    deny: permissions_deny,
                },
                env,
            },
        }))
    }).context("Failed to query profiles")?;

    profiles.collect::<Result<Vec<_>, _>>()
        .context("Failed to collect profiles")
}

/// Loads all profiles from the database (without IDs for backwards compat).
pub fn load_profiles(conn: &Connection) -> Result<Vec<Profile>> {
    let profiles_with_ids = load_profiles_with_ids(conn)?;
    Ok(profiles_with_ids.into_iter().map(|(_, p)| p).collect())
}

/// Loads a single profile by ID.
pub fn get_profile(conn: &Connection, id: &str) -> Result<Option<Profile>> {
    let mut stmt = conn.prepare(
        "SELECT name, display_name, description, version,
                auto_updater_enabled, include_co_authored_by, preferred_notif_channel,
                has_completed_onboarding, theme, verbose,
                permissions_allow, permissions_deny, env_json
         FROM profiles WHERE id = ?1"
    ).context("Failed to prepare profile query")?;

    let result = stmt.query_row(params![id], |row| {
        let name: String = row.get(0)?;
        let display_name: String = row.get(1)?;
        let description: String = row.get(2)?;
        let version: String = row.get(3)?;
        let auto_updater_enabled: i32 = row.get(4)?;
        let include_co_authored_by: i32 = row.get(5)?;
        let preferred_notif_channel: String = row.get(6)?;
        let has_completed_onboarding: i32 = row.get(7)?;
        let theme: String = row.get(8)?;
        let verbose: i32 = row.get(9)?;
        let permissions_allow_json: String = row.get(10)?;
        let permissions_deny_json: String = row.get(11)?;
        let env_json: String = row.get(12)?;

        let permissions_allow: Vec<String> = serde_json::from_str(&permissions_allow_json)
            .unwrap_or_default();
        let permissions_deny: Vec<String> = serde_json::from_str(&permissions_deny_json)
            .unwrap_or_default();
        let env: std::collections::HashMap<String, String> = serde_json::from_str(&env_json)
            .unwrap_or_default();

        Ok(Profile {
            name,
            display_name,
            description,
            version,
            settings: ProfileSettings {
                auto_updater_enabled: auto_updater_enabled != 0,
                include_co_authored_by: include_co_authored_by != 0,
                preferred_notif_channel,
                has_completed_onboarding: has_completed_onboarding != 0,
                theme,
                verbose: verbose != 0,
                permissions: ProfilePermissions {
                    allow: permissions_allow,
                    deny: permissions_deny,
                },
                env,
            },
        })
    });

    match result {
        Ok(profile) => Ok(Some(profile)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(e).context("Failed to get profile"),
    }
}

/// Deletes a profile by ID.
pub fn delete_profile(conn: &Connection, id: &str) -> Result<bool> {
    let rows_deleted = conn.execute(
        "DELETE FROM profiles WHERE id = ?1",
        params![id]
    ).context("Failed to delete profile")?;

    Ok(rows_deleted > 0)
}

/// Gets profile ID by name.
pub fn get_profile_id(conn: &Connection, name: &str) -> Result<Option<String>> {
    let result = conn.query_row(
        "SELECT id FROM profiles WHERE name = ?1",
        params![name],
        |row| row.get::<_, String>(0)
    );

    match result {
        Ok(id) => Ok(Some(id)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(e).context("Failed to get profile ID"),
    }
}