export interface ProfilePermissions {
  allow: string[];
  deny: string[];
}

export interface ProfileSettings {
  autoUpdaterEnabled: boolean;
  includeCoAuthoredBy: boolean;
  preferredNotifChannel: string;
  hasCompletedOnboarding: boolean;
  theme: string;
  verbose: boolean;
  permissions: ProfilePermissions;
  env: Record<string, string>;
}

export interface Profile {
  name: string;
  displayName: string;
  description: string;
  version: string;
  settings: ProfileSettings;
}

export interface ProfileWithMeta extends Profile {
  fileName: string;
  filePath: string;
  isActive: boolean;
  loadedAt: string;
}
