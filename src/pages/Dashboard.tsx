import { Header } from "../components/layout/Header";
import { JsonPreview } from "../components/ui/JsonPreview";
import { useSettingsPath } from "../hooks/useSettingsPath";
import { useProfiles } from "../hooks/useProfiles";
import { useBackups } from "../hooks/useBackups";

export function Dashboard() {
  const { settingsPath, currentSettings, isLoading, error, refresh } =
    useSettingsPath();
  const { profiles } = useProfiles();
  const { backups } = useBackups();

  const activeProfile = profiles.find((p) => p.isActive);

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Claude Profile Widget"
        subtitle="Manage your Claude Code profiles"
        actions={
          <button
            className="btn-secondary text-xs px-2 py-1"
            onClick={() => void refresh()}
            title="Refresh"
          >
            ↻
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="card text-center">
            <p className="text-2xl font-bold text-claude-400">
              {profiles.length}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Profiles</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-blue-400">{backups.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Backups</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-green-400">
              {activeProfile ? "✓" : "—"}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Active</p>
          </div>
        </div>

        {/* Active profile */}
        <div className="card">
          <h2 className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">
            Active Profile
          </h2>
          {activeProfile ? (
            <>
              <p className="text-sm font-semibold text-gray-100">
                {activeProfile.displayName}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {activeProfile.description}
              </p>
            </>
          ) : (
            <p className="text-xs text-gray-600">
              No profile currently active
            </p>
          )}
        </div>

        {/* Settings path */}
        <div className="card">
          <h2 className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">
            Settings Path
          </h2>
          <p className="text-xs font-mono text-gray-400 break-all">
            {settingsPath || "Detecting…"}
          </p>
        </div>

        {/* Current settings preview */}
        <div>
          <h2 className="text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide px-1">
            Current Settings
          </h2>
          {isLoading ? (
            <p className="text-xs text-gray-600 animate-pulse">Loading…</p>
          ) : error ? (
            <p className="text-xs text-red-400">{error}</p>
          ) : (
            <JsonPreview data={currentSettings} maxHeight="200px" />
          )}
        </div>
      </div>
    </div>
  );
}
