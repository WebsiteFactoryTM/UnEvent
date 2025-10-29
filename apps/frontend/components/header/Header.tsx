"use client";

import Link from "next/link";
import { NavLink } from "./NavLink";
import { UserMenu } from "./UserMenu";
import { MobileMenu } from "./MobileMenu";
import { ThemeToggle } from "./ThemeToggle";
import { FaLocationDot, FaCakeCandles, FaCalendarDays } from "react-icons/fa6";
import { Session } from "next-auth";

export function Header({ session }: { session: Session | null }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_24px_-2px_rgba(0,0,0,0.12),0_8px_16px_-4px_rgba(0,0,0,0.08)]">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img
              src="/logo-unevent-white.png"
              alt="UN:EVENT"
              className="h-5 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 ml-8">
            <NavLink href="/locatii" icon={FaLocationDot}>
              Locații
            </NavLink>
            <NavLink href="/servicii" icon={FaCakeCandles}>
              Servicii
            </NavLink>
            <NavLink href="/evenimente" icon={FaCalendarDays}>
              Evenimente
            </NavLink>
          </nav>

          {/* Right Group */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="hidden md:block">
              <UserMenu initialSession={session} />
            </div>
            <div className="md:hidden">
              <MobileMenu />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
