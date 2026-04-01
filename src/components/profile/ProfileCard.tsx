import type { ProfileWithMeta } from "../../types/profile";
import { StatusBadge } from "../ui/StatusBadge";

interface ProfileCardProps {
  profile: ProfileWithMeta;
  isSelected: boolean;
  onClick: () => void;
}

export function ProfileCard({ profile, isSelected, onClick }: ProfileCardProps) {
  return (
    <button
      className={`w-full text-left p-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-claude-600
        ${
          isSelected
            ? "bg-claude-900/30 border-claude-700"
            : "bg-gray-900 border-gray-800 hover:border-gray-700 hover:bg-gray-800"
        }`}
      onClick={onClick}
      aria-pressed={isSelected}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-gray-100">
          {profile.displayName}
        </span>
        <div className="flex gap-1 items-center">
          {profile.source === "custom" && (
            <span className="text-xs px-1.5 py-0.5 bg-purple-900/50 text-purple-400 rounded">
              custom
            </span>
          )}
          {profile.isActive && (
            <StatusBadge status="active" label="Active" />
          )}
        </div>
      </div>
      <p className="text-xs text-gray-400 line-clamp-2">{profile.description}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {profile.settings.permissions.allow.slice(0, 3).map((perm) => (
          <span
            key={perm}
            className="text-xs px-1.5 py-0.5 bg-gray-800 rounded text-gray-400 font-mono"
          >
            {perm}
          </span>
        ))}
        {profile.settings.permissions.allow.length > 3 && (
          <span className="text-xs px-1.5 py-0.5 bg-gray-800 rounded text-gray-500">
            +{profile.settings.permissions.allow.length - 3} more
          </span>
        )}
        {Object.keys(profile.settings.env).length > 0 && (
          <span className="text-xs px-1.5 py-0.5 bg-blue-900/50 text-blue-400 rounded">
            {Object.keys(profile.settings.env).length} env vars
          </span>
        )}
      </div>
    </button>
  );
}
