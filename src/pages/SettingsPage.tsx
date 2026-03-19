import { Header } from "../components/layout/Header";
import { useSettingsPath } from "../hooks/useSettingsPath";
import { APP_CONFIG } from "../config/appConfig";

export function SettingsPage() {
  const { settingsPath, refresh } = useSettingsPath();

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Settings"
        subtitle="Application configuration"
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

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="card">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Application Info
          </h2>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-xs text-gray-500">Name</dt>
              <dd className="text-xs text-gray-300">{APP_CONFIG.appName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-xs text-gray-500">Version</dt>
              <dd className="text-xs text-gray-300">{APP_CONFIG.version}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-xs text-gray-500">Max Backups</dt>
              <dd className="text-xs text-gray-300">{APP_CONFIG.maxBackups}</dd>
            </div>
          </dl>
        </div>

        <div className="card">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Paths
          </h2>
          <dl className="space-y-2">
            <div>
              <dt className="text-xs text-gray-500 mb-0.5">
                Claude Settings File
              </dt>
              <dd className="text-xs font-mono text-gray-400 break-all bg-gray-800 px-2 py-1 rounded">
                {settingsPath || "Detecting…"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500 mb-0.5">
                Profiles Directory
              </dt>
              <dd className="text-xs font-mono text-gray-400 break-all bg-gray-800 px-2 py-1 rounded">
                {APP_CONFIG.profilesDir}/
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500 mb-0.5">
                Backups Directory
              </dt>
              <dd className="text-xs font-mono text-gray-400 break-all bg-gray-800 px-2 py-1 rounded">
                {APP_CONFIG.backupsDir}/
              </dd>
            </div>
          </dl>
        </div>

        <div className="card">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            About
          </h2>
          <p className="text-xs text-gray-500">
            Claude Profile Widget allows you to safely switch between Claude
            Code configuration profiles. Each profile switch automatically
            creates a backup of your existing settings before overwriting.
          </p>
          <p className="text-xs text-gray-600 mt-2">
            Built with Tauri v2 + React + TypeScript + Vite + Tailwind CSS.
          </p>
        </div>
      </div>
    </div>
  );
}
