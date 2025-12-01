"use client";
import { useProfile } from "@/lib/react-query/accountProfile.queries";
import Image from "next/image";
import { FaUpload } from "react-icons/fa6";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { getRolesLabel } from "@/lib/getRolesLabel";

export default function ProfileHeader({ profileId }: { profileId: number }) {
  const { profile } = useProfile(profileId);
  const { data: session } = useSession();
  const userRoles = session?.user?.roles || [];

  if (!profile) return null;

  const roleLabels = getRolesLabel(userRoles);

  return (
    <div className="flex items-center gap-6">
      <div className="relative">
        <Image
          src={(profile.avatar as any)?.url || "/placeholder.svg"}
          alt={profile.displayName || profile.name}
          width={96}
          height={96}
          className="w-24 h-24 rounded-full object-cover border-2 border-border"
        />
        <button className="absolute bottom-0 right-0 p-2 bg-muted hover:bg-muted/80 rounded-full transition-colors">
          <FaUpload className="w-3 h-3 text-muted-foreground" />
        </button>
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
          Schimbă fotografia de profil
        </p>
      </div>
    </div>
  );
}
