import { invoke } from "@tauri-apps/api/core";
import type { ProfileWithMeta } from "../types/profile";

/**
 * Load all profiles from the profiles directory.
 */
export async function loadProfiles(): Promise<ProfileWithMeta[]> {
  return invoke<ProfileWithMeta[]>("list_profiles");
}

/**
 * Load a single profile by file name.
 */
export async function loadProfile(fileName: string): Promise<ProfileWithMeta> {
  return invoke<ProfileWithMeta>("get_profile", { fileName });
}
