"use client";

import { Button } from "@/components/ui/button";
import { ClaimFormDialog } from "./ClaimFormDialog";
import type { ListingType } from "@/types/listings";

interface ClaimListingCTAProps {
  listingId: number;
  listingType: ListingType;
  listingSlug?: string;
}

export function ClaimListingCTA({
  listingId,
  listingType,
  listingSlug,
}: ClaimListingCTAProps) {
  // Get dynamic text based on listing type
  const getCTAText = () => {
    switch (listingType) {
      case "locatii":
        return "Ești proprietarul acestei locații?";
      case "servicii":
        return "Ești furnizorul acestui serviciu?";
      case "evenimente":
        return "Ești organizatorul acestui eveniment?";
      default:
        return "Ești proprietarul?";
    }
  };

  return (
    <ClaimFormDialog
      listingId={listingId}
      listingType={listingType}
      listingSlug={listingSlug}
      trigger={
        <Button variant="outline" className="w-full sm:w-auto">
          {getCTAText()}
        </Button>
      }
    />
  );
}
