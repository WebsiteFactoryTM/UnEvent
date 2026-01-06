import type React from "react";
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Providers } from "@/app/providers";
import { Header } from "@/components/header/Header";
import { Footer } from "@/components/footer/Footer";
import { FloatingContactButton } from "@/components/common/FloatingContactButton";
import { CookieBanner } from "@/components/common/CookieBanner";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { RecaptchaScript } from "@/components/RecaptchaScript";
import { XMasPromoBannerTop } from "@/components/home/XMasPromoBanner";

const manrope = Manrope({
  subsets: ["latin", "latin-ext"], // Include Romanian characters
  display: "swap", // Prevents invisible text during font load (FOIT)
  weight: ["400", "500", "600", "700"], // Only load weights used in the project
  variable: "--font-sans",
  preload: true,
});

import { constructMetadata } from "@/lib/metadata";

// ... imports remain the same

export const metadata = constructMetadata();


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "https://unevent.ro";

  // Organization Schema - Global
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "UN:EVENT",
    alternateName: "UnEvent",
    legalName: "SC PIXEL FACTORY SRL",
    url: baseUrl,
    logo: `${baseUrl}/logo-unevent-favicon-white-on-black.png`,
    description:
      "Platformă pentru locații evenimente, servicii evenimente și evenimente în România. Conectăm organizatori cu spații și furnizori verificați.",
    address: {
      "@type": "PostalAddress",
      addressCountry: "RO",
      addressLocality: "România",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      email: "contact@unevent.ro",
      availableLanguage: ["Romanian"],
    },
    sameAs: [
      "https://www.facebook.com/unevent",
      "https://www.instagram.com/unevent",
      "https://www.linkedin.com/company/unevent",
    ],
  };

  // WebSite Schema with SearchAction - Global
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "UN:EVENT",
    alternateName: "UnEvent",
    url: baseUrl,
    description: "Platforma ta pentru evenimente memorabile în România",
    inLanguage: "ro",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/locatii/oras/{city}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="ro" suppressHydrationWarning>
      <body className={`${manrope.variable} font-sans antialiased`}>
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        {/* WebSite Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
        <Providers>
          <Header />
          <RecaptchaScript />
          <main className="pt-16">{children}</main>
          <Footer />
          <FloatingContactButton />
          <CookieBanner />
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
