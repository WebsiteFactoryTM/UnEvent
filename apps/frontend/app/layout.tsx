import type React from "react"
import type { Metadata } from "next"
import { Manrope } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Providers } from "./providers"
import { Header } from "@/components/header/Header"
import { Footer } from "@/components/footer/Footer"
import "./globals.css"

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "UN:EVENT",
  description: "Platforma ta pentru evenimente memorabile în România",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ro" suppressHydrationWarning>
      <body className={`${manrope.variable} font-sans antialiased`}>
        <Providers>
          <Header />
          <main className="pt-16">{children}</main>
          <Footer />
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
