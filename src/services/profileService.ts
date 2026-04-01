import type { ProfileWithMeta, Profile } from "../types/profile";
import { invokeCommand } from "./tauriBridge";

/**
 * Load all profiles (both bundled and custom).
 */
export async function loadProfiles(): Promise<ProfileWithMeta[]> {
  return invokeCommand<ProfileWithMeta[]>("list_profiles");
}

/**
 * Load a single profile by file name or id.
 */
export async function loadProfile(fileName: string): Promise<ProfileWithMeta> {
  return invokeCommand<ProfileWithMeta>("get_profile", { fileName });
}

/**
 * Create a new custom profile in SQLite.
 * Returns the profile ID.
 */
export async function createProfile(profile: Profile): Promise<string> {
  return invokeCommand<string>("create_profile", { profile });
}

/**
 * Update an existing custom profile in SQLite.
 */
export async function updateProfile(id: string, profile: Profile): Promise<void> {
  return invokeCommand<void>("update_profile", { id, profile });
}

/**
 * Delete a custom profile from SQLite.
 */
export async function deleteProfile(id: string): Promise<boolean> {
  return invokeCommand<boolean>("delete_custom_profile", { id });
}

/**
 * Apply a custom profile (from SQLite) to settings.json.
 * Returns the backup path.
 */
export async function applyCustomProfile(id: string): Promise<string> {
  return invokeCommand<string>("apply_custom_profile", { id });
}
