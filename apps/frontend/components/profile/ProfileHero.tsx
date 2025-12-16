import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ExpandableText } from "@/components/ui/expandable-text";
import { FaStar, FaCircleCheck } from "react-icons/fa6";
import type { User, Profile } from "@/types/payload-types";

type ProfileWithUser = Profile & { user?: number | User };

interface ProfileHeroProps {
  profile: ProfileWithUser;
}

export function ProfileHero({ profile }: ProfileHeroProps) {
  const isVerified = profile.verifiedStatus === "approved";
  const memberSince = profile.memberSince
    ? new Date(profile.memberSince).toLocaleDateString("ro-RO", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const avatarUrl =
    profile.avatar &&
    typeof profile.avatar === "object" &&
    "url" in profile.avatar
      ? profile.avatar.url || undefined
      : undefined;

  return (
    <div className="glass-card p-6 md:p-8 space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Avatar */}
        <Avatar className="h-24 w-24 md:h-32 md:w-32 ring-4 ring-primary/20">
          <AvatarImage
            src={avatarUrl}
            alt={profile.displayName || profile.name}
          />
          <AvatarFallback className="text-2xl md:text-3xl">
            {(profile.displayName || profile.name).charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="flex-1 space-y-3">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold">
                {profile.displayName || profile.name}
              </h1>
              {isVerified && (
                <Badge className="bg-green-500/90 backdrop-blur-sm gap-1">
                  <FaCircleCheck className="h-3 w-3" />
                  Verificat
                </Badge>
              )}
            </div>

            {/* Rating */}
            {profile.rating &&
              profile.rating.count &&
              profile.rating.count > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <FaStar className="h-4 w-4 text-yellow-500" />
                    <span className="font-semibold">
                      {profile.rating.average?.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-muted-foreground">
                    · {profile.rating.count}{" "}
                    {profile.rating.count === 1 ? "evaluare" : "evaluări"}
                  </span>
                </div>
              )}

            {/* Member since */}
            {memberSince && (
              <Badge variant="outline" className="text-xs">
                Membru din {memberSince}
              </Badge>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <ExpandableText
              text={profile.bio}
              maxWords={50}
              showMoreText="Arată mai mult"
              showLessText="Arată mai puțin"
            />
          )}
        </div>
      </div>
    </div>
  );
}
