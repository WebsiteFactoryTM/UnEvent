import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listingTypes, getListingTypeLabel } from "@/config/archives";
import { AddListingButton } from "@/components/archives/AddListingButton";
import { ScrollToTop } from "@/components/ScrollToTop";

import { fetchHubSnapshot } from "@/lib/api/hub";
import { HubSnapshot } from "@/types/payload-types";

import { OccasionChips } from "@/components/hub/OccasionChips";
import { CityRow } from "@/components/hub/CityRow";
import FeaturedGrid from "@/components/hub/FeaturedGrid";
import PopularSearches from "@/components/hub/PopularSearches";
import { type ListingCardData } from "@/lib/normalizers/hub";
import { ListingType } from "@/types/listings";
import { ListingBreadcrumbs } from "@/components/listing/shared/ListingBreadcrumbs";
import { ArchiveFilter } from "@/components/archives/ArchiveFilter";
export const revalidate = 3600; // ISR: revalidate every hour

const toCard = (
  it: NonNullable<HubSnapshot["featured"]>[number],
  listingType: ListingType,
): ListingCardData => ({
  id: it.listingId,
  title: it.title,
  slug: it.slug,
  description: it.description || "",
  image: { url: it.imageUrl || "/placeholder.svg", alt: it.title },
  city: it.cityLabel || "România",
  type: it.type || getListingTypeLabel(listingType),
  verified: Boolean(it.verified),
  rating:
    typeof it.ratingAvg === "number" && typeof it.ratingCount === "number"
      ? { average: it.ratingAvg, count: it.ratingCount }
      : undefined,
  views: 0,
  listingType: listingType as any,
  date: it.startDate || undefined,
});

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

  const title = titles[listingType] || "UN:EVENT";
  const description = descriptions[listingType] || "";
  return {
    title,
    description,
    alternates: { canonical: `/${listingType}` },
    metadataBase: new URL(process.env.NEXT_PUBLIC_FRONTEND_URL!),
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

  let snapshot: HubSnapshot | null = null;
  try {
    snapshot = await fetchHubSnapshot(listingType as ListingType);
  } catch (e) {
    // TODO: captureException(e) // Sentry if installed
    snapshot = null;
  }
  const typeaheadCities =
    snapshot?.typeaheadCities?.map((c) => ({
      slug: c.slug,
      label: c.label,
    })) || [];

  const cityRows = (snapshot?.popularCityRows || []).map((row) => ({
    citySlug: row.citySlug,
    cityLabel: row.cityLabel,
    items: (row.items || []).map((it) =>
      toCard(it!, listingType as ListingType),
    ),
  }));

  const featuredNormalized: ListingCardData[] = (snapshot?.featured || []).map(
    (it) => toCard(it!, listingType as ListingType),
  );

  const options =
    (snapshot?.topTypes ?? []).map((t) => ({
      slug: t.slug,
      label: t.label,
    })) ?? [];

  // Popular searches: build a small set of deep links from city/type combos
  const popularSearchChips =
    (snapshot?.popularSearchCombos ?? []).map((it) => ({
      citySlug: it.citySlug,
      cityLabel: it.cityLabel,
      typeSlug: it.typeSlug,
      typeLabel: it.typeLabel,
    })) ?? [];

  const h1Titles: Record<string, string> = {
    locatii: "Locații pentru evenimente în România",
    servicii: "Servicii pentru evenimente în România",
    evenimente: "Evenimente în România",
  };
  const h1 = h1Titles[listingType];

  if (featuredNormalized.length === 0 && cityRows.length === 0) {
    return (
      <div className="p-6 h-screen flex items-center justify-center text-muted-foreground">
        Încă nu avem date pentru această secțiune. Revino curând.
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-7xl mx-auto space-y-12">
            <ListingBreadcrumbs type={listingType as ListingType} />
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
              {/* <CityTypeahead
                listingType={listingType as any}
                cities={typeaheadCities}
              /> */}
              <ArchiveFilter
                listingType={listingType as any}
                defaultIsOpen={true}
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: featuredNormalized
              .slice(0, 12)
              .map((card, idx) => ({
                "@type": "ListItem",
                position: idx + 1,
                url: `/${listingType}/${card.slug}`,
                name: card.title,
              })),
          }),
        }}
      />
    </>
  );
}
