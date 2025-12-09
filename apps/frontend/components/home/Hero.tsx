"use client";

import { AnimatedBubbles } from "@/components/ui/animated-bubbles";
import { FilterTabs } from "@/components/home/FilterTabs";

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-background py-24 md:py-0">
      <AnimatedBubbles />

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-16 flex flex-col items-center justify-center flex-1 max-w-6xl">
        <div className="text-center space-y-4 md:space-y-6 mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground animate-fade-in-up leading-tight">
            Locații, evenimente și servicii în România
          </h1>

          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto animate-fade-in-up [animation-delay:100ms]">
            Caută ce faci azi sau în weekend, rezervă spații pentru petreceri,
            nunți, workshop-uri și contactează rapid prestatori verificați (DJ,
            trupe, foto-video, catering, organizatori). Descoperă, compară și
            rezervă în câteva clicuri, în toată România.
          </p>
        </div>

        <div className="w-full max-w-5xl animate-fade-in-up [animation-delay:200ms]">
          <div className="backdrop-blur-xl bg-card/50 border border-border rounded-2xl p-4 md:p-6 lg:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-300 ">
            <FilterTabs />
          </div>
        </div>
      </div>
    </section>
  );
}
