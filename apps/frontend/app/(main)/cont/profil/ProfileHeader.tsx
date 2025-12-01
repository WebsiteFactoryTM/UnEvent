"use client";
import { useProfile } from "@/lib/react-query/accountProfile.queries";
import Image from "next/image";
import { FaUpload } from "react-icons/fa6";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { getRolesLabel } from "@/lib/getRolesLabel";
import { useUploadManager } from "@/hooks/useUploadManager";
import { useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { profileKeys } from "@/lib/cacheKeys";
import { updateProfileAvatar } from "@/lib/api/profile";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { Media } from "@/types/payload-types";

export default function ProfileHeader({ profileId }: { profileId: number }) {
  const { profile } = useProfile(profileId);
  const { data: session, update: updateSession } = useSession();
  const userRoles = session?.user?.roles || [];
  const accessToken = session?.accessToken;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const uploadUM = useUploadManager({
    token: accessToken,
    accept: "image/*",
    maxSizeMB: 5,
  });

  if (!profile) return null;

  const roleLabels = getRolesLabel(userRoles);

  // Get avatar URL - prefer preview during upload, then profile avatar, then placeholder
  const avatarUrl =
    uploadUM.previews?.[0] ||
    (profile.avatar &&
    typeof profile.avatar === "object" &&
    "url" in profile.avatar
      ? profile.avatar.url
      : null) ||
    "/placeholder.svg";

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      try {
        // Select file for preview
        uploadUM.handleSelect(e);

        // Upload the file
        const media = (await uploadUM.uploadSingle(file, "avatar")) as Media;

        if (!media?.id) {
          throw new Error("Upload failed: no media ID returned");
        }

        // Update profile with new avatar
        setIsUpdatingProfile(true);
        const updatedProfile = await updateProfileAvatar(
          media.id,
          profileId,
          accessToken,
        );

        // Update query cache
        queryClient.setQueryData(
          profileKeys.detail(String(profileId)),
          (oldData: any) => ({
            ...oldData,
            ...updatedProfile,
            id: profileId,
          }),
        );

        // Refresh session to get updated avatarURL in user session
        // The backend hook updateUserAvatar updates users.avatarURL,
        // and session.update() will fetch fresh user data
        await updateSession();

        // Clear upload manager state
        uploadUM.clear();

        toast({
          title: "Succes",
          description: "Fotografia de profil a fost actualizată cu succes",
          variant: "success",
        });
      } catch (error) {
        console.error("Error uploading avatar:", error);
        toast({
          title: "Eroare",
          description:
            uploadUM.error?.message ||
            "Eroare la încărcarea fotografiei de profil",
          variant: "destructive",
        });
      } finally {
        setIsUpdatingProfile(false);
      }
    },
    [uploadUM, profileId, accessToken, queryClient, toast, updateSession],
  );

  const isUploading = uploadUM.isUploading || isUpdatingProfile;

  return (
    <div className="flex items-center gap-6">
      <div className="relative">
        <Image
          src={avatarUrl}
          alt={profile.displayName || profile.name}
          width={96}
          height={96}
          className="w-24 h-24 rounded-full object-cover border-2 border-border"
        />
        <button
          onClick={handleAvatarClick}
          disabled={isUploading}
          className="absolute bottom-0 right-0 p-2 bg-muted hover:bg-muted/80 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
        >
          {isUploading ? (
            <Loader2 className="w-3 h-3 text-muted-foreground animate-spin" />
          ) : (
            <FaUpload className="w-3 h-3 text-muted-foreground" />
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleAvatarUpload}
          className="hidden"
        />
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-foreground">
          {profile.displayName || profile.name}
        </h3>
        {roleLabels.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {roleLabels.map((label, index) => (
              <Badge
                key={userRoles[index]}
                variant="secondary"
                className="text-xs"
              >
                {label}
              </Badge>
            ))}
          </div>
        )}
        <p className="text-sm text-muted-foreground mt-1">
          {isUploading
            ? "Se încarcă fotografia..."
            : "Schimbă fotografia de profil"}
        </p>
        {uploadUM.error && (
          <p className="text-sm text-destructive font-medium mt-1">
            {uploadUM.error.message}
          </p>
        )}
      </div>
    </div>
  );
}
