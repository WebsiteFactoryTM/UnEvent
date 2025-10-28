"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  FaLocationDot,
  FaBriefcase,
  FaCalendarDays,
  FaUser,
  FaUserShield,
  FaLock,
  FaEnvelope,
  FaHeart,
  FaRightFromBracket,
} from "react-icons/fa6"
import { useCurrentUser } from "@/lib/auth/useCurrentUser"
import { HamburgerIcon } from "./HamburgerIcon"

export function MobileMenu() {
  const [open, setOpen] = useState(false)
  const { data: user } = useCurrentUser()
  const router = useRouter()

  const handleLogout = () => {
    console.log("[v0] Logout clicked")
    setOpen(false)
    router.push("/")
  }

  const handleNavigation = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  const initials = user?.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email[0].toUpperCase()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10 hover:text-white"
          aria-label="Deschide meniul"
        >
          <HamburgerIcon isOpen={open} />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[320px] border-border/50 p-0 overflow-y-auto">
        <div className="flex flex-col min-h-full p-6">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex justify-center mb-6 hover:opacity-80 transition-opacity animate-fade-in-up"
          >
            <img src="/logo-unevent-white.png" alt="UN:EVENT" className="h-5 w-auto" />
          </Link>

          {!user && (
            <div className="mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              <Button
                onClick={() => handleNavigation("/auth/autentificare")}
                className="w-full bg-white/10 hover:bg-white/20 text-foreground border border-border/50 backdrop-blur-sm shadow-glow-sm"
              >
                Autentificare
              </Button>
            </div>
          )}

          {user && (
            <div
              className="flex items-center gap-3 mb-6 p-3 rounded-lg bg-white/5 border border-border/30 backdrop-blur-sm animate-fade-in-up"
              style={{ animationDelay: "0.1s" }}
            >
              <Avatar className="h-12 w-12 border border-border/50 shadow-glow-sm">
                <AvatarImage src={user.avatarURL || undefined} alt={user.displayName || user.email} />
                <AvatarFallback className="bg-white/10 text-foreground">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-foreground">{user.displayName || user.email}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          )}

          <Separator className="bg-border/30 mb-4" />

          <nav className="flex flex-col gap-1 mb-4">
            <button
              onClick={() => handleNavigation("/locatii")}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-white/10 hover:shadow-glow-sm transition-all duration-300 text-left group animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              <FaLocationDot className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span>Locații</span>
            </button>
            <button
              onClick={() => handleNavigation("/servicii")}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-white/10 hover:shadow-glow-sm transition-all duration-300 text-left group animate-fade-in-up"
              style={{ animationDelay: "0.25s" }}
            >
              <FaBriefcase className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span>Servicii</span>
            </button>
            <button
              onClick={() => handleNavigation("/evenimente")}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-white/10 hover:shadow-glow-sm transition-all duration-300 text-left group animate-fade-in-up"
              style={{ animationDelay: "0.3s" }}
            >
              <FaCalendarDays className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span>Evenimente</span>
            </button>
          </nav>

          {user && (
            <>
              <Separator className="bg-border/30 mb-4" />
              <nav className="flex flex-col gap-1 flex-1">
                <button
                  onClick={() => handleNavigation("/cont/profil")}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-white/10 hover:shadow-glow-sm transition-all duration-300 text-left group animate-fade-in-up"
                  style={{ animationDelay: "0.35s" }}
                >
                  <FaUser className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <span>Profil & Verificare</span>
                </button>

                <button
                  onClick={() => handleNavigation("/cont/roluri")}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-white/10 hover:shadow-glow-sm transition-all duration-300 text-left group animate-fade-in-up"
                  style={{ animationDelay: "0.4s" }}
                >
                  <FaUserShield className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <span>Roluri & Permisiuni</span>
                </button>

                <button
                  onClick={() => handleNavigation("/cont/securitate")}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-white/10 hover:shadow-glow-sm transition-all duration-300 text-left group animate-fade-in-up"
                  style={{ animationDelay: "0.45s" }}
                >
                  <FaLock className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <span>Securitate</span>
                </button>

                <Separator className="bg-border/30 my-2" />

                <button
                  onClick={() => handleNavigation("/cont/locatiile-mele")}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-white/10 hover:shadow-glow-sm transition-all duration-300 text-left group animate-fade-in-up"
                  style={{ animationDelay: "0.5s" }}
                >
                  <FaLocationDot className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <span>Locațiile Mele</span>
                </button>

                <button
                  onClick={() => handleNavigation("/cont/serviciile-mele")}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-white/10 hover:shadow-glow-sm transition-all duration-300 text-left group animate-fade-in-up"
                  style={{ animationDelay: "0.55s" }}
                >
                  <FaBriefcase className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <span>Serviciile Mele</span>
                </button>

                <button
                  onClick={() => handleNavigation("/cont/evenimentele-mele")}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-white/10 hover:shadow-glow-sm transition-all duration-300 text-left group animate-fade-in-up"
                  style={{ animationDelay: "0.6s" }}
                >
                  <FaCalendarDays className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <span>Evenimentele Mele</span>
                </button>

                <Separator className="bg-border/30 my-2" />

                <button
                  onClick={() => handleNavigation("/cont/mesaje")}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-white/10 hover:shadow-glow-sm transition-all duration-300 text-left group animate-fade-in-up"
                  style={{ animationDelay: "0.65s" }}
                >
                  <FaEnvelope className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <span>Mesaje</span>
                </button>

                <button
                  onClick={() => handleNavigation("/cont/favorite")}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-white/10 hover:shadow-glow-sm transition-all duration-300 text-left group animate-fade-in-up"
                  style={{ animationDelay: "0.7s" }}
                >
                  <FaHeart className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <span>Favorite</span>
                </button>

                <Separator className="bg-border/30 my-4" />

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:shadow-glow-sm transition-all duration-300 text-left group animate-fade-in-up"
                  style={{ animationDelay: "0.75s" }}
                >
                  <FaRightFromBracket className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                  <span>Deconectare</span>
                </button>
              </nav>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
