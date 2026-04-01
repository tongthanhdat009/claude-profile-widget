// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod models;
mod services;

use commands::{
    backups::{create_backup, delete_backup, list_backups, restore_backup},
    profiles::{create_profile, delete_custom_profile, get_profile, list_profiles, update_profile, apply_custom_profile},
    settings::{
        apply_profile, file_exists, get_settings_path, list_directory, read_file, read_settings,
        write_file,
    },
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            // Profile commands
            list_profiles,
            get_profile,
            create_profile,
            update_profile,
            delete_custom_profile,
            apply_custom_profile,
            // Settings commands
            get_settings_path,
            read_settings,
            apply_profile,
            // File utility commands
            file_exists,
            read_file,
            write_file,
            list_directory,
            // Backup commands
            list_backups,
            restore_backup,
            delete_backup,
            create_backup,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
