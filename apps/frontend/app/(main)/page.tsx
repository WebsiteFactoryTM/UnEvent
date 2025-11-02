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

export const metadata: Metadata = {
  title: "Locații de nuntă, săli evenimente, DJ & catering | UN:EVENT",
  description:
    "Platformă pentru locații de nuntă, săli de evenimente, DJ, formații, catering și foto-video. Prețuri și contact direct în România. Listează gratuit.",
  keywords:
    "locații de nuntă,săli evenimente,DJ evenimente,trupă nuntă,catering evenimente,formații muzică,foto-video evenimente,închiriere spații,organizare evenimente,locații petreceri,săli conferințe,evenimente România",
};

export const revalidate = 3600; // ISR: revalidate every hour

export default async function HomePage() {
  let homeListings = null;
  try {
    homeListings = await fetchHomeListings();
    // console.log(homeListings);
  } catch (error) {
    console.error("Error fetching home listings:", error);
  }

  return (
    <main className="min-h-screen">
      <Hero />

      <CTAInline />

      <Suspense fallback={<CarouselSkeleton count={3} showAvatar={false} />}>
        <RecommendedLocations
          featuredLocations={homeListings?.featuredLocations}
        />
      </Suspense>

      <Suspense fallback={<CarouselSkeleton count={3} showAvatar={true} />}>
        <RecommendedServices topServices={homeListings?.topServices} />
      </Suspense>

      <Suspense fallback={<CarouselSkeleton count={3} showAvatar={false} />}>
        <PopularEvents upcomingEvents={homeListings?.upcomingEvents} />
      </Suspense>

      <Suspense fallback={<CarouselSkeleton count={3} showAvatar={false} />}>
        <NewListings newListings={homeListings?.newListings} />
      </Suspense>

      <CTAEarn />

      <AboutSlider />
    </main>
  );
}
