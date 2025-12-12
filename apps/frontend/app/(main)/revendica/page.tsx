import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { fetchListingById } from "@/lib/api/listings";
import {
  getListingTypeSlug,
  getFrontendListingTypeSlug,
} from "@/lib/getListingType";
import { ClaimForm } from "@/components/listing/shared/ClaimForm";
import { UnclaimedBadge } from "@/components/listing/shared/UnclaimedBadge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaLocationDot, FaStar } from "react-icons/fa6";
import type { ListingType } from "@/types/listings";

export const metadata: Metadata = {
  title: "Revendică listarea | UN:EVENT",
  description: "Revendică listarea ta pe UN:EVENT",
};

export const dynamic = "force-dynamic";

interface ClaimPageProps {
  searchParams: Promise<{
    listingId?: string;
    listingType?: string;
    email?: string;
  }>;
}

export default async function ClaimPage({ searchParams }: ClaimPageProps) {
  const params = await searchParams;
  const listingId = params.listingId ? parseInt(params.listingId, 10) : null;
  // Accept frontend listing type slugs (locatii, evenimente, servicii)
  const frontendListingType = params.listingType as ListingType | undefined;

  // Validate required params
  if (
    !listingId ||
    !frontendListingType ||
    isNaN(listingId) ||
    !["locatii", "evenimente", "servicii"].includes(frontendListingType)
  ) {
    notFound();
  }

  // Convert frontend slug to backend collection slug for API call
  const backendListingType = getListingTypeSlug(frontendListingType);

  // Fetch listing
  const { data: listing, error } = await fetchListingById(
    backendListingType,
    listingId,
  );

  if (!listing || error) {
    notFound();
  }

  // Only allow claiming unclaimed listings
  if (listing.claimStatus !== "unclaimed") {
    redirect(`/${frontendListingType}/${listing.slug}`);
  }

  const city =
    typeof listing.city === "object" ? listing.city?.name : "România";
  const imageUrl =
    typeof listing.featuredImage === "object" && listing.featuredImage?.url
      ? listing.featuredImage.url
      : "/placeholder.svg";
  const imageAlt =
    typeof listing.featuredImage === "object" && listing.featuredImage?.alt
      ? listing.featuredImage.alt
      : listing.title;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Revendică listarea</h1>
          <p className="text-muted-foreground">
            Completează formularul de mai jos pentru a revendica această
            listare. Dacă nu ai cont, vei fi redirecționat către crearea unuia
            după trimitere. Vei primi un email când cererea ta va fi aprobată.
          </p>
        </div>

        {/* Listing Preview Card */}
        <Card className="glass-card overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Image */}
            <div className="relative h-48 md:h-full min-h-[200px]">
              <Image
                src={imageUrl}
                alt={imageAlt}
                fill
                className="object-cover"
              />
              {listing.claimStatus === "unclaimed" && (
                <div className="absolute top-2 left-2">
                  <UnclaimedBadge />
                </div>
              )}
            </div>

            {/* Content */}
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-2xl font-bold line-clamp-2">
                    {listing.title}
                  </h2>
                  <div className="flex gap-2 shrink-0">
                    {listing.verifiedStatus === "approved" && (
                      <Badge className="bg-green-500/90 backdrop-blur-sm">
                        Verificat
                      </Badge>
                    )}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-3">
                  {listing.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <FaLocationDot className="h-4 w-4" />
                    <span>{city}</span>
                  </div>

                  {listing.rating && listing.reviewCount ? (
                    <div className="flex items-center gap-1">
                      <FaStar className="h-4 w-4 text-yellow-500" />
                      <span className="font-semibold">{listing.rating}</span>
                      <span>· {listing.reviewCount} recenzii</span>
                    </div>
                  ) : null}
                </div>
              </div>

              <Link href={`/${frontendListingType}/${listing.slug}`}>
                <Button variant="outline" className="w-full">
                  Vezi detalii complete
                </Button>
              </Link>
            </CardContent>
          </div>
        </Card>

        {/* Claim Form */}
        <Card className="glass-card">
          <CardContent className="p-6">
            <ClaimForm
              listingId={listing.id}
              listingType={frontendListingType}
              initialEmail={params.email}
              isPageForm={true}
              listingSlug={listing.slug ?? undefined}
              listingTypeSlug={frontendListingType}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
