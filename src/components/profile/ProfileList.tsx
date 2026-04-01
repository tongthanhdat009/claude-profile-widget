import type { ProfileWithMeta } from "../../types/profile";
import { ProfileCard } from "./ProfileCard";
import { EmptyState } from "../ui/EmptyState";

interface ProfileListProps {
  profiles: ProfileWithMeta[];
  selectedProfile: ProfileWithMeta | null;
  onSelect: (profile: ProfileWithMeta) => void;
  isLoading: boolean;
  error: string | null;
  onAddClick?: () => void;
}

export function ProfileList({
  profiles,
  selectedProfile,
  onSelect,
  isLoading,
  error,
  onAddClick,
}: ProfileListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <span className="text-sm text-gray-500 animate-pulse">
          Loading profiles…
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon="⚠️"
        title="Failed to load profiles"
        description={error}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2 p-3">
      {onAddClick && (
        <button
          onClick={onAddClick}
          className="w-full p-2 rounded-lg border border-dashed border-gray-700 text-gray-400 hover:border-claude-600 hover:text-claude-400 transition-colors text-sm"
        >
          + Add Profile
        </button>
      )}
      {profiles.length === 0 ? (
        <EmptyState
          icon="📂"
          title="No profiles found"
          description="Click 'Add Profile' to create one."
        />
      ) : (
        profiles.map((profile) => (
          <ProfileCard
            key={profile.fileName}
            profile={profile}
            isSelected={selectedProfile?.fileName === profile.fileName}
            onClick={() => onSelect(profile)}
          />
        ))
      )}
    </div>
  );
}
