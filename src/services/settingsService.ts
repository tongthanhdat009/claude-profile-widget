import { invoke } from "@tauri-apps/api/core";
import type { ClaudeSettings } from "../types/settings";

/**
 * Reads the current Claude Code settings.json content.
 */
export async function readSettings(): Promise<ClaudeSettings> {
  return invoke<ClaudeSettings>("read_settings");
}

/**
 * Returns the resolved path to the Claude Code settings.json.
 */
export async function getSettingsPath(): Promise<string> {
  return invoke<string>("get_settings_path");
}

/**
 * Applies a profile by writing its settings to the Claude Code settings.json.
 * Automatically backs up the existing settings before overwriting.
 */
export async function applyProfile(profileFileName: string): Promise<string> {
  return invoke<string>("apply_profile", { profileFileName });
}
