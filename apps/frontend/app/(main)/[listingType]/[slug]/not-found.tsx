import Link from "next/link";
import { FaHouse } from "react-icons/fa6";
import { AnimatedBubbles } from "@/components/ui/animated-bubbles";
import type { Metadata } from "next";
import { getListingTypeLabel } from "@/config/archives";

export const metadata: Metadata = {
  title: "404 - Pagină negăsită | UN:EVENT",
  description:
    "Această listare nu există. Reveniți la pagina principală pentru a explora locații, servicii și evenimente.",
};

export default async function NotFound() {
  // params: Promise<{ listingType: string }>;
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-20">
      {/* Animated Background */}
      <AnimatedBubbles />

      {/* Content */}
      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Glassmorphism Card */}
        <div className="backdrop-blur-xl bg-background/80 border border-border/50 rounded-[10px] p-8 md:p-12 shadow-[0_8px_32px_0_rgba(0,0,0,0.12),0_2px_8px_0_rgba(0,0,0,0.08),inset_0_1px_0_0_rgba(255,255,255,0.05)]">
          {/* 404 Number */}
          <div className="mb-6">
            <h1 className="text-8xl md:text-9xl font-bold text-foreground/20 select-none">
              404
            </h1>
          </div>

          {/* Message */}
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
            Această listare nu există
          </h2>

          <p className="text-foreground/70 mb-8 text-base md:text-lg">
            Ne pare rău, dar listarea pe care o căutați nu a fost găsită. Poate
            a fost mutată sau nu mai există.
          </p>

          {/* Button to Homepage */}
          <Link
            href={`/`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] focus:outline-none focus:ring-2 focus:ring-foreground/50 focus:ring-offset-2 focus:ring-offset-background"
          >
            <FaHouse className="w-5 h-5" />
            Mergi la pagina de căutări
          </Link>
        </div>
      </div>
    </div>
  );
}
