"use client";

import Link from "next/link";
import { socialLinks } from "@/config/footer";

export function SocialLinks() {
  return (
    <div className="flex flex-wrap gap-3">
      {socialLinks.map((social) => {
        const Icon = social.icon;
        if (!social.href)
          return (
            <div
              key={social.name}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black cursor-pointer"
            >
              <Icon className="h-5 w-5" />
            </div>
          );
        return (
          <Link
            key={social.name}
            href={social.href}
            aria-label={social.ariaLabel}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black"
          >
            <Icon className="h-5 w-5" />
          </Link>
        );
      })}
    </div>
  );
}
