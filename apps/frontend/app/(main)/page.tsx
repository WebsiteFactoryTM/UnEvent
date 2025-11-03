import type { Metadata } from "next";
import { Suspense } from "react";
import { Hero } from "@/components/home/Hero";
import { CTAInline } from "@/components/home/CTAInline";
import { RecommendedLocations } from "@/components/home/carousels/RecommendedLocations";
import { RecommendedServices } from "@/components/home/carousels/RecommendedServices";
import { PopularEvents } from "@/components/home/carousels/PopularEvents";
import { NewListings } from "@/components/home/carousels/NewListings";
import { CTAEarn } from "@/components/home/CTAEarn";
import { AboutSlider } from "@/components/home/AboutSlider";
import { CarouselSkeleton } from "@/components/home/carousels/CarouselSkeleton";
import { fetchHomeListings } from "@/lib/api/home";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/react-query";

export const metadata: Metadata = {
  title: "Locații de nuntă, săli evenimente, DJ & catering | UN:EVENT",
  description:
    "Platformă pentru locații de nuntă, săli de evenimente, DJ, formații, catering și foto-video. Prețuri și contact direct în România. Listează gratuit.",
  keywords:
    "locații de nuntă,săli evenimente,DJ evenimente,trupă nuntă,catering evenimente,formații muzică,foto-video evenimente,închiriere spații,organizare evenimente,locații petreceri,săli conferințe,evenimente România",
};

export const revalidate = 60; // ISR: revalidate every hour

export default async function HomePage() {
  const queryClient = getQueryClient();

  try {
    await queryClient.prefetchQuery({
      queryKey: ["listings", "home"],
      queryFn: fetchHomeListings,
    });
  } catch (error) {
    console.error("⚠️ Failed to prefetch home listings:", error);
    // Optionally, set an empty cache value so components can handle it gracefully
    queryClient.setQueryData(["listings", "home"], {
      recommended: [],
      topServices: [],
      upcomingEvents: [],
      newListings: [],
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="min-h-screen">
        <Hero />

        <CTAInline />

        <Suspense fallback={<CarouselSkeleton count={3} showAvatar={false} />}>
          <RecommendedLocations
          // featuredLocations={homeListings?.featuredLocations}
          />
        </Suspense>

        <Suspense fallback={<CarouselSkeleton count={3} showAvatar={true} />}>
          <RecommendedServices />
        </Suspense>

        <Suspense fallback={<CarouselSkeleton count={3} showAvatar={false} />}>
          <PopularEvents />
        </Suspense>

        <Suspense fallback={<CarouselSkeleton count={3} showAvatar={false} />}>
          <NewListings />
        </Suspense>

        <CTAEarn />

        <AboutSlider />
      </main>
    </HydrationBoundary>
  );
}
