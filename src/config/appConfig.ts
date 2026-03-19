export const APP_CONFIG = {
  appName: "Claude Profile Widget",
  version: "0.1.0",

  /** Relative path from project root to the profiles directory */
  profilesDir: "profiles",

  /** Relative path from project root to the backups directory */
  backupsDir: "backups",

  /** Maximum number of backups to keep */
  maxBackups: 20,

  /** Claude Code settings file name */
  settingsFileName: "settings.json",

  /** Supported profile file extension */
  profileExtension: ".json",

  /** Claude Code config directory (relative to user home) */
  claudeConfigDir: ".claude",
} as const;

export type AppConfig = typeof APP_CONFIG;
