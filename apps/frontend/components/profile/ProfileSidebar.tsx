"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  FaPhone,
  FaEnvelope,
  FaGlobe,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaTiktok,
  FaXTwitter,
  FaShareNodes,
  FaFlag,
  FaMessage,
} from "react-icons/fa6";
import type { User, Profile } from "@/types/payload-types";

type ProfileWithUser = Profile & { user?: number | User };

interface ProfileSidebarProps {
  profile: ProfileWithUser;
}

export function ProfileSidebar({ profile }: ProfileSidebarProps) {
  const user =
    profile.user && typeof profile.user === "object" ? profile.user : undefined;
  const socials = profile.socialMedia;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: profile.displayName || profile.name,
          text: profile.bio || "",
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copiat în clipboard!");
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick Actions */}
      <Card className="glass-card animate-fade-in-up animation-delay-100">
        <CardHeader>
          <CardTitle className="text-lg">Acțiuni rapide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {profile.phone && (
            <Button
              asChild
              variant="outline"
              className="w-full justify-start gap-2 bg-transparent"
            >
              <a href={`tel:${profile.phone}`}>
                <FaPhone className="h-4 w-4" />
                Sună
              </a>
            </Button>
          )}
          <Button
            variant="outline"
            className="w-full justify-start gap-2 bg-transparent"
          >
            <FaMessage className="h-4 w-4" />
            Trimite mesaj
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full justify-start gap-2 bg-transparent"
          >
            <a href={user?.email ? `mailto:${user.email}` : "#"}>
              <FaEnvelope className="h-4 w-4" />
              Trimite email
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* External Links */}
      {(profile.website || socials) && (
        <Card className="glass-card animate-fade-in-up animation-delay-200">
          <CardHeader>
            <CardTitle className="text-lg">Link-uri externe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.website && (
              <Button
                asChild
                variant="outline"
                className="w-full justify-start gap-2 bg-transparent"
              >
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaGlobe className="h-4 w-4" />
                  Website
                </a>
              </Button>
            )}

            {socials && (
              <>
                <Separator />
                <div className="flex flex-wrap gap-2">
                  {socials.facebook && (
                    <Button size="icon" variant="outline" asChild>
                      <a
                        href={socials.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Facebook"
                      >
                        <FaFacebook className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {socials.instagram && (
                    <Button size="icon" variant="outline" asChild>
                      <a
                        href={socials.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram"
                      >
                        <FaInstagram className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {socials.linkedin && (
                    <Button size="icon" variant="outline" asChild>
                      <a
                        href={socials.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="LinkedIn"
                      >
                        <FaLinkedin className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {socials.youtube && (
                    <Button size="icon" variant="outline" asChild>
                      <a
                        href={socials.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="YouTube"
                      >
                        <FaYoutube className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {socials.tiktok && (
                    <Button size="icon" variant="outline" asChild>
                      <a
                        href={socials.tiktok}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="TikTok"
                      >
                        <FaTiktok className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {socials.x && (
                    <Button size="icon" variant="outline" asChild>
                      <a
                        href={socials.x}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="X (Twitter)"
                      >
                        <FaXTwitter className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Share & Report */}
      <Card className="glass-card animate-fade-in-up animation-delay-300">
        <CardContent className="pt-6 space-y-2">
          <Button
            onClick={handleShare}
            variant="outline"
            className="w-full justify-start gap-2 bg-transparent"
          >
            <FaShareNodes className="h-4 w-4" />
            Distribuie profil
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start gap-2 text-destructive hover:text-destructive bg-transparent"
          >
            <FaFlag className="h-4 w-4" />
            Raportează profil
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
