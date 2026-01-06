import { Metadata } from "next";

export function constructMetadata({
  title = "UN:EVENT - Locații, Servicii și Evenimente în România",
  description = "Descoperă locații pentru evenimente, servicii verificate și evenimente din România. Compară prețuri, vezi recenzii și contactează direct organizatorii.",
  image = "/logo-unevent-favicon-white-on-black.png",
  icons = [
    { url: "/logo-unevent-favicon-white-on-black.png", sizes: "any" },
    {
      url: "/logo-unevent-favicon-white-on-black.svg",
      type: "image/svg+xml",
    },
  ],
  noIndex = false,
  canonicalUrl,
}: {
  title?: string;
  description?: string;
  image?: string;
  icons?: Metadata["icons"];
  noIndex?: boolean;
  canonicalUrl?: string;
} = {}): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "https://unevent.ro";

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: title,
      template: "%s | UN:EVENT",
    },
    description,
    keywords: [
      "evenimente România",
      "locații evenimente",
      "servicii evenimente",
      "organizare evenimente",
      "săli evenimente",
      "locații nuntă",
      "DJ evenimente",
      "catering",
    ],
    authors: [{ name: "UN:EVENT" }],
    creator: "UN:EVENT",
    publisher: "SC PIXEL FACTORY SRL",
    robots: {
      index: !noIndex,
      follow: true,
      googleBot: {
        index: !noIndex,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: "ro_RO",
      url: canonicalUrl || "/",
      siteName: "UN:EVENT",
      title,
      description,
      images: [
        {
          url: image,
          width: 512,
          height: 512,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [image],
    },
    alternates: {
      canonical: canonicalUrl,
    },
    icons,
  };
}
