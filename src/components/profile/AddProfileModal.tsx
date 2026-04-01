import { useState } from "react";
import type { Profile } from "../../types/profile";

interface AddProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: Profile) => Promise<void>;
}

const DEFAULT_ENV_VARS = {
  ANTHROPIC_DEFAULT_HAIKU_MODEL: "",
  ANTHROPIC_DEFAULT_SONNET_MODEL: "",
  ANTHROPIC_DEFAULT_OPUS_MODEL: "",
  ANTHROPIC_AUTH_TOKEN: "",
  ANTHROPIC_BASE_URL: "",
};

export function AddProfileModal({ isOpen, onClose, onSave }: AddProfileModalProps) {
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [envVars, setEnvVars] = useState(DEFAULT_ENV_VARS);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEnvChange = (key: string, value: string) => {
    setEnvVars((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Profile name is required");
      return;
    }
    if (!displayName.trim()) {
      setError("Display name is required");
      return;
    }

    // Filter out empty env vars
    const env: Record<string, string> = {};
    for (const [key, value] of Object.entries(envVars)) {
      if (value.trim()) {
        env[key] = value.trim();
      }
    }

    const profile: Profile = {
      name: name.trim().toLowerCase().replace(/\s+/g, "-"),
      displayName: displayName.trim(),
      description: description.trim(),
      version: "1.0.0",
      settings: {
        autoUpdaterEnabled: true,
        includeCoAuthoredBy: true,
        preferredNotifChannel: "",
        hasCompletedOnboarding: false,
        theme: "",
        verbose: false,
        permissions: {
          allow: [],
          deny: [],
        },
        env,
      },
    };

    setSaving(true);
    try {
      await onSave(profile);
      // Reset form
      setName("");
      setDisplayName("");
      setDescription("");
      setEnvVars(DEFAULT_ENV_VARS);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Add New Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-900/40 text-red-400 p-2 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Profile Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="my-profile"
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-claude-500"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Display Name *
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="My Profile"
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-claude-500"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Profile description"
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-claude-500"
            />
          </div>

          <div className="border-t border-gray-700 pt-4">
            <h3 className="text-sm font-medium text-white mb-3">
              API Configuration
            </h3>
            <div className="space-y-3">
              {/* Auth Token - First priority */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  ANTHROPIC_AUTH_TOKEN
                </label>
                <input
                  type="password"
                  value={envVars.ANTHROPIC_AUTH_TOKEN}
                  onChange={(e) => handleEnvChange("ANTHROPIC_AUTH_TOKEN", e.target.value)}
                  placeholder="sk-ant-..."
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-claude-500"
                />
              </div>

              {/* Base URL - Second priority */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  ANTHROPIC_BASE_URL
                </label>
                <input
                  type="text"
                  value={envVars.ANTHROPIC_BASE_URL}
                  onChange={(e) => handleEnvChange("ANTHROPIC_BASE_URL", e.target.value)}
                  placeholder="https://api.anthropic.com"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-claude-500"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <h3 className="text-sm font-medium text-white mb-3">
              Model Selection
            </h3>
            <div className="space-y-3">
              {/* Haiku Model */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  ANTHROPIC_DEFAULT_HAIKU_MODEL
                </label>
                <input
                  type="text"
                  value={envVars.ANTHROPIC_DEFAULT_HAIKU_MODEL}
                  onChange={(e) => handleEnvChange("ANTHROPIC_DEFAULT_HAIKU_MODEL", e.target.value)}
                  placeholder="claude-haiku-4-5-20241001"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-claude-500"
                />
              </div>

              {/* Sonnet Model */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  ANTHROPIC_DEFAULT_SONNET_MODEL
                </label>
                <input
                  type="text"
                  value={envVars.ANTHROPIC_DEFAULT_SONNET_MODEL}
                  onChange={(e) => handleEnvChange("ANTHROPIC_DEFAULT_SONNET_MODEL", e.target.value)}
                  placeholder="claude-sonnet-4-6-20250514"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-claude-500"
                />
              </div>

              {/* Opus Model */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  ANTHROPIC_DEFAULT_OPUS_MODEL
                </label>
                <input
                  type="text"
                  value={envVars.ANTHROPIC_DEFAULT_OPUS_MODEL}
                  onChange={(e) => handleEnvChange("ANTHROPIC_DEFAULT_OPUS_MODEL", e.target.value)}
                  placeholder="claude-opus-4-6-20250514"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-claude-500"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm bg-gray-800 text-gray-300 rounded hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 text-sm bg-claude-600 text-white rounded hover:bg-claude-500 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}