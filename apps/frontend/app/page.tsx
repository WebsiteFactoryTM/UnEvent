import type { Metadata } from "next"
import { Suspense } from "react"
import { Hero } from "@/components/home/Hero"
import { CTAInline } from "@/components/home/CTAInline"
import { RecommendedLocations } from "@/components/home/carousels/RecommendedLocations"
import { RecommendedServices } from "@/components/home/carousels/RecommendedServices"
import { PopularEvents } from "@/components/home/carousels/PopularEvents"
import { NewListings } from "@/components/home/carousels/NewListings"
import { CTAEarn } from "@/components/home/CTAEarn"
import { AboutSlider } from "@/components/home/AboutSlider"
import { CarouselSkeleton } from "@/components/home/carousels/CarouselSkeleton"

export const metadata: Metadata = {
  title: "Locații de nuntă, săli evenimente, DJ & catering | UN:EVENT",
  description:
    "Platformă pentru locații de nuntă, săli de evenimente, DJ, formații, catering și foto-video. Prețuri și contact direct în România. Listează gratuit.",
  keywords:
    "locații de nuntă,săli evenimente,DJ evenimente,trupă nuntă,catering evenimente,formații muzică,foto-video evenimente,închiriere spații,organizare evenimente,locații petreceri,săli conferințe,evenimente România",
}

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Hero />

      <CTAInline />

      <Suspense fallback={<CarouselSkeleton count={3} showAvatar={false} />}>
        <RecommendedLocations />
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
  )
}
