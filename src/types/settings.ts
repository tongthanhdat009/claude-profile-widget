export interface ClaudeSettings {
  autoUpdaterEnabled?: boolean;
  includeCoAuthoredBy?: boolean;
  preferredNotifChannel?: string;
  hasCompletedOnboarding?: boolean;
  theme?: string;
  verbose?: boolean;
  permissions?: {
    allow: string[];
    deny: string[];
  };
  env?: Record<string, string>;
  [key: string]: unknown;
}

export interface SettingsState {
  current: ClaudeSettings | null;
  settingsPath: string;
  lastUpdated: string | null;
  isLoading: boolean;
  error: string | null;
}
