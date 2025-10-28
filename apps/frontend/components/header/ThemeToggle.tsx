"use client"

import { FaMoon, FaSun, FaDesktop } from "react-icons/fa6"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="text-white hover:bg-white/10 hover:text-white"
        aria-label="Schimbă tema"
      >
        <FaSun className="h-5 w-5" />
      </Button>
    )
  }

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark")
    } else if (theme === "dark") {
      setTheme("system")
    } else {
      setTheme("light")
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      className="text-white hover:bg-white/10 hover:text-white"
      aria-label={`Tema curentă: ${theme === "light" ? "Luminos" : theme === "dark" ? "Întunecat" : "Sistem"}. Click pentru a schimba.`}
    >
      {theme === "light" && <FaSun className="h-5 w-5" />}
      {theme === "dark" && <FaMoon className="h-5 w-5" />}
      {theme === "system" && <FaDesktop className="h-5 w-5" />}
    </Button>
  )
}
