import { useCallback, useEffect, useState } from "react";
import type { ProfileWithMeta } from "../types/profile";
import { loadProfiles } from "../services/profileService";

export interface UseProfilesResult {
  profiles: ProfileWithMeta[];
  isLoading: boolean;
  error: string | null;
  selectedProfile: ProfileWithMeta | null;
  selectProfile: (profile: ProfileWithMeta | null) => void;
  refresh: () => Promise<void>;
}

export function useProfiles(): UseProfilesResult {
  const [profiles, setProfiles] = useState<ProfileWithMeta[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] =
    useState<ProfileWithMeta | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await loadProfiles();
      setProfiles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    profiles,
    isLoading,
    error,
    selectedProfile,
    selectProfile: setSelectedProfile,
    refresh,
  };
}
