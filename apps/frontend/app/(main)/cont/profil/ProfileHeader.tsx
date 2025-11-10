"use client";
import { useProfile } from "@/lib/react-query/accountProfile.queries";
import Image from "next/image";
import { FaUpload } from "react-icons/fa6";

export default function ProfileHeader({ profileId }: { profileId: number }) {
  const { profile } = useProfile(profileId);

  if (!profile) return null;

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
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          {profile.displayName || profile.name}
        </h3>
        <p className="text-sm text-muted-foreground">
          Schimbă fotografia de profil
        </p>
      </div>
    </div>
  );
}
