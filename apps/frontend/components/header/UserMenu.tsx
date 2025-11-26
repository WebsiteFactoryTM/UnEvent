"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FaUser,
  FaUserShield,
  FaLock,
  FaLocationDot,
  FaBriefcase,
  FaCalendarDays,
  FaEnvelope,
  FaHeart,
  FaRightFromBracket,
} from "react-icons/fa6";

import { signOut, useSession } from "next-auth/react";

import { Loader2 } from "lucide-react";

export function UserMenu() {
  const { data: session, status } = useSession({ required: false });
  const user = session?.user;

  const handleLogout = () => {
    signOut({
      callbackUrl: "/auth/autentificare",
    });
  };

  if (status === "unauthenticated") {
    return (
      <Button
        asChild
        variant="outline"
        size="sm"
        className="border-white/20 text-white hover:bg-white/10 hover:text-white bg-transparent"
      >
        <Link href="/auth/autentificare">Autentificare</Link>
      </Button>
    );
  }

  if (status === "loading") {
    return (
      <Button
        variant="outline"
        size="sm"
        className="border-white/20 text-white hover:bg-white/10 hover:text-white bg-transparent"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "";

  const hasHostRole = user?.roles?.includes("host");
  const hasProviderRole = user?.roles?.includes("provider");
  const hasOrganizerRole = user?.roles?.includes("organizer");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
          aria-label="Deschide meniul utilizatorului"
        >
          <Avatar className="h-9 w-9 border border-white/20">
            <AvatarImage
              src={user?.avatar || undefined}
              alt={user?.name || user?.email || ""}
            />
            <AvatarFallback className="bg-white/10 text-white text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-black border-white/20 text-white"
      >
        <DropdownMenuItem asChild>
          <Link
            href="/cont/profil"
            className="flex items-center gap-2 cursor-pointer"
          >
            <FaUser className="h-4 w-4" />
            Profil & Verificare
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href="/cont/roluri"
            className="flex items-center gap-2 cursor-pointer"
          >
            <FaUserShield className="h-4 w-4" />
            Roluri & Permisiuni
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href="/cont/securitate"
            className="flex items-center gap-2 cursor-pointer"
          >
            <FaLock className="h-4 w-4" />
            Securitate
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-white/10" />

        <DropdownMenuItem asChild>
          <Link
            href="/cont/locatiile-mele"
            className="flex items-center gap-2 cursor-pointer"
          >
            <FaLocationDot className="h-4 w-4" />
            Locațiile Mele
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href="/cont/serviciile-mele"
            className="flex items-center gap-2 cursor-pointer"
          >
            <FaBriefcase className="h-4 w-4" />
            Serviciile Mele
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href="/cont/evenimentele-mele"
            className="flex items-center gap-2 cursor-pointer"
          >
            <FaCalendarDays className="h-4 w-4" />
            Evenimentele Mele
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-white/10" />

        <DropdownMenuItem asChild>
          <Link
            href="/cont/mesaje"
            className="flex items-center gap-2 cursor-pointer"
          >
            <FaEnvelope className="h-4 w-4" />
            Mesaje
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href="/cont/favorite"
            className="flex items-center gap-2 cursor-pointer"
          >
            <FaHeart className="h-4 w-4" />
            Favorite
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-white/10" />

        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center gap-2 cursor-pointer text-red-400"
        >
          <FaRightFromBracket className="h-4 w-4" />
          Deconectare
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
