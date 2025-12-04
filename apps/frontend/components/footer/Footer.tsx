"use client";

import Link from "next/link";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { FooterColumn } from "./FooterColumn";
import { SocialLinks } from "./SocialLinks";
import { contactLinks, utileLinks, termeniLinks } from "@/config/footer";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Main footer grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Logo + Social */}
          <div className="space-y-4">
            <div className="space-y-2">
              <img
                src="/logo-unevent-favicon-black-on-white.png"
                alt="UN:EVENT"
                className="h-16 w-16"
              />
              <p className="text-sm text-white/70">
                Orice poveste începe cu un loc
              </p>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
                Urmărește-ne
              </h3>
              <SocialLinks />
            </div>
          </div>

          {/* Column 2: Contact */}
          <FooterColumn title="Contact">
            <ul className="space-y-2">
              {contactLinks.map((link) => {
                const Icon = link.icon;
                if (!link.href)
                  return (
                    <li key={link.label}>
                      <div className="inline-flex items-center gap-2 text-white/80 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black cursor-pointer">
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{link.label}</span>
                      </div>
                    </li>
                  );
                return (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="inline-flex items-center gap-2 text-white/80 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black"
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </FooterColumn>

          {/* Column 3: Utile */}
          <FooterColumn title="Utile">
            <ul className="space-y-2">
              {utileLinks.map((link) => {
                const Icon = link.icon;
                if (!link.href)
                  return (
                    <li key={link.label}>
                      <div className="inline-flex items-center gap-2 text-white/80 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black cursor-pointer">
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{link.label}</span>
                      </div>
                    </li>
                  );
                return (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="inline-flex items-center gap-2 text-white/80 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black"
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </FooterColumn>

          {/* Column 4: Termeni & Politici */}
          <FooterColumn title="Termeni & Politici">
            <ul className="space-y-2">
              {termeniLinks.map((link) => {
                const Icon = link.icon;
                if (!link.href)
                  return (
                    <li key={link.label}>
                      <div className="inline-flex items-center gap-2 text-white/80 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black cursor-pointer">
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{link.label}</span>
                      </div>
                    </li>
                  );
                return (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="inline-flex items-center gap-2 text-white/80 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black"
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* ANPC Banners */}
            <div className="mt-4 flex wrap gap-2">
              <Link
                href="https://ec.europa.eu/consumers/odr/main/index.cfm?event=main.home2.show&lng=RO"
                target="_blank"
                className="inline-block focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black"
              >
                <Image
                  src="/assets/anpc-sol.png"
                  alt="ANPC - Soluționarea online a litigiilor"
                  width={120}
                  height={48}
                  className="rounded h-auto"
                />
              </Link>
              <Link
                href="https://anpc.ro/ce-este-sal/"
                target="_blank"
                className="inline-block focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black"
              >
                <Image
                  src="/assets/anpc-sal.png"
                  alt="ANPC - Soluționarea alternativă a litigiilor"
                  width={120}
                  height={48}
                  className="rounded h-auto"
                />
              </Link>
            </div>
          </FooterColumn>
        </div>

        {/* Bottom stripe */}
        <Separator className="my-8 bg-white/10" />
        <div className="text-center text-sm text-white/70">
          <p>
            © {currentYear} UN:EVENT. Toate drepturile rezervate 🗲 Powered by{" "}
            <a
              href="https://websitefactory.ro"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-secondary dark:hover:text-primary"
            >
              Website Factory
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
