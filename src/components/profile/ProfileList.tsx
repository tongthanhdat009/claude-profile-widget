import type { ProfileWithMeta } from "../../types/profile";
import { ProfileCard } from "./ProfileCard";
import { EmptyState } from "../ui/EmptyState";

interface ProfileListProps {
  profiles: ProfileWithMeta[];
  selectedProfile: ProfileWithMeta | null;
  onSelect: (profile: ProfileWithMeta) => void;
  isLoading: boolean;
  error: string | null;
}

export function ProfileList({
  profiles,
  selectedProfile,
  onSelect,
  isLoading,
  error,
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

  if (profiles.length === 0) {
    return (
      <EmptyState
        icon="📂"
        title="No profiles found"
        description="Add JSON profile files to the profiles/ directory."
      />
    );
  }

  return (
    <div className="flex flex-col gap-2 p-3">
      {profiles.map((profile) => (
        <ProfileCard
          key={profile.fileName}
          profile={profile}
          isSelected={selectedProfile?.fileName === profile.fileName}
          onClick={() => onSelect(profile)}
        />
      ))}
    </div>
  );
}
