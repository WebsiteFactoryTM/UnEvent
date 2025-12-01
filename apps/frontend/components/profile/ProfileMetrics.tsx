"use client";

import { Badge } from "@/components/ui/badge";
import { FaLocationDot, FaClock, FaCircle } from "react-icons/fa6";
import type { User, Profile } from "@/types/payload-types";

type ProfileWithUser = Profile & { user?: number | User };

interface ProfileMetricsProps {
  profile: ProfileWithUser;
}

const roleLabels: Record<string, string> = {
  client: "Client",
  host: "Proprietar locație",
  provider: "Furnizor servicii",
  organizer: "Organizator evenimente",
  admin: "Administrator",
};

export function ProfileMetrics({ profile }: ProfileMetricsProps) {
  const user =
    profile.user && typeof profile.user === "object" ? profile.user : undefined;
  const lastOnline = profile.lastOnline ? new Date(profile.lastOnline) : null;
  const isOnline =
    lastOnline && Date.now() - lastOnline.getTime() < 5 * 60 * 1000; // 5 minutes

  return (
    <div className="glass-card p-4 md:p-6 animate-fade-in-up animation-delay-100">
      <div className="flex flex-wrap gap-3">
        {/* Roles */}
        {user?.roles?.map((role) => (
          <Badge key={role} variant="secondary">
            {roleLabels[role] || role}
          </Badge>
        ))}

        {/* City */}
        {profile.city && (
          <Badge variant="outline" className="gap-1.5">
            <FaLocationDot className="h-3 w-3" />
            {profile.city}
          </Badge>
        )}

        {/* Response time (mock) */}
        <Badge variant="outline" className="gap-1.5">
          <FaClock className="h-3 w-3" />
          Răspunde în ~2h
        </Badge>

        {/* Online status */}
        <Badge variant="outline" className="gap-1.5">
          <FaCircle
            className={`h-2 w-2 ${isOnline ? "text-green-500" : "text-muted-foreground"}`}
          />
          {isOnline ? "Online acum" : "Activ recent"}
        </Badge>
      </div>
    </div>
  );
}
