"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaAngleRight,
  FaUser,
  FaUserShield,
  FaLock,
  FaLocationDot,
  FaBriefcase,
  FaCalendarDays,
  FaEnvelope,
  FaHeart,
} from "react-icons/fa6";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";

const menuItems = [
  { href: "/cont/profil", label: "Profil & Verificare", icon: FaUser },
  { href: "/cont/roluri", label: "Roluri & Permisiuni", icon: FaUserShield },
  { href: "/cont/securitate", label: "Securitate", icon: FaLock },
  {
    href: "/cont/locatiile-mele",
    label: "Locațiile Mele",
    icon: FaLocationDot,
  },
  {
    href: "/cont/serviciile-mele",
    label: "Serviciile Mele",
    icon: FaBriefcase,
  },
  {
    href: "/cont/evenimentele-mele",
    label: "Evenimentele Mele",
    icon: FaCalendarDays,
  },
  { href: "/cont/mesaje", label: "Mesaje", icon: FaEnvelope },
  { href: "/cont/favorite", label: "Favorite", icon: FaHeart },
];

export function Topbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const currentPage = menuItems.find((item) => item.href === pathname);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-xl lg:hidden">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Mobile Menu Button */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <button className="flex items-center gap-2 px-3 py-2 text-foreground bg-muted hover:bg-accent rounded-lg transition-colors border border-border">
              <FaAngleRight className="w-4 h-4" />
              <span className="text-sm font-medium">Meniu</span>
            </button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-80 p-0 bg-sidebar/95 backdrop-blur-xl border-sidebar-border"
          >
            <SheetTitle className="sr-only">Meniu</SheetTitle>
            <div className="flex flex-col h-full">
              {/* Logo */}
              <div className="flex items-center justify-center p-6 border-b border-sidebar-border">
                <Image
                  src="/logo-unevent-white.png"
                  alt="UN:EVENT"
                  width={140}
                  height={40}
                  className="h-8 w-auto dark:invert-0 invert"
                />
              </div>

              {/* Menu Items */}
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-lg"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </SheetContent>
        </Sheet>

        {/* Page Title */}
        <h1 className="text-lg font-semibold text-foreground">
          {currentPage?.label || "Contul Meu"}
        </h1>

        {/* Spacer for layout balance */}
        <div className="w-8" />
      </div>
    </header>
  );
}
