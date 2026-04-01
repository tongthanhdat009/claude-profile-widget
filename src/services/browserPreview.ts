import { APP_CONFIG } from "../config/appConfig";
import type { Backup } from "../types/backup";
import type { Profile, ProfileWithMeta } from "../types/profile";
import type { ClaudeSettings } from "../types/settings";

const PREVIEW_STORAGE_KEY = "claude-profile-widget.preview-state";
const PREVIEW_SETTINGS_PATH = `~/${APP_CONFIG.claudeConfigDir}/${APP_CONFIG.settingsFileName}`;

interface PreviewBackup extends Backup {
  settings: ClaudeSettings;
}

interface PreviewState {
  backups: PreviewBackup[];
  currentSettings: ClaudeSettings;
}

const PREVIEW_PROFILES: readonly Profile[] = [
  {
    name: "default",
    displayName: "Default",
    description: "Standard Claude Code configuration with balanced settings",
    version: "1.0.0",
    settings: {
      autoUpdaterEnabled: true,
      includeCoAuthoredBy: true,
      preferredNotifChannel: "auto",
      hasCompletedOnboarding: true,
      theme: "dark",
      verbose: false,
      permissions: {
        allow: [
          "Bash(git:*)",
          "Bash(npm:*)",
          "Bash(node:*)",
          "Read(**)",
          "Write(**)",
        ],
        deny: [],
      },
      env: {},
    },
  },
  {
    name: "fast",
    displayName: "Fast",
    description: "Optimized Claude Code configuration for speed with expanded permissions",
    version: "1.0.0",
    settings: {
      autoUpdaterEnabled: false,
      includeCoAuthoredBy: false,
      preferredNotifChannel: "terminal",
      hasCompletedOnboarding: true,
      theme: "dark",
      verbose: false,
      permissions: {
        allow: ["Bash(*)", "Read(**)", "Write(**)", "WebFetch(*)"],
        deny: [],
      },
      env: {
        CLAUDE_FAST_MODE: "1",
        CLAUDE_SKIP_CONFIRMATIONS: "1",
      },
    },
  },
  {
    name: "strict",
    displayName: "Strict",
    description: "Strict Claude Code configuration with minimal permissions and enhanced safety",
    version: "1.0.0",
    settings: {
      autoUpdaterEnabled: true,
      includeCoAuthoredBy: true,
      preferredNotifChannel: "auto",
      hasCompletedOnboarding: true,
      theme: "dark",
      verbose: true,
      permissions: {
        allow: ["Read(**)"],
        deny: ["Bash(*)", "Write(**)"],
      },
      env: {
        CLAUDE_STRICT_MODE: "1",
      },
    },
  },
];

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function toClaudeSettings(value: ClaudeSettings | Profile["settings"]): ClaudeSettings {
  return clone(value) as ClaudeSettings;
}

function normalizePath(path: string): string {
  return path.replace(/\\/g, "/").replace(/\/+$/, "");
}

function encodeSize(value: unknown): number {
  return new TextEncoder().encode(JSON.stringify(value, null, 2)).length;
}

function nowIso(): string {
  return new Date().toISOString();
}

function filenameTimestamp(date: Date): string {
  return date
    .toISOString()
    .slice(0, 19)
    .replace("T", "--")
    .replace(/:/g, "-");
}

function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().split("-")[0];
  }

  return Math.random().toString(36).slice(2, 10);
}

function defaultState(): PreviewState {
  return {
    backups: [],
    currentSettings: toClaudeSettings(PREVIEW_PROFILES[0].settings),
  };
}

function loadState(): PreviewState {
  if (typeof window === "undefined") {
    return defaultState();
  }

  const raw = window.localStorage.getItem(PREVIEW_STORAGE_KEY);
  if (!raw) {
    return defaultState();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PreviewState>;
    return {
      backups: Array.isArray(parsed.backups) ? parsed.backups : [],
      currentSettings:
        parsed.currentSettings ?? toClaudeSettings(PREVIEW_PROFILES[0].settings),
    };
  } catch {
    return defaultState();
  }
}

function saveState(state: PreviewState): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PREVIEW_STORAGE_KEY, JSON.stringify(state));
}

function pruneBackups(backups: PreviewBackup[]): PreviewBackup[] {
  return backups.slice(0, APP_CONFIG.maxBackups);
}

function profileFileName(profile: Profile): string {
  return `${profile.name}${APP_CONFIG.profileExtension}`;
}

function profileFilePath(profile: Profile): string {
  return `${APP_CONFIG.profilesDir}/${profileFileName(profile)}`;
}

function backupFilePath(fileName: string): string {
  return `${APP_CONFIG.backupsDir}/${fileName}`;
}

function settingsMatch(current: ClaudeSettings, candidate: ClaudeSettings): boolean {
  return JSON.stringify(current) === JSON.stringify(candidate);
}

function listProfiles(currentSettings: ClaudeSettings): ProfileWithMeta[] {
  const loadedAt = nowIso();

  return PREVIEW_PROFILES.map((profile) => ({
    ...clone(profile),
    fileName: profileFileName(profile),
    filePath: profileFilePath(profile),
    isActive: settingsMatch(currentSettings, toClaudeSettings(profile.settings)),
    loadedAt,
    source: 'bundled' as const,
  }));
}

function requireProfile(fileName: string): Profile {
  const profile = PREVIEW_PROFILES.find((item) => profileFileName(item) === fileName);
  if (!profile) {
    throw new Error(`Profile not found: ${fileName}`);
  }

  return profile;
}

