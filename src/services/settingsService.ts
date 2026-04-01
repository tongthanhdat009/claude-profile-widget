import type { ClaudeSettings } from "../types/settings";
import { invokeCommand } from "./tauriBridge";

/**
 * Reads the current Claude Code settings.json content.
 */
export async function readSettings(): Promise<ClaudeSettings> {
  return invokeCommand<ClaudeSettings>("read_settings");
}

/**
 * Returns the resolved path to the Claude Code settings.json.
 */
export async function getSettingsPath(): Promise<string> {
  return invokeCommand<string>("get_settings_path");
}

/**
 * Applies a profile by writing its settings to the Claude Code settings.json.
 * Automatically backs up the existing settings before overwriting.
 */
export async function applyProfile(profileFileName: string): Promise<string> {
  return invokeCommand<string>("apply_profile", { profileFileName });
}
