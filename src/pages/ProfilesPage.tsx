import { useState } from "react";
import { Header } from "../components/layout/Header";
import { ProfileList } from "../components/profile/ProfileList";
import { DiffPreview } from "../components/profile/DiffPreview";
import { JsonPreview } from "../components/ui/JsonPreview";
import { ActionBar } from "../components/ui/ActionBar";
import { useProfiles } from "../hooks/useProfiles";
import { useSettingsPath } from "../hooks/useSettingsPath";
import { applyProfile } from "../services/settingsService";

type TabKey = "preview" | "diff";

export function ProfilesPage() {
  const {
    profiles,
    isLoading: profilesLoading,
    error: profilesError,
    selectedProfile,
    selectProfile,
    refresh: refreshProfiles,
  } = useProfiles();

  const {
    currentSettings,
    settingsPath,
    refresh: refreshSettings,
  } = useSettingsPath();

  const [tab, setTab] = useState<TabKey>("preview");
  const [applying, setApplying] = useState(false);
  const [applyStatus, setApplyStatus] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  const handleApply = async () => {
    if (!selectedProfile) return;
    setApplying(true);
    setApplyStatus(null);
    try {
      const backupPath = await applyProfile(selectedProfile.fileName);
      setApplyStatus({
        ok: true,
        message: `Profile applied! Backup saved to: ${backupPath}`,
      });
      await Promise.all([refreshProfiles(), refreshSettings()]);
    } catch (err) {
      setApplyStatus({
        ok: false,
        message: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Profiles"
        subtitle={settingsPath || "Detecting settings path…"}
        actions={
          <button
            className="btn-secondary text-xs px-2 py-1"
            onClick={() => void refreshProfiles()}
            title="Refresh profiles"
          >
            ↻
          </button>
        }
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Profile list */}
        <div className="w-44 border-r border-gray-800 overflow-y-auto shrink-0">
          <ProfileList
            profiles={profiles}
            selectedProfile={selectedProfile}
            onSelect={selectProfile}
            isLoading={profilesLoading}
            error={profilesError}
          />
        </div>

        {/* Right panel */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {selectedProfile ? (
            <>
              {/* Tabs */}
              <div className="flex border-b border-gray-800 shrink-0">
                {(["preview", "diff"] as TabKey[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-4 py-2 text-xs font-medium transition-colors ${
                      tab === t
                        ? "border-b-2 border-claude-500 text-claude-400"
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    {t === "preview" ? "Preview" : "Diff"}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="flex-1 overflow-y-auto p-3">
                {tab === "preview" ? (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">
                      {selectedProfile.description}
                    </p>
                    <JsonPreview
                      data={selectedProfile.settings}
                      maxHeight="360px"
                    />
                  </div>
                ) : (
                  <DiffPreview
                    oldData={currentSettings ?? {}}
                    newData={selectedProfile.settings}
                    maxHeight="360px"
                  />
                )}
              </div>

              {/* Status message */}
              {applyStatus && (
                <div
                  className={`mx-3 mb-2 p-2 rounded-lg text-xs ${
                    applyStatus.ok
                      ? "bg-green-900/40 text-green-400"
                      : "bg-red-900/40 text-red-400"
                  }`}
                >
                  {applyStatus.message}
                </div>
              )}

              <ActionBar>
                <button
                  className="btn-primary text-sm flex-1"
                  onClick={() => void handleApply()}
                  disabled={applying}
                >
                  {applying ? "Applying…" : `Apply "${selectedProfile.displayName}"`}
                </button>
              </ActionBar>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-gray-600">
                Select a profile to preview
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
