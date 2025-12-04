"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaUser,
  FaUserShield,
  FaLock,
  FaLocationDot,
  FaBriefcase,
  FaCalendarDays,
  FaEnvelope,
  FaHeart,
} from "react-icons/fa6";

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

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:fixed lg:left-0 lg:top-16 lg:h-[calc(100vh-4rem)] lg:w-64 lg:border-r lg:border-sidebar-border lg:bg-sidebar/80 lg:backdrop-blur-xl lg:z-10">
      <nav className="flex-1 p-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          // console.log(pathname.includes(item.href));

          const isActive = pathname.includes(item.href);

          if (item.label === "Mesaje") {
            return (
              <div
                key={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label} (în curând)</span>
              </div>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
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
    </aside>
  );
}
