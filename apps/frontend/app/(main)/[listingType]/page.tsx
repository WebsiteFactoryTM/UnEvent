import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listingTypes, getListingTypeLabel } from "@/config/archives";
import { AddListingButton } from "@/components/archives/AddListingButton";
import { ScrollToTop } from "@/components/ScrollToTop";

import { fetchHubSnapshot } from "@/lib/api/hub";
import type { HubSnapshotResponse } from "@/lib/normalizers/hub";

import { OccasionChips } from "@/components/hub/OccasionChips";
import { CityRow } from "@/components/hub/CityRow";
import FeaturedGrid from "@/components/hub/FeaturedGrid";
import PopularSearches from "@/components/hub/PopularSearches";
import { cardItemToListingCardData } from "@/lib/normalizers/hub";
import { ListingType } from "@/types/listings";
import { ListingBreadcrumbs } from "@/components/listing/shared/ListingBreadcrumbs";
import { ArchiveFilter } from "@/components/archives/ArchiveFilter";
import { CityTypeahead } from "@/components/hub/CityTypeahead";
import { CityChips } from "@/components/hub/CityChips";
import ArchiveTitle from "@/components/archives/ArchiveTitle";

export const revalidate = 3600; // ISR: revalidate every hour

const titles: Record<string, string> = {
  locatii: "Locații Evenimente România - Săli & Spații de Închiriat | UN:EVENT",
  servicii:
    "Servicii Evenimente România - Furnizori & Profesioniști | UN:EVENT",
  evenimente:
    "Calendar Evenimente România: Concerte, Festivaluri, Party | UN:EVENT",
};
const descriptions: Record<string, string> = {
  locatii:
    "Platforma completă pentru locații de evenimente din România. Găsește mii de săli de nuntă, spații corporate și locații inedite. Compară și rezervă pe UN:EVENT.",
  servicii:
    "Conectează-te cu cei mai buni furnizori din România. De la fotografi și videografi, la DJ, formații și catering. Vezi portofolii și cere oferte pe UN:EVENT.",
  evenimente:
    "Descoperă ce se întâmplă în România! Ghidul tău complet de evenimente: festivaluri, concerte, teatru și petreceri. Cumpără bilete simplu prin UN:EVENT.",
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
  const canonicalUrl = `https://unevent.ro/${listingType}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "UN:EVENT",
      type: "website",
      locale: "ro_RO",
    },
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

  let snapshot: HubSnapshotResponse | null = null;
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
      cardItemToListingCardData(it!, listingType as ListingType),
    ),
  }));

  const featuredNormalized = (snapshot?.featured || []).map((it) =>
    cardItemToListingCardData(it!, listingType as ListingType),
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

  // if (featuredNormalized.length === 0 && cityRows.length === 0) {
  //   return (
  //     <div className="p-6 h-screen flex items-center justify-center text-muted-foreground">
  //       Încă nu avem date pentru această secțiune. Revino curând.
  //     </div>
  //   );
  // }

  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-7xl mx-auto space-y-12">
            <ListingBreadcrumbs type={listingType as ListingType} />
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <ArchiveTitle
                title={h1}
                subtitle={`Orientare rapidă: caută un oraș, explorează tipuri relevante și descoperă recomandările noastre.`}
              />
              <AddListingButton listingType={listingType as any} />
            </div>

            {/* City typeahead */}
            <section className="space-y-4">
              <h2 className="sr-only">Caută după oraș și tip</h2>

              <ArchiveFilter
                listingType={listingType as any}
                defaultIsOpen={true}
                showCategoriesOnly
              />
            </section>

            {/* Occasion/type chips */}
            <section className="space-y-4">
              <h2 className="sr-only">Orase populare</h2>
              <CityChips
                listingType={listingType as any}
                options={typeaheadCities}
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
