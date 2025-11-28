import { Button } from "@/components/ui/button";
import React from "react";
import {
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaLinkedin,
  FaXTwitter,
  FaTiktok,
  FaTwitch,
} from "react-icons/fa6";

const SocialMediaIcons = {
  facebook: FaFacebook,
  instagram: FaInstagram,
  x: FaXTwitter,
  linkedin: FaLinkedin,
  youtube: FaYoutube,
  tiktok: FaTiktok,
  twitch: FaTwitch,
} as const;

const SocialMedia = ({
  socialLinks,
}: {
  socialLinks: Record<string, string | null>;
}) => {
  return (
    <div className="space-y-3 ">
      <h4 className="text-lg font-semibold">Social Media</h4>
      <div className="flex gap-2 flex-wrap">
        {Object.entries(socialLinks).map(([key, value]) => {
          const Icon = SocialMediaIcons[key as keyof typeof SocialMediaIcons];
          return (
            <Button
              variant="outline"
              size="icon"
              asChild
              key={`social-media-${key}`}
            >
              <a
                href={value ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={key}
              >
                <Icon className="h-4 w-4" />
              </a>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default SocialMedia;
