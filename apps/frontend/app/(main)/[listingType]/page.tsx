import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  listingTypes,
  getListingTypeLabel,
  getTypesByListingType,
} from "@/config/archives";
import { AddListingButton } from "@/components/archives/AddListingButton";
import { ScrollToTop } from "@/components/ScrollToTop";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import {
  fetchHubFeaturedListings,
  fetchHubPopularCities,
  fetchHubTopByCity,
  fetchHubTypeaheadCities,
} from "@/lib/api/hub";
import { City } from "@/types/payload-types";
import { CityTypeahead } from "@/components/hub/CityTypeahead";
import { OccasionChips } from "@/components/hub/OccasionChips";
import { CityRow } from "@/components/hub/CityRow";
import FeaturedGrid from "@/components/hub/FeaturedGrid";
import PopularSearches from "@/components/hub/PopularSearches";
import { normalizeListing, type ListingCardData } from "@/lib/normalizers/hub";
export const revalidate = 3600; // ISR: revalidate every hour

export async function generateStaticParams() {
  return listingTypes.map((listingType) => ({
    listingType,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ listingType: string }>;
}): Promise<Metadata> {
  const { listingType } = await params;
  const titles: Record<string, string> = {
    locatii: "Locații pentru evenimente în România | UN:EVENT",
    servicii: "Servicii pentru evenimente în România | UN:EVENT",
    evenimente: "Evenimente în România | UN:EVENT",
  };
  const descriptions: Record<string, string> = {
    locatii: "Descoperă locații verificate pentru evenimente în toată România.",
    servicii: "Găsește servicii pentru evenimente — verificate și recenzate.",
    evenimente: "Evenimente în toată România — descoperă ce urmează.",
  };

  const title = titles[listingType] || "UN:EVENT";
  const description = descriptions[listingType] || "";
  return {
    title,
    description,
    alternates: { canonical: `/${listingType}` },
  };
}

export default async function ListingTypePage({
  params,
}: {
  params: Promise<{ listingType: string }>;
}) {
  const { listingType } = await params;
  if (!listingTypes.includes(listingType as any)) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  const accessToken = (session as any)?.accessToken as string | undefined;

  const [popularCities, typeaheadCities, featured] = await Promise.all([
    fetchHubPopularCities(6),
    fetchHubTypeaheadCities(50),
    fetchHubFeaturedListings(listingType as any, 12, accessToken),
  ]);

  // Load top listings per city in parallel
  const cityRows = await Promise.all(
    popularCities.map(async (c: City) => {
      const items = await fetchHubTopByCity(
        listingType as any,
        c.id,
        9,
        accessToken,
      );
      const normalized: ListingCardData[] = items.map((it) =>
        normalizeListing(listingType as any, it),
      );
      return {
        citySlug: c.slug!,
        cityLabel: c.name,
        items: normalized,
      };
    }),
  );

  const featuredNormalized: ListingCardData[] = featured.map((it) =>
    normalizeListing(listingType as any, it),
  );

  const options = getTypesByListingType(listingType).map((t) => ({
    slug: t.slug,
    label: t.label,
  }));

  // Popular searches: build a small set of deep links from city/type combos
  const popularSearchChips = cityRows.slice(0, 4).flatMap((row) =>
    options.slice(0, 3).map((opt) => ({
      citySlug: row.citySlug,
      cityLabel: row.cityLabel,
      typeSlug: opt.slug,
      typeLabel: opt.label,
    })),
  );

  const h1Titles: Record<string, string> = {
    locatii: "Locații pentru evenimente în România",
    servicii: "Servicii pentru evenimente în România",
    evenimente: "Evenimente în România",
  };
  const h1 = h1Titles[listingType];

  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-4 flex-1">
                <h1 className="text-4xl md:text-5xl font-bold text-balance">
                  {h1}
                </h1>
                <p className="text-lg text-muted-foreground text-pretty">
                  Orientare rapidă: caută un oraș, explorează tipuri relevante
                  și descoperă recomandările noastre.
                </p>
              </div>
              <AddListingButton listingType={listingType as any} />
            </div>

            {/* City typeahead */}
            <section className="space-y-4">
              <h2 className="sr-only">Caută după oraș</h2>
              <CityTypeahead
                listingType={listingType as any}
                cities={typeaheadCities}
              />
            </section>

            {/* Occasion/type chips */}
            <section className="space-y-4">
              <h2 className="sr-only">Tipuri populare</h2>
              <OccasionChips
                listingType={listingType as any}
                options={options}
                cities={typeaheadCities}
              />
            </section>

            {/* Popular city rows */}
            {cityRows.map((row) => {
              if (row.items.length < 2) return null;
              return (
                <CityRow
                  key={row.citySlug}
                  listingType={listingType as any}
                  citySlug={row.citySlug}
                  cityLabel={row.cityLabel}
                  items={row.items}
                />
              );
            })}

            {/* Featured national */}
            <FeaturedGrid
              listingType={listingType as any}
              items={featuredNormalized}
            />

            {/* Popular searches chips */}
            <PopularSearches
              listingType={listingType as any}
              items={popularSearchChips}
            />
          </div>
        </div>
      </div>
    </>
  );
}
