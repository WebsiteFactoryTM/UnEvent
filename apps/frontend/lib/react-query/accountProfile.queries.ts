import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProfile, updateProfile } from "@/lib/api/profile";
import { ProfileFormData } from "@/components/cont/ProfilePersonalDetailsForm";
import { Profile } from "@/types/payload-types";
import { useSession } from "next-auth/react";
import { profileKeys } from "../cacheKeys";

export function useProfile(profileId?: number | string) {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;
  const queryClient = useQueryClient();

  const query = useQuery<Profile>({
    queryKey: profileKeys.detail(profileId || ""),
    queryFn: () => getProfile(profileId, accessToken),
    enabled: !!profileId && !!accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const updateMutation = useMutation({
    mutationFn: ({ data }: { data: ProfileFormData }) => {
      if (!profileId) throw new Error("Profile ID is required");
      return updateProfile(data, Number(profileId), accessToken);
    },
    onSuccess: (updatedProfile) => {
      const key = profileKeys.detail(String(profileId));
      console.log("key", key);
      console.log("updatedProfile", updatedProfile);

      // Merge the updated data with existing data to ensure we have the full profile
      queryClient.setQueryData(key, (oldData: any) => ({
        ...oldData,
        ...updatedProfile,
        id: profileId, // Ensure ID is preserved
      }));
    },
  });

  return {
    // Query data
    profile: query.data,
    isLoading: query.isLoading,
    error: query.error,

    // Mutation functions
    updateProfile: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
  };
}
