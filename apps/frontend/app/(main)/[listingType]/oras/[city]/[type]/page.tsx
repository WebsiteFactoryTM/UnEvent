import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  listingTypes,
  cities,
  getCityLabel,
  getListingTypeLabel,
  getTypeLabel,
  getTypesByListingType,
} from "@/config/archives";
import { ArchiveFilter } from "@/components/archives/ArchiveFilter";
import { AddListingButton } from "@/components/archives/AddListingButton";

export const revalidate = 3600; // ISR: revalidate every hour

// export async function generateStaticParams() {
//   return listingTypes.flatMap((listingType) =>
//     cities.flatMap((c) =>
//       getTypesByListingType(listingType).map((t) => ({
//         listingType,
//         city: c.slug,
//         type: t.slug,
//       })),
//     ),
//   )
// }

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ listingType: string; city: string; type: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const { listingType, city, type } = await params;
  const searchFilters = await searchParams;
  const page = Number(searchFilters?.page ?? 1);

  const listingLabel = getListingTypeLabel(listingType);
  const cityLabel = getCityLabel(city);
  const typeLabel = getTypeLabel(listingType, type);

  const baseUrl = `https://unevent.ro/${listingType}/oras/${city}/${type}`;
  const title = `Top ${listingLabel} de ${typeLabel} ${cityLabel}${
    page > 1 ? ` – Pagina ${page}` : ""
  } | UN:EVENT`;
  const description = `Descoperă cele mai bune ${listingLabel.toLowerCase()} de ${typeLabel.toLowerCase()} din ${cityLabel}.`;

  // Smart Canonical Logic for City + Type pages
  const filterParams = ['priceMin', 'priceMax', 'capacityMin', 'facilities', 
                        'facilitiesMode', 'lat', 'lng', 'radius', 'ratingMin', 'limit'];
  
  const hasFilters = Object.keys(searchFilters || {}).some(
    key => filterParams.includes(key) && searchFilters[key]
  );

  const canonicalUrl = hasFilters 
    ? baseUrl 
    : page > 1 
      ? `${baseUrl}?page=${page}` 
      : baseUrl;

  const shouldIndex = !hasFilters;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: shouldIndex,
      follow: true,
      googleBot: {
        index: shouldIndex,
        follow: true,
      },
    },
    openGraph: {
      title,
      description,
      url: baseUrl,
      siteName: "UN:EVENT",
      type: "website",
      locale: "ro_RO",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CityTypeArchivePage({
  params,
}: {
  params: Promise<{ listingType: string; city: string; type: string }>;
}) {
  const { listingType, city, type } = await params;
  if (!listingTypes.includes(listingType as any)) {
    notFound();
  }

  const listingLabel = getListingTypeLabel(listingType);
  const cityLabel = getCityLabel(city);
  const typeLabel = getTypeLabel(listingType, type);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Breadcrumbs */}
          <nav className="text-sm text-muted-foreground">
            <ol className="flex items-center gap-2">
              <li>
                <a href="/" className="hover:text-foreground">
                  Acasă
                </a>
              </li>
              <li>/</li>
              <li>
                <a
                  href={`/${listingType}`}
                  className="hover:text-foreground"
                >
                  {listingLabel}
                </a>
              </li>
              <li>/</li>
              <li>
                <a
                  href={`/${listingType}/oras/${city}`}
                  className="hover:text-foreground"
                >
                  {cityLabel}
                </a>
              </li>
              <li>/</li>
              <li className="text-foreground font-medium">{typeLabel}</li>
            </ol>
          </nav>

          {/* Header with add button */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-4 flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-balance">
                Top {listingLabel} de {typeLabel} {cityLabel}
              </h1>
              <p className="text-lg text-muted-foreground text-pretty">
                Arhivă tip în oraș (UI placeholder). Conectăm ulterior filtre și
                listări.
              </p>
            </div>
            <AddListingButton listingType={listingType as any} />
          </div>

          <ArchiveFilter listingType={listingType as any} />
        </div>
      </div>
    </div>
  );
}