function stripBackupSettings(backup: PreviewBackup): Backup {
  const { settings: _settings, ...rest } = backup;
  return rest;
}

function createBackupEntry(
  settings: ClaudeSettings,
  profileName?: string | null,
  label?: string | null
): PreviewBackup {
  const now = new Date();
  const createdAt = now.toISOString();
  const id = randomId();
  const profileSlug = (label ?? profileName ?? "unknown").replace(/\s+/g, "-");
  const fileName = `backup_${profileSlug}_${filenameTimestamp(now)}_${id}.json`;

  return {
    id,
    fileName,
    filePath: backupFilePath(fileName),
    createdAt,
    profileName: profileName ?? null,
    sizeBytes: encodeSize(settings),
    settings: clone(settings),
  };
}

function readSettingsFile(path: string): string {
  const state = loadState();
  const normalizedPath = normalizePath(path);
  const settingsPath = normalizePath(PREVIEW_SETTINGS_PATH);

  if (normalizedPath === settingsPath) {
    return JSON.stringify(state.currentSettings, null, 2);
  }

  const profile = PREVIEW_PROFILES.find(
    (item) => normalizePath(profileFilePath(item)) === normalizedPath
  );
  if (profile) {
    return JSON.stringify(profile, null, 2);
  }

  const backup = state.backups.find(
    (item) => normalizePath(item.filePath) === normalizedPath
  );
  if (backup) {
    return JSON.stringify(backup.settings, null, 2);
  }

  throw new Error(`Preview file not found: ${path}`);
}

function writeSettingsFile(path: string, content: string): void {
  const normalizedPath = normalizePath(path);
  const settingsPath = normalizePath(PREVIEW_SETTINGS_PATH);

  if (normalizedPath !== settingsPath) {
    throw new Error("Browser preview only supports writing the settings file.");
  }

  const parsed = JSON.parse(content) as ClaudeSettings;
  const state = loadState();
  state.currentSettings = parsed;
  saveState(state);
}

function listDirectoryEntries(dirPath: string): string[] {
  const normalizedDir = normalizePath(dirPath);

  if (normalizedDir.endsWith(`/${APP_CONFIG.profilesDir}`) || normalizedDir === APP_CONFIG.profilesDir) {
    return PREVIEW_PROFILES.map((profile) => profileFilePath(profile));
  }

  if (normalizedDir.endsWith(`/${APP_CONFIG.backupsDir}`) || normalizedDir === APP_CONFIG.backupsDir) {
    return loadState().backups.map((backup) => backup.filePath);
  }

  return [];
}

function fileExists(path: string): boolean {
  try {
    readSettingsFile(path);
    return true;
  } catch {
    return false;
  }
}

export async function invokeBrowserPreview<T>(
  command: string,
  args: Record<string, unknown> = {}
): Promise<T> {
  switch (command) {
    case "get_settings_path":
      return PREVIEW_SETTINGS_PATH as T;

    case "read_settings":
      return clone(loadState().currentSettings) as T;

    case "list_profiles":
      return listProfiles(loadState().currentSettings) as T;

    case "get_profile": {
      const fileName = String(args.fileName ?? "");
      const profile = requireProfile(fileName);
      const currentSettings = loadState().currentSettings;

      return {
        ...clone(profile),
        fileName,
        filePath: profileFilePath(profile),
        isActive: settingsMatch(currentSettings, toClaudeSettings(profile.settings)),
        loadedAt: nowIso(),
      } as T;
    }

    case "apply_profile": {
      const profileFileNameArg = String(args.profileFileName ?? "");
      const profile = requireProfile(profileFileNameArg);
      const state = loadState();
      const backup = createBackupEntry(state.currentSettings, profile.name, null);

      state.backups = pruneBackups([backup, ...state.backups]);
      state.currentSettings = toClaudeSettings(profile.settings);
      saveState(state);

      return backup.filePath as T;
    }

    case "list_backups":
      return loadState().backups.map(stripBackupSettings) as T;

    case "restore_backup": {
      const backupId = String(args.backupId ?? "");
      const state = loadState();
      const backup = state.backups.find((item) => item.id === backupId);
      if (!backup) {
        throw new Error(`Backup with ID '${backupId}' not found`);
      }

      const preRestoreBackup = createBackupEntry(
        state.currentSettings,
        null,
        "pre-restore"
      );

      state.backups = pruneBackups([preRestoreBackup, ...state.backups]);
      state.currentSettings = clone(backup.settings);
      saveState(state);

      return undefined as T;
    }

    case "delete_backup": {
      const backupId = String(args.backupId ?? "");
      const state = loadState();
      state.backups = state.backups.filter((item) => item.id !== backupId);
      saveState(state);

      return undefined as T;
    }

    case "create_backup": {
      const label =
        typeof args.label === "string" && args.label.trim().length > 0
          ? args.label
          : null;
      const state = loadState();
      const backup = createBackupEntry(state.currentSettings, null, label);

      state.backups = pruneBackups([backup, ...state.backups]);
      saveState(state);

      return stripBackupSettings(backup) as T;
    }

    case "file_exists":
      return fileExists(String(args.path ?? "")) as T;

    case "read_file":
      return readSettingsFile(String(args.path ?? "")) as T;

    case "write_file":
      writeSettingsFile(String(args.path ?? ""), String(args.content ?? ""));
      return undefined as T;

    case "list_directory":
      return listDirectoryEntries(String(args.dirPath ?? "")) as T;

    default:
      throw new Error(`Unsupported preview command: ${command}`);
  }
}
